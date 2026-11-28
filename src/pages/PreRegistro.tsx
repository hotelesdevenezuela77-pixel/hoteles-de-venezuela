import React, { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { 
  Zap, 
  Droplets, 
  Wifi, 
  Dog, 
  ShieldCheck, 
  Star, 
  MapPin, 
  ArrowRight, 
  Sparkles, 
  CheckCircle2, 
  Phone, 
  Eye, 
  Layers, 
  BedDouble, 
  DollarSign, 
  Building, 
  Tag, 
  FileText,
  AlertCircle,
  ExternalLink,
  MessageCircle,
  ArrowLeft,
  Camera,
  Upload,
  Navigation,
  Loader2,
  Trash2,
  Globe,
  Radio,
  Share2,
  Award,
  UserCheck,
  Briefcase,
  QrCode,
  Lock,
  ChevronDown
} from "lucide-react";
import { supabase } from "../lib/supabase";
import { useAuth } from "../lib/auth";
import { useBcvExchangeRate } from "../hooks/useBcvExchangeRate";
import type { PreRegistrationPayload, PreRegistrationBadgeFlags } from "../types/preRegistration";
import { FlexibleBedroomConfigurator } from "../components/units/FlexibleBedroomConfigurator";
import {
  SERVICE_CATEGORIES_V15,
  SERVICE_SUBCATEGORIES_V15
} from "../lib/v15MasterCatalog";
import {
  buildConsolidatedServicesArray,
  getRealEstablishmentBadgesAndTags
} from "../lib/amenitiesList";
import {
  SAAS_COMMERCIAL_PLANS,
  OFFICIAL_SALES_AGENTS,
  OFFICIAL_PRELOADED_INVITATIONS,
  MAX_FOUNDERS_QUOTA,
  getSalesCounters,
  getSalesReceipts,
  getReceiptByFolio,
  syncSalesStateFromSupabase,
  processSalesPreRegistration,
  confirmPreloadedPreRegistration,
  findExistingEstablishmentMatch,
  normalizeEstablishmentName,
  normalizePhoneKey,
  type ExistingEstablishmentMatch,
  type RegistrationOrigin,
  type MembershipModality,
  type SalesPreRegistrationReceipt,
  type SalesCountersState
} from "../lib/salesDepartmentStore";
import { ESTABLISHMENTS_MOCK } from "../lib/establishmentsMock";
import { PreRegistrationReceiptModal } from "../components/sales/PreRegistrationReceiptModal";

export interface UnifiedPreRegCategoryOption {
  id: string;
  label: string;
  directorySlug: string;
  groupCode: string;
  groupTitle: string;
  serviceCategoryId: number;
  subcategoryId: number;
}

/**
 * Catálogo Central Unificado de Categorías de la Plataforma (Sincronizado con V15 Master Catalog + Directorio + Buscador)
 */
export const UNIFIED_PLATFORM_CATEGORIES: UnifiedPreRegCategoryOption[] = [
  // CS-01: Hoteles y Hospedajes con Recepción
  { id: "posada-boutique", label: "Posada Boutique", directorySlug: "posadas", groupCode: "CS-01", groupTitle: "Hoteles, Posadas y Hospedajes", serviceCategoryId: 1, subcategoryId: 2 },
  { id: "posadas", label: "Posadas", directorySlug: "posadas", groupCode: "CS-01", groupTitle: "Hoteles, Posadas y Hospedajes", serviceCategoryId: 1, subcategoryId: 2 },
  { id: "hotel-exclusivo", label: "Hotel Exclusivo", directorySlug: "hoteles", groupCode: "CS-01", groupTitle: "Hoteles, Posadas y Hospedajes", serviceCategoryId: 1, subcategoryId: 1 },
  { id: "hoteles", label: "Hoteles", directorySlug: "hoteles", groupCode: "CS-01", groupTitle: "Hoteles, Posadas y Hospedajes", serviceCategoryId: 1, subcategoryId: 1 },
  { id: "hotel-boutique", label: "Hotel Boutique", directorySlug: "hoteles", groupCode: "CS-01", groupTitle: "Hoteles, Posadas y Hospedajes", serviceCategoryId: 1, subcategoryId: 1 },
  { id: "hostal-bed-breakfast", label: "Hostal / Bed & Breakfast (B&B)", directorySlug: "posadas", groupCode: "CS-01", groupTitle: "Hoteles, Posadas y Hospedajes", serviceCategoryId: 1, subcategoryId: 2 },
  { id: "love-hotel-suite", label: "Love Hotel / Suite & Motel", directorySlug: "hoteles", groupCode: "CS-01", groupTitle: "Hoteles, Posadas y Hospedajes", serviceCategoryId: 1, subcategoryId: 6 },
  { id: "albergue-capsula", label: "Albergue Turístico / Hotel Cápsula", directorySlug: "hoteles", groupCode: "CS-01", groupTitle: "Hoteles, Posadas y Hospedajes", serviceCategoryId: 1, subcategoryId: 3 },

  // CS-02: Resorts, Campamentos, Glamping y Complejos Vacacionales
  { id: "resorts-complejos", label: "Resorts & Complejos Vacacionales", directorySlug: "complejos", groupCode: "CS-02", groupTitle: "Resorts, Campamentos, Glamping y Complejos", serviceCategoryId: 2, subcategoryId: 9 },
  { id: "complejos-turisticos", label: "Complejos Turísticos", directorySlug: "complejos", groupCode: "CS-02", groupTitle: "Resorts, Campamentos, Glamping y Complejos", serviceCategoryId: 2, subcategoryId: 9 },
  { id: "campamento-eco-lodge", label: "Campamento / Eco-Lodge", directorySlug: "campamentos", groupCode: "CS-02", groupTitle: "Resorts, Campamentos, Glamping y Complejos", serviceCategoryId: 2, subcategoryId: 8 },
  { id: "eco-lodges-ranchos", label: "Eco-Lodges & Ranchos", directorySlug: "ecolodges", groupCode: "CS-02", groupTitle: "Resorts, Campamentos, Glamping y Complejos", serviceCategoryId: 2, subcategoryId: 8 },
  { id: "glamping-domos", label: "Glamping & Domos", directorySlug: "glamping", groupCode: "CS-02", groupTitle: "Resorts, Campamentos, Glamping y Complejos", serviceCategoryId: 2, subcategoryId: 8 },
  { id: "apartahoteles", label: "Apartahoteles & Suites Ejecutivas", directorySlug: "hoteles", groupCode: "CS-02", groupTitle: "Resorts, Campamentos, Glamping y Complejos", serviceCategoryId: 2, subcategoryId: 7 },
  { id: "marinas-club-nautico", label: "Marinas & Clubes Náuticos", directorySlug: "complejos", groupCode: "CS-02", groupTitle: "Resorts, Campamentos, Glamping y Complejos", serviceCategoryId: 2, subcategoryId: 10 },

  // CS-03: Villas, Casas, Cabañas y Apartamentos Vacacionales
  { id: "villa-casa-playa", label: "Villa / Casa de Playa", directorySlug: "casas", groupCode: "CS-03", groupTitle: "Villas, Casas, Cabañas y Apartamentos", serviceCategoryId: 3, subcategoryId: 11 },
  { id: "casas-chalets-fincas", label: "Casas, Chalets, Villas, Hatos y Haciendas", directorySlug: "casas", groupCode: "CS-03", groupTitle: "Villas, Casas, Cabañas y Apartamentos", serviceCategoryId: 3, subcategoryId: 11 },
  { id: "cabanas-montana", label: "Cabañas & Chalets de Montaña / Páramo", directorySlug: "casas", groupCode: "CS-03", groupTitle: "Villas, Casas, Cabañas y Apartamentos", serviceCategoryId: 3, subcategoryId: 12 },
  { id: "apartamentos-vacacionales", label: "Apartamentos Turísticos & Vacacionales", directorySlug: "casas", groupCode: "CS-03", groupTitle: "Villas, Casas, Cabañas y Apartamentos", serviceCategoryId: 3, subcategoryId: 13 },

  // CS-04: Embarcaciones y Servicios Náuticos
  { id: "yate-barco-marina", label: "Yate / Barco en Marina (Alojamiento Estático)", directorySlug: "nautico", groupCode: "CS-04", groupTitle: "Embarcaciones, Yates y Servicios Náuticos", serviceCategoryId: 4, subcategoryId: 15 },
  { id: "yate-charter-navegacion", label: "Yate / Catamarán con Navegación Diaria (Charter)", directorySlug: "nautico", groupCode: "CS-04", groupTitle: "Embarcaciones, Yates y Servicios Náuticos", serviceCategoryId: 4, subcategoryId: 16 },

  // CS-05 & CS-06: Restaurantes, Beach Clubs, Gastronomía y Vida Nocturna
  { id: "restaurante-beach-club", label: "Restaurante & Beach Club", directorySlug: "restaurantes", groupCode: "CS-05", groupTitle: "Restaurantes, Beach Clubs & Gastronomía", serviceCategoryId: 5, subcategoryId: 31 },
  { id: "restaurantes-gastronomia", label: "Restaurantes & Gastronomía", directorySlug: "restaurantes", groupCode: "CS-05", groupTitle: "Restaurantes, Beach Clubs & Gastronomía", serviceCategoryId: 5, subcategoryId: 31 },
  { id: "cafeterias-bares-tapas", label: "Cafeterías, Bistró & Bares de Tapas", directorySlug: "restaurantes", groupCode: "CS-05", groupTitle: "Restaurantes, Beach Clubs & Gastronomía", serviceCategoryId: 5, subcategoryId: 32 },
  { id: "discotecas-rooftop-lounge", label: "Rooftop, Lounge & Vida Nocturna", directorySlug: "restaurantes", groupCode: "CS-06", groupTitle: "Restaurantes, Beach Clubs & Gastronomía", serviceCategoryId: 6, subcategoryId: 34 },

  // CS-07, CS-08 & CS-09: Parques, Transporte, Agencias y Creadores Oficiales
  { id: "parques-acuaticos-tematicos", label: "Parques Acuáticos & Atracciones Turísticas", directorySlug: "parques", groupCode: "CS-07", groupTitle: "Parques, Agencias, Transporte y Creadores", serviceCategoryId: 7, subcategoryId: 35 },
  { id: "agencias-tour-operadores", label: "Agencias de Viajes, Tour Operadores & DMC", directorySlug: "agencias", groupCode: "CS-09", groupTitle: "Parques, Agencias, Transporte y Creadores", serviceCategoryId: 9, subcategoryId: 37 },
  { id: "rent-a-car-transporte", label: "Rent-a-Car & Transporte Turístico / Lanchas", directorySlug: "transporte", groupCode: "CS-08", groupTitle: "Parques, Agencias, Transporte y Creadores", serviceCategoryId: 8, subcategoryId: 39 },
  { id: "creadores-influencers", label: "Creadores de Contenido & Influencers Oficiales", directorySlug: "influencers", groupCode: "CS-09", groupTitle: "Parques, Agencias, Transporte y Creadores", serviceCategoryId: 9, subcategoryId: 38 }
];

export function PreRegistro() {
  const [, setLocation] = useLocation();
  const { user } = useAuth();
  const { bcvRate } = useBcvExchangeRate();

  // Estados del Formulario de Pre-Registro (Ficha Pública)
  const [serviceCategoryId, setServiceCategoryId] = useState<number>(1);
  const [subcategoryId, setSubcategoryId] = useState<number>(2); // Posadas por defecto
  const [categoryName, setCategoryName] = useState<string>("Posada Boutique");
  const [dynamicCategories, setDynamicCategories] = useState<UnifiedPreRegCategoryOption[]>(UNIFIED_PLATFORM_CATEGORIES);

  // Cargar y fusionar categorías adicionales desde Supabase `categories` y `SERVICE_SUBCATEGORIES_V15` para 100% cobertura
  useEffect(() => {
    async function loadUnifiedCategories() {
      const merged = [...UNIFIED_PLATFORM_CATEGORIES];
      const existingLabels = new Set(merged.map((c) => c.label.toLowerCase().trim()));

      // Incorporar cualquier subcategoría oficial del catálogo maestro V15 que no esté explícita
      for (const sub of SERVICE_SUBCATEGORIES_V15) {
        if (!existingLabels.has(sub.name.toLowerCase().trim())) {
          const parentCat = SERVICE_CATEGORIES_V15.find((c) => c.id === sub.serviceCategoryId);
          existingLabels.add(sub.name.toLowerCase().trim());
          merged.push({
            id: `v15-${sub.code.toLowerCase()}`,
            label: sub.name,
            directorySlug: sub.name.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
            groupCode: parentCat?.code || "CS-01",
            groupTitle: parentCat?.frontTitle || "Otras Categorías Oficiales V15",
            serviceCategoryId: sub.serviceCategoryId,
            subcategoryId: sub.id
          });
        }
      }

      try {
        const { data } = await supabase.from("categories").select("id, name, slug").order("name");
        if (Array.isArray(data)) {
          for (const dbCat of data) {
            if (dbCat?.name && !existingLabels.has(String(dbCat.name).toLowerCase().trim())) {
              existingLabels.add(String(dbCat.name).toLowerCase().trim());
              merged.push({
                id: `db-${dbCat.slug || dbCat.id}`,
                label: dbCat.name,
                directorySlug: dbCat.slug || String(dbCat.name).toLowerCase().replace(/[^a-z0-9]+/g, "-"),
                groupCode: "DB-CAT",
                groupTitle: "Categorías del Directorio Activo",
                serviceCategoryId: 1,
                subcategoryId: 1
              });
            }
          }
        }
      } catch {}

      setDynamicCategories(merged);
    }
    loadUnifiedCategories();
  }, []);

  const handleSelectCategoryByName = (selectedLabel: string) => {
    setCategoryName(selectedLabel);
    const found = dynamicCategories.find(
      (c) => c.label.toLowerCase().trim() === selectedLabel.toLowerCase().trim()
    );
    if (found) {
      setServiceCategoryId(found.serviceCategoryId);
      setSubcategoryId(found.subcategoryId);
    }
  };
  const [title, setTitle] = useState<string>("Posada Paraíso Azul");
  const [destinationName, setDestinationName] = useState<string>("Morrocoy");
  const [state, setState] = useState<string>("Falcón");
  const [city, setCity] = useState<string>("Tucacas");
  const [ratingAvg, setRatingAvg] = useState<number>(4.9);
  const [shortDescription, setShortDescription] = useState<string>(
    "Exclusiva posada frente a los cayos más cristalinos de Morrocoy. Muelle privado, gastronomía marina y atención de primer nivel."
  );
  const [showOfficialPrice, setShowOfficialPrice] = useState<boolean>(false);
  const [basePriceFrom, setBasePriceFrom] = useState<number>(0);
  const [whatsappNumber, setWhatsappNumber] = useState<string>("+58 412 1234567");
  const [officialEmail, setOfficialEmail] = useState<string>("");
  const [officialWebsiteOrInstagram, setOfficialWebsiteOrInstagram] = useState<string>("");

  // Inventario Real de Habitaciones / Unidades (Sin plantillas ficticias; solo lo que el propietario o agente agregue)
  const [realRoomsInventory, setRealRoomsInventory] = useState<
    Array<{
      name: string;
      capacity: number;
      price_per_night: number;
      size_m2?: number;
      beds_summary: string;
      amenities: string;
    }>
  >([]);
  const [newRoomName, setNewRoomName] = useState<string>("");
  const [newRoomCapacity, setNewRoomCapacity] = useState<number>(2);
  const [newRoomBedsSummary, setNewRoomBedsSummary] = useState<string>("");
  const [newRoomAmenities, setNewRoomAmenities] = useState<string>("");
  const [newRoomPrice, setNewRoomPrice] = useState<number>(0);

  const handleAddRealRoom = () => {
    const cleanName = newRoomName.trim();
    if (!cleanName) return;
    setRealRoomsInventory((prev) => [
      ...prev,
      {
        name: cleanName,
        capacity: Math.max(1, Number(newRoomCapacity) || 2),
        price_per_night: showOfficialPrice && Number(newRoomPrice) > 0 ? Number(newRoomPrice) : 0,
        beds_summary: newRoomBedsSummary.trim(),
        amenities: newRoomAmenities.trim()
      }
    ]);
    setNewRoomName("");
    setNewRoomCapacity(2);
    setNewRoomBedsSummary("");
    setNewRoomAmenities("");
    setNewRoomPrice(0);
  };

  const handleRemoveRealRoom = (idx: number) => {
    setRealRoomsInventory((prev) => prev.filter((_, i) => i !== idx));
  };

  // GPS & Ubicación en tiempo real desde celular/dispositivo
  const [latitude, setLatitude] = useState<string>("");
  const [longitude, setLongitude] = useState<string>("");
  const [isCapturingGps, setIsCapturingGps] = useState<boolean>(false);
  const [gpsSuccessMsg, setGpsSuccessMsg] = useState<string | null>(null);
  const [gpsErrorMsg, setGpsErrorMsg] = useState<string | null>(null);

  // Fotos & Archivos del Establecimiento
  const [primaryImage, setPrimaryImage] = useState<string>(
    ""
  );
  const [galleryImages, setGalleryImages] = useState<string[]>([]);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState<boolean>(false);
  const [photoUrlInput, setPhotoUrlInput] = useState<string>("");

  // Estado de Publicación Directa (Agente en Ruta)
  const [publishDirectly, setPublishDirectly] = useState<boolean>(true);

  // Badges Destacados (Sin inyección por defecto de Starlink, Pet Friendly, Planta o Agua no seleccionados)
  const [badges, setBadges] = useState<PreRegistrationBadgeFlags>({
    has_power_plant: false,
    has_water_247: false,
    has_starlink: false,
    is_pet_friendly: false,
    has_hdv_seal: true
  });

  // Pills / Etiquetas Secundarias Seleccionadas (Inicia limpia sin etiquetas pre-rellenadas por defecto)
  const [pills, setPills] = useState<string[]>([]);

  const [customPillInput, setCustomPillInput] = useState<string>("");
  const [customPillSuggestions, setCustomPillSuggestions] = useState<string[]>([]);
  const [pillErrorMsg, setPillErrorMsg] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [saveSuccess, setSaveSuccess] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<"card_form" | "bedrooms_config">("card_form");

  // =========================================================================
  // NUEVOS ESTADOS DEL DEPARTAMENTO DE VENTAS Y SINCRONIZACIÓN FINANCIERA V13
  // =========================================================================
  const [origin, setOrigin] = useState<RegistrationOrigin>("propietario");
  const [ownerOrManagerName, setOwnerOrManagerName] = useState<string>("");
  const [selectedAgentCode, setSelectedAgentCode] = useState<string>(OFFICIAL_SALES_AGENTS[0].code);
  const [customAgentName, setCustomAgentName] = useState<string>(OFFICIAL_SALES_AGENTS[0].name);

  const [modality, setModality] = useState<MembershipModality>("fundadores_50");
  const [selectedPlanId, setSelectedPlanId] = useState<string>("premium");
  const [customMonthlyUsd, setCustomMonthlyUsd] = useState<number>(100);
  const [initialPaymentStatus, setInitialPaymentStatus] = useState<"pendiente_pago" | "pagado">("pendiente_pago");
  const [termsAccepted, setTermsAccepted] = useState<boolean>(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  const [salesCounters, setSalesCounters] = useState<SalesCountersState>(() => getSalesCounters());
  const [emittedReceipt, setEmittedReceipt] = useState<SalesPreRegistrationReceipt | null>(null);
  const [detectedExistingMatch, setDetectedExistingMatch] = useState<ExistingEstablishmentMatch | null>(null);

  // =========================================================================
  // MODO DE REVISIÓN Y VALIDACIÓN DE FICHA OFICIAL (?folio=HDV-PR-2026-... o ?slug=...)
  // =========================================================================
  const [isClientReviewMode, setIsClientReviewMode] = useState<boolean>(false);
  const [isFolioValidatedAndLocked, setIsFolioValidatedAndLocked] = useState<boolean>(false);
  const [validatedTimestampLabel, setValidatedTimestampLabel] = useState<string | null>(null);
  const [protectedFolio, setProtectedFolio] = useState<string | null>(null);
  const [protectedSlotNumber, setProtectedSlotNumber] = useState<number | null>(null);
  const [preloadedSlug, setPreloadedSlug] = useState<string | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (!title.trim() && !whatsappNumber.trim()) {
        setDetectedExistingMatch(null);
        return;
      }
      findExistingEstablishmentMatch({
        title: title.trim(),
        whatsappNumber: whatsappNumber.trim()
      }).then((match) => {
        setDetectedExistingMatch(match);
      });
    }, 350);
    return () => clearTimeout(timer);
  }, [title, whatsappNumber]);

  useEffect(() => {
    async function initPreRegistroAndCheckUrl() {
      // IMPORTANTE: Abrir o visitar el enlace es 100% de SOLO LECTURA (NO muta la base de datos,
      // NO incrementa el contador de cupos y NO bloquea ni invalida el enlace).
      const res = await syncSalesStateFromSupabase();
      setSalesCounters(getSalesCounters());

      if (typeof window === "undefined") return;
      const params = new URLSearchParams(window.location.search);
      const urlFolio = (params.get("folio") || "").trim().toUpperCase();
      const urlSlug = (params.get("slug") || "").trim().toLowerCase();
      const urlContact = (params.get("contacto") || "").trim();
      const urlNivel = (params.get("nivel") || "").trim();

      if (!urlFolio && !urlSlug) return;

      const allReceipts = getSalesReceipts();
      const matchedReceipt =
        (urlFolio ? getReceiptByFolio(urlFolio) : null) ||
        allReceipts.find(
          (r) =>
            (urlFolio && r.folio.toUpperCase() === urlFolio) ||
            (urlSlug && r.establishmentSlug && r.establishmentSlug.toLowerCase() === urlSlug)
        ) ||
        null;

      // Hidratación directa desde el catálogo de invitaciones precargadas o ESTABLISHMENTS_MOCK
      // si el cliente o auditor abre el enlace desde su navegador antes de que exista en su almacenamiento local
      const officialTemplate = OFFICIAL_PRELOADED_INVITATIONS.find(
        (tpl) =>
          (urlFolio && tpl.defaultFolio.toUpperCase() === urlFolio) ||
          (urlSlug && tpl.slug.toLowerCase() === urlSlug)
      );

      if (matchedReceipt) {
        setIsClientReviewMode(true);
        setProtectedFolio(matchedReceipt.folio);
        setProtectedSlotNumber(matchedReceipt.founderSlotNumber);
        setPreloadedSlug(matchedReceipt.establishmentSlug || urlSlug || null);

        // Un enlace precargado (`precargado_pendiente` o `termsAccepted === false`) permanece 100% abierto y editable.
        // Solo pasa a estado "Validado / Bloqueado" cuando el cliente ya marcó términos y confirmó (`confirmado_activo`).
        const alreadyValidatedByClient =
          matchedReceipt.invitationStatus === "confirmado_activo" &&
          matchedReceipt.termsAccepted === true;

        setIsFolioValidatedAndLocked(alreadyValidatedByClient);
        setValidatedTimestampLabel(
          alreadyValidatedByClient
            ? matchedReceipt.confirmedAtFormatted || matchedReceipt.updatedAtFormatted || matchedReceipt.createdAtFormatted
            : null
        );

        setTitle(matchedReceipt.establishmentTitle || "");
        if (matchedReceipt.categoryName) {
          handleSelectCategoryByName(matchedReceipt.categoryName);
        }
        setDestinationName(matchedReceipt.destinationName || "");
        setState(matchedReceipt.state || "");
        setCity(matchedReceipt.city || "");
        setWhatsappNumber(matchedReceipt.whatsappNumber || "");
        setOfficialEmail(matchedReceipt.officialEmail || "");
        setOfficialWebsiteOrInstagram(matchedReceipt.officialWebsite || officialTemplate?.officialWebsite || "");
        setShortDescription(
          matchedReceipt.shortDescription ||
            officialTemplate?.shortDescription ||
            ""
        );
        if (matchedReceipt.primaryImage) {
          const resolvedPrimary = (matchedReceipt.primaryImage && matchedReceipt.primaryImage.includes("unsplash.com")) ? "" : (matchedReceipt.primaryImage || "");
          setPrimaryImage(resolvedPrimary);
          setGalleryImages(
            Array.isArray(matchedReceipt.galleryImages) ? matchedReceipt.galleryImages.filter((u) => !u.includes("unsplash.com")) : (resolvedPrimary ? [resolvedPrimary] : [])
          );
        }
        if (matchedReceipt.latitude || officialTemplate?.latitude) {
          setLatitude(matchedReceipt.latitude || officialTemplate?.latitude || "");
        }
        if (matchedReceipt.longitude || officialTemplate?.longitude) {
          setLongitude(matchedReceipt.longitude || officialTemplate?.longitude || "");
        }

        // Regla estricta: 0 habitaciones inventadas y 0 etiquetas no confirmadas
        setBadges({
          has_power_plant: Boolean(matchedReceipt.badges?.has_power_plant),
          has_water_247: Boolean(matchedReceipt.badges?.has_water_247),
          has_starlink: Boolean(matchedReceipt.badges?.has_starlink),
          is_pet_friendly: Boolean(matchedReceipt.badges?.is_pet_friendly),
          has_hdv_seal: matchedReceipt.badges?.has_hdv_seal ?? true
        });
        setPills(
          Array.isArray(matchedReceipt.keyServicePills) && matchedReceipt.keyServicePills.length > 0
            ? matchedReceipt.keyServicePills
            : (matchedReceipt.folio === "HDV-PR-2026-0005" || matchedReceipt.establishmentSlug === "waku-lodge-canaima")
              ? ["Excursiones al Salto Ángel", "Alimentación gourmet", "Bar lounge", "Wi-Fi satelital"]
              : []
        );
        setRealRoomsInventory(
          Array.isArray(matchedReceipt.realRooms)
            ? matchedReceipt.realRooms.map((rm) => ({
                name: rm.name,
                capacity: rm.capacity || 2,
                price_per_night: rm.price_per_night || 0,
                size_m2: rm.size_m2,
                beds_summary: rm.beds_summary || "",
                amenities: rm.amenities || ""
              }))
            : []
        );

        const cleanContact =
          urlContact ||
          matchedReceipt.contactPersonName ||
          matchedReceipt.registrantName.replace(/^Propietario \/ Gerente:\s*/i, "") ||
          officialTemplate?.contactPersonName ||
          "";
        setOrigin("propietario");
        setOwnerOrManagerName(cleanContact);
        setModality(
          urlNivel === "estandar_connect"
            ? "comercial_estandar"
            : matchedReceipt.modality || "exclusivo_prestigio"
        );
        // Si aún está pendiente de validación por el cliente, el checkbox inicia desmarcado
        setTermsAccepted(alreadyValidatedByClient);
        return;
      }

      if (officialTemplate) {
        setIsClientReviewMode(true);
        setProtectedFolio(urlFolio || officialTemplate.defaultFolio);
        setPreloadedSlug(officialTemplate.slug);
        setTitle(officialTemplate.establishmentTitle);
        handleSelectCategoryByName(officialTemplate.categoryName);
        setDestinationName(officialTemplate.destinationName);
        setState(officialTemplate.state);
        setCity(officialTemplate.city);
        setWhatsappNumber(officialTemplate.whatsappNumber);
        setOfficialEmail(officialTemplate.officialEmail || "");
        setOfficialWebsiteOrInstagram(officialTemplate.officialWebsite || "");
        setShortDescription(officialTemplate.shortDescription);
        setPrimaryImage(officialTemplate.primaryImage);
        setGalleryImages(officialTemplate.galleryImages || [officialTemplate.primaryImage]);
        setLatitude(officialTemplate.latitude || "");
        setLongitude(officialTemplate.longitude || "");
        setBadges({
          has_power_plant: false,
          has_water_247: false,
          has_starlink: false,
          is_pet_friendly: false,
          has_hdv_seal: true
        });
        setPills([]);
        setRealRoomsInventory([]);
        setOrigin("propietario");
        setOwnerOrManagerName(urlContact || officialTemplate.contactPersonName);
        setModality(officialTemplate.modality);
        setTermsAccepted(false);
        return;
      }

      // Fallback universal si se pasa ?slug=... de cualquier establecimiento del directorio
      const dirEst = ESTABLISHMENTS_MOCK.find(
        (item) => item.slug.toLowerCase() === urlSlug
      );
      if (dirEst) {
        setIsClientReviewMode(true);
        setProtectedFolio(
          urlFolio ||
            `HDV-PR-2026-${String(res.counters.preRegCounter + 1).padStart(4, "0")}`
        );
        setPreloadedSlug(dirEst.slug);
        setTitle(dirEst.name);
        handleSelectCategoryByName(dirEst.category_name || "Posada Boutique");
        setDestinationName(dirEst.destination_name || "");
        const addrParts = (dirEst.address || "").split(",").map((s) => s.trim()).filter(Boolean);
        setCity(addrParts[0] || dirEst.destination_name || "");
        setState(addrParts[addrParts.length - 1] || dirEst.destination_name || "");
        setWhatsappNumber(dirEst.whatsapp || dirEst.phone || "");
        setOfficialWebsiteOrInstagram(dirEst.website || "");
        setShortDescription(dirEst.description || "");
        setPrimaryImage(dirEst.primary_image || "");
        setGalleryImages(dirEst.primary_image ? [dirEst.primary_image] : []);
        setBadges({
          has_power_plant: false,
          has_water_247: false,
          has_starlink: false,
          is_pet_friendly: false,
          has_hdv_seal: true
        });
        setPills([]);
        setRealRoomsInventory([]);
        setOrigin("propietario");
        setOwnerOrManagerName(urlContact || "");
        setModality(
          urlNivel === "estandar_connect" ? "comercial_estandar" : "exclusivo_prestigio"
        );
        setTermsAccepted(false);
      }
    }

    initPreRegistroAndCheckUrl();
    const handleSync = () => setSalesCounters(getSalesCounters());
    window.addEventListener("hdv_sales_v13_updated", handleSync);
    return () => window.removeEventListener("hdv_sales_v13_updated", handleSync);
  }, []);

  const currentPlanObj =
    SAAS_COMMERCIAL_PLANS.find((p) => p.id === selectedPlanId) || SAAS_COMMERCIAL_PLANS[6];

  const foundersOccupied = Math.min(MAX_FOUNDERS_QUOTA, salesCounters.foundersCounter);
  const foundersAvailable = Math.max(0, MAX_FOUNDERS_QUOTA - foundersOccupied);

  const defaultPillSuggestions = [
    "Muelle privado",
    "Lanchas propias",
    "Gastronomía de mar",
    "Excursiones a Cayos",
    "Confort Premium",
    "Transporte VIP",
    "Planta eléctrica 24/7",
    "Piscina infinita",
    "Chef privado"
  ];

  // Captura de GPS inteligente desde el navegador / dispositivo móvil
  const handleCaptureGps = () => {
    if (!navigator.geolocation) {
      setGpsErrorMsg("Tu navegador o dispositivo no soporta geolocalización por GPS.");
      return;
    }
    setIsCapturingGps(true);
    setGpsErrorMsg(null);
    setGpsSuccessMsg(null);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude.toFixed(6);
        const lng = position.coords.longitude.toFixed(6);
        setLatitude(lat);
        setLongitude(lng);
        setIsCapturingGps(false);
        setGpsSuccessMsg(`📍 Coordenadas detectadas: ${lat}, ${lng}`);
      },
      (error) => {
        setIsCapturingGps(false);
        switch (error.code) {
          case error.PERMISSION_DENIED:
            setGpsErrorMsg("Permiso de ubicación denegado. Activa la ubicación en los ajustes de tu celular.");
            break;
          case error.POSITION_UNAVAILABLE:
            setGpsErrorMsg("Ubicación GPS no disponible en este momento.");
            break;
          case error.TIMEOUT:
            setGpsErrorMsg("Tiempo de espera agotado para conectar con el GPS del dispositivo.");
            break;
          default:
            setGpsErrorMsg("Error al obtener señal del GPS.");
        }
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
    );
  };

  // Carga de Imagen Principal (Portada)
  const handlePrimaryPhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploadingPhoto(true);
    let uploadedUrl = "";
    const fileExt = file.name.split(".").pop() || "jpg";
    const fileName = `prereg_cover_${Date.now()}_${Math.random().toString(36).substring(2, 7)}.${fileExt}`;

    try {
      const { data, error } = await supabase.storage
        .from("establecimientos")
        .upload(fileName, file, { contentType: file.type || "image/jpeg", upsert: true });

      if (!error && data) {
        const { data: publicUrlData } = supabase.storage
          .from("establecimientos")
          .getPublicUrl(fileName);
        if (publicUrlData?.publicUrl) {
          uploadedUrl = publicUrlData.publicUrl;
        }
      }
    } catch {}

    if (!uploadedUrl) {
      await new Promise<void>((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          if (typeof reader.result === "string") uploadedUrl = reader.result;
          resolve();
        };
        reader.readAsDataURL(file);
      });
    }

    if (uploadedUrl) {
      setPrimaryImage(uploadedUrl);
      setGalleryImages((prev) => {
        const base = prev.filter((u) => typeof u === "string" && u.trim().length > 0);
        return base.includes(uploadedUrl) ? base : [uploadedUrl, ...base];
      });
    }
    setIsUploadingPhoto(false);
    e.target.value = "";
  };

  // Carga de Múltiples Imágenes para la Galería del Establecimiento
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploadingPhoto(true);
    const newImages: string[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const fileExt = file.name.split(".").pop() || "jpg";
      const fileName = `prereg_${Date.now()}_${Math.random().toString(36).substring(2, 7)}.${fileExt}`;

      try {
        const { data, error } = await supabase.storage
          .from("establecimientos")
          .upload(fileName, file, { contentType: file.type || "image/jpeg", upsert: true });

        if (!error && data) {
          const { data: publicUrlData } = supabase.storage
            .from("establecimientos")
            .getPublicUrl(fileName);
          if (publicUrlData?.publicUrl) {
            newImages.push(publicUrlData.publicUrl);
            continue;
          }
        }
      } catch (err) {
        console.warn("Error en Supabase storage, usando lector Base64 local:", err);
      }

      // Fallback a Base64 Data URL local
      await new Promise<void>((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          if (typeof reader.result === "string") {
            newImages.push(reader.result);
          }
          resolve();
        };
        reader.readAsDataURL(file);
      });
    }

    setGalleryImages((prev) => {
      const base = prev.filter((u) => typeof u === "string" && u.trim().length > 0);
      const updated = Array.from(new Set([...base, ...newImages]));
      if (!primaryImage || primaryImage.includes("unsplash.com")) {
        setPrimaryImage(updated[0]);
      }
      return updated;
    });
    setIsUploadingPhoto(false);
    e.target.value = "";
  };

  // Agregar foto vía URL manual
  const handleAddPhotoUrl = () => {
    if (photoUrlInput.trim()) {
      const cleanUrl = photoUrlInput.trim();
      setGalleryImages((prev) => {
        const base = prev.filter((u) => typeof u === "string" && u.trim().length > 0);
        return base.includes(cleanUrl) ? base : [...base, cleanUrl];
      });
      if (!primaryImage || !primaryImage.trim()) {
        setPrimaryImage(cleanUrl);
      }
      setPhotoUrlInput("");
    }
  };

  const removePhoto = (index: number) => {
    const cleanCurrent = galleryImages.filter((u) => typeof u === "string" && u.trim().length > 0);
    const removedUrl = cleanCurrent[index];
    const updated = cleanCurrent.filter((_, idx) => idx !== index);
    setGalleryImages(updated);
    if (primaryImage === removedUrl || !primaryImage.trim()) {
      setPrimaryImage(updated[0] || "");
    }
  };

  const toggleBadge = (key: keyof PreRegistrationBadgeFlags) => {
    setBadges(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const MAX_PILLS_COUNT = 6;
  const MAX_PILL_CHARS = 24;

  const togglePill = (pill: string) => {
    setPillErrorMsg(null);
    if (pills.includes(pill)) {
      setPills(pills.filter((p) => p !== pill));
    } else {
      if (pills.length >= MAX_PILLS_COUNT) {
        setPillErrorMsg(
          `Ya seleccionaste el máximo de ${MAX_PILLS_COUNT} etiquetas. Desmarca alguna para seleccionar o añadir otra.`
        );
        return;
      }
      setPills([...pills, pill]);
    }
  };

  const handleAddCustomPill = (e?: React.FormEvent | React.MouseEvent) => {
    if (e) e.preventDefault();
    setPillErrorMsg(null);

    const cleaned = customPillInput
      .replace(/\s+/g, " ")
      .trim()
      .slice(0, MAX_PILL_CHARS);

    if (!cleaned) {
      setPillErrorMsg("Escribe el nombre de la etiqueta antes de pulsar Añadir Pill.");
      return;
    }

    const existingMatch = [...defaultPillSuggestions, ...customPillSuggestions, ...pills].find(
      (p) => p.toLowerCase() === cleaned.toLowerCase()
    );
    const finalPill = existingMatch || cleaned;

    // Si ya está activa, limpiar input e informar
    if (pills.some((p) => p.toLowerCase() === finalPill.toLowerCase())) {
      setCustomPillInput("");
      setPillErrorMsg(`La etiqueta "${finalPill}" ya está seleccionada y activa.`);
      return;
    }

    // Si alcanzó el límite de 6, mostrar mensaje claro
    if (pills.length >= MAX_PILLS_COUNT) {
      setPillErrorMsg(
        `Alcanzaste el límite máximo de ${MAX_PILLS_COUNT} etiquetas activas. Desmarca alguna etiqueta de la lista para añadir "${finalPill}".`
      );
      return;
    }

    // Agregar al catálogo de pills visibles si no está en las sugerencias base
    if (
      !defaultPillSuggestions.some((p) => p.toLowerCase() === finalPill.toLowerCase()) &&
      !customPillSuggestions.some((p) => p.toLowerCase() === finalPill.toLowerCase())
    ) {
      setCustomPillSuggestions((prev) => [...prev, finalPill]);
    }

    // Seleccionar / activar inmediatamente la nueva pill
    setPills((prev) => [...prev, finalPill]);
    setCustomPillInput("");
  };

  const generateSlug = (text: string) => {
    return text
      .toLowerCase()
      .trim()
      .replace(/[\s\W-]+/g, "-")
      .replace(/^-+|-+$/g, "");
  };

  const handleSavePreRegistration = async () => {
    setValidationError(null);

    if (!title.trim() || !destinationName.trim() || !whatsappNumber.trim()) {
      setValidationError(
        "Por favor completa el Nombre Comercial, el Destino Turístico y el WhatsApp de Contacto."
      );
      return;
    }

    if (origin === "agente_ventas" && !customAgentName.trim()) {
      setValidationError("Por favor indica el nombre o código del Agente de Ventas HDV.");
      return;
    }

    if (!termsAccepted) {
      setValidationError(
        "Debes marcar la casilla obligatoria de Términos Legales y Derechos de Imagen para emitir el comprobante oficial."
      );
      return;
    }

    try {
      setIsSaving(true);
      const generatedCandidateSlug = `${generateSlug(title)}-${generateSlug(destinationName)}`;

      // 0. RECONOCIMIENTO AUTOMÁTICO (UPSERT SIN DUPLICADOS):
      // Verificar si ya existe un establecimiento o cliente con el mismo nombre normalizado o el mismo WhatsApp/teléfono
      const existingMatch = await findExistingEstablishmentMatch({
        title: title.trim(),
        whatsappNumber: whatsappNumber.trim(),
        candidateSlug: generatedCandidateSlug
      });

      // Mantener limpio el slug/URL original si ya existía, o usar el nuevo si es un registro nuevo
      const slug =
        preloadedSlug ||
        (existingMatch?.slug ? existingMatch.slug : generatedCandidateSlug);
      const wasConsolidatedExisting = Boolean(isClientReviewMode || existingMatch?.matched);
      const consolidatedMatchReason = existingMatch?.matchReason || (isClientReviewMode ? "slug" : null);
      const existingEstId = existingMatch?.id ?? null;

      const onboardingStatus = publishDirectly ? "COMPLETED" : "PRE_REGISTERED";
      const status = publishDirectly ? "ACTIVE" : "ACTIVE";

      const effectiveBasePrice = showOfficialPrice && basePriceFrom > 0 ? basePriceFrom : 0;

      const payload: PreRegistrationPayload & Record<string, any> = {
        service_category_id: serviceCategoryId,
        subcategory_id: subcategoryId,
        category_name: categoryName,
        title,
        slug,
        destination_name: destinationName,
        state,
        city,
        badges,
        rating_avg: ratingAvg,
        key_service_pills: pills,
        short_description: shortDescription,
        base_price_from: effectiveBasePrice,
        whatsapp_number: whatsappNumber,
        official_email: officialEmail.trim(),
        official_website: officialWebsiteOrInstagram.trim(),
        real_rooms: realRoomsInventory,
        primary_image: (primaryImage && primaryImage.trim().length > 0 ? primaryImage.trim() : (galleryImages.filter((u) => typeof u === "string" && u.trim().length > 0)[0] || "")),
        gallery_images: galleryImages.filter((u) => typeof u === "string" && u.trim().length > 0)
      };

      // 1. Procesar el Pre-Registro:
      // - Si viene de un enlace precargado o folio existente (isClientReviewMode && protectedFolio),
      //   confirmamos y actualizamos ese mismo folio inalterable sin duplicar registros ni alterar el contador de 50 cupos.
      // - Si es un registro nuevo manual, emite el siguiente folio correlativo.
      const receipt =
        isClientReviewMode && protectedFolio
          ? await confirmPreloadedPreRegistration({
              folio: protectedFolio,
              establishmentId: existingEstId,
              establishmentTitle: title.trim(),
              establishmentSlug: slug,
              categoryName,
              destinationName: destinationName.trim(),
              state: state.trim(),
              city: city.trim(),
              whatsappNumber: whatsappNumber.trim(),
              officialEmail: officialEmail.trim() || undefined,
              officialWebsite: officialWebsiteOrInstagram.trim() || undefined,
              shortDescription: shortDescription.trim() || undefined,
              primaryImage: (primaryImage && primaryImage.trim().length > 0 ? primaryImage.trim() : (galleryImages.filter((u) => typeof u === "string" && u.trim().length > 0)[0] || "")),
              galleryImages: galleryImages.filter((u) => typeof u === "string" && u.trim().length > 0),
              latitude: latitude || undefined,
              longitude: longitude || undefined,
              basePriceFrom: effectiveBasePrice,
              contactPersonName: ownerOrManagerName.trim() || title.trim(),
              modality,
              planId: selectedPlanId,
              bcvRate: bcvRate || 45.8,
              termsAccepted: true,
              badges,
              keyServicePills: pills,
              realRooms: realRoomsInventory,
              userId: user?.id || null,
              userEmail: user?.email || null
            })
          : await processSalesPreRegistration({
              establishmentId: existingEstId,
              wasConsolidatedExisting,
              consolidatedMatchReason,
              establishmentTitle: title.trim(),
              establishmentSlug: slug,
              categoryName,
              destinationName: destinationName.trim(),
              state: state.trim(),
              city: city.trim(),
              whatsappNumber: whatsappNumber.trim(),
              primaryImage,
              basePriceFrom: effectiveBasePrice,
              origin,
              ownerOrManagerName: ownerOrManagerName.trim() || undefined,
              salesAgentCode: origin === "agente_ventas" ? selectedAgentCode : undefined,
              salesAgentName: origin === "agente_ventas" ? customAgentName.trim() : undefined,
              modality,
              planId: selectedPlanId,
              customMonthlyUsd:
                origin === "agente_ventas"
                  ? customMonthlyUsd
                  : currentPlanObj.defaultMonthlyUsd,
              initialPaymentStatus,
              bcvRate: bcvRate || 45.8,
              termsAccepted,
              userId: user?.id || null,
              userEmail: user?.email || null,
              officialEmail: officialEmail.trim() || undefined,
              officialWebsite: officialWebsiteOrInstagram.trim() || undefined,
              shortDescription: shortDescription.trim() || undefined,
              badges,
              keyServicePills: pills,
              realRooms: realRoomsInventory
            });

      // Construcción JSONB para features incluyendo trazabilidad del folio y finanzas
      const initialFeatures = {
        pre_registration: {
          captured_at: receipt.createdAtIso,
          source: "DEPARTAMENTO_VENTAS_V13",
          published_directly: publishDirectly,
          was_consolidated_existing: wasConsolidatedExisting,
          consolidated_match_reason: consolidatedMatchReason,
          folio: receipt.folio,
          financial_correlative: receipt.financialCorrelative,
          modality: receipt.modality,
          modality_label: receipt.modalityLabel,
          origin: receipt.origin,
          registrant: receipt.registrantName,
          client_ip: receipt.clientIp,
          terms_accepted: true
        },
        gps: {
          latitude: latitude || null,
          longitude: longitude || null
        },
        badges: {
          "C03.4.1": badges.has_power_plant,
          "C03.4.2": badges.has_water_247,
          "C11.4.6": badges.has_starlink,
          "C06.2.1": badges.is_pet_friendly,
          "C00.5.9": badges.has_hdv_seal
        },
        commercial: {
          "C00.1.1": title,
          "C00.1.9": shortDescription,
          rating: ratingAvg,
          price_from: effectiveBasePrice,
          show_official_prices: showOfficialPrice && effectiveBasePrice > 0,
          pills: pills
        },
        contact: {
          "C00.3.2.6": whatsappNumber
        },
        gallery: galleryImages.filter((u) => typeof u === "string" && u.trim().length > 0)
      };

      const resolvedTier =
        modality === "fundadores_50"
          ? "fundador"
          : modality === "exclusivo_prestigio"
          ? "diamante"
          : currentPlanObj.tierKey;

      const resolvedIsFeatured =
        modality !== "comercial_estandar" || selectedPlanId === "premium" || selectedPlanId === "gold";

      const allPhotosToSave = Array.from(
        new Set([primaryImage, ...galleryImages].filter(Boolean))
      );

      // Arreglo consolidado únicamente con las pills seleccionadas y los badges que estén verdaderamente activos
      const consolidatedRealServices = buildConsolidatedServicesArray(pills, badges);

      // 2. ACTUALIZACIÓN Y CONSOLIDACIÓN EN SUPABASE (`properties`, `establishments` y `establishment_images`) SIN DUPLICAR
      let consolidatedDbId: number | string | null = existingEstId;
      try {
        await supabase.from("properties").upsert(
          {
            service_category_id: serviceCategoryId,
            subcategory_id: subcategoryId,
            title: title.trim(),
            slug,
            destination_name: destinationName.trim(),
            state: state.trim(),
            city: city.trim(),
            latitude: latitude ? parseFloat(latitude) : null,
            longitude: longitude ? parseFloat(longitude) : null,
            short_description: shortDescription.trim(),
            base_price_from: effectiveBasePrice,
            rating_avg: ratingAvg,
            whatsapp_number: whatsappNumber.trim(),
            primary_image: primaryImage,
            has_power_plant: badges.has_power_plant,
            has_water_247: badges.has_water_247,
            has_starlink: badges.has_starlink,
            is_pet_friendly: badges.is_pet_friendly,
            has_hdv_seal: badges.has_hdv_seal,
            key_service_pills: pills,
            onboarding_status: onboardingStatus,
            status: status,
            features: initialFeatures
          },
          { onConflict: "slug" }
        );

        const establishmentRecordPayload: Record<string, any> = {
          name: title.trim(),
          slug,
          description: shortDescription.trim(),
          address: `${city.trim()}, ${state.trim()}`,
          city: city.trim(),
          state: state.trim(),
          phone: whatsappNumber.trim(),
          whatsapp: whatsappNumber.trim(),
          email: officialEmail.trim() || undefined,
          website: officialWebsiteOrInstagram.trim() || undefined,
          rating_avg: ratingAvg,
          price_min: effectiveBasePrice > 0 ? effectiveBasePrice : null,
          base_price: effectiveBasePrice > 0 ? effectiveBasePrice : null,
          is_featured: resolvedIsFeatured,
          has_hdv_seal: badges.has_hdv_seal,
          membership_tier: resolvedTier,
          status: publishDirectly ? "approved" : "pending",
          services: JSON.stringify(consolidatedRealServices),
          latitude: latitude ? parseFloat(latitude) : null,
          longitude: longitude ? parseFloat(longitude) : null
        };

        if (existingMatch?.source === "supabase" && existingMatch.id) {
          const { data: updatedEst } = await supabase
            .from("establishments")
            .update(establishmentRecordPayload)
            .eq("id", existingMatch.id)
            .select("id")
            .maybeSingle();
          if (updatedEst?.id) consolidatedDbId = updatedEst.id;
        } else {
          const { data: upsertedEst } = await supabase
            .from("establishments")
            .upsert(establishmentRecordPayload, { onConflict: "slug" })
            .select("id")
            .maybeSingle();
          if (upsertedEst?.id) consolidatedDbId = upsertedEst.id;
        }

        // Sincronizar galería de fotos reales en `establishment_images` para el registro único consolidado
        if (consolidatedDbId && typeof consolidatedDbId === "number" && allPhotosToSave.length > 0) {
          await supabase
            .from("establishment_images")
            .delete()
            .eq("establishment_id", consolidatedDbId);
          await supabase.from("establishment_images").insert(
            allPhotosToSave.map((imgUrl, idx) => ({
              establishment_id: consolidatedDbId,
              image_url: imgUrl,
              is_primary: idx === 0
            }))
          );
        }
        // Sincronizar habitaciones reales si se registraron unidades en el Pre-Registro
        if (consolidatedDbId && typeof consolidatedDbId === "number" && realRoomsInventory.length > 0) {
          for (const rm of realRoomsInventory) {
            await supabase.from("rooms").insert({
              establishment_id: consolidatedDbId,
              name: rm.name,
              description: rm.beds_summary || "",
              capacity: rm.capacity || 2,
              price_per_night: rm.price_per_night || 0,
              amenities: rm.amenities || "",
              is_active: true
            });
          }
        }
      } catch (err) {
        console.warn("Modo local activo al consolidar establecimiento:", err);
      }

      // Sincronizar habitaciones reales en almacenamiento local `hdv_custom_rooms` si se agregaron
      if (realRoomsInventory.length > 0) {
        try {
          const localRoomsKey = "hdv_custom_rooms";
          const existingLocalRooms: any[] = JSON.parse(localStorage.getItem(localRoomsKey) || "[]");
          const estNumericId = typeof consolidatedDbId === "number" ? consolidatedDbId : existingMatch?.id || Date.now();
          const newLocalRooms = realRoomsInventory.map((rm, idx) => ({
            id: Date.now() + idx + 10,
            establishment_id: estNumericId,
            establishment_slug: slug,
            name: rm.name,
            description: rm.beds_summary || "",
            beds_summary: rm.beds_summary || "",
            capacity: rm.capacity || 2,
            price_per_night: rm.price_per_night || 0,
            amenities: rm.amenities || "",
            is_active: true
          }));
          localStorage.setItem(
            localRoomsKey,
            JSON.stringify([...newLocalRooms, ...existingLocalRooms])
          );
        } catch {}
      }

      // 3. CONSOLIDACIÓN EN LOCALSTORAGE (`hdv_mock_establishments` y `hdv_prereg_<slug>`) SIN DUPLICAR TARJETAS
      localStorage.setItem(`hdv_prereg_${slug}`, JSON.stringify(payload));
      try {
        const localEstsKey = "hdv_mock_establishments";
        const localEsts: any[] = JSON.parse(localStorage.getItem(localEstsKey) || "[]");
        const normNewName = normalizeEstablishmentName(title);
        const normNewPhone = normalizePhoneKey(whatsappNumber);
        const isPlaceholderPhone = normNewPhone === "4121234567";

        const filteredLocal = localEsts.filter((item: any) => {
          if (!item) return false;
          if (item.slug && String(item.slug).toLowerCase() === slug.toLowerCase()) return false;
          const itemNameNorm = normalizeEstablishmentName(item.name);
          if (normNewName && itemNameNorm && normNewName === itemNameNorm) return false;
          const itemPhoneNorm = normalizePhoneKey(item.whatsapp || item.phone);
          if (
            normNewPhone &&
            !isPlaceholderPhone &&
            itemPhoneNorm &&
            normNewPhone === itemPhoneNorm
          ) {
            return false;
          }
          return true;
        });

        const consolidatedLocalEntry = {
          id: typeof consolidatedDbId === "number" ? consolidatedDbId : existingMatch?.id || Date.now(),
          slug,
          name: title.trim(),
          description: shortDescription.trim(),
          address: `${city.trim()}, ${state.trim()}`,
          city: city.trim(),
          state: state.trim(),
          phone: whatsappNumber.trim(),
          whatsapp: whatsappNumber.trim(),
          email: officialEmail.trim(),
          website: officialWebsiteOrInstagram.trim(),
          category_name: categoryName,
          category_slug: generateSlug(categoryName),
          destination_name: destinationName.trim(),
          destination_slug: generateSlug(destinationName),
          primary_image: primaryImage,
          images: allPhotosToSave,
          establishment_images: allPhotosToSave.map((url, idx) => ({
            image_url: url,
            is_primary: idx === 0
          })),
          rating_avg: ratingAvg,
          review_count: 12,
          price_level: "$$$",
          price_min: effectiveBasePrice > 0 ? effectiveBasePrice : null,
          base_price: effectiveBasePrice > 0 ? effectiveBasePrice : null,
          show_official_prices: showOfficialPrice && effectiveBasePrice > 0,
          is_featured: resolvedIsFeatured,
          services: JSON.stringify(consolidatedRealServices),
          key_service_pills: pills,
          badges,
          has_power_plant: badges.has_power_plant,
          has_water_247: badges.has_water_247,
          has_starlink: badges.has_starlink,
          is_pet_friendly: badges.is_pet_friendly,
          membership_tier: resolvedTier,
          has_hdv_seal: badges.has_hdv_seal,
          latitude: latitude ? parseFloat(latitude) : null,
          longitude: longitude ? parseFloat(longitude) : null,
          status: publishDirectly ? "approved" : "pending"
        };

        localStorage.setItem(
          localEstsKey,
          JSON.stringify([consolidatedLocalEntry, ...filteredLocal])
        );
      } catch {}

      if (showOfficialPrice && effectiveBasePrice > 0) {
        localStorage.setItem(`hdv_show_official_prices_${slug}`, "true");
      } else {
        localStorage.removeItem(`hdv_show_official_prices_${slug}`);
      }
      setSalesCounters(getSalesCounters());
      setEmittedReceipt(receipt);
      if (isClientReviewMode) {
        setIsFolioValidatedAndLocked(true);
        setProtectedSlotNumber(receipt.founderSlotNumber);
        setValidatedTimestampLabel(
          receipt.confirmedAtFormatted || receipt.updatedAtFormatted || receipt.createdAtFormatted
        );
      }
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 6000);
    } catch (err) {
      console.error("Error al procesar pre-registro:", err);
      setValidationError("Ocurrió un error al procesar el registro. Intenta nuevamente.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 pb-20">
      
      {/* Banner Superior Corporativo (Directriz AGENTS.md: Full Bleed, Gradiente de Fondo, Sin Negro Puro) */}
      <div className="relative w-full bg-gradient-to-r from-[#0e011f] via-[#15062c] to-[#1a0533] text-white py-14 px-4 sm:px-6 lg:px-8 overflow-hidden">
        {/* Acentos de luz sutiles */}
        <div className="absolute top-0 right-1/4 w-[400px] h-[400px] bg-[#00C8D4]/10 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute bottom-0 left-1/4 w-[400px] h-[400px] bg-[#FF0096]/10 rounded-full blur-[100px] pointer-events-none" />

        <div className="max-w-7xl mx-auto relative z-10">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <Link href="/" className="inline-flex items-center gap-1.5 text-xs text-[#00C8D4] hover:text-white transition-colors mb-3">
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Volver al inicio</span>
              </Link>
              
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/20 text-xs font-bold uppercase tracking-wider text-[#00C8D4] mb-3 ml-3">
                <Sparkles className="w-3.5 h-3.5 text-[#FF0096]" />
                <span>
                  {isClientReviewMode
                    ? `Invitación Oficial Precargada • Folio ${protectedFolio}`
                    : "Módulo Oficial V13 • Onboarding Rápido"}
                </span>
              </div>

              <h1 className="text-3xl md:text-5xl font-black tracking-tight" style={{ fontFamily: "'Playfair Display', serif" }}>
                {isClientReviewMode
                  ? "Revisión y Validación de Ficha Oficial"
                  : "Pre-Registro de Ficha Pública"}
              </h1>
              <p className="text-sm md:text-base text-slate-300 mt-2 max-w-2xl">
                {isClientReviewMode ? (
                  <>
                    Bienvenido(a){ownerOrManagerName ? `, ${ownerOrManagerName}` : ""}. Hemos adelantado la ficha oficial de{" "}
                    <strong className="text-white">{title}</strong> con sus datos verificados. Revisa, edita o agrega tus habitaciones reales si lo deseas y confirma al final con un clic.
                  </>
                ) : (
                  <>
                    Registra tu propiedad capturando <strong>únicamente los datos visibles en la tarjeta pública</strong> para comenzar a recibir reservas inmediatamente por WhatsApp.
                  </>
                )}
              </p>
            </div>

            {/* Pestañas de Vista */}
            <div className="flex items-center gap-2 bg-white/10 p-1.5 rounded-2xl backdrop-blur-md border border-white/10 shrink-0">
              <button
                type="button"
                onClick={() => setActiveTab("card_form")}
                className={`px-4 py-2.5 rounded-xl text-xs font-black transition-all flex items-center gap-2 cursor-pointer ${
                  activeTab === "card_form"
                    ? "bg-[#00C8D4] text-slate-950 shadow-md"
                    : "text-white hover:bg-white/10"
                }`}
              >
                <Tag className="w-4 h-4" />
                <span>1. Ficha Pública</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("bedrooms_config")}
                className={`px-4 py-2.5 rounded-xl text-xs font-black transition-all flex items-center gap-2 cursor-pointer ${
                  activeTab === "bedrooms_config"
                    ? "bg-[#FF0096] text-white shadow-md"
                    : "text-white hover:bg-white/10"
                }`}
              >
                <BedDouble className="w-4 h-4" />
                <span>2. Dormitorios Flexibles (V13)</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Contenedor de Trabajo */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
        
        {saveSuccess && (
          <div className="mb-6 p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 flex items-center justify-between shadow-sm animate-fade-in">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-emerald-500 text-white flex items-center justify-center">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-black">
                  ¡Ficha Oficial Confirmada y Activada Exitosamente!
                </p>
                <p className="text-[11px] text-emerald-700">
                  La ficha pública de <strong>{title}</strong> ha quedado verificada y sincronizada en el directorio oficial.
                </p>
              </div>
            </div>
            <span className="text-[10px] font-mono bg-emerald-100 px-2.5 py-1 rounded-md text-emerald-900 font-bold">
              {protectedFolio || title}
            </span>
          </div>
        )}

        {/* RECUADRO EJECUTIVO DE BENEFICIO ASIGNADO (MODO REVISIÓN DEL CLIENTE) */}
        {isClientReviewMode && (
          <div className="mb-8 rounded-3xl bg-white border-2 border-[#00C8D4] p-6 sm:p-7 shadow-md space-y-4">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-100 pb-4">
              <div className="flex items-start gap-3.5">
                <div
                  className={`w-12 h-12 rounded-2xl text-white flex items-center justify-center shrink-0 shadow-md ${
                    modality === "comercial_estandar" ? "bg-[#00C8D4]" : "bg-[#FF0096]"
                  }`}
                >
                  <Award className="w-6 h-6 text-white" />
                </div>
                <div>
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <span className="px-2.5 py-0.5 rounded-lg bg-[#0e011f] text-white font-mono text-[11px] font-black flex items-center gap-1">
                      <Lock className="w-3 h-3 text-[#00C8D4]" />
                      <span>Folio de Auditoría Protegido: {protectedFolio}</span>
                    </span>
                    {modality !== "comercial_estandar" ? (
                      <span className="px-2.5 py-0.5 rounded-lg bg-pink-50 border border-[#FF0096]/40 text-[#FF0096] text-[10px] font-black uppercase">
                        Cliente de Prestigio / Aliado Fundador (Top 50)
                      </span>
                    ) : (
                      <span className="px-2.5 py-0.5 rounded-lg bg-cyan-50 border border-[#00C8D4]/40 text-[#008f99] text-[10px] font-black uppercase">
                        Plan Estándar / HDV Connect
                      </span>
                    )}
                  </div>
                  <h2
                    className="text-xl sm:text-2xl font-black text-slate-900"
                    style={{ fontFamily: "'Playfair Display', serif" }}
                  >
                    {modality !== "comercial_estandar"
                      ? `Beneficio Especial Activo: Exoneración 100% ($0.00 USD) • Primeros 50 Aliados`
                      : `Beneficio Activo: Plan Estándar / HDV Connect (0% Comisiones)`}
                  </h2>
                  <p className="text-xs text-slate-600 mt-0.5 max-w-3xl">
                    {modality !== "comercial_estandar" ? (
                      <>
                        Su establecimiento <strong>{title}</strong> cuenta con estatus de{" "}
                        <strong>Cliente de Prestigio / Aliado Fundador</strong> dentro del cupo exclusivo de los primeros{" "}
                        <strong>{MAX_FOUNDERS_QUOTA} aliados nacionales</strong> (
                        {protectedSlotNumber
                          ? `Cupo Reservado #${protectedSlotNumber} / ${MAX_FOUNDERS_QUOTA}`
                          : `Cupo Oficial Top ${MAX_FOUNDERS_QUOTA}`}
                        ), con <strong>exoneración total aplicada ($0.00)</strong> y{" "}
                        <strong>0% de comisiones por reserva</strong>.
                      </>
                    ) : (
                      <>
                        Su establecimiento <strong>{title}</strong> opera bajo el modelo de{" "}
                        <strong>Trato Directo con el Anfitrión (0% de comisiones por reserva)</strong>.
                      </>
                    )}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 shrink-0">
                <div className="px-3.5 py-2.5 rounded-2xl bg-slate-50 border border-slate-200 text-center">
                  <span className="block text-[9px] font-black uppercase text-slate-400">
                    Cupo Oficial
                  </span>
                  <span className="text-xs font-mono font-black text-slate-900">
                    {modality !== "comercial_estandar"
                      ? `#${protectedSlotNumber || ((protectedFolio === "HDV-PR-2026-0005" || preloadedSlug === "waku-lodge-canaima") ? 4 : Math.min(MAX_FOUNDERS_QUOTA, foundersOccupied + 1))} / ${MAX_FOUNDERS_QUOTA}`
                      : "HDV Connect"}
                  </span>
                </div>
                <div className="px-3.5 py-2.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-center">
                  <span className="block text-[9px] font-black uppercase text-emerald-700">
                    Exoneración
                  </span>
                  <span className="text-xs font-mono font-black text-emerald-800">
                    $0.00 USD
                  </span>
                </div>
                <div className="col-span-2 sm:col-span-1 px-3.5 py-2.5 rounded-2xl bg-cyan-50 border border-[#00C8D4]/40 text-center">
                  <span className="block text-[9px] font-black uppercase text-[#008f99]">
                    Comisiones OTA
                  </span>
                  <span className="text-xs font-mono font-black text-slate-900">
                    0% (Directo)
                  </span>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-slate-700">
              <div className="flex items-center gap-2 flex-wrap">
                <UserCheck className="w-4 h-4 text-[#00C8D4] shrink-0" />
                <span>
                  Responsable / Contacto titular:{" "}
                  <strong className="text-slate-900">
                    {ownerOrManagerName || "Propietario / Gerente General"}
                  </strong>
                </span>
                {isFolioValidatedAndLocked ? (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300 text-[10px] font-black uppercase">
                    <Lock className="w-3 h-3" />
                    <span>
                      Estado: Validado / Bloqueado ({validatedTimestampLabel || "Confirmado"})
                    </span>
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-300 text-[10px] font-black uppercase">
                    <span>Estado: Abierto para Revisión y Edición (Solo Lectura al Visitar)</span>
                  </span>
                )}
              </div>
              {isFolioValidatedAndLocked ? (
                <button
                  type="button"
                  onClick={() => setIsFolioValidatedAndLocked(false)}
                  className="text-[11px] font-black text-[#008f99] hover:text-[#FF0096] underline cursor-pointer"
                >
                  Habilitar edición adicional de datos operativos
                </button>
              ) : (
                <span className="text-[11px] font-bold text-[#9B00CC]">
                  Paso final: Revisa o edita tus datos abajo, marca la casilla de términos y pulsa &ldquo;Confirmar y Activar Ficha&rdquo;.
                </span>
              )}
            </div>
          </div>
        )}

        {activeTab === "card_form" ? (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* Columna Izquierda: Formulario Estricto de 9 Campos */}
            <div className="lg:col-span-7 bg-white rounded-3xl p-6 md:p-8 border border-slate-200/80 shadow-xl space-y-6">
              
              <div className="border-b border-slate-100 pb-4">
                <h2 className="text-xl font-black text-slate-900" style={{ fontFamily: "'Playfair Display', serif" }}>
                  Datos Esenciales de la Ficha Pública
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Campos requeridos exclusivamente para la tarjeta visible por los turistas.
                </p>
              </div>

              {/* 1. Categoría Principal del Establecimiento (Lista Desplegable Unificada de Toda la Plataforma) */}
              <div>
                <div className="flex items-center justify-between gap-2 mb-1.5">
                  <label
                    htmlFor="prereg-category-select"
                    className="block text-[11px] font-black uppercase tracking-wider text-slate-500"
                  >
                    1. Categoría Principal del Establecimiento *
                  </label>
                  <span className="text-[10px] font-bold text-[#008f99] bg-[#00C8D4]/10 border border-[#00C8D4]/25 px-2.5 py-0.5 rounded-full">
                    Catálogo Oficial Unificado ({dynamicCategories.length} categorías)
                  </span>
                </div>

                <div className="relative">
                  <div className="w-8 h-8 rounded-xl bg-[#00C8D4] text-white flex items-center justify-center absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none shadow-xs">
                    <Building className="w-4 h-4 text-white" />
                  </div>

                  <select
                    id="prereg-category-select"
                    value={categoryName}
                    onChange={(e) => handleSelectCategoryByName(e.target.value)}
                    className="w-full appearance-none bg-slate-50 hover:bg-white border-2 border-slate-200 focus:border-[#00C8D4] rounded-2xl pl-13 pr-10 py-3.5 text-sm font-black text-slate-900 focus:outline-none focus:ring-4 focus:ring-[#00C8D4]/15 transition-all cursor-pointer shadow-2xs"
                  >
                    {/* Si al cargar una ficha existente su categoría tiene un nombre personalizado fuera de la lista base, la incluimos */}
                    {!dynamicCategories.some(
                      (c) => c.label.toLowerCase().trim() === categoryName.toLowerCase().trim()
                    ) && (
                      <option value={categoryName}>{categoryName} (Categoría Actual)</option>
                    )}

                    {Array.from(new Set(dynamicCategories.map((c) => c.groupTitle))).map(
                      (groupTitle) => (
                        <optgroup key={groupTitle} label={`── ${groupTitle} ──`}>
                          {dynamicCategories
                            .filter((c) => c.groupTitle === groupTitle)
                            .map((cat) => (
                              <option key={cat.id} value={cat.label}>
                                {cat.label}
                              </option>
                            ))}
                        </optgroup>
                      )
                    )}
                  </select>

                  <div className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500">
                    <ChevronDown className="w-4.5 h-4.5 stroke-[2.5]" />
                  </div>
                </div>

                <p className="text-[10px] text-slate-400 font-semibold mt-1.5 flex items-center justify-between">
                  <span>
                    Incluye Hospedajes, Eco-Lodges, Glamping, Complejos, Náutico, Restaurante & Beach Club, Agencias y más.
                  </span>
                  <span className="font-mono text-slate-500">
                    CS-{String(serviceCategoryId).padStart(2, "0")} / SCS-{String(subcategoryId).padStart(2, "0")}
                  </span>
                </p>
              </div>

              {/* 2. Nombre de la Propiedad con Reconocimiento Automático de Establecimientos Existentes */}
              <div>
                <label className="block text-[11px] font-black uppercase tracking-wider text-slate-500 mb-1.5">
                  2. Nombre Comercial de la Propiedad / Establecimiento
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Ej. Posada Paraíso Azul"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold text-slate-900 focus:outline-none focus:border-[#00C8D4] focus:bg-white transition-all"
                />

                {detectedExistingMatch && (
                  <div className="mt-2.5 p-3 rounded-2xl bg-[#00C8D4]/10 border border-[#00C8D4]/35 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                    <div className="flex items-start gap-2.5">
                      <div className="w-7 h-7 rounded-xl bg-[#00C8D4] text-white flex items-center justify-center shrink-0 mt-0.5">
                        <CheckCircle2 className="w-4 h-4" />
                      </div>
                      <div>
                        <span className="text-[11px] font-black text-slate-900 block">
                          Establecimiento Existente Detectado ({detectedExistingMatch.name})
                        </span>
                        <span className="text-[10px] text-slate-600 font-semibold block">
                          Coincidencia por {detectedExistingMatch.matchReason === "whatsapp" ? "WhatsApp/Teléfono" : "Nombre comercial"} • Se actualizará y consolidará su ficha única (<code>/establecimiento/{detectedExistingMatch.slug}</code>) sin crear duplicados.
                        </span>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        if (detectedExistingMatch.name) setTitle(detectedExistingMatch.name);
                        if (detectedExistingMatch.categoryName) handleSelectCategoryByName(detectedExistingMatch.categoryName);
                        if (detectedExistingMatch.destinationName) setDestinationName(detectedExistingMatch.destinationName);
                        if (detectedExistingMatch.state) setState(detectedExistingMatch.state);
                        if (detectedExistingMatch.city) setCity(detectedExistingMatch.city);
                        if (detectedExistingMatch.whatsapp) setWhatsappNumber(detectedExistingMatch.whatsapp);
                        if (detectedExistingMatch.description) setShortDescription(detectedExistingMatch.description);
                        if (detectedExistingMatch.primaryImage) setPrimaryImage(detectedExistingMatch.primaryImage);
                        if (detectedExistingMatch.galleryImages && detectedExistingMatch.galleryImages.length > 0) {
                          setGalleryImages(detectedExistingMatch.galleryImages);
                        }
                        if (detectedExistingMatch.latitude) setLatitude(String(detectedExistingMatch.latitude));
                        if (detectedExistingMatch.longitude) setLongitude(String(detectedExistingMatch.longitude));
                        const existingRealTags = getRealEstablishmentBadgesAndTags({
                          slug: detectedExistingMatch.slug,
                          services: detectedExistingMatch.services,
                          badges: (detectedExistingMatch as any).badges,
                          has_hdv_seal: (detectedExistingMatch as any).hasHdvSeal ?? true
                        });
                        setBadges({
                          has_power_plant: existingRealTags.hasPowerPlant,
                          has_water_247: existingRealTags.hasWater247,
                          has_starlink: existingRealTags.hasStarlink,
                          is_pet_friendly: existingRealTags.isPetFriendly,
                          has_hdv_seal: existingRealTags.hasHdvSeal || true
                        });
                        setPills(existingRealTags.displayPills.slice(0, MAX_PILLS_COUNT));
                      }}
                      className="px-3 py-1.5 rounded-xl bg-[#0e011f] hover:bg-[#1a0533] text-[#00C8D4] text-[10px] font-black uppercase tracking-wider shrink-0 cursor-pointer transition-colors"
                    >
                      Cargar Datos Actuales
                    </button>
                  </div>
                )}
              </div>

              {/* 3. Ubicación / Destino & Captura de GPS inteligente */}
              <div className="space-y-3">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[11px] font-black uppercase tracking-wider text-slate-500 mb-1.5">
                      3. Destino Turístico
                    </label>
                    <input
                      type="text"
                      value={destinationName}
                      onChange={(e) => setDestinationName(e.target.value)}
                      placeholder="Ej. Morrocoy"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-bold text-slate-900 focus:outline-none focus:border-[#00C8D4]"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-black uppercase tracking-wider text-slate-500 mb-1.5">
                      Estado
                    </label>
                    <input
                      type="text"
                      value={state}
                      onChange={(e) => setState(e.target.value)}
                      placeholder="Ej. Falcón"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-bold text-slate-900 focus:outline-none focus:border-[#00C8D4]"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-black uppercase tracking-wider text-slate-500 mb-1.5">
                      Ciudad / Sector
                    </label>
                    <input
                      type="text"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      placeholder="Ej. Tucacas"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-bold text-slate-900 focus:outline-none focus:border-[#00C8D4]"
                    />
                  </div>
                </div>

                {/* Sub-bloque GPS para Agentes de Campo / Exploradores de Ruta */}
                <div className="bg-gradient-to-r from-cyan-50/80 to-blue-50/80 p-4 rounded-2xl border border-[#00C8D4]/30 space-y-3">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <span className="text-xs font-black text-slate-900 flex items-center gap-1.5 uppercase tracking-wider">
                      <MapPin className="w-4 h-4 text-[#00C8D4]" />
                      <span>Coordenadas GPS (Agente de Campo / Celular)</span>
                    </span>

                    <button
                      type="button"
                      onClick={handleCaptureGps}
                      disabled={isCapturingGps}
                      className="px-3.5 py-2 rounded-xl text-xs font-black text-white bg-gradient-to-r from-[#00C8D4] to-[#0098A6] hover:opacity-95 shadow-md flex items-center gap-1.5 cursor-pointer transition-all disabled:opacity-50"
                    >
                      {isCapturingGps ? (
                        <>
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          <span>Obteniendo GPS...</span>
                        </>
                      ) : (
                        <>
                          <Navigation className="w-3.5 h-3.5" />
                          <span>📍 Capturar GPS Ahora (En el Sitio)</span>
                        </>
                      )}
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[10px] uppercase font-bold text-slate-600 mb-1">Latitud GPS</label>
                      <input
                        type="text"
                        placeholder="Ej. 10.480594"
                        value={latitude}
                        onChange={(e) => setLatitude(e.target.value)}
                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 font-mono font-bold focus:outline-none focus:border-[#00C8D4]"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] uppercase font-bold text-slate-600 mb-1">Longitud GPS</label>
                      <input
                        type="text"
                        placeholder="Ej. -66.903606"
                        value={longitude}
                        onChange={(e) => setLongitude(e.target.value)}
                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 font-mono font-bold focus:outline-none focus:border-[#00C8D4]"
                      />
                    </div>
                  </div>

                  {gpsSuccessMsg && (
                    <p className="text-xs text-emerald-700 font-bold flex items-center gap-1 bg-emerald-100/80 p-2 rounded-lg">
                      <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                      {gpsSuccessMsg}
                    </p>
                  )}
                  {gpsErrorMsg && (
                    <p className="text-xs text-rose-600 font-bold flex items-center gap-1 bg-rose-100/80 p-2 rounded-lg">
                      <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                      {gpsErrorMsg}
                    </p>
                  )}
                </div>
              </div>

              {/* 4. Insignias / Badges Destacados (Directriz AGENTS.md: Cajas de color sólido con SVG calado en blanco) */}
              <div>
                <label className="block text-[11px] font-black uppercase tracking-wider text-slate-500 mb-2">
                  4. Insignias / Badges Destacados de la Tarjeta
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                  {[
                    { key: "has_power_plant" as const, label: "Planta Eléctrica", desc: "Full Power 24/7", color: "bg-amber-500", icon: Zap },
                    { key: "has_water_247" as const, label: "Agua 24/7", desc: "Tanque continuo", color: "bg-[#00C8D4]", icon: Droplets },
                    { key: "has_starlink" as const, label: "Starlink", desc: "Internet Satelital", color: "bg-indigo-600", icon: Wifi },
                    { key: "is_pet_friendly" as const, label: "Pet Friendly", desc: "Acepta mascotas", color: "bg-emerald-600", icon: Dog },
                    { key: "has_hdv_seal" as const, label: "Sello HDV", desc: "Verificado Oficial", color: "bg-[#FF0096]", icon: ShieldCheck }
                  ].map(b => {
                    const IconComp = b.icon;
                    const isActive = badges[b.key];
                    return (
                      <button
                        key={b.key}
                        type="button"
                        onClick={() => toggleBadge(b.key)}
                        className={`p-3 rounded-2xl border text-left transition-all flex items-center gap-3 cursor-pointer ${
                          isActive
                            ? "bg-slate-900 text-white border-slate-900 shadow-md scale-[1.02]"
                            : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100"
                        }`}
                      >
                        {/* Caja de color sólido con icono en blanco puro (Regla #3) */}
                        <div className={`w-8 h-8 rounded-xl ${b.color} flex items-center justify-center text-white shrink-0 shadow-sm`}>
                          <IconComp className="w-4 h-4 stroke-[2.5]" />
                        </div>
                        <div className="overflow-hidden">
                          <span className="block text-xs font-black truncate">{b.label}</span>
                          <span className={`text-[10px] block truncate ${isActive ? "text-slate-300" : "text-slate-400"}`}>
                            {b.desc}
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 5 & 8. Calificación y Precio Base */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-black uppercase tracking-wider text-slate-500 mb-1.5">
                    5. Calificación / Rating
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      step="0.1"
                      min="1.0"
                      max="5.0"
                      value={ratingAvg}
                      onChange={(e) => setRatingAvg(Number(e.target.value))}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-bold text-slate-900 focus:outline-none focus:border-[#00C8D4]"
                    />
                    <div className="flex items-center gap-1 bg-amber-50 border border-amber-200 text-amber-700 px-3 py-2.5 rounded-xl shrink-0 font-black text-xs">
                      <Star className="w-4 h-4 fill-amber-500 text-amber-500" />
                      <span>{ratingAvg.toFixed(1)}</span>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-black uppercase tracking-wider text-slate-500 mb-1.5">
                    8. Modalidad de Visualización de Tarifas
                  </label>
                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2.5">
                    <div className="flex items-center justify-between gap-2">
                      <div>
                        <span className="text-xs font-black text-slate-900 block">
                          Tarifa directa a consultar
                        </span>
                        <span className="text-[10px] text-emerald-700 font-bold">
                          Modo estándar activo por defecto (Sin precios estimados)
                        </span>
                      </div>
                      <label className="inline-flex items-center gap-1.5 cursor-pointer select-none">
                        <input
                          type="checkbox"
                          checked={showOfficialPrice}
                          onChange={(e) => {
                            const checked = e.target.checked;
                            setShowOfficialPrice(checked);
                            if (!checked) setBasePriceFrom(0);
                          }}
                          className="w-4 h-4 accent-[#00C8D4] rounded cursor-pointer"
                        />
                        <span className="text-[10px] font-black uppercase text-slate-600">
                          Activar tarifa oficial
                        </span>
                      </label>
                    </div>

                    {showOfficialPrice && (
                      <div className="relative pt-1 border-t border-slate-200/80">
                        <span className="absolute left-3 top-3.5 text-xs font-black text-slate-400">$</span>
                        <input
                          type="number"
                          min="0"
                          value={basePriceFrom || ""}
                          onChange={(e) => setBasePriceFrom(Number(e.target.value))}
                          placeholder="Ej. 120 (Tarifa oficial verificada)"
                          className="w-full bg-white border border-slate-200 rounded-xl pl-8 pr-16 py-2 text-xs font-bold text-slate-900 focus:outline-none focus:border-[#00C8D4]"
                        />
                        <span className="absolute right-3 top-3.5 text-[11px] text-slate-400 font-bold">/ noche</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* 6. Pills / Etiquetas Secundarias de Servicios Clave */}
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <label className="block text-[11px] font-black uppercase tracking-wider text-slate-500">
                    6. Pills / Etiquetas Secundarias de Servicios Clave (Máx {MAX_PILLS_COUNT})
                  </label>
                  <span
                    className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
                      pills.length >= MAX_PILLS_COUNT
                        ? "bg-amber-100 text-amber-800 border border-amber-300"
                        : "bg-slate-100 text-slate-600"
                    }`}
                  >
                    {pills.length} / {MAX_PILLS_COUNT} seleccionadas
                  </span>
                </div>

                {/* Lista unificada de Sugerencias + Pills Personalizadas creadas */}
                <div className="flex flex-wrap gap-1.5 mb-3">
                  {Array.from(new Set([...defaultPillSuggestions, ...customPillSuggestions, ...pills])).map(
                    (pill) => {
                      const isSelected = pills.includes(pill);
                      return (
                        <button
                          key={pill}
                          type="button"
                          onClick={() => togglePill(pill)}
                          title={pill}
                          className={`px-3 py-1 rounded-full text-xs font-bold transition-all cursor-pointer inline-flex items-center gap-1 max-w-[180px] ${
                            isSelected
                              ? "bg-[#FF0096] text-white shadow-sm"
                              : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                          }`}
                        >
                          <span className="shrink-0">{isSelected ? "✓" : "+"}</span>
                          <span className="truncate">{pill}</span>
                        </button>
                      );
                    }
                  )}
                </div>

                {/* Input para agregar pill personalizada (Máx 24 caracteres) */}
                <form onSubmit={handleAddCustomPill} className="space-y-1.5">
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <input
                        type="text"
                        value={customPillInput}
                        maxLength={MAX_PILL_CHARS}
                        onChange={(e) => {
                          setCustomPillInput(e.target.value.slice(0, MAX_PILL_CHARS));
                          if (pillErrorMsg) setPillErrorMsg(null);
                        }}
                        placeholder="Escribe otra etiqueta personalizada (máx. 24 car.)..."
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-3 pr-14 py-2 text-xs font-medium text-slate-800 focus:outline-none focus:border-[#00C8D4]"
                      />
                      <span className="absolute right-2.5 top-2.5 text-[10px] font-bold text-slate-400 select-none">
                        {customPillInput.length}/{MAX_PILL_CHARS}
                      </span>
                    </div>
                    <button
                      type="submit"
                      className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-bold cursor-pointer shrink-0 transition-colors"
                    >
                      Añadir Pill
                    </button>
                  </div>

                  {pillErrorMsg && (
                    <p className="text-[11px] font-bold text-amber-700 bg-amber-50 border border-amber-200 rounded-xl px-3 py-1.5 flex items-center gap-1.5">
                      <AlertCircle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                      <span>{pillErrorMsg}</span>
                    </p>
                  )}
                </form>
              </div>

              {/* 7. Extracto / Breve Descripción Comercial */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-[11px] font-black uppercase tracking-wider text-slate-500">
                    7. Extracto / Breve Reseña Comercial (Máx 2-3 líneas)
                  </label>
                  <span className="text-[10px] text-slate-400">{shortDescription.length} / 250 car.</span>
                </div>
                <textarea
                  rows={3}
                  value={shortDescription}
                  maxLength={250}
                  onChange={(e) => setShortDescription(e.target.value)}
                  placeholder="Describe en 2 a 3 líneas lo más atractivo del establecimiento..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs font-medium text-slate-900 focus:outline-none focus:border-[#00C8D4] focus:bg-white transition-all"
                />
              </div>

              {/* 9. Contacto Oficial Verificable, Inventario Real de Habitaciones & Fotos */}
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[11px] font-black uppercase tracking-wider text-slate-500 mb-1.5">
                      9. WhatsApp Oficial de Reservas *
                    </label>
                    <div className="relative">
                      <Phone className="w-4 h-4 absolute left-3 top-3 text-emerald-500" />
                      <input
                        type="text"
                        value={whatsappNumber}
                        onChange={(e) => setWhatsappNumber(e.target.value)}
                        placeholder="+58 412 1234567"
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-4 py-2.5 text-xs font-bold text-slate-900 focus:outline-none focus:border-[#00C8D4]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-black uppercase tracking-wider text-slate-500 mb-1.5">
                      Correo Institucional / Oficial
                    </label>
                    <input
                      type="email"
                      value={officialEmail}
                      onChange={(e) => setOfficialEmail(e.target.value)}
                      placeholder="reservas@establecimiento.com"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-bold text-slate-900 focus:outline-none focus:border-[#00C8D4]"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-black uppercase tracking-wider text-slate-500 mb-1.5">
                      Web o Instagram Oficial
                    </label>
                    <div className="relative">
                      <Globe className="w-4 h-4 absolute left-3 top-3 text-[#00C8D4]" />
                      <input
                        type="text"
                        value={officialWebsiteOrInstagram}
                        onChange={(e) => setOfficialWebsiteOrInstagram(e.target.value)}
                        placeholder="@hotel / www.hotel.com"
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3.5 py-2.5 text-xs font-bold text-slate-900 focus:outline-none focus:border-[#00C8D4]"
                      />
                    </div>
                  </div>
                </div>

                {/* Constructor Ágil de Habitaciones / Unidades Reales (Opcional, 100% Datos Reales) */}
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <span className="text-[11px] font-black uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
                      <BedDouble className="w-4 h-4 text-[#00C8D4]" />
                      <span>Unidades / Habitaciones Reales Verificadas ({realRoomsInventory.length})</span>
                    </span>
                    <span className="text-[10px] font-bold text-slate-500">
                      Si agregas unidades aquí, se habilitará la tabla de habitaciones en la ficha pública
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-12 gap-2">
                    <div className="sm:col-span-4">
                      <input
                        type="text"
                        value={newRoomName}
                        onChange={(e) => setNewRoomName(e.target.value)}
                        placeholder="Nombre unidad (Ej. Habitación Matrimonial)"
                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:border-[#00C8D4]"
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <input
                        type="number"
                        min="1"
                        max="20"
                        value={newRoomCapacity}
                        onChange={(e) => setNewRoomCapacity(Number(e.target.value))}
                        placeholder="Pax"
                        title="Capacidad de personas"
                        className="w-full px-2.5 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:border-[#00C8D4]"
                      />
                    </div>
                    <div className="sm:col-span-4">
                      <input
                        type="text"
                        value={newRoomBedsSummary}
                        onChange={(e) => setNewRoomBedsSummary(e.target.value)}
                        placeholder="Camas / Equipamiento (Ej. 1 Cama Queen, A/A)"
                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:border-[#00C8D4]"
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <button
                        type="button"
                        onClick={handleAddRealRoom}
                        className="w-full py-2 px-3 rounded-xl bg-[#00C8D4] hover:bg-[#00b2bd] text-slate-950 text-xs font-black cursor-pointer transition-colors"
                      >
                        + Unidad
                      </button>
                    </div>
                  </div>

                  {realRoomsInventory.length > 0 && (
                    <div className="space-y-1.5 pt-1">
                      {realRoomsInventory.map((rm, idx) => (
                        <div
                          key={idx}
                          className="flex items-center justify-between gap-2 px-3 py-2 rounded-xl bg-white border border-slate-200 text-xs"
                        >
                          <div className="min-w-0">
                            <span className="font-black text-slate-900">{rm.name}</span>
                            <span className="text-slate-500 font-semibold ml-2">
                              • Máx. {rm.capacity} pax
                              {rm.beds_summary ? ` • ${rm.beds_summary}` : ""}
                            </span>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleRemoveRealRoom(idx)}
                            className="text-rose-600 hover:text-rose-700 p-1 cursor-pointer shrink-0"
                            title="Quitar unidad"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Subida Directa de Imagen Principal + Galería de Múltiples Fotos */}
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {/* 1. Imagen Principal (Portada) */}
                    <div className="p-3.5 rounded-xl bg-white border border-slate-200 space-y-2">
                      <span className="text-[11px] font-black uppercase tracking-wider text-[#FF0096] flex items-center gap-1.5">
                        <Camera className="w-4 h-4 text-[#FF0096]" />
                        <span>1. Imagen Principal (Portada)</span>
                      </span>
                      <p className="text-[10px] text-slate-500">
                        Foto destacada de portada para la tarjeta y el banner del establecimiento.
                      </p>
                      <label className="w-full px-3.5 py-2.5 rounded-xl text-xs font-black text-white bg-[#FF0096] hover:bg-[#e00083] shadow-sm flex items-center justify-center gap-1.5 cursor-pointer transition-all">
                        <Camera className="w-3.5 h-3.5" />
                        <span>Subir Imagen Principal</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handlePrimaryPhotoUpload}
                          disabled={isUploadingPhoto}
                          className="hidden"
                        />
                      </label>
                    </div>

                    {/* 2. Galería de Múltiples Imágenes */}
                    <div className="p-3.5 rounded-xl bg-white border border-slate-200 space-y-2">
                      <span className="text-[11px] font-black uppercase tracking-wider text-[#9B00CC] flex items-center gap-1.5">
                        <Upload className="w-4 h-4 text-[#9B00CC]" />
                        <span>2. Galería (Múltiples Imágenes)</span>
                      </span>
                      <p className="text-[10px] text-slate-500">
                        Selecciona varias fotos a la vez para la galería de áreas y habitaciones.
                      </p>
                      <label className="w-full px-3.5 py-2.5 rounded-xl text-xs font-black text-white bg-gradient-to-r from-[#9B00CC] to-[#00C8D4] hover:opacity-95 shadow-sm flex items-center justify-center gap-1.5 cursor-pointer transition-all">
                        {isUploadingPhoto ? (
                          <>
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            <span>Cargando Fotos...</span>
                          </>
                        ) : (
                          <>
                            <Upload className="w-3.5 h-3.5" />
                            <span>+ Agregar Múltiples Imágenes</span>
                          </>
                        )}
                        <input
                          type="file"
                          accept="image/*"
                          multiple
                          onChange={handleFileUpload}
                          disabled={isUploadingPhoto}
                          className="hidden"
                        />
                      </label>
                    </div>
                  </div>

                  {/* Input Alternativo por URL */}
                  <div className="flex items-center gap-2">
                    <input
                      type="url"
                      placeholder="O pega una URL de foto (https://...)"
                      value={photoUrlInput}
                      onChange={(e) => setPhotoUrlInput(e.target.value)}
                      className="flex-1 px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:border-[#00C8D4]"
                    />
                    <button
                      type="button"
                      onClick={handleAddPhotoUrl}
                      className="px-3 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-bold shrink-0 cursor-pointer"
                    >
                      + URL
                    </button>
                  </div>

                  {/* Miniaturas de Fotos Capturadas */}
                  {galleryImages.length > 0 && (
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-2">
                      {galleryImages.map((url, idx) => (
                        <div
                          key={idx}
                          className={`relative rounded-xl overflow-hidden border aspect-video group shadow-xs ${
                            primaryImage === url ? "ring-2 ring-[#00C8D4] border-[#00C8D4]" : "border-slate-200"
                          }`}
                        >
                          <img src={url} alt={`Foto ${idx + 1}`} className="w-full h-full object-cover" />
                          <div className="absolute inset-0 bg-slate-950/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1.5 p-1">
                            <button
                              type="button"
                              onClick={() => setPrimaryImage(url)}
                              className="px-2 py-1 rounded bg-[#00C8D4] text-slate-950 text-[9px] font-black uppercase"
                            >
                              {primaryImage === url ? "Portada" : "Usar Portada"}
                            </button>
                            <button
                              type="button"
                              onClick={() => removePhoto(idx)}
                              className="p-1 rounded bg-rose-600 text-white"
                              title="Eliminar"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                          {primaryImage === url && (
                            <span className="absolute top-1.5 left-1.5 bg-[#00C8D4] text-slate-950 text-[8px] font-black uppercase px-2 py-0.5 rounded-md shadow">
                              Portada
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Selector de Modalidad de Publicación Inmediata (Agentes de Campo) */}
              <div className="bg-slate-900 text-white p-4.5 rounded-2xl space-y-3 shadow-lg">
                <span className="text-xs font-black uppercase tracking-wider text-[#00C8D4] flex items-center gap-1.5">
                  <Radio className="w-4 h-4 text-[#FF0096] animate-pulse" />
                  <span>Estado al Guardar (Agente en Frente del Hotel)</span>
                </span>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setPublishDirectly(true)}
                    className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                      publishDirectly
                        ? "bg-emerald-500/20 border-emerald-400 text-white ring-1 ring-emerald-400"
                        : "bg-slate-800 border-slate-700 text-slate-400 hover:bg-slate-750"
                    }`}
                  >
                    <div className="flex items-center gap-2 font-bold text-xs text-emerald-300 mb-0.5">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Publicar Ahora Mismo</span>
                    </div>
                    <p className="text-[10px] text-slate-300">
                      Publica de inmediato la ficha con el GPS y fotos capturadas en la plataforma pública.
                    </p>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPublishDirectly(false)}
                    className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                      !publishDirectly
                        ? "bg-[#00C8D4]/20 border-[#00C8D4] text-white ring-1 ring-[#00C8D4]"
                        : "bg-slate-800 border-slate-700 text-slate-400 hover:bg-slate-750"
                    }`}
                  >
                    <div className="flex items-center gap-2 font-bold text-xs text-[#00C8D4] mb-0.5">
                      <FileText className="w-4 h-4" />
                      <span>Guardar como Pre-Registro</span>
                    </div>
                    <p className="text-[10px] text-slate-300">
                      Guarda la ficha como borrador en estado <code>PRE_REGISTERED</code> para revisiones posteriores.
                    </p>
                  </button>
                </div>
              </div>

              {/* ========================================================================
                  10. CLASIFICACIÓN COMERCIAL • DEPARTAMENTO DE VENTAS & FINANZAS HDV
              ======================================================================== */}
              <div className="rounded-3xl bg-gradient-to-br from-[#0e011f] via-[#15062c] to-[#1a0533] text-white p-5 sm:p-6 border border-[#00C8D4]/40 shadow-xl space-y-5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-4">
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-widest text-[#00C8D4] flex items-center gap-1.5">
                      <Briefcase className="w-3.5 h-3.5 text-[#FF0096]" />
                      <span>10. Clasificación Comercial • Departamento de Ventas HDV</span>
                    </span>
                    <h3
                      className="text-lg sm:text-xl font-bold text-white mt-0.5"
                      style={{ fontFamily: "'Playfair Display', serif" }}
                    >
                      Origen, Membresía y Sincronización Financiera
                    </h3>
                  </div>

                  {/* Contador en Vivo 50 Cupos Globales (Fundadores + Prestigio) */}
                  <div className="px-3.5 py-2 rounded-2xl bg-white/10 border border-[#00C8D4]/30 text-right shrink-0">
                    <span className="block text-[9px] font-black uppercase tracking-wider text-[#00C8D4]">
                      Cupo Global 50 (Fundadores + Prestigio)
                    </span>
                    <span className="text-xs font-mono font-black text-white">
                      {foundersOccupied} / {MAX_FOUNDERS_QUOTA} Ocupados ({foundersAvailable} disp.)
                    </span>
                  </div>
                </div>

                {/* A. ORIGEN DEL REGISTRO (Radio / Check Obligatorio) */}
                <div className="space-y-3">
                  <label className="block text-[11px] font-black uppercase tracking-wider text-slate-200">
                    A. Origen del Registro (Obligatorio) *
                  </label>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setOrigin("propietario")}
                      className={`p-3.5 rounded-2xl border text-left transition-all flex items-start gap-3 cursor-pointer ${
                        origin === "propietario"
                          ? "bg-[#00C8D4] text-slate-950 border-white shadow-lg"
                          : "bg-white/5 border-white/15 text-slate-200 hover:bg-white/10"
                      }`}
                    >
                      <div
                        className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                          origin === "propietario"
                            ? "bg-[#0e011f] text-white"
                            : "bg-[#00C8D4] text-white"
                        }`}
                      >
                        <UserCheck className="w-4 h-4" />
                      </div>
                      <div>
                        <span className="block text-xs font-black">
                          Propietario / Gerente del Establecimiento
                        </span>
                        <span
                          className={`text-[10px] block mt-0.5 ${
                            origin === "propietario" ? "text-slate-800 font-semibold" : "text-slate-400"
                          }`}
                        >
                          Registro directo por el titular o representante del hospedaje.
                        </span>
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => setOrigin("agente_ventas")}
                      className={`p-3.5 rounded-2xl border text-left transition-all flex items-start gap-3 cursor-pointer ${
                        origin === "agente_ventas"
                          ? "bg-[#FF0096] text-white border-white shadow-lg"
                          : "bg-white/5 border-white/15 text-slate-200 hover:bg-white/10"
                      }`}
                    >
                      <div
                        className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                          origin === "agente_ventas"
                            ? "bg-[#0e011f] text-white"
                            : "bg-[#FF0096] text-white"
                        }`}
                      >
                        <Briefcase className="w-4 h-4" />
                      </div>
                      <div>
                        <span className="block text-xs font-black">Agente de Ventas HDV</span>
                        <span
                          className={`text-[10px] block mt-0.5 ${
                            origin === "agente_ventas" ? "text-white/90 font-semibold" : "text-slate-400"
                          }`}
                        >
                          Afiliación comercial asistida con asignación de plan y monto SaaS.
                        </span>
                      </div>
                    </button>
                  </div>

                  {/* Campos condicionales según el Origen */}
                  {origin === "propietario" ? (
                    <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10">
                      <label className="block text-[10px] font-black uppercase tracking-wider text-[#00C8D4] mb-1">
                        Nombre del Propietario o Gerente Responsable
                      </label>
                      <input
                        type="text"
                        value={ownerOrManagerName}
                        onChange={(e) => setOwnerOrManagerName(e.target.value)}
                        placeholder="Ej. Lic. Carlos Rodríguez (Propietario / Gerente General)"
                        className="w-full px-3.5 py-2 rounded-xl bg-white text-slate-900 text-xs font-bold focus:outline-none"
                      />
                    </div>
                  ) : (
                    <div className="p-4 rounded-2xl bg-white/10 border border-[#FF0096]/40 space-y-3">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[10px] font-black uppercase tracking-wider text-[#00C8D4] mb-1">
                            Seleccionar Ejecutivo / Código de Agente
                          </label>
                          <select
                            value={selectedAgentCode}
                            onChange={(e) => {
                              const code = e.target.value;
                              setSelectedAgentCode(code);
                              const found = OFFICIAL_SALES_AGENTS.find((a) => a.code === code);
                              if (found) setCustomAgentName(found.name);
                            }}
                            className="w-full px-3 py-2 rounded-xl bg-white text-slate-900 text-xs font-bold focus:outline-none cursor-pointer"
                          >
                            {OFFICIAL_SALES_AGENTS.map((ag) => (
                              <option key={ag.code} value={ag.code}>
                                {ag.code} — {ag.name}
                              </option>
                            ))}
                            <option value="AG-CUSTOM">Otro Código / Agente Autorizado</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-[10px] font-black uppercase tracking-wider text-[#00C8D4] mb-1">
                            Nombre o Código del Agente de Ventas HDV *
                          </label>
                          <input
                            type="text"
                            value={customAgentName}
                            onChange={(e) => setCustomAgentName(e.target.value)}
                            placeholder="Nombre y Apellido del Agente HDV"
                            className="w-full px-3 py-2 rounded-xl bg-white text-slate-900 text-xs font-bold focus:outline-none"
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* B. MODALIDAD DE INGRESO / MEMBRESÍA */}
                <div className="space-y-3">
                  <label className="block text-[11px] font-black uppercase tracking-wider text-slate-200">
                    B. Modalidad de Ingreso / Membresía *
                  </label>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    {/* Opción 1: Programa 50 Fundadores */}
                    <button
                      type="button"
                      onClick={() => setModality("fundadores_50")}
                      className={`p-3.5 rounded-2xl border text-left transition-all flex flex-col justify-between cursor-pointer ${
                        modality === "fundadores_50"
                          ? "bg-[#00C8D4] text-slate-950 border-white shadow-lg"
                          : "bg-white/5 border-white/15 text-white hover:bg-white/10"
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between gap-2 mb-1.5">
                          <div
                            className={`w-7 h-7 rounded-lg flex items-center justify-center ${
                              modality === "fundadores_50"
                                ? "bg-[#0e011f] text-white"
                                : "bg-[#00C8D4] text-white"
                            }`}
                          >
                            <Award className="w-4 h-4" />
                          </div>
                          <span
                            className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase ${
                              modality === "fundadores_50"
                                ? "bg-[#FF0096] text-white"
                                : "bg-white/15 text-[#00C8D4]"
                            }`}
                          >
                            Cupos: {foundersOccupied}/50
                          </span>
                        </div>
                        <span className="block text-xs font-black">Programa 50 Fundadores</span>
                        <span
                          className={`text-[10px] block mt-1 ${
                            modality === "fundadores_50"
                              ? "text-slate-900 font-bold"
                              : "text-slate-300"
                          }`}
                        >
                          Membresía Exonerada - Alianza 50 Fundadores ($0.00)
                        </span>
                      </div>
                    </button>

                    {/* Opción 2: Cliente Exclusivo / Prestigio 2026 */}
                    <button
                      type="button"
                      onClick={() => setModality("exclusivo_prestigio")}
                      className={`p-3.5 rounded-2xl border text-left transition-all flex flex-col justify-between cursor-pointer ${
                        modality === "exclusivo_prestigio"
                          ? "bg-[#FF0096] text-white border-white shadow-lg"
                          : "bg-white/5 border-white/15 text-white hover:bg-white/10"
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between gap-2 mb-1.5">
                          <div
                            className={`w-7 h-7 rounded-lg flex items-center justify-center ${
                              modality === "exclusivo_prestigio"
                                ? "bg-[#0e011f] text-white"
                                : "bg-[#FF0096] text-white"
                            }`}
                          >
                            <Sparkles className="w-4 h-4" />
                          </div>
                          <span className="px-2 py-0.5 rounded-full bg-white/20 text-white text-[9px] font-black uppercase">
                            VIP Exonerado
                          </span>
                        </div>
                        <span className="block text-xs font-black">
                          Cliente Exclusivo / Prestigio 2026
                        </span>
                        <span
                          className={`text-[10px] block mt-1 ${
                            modality === "exclusivo_prestigio"
                              ? "text-white font-bold"
                              : "text-slate-300"
                          }`}
                        >
                          Membresía Exonerada - Selección Exclusiva ($0.00)
                        </span>
                      </div>
                    </button>

                    {/* Opción 3: Membresía Comercial / Estándar */}
                    <button
                      type="button"
                      onClick={() => setModality("comercial_estandar")}
                      className={`p-3.5 rounded-2xl border text-left transition-all flex flex-col justify-between cursor-pointer ${
                        modality === "comercial_estandar"
                          ? "bg-[#9B00CC] text-white border-white shadow-lg"
                          : "bg-white/5 border-white/15 text-white hover:bg-white/10"
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between gap-2 mb-1.5">
                          <div
                            className={`w-7 h-7 rounded-lg flex items-center justify-center ${
                              modality === "comercial_estandar"
                                ? "bg-[#0e011f] text-white"
                                : "bg-[#9B00CC] text-white"
                            }`}
                          >
                            <DollarSign className="w-4 h-4" />
                          </div>
                          <span className="px-2 py-0.5 rounded-full bg-white/20 text-white text-[9px] font-black uppercase">
                            Factura HDV-FAC
                          </span>
                        </div>
                        <span className="block text-xs font-black">
                          Membresía Comercial / Estándar
                        </span>
                        <span
                          className={`text-[10px] block mt-1 ${
                            modality === "comercial_estandar"
                              ? "text-white font-bold"
                              : "text-slate-300"
                          }`}
                        >
                          Genera Orden de Cobro / Factura Correlativa en Finanzas.
                        </span>
                      </div>
                    </button>
                  </div>

                  {/* Selector de Plan de Membresía SaaS (Con o sin monto según origen) */}
                  {(modality === "comercial_estandar" || origin === "agente_ventas") && (
                    <div className="p-4 rounded-2xl bg-white/10 border border-white/15 space-y-3">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[10px] font-black uppercase tracking-wider text-[#00C8D4] mb-1">
                            Plan / Membresía Asignada (Catálogo SaaS)
                          </label>
                          <select
                            value={selectedPlanId}
                            onChange={(e) => {
                              const pid = e.target.value;
                              setSelectedPlanId(pid);
                              const plan = SAAS_COMMERCIAL_PLANS.find((p) => p.id === pid);
                              if (plan) setCustomMonthlyUsd(plan.defaultMonthlyUsd);
                            }}
                            className="w-full px-3 py-2 rounded-xl bg-white text-slate-900 text-xs font-bold focus:outline-none cursor-pointer"
                          >
                            {SAAS_COMMERCIAL_PLANS.map((plan) => (
                              <option key={plan.id} value={plan.id}>
                                {origin === "agente_ventas"
                                  ? `${plan.name} (${plan.rangeLabel} • Sugerido $${plan.defaultMonthlyUsd})`
                                  : plan.name}
                              </option>
                            ))}
                          </select>
                        </div>

                        {/* Monto mensual visible y editable SOLO cuando lo registra un Agente de Ventas HDV */}
                        {origin === "agente_ventas" ? (
                          <div>
                            <label className="block text-[10px] font-black uppercase tracking-wider text-[#00C8D4] mb-1">
                              Monto Mensual Acordado (USD / Equivalente BCV)
                            </label>
                            <div className="flex items-center gap-2">
                              <div className="relative flex-1">
                                <span className="absolute left-3 top-2 text-xs font-black text-slate-400">
                                  $
                                </span>
                                <input
                                  type="number"
                                  min="0"
                                  value={modality === "comercial_estandar" ? customMonthlyUsd : 0}
                                  disabled={modality !== "comercial_estandar"}
                                  onChange={(e) => setCustomMonthlyUsd(Number(e.target.value))}
                                  className="w-full pl-7 pr-12 py-2 rounded-xl bg-white text-slate-900 text-xs font-black focus:outline-none disabled:opacity-60"
                                />
                                <span className="absolute right-2.5 top-2 text-[10px] font-bold text-slate-400">
                                  USD
                                </span>
                              </div>

                              {modality === "comercial_estandar" && (
                                <select
                                  value={initialPaymentStatus}
                                  onChange={(e) =>
                                    setInitialPaymentStatus(
                                      e.target.value as "pendiente_pago" | "pagado"
                                    )
                                  }
                                  className="px-2.5 py-2 rounded-xl bg-white text-slate-900 text-[11px] font-black focus:outline-none cursor-pointer"
                                >
                                  <option value="pendiente_pago">Pendiente de Pago</option>
                                  <option value="pagado">Pagado</option>
                                </select>
                              )}
                            </div>
                            {modality === "comercial_estandar" && (
                              <span className="block text-[10px] text-[#00C8D4] font-bold mt-1">
                                Equivalente BCV: Bs.{" "}
                                {(customMonthlyUsd * (bcvRate || 45.8)).toLocaleString("es-VE", {
                                  minimumFractionDigits: 2
                                })}{" "}
                                / mes
                              </span>
                            )}
                          </div>
                        ) : (
                          <div className="flex flex-col justify-center">
                            <span className="text-[10px] font-black uppercase tracking-wider text-[#00C8D4]">
                              Asignación Directa de Membresía
                            </span>
                            <p className="text-xs font-bold text-white mt-0.5">
                              {currentPlanObj.name}
                            </p>
                            <span className="text-[10px] text-slate-300">
                              {currentPlanObj.description}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* C. CHECK OBLIGATORIO DE TÉRMINOS, CONDICIONES Y DERECHOS DE IMAGEN */}
                <label className="flex items-start gap-3 p-4 rounded-2xl bg-white/10 border border-white/25 cursor-pointer hover:bg-white/15 transition-colors">
                  <input
                    type="checkbox"
                    required
                    checked={termsAccepted}
                    onChange={(e) => {
                      setTermsAccepted(e.target.checked);
                      if (e.target.checked) setValidationError(null);
                    }}
                    className="mt-0.5 w-4.5 h-4.5 accent-[#00C8D4] rounded cursor-pointer shrink-0"
                  />
                  <div className="text-xs leading-relaxed text-slate-100">
                    <span className="font-black text-[#00C8D4] uppercase tracking-wider block mb-0.5">
                      Acepto los términos y condiciones (Obligatorio) *
                    </span>
                    <span>
                      Acepto los{" "}
                      <a
                        href="/terminos"
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="text-[#00C8D4] underline hover:text-white font-black inline-flex items-center gap-1"
                      >
                        <span>Términos y Condiciones</span>
                        <ExternalLink className="w-3 h-3 inline" />
                      </a>{" "}
                      de Hoteles de Venezuela y autorizo expresamente la publicación y uso promocional de la información comercial, logotipo y fotografías del establecimiento.
                    </span>
                  </div>
                </label>

                {validationError && (
                  <div className="p-3.5 rounded-2xl bg-rose-500/20 border border-rose-400 text-rose-100 text-xs font-bold flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-rose-300 shrink-0" />
                    <span>{validationError}</span>
                  </div>
                )}
              </div>

              {/* Botón Principal de Guardado / Emisión de Comprobante Oficial con QR */}
              <div className="pt-4 border-t border-slate-100 flex items-center justify-between flex-wrap gap-3">
                <div className="space-y-0.5">
                  <p className="text-[11px] font-bold text-slate-700 flex items-center gap-1.5">
                    <QrCode className="w-3.5 h-3.5 text-[#00C8D4]" />
                    <span>
                      {isClientReviewMode && protectedFolio ? (
                        <>
                          Folio Oficial Protegido:{" "}
                          <strong className="font-mono text-[#0e011f]">{protectedFolio}</strong>
                        </>
                      ) : (
                        <>
                          Próximo Folio Correlativo:{" "}
                          <strong className="font-mono text-[#0e011f]">
                            HDV-PR-2026-{String(salesCounters.preRegCounter + 1).padStart(4, "0")}
                          </strong>
                        </>
                      )}
                    </span>
                  </p>
                  <p className="text-[10px] text-slate-500 max-w-xs">
                    {!termsAccepted
                      ? "Marca la casilla obligatoria 'Acepto los términos y condiciones' para habilitar el botón."
                      : isClientReviewMode
                      ? "Activa inmediatamente tu ficha verificada y emite tu credencial oficial con QR."
                      : "Emite comprobante automático con QR y sincroniza con Finanzas, CRM y Logs."}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleSavePreRegistration}
                  disabled={isSaving || !termsAccepted || isFolioValidatedAndLocked}
                  title={
                    isFolioValidatedAndLocked
                      ? "Esta ficha ya fue confirmada y activada oficialmente"
                      : !termsAccepted
                      ? "Debes marcar 'Acepto los términos y condiciones' para habilitar Confirmar y Activar Ficha"
                      : "Confirmar y Activar Ficha Oficial"
                  }
                  className="px-7 py-3.5 rounded-2xl bg-gradient-to-r from-[#FF0096] via-[#9B00CC] to-[#00C8D4] hover:opacity-95 text-white font-black text-xs shadow-xl shadow-pink-900/20 transition-all flex items-center gap-2 cursor-pointer disabled:opacity-45 disabled:cursor-not-allowed hover:scale-102 active:scale-98"
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Confirmando y Activando Ficha...</span>
                    </>
                  ) : isFolioValidatedAndLocked ? (
                    <>
                      <Lock className="w-4 h-4" />
                      <span>Ficha Validada y Bloqueada ({protectedFolio})</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-4.5 h-4.5" />
                      <span>
                        {isClientReviewMode
                          ? "Confirmar y Activar Ficha"
                          : publishDirectly
                          ? "Publicar y Emitir Comprobante con QR"
                          : "Guardar Pre-Registro y Emitir Comprobante QR"}
                      </span>
                    </>
                  )}
                </button>
              </div>

            </div>

            {/* Columna Derecha: Previsualización en Vivo de la Ficha Pública */}
            <div className="lg:col-span-5 sticky top-8 space-y-4">
              
              <div className="flex items-center justify-between px-2">
                <span className="text-xs font-black uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                  <Eye className="w-3.5 h-3.5 text-[#00C8D4]" />
                  <span>Vista Previa de la Ficha Pública</span>
                </span>
                <span className="text-[10px] bg-slate-200 text-slate-700 px-2 py-0.5 rounded-md font-bold">
                  Live Card
                </span>
              </div>

              {/* Tarjeta Pública Renderizada (BoutiqueEstablishmentCard Spec) */}
              <div className="group rounded-3xl overflow-hidden transition-all duration-300 flex flex-col bg-gradient-to-br from-[#0e011f] via-[#15062c] to-[#1a0533] text-white border border-[#9B00CC]/50 shadow-2xl shadow-purple-950/40">
                
                {/* Carrusel / Foto Superior */}
                <div className="relative aspect-[4/3] w-full overflow-hidden bg-slate-900">
                  <img
                    src={(primaryImage && primaryImage.trim().length > 0 ? primaryImage.trim() : (galleryImages.filter((u) => typeof u === "string" && u.trim().length > 0)[0] || ""))}
                    alt={title}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-slate-950/40 pointer-events-none" />

                  {/* Sello HDV Top Left */}
                  {badges.has_hdv_seal && (
                    <div className="absolute top-3 left-3 z-20">
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black bg-[#FF0096] text-white shadow-md">
                        <div className="w-3.5 h-3.5 rounded-full bg-white/20 flex items-center justify-center">
                          <ShieldCheck className="w-2.5 h-2.5 text-white stroke-[2.5]" />
                        </div>
                        <span>RECOMENDADO HDV</span>
                      </span>
                    </div>
                  )}

                  {/* Rating Top Right */}
                  <div className="absolute top-3 right-3 z-20">
                    <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-slate-950/80 backdrop-blur-md border border-white/20 text-white text-[10px] font-black shadow-md">
                      <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                      <span>{ratingAvg.toFixed(1)}</span>
                    </div>
                  </div>
                </div>

                {/* Contenido de la Tarjeta */}
                <div className="p-5 space-y-3.5 text-left">
                  
                  {/* Categoría & Destino */}
                  <div className="flex items-center justify-between text-[11px] font-black uppercase tracking-wider">
                    <span className="text-[#00C8D4] font-extrabold">{categoryName}</span>
                    <div className="flex items-center gap-1 text-slate-300">
                      <MapPin className="w-3 h-3 text-[#FF0096]" />
                      <span>{destinationName}</span>
                    </div>
                  </div>

                  {/* Título de la Propiedad */}
                  <h3 className="text-lg font-black tracking-tight line-clamp-1 text-white" style={{ fontFamily: "'Playfair Display', serif" }}>
                    {title || "Nombre de la Propiedad"}
                  </h3>

                  {/* Badges Operativos de la Ficha */}
                  <div className="flex flex-wrap gap-1.5">
                    {badges.has_power_plant && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                        <Zap className="w-3 h-3" /> Planta 24/7
                      </span>
                    )}
                    {badges.has_water_247 && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[10px] font-bold bg-[#00C8D4]/20 text-[#00C8D4] border border-[#00C8D4]/30">
                        <Droplets className="w-3 h-3" /> Agua 24/7
                      </span>
                    )}
                    {badges.has_starlink && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[10px] font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                        <Wifi className="w-3 h-3" /> Starlink
                      </span>
                    )}
                    {badges.is_pet_friendly && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                        <Dog className="w-3 h-3" /> Pet Friendly
                      </span>
                    )}
                  </div>

                  {/* Pills Secundarias (Compactas con truncado limpio para no deformar la tarjeta) */}
                  {pills.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {pills.map((p) => (
                        <span
                          key={p}
                          title={p}
                          className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-md bg-white/10 text-slate-300 border border-white/5 max-w-[145px]"
                        >
                          <span className="shrink-0">•</span>
                          <span className="truncate">{p}</span>
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Reseña / Extracto Comercial */}
                  <p className="text-xs text-slate-300 line-clamp-2 leading-relaxed">
                    {shortDescription || "Breve descripción comercial..."}
                  </p>

                  {/* Precio y Botones de Acción Directos (Modo estándar: Tarifa directa a consultar) */}
                  <div className="pt-3 border-t border-white/10 space-y-2.5">
                    <div className="flex items-center justify-between gap-2">
                      <div>
                        <span className="text-[9px] uppercase font-black text-slate-400 block">Modalidad Oficial</span>
                        <span className="text-[9px] text-[#00C8D4] font-black">0% Comisiones OTA</span>
                      </div>

                      {showOfficialPrice && basePriceFrom > 0 ? (
                        <div className="text-right">
                          <span className="text-[9px] uppercase font-bold text-slate-400 block">Desde</span>
                          <span className="text-base font-black text-[#FF0096]">${basePriceFrom}</span>
                          <span className="text-[10px] text-slate-400 font-normal"> / noche</span>
                        </div>
                      ) : (
                        <div className="text-right">
                          <span className="text-xs font-black text-white block">Tarifa directa a consultar</span>
                          <span className="text-[9px] font-bold text-[#25D366]">Trato directo con el anfitrión</span>
                        </div>
                      )}
                    </div>

                    <div className="flex flex-col gap-2">
                      {/* Botón Principal WhatsApp */}
                      <a
                        href={`https://wa.me/${whatsappNumber.replace(/[^0-9]/g, "")}`}
                        target="_blank"
                        rel="noreferrer"
                        className="w-full py-2.5 px-3 rounded-2xl bg-[#25D366] hover:bg-[#1ebe57] text-white font-black text-xs transition-all shadow-lg shadow-[#25D366]/30 flex items-center justify-center gap-2 uppercase tracking-wider"
                        title="Consultar precio por WhatsApp"
                      >
                        <MessageCircle className="w-4 h-4" />
                        <span>Consultar precio por WhatsApp</span>
                      </a>

                      {/* Botón Ver Ficha */}
                      <button
                        type="button"
                        className="w-full py-2.5 px-3.5 rounded-2xl bg-gradient-to-r from-[#FF0096] to-[#9B00CC] hover:opacity-95 text-white text-xs font-black transition-all flex items-center justify-center gap-1.5 shadow-sm uppercase tracking-wider"
                      >
                        <Eye className="w-3.5 h-3.5 text-[#00C8D4]" />
                        <span>Ver Ficha y Reservar</span>
                      </button>
                    </div>
                  </div>

                </div>

              </div>

              {/* Resumen en Vivo de Clasificación Comercial y Correlativo Financiero */}
              <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-lg space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                    Resumen Comercial en Vivo
                  </span>
                  <span className="px-2.5 py-0.5 rounded-md bg-[#0e011f] text-[#00C8D4] font-mono text-[10px] font-black">
                    HDV-PR-2026-{String(salesCounters.preRegCounter + 1).padStart(4, "0")}
                  </span>
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-1.5">
                  <span className="block text-[10px] font-black uppercase text-[#FF0096]">
                    {modality === "fundadores_50"
                      ? `Membresía Exonerada - Alianza 50 Fundadores (Cupo #${Math.min(
                          50,
                          foundersOccupied + 1
                        )}/50)`
                      : modality === "exclusivo_prestigio"
                      ? `Membresía Exonerada - Selección Exclusiva Prestigio 2026 (Cupo #${Math.min(
                          50,
                          foundersOccupied + 1
                        )}/50)`
                      : `Membresía Comercial — ${currentPlanObj.name}`}
                  </span>
                  <p className="text-xs font-extrabold text-slate-900">
                    {modality !== "comercial_estandar" && foundersOccupied < MAX_FOUNDERS_QUOTA
                      ? "Asiento en Finanzas: $0.00 USD (Exonerado - Lanzamiento)"
                      : origin === "agente_ventas"
                      ? `Factura Correlativa HDV-FAC-2026-${String(
                          salesCounters.invoiceCounter + 1
                        ).padStart(4, "0")} • $${customMonthlyUsd.toFixed(2)} USD/mes`
                      : `Orden Comercial HDV-FAC-2026-${String(
                          salesCounters.invoiceCounter + 1
                        ).padStart(4, "0")} • ${currentPlanObj.name}`}
                  </p>
                  <span className="block text-[10px] text-slate-500 font-semibold">
                    Origen:{" "}
                    {origin === "agente_ventas"
                      ? `Agente de Ventas HDV (${customAgentName})`
                      : `Propietario / Gerente (${ownerOrManagerName || title})`}
                  </span>
                </div>
              </div>

            </div>

          </div>
        ) : (
          /* Pestaña 2: Configurador Flexible de Dormitorios V13 */
          <div className="space-y-6">
            <FlexibleBedroomConfigurator
              unitName={title}
              initialBedroomsCount={5}
              onSave={(savedGroups) => {
                alert(`¡Distribución de ${savedGroups.length} grupos de dormitorios guardada correctamente en JSONB!`);
              }}
            />
          </div>
        )}

      </div>

      {/* Modal Automático de Comprobante Oficial de Pre-Registro con Código QR */}
      <PreRegistrationReceiptModal
        receipt={emittedReceipt}
        onClose={() => setEmittedReceipt(null)}
      />

    </div>
  );
}
