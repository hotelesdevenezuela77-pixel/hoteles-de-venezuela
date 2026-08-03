import { useEffect, useState } from "react";
import { Link } from "wouter";
import { supabase } from "../lib/supabase";
import { ESTABLISHMENTS_MOCK } from "../lib/establishmentsMock";
import type { Establishment } from "../components/layout/EstablishmentCard";
import { EstablishmentCard, EstablishmentListItem, getVirtualPrice } from "../components/layout/EstablishmentCard";
import { 
  Search, MapPin, ChevronDown, ChevronUp, X, Filter, Grid, List, Compass, Loader2, 
  Wifi, Car, Waves, Wind, Palmtree, Zap, Droplets, Dog, Star, Sparkles, RotateCcw,
  ShieldCheck, Award, CreditCard, Coffee, Utensils, Bed, Users, Accessibility,
  Sun, Tv, Bath, Flame, Wine, Heart, Smile, Check, DollarSign, Building2
} from "lucide-react";

interface Category {
  id: number;
  slug: string;
  name: string;
  icon: string;
}

interface Destination {
  id: number;
  slug: string;
  name: string;
  state: string;
}

export function Establecimientos() {
  const [establishments, setEstablishments] = useState<Establishment[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [loading, setLoading] = useState(false);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [showFilters, setShowFilters] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<"category" | "destination" | null>(null);
  const [comparedIds, setComparedIds] = useState<number[]>([]);

  // 12-Block Advanced Search Filter States (Inspirado en Booking.com + Ecosistema Venezuela)
  const [minPrice, setMinPrice] = useState<number>(0);
  const [maxPrice, setMaxPrice] = useState<number>(1000);
  const [minRating, setMinRating] = useState<number>(0);
  const [adults, setAdults] = useState<number>(1);
  const [children, setChildren] = useState<number>(0);
  const [selectedSubtype, setSelectedSubtype] = useState<string>("");
  const [selectedStars, setSelectedStars] = useState<number[]>([]);

  // Categorías avanzadas en arreglos
  const [selectedCertifications, setSelectedCertifications] = useState<string[]>([]);
  const [selectedInfra, setSelectedInfra] = useState<string[]>([]);
  const [selectedPaymentMethods, setSelectedPaymentMethods] = useState<string[]>([]);
  const [selectedMeals, setSelectedMeals] = useState<string[]>([]);
  const [selectedFacilities, setSelectedFacilities] = useState<string[]>([]);
  const [selectedRoomFeatures, setSelectedRoomFeatures] = useState<string[]>([]);
  const [selectedActivities, setSelectedActivities] = useState<string[]>([]);
  const [selectedGroupTypes, setSelectedGroupTypes] = useState<string[]>([]);
  const [selectedAccessibility, setSelectedAccessibility] = useState<string[]>([]);
  const [selectedLocationDistances, setSelectedLocationDistances] = useState<string[]>([]);
  const [smartQuery, setSmartQuery] = useState<string>("");

  // Acordeones colapsables para los 12 bloques (Modelo Híbrido 80/20 UX)
  const [expandedBlocks, setExpandedBlocks] = useState<Record<string, boolean>>({
    garantia: true,
    puntuacion: true,
    subtipo: true,
    infra: false,
    pago: false,
    comidas: false,
    instalaciones: false,
    habitacion: false,
    experiencias: false,
    grupo: false,
    accesibilidad: false,
    ubicacion: false
  });

  const toggleBlock = (blockKey: string) => {
    setExpandedBlocks(prev => ({ ...prev, [blockKey]: !prev[blockKey] }));
  };

  const toggleArrayFilter = (setter: React.Dispatch<React.SetStateAction<string[]>>, key: string) => {
    setter(prev => prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key]);
  };

  const handleClearFilters = () => {
    setSelectedCategory("");
    setSelectedDestination("");
    setMinPrice(0);
    setMaxPrice(1000);
    setMinRating(0);
    setAdults(1);
    setChildren(0);
    setSelectedSubtype("");
    setSelectedStars([]);
    setSelectedCertifications([]);
    setSelectedInfra([]);
    setSelectedPaymentMethods([]);
    setSelectedMeals([]);
    setSelectedFacilities([]);
    setSelectedRoomFeatures([]);
    setSelectedActivities([]);
    setSelectedGroupTypes([]);
    setSelectedAccessibility([]);
    setSelectedLocationDistances([]);
    setSmartQuery("");
  };

  // Helper dinámico para contar cuántos hoteles coinciden con una opción de filtro
  const getFilterOptionCount = (filterType: string, value: any): number => {
    return establishments.filter(est => {
      const nameLower = est.name.toLowerCase();
      if (filterType === "category") return est.category_slug === value;
      if (filterType === "destination") return est.destination_slug === value;
      if (filterType === "stars") {
        let stars = 3;
        if ((est as any).stars) stars = Number((est as any).stars);
        else if (nameLower.includes("resort") || nameLower.includes("intercontinental") || est.membership_tier === "diamante") stars = 5;
        else if (nameLower.includes("boutique") || est.rating_avg >= 4.7) stars = 4;
        return stars === value;
      }
      if (filterType === "subtype") return getSubtype(est) === value;

      // Parse services
      let estServices: string[] = [];
      try {
        if (est.services) {
          if (Array.isArray(est.services)) {
            estServices = est.services.map(s => String(s).toLowerCase().trim());
          } else if (typeof est.services === "string") {
            const trimmed = est.services.trim();
            if (trimmed.startsWith("[") && trimmed.endsWith("]")) {
              estServices = JSON.parse(trimmed).map((s: any) => String(s).toLowerCase().trim());
            } else {
              estServices = trimmed.split(",").map(s => s.toLowerCase().trim());
            }
          }
        }
      } catch (e) {}

      // Servicios simulados / predeterminados
      if (est.has_hdv_seal || est.membership_tier === "diamante" || est.id % 2 === 0) estServices.push("sello_hdv");
      if ((est as any).is_circuito_excelencia || nameLower.includes("boutique") || est.id % 3 === 0) estServices.push("circuito_excelencia");
      if (est.id % 2 === 1) estServices.push("sostenibilidad");
      if (est.has_reservations_enabled || est.id % 2 === 0) estServices.push("reserva_inmediata");
      if (est.id % 2 === 0) estServices.push("wifi");
      if (nameLower.includes("resort") || est.id % 3 === 0) estServices.push("piscina");
      if (est.id % 2 === 1) estServices.push("estacionamiento");
      if (est.id % 2 === 0) estServices.push("aire_acondicionado");
      if (est.destination_slug === "los-roques" || est.destination_slug === "margarita" || est.id % 3 === 0) estServices.push("playa_privada");
      if (est.id % 2 === 0) estServices.push("planta_electrica");
      if (est.id % 2 === 1) estServices.push("tanque_agua");
      if (est.id % 3 === 0) estServices.push("zelle");
      if (est.id % 2 === 0) estServices.push("pago_movil");
      if (est.id % 2 === 1) estServices.push("tarjeta_int");
      if (est.id % 3 === 0) estServices.push("efectivo_usd");
      if (est.id % 2 === 0) estServices.push("desayuno_incluido");
      if (nameLower.includes("resort") || est.id % 4 === 0) estServices.push("todo_incluido");
      if (est.id % 3 === 0) estServices.push("media_pension");
      if (nameLower.includes("adult") || nameLower.includes("boutique") || est.id % 3 === 0) estServices.push("solo_adultos");
      if (est.id % 2 === 0) estServices.push("pet_friendly");
      if (est.id % 3 === 0) estServices.push("travel_proud");
      if (est.id % 2 === 0) estServices.push("planta_baja");
      if (est.id % 3 === 0) estServices.push("silla_ruedas");
      if (nameLower.includes("hotel") || nameLower.includes("resort")) estServices.push("ascensor");

      return estServices.includes(value);
    }).length;
  };

  const availableAmenities = [
    { key: "wifi", label: "WiFi Gratis", icon: <Wifi className="w-3.5 h-3.5" /> },
    { key: "piscina", label: "Piscina", icon: <Waves className="w-3.5 h-3.5" /> },
    { key: "estacionamiento", label: "Estacionamiento", icon: <Car className="w-3.5 h-3.5" /> },
    { key: "aire_acondicionado", label: "Aire Acondicionado", icon: <Wind className="w-3.5 h-3.5" /> },
    { key: "playa_privada", label: "Playa Privada", icon: <Palmtree className="w-3.5 h-3.5" /> },
    { key: "planta_electrica", label: "Planta Eléctrica", icon: <Zap className="w-3.5 h-3.5" /> },
    { key: "tanque_agua", label: "Tanque de Agua", icon: <Droplets className="w-3.5 h-3.5" /> },
    { key: "pet_friendly", label: "Mascotas", icon: <Dog className="w-3.5 h-3.5" /> },
  ];

  const availableAccessibility = [
    { key: "planta_baja", label: "Toda la unidad en planta baja" },
    { key: "silla_ruedas", label: "Accesible en silla de ruedas" },
    { key: "ascensor", label: "Acceso en ascensor" },
    { key: "wc_barras", label: "WC con barras de apoyo" },
    { key: "braille", label: "Apoyo visual: Braille" },
    { key: "guiado_auditivo", label: "Guiado auditivo / visual" },
  ];

  const availableActivities = [
    { key: "solo_adultos", label: "Solo para adultos" },
    { key: "tours_pie", label: "Tours a pie" },
    { key: "tours_bici", label: "Tours en bicicleta" },
    { key: "alquiler_bici", label: "Alquiler de bicicletas" },
    { key: "ruta_bares", label: "Ruta de bares" },
  ];

  const getSubtype = (est: Establishment) => {
    const nameLower = est.name.toLowerCase();
    if (nameLower.includes("posada") || nameLower.includes("boutique")) return "posada_boutique";
    if (nameLower.includes("resort") || nameLower.includes("complex") || nameLower.includes("hesperia")) return "resort";
    if (nameLower.includes("hotel") || nameLower.includes("suites")) return "hotel_familiar";
    return "otros";
  };

  const getVirtualCapacity = (est: Establishment) => {
    const category = est.category_slug || "";
    if (category === "restaurantes") return 20;
    return category === "posadas" ? 2 + (est.id % 4) : 4 + (est.id % 6);
  };

  // Load compared hotels on mount
  useEffect(() => {
    const stored = localStorage.getItem("hdv_compare_list");
    if (stored) setComparedIds(JSON.parse(stored));
  }, []);

  // Close dropdown on click outside
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest(".dropdown-container")) {
        setActiveDropdown(null);
      }
    };
    document.addEventListener("click", handleOutsideClick);
    return () => document.removeEventListener("click", handleOutsideClick);
  }, []);

  // Sync compare list across events
  useEffect(() => {
    const handleSync = () => {
      const stored = localStorage.getItem("hdv_compare_list");
      if (stored) setComparedIds(JSON.parse(stored));
    };
    window.addEventListener("hdv_compare_updated", handleSync);
    return () => window.removeEventListener("hdv_compare_updated", handleSync);
  }, []);

  const handleCompareToggle = (id: number) => {
    setComparedIds(prev => {
      let next;
      if (prev.includes(id)) {
        next = prev.filter(item => item !== id);
      } else {
        if (prev.length >= 3) {
          alert("Puedes comparar hasta un máximo de 3 establecimientos simultáneamente.");
          return prev;
        }
        next = [...prev, id];
      }
      localStorage.setItem("hdv_compare_list", JSON.stringify(next));
      window.dispatchEvent(new Event("hdv_compare_updated"));
      return next;
    });
  };

  // Read URL search params on mount
  const searchParams = new URLSearchParams(window.location.search);
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get("category") || "");
  const [selectedDestination, setSelectedDestination] = useState(searchParams.get("destination") || "");
  const [searchQuery, setSearchQuery] = useState(searchParams.get("q") || "");

  // Update URL search params
  const updateURLParams = (category: string, destination: string, query: string) => {
    const params = new URLSearchParams();
    if (category) params.set("category", category);
    if (destination) params.set("destination", destination);
    if (query) params.set("q", query);

    const paramStr = params.toString();
    const newPath = window.location.pathname + (paramStr ? `?${paramStr}` : "");
    window.history.pushState(null, "", newPath);
  };

  const handleCategoryChange = (slug: string) => {
    setSelectedCategory(slug);
    updateURLParams(slug, selectedDestination, searchQuery);
    setActiveDropdown(null);
  };

  const handleDestinationChange = (slug: string) => {
    setSelectedDestination(slug);
    updateURLParams(selectedCategory, slug, searchQuery);
    setActiveDropdown(null);
  };

  const handleSearchChange = (val: string) => {
    setSearchQuery(val);
    updateURLParams(selectedCategory, selectedDestination, val);
  };

  const clearFilters = () => {
    setSelectedCategory("");
    setSelectedDestination("");
    setSearchQuery("");
    setMinPrice(0);
    setMaxPrice(1000);
    setMinRating(0);
    setAdults(1);
    setChildren(0);
    setSelectedSubtype("");
    setSelectedStars([]);
    setSelectedCertifications([]);
    setSelectedInfra([]);
    setSelectedPaymentMethods([]);
    setSelectedMeals([]);
    setSelectedFacilities([]);
    setSelectedRoomFeatures([]);
    setSelectedActivities([]);
    setSelectedGroupTypes([]);
    setSelectedAccessibility([]);
    setSelectedLocationDistances([]);
    setSmartQuery("");
    updateURLParams("", "", "");
  };

  const handleSmartSearch = (phrase: string) => {
    if (!phrase.trim()) return;
    const phraseLower = phrase.toLowerCase();
    
    // Limpiar todos los filtros antes de aplicar la búsqueda inteligente
    clearFilters();
    setSmartQuery(phrase);

    // Detección inteligente de infraestructura
    const newInfra: string[] = [];
    if (phraseLower.includes("wifi") || phraseLower.includes("internet") || phraseLower.includes("wi-fi")) newInfra.push("wifi_fibra");
    if (phraseLower.includes("planta") || phraseLower.includes("generador") || phraseLower.includes("luz")) newInfra.push("planta_electrica");
    if (phraseLower.includes("tanque") || phraseLower.includes("agua")) newInfra.push("tanque_agua");
    if (phraseLower.includes("estacionamiento") || phraseLower.includes("parking") || phraseLower.includes("estacionar")) newInfra.push("estacionamiento");
    if (newInfra.length > 0) setSelectedInfra(newInfra);

    // Detección inteligente de instalaciones
    const newFac: string[] = [];
    if (phraseLower.includes("piscina") || phraseLower.includes("alberca")) newFac.push("piscina");
    if (phraseLower.includes("spa") || phraseLower.includes("sauna")) newFac.push("spa");
    if (phraseLower.includes("jacuzzi") || phraseLower.includes("hidromasaje")) newFac.push("jacuzzi");
    if (newFac.length > 0) setSelectedFacilities(newFac);

    // Detección de grupo y mascotas
    const newGroup: string[] = [];
    if (phraseLower.includes("mascota") || phraseLower.includes("perro") || phraseLower.includes("gato") || phraseLower.includes("pet")) newGroup.push("pet_friendly");
    if (phraseLower.includes("adultos") || phraseLower.includes("parejas")) newGroup.push("solo_adultos");
    if (newGroup.length > 0) setSelectedGroupTypes(newGroup);

    // Detección de accesibilidad
    const newAccess: string[] = [];
    if (phraseLower.includes("silla") || phraseLower.includes("ruedas") || phraseLower.includes("rampa") || phraseLower.includes("discapacitado")) newAccess.push("silla_ruedas");
    if (phraseLower.includes("planta baja") || phraseLower.includes("planta-baja") || phraseLower.includes("primer piso")) newAccess.push("planta_baja");
    if (phraseLower.includes("ascensor") || phraseLower.includes("elevador")) newAccess.push("ascensor");
    if (phraseLower.includes("wc") || phraseLower.includes("baño adaptado") || phraseLower.includes("barras") || phraseLower.includes("apoyo")) newAccess.push("wc_barras");
    if (phraseLower.includes("braille") || phraseLower.includes("ciego")) newAccess.push("braille");
    if (phraseLower.includes("audio") || phraseLower.includes("guiado")) newAccess.push("guiado_auditivo");
    if (newAccess.length > 0) setSelectedAccessibility(newAccess);

    // Detección de estrellas
    if (phraseLower.includes("5 estrellas") || phraseLower.includes("cinco estrellas") || phraseLower.includes("lujo")) {
      setSelectedStars([5]);
    } else if (phraseLower.includes("4 estrellas") || phraseLower.includes("cuatro estrellas")) {
      setSelectedStars([4]);
    } else if (phraseLower.includes("3 estrellas") || phraseLower.includes("tres estrellas")) {
      setSelectedStars([3]);
    }

    // Detección de actividades/tipo de grupo
    const newAct: string[] = [];
    if (phraseLower.includes("adulto") || phraseLower.includes("adults")) newAct.push("solo_adultos");
    if (phraseLower.includes("tour") || phraseLower.includes("paseo") || phraseLower.includes("caminar")) newAct.push("tours_pie");
    if (phraseLower.includes("bicicleta") || phraseLower.includes("bici")) newAct.push("tours_bici");
    if (phraseLower.includes("bar") || phraseLower.includes("bares") || phraseLower.includes("bebidas") || phraseLower.includes("tragos")) newAct.push("ruta_bares");
    if (newAct.length > 0) setSelectedActivities(newAct);

    // Detección de destino
    if (phraseLower.includes("caracas")) handleDestinationChange("caracas");
    if (phraseLower.includes("roques")) handleDestinationChange("los-roques");
    if (phraseLower.includes("margarita")) handleDestinationChange("margarita");
    if (phraseLower.includes("canaima")) handleDestinationChange("canaima");
    if (phraseLower.includes("merida") || phraseLower.includes("mérida")) handleDestinationChange("merida");
  };

  // Fetch Categories & Destinations
  useEffect(() => {
    async function fetchFilters() {
      try {
        const [catsRes, destsRes] = await Promise.all([
          supabase.from("categories").select("*").order("name"),
          supabase.from("destinations").select("id, slug, name, state").order("name")
        ]);

        if (catsRes.data) setCategories(catsRes.data as Category[]);
        if (destsRes.data) setDestinations(destsRes.data as Destination[]);
      } catch (err) {
        console.error("Error fetching filter options:", err);
      }
    };
    fetchFilters();
  }, []);

  // Fetch Establishments
  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from("establishments")
          .select(`
            *,
            categories (name, slug),
            destinations (name, slug),
            establishment_images (image_url, is_primary)
          `)
          .eq("status", "approved");

        if (error) throw error;

        if (data && data.length > 0) {
          const mapped: Establishment[] = data.map((item: any) => {
            const primaryImg = item.establishment_images?.find((img: any) => img.is_primary)?.image_url 
              || item.establishment_images?.[0]?.image_url 
              || "";

            return {
              id: item.id,
              slug: item.slug,
              name: item.name,
              description: item.description || "",
              address: item.address || "",
              phone: item.phone || "",
              whatsapp: item.whatsapp || "",
              website: item.website || "",
              category_name: item.categories?.name || "Establecimiento",
              category_slug: item.categories?.slug || "",
              destination_name: item.destinations?.name || "",
              destination_slug: item.destinations?.slug || "",
              primary_image: primaryImg,
              rating_avg: item.rating_avg || 0,
              review_count: item.review_count || 0,
              price_level: item.price_level || "",
              is_featured: item.is_featured || false,
              services: item.services || "[]",
              membership_tier: item.membership_tier || "basic",
              has_hdv_seal: item.has_hdv_seal || false,
              has_reservations_enabled: item.has_reservations_enabled || false,
              is_ads_enabled: item.is_ads_enabled || false
            };
          });
          // Merge local establishments created by owners
          const localEstsKey = "hdv_mock_establishments";
          const localEsts = JSON.parse(localStorage.getItem(localEstsKey) || "[]");
          const mappedLocal: Establishment[] = localEsts.map((item: any) => ({
            id: item.id,
            slug: item.slug,
            name: item.name,
            description: item.description || "",
            address: item.address || "",
            phone: item.phone || "",
            whatsapp: item.whatsapp || "",
            website: item.website || "",
            category_name: item.category_name || "Establecimiento",
            category_slug: item.category_slug || "",
            destination_name: item.destination_name || "Venezuela",
            destination_slug: item.destination_slug || "",
            primary_image: item.primary_image || "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80",
            rating_avg: item.rating_avg || 5.0,
            review_count: item.review_count || 1,
            price_level: item.price_level || "$$",
            is_featured: item.is_featured || false,
            services: item.services || "[]",
            membership_tier: item.membership_tier || "basic",
            has_hdv_seal: item.has_hdv_seal || false,
            has_reservations_enabled: item.has_reservations_enabled || false,
            is_ads_enabled: item.is_ads_enabled || false
          }));

          setEstablishments([...mapped, ...mappedLocal]);
        } else {
          const localEstsKey = "hdv_mock_establishments";
          const localEsts = JSON.parse(localStorage.getItem(localEstsKey) || "[]");
          setEstablishments([...ESTABLISHMENTS_MOCK, ...localEsts]);
        }
      } catch (err) {
        console.warn("Error consultando Supabase para establecimientos, usando datos de demostración:", err);
        const localEstsKey = "hdv_mock_establishments";
        const localEsts = JSON.parse(localStorage.getItem(localEstsKey) || "[]");
        setEstablishments([...ESTABLISHMENTS_MOCK, ...localEsts]);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  // Filter in-memory with 12-block logic
  const filtered = establishments.filter(est => {
    const matchesCategory = !selectedCategory || est.category_slug === selectedCategory;
    const matchesDestination = !selectedDestination || est.destination_slug === selectedDestination;
    const matchesQuery = !searchQuery || 
      est.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      est.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      est.address.toLowerCase().includes(searchQuery.toLowerCase());

    // Advanced filters logic
    const price = getVirtualPrice(est);
    const matchesPrice = price >= minPrice && price <= maxPrice;
    const matchesRating = est.rating_avg >= minRating;
    const matchesCapacity = (adults + children) <= getVirtualCapacity(est);
    const matchesSubtype = !selectedSubtype || getSubtype(est) === selectedSubtype;
    
    // Parse services in establishment
    let estServices: string[] = [];
    try {
      if (est.services) {
        if (Array.isArray(est.services)) {
          estServices = est.services.map(s => String(s).toLowerCase().trim());
        } else if (typeof est.services === "string") {
          const trimmed = est.services.trim();
          if (trimmed.startsWith("[") && trimmed.endsWith("]")) {
            estServices = JSON.parse(trimmed).map((s: any) => String(s).toLowerCase().trim());
          } else {
            estServices = trimmed.split(",").map(s => s.toLowerCase().trim());
          }
        }
      }
    } catch (e) {
      console.warn("Error parsing services for filtering:", e);
    }
    
    // Enriquecer dinámicamente servicios para simular todas las características en los 12 bloques
    const nameLower = est.name.toLowerCase();

    // 1. Garantía & Certificaciones
    if (est.has_hdv_seal || est.membership_tier === "diamante" || est.id % 2 === 0) estServices.push("sello_hdv");
    if ((est as any).is_circuito_excelencia || nameLower.includes("boutique") || est.id % 3 === 0) estServices.push("circuito_excelencia");
    if (est.id % 2 === 1) estServices.push("sostenibilidad");
    if (est.has_reservations_enabled || est.id % 2 === 0) estServices.push("reserva_inmediata");

    // 4. Infraestructura Crítica Venezuela
    if (nameLower.includes("resort") || nameLower.includes("hotel") || est.id % 2 === 0) estServices.push("planta_electrica");
    if (est.id % 2 === 0 || est.id % 3 === 0) estServices.push("tanque_agua");
    if (est.id % 4 === 0) estServices.push("ev_charge");
    estServices.push("wifi_fibra");
    estServices.push("estacionamiento");

    // 5. Métodos de Pago & Condiciones
    estServices.push("pago_movil");
    estServices.push("zelle");
    if (est.id % 2 === 0) estServices.push("usdt_crypto");
    if (est.id % 3 === 0) estServices.push("tarjeta_int");
    if (est.id % 2 === 0) estServices.push("cancelacion_gratis");
    if (est.id % 3 !== 0) estServices.push("sin_tarjeta");

    // 6. Comidas & Gastronomía
    if (nameLower.includes("posada") || est.id % 2 === 0) estServices.push("desayuno_incluido");
    if (nameLower.includes("resort") || nameLower.includes("complex")) estServices.push("all_inclusive");
    if (est.id % 3 === 0) estServices.push("media_pension");
    if (nameLower.includes("hotel") || nameLower.includes("resort") || est.id % 2 === 0) estServices.push("restaurante");
    if (nameLower.includes("apart") || nameLower.includes("villa") || est.id % 3 === 0) estServices.push("cocina");

    // 7. Instalaciones & Bienestar
    if (nameLower.includes("resort") || nameLower.includes("posada") || est.id % 2 === 0) estServices.push("piscina");
    if (est.id % 3 === 0) estServices.push("spa");
    if (est.id % 4 === 0) estServices.push("jacuzzi");
    if (nameLower.includes("hotel") || est.id % 3 === 0) estServices.push("gimnasio");
    if (est.id % 2 === 0) estServices.push("solarium");
    if (nameLower.includes("hotel") || est.id % 2 === 0) estServices.push("recepcion_24h");

    // 8. Habitación & Camas
    if (est.id % 2 === 0) estServices.push("cama_king");
    if (est.id % 2 === 1) estServices.push("camas_indiv");
    if (est.id % 3 === 0) estServices.push("cuna");
    if (nameLower.includes("posada") || nameLower.includes("resort") || est.id % 2 === 0) estServices.push("balcon");
    estServices.push("aire_acondicionado");
    estServices.push("tv");
    estServices.push("bano_privado");

    // 9. Experiencias & Entretenimiento
    if (nameLower.includes("posada") || est.destination_slug === "los-roques" || est.id % 2 === 0) estServices.push("tours_guiados");
    if (est.destination_slug === "los-roques" || est.destination_slug === "margarita" || est.id % 3 === 0) estServices.push("paseos_lancha");
    if (est.id % 3 === 0) estServices.push("ciclismo");
    if (est.id % 4 === 0) estServices.push("musica_envivo");
    if (est.id % 5 === 0) estServices.push("rutas_catas");

    // 10. Tipo de Grupo
    estServices.push("familiar");
    if (nameLower.includes("adult") || nameLower.includes("boutique") || est.id % 3 === 0) estServices.push("solo_adultos");
    if (est.id % 2 === 0) estServices.push("pet_friendly");
    if (est.id % 3 === 0) estServices.push("travel_proud");

    // 11. Accesibilidad
    if (est.id % 2 === 0) estServices.push("planta_baja");
    if (est.id % 3 === 0) estServices.push("silla_ruedas");
    if (nameLower.includes("hotel") || nameLower.includes("resort")) estServices.push("ascensor");
    if (est.id % 3 === 0) estServices.push("wc_barras");
    if (est.id % 5 === 0) estServices.push("braille_audio");

    // 12. Ubicación & Distancias
    if (est.destination_slug === "los-roques" || est.destination_slug === "margarita" || est.destination_slug === "mochima" || est.id % 2 === 0) estServices.push("cerca_mar");
    if (est.destination_slug === "caracas" || est.destination_slug === "valencia" || est.id % 2 === 1) estServices.push("cerca_centro");
    if (est.id % 3 === 0) estServices.push("cerca_aeropuerto");

    // Evaluation across all 12 blocks
    const matchesCertifications = selectedCertifications.every(k => estServices.includes(k));
    const matchesInfra = selectedInfra.every(k => estServices.includes(k));
    const matchesPaymentMethods = selectedPaymentMethods.every(k => estServices.includes(k));
    const matchesMeals = selectedMeals.every(k => estServices.includes(k));
    const matchesFacilities = selectedFacilities.every(k => estServices.includes(k));
    const matchesRoomFeatures = selectedRoomFeatures.every(k => estServices.includes(k));
    const matchesActivities = selectedActivities.every(k => estServices.includes(k));
    const matchesGroupTypes = selectedGroupTypes.every(k => estServices.includes(k));
    const matchesAccessibility = selectedAccessibility.every(k => estServices.includes(k));
    const matchesLocationDistances = selectedLocationDistances.every(k => estServices.includes(k));

    // Stars logic
    const getStarsCount = () => {
      if ((est as any).stars) return Number((est as any).stars);
      if (nameLower.includes("resort") || nameLower.includes("intercontinental") || nameLower.includes("cayena") || est.membership_tier === "diamante") return 5;
      if (nameLower.includes("boutique") || est.rating_avg >= 4.7) return 4;
      if (nameLower.includes("posada") || nameLower.includes("hotel") || est.rating_avg >= 4.3) return 3;
      return 2;
    };
    const starsCount = getStarsCount();
    const matchesStars = selectedStars.length === 0 || selectedStars.includes(starsCount);

    return matchesCategory && matchesDestination && matchesQuery && matchesPrice && matchesRating && matchesCapacity && matchesSubtype && matchesStars &&
      matchesCertifications && matchesInfra && matchesPaymentMethods && matchesMeals && matchesFacilities && matchesRoomFeatures && matchesActivities && matchesGroupTypes && matchesAccessibility && matchesLocationDistances;
  });

  const getCategoryName = (slug: string) => categories.find(c => c.slug === slug)?.name || slug;
  const getDestinationName = (slug: string) => destinations.find(d => d.slug === slug)?.name || slug;

  const activeFiltersCount = 
    (selectedCategory ? 1 : 0) + 
    (selectedDestination ? 1 : 0) + 
    (minPrice > 0 ? 1 : 0) + 
    (maxPrice < 1000 ? 1 : 0) + 
    (minRating > 0 ? 1 : 0) + 
    (adults > 1 || children > 0 ? 1 : 0) + 
    (selectedSubtype ? 1 : 0) + 
    (selectedStars.length) +
    (selectedCertifications.length) +
    (selectedInfra.length) +
    (selectedPaymentMethods.length) +
    (selectedMeals.length) +
    (selectedFacilities.length) +
    (selectedRoomFeatures.length) +
    (selectedActivities.length) +
    (selectedGroupTypes.length) +
    (selectedAccessibility.length) +
    (selectedLocationDistances.length) +
    (smartQuery ? 1 : 0);

  const hasActiveFilters = activeFiltersCount > 0;

  return (
    <div className="min-h-screen bg-gray-50/30 pb-20">
      {/* Hero Header */}
      <div className="relative overflow-hidden py-20 md:py-28 w-full text-white text-center flex items-center justify-center">
        {/* Imagen del Banner con clase scale-[1.08] */}
        <img
          src="https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1600&q=80"
          alt="Explora Establecimientos"
          className="absolute inset-0 w-full h-full object-cover scale-[1.08] pointer-events-none"
        />
        
        {/* Capa de contraste oscuro (sin negro puro, usando los morados profundos oficiales) */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#0e011f]/85 via-[#1a0533]/80 to-transparent z-10" />

        {/* Degradado inferior blanco para fundir con el fondo de la página */}
        <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-gray-50/30 via-gray-50/15 to-transparent z-15" />

        <div className="max-w-4xl mx-auto px-6 relative z-20 flex flex-col items-center justify-center">
          <span className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-[10px] font-black bg-brand-magenta/25 text-brand-magenta border border-brand-magenta/40 mb-4 tracking-widest uppercase animate-pulse">
            <Compass className="w-3.5 h-3.5" />
            <span>EL PARAÍSO TE ESPERA</span>
          </span>
          <h1 className="text-4xl md:text-5xl font-display font-black tracking-tight mb-4 text-white drop-shadow-md">
            Explora Hoteles y <span className="text-gradient-brand">Hospedajes</span>
          </h1>
          <p className="text-gray-150 text-xs md:text-sm font-sans max-w-2xl mx-auto leading-relaxed opacity-95 drop-shadow-xs">
            Descubre los mejores hospedajes, posadas boutique y restaurantes en toda Venezuela. Comunícate directamente con los dueños sin pagar cargos por intermediación.
          </p>
        </div>
      </div>

      {/* Contenedor Principal con Diseño de 2 Columnas (Sidebar Filtros Izquierdo + Resultados Derecho) */}
      <div className="max-w-7xl mx-auto px-6 -mt-8 relative z-20">
        <div className="flex flex-col lg:flex-row gap-8 items-start">
          
          {/* COLUMNA IZQUIERDA: Filtros (Sticky inteligente en desktop con scroll interno, colapsable en móvil) */}
          <aside className={`w-full lg:w-80 shrink-0 bg-white border border-gray-100 rounded-3xl p-5 shadow-xl shadow-gray-200/40 lg:sticky lg:top-24 lg:max-h-[calc(100vh-7rem)] lg:overflow-y-auto no-scrollbar transition-all duration-300 ${showFilters ? 'block' : 'hidden lg:block'}`}>
            <div className="flex items-center justify-between pb-4 mb-4 border-b border-gray-100">
              <h3 className="text-sm font-black text-gray-800 tracking-tight flex items-center gap-2">
                <Filter className="w-4 h-4 text-[#FF0096]" />
                <span>Filtros de Búsqueda</span>
              </h3>
              <div className="flex items-center gap-2">
                {hasActiveFilters && (
                  <button
                    type="button"
                    onClick={handleClearFilters}
                    className="text-[10px] font-black text-[#FF0096] hover:underline cursor-pointer flex items-center gap-1 bg-[#FF0096]/10 px-2.5 py-1 rounded-full border border-[#FF0096]/20 transition-all"
                    title="Restablecer todos los filtros"
                  >
                    <RotateCcw className="w-3 h-3" />
                    <span>Limpiar ({activeFiltersCount})</span>
                  </button>
                )}
                {/* Botón para cerrar filtros en móvil */}
                <button 
                  type="button"
                  onClick={() => setShowFilters(false)}
                  className="lg:hidden p-1.5 rounded-xl hover:bg-gray-50 text-gray-500 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="space-y-4 text-left divide-y divide-gray-100">
              
              {/* Filtros Básicos de Categoría, Destino y Rango de Precios */}
              <div className="space-y-4 pb-4">
                {/* Categoría */}
                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase font-bold text-gray-400 tracking-wider block">Categoría de Negocio</label>
                  <select
                    value={selectedCategory}
                    onChange={(e) => handleCategoryChange(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2 text-xs font-semibold text-gray-700 outline-none focus:border-brand-magenta cursor-pointer"
                  >
                    <option value="">Todas las Categorías</option>
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.slug}>{cat.name}</option>
                    ))}
                  </select>
                </div>

                {/* Destino */}
                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase font-bold text-gray-400 tracking-wider block">Destino Turístico / Estado</label>
                  <select
                    value={selectedDestination}
                    onChange={(e) => handleDestinationChange(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2 text-xs font-semibold text-gray-700 outline-none focus:border-brand-magenta cursor-pointer"
                  >
                    <option value="">Todos los Destinos</option>
                    {destinations.map((dest) => (
                      <option key={dest.id} value={dest.slug}>{dest.name} ({dest.state})</option>
                    ))}
                  </select>
                </div>

                {/* Rango de Precios */}
                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase font-bold text-gray-400 tracking-wider block">Rango de Tarifa (USD / Noche)</label>
                  <div className="flex items-center gap-2">
                    <div className="relative flex-1">
                      <span className="absolute left-3 top-2 text-gray-400 text-xs font-bold">$</span>
                      <input
                        type="number"
                        placeholder="Mín"
                        value={minPrice || ""}
                        onChange={(e) => setMinPrice(Math.max(0, Number(e.target.value)))}
                        className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-6 pr-2 py-2 text-xs font-semibold text-gray-700 outline-none focus:border-[#00C8D4]"
                      />
                    </div>
                    <span className="text-gray-400 text-xs">—</span>
                    <div className="relative flex-1">
                      <span className="absolute left-3 top-2 text-gray-400 text-xs font-bold">$</span>
                      <input
                        type="number"
                        placeholder="Máx"
                        value={maxPrice || ""}
                        onChange={(e) => setMaxPrice(Math.max(0, Number(e.target.value)))}
                        className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-6 pr-2 py-2 text-xs font-semibold text-gray-700 outline-none focus:border-[#00C8D4]"
                      />
                    </div>
                  </div>
                </div>

                {/* Capacidad de Huéspedes */}
                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase font-bold text-gray-400 tracking-wider block">Huéspedes / Capacidad</label>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="flex items-center justify-between bg-gray-50 border border-gray-200 rounded-xl px-2.5 py-1.5">
                      <span className="text-[10px] text-gray-500 font-bold">Adultos</span>
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          disabled={adults <= 1}
                          onClick={() => setAdults(adults - 1)}
                          className="w-4 h-4 rounded-full bg-white border border-gray-200 flex items-center justify-center text-[10px] font-black text-gray-600 hover:bg-gray-50 disabled:opacity-40 cursor-pointer"
                        >
                          -
                        </button>
                        <span className="text-xs font-bold text-gray-800 min-w-[10px] text-center">{adults}</span>
                        <button
                          type="button"
                          onClick={() => setAdults(adults + 1)}
                          className="w-4 h-4 rounded-full bg-white border border-gray-200 flex items-center justify-center text-[10px] font-black text-gray-600 hover:bg-gray-50 cursor-pointer"
                        >
                          +
                        </button>
                      </div>
                    </div>

                    <div className="flex items-center justify-between bg-gray-50 border border-gray-200 rounded-xl px-2.5 py-1.5">
                      <span className="text-[10px] text-gray-500 font-bold">Niños</span>
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          disabled={children <= 0}
                          onClick={() => setChildren(children - 1)}
                          className="w-4 h-4 rounded-full bg-white border border-gray-200 flex items-center justify-center text-[10px] font-black text-gray-600 hover:bg-gray-50 disabled:opacity-40 cursor-pointer"
                        >
                          -
                        </button>
                        <span className="text-xs font-bold text-gray-800 min-w-[10px] text-center">{children}</span>
                        <button
                          type="button"
                          onClick={() => setChildren(children + 1)}
                          className="w-4 h-4 rounded-full bg-white border border-gray-200 flex items-center justify-center text-[10px] font-black text-gray-600 hover:bg-gray-50 cursor-pointer"
                        >
                          +
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* BLOQUE 1: Garantía & Verificación Oficial */}
              <div className="pt-3">
                <button
                  type="button"
                  onClick={() => toggleBlock("garantia")}
                  className="w-full flex items-center justify-between py-1 text-left cursor-pointer group"
                >
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 rounded-md bg-[#00C8D4]/15 text-[#00C8D4] flex items-center justify-center shrink-0">
                      <ShieldCheck className="w-3.5 h-3.5" />
                    </div>
                    <span className="text-xs font-black text-gray-800 tracking-tight">Garantía & Sellos</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    {selectedCertifications.length > 0 && (
                      <span className="px-2 py-0.5 rounded-full text-[9px] font-black bg-[#FF0096] text-white shadow-xs">
                        {selectedCertifications.length}
                      </span>
                    )}
                    {expandedBlocks.garantia ? <ChevronUp className="w-3.5 h-3.5 text-gray-400" /> : <ChevronDown className="w-3.5 h-3.5 text-gray-400" />}
                  </div>
                </button>

                {expandedBlocks.garantia && (
                  <div className="mt-2 space-y-1.5 pl-7">
                    {[
                      { key: "sello_hdv", label: "Sello de Garantía Legal HDV" },
                      { key: "circuito_excelencia", label: "Circuito de Excelencia" },
                      { key: "sostenibilidad", label: "Certificación Ecológica" },
                      { key: "reserva_inmediata", label: "Reserva / Confirmación Inmediata" }
                    ].map(item => {
                      const count = getFilterOptionCount("garantia", item.key);
                      return (
                        <label key={item.key} className="flex items-center justify-between text-xs font-semibold text-gray-600 cursor-pointer select-none">
                          <div className="flex items-center gap-2 min-w-0">
                            <input
                              type="checkbox"
                              checked={selectedCertifications.includes(item.key)}
                              onChange={() => toggleArrayFilter(setSelectedCertifications, item.key)}
                              className="rounded text-[#00C8D4] focus:ring-[#00C8D4] border-gray-300 w-3.5 h-3.5 accent-[#00C8D4]"
                            />
                            <span className="truncate">{item.label}</span>
                          </div>
                          <span className="text-[10px] font-bold text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded-md shrink-0 ml-1">
                            {count}
                          </span>
                        </label>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* BLOQUE 2: Puntuación & Reseñas */}
              <div className="pt-3">
                <button
                  type="button"
                  onClick={() => toggleBlock("puntuacion")}
                  className="w-full flex items-center justify-between py-1 text-left cursor-pointer group"
                >
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 rounded-md bg-amber-500/15 text-amber-500 flex items-center justify-center shrink-0">
                      <Star className="w-3.5 h-3.5 fill-amber-500" />
                    </div>
                    <span className="text-xs font-black text-gray-800 tracking-tight">Puntuación & Experiencia</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    {minRating > 0 && (
                      <span className="px-2 py-0.5 rounded-full text-[9px] font-black bg-[#FF0096] text-white shadow-xs">
                        {minRating}+
                      </span>
                    )}
                    {expandedBlocks.puntuacion ? <ChevronUp className="w-3.5 h-3.5 text-gray-400" /> : <ChevronDown className="w-3.5 h-3.5 text-gray-400" />}
                  </div>
                </button>

                {expandedBlocks.puntuacion && (
                  <div className="mt-2 space-y-1.5 pl-7">
                    {[
                      { rating: 4.8, label: "9.0+ Inolvidable / Excepcional" },
                      { rating: 4.5, label: "8.0+ Excelente Elección" },
                      { rating: 4.0, label: "7.0+ Muy Acogedor" },
                      { rating: 3.5, label: "6.0+ Sencillo y Funcional" }
                    ].map(item => (
                      <button
                        key={item.rating}
                        type="button"
                        onClick={() => setMinRating(minRating === item.rating ? 0 : item.rating)}
                        className={`w-full text-left px-2.5 py-1 rounded-lg text-xs font-bold transition-all border ${
                          minRating === item.rating
                            ? "bg-amber-50 border-amber-300 text-amber-900 shadow-xs"
                            : "bg-white border-transparent text-gray-600 hover:bg-gray-50"
                        }`}
                      >
                        {item.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* BLOQUE 3: Subtipo de Alojamiento & Estrellas */}
              <div className="pt-3">
                <button
                  type="button"
                  onClick={() => toggleBlock("subtipo")}
                  className="w-full flex items-center justify-between py-1 text-left cursor-pointer group"
                >
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 rounded-md bg-purple-500/15 text-[#9B00CC] flex items-center justify-center shrink-0">
                      <Building2 className="w-3.5 h-3.5" />
                    </div>
                    <span className="text-xs font-black text-gray-800 tracking-tight">Tipo & Categoría Estrellas</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    {(selectedSubtype || selectedStars.length > 0) && (
                      <span className="px-2 py-0.5 rounded-full text-[9px] font-black bg-[#FF0096] text-white shadow-xs">
                        {(selectedSubtype ? 1 : 0) + selectedStars.length}
                      </span>
                    )}
                    {expandedBlocks.subtipo ? <ChevronUp className="w-3.5 h-3.5 text-gray-400" /> : <ChevronDown className="w-3.5 h-3.5 text-gray-400" />}
                  </div>
                </button>

                {expandedBlocks.subtipo && (
                  <div className="mt-2 space-y-2.5 pl-7">
                    <select
                      value={selectedSubtype}
                      onChange={(e) => setSelectedSubtype(e.target.value)}
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl px-2.5 py-1.5 text-xs font-semibold text-gray-700 outline-none focus:border-[#9B00CC] cursor-pointer"
                    >
                      <option value="">Cualquier Subtipo</option>
                      <option value="posada_boutique">Posada Boutique / Encanto ({getFilterOptionCount("subtype", "posada_boutique")})</option>
                      <option value="hotel_familiar">Hotel Urbano / Ejecutivo ({getFilterOptionCount("subtype", "hotel_familiar")})</option>
                      <option value="resort">Resort & Complejo Vacacional ({getFilterOptionCount("subtype", "resort")})</option>
                      <option value="otros">Villas, Casas & Glamping ({getFilterOptionCount("subtype", "otros")})</option>
                    </select>

                    <div className="space-y-1">
                      <span className="text-[9px] uppercase font-bold text-gray-400 tracking-wider block">Estrellas</span>
                      {[5, 4, 3, 2].map(stars => {
                        const count = getFilterOptionCount("stars", stars);
                        return (
                          <label key={stars} className="flex items-center justify-between text-xs font-semibold text-gray-600 cursor-pointer select-none">
                            <div className="flex items-center gap-2 min-w-0">
                              <input
                                type="checkbox"
                                checked={selectedStars.includes(stars)}
                                onChange={() => toggleArrayFilter(setSelectedStars as any, stars as any)}
                                className="rounded text-[#9B00CC] focus:ring-[#9B00CC] border-gray-300 w-3.5 h-3.5 accent-[#9B00CC]"
                              />
                              <span className="flex items-center gap-0.5 text-amber-500 font-black">
                                {Array.from({ length: stars }).map((_, i) => <span key={i}>★</span>)}
                                <span className="text-[10px] text-gray-500 font-bold ml-1">({stars} Estrellas)</span>
                              </span>
                            </div>
                            <span className="text-[10px] font-bold text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded-md shrink-0 ml-1">
                              {count}
                            </span>
                          </label>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              {/* BLOQUE 4: Infraestructura Crítica (Venezuela Power & Water) */}
              <div className="pt-3">
                <button
                  type="button"
                  onClick={() => toggleBlock("infra")}
                  className="w-full flex items-center justify-between py-1 text-left cursor-pointer group"
                >
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 rounded-md bg-[#FF0096]/15 text-[#FF0096] flex items-center justify-center shrink-0">
                      <Zap className="w-3.5 h-3.5" />
                    </div>
                    <span className="text-xs font-black text-gray-800 tracking-tight">Infraestructura Venezuela</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    {selectedInfra.length > 0 && (
                      <span className="px-2 py-0.5 rounded-full text-[9px] font-black bg-[#FF0096] text-white shadow-xs">
                        {selectedInfra.length}
                      </span>
                    )}
                    {expandedBlocks.infra ? <ChevronUp className="w-3.5 h-3.5 text-gray-400" /> : <ChevronDown className="w-3.5 h-3.5 text-gray-400" />}
                  </div>
                </button>

                {expandedBlocks.infra && (
                  <div className="mt-2 space-y-1.5 pl-7">
                    {[
                      { key: "planta_electrica", label: "Planta Eléctrica 24/7 (Full Power)" },
                      { key: "tanque_agua", label: "Tanque de Agua Continuo" },
                      { key: "wifi_fibra", label: "WiFi Fibra Óptica Alta Velocidad" },
                      { key: "estacionamiento", label: "Estacionamiento Privado Vigilado" },
                      { key: "ev_charge", label: "Carga Vehículos Eléctricos (EV)" }
                    ].map(item => {
                      const count = getFilterOptionCount("infra", item.key);
                      return (
                        <label key={item.key} className="flex items-center justify-between text-xs font-semibold text-gray-600 cursor-pointer select-none">
                          <div className="flex items-center gap-2 min-w-0">
                            <input
                              type="checkbox"
                              checked={selectedInfra.includes(item.key)}
                              onChange={() => toggleArrayFilter(setSelectedInfra, item.key)}
                              className="rounded text-[#FF0096] focus:ring-[#FF0096] border-gray-300 w-3.5 h-3.5 accent-[#FF0096]"
                            />
                            <span className="truncate">{item.label}</span>
                          </div>
                          <span className="text-[10px] font-bold text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded-md shrink-0 ml-1">
                            {count}
                          </span>
                        </label>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* BLOQUE 5: Métodos de Pago & Condiciones */}
              <div className="pt-3">
                <button
                  type="button"
                  onClick={() => toggleBlock("pago")}
                  className="w-full flex items-center justify-between py-1 text-left cursor-pointer group"
                >
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 rounded-md bg-emerald-500/15 text-emerald-600 flex items-center justify-center shrink-0">
                      <CreditCard className="w-3.5 h-3.5" />
                    </div>
                    <span className="text-xs font-black text-gray-800 tracking-tight">Pago & Condiciones</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    {selectedPaymentMethods.length > 0 && (
                      <span className="px-2 py-0.5 rounded-full text-[9px] font-black bg-[#FF0096] text-white shadow-xs">
                        {selectedPaymentMethods.length}
                      </span>
                    )}
                    {expandedBlocks.pago ? <ChevronUp className="w-3.5 h-3.5 text-gray-400" /> : <ChevronDown className="w-3.5 h-3.5 text-gray-400" />}
                  </div>
                </button>

                {expandedBlocks.pago && (
                  <div className="mt-2 space-y-1.5 pl-7">
                    {[
                      { key: "pago_movil", label: "Pago Móvil (Bs. VES)" },
                      { key: "zelle", label: "Zelle (USD)" },
                      { key: "usdt_crypto", label: "Binance USDT / Crypto" },
                      { key: "tarjeta_int", label: "Tarjeta Internacional (Visa/MC)" },
                      { key: "cancelacion_gratis", label: "Cancelación Gratuita" },
                      { key: "sin_tarjeta", label: "Sin Tarjeta de Crédito Requerida" }
                    ].map(item => {
                      const count = getFilterOptionCount("pago", item.key);
                      return (
                        <label key={item.key} className="flex items-center justify-between text-xs font-semibold text-gray-600 cursor-pointer select-none">
                          <div className="flex items-center gap-2 min-w-0">
                            <input
                              type="checkbox"
                              checked={selectedPaymentMethods.includes(item.key)}
                              onChange={() => toggleArrayFilter(setSelectedPaymentMethods, item.key)}
                              className="rounded text-emerald-600 focus:ring-emerald-600 border-gray-300 w-3.5 h-3.5 accent-emerald-600"
                            />
                            <span className="truncate">{item.label}</span>
                          </div>
                          <span className="text-[10px] font-bold text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded-md shrink-0 ml-1">
                            {count}
                          </span>
                        </label>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* BLOQUE 6: Régimen de Comidas */}
              <div className="pt-3">
                <button
                  type="button"
                  onClick={() => toggleBlock("comidas")}
                  className="w-full flex items-center justify-between py-1 text-left cursor-pointer group"
                >
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 rounded-md bg-orange-500/15 text-orange-600 flex items-center justify-center shrink-0">
                      <Utensils className="w-3.5 h-3.5" />
                    </div>
                    <span className="text-xs font-black text-gray-800 tracking-tight">Régimen de Comidas</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    {selectedMeals.length > 0 && (
                      <span className="px-2 py-0.5 rounded-full text-[9px] font-black bg-[#FF0096] text-white shadow-xs">
                        {selectedMeals.length}
                      </span>
                    )}
                    {expandedBlocks.comidas ? <ChevronUp className="w-3.5 h-3.5 text-gray-400" /> : <ChevronDown className="w-3.5 h-3.5 text-gray-400" />}
                  </div>
                </button>

                {expandedBlocks.comidas && (
                  <div className="mt-2 space-y-1.5 pl-7">
                    {[
                      { key: "desayuno_incluido", label: "Desayuno Incluido (Criollo / Cont.)" },
                      { key: "all_inclusive", label: "All Inclusive (Todo Incluido)" },
                      { key: "media_pension", label: "Media Pensión (Desayuno y Cena)" },
                      { key: "restaurante", label: "Restaurante en la Propiedad" },
                      { key: "cocina", label: "Cocina / Kitchinette en Habitación" }
                    ].map(item => {
                      const count = getFilterOptionCount("comidas", item.key);
                      return (
                        <label key={item.key} className="flex items-center justify-between text-xs font-semibold text-gray-600 cursor-pointer select-none">
                          <div className="flex items-center gap-2 min-w-0">
                            <input
                              type="checkbox"
                              checked={selectedMeals.includes(item.key)}
                              onChange={() => toggleArrayFilter(setSelectedMeals, item.key)}
                              className="rounded text-orange-600 focus:ring-orange-600 border-gray-300 w-3.5 h-3.5 accent-orange-600"
                            />
                            <span className="truncate">{item.label}</span>
                          </div>
                          <span className="text-[10px] font-bold text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded-md shrink-0 ml-1">
                            {count}
                          </span>
                        </label>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* BLOQUE 7: Instalaciones & Bienestar */}
              <div className="pt-3">
                <button
                  type="button"
                  onClick={() => toggleBlock("instalaciones")}
                  className="w-full flex items-center justify-between py-1 text-left cursor-pointer group"
                >
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 rounded-md bg-cyan-500/15 text-[#00C8D4] flex items-center justify-center shrink-0">
                      <Waves className="w-3.5 h-3.5" />
                    </div>
                    <span className="text-xs font-black text-gray-800 tracking-tight">Instalaciones & Bienestar</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    {selectedFacilities.length > 0 && (
                      <span className="px-2 py-0.5 rounded-full text-[9px] font-black bg-[#FF0096] text-white shadow-xs">
                        {selectedFacilities.length}
                      </span>
                    )}
                    {expandedBlocks.instalaciones ? <ChevronUp className="w-3.5 h-3.5 text-gray-400" /> : <ChevronDown className="w-3.5 h-3.5 text-gray-400" />}
                  </div>
                </button>

                {expandedBlocks.instalaciones && (
                  <div className="mt-2 space-y-1.5 pl-7">
                    {[
                      { key: "piscina", label: "Piscina al Aire Libre / Climatizada" },
                      { key: "spa", label: "Spa & Centro de Bienestar" },
                      { key: "jacuzzi", label: "Bañera de Hidromasaje / Jacuzzi" },
                      { key: "gimnasio", label: "Gimnasio Equipado" },
                      { key: "solarium", label: "Solárium / Terraza Panorámica" },
                      { key: "recepcion_24h", label: "Recepción 24 Horas" }
                    ].map(item => {
                      const count = getFilterOptionCount("instalaciones", item.key);
                      return (
                        <label key={item.key} className="flex items-center justify-between text-xs font-semibold text-gray-600 cursor-pointer select-none">
                          <div className="flex items-center gap-2 min-w-0">
                            <input
                              type="checkbox"
                              checked={selectedFacilities.includes(item.key)}
                              onChange={() => toggleArrayFilter(setSelectedFacilities, item.key)}
                              className="rounded text-[#00C8D4] focus:ring-[#00C8D4] border-gray-300 w-3.5 h-3.5 accent-[#00C8D4]"
                            />
                            <span className="truncate">{item.label}</span>
                          </div>
                          <span className="text-[10px] font-bold text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded-md shrink-0 ml-1">
                            {count}
                          </span>
                        </label>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* BLOQUE 8: Confort de Habitación & Camas */}
              <div className="pt-3">
                <button
                  type="button"
                  onClick={() => toggleBlock("habitacion")}
                  className="w-full flex items-center justify-between py-1 text-left cursor-pointer group"
                >
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 rounded-md bg-blue-500/15 text-blue-600 flex items-center justify-center shrink-0">
                      <Bed className="w-3.5 h-3.5" />
                    </div>
                    <span className="text-xs font-black text-gray-800 tracking-tight">Confort de Habitación</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    {selectedRoomFeatures.length > 0 && (
                      <span className="px-2 py-0.5 rounded-full text-[9px] font-black bg-[#FF0096] text-white shadow-xs">
                        {selectedRoomFeatures.length}
                      </span>
                    )}
                    {expandedBlocks.habitacion ? <ChevronUp className="w-3.5 h-3.5 text-gray-400" /> : <ChevronDown className="w-3.5 h-3.5 text-gray-400" />}
                  </div>
                </button>

                {expandedBlocks.habitacion && (
                  <div className="mt-2 space-y-1.5 pl-7">
                    {[
                      { key: "cama_king", label: "Cama King / Queen Size" },
                      { key: "camas_indiv", label: "Camas Individuales / Dobles" },
                      { key: "cuna", label: "Cuna Adicional Disponible" },
                      { key: "balcon", label: "Balcón o Terraza con Vista" },
                      { key: "aire_acondicionado", label: "Aire Acondicionado" },
                      { key: "tv", label: "TV Pantalla Plana & Cable" },
                      { key: "bano_privado", label: "Baño Privado con Agua Caliente" }
                    ].map(item => {
                      const count = getFilterOptionCount("habitacion", item.key);
                      return (
                        <label key={item.key} className="flex items-center justify-between text-xs font-semibold text-gray-600 cursor-pointer select-none">
                          <div className="flex items-center gap-2 min-w-0">
                            <input
                              type="checkbox"
                              checked={selectedRoomFeatures.includes(item.key)}
                              onChange={() => toggleArrayFilter(setSelectedRoomFeatures, item.key)}
                              className="rounded text-blue-600 focus:ring-blue-600 border-gray-300 w-3.5 h-3.5 accent-blue-600"
                            />
                            <span className="truncate">{item.label}</span>
                          </div>
                          <span className="text-[10px] font-bold text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded-md shrink-0 ml-1">
                            {count}
                          </span>
                        </label>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* BLOQUE 9: Experiencias & Entretenimiento */}
              <div className="pt-3">
                <button
                  type="button"
                  onClick={() => toggleBlock("experiencias")}
                  className="w-full flex items-center justify-between py-1 text-left cursor-pointer group"
                >
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 rounded-md bg-indigo-500/15 text-indigo-600 flex items-center justify-center shrink-0">
                      <Sparkles className="w-3.5 h-3.5" />
                    </div>
                    <span className="text-xs font-black text-gray-800 tracking-tight">Experiencias & Tours</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    {selectedActivities.length > 0 && (
                      <span className="px-2 py-0.5 rounded-full text-[9px] font-black bg-[#FF0096] text-white shadow-xs">
                        {selectedActivities.length}
                      </span>
                    )}
                    {expandedBlocks.experiencias ? <ChevronUp className="w-3.5 h-3.5 text-gray-400" /> : <ChevronDown className="w-3.5 h-3.5 text-gray-400" />}
                  </div>
                </button>

                {expandedBlocks.experiencias && (
                  <div className="mt-2 space-y-1.5 pl-7">
                    {[
                      { key: "tours_guiados", label: "Tours & Excursiones Guiadas" },
                      { key: "paseos_lancha", label: "Paseos en Lancha / Snorkel" },
                      { key: "ciclismo", label: "Rutas en Bicicleta" },
                      { key: "musica_envivo", label: "Música / Espectáculos en Vivo" },
                      { key: "rutas_catas", label: "Ruta Gastronómica & Catas" }
                    ].map(item => {
                      const count = getFilterOptionCount("experiencias", item.key);
                      return (
                        <label key={item.key} className="flex items-center justify-between text-xs font-semibold text-gray-600 cursor-pointer select-none">
                          <div className="flex items-center gap-2 min-w-0">
                            <input
                              type="checkbox"
                              checked={selectedActivities.includes(item.key)}
                              onChange={() => toggleArrayFilter(setSelectedActivities, item.key)}
                              className="rounded text-indigo-600 focus:ring-indigo-600 border-gray-300 w-3.5 h-3.5 accent-indigo-600"
                            />
                            <span className="truncate">{item.label}</span>
                          </div>
                          <span className="text-[10px] font-bold text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded-md shrink-0 ml-1">
                            {count}
                          </span>
                        </label>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* BLOQUE 10: Tipo de Grupo & Ambiente */}
              <div className="pt-3">
                <button
                  type="button"
                  onClick={() => toggleBlock("grupo")}
                  className="w-full flex items-center justify-between py-1 text-left cursor-pointer group"
                >
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 rounded-md bg-pink-500/15 text-pink-600 flex items-center justify-center shrink-0">
                      <Users className="w-3.5 h-3.5" />
                    </div>
                    <span className="text-xs font-black text-gray-800 tracking-tight">Ambiente & Tipo de Grupo</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    {selectedGroupTypes.length > 0 && (
                      <span className="px-2 py-0.5 rounded-full text-[9px] font-black bg-[#FF0096] text-white shadow-xs">
                        {selectedGroupTypes.length}
                      </span>
                    )}
                    {expandedBlocks.grupo ? <ChevronUp className="w-3.5 h-3.5 text-gray-400" /> : <ChevronDown className="w-3.5 h-3.5 text-gray-400" />}
                  </div>
                </button>

                {expandedBlocks.grupo && (
                  <div className="mt-2 space-y-1.5 pl-7">
                    {[
                      { key: "familiar", label: "Familiar (Apto para niños)" },
                      { key: "solo_adultos", label: "Solo Adultos / Parejas" },
                      { key: "pet_friendly", label: "Pet Friendly (Mascotas)" },
                      { key: "travel_proud", label: "Travel Proud (LGBTQ+)" }
                    ].map(item => {
                      const count = getFilterOptionCount("grupo", item.key);
                      return (
                        <label key={item.key} className="flex items-center justify-between text-xs font-semibold text-gray-600 cursor-pointer select-none">
                          <div className="flex items-center gap-2 min-w-0">
                            <input
                              type="checkbox"
                              checked={selectedGroupTypes.includes(item.key)}
                              onChange={() => toggleArrayFilter(setSelectedGroupTypes, item.key)}
                              className="rounded text-pink-600 focus:ring-pink-600 border-gray-300 w-3.5 h-3.5 accent-pink-600"
                            />
                            <span className="truncate">{item.label}</span>
                          </div>
                          <span className="text-[10px] font-bold text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded-md shrink-0 ml-1">
                            {count}
                          </span>
                        </label>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* BLOQUE 11: Accesibilidad */}
              <div className="pt-3">
                <button
                  type="button"
                  onClick={() => toggleBlock("accesibilidad")}
                  className="w-full flex items-center justify-between py-1 text-left cursor-pointer group"
                >
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 rounded-md bg-[#00C8D4]/15 text-[#00C8D4] flex items-center justify-center shrink-0">
                      <Accessibility className="w-3.5 h-3.5" />
                    </div>
                    <span className="text-xs font-black text-gray-800 tracking-tight">Accesibilidad Integrada</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    {selectedAccessibility.length > 0 && (
                      <span className="px-2 py-0.5 rounded-full text-[9px] font-black bg-[#FF0096] text-white shadow-xs">
                        {selectedAccessibility.length}
                      </span>
                    )}
                    {expandedBlocks.accesibilidad ? <ChevronUp className="w-3.5 h-3.5 text-gray-400" /> : <ChevronDown className="w-3.5 h-3.5 text-gray-400" />}
                  </div>
                </button>

                {expandedBlocks.accesibilidad && (
                  <div className="mt-2 space-y-1.5 pl-7">
                    {[
                      { key: "silla_ruedas", label: "Accesible en Silla de Ruedas" },
                      { key: "ascensor", label: "Acceso con Ascensor" },
                      { key: "planta_baja", label: "Toda la Unidad en Planta Baja" },
                      { key: "wc_barras", label: "WC Adaptado con Barras" },
                      { key: "braille_audio", label: "Braille & Guiado Auditivo/Visual" }
                    ].map(item => {
                      const count = getFilterOptionCount("accesibilidad", item.key);
                      return (
                        <label key={item.key} className="flex items-center justify-between text-xs font-semibold text-gray-600 cursor-pointer select-none">
                          <div className="flex items-center gap-2 min-w-0">
                            <input
                              type="checkbox"
                              checked={selectedAccessibility.includes(item.key)}
                              onChange={() => toggleArrayFilter(setSelectedAccessibility, item.key)}
                              className="rounded text-[#00C8D4] focus:ring-[#00C8D4] border-gray-300 w-3.5 h-3.5 accent-[#00C8D4]"
                            />
                            <span className="truncate">{item.label}</span>
                          </div>
                          <span className="text-[10px] font-bold text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded-md shrink-0 ml-1">
                            {count}
                          </span>
                        </label>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* BLOQUE 12: Ubicación & Proximidad */}
              <div className="pt-3">
                <button
                  type="button"
                  onClick={() => toggleBlock("ubicacion")}
                  className="w-full flex items-center justify-between py-1 text-left cursor-pointer group"
                >
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 rounded-md bg-teal-500/15 text-teal-600 flex items-center justify-center shrink-0">
                      <MapPin className="w-3.5 h-3.5" />
                    </div>
                    <span className="text-xs font-black text-gray-800 tracking-tight">Ubicación & Proximidad</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    {selectedLocationDistances.length > 0 && (
                      <span className="px-1.5 py-0.5 rounded-full text-[9px] font-black bg-teal-600 text-white">
                        {selectedLocationDistances.length}
                      </span>
                    )}
                    {expandedBlocks.ubicacion ? <ChevronUp className="w-3.5 h-3.5 text-gray-400" /> : <ChevronDown className="w-3.5 h-3.5 text-gray-400" />}
                  </div>
                </button>

                {expandedBlocks.ubicacion && (
                  <div className="mt-2 space-y-1.5 pl-7">
                    {[
                      { key: "cerca_mar", label: "Frente al Mar / < 1 km Playa" },
                      { key: "cerca_centro", label: "Zona Urbana / < 3 km Centro" },
                      { key: "cerca_aeropuerto", label: "Cerca del Aeropuerto Principal" }
                    ].map(item => {
                      const count = getFilterOptionCount("ubicacion", item.key);
                      return (
                        <label key={item.key} className="flex items-center justify-between text-xs font-semibold text-gray-600 cursor-pointer select-none">
                          <div className="flex items-center gap-2 min-w-0">
                            <input
                              type="checkbox"
                              checked={selectedLocationDistances.includes(item.key)}
                              onChange={() => toggleArrayFilter(setSelectedLocationDistances, item.key)}
                              className="rounded text-teal-600 focus:ring-teal-600 border-gray-300 w-3.5 h-3.5 accent-teal-600"
                            />
                            <span className="truncate">{item.label}</span>
                          </div>
                          <span className="text-[10px] font-bold text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded-md shrink-0 ml-1">
                            {count}
                          </span>
                        </label>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Botón de Limpieza General de Filtros */}
              {activeFiltersCount > 0 && (
                <div className="pt-4">
                  <button
                    type="button"
                    onClick={handleClearFilters}
                    className="w-full flex items-center justify-center gap-1.5 px-4 py-2.5 bg-[#FF0096]/10 hover:bg-[#FF0096]/20 text-[#FF0096] border border-[#FF0096]/30 rounded-xl text-xs font-black transition-colors cursor-pointer select-none"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Limpiar Todos los Filtros ({activeFiltersCount})</span>
                  </button>
                </div>
              )}
            </div>
          </aside>

          {/* COLUMNA DERECHA: Buscador superior y resultados reactivos */}
          <div className="flex-1 w-full space-y-6">
            
            {/* Panel de Control de Búsqueda y Visualización */}
            <div className="bg-white border border-gray-100 rounded-3xl p-4 shadow-xl shadow-gray-200/40 flex flex-col md:flex-row items-center gap-4">
              
              {/* Input principal de búsqueda */}
              <div className="relative flex-1 w-full">
                <Search className="absolute left-4 top-3.5 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Buscar por nombre, servicios o palabras clave..."
                  value={searchQuery}
                  onChange={e => handleSearchChange(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-100 rounded-2xl pl-12 pr-4 py-3 text-xs md:text-sm text-gray-700 placeholder-gray-400 outline-none focus:border-brand-magenta focus:bg-white transition-colors font-semibold"
                />
              </div>

              {/* Controles para Móviles y Visualización */}
              <div className="flex items-center gap-2.5 w-full md:w-auto justify-between md:justify-end">
                
                {/* Botón para abrir filtros en móvil */}
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className="lg:hidden flex items-center justify-center gap-2 border border-gray-200 rounded-2xl px-4 py-3 text-xs font-bold bg-white text-gray-700 hover:bg-gray-50 transition-all cursor-pointer shadow-xs shrink-0 select-none"
                >
                  <Filter className="w-4 h-4 text-brand-magenta" />
                  <span>Filtros</span>
                  {activeFiltersCount > 0 && (
                    <span className="w-5 h-5 rounded-full bg-brand-magenta text-white text-[10px] font-black flex items-center justify-center leading-none">
                      {activeFiltersCount}
                    </span>
                  )}
                </button>

                {/* Info de resultados encontrados */}
                <div className="text-xs font-bold text-gray-500 whitespace-nowrap px-1">
                  Encontrados: <span className="text-brand-magenta font-black">{filtered.length}</span>
                </div>

                {/* Selector de modo de vista */}
                <div className="flex items-center gap-1 bg-gray-50 border border-gray-150 rounded-2xl p-1 shrink-0">
                  <button
                    onClick={() => setViewMode("grid")}
                    className={`p-2 rounded-xl transition-all cursor-pointer ${viewMode === "grid" ? "bg-white text-brand-magenta shadow-xs font-bold" : "text-gray-400 hover:text-gray-600"}`}
                    title="Vista Cuadrícula"
                  >
                    <Grid className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setViewMode("list")}
                    className={`p-2 rounded-xl transition-all cursor-pointer ${viewMode === "list" ? "bg-white text-brand-magenta shadow-xs font-bold" : "text-gray-400 hover:text-gray-600"}`}
                    title="Vista Lista"
                  >
                    <List className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Filtros Inteligentes (Lote 3) */}
            <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-xl shadow-gray-200/35 text-left space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-[#00C8D4] flex items-center justify-center text-white shrink-0 shadow-xs">
                  <Sparkles className="w-4 h-4 fill-white" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-gray-800 tracking-tight leading-none">Filtros inteligentes</h3>
                  <span className="text-[10px] text-gray-400 font-semibold mt-1 block">Búsqueda avanzada con procesamiento de lenguaje</span>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-700 block">¿Qué estás buscando?</label>
                <div className="flex flex-col md:flex-row gap-3">
                  <input
                    type="text"
                    placeholder="Ejemplo: Quiero una posada con piscina, planta eléctrica y pet friendly en Los Roques"
                    value={smartQuery}
                    onChange={(e) => setSmartQuery(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        handleSmartSearch(smartQuery);
                      }
                    }}
                    className="flex-1 bg-gray-50 border border-gray-150 rounded-2xl px-4 py-3 text-xs md:text-sm text-gray-700 placeholder-gray-400 outline-none focus:border-brand-turquesa focus:bg-white transition-all font-semibold"
                  />
                  <button
                    onClick={() => handleSmartSearch(smartQuery)}
                    className="bg-[#00C8D4] hover:bg-[#00b0ba] text-white text-xs font-black px-6 py-3 rounded-2xl transition-all cursor-pointer shadow-md shadow-cyan-400/10 active:scale-98 shrink-0 select-none"
                  >
                    Buscar alojamientos
                  </button>
                </div>
              </div>

              {smartQuery && activeFiltersCount > 0 && (
                <div className="flex items-center flex-wrap gap-2 pt-1">
                  <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Filtro Activo:</span>
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-50 border border-cyan-150 text-[#00C8D4] text-[10px] font-black">
                    <span>"{smartQuery}"</span>
                    <button
                      onClick={() => {
                        setSmartQuery("");
                        clearFilters();
                      }}
                      className="hover:text-red-500 transition-colors cursor-pointer"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Listado de Resultados */}
            <div>
              {loading ? (
                <div className="flex flex-col items-center justify-center py-20 gap-3">
                  <Loader2 className="w-10 h-10 text-brand-magenta animate-spin" />
                  <p className="text-gray-400 text-xs font-bold">Cargando establecimientos premium...</p>
                </div>
              ) : filtered.length === 0 ? (
                <div className="text-center py-20 bg-white rounded-3xl border border-gray-100 p-8 shadow-sm">
                  <Compass className="w-16 h-16 text-gray-200 mx-auto mb-4" />
                  <h3 className="text-lg font-bold text-gray-750 mb-1">No se encontraron establecimientos</h3>
                  <p className="text-gray-450 text-xs max-w-sm mx-auto leading-relaxed">
                    Prueba modificando la búsqueda o quitando los filtros aplicados en el panel izquierdo.
                  </p>
                  <button
                    onClick={clearFilters}
                    className="mt-6 btn-magenta-gradient px-6 py-2.5 rounded-xl text-xs font-bold hover:scale-102 transition-all cursor-pointer shadow-md shadow-brand-magenta/10"
                  >
                    Restablecer Búsqueda
                  </button>
                </div>
              ) : viewMode === "grid" ? (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                  {filtered.map((est) => (
                    <EstablishmentCard 
                      key={est.id} 
                      establishment={est} 
                      isComparing={comparedIds.includes(est.id)}
                      onCompareToggle={() => handleCompareToggle(est.id)}
                      isPriority={est.is_featured}
                    />
                  ))}
                </div>
              ) : (
                <div className="space-y-6">
                  {filtered.map((est) => (
                    <EstablishmentListItem 
                      key={est.id} 
                      establishment={est} 
                      isComparing={comparedIds.includes(est.id)}
                      onCompareToggle={() => handleCompareToggle(est.id)}
                      isPriority={est.is_featured}
                    />
                  ))}
                </div>
              )}
            </div>

          </div>

        </div>
      </div>

      {/* Floating Compare Bar */}
      {comparedIds.length > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-slate-900/95 backdrop-blur-md border border-white/10 rounded-full px-6 py-4 flex items-center gap-6 shadow-2xl text-white max-w-[90vw] md:max-w-max">
          <div className="flex items-center gap-4">
            <span className="text-[11px] md:text-xs font-bold whitespace-nowrap">
              Comparando <span className="text-brand-magenta font-black">{comparedIds.length}</span> de 3
            </span>
            <div className="flex -space-x-2 flex-wrap">
              {comparedIds.map(id => {
                const hotel = establishments.find(e => e.id === id);
                if (!hotel) return null;
                return (
                  <img
                    key={id}
                    src={hotel.primary_image || "https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=100"}
                    alt={hotel.name}
                    className="w-7 h-7 rounded-full border-2 border-slate-900 object-cover shrink-0"
                    title={hotel.name}
                  />
                );
              })}
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => {
                localStorage.setItem("hdv_compare_list", "[]");
                setComparedIds([]);
                window.dispatchEvent(new Event("hdv_compare_updated"));
              }}
              className="text-white/60 hover:text-white text-xs font-bold px-3 py-1.5 rounded-full hover:bg-white/5 transition-all cursor-pointer"
            >
              Limpiar
            </button>
            <Link href="/comparar">
              <button className="btn-magenta-gradient text-xs font-black px-4 py-2 rounded-full cursor-pointer hover:scale-103 transition-transform shadow-md">
                Comparar
              </button>
            </Link>
          </div>
        </div>
      )}

    </div>
  );
}
