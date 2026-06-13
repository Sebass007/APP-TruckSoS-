'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Send, DollarSign, X, MessageSquare, User } from 'lucide-react';
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
  const scrollRef = useRef<HTMLDivElement>(null);

  const fetchMensajes = async () => {
    const { data } = await supabase
      .from('mensajes')
      .select('*')
      .eq('solicitud_id', solicitudId)
      .order('created_at', { ascending: true });
    
    if (data) setMensajes(data);
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
          setMensajes(prev => [...prev, payload.new]);
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

    const { error } = await supabase
      .from('mensajes')
      .insert({
        solicitud_id: solicitudId,
        emisor_id: currentUserId,
        contenido: esOferta ? `OFERTA DE PRECIO: S/ ${montoOferta}` : nuevoMensaje,
        es_oferta: esOferta,
        monto_oferta: esOferta ? parseFloat(montoOferta) : null
      });

    if (!error) {
      setNuevoMensaje('');
      setMontoOferta('');
      setShowOferta(false);
    }
  };

  const aceptarOferta = async (monto: number, proveedorId: string) => {
    const { error } = await supabase
      .from('solicitudes')
      .update({ 
        monto_pactado: monto, 
        estado: 'aceptada',
        proveedor_id: proveedorId 
      })
      .eq('id', solicitudId);

    if (!error) {
      alert('¡Oferta aceptada! El mecánico ha sido asignado.');
      // Enviar mensaje automático de confirmación
      await supabase.from('mensajes').insert({
        solicitud_id: solicitudId,
        emisor_id: currentUserId,
        contenido: `SISTEMA: El cliente ha aceptado la oferta de S/ ${monto}.`
      });
      onClose();
    }
  };

  return (
    <div className="flex flex-col h-full bg-neutral-900 border border-neutral-800 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in slide-in-from-bottom-4">
      {/* Header */}
      <div className="p-4 bg-neutral-800 border-b border-neutral-700 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-orange-600 rounded-full flex items-center justify-center">
            <User className="w-4 h-4 text-white" />
          </div>
          <div>
            <p className="text-xs font-black italic uppercase text-white">Chat de Negociación</p>
            <p className="text-[9px] text-green-500 font-bold uppercase animate-pulse">En Línea</p>
          </div>
        </div>
        <button onClick={onClose} className="text-neutral-500 hover:text-white transition-colors">
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Messages Area */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-hide">
        {mensajes.map((msg, i) => {
          const isMe = msg.emisor_id === currentUserId;
          return (
            <div key={i} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[80%] p-3 rounded-2xl text-xs font-medium ${
                isMe 
                  ? 'bg-orange-600 text-white rounded-br-none' 
                  : 'bg-neutral-800 text-neutral-300 rounded-bl-none'
              } ${msg.es_oferta ? 'border-2 border-yellow-500 shadow-lg shadow-yellow-500/10' : ''}`}>
                {msg.contenido}
                {msg.es_oferta && !isMe && tipoUsuario === 'cliente' && (
                  <button 
                    onClick={() => aceptarOferta(msg.monto_oferta, msg.emisor_id)}
                    className="mt-3 w-full bg-yellow-500 text-black py-2 rounded-lg font-black uppercase italic hover:bg-yellow-400 transition-all"
                  >
                    Aceptar Oferta
                  </button>
                )}
                <p className={`text-[8px] mt-1 opacity-50 ${isMe ? 'text-right' : 'text-left'}`}>
                  {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Input Area */}
      <div className="p-4 bg-neutral-900 border-t border-neutral-800 space-y-3">
        {showOferta && (
          <div className="flex gap-2 animate-in slide-in-from-bottom-2">
            <div className="relative flex-1">
              <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-yellow-500" />
              <input 
                type="number"
                value={montoOferta}
                onChange={(e) => setMontoOferta(e.target.value)}
                className="w-full bg-neutral-950 border border-yellow-500/50 rounded-xl py-2 pl-9 pr-4 text-xs font-black text-white focus:outline-none"
                placeholder="Monto S/..."
              />
            </div>
            <button 
              onClick={() => enviarMensaje(undefined, true)}
              className="bg-yellow-500 text-black px-4 py-2 rounded-xl font-black text-[10px] uppercase italic"
            >
              Enviar Oferta
            </button>
          </div>
        )}

        <div className="flex items-center gap-2">
          {tipoUsuario === 'proveedor' && (
            <button 
              onClick={() => setShowOferta(!showOferta)}
              className={`p-3 rounded-xl border transition-all ${showOferta ? 'bg-yellow-500 text-black border-yellow-600' : 'bg-neutral-800 text-yellow-500 border-neutral-700'}`}
            >
              <DollarSign className="w-5 h-5" />
            </button>
          )}
          <form onSubmit={(e) => enviarMensaje(e)} className="flex-1 flex gap-2">
            <input 
              type="text" 
              value={nuevoMensaje}
              onChange={(e) => setNuevoMensaje(e.target.value)}
              className="flex-1 bg-neutral-950 border border-neutral-800 rounded-xl py-3 px-4 text-xs font-medium text-white focus:outline-none focus:border-orange-500"
              placeholder="Escribe un mensaje..."
            />
            <button type="submit" className="bg-orange-600 p-3 rounded-xl text-white hover:bg-orange-700 transition-all">
              <Send className="w-5 h-5" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
