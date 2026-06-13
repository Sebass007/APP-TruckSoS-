import React from 'react';
import Navbar from '@/components/Navbar';
import Hero from '@/components/Hero';
import Servicios from '@/components/Servicios';
import ComoFunciona from '@/components/ComoFunciona';
import Footer from '@/components/Footer';

import Testimonios from '@/components/Testimonios';
import FloatingSOS from '@/components/FloatingSOS';

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-neutral-950 text-neutral-100 selection:bg-orange-500 selection:text-white">
      <Navbar />
      <Hero />
      <Servicios />
      <ComoFunciona />
      <Testimonios />
      <FloatingSOS />
      
      {/* Testimonials or Partners could go here */}
      <section className="py-20 border-t border-neutral-900 bg-neutral-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-neutral-500 font-bold uppercase tracking-[0.3em] text-xs mb-12 italic">Aliados Estratégicos y Flotas</h2>
          <div className="flex flex-wrap justify-center items-center gap-12 opacity-30 grayscale hover:grayscale-0 hover:opacity-100 transition-all duration-700">
            <div className="text-2xl font-black italic">MINERA YURA</div>
            <div className="text-2xl font-black italic">CERRO VERDE</div>
            <div className="text-2xl font-black italic">TRAMARSA</div>
            <div className="text-2xl font-black italic">VOLVO PERÚ</div>
            <div className="text-2xl font-black italic">CATERPILLAR</div>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
