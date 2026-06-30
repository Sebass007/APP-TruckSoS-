'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Truck, User, Mail, Lock, ShieldCheck, Briefcase, Phone, CheckCircle2, MapPin } from 'lucide-react';
import { supabase } from '@/lib/supabase';

const ESPECIALIDADES = [
  { id: 'llantas', label: 'Llantas' },
  { id: 'electrico', label: 'Sistema Eléctrico' },
  { id: 'grua', label: 'Grúa / Remolque' },
  { id: 'bateria', label: 'Batería' },
  { id: 'mecanico', label: 'Mecánico General' },
];

export default function RegisterPage() {
  const router = useRouter();
  const [role, setRole] = useState<'cliente' | 'proveedor'>('cliente');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    nombre: '',
    email: '',
    password: '',
    telefono: '',
    nombre_negocio: '',
    direccion: '',
  });

  const [selectedSpecs, setSelectedSpecs] = useState<string[]>([]);

  const handleSpecToggle = (id: string) => {
    setSelectedSpecs(prev => 
      prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]
    );
  };

  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [showTerms, setShowTerms] = useState(false);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!acceptedTerms) {
      setError('Debes aceptar los términos y condiciones');
      return;
    }
    setLoading(true);
    setError(null);

    try {
      // 1. Crear usuario en Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
      });

      if (authError) throw authError;
      if (!authData.user) throw new Error('No se pudo crear el usuario');

      // 2. Insertar en tabla usuarios
      const { error: userError } = await supabase
        .from('usuarios')
        .insert({
          id: authData.user.id,
          nombre: formData.nombre,
          email: formData.email,
          telefono: formData.telefono,
          tipo: role,
        });

      if (userError) throw userError;

      // 3. Si es proveedor, insertar en tabla proveedores
      if (role === 'proveedor') {
        const { error: provError } = await supabase
          .from('proveedores')
          .insert({
            user_id: authData.user.id,
            nombre_negocio: formData.nombre_negocio,
            especialidades: selectedSpecs,
            direccion: formData.direccion,
          });

        if (provError) throw provError;
      }

      setSuccess(true);
      setTimeout(() => {
        router.push('/login');
      }, 3000);

    } catch (err: any) {
      setError(err.message || 'Ocurrió un error inesperado');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <main className="min-h-screen bg-neutral-950 flex flex-col items-center justify-center p-4">
        <div className="bg-neutral-900 p-8 md:p-12 rounded-3xl border border-neutral-800 text-center max-w-md">
          <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6 text-green-500">
            <CheckCircle2 className="w-12 h-12" />
          </div>
          <h1 className="text-2xl font-black text-white mb-4 italic uppercase tracking-tight">¡REGISTRO EXITOSO!</h1>
          <p className="text-neutral-400 font-medium">Hemos enviado un correo de confirmación. Serás redirigido al login en unos segundos.</p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-neutral-950 flex flex-col items-center justify-center p-4 py-20">
      <div className="w-full max-w-2xl">
        <div className="flex justify-center mb-12">
          <Link href="/" className="flex items-center gap-2">
            <Truck className="w-12 h-12 text-orange-500" />
            <span className="text-4xl font-black text-white tracking-tighter uppercase">
              TRUCK<span className="text-orange-500 italic">SOS</span>
            </span>
          </Link>
        </div>
        
        <div className="bg-neutral-900 p-8 md:p-12 rounded-3xl border border-neutral-800 shadow-2xl">
          <h1 className="text-3xl font-black text-white mb-2 italic uppercase">ÚNETE A LA RED</h1>
          <p className="text-neutral-400 text-sm mb-12 font-medium uppercase tracking-widest">Selecciona tu perfil y comienza ahora</p>
          
          {/* Role Selection */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
            <button 
              type="button"
              onClick={() => setRole('cliente')}
              className={`flex flex-col items-center p-6 rounded-2xl group transition-all border-2 ${
                role === 'cliente' ? 'bg-orange-600/10 border-orange-600' : 'bg-neutral-950 border-neutral-800 hover:border-orange-600/50'
              }`}
            >
              <User className={`w-12 h-12 mb-4 transition-colors ${role === 'cliente' ? 'text-orange-500' : 'text-neutral-600'}`} />
              <span className={`font-black italic transition-colors ${role === 'cliente' ? 'text-white' : 'text-neutral-500'}`}>CLIENTE</span>
              <span className="text-[10px] text-neutral-500 mt-2 uppercase font-bold text-center">Solicita ayuda mecánica en ruta</span>
            </button>
            <button 
              type="button"
              onClick={() => setRole('proveedor')}
              className={`flex flex-col items-center p-6 rounded-2xl group transition-all border-2 ${
                role === 'proveedor' ? 'bg-orange-600/10 border-orange-600' : 'bg-neutral-950 border-neutral-800 hover:border-orange-600/50'
              }`}
            >
              <Briefcase className={`w-12 h-12 mb-4 transition-colors ${role === 'proveedor' ? 'text-orange-500' : 'text-neutral-600'}`} />
              <span className={`font-black italic transition-colors ${role === 'proveedor' ? 'text-white' : 'text-neutral-500'}`}>PROVEEDOR</span>
              <span className="text-[10px] text-neutral-500 mt-2 uppercase font-bold text-center">Brinda auxilio técnico especializado</span>
            </button>
          </div>

          {error && (
            <div className="mb-8 p-4 bg-red-600/20 border border-red-600 rounded-xl text-red-500 text-sm font-bold flex items-center gap-3">
              <ShieldCheck className="w-5 h-5 flex-shrink-0" />
              {error}
            </div>
          )}

          <form onSubmit={handleRegister} className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label className="block text-xs font-black text-neutral-500 uppercase tracking-widest mb-3 italic">
                {role === 'cliente' ? 'Nombre completo' : 'Nombre del Representante'}
              </label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-600" />
                <input 
                  type="text" 
                  required
                  value={formData.nombre}
                  onChange={(e) => setFormData({...formData, nombre: e.target.value})}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-xl py-4 pl-12 pr-4 text-white focus:outline-none focus:border-orange-500 transition-all font-medium"
                  placeholder="Juan Pérez"
                />
              </div>
            </div>

            {role === 'proveedor' && (
              <>
                <div className="md:col-span-2 animate-in fade-in slide-in-from-top-4 duration-300">
                  <label className="block text-xs font-black text-neutral-500 uppercase tracking-widest mb-3 italic">Nombre del Negocio / Taller</label>
                  <div className="relative">
                    <Briefcase className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-600" />
                    <input 
                      type="text" 
                      required
                      value={formData.nombre_negocio}
                      onChange={(e) => setFormData({...formData, nombre_negocio: e.target.value})}
                      className="w-full bg-neutral-950 border border-neutral-800 rounded-xl py-4 pl-12 pr-4 text-white focus:outline-none focus:border-orange-500 transition-all font-medium"
                      placeholder="Llantería Express Arequipa"
                    />
                  </div>
                </div>

                <div className="md:col-span-2 animate-in fade-in slide-in-from-top-4 duration-300">
                  <label className="block text-xs font-black text-neutral-500 uppercase tracking-widest mb-3 italic">Dirección del Taller</label>
                  <div className="relative">
                    <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-600" />
                    <input 
                      type="text" 
                      required
                      value={formData.direccion}
                      onChange={(e) => setFormData({...formData, direccion: e.target.value})}
                      className="w-full bg-neutral-950 border border-neutral-800 rounded-xl py-4 pl-12 pr-4 text-white focus:outline-none focus:border-orange-500 transition-all font-medium"
                      placeholder="Av. Ejército 123, Yanahuara"
                    />
                  </div>
                </div>
              </>
            )}

            <div>
              <label className="block text-xs font-black text-neutral-500 uppercase tracking-widest mb-3 italic">Teléfono de contacto</label>
              <div className="relative">
                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-600" />
                <input 
                  type="tel" 
                  required
                  value={formData.telefono}
                  onChange={(e) => setFormData({...formData, telefono: e.target.value})}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-xl py-4 pl-12 pr-4 text-white focus:outline-none focus:border-orange-500 transition-all font-medium"
                  placeholder="987654321"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-black text-neutral-500 uppercase tracking-widest mb-3 italic">Email</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-600" />
                <input 
                  type="email" 
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-xl py-4 pl-12 pr-4 text-white focus:outline-none focus:border-orange-500 transition-all font-medium"
                  placeholder="ejemplo@trucksos.com"
                />
              </div>
            </div>

            <div className={role === 'proveedor' ? 'md:col-span-2' : 'md:col-span-2'}>
              <label className="block text-xs font-black text-neutral-500 uppercase tracking-widest mb-3 italic">Contraseña segura</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-600" />
                <input 
                  type="password" 
                  required
                  value={formData.password}
                  onChange={(e) => setFormData({...formData, password: e.target.value})}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-xl py-4 pl-12 pr-4 text-white focus:outline-none focus:border-orange-500 transition-all font-medium"
                  placeholder="••••••••"
                />
              </div>
            </div>

            {role === 'proveedor' && (
              <div className="md:col-span-2 animate-in fade-in slide-in-from-top-4 duration-300">
                <label className="block text-xs font-black text-neutral-500 uppercase tracking-widest mb-4 italic">Especialidades (Puedes elegir varias)</label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {ESPECIALIDADES.map((spec) => (
                    <button
                      key={spec.id}
                      type="button"
                      onClick={() => handleSpecToggle(spec.id)}
                      className={`p-3 rounded-xl border text-[10px] font-black uppercase italic transition-all ${
                        selectedSpecs.includes(spec.id)
                          ? 'bg-orange-600 border-orange-500 text-white'
                          : 'bg-neutral-950 border-neutral-800 text-neutral-500 hover:border-orange-500/50'
                      }`}
                    >
                      {spec.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="md:col-span-2 flex items-start gap-3 mt-4">
              <input 
                type="checkbox" 
                id="terms"
                checked={acceptedTerms}
                onChange={(e) => setAcceptedTerms(e.target.checked)}
                className="mt-1 w-4 h-4 accent-orange-500"
              />
              <label htmlFor="terms" className="text-[10px] text-neutral-500 font-bold uppercase tracking-wider leading-relaxed">
                Acepto los <button type="button" onClick={() => setShowTerms(true)} className="text-orange-500 hover:underline">términos de servicio</button> y la política de privacidad de TruckSOS para auxilio mecánico.
              </label>
            </div>

            <div className="md:col-span-2">
              <button 
                type="submit"
                disabled={loading}
                className="w-full bg-orange-600 hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed text-white py-5 rounded-2xl font-black text-xl transition-all shadow-lg shadow-orange-600/20 flex items-center justify-center gap-3 group mt-4"
              >
                {loading ? 'REGISTRANDO...' : (
                  <>
                    <ShieldCheck className="w-6 h-6" />
                    CREAR CUENTA AHORA
                  </>
                )}
              </button>
            </div>
          </form>

          <div className="mt-10 text-center">
            <p className="text-neutral-500 text-sm font-bold uppercase tracking-wider">
              ¿Ya tienes cuenta? <Link href="/login" className="text-orange-500 hover:text-orange-400 italic">Inicia sesión aquí</Link>
            </p>
          </div>
        </div>
      </div>

      {/* Terms Modal */}
      {showTerms && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[5000] flex items-center justify-center p-6 animate-in fade-in">
          <div className="bg-neutral-900 border border-neutral-800 w-full max-w-lg rounded-3xl overflow-hidden shadow-2xl animate-in zoom-in-95">
            <div className="p-8">
              <h2 className="text-xl font-black italic uppercase text-white mb-6">Términos y Condiciones</h2>
              <div className="max-h-[300px] overflow-y-auto text-neutral-400 text-xs space-y-4 pr-4 font-medium uppercase leading-relaxed">
                <p>1. TruckSOS es una plataforma de conexión entre usuarios que requieren auxilio mecánico y proveedores independientes.</p>
                <p>2. El usuario acepta que TruckSOS no se hace responsable por la calidad del servicio técnico prestado por terceros.</p>
                <p>3. Los precios pactados en el chat son referenciales hasta la inspección física del vehículo.</p>
                <p>4. El uso de la geolocalización es obligatorio para el correcto funcionamiento del servicio de emergencia.</p>
                <p>5. TruckSOS protege sus datos personales bajo la ley de protección de datos vigente.</p>
              </div>
              <button 
                onClick={() => setShowTerms(false)}
                className="w-full bg-orange-600 text-white py-4 rounded-xl font-black uppercase italic mt-8 hover:bg-orange-700 transition-all"
              >
                He leído y entiendo
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
