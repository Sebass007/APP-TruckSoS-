'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Send, DollarSign, X, MessageSquare, User, AlertCircle, CheckCircle2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';

interface ChatProps {
  solicitudId: string;
  currentUserId: string;
  onClose: () => void;
  tipoUsuario: 'cliente' | 'proveedor';
}

export default function ChatBox({ solicitudId, currentUserId, onClose, tipoUsuario }: ChatProps) {
  const [mensajes, setMensajes] = useState<any[]>([]);
  const [nuevoMensaje, setNuevoMensaje] = useState('');
  const [montoOferta, setMontoOferta] = useState('');
  const [showOferta, setShowOferta] = useState(false);
  const [errorChat, setErrorChat] = useState<string | null>(null);
  const [sending, setSending] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const fetchMensajes = async () => {
    try {
      const { data, error } = await supabase
        .from('mensajes')
        .select('*')
        .eq('solicitud_id', solicitudId)
        .order('created_at', { ascending: true });
      
      if (error) throw error;
      if (data) setMensajes(data);
    } catch (err: any) {
      console.error("Error cargando mensajes:", err);
    }
  };

  useEffect(() => {
    fetchMensajes();

    // Suscripción Realtime
    const channel = supabase
      .channel(`chat-${solicitudId}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'mensajes', filter: `solicitud_id=eq.${solicitudId}` },
        (payload) => {
          setMensajes(prev => {
            if (prev.some(m => m.id === payload.new.id)) return prev;
            return [...prev, payload.new];
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [solicitudId]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [mensajes]);

  const enviarMensaje = async (e?: React.FormEvent, esOferta = false) => {
    if (e) e.preventDefault();
    if (!nuevoMensaje.trim() && !esOferta) return;
    if (esOferta && (!montoOferta || parseFloat(montoOferta) <= 0)) {
      setErrorChat('Ingresa un monto válido para la oferta');
      return;
    }

    setSending(true);
    setErrorChat(null);

    try {
      const contenidoText = esOferta ? `OFERTA DE PRECIO: S/ ${parseFloat(montoOferta).toFixed(2)}` : nuevoMensaje.trim();
      const montoVal = esOferta ? parseFloat(montoOferta) : null;

      const { data, error } = await supabase
        .from('mensajes')
        .insert({
          solicitud_id: solicitudId,
          emisor_id: currentUserId,
          contenido: contenidoText,
          es_oferta: esOferta,
          monto_oferta: montoVal
        })
        .select()
        .single();

      if (error) throw error;

      if (data) {
        setMensajes(prev => {
          if (prev.some(m => m.id === data.id)) return prev;
          return [...prev, data];
        });
      }

      setNuevoMensaje('');
      setMontoOferta('');
      setShowOferta(false);
    } catch (err: any) {
      console.error("Error enviando mensaje:", err);
      setErrorChat(err.message || 'No se pudo enviar el mensaje');
    } finally {
      setSending(false);
    }
  };

  const aceptarOferta = async (monto: number, proveedorId: string) => {
    try {
      const { error } = await supabase
        .from('solicitudes')
        .update({ 
          monto_pactado: monto, 
          estado: 'aceptada',
          proveedor_id: proveedorId 
        })
        .eq('id', solicitudId);

      if (error) throw error;

      await supabase.from('mensajes').insert({
        solicitud_id: solicitudId,
        emisor_id: currentUserId,
        contenido: `SISTEMA: El cliente ha aceptado la oferta de S/ ${monto.toFixed(2)}.`
      });
      
      onClose();
    } catch (err: any) {
      setErrorChat(err.message || 'Error al aceptar oferta');
    }
  };

  const finalizarServicio = async () => {
    try {
      const { error } = await supabase
        .from('solicitudes')
        .update({ estado: 'completada' })
        .eq('id', solicitudId);

      if (error) throw error;

      await supabase.from('mensajes').insert({
        solicitud_id: solicitudId,
        emisor_id: currentUserId,
        contenido: 'SISTEMA: El mecánico ha marcado el servicio como completado.'
      });

      alert("¡Trabajo terminado! Se ha enviado la solicitud de calificación al cliente.");
      onClose();
    } catch (err: any) {
      setErrorChat(err.message || 'Error al finalizar servicio');
    }
  };

  return (
    <div className="flex flex-col h-full bg-neutral-900 border border-neutral-800 rounded-3xl shadow-2xl overflow-hidden animate-in fade-in slide-in-from-bottom-4">
      {/* Header */}
      <div className="p-4 pt-5 sm:pt-4 bg-neutral-800/95 backdrop-blur-md border-b border-neutral-700 flex justify-between items-center shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 sm:w-9 sm:h-9 bg-orange-600 rounded-full flex items-center justify-center shadow-lg shadow-orange-600/30 shrink-0">
            <User className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
          </div>
          <div className="min-w-0">
            <p className="text-xs font-black italic uppercase text-white tracking-wider truncate">Chat de Negociación</p>
            <p className="text-[9px] text-green-400 font-extrabold uppercase flex items-center gap-1">
              <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-ping"></span> En Línea
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {tipoUsuario === 'proveedor' && (
            <button 
              onClick={finalizarServicio}
              className="bg-green-600 hover:bg-green-500 text-white px-2.5 py-1.5 sm:px-3 sm:py-2 rounded-xl font-black text-[9px] sm:text-[10px] uppercase italic transition-all flex items-center gap-1 shadow-md shadow-green-600/30 shrink-0"
            >
              <CheckCircle2 className="w-3 h-3 sm:w-3.5 sm:h-3.5" /> Trabajo Terminado
            </button>
          )}
          <button 
            onClick={onClose} 
            className="p-2 bg-neutral-700/60 hover:bg-neutral-700 text-white rounded-xl border border-neutral-600 transition-all shadow-md shrink-0"
            title="Cerrar Chat"
          >
            <X className="w-5 h-5 text-white" />
          </button>
        </div>
      </div>

      {/* Error Banner */}
      {errorChat && (
        <div className="bg-red-500/10 border-b border-red-500/30 px-4 py-2 flex items-center gap-2 text-red-400 text-[10px] font-bold">
          <AlertCircle className="w-3.5 h-3.5 shrink-0" />
          <span className="truncate">{errorChat}</span>
        </div>
      )}

      {/* Messages Area */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-3 bg-neutral-950/40 custom-scrollbar">
        {mensajes.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-6 text-neutral-500">
            <MessageSquare className="w-10 h-10 mb-2 opacity-30" />
            <p className="text-xs font-black uppercase italic">Inicia la conversación</p>
            <p className="text-[10px] font-medium mt-1">Escribe un mensaje o envía una oferta de precio directa</p>
          </div>
        ) : (
          mensajes.map((msg, i) => {
            const isMe = msg.emisor_id === currentUserId;
            return (
              <div key={msg.id || i} className={`flex ${isMe ? 'justify-end' : 'justify-start'} animate-in fade-in duration-200`}>
                <div className={`max-w-[85%] p-3.5 rounded-2xl text-xs leading-relaxed font-semibold shadow-md ${
                  isMe 
                    ? 'bg-orange-600 text-white rounded-br-none' 
                    : 'bg-neutral-800 text-neutral-100 border border-neutral-700 rounded-bl-none'
                } ${msg.es_oferta ? 'border-2 border-yellow-500 bg-neutral-900 text-white shadow-xl shadow-yellow-500/10' : ''}`}>
                  
                  {msg.es_oferta && (
                    <div className="flex items-center gap-1.5 text-yellow-400 font-black uppercase text-[10px] mb-1 pb-1 border-b border-yellow-500/20">
                      <DollarSign className="w-3.5 h-3.5" /> Propuesta Económica
                    </div>
                  )}

                  <p className="whitespace-pre-line text-white">{msg.contenido}</p>
                  
                  {msg.es_oferta && !isMe && tipoUsuario === 'cliente' && (
                    <button 
                      onClick={() => aceptarOferta(msg.monto_oferta, msg.emisor_id)}
                      className="mt-3 w-full bg-gradient-to-r from-yellow-500 to-amber-500 text-black py-2.5 rounded-xl font-black uppercase italic text-[10px] tracking-wider hover:brightness-110 shadow-lg transition-all flex items-center justify-center gap-1"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" /> Aceptar Oferta (S/ {msg.monto_oferta})
                    </button>
                  )}

                  <p className={`text-[8px] mt-1.5 font-bold tracking-wider opacity-60 ${isMe ? 'text-right text-orange-100' : 'text-left text-neutral-400'}`}>
                    {msg.created_at ? new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Ahora'}
                  </p>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Input Area */}
      <div className="p-4 bg-neutral-900 border-t border-neutral-800 space-y-3 shrink-0">
        {showOferta && (
          <div className="bg-neutral-950 p-3 rounded-2xl border border-yellow-500/40 space-y-2 animate-in slide-in-from-bottom-2">
            <p className="text-[9px] font-black uppercase text-yellow-500 italic tracking-wider">Enviar Oferta de Auxilio:</p>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-yellow-500 font-black text-xs">S/</span>
                <input 
                  type="number"
                  step="0.5"
                  value={montoOferta}
                  onChange={(e) => setMontoOferta(e.target.value)}
                  className="w-full bg-neutral-900 border border-neutral-700 rounded-xl py-2.5 pl-8 pr-3 text-xs font-black text-white focus:outline-none focus:border-yellow-500"
                  placeholder="Monto total..."
                />
              </div>
              <button 
                onClick={() => enviarMensaje(undefined, true)}
                disabled={sending}
                className="bg-yellow-500 hover:bg-yellow-400 text-black px-4 py-2.5 rounded-xl font-black text-[10px] uppercase italic tracking-wider transition-all shadow-md shadow-yellow-500/10"
              >
                {sending ? 'Enviando...' : 'Ofertar'}
              </button>
            </div>
          </div>
        )}

        <div className="flex items-center gap-2">
          {tipoUsuario === 'proveedor' && (
            <button 
              onClick={() => setShowOferta(!showOferta)}
              type="button"
              className={`p-3 rounded-xl border transition-all ${showOferta ? 'bg-yellow-500 text-black border-yellow-600' : 'bg-neutral-800 text-yellow-500 border-neutral-700 hover:bg-neutral-750'}`}
              title="Proponer Precio"
            >
              <DollarSign className="w-5 h-5" />
            </button>
          )}
          <form onSubmit={(e) => enviarMensaje(e)} className="flex-1 flex gap-2">
            <input 
              type="text" 
              value={nuevoMensaje}
              onChange={(e) => setNuevoMensaje(e.target.value)}
              placeholder="Escribe un mensaje..."
              className="flex-1 bg-neutral-950 border border-neutral-800 rounded-xl py-3 px-4 text-xs font-semibold text-white placeholder:text-neutral-500 focus:outline-none focus:border-orange-500 transition-all"
            />
            <button 
              type="submit" 
              disabled={sending || (!nuevoMensaje.trim() && !showOferta)}
              className="bg-orange-600 hover:bg-orange-700 disabled:opacity-50 text-white p-3 rounded-xl shadow-lg transition-all shrink-0"
            >
              <Send className="w-5 h-5" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
