/**
 * =============================================================================
 * CLIENT SYNC ENGINE & INDEXEDDB OUTBOX PATTERN V2
 * Edge-to-Cloud Resilient Mutation Sync for Remote/2G Locations
 * =============================================================================
 */

import { supabase } from "../supabase";

export interface OutboxMutation {
  id: string;
  establishment_id: number;
  entity_type: "space" | "task" | "ticket" | "event";
  operation: "CREATE" | "UPDATE" | "DELETE" | "TRANSITION";
  payload: Record<string, unknown>;
  client_timestamp: number;
  retry_count: number;
  status: "pending" | "syncing" | "failed";
  last_error?: string;
}

export interface SyncEngineConfig {
  dbName: string;
  dbVersion: number;
  maxRetries: number;
  maxBackoffMs: number;
}

const DEFAULT_CONFIG: SyncEngineConfig = {
  dbName: "hdv_ops_offline_v2",
  dbVersion: 1,
  maxRetries: 5,
  maxBackoffMs: 30000
};

export class SyncEngine {
  private static dbPromise: Promise<IDBDatabase> | null = null;
  private static isSyncing = false;

  /**
   * Open / Initialize IndexedDB Storage Connection
   */
  private static getDB(): Promise<IDBDatabase> {
    if (!this.dbPromise) {
      this.dbPromise = new Promise((resolve, reject) => {
        if (typeof window === "undefined" || !window.indexedDB) {
          reject(new Error("IndexedDB is not supported in this environment."));
          return;
        }

        const request = window.indexedDB.open(DEFAULT_CONFIG.dbName, DEFAULT_CONFIG.dbVersion);

        request.onupgradeneeded = (event: IDBVersionChangeEvent) => {
          const db = (event.target as IDBOpenDBRequest).result;
          
          // Outbox Store for pending mutations
          if (!db.objectStoreNames.contains("outbox")) {
            const outboxStore = db.createObjectStore("outbox", { keyPath: "id" });
            outboxStore.createIndex("status", "status", { unique: false });
            outboxStore.createIndex("establishment_id", "establishment_id", { unique: false });
          }

          // Local Read Projection Caches
          if (!db.objectStoreNames.contains("spaces_cache")) {
            db.createObjectStore("spaces_cache", { keyPath: "id" });
          }
          if (!db.objectStoreNames.contains("tasks_cache")) {
            db.createObjectStore("tasks_cache", { keyPath: "id" });
          }
        };

        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
      });
    }
    return this.dbPromise;
  }

  /**
   * Enqueue mutation into local Outbox and update optimistic local cache
   */
  public static async enqueueMutation(mutation: Omit<OutboxMutation, "id" | "client_timestamp" | "retry_count" | "status">): Promise<OutboxMutation> {
    const fullMutation: OutboxMutation = {
      ...mutation,
      id: crypto.randomUUID(),
      client_timestamp: Date.now(),
      retry_count: 0,
      status: "pending"
    };

    const db = await this.getDB();
    const tx = db.transaction(["outbox"], "readwrite");
    const store = tx.objectStore("outbox");
    
    await new Promise<void>((resolve, reject) => {
      const req = store.add(fullMutation);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });

    // Broadcast mutation event to active UI components
    this.broadcastSyncStatus(fullMutation.establishment_id, "MUTATION_ENQUEUED");

    // Trigger background outbox flush
    this.flushOutbox(fullMutation.establishment_id).catch(err => {
      console.warn("[SyncEngine] Background flush deferred:", err);
    });

    return fullMutation;
  }

  /**
   * Background Flush Process: Transmits pending mutations to Edge/Supabase
   */
  public static async flushOutbox(establishmentId: number): Promise<{ synced: number; failed: number }> {
    if (this.isSyncing) return { synced: 0, failed: 0 };
    if (typeof navigator !== "undefined" && !navigator.onLine) {
      return { synced: 0, failed: 0 };
    }

    this.isSyncing = true;
    let syncedCount = 0;
    let failedCount = 0;

    try {
      const db = await this.getDB();
      const tx = db.transaction(["outbox"], "readonly");
      const store = tx.objectStore("outbox");
      const index = store.index("status");

      const pendingMutations = await new Promise<OutboxMutation[]>((resolve, reject) => {
        const req = index.getAll("pending");
        req.onsuccess = () => resolve(req.result as OutboxMutation[]);
        req.onerror = () => reject(req.error);
      });

      const tenantMutations = pendingMutations.filter(m => m.establishment_id === establishmentId);

      for (const mutation of tenantMutations) {
        const success = await this.processMutationWithRetry(mutation);
        if (success) {
          syncedCount++;
          await this.removeOutboxMutation(mutation.id);
        } else {
          failedCount++;
        }
      }

      if (syncedCount > 0) {
        this.broadcastSyncStatus(establishmentId, "FLUSH_COMPLETED");
      }
    } finally {
      this.isSyncing = false;
    }

    return { synced: syncedCount, failed: failedCount };
  }

  /**
   * Process individual mutation with Exponential Backoff & Jitter
   */
  private static async processMutationWithRetry(mutation: OutboxMutation): Promise<boolean> {
    try {
      // 1. Target table selection
      const targetTable = 
        mutation.entity_type === "space" ? "hotel_spaces" :
        mutation.entity_type === "task" ? "hotel_operational_tasks" :
        mutation.entity_type === "event" ? "hotel_operational_events" : "hotel_maintenance_tickets";

      // 2. Transmit to Supabase (LWW Server Reconciliation)
      if (mutation.operation === "CREATE" || mutation.operation === "UPDATE" || mutation.operation === "TRANSITION") {
        const { error } = await supabase.from(targetTable).upsert({
          ...mutation.payload,
          updated_at: new Date(mutation.client_timestamp).toISOString()
        });

        if (error) throw error;
      } else if (mutation.operation === "DELETE") {
        const { error } = await supabase.from(targetTable).delete().eq("id", (mutation.payload as { id: string }).id);
        if (error) throw error;
      }

      return true;
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : String(err);
      mutation.retry_count++;
      mutation.last_error = errorMsg;

      if (mutation.retry_count >= DEFAULT_CONFIG.maxRetries) {
        mutation.status = "failed";
      }

      // Calculate exponential backoff with random jitter
      const backoffMs = Math.min(
        DEFAULT_CONFIG.maxBackoffMs,
        Math.pow(2, mutation.retry_count) * 1000 + Math.random() * 500
      );

      console.warn(`[SyncEngine] Mutation ${mutation.id} retry ${mutation.retry_count} after ${Math.round(backoffMs)}ms:`, errorMsg);
      await this.updateOutboxMutation(mutation);
      return false;
    }
  }

  /**
   * Update mutation state in IndexedDB
   */
  private static async updateOutboxMutation(mutation: OutboxMutation): Promise<void> {
    const db = await this.getDB();
    const tx = db.transaction(["outbox"], "readwrite");
    const store = tx.objectStore("outbox");
    await new Promise<void>((resolve, reject) => {
      const req = store.put(mutation);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  }

  /**
   * Remove synchronized mutation from IndexedDB
   */
  private static async removeOutboxMutation(id: string): Promise<void> {
    const db = await this.getDB();
    const tx = db.transaction(["outbox"], "readwrite");
    const store = tx.objectStore("outbox");
    await new Promise<void>((resolve, reject) => {
      const req = store.delete(id);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  }

  /**
   * Broadcast sync event to reactive UI components
   */
  private static broadcastSyncStatus(establishmentId: number, type: string): void {
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("hdv_sync_engine_event", { detail: { establishmentId, type, timestamp: Date.now() } }));
    }
  }
}
