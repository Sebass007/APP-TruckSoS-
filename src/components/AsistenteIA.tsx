'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Sparkles, X, Send, Bot, User, Wrench, Shield, Check, Info, Star, ArrowRight } from 'lucide-react';

interface Recommendation {
  brand: string;
  model: string;
  priceEstimate: string;
  rating: number;
  benefits: string[];
  recommendedFor: string;
  category: string;
  description: string;
}

interface Message {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  recommendations?: Recommendation[];
}

interface AsistenteIAProps {
  onClose: () => void;
  onApplyRecommendation: (category: string, text: string) => void;
  tipoVehiculoActual?: string;
}

const RECOMENDACIONES_DB: Recommendation[] = [
  // LLANTAS CAMION
  {
    brand: 'Michelin',
    model: 'X Line Energy Z',
    priceEstimate: 'S/ 1,450 - S/ 1,800',
    rating: 4.9,
    benefits: ['Resistencia al desgaste irregular', 'Ahorro óptimo de combustible', 'Excelente agarre en mojado'],
    recommendedFor: 'Camiones de larga distancia / Carga pesada',
    category: 'llantas',
    description: 'Neumático de alta gama diseñado para ejes de dirección en transporte de larga distancia. Maximiza el rendimiento del combustible.'
  },
  {
    brand: 'Goodyear',
    model: 'Endurance RSA',
    priceEstimate: 'S/ 1,200 - S/ 1,500',
    rating: 4.7,
    benefits: ['Costados reforzados contra raspaduras', 'Alta tracción en toda estación', 'Reencauchabilidad premium'],
    recommendedFor: 'Camiones regionales y de reparto pesado',
    category: 'llantas',
    description: 'Ideal para camiones que enfrentan rutas urbanas y regionales exigentes. Cuenta con tecnología protectora de carcasa.'
  },
  // LLANTAS AUTO
  {
    brand: 'Bridgestone',
    model: 'Turanza ER300',
    priceEstimate: 'S/ 380 - S/ 520',
    rating: 4.6,
    benefits: ['Marcha sumamente silenciosa', 'Gran control de frenado', 'Excelente tracción en curvas'],
    recommendedFor: 'Autos Sedán, Hatchback y Compactos',
    category: 'llantas',
    description: 'Diseño asimétrico que equilibra el confort de marcha con una respuesta deportiva y segura en cualquier clima.'
  },
  {
    brand: 'Michelin',
    model: 'Primacy 4',
    priceEstimate: 'S/ 480 - S/ 650',
    rating: 4.8,
    benefits: ['Seguridad duradera incluso desgastada', 'Frenado superior en mojado', 'Gran duración kilométrica'],
    recommendedFor: 'Autos urbanos y minivans familiares',
    category: 'llantas',
    description: 'El neumático líder en seguridad y durabilidad. Mantiene estándares óptimos de evacuación de agua hasta el último kilómetro.'
  },
  // BATERIAS
  {
    brand: 'Bosch',
    model: 'S5 Silver Plus (Alta Gama)',
    priceEstimate: 'S/ 420 - S/ 550',
    rating: 4.9,
    benefits: ['100% libre de mantenimiento', 'Potencia de arranque en frío extrema', 'Doble de vida útil que convencionales'],
    recommendedFor: 'Autos y Minivans con alta demanda eléctrica',
    category: 'bateria',
    description: 'Batería premium con tecnología de rejilla PowerFrame, garantizando óptimo flujo de corriente y resistencia a la corrosión.'
  },
  {
    brand: 'Capsa',
    model: 'Pro Heavy Duty',
    priceEstimate: 'S/ 320 - S/ 450',
    rating: 4.5,
    benefits: ['Excelente relación calidad-precio', 'Soporte a vibraciones fuertes', 'Garantía extendida a nivel nacional'],
    recommendedFor: 'Taxis, Autos de uso diario y Camionetas ligeras',
    category: 'bateria',
    description: 'Fabricación nacional adaptada a la geografía y baches del Perú. Alta tolerancia a ciclos de carga repetitivos.'
  },
  {
    brand: 'Varta',
    model: 'Promotive Black / Silver',
    priceEstimate: 'S/ 750 - S/ 1,100',
    rating: 4.8,
    benefits: ['Diseñada para grandes motores diésel', 'Resistencia antivibración extrema (V3)', 'Arranque fiable en climas gélidos'],
    recommendedFor: 'Camiones, Buses y Maquinaria Pesada',
    category: 'bateria',
    description: 'Batería de rendimiento profesional para camiones de gran tonelaje que requieren energía constante para sistemas de cabina.'
  },
  // FRENOS / MECANICO
  {
    brand: 'Brembo',
    model: 'Pastillas de Freno Cerámicas',
    priceEstimate: 'S/ 240 - S/ 380 (el juego)',
    rating: 4.8,
    benefits: ['Frenado progresivo y sin ruidos', 'Mínimo polvo en los aros', 'Resistente a altas temperaturas'],
    recommendedFor: 'Autos, SUVs y Camionetas ligeras',
    category: 'mecanico',
    description: 'Las pastillas de cerámica Brembo ofrecen un confort de frenado óptimo y una fricción constante en un amplio rango de velocidades.'
  },
  // ACEITES
  {
    brand: 'Mobil 1',
    model: 'Advanced Full Synthetic 5W-30',
    priceEstimate: 'S/ 180 - S/ 250 (Galón)',
    rating: 4.9,
    benefits: ['Protección insuperable del motor', 'Mantiene la limpieza interna', 'Excelente flujo en arranques helados'],
    recommendedFor: 'Todo tipo de motores de gasolina modernos',
    category: 'mecanico',
    description: 'Lubricante sintético avanzado que cumple y excede los estándares de los fabricantes mundiales de vehículos.'
  }
];

export default function AsistenteIA({ onClose, onApplyRecommendation, tipoVehiculoActual = 'camion' }: AsistenteIAProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      sender: 'ai',
      text: `¡Hola! Soy tu **Asistente Experto TruckSOS IA** 🤖.

Estoy aquí para ayudarte a tomar la mejor decisión técnica. Puedo recomendarte **llantas, baterías, aceites, repuestos de frenos** o darte un diagnóstico preliminar para tu vehículo.

*Actualmente veo que tu vehículo seleccionado es un **${tipoVehiculoActual.toUpperCase()}**.*

¿De qué repuesto o problema te gustaría que hablemos? Puedes escribirlo o presionar alguno de los accesos rápidos de abajo.`
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const procesarMensajeIA = (userInput: string) => {
    setIsTyping(true);

    setTimeout(() => {
      const query = userInput.toLowerCase();
      let responseText = '';
      let matches: Recommendation[] = [];

      // Detección de llantas
      if (query.includes('llanta') || query.includes('neumatico') || query.includes('aro') || query.includes('rueda') || query.includes('tire')) {
        // Filtrar según el vehículo actual o si el query especifica
        const esParaCamion = query.includes('camion') || query.includes('heavy') || (!query.includes('auto') && !query.includes('carro') && tipoVehiculoActual === 'camion');
        
        if (esParaCamion) {
          matches = RECOMENDACIONES_DB.filter(r => r.category === 'llantas' && r.recommendedFor.toLowerCase().includes('camion'));
          responseText = `De acuerdo al análisis de carga pesada y rutas nacionales, para tu **Camión** te recomiendo neumáticos de alta resistencia estructural con excelente rendimiento por kilómetro. Aquí tienes las mejores opciones evaluadas por TruckSOS:`;
        } else {
          matches = RECOMENDACIONES_DB.filter(r => r.category === 'llantas' && !r.recommendedFor.toLowerCase().includes('camion'));
          responseText = `Para tu **Vehículo Liviano/Auto**, priorizamos el confort de marcha, la respuesta de frenado en mojado y la durabilidad urbana. Te sugiero estas opciones de primer nivel:`;
        }
      } 
      // Detección de batería
      else if (query.includes('bateria') || query.includes('acumulador') || query.includes('pila') || query.includes('battery')) {
        const esParaCamion = query.includes('camion') || (!query.includes('auto') && !query.includes('carro') && tipoVehiculoActual === 'camion');
        
        if (esParaCamion) {
          matches = RECOMENDACIONES_DB.filter(r => r.category === 'bateria' && r.recommendedFor.toLowerCase().includes('camion'));
          responseText = `Los motores diésel de camiones requieren un alto amperaje de arranque en frío (CCA) y una carcasa ultra resistente a vibraciones continuas. Estas son las mejores opciones de baterías pesadas:`;
        } else {
          matches = RECOMENDACIONES_DB.filter(r => r.category === 'bateria' && !r.recommendedFor.toLowerCase().includes('camion'));
          responseText = `Para automóviles y camionetas de uso urbano/comercial, es vital contar con rejillas anticorrosión y buena tolerancia a arranques frecuentes. Estas son mis recomendaciones para ti:`;
        }
      }
      // Detección de aceite / lubricante / motor
      else if (query.includes('aceite') || query.includes('lubricante') || query.includes('motor') || query.includes('oil')) {
        matches = RECOMENDACIONES_DB.filter(r => r.category === 'mecanico' && (r.model.includes('Synthetic') || r.brand === 'Mobil 1'));
        responseText = `El cuidado del motor es fundamental. Te recomiendo utilizar aceites multigrado totalmente sintéticos para una mayor protección térmica y reducción de fricción:`;
      }
      // Detección de frenos
      else if (query.includes('freno') || query.includes('pastilla') || query.includes('disco') || query.includes('brake')) {
        matches = RECOMENDACIONES_DB.filter(r => r.category === 'mecanico' && r.brand === 'Brembo');
        responseText = `La seguridad de frenado es crucial. Te recomiendo pastillas cerámicas que reducen el ruido y aumentan el agarre térmico:`;
      }
      // Diagnóstico genérico o no arranca
      else if (query.includes('no arranca') || query.includes('falla') || query.includes('ruido') || query.includes('humo') || query.includes('calienta')) {
        responseText = `Entendido. Basado en los síntomas descritos, podría tratarse de una falla en el **sistema eléctrico (batería descuidada o alternador)** o en el **sistema de combustión**. 

Te aconsejo reportar una solicitud de **"Mecánico"** o **"Batería"** en la aplicación para que un especialista realice un diagnóstico físico con escáner. Mientras tanto:
1. Revisa si el tablero enciende luces al girar la llave (problema de batería).
2. Verifica el nivel de refrigerante (sobrecalentamiento).
3. No intentes arrancar el motor repetidamente si hace ruidos metálicos fuertes.`;
      } 
      // Por defecto
      else {
        responseText = `Lo siento, no logré identificar un repuesto o síntoma exacto en tu mensaje. 

Puedo darte recomendaciones precisas si me preguntas sobre:
* **"Llantas recomendadas"**
* **"Baterías recomendadas"**
* **"Cambio de aceite"**
* **"Pastillas de freno"**
* **"Mi vehículo no arranca"** (Diagnóstico)`;
      }

      setMessages(prev => [
        ...prev,
        {
          id: Date.now().toString(),
          sender: 'ai',
          text: responseText,
          recommendations: matches.length > 0 ? matches : undefined
        }
      ]);
      setIsTyping(false);
    }, 1500);
  };

  const handleSend = () => {
    if (!inputText.trim()) return;

    const userMsg = inputText;
    setMessages(prev => [
      ...prev,
      {
        id: Date.now().toString(),
        sender: 'user',
        text: userMsg
      }
    ]);
    setInputText('');
    procesarMensajeIA(userMsg);
  };

  const handleQuickAction = (text: string) => {
    setMessages(prev => [
      ...prev,
      {
        id: Date.now().toString(),
        sender: 'user',
        text: text
      }
    ]);
    procesarMensajeIA(text);
  };

  return (
    <div className="flex flex-col h-full w-full bg-neutral-900 border border-neutral-800 rounded-t-3xl sm:rounded-3xl overflow-hidden shadow-2xl relative">
      
      {/* Header */}
      <div className="bg-gradient-to-r from-orange-600 to-amber-600 p-5 flex items-center justify-between text-white shadow-md">
        <div className="flex items-center gap-3">
          <div className="bg-white/10 p-2 rounded-xl backdrop-blur-sm animate-pulse">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="font-black italic uppercase tracking-wider text-sm flex items-center gap-1.5">
              TruckSOS AI <span className="bg-white text-orange-600 text-[8px] font-extrabold px-1.5 py-0.5 rounded-full uppercase tracking-normal">Beta</span>
            </h3>
            <p className="text-[10px] text-orange-100 font-bold uppercase italic">Recomendador Inteligente de Repuestos</p>
          </div>
        </div>
        <button 
          onClick={onClose}
          className="p-2 hover:bg-white/10 rounded-xl transition-all"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Message History */}
      <div className="flex-1 overflow-y-auto p-5 space-y-5 bg-neutral-950/60 custom-scrollbar">
        {messages.map((msg) => {
          const isAI = msg.sender === 'ai';
          return (
            <div key={msg.id} className={`flex gap-3 ${isAI ? 'justify-start' : 'justify-end animate-in fade-in slide-in-from-right-4 duration-300'}`}>
              
              {isAI && (
                <div className="w-8 h-8 rounded-xl bg-orange-600/10 border border-orange-500/20 flex items-center justify-center shrink-0">
                  <Bot className="w-4 h-4 text-orange-500" />
                </div>
              )}

              <div className="max-w-[85%] space-y-4">
                <div className={`p-4 rounded-2xl text-xs leading-relaxed ${
                  isAI 
                    ? 'bg-neutral-900 border border-neutral-800 text-neutral-200' 
                    : 'bg-orange-600 text-white font-medium rounded-tr-none'
                }`}>
                  <p className="whitespace-pre-line">{msg.text}</p>
                </div>

                {/* Recommendations Grid */}
                {isAI && msg.recommendations && (
                  <div className="grid grid-cols-1 gap-4 mt-2 max-w-full">
                    {msg.recommendations.map((rec, index) => (
                      <div 
                        key={index} 
                        className="bg-neutral-900 border border-neutral-800 hover:border-orange-500/40 rounded-2xl p-4 transition-all duration-300 shadow-lg flex flex-col justify-between"
                      >
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-[9px] bg-orange-500/10 text-orange-500 border border-orange-500/20 font-black uppercase tracking-wider px-2 py-0.5 rounded-md">
                              {rec.brand}
                            </span>
                            <div className="flex items-center gap-1 text-[10px] text-yellow-500 font-black">
                              <Star className="w-3 h-3 fill-yellow-500" /> {rec.rating.toFixed(1)}
                            </div>
                          </div>

                          <h4 className="text-white font-black italic uppercase text-xs mb-1">{rec.model}</h4>
                          <p className="text-[10px] text-neutral-400 font-medium mb-3 leading-relaxed">{rec.description}</p>

                          <div className="border-t border-neutral-800/80 pt-3 mb-3 space-y-1.5">
                            <div className="flex items-center gap-1.5">
                              <Shield className="w-3.5 h-3.5 text-green-500 shrink-0" />
                              <span className="text-[9px] text-neutral-300 font-bold">Uso: {rec.recommendedFor}</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                              <Wrench className="w-3.5 h-3.5 text-orange-500 shrink-0" />
                              <div className="text-[9px] text-neutral-300 font-bold flex flex-wrap gap-1">
                                Beneficios: {rec.benefits.slice(0, 2).join(' • ')}
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="bg-neutral-950/80 p-3 rounded-xl flex items-center justify-between gap-2 border border-neutral-850">
                          <div>
                            <p className="text-[8px] text-neutral-500 uppercase font-black tracking-widest leading-none mb-0.5">Precio Ref.</p>
                            <p className="text-xs font-black text-white italic">{rec.priceEstimate}</p>
                          </div>
                          <button
                            onClick={() => onApplyRecommendation(
                              rec.category, 
                              `RECOMENDACIÓN IA (${rec.brand} ${rec.model}): Necesito este repuesto específico o equivalente. Detalle: ${rec.description}.`
                            )}
                            className="bg-orange-600 hover:bg-orange-700 text-white px-3 py-2 rounded-lg font-black text-[9px] uppercase italic tracking-wider flex items-center gap-1 transition-all"
                          >
                            Copiar al SOS <ArrowRight className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {!isAI && (
                <div className="w-8 h-8 rounded-xl bg-orange-600 flex items-center justify-center shrink-0">
                  <User className="w-4 h-4 text-white" />
                </div>
              )}

            </div>
          );
        })}

        {isTyping && (
          <div className="flex gap-3 justify-start items-center">
            <div className="w-8 h-8 rounded-xl bg-orange-600/10 border border-orange-500/20 flex items-center justify-center shrink-0">
              <Bot className="w-4 h-4 text-orange-500 animate-bounce" />
            </div>
            <div className="bg-neutral-900 border border-neutral-800 text-neutral-400 p-4 rounded-2xl text-xs flex items-center gap-1.5">
              <span>TruckSOS IA está pensando</span>
              <span className="flex gap-0.5 items-center">
                <span className="w-1.5 h-1.5 bg-neutral-500 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                <span className="w-1.5 h-1.5 bg-neutral-500 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                <span className="w-1.5 h-1.5 bg-neutral-500 rounded-full animate-bounce"></span>
              </span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Quick Action Suggestions */}
      {messages.length === 1 && !isTyping && (
        <div className="p-4 bg-neutral-950 border-t border-neutral-900 space-y-2">
          <p className="text-[8px] font-black uppercase text-neutral-500 tracking-wider mb-2">Preguntas sugeridas:</p>
          <div className="flex flex-wrap gap-2">
            <button 
              onClick={() => handleQuickAction('Recomiéndame llantas para mi vehículo')}
              className="bg-neutral-900 hover:bg-neutral-850 text-neutral-300 px-3 py-1.5 rounded-lg border border-neutral-800 text-[10px] font-bold text-left transition-all"
            >
              🔍 ¿Qué llantas me recomiendas?
            </button>
            <button 
              onClick={() => handleQuickAction('¿Qué batería debería comprar?')}
              className="bg-neutral-900 hover:bg-neutral-850 text-neutral-300 px-3 py-1.5 rounded-lg border border-neutral-800 text-[10px] font-bold text-left transition-all"
            >
              🔋 Recomiéndame una batería
            </button>
            <button 
              onClick={() => handleQuickAction('Mi vehículo tiene un problema y no arranca')}
              className="bg-neutral-900 hover:bg-neutral-850 text-neutral-300 px-3 py-1.5 rounded-lg border border-neutral-800 text-[10px] font-bold text-left transition-all"
            >
              🔧 Diagnóstico: No arranca
            </button>
          </div>
        </div>
      )}

      {/* Input Form */}
      <div className="p-4 bg-neutral-900 border-t border-neutral-800 flex gap-2">
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          placeholder="Pregúntale a la IA sobre llantas, baterías..."
          className="flex-1 bg-neutral-950 text-white border border-neutral-800 rounded-xl px-4 py-3 text-xs outline-none focus:border-orange-500 transition-all font-medium"
        />
        <button
          onClick={handleSend}
          className="bg-orange-600 hover:bg-orange-700 text-white p-3 rounded-xl shadow-lg transition-all"
        >
          <Send className="w-4 h-4" />
        </button>
      </div>

    </div>
  );
}
