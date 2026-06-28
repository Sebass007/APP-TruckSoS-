'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Truck, Users, Activity, ShieldAlert, BarChart3, Search, MoreVertical, Ban, CheckCircle, LogOut, MapPin, Radio } from 'lucide-react';
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
    const { data: solList } = await supabase.from('solicitudes').select('*, usuarios(nombre)');

    if (userList) setUsuarios(userList);
    if (solList) {
      setSolicitudes(solList);
      setStats({
        usuarios: userList?.length || 0,
        servicios: solList.length,
        pendientes: solList.filter(s => s.estado === 'pendiente').length,
        ingresos: solList.filter(s => s.estado === 'completada').reduce((acc, curr) => acc + (parseFloat(curr.monto_pactado) || 50), 0)
      });
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

  if (loading) return <DashboardSkeleton />;

  return (
    <div className="min-h-screen bg-neutral-950 text-white flex">
      {/* Mini Sidebar */}
      <div className="w-20 bg-neutral-900 border-r border-neutral-800 flex flex-col items-center py-8 gap-10 shrink-0">
        <Truck className="w-8 h-8 text-orange-500" />
        <div className="flex flex-col gap-6 w-full items-center">
          <div className="p-3 bg-orange-600 rounded-2xl text-white cursor-pointer shadow-lg shadow-orange-600/30"><BarChart3 className="w-6 h-6" /></div>
          <div className="p-3 text-neutral-500 hover:text-white cursor-pointer transition-colors"><Users className="w-6 h-6" /></div>
          <div className="p-3 text-neutral-500 hover:text-white cursor-pointer transition-colors"><Activity className="w-6 h-6" /></div>
          <button onClick={handleLogout} className="p-3 text-neutral-500 hover:text-red-500 cursor-pointer mt-auto transition-colors" title="Cerrar Sesión">
            <LogOut className="w-6 h-6" />
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-8 overflow-y-auto custom-scrollbar">
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-10">
          <div>
            <h1 className="text-3xl font-black italic uppercase tracking-tighter">CENTROL LOGÍSTICO <span className="text-orange-500">TRUCKSOS</span></h1>
            <p className="text-neutral-500 text-[10px] font-black uppercase tracking-[0.3em] mt-1 italic">Monitoreo y Control Operativo Avanzado</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 bg-neutral-900 border border-neutral-800 px-4 py-2 rounded-xl text-xs font-bold text-green-400">
              <Radio className="w-4 h-4 text-green-500 animate-pulse" />
              <span>Red Activa Realtime</span>
            </div>
          </div>
        </header>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          <StatCard label="Usuarios en Red" value={stats.usuarios} icon={<Users className="text-blue-500" />} trend="REGISTRADOS" />
          <StatCard label="Alertas de Auxilio" value={stats.servicios} icon={<Activity className="text-orange-500" />} trend="TOTAL" />
          <StatCard label="Emergencias Pendientes" value={stats.pendientes} icon={<ShieldAlert className="text-yellow-500" />} trend="RADAR" />
          <StatCard label="Volumen Económico" value={`S/ ${stats.ingresos.toFixed(2)}`} icon={<BarChart3 className="text-green-500" />} trend="TRANSACCIONAL" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-10">
          {/* Active Services List */}
          <div className="lg:col-span-1 bg-neutral-900 border border-neutral-800 rounded-3xl p-6 shadow-xl">
            <h3 className="font-black italic uppercase text-xs tracking-widest text-white mb-4 flex items-center gap-2">
              <MapPin className="w-4 h-4 text-orange-500" /> Monitoreo Logístico de Emergencias
            </h3>
            <div className="space-y-3 max-h-[400px] overflow-y-auto custom-scrollbar pr-1">
              {solicitudes.length === 0 ? (
                <p className="text-xs text-neutral-500 italic">No hay emergencias registradas</p>
              ) : solicitudes.map((sol) => (
                <div key={sol.id} className="bg-neutral-950 p-4 rounded-2xl border border-neutral-800 flex flex-col gap-2">
                  <div className="flex justify-between items-center">
                    <span className="text-[9px] font-black uppercase text-yellow-500 bg-yellow-500/10 px-2 py-0.5 rounded border border-yellow-500/20">
                      {sol.tipo_servicio}
                    </span>
                    <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded ${
                      sol.estado === 'pendiente' ? 'bg-yellow-500/20 text-yellow-400' :
                      sol.estado === 'aceptada' ? 'bg-blue-500/20 text-blue-400' : 'bg-green-500/20 text-green-400'
                    }`}>
                      {sol.estado}
                    </span>
                  </div>
                  <p className="text-xs font-semibold italic text-neutral-200 line-clamp-2">"{sol.descripcion}"</p>
                  <p className="text-[9px] text-neutral-500 font-bold uppercase">Cliente: {sol.usuarios?.nombre || 'Anónimo'}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Users Table */}
          <div className="lg:col-span-2 bg-neutral-900 border border-neutral-800 rounded-3xl overflow-hidden shadow-2xl">
            <div className="p-6 border-b border-neutral-800 flex justify-between items-center bg-neutral-900/50">
              <h3 className="font-black italic uppercase text-xs tracking-widest text-white">Directorio de Usuarios y Proveedores</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-neutral-950/50 text-neutral-500 text-[9px] font-black uppercase tracking-[0.2em] italic">
                    <th className="px-6 py-4">Usuario</th>
                    <th className="px-6 py-4">Email</th>
                    <th className="px-6 py-4">Rol</th>
                    <th className="px-6 py-4">Registro</th>
                  </tr>
                </thead>
                <tbody className="text-xs font-bold uppercase italic">
                  {usuarios.map((u) => (
                    <tr key={u.id} className="border-b border-neutral-800/60 hover:bg-neutral-950/40 transition-colors">
                      <td className="px-6 py-4 text-white">{u.nombre}</td>
                      <td className="px-6 py-4 text-neutral-400 lowercase not-italic font-medium">{u.email}</td>
                      <td className="px-6 py-4">
                        <span className={`px-2.5 py-1 rounded text-[8px] font-black tracking-wider ${
                          u.tipo === 'admin' ? 'bg-red-500/10 text-red-400 border border-red-500/20' : 
                          u.tipo === 'proveedor' ? 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20' : 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                        }`}>
                          {u.tipo}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-neutral-500 text-[10px]">{new Date(u.created_at).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
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
        <span className="text-[9px] font-black uppercase text-orange-500 bg-orange-500/5 px-2.5 py-1 rounded-full italic">{trend}</span>
      </div>
      <p className="text-neutral-500 text-[10px] font-black uppercase tracking-widest italic">{label}</p>
      <p className="text-2xl font-black mt-1 italic tracking-tighter text-white">{value}</p>
    </div>
  );
}
