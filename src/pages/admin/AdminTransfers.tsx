import { useAuth } from "@/lib/auth";
import { useLocation } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { AdminTabBar } from "@/components/admin/AdminTabBar";
import { 
  Car, 
  MapPin, 
  Phone, 
  Plus, 
  Trash2, 
  Loader2, 
  User, 
  DollarSign, 
  Calendar,
  CheckCircle,
  Clock,
  XCircle,
  X
} from "lucide-react";
import type { Vehicle, TransferBooking } from "@/types/modules";

export function AdminTransfers() {
  const { user, profile, loading: authLoading } = useAuth();
  const [, nav] = useLocation();
  const qc = useQueryClient();

  const [modal, setModal] = useState(false);
  const [vehicleName, setVehicleName] = useState("");
  const [vehicleType, setVehicleType] = useState("SUV");
  const [capacity, setCapacity] = useState<number>(4);
  const [pricePerKm, setPricePerKm] = useState<number>(1.5);
  const [basePrice, setBasePrice] = useState<number>(20.0);
  const [driverName, setDriverName] = useState("");
  const [whatsapp, setWhatsapp] = useState("");

  useEffect(() => {
    if (!authLoading && (!user || (profile?.role !== "admin" && profile?.role !== "owner" && user?.email?.toLowerCase() !== "hotelesdevenezuela77@gmail.com"))) {
      nav("/hdv-acceso-llc2027");
    }
  }, [user, profile, authLoading]);

  // Query to fetch vehicles
  const { data: vehicles = [], isLoading: loadingVehicles } = useQuery<Vehicle[]>({
    queryKey: ["admin-vehicles"],
    queryFn: async () => {
      let query = supabase.from("vehicles").select("*");
      if (profile?.role === "owner") {
        // Query vehicles associated with the owner's establishments
        const { data: ownerEsts } = await supabase.from("establishments").select("id").eq("owner_user_id", user?.id);
        const estIds = (ownerEsts || []).map(e => e.id);
        query = query.in("establishment_id", estIds);
      }
      const { data, error } = await query.order("created_at", { ascending: false });
      if (error) throw error;
      return data || [];
    },
    enabled: !!user
  });

  // Query to fetch transfer bookings
  const { data: bookings = [], isLoading: loadingBookings } = useQuery<any[]>({
    queryKey: ["admin-transfer-bookings"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("transfer_bookings")
        .select(`
          *,
          vehicles (name, driver_name),
          user_profiles:user_id (name, email)
        `)
        .order("pickup_date", { ascending: true });

      if (error) throw error;
      return data || [];
    },
    enabled: !!user
  });

  // Add vehicle mutation
  const createVehicle = useMutation({
    mutationFn: async () => {
      if (!vehicleName || !whatsapp) {
        alert("El nombre del vehículo y el contacto de WhatsApp son obligatorios.");
        return;
      }
      const { error } = await supabase.from("vehicles").insert({
        name: vehicleName,
        type: vehicleType,
        capacity: Number(capacity),
        price_per_km: Number(pricePerKm),
        base_price: Number(basePrice),
        driver_name: driverName || null,
        whatsapp_contact: whatsapp
      });
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-vehicles"] });
      setModal(false);
      setVehicleName("");
      setDriverName("");
      setWhatsapp("");
    }
  });

  // Delete vehicle
  const deleteVehicle = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("vehicles").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-vehicles"] });
    }
  });

  // Update booking status
  const updateBookingStatus = useMutation({
    mutationFn: async ({ id, status }: { id: string, status: string }) => {
      const { error } = await supabase.from("transfer_bookings").update({ status }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-transfer-bookings"] });
      alert("Reserva de viaje actualizada correctamente.");
    }
  });

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0e011f] text-white">
        <Loader2 className="w-8 h-8 animate-spin text-[#00C8D4]" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 pb-20">
      <AdminTabBar />

      {/* Hero Header */}
      <section className="relative w-full h-48 flex items-center justify-center overflow-hidden bg-[#0e011f] mb-10 z-0">
        <div className="absolute inset-0 bg-gradient-to-br from-[#0e011f] to-[#1a0533] opacity-90 z-10" />
        <div className="relative z-20 text-center text-white px-4">
          <span className="text-[10px] font-black uppercase tracking-[0.25em] text-[#00C8D4] mb-3 block">
            FLOTA Y TRANSPORTE
          </span>
          <h1 className="text-2xl sm:text-4xl font-serif font-black text-white">
            Monitoreo de Traslados y Flotas
          </h1>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4">
        
        {/* Vehicles header and Grid */}
        <div className="flex justify-between items-center gap-4 mb-6">
          <h2 className="text-base font-black uppercase tracking-wider text-gray-900">Nuestra Flota de Vehículos</h2>
          <button 
            onClick={() => setModal(true)}
            className="btn-cyan-gradient text-white text-xs font-extrabold px-4 py-2.5 rounded-xl flex items-center gap-1.5 cursor-pointer shadow-md shadow-[#00C8D4]/15"
          >
            <Plus className="w-4 h-4" /> Agregar Vehículo
          </button>
        </div>

        {loadingVehicles ? (
          <div className="flex justify-center py-6">
            <Loader2 className="w-6 h-6 animate-spin text-[#00C8D4]" />
          </div>
        ) : vehicles.length === 0 ? (
          <div className="bg-white rounded-3xl p-8 text-center border border-gray-100 mb-12 shadow-xs">
            <p className="text-xs text-gray-400 font-bold">No hay vehículos registrados en la flota aún.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            {vehicles.map((v) => (
              <div key={v.id} className="bg-white rounded-3xl p-5 border border-gray-100 shadow-md flex flex-col justify-between hover:shadow-lg transition-all text-left">
                <div>
                  <div className="flex justify-between items-start gap-4 mb-3">
                    <div className="w-8 h-8 rounded-lg bg-[#00C8D4]/10 border border-[#00C8D4]/20 flex items-center justify-center text-[#00C8D4]">
                      <Car className="w-4 h-4 text-[#00C8D4]" />
                    </div>
                    <button 
                      onClick={() => deleteVehicle.mutate(v.id)}
                      className="text-gray-400 hover:text-[#FF0096] transition-colors p-1"
                      title="Eliminar vehículo"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  
                  <h3 className="font-extrabold text-sm text-gray-900">{v.name}</h3>
                  <span className="text-[9px] uppercase font-bold px-2 py-0.5 bg-gray-100 rounded-md text-gray-500 mt-1 inline-block">{v.type}</span>

                  <div className="mt-4 space-y-1.5 border-t border-gray-50 pt-3 text-xs text-gray-600 font-semibold">
                    <div className="flex justify-between">
                      <span>Capacidad:</span>
                      <span className="font-bold text-gray-800">{v.capacity} pax</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Base / Km:</span>
                      <span className="font-bold text-gray-800">${v.base_price} / ${v.price_per_km}</span>
                    </div>
                    {v.driver_name && (
                      <div className="flex justify-between">
                        <span>Chofer:</span>
                        <span className="font-bold text-gray-800">{v.driver_name}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="mt-5 pt-3 border-t border-gray-50 flex items-center gap-2">
                  <Phone className="w-3.5 h-3.5 text-[#00C8D4]" />
                  <a href={`https://wa.me/${v.whatsapp_contact.replace(/\D/g, '')}`} target="_blank" rel="noreferrer" className="text-[10px] font-black text-gray-900 hover:underline">
                    {v.whatsapp_contact}
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Transfer Bookings Section */}
        <h2 className="text-base font-black uppercase tracking-wider text-gray-900 mb-6 text-left">Reservas de Traslados Activas</h2>
        {loadingBookings ? (
          <div className="flex justify-center py-6">
            <Loader2 className="w-6 h-6 animate-spin text-[#00C8D4]" />
          </div>
        ) : bookings.length === 0 ? (
          <div className="bg-white rounded-3xl p-8 text-center border border-gray-100 shadow-xs text-left">
            <p className="text-xs text-gray-400 font-bold text-center">No hay reservas de traslados registradas en el sistema.</p>
          </div>
        ) : (
          <div className="bg-white rounded-3xl border border-gray-100 shadow-md overflow-hidden text-left">
            <div className="overflow-x-auto">
              <table className="w-full text-xs font-semibold text-gray-600">
                <thead>
                  <tr className="bg-gray-50 text-[10px] text-gray-400 font-black uppercase tracking-wider border-b border-gray-100">
                    <th className="py-4 px-6 text-left">Turista</th>
                    <th className="py-4 px-6 text-left">Vehículo / Chofer</th>
                    <th className="py-4 px-6 text-left">Recogida / Destino</th>
                    <th className="py-4 px-6 text-left">Fecha y Pax</th>
                    <th className="py-4 px-6 text-right">Precio</th>
                    <th className="py-4 px-6 text-center">Estado</th>
                    <th className="py-4 px-6 text-center">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {bookings.map((booking) => (
                    <tr key={booking.id} className="hover:bg-gray-55/20 transition-colors">
                      <td className="py-4 px-6">
                        <div className="font-extrabold text-gray-900">{booking.user_profiles?.name || "Turista"}</div>
                        <div className="text-[10px] text-gray-400 font-bold mt-0.5">{booking.user_profiles?.email || "Sin email"}</div>
                      </td>
                      <td className="py-4 px-6">
                        <div className="font-extrabold text-gray-900">{booking.vehicles?.name || "Vehículo"}</div>
                        <div className="text-[10px] text-gray-400 font-bold mt-0.5">Chofer: {booking.vehicles?.driver_name || "Asignado"}</div>
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5 text-[#00C8D4] shrink-0" />
                          <span className="font-extrabold text-gray-900 truncate max-w-[150px]" title={booking.pickup_location}>{booking.pickup_location}</span>
                        </div>
                        <div className="text-[10px] text-gray-400 font-bold mt-0.5 truncate max-w-[150px]" title={booking.dropoff_location}>Destino: {booking.dropoff_location}</div>
                      </td>
                      <td className="py-4 px-6">
                        <div className="font-extrabold text-gray-900 flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5 text-gray-400" />
                          <span>{new Date(booking.pickup_date).toLocaleDateString()}</span>
                        </div>
                        <div className="text-[10px] text-gray-400 font-bold mt-0.5">{booking.passengers_count} personas</div>
                      </td>
                      <td className="py-4 px-6 text-right font-extrabold text-gray-900">
                        ${booking.total_price}
                      </td>
                      <td className="py-4 px-6 text-center">
                        {booking.status === "confirmed" && (
                          <span className="inline-flex items-center gap-1 text-emerald-600 bg-emerald-50 border border-emerald-100 rounded-full px-2.5 py-1 text-[9px] font-black uppercase tracking-wider">
                            <CheckCircle className="w-3 h-3 text-emerald-500" /> Confirmado
                          </span>
                        )}
                        {booking.status === "pending" && (
                          <span className="inline-flex items-center gap-1 text-amber-600 bg-amber-50 border border-amber-100 rounded-full px-2.5 py-1 text-[9px] font-black uppercase tracking-wider">
                            <Clock className="w-3 h-3 text-amber-500" /> Pendiente
                          </span>
                        )}
                        {booking.status === "cancelled" && (
                          <span className="inline-flex items-center gap-1 text-rose-600 bg-rose-50 border border-rose-100 rounded-full px-2.5 py-1 text-[9px] font-black uppercase tracking-wider">
                            <XCircle className="w-3 h-3 text-rose-500" /> Cancelado
                          </span>
                        )}
                      </td>
                      <td className="py-4 px-6 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <button 
                            onClick={() => updateBookingStatus.mutate({ id: booking.id, status: 'confirmed' })}
                            className="bg-emerald-500 hover:bg-emerald-600 text-white font-extrabold px-3 py-1.5 rounded-lg text-[10px] cursor-pointer transition-colors shadow-sm"
                            title="Confirmar"
                          >
                            Aprobar
                          </button>
                          <button 
                            onClick={() => updateBookingStatus.mutate({ id: booking.id, status: 'cancelled' })}
                            className="border border-rose-250 hover:bg-rose-50 text-[#FF0096] font-extrabold px-3 py-1.5 rounded-lg text-[10px] cursor-pointer transition-colors"
                            title="Cancelar"
                          >
                            Cancelar
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

      </div>

      {/* Add vehicle modal */}
      {modal && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white rounded-3xl w-full max-w-md p-6 shadow-2xl relative border border-gray-100 animate-scale-up text-left">
            <button 
              onClick={() => setModal(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors p-1"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="font-black text-base text-gray-900 uppercase tracking-wider mb-6">Agregar Vehículo a Flota</h3>

            <div className="space-y-4">
              <div>
                <label className="block text-[10px] uppercase font-bold text-gray-400 tracking-wider mb-1.5">Nombre del Vehículo</label>
                <input 
                  type="text" 
                  placeholder="ej. Toyota Fortuner 4x4" 
                  value={vehicleName}
                  onChange={(e) => setVehicleName(e.target.value)}
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-xs font-semibold outline-none focus:border-[#00C8D4] transition-colors"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] uppercase font-bold text-gray-400 tracking-wider mb-1.5">Tipo</label>
                  <select 
                    value={vehicleType}
                    onChange={(e) => setVehicleType(e.target.value)}
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-xs font-semibold outline-none focus:border-[#00C8D4] transition-colors bg-white cursor-pointer"
                  >
                    <option value="SUV">Camioneta SUV</option>
                    <option value="Minivan">Minivan Familiar</option>
                    <option value="Bus">Autobús / Van grande</option>
                    <option value="Boat">Lancha / Bote</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] uppercase font-bold text-gray-400 tracking-wider mb-1.5">Capacidad (Pax)</label>
                  <input 
                    type="number" 
                    value={capacity}
                    onChange={(e) => setCapacity(Number(e.target.value))}
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-xs font-semibold outline-none focus:border-[#00C8D4] transition-colors"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] uppercase font-bold text-gray-400 tracking-wider mb-1.5">Precio Base ($)</label>
                  <input 
                    type="number" 
                    value={basePrice}
                    onChange={(e) => setBasePrice(Number(e.target.value))}
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-xs font-semibold outline-none focus:border-[#00C8D4] transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase font-bold text-gray-400 tracking-wider mb-1.5">Precio por Km ($)</label>
                  <input 
                    type="number" 
                    value={pricePerKm}
                    onChange={(e) => setPricePerKm(Number(e.target.value))}
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-xs font-semibold outline-none focus:border-[#00C8D4] transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] uppercase font-bold text-gray-400 tracking-wider mb-1.5">Nombre del Chofer</label>
                <input 
                  type="text" 
                  placeholder="ej. Carlos Rodríguez" 
                  value={driverName}
                  onChange={(e) => setDriverName(e.target.value)}
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-xs font-semibold outline-none focus:border-[#00C8D4] transition-colors"
                />
              </div>

              <div>
                <label className="block text-[10px] uppercase font-bold text-gray-400 tracking-wider mb-1.5">Contacto WhatsApp</label>
                <input 
                  type="text" 
                  placeholder="ej. +584241234567" 
                  value={whatsapp}
                  onChange={(e) => setWhatsapp(e.target.value)}
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-xs font-semibold outline-none focus:border-[#00C8D4] transition-colors"
                />
              </div>
            </div>

            <div className="mt-8 flex gap-3">
              <button 
                onClick={() => setModal(false)}
                className="flex-1 border border-gray-200 hover:bg-gray-50 text-gray-600 font-extrabold py-3 px-4 rounded-xl text-xs transition-colors cursor-pointer"
              >
                Cancelar
              </button>
              <button 
                onClick={() => createVehicle.mutate()}
                className="flex-1 btn-cyan-gradient text-white font-extrabold py-3 px-4 rounded-xl text-xs hover:scale-102 transition-transform cursor-pointer shadow-md shadow-[#00C8D4]/10"
              >
                Registrar Vehículo
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
