'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Truck, LogIn, UserPlus, User, LayoutDashboard } from 'lucide-react';
import { supabase } from '@/lib/supabase';

const Navbar = () => {
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  return (
    <nav className="fixed top-0 w-full z-50 bg-neutral-950/80 backdrop-blur-md border-b border-neutral-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link href="/" className="flex items-center gap-2">
            <Truck className="w-8 h-8 text-orange-500" />
            <span className="text-xl font-black tracking-tighter text-white">
              TRUCK<span className="text-orange-500 italic">SOS</span>
            </span>
          </Link>
          
          <div className="flex items-center gap-4 text-sm font-bold">
            {user ? (
              <div className="flex items-center gap-4">
                <Link href="/cliente" className="flex items-center gap-2 text-neutral-300 hover:text-white transition-colors">
                  <LayoutDashboard className="w-4 h-4" />
                  MI PANEL
                </Link>
                <div className="w-8 h-8 bg-orange-600 rounded-full flex items-center justify-center text-white border border-orange-500">
                  <User className="w-4 h-4" />
                </div>
              </div>
            ) : (
              <>
                <Link href="/login" className="flex items-center gap-2 text-neutral-300 hover:text-white transition-colors">
                  <LogIn className="w-4 h-4" />
                  INICIAR SESIÓN
                </Link>
                <Link href="/registro" className="bg-orange-600 text-white px-4 py-2 rounded-md flex items-center gap-2 hover:bg-orange-700 transition-all shadow-lg shadow-orange-600/20">
                  <UserPlus className="w-4 h-4" />
                  REGISTRARSE
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
