import React from 'react';
import { Disc, Zap, Activity, Battery, Wrench, HelpCircle } from 'lucide-react';

const servicios = [
  {
    icon: <Disc className="w-10 h-10" />,
    title: 'Pinchadura de Llantas',
    desc: 'Cambio y parchado para todo tipo de vehículos, incluyendo maquinaria pesada.'
  },
  {
    icon: <Zap className="w-10 h-10" />,
    title: 'Sistema Eléctrico',
    desc: 'Diagnóstico y reparación de fallas eléctricas en ruta.'
  },
  {
    icon: <Activity className="w-10 h-10" />,
    title: 'Grúa / Remolque',
    desc: 'Traslado seguro de unidades livianas y pesadas a nivel nacional.'
  },
  {
    icon: <Battery className="w-10 h-10" />,
    title: 'Batería Descargada',
    desc: 'Carga inmediata o venta de baterías nuevas con instalación.'
  },
  {
    icon: <Wrench className="w-10 h-10" />,
    title: 'Mecánico General',
    desc: 'Reparaciones preventivas y correctivas de motor y transmisión.'
  },
  {
    icon: <HelpCircle className="w-10 h-10" />,
    title: 'Otros Problemas',
    desc: 'Detalla tu problema y encontraremos al especialista adecuado.'
  }
];

const Servicios = () => {
  return (
    <section id="servicios" className="py-24 bg-neutral-900/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-16">
          <h2 className="text-orange-500 font-bold tracking-widest text-sm mb-4 uppercase italic">Servicios Disponibles</h2>
          <h3 className="text-4xl md:text-5xl font-black text-white">COBERTURA TOTAL EN RUTA</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {servicios.map((s, i) => (
            <div key={i} className="group bg-neutral-900 border border-neutral-800 p-8 rounded-2xl hover:border-orange-500 transition-all duration-300">
              <div className="text-orange-500 mb-6 group-hover:scale-110 transition-transform">
                {s.icon}
              </div>
              <h4 className="text-xl font-bold text-white mb-3 italic uppercase">{s.title}</h4>
              <p className="text-neutral-400 text-sm leading-relaxed">
                {s.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Servicios;
