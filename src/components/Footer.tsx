import React from 'react';
import { Truck, Link as LinkIcon, MessageCircle, Share2 } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-neutral-950 border-t border-neutral-900 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex items-center gap-2">
            <Truck className="w-6 h-6 text-orange-500" />
            <span className="text-xl font-black text-white tracking-tighter uppercase">
              TRUCK<span className="text-orange-500 italic">SOS</span>
            </span>
          </div>
          
          <div className="flex gap-8 text-neutral-500 text-sm font-bold uppercase tracking-widest">
            <a href="#" className="hover:text-orange-500 transition-colors">Términos</a>
            <a href="#" className="hover:text-orange-500 transition-colors">Privacidad</a>
            <a href="#" className="hover:text-orange-500 transition-colors">Soporte</a>
          </div>

          <div className="flex gap-4">
            <a href="#" className="w-10 h-10 bg-neutral-900 rounded-full flex items-center justify-center text-neutral-400 hover:text-white hover:bg-orange-600 transition-all">
              <LinkIcon className="w-5 h-5" />
            </a>
            <a href="#" className="w-10 h-10 bg-neutral-900 rounded-full flex items-center justify-center text-neutral-400 hover:text-white hover:bg-orange-600 transition-all">
              <MessageCircle className="w-5 h-5" />
            </a>
            <a href="#" className="w-10 h-10 bg-neutral-900 rounded-full flex items-center justify-center text-neutral-400 hover:text-white hover:bg-orange-600 transition-all">
              <Share2 className="w-5 h-5" />
            </a>
          </div>
        </div>
        
        <div className="mt-12 text-center text-neutral-600 text-xs">
          © 2026 TruckSOS Perú. El auxilio mecánico líder en Arequipa y carreteras nacionales.
        </div>
      </div>
    </footer>
  );
};

export default Footer;
