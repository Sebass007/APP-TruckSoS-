import React from 'react';
import { Smartphone, CheckCircle2, Navigation } from 'lucide-react';

const steps = [
  {
    icon: <Smartphone className="w-8 h-8" />,
    title: 'Solicita Ayuda',
    desc: 'Indica el problema y tu ubicación desde la app. Sin llamadas, solo un clic.'
  },
  {
    icon: <Navigation className="w-8 h-8" />,
    title: 'Recibe Ofertas',
    desc: 'Mecánicos cercanos te enviarán presupuestos en tiempo real. Tú eliges.'
  },
  {
    icon: <CheckCircle2 className="w-8 h-8" />,
    title: 'Solución Lista',
    desc: 'El experto llega a tu ubicación, repara tu unidad y sigues tu camino.'
  }
];

const ComoFunciona = () => {
  return (
    <section id="como-funciona" className="py-24 bg-neutral-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-20">
          <h2 className="text-4xl font-black text-white mb-4">¿CÓMO FUNCIONA TRUCKSOS?</h2>
          <p className="text-neutral-400 max-w-2xl mx-auto">
            Hemos simplificado el auxilio mecánico para que no pierdas tiempo valioso en la carretera.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          {steps.map((step, i) => (
            <div key={i} className="relative flex flex-col items-center text-center">
              <div className="w-20 h-20 bg-neutral-900 rounded-2xl border border-neutral-800 flex items-center justify-center text-orange-500 mb-8 shadow-xl shadow-orange-500/5">
                {step.icon}
                <div className="absolute -top-2 -right-2 w-8 h-8 bg-orange-600 rounded-full flex items-center justify-center text-white font-black border-4 border-neutral-950">
                  {i + 1}
                </div>
              </div>
              <h4 className="text-xl font-bold text-white mb-4 italic uppercase tracking-tight">{step.title}</h4>
              <p className="text-neutral-400 leading-relaxed">
                {step.desc}
              </p>
              
              {i < steps.length - 1 && (
                <div className="hidden lg:block absolute top-10 left-[70%] w-1/2 h-px bg-gradient-to-r from-orange-500/50 to-transparent"></div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ComoFunciona;
