import React from 'react';
import { Star, Quote } from 'lucide-react';

const testimonios = [
  {
    name: 'Ricardo Mendoza',
    role: 'Transportista Pesado',
    content: 'Me quedé sin frenos en la bajada de Imata a las 3 AM. Gracias a TruckSOS conseguí un mecánico en 20 minutos. Salvaron mi carga y mi vida.',
    rating: 5
  },
  {
    name: 'Elena Quispe',
    role: 'Conductora Particular',
    content: 'Excelente servicio. El llantero llegó súper rápido y el precio fue justo. Muy segura la plataforma.',
    rating: 5
  },
  {
    name: 'Carlos Benavente',
    role: 'Mecánico Industrial',
    content: 'Como proveedor, esta app me ha permitido duplicar mis servicios. La geolocalización es muy precisa.',
    rating: 5
  }
];

const Testimonios = () => {
  return (
    <section className="py-24 bg-neutral-900/10 border-t border-neutral-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-black text-white italic uppercase tracking-tighter">LO QUE DICEN NUESTROS <span className="text-orange-500">HEROES DE RUTA</span></h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonios.map((t, i) => (
            <div key={i} className="bg-neutral-900 border border-neutral-800 p-8 rounded-3xl relative">
              <Quote className="absolute top-6 right-6 w-10 h-10 text-orange-600/20" />
              <div className="flex gap-1 mb-4">
                {[...Array(t.rating)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-orange-500 text-orange-500" />
                ))}
              </div>
              <p className="text-neutral-300 text-sm italic font-medium leading-relaxed mb-6">"{t.content}"</p>
              <div>
                <p className="text-white font-black uppercase text-xs tracking-widest italic">{t.name}</p>
                <p className="text-neutral-500 text-[10px] font-bold uppercase mt-1">{t.role}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Testimonios;
