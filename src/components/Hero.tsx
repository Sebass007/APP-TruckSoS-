import React from 'react';
import { AlertTriangle, MapPin } from 'lucide-react';

const Hero = () => {
  return (
    <section className="relative pt-32 pb-20 overflow-hidden bg-neutral-950">
      {/* Glow Effect */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-orange-600/10 blur-[120px] rounded-full -z-10"></div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-neutral-900 border border-neutral-800 text-xs font-semibold text-orange-500 mb-8">
          <MapPin className="w-3 h-3" />
          DISPONIBLE EN AREQUIPA Y RUTAS NACIONALES
        </div>
        
        <h1 className="text-5xl md:text-8xl font-black tracking-tighter text-white mb-6 leading-tight">
          AUXILIO MECÁNICO <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-yellow-500 italic">
            PARA PESADOS Y LIVIANOS
          </span>
        </h1>
        
        <p className="text-lg md:text-xl text-neutral-400 max-w-3xl mx-auto mb-12">
          La red de emergencia más rápida del Perú. Conectamos clientes con mecánicos expertos para camiones mineros, carga pesada y autos particulares en tiempo real.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
          <button className="group relative w-full sm:w-auto px-10 py-6 bg-red-600 hover:bg-red-700 text-white rounded-xl font-black text-2xl transition-all hover:scale-105 shadow-[0_0_50px_rgba(220,38,38,0.4)] flex items-center justify-center gap-4">
            <AlertTriangle className="w-8 h-8 animate-pulse text-yellow-300" />
            ¡PEDIR AUXILIO YA!
          </button>
          
          <div className="flex flex-col items-start gap-1">
            <span className="text-yellow-500 font-bold text-lg italic">¿Eres mecánico?</span>
            <button className="text-white border-b-2 border-orange-500 hover:text-orange-500 transition-colors font-bold uppercase tracking-wider text-sm">
              Regístrate como proveedor
            </button>
          </div>
        </div>

        <div className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-8 border-t border-neutral-900 pt-12">
          <div className="flex flex-col gap-2">
            <span className="text-3xl font-black text-white">500+</span>
            <span className="text-neutral-500 font-bold text-xs uppercase tracking-widest">Proveedores</span>
          </div>
          <div className="flex flex-col gap-2">
            <span className="text-3xl font-black text-white">15min</span>
            <span className="text-neutral-500 font-bold text-xs uppercase tracking-widest">Llegada Promedio</span>
          </div>
          <div className="flex flex-col gap-2">
            <span className="text-3xl font-black text-white">24/7</span>
            <span className="text-neutral-500 font-bold text-xs uppercase tracking-widest">Disponibilidad</span>
          </div>
          <div className="flex flex-col gap-2">
            <span className="text-3xl font-black text-white">100%</span>
            <span className="text-neutral-500 font-bold text-xs uppercase tracking-widest">Seguro y Garantizado</span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
