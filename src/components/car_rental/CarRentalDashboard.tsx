import React, { useState } from "react";
import {
  Car, Key, ShieldCheck, Clock, CheckCircle2, AlertCircle,
  FileText, Plus, RefreshCw, Building2, Gauge, Fuel, Calendar, Search
} from "lucide-react";
import type { RentalVehicle, RentalContract } from "../../types/carRentalFleet";
import { ConstellationBackground } from "../ConstellationBackground";

interface CarRentalDashboardProps {
  establishment?: {
    id: number;
    name: string;
    slug?: string;
    category_name?: string;
  } | null;
  onSwitchToTraditionalDashboard?: () => void;
}

export const CarRentalDashboard: React.FC<CarRentalDashboardProps> = ({
  establishment,
  onSwitchToTraditionalDashboard
}) => {
  const estName = establishment?.name || "Global Rent-a-Car Venezuela";

  const [activeTab, setActiveTab] = useState<"flota" | "contratos" | "mantenimiento">("flota");

  // Mock Vehicles
  const [vehicles, setVehicles] = useState<RentalVehicle[]>([
    {
      id: "VEH-01",
      plate_number: "AA123BC",
      make: "Toyota",
      model: "Fortuner 4x4",
      year: 2024,
      category: "suv_4x4",
      transmission: "automatico",
      daily_rate_usd: 120,
      status: "alquilado",
      mileage_km: 18450,
      fuel_level_fraction: 0.9,
      insurance_policy_number: "POL-SEGUROS-8891",
      color: "Blanco Perlado"
    },
    {
      id: "VEH-02",
      plate_number: "AB987DE",
      make: "Toyota",
      model: "Corolla Sedan",
      year: 2023,
      category: "sedan",
      transmission: "automatico",
      daily_rate_usd: 65,
      status: "disponible",
      mileage_km: 32100,
      fuel_level_fraction: 1.0,
      insurance_policy_number: "POL-SEGUROS-8892",
      color: "Plata"
    },
    {
      id: "VEH-03",
      plate_number: "AC456FG",
      make: "Toyota",
      model: "Hilux Doble Cabina",
      year: 2024,
      category: "camioneta_pickup",
      transmission: "sincronico",
      daily_rate_usd: 110,
      status: "alquilado",
      mileage_km: 24300,
      fuel_level_fraction: 0.75,
      insurance_policy_number: "POL-SEGUROS-8893",
      color: "Gris Oscuro"
    },
    {
      id: "VEH-04",
      plate_number: "AD111JK",
      make: "Hyundai",
      model: "Grand i10",
      year: 2023,
      category: "economico",
      transmission: "automatico",
      daily_rate_usd: 45,
      status: "disponible",
      mileage_km: 41200,
      fuel_level_fraction: 1.0,
      insurance_policy_number: "POL-SEGUROS-8894",
      color: "Azul Eléctrico"
    },
    {
      id: "VEH-05",
      plate_number: "AE999BL",
      make: "Toyota",
      model: "Land Cruiser Blindada Nivel 5",
      year: 2024,
      category: "blindado",
      transmission: "automatico",
      daily_rate_usd: 350,
      status: "reservado",
      mileage_km: 12000,
      fuel_level_fraction: 1.0,
      insurance_policy_number: "POL-BLINDADOS-001",
      color: "Negro Cosmos"
    }
  ]);

  // Mock Contracts
  const [contracts] = useState<RentalContract[]>([
    {
      id: "CTR-801",
      contract_number: "RAC-2026-042",
      vehicle_id: "VEH-01",
      vehicle_summary: "Toyota Fortuner 4x4 (AA123BC)",
      customer_name: "Guillermo Sanabria",
      customer_id_document: "V-18.442.109",
      customer_phone: "+58 414-2223344",
      start_date: "08/09/2026",
      end_date: "14/09/2026",
      days_count: 6,
      total_usd: 720,
      security_deposit_usd: 500,
      initial_mileage_km: 18450,
      initial_fuel_level: "Full (1/1)",
      status: "activo",
      created_at: "Ayer"
    },
    {
      id: "CTR-802",
      contract_number: "RAC-2026-043",
      vehicle_id: "VEH-03",
      vehicle_summary: "Toyota Hilux Doble Cabina (AC456FG)",
      customer_name: "Minera & Logística del Sur C.A.",
      customer_id_document: "J-40192831-2",
      customer_phone: "+58 412-9998877",
      start_date: "05/09/2026",
      end_date: "12/09/2026",
      days_count: 7,
      total_usd: 770,
      security_deposit_usd: 600,
      initial_mileage_km: 24300,
      initial_fuel_level: "Full (1/1)",
      status: "activo",
      created_at: "Hace 4 días"
    }
  ]);

  const rentedCount = vehicles.filter(v => v.status === "alquilado").length;
  const availableCount = vehicles.filter(v => v.status === "disponible").length;
  const occupancyPct = Math.round((rentedCount / vehicles.length) * 100);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 pb-20 selection:bg-[#00C8D4] selection:text-slate-950">
      {/* Hero Header */}
      <div className="relative overflow-hidden bg-gradient-to-r from-[#0e011f] via-[#1a0533] to-[#0e011f] border-b border-white/10 py-10 px-6 sm:px-10">
        <ConstellationBackground />
        <div className="max-w-7xl mx-auto relative z-10 space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="px-3 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-gradient-to-r from-[#00C8D4] to-[#9B00CC] text-slate-950 font-black shadow-md">
                  SUITE PARA RENT-A-CAR & ALQUILER DE VEHÍCULOS
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                  Control de Flota y Contratos
                </span>
              </div>
              <h1 className="text-2xl md:text-3xl font-black font-serif text-white tracking-tight flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#00C8D4] flex items-center justify-center text-slate-950 shadow-lg">
                  <Car className="w-5 h-5 stroke-[2.5]" />
                </div>
                <span>{estName}</span>
              </h1>
              <p className="text-xs text-slate-300 font-medium max-w-2xl">
                Gestión de flota vehicular, contratos de alquiler digitalizados, entregas y devoluciones con control de odómetro y combustible.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <div className="px-3.5 py-2 rounded-2xl bg-white/5 border border-white/10 text-xs flex items-center gap-2 text-slate-300 backdrop-blur-md">
                <ShieldCheck className="w-4 h-4 text-[#00C8D4]" />
                <span>Pólizas RCV & Todo Riesgo</span>
              </div>

              {onSwitchToTraditionalDashboard && (
                <button
                  onClick={onSwitchToTraditionalDashboard}
                  className="px-4 py-2.5 rounded-2xl bg-gradient-to-r from-[#FF0096] to-[#9B00CC] hover:opacity-90 text-white font-extrabold text-xs shadow-lg transition-all flex items-center gap-2 cursor-pointer border border-white/20 hover:scale-[1.02]"
                >
                  <Building2 className="w-4 h-4 text-white" />
                  <span>⬅ Volver al Dashboard Matriz</span>
                </button>
              )}
            </div>
          </div>

          {/* KPIs Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-2">
            <div className="bg-white/5 border border-white/10 rounded-2xl p-4 backdrop-blur-md">
              <span className="text-[10px] font-bold text-slate-400 uppercase block tracking-wider">Flota Total</span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-2xl font-black text-white">{vehicles.length}</span>
                <span className="text-xs text-slate-400">vehículos</span>
              </div>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-2xl p-4 backdrop-blur-md">
              <span className="text-[10px] font-bold text-slate-400 uppercase block tracking-wider">Vehículos Alquilados</span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-2xl font-black text-[#00C8D4]">{rentedCount}</span>
                <span className="text-xs text-slate-400">({occupancyPct}% de la flota)</span>
              </div>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-2xl p-4 backdrop-blur-md">
              <span className="text-[10px] font-bold text-slate-400 uppercase block tracking-wider">Disponibles en Patio</span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-2xl font-black text-emerald-400">{availableCount}</span>
                <span className="text-xs text-slate-400">listos para entrega</span>
              </div>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-2xl p-4 backdrop-blur-md">
              <span className="text-[10px] font-bold text-slate-400 uppercase block tracking-wider">Contratos Activos</span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-2xl font-black text-[#FF0096]">{contracts.length}</span>
                <span className="text-xs text-slate-400">en curso</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="max-w-7xl mx-auto px-6 pt-6">
        <div className="flex items-center gap-2 border-b border-white/10 pb-3 overflow-x-auto">
          {[
            { id: "flota", label: "Inventario de Flota", icon: Car },
            { id: "contratos", label: "Contratos de Alquiler", icon: FileText, badge: `${contracts.length}` }
          ].map(tab => {
            const active = activeTab === tab.id;
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer shrink-0 border ${
                  active
                    ? "bg-[#00C8D4] text-slate-950 border-white font-black shadow-lg shadow-[#00C8D4]/20"
                    : "bg-white/5 hover:bg-white/10 text-slate-300 border-white/10"
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
                {tab.badge && (
                  <span className={`px-1.5 py-0.2 rounded-full text-[9px] font-black ${active ? "bg-slate-950 text-white" : "bg-[#FF0096] text-white"}`}>
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 pt-6">
        {/* INVENTARIO DE FLOTA */}
        {activeTab === "flota" && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-lg font-black text-white font-serif">Flota de Vehículos Registrados</h3>
                <p className="text-xs text-slate-400">Tarifas por día, kilometraje actual, nivel de combustible y estado operativo.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {vehicles.map(veh => {
                const isRented = veh.status === "alquilado";
                const isAvailable = veh.status === "disponible";
                const isReserved = veh.status === "reservado";
                return (
                  <div
                    key={veh.id}
                    className={`p-5 rounded-3xl border transition-all flex flex-col justify-between gap-4 ${
                      isRented
                        ? "bg-gradient-to-br from-[#1a0533] to-[#0e011f] border-[#00C8D4]/40 shadow-lg"
                        : isReserved
                        ? "bg-purple-950/20 border-purple-500/40"
                        : "bg-white/5 border-white/10"
                    }`}
                  >
                    <div className="space-y-3">
                      <div className="flex justify-between items-start">
                        <div>
                          <span className="text-[10px] uppercase font-bold text-[#00C8D4] tracking-wider block">
                            Placa: {veh.plate_number} · {veh.year}
                          </span>
                          <h4 className="text-xl font-black text-white">{veh.make} {veh.model}</h4>
                          <span className="text-xs text-slate-400 capitalize">{veh.color} · Transmisión {veh.transmission}</span>
                        </div>
                        <span className={`px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-wider ${
                          isRented ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/30" :
                          isAvailable ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30" :
                          "bg-purple-500/20 text-purple-300 border border-purple-500/30"
                        }`}>
                          {veh.status}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-xs text-slate-300 bg-white/5 p-3 rounded-2xl">
                        <div>
                          <span className="text-[9px] text-slate-400 uppercase block">Tarifa por Día</span>
                          <span className="font-black text-[#FF0096] text-sm">${veh.daily_rate_usd} USD</span>
                        </div>
                        <div>
                          <span className="text-[9px] text-slate-400 uppercase block">Odómetro</span>
                          <span className="font-bold">{veh.mileage_km.toLocaleString()} km</span>
                        </div>
                        <div>
                          <span className="text-[9px] text-slate-400 uppercase block">Combustible</span>
                          <span className="font-bold text-cyan-300">{Math.round(veh.fuel_level_fraction * 100)}% Tanque</span>
                        </div>
                        <div>
                          <span className="text-[9px] text-slate-400 uppercase block">Póliza</span>
                          <span className="font-bold text-[10px] truncate block">{veh.insurance_policy_number}</span>
                        </div>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-white/10 flex items-center justify-between text-xs text-slate-400">
                      <span>Categoría: <strong className="text-white uppercase text-[10px]">{veh.category.replace("_", " ")}</strong></span>
                      <span className="text-emerald-400 font-bold">GPS Activo</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* CONTRATOS DE ALQUILER */}
        {activeTab === "contratos" && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-lg font-black text-white font-serif">Contratos de Renta Activos</h3>
                <p className="text-xs text-slate-400">Seguimiento de entregas, kilometraje inicial y depósitos en garantía.</p>
              </div>
            </div>

            <div className="space-y-4">
              {contracts.map(contract => (
                <div key={contract.id} className="bg-gradient-to-r from-[#0e011f] via-[#1a0533] to-[#0e011f] border border-white/10 rounded-3xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-6">
                  <div className="space-y-2">
                    <div className="flex items-center gap-3">
                      <span className="px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-[#FF0096] text-white">
                        {contract.contract_number}
                      </span>
                      <span className="text-xs text-slate-400">{contract.created_at}</span>
                    </div>
                    <h4 className="text-xl font-black text-white font-serif">{contract.vehicle_summary}</h4>
                    <p className="text-xs text-slate-300">
                      Cliente: <strong className="text-white">{contract.customer_name}</strong> ({contract.customer_id_document}) · Tel: <strong className="text-[#00C8D4]">{contract.customer_phone}</strong>
                    </p>
                    <p className="text-xs text-slate-400">
                      Periodo: {contract.start_date} al {contract.end_date} ({contract.days_count} días) · Depósito Garantía: <strong className="text-amber-300">${contract.security_deposit_usd} USD</strong>
                    </p>
                  </div>

                  <div className="flex items-center gap-4 shrink-0 text-xs">
                    <div className="text-right">
                      <span className="text-[10px] text-slate-400 uppercase block">Total Contrato</span>
                      <span className="text-xl font-black text-[#00C8D4]">${contract.total_usd} USD</span>
                    </div>
                    <span className="px-3 py-1.5 rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-bold uppercase text-[10px]">
                      En Curso
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
};
