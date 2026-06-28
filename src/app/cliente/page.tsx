'use client';

import React, { useState, useEffect, useRef } from 'react';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/navigation';
import { Truck, MapPin, Send, Disc, Zap, Activity, Battery, Wrench, HelpCircle, Clock, LogOut, AlertCircle, MessageSquare, Check, X, Menu, Star, Sparkles, ShieldCheck, CheckCircle2 } from 'lucide-react';
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
  const [historyOpen, setHistoryOpen] = useState(false);
  const [securityOpen, setSecurityOpen] = useState(false);

  // Form State
  const [tipoVehiculo, setTipoVehiculo] = useState('camion');
  const [selectedService, setSelectedService] = useState('llantas');
  const [descripcion, setDescripcion] = useState('');
  const [ubicacion, setUbicacion] = useState({ lat: -16.409, lng: -71.537, address: 'Buscando dirección...' });
  const [solicitudes, setSolicitudes] = useState<any[]>([]);
  const [chatSolicitudId, setChatSolicitudId] = useState<string | null>(null);
  const [showVoucher, setShowVoucher] = useState<any>(null);
  const [ratingStars, setRatingStars] = useState(5);
  const [ratingComment, setRatingComment] = useState('');
  const [ratingSubmitted, setRatingSubmitted] = useState(false);
  const [offers, setOffers] = useState<any[]>([]);
  const [unreadChatNotification, setUnreadChatNotification] = useState(false);
  const [acceptedOfferId, setAcceptedOfferId] = useState<string | null>(null);

  const solicitudesRef = useRef<any[]>([]);
  const userIdRef = useRef<string | null>(null);

  const activeSolicitud = bottomSheetStep === 'status' ? (solicitudes || []).find(s => s && s.estado && ['pendiente', 'aceptada', 'en_camino', 'en_sitio'].includes(s.estado)) : null;

  useEffect(() => {
    solicitudesRef.current = solicitudes || [];
  }, [solicitudes]);

  const fetchOffers = async (solicitudId: string) => {
    if (!solicitudId) return;
    try {
      const { data: msgs, error } = await supabase
        .from('mensajes')
        .select('*')
        .eq('solicitud_id', solicitudId)
        .eq('es_oferta', true)
        .order('created_at', { ascending: false });
      
      if (error) throw error;

      if (msgs && msgs.length > 0) {
        const emisorIds = msgs.map(m => m.emisor_id);
        const { data: provs } = await supabase
          .from('proveedores')
          .select('user_id, nombre_negocio, calificacion_promedio')
          .in('user_id', emisorIds);

        const enriched = msgs.map(m => {
          const prov = (provs || []).find(p => p.user_id === m.emisor_id);
          return {
            ...m,
            proveedores: prov || { nombre_negocio: 'Taller SOS', calificacion_promedio: 5.0 }
          };
        });
        setOffers(enriched);
      } else {
        setOffers([]);
      }
    } catch (e) {
      console.error("Error cargando ofertas:", e);
    }
  };

  const checkUser = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/login');
        return;
      }
      setUser(user);
      userIdRef.current = user.id;
      setLoading(false);
    } catch (e) {
      console.error("Error al verificar usuario:", e);
      setLoading(false);
    }
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
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('solicitudes')
        .select('*')
        .eq('cliente_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      if (data) {
        const providerUserIds = Array.from(new Set(data.filter(s => s.proveedor_id).map(s => s.proveedor_id)));
        let providerMap: {[key: string]: any} = {};
        
        if (providerUserIds.length > 0) {
          const { data: provs } = await supabase
            .from('proveedores')
            .select('user_id, nombre_negocio, calificacion_promedio')
            .in('user_id', providerUserIds);

          if (provs) {
            provs.forEach(p => {
              providerMap[p.user_id] = p;
            });
          }
        }

        const enriched = data.map(s => ({
          ...s,
          proveedores: providerMap[s.proveedor_id] || { nombre_negocio: 'Taller SOS' }
        }));

        setSolicitudes(enriched);
      }
    } catch (e) {
      console.error("Error obteniendo solicitudes:", e);
    }
  };

  const aceptarOferta = async (oferta: any) => {
    if (!oferta) return;
    setAcceptedOfferId(oferta.id);
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

      const montoVal = parseFloat(oferta.monto_oferta || 0);
      await supabase.from('mensajes').insert({
        solicitud_id: oferta.solicitud_id,
        emisor_id: user.id,
        contenido: `SISTEMA: El cliente ha aceptado la oferta de S/ ${montoVal.toFixed(2)}.`
      });
      
      alert("¡Oferta aceptada! El mecánico ha sido asignado.");
      fetchSolicitudes();
      setChatSolicitudId(oferta.solicitud_id);
    } catch (err: any) {
      setError(err?.message || "Error al aceptar oferta");
      setAcceptedOfferId(null);
    }
  };

  useEffect(() => {
    checkUser();
    getUbicacionActual();
    fetchSolicitudes();

    const channel = supabase
      .channel('schema-db-cliente-restored-original-flow')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'solicitudes' },
        (payload: any) => {
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
          if (!payload.new) return;
          const list = solicitudesRef.current || [];
          const matched = list.find(s => s && s.id === payload.new.solicitud_id);
          
          if (matched) {
            if (payload.new.es_oferta) {
              fetchOffers(matched.id);
            }
            if (payload.new.emisor_id !== userIdRef.current) {
              setUnreadChatNotification(true);
            }
          } else {
            fetchSolicitudes();
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const handleSubmit = async () => {
    if (!descripcion.trim()) {
      setError("Por favor ingresa una descripción del problema");
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const { data: inserted, error: submitError } = await supabase
        .from('solicitudes')
        .insert({
          cliente_id: user.id,
          tipo_servicio: selectedService,
          descripcion: `[${tipoVehiculo.toUpperCase()}] ${descripcion.trim()}`,
          latitud: ubicacion.lat,
          longitud: ubicacion.lng,
          estado: 'pendiente'
        })
        .select()
        .single();

      if (submitError) throw submitError;
      
      setDescripcion('');
      if (inserted) {
        setSolicitudes(prev => [inserted, ...prev]);
        fetchOffers(inserted.id);
      }
      setBottomSheetStep('status');
      fetchSolicitudes();
    } catch (err: any) {
      setError(err?.message || 'Error al enviar la solicitud');
    } finally {
      setSubmitting(false);
    }
  };

  const enviarCalificacion = async () => {
    if (!showVoucher) return;
    try {
      await supabase.from('calificaciones').insert({
        solicitud_id: showVoucher.id,
        cliente_id: user.id,
        proveedor_id: showVoucher.proveedor_id || user.id,
        estrellas: ratingStars,
        comentario: ratingComment
      });
      setRatingSubmitted(true);
      setTimeout(() => {
        setShowVoucher(null);
        setRatingSubmitted(false);
      }, 1500);
    } catch (e) {
      setShowVoucher(null);
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

  return (
    <div className="h-screen w-full bg-neutral-950 text-neutral-100 overflow-hidden relative flex flex-col">
      
      {/* Sidebar Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/60 z-[4000] backdrop-blur-sm"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 w-80 bg-neutral-900 z-[4100] transform transition-transform duration-300 ease-in-out p-6 flex flex-col ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
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
          <button 
            onClick={() => {
              setSidebarOpen(false);
              fetchSolicitudes();
              setHistoryOpen(true);
            }}
            className="w-full flex items-center gap-4 p-4 rounded-xl hover:bg-neutral-800 text-neutral-300 font-black italic uppercase text-xs transition-all"
          >
            <Clock className="w-5 h-5 text-orange-500" /> Historial de Pedidos de Auxilio
          </button>
          <button 
            onClick={() => {
              setSidebarOpen(false);
              setSecurityOpen(true);
            }}
            className="w-full flex items-center gap-4 p-4 rounded-xl hover:bg-neutral-800 text-neutral-300 font-black italic uppercase text-xs transition-all"
          >
            <ShieldCheck className="w-5 h-5 text-green-500" /> Seguridad & Verificación
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
      <div className="flex-1 w-full relative">
        {/* Floating Menu Button */}
        <button 
          onClick={() => setSidebarOpen(true)}
          className="absolute top-6 left-6 z-[2000] p-4 bg-neutral-900 border border-neutral-800 rounded-2xl shadow-2xl text-white hover:bg-neutral-800 transition-all"
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
          isSelectionMode={bottomSheetStep !== 'status'}
          onLocationSelect={(lat, lng) => {
            setUbicacion(prev => ({ ...prev, lat, lng }));
          }}
          markers={bottomSheetStep === 'status' && solicitudes[0] ? [
            { id: 'me', position: [solicitudes[0].latitud, solicitudes[0].longitud], type: 'car', label: 'MI EMERGENCIA VIAL' }
          ] : []}
        />
      </div>

      {/* Bottom Sheet Container */}
      <div className="absolute inset-x-0 bottom-0 z-[3000] p-4 md:p-6 pointer-events-none">
        <div className="max-w-md mx-auto pointer-events-auto">
          {bottomSheetStep === 'status' && solicitudes[0] ? (
            /* Estado Activo de Auxilio */
            <div className="bg-neutral-900 rounded-3xl p-6 shadow-2xl border border-orange-600/30 animate-in slide-in-from-bottom">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-[10px] font-black uppercase text-orange-500 italic tracking-widest animate-pulse">
                    Buscando Mecánicos Cercanos...
                  </p>
                  <h3 className="font-black italic uppercase text-white text-xl mt-0.5">
                    {solicitudes[0].tipo_servicio}
                  </h3>
                </div>
                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => setBottomSheetStep('selection')}
                    className="p-3 bg-neutral-800 hover:bg-neutral-750 text-neutral-400 hover:text-white rounded-2xl border border-neutral-700 font-black transition-all flex items-center justify-center"
                    title="Volver"
                  >
                    <X className="w-5 h-5" />
                  </button>
                  <div className="p-4 bg-orange-600 rounded-2xl text-white shadow-lg shadow-orange-600/30">
                    <Clock className="w-6 h-6" />
                  </div>
                </div>
              </div>

              {/* Botón de Chat en Anaranjado (Negociar / Chat 💬) */}
              <div className="mb-4">
                <button 
                  onClick={() => {
                    setChatSolicitudId(solicitudes[0].id);
                    setUnreadChatNotification(false);
                  }}
                  className="w-full bg-neutral-850 hover:bg-neutral-800 text-orange-500 py-3.5 rounded-xl font-black text-xs transition-all flex items-center justify-center gap-2 uppercase italic border border-orange-500/40 shadow-md relative"
                >
                  <MessageSquare className="w-4.5 h-4.5 text-orange-500" /> 
                  <span>Negociar / Chat 💬</span>
                  {unreadChatNotification && (
                    <span className="w-2.5 h-2.5 bg-red-500 rounded-full animate-ping absolute right-4"></span>
                  )}
                </button>
              </div>

              {/* Lista de Ofertas */}
              <div className="space-y-3 mb-2">
                <div className="flex items-center justify-between">
                  <h4 className="text-[10px] font-black uppercase text-orange-500 italic tracking-widest">
                    Ofertas en Tiempo Real ({offers.length}):
                  </h4>
                </div>

                {offers.length === 0 ? (
                  <div className="p-4 text-center bg-neutral-950 rounded-2xl border border-neutral-800">
                    <p className="text-xs text-neutral-400 font-bold uppercase italic animate-pulse">Esperando propuestas de talleres cercanos...</p>
                  </div>
                ) : (
                  offers.map((offer) => (
                    <div key={offer.id} className="bg-neutral-850 p-3.5 rounded-2xl border-2 border-orange-500/70 flex items-center justify-between shadow-lg shadow-orange-500/5 overflow-hidden gap-2 animate-in slide-in-from-right-4">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1">
                          <p className="text-xs font-black italic uppercase text-white truncate">{offer.proveedores?.nombre_negocio || 'Taller SOS'}</p>
                          <ShieldCheck className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                        </div>
                        <div className="flex items-center gap-1 text-[10px] text-yellow-400 font-black mt-0.5">
                          <Star className="w-3 h-3 fill-yellow-400" /> {offer.proveedores?.calificacion_promedio?.toFixed(1) || '5.0'}
                          <span className="text-neutral-400 font-normal ml-0.5">• Verificado</span>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-1.5 shrink-0">
                        <span className="text-sm font-black text-white italic mr-0.5">S/ {parseFloat(offer?.monto_oferta || 0).toFixed(0)}</span>
                        <button 
                          onClick={() => setChatSolicitudId(offer.solicitud_id)}
                          className="bg-neutral-800 text-orange-500 p-2 rounded-xl font-black border border-neutral-700 hover:bg-neutral-750 transition-all shrink-0"
                          title="Chatear"
                        >
                          <MessageSquare className="w-4 h-4 text-orange-500" />
                        </button>
                        {acceptedOfferId === offer.id ? (
                          <span className="bg-green-500 text-black px-2.5 py-2 rounded-xl font-black text-[9px] uppercase italic flex items-center gap-1 shadow-md shadow-green-500/20 animate-in zoom-in shrink-0">
                            <CheckCircle2 className="w-3 h-3" /> Aceptado
                          </span>
                        ) : (
                          <button 
                            onClick={() => aceptarOferta(offer)}
                            className="bg-orange-500 hover:bg-orange-400 text-black px-3 py-2 rounded-xl font-black text-[9px] uppercase italic transition-all shadow-md shadow-orange-500/20 shrink-0"
                          >
                            Aceptar
                          </button>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          ) : bottomSheetStep === 'form' ? (
            /* Formularios de Detalles */
            <div className="bg-neutral-900 rounded-3xl p-6 shadow-2xl border border-neutral-800 max-h-[75vh] overflow-y-auto animate-in slide-in-from-bottom custom-scrollbar">
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-black italic uppercase text-white text-base">Detalles de la Emergencia</h3>
                <button onClick={() => setBottomSheetStep('selection')} className="p-1 text-neutral-500 hover:text-white">
                  <X className="w-6 h-6" />
                </button>
              </div>

              {error && (
                <div className="bg-red-500/10 border border-red-500/30 p-3 rounded-xl mb-4 text-red-400 text-xs font-bold flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <div className="space-y-6">
                <div>
                  <label className="block text-[10px] font-black text-neutral-400 uppercase italic mb-3">Tipo de Vehículo</label>
                  <div className="grid grid-cols-2 gap-2">
                    {VEHICULOS.map(v => (
                      <button
                        key={v.id}
                        type="button"
                        onClick={() => setTipoVehiculo(v.id)}
                        className={`p-3 rounded-xl border-2 font-black italic text-[10px] uppercase transition-all ${
                          tipoVehiculo === v.id ? 'border-orange-500 bg-orange-500/10 text-white' : 'border-neutral-800 bg-neutral-950 text-neutral-400'
                        }`}
                      >
                        {v.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-black text-neutral-400 uppercase italic mb-3">Servicio Requerido</label>
                  <div className="grid grid-cols-3 gap-2">
                    {SERVICIOS.map(s => (
                      <button
                        key={s.id}
                        type="button"
                        onClick={() => setSelectedService(s.id)}
                        className={`flex flex-col items-center p-3 rounded-xl border transition-all ${
                          selectedService === s.id ? 'bg-orange-600 border-orange-400 text-white' : 'bg-neutral-950 border-neutral-800 text-neutral-400'
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
                    <label className="block text-[10px] font-black text-neutral-400 uppercase italic">¿Qué ocurrió con tu vehículo?</label>
                    <button 
                      type="button"
                      onClick={() => setAiOpen(true)}
                      className="text-[9px] bg-orange-600/10 text-orange-400 border border-orange-500/20 px-2.5 py-1 rounded-lg font-black uppercase italic tracking-wider flex items-center gap-1 hover:bg-orange-600/20 transition-all cursor-pointer"
                    >
                      <Sparkles className="w-3 h-3 text-orange-500 animate-pulse" /> Recomendar con IA
                    </button>
                  </div>
                  <textarea 
                    placeholder="Describe el problema claramente (ej. Se bajó la llanta trasera derecha)..."
                    value={descripcion}
                    onChange={(e) => setDescripcion(e.target.value)}
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-2xl p-4 text-sm font-semibold text-white placeholder:text-neutral-500 focus:border-orange-500 outline-none min-h-[110px]"
                  />
                </div>

                <button 
                  type="button"
                  onClick={handleSubmit}
                  disabled={submitting}
                  className="w-full bg-orange-600 hover:bg-orange-700 text-white py-5 rounded-2xl font-black uppercase italic shadow-xl shadow-orange-600/20 transition-all"
                >
                  {submitting ? 'Enviando Alerta SOS...' : 'SOLICITAR AUXILIO AHORA'}
                </button>
              </div>
            </div>
          ) : (
            /* Paso 1 Original */
            <div className="bg-neutral-900 rounded-3xl p-6 shadow-2xl border border-neutral-800 animate-in slide-in-from-bottom">
              <div className="flex items-center gap-4 mb-6">
                <div className="p-3 bg-orange-600 rounded-xl shrink-0 shadow-lg shadow-orange-600/30">
                  <MapPin className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase text-orange-500 italic">Punto de Auxilio GPS</p>
                  <p className="text-xs font-black uppercase italic text-white truncate">
                    Ubicación detectada por mapa
                  </p>
                </div>
              </div>
              <button 
                onClick={() => setBottomSheetStep('form')}
                className="w-full bg-orange-600 hover:bg-orange-700 text-white py-5 rounded-2xl font-black text-base uppercase italic shadow-xl shadow-orange-600/20 transition-all"
              >
                Confirmar Ubicación y Solicitar
              </button>
            </div>
          )}
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

      {/* Modal Historial de Pedidos de Auxilio */}
      {historyOpen && (
        <div className="fixed inset-0 bg-black/80 z-[5000] backdrop-blur-md flex items-center justify-center p-4 sm:p-6 animate-in fade-in">
          <div className="bg-neutral-900 border border-neutral-800 w-full max-w-lg rounded-3xl p-6 shadow-2xl space-y-4 max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-orange-500/10 rounded-xl border border-orange-500/20">
                  <Clock className="w-5 h-5 text-orange-500" />
                </div>
                <div>
                  <h3 className="font-black italic uppercase text-white text-base">Historial de Pedidos de Auxilio</h3>
                  <p className="text-[10px] text-neutral-400 font-bold uppercase">Tus solicitudes registradas en la plataforma</p>
                </div>
              </div>
              <button onClick={() => setHistoryOpen(false)} className="p-2 text-neutral-400 hover:text-white">
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-3 pr-1 custom-scrollbar">
              {solicitudes.filter(s => s.estado === 'completada').length === 0 ? (
                <div className="text-center py-12 text-neutral-500">
                  <Clock className="w-10 h-10 mx-auto mb-2 opacity-30" />
                  <p className="text-xs font-black uppercase italic">No tienes trabajos terminados en tu historial</p>
                </div>
              ) : (
                solicitudes.filter(s => s.estado === 'completada').map((sol) => (
                  <div key={sol.id} className="bg-neutral-950 p-4 rounded-2xl border border-neutral-800 flex items-center justify-between shadow-md">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-[9px] font-black uppercase tracking-wider text-orange-500 bg-orange-500/10 px-2 py-0.5 rounded-md border border-orange-500/20">
                          {sol.tipo_servicio}
                        </span>
                        <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded-md border bg-green-500/10 text-green-400 border-green-500/30">
                          TERMINADO ✔️
                        </span>
                      </div>
                      <p className="text-xs font-semibold text-neutral-300 italic mt-2 line-clamp-1">"{sol.descripcion}"</p>
                      <p className="text-[9px] text-neutral-500 font-bold mt-1">
                        {sol.created_at ? new Date(sol.created_at).toLocaleDateString() + ' - ' + new Date(sol.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Fecha desconocida'}
                      </p>
                    </div>
                    <div className="text-right shrink-0 ml-2">
                      <span className="text-sm font-black text-white italic">
                        {sol.monto_pactado ? `S/ ${parseFloat(sol.monto_pactado).toFixed(2)}` : 'S/ --'}
                      </span>
                      <p className="text-[9px] text-neutral-400 font-bold uppercase mt-0.5">
                        {sol.proveedores?.nombre_negocio || 'Taller SOS'}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* Modal Seguridad & Verificación */}
      {securityOpen && (
        <div className="fixed inset-0 bg-black/80 z-[5000] backdrop-blur-md flex items-center justify-center p-4 sm:p-6 animate-in fade-in">
          <div className="bg-neutral-900 border border-neutral-800 w-full max-w-lg rounded-3xl p-6 shadow-2xl space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-green-500/10 rounded-xl border border-green-500/20">
                  <ShieldCheck className="w-6 h-6 text-green-400" />
                </div>
                <div>
                  <h3 className="font-black italic uppercase text-white text-base">Seguridad & Verificación</h3>
                  <p className="text-[10px] text-green-400 font-black uppercase tracking-wider">Protocolos de Protección TruckSOS</p>
                </div>
              </div>
              <button onClick={() => setSecurityOpen(false)} className="p-2 text-neutral-400 hover:text-white">
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-3.5">
              <div className="bg-neutral-950 p-4 rounded-2xl border border-neutral-800 flex items-start gap-3.5">
                <div className="p-2 bg-blue-500/10 rounded-xl border border-blue-500/20 shrink-0 mt-0.5">
                  <ShieldCheck className="w-5 h-5 text-blue-400" />
                </div>
                <div>
                  <h4 className="text-xs font-black uppercase italic text-white">Mecánicos & Talleres Verificados</h4>
                  <p className="text-[11px] text-neutral-400 font-semibold mt-0.5 leading-relaxed">
                    Todos los proveedores registrados pasan por una estricta validación de identidad (DNI/RUC) y verificación de talleres mecánicos afiliados.
                  </p>
                </div>
              </div>

              <div className="bg-neutral-950 p-4 rounded-2xl border border-neutral-800 flex items-start gap-3.5">
                <div className="p-2 bg-orange-500/10 rounded-xl border border-orange-500/20 shrink-0 mt-0.5">
                  <MapPin className="w-5 h-5 text-orange-500" />
                </div>
                <div>
                  <h4 className="text-xs font-black uppercase italic text-white">Monitoreo GPS en Tiempo Real</h4>
                  <p className="text-[11px] text-neutral-400 font-semibold mt-0.5 leading-relaxed">
                    Rastreo satelital en vivo del vehículo de auxilio desde el momento en que acepta tu solicitud hasta su llegada a tu ubicación.
                  </p>
                </div>
              </div>

              <div className="bg-neutral-950 p-4 rounded-2xl border border-neutral-800 flex items-start gap-3.5">
                <div className="p-2 bg-yellow-500/10 rounded-xl border border-yellow-500/20 shrink-0 mt-0.5">
                  <Sparkles className="w-5 h-5 text-yellow-400" />
                </div>
                <div>
                  <h4 className="text-xs font-black uppercase italic text-white">Tarifas Transparentes & Negociación Directa</h4>
                  <p className="text-[11px] text-neutral-400 font-semibold mt-0.5 leading-relaxed">
                    Sin comisiones ocultas ni cobros sorpresa. Acuerdas el precio justo de la reparación directamente con el mecánico antes de iniciar.
                  </p>
                </div>
              </div>
            </div>

            <button 
              onClick={() => setSecurityOpen(false)}
              className="w-full bg-neutral-800 hover:bg-neutral-750 text-white py-3.5 rounded-2xl font-black text-xs uppercase italic transition-all"
            >
              Entendido y Protegido ✔️
            </button>
          </div>
        </div>
      )}

      {/* Modal de Chat en Vivo Realtime */}
      {chatSolicitudId && (
        <div className="fixed inset-0 z-[5000] bg-black/60 backdrop-blur-sm flex items-end justify-center p-0 sm:p-6 animate-in fade-in pb-2 sm:pb-0">
          <div className="bg-neutral-900 w-[92%] sm:w-full max-w-md h-[85vh] sm:h-[600px] rounded-3xl shadow-2xl relative overflow-hidden flex flex-col border border-neutral-800">
            <ChatBox 
              solicitudId={chatSolicitudId} 
              currentUserId={user?.id} 
              tipoUsuario="cliente"
              onClose={() => setChatSolicitudId(null)} 
            />
          </div>
        </div>
      )}

      {/* Voucher y Calificación */}
      {showVoucher && (
        <div className="fixed inset-0 bg-black/90 z-[6000] backdrop-blur-md flex items-center justify-center p-6 animate-in fade-in">
          <div className="bg-neutral-900 text-white w-full max-w-sm rounded-3xl border border-neutral-800 overflow-hidden shadow-2xl p-6 text-center space-y-5">
            <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto shadow-lg shadow-green-500/20">
              <Check className="w-8 h-8 text-black" />
            </div>
            <div>
              <h2 className="text-xl font-black italic uppercase text-white">SERVICIO COMPLETADO</h2>
              <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest mt-1">Gracias por usar TruckSOS</p>
            </div>

            <div className="bg-neutral-950 p-4 rounded-2xl border border-neutral-800 space-y-2 text-left">
              <div className="flex justify-between text-xs font-black uppercase italic">
                <span className="text-neutral-400">Total Pagado:</span>
                <span className="text-green-400 text-base">S/ {showVoucher.monto_pactado || '0.00'}</span>
              </div>
            </div>

            {!ratingSubmitted ? (
              <div className="space-y-4 pt-2 border-t border-neutral-800">
                <p className="text-xs font-black uppercase italic text-yellow-400">Califica la Atención del Mecánico:</p>
                <div className="flex justify-center gap-2">
                  {[1, 2, 3, 4, 5].map(star => (
                    <button 
                      key={star} 
                      type="button" 
                      onClick={() => setRatingStars(star)}
                      className="p-1 transition-transform hover:scale-125"
                    >
                      <Star className={`w-7 h-7 ${star <= ratingStars ? 'fill-yellow-400 text-yellow-400' : 'text-neutral-700'}`} />
                    </button>
                  ))}
                </div>
                <input 
                  type="text" 
                  placeholder="Comentario breve (opcional)..." 
                  value={ratingComment}
                  onChange={(e) => setRatingComment(e.target.value)}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-yellow-400"
                />
                <button 
                  onClick={enviarCalificacion}
                  className="w-full bg-yellow-500 hover:bg-yellow-400 text-black py-3.5 rounded-xl font-black uppercase italic text-xs transition-all shadow-lg"
                >
                  Enviar Calificación
                </button>
              </div>
            ) : (
              <div className="py-4 text-green-400 font-black italic uppercase text-xs animate-in zoom-in">
                ¡Gracias por tu valoración!
              </div>
            )}
          </div>
        </div>
      )}

    </div>
  );
}
