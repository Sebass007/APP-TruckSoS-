'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Truck, Users, Activity, ShieldAlert, BarChart3, Search, MoreVertical, Ban, CheckCircle, LogOut } from 'lucide-react';
import { supabase } from '@/lib/supabase';

import { DashboardSkeleton } from '@/components/Skeleton';

export default function AdminDashboard() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    usuarios: 0,
    servicios: 0,
    pendientes: 0,
    ingresos: 0
  });
  const [usuarios, setUsuarios] = useState<any[]>([]);
  const [solicitudes, setSolicitudes] = useState<any[]>([]);

  useEffect(() => {
    checkAdmin();
    fetchData();

    const channel = supabase
      .channel('admin-updates')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'usuarios' }, () => fetchData())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'solicitudes' }, () => fetchData())
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  const checkAdmin = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      router.push('/login');
      return;
    }

    const { data: userData } = await supabase
      .from('usuarios')
      .select('tipo')
      .eq('id', user.id)
      .single();

    if (userData?.tipo !== 'admin') {
      router.push('/login');
      return;
    }
    setLoading(false);
  };

  const fetchData = async () => {
    const { data: userList } = await supabase.from('usuarios').select('*').order('created_at', { ascending: false });
    const { data: solList } = await supabase.from('solicitudes').select('*');

    if (userList) setUsuarios(userList);
    if (solList) {
      setSolicitudes(solList);
      setStats({
        usuarios: userList?.length || 0,
        servicios: solList.length,
        pendientes: solList.filter(s => s.estado === 'pendiente').length,
        ingresos: solList.filter(s => s.estado === 'completada').length * 50 // Simulación
      });
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

  const toggleUserStatus = async (userId: string, currentType: string) => {
    // Simulación de suspensión (en un sistema real usaríamos una columna 'activo')
    alert(`Acción sobre usuario ${userId}: Esta funcionalidad requiere la columna 'activo' en la DB.`);
  };

  if (loading) return <DashboardSkeleton />;

  return (
    <div className="min-h-screen bg-neutral-950 text-white flex">
      {/* Mini Sidebar */}
      <div className="w-20 bg-neutral-900 border-r border-neutral-800 flex flex-col items-center py-8 gap-10">
        <Truck className="w-8 h-8 text-orange-500" />
        <div className="flex flex-col gap-6">
          <div className="p-3 bg-orange-600 rounded-xl text-white cursor-pointer shadow-lg shadow-orange-600/20"><BarChart3 className="w-6 h-6" /></div>
          <div className="p-3 text-neutral-500 hover:text-white cursor-pointer transition-colors"><Users className="w-6 h-6" /></div>
          <div className="p-3 text-neutral-500 hover:text-white cursor-pointer transition-colors"><Activity className="w-6 h-6" /></div>
          <button onClick={handleLogout} className="p-3 text-neutral-500 hover:text-red-500 cursor-pointer mt-auto transition-colors">
            <LogOut className="w-6 h-6" />
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-8 overflow-y-auto">
        <header className="flex justify-between items-center mb-10">
          <div>
            <h1 className="text-3xl font-black italic uppercase tracking-tighter">CONTROL CENTRAL <span className="text-orange-500">ADMIN</span></h1>
            <p className="text-neutral-500 text-[10px] font-black uppercase tracking-[0.3em] mt-1 italic">Gestión de infraestructura TruckSOS</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
              <input 
                type="text" 
                className="bg-neutral-900 border border-neutral-800 rounded-lg py-2 pl-10 pr-4 text-xs focus:outline-none focus:border-orange-500 w-64 font-bold"
                placeholder="BUSCAR EN LA RED..."
              />
            </div>
          </div>
        </header>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          <StatCard label="Usuarios Totales" value={stats.usuarios} icon={<Users className="text-blue-500" />} trend="+ REAL" />
          <StatCard label="Servicios Globales" value={stats.servicios} icon={<Activity className="text-orange-500" />} trend="ACTIVO" />
          <StatCard label="Alertas Pendientes" value={stats.pendientes} icon={<ShieldAlert className="text-yellow-500" />} trend="CRÍTICO" />
          <StatCard label="Estimado Ingresos" value={`S/ ${stats.ingresos}`} icon={<BarChart3 className="text-green-500" />} trend="MENSUAL" />
        </div>

        {/* Users Table */}
        <div className="bg-neutral-900 border border-neutral-800 rounded-3xl overflow-hidden shadow-2xl">
          <div className="p-6 border-b border-neutral-800 flex justify-between items-center bg-neutral-900/50">
            <h3 className="font-black italic uppercase text-xs tracking-widest">Registros en la Base de Datos</h3>
          </div>
          <table className="w-full text-left">
            <thead>
              <tr className="bg-neutral-950/50 text-neutral-500 text-[9px] font-black uppercase tracking-[0.2em] italic">
                <th className="px-6 py-5">Identidad</th>
                <th className="px-6 py-5">Email / Contacto</th>
                <th className="px-6 py-5">Perfil</th>
                <th className="px-6 py-5">Fecha Registro</th>
                <th className="px-6 py-5 text-right">Control</th>
              </tr>
            </thead>
            <tbody className="text-xs font-bold uppercase italic">
              {usuarios.map((user) => (
                <tr key={user.id} className="border-b border-neutral-800 hover:bg-neutral-950/40 transition-colors group">
                  <td className="px-6 py-5">
                    <span className="text-white group-hover:text-orange-500 transition-colors">{user.nombre}</span>
                  </td>
                  <td className="px-6 py-5 text-neutral-500 lowercase not-italic font-medium">{user.email}</td>
                  <td className="px-6 py-5">
                    <span className={`px-2 py-1 rounded text-[8px] font-black tracking-tighter ${
                      user.tipo === 'admin' ? 'bg-red-500/10 text-red-500' : 
                      user.tipo === 'proveedor' ? 'bg-yellow-500/10 text-yellow-500' : 'bg-blue-500/10 text-blue-500'
                    }`}>
                      {user.tipo}
                    </span>
                  </td>
                  <td className="px-6 py-5 text-neutral-600 text-[10px]">{new Date(user.created_at).toLocaleDateString()}</td>
                  <td className="px-6 py-5 text-right">
                    <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => toggleUserStatus(user.id, user.tipo)} className="p-2 text-neutral-500 hover:text-red-500 transition-colors"><Ban className="w-4 h-4" /></button>
                      <button className="p-2 text-neutral-500 hover:text-white transition-colors"><MoreVertical className="w-4 h-4" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value, icon, trend }: any) {
  return (
    <div className="bg-neutral-900 border border-neutral-800 p-6 rounded-3xl hover:border-orange-500/30 transition-all shadow-lg">
      <div className="flex justify-between items-start mb-4">
        <div className="p-3 bg-neutral-950 rounded-2xl border border-neutral-800">{icon}</div>
        <span className="text-[9px] font-black uppercase text-orange-500 bg-orange-500/5 px-2 py-1 rounded-full italic">{trend}</span>
      </div>
      <p className="text-neutral-500 text-[10px] font-black uppercase tracking-widest italic">{label}</p>
      <p className="text-2xl font-black mt-1 italic tracking-tighter text-white">{value}</p>
    </div>
  );
}
