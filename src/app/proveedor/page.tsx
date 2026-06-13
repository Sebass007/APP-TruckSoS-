'use client';

import React, { useState, useEffect, useRef } from 'react';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/navigation';
import { Truck, Star, Bell, Check, X, Navigation, LogOut, AlertCircle, Clock, MessageSquare, MapPin } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import ChatBox from '@/components/ChatBox';

import { DashboardSkeleton } from '@/components/Skeleton';

const Mapa = dynamic(() => import('@/components/Mapa'), { 
  ssr: false,
  loading: () => <div className="h-full w-full bg-neutral-900 animate-pulse rounded-2xl" />
});

// Componente interno para el contenido del radar (compartido entre desktop y mobile)
const RadarContent = ({ 
  radarActivo, 
  solicitudes, 
  montoOfertaRapida, 
  setMontoOfertaRapida, 
  enviarOfertaRapida, 
  handleAction,
  getDistance,
  getTime
}: any) => (
  <>
    <div className="flex items-center justify-between mb-6">
      <h3 className="text-[10px] font-black text-neutral-500 uppercase tracking-[0.3em] italic">Radar de Emergencias</h3>
      {radarActivo && (
        <div className="flex items-center gap-2">
          <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-ping"></div>
          <span className="text-[8px] font-black text-green-500 uppercase italic">Buscando...</span>
        </div>
      )}
    </div>

    <div className="relative flex-1">
      {!radarActivo && (
        <div className="absolute inset-0 z-10 bg-neutral-900/80 backdrop-blur-[2px] rounded-3xl flex flex-col items-center justify-center p-8 text-center border border-neutral-800">
          <div className="w-16 h-16 bg-neutral-800 rounded-full flex items-center justify-center mb-4">
            <AlertCircle className="w-8 h-8 text-neutral-600" />
          </div>
          <h4 className="text-sm font-black italic uppercase text-neutral-400">Estás Desconectado</h4>
          <p className="text-[10px] text-neutral-600 font-bold uppercase mt-2 leading-relaxed">Ponte en línea para ver las emergencias cerca de ti</p>
        </div>
      )}

      <div className={`space-y-4 transition-all duration-500 ${!radarActivo ? 'opacity-20 pointer-events-none' : 'opacity-100'}`}>
        {solicitudes.length === 0 ? (
          <div className="text-center py-10">
            <div className="relative w-16 h-16 mx-auto mb-6">
              <div className="absolute inset-0 bg-yellow-500/20 rounded-full animate-ping"></div>
              <div className="absolute inset-0 border-2 border-yellow-500/30 rounded-full"></div>
              <Clock className="absolute inset-0 m-auto w-6 h-6 text-yellow-500 animate-pulse" />
            </div>
            <p className="text-[10px] font-black uppercase italic text-neutral-500 tracking-widest">Escaneando ruta...</p>
          </div>
        ) : solicitudes.map((sol: any) => (
          <div key={sol.id} className="group bg-neutral-950 p-5 rounded-3xl border border-neutral-800 hover:border-yellow-500/50 transition-all duration-500 hover:shadow-[0_0_30px_rgba(234,179,8,0.1)]">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-neutral-900 rounded-2xl flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">
                  {sol.descripcion.includes('CAMION') ? '🚛' : '🚗'}
                </div>
                <div>
                  <p className="font-black italic text-sm uppercase text-white group-hover:text-yellow-500 transition-colors">{sol.tipo_servicio}</p>
                  <p className="text-[9px] text-neutral-500 font-bold uppercase tracking-[0.2em]">{sol.usuarios?.nombre}</p>
                </div>
              </div>
              <div className="flex flex-col items-end">
                <div className="flex items-center gap-1 text-green-500 text-[10px] font-black italic">
                  <MapPin className="w-3 h-3" /> {getDistance(sol.id)}
                </div>
                <div className="text-neutral-600 text-[8px] font-bold uppercase tracking-widest mt-0.5">
                  {getTime(sol.id)} est.
                </div>
              </div>
            </div>

            <div className="bg-neutral-900/50 p-4 rounded-2xl border border-neutral-800/50 mb-4 group-hover:bg-neutral-900 transition-colors">
              <p className="text-[10px] text-neutral-400 line-clamp-2 italic font-medium leading-relaxed">"{sol.descripcion}"</p>
            </div>
            
            <div className="flex gap-2 mb-4">
              <div className="relative flex-1">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-yellow-500 font-black text-[10px]">S/</span>
                <input 
                  type="number"
                  placeholder="Tu oferta..."
                  value={montoOfertaRapida[sol.id] || ''}
                  onChange={(e) => setMontoOfertaRapida({...montoOfertaRapida, [sol.id]: e.target.value})}
                  className="w-full bg-neutral-900 border border-neutral-700 rounded-xl pl-8 pr-3 py-3 text-xs font-black text-yellow-500 focus:outline-none focus:border-yellow-500 transition-all"
                />
              </div>
              <button 
                onClick={() => enviarOfertaRapida(sol.id)}
                className="bg-yellow-500 hover:bg-yellow-600 text-black px-6 py-3 rounded-xl font-black text-[10px] uppercase italic whitespace-nowrap transition-all shadow-lg shadow-yellow-500/10"
              >
                Ofertar
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2 border-t border-neutral-900">
              <button 
                onClick={() => handleAction(sol.id, 'aceptada')}
                className="bg-neutral-800 hover:bg-green-600 text-neutral-400 hover:text-white py-3 rounded-xl font-black text-[10px] transition-all flex items-center justify-center gap-2 uppercase italic"
              >
                <Check className="w-4 h-4" /> Aceptar Directo
              </button>
              <button className="bg-neutral-900 hover:bg-red-600/10 text-neutral-700 hover:text-red-500 py-3 rounded-xl font-black text-[10px] transition-all flex items-center justify-center gap-2 uppercase italic">
                <X className="w-4 h-4" /> Ignorar
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  </>
);

export default function ProveedorDashboard() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [solicitudes, setSolicitudes] = useState<any[]>([]);
  const [solicitudesActivas, setSolicitudesActivas] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [chatSolicitudId, setChatSolicitudId] = useState<string | null>(null);
  const [radarActivo, setRadarActivo] = useState(false);
  const [nuevaSolicitudAlerta, setNuevaSolicitudAlerta] = useState<any>(null);
  const [realtimeStatus, setRealtimeStatus] = useState<'connecting' | 'connected' | 'error'>('connecting');
  const [montoOfertaRapida, setMontoOfertaRapida] = useState<{[key: string]: string}>({});
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const checkUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      router.push('/login');
      return;
    }
    setUser(user);

    const { data: provData } = await supabase
      .from('proveedores')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (provData) setProfile(provData);
    setLoading(false);
  };

  const fetchSolicitudes = async () => {
    const { data } = await supabase
      .from('solicitudes')
      .select('*, usuarios(nombre)')
      .eq('estado', 'pendiente')
      .order('created_at', { ascending: false });

    if (data) setSolicitudes(data);
  };

  const fetchSolicitudesActivas = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data } = await supabase
      .from('solicitudes')
      .select('*, usuarios(nombre)')
      .eq('proveedor_id', user.id)
      .in('estado', ['aceptada', 'en_camino', 'en_sitio'])
      .order('updated_at', { ascending: false });

    if (data) setSolicitudesActivas(data);
  };

  useEffect(() => {
    checkUser();
    fetchSolicitudes();
    fetchSolicitudesActivas();

    // Crear elemento de audio para notificaciones
    audioRef.current = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3');

    // Tiempo real
    const channel = supabase
      .channel('radar-proveedor')
      .on('postgres_changes', { 
        event: 'INSERT', 
        schema: 'public', 
        table: 'solicitudes',
        filter: 'estado=eq.pendiente'
      }, (payload) => {
        console.log("Nueva solicitud detectada via Realtime:", payload);
        if (radarActivo && audioRef.current) {
          audioRef.current.play().catch(e => console.log("Audio block:", e));
        }
        setNuevaSolicitudAlerta(payload.new);
        fetchSolicitudes();
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'solicitudes' }, () => {
        fetchSolicitudes();
        fetchSolicitudesActivas();
      })
      .subscribe((status) => {
        console.log("Status de Realtime Solicitudes:", status);
        if (status === 'SUBSCRIBED') setRealtimeStatus('connected');
        if (status === 'CHANNEL_ERROR') setRealtimeStatus('error');
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [radarActivo]);

  const handleAction = async (solicitudId: string, nuevoEstado: string) => {
    try {
      const updateData: any = { estado: nuevoEstado };
      if (nuevoEstado === 'aceptada') {
        updateData.proveedor_id = user.id;
      }

      const { error } = await supabase
        .from('solicitudes')
        .update(updateData)
        .eq('id', solicitudId);

      if (error) throw error;
      
      if (nuevoEstado === 'aceptada') setChatSolicitudId(solicitudId);
      
      fetchSolicitudes();
      fetchSolicitudesActivas();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const enviarOfertaRapida = async (solicitudId: string) => {
    const monto = montoOfertaRapida[solicitudId];
    if (!monto) return;

    try {
      // Para enviar una oferta estilo InDrive, primero "aceptamos" o enviamos un mensaje de oferta
      // En este flujo, simplemente enviamos el mensaje de oferta
      const { error: msgError } = await supabase
        .from('mensajes')
        .insert({
          solicitud_id: solicitudId,
          emisor_id: user.id,
          contenido: `OFERTA DE AUXILIO: S/ ${monto}`,
          es_oferta: true,
          monto_oferta: parseFloat(monto)
        });

      if (msgError) throw msgError;

      alert("Oferta enviada. Espera a que el cliente acepte.");
      setMontoOfertaRapida({...montoOfertaRapida, [solicitudId]: ''});
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

  // Simulated distance and time for inDrive feel
  const getDistance = (id: string) => {
    const distances = ['1.2 km', '2.5 km', '0.8 km', '4.1 km', '1.7 km'];
    const index = id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % distances.length;
    return distances[index];
  };

  const getTime = (id: string) => {
    const times = ['4 min', '8 min', '3 min', '12 min', '6 min'];
    const index = id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % times.length;
    return times[index];
  };

  if (loading) return <DashboardSkeleton />;

  return (
    <div className="h-screen w-full bg-[#0a0a0a] text-white flex flex-col md:flex-row relative overflow-hidden">
      
      {/* Top Status Bar (Mobile Only) */}
      <div className="md:hidden bg-neutral-900/80 backdrop-blur-md border-b border-neutral-800 p-4 flex items-center justify-between absolute top-0 inset-x-0 z-[3000]">
        <div className="flex items-center gap-2">
          <Truck className="w-6 h-6 text-yellow-500" />
          <span className="font-black italic uppercase text-xs">PROVEEDOR<span className="text-yellow-500">SOS</span></span>
        </div>
        <div className="flex items-center gap-3">
          <div className={`w-2 h-2 rounded-full ${realtimeStatus === 'connected' ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]' : 'bg-red-500 animate-pulse'}`}></div>
          <button 
            onClick={() => setRadarActivo(!radarActivo)}
            className={`px-4 py-2 rounded-xl font-black text-[9px] uppercase transition-all border ${
              radarActivo ? 'bg-green-600 border-green-500 text-white' : 'bg-neutral-800 border-neutral-700 text-neutral-500'
            }`}
          >
            {radarActivo ? 'EN LÍNEA' : 'OFFLINE'}
          </button>
        </div>
      </div>

      {/* Sidebar (Desktop) */}
      <div className="hidden md:flex w-[400px] bg-neutral-900 border-r border-neutral-800 p-6 flex-col overflow-y-auto max-h-screen">
        <div className="flex items-center justify-between mb-10">
          <div className="flex items-center gap-2">
            <Truck className="w-8 h-8 text-yellow-500" />
            <span className="text-xl font-black italic uppercase text-white">PROVEEDOR<span className="text-yellow-500">SOS</span></span>
          </div>
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${realtimeStatus === 'connected' ? 'bg-green-500' : realtimeStatus === 'error' ? 'bg-red-500' : 'bg-yellow-500 animate-pulse'}`}></div>
            <button onClick={handleLogout} className="p-2 text-neutral-500 hover:text-white transition-colors">
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="mb-10">
          <button 
            onClick={() => setRadarActivo(!radarActivo)}
            className={`w-full p-6 rounded-3xl font-black italic uppercase text-sm flex items-center justify-between transition-all duration-500 border-2 ${
              radarActivo 
                ? 'bg-green-600/10 border-green-600 text-green-500 shadow-[0_0_30px_rgba(22,163,74,0.1)]' 
                : 'bg-neutral-950 border-neutral-800 text-neutral-600'
            }`}
          >
            <div className="flex items-center gap-4">
              <div className={`w-4 h-4 rounded-full ${radarActivo ? 'bg-green-500 animate-pulse shadow-[0_0_10px_rgba(34,197,94,0.8)]' : 'bg-neutral-800'}`}></div>
              {radarActivo ? 'ESTOY EN LÍNEA' : 'ESTOY DESCONECTADO'}
            </div>
            <div className={`w-12 h-6 rounded-full relative transition-colors ${radarActivo ? 'bg-green-600' : 'bg-neutral-800'}`}>
              <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${radarActivo ? 'left-7' : 'left-1'}`}></div>
            </div>
          </button>
          <p className="text-[9px] font-black text-neutral-500 uppercase tracking-widest mt-4 text-center">
            {radarActivo ? 'RECIBIRÁS ALERTAS EN TIEMPO REAL' : 'ACTIVA PARA RECIBIR TRABAJOS'}
          </p>
        </div>

        <div className="bg-neutral-950 p-6 rounded-2xl border border-neutral-800 mb-8">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-16 h-16 bg-neutral-800 rounded-full flex items-center justify-center border-2 border-yellow-500">
              <span className="text-2xl font-black text-yellow-500 italic uppercase">{user?.email?.substring(0, 2)}</span>
            </div>
            <div>
              <h2 className="text-lg font-black italic uppercase truncate">{profile?.nombre_negocio || 'Mi Taller'}</h2>
              <div className="flex items-center gap-1 text-yellow-500">
                <Star className="w-4 h-4 fill-yellow-500" />
                <span className="text-sm font-bold">{profile?.calificacion_promedio?.toFixed(1) || '0.0'}</span>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div className="bg-neutral-900 p-3 rounded-xl text-center">
              <p className="text-[9px] text-neutral-500 font-black uppercase tracking-widest">Estatus</p>
              <p className="text-xs font-black text-green-500 italic mt-1 uppercase">Disponible</p>
            </div>
            <div className="bg-neutral-900 p-3 rounded-xl text-center">
              <p className="text-[9px] text-neutral-500 font-black uppercase tracking-widest">Activos</p>
              <p className="text-xs font-black text-white italic mt-1 uppercase">{solicitudesActivas.length}</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 mb-8">
          <div className="bg-neutral-950 p-4 rounded-2xl border border-neutral-800">
            <p className="text-[8px] text-neutral-500 font-black uppercase tracking-widest mb-1">Ganado Hoy</p>
            <p className="text-lg font-black text-green-500 italic">S/ 245.00</p>
          </div>
          <div className="bg-neutral-950 p-4 rounded-2xl border border-neutral-800">
            <p className="text-[8px] text-neutral-500 font-black uppercase tracking-widest mb-1">Completados</p>
            <p className="text-lg font-black text-white italic">12</p>
          </div>
        </div>

        {/* Radar List (Desktop) */}
        <RadarContent 
          radarActivo={radarActivo} 
          solicitudes={solicitudes} 
          montoOfertaRapida={montoOfertaRapida}
          setMontoOfertaRapida={setMontoOfertaRapida}
          enviarOfertaRapida={enviarOfertaRapida}
          handleAction={handleAction}
          getDistance={getDistance}
          getTime={getTime}
        />
      </div>

      {/* Main Map Content */}
      <div className="flex-1 relative h-full">
        <Mapa 
          markers={[
            ...solicitudes.map(s => ({
              id: s.id,
              position: [s.latitud, s.longitud] as [number, number],
              type: (s.descripcion.includes('CAMION') ? 'truck' : 'car') as any,
              label: `EMERGENCIA: ${s.tipo_servicio.toUpperCase()}`
            })),
            ...solicitudesActivas.map(s => ({
              id: s.id,
              position: [s.latitud, s.longitud] as [number, number],
              type: (s.descripcion.includes('CAMION') ? 'truck' : 'car') as any,
              label: `ACTIVO: ${s.usuarios?.nombre}`
            }))
          ]}
        />

        {/* Mobile Bottom Sheet */}
        <div className="md:hidden absolute inset-x-0 bottom-0 z-[2000] p-4 pointer-events-none">
          <div className="max-w-md mx-auto pointer-events-auto">
            <div className="bg-neutral-900 rounded-t-[40px] border-x border-t border-neutral-800 shadow-[0_-20px_50px_rgba(0,0,0,0.5)] p-6 max-h-[60vh] overflow-y-auto">
              <div className="w-12 h-1.5 bg-neutral-800 rounded-full mx-auto mb-6"></div>
              
              {/* Stats Mini Grid */}
              <div className="flex gap-3 mb-8 overflow-x-auto pb-2 scrollbar-hide">
                <div className="bg-neutral-950 p-4 rounded-2xl border border-neutral-800 min-w-[140px]">
                  <p className="text-[7px] text-neutral-500 font-black uppercase mb-1">Ganado Hoy</p>
                  <p className="text-sm font-black text-green-500 italic">S/ 245.00</p>
                </div>
                <div className="bg-neutral-950 p-4 rounded-2xl border border-neutral-800 min-w-[140px]">
                  <p className="text-[7px] text-neutral-500 font-black uppercase mb-1">Completados</p>
                  <p className="text-sm font-black text-white italic">12</p>
                </div>
              </div>

              <RadarContent 
                radarActivo={radarActivo} 
                solicitudes={solicitudes} 
                montoOfertaRapida={montoOfertaRapida}
                setMontoOfertaRapida={setMontoOfertaRapida}
                enviarOfertaRapida={enviarOfertaRapida}
                handleAction={handleAction}
                getDistance={getDistance}
                getTime={getTime}
              />
            </div>
          </div>
        </div>
      </div>
      
      {/* Modals & Overlays */}
      {chatSolicitudId && user && (
        <div className="fixed bottom-6 right-6 w-full max-w-[350px] h-[500px] z-[4000] px-4">
          <ChatBox 
            solicitudId={chatSolicitudId} 
            currentUserId={user.id} 
            tipoUsuario="proveedor"
            onClose={() => setChatSolicitudId(null)} 
          />
        </div>
      )}

      {/* Nueva Solicitud Alert Modal */}
      {nuevaSolicitudAlerta && (
        <div className="fixed inset-0 z-[5000] flex items-center justify-center p-6 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-neutral-900 border-2 border-yellow-500 w-full max-w-sm rounded-3xl p-8 shadow-[0_0_50px_rgba(234,179,8,0.2)] text-center space-y-6 animate-in zoom-in-95">
            <div className="w-20 h-20 bg-yellow-500 rounded-full flex items-center justify-center mx-auto animate-bounce">
              <AlertCircle className="w-10 h-10 text-black" />
            </div>
            <div>
              <h2 className="text-2xl font-black italic uppercase text-yellow-500">¡NUEVA SOLICITUD!</h2>
              <p className="text-xs font-bold text-neutral-400 mt-2 uppercase tracking-widest">Alguien necesita tu ayuda ahora</p>
            </div>
            <div className="bg-neutral-950 p-4 rounded-2xl border border-neutral-800">
              <p className="text-sm font-black italic uppercase text-white">{nuevaSolicitudAlerta.tipo_servicio}</p>
              <p className="text-[10px] text-neutral-500 mt-1 line-clamp-2">{nuevaSolicitudAlerta.descripcion}</p>
            </div>
            <div className="flex flex-col gap-3">
              <button 
                onClick={() => {
                  handleAction(nuevaSolicitudAlerta.id, 'aceptada');
                  setNuevaSolicitudAlerta(null);
                }}
                className="w-full bg-yellow-500 hover:bg-yellow-600 text-black py-4 rounded-2xl font-black uppercase italic transition-all"
              >
                Aceptar Auxilio
              </button>
              <button 
                onClick={() => setNuevaSolicitudAlerta(null)}
                className="w-full bg-neutral-800 text-white py-4 rounded-2xl font-black uppercase italic text-xs"
              >
                Ignorar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
