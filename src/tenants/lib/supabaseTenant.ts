import { supabase } from "../../lib/supabase";

/**
 * Cliente de Supabase envuelto para multi-tenant (SaaS Tenant Client).
 * Intercepta las llamadas a Supabase y fuerza la inyección del filtro `establishment_id`.
 * Garantiza aislamiento lógico estricto sin necesidad de políticas RLS complejas en el Core.
 */
export const createTenantClient = (establishmentId: number) => {
  if (!establishmentId) {
    throw new Error("[Tenant Client] Se requiere un establishment_id válido para inicializar el cliente.");
  }

  return {
    /**
     * Accede a una tabla de Supabase forzando la seguridad lógica del tenant.
     * @param table Nombre de la tabla de base de datos a consultar.
     */
    from: (table: string) => {
      return {
        /**
         * Realiza una consulta SELECT forzando el filtro del establishment_id del tenant.
         * @param columns Columnas a seleccionar (por defecto '*').
         */
        select: (columns: string = "*") => {
          return supabase
            .from(table)
            .select(columns)
            .eq("establishment_id", establishmentId);
        },

        /**
         * Inserta datos inyectando automáticamente el establishment_id correspondiente.
         * @param values Datos a insertar (objeto o array de objetos).
         */
        insert: (values: any) => {
          const injectTenantId = (item: any) => ({
            ...item,
            establishment_id: establishmentId,
          });

          const dataToInsert = Array.isArray(values)
            ? values.map(injectTenantId)
            : injectTenantId(values);

          return supabase.from(table).insert(dataToInsert);
        },

        /**
         * Actualiza registros restringiendo la operación al establishment_id del tenant.
         * @param values Campos a actualizar.
         */
        update: (values: any) => {
          // Removemos establishment_id de los valores para evitar que un tenant intente cambiar su propio ID de nodo
          const { establishment_id, ...updates } = values;
          return supabase
            .from(table)
            .update(updates)
            .eq("establishment_id", establishmentId);
        },

        /**
         * Elimina registros restringiendo la operación al establishment_id del tenant.
         */
        delete: () => {
          return supabase
            .from(table)
            .delete()
            .eq("establishment_id", establishmentId);
        },

        /**
         * Realiza una consulta upsert inyectando el ID del establecimiento.
         */
        upsert: (values: any, options?: any) => {
          const injectTenantId = (item: any) => ({
            ...item,
            establishment_id: establishmentId,
          });

          const dataToUpsert = Array.isArray(values)
            ? values.map(injectTenantId)
            : injectTenantId(values);

          return supabase.from(table).upsert(dataToUpsert, options);
        }
      };
    },

    /**
     * Acceso directo a funciones RPC en Supabase (RPC debe validar establishment_id internamente o pasarlo como argumento).
     */
    rpc: (fnName: string, params: any = {}) => {
      return supabase.rpc(fnName, {
        ...params,
        p_establishment_id: establishmentId
      });
    },

    /**
     * Cliente Supabase Core original.
     * ADVERTENCIA: Usar con extrema precaución solo para operaciones globales de lectura
     * (por ejemplo, cargar catálogos globales de destinos o categorías que no posean establishment_id).
     */
    _dangerouslyGetCoreClient: () => supabase,
  };
};
