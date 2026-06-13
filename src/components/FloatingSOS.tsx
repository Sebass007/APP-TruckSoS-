'use client';

import React, { useState, useEffect } from 'react';
import { AlertTriangle, Phone } from 'lucide-react';
import Link from 'next/link';

const FloatingSOS = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 500) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className={`fixed bottom-8 left-8 right-8 md:left-auto md:w-auto z-[100] transition-all duration-500 transform ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-20 opacity-0 pointer-events-none'}`}>
      <Link 
        href="/registro"
        className="flex items-center gap-4 bg-red-600 hover:bg-red-700 text-white p-4 md:px-8 md:py-5 rounded-2xl shadow-[0_0_30px_rgba(220,38,38,0.5)] group animate-pulse hover:animate-none transition-all"
      >
        <div className="bg-white/20 p-2 rounded-xl">
          <AlertTriangle className="w-6 h-6 text-white" />
        </div>
        <div className="flex flex-col">
          <span className="text-[10px] font-black uppercase tracking-widest italic opacity-80">Auxilio Inmediato</span>
          <span className="text-xl font-black italic uppercase">PEDIR SOS YA</span>
        </div>
      </Link>
    </div>
  );
};

export default FloatingSOS;
