'use client';

import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/navigation';
import { Truck, MapPin, Send, Disc, Zap, Activity, Battery, Wrench, HelpCircle, Clock, LogOut, AlertCircle, MessageSquare, Check, X, Menu, ChevronUp, Star, Navigation, CheckCircle2, Sparkles } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import ChatBox from '@/components/ChatBox';
import AsistenteIA from '@/components/AsistenteIA';

import { DashboardSkeleton } from '@/components/Skeleton';

const Mapa = dynamic(() => import('@/components/Mapa'), { 
  ssr: false,
  loading: () => <div className="h-full w-full bg-neutral-900 animate-pulse" />
});

const SERVICIOS = [
  { id: 'llantas', label: 'Llantas', icon: <Disc /> },
  { id: 'electrico', label: 'Eléctrico', icon: <Zap /> },
  { id: 'grua', label: 'Grúa', icon: <Activity /> },
  { id: 'bateria', label: 'Batería', icon: <Battery /> },
  { id: 'mecanico', label: 'Mecánico', icon: <Wrench /> },
  { id: 'otro', label: 'Otro', icon: <HelpCircle /> },
];

const VEHICULOS = [
  { id: 'camion', label: 'Camión 🚛' },
  { id: 'auto', label: 'Auto 🚗' },
  { id: 'minivan', label: 'Minivan 🚐' },
  { id: 'moto', label: 'Moto 🏍️' },
];

export default function ClienteDashboard() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // UI State
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [bottomSheetStep, setBottomSheetStep] = useState<'selection' | 'form' | 'status'>('selection');
  const [aiOpen, setAiOpen] = useState(false);

  // Form State
  const [tipoVehiculo, setTipoVehiculo] = useState('camion');
  const [selectedService, setSelectedService] = useState('llantas');
  const [descripcion, setDescripcion] = useState('');
  const [ubicacion, setUbicacion] = useState({ lat: -16.409, lng: -71.537, address: 'Buscando dirección...' });
  const [solicitudes, setSolicitudes] = useState<any[]>([]);
  const [chatSolicitudId, setChatSolicitudId] = useState<string | null>(null);
  const [showVoucher, setShowVoucher] = useState<any>(null);
  const [realtimeStatus, setRealtimeStatus] = useState<'connecting' | 'connected' | 'error'>('connecting');
  const [offers, setOffers] = useState<any[]>([]);

  const fetchOffers = async (solicitudId: string) => {
    const { data } = await supabase
      .from('mensajes')
      .select('*, proveedores:emisor_id(nombre_negocio, calificacion_promedio)')
      .eq('solicitud_id', solicitudId)
      .eq('es_oferta', true)
      .order('created_at', { ascending: false });
    
    if (data) setOffers(data);
  };

  const checkUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      router.push('/login');
      return;
    }
    setUser(user);
    setLoading(false);
  };

  const getUbicacionActual = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUbicacion(prev => ({
            ...prev,
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          }));
        },
        null,
        { enableHighAccuracy: true }
      );
    }
  };

  const fetchSolicitudes = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data } = await supabase
      .from('solicitudes')
      .select('*, proveedores(nombre_negocio)')
      .eq('cliente_id', user.id)
      .order('created_at', { ascending: false });

    if (data) {
      setSolicitudes(data);
      const active = data.find(s => ['pendiente', 'aceptada', 'en_camino', 'en_sitio'].includes(s.estado));
      if (active) setBottomSheetStep('status');
    }
  };

  const aceptarOferta = async (oferta: any) => {
    try {
      const { error } = await supabase
        .from('solicitudes')
        .update({ 
          proveedor_id: oferta.emisor_id, 
          monto_pactado: oferta.monto_oferta,
          estado: 'aceptada' 
        })
        .eq('id', oferta.solicitud_id);

      if (error) throw error;
      
      alert("Oferta aceptada. El mecánico ha sido notificado.");
      fetchSolicitudes();
    } catch (err: any) {
      setError(err.message);
    }
  };

  useEffect(() => {
    checkUser();
    getUbicacionActual();
    fetchSolicitudes();

    const channel = supabase
      .channel('schema-db-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'solicitudes' },
        (payload: any) => {
          console.log("Cambio en solicitudes detectado:", payload);
          if (payload.new && payload.new.estado === 'completada') {
            setShowVoucher(payload.new);
          }
          fetchSolicitudes();
        }
      )
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'mensajes' },
        (payload: any) => {
          if (payload.new.es_oferta) {
            console.log("Nueva oferta recibida:", payload.new);
            fetchOffers(payload.new.solicitud_id);
          }
        }
      )
      .subscribe((status) => {
        console.log("Status de Realtime Cliente:", status);
        if (status === 'SUBSCRIBED') setRealtimeStatus('connected');
        if (status === 'CHANNEL_ERROR') setRealtimeStatus('error');
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const handleSubmit = async () => {
    setSubmitting(true);
    setError(null);

    try {
      const { error: submitError } = await supabase
        .from('solicitudes')
        .insert({
          cliente_id: user.id,
          tipo_servicio: selectedService,
          descripcion: `${tipoVehiculo.toUpperCase()}: ${descripcion}`,
          latitud: ubicacion.lat,
          longitud: ubicacion.lng,
          estado: 'pendiente'
        });

      if (submitError) throw submitError;
      
      setDescripcion('');
      setBottomSheetStep('status');
      fetchSolicitudes();
    } catch (err: any) {
      setError(err.message || 'Error al enviar la solicitud');
    } finally {
      setSubmitting(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

  const aplicarRecomendacionIA = (categoria: string, texto: string) => {
    setSelectedService(categoria);
    setDescripcion(texto);
    setAiOpen(false);
    setBottomSheetStep('form');
  };

  if (loading) return <DashboardSkeleton />;

  const activeSolicitud = solicitudes.find(s => ['pendiente', 'aceptada', 'en_camino', 'en_sitio'].includes(s.estado));

  return (
    <div className="h-screen w-full bg-neutral-950 overflow-hidden relative flex">
      
      {/* Sidebar Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/60 z-[3000] backdrop-blur-sm"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 w-80 bg-neutral-900 z-[3100] transform transition-transform duration-300 ease-in-out p-6 flex flex-col ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex items-center justify-between mb-10">
          <div className="flex items-center gap-2">
            <Truck className="w-8 h-8 text-orange-500" />
            <span className="text-xl font-black italic uppercase">TRUCK<span className="text-orange-500">SOS</span></span>
          </div>
          <button onClick={() => setSidebarOpen(false)}>
            <X className="w-6 h-6 text-neutral-500" />
          </button>
        </div>

        <div className="flex-1 space-y-2">
          <button className="w-full flex items-center gap-4 p-4 rounded-xl hover:bg-neutral-800 text-neutral-300 font-black italic uppercase text-xs">
            <Clock className="w-5 h-5" /> Historial de Viajes
          </button>
          <button className="w-full flex items-center gap-4 p-4 rounded-xl hover:bg-neutral-800 text-neutral-300 font-black italic uppercase text-xs">
            <Activity className="w-5 h-5" /> Configuración
          </button>
        </div>

        <button 
          onClick={handleLogout}
          className="flex items-center gap-4 p-4 text-red-500 font-black italic uppercase text-xs border-t border-neutral-800"
        >
          <LogOut className="w-5 h-5" /> Cerrar Sesión
        </button>
      </div>

      {/* Main Map Container */}
      <div className="flex-1 relative">
        {/* Floating Menu Button */}
        <button 
          onClick={() => setSidebarOpen(true)}
          className="absolute top-6 left-6 z-[2000] p-4 bg-neutral-900 border border-neutral-800 rounded-2xl shadow-2xl text-white"
        >
          <Menu className="w-6 h-6" />
        </button>

        {/* Floating AI Assistant Button */}
        <button 
          onClick={() => setAiOpen(true)}
          className="absolute top-6 right-6 z-[2000] p-4 bg-gradient-to-r from-orange-600 to-amber-600 border border-orange-500/20 rounded-2xl shadow-2xl text-white flex items-center gap-2 hover:scale-105 hover:shadow-orange-600/30 transition-all font-black text-xs italic uppercase tracking-wider"
        >
          <Sparkles className="w-4 h-4 text-white animate-pulse" />
          <span>Asistente IA</span>
        </button>

        <Mapa 
          center={[ubicacion.lat, ubicacion.lng]}
          isSelectionMode={!activeSolicitud}
          onLocationSelect={(lat, lng) => {
            setUbicacion(prev => ({ ...prev, lat, lng }));
          }}
          markers={activeSolicitud ? [
            { id: 'me', position: [activeSolicitud.latitud, activeSolicitud.longitud], type: 'car', label: 'MI UBICACIÓN' }
          ] : []}
        />

        {/* Bottom Sheet UI */}
        <div className="absolute inset-x-0 bottom-0 z-[2000] p-4 md:p-10 pointer-events-none">
          <div className="max-w-md mx-auto pointer-events-auto">
            
            {/* Step 1: Selection Map Info */}
            {bottomSheetStep === 'selection' && !activeSolicitud && (
              <div className="bg-neutral-900 rounded-3xl p-6 shadow-2xl border border-neutral-800 animate-in slide-in-from-bottom">
                <div className="flex items-center gap-4 mb-6">
                  <div className="p-3 bg-orange-600 rounded-xl">
                    <MapPin className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className="text-[10px] font-black uppercase text-orange-500 italic">Punto de Auxilio</p>
                    <p className="text-xs font-black uppercase italic text-white truncate">
                      Lat: {ubicacion.lat.toFixed(4)} | Lng: {ubicacion.lng.toFixed(4)}
                    </p>
                  </div>
                </div>
                <button 
                  onClick={() => setBottomSheetStep('form')}
                  className="w-full bg-orange-600 hover:bg-orange-700 text-white py-5 rounded-2xl font-black text-lg uppercase italic shadow-xl shadow-orange-600/20 transition-all"
                >
                  Confirmar Ubicación
                </button>
              </div>
            )}

            {/* Step 2: Form */}
            {bottomSheetStep === 'form' && !activeSolicitud && (
              <div className="bg-neutral-900 rounded-3xl p-6 shadow-2xl border border-neutral-800 max-h-[70vh] overflow-y-auto animate-in slide-in-from-bottom">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="font-black italic uppercase text-white">Detalles del Auxilio</h3>
                  <button onClick={() => setBottomSheetStep('selection')}>
                    <X className="w-6 h-6 text-neutral-500" />
                  </button>
                </div>

                <div className="space-y-6">
                  <div>
                    <label className="block text-[10px] font-black text-neutral-500 uppercase italic mb-3">Vehículo</label>
                    <div className="grid grid-cols-2 gap-2">
                      {VEHICULOS.map(v => (
                        <button
                          key={v.id}
                          onClick={() => setTipoVehiculo(v.id)}
                          className={`p-3 rounded-xl border-2 font-black italic text-[10px] uppercase transition-all ${
                            tipoVehiculo === v.id ? 'border-orange-500 bg-orange-500/10 text-white' : 'border-neutral-800 bg-neutral-950 text-neutral-500'
                          }`}
                        >
                          {v.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-black text-neutral-500 uppercase italic mb-3">¿Qué necesitas?</label>
                    <div className="grid grid-cols-3 gap-2">
                      {SERVICIOS.map(s => (
                        <button
                          key={s.id}
                          onClick={() => setSelectedService(s.id)}
                          className={`flex flex-col items-center p-3 rounded-xl border transition-all ${
                            selectedService === s.id ? 'bg-orange-600 border-orange-400' : 'bg-neutral-950 border-neutral-800 text-neutral-500'
                          }`}
                        >
                          {s.icon}
                          <span className="text-[8px] font-black uppercase italic mt-1">{s.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="block text-[10px] font-black text-neutral-500 uppercase italic">Problema</label>
                      <button 
                        type="button"
                        onClick={() => setAiOpen(true)}
                        className="text-[9px] bg-orange-600/10 text-orange-400 border border-orange-500/20 px-2.5 py-1 rounded-lg font-black uppercase italic tracking-wider flex items-center gap-1 hover:bg-orange-600/20 transition-all cursor-pointer"
                      >
                        <Sparkles className="w-3 h-3 text-orange-500 animate-pulse" /> Recomendar con IA
                      </button>
                    </div>
                    <textarea 
                      placeholder="Describe el problema brevemente..."
                      value={descripcion}
                      onChange={(e) => setDescripcion(e.target.value)}
                      className="w-full bg-neutral-950 border border-neutral-800 rounded-2xl p-4 text-sm font-medium focus:border-orange-500 outline-none min-h-[100px]"
                    />
                  </div>

                  <button 
                    onClick={handleSubmit}
                    disabled={submitting}
                    className="w-full bg-orange-600 text-white py-5 rounded-2xl font-black uppercase italic shadow-xl"
                  >
                    {submitting ? 'Solicitando...' : 'SOLICITAR AUXILIO AHORA'}
                  </button>
                </div>
              </div>
            )}

            {/* Step 3: Status */}
            {activeSolicitud && (
              <div className="bg-neutral-900 rounded-3xl p-6 shadow-2xl border border-orange-600/30 animate-in slide-in-from-bottom">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <p className="text-[10px] font-black uppercase text-orange-500 italic tracking-widest animate-pulse">
                      {activeSolicitud.estado === 'pendiente' ? 'Buscando Proveedor...' : 'Proveedor Encontrado'}
                    </p>
                    <h3 className="font-black italic uppercase text-white text-xl">
                      {activeSolicitud.tipo_servicio}
                    </h3>
                  </div>
                  <div className="p-4 bg-orange-600 rounded-2xl text-white">
                    <Clock className="w-6 h-6" />
                  </div>
                </div>

                <div className="bg-neutral-950 p-4 rounded-2xl border border-neutral-800 mb-6">
                  <p className="text-xs text-neutral-400 italic">"{activeSolicitud.descripcion}"</p>
                </div>

                {/* Offers List (InDrive Style) */}
                {activeSolicitud.estado === 'pendiente' && offers.length > 0 && (
                  <div className="space-y-4 mb-6">
                    <h4 className="text-[10px] font-black uppercase text-yellow-500 italic tracking-widest mb-3">Ofertas Recibidas:</h4>
                    {offers.map((offer) => (
                      <div key={offer.id} className="bg-neutral-800 p-4 rounded-2xl border border-yellow-500/30 flex items-center justify-between animate-in slide-in-from-right-4">
                        <div>
                          <p className="text-xs font-black italic uppercase text-white">{offer.proveedores?.nombre_negocio || 'Mecánico'}</p>
                          <div className="flex items-center gap-1 text-[10px] text-yellow-500 font-bold">
                            <Star className="w-3 h-3 fill-yellow-500" /> {offer.proveedores?.calificacion_promedio?.toFixed(1) || '0.0'}
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-lg font-black text-white italic">S/ {offer.monto_oferta}</span>
                          <button 
                            onClick={() => aceptarOferta(offer)}
                            className="bg-yellow-500 text-black px-4 py-2 rounded-xl font-black text-[10px] uppercase italic"
                          >
                            Aceptar
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {activeSolicitud.estado !== 'pendiente' && (
                  <div className="flex gap-3">
                    <button 
                      onClick={() => setChatSolicitudId(activeSolicitud.id)}
                      className="flex-1 bg-neutral-800 text-white py-4 rounded-2xl font-black uppercase italic text-xs flex items-center justify-center gap-2"
                    >
                      <MessageSquare className="w-4 h-4" /> Chat
                    </button>
                    <button className="flex-1 bg-green-600 text-white py-4 rounded-2xl font-black uppercase italic text-xs flex items-center justify-center gap-2">
                      <Zap className="w-4 h-4" /> Llamar
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modals & Overlays */}
      {aiOpen && (
        <div className="fixed inset-0 bg-black/60 z-[4500] backdrop-blur-sm flex items-end justify-center sm:p-6 animate-in fade-in">
          <div className="bg-neutral-900 w-full max-w-lg h-[90vh] sm:rounded-3xl shadow-2xl relative overflow-hidden flex flex-col">
            <AsistenteIA 
              onClose={() => setAiOpen(false)}
              onApplyRecommendation={aplicarRecomendacionIA}
              tipoVehiculoActual={tipoVehiculo}
            />
          </div>
        </div>
      )}

      {chatSolicitudId && (
        <div className="fixed inset-0 z-[4000] flex items-end justify-center sm:p-6">
          <div className="bg-neutral-900 w-full max-w-lg h-[90vh] sm:rounded-3xl shadow-2xl relative overflow-hidden flex flex-col">
            <ChatBox 
              solicitudId={chatSolicitudId} 
              currentUserId={user?.id} 
              tipoUsuario="cliente"
              onClose={() => setChatSolicitudId(null)} 
            />
          </div>
        </div>
      )}

      {showVoucher && (
        <div className="fixed inset-0 bg-black/90 z-[5000] backdrop-blur-md flex items-center justify-center p-6">
          <div className="bg-white text-black w-full max-w-sm rounded-3xl overflow-hidden shadow-2xl p-8 space-y-6 text-center">
            <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <Check className="w-10 h-10 text-white" />
            </div>
            <h2 className="text-2xl font-black italic uppercase">SERVICIO COMPLETADO</h2>
            <div className="space-y-4 py-4 border-y border-neutral-100">
              <div className="flex justify-between text-xs font-black uppercase italic">
                <span className="text-neutral-400">Total</span>
                <span className="text-green-600 text-xl">S/ {showVoucher.monto_pactado || '0.00'}</span>
              </div>
            </div>
            <button 
              onClick={() => setShowVoucher(null)}
              className="w-full bg-black text-white py-4 rounded-2xl font-black uppercase italic"
            >
              Cerrar Comprobante
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
