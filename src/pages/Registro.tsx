import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "../lib/auth";
import { User, Mail, Lock, Loader2, ArrowLeft, Building2 } from "lucide-react";

export function Registro() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [role, setRole] = useState("user"); // "user" (Turista) o "owner" (Propietario)
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [loadingForm, setLoadingForm] = useState(false);
  const { register } = useAuth();
  const [, setLocation] = useLocation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !password || !confirmPassword) {
      setErrorMsg("Por favor, completa todos los campos del formulario.");
      return;
    }

    if (password !== confirmPassword) {
      setErrorMsg("Las contraseñas ingresadas no coinciden.");
      return;
    }

    if (password.length < 6) {
      setErrorMsg("La contraseña debe tener al menos 6 caracteres.");
      return;
    }

    try {
      setErrorMsg("");
      setSuccessMsg("");
      setLoadingForm(true);
      
      const { error } = await register(email, password, name, role);

      if (error) {
        setErrorMsg(error.message || "Ocurrió un error al intentar crear tu cuenta.");
      } else {
        setSuccessMsg("¡Cuenta creada con éxito! Redirigiendo al inicio...");
        setTimeout(() => {
          setLocation("/");
        }, 1500);
      }
    } catch (err) {
      setErrorMsg("Ocurrió un error inesperado durante el registro.");
      console.error(err);
    } finally {
      setLoadingForm(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex flex-col items-center justify-center px-4 relative bg-gray-50/50 py-12">
      {/* Luces sutiles */}
      <div className="absolute top-1/4 left-1/4 w-[300px] h-[300px] bg-brand-magenta/5 rounded-full blur-[80px] pointer-events-none"></div>
      <div className="absolute bottom-1/4 right-1/4 w-[300px] h-[300px] bg-brand-turquesa/5 rounded-full blur-[80px] pointer-events-none"></div>

      <div className="bg-white border border-gray-100 max-w-md w-full rounded-3xl p-8 md:p-10 shadow-xl relative z-10 text-center">
        
        {/* Volver */}
        <Link href="/" className="inline-flex items-center gap-1.5 text-xs text-gray-400 hover:text-gray-600 transition-colors mb-6 self-start">
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Volver al inicio</span>
        </Link>

        {/* Logo */}
        <div className="flex justify-center mb-6">
          <img 
            src="/images/logo-hdv-transparent.png" 
            alt="Hoteles de Venezuela" 
            className="h-12 w-auto object-contain"
          />
        </div>

        <h1 className="text-2xl font-black text-gray-800 tracking-tight">Crea tu Cuenta Premium</h1>
        <p className="text-gray-400 text-xs mt-1 mb-8">
          Únete a la plataforma oficial de hospedaje y turismo en Venezuela.
        </p>

        {errorMsg && (
          <div className="bg-red-50 border border-red-100 text-red-600 rounded-xl px-4 py-3 text-xs font-semibold text-left mb-6">
            ⚠ {errorMsg}
          </div>
        )}

        {successMsg && (
          <div className="bg-green-50 border border-green-100 text-green-600 rounded-xl px-4 py-3 text-xs font-semibold text-left mb-6">
            ✓ {successMsg}
          </div>
        )}

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="space-y-4 text-left">
          
          {/* Nombre completo */}
          <div>
            <label className="block text-[10px] uppercase font-bold text-gray-400 tracking-wider mb-1.5">Nombre Completo</label>
            <div className="flex items-center gap-2 bg-gray-50 border border-gray-100 rounded-xl px-3.5 py-2.5 focus-within:border-brand-magenta transition-colors">
              <User className="w-4 h-4 text-gray-400 shrink-0" />
              <input 
                type="text" 
                placeholder="Pedro Pérez"
                value={name}
                onChange={e => setName(e.target.value)}
                className="bg-transparent border-none outline-none text-xs text-gray-700 w-full placeholder-gray-400"
                required
              />
            </div>
          </div>

          {/* Email */}
          <div>
            <label className="block text-[10px] uppercase font-bold text-gray-400 tracking-wider mb-1.5">Correo Electrónico</label>
            <div className="flex items-center gap-2 bg-gray-50 border border-gray-100 rounded-xl px-3.5 py-2.5 focus-within:border-brand-magenta transition-colors">
              <Mail className="w-4 h-4 text-gray-400 shrink-0" />
              <input 
                type="email" 
                placeholder="ejemplo@correo.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="bg-transparent border-none outline-none text-xs text-gray-700 w-full placeholder-gray-400"
                required
              />
            </div>
          </div>

          {/* Selector de Rol */}
          <div>
            <label className="block text-[10px] uppercase font-bold text-gray-400 tracking-wider mb-2">Tipo de Cuenta</label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setRole("user")}
                className={`py-3 px-4 rounded-xl border text-center font-bold text-xs flex flex-col items-center justify-center gap-2 cursor-pointer transition-all ${
                  role === "user" 
                    ? "border-brand-magenta bg-magenta-50/5 text-brand-magenta shadow-sm" 
                    : "border-gray-100 bg-gray-50/50 text-gray-400 hover:bg-gray-50"
                }`}
              >
                <User className="w-4 h-4" />
                <span>Soy Turista</span>
              </button>
              <button
                type="button"
                onClick={() => setRole("owner")}
                className={`py-3 px-4 rounded-xl border text-center font-bold text-xs flex flex-col items-center justify-center gap-2 cursor-pointer transition-all ${
                  role === "owner" 
                    ? "border-brand-purple bg-purple-50/5 text-brand-purple shadow-sm" 
                    : "border-gray-100 bg-gray-50/50 text-gray-400 hover:bg-gray-50"
                }`}
              >
                <Building2 className="w-4 h-4" />
                <span>Soy Propietario</span>
              </button>
            </div>
          </div>

          {/* Password */}
          <div>
            <label className="block text-[10px] uppercase font-bold text-gray-400 tracking-wider mb-1.5">Contraseña</label>
            <div className="flex items-center gap-2 bg-gray-50 border border-gray-100 rounded-xl px-3.5 py-2.5 focus-within:border-brand-magenta transition-colors">
              <Lock className="w-4 h-4 text-gray-400 shrink-0" />
              <input 
                type="password" 
                placeholder="Mínimo 6 caracteres"
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="bg-transparent border-none outline-none text-xs text-gray-700 w-full placeholder-gray-400"
                required
              />
            </div>
          </div>

          {/* Confirmar Password */}
          <div>
            <label className="block text-[10px] uppercase font-bold text-gray-400 tracking-wider mb-1.5">Confirmar Contraseña</label>
            <div className="flex items-center gap-2 bg-gray-50 border border-gray-100 rounded-xl px-3.5 py-2.5 focus-within:border-brand-magenta transition-colors">
              <Lock className="w-4 h-4 text-gray-400 shrink-0" />
              <input 
                type="password" 
                placeholder="Repite tu contraseña"
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                className="bg-transparent border-none outline-none text-xs text-gray-700 w-full placeholder-gray-400"
                required
              />
            </div>
          </div>

          {/* Submit */}
          <button 
            type="submit"
            disabled={loadingForm}
            className="w-full btn-magenta-gradient py-3.5 rounded-xl font-bold text-xs flex items-center justify-center gap-2 shadow-md shadow-brand-magenta/10 cursor-pointer active:scale-98 hover:scale-101 transition-all mt-6 disabled:opacity-50"
          >
            {loadingForm ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Creando Cuenta...</span>
              </>
            ) : (
              <span>Registrarse Ahora</span>
            )}
          </button>
        </form>

        <p className="text-gray-500 text-xs mt-8">
          ¿Ya posees una cuenta?{" "}
          <Link href="/login" className="text-brand-magenta font-bold hover:underline">
            Inicia sesión aquí
          </Link>
        </p>
      </div>
    </div>
  );
}
