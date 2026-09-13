import { useState, useEffect } from "react";
import { HomeV2 } from "../../pages/HomeV2";
import { Home } from "../../pages/Home";
import { supabase } from "../../lib/supabase";

export function MainHomeWrapper() {
  const [activeVersion, setActiveVersion] = useState<string>(() => {
    return localStorage.getItem("hdv_active_home_version") || "v2";
  });

  useEffect(() => {
    async function fetchActiveHomeVersion() {
      try {
        const { data, error } = await supabase
          .from("site_settings")
          .select("setting_value")
          .eq("setting_key", "active_home_version")
          .single();

        if (!error && data && data.setting_value) {
          setActiveVersion(data.setting_value);
          localStorage.setItem("hdv_active_home_version", data.setting_value);
        }
      } catch (err) {
        console.warn("MainHomeWrapper: Usando versión por defecto (v2):", err);
      }
    }

    fetchActiveHomeVersion();

    const handleSync = () => {
      const current = localStorage.getItem("hdv_active_home_version") || "v2";
      setActiveVersion(current);
    };

    window.addEventListener("hdv_home_version_changed", handleSync);
    return () => window.removeEventListener("hdv_home_version_changed", handleSync);
  }, []);

  if (activeVersion === "v1") {
    return <Home isMainHome={true} />;
  }

  return <HomeV2 isMainHome={true} />;
}
