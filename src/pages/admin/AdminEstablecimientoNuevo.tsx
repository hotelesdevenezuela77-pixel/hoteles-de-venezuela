import { useState, useEffect, useRef, useMemo } from "react";
import { useAuth } from "@/lib/auth";
import { Link, useLocation, useRoute } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import {
  Building2, ArrowLeft, MapPin, Navigation, Plus, Trash2,
  Star, Image as ImageIcon, ExternalLink, Loader2, Upload,
  Sparkles, Wand2, Search, CheckCircle2, ChevronRight, ChevronLeft,
  FileText, ShieldCheck, Phone, Mail, Clock, DollarSign, Award, Compass,
  Heart, Mountain, Tent, Ship, Coffee, Utensils, Check, Bed, Users, Accessibility,
  Zap, Droplets, Ban, VolumeX, Eye, AlertTriangle, Lock, Car, Waves, Flame, Sun,
  Home, Edit3, Info, EyeOff, HelpCircle, ArrowUpSquare, Globe
} from "lucide-react";
import { fetchEstablishmentFromGoogleAi } from "@/lib/services/googleAiFillService";
import {
  MASTER_AMENITIES,
  PROPERTY_BUTTON_GROUPS,
  BUTTON_1_PROPERTY_TYPES,
  BUTTON_2_PROPERTY_TYPES,
  BUTTON_4_PROPERTY_TYPES,
  ROAD_TYPES_V10,
  CERTIFICATIONS_V10,
  STAR_CATEGORIES_DOCUMENT77,
  REGIONS_V10,
  POI_TYPES_V10,
  parseServicesList,
  getAmenityLabel,
  type AmenityItem
} from "@/lib/amenitiesList";
import { PropertyRegistrationSelectorModal } from "@/components/admin/PropertyRegistrationSelectorModal";

interface Category { id: number; name: string; }
interface Destination { id: number; name: string; }
interface PhotoEntry { url: string; isPrimary: boolean; }
interface PointOfInterest { id: string; category: string; name: string; distance: string; }

interface CustomRoomConfig {
  id: string;
  name: string;
  sizeM2: string;
  bedsSingle100: string;
  bedsDoubleKing200: string;
  bedsDoubleQueen180: string;
  bedsDoubleFull150: string;
  bunkBeds: string;
  bathType: "privado" | "compartido";
  sharedWithRooms: string;
  amenities: string[];
}

const PRICE_LEVELS = [
  { value: "economico", label: "Económico ($)" },
  { value: "moderado", label: "Moderado ($$)" },
  { value: "premium", label: "Premium ($$$)" },
  { value: "lujo", label: "Lujo ($$$$)" },
];

const VE_STATES = [
  "Amazonas", "Anzoátegui", "Apure", "Aragua", "Barinas", "Bolívar", "Carabobo", "Cojedes",
  "Delta Amacuro", "Distrito Capital", "Falcón", "Guárico", "Lara", "Mérida", "Miranda",
  "Monagas", "Nueva Esparta", "Portuguesa", "Sucre", "Táchira", "Trujillo", "Vargas",
  "Yaracuy", "Zulia",
];

const VAT_REGIMES = [
  "General 10% (Turismo e Internacional)",
  "General 16% (Venezuela)",
  "Exento de IVA",
  "IGIC en Canarias (Reducido)",
  "Régimen Simplificado / Monotributo"
];

export function AdminEstablecimientoNuevo() {
  const { user, profile, loading: authLoading } = useAuth();
  const [location, setLocation] = useLocation();
  const [match, params] = useRoute("/admin/establecimientos/:id/editar");
  const editId = match ? (params as any)?.id : null;
  const queryClient = useQueryClient();

  // Detectar grupo de botón desde query param (ej: ?btn=boton1 | boton2 | boton4)
  const searchParams = new URLSearchParams(window.location.search);
  const initialBtnParam = searchParams.get("btn") || "boton1";
  
  const [activeButtonGroup, setActiveButtonGroup] = useState<string>(initialBtnParam);
  const [showTypeSelectorModal, setShowTypeSelectorModal] = useState<boolean>(false);
  const [showGpsHelpModal, setShowGpsHelpModal] = useState<boolean>(false);
  const [currentSection, setCurrentSection] = useState<number>(1);

  useEffect(() => {
    const p = new URLSearchParams(window.location.search).get("btn");
    if (p && ["boton1", "boton2", "boton4"].includes(p)) {
      setActiveButtonGroup(p);
    }
  }, [location]);

  // Redirección si no es admin ni propietario autorizado
  useEffect(() => {
    if (!authLoading && (!user || (profile?.role !== "admin" && user?.email?.toLowerCase() !== "hotelesdevenezuela77@gmail.com"))) {
      setLocation("/hdv-acceso-llc2027");
    }
  }, [user, profile, authLoading]);

  // Consultar categorías y destinos
  const { data: categories = [], isLoading: catLoading } = useQuery<Category[]>({
    queryKey: ["admin-categories-list"],
    queryFn: async () => {
      try {
        const { data, error } = await supabase.from("categories").select("id, name").order("name");
        if (error) throw error;
        return data || [];
      } catch {
        const localCats = JSON.parse(localStorage.getItem("hdv_mock_categories") || "[]");
        return localCats;
      }
    }
  });

  const { data: destinations = [], isLoading: destLoading } = useQuery<Destination[]>({
    queryKey: ["admin-destinations-list"],
    queryFn: async () => {
      try {
        const { data, error } = await supabase.from("destinations").select("id, name").order("name");
        if (error) throw error;
        return data || [];
      } catch {
        const localDests = JSON.parse(localStorage.getItem("hdv_mock_destinations") || "[]");
        return localDests;
      }
    }
  });

  // =========================================================================
  // SECCIÓN 1: DATOS GENERALES / UBICACIÓN / LICENCIAS / CERTIFICACIONES / TAMAÑO
  // =========================================================================
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [propertyType, setPropertyType] = useState(() => {
    if (activeButtonGroup === "boton2") return "apartamentos";
    if (activeButtonGroup === "boton4") return "love_hotels";
    return "hoteles";
  });
  const [categoryId, setCategoryId] = useState("");
  const [destinationId, setDestinationId] = useState("");
  const [website, setWebsite] = useState("");
  const [description, setDescription] = useState("");
  const [yearBuilt, setYearBuilt] = useState("");
  const [yearRenovated, setYearRenovated] = useState("");

  // Dirección Desglosada
  const [roadType, setRoadType] = useState("AVENIDA");
  const [roadName, setRoadName] = useState("");
  const [roadNumber, setRoadNumber] = useState("");
  const [portal, setPortal] = useState("");
  const [block, setBlock] = useState("");
  const [staircase, setStaircase] = useState("");
  const [floor, setFloor] = useState("");
  const [door, setDoor] = useState("");
  const [state, setState] = useState("Distrito Capital");
  const [city, setCity] = useState("Caracas");
  const [postalCode, setPostalCode] = useState("");
  const [neighborhood, setNeighborhood] = useState("");
  const [region, setRegion] = useState("C00.4.1"); // Mar por defecto

  // Coordenadas GPS e Indicaciones
  const [latitude, setLatitude] = useState("");
  const [longitude, setLongitude] = useState("");
  const [accessDirections, setAccessDirections] = useState("");

  // Licencias, Categorización y Certificaciones
  const [licenseNumber, setLicenseNumber] = useState("");
  const [certifications, setCertifications] = useState<string[]>(["C00.2.2"]); // Sello Legal HDV marcado por defecto
  const [starRating, setStarRating] = useState<number>(3);
  const [legalDocs, setLegalDocs] = useState<string[]>([]);
  const [unitCount, setUnitCount] = useState("10"); // Unidades operativas o Habitaciones

  // =========================================================================
  // SECCIÓN 2: DATOS FISCALES Y DE FACTURACIÓN
  // =========================================================================
  const [fiscalBusinessName, setFiscalBusinessName] = useState("");
  const [fiscalHolderName, setFiscalHolderName] = useState("");
  const [fiscalTaxId, setFiscalTaxId] = useState("");
  const [fiscalRoadType, setFiscalRoadType] = useState("AVENIDA");
  const [fiscalRoadName, setFiscalRoadName] = useState("");
  const [fiscalRoadNumber, setFiscalRoadNumber] = useState("");
  const [fiscalPortal, setFiscalPortal] = useState("");
  const [fiscalBlock, setFiscalBlock] = useState("");
  const [fiscalStaircase, setFiscalStaircase] = useState("");
  const [fiscalFloor, setFiscalFloor] = useState("");
  const [fiscalDoor, setFiscalDoor] = useState("");
  const [fiscalState, setFiscalState] = useState("Distrito Capital");
  const [fiscalCity, setFiscalCity] = useState("Caracas");
  const [fiscalPostalCode, setFiscalPostalCode] = useState("");
  const [billingEmail, setBillingEmail] = useState("");
  const [vatRegime, setVatRegime] = useState("General 10% (Turismo e Internacional)");

  // =========================================================================
  // SECCIÓN 3: CONTACTO OPERATIVO
  // =========================================================================
  // 1. Contacto con HDV
  const [hdvContactName, setHdvContactName] = useState("");
  const [hdvContactRole, setHdvContactRole] = useState("Gerente General");
  const [hdvPhone, setHdvPhone] = useState("");
  const [hdvHoursFrom, setHdvHoursFrom] = useState("08:00");
  const [hdvHoursTo, setHdvHoursTo] = useState("18:00");
  const [hdvEmail, setHdvEmail] = useState("");
  const [hdvWhatsapp, setHdvWhatsapp] = useState("");

  // 2. Contacto con Clientes
  const [clientContactName, setClientContactName] = useState("");
  const [clientContactRole, setClientContactRole] = useState("Recepción & Reservas");
  const [clientEmergencyPhone, setClientEmergencyPhone] = useState("");
  const [clientIs24Hours, setClientIs24Hours] = useState(true);
  const [clientHoursFrom, setClientHoursFrom] = useState("07:00");
  const [clientHoursTo, setClientHoursTo] = useState("23:00");
  const [clientReservationsEmail, setClientReservationsEmail] = useState("");
  const [clientWhatsapp, setClientWhatsapp] = useState("");

  // =========================================================================
  // SECCIÓN 4 A 6 / 8: AMENIDADES Y CATÁLOGO DOCUMENTO 77 V.10
  // =========================================================================
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [priceLevel, setPriceLevel] = useState("moderado");

  // Políticas Específicas
  const [checkInFrom, setCheckInFrom] = useState("14:00");
  const [checkInTo, setCheckInTo] = useState("20:00");
  const [checkOutFrom, setCheckOutFrom] = useState("08:00");
  const [checkOutTo, setCheckOutTo] = useState("12:00");
  const [lateCheckOutTo, setLateCheckOutTo] = useState("14:00");
  const [petPolicy, setPetPolicy] = useState("gratis"); // gratis | suplemento | camas | no_admiten
  const [petFeePrice, setPetFeePrice] = useState("");
  const [parkingCoveredPrice, setParkingCoveredPrice] = useState("");
  const [parkingUncoveredPrice, setParkingUncoveredPrice] = useState("");
  const [quietHoursFrom, setQuietHoursFrom] = useState("23:00");
  const [quietHoursTo, setQuietHoursTo] = useState("08:00");
  const [curfewHour, setCurfewHour] = useState("00:00");
  const [minAgeAdmission, setMinAgeAdmission] = useState("18");
  const [childAdultAge, setChildAdultAge] = useState("12");

  // =========================================================================
  // SECCIÓN 7 ESPECIAL (BOTÓN 2): CONFIGURACIÓN DE HABITACIONES Y BAÑOS
  // =========================================================================
  const [roomConfigMode, setRoomConfigMode] = useState<"same" | "individual">("same");
  // Para modo "Mismas amenidades"
  const [globalRoomSizeM2, setGlobalRoomSizeM2] = useState("28");
  const [globalBedsSingle100, setGlobalBedsSingle100] = useState("0");
  const [globalBedsDoubleKing200, setGlobalBedsDoubleKing200] = useState("1");
  const [globalBedsDoubleQueen180, setGlobalBedsDoubleQueen180] = useState("0");
  const [globalBedsDoubleFull150, setGlobalBedsDoubleFull150] = useState("0");
  const [globalBunkBeds, setGlobalBunkBeds] = useState("0");
  const [globalPrivateBathCount, setGlobalPrivateBathCount] = useState("1");
  const [globalSharedBathCount, setGlobalSharedBathCount] = useState("0");

  // Para modo "Configurar individualmente cada habitación"
  const [customRooms, setCustomRooms] = useState<CustomRoomConfig[]>([
    {
      id: "room-1",
      name: "Habitación 1 / Suite Principal",
      sizeM2: "32",
      bedsSingle100: "0",
      bedsDoubleKing200: "1",
      bedsDoubleQueen180: "0",
      bedsDoubleFull150: "0",
      bunkBeds: "0",
      bathType: "privado",
      sharedWithRooms: "",
      amenities: ["ropa_cama", "armario", "aire_acondicionado", "tv_pantalla_plana", "toallas_bano", "secador_pelo"]
    }
  ]);

  // Formulario temporal de nueva habitación individual
  const [editingRoomId, setEditingRoomId] = useState<string | null>(null);
  const [tempRoomName, setTempRoomName] = useState("");
  const [tempRoomM2, setTempRoomM2] = useState("25");
  const [tempSingleBeds, setTempSingleBeds] = useState("0");
  const [tempKingBeds, setTempKingBeds] = useState("1");
  const [tempQueenBeds, setTempQueenBeds] = useState("0");
  const [tempFullBeds, setTempFullBeds] = useState("0");
  const [tempBunkBeds, setTempBunkBeds] = useState("0");
  const [tempBathType, setTempBathType] = useState<"privado" | "compartido">("privado");
  const [tempSharedWith, setTempSharedWith] = useState("");
  const [tempRoomAmenities, setTempRoomAmenities] = useState<string[]>(["ropa_cama", "aire_acondicionado", "tv_pantalla_plana"]);
  const [showRoomModal, setShowRoomModal] = useState(false);

  // =========================================================================
  // PUNTOS DE INTERÉS DINÁMICOS (C00.5)
  // =========================================================================
  const [pointsOfInterest, setPointsOfInterest] = useState<PointOfInterest[]>([
    { id: "1", category: "C00.5.1.3", name: "Playa Principal / Bahía", distance: "300 m (4 min a pie)" },
    { id: "2", category: "C00.5.1.1", name: "Restaurantes y Zona Gastronómica", distance: "500 m" }
  ]);
  const [newPoiCat, setNewPoiCat] = useState("C00.5.1.1");
  const [newPoiName, setNewPoiName] = useState("");
  const [newPoiDistance, setNewPoiDistance] = useState("");

  // FOTOS Y MEDIOS
  const [photos, setPhotos] = useState<PhotoEntry[]>([]);
  const [photoUrl, setPhotoUrl] = useState("");
  const photoInputRef = useRef<HTMLInputElement>(null);

  const [gpsLoading, setGpsLoading] = useState(false);
  const [gpsError, setGpsError] = useState("");
  const [toastMessage, setToastMessage] = useState("");

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(""), 4500);
  };

  // Google AI Fill
  const [aiQuery, setAiQuery] = useState("");
  const [aiLoading, setAiLoading] = useState(false);

  // Configurar Secciones dinámicas según el Botón
  const sectionsConfig = useMemo(() => {
    if (activeButtonGroup === "boton2") {
      return [
        { id: 1, label: "Datos Generales & Ubicación" },
        { id: 2, label: "Datos Fiscales" },
        { id: 3, label: "Contacto Operativo" },
        { id: 4, label: "Instalaciones & Comunes" },
        { id: 5, label: "Servicios & Experiencias" },
        { id: 6, label: "Políticas & Gestión" },
        { id: 7, label: "Distribución de Habitaciones" },
        { id: 8, label: "Específicos Montaña / Esquí" },
        { id: 9, label: "Lugares de Interés & Galería" }
      ];
    } else if (activeButtonGroup === "boton4") {
      return [
        { id: 1, label: "Datos Generales & Ubicación" },
        { id: 2, label: "Datos Fiscales" },
        { id: 3, label: "Contacto Operativo" },
        { id: 4, label: "Instalaciones & Comunes" },
        { id: 5, label: "Servicios & Experiencias" },
        { id: 6, label: "Políticas & Privacidad" },
        { id: 7, label: "Específicos Love Hotels" },
        { id: 8, label: "Lugares de Interés & Galería" }
      ];
    } else {
      // Botón 1 (Por defecto)
      return [
        { id: 1, label: "Datos Generales & Ubicación" },
        { id: 2, label: "Datos Fiscales" },
        { id: 3, label: "Contacto Operativo" },
        { id: 4, label: "Zonas Comunes & Comodidades" },
        { id: 5, label: "Servicios & Experiencias" },
        { id: 6, label: "Gestión & Políticas" },
        { id: 7, label: "Lugares de Interés & Galería" }
      ];
    }
  }, [activeButtonGroup]);

  const totalSections = sectionsConfig.length;

  const autoSlug = (val: string) =>
    val.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)+/g, "");

  // Copiar dirección de la propiedad a fiscal
  const copyPropertyAddressToFiscal = () => {
    setFiscalRoadType(roadType);
    setFiscalRoadName(roadName);
    setFiscalRoadNumber(roadNumber);
    setFiscalPortal(portal);
    setFiscalBlock(block);
    setFiscalStaircase(staircase);
    setFiscalFloor(floor);
    setFiscalDoor(door);
    setFiscalState(state);
    setFiscalCity(city);
    setFiscalPostalCode(postalCode);
    triggerToast("📋 Dirección de la propiedad copiada a datos fiscales.");
  };

  // Copiar contacto de HDV a clientes
  const copyHdvContactToClients = () => {
    setClientContactName(hdvContactName);
    setClientContactRole(hdvContactRole);
    setClientEmergencyPhone(hdvPhone);
    setClientReservationsEmail(hdvEmail);
    setClientWhatsapp(hdvWhatsapp);
    triggerToast("📋 Contacto HDV copiado a atención al cliente.");
  };

  // Cargar datos en modo edición
  const { data: establishment, isLoading: estLoading } = useQuery({
    queryKey: ["admin-establishment", editId],
    queryFn: async () => {
      if (!editId) return null;
      const numericId = parseInt(editId);
      if (isNaN(numericId)) throw new Error("ID inválido");

      const { data, error } = await supabase
        .from("establishments")
        .select(`*, establishment_images (*)`)
        .eq("id", numericId)
        .maybeSingle();

      if (error) throw error;
      return data;
    },
    enabled: !!editId,
  });

  useEffect(() => {
    if (establishment) {
      setName(establishment.name || "");
      setSlug(establishment.slug || "");
      setCategoryId(establishment.category_id ? String(establishment.category_id) : "");
      setDestinationId(establishment.destination_id ? String(establishment.destination_id) : "");
      setCity(establishment.city || "Caracas");
      setState(establishment.state || "Distrito Capital");
      setHdvPhone(establishment.phone || "");
      setClientEmergencyPhone(establishment.phone || "");
      setHdvWhatsapp(establishment.whatsapp || "");
      setClientWhatsapp(establishment.whatsapp || "");
      setHdvEmail(establishment.email || "");
      setClientReservationsEmail(establishment.email || "");
      setBillingEmail(establishment.email || "");
      setWebsite(establishment.website || "");
      setPriceLevel(establishment.price_level || "moderado");
      setDescription(establishment.description || "");
      setLatitude(establishment.latitude ? String(establishment.latitude) : "");
      setLongitude(establishment.longitude ? String(establishment.longitude) : "");

      if (establishment.services) {
        setSelectedServices(parseServicesList(establishment.services));
      }

      try {
        if (establishment?.establishment_images && Array.isArray(establishment.establishment_images)) {
          const sortedImgs = [...establishment.establishment_images].sort(
            (a, b) => (a.sort_order || 0) - (b.sort_order || 0)
          );
          setPhotos(sortedImgs.map((img: any) => ({
            url: img.image_url,
            isPrimary: !!img.is_primary
          })));
        }
      } catch (err) {
        console.error("Fallo en mapeo de fotos:", err);
      }
    }
  }, [establishment]);

  // Manejo de autocompletar con IA
  const handleAiAutoFill = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!aiQuery.trim()) {
      triggerToast("⚠️ Escribe el nombre de un hotel o posada para buscar.");
      return;
    }

    setAiLoading(true);
    triggerToast("🔍 Consultando Google AI y datos turísticos oficiales...");

    try {
      const data = await fetchEstablishmentFromGoogleAi(aiQuery);

      setName(data.name || aiQuery);
      setSlug(autoSlug(data.name || aiQuery));
      if (data.city) setCity(data.city);
      if (data.state && VE_STATES.includes(data.state)) setState(data.state);
      if (data.phone) {
        setHdvPhone(data.phone);
        setClientEmergencyPhone(data.phone);
      }
      if (data.whatsapp) {
        setHdvWhatsapp(data.whatsapp);
        setClientWhatsapp(data.whatsapp);
      }
      if (data.email) {
        setHdvEmail(data.email);
        setClientReservationsEmail(data.email);
        setBillingEmail(data.email);
      }
      if (data.website) setWebsite(data.website);
      if (data.price_level) setPriceLevel(data.price_level);
      if (data.description) setDescription(data.description.slice(0, 500));
      if (data.latitude) setLatitude(data.latitude);
      if (data.longitude) setLongitude(data.longitude);
      if (data.services && Array.isArray(data.services) && data.services.length > 0) {
        setSelectedServices(prev => Array.from(new Set([...prev, ...data.services])));
      }

      triggerToast(`✨ ¡Formulario autocompletado con éxito para "${data.name}"!`);
    } catch (err: any) {
      triggerToast("⚠️ Error al autocompletar. Puedes rellenar los datos manualmente.");
    } finally {
      setAiLoading(false);
    }
  };

  const detectLocation = () => {
    if (!navigator.geolocation) { setGpsError("Tu dispositivo no soporta geolocalización"); return; }
    setGpsLoading(true); setGpsError("");
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLatitude(String(pos.coords.latitude));
        setLongitude(String(pos.coords.longitude));
        setGpsLoading(false);
        triggerToast(`📍 Ubicación detectada: ${pos.coords.latitude.toFixed(6)}, ${pos.coords.longitude.toFixed(6)}`);
      },
      () => {
        setGpsLoading(false);
        setGpsError("No se pudo obtener la ubicación física. Puedes introducirla manualmente.");
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  };

  const toggleAmenity = (key: string) => {
    setSelectedServices(prev => {
      const lower = key.toLowerCase();
      if (prev.includes(lower)) {
        return prev.filter(k => k !== lower);
      } else {
        return [...prev, lower];
      }
    });
  };

  const toggleCertification = (code: string) => {
    setCertifications(prev =>
      prev.includes(code) ? prev.filter(c => c !== code) : [...prev, code]
    );
  };

  const addPoi = () => {
    if (!newPoiName.trim()) return;
    const item: PointOfInterest = {
      id: Date.now().toString(),
      category: newPoiCat,
      name: newPoiName.trim(),
      distance: newPoiDistance.trim() || "Cercano"
    };
    setPointsOfInterest(prev => [...prev, item]);
    setNewPoiName("");
    setNewPoiDistance("");
    triggerToast("✅ Lugar de interés agregado.");
  };

  const removePoi = (id: string) => {
    setPointsOfInterest(prev => prev.filter(p => p.id !== id));
  };

  const addPhoto = () => {
    if (!photoUrl.trim()) return;
    setPhotos((prev) => [...prev, { url: photoUrl.trim(), isPrimary: prev.length === 0 }]);
    setPhotoUrl("");
  };

  const removePhoto = (index: number) => {
    setPhotos((prev) => {
      const next = prev.filter((_, idx) => idx !== index);
      if (prev[index]?.isPrimary && next.length > 0) {
        next[0].isPrimary = true;
      }
      return next;
    });
  };

  const setPrimaryPhoto = (i: number) => {
    setPhotos((prev) => prev.map((p, idx) => ({ ...p, isPrimary: idx === i })));
  };

  // Gestión de Habitaciones Personalizadas (Botón 2)
  const openNewRoomModal = () => {
    setEditingRoomId(null);
    setTempRoomName(`Habitación ${customRooms.length + 1}`);
    setTempRoomM2("25");
    setTempSingleBeds("0");
    setTempKingBeds("1");
    setTempQueenBeds("0");
    setTempFullBeds("0");
    setTempBunkBeds("0");
    setTempBathType("privado");
    setTempSharedWith("");
    setTempRoomAmenities(["ropa_cama", "aire_acondicionado", "tv_pantalla_plana"]);
    setShowRoomModal(true);
  };

  const openEditRoomModal = (room: CustomRoomConfig) => {
    setEditingRoomId(room.id);
    setTempRoomName(room.name);
    setTempRoomM2(room.sizeM2);
    setTempSingleBeds(room.bedsSingle100);
    setTempKingBeds(room.bedsDoubleKing200);
    setTempQueenBeds(room.bedsDoubleQueen180);
    setTempFullBeds(room.bedsDoubleFull150);
    setTempBunkBeds(room.bunkBeds);
    setTempBathType(room.bathType);
    setTempSharedWith(room.sharedWithRooms);
    setTempRoomAmenities(room.amenities);
    setShowRoomModal(true);
  };

  const saveRoomConfig = () => {
    if (!tempRoomName.trim()) {
      alert("Por favor indica la denominación de la habitación");
      return;
    }

    const roomData: CustomRoomConfig = {
      id: editingRoomId || `room-${Date.now()}`,
      name: tempRoomName.trim(),
      sizeM2: tempRoomM2,
      bedsSingle100: tempSingleBeds,
      bedsDoubleKing200: tempKingBeds,
      bedsDoubleQueen180: tempQueenBeds,
      bedsDoubleFull150: tempFullBeds,
      bunkBeds: tempBunkBeds,
      bathType: tempBathType,
      sharedWithRooms: tempBathType === "compartido" ? tempSharedWith : "",
      amenities: tempRoomAmenities
    };

    if (editingRoomId) {
      setCustomRooms(prev => prev.map(r => r.id === editingRoomId ? roomData : r));
    } else {
      setCustomRooms(prev => [...prev, roomData]);
    }

    setShowRoomModal(false);
    triggerToast("✅ Habitación guardada con éxito.");
  };

  const removeCustomRoom = (id: string) => {
    setCustomRooms(prev => prev.filter(r => r.id !== id));
  };

  // Mutación para guardar en Supabase
  const saveMutation = useMutation({
    mutationFn: async () => {
      if (!name.trim()) {
        throw new Error("El Nombre comercial de la propiedad es obligatorio.");
      }

      setToastMessage("Sincronizando información con Documento 77 V.10...");
      const fullAddress = `${roadType} ${roadName} ${roadNumber ? "Nº " + roadNumber : ""}${portal ? ", Portal " + portal : ""}${block ? ", Blq. " + block : ""}${staircase ? ", Esc. " + staircase : ""}${floor ? ", Piso " + floor : ""}${door ? ", Pta. " + door : ""}${neighborhood ? ", " + neighborhood : ""}, ${city}, Edo. ${state}`.trim();

      const mergedServices = Array.from(new Set([
        ...selectedServices,
        ...certifications,
        `region_${region.toLowerCase().replace(/\./g, "_")}`
      ]));

      const payload: Record<string, any> = {
        name,
        slug: slug || autoSlug(name),
        category_id: categoryId ? parseInt(categoryId) : 1,
        destination_id: destinationId ? parseInt(destinationId) : null,
        city,
        state,
        address: fullAddress,
        phone: clientEmergencyPhone || hdvPhone,
        whatsapp: clientWhatsapp || hdvWhatsapp,
        email: clientReservationsEmail || hdvEmail || billingEmail,
        website,
        price_level: priceLevel,
        description: description.slice(0, 500),
        latitude: latitude ? parseFloat(latitude) : null,
        longitude: longitude ? parseFloat(longitude) : null,
        services: JSON.stringify(mergedServices),
        status: "approved"
      };

      let establishmentId: number;

      if (editId) {
        establishmentId = parseInt(editId);
        const { error } = await supabase
          .from("establishments")
          .update(payload)
          .eq("id", establishmentId);

        if (error) throw error;
        await supabase.from("establishment_images").delete().eq("establishment_id", establishmentId);
      } else {
        const { data, error } = await supabase
          .from("establishments")
          .insert({
            ...payload,
            has_reservations_enabled: false,
            created_at: new Date().toISOString()
          })
          .select("id")
          .single();

        if (error) throw error;
        if (!data?.id) throw new Error("No se obtuvo el ID del nuevo establecimiento.");
        establishmentId = data.id;
      }

      // Guardar puntos de interés y habitaciones en almacenamiento extendido
      localStorage.setItem(`hdv_poi_v10_${establishmentId}`, JSON.stringify(pointsOfInterest));
      if (activeButtonGroup === "boton2") {
        localStorage.setItem(`hdv_rooms_v10_${establishmentId}`, JSON.stringify({
          mode: roomConfigMode,
          global: {
            sizeM2: globalRoomSizeM2,
            bedsSingle: globalBedsSingle100,
            bedsKing: globalBedsDoubleKing200,
            bedsQueen: globalBedsDoubleQueen180,
            bedsFull: globalBedsDoubleFull150,
            bunkBeds: globalBunkBeds,
            privateBaths: globalPrivateBathCount,
            sharedBaths: globalSharedBathCount
          },
          customRooms
        }));
      }

      if (photos.length > 0) {
        const insertPayload = photos.map((p, i) => ({
          establishment_id: establishmentId,
          image_url: p.url,
          is_primary: p.isPrimary,
          sort_order: i
        }));

        const { error: imgErr } = await supabase
          .from("establishment_images")
          .insert(insertPayload);

        if (imgErr) throw imgErr;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-establishments"] });
      triggerToast("🎉 ¡Establecimiento registrado con éxito bajo Documento 77 V.10!");
      setTimeout(() => {
        setLocation("/admin/establecimientos");
      }, 1000);
    },
    onError: (err: any) => {
      console.error("Error al guardar:", err);
      alert(`⚠️ Error en Supabase:\n${err.message || "Revisa la consola"}`);
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    saveMutation.mutate();
  };

  const busy = saveMutation.isPending || catLoading || destLoading || estLoading;

  if (authLoading || (editId && estLoading)) {
    return (
      <div className="min-h-screen bg-[#0e011f] flex flex-col items-center justify-center gap-3 text-white">
        <Loader2 className="w-8 h-8 animate-spin text-[#00C8D4]" />
        <span className="text-sm font-semibold">Cargando Asistente Documento 77 V.10...</span>
      </div>
    );
  }

  // Helper para renderizar items de comodidades en tarjetas con checkboxes
  const renderAmenityCheckGrid = (items: AmenityItem[]) => {
    if (items.length === 0) return null;
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
        {items.map((amenity) => {
          const isChecked = selectedServices.includes(amenity.key.toLowerCase());
          return (
            <label
              key={amenity.key}
              onClick={(e) => {
                e.preventDefault();
                toggleAmenity(amenity.key);
              }}
              className={`flex items-start gap-3 p-3 rounded-xl border text-left cursor-pointer transition-all ${
                isChecked
                  ? "bg-cyan-500/10 border-[#00C8D4] text-white shadow-xs"
                  : "bg-slate-800/60 border-slate-700 text-slate-300 hover:bg-slate-800 hover:border-slate-600"
              }`}
            >
              <div
                className={`w-5 h-5 rounded-md flex items-center justify-center shrink-0 mt-0.5 transition-all ${
                  isChecked
                    ? "bg-[#00C8D4] text-[#0e011f]"
                    : "border border-slate-500 bg-slate-700/50"
                }`}
              >
                {isChecked && <Check className="w-3.5 h-3.5 stroke-[3]" />}
              </div>
              <div className="flex-1 min-w-0">
                <span className="text-xs font-semibold leading-tight block">
                  {amenity.label}
                </span>
                <span className="text-[10px] text-slate-400 font-mono block mt-0.5">
                  {amenity.code}
                </span>
              </div>
            </label>
          );
        })}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-[#0e011f] text-white font-sans py-8 px-4 sm:px-6 relative">
      
      {/* Modal Selector de Tipo de Propiedad (Los 6 Botones) */}
      <PropertyRegistrationSelectorModal
        isOpen={showTypeSelectorModal}
        onClose={() => setShowTypeSelectorModal(false)}
        onSelectGroup={(gid) => {
          setActiveButtonGroup(gid);
          setCurrentSection(1);
          setShowTypeSelectorModal(false);
          triggerToast(`Cambiado a Asistente ${gid.toUpperCase()}`);
        }}
      />

      {/* Modal Guía GPS */}
      {showGpsHelpModal && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in">
          <div className="bg-slate-900 border border-[#00C8D4]/40 rounded-3xl p-6 sm:p-8 max-w-lg w-full text-left shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2 text-[#00C8D4]">
                <MapPin className="w-5 h-5" />
                <h3 className="font-bold text-base text-white">¿Cómo obtener las coordenadas GPS?</h3>
              </div>
              <button
                onClick={() => setShowGpsHelpModal(false)}
                className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-gray-400 hover:text-white"
              >
                ✕
              </button>
            </div>
            <div className="space-y-3 text-xs text-slate-300 leading-relaxed">
              <div className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-[#00C8D4] text-[#0e011f] font-black text-xs flex items-center justify-center shrink-0">1</span>
                <span>Abre <strong>Google Maps</strong> en tu navegador o teléfono y busca la ubicación exacta de tu propiedad.</span>
              </div>
              <div className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-[#00C8D4] text-[#0e011f] font-black text-xs flex items-center justify-center shrink-0">2</span>
                <span>Haz <strong>click derecho</strong> (o mantén pulsado en el móvil) sobre el punto exacto del mapa.</span>
              </div>
              <div className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-[#00C8D4] text-[#0e011f] font-black text-xs flex items-center justify-center shrink-0">3</span>
                <span>Verás dos números (ej: <strong>10.480594, -66.903606</strong>). El primer número es la <strong>Latitud</strong> y el segundo la <strong>Longitud</strong>.</span>
              </div>
              <div className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-[#00C8D4] text-[#0e011f] font-black text-xs flex items-center justify-center shrink-0">4</span>
                <span>Copia y pega cada número en sus respectivos campos. También puedes pulsar el botón <em>"Detectar Ubicación Actual"</em> si estás físicamente en el establecimiento.</span>
              </div>
            </div>
            <div className="pt-2 text-right">
              <button
                onClick={() => setShowGpsHelpModal(false)}
                className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-[#00C8D4] text-[#0e011f] hover:bg-[#00b0bb]"
              >
                Entendido
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Habitación Individual (Botón 2) */}
      {showRoomModal && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm overflow-y-auto">
          <div className="bg-slate-900 border border-[#FF0096]/40 rounded-3xl p-6 sm:p-8 max-w-2xl w-full text-left shadow-2xl space-y-5 my-8 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-[#FF0096]/20 text-[#FF0096] flex items-center justify-center">
                  <Bed className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-white">
                    {editingRoomId ? "Editar Habitación" : "+ Agregar Habitación Individual"}
                  </h3>
                  <p className="text-[11px] text-slate-400">Configuración personalizada de tamaño, camas y amenidades</p>
                </div>
              </div>
              <button
                onClick={() => setShowRoomModal(false)}
                className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-gray-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] uppercase font-black text-slate-300 tracking-wider mb-1">
                    Denominación (Número o Nombre) *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ej: Habitación 1 / Suite Deluxe"
                    value={tempRoomName}
                    onChange={(e) => setTempRoomName(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:ring-2 focus:ring-[#FF0096]/30 focus:border-[#FF0096]"
                  />
                </div>
                <div>
                  <label className="block text-[11px] uppercase font-black text-slate-300 tracking-wider mb-1">
                    Tamaño de la Habitación (m²)
                  </label>
                  <input
                    type="number"
                    placeholder="25"
                    value={tempRoomM2}
                    onChange={(e) => setTempRoomM2(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:ring-2 focus:ring-[#FF0096]/30 focus:border-[#FF0096]"
                  />
                </div>
              </div>

              {/* Camas */}
              <div className="bg-slate-800/60 p-4 rounded-2xl border border-slate-700 space-y-3">
                <span className="text-[11px] font-black uppercase text-[#00C8D4] tracking-wider block">
                  C01.3. Tamaño y Distribución de las Camas
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  <div>
                    <span className="text-[10px] text-slate-300 block mb-1">Individuales (100 cm)</span>
                    <input
                      type="number"
                      min="0"
                      value={tempSingleBeds}
                      onChange={(e) => setTempSingleBeds(e.target.value)}
                      className="w-full px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white"
                    />
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-300 block mb-1">King Size (200 cm)</span>
                    <input
                      type="number"
                      min="0"
                      value={tempKingBeds}
                      onChange={(e) => setTempKingBeds(e.target.value)}
                      className="w-full px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white"
                    />
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-300 block mb-1">Queen Size (180 cm)</span>
                    <input
                      type="number"
                      min="0"
                      value={tempQueenBeds}
                      onChange={(e) => setTempQueenBeds(e.target.value)}
                      className="w-full px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white"
                    />
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-300 block mb-1">Doble Full (150 cm)</span>
                    <input
                      type="number"
                      min="0"
                      value={tempFullBeds}
                      onChange={(e) => setTempFullBeds(e.target.value)}
                      className="w-full px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white"
                    />
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-300 block mb-1">Literas</span>
                    <input
                      type="number"
                      min="0"
                      value={tempBunkBeds}
                      onChange={(e) => setTempBunkBeds(e.target.value)}
                      className="w-full px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white"
                    />
                  </div>
                </div>
              </div>

              {/* Tipo de Baño */}
              <div className="bg-slate-800/60 p-4 rounded-2xl border border-slate-700 space-y-3">
                <span className="text-[11px] font-black uppercase text-[#FF0096] tracking-wider block">
                  Tipo de Baño de esta Habitación
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <label
                    onClick={() => setTempBathType("privado")}
                    className={`p-3 rounded-xl border flex items-center gap-2.5 cursor-pointer ${
                      tempBathType === "privado"
                        ? "bg-[#FF0096]/15 border-[#FF0096] text-white"
                        : "bg-slate-900 border-slate-700 text-slate-400"
                    }`}
                  >
                    <input
                      type="radio"
                      name="tempBathType"
                      checked={tempBathType === "privado"}
                      onChange={() => setTempBathType("privado")}
                      className="text-[#FF0096]"
                    />
                    <span className="text-xs font-bold">1. Baño Privado en Habitación</span>
                  </label>
                  <label
                    onClick={() => setTempBathType("compartido")}
                    className={`p-3 rounded-xl border flex items-center gap-2.5 cursor-pointer ${
                      tempBathType === "compartido"
                        ? "bg-[#00C8D4]/15 border-[#00C8D4] text-white"
                        : "bg-slate-900 border-slate-700 text-slate-400"
                    }`}
                  >
                    <input
                      type="radio"
                      name="tempBathType"
                      checked={tempBathType === "compartido"}
                      onChange={() => setTempBathType("compartido")}
                      className="text-[#00C8D4]"
                    />
                    <span className="text-xs font-bold">2. Baño Compartido</span>
                  </label>
                </div>

                {tempBathType === "compartido" && (
                  <div className="pt-2 animate-in fade-in">
                    <label className="block text-[10px] uppercase font-bold text-slate-300 mb-1">
                      Indicar qué habitaciones comparten este baño (Ej: Hab 1 y Hab 2):
                    </label>
                    <input
                      type="text"
                      placeholder="Concretar nombres o números de las habitaciones que comparten"
                      value={tempSharedWith}
                      onChange={(e) => setTempSharedWith(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white"
                    />
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setShowRoomModal(false)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={saveRoomConfig}
                className="px-6 py-2 rounded-xl text-xs font-bold text-white shadow-lg cursor-pointer"
                style={{ background: "linear-gradient(135deg, #FF0096 0%, #9B00CC 100%)" }}
              >
                Guardar Habitación
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-6xl mx-auto space-y-6">

        {/* Notificación Flotante */}
        {toastMessage && (
          <div className="fixed top-5 right-5 z-50 bg-[#00C8D4] text-[#0e011f] px-5 py-3 rounded-2xl shadow-2xl font-bold text-xs flex items-center gap-2 animate-bounce">
            <Sparkles className="w-4 h-4 shrink-0" />
            {toastMessage}
          </div>
        )}

        {/* Encabezado Superior */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-[#0e011f] via-[#1a0533] to-[#0e011f] border border-[#00C8D4]/30 p-6 rounded-3xl shadow-2xl">
          <div className="flex items-center gap-3.5">
            <Link
              href="/admin/establecimientos"
              className="w-10 h-10 rounded-2xl bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-all cursor-pointer shrink-0"
              title="Volver a la lista"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[10px] font-black uppercase tracking-widest text-[#00C8D4] bg-[#00C8D4]/15 border border-[#00C8D4]/30 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                  <Sparkles className="w-3 h-3" />
                  Doc 77 V.10 Oficial
                </span>
                <span className="text-xs font-black uppercase px-2.5 py-0.5 rounded-full text-white"
                  style={{
                    background: activeButtonGroup === "boton1" ? "#00C8D4" : activeButtonGroup === "boton2" ? "#FF0096" : "#E11D48"
                  }}
                >
                  {activeButtonGroup === "boton1" ? "Botón 1: Hoteles & Posadas" : activeButtonGroup === "boton2" ? "Botón 2: Casas & Villas" : "Botón 4: Love Hotels"}
                </span>
                <button
                  type="button"
                  onClick={() => setShowTypeSelectorModal(true)}
                  className="text-[11px] text-[#00C8D4] hover:underline font-bold ml-1 cursor-pointer flex items-center gap-1"
                >
                  <Edit3 className="w-3 h-3" />
                  Cambiar Modalidad
                </button>
              </div>
              <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight mt-1 font-serif">
                {editId ? `Editar: ${name || "Establecimiento"}` : "Registro Asistido de Establecimiento"}
              </h1>
            </div>
          </div>

          {/* Buscador Google AI para autocompletar */}
          {!editId && (
            <form onSubmit={handleAiAutoFill} className="flex items-center gap-2 bg-white/5 border border-white/15 p-1.5 rounded-2xl shrink-0">
              <input
                type="text"
                placeholder="Autocompletar con IA..."
                value={aiQuery}
                onChange={(e) => setAiQuery(e.target.value)}
                className="bg-transparent text-xs text-white placeholder-gray-400 px-3 py-1.5 focus:outline-none w-44 sm:w-56 font-medium"
              />
              <button
                type="submit"
                disabled={aiLoading}
                className="px-3.5 py-2 rounded-xl text-xs font-bold text-white transition-all flex items-center gap-1.5 shadow-md hover:scale-105 active:scale-95 disabled:opacity-50 cursor-pointer"
                style={{ background: "linear-gradient(135deg, #FF0096 0%, #9B00CC 100%)" }}
              >
                {aiLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Wand2 className="w-3.5 h-3.5" />}
                <span>Auto-Llenar</span>
              </button>
            </form>
          )}
        </div>

        {/* Barra de Progreso del Asistente (Stepper Wizard por Secciones) */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 shadow-xl">
          <div className="flex items-center justify-between gap-2 overflow-x-auto pb-2 scrollbar-thin">
            {sectionsConfig.map((sec) => {
              const isActive = currentSection === sec.id;
              const isPast = currentSection > sec.id;
              return (
                <button
                  key={sec.id}
                  type="button"
                  onClick={() => setCurrentSection(sec.id)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer shrink-0 ${
                    isActive
                      ? "bg-[#00C8D4] text-[#0e011f] shadow-lg scale-102"
                      : isPast
                      ? "bg-slate-800 text-slate-300 hover:bg-slate-750"
                      : "bg-slate-850 text-slate-500 hover:text-slate-400"
                  }`}
                >
                  <span
                    className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black ${
                      isActive
                        ? "bg-[#0e011f] text-[#00C8D4]"
                        : isPast
                        ? "bg-[#00C8D4]/20 text-[#00C8D4]"
                        : "bg-slate-700 text-slate-400"
                    }`}
                  >
                    {isPast ? "✓" : sec.id}
                  </span>
                  <span>{sec.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* FORMULARIO PRINCIPAL */}
        <form onSubmit={handleSubmit} className="space-y-6 text-left">
          
          {/* ================================================================= */}
          {/* SECCIÓN 1: DATOS GENERALES / UBICACIÓN / LICENCIAS / TAMAÑO */}
          {/* ================================================================= */}
          {currentSection === 1 && (
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6 shadow-xl animate-in fade-in">
              <div className="flex items-center gap-3 pb-4 border-b border-slate-800">
                <div className="w-10 h-10 rounded-2xl bg-[#00C8D4]/15 text-[#00C8D4] flex items-center justify-center font-black">
                  1
                </div>
                <div>
                  <h2 className="text-lg font-black text-white font-serif">
                    Sección 1: Datos Generales / Ubicación / Licencias & Categorización / Tamaño
                  </h2>
                  <p className="text-xs text-slate-400">
                    Información comercial, localización geográfica precisa y certificaciones oficiales.
                  </p>
                </div>
              </div>

              {/* Sub-bloque: Datos Generales */}
              <div className="space-y-4">
                <span className="text-xs font-black uppercase text-[#00C8D4] tracking-wider block">
                  Datos Generales de la Propiedad
                </span>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div className="lg:col-span-2">
                    <label className="block text-[11px] uppercase font-bold text-slate-300 tracking-wider mb-1">
                      Nombre Comercial de la Propiedad *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Ej: Gran Meliá Caracas / Posada Bequevé"
                      value={name}
                      onChange={(e) => {
                        setName(e.target.value);
                        if (!editId) setSlug(autoSlug(e.target.value));
                      }}
                      className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:ring-2 focus:ring-[#00C8D4]/30 focus:border-[#00C8D4]"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] uppercase font-bold text-slate-300 tracking-wider mb-1">
                      C00.1. Tipo de Establecimiento *
                    </label>
                    <select
                      required
                      value={propertyType}
                      onChange={(e) => setPropertyType(e.target.value)}
                      className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:ring-2 focus:ring-[#00C8D4]/30 focus:border-[#00C8D4] cursor-pointer"
                    >
                      {activeButtonGroup === "boton1" && BUTTON_1_PROPERTY_TYPES.map(t => (
                        <option key={t.id} value={t.id}>{t.code} - {t.label}</option>
                      ))}
                      {activeButtonGroup === "boton2" && BUTTON_2_PROPERTY_TYPES.map(t => (
                        <option key={t.id} value={t.id}>{t.code} - {t.label}</option>
                      ))}
                      {activeButtonGroup === "boton4" && BUTTON_4_PROPERTY_TYPES.map(t => (
                        <option key={t.id} value={t.id}>{t.code} - {t.label}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] uppercase font-bold text-slate-300 tracking-wider mb-1">
                      Sitio Web / Enlace a Red Social
                    </label>
                    <div className="relative">
                      <Globe className="absolute left-3 top-3 w-4 h-4 text-slate-500" />
                      <input
                        type="text"
                        placeholder="https://posada.com o instagram"
                        value={website}
                        onChange={(e) => setWebsite(e.target.value)}
                        className="w-full pl-9 pr-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:ring-2 focus:ring-[#00C8D4]/30 focus:border-[#00C8D4]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] uppercase font-bold text-slate-300 tracking-wider mb-1">
                      Año de Construcción
                    </label>
                    <input
                      type="number"
                      placeholder="Ej: 2010"
                      value={yearBuilt}
                      onChange={(e) => setYearBuilt(e.target.value)}
                      className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] uppercase font-bold text-slate-300 tracking-wider mb-1">
                      Año de Última Reforma
                    </label>
                    <input
                      type="number"
                      placeholder="Ej: 2023"
                      value={yearRenovated}
                      onChange={(e) => setYearRenovated(e.target.value)}
                      className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white"
                    />
                  </div>

                  <div className="sm:col-span-2 lg:col-span-3">
                    <div className="flex items-center justify-between mb-1">
                      <label className="block text-[11px] uppercase font-bold text-slate-300 tracking-wider">
                        Descripción o Reseña Comercial (Máximo 500 caracteres)
                      </label>
                      <span className={`text-[10px] font-bold ${description.length > 500 ? "text-rose-400" : "text-slate-400"}`}>
                        {description.length}/500
                      </span>
                    </div>
                    <textarea
                      rows={3}
                      maxLength={500}
                      placeholder="Describe los aspectos clave, ambientación y servicios principales de tu negocio..."
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:ring-2 focus:ring-[#00C8D4]/30 focus:border-[#00C8D4] resize-none"
                    />
                  </div>
                </div>
              </div>

              {/* Sub-bloque: Ubicación Desglosada con 85+ Tipos de Vía */}
              <div className="space-y-4 pt-4 border-t border-slate-800">
                <span className="text-xs font-black uppercase text-[#FF0096] tracking-wider block">
                  Ubicación & Dirección de la Propiedad (Doc 77 V.10)
                </span>

                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                  <div className="col-span-2 sm:col-span-1">
                    <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">
                      Tipo de Vía (Doc 77 V10) *
                    </label>
                    <select
                      value={roadType}
                      onChange={(e) => setRoadType(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white cursor-pointer"
                    >
                      {ROAD_TYPES_V10.map(rt => (
                        <option key={rt} value={rt}>{rt}</option>
                      ))}
                    </select>
                  </div>

                  <div className="col-span-2 sm:col-span-2">
                    <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">
                      Nombre de la Vía *
                    </label>
                    <input
                      type="text"
                      placeholder="Ej: Francisco de Miranda"
                      value={roadName}
                      onChange={(e) => setRoadName(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Número</label>
                    <input
                      type="text"
                      placeholder="S/N o 123"
                      value={roadNumber}
                      onChange={(e) => setRoadNumber(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Portal</label>
                    <input
                      type="text"
                      placeholder="Portal A"
                      value={portal}
                      onChange={(e) => setPortal(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Bloque</label>
                    <input
                      type="text"
                      placeholder="Bloque 3"
                      value={block}
                      onChange={(e) => setBlock(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Escalera</label>
                    <input
                      type="text"
                      placeholder="Esc. 2"
                      value={staircase}
                      onChange={(e) => setStaircase(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Piso</label>
                    <input
                      type="text"
                      placeholder="PB / Piso 4"
                      value={floor}
                      onChange={(e) => setFloor(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Puerta</label>
                    <input
                      type="text"
                      placeholder="Pta. B"
                      value={door}
                      onChange={(e) => setDoor(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Provincia (Estado)</label>
                    <select
                      value={state}
                      onChange={(e) => setState(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white cursor-pointer"
                    >
                      {VE_STATES.map(s => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Localidad (Ciudad)</label>
                    <input
                      type="text"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Código Postal</label>
                    <input
                      type="text"
                      placeholder="1060"
                      value={postalCode}
                      onChange={(e) => setPostalCode(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white"
                    />
                  </div>
                </div>

                {/* C00.4. REGIÓN */}
                <div className="pt-2">
                  <label className="block text-[11px] uppercase font-black text-slate-300 tracking-wider mb-2">
                    C00.4. Región Geográfica Oficial
                  </label>
                  <div className="grid grid-cols-3 sm:grid-cols-5 lg:grid-cols-9 gap-2">
                    {REGIONS_V10.map(r => (
                      <button
                        key={r.id}
                        type="button"
                        onClick={() => setRegion(r.code)}
                        className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer ${
                          region === r.code
                            ? "bg-[#00C8D4]/20 border-[#00C8D4] text-white shadow-xs font-bold"
                            : "bg-slate-800/60 border-slate-700 text-slate-400 hover:text-white"
                        }`}
                      >
                        <span className="text-[10px] font-mono text-slate-500 block">{r.code}</span>
                        <span className="text-xs">{r.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Coordenadas GPS & Explicación */}
                <div className="bg-slate-800/60 p-4 rounded-2xl border border-slate-700 space-y-3">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <span className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                      <MapPin className="w-4 h-4 text-[#00C8D4]" />
                      Coordenadas GPS (Latitud & Longitud para Google Maps)
                    </span>
                    <button
                      type="button"
                      onClick={() => setShowGpsHelpModal(true)}
                      className="text-[11px] font-bold text-[#00C8D4] hover:underline flex items-center gap-1"
                    >
                      <HelpCircle className="w-3.5 h-3.5" />
                      ¿Cómo obtenerlas?
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Latitud</label>
                      <input
                        type="text"
                        placeholder="Ej: 10.480594"
                        value={latitude}
                        onChange={(e) => setLatitude(e.target.value)}
                        className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Longitud</label>
                      <input
                        type="text"
                        placeholder="Ej: -66.903606"
                        value={longitude}
                        onChange={(e) => setLongitude(e.target.value)}
                        className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white font-mono"
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between flex-wrap gap-2 pt-1">
                    <button
                      type="button"
                      onClick={detectLocation}
                      disabled={gpsLoading}
                      className="px-3.5 py-1.5 rounded-lg text-xs font-bold bg-[#00C8D4]/15 hover:bg-[#00C8D4]/25 text-[#00C8D4] border border-[#00C8D4]/30 transition-all flex items-center gap-1.5 cursor-pointer"
                    >
                      {gpsLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Navigation className="w-3.5 h-3.5" />}
                      <span>Detectar Ubicación Actual</span>
                    </button>
                    {gpsError && <span className="text-xs text-rose-400">{gpsError}</span>}
                  </div>

                  <div>
                    <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">
                      Indicaciones de Acceso
                    </label>
                    <input
                      type="text"
                      placeholder="Ej: Acceso por carretera N-340 km 12, desvío derecha hacia la colina"
                      value={accessDirections}
                      onChange={(e) => setAccessDirections(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white"
                    />
                  </div>
                </div>
              </div>

              {/* Sub-bloque: Licencias, 11 Certificaciones & Estrellas */}
              <div className="space-y-4 pt-4 border-t border-slate-800">
                <span className="text-xs font-black uppercase text-[#00C8D4] tracking-wider block">
                  Licencias, Categorización y Certificaciones Oficiales
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] uppercase font-bold text-slate-300 tracking-wider mb-1">
                      Número de Licencia Turística / Registro
                    </label>
                    <input
                      type="text"
                      placeholder="Ej: RNT-VE-2024-8891"
                      value={licenseNumber}
                      onChange={(e) => setLicenseNumber(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] uppercase font-bold text-slate-300 tracking-wider mb-1">
                      C00.3. Categoría del Establecimiento (Estrellas)
                    </label>
                    <div className="flex items-center gap-2">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setStarRating(star)}
                          className={`flex-1 py-2 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1 cursor-pointer ${
                            starRating === star
                              ? "bg-amber-400 text-slate-900 shadow-md font-bold"
                              : "bg-slate-800 text-slate-400 hover:text-white"
                          }`}
                        >
                          <Star className="w-3.5 h-3.5 fill-current" />
                          <span>{star}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* 11 Certificaciones Oficiales V.10 */}
                <div className="space-y-2 pt-2">
                  <label className="block text-[11px] uppercase font-black text-slate-300 tracking-wider">
                    C00.2. Certificaciones Oficiales (11 Sellos Disponibles)
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                    {CERTIFICATIONS_V10.map((cert) => {
                      const isSelected = certifications.includes(cert.code);
                      return (
                        <button
                          key={cert.id}
                          type="button"
                          onClick={() => toggleCertification(cert.code)}
                          className={`p-3 rounded-xl border text-left transition-all flex items-start gap-2.5 cursor-pointer ${
                            isSelected
                              ? "bg-slate-800 border-[#00C8D4] text-white ring-1 ring-[#00C8D4]"
                              : "bg-slate-850 border-slate-750 text-slate-400 hover:bg-slate-800 hover:text-slate-200"
                          }`}
                        >
                          <div
                            className={`w-4 h-4 rounded-md flex items-center justify-center shrink-0 mt-0.5 ${
                              isSelected ? "bg-[#00C8D4] text-[#0e011f]" : "border border-slate-600 bg-slate-700/50"
                            }`}
                          >
                            {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                          </div>
                          <div>
                            <span className="text-xs font-bold block leading-tight">{cert.label}</span>
                            <span className="text-[10px] text-slate-500 font-mono block mt-0.5">{cert.code}</span>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Tamaño */}
                <div className="pt-2">
                  <label className="block text-[11px] uppercase font-bold text-slate-300 tracking-wider mb-1">
                    {activeButtonGroup === "boton2" ? "Tamaño (Número total de habitaciones)" : "Tamaño (Número de unidades operativas)"} *
                  </label>
                  <input
                    type="number"
                    min="1"
                    required
                    placeholder="Ej: 12"
                    value={unitCount}
                    onChange={(e) => setUnitCount(e.target.value)}
                    className="w-full sm:w-60 px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white"
                  />
                </div>
              </div>
            </div>
          )}

          {/* ================================================================= */}
          {/* SECCIÓN 2: DATOS FISCALES Y DE FACTURACIÓN */}
          {/* ================================================================= */}
          {currentSection === 2 && (
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6 shadow-xl animate-in fade-in">
              <div className="flex items-center justify-between pb-4 border-b border-slate-800 flex-wrap gap-2">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-[#FF0096]/15 text-[#FF0096] flex items-center justify-center font-black">
                    2
                  </div>
                  <div>
                    <h2 className="text-lg font-black text-white font-serif">
                      Sección 2: Datos Fiscales y de Facturación
                    </h2>
                    <p className="text-xs text-slate-400">
                      Datos legales para emisión de comprobantes, facturas de comisiones y contratos.
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={copyPropertyAddressToFiscal}
                  className="px-3.5 py-2 rounded-xl text-xs font-bold text-[#00C8D4] bg-[#00C8D4]/10 hover:bg-[#00C8D4]/20 border border-[#00C8D4]/30 flex items-center gap-1.5 transition-all cursor-pointer"
                >
                  <span>📋 Copiar Dirección de la Propiedad</span>
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                  <label className="block text-[11px] uppercase font-bold text-slate-300 tracking-wider mb-1">
                    Razón Social
                  </label>
                  <input
                    type="text"
                    placeholder="Ej: Hostelería y Turismo S.L. / C.A."
                    value={fiscalBusinessName}
                    onChange={(e) => setFiscalBusinessName(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white"
                  />
                </div>

                <div>
                  <label className="block text-[11px] uppercase font-bold text-slate-300 tracking-wider mb-1">
                    Nombre del Titular
                  </label>
                  <input
                    type="text"
                    placeholder="Ej: Juan Pérez García"
                    value={fiscalHolderName}
                    onChange={(e) => setFiscalHolderName(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white"
                  />
                </div>

                <div>
                  <label className="block text-[11px] uppercase font-bold text-slate-300 tracking-wider mb-1">
                    NIF / CIF / RIF
                  </label>
                  <input
                    type="text"
                    placeholder="Ej: J-12345678-9"
                    value={fiscalTaxId}
                    onChange={(e) => setFiscalTaxId(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white"
                  />
                </div>

                <div className="col-span-1 sm:col-span-2 lg:col-span-3 pt-2">
                  <span className="text-xs font-bold text-[#00C8D4] block mb-2">Dirección Fiscal Completa</span>
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                    <div>
                      <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Tipo de Vía</label>
                      <select
                        value={fiscalRoadType}
                        onChange={(e) => setFiscalRoadType(e.target.value)}
                        className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white cursor-pointer"
                      >
                        {ROAD_TYPES_V10.map(rt => (
                          <option key={rt} value={rt}>{rt}</option>
                        ))}
                      </select>
                    </div>
                    <div className="col-span-2">
                      <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Nombre de la Vía</label>
                      <input
                        type="text"
                        value={fiscalRoadName}
                        onChange={(e) => setFiscalRoadName(e.target.value)}
                        className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Número</label>
                      <input
                        type="text"
                        value={fiscalRoadNumber}
                        onChange={(e) => setFiscalRoadNumber(e.target.value)}
                        className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Provincia</label>
                      <select
                        value={fiscalState}
                        onChange={(e) => setFiscalState(e.target.value)}
                        className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white"
                      >
                        {VE_STATES.map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Localidad</label>
                      <input
                        type="text"
                        value={fiscalCity}
                        onChange={(e) => setFiscalCity(e.target.value)}
                        className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Código Postal</label>
                      <input
                        type="text"
                        value={fiscalPostalCode}
                        onChange={(e) => setFiscalPostalCode(e.target.value)}
                        className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white"
                      />
                    </div>
                  </div>
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-[11px] uppercase font-bold text-slate-300 tracking-wider mb-1">
                    Email para Facturación
                  </label>
                  <input
                    type="email"
                    placeholder="administracion@hotel.com"
                    value={billingEmail}
                    onChange={(e) => setBillingEmail(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white"
                  />
                </div>

                {activeButtonGroup !== "boton2" && (
                  <div>
                    <label className="block text-[11px] uppercase font-bold text-slate-300 tracking-wider mb-1">
                      Régimen de IVA Aplicable
                    </label>
                    <select
                      value={vatRegime}
                      onChange={(e) => setVatRegime(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white cursor-pointer"
                    >
                      {VAT_REGIMES.map(v => <option key={v} value={v}>{v}</option>)}
                    </select>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ================================================================= */}
          {/* SECCIÓN 3: CONTACTO OPERATIVO */}
          {/* ================================================================= */}
          {currentSection === 3 && (
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6 shadow-xl animate-in fade-in">
              <div className="flex items-center gap-3 pb-4 border-b border-slate-800">
                <div className="w-10 h-10 rounded-2xl bg-[#00C8D4]/15 text-[#00C8D4] flex items-center justify-center font-black">
                  3
                </div>
                <div>
                  <h2 className="text-lg font-black text-white font-serif">
                    Sección 3: Contacto Operativo
                  </h2>
                  <p className="text-xs text-slate-400">
                    Canales de comunicación directa interna con HDV y canales oficiales para los clientes.
                  </p>
                </div>
              </div>

              {/* 1. Contacto con HDV */}
              <div className="space-y-4">
                <span className="text-xs font-black uppercase text-[#00C8D4] tracking-wider block">
                  1. Contacto Interno con HDV
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-[11px] uppercase font-bold text-slate-300 mb-1">Nombre y Apellidos *</label>
                    <input
                      type="text"
                      placeholder="Ej: Carlos Rodríguez"
                      value={hdvContactName}
                      onChange={(e) => setHdvContactName(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] uppercase font-bold text-slate-300 mb-1">Cargo</label>
                    <input
                      type="text"
                      placeholder="Ej: Gerente Operativo"
                      value={hdvContactRole}
                      onChange={(e) => setHdvContactRole(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] uppercase font-bold text-slate-300 mb-1">Teléfono</label>
                    <input
                      type="tel"
                      placeholder="+58 212 1234567"
                      value={hdvPhone}
                      onChange={(e) => setHdvPhone(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] uppercase font-bold text-slate-300 mb-1">Horario de Atención</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="time"
                        value={hdvHoursFrom}
                        onChange={(e) => setHdvHoursFrom(e.target.value)}
                        className="w-full px-2.5 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white"
                      />
                      <span className="text-xs text-slate-400">a</span>
                      <input
                        type="time"
                        value={hdvHoursTo}
                        onChange={(e) => setHdvHoursTo(e.target.value)}
                        className="w-full px-2.5 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] uppercase font-bold text-slate-300 mb-1">Email</label>
                    <input
                      type="email"
                      placeholder="contacto@hotel.com"
                      value={hdvEmail}
                      onChange={(e) => setHdvEmail(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] uppercase font-bold text-slate-300 mb-1">WhatsApp Directo</label>
                    <input
                      type="tel"
                      placeholder="+58 414 1234567"
                      value={hdvWhatsapp}
                      onChange={(e) => setHdvWhatsapp(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white"
                    />
                  </div>
                </div>
              </div>

              {/* 2. Contacto con Clientes */}
              <div className="space-y-4 pt-4 border-t border-slate-800">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <span className="text-xs font-black uppercase text-[#FF0096] tracking-wider block">
                    2. Contacto con Clientes (Público & Reservas)
                  </span>
                  <button
                    type="button"
                    onClick={copyHdvContactToClients}
                    className="px-3 py-1.5 rounded-lg text-xs font-bold text-[#FF0096] bg-[#FF0096]/10 hover:bg-[#FF0096]/20 border border-[#FF0096]/30 transition-all cursor-pointer"
                  >
                    <span>📋 Copiar Datos de Contacto HDV</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-[11px] uppercase font-bold text-slate-300 mb-1">Nombre y Apellidos</label>
                    <input
                      type="text"
                      placeholder="Ej: Atención al Huésped"
                      value={clientContactName}
                      onChange={(e) => setClientContactName(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] uppercase font-bold text-slate-300 mb-1">Cargo</label>
                    <input
                      type="text"
                      placeholder="Ej: Recepción 24h"
                      value={clientContactRole}
                      onChange={(e) => setClientContactRole(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] uppercase font-bold text-slate-300 mb-1">Teléfono Emergencias / Recepción</label>
                    <input
                      type="tel"
                      placeholder="+58 212 9876543"
                      value={clientEmergencyPhone}
                      onChange={(e) => setClientEmergencyPhone(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] uppercase font-bold text-slate-300 mb-1">Horario de Atención</label>
                    <div className="space-y-2">
                      <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-300">
                        <input
                          type="checkbox"
                          checked={clientIs24Hours}
                          onChange={(e) => setClientIs24Hours(e.target.checked)}
                          className="rounded text-[#00C8D4]"
                        />
                        <span className="font-bold">Atención 24 Horas</span>
                      </label>
                      {!clientIs24Hours && (
                        <div className="flex items-center gap-2">
                          <input
                            type="time"
                            value={clientHoursFrom}
                            onChange={(e) => setClientHoursFrom(e.target.value)}
                            className="w-full px-2 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-xs text-white"
                          />
                          <span className="text-xs text-slate-400">a</span>
                          <input
                            type="time"
                            value={clientHoursTo}
                            onChange={(e) => setClientHoursTo(e.target.value)}
                            className="w-full px-2 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-xs text-white"
                          />
                        </div>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] uppercase font-bold text-slate-300 mb-1">Email para Reservas</label>
                    <input
                      type="email"
                      placeholder="reservas@hotel.com"
                      value={clientReservationsEmail}
                      onChange={(e) => setClientReservationsEmail(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] uppercase font-bold text-slate-300 mb-1">WhatsApp Directo</label>
                    <input
                      type="tel"
                      placeholder="+58 412 9876543"
                      value={clientWhatsapp}
                      onChange={(e) => setClientWhatsapp(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ================================================================= */}
          {/* SECCIÓN 4: C01.7 ZONAS COMUNES E INSTALACIONES */}
          {/* ================================================================= */}
          {currentSection === 4 && (
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6 shadow-xl animate-in fade-in">
              <div className="flex items-center gap-3 pb-4 border-b border-slate-800">
                <div className="w-10 h-10 rounded-2xl bg-[#00C8D4]/15 text-[#00C8D4] flex items-center justify-center font-black">
                  4
                </div>
                <div>
                  <h2 className="text-lg font-black text-white font-serif">
                    Sección 4: C01.7. Zonas Comunes e Instalaciones del Establecimiento
                  </h2>
                  <p className="text-xs text-slate-400">
                    Instalaciones recreativas, relax, espacios compartidos, abastecimiento y baños comunes.
                  </p>
                </div>
              </div>

              {/* C01.7.1 Bienestar, Salud y Relax */}
              <div className="space-y-3">
                <span className="text-xs font-black uppercase text-[#00C8D4] tracking-wider block">
                  C01.7.1. Bienestar, Salud y Relax (Compartido)
                </span>
                {renderAmenityCheckGrid(MASTER_AMENITIES.filter(a => a.code.startsWith("C01.7.1")))}
              </div>

              {/* C01.7.2 Ocio y Espacios Sociales */}
              <div className="space-y-3 pt-4 border-t border-slate-800">
                <span className="text-xs font-black uppercase text-[#FF0096] tracking-wider block">
                  C01.7.2. Ocio y Espacios Sociales (Compartido)
                </span>
                {renderAmenityCheckGrid(MASTER_AMENITIES.filter(a => a.code.startsWith("C01.7.2")))}
              </div>

              {/* C01.7.3 Infraestructuras de Negocios y Eventos */}
              <div className="space-y-3 pt-4 border-t border-slate-800">
                <span className="text-xs font-black uppercase text-[#9B00CC] tracking-wider block">
                  C01.7.3. Infraestructuras de Negocios y Eventos
                </span>
                {renderAmenityCheckGrid(MASTER_AMENITIES.filter(a => a.code.startsWith("C01.7.3")))}
              </div>

              {/* C01.8 Abastecimiento y Energía */}
              <div className="space-y-3 pt-4 border-t border-slate-800">
                <span className="text-xs font-black uppercase text-amber-400 tracking-wider block">
                  C01.8. Abastecimiento y Energía (Garantía de Suministro)
                </span>
                {renderAmenityCheckGrid(MASTER_AMENITIES.filter(a => a.code.startsWith("C01.8")))}
              </div>

              {/* Amenidades de Baño Compartido y Adaptado PMR */}
              <div className="space-y-3 pt-4 border-t border-slate-800">
                <span className="text-xs font-black uppercase text-emerald-400 tracking-wider block">
                  C01.6.2. Amenidades de Baño Compartido & C01.6.3. Baño Adaptado PMR
                </span>
                {renderAmenityCheckGrid(MASTER_AMENITIES.filter(a => a.code.startsWith("C01.6.2") || a.code.startsWith("C01.6.3")))}
              </div>
            </div>
          )}

          {/* ================================================================= */}
          {/* SECCIÓN 5: C02 SERVICIOS Y EXPERIENCIAS */}
          {/* ================================================================= */}
          {currentSection === 5 && (
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6 shadow-xl animate-in fade-in">
              <div className="flex items-center gap-3 pb-4 border-b border-slate-800">
                <div className="w-10 h-10 rounded-2xl bg-[#FF0096]/15 text-[#FF0096] flex items-center justify-center font-black">
                  5
                </div>
                <div>
                  <h2 className="text-lg font-black text-white font-serif">
                    Sección 5: C02. Servicios y Experiencias
                  </h2>
                  <p className="text-xs text-slate-400">
                    Atención al cliente, idiomas, gastronomía, limpieza, conectividad y experiencias organizadas.
                  </p>
                </div>
              </div>

              {/* C02.1 Atención y Recepción + Idiomas */}
              <div className="space-y-3">
                <span className="text-xs font-black uppercase text-[#00C8D4] tracking-wider block">
                  C02.1. Servicios de Atención, Recepción & Multilingüe
                </span>
                {renderAmenityCheckGrid(MASTER_AMENITIES.filter(a => a.code.startsWith("C02.1")))}
              </div>

              {/* C02.2 Gastronomía y Alimentos */}
              <div className="space-y-3 pt-4 border-t border-slate-800">
                <span className="text-xs font-black uppercase text-[#FF0096] tracking-wider block">
                  C02.2. Gastronomía y Alimentos (Hostelería Interna)
                </span>
                {renderAmenityCheckGrid(MASTER_AMENITIES.filter(a => a.code.startsWith("C02.2")))}
              </div>

              {/* C02.3 Mantenimiento y Limpieza */}
              <div className="space-y-3 pt-4 border-t border-slate-800">
                <span className="text-xs font-black uppercase text-[#9B00CC] tracking-wider block">
                  C02.3. Mantenimiento de Habitaciones y Limpieza de Ropa
                </span>
                {renderAmenityCheckGrid(MASTER_AMENITIES.filter(a => a.code.startsWith("C02.3")))}
              </div>

              {/* C02.4 Conectividad y Movilidad */}
              <div className="space-y-3 pt-4 border-t border-slate-800">
                <span className="text-xs font-black uppercase text-cyan-400 tracking-wider block">
                  C02.4. Conectividad a Internet & Movilidad / Parking
                </span>
                {renderAmenityCheckGrid(MASTER_AMENITIES.filter(a => a.code.startsWith("C02.4")))}

                {/* Precios de parking opcionales */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 bg-slate-800/40 p-4 rounded-2xl border border-slate-700">
                  <div>
                    <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">
                      Precio Parking Cubierto (si es de pago)
                    </label>
                    <input
                      type="text"
                      placeholder="Ej: $10/día o Bs. 400"
                      value={parkingCoveredPrice}
                      onChange={(e) => setParkingCoveredPrice(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">
                      Precio Parking Descubierto (si es de pago)
                    </label>
                    <input
                      type="text"
                      placeholder="Ej: $5/día o Bs. 200"
                      value={parkingUncoveredPrice}
                      onChange={(e) => setParkingUncoveredPrice(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white"
                    />
                  </div>
                </div>
              </div>

              {/* C02.5 Actividades y Experiencias en Alrededores */}
              <div className="space-y-3 pt-4 border-t border-slate-800">
                <span className="text-xs font-black uppercase text-emerald-400 tracking-wider block">
                  C02.5. Actividades y Experiencias Organizadas en Alrededores
                </span>
                {renderAmenityCheckGrid(MASTER_AMENITIES.filter(a => a.code.startsWith("C02.5")))}
              </div>
            </div>
          )}

          {/* ================================================================= */}
          {/* SECCIÓN 6: C03 GESTIÓN, POLÍTICAS Y LOGÍSTICA */}
          {/* ================================================================= */}
          {currentSection === 6 && (
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6 shadow-xl animate-in fade-in">
              <div className="flex items-center gap-3 pb-4 border-b border-slate-800">
                <div className="w-10 h-10 rounded-2xl bg-[#9B00CC]/15 text-[#9B00CC] flex items-center justify-center font-black">
                  6
                </div>
                <div>
                  <h2 className="text-lg font-black text-white font-serif">
                    Sección 6: C03. Gestión, Políticas y Logística
                  </h2>
                  <p className="text-xs text-slate-400">
                    Normas de la propiedad, accesibilidad, seguridad, pagos online y condiciones de reserva.
                  </p>
                </div>
              </div>

              {/* C03.1 Accesibilidad e Inclusión */}
              <div className="space-y-3">
                <span className="text-xs font-black uppercase text-[#00C8D4] tracking-wider block">
                  C03.1. Accesibilidad e Inclusión (Adaptabilidad)
                </span>
                {renderAmenityCheckGrid(MASTER_AMENITIES.filter(a => a.code.startsWith("C03.1")))}
              </div>

              {/* C03.2 Seguridad y Protección */}
              <div className="space-y-3 pt-4 border-t border-slate-800">
                <span className="text-xs font-black uppercase text-rose-400 tracking-wider block">
                  C03.2. Seguridad y Protección
                </span>
                {renderAmenityCheckGrid(MASTER_AMENITIES.filter(a => a.code.startsWith("C03.2")))}
              </div>

              {/* C03.3 Políticas y Normas */}
              <div className="space-y-4 pt-4 border-t border-slate-800">
                <span className="text-xs font-black uppercase text-[#FF0096] tracking-wider block">
                  C03.3. Políticas y Normas de la Propiedad
                </span>

                {/* Horarios Check-in/out */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-slate-800/40 p-4 rounded-2xl border border-slate-700">
                  <div>
                    <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Horario Check-in</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="time"
                        value={checkInFrom}
                        onChange={(e) => setCheckInFrom(e.target.value)}
                        className="w-full px-2 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white"
                      />
                      <span className="text-xs text-slate-400">a</span>
                      <input
                        type="time"
                        value={checkInTo}
                        onChange={(e) => setCheckInTo(e.target.value)}
                        className="w-full px-2 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Horario Check-out</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="time"
                        value={checkOutFrom}
                        onChange={(e) => setCheckOutFrom(e.target.value)}
                        className="w-full px-2 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white"
                      />
                      <span className="text-xs text-slate-400">a</span>
                      <input
                        type="time"
                        value={checkOutTo}
                        onChange={(e) => setCheckOutTo(e.target.value)}
                        className="w-full px-2 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Late Check-out Hasta</label>
                    <input
                      type="time"
                      value={lateCheckOutTo}
                      onChange={(e) => setLateCheckOutTo(e.target.value)}
                      className="w-full px-2 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white"
                    />
                  </div>
                </div>

                {/* Mascotas */}
                <div className="bg-slate-800/40 p-4 rounded-2xl border border-slate-700 space-y-3">
                  <span className="text-[11px] font-bold text-slate-300 block">C03.3.2. Política de Mascotas</span>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {[
                      { id: "gratis", label: "Mascotas Gratis" },
                      { id: "suplemento", label: "Con Suplemento" },
                      { id: "camas", label: "Camas Mascotas" },
                      { id: "no_admiten", label: "No se admiten" }
                    ].map(p => (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => setPetPolicy(p.id)}
                        className={`p-2.5 rounded-xl border text-xs font-bold text-center cursor-pointer transition-all ${
                          petPolicy === p.id
                            ? "bg-[#00C8D4]/20 border-[#00C8D4] text-white"
                            : "bg-slate-900 border-slate-700 text-slate-400 hover:text-white"
                        }`}
                      >
                        {p.label}
                      </button>
                    ))}
                  </div>

                  {petPolicy === "suplemento" && (
                    <div className="pt-1 animate-in fade-in">
                      <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Precio Suplemento Mascota</label>
                      <input
                        type="text"
                        placeholder="Ej: $15 por estancia o $5/noche"
                        value={petFeePrice}
                        onChange={(e) => setPetFeePrice(e.target.value)}
                        className="w-full sm:w-60 px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white"
                      />
                    </div>
                  )}
                </div>

                {/* Perfil de Huésped, Tabaco, Pagos Online */}
                {renderAmenityCheckGrid(MASTER_AMENITIES.filter(a =>
                  a.code.startsWith("C03.3.3") ||
                  a.code.startsWith("C03.3.4") ||
                  a.code.startsWith("C03.3.6") ||
                  a.code.startsWith("C03.3.7") ||
                  a.code.startsWith("C03.3.8") ||
                  a.code.startsWith("C03.3.9")
                ))}

                {/* Horario de silencio */}
                <div className="bg-slate-800/40 p-4 rounded-2xl border border-slate-700 flex items-center justify-between flex-wrap gap-3">
                  <span className="text-xs text-slate-300 font-bold">
                    C03.3.4.4. Minimizar ruido nocturno:
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-400">De</span>
                    <input
                      type="time"
                      value={quietHoursFrom}
                      onChange={(e) => setQuietHoursFrom(e.target.value)}
                      className="px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white"
                    />
                    <span className="text-xs text-slate-400">a</span>
                    <input
                      type="time"
                      value={quietHoursTo}
                      onChange={(e) => setQuietHoursTo(e.target.value)}
                      className="px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ================================================================= */}
          {/* SECCIÓN 7 (ESPECIAL BOTÓN 2): CONFIGURACIÓN DE HABITACIONES */}
          {/* ================================================================= */}
          {activeButtonGroup === "boton2" && currentSection === 7 && (
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6 shadow-xl animate-in fade-in">
              <div className="flex items-center gap-3 pb-4 border-b border-slate-800">
                <div className="w-10 h-10 rounded-2xl bg-[#FF0096]/15 text-[#FF0096] flex items-center justify-center font-black">
                  7
                </div>
                <div>
                  <h2 className="text-lg font-black text-white font-serif">
                    Sección 7: Configuración de las Habitaciones y Baños Privados
                  </h2>
                  <p className="text-xs text-slate-400">
                    Estructura informativa para mostrar al turista la distribución de la casa, apartamento o villa.
                  </p>
                </div>
              </div>

              {/* Banner Informativo Obligatorio Doc 77 V.10 */}
              <div className="bg-gradient-to-r from-[#0e011f] to-[#1a0533] border border-[#00C8D4]/40 p-4 rounded-2xl text-white text-xs leading-relaxed space-y-1">
                <div className="flex items-center gap-2 font-bold text-[#00C8D4]">
                  <Info className="w-4 h-4" />
                  <span>Aviso Importante sobre Alquiler Completo</span>
                </div>
                <p className="text-slate-300 text-[11px]">
                  La información solicitada en esta sección es meramente informativa para que el turista conozca la distribución y amenidades de cada estancia. En este tipo de propiedades se reserva el establecimiento completo, no por unidad operativa separada.
                </p>
              </div>

              {/* Selector de Modalidad: Mismas Amenidades vs Individual */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => setRoomConfigMode("same")}
                  className={`p-4 rounded-2xl border text-left transition-all cursor-pointer ${
                    roomConfigMode === "same"
                      ? "bg-[#00C8D4]/15 border-[#00C8D4] text-white shadow-md ring-1 ring-[#00C8D4]"
                      : "bg-slate-800/60 border-slate-700 text-slate-400 hover:bg-slate-800 hover:text-white"
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1.5">
                    <input
                      type="radio"
                      name="roomMode"
                      checked={roomConfigMode === "same"}
                      onChange={() => setRoomConfigMode("same")}
                      className="text-[#00C8D4]"
                    />
                    <span className="font-bold text-xs text-white">Prefiero configurar todas las habitaciones con las mismas amenidades</span>
                  </div>
                  <p className="text-[11px] text-slate-400 pl-6">
                    Aplica una configuración homogénea de camas, tamaño y comodidades a todas las habitaciones.
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() => setRoomConfigMode("individual")}
                  className={`p-4 rounded-2xl border text-left transition-all cursor-pointer ${
                    roomConfigMode === "individual"
                      ? "bg-[#FF0096]/15 border-[#FF0096] text-white shadow-md ring-1 ring-[#FF0096]"
                      : "bg-slate-800/60 border-slate-700 text-slate-400 hover:bg-slate-800 hover:text-white"
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1.5">
                    <input
                      type="radio"
                      name="roomMode"
                      checked={roomConfigMode === "individual"}
                      onChange={() => setRoomConfigMode("individual")}
                      className="text-[#FF0096]"
                    />
                    <span className="font-bold text-xs text-white">Prefiero configurar individualmente cada habitación</span>
                  </div>
                  <p className="text-[11px] text-slate-400 pl-6">
                    Permite detallar habitación por habitación (Hab 1, Hab 2, etc.) con sus camas y baños compartidos/privados.
                  </p>
                </button>
              </div>

              {/* MODO A: MISMAS AMENIDADES */}
              {roomConfigMode === "same" && (
                <div className="space-y-5 bg-slate-800/40 p-5 rounded-2xl border border-slate-700 animate-in fade-in">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-[11px] uppercase font-bold text-slate-300 mb-1">C01.2.1. Número de Habitaciones</label>
                      <input
                        type="number"
                        min="1"
                        value={unitCount}
                        onChange={(e) => setUnitCount(e.target.value)}
                        className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] uppercase font-bold text-slate-300 mb-1">C01.6.1.1. Baños Privados</label>
                      <input
                        type="number"
                        min="0"
                        value={globalPrivateBathCount}
                        onChange={(e) => setGlobalPrivateBathCount(e.target.value)}
                        className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] uppercase font-bold text-slate-300 mb-1">C01.6.1.2. Baños Compartidos</label>
                      <input
                        type="number"
                        min="0"
                        value={globalSharedBathCount}
                        onChange={(e) => setGlobalSharedBathCount(e.target.value)}
                        className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white"
                      />
                    </div>
                  </div>

                  {/* Camas Globales */}
                  <div className="space-y-2 pt-2 border-t border-slate-700">
                    <span className="text-xs font-bold text-[#00C8D4] block">
                      C01.3. Tamaño y Distribución de las Camas en las Habitaciones
                    </span>
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                      <div>
                        <span className="text-[10px] text-slate-400 block mb-1">Tamaño m²</span>
                        <input
                          type="number"
                          value={globalRoomSizeM2}
                          onChange={(e) => setGlobalRoomSizeM2(e.target.value)}
                          className="w-full px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white"
                        />
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 block mb-1">Indiv. 100 cm</span>
                        <input
                          type="number"
                          value={globalBedsSingle100}
                          onChange={(e) => setGlobalBedsSingle100(e.target.value)}
                          className="w-full px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white"
                        />
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 block mb-1">King 200 cm</span>
                        <input
                          type="number"
                          value={globalBedsDoubleKing200}
                          onChange={(e) => setGlobalBedsDoubleKing200(e.target.value)}
                          className="w-full px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white"
                        />
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 block mb-1">Queen 180 cm</span>
                        <input
                          type="number"
                          value={globalBedsDoubleQueen180}
                          onChange={(e) => setGlobalBedsDoubleQueen180(e.target.value)}
                          className="w-full px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white"
                        />
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 block mb-1">Full 150 cm</span>
                        <input
                          type="number"
                          value={globalBedsDoubleFull150}
                          onChange={(e) => setGlobalBedsDoubleFull150(e.target.value)}
                          className="w-full px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white"
                        />
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 block mb-1">Literas</span>
                        <input
                          type="number"
                          value={globalBunkBeds}
                          onChange={(e) => setGlobalBunkBeds(e.target.value)}
                          className="w-full px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white"
                        />
                      </div>
                    </div>
                  </div>

                  {/* C01.4 Equipamiento de la Habitación */}
                  <div className="space-y-3 pt-3 border-t border-slate-700">
                    <span className="text-xs font-bold text-[#FF0096] block">
                      C01.4. Equipamiento de la Unidad Privada
                    </span>
                    {renderAmenityCheckGrid(MASTER_AMENITIES.filter(a => a.code.startsWith("C01.4") || a.code.startsWith("C01.5")))}
                  </div>
                </div>
              )}

              {/* MODO B: CONFIGURACIÓN INDIVIDUAL POR ESTANCIA */}
              {roomConfigMode === "individual" && (
                <div className="space-y-4 animate-in fade-in">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-300">
                      Habitaciones Configurada(s): {customRooms.length}
                    </span>
                    <button
                      type="button"
                      onClick={openNewRoomModal}
                      className="px-4 py-2 rounded-xl text-xs font-bold text-white shadow-md flex items-center gap-1.5 cursor-pointer hover:scale-105 transition-all"
                      style={{ background: "linear-gradient(135deg, #FF0096 0%, #9B00CC 100%)" }}
                    >
                      <Plus className="w-4 h-4" />
                      <span>+ Agregar Habitación</span>
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {customRooms.map((r, idx) => (
                      <div
                        key={r.id}
                        className="bg-slate-800/80 p-4 rounded-2xl border border-slate-700 space-y-2.5 text-left relative"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-2">
                            <span className="w-6 h-6 rounded-lg bg-[#FF0096]/20 text-[#FF0096] text-xs font-black flex items-center justify-center">
                              {idx + 1}
                            </span>
                            <h4 className="text-sm font-bold text-white">{r.name}</h4>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <button
                              type="button"
                              onClick={() => openEditRoomModal(r)}
                              className="p-1.5 rounded-lg bg-slate-700 hover:bg-slate-600 text-slate-300"
                              title="Editar"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => removeCustomRoom(r.id)}
                              className="p-1.5 rounded-lg bg-rose-500/20 hover:bg-rose-500/30 text-rose-400"
                              title="Eliminar"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>

                        <div className="text-[11px] text-slate-300 space-y-1">
                          <div><strong>Superficie:</strong> {r.sizeM2 || "25"} m²</div>
                          <div>
                            <strong>Baño:</strong>{" "}
                            {r.bathType === "privado" ? (
                              <span className="text-[#00C8D4] font-semibold">Privado en suite</span>
                            ) : (
                              <span className="text-amber-400 font-semibold">
                                Compartido {r.sharedWithRooms ? `(con ${r.sharedWithRooms})` : ""}
                              </span>
                            )}
                          </div>
                          <div className="text-slate-400 text-[10px] pt-1">
                            {r.amenities.length} comodidades seleccionadas
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ================================================================= */}
          {/* SECCIÓN 8 (ESPECIAL BOTÓN 2): CHALETS DE MONTAÑA / ESQUÍ */}
          {/* ================================================================= */}
          {activeButtonGroup === "boton2" && currentSection === 8 && (
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6 shadow-xl animate-in fade-in">
              <div className="flex items-center gap-3 pb-4 border-b border-slate-800">
                <div className="w-10 h-10 rounded-2xl bg-emerald-500/15 text-emerald-400 flex items-center justify-center font-black">
                  8
                </div>
                <div>
                  <h2 className="text-lg font-black text-white font-serif">
                    Sección 8: C04.4. Instalaciones Específicas para Chalets de Montaña / Esquí
                  </h2>
                  <p className="text-xs text-slate-400">
                    Equipamiento térmico, fondue/raclette, guardaesquís, hot tubs nórdicos y servicios de nieve.
                  </p>
                </div>
              </div>

              {/* Interiores del Chalet */}
              <div className="space-y-3">
                <span className="text-xs font-black uppercase text-[#00C8D4] tracking-wider block">
                  C04.4.1. Interiores del Chalet (Confort Térmico & Baño)
                </span>
                {renderAmenityCheckGrid(MASTER_AMENITIES.filter(a =>
                  a.code.startsWith("C04.4.1.1") || a.code.startsWith("C04.4.1.2") || a.code.startsWith("C04.4.1.3") || a.code.startsWith("C04.4.1.4")
                ))}
              </div>

              {/* Exteriores & Esquí */}
              <div className="space-y-3 pt-4 border-t border-slate-800">
                <span className="text-xs font-black uppercase text-[#FF0096] tracking-wider block">
                  C04.4.1.5. Exteriores & C04.4.1.6. Instalaciones de Esquí (Ski Room, Mudroom, Ski-in/Ski-out)
                </span>
                {renderAmenityCheckGrid(MASTER_AMENITIES.filter(a =>
                  a.code.startsWith("C04.4.1.5") || a.code.startsWith("C04.4.1.6")
                ))}
              </div>

              {/* Servicios y Actividades de Montaña */}
              <div className="space-y-3 pt-4 border-t border-slate-800">
                <span className="text-xs font-black uppercase text-amber-400 tracking-wider block">
                  C04.4.1.7. Servicios, Forfaits, Chef Privado & Actividades de Nieve
                </span>
                {renderAmenityCheckGrid(MASTER_AMENITIES.filter(a =>
                  a.code.startsWith("C04.4.1.7") || a.code.startsWith("C04.4.1.8") || a.code.startsWith("C04.4.1.9")
                ))}
              </div>
            </div>
          )}

          {/* ================================================================= */}
          {/* SECCIÓN 7 (ESPECIAL BOTÓN 4): AMENIDADES ESPECÍFICAS LOVE HOTELS */}
          {/* ================================================================= */}
          {activeButtonGroup === "boton4" && currentSection === 7 && (
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6 shadow-xl animate-in fade-in">
              <div className="flex items-center gap-3 pb-4 border-b border-slate-800">
                <div className="w-10 h-10 rounded-2xl bg-[#FF0096]/15 text-[#FF0096] flex items-center justify-center font-black">
                  7
                </div>
                <div>
                  <h2 className="text-lg font-black text-white font-serif">
                    Sección 7: C04.3. Amenidades Específicas para LOVE HOTELS & MOTELES
                  </h2>
                  <p className="text-xs text-slate-400">
                    Mobiliario erótico, jacuzzis XL, ambientación LED, garajes con check-in en auto y privacidad total.
                  </p>
                </div>
              </div>

              {/* C04.3.1 Descanso y Mobiliario Erótico */}
              <div className="space-y-3">
                <span className="text-xs font-black uppercase text-[#FF0096] tracking-wider block">
                  C04.3.1. Descanso y Mobiliario Erótico (Tantra, Espejos, Camas Reforzadas)
                </span>
                {renderAmenityCheckGrid(MASTER_AMENITIES.filter(a => a.code.startsWith("C04.3.1")))}
              </div>

              {/* C04.3.2 Baño y Agua */}
              <div className="space-y-3 pt-4 border-t border-slate-800">
                <span className="text-xs font-black uppercase text-[#00C8D4] tracking-wider block">
                  C04.3.2. Baño Privado y Zona de Agua (Jacuzzis XL, Ducha de Cristal Vista)
                </span>
                {renderAmenityCheckGrid(MASTER_AMENITIES.filter(a => a.code.startsWith("C04.3.2")))}
              </div>

              {/* C04.3.3 Climatización & LED */}
              <div className="space-y-3 pt-4 border-t border-slate-800">
                <span className="text-xs font-black uppercase text-purple-400 tracking-wider block">
                  C04.3.3. Climatización Rápida & Ambientación LED por Colores
                </span>
                {renderAmenityCheckGrid(MASTER_AMENITIES.filter(a => a.code.startsWith("C04.3.3") || a.code.startsWith("C04.3.4")))}
              </div>

              {/* C04.3.6 Acceso y Privacidad */}
              <div className="space-y-3 pt-4 border-t border-slate-800">
                <span className="text-xs font-black uppercase text-amber-400 tracking-wider block">
                  C04.3.6. Acceso, Garaje Privado con Puerta Automática, Torno Anónimo & Cobro 100% Discreto
                </span>
                {renderAmenityCheckGrid(MASTER_AMENITIES.filter(a =>
                  a.code.startsWith("C04.3.5") || a.code.startsWith("C04.3.6") || a.code.startsWith("C04.3.7")
                ))}
              </div>
            </div>
          )}

          {/* ================================================================= */}
          {/* ÚLTIMA SECCIÓN: LUGARES DE INTERÉS (C00.5) Y GALERÍA DE FOTOS */}
          {/* ================================================================= */}
          {((activeButtonGroup === "boton1" && currentSection === 7) ||
            (activeButtonGroup === "boton2" && currentSection === 9) ||
            (activeButtonGroup === "boton4" && currentSection === 8)) && (
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6 shadow-xl animate-in fade-in">
              <div className="flex items-center gap-3 pb-4 border-b border-slate-800">
                <div className="w-10 h-10 rounded-2xl bg-emerald-500/15 text-emerald-400 flex items-center justify-center font-black">
                  {currentSection}
                </div>
                <div>
                  <h2 className="text-lg font-black text-white font-serif">
                    Sección {currentSection}: C00.5. Lugares de Interés Dinámicos & Galería Fotográfica
                  </h2>
                  <p className="text-xs text-slate-400">
                    Puntos de interés cercanos informados por el propietario y fotos destacadas para la ficha.
                  </p>
                </div>
              </div>

              {/* Lugares de Interés Dinámicos C00.5 */}
              <div className="space-y-4">
                <span className="text-xs font-black uppercase text-[#00C8D4] tracking-wider block">
                  C00.5. Lugares de Interés en los Alrededores
                </span>

                <div className="bg-slate-800/60 p-4 rounded-2xl border border-slate-700 space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">
                        C00.5.1. Tipo de Lugar *
                      </label>
                      <select
                        value={newPoiCat}
                        onChange={(e) => setNewPoiCat(e.target.value)}
                        className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white cursor-pointer"
                      >
                        {POI_TYPES_V10.map(pt => (
                          <option key={pt.code} value={pt.code}>{pt.label}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">
                        C00.5.2. Nombre del Lugar *
                      </label>
                      <input
                        type="text"
                        placeholder="Ej: Playa El Yaque / Parque Nacional"
                        value={newPoiName}
                        onChange={(e) => setNewPoiName(e.target.value)}
                        className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">
                        C00.5.3. Distancia (m, km) / Tiempo
                      </label>
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          placeholder="Ej: 300 m o 5 min a pie"
                          value={newPoiDistance}
                          onChange={(e) => setNewPoiDistance(e.target.value)}
                          className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white"
                        />
                        <button
                          type="button"
                          onClick={addPoi}
                          className="px-4 py-2 rounded-xl text-xs font-bold text-white shrink-0 cursor-pointer"
                          style={{ background: "linear-gradient(135deg, #00C8D4 0%, #0098A6 100%)" }}
                        >
                          + Añadir
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Lista de Puntos de Interés Añadidos */}
                  {pointsOfInterest.length > 0 && (
                    <div className="pt-2 space-y-2">
                      <span className="text-[10px] font-bold uppercase text-slate-400 block">
                        Lugares Registrados ({pointsOfInterest.length}):
                      </span>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {pointsOfInterest.map((poi) => {
                          const poiTypeObj = POI_TYPES_V10.find(t => t.code === poi.category);
                          return (
                            <div
                              key={poi.id}
                              className="flex items-center justify-between p-2.5 rounded-xl bg-slate-900 border border-slate-750 text-xs text-slate-200"
                            >
                              <div className="flex items-center gap-2 min-w-0">
                                <MapPin className="w-3.5 h-3.5 text-[#00C8D4] shrink-0" />
                                <div className="truncate">
                                  <span className="font-bold text-white">{poi.name}</span>
                                  <span className="text-[10px] text-slate-400 block truncate">
                                    {poiTypeObj?.label || poi.category} • {poi.distance}
                                  </span>
                                </div>
                              </div>
                              <button
                                type="button"
                                onClick={() => removePoi(poi.id)}
                                className="p-1 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 cursor-pointer"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Galería de Fotos */}
              <div className="space-y-4 pt-4 border-t border-slate-800">
                <span className="text-xs font-black uppercase text-[#FF0096] tracking-wider block">
                  Galería de Fotos del Establecimiento
                </span>

                <div className="flex items-center gap-2">
                  <input
                    type="url"
                    placeholder="Pega la URL de una foto (https://...)"
                    value={photoUrl}
                    onChange={(e) => setPhotoUrl(e.target.value)}
                    className="flex-1 px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white"
                  />
                  <button
                    type="button"
                    onClick={addPhoto}
                    className="px-4 py-2.5 rounded-xl text-xs font-bold text-white bg-[#FF0096] hover:bg-[#e00084] cursor-pointer"
                  >
                    + Agregar Foto
                  </button>
                </div>

                {photos.length > 0 && (
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
                    {photos.map((p, idx) => (
                      <div
                        key={idx}
                        className={`relative rounded-2xl overflow-hidden border aspect-video group ${
                          p.isPrimary ? "border-[#00C8D4] ring-2 ring-[#00C8D4]" : "border-slate-700"
                        }`}
                      >
                        <img src={p.url} alt="Hotel" className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 p-2">
                          <button
                            type="button"
                            onClick={() => setPrimaryPhoto(idx)}
                            className="px-2 py-1 rounded bg-[#00C8D4] text-[#0e011f] text-[10px] font-bold"
                          >
                            {p.isPrimary ? "Principal" : "Hacer Principal"}
                          </button>
                          <button
                            type="button"
                            onClick={() => removePhoto(idx)}
                            className="p-1 rounded bg-rose-600 text-white"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                        {p.isPrimary && (
                          <span className="absolute top-2 left-2 bg-[#00C8D4] text-[#0e011f] text-[9px] font-black uppercase px-2 py-0.5 rounded-full shadow">
                            Portada
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* BARRA DE NAVEGACIÓN Y ACCIÓN INFERIOR */}
          <div className="flex items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-5 rounded-3xl shadow-xl flex-wrap">
            <button
              type="button"
              disabled={currentSection === 1}
              onClick={() => setCurrentSection(prev => Math.max(1, prev - 1))}
              className="px-5 py-2.5 rounded-xl text-xs font-bold text-slate-300 bg-slate-800 hover:bg-slate-750 disabled:opacity-30 disabled:cursor-not-allowed flex items-center gap-2 cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Sección Anterior</span>
            </button>

            <div className="flex items-center gap-3">
              {currentSection < totalSections ? (
                <button
                  type="button"
                  onClick={() => setCurrentSection(prev => Math.min(totalSections, prev + 1))}
                  className="px-6 py-2.5 rounded-xl text-xs font-bold text-white flex items-center gap-2 shadow-lg cursor-pointer hover:scale-102 transition-all"
                  style={{ background: "linear-gradient(135deg, #00C8D4 0%, #0098A6 100%)" }}
                >
                  <span>Siguiente Sección</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={busy}
                  className="px-8 py-3 rounded-xl text-xs font-black uppercase tracking-wider text-white shadow-2xl flex items-center gap-2 cursor-pointer hover:scale-103 active:scale-97 transition-all disabled:opacity-50"
                  style={{ background: "linear-gradient(135deg, #FF0096 0%, #9B00CC 100%)" }}
                >
                  {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                  <span>{editId ? "Guardar Cambios Doc 77 V.10" : "Finalizar y Registrar Establecimiento"}</span>
                </button>
              )}
            </div>
          </div>

        </form>

      </div>
    </div>
  );
}