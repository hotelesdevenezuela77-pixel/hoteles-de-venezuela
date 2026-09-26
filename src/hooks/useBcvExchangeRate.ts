import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabase";

export const DEFAULT_BCV_RATE = 855.66;
export const LOCAL_BCV_RATE_KEY = "hdv_bcv_exchange_rate_usd_ves";
export const LOCAL_BCV_SOURCE_KEY = "hdv_bcv_exchange_source";
export const LOCAL_BCV_UPDATED_KEY = "hdv_bcv_exchange_updated_at";

export function getBcvExchangeRate(): number {
  if (typeof window !== "undefined") {
    try {
      const saved = localStorage.getItem(LOCAL_BCV_RATE_KEY);
      if (saved) {
        const num = parseFloat(saved);
        if (!isNaN(num) && num > 0) return num;
      }
    } catch (e) {}
  }
  return DEFAULT_BCV_RATE;
}

export function setBcvExchangeRateLocally(rate: number, source: string = "BCV Oficial"): void {
  if (typeof window !== "undefined") {
    try {
      localStorage.setItem(LOCAL_BCV_RATE_KEY, String(rate));
      localStorage.setItem(LOCAL_BCV_SOURCE_KEY, source);
      localStorage.setItem(LOCAL_BCV_UPDATED_KEY, new Date().toISOString());

      // Update mock table if exists
      const mockKey = "hdv_mock_exchange_rates";
      const mockList = JSON.parse(localStorage.getItem(mockKey) || "[]");
      const updatedMock = mockList.map((r: any) => 
        (r.fromCurrency === "USD" || r.from_currency === "USD") && (r.toCurrency === "VES" || r.to_currency === "VES")
          ? { ...r, rate, source, updatedAt: new Date().toISOString() }
          : r
      );
      if (!updatedMock.some((r: any) => (r.fromCurrency === "USD" || r.from_currency === "USD") && (r.toCurrency === "VES" || r.to_currency === "VES"))) {
        updatedMock.push({
          id: 1,
          fromCurrency: "USD",
          toCurrency: "VES",
          rate,
          source,
          isActive: true,
          updatedBy: "Admin Master",
          updatedAt: new Date().toISOString()
        });
      }
      localStorage.setItem(mockKey, JSON.stringify(updatedMock));

      // Broadcast globally to all windows and components
      window.dispatchEvent(new CustomEvent("hdv_bcv_rate_changed", {
        detail: { rate, source, updatedAt: new Date().toISOString() }
      }));
    } catch (e) {}
  }
}

export function useBcvExchangeRate() {
  const [bcvRate, setBcvRate] = useState<number>(getBcvExchangeRate);
  const [bcvSource, setBcvSource] = useState<string>(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem(LOCAL_BCV_SOURCE_KEY) || "BCV Oficial";
    }
    return "BCV Oficial";
  });
  const [lastUpdated, setLastUpdated] = useState<string>(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem(LOCAL_BCV_UPDATED_KEY) || new Date().toISOString();
    }
    return new Date().toISOString();
  });
  const [loading, setLoading] = useState(false);

  // Sincronizar desde Supabase
  const syncFromSupabase = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from("exchange_rates")
        .select("*")
        .or("from_currency.eq.USD,fromCurrency.eq.USD")
        .or("to_currency.eq.VES,toCurrency.eq.VES")
        .order("updated_at", { ascending: false })
        .limit(1);

      if (!error && data && data.length > 0) {
        const item = data[0];
        const rate = Number(item.rate);
        if (rate > 0) {
          setBcvRate(rate);
          setBcvSource(item.source || "BCV Oficial");
          setLastUpdated(item.updated_at || new Date().toISOString());
          setBcvExchangeRateLocally(rate, item.source || "BCV Oficial");
        }
      }
    } catch (e) {
      // Fallback a localStorage
    }
  }, []);

  useEffect(() => {
    syncFromSupabase();

    const handleCustomEvent = (e: any) => {
      if (e.detail && e.detail.rate) {
        setBcvRate(e.detail.rate);
        if (e.detail.source) setBcvSource(e.detail.source);
        if (e.detail.updatedAt) setLastUpdated(e.detail.updatedAt);
      }
    };

    const handleStorageEvent = (e: StorageEvent) => {
      if (e.key === LOCAL_BCV_RATE_KEY && e.newValue) {
        const num = parseFloat(e.newValue);
        if (!isNaN(num) && num > 0) setBcvRate(num);
      }
    };

    window.addEventListener("hdv_bcv_rate_changed", handleCustomEvent);
    window.addEventListener("storage", handleStorageEvent);

    return () => {
      window.removeEventListener("hdv_bcv_rate_changed", handleCustomEvent);
      window.removeEventListener("storage", handleStorageEvent);
    };
  }, [syncFromSupabase]);

  const updateRate = async (newRate: number, source: string = "BCV Oficial") => {
    setLoading(true);
    setBcvRate(newRate);
    setBcvSource(source);
    setLastUpdated(new Date().toISOString());
    setBcvExchangeRateLocally(newRate, source);

    try {
      await supabase
        .from("exchange_rates")
        .update({ rate: newRate, source, updated_at: new Date().toISOString() })
        .or("from_currency.eq.USD,fromCurrency.eq.USD")
        .or("to_currency.eq.VES,toCurrency.eq.VES");
    } catch (err) {
      console.warn("Supabase update exchange_rate error:", err);
    } finally {
      setLoading(false);
    }
  };

  const convertToBs = (amountUsd: number): number => {
    return (amountUsd || 0) * bcvRate;
  };

  const formatBs = (amountUsd: number): string => {
    const bs = convertToBs(amountUsd);
    return bs.toLocaleString("es-VE", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  return {
    bcvRate,
    bcvSource,
    lastUpdated,
    loading,
    updateRate,
    convertToBs,
    formatBs,
    refresh: syncFromSupabase
  };
}
