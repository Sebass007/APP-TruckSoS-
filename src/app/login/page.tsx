'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Truck, Mail, Lock, ArrowRight, ShieldAlert } from 'lucide-react';
import { supabase } from '@/lib/supabase';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // 1. Autenticar con Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError) throw authError;
      if (!authData.user) throw new Error('No se pudo obtener la información del usuario');

      // 2. Consultar el tipo de usuario en la tabla 'usuarios'
      const { data: userData, error: userError } = await supabase
        .from('usuarios')
        .select('tipo')
        .eq('id', authData.user.id)
        .single();

      if (userError) throw userError;

      // 3. Redirigir según el tipo
      const role = userData.tipo;
      if (role === 'admin') {
        router.push('/admin');
      } else if (role === 'proveedor') {
        router.push('/proveedor');
      } else {
        router.push('/cliente');
      }

    } catch (err: any) {
      setError(err.message || 'Error al iniciar sesión');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-neutral-950 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="flex justify-center mb-8">
          <Link href="/" className="flex items-center gap-2">
            <Truck className="w-10 h-10 text-orange-500" />
            <span className="text-3xl font-black text-white tracking-tighter uppercase">
              TRUCK<span className="text-orange-500 italic">SOS</span>
            </span>
          </Link>
        </div>
        
        <div className="bg-neutral-900 p-8 rounded-2xl border border-neutral-800 shadow-2xl">
          <h1 className="text-2xl font-black text-white mb-2 italic">BIENVENIDO DE VUELTA</h1>
          <p className="text-neutral-400 text-sm mb-8 font-medium uppercase tracking-wider">Ingresa tus credenciales para continuar</p>
          
          {error && (
            <div className="mb-6 p-4 bg-red-600/20 border border-red-600 rounded-xl text-red-500 text-xs font-bold flex items-center gap-3">
              <ShieldAlert className="w-4 h-4 flex-shrink-0" />
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label className="block text-xs font-black text-neutral-500 uppercase tracking-widest mb-2 italic">Email corporativo o personal</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-600" />
                <input 
                  type="email" 
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-xl py-4 pl-12 pr-4 text-white focus:outline-none focus:border-orange-500 transition-all font-medium"
                  placeholder="ejemplo@trucksos.com"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-xs font-black text-neutral-500 uppercase tracking-widest mb-2 italic">Contraseña segura</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-600" />
                <input 
                  type="password" 
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-xl py-4 pl-12 pr-4 text-white focus:outline-none focus:border-orange-500 transition-all font-medium"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <button 
              type="submit"
              disabled={loading}
              className="w-full bg-orange-600 hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed text-white py-4 rounded-xl font-black text-lg transition-all shadow-lg shadow-orange-600/20 flex items-center justify-center gap-3 group"
            >
              {loading ? 'INICIANDO SESIÓN...' : (
                <>
                  INICIAR SESIÓN
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>

          <div className="mt-8 pt-8 border-t border-neutral-800 text-center">
            <p className="text-neutral-500 text-sm font-bold uppercase tracking-wider mb-4">¿No tienes una cuenta?</p>
            <Link href="/registro" className="text-orange-500 hover:text-orange-400 font-black italic">
              REGÍSTRATE GRATIS AQUÍ
            </Link>
          </div>
        </div>

        <div className="mt-8 text-center flex justify-center gap-6">
           <span className="text-[10px] text-neutral-700 font-bold uppercase tracking-widest">TruckSOS Perú © 2026</span>
        </div>
      </div>
    </main>
  );
}
