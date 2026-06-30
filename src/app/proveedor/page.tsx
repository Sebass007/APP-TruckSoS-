'use client';

import React, { useState, useEffect, useRef } from 'react';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/navigation';
import { Truck, MapPin, Check, MessageSquare, AlertCircle, Phone, Clock, LogOut, Navigation, Star, ShieldCheck, CheckCircle2, UserCheck, X, Wallet, FileText, Calendar } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import ChatBox from '@/components/ChatBox';
import { DashboardSkeleton } from '@/components/Skeleton';

const Mapa = dynamic(() => import('@/components/Mapa'), { 
  ssr: false,
  loading: () => <div className="h-full w-full bg-neutral-900 animate-pulse" />
});

// Haversine formula to calculate exact distance in kilometers
function getHaversineDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth's radius in kilometers
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) *
      Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

// Componente interno para el contenido del radar
const RadarContent = ({ 
  radarActivo, 
  solicitudes, 
  solicitudesActivas,
  montoOfertaRapida, 
  setMontoOfertaRapida, 
  enviarOfertaRapida, 
  handleAction,
  getRealDistance,
  getRealTime,
  setChatSolicitudId,
  acceptedDirectIds
}: any) => (
  <>
    {/* Sección de Trabajos Activos en Curso */}
    {solicitudesActivas && solicitudesActivas.length > 0 && (
      <div className="mb-8 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-[10px] font-black text-green-400 uppercase tracking-[0.3em] italic flex items-center gap-1.5">
            <span className="w-2 h-2 bg-green-500 rounded-full animate-ping"></span> Auxilio en Curso ({solicitudesActivas.length})
          </h3>
        </div>

        {solicitudesActivas.map((sol: any) => (
          <div key={sol.id} className="bg-gradient-to-br from-green-950/40 to-neutral-950 p-5 rounded-3xl border-2 border-green-500/50 shadow-2xl space-y-4 animate-in zoom-in-95">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[9px] font-black uppercase tracking-wider text-green-400 bg-green-500/10 px-2 py-0.5 rounded-md border border-green-500/20">
                  {sol.tipo_servicio}
                </span>
                <h4 className="font-black italic text-sm uppercase text-white mt-1">
                  {sol.usuarios?.nombre || 'Cliente Auxiliado'}
                </h4>
              </div>
              <span className="text-sm font-black text-green-400 italic">S/ {sol.monto_pactado || 'Acordado'}</span>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-2 border-t border-neutral-900">
              <button 
                onClick={() => setChatSolicitudId(sol.id)}
                className="bg-neutral-800 hover:bg-neutral-750 text-white py-3 rounded-xl font-black text-[10px] transition-all flex items-center justify-center gap-1.5 uppercase italic border border-neutral-700"
              >
                <MessageSquare className="w-4 h-4 text-orange-500" /> Negociar / Chat
              </button>
              <button 
                onClick={() => handleAction(sol.id, 'completada')}
                className="bg-green-600 hover:bg-green-500 text-white py-3 rounded-xl font-black text-[10px] transition-all flex items-center justify-center gap-1.5 uppercase italic shadow-lg shadow-green-600/20"
              >
                <CheckCircle2 className="w-4 h-4" /> TRABAJO TERMINADO ✔️
              </button>
            </div>
          </div>
        ))}
      </div>
    )}

    <div className="flex items-center justify-between mb-6">
      <h3 className="text-[10px] font-black text-neutral-500 uppercase tracking-[0.3em] italic">Radar de Emergencias</h3>
      {radarActivo && (
        <div className="flex items-center gap-2">
          <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-ping"></div>
          <span className="text-[8px] font-black text-green-500 uppercase italic">Escaneando GPS...</span>
        </div>
      )}
    </div>

    <div className="relative flex-1">
      {!radarActivo && (
        <div className="absolute inset-0 z-10 bg-neutral-900/90 backdrop-blur-[2px] rounded-3xl flex flex-col items-center justify-center p-8 text-center border border-neutral-800">
          <div className="w-16 h-16 bg-neutral-800 rounded-full flex items-center justify-center mb-4 border border-neutral-700">
            <AlertCircle className="w-8 h-8 text-neutral-500" />
          </div>
          <h4 className="text-sm font-black italic uppercase text-neutral-300">Estás Desconectado</h4>
          <p className="text-[10px] text-neutral-500 font-bold uppercase mt-2 leading-relaxed">Ponte en línea para ver las emergencias cerca de ti</p>
        </div>
      )}

      <div className={`space-y-4 transition-all duration-500 ${!radarActivo ? 'opacity-20 pointer-events-none' : 'opacity-100'}`}>
        {solicitudes.length === 0 ? (
          <div className="text-center py-10 bg-neutral-950/40 rounded-3xl border border-neutral-900">
            <div className="relative w-16 h-16 mx-auto mb-6">
              <div className="absolute inset-0 bg-yellow-500/20 rounded-full animate-ping"></div>
              <div className="absolute inset-0 border-2 border-yellow-500/30 rounded-full"></div>
              <Clock className="absolute inset-0 m-auto w-6 h-6 text-yellow-500 animate-pulse" />
            </div>
            <p className="text-[10px] font-black uppercase italic text-neutral-400 tracking-widest">Buscando solicitudes en tu zona...</p>
          </div>
        ) : solicitudes.map((sol: any) => {
          const isCamion = sol.descripcion?.toUpperCase().includes('CAMION');
          const isAuto = sol.descripcion?.toUpperCase().includes('AUTO');
          const isMoto = sol.descripcion?.toUpperCase().includes('MOTO');
          const isMinivan = sol.descripcion?.toUpperCase().includes('MINIVAN');
          
          const vehiculoIcon = isCamion ? '🚛' : isMoto ? '🏍️' : isMinivan ? '🚐' : '🚗';
          const vehiculoLabel = isCamion ? 'CAMIÓN' : isMoto ? 'MOTO' : isMinivan ? 'MINIVAN' : 'AUTO / SUV';

          const isAccepted = acceptedDirectIds?.includes(sol.id);

          return (
            <div key={sol.id} className="group bg-neutral-950 p-5 rounded-3xl border border-neutral-800 hover:border-yellow-500/50 transition-all duration-500 shadow-xl">
              
              {/* Header Card */}
              <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <div className="w-11 h-11 sm:w-12 sm:h-12 bg-neutral-900 rounded-2xl flex items-center justify-center text-xl sm:text-2xl border border-neutral-800 shrink-0">
                    {vehiculoIcon}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <span className="text-[9px] font-black uppercase tracking-wider text-yellow-500 bg-yellow-500/10 px-2 py-0.5 rounded-md border border-yellow-500/20 shrink-0">
                        {vehiculoLabel}
                      </span>
                      <span className="text-[9px] font-black uppercase tracking-wider text-orange-400 bg-orange-500/10 px-2 py-0.5 rounded-md border border-orange-500/20 shrink-0">
                        {sol.tipo_servicio}
                      </span>
                    </div>
                    <p className="font-black italic text-xs sm:text-sm uppercase text-white mt-1 group-hover:text-yellow-500 transition-colors truncate">
                      {sol.usuarios?.nombre || 'Cliente SOS'}
                    </p>
                  </div>
                </div>

                <div className="flex flex-col items-end shrink-0 ml-auto">
                  <div className="flex items-center gap-1 text-green-400 text-[10px] sm:text-[11px] font-black italic bg-green-500/10 px-2 py-1 rounded-lg border border-green-500/20 shrink-0">
                    <MapPin className="w-3 h-3 sm:w-3.5 sm:h-3.5" /> {getRealDistance(sol)}
                  </div>
                  <span className="text-neutral-500 text-[8px] font-extrabold uppercase tracking-widest mt-0.5 whitespace-nowrap">
                    ~{getRealTime(sol)} de llegada
                  </span>
                </div>
              </div>

              {/* Description Box */}
              <div className="bg-neutral-900 p-3.5 rounded-2xl border border-neutral-800/80 mb-4">
                <p className="text-xs text-neutral-200 italic font-semibold leading-relaxed">"{sol.descripcion}"</p>
              </div>
              
              {/* Quick Offer Row */}
              <div className="flex gap-2 mb-3">
                <div className="relative flex-1">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-yellow-500 font-black text-xs">S/</span>
                  <input 
                    type="number"
                    placeholder="Monto cotizado..."
                    value={montoOfertaRapida[sol.id] || ''}
                    onChange={(e) => setMontoOfertaRapida({...montoOfertaRapida, [sol.id]: e.target.value})}
                    className="w-full bg-neutral-900 border border-neutral-700 rounded-xl pl-8 pr-3 py-3 text-xs font-black text-yellow-500 focus:outline-none focus:border-yellow-500 transition-all"
                  />
                </div>
                <button 
                  onClick={() => enviarOfertaRapida(sol.id)}
                  className="bg-yellow-500 hover:bg-yellow-400 text-black px-5 py-3 rounded-xl font-black text-[10px] uppercase italic whitespace-nowrap transition-all shadow-lg shadow-yellow-500/10"
                >
                  Enviar Oferta
                </button>
              </div>

              {/* Action Grid */}
              <div className="grid grid-cols-2 gap-2 pt-3 border-t border-neutral-900">
                <button 
                  onClick={() => setChatSolicitudId(sol.id)}
                  className="bg-neutral-850 hover:bg-neutral-800 text-yellow-500 py-3 rounded-xl font-black text-[10px] transition-all flex items-center justify-center gap-1.5 uppercase italic border border-neutral-750"
                >
                  <MessageSquare className="w-4 h-4 text-yellow-500" /> Negociar / Chat
                </button>

                {isAccepted ? (
                  <span className="bg-green-500 text-black py-3 rounded-xl font-black text-[10px] transition-all flex items-center justify-center gap-1.5 uppercase italic shadow-lg shadow-green-500/20 animate-in zoom-in">
                    <CheckCircle2 className="w-4 h-4 text-black" /> Aceptado
                  </span>
                ) : (
                  <button 
                    onClick={() => handleAction(sol.id, 'aceptada')}
                    className="bg-green-600 hover:bg-green-500 text-white py-3 rounded-xl font-black text-[10px] transition-all flex items-center justify-center gap-1.5 uppercase italic shadow-lg shadow-green-600/20"
                  >
                    <Check className="w-4 h-4" /> Aceptar Directo
                  </button>
                )}
              </div>

            </div>
          );
        })}
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
  const [acceptedDirectIds, setAcceptedDirectIds] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [chatSolicitudId, setChatSolicitudId] = useState<string | null>(null);
  const [radarActivo, setRadarActivo] = useState(true);
  const [nuevaSolicitudAlerta, setNuevaSolicitudAlerta] = useState<any>(null);
  const [realtimeStatus, setRealtimeStatus] = useState<'connecting' | 'connected' | 'error'>('connecting');
  const [montoOfertaRapida, setMontoOfertaRapida] = useState<{[key: string]: string}>({});
  const [provUbicacion, setProvUbicacion] = useState({ lat: -16.409, lng: -71.537 });
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [historialCompletado, setHistorialCompletado] = useState<any[]>([]);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const getProveedorGps = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setProvUbicacion({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        },
        null,
        { enableHighAccuracy: true }
      );
    }
  };

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

    if (provData) {
      if (provData.nombre_negocio && /VIP/gi.test(provData.nombre_negocio)) {
        const cleanName = provData.nombre_negocio.replace(/VIP/gi, '').trim() || 'Taller Mecánico';
        await supabase.from('proveedores').update({ nombre_negocio: cleanName }).eq('id', provData.id);
        provData.nombre_negocio = cleanName;
      }
      setProfile(provData);
    }
    setLoading(false);
    fetchHistorialCompletado();
  };

  const fetchHistorialCompletado = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data } = await supabase
        .from('solicitudes')
        .select('*, usuarios(nombre, telefono)')
        .eq('proveedor_id', user.id)
        .eq('estado', 'completada')
        .order('created_at', { ascending: false });

      if (data) {
        setHistorialCompletado(data);
      }
    } catch (e) {
      console.error("Error cargando historial de proveedor:", e);
    }
  };

  const fetchSolicitudes = async () => {
    const { data } = await supabase
      .from('solicitudes')
      .select('*, usuarios(nombre, telefono)')
      .eq('estado', 'pendiente')
      .order('created_at', { ascending: false });

    if (data) setSolicitudes(data);
  };

  const fetchSolicitudesActivas = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data } = await supabase
      .from('solicitudes')
      .select('*, usuarios(nombre, telefono)')
      .eq('proveedor_id', user.id)
      .in('estado', ['aceptada', 'en_camino', 'en_sitio'])
      .order('created_at', { ascending: false });

    if (data) setSolicitudesActivas(data);
  };

  useEffect(() => {
    checkUser();
    getProveedorGps();
    fetchSolicitudes();
    fetchSolicitudesActivas();
    fetchHistorialCompletado();

    audioRef.current = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3');

    const channel = supabase
      .channel('radar-proveedor-accept-direct')
      .on('postgres_changes', { 
        event: 'INSERT', 
        schema: 'public', 
        table: 'solicitudes',
        filter: 'estado=eq.pendiente'
      }, (payload) => {
        if (!radarActivo) return;
        setSolicitudes(prev => [payload.new, ...prev]);
        setNuevaSolicitudAlerta(payload.new);
        if (audioRef.current) {
          audioRef.current.play().catch(e => console.log('Audio play blocked', e));
        }
      })
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'solicitudes'
      }, () => {
        fetchSolicitudes();
        fetchSolicitudesActivas();
        fetchHistorialCompletado();
      })
      .subscribe((status) => {
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
        setAcceptedDirectIds(prev => [...prev, solicitudId]);
      }

      const { error } = await supabase
        .from('solicitudes')
        .update(updateData)
        .eq('id', solicitudId);

      if (error) throw error;
      
      if (nuevoEstado === 'aceptada') setChatSolicitudId(solicitudId);

      if (nuevoEstado === 'completada') {
        alert("¡Trabajo marcado como terminado! Se ha enviado la solicitud de calificación al cliente.");
      }
      
      fetchSolicitudes();
      fetchSolicitudesActivas();
      fetchHistorialCompletado();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const enviarOfertaRapida = async (solicitudId: string) => {
    const monto = montoOfertaRapida[solicitudId];
    if (!monto || parseFloat(monto) <= 0) {
      alert("Por favor ingresa un monto válido");
      return;
    }

    try {
      const { error: msgError } = await supabase
        .from('mensajes')
        .insert({
          solicitud_id: solicitudId,
          emisor_id: user.id,
          contenido: `OFERTA DE AUXILIO: S/ ${parseFloat(monto).toFixed(2)}`,
          es_oferta: true,
          monto_oferta: parseFloat(monto)
        });

      if (msgError) throw msgError;

      alert("¡Oferta enviada correctamente! El cliente la verá en su pantalla.");
      setMontoOfertaRapida({...montoOfertaRapida, [solicitudId]: ''});
      setChatSolicitudId(solicitudId);
    } catch (err: any) {
      setError(err.message || "Error al enviar oferta");
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

  // Real GPS Distance & Time
  const getRealDistance = (sol: any) => {
    if (!sol.latitud || !sol.longitud) return '1.5 km';
    const dist = getHaversineDistance(provUbicacion.lat, provUbicacion.lng, sol.latitud, sol.longitud);
    return `${dist.toFixed(1)} km`;
  };

  const getRealTime = (sol: any) => {
    if (!sol.latitud || !sol.longitud) return '5 min';
    const dist = getHaversineDistance(provUbicacion.lat, provUbicacion.lng, sol.latitud, sol.longitud);
    const mins = Math.max(3, Math.round(dist * 3.5));
    return `${mins} min`;
  };

  if (loading) return <DashboardSkeleton />;

  return (
    <div className="h-screen w-full bg-[#0a0a0a] text-white flex flex-col md:flex-row relative overflow-hidden">
      
      {/* Top Status Bar (Mobile Only) */}
      <div className="md:hidden bg-neutral-900/90 backdrop-blur-md border-b border-neutral-800 p-4 flex items-center justify-between absolute top-0 inset-x-0 z-[3000]">
        <div 
          onClick={() => {
            fetchHistorialCompletado();
            setShowProfileModal(true);
          }}
          className="flex items-center gap-2.5 cursor-pointer active:opacity-70"
          title="Ver Perfil y Ganancias"
        >
          <div className="w-8 h-8 bg-yellow-500 rounded-xl flex items-center justify-center border border-yellow-400 text-black text-xs font-black italic uppercase shrink-0">
            {profile?.nombre_negocio?.substring(0, 2) || 'TS'}
          </div>
          <span className="font-black italic uppercase text-[10px] sm:text-xs tracking-wider text-white truncate max-w-[120px]">
            {profile?.nombre_negocio || 'TALLER SOS'}
          </span>
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
      <div className="hidden md:flex w-[420px] bg-neutral-900 border-r border-neutral-800 p-6 flex-col overflow-y-auto max-h-screen custom-scrollbar">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-2">
            <Truck className="w-8 h-8 text-yellow-500" />
            <span className="text-xl font-black italic uppercase text-white tracking-wider">PROVEEDOR<span className="text-yellow-500">SOS</span></span>
          </div>
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${realtimeStatus === 'connected' ? 'bg-green-500' : 'bg-yellow-500 animate-pulse'}`}></div>
            <button onClick={handleLogout} className="p-2 text-neutral-400 hover:text-white transition-colors" title="Cerrar Sesión">
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Online Toggle */}
        <div className="mb-8">
          <button 
            onClick={() => setRadarActivo(!radarActivo)}
            className={`w-full p-5 rounded-3xl font-black italic uppercase text-xs flex items-center justify-between transition-all duration-500 border-2 ${
              radarActivo 
                ? 'bg-green-600/10 border-green-600 text-green-400 shadow-[0_0_30px_rgba(22,163,74,0.1)]' 
                : 'bg-neutral-950 border-neutral-800 text-neutral-500'
            }`}
          >
            <div className="flex items-center gap-3">
              <div className={`w-3.5 h-3.5 rounded-full ${radarActivo ? 'bg-green-500 animate-pulse' : 'bg-neutral-800'}`}></div>
              {radarActivo ? 'ESTOY EN LÍNEA (RECIBIENDO ALERTAS)' : 'ESTOY DESCONECTADO'}
            </div>
            <div className={`w-10 h-5 rounded-full relative transition-colors ${radarActivo ? 'bg-green-600' : 'bg-neutral-800'}`}>
              <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full transition-all ${radarActivo ? 'left-5.5' : 'left-0.5'}`}></div>
            </div>
          </button>
        </div>

        {/* Profile Card */}
        <div 
          onClick={() => {
            fetchHistorialCompletado();
            setShowProfileModal(true);
          }}
          className="bg-neutral-950 p-5 rounded-3xl border border-neutral-800 hover:border-yellow-500/50 hover:bg-neutral-900/40 transition-all cursor-pointer mb-6 group"
          title="Ver Perfil y Ganancias"
        >
          <div className="flex items-center gap-4 mb-4">
            <div className="w-14 h-14 bg-gradient-to-br from-yellow-500 to-amber-600 rounded-2xl flex items-center justify-center border border-yellow-400 text-black shadow-lg shrink-0">
              <span className="text-xl font-black italic uppercase">{profile?.nombre_negocio?.substring(0, 2) || 'TS'}</span>
            </div>
            <div className="overflow-hidden">
              <div className="flex items-center gap-1.5">
                <h2 className="text-base font-black italic uppercase text-white truncate">{profile?.nombre_negocio || 'Mi Taller SOS'}</h2>
                <ShieldCheck className="w-4 h-4 text-blue-400 shrink-0" />
              </div>
              <div className="flex items-center gap-1 text-yellow-400 mt-0.5">
                <Star className="w-3.5 h-3.5 fill-yellow-400" />
                <span className="text-xs font-black">{profile?.calificacion_promedio?.toFixed(1) || '5.0'}</span>
                <span className="text-[9px] text-neutral-500 font-bold ml-1 uppercase">• Proveedor Verificado</span>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div className="bg-neutral-900 p-3 rounded-2xl border border-neutral-850 text-center">
              <p className="text-[8px] text-neutral-500 font-black uppercase tracking-widest">Estatus</p>
              <p className="text-xs font-black text-green-400 italic mt-0.5 uppercase">Disponible</p>
            </div>
            <div className="bg-neutral-900 p-3 rounded-2xl border border-neutral-850 text-center">
              <p className="text-[8px] text-neutral-500 font-black uppercase tracking-widest">Activos</p>
              <p className="text-xs font-black text-white italic mt-0.5 uppercase">{solicitudesActivas.length}</p>
            </div>
          </div>
        </div>

        {/* Radar List */}
        <RadarContent 
          radarActivo={radarActivo} 
          solicitudes={solicitudes} 
          solicitudesActivas={solicitudesActivas}
          montoOfertaRapida={montoOfertaRapida}
          setMontoOfertaRapida={setMontoOfertaRapida}
          enviarOfertaRapida={enviarOfertaRapida}
          handleAction={handleAction}
          getRealDistance={getRealDistance}
          getRealTime={getRealTime}
          setChatSolicitudId={setChatSolicitudId}
          acceptedDirectIds={acceptedDirectIds}
        />
      </div>

      {/* Main Map Content */}
      <div className="flex-1 relative h-full">
        <Mapa 
          center={[provUbicacion.lat, provUbicacion.lng]}
          markers={[
            ...solicitudes.map(s => ({
              id: s.id,
              position: [s.latitud, s.longitud] as [number, number],
              type: (s.descripcion?.toUpperCase().includes('CAMION') ? 'truck' : 'car') as any,
              label: `EMERGENCIA SOS: ${s.tipo_servicio.toUpperCase()} (${getRealDistance(s)})`
            })),
            ...solicitudesActivas.map(s => ({
              id: s.id,
              position: [s.latitud, s.longitud] as [number, number],
              type: (s.descripcion?.toUpperCase().includes('CAMION') ? 'truck' : 'car') as any,
              label: `EN SERVICIO: ${s.usuarios?.nombre}`
            }))
          ]}
        />

        {/* Mobile Bottom Sheet */}
        <div className="md:hidden absolute inset-x-0 bottom-0 z-[2000] p-4 pointer-events-none">
          <div className="max-w-md mx-auto pointer-events-auto">
            <div className="bg-neutral-900 rounded-t-[35px] border-x border-t border-neutral-800 shadow-2xl p-6 max-h-[65vh] overflow-y-auto">
              <div className="w-12 h-1.5 bg-neutral-800 rounded-full mx-auto mb-6"></div>
              
              <RadarContent 
                radarActivo={radarActivo} 
                solicitudes={solicitudes} 
                solicitudesActivas={solicitudesActivas}
                montoOfertaRapida={montoOfertaRapida}
                setMontoOfertaRapida={setMontoOfertaRapida}
                enviarOfertaRapida={enviarOfertaRapida}
                handleAction={handleAction}
                getRealDistance={getRealDistance}
                getRealTime={getRealTime}
                setChatSolicitudId={setChatSolicitudId}
                acceptedDirectIds={acceptedDirectIds}
              />
            </div>
          </div>
        </div>
      </div>
      
      {/* Modals & Overlays */}
      {chatSolicitudId && user && (
        <div className="fixed inset-0 z-[5000] bg-black/60 backdrop-blur-sm flex items-end justify-center p-0 sm:p-6 animate-in fade-in pb-2 sm:pb-0">
          <div className="bg-neutral-900 w-[92%] sm:w-full max-w-md h-[85vh] sm:h-[600px] rounded-3xl shadow-2xl relative overflow-hidden flex flex-col border border-neutral-800">
            <ChatBox 
              solicitudId={chatSolicitudId} 
              currentUserId={user.id} 
              tipoUsuario="proveedor"
              onClose={() => setChatSolicitudId(null)} 
            />
          </div>
        </div>
      )}

      {/* Modal de Perfil & Ganancias del Proveedor */}
      {showProfileModal && (
        <div className="fixed inset-0 z-[6000] bg-black/85 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6 animate-in fade-in">
          <div className="bg-neutral-950 border border-neutral-800 w-full max-w-lg h-[80vh] rounded-[35px] shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95">
            {/* Header */}
            <div className="p-6 bg-neutral-900/90 border-b border-neutral-800 flex justify-between items-center shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-yellow-500 rounded-2xl flex items-center justify-center border border-yellow-400 text-black">
                  <Star className="w-5 h-5 fill-black text-black" />
                </div>
                <div>
                  <h3 className="text-sm font-black italic uppercase text-white tracking-wider">Perfil del Taller</h3>
                  <p className="text-[9px] text-neutral-500 font-bold uppercase">Datos y Resumen Financiero</p>
                </div>
              </div>
              <button 
                onClick={() => setShowProfileModal(false)} 
                className="p-2 text-neutral-400 hover:text-white bg-neutral-800 hover:bg-neutral-700 rounded-xl transition-all"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
              
              {/* Datos Personales */}
              <div className="bg-neutral-900 p-5 rounded-3xl border border-neutral-800 space-y-3.5">
                <h4 className="text-[10px] font-black text-yellow-500 uppercase tracking-widest italic flex items-center gap-2">
                  <UserCheck className="w-3.5 h-3.5" /> Datos del Taller
                </h4>
                <div className="grid grid-cols-2 gap-4 text-left">
                  <div>
                    <span className="text-[8px] text-neutral-500 font-bold uppercase block">Negocio / Taller</span>
                    <span className="text-xs font-extrabold text-white uppercase italic">{profile?.nombre_negocio || 'Taller SOS'}</span>
                  </div>
                  <div>
                    <span className="text-[8px] text-neutral-500 font-bold uppercase block">Correo Electrónico</span>
                    <span className="text-xs font-semibold text-neutral-300 break-all">{user?.email || 'proveedor@sos.com'}</span>
                  </div>
                  <div>
                    <span className="text-[8px] text-neutral-500 font-bold uppercase block">Celular / Teléfono</span>
                    <span className="text-xs font-extrabold text-white">{profile?.telefono || '999 999 999'}</span>
                  </div>
                  <div>
                    <span className="text-[8px] text-neutral-500 font-bold uppercase block">Ubicación GPS</span>
                    <span className="text-xs font-semibold text-neutral-300">Arequipa, Perú</span>
                  </div>
                </div>
              </div>

              {/* Caja de Ingresos Totales */}
              <div className="bg-gradient-to-br from-green-950/30 to-neutral-950 p-6 rounded-3xl border-2 border-green-500/40 text-center shadow-lg shadow-green-500/5">
                <div className="w-12 h-12 bg-green-500 rounded-2xl flex items-center justify-center mx-auto shadow-md shadow-green-500/20 mb-3">
                  <Wallet className="w-6 h-6 text-black" />
                </div>
                <p className="text-[9px] text-green-400 font-black uppercase tracking-wider">Ingresos Totales Acumulados</p>
                <h3 className="text-3xl font-black italic text-white mt-1">
                  S/ {historialCompletado.reduce((acc, s) => acc + parseFloat(s.monto_pactado || 0), 0).toFixed(2)}
                </h3>
                <p className="text-[8px] text-neutral-500 font-extrabold uppercase mt-1">
                  Basado en {historialCompletado.length} servicios terminados con éxito
                </p>
              </div>

              {/* Historial de Servicios Realizados */}
              <div className="space-y-3">
                <h4 className="text-[10px] font-black text-neutral-400 uppercase tracking-widest italic flex items-center gap-2">
                  <FileText className="w-3.5 h-3.5" /> Historial de Servicios Realizados
                </h4>

                {historialCompletado.length === 0 ? (
                  <div className="text-center py-8 bg-neutral-900/50 rounded-3xl border border-neutral-800/80 text-neutral-500">
                    <Clock className="w-8 h-8 mx-auto mb-2 opacity-30" />
                    <p className="text-[10px] font-black uppercase italic">Aún no registras servicios completados</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {historialCompletado.map((sol: any) => {
                      const isCamion = sol.descripcion?.toUpperCase().includes('CAMION');
                      const isMoto = sol.descripcion?.toUpperCase().includes('MOTO');
                      const isMinivan = sol.descripcion?.toUpperCase().includes('MINIVAN');
                      const vehiculoIcon = isCamion ? '🚛' : isMoto ? '🏍️' : isMinivan ? '🚐' : '🚗';
                      
                      return (
                        <div key={sol.id} className="bg-neutral-900 p-4.5 rounded-2xl border border-neutral-800 flex flex-col gap-3 text-left">
                          <div className="flex items-center justify-between">
                            <span className="text-[8px] font-black uppercase tracking-wider text-yellow-500 bg-yellow-500/10 px-2 py-0.5 rounded border border-yellow-500/20 shrink-0">
                              {vehiculoIcon} {isCamion ? 'CAMIÓN' : isMoto ? 'MOTO' : isMinivan ? 'MINIVAN' : 'AUTO / SUV'}
                            </span>
                            <span className="text-[9px] font-black uppercase tracking-wider text-green-400 bg-green-500/10 px-2.5 py-0.5 rounded border border-green-500/20 shrink-0">
                              S/ {parseFloat(sol.monto_pactado || 0).toFixed(2)}
                            </span>
                          </div>
                          
                          <div className="border-t border-neutral-800 pt-2.5 space-y-1.5">
                            <div>
                              <span className="text-[8px] text-neutral-500 font-bold uppercase block">Cliente Auxiliado</span>
                              <span className="text-xs font-extrabold text-white uppercase italic">{sol.usuarios?.nombre || 'Cliente SOS'}</span>
                            </div>
                            
                            <div>
                              <span className="text-[8px] text-neutral-500 font-bold uppercase block">Problema / Falla</span>
                              <span className="text-[11px] text-neutral-200 font-semibold italic bg-neutral-950 p-2 rounded-xl border border-neutral-850 block mt-0.5">
                                "{sol.descripcion}"
                              </span>
                            </div>
                            
                            <div className="flex items-center gap-1 text-[8px] text-neutral-500 font-bold uppercase pt-1">
                              <Calendar className="w-3 h-3" />
                              {sol.created_at ? new Date(sol.created_at).toLocaleDateString() + ' - ' + new Date(sol.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Fecha desconocida'}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

            </div>
          </div>
        </div>
      )}

      {/* Alert Modal */}
      {nuevaSolicitudAlerta && (
        <div className="fixed inset-0 z-[5000] flex items-center justify-center p-6 bg-black/85 backdrop-blur-sm animate-in fade-in">
          <div className="bg-neutral-900 border-2 border-yellow-500 w-full max-w-sm rounded-3xl p-6 shadow-2xl text-center space-y-5 animate-in zoom-in-95">
            <div className="w-16 h-16 bg-yellow-500 rounded-full flex items-center justify-center mx-auto animate-bounce">
              <AlertCircle className="w-9 h-9 text-black" />
            </div>
            <div>
              <h2 className="text-xl font-black italic uppercase text-yellow-500">¡NUEVA EMERGENCIA VIAL!</h2>
              <p className="text-[10px] font-bold text-neutral-400 mt-1 uppercase tracking-widest">Un conductor solicita auxilio cercano</p>
            </div>
            <div className="bg-neutral-950 p-4 rounded-2xl border border-neutral-800 text-left">
              <span className="text-[9px] font-black uppercase text-yellow-500 bg-yellow-500/10 px-2 py-0.5 rounded border border-yellow-500/20">
                {nuevaSolicitudAlerta.tipo_servicio}
              </span>
              <p className="text-xs font-semibold italic text-neutral-200 mt-2">"{nuevaSolicitudAlerta.descripcion}"</p>
            </div>
            <div className="flex flex-col gap-2">
              <button 
                onClick={() => {
                  setChatSolicitudId(nuevaSolicitudAlerta.id);
                  setNuevaSolicitudAlerta(null);
                }}
                className="w-full bg-yellow-500 hover:bg-yellow-400 text-black py-3.5 rounded-xl font-black uppercase italic text-xs transition-all shadow-lg"
              >
                Abrir Chat y Negociar
              </button>
              <button 
                onClick={() => setNuevaSolicitudAlerta(null)}
                className="w-full bg-neutral-800 text-neutral-400 py-3 rounded-xl font-black uppercase italic text-[10px]"
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
