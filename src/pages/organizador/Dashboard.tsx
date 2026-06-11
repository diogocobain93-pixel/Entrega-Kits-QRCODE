import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { api } from '@/lib/api';
import { 
  Users, 
  PackageCheck, 
  Package2, 
  Clock, 
  History, 
  Loader2, 
  Activity,
  ArrowUpRight
} from 'lucide-react';
import { motion } from 'motion/react';

export default function OrganizadorDashboard() {
  const { user } = useAuth();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

  const [error, setError] = useState<string | null>(null);

  const fetchStats = async () => {
    try {
      setError(null);
      const stats = await api.getDashboardStats();
      setData(stats);
      setLastUpdate(new Date());
    } catch (error: any) {
      console.error('Falha ao carregar estatísticas:', error);
      setError(error.message || 'Erro ao carregar dados');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
    const interval = setInterval(fetchStats, 10000); // 10s auto refresh
    return () => clearInterval(interval);
  }, []);

  if (loading && !data) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <Loader2 className="w-10 h-10 animate-spin text-indigo-600" />
      </div>
    );
  }

  const { stats, activeRequests, recentDeliveries } = data || { 
    stats: { totalInscritos: 0, totalEntregues: 0, totalPendentes: 0 },
    activeRequests: [],
    recentDeliveries: []
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
           <div className="flex items-center gap-2 text-indigo-600 font-black uppercase tracking-[0.2em] text-xs mb-2">
             <Activity size={14} className="animate-pulse" /> Operação Live
           </div>
           <h1 className="text-2xl md:text-4xl font-black tracking-tighter text-slate-900 uppercase leading-none">
            Visão geral do seu evento em tempo real
           </h1>
           <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px] md:text-xs mt-2 flex flex-wrap items-center gap-2">
             Monitorando performance de entrega <span className="hidden md:inline">•</span> <span>Atualizado às {lastUpdate.toLocaleTimeString('pt-BR')}</span>
           </p>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border-2 border-red-100 text-red-600 rounded-3xl font-bold uppercase tracking-widest text-xs animate-in slide-in-from-top-2">
          ⚠️ {error}
        </div>
      )}

      {/* Main Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
        <motion.div 
          whileHover={{ y: -5 }}
          className="bg-white p-6 md:p-8 rounded-[2rem] md:rounded-[2.5rem] border-2 border-slate-100 shadow-xl shadow-slate-100/50 flex flex-col justify-between"
        >
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 md:p-4 bg-blue-50 text-blue-600 rounded-2xl md:rounded-3xl">
              <Users size={24} className="md:w-8 md:h-8" />
            </div>
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-300">Total de inscritos</span>
          </div>
          <div>
            <p className="text-4xl md:text-6xl font-black text-slate-900 tracking-tighter">{stats.totalInscritos}</p>
            <p className="text-[10px] md:text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Atletas confirmados</p>
          </div>
        </motion.div>

        <motion.div 
          whileHover={{ y: -5 }}
          className="bg-white p-6 md:p-8 rounded-[2rem] md:rounded-[2.5rem] border-2 border-emerald-100 shadow-xl shadow-emerald-100/50 flex flex-col justify-between"
        >
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 md:p-4 bg-emerald-50 text-emerald-600 rounded-2xl md:rounded-3xl">
              <PackageCheck size={24} className="md:w-8 md:h-8" />
            </div>
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-300">Kits entregues</span>
          </div>
          <div>
            <p className="text-4xl md:text-6xl font-black text-emerald-600 tracking-tighter">{stats.totalEntregues}</p>
            <p className="text-[10px] md:text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Entregas concluídas</p>
          </div>
        </motion.div>

        <motion.div 
          whileHover={{ y: -5 }}
          className="bg-white p-6 md:p-8 rounded-[2rem] md:rounded-[2.5rem] border-2 border-amber-100 shadow-xl shadow-amber-100/50 flex flex-col justify-between"
        >
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 md:p-4 bg-amber-50 text-amber-600 rounded-2xl md:rounded-3xl">
              <Package2 size={24} className="md:w-8 md:h-8" />
            </div>
            <span className="text-[10px) font-black uppercase tracking-widest text-slate-300">Kits pendentes</span>
          </div>
          <div>
            <p className="text-4xl md:text-6xl font-black text-amber-600 tracking-tighter">{stats.totalPendentes}</p>
            <p className="text-[10px] md:text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Aguardando retirada</p>
          </div>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8">
        
        {/* Active Requests List */}
        <div className="bg-white rounded-[2rem] md:rounded-[2.5rem] border-2 border-slate-100 shadow-xl shadow-slate-100/50 overflow-hidden flex flex-col">
          <div className="p-6 md:p-8 border-b border-slate-50 flex items-center justify-between gap-2">
            <div className="flex items-center gap-3 md:gap-4">
               <div className="w-10 h-10 md:w-12 md:h-12 bg-indigo-600 text-white rounded-xl md:rounded-2xl flex items-center justify-center">
                 <Clock size={20} className="md:w-6 md:h-6" />
               </div>
               <h3 className="text-base md:text-xl font-black text-slate-900 uppercase tracking-tight">Solicitações Pendentes (Totem)</h3>
            </div>
            <div className="flex-shrink-0 flex items-center gap-1 text-emerald-600 bg-emerald-50 px-2 md:px-3 py-1 rounded-full border border-emerald-100">
               <div className="w-1.5 h-1.5 md:w-2 md:h-2 bg-emerald-500 rounded-full animate-pulse" />
               <span className="text-[8px] md:text-[10px] font-black uppercase tracking-widest">Live</span>
            </div>
          </div>
          <div className="flex-1 p-6 md:p-8 overflow-y-auto max-h-[300px] md:max-h-[400px] space-y-3 md:space-y-4">
            {activeRequests.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center opacity-30 py-8 md:py-12">
                 <Clock size={32} className="md:w-12 md:h-12 mb-4" />
                 <p className="text-[10px] md:text-xs font-black uppercase tracking-widest">Nenhuma solicitação no momento</p>
              </div>
            ) : (
              activeRequests.map((req: any) => (
                <div key={req.id} className="flex items-center justify-between p-4 md:p-6 bg-slate-50 rounded-2xl md:rounded-3xl border border-slate-100 group hover:border-indigo-200 transition-colors">
                  <div className="flex flex-col min-w-0 pr-2">
                    <span className="text-sm md:text-lg font-black text-slate-900 uppercase truncate">{req.participant.nome}</span>
                    <span className="text-[8px] md:text-xs font-bold text-slate-400 uppercase tracking-widest truncate">{req.event.nome}</span>
                  </div>
                  <div className={`flex-shrink-0 px-2 md:px-4 py-1 md:py-1.5 rounded-lg md:rounded-xl text-[8px] md:text-[10px] font-black uppercase tracking-widest border ${
                    req.status === 'EM_SEPARACAO' 
                      ? 'bg-emerald-600 text-white border-emerald-700' 
                      : 'bg-amber-100 text-amber-700 border-amber-200'
                  }`}>
                    {req.status === 'EM_SEPARACAO' ? 'Separando' : 'Pendente'}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Recent Deliveries List */}
        <div className="bg-white rounded-[2rem] md:rounded-[2.5rem] border-2 border-slate-100 shadow-xl shadow-slate-100/50 overflow-hidden flex flex-col">
          <div className="p-6 md:p-8 border-b border-slate-50 flex items-center gap-3 md:gap-4">
             <div className="w-10 h-10 md:w-12 md:h-12 bg-slate-900 text-white rounded-xl md:rounded-2xl flex items-center justify-center">
               <History size={20} className="md:w-6 md:h-6" />
             </div>
             <h3 className="text-base md:text-xl font-black text-slate-900 uppercase tracking-tight">Retiradas Recentes</h3>
          </div>
          <div className="flex-1 p-6 md:p-8 overflow-y-auto max-h-[300px] md:max-h-[400px] space-y-3 md:space-y-4">
            {recentDeliveries.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center opacity-30 py-8 md:py-12">
                 <PackageCheck size={32} className="md:w-12 md:h-12 mb-4" />
                 <p className="text-[10px] md:text-xs font-black uppercase tracking-widest">Nenhuma retirada registrada</p>
              </div>
            ) : (
              recentDeliveries.map((delivery: any) => (
                <div key={delivery.id} className="flex items-center justify-between p-4 md:p-6 bg-slate-50 rounded-2xl md:rounded-3xl border border-slate-100 hover:bg-white transition-all shadow-hover-sm">
                  <div className="flex items-center gap-3 md:gap-4 min-w-0">
                    <div className="flex-shrink-0 w-8 h-8 md:w-10 md:h-10 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center">
                       <ArrowUpRight size={16} className="md:w-5 md:h-5" />
                    </div>
                    <div className="flex flex-col min-w-0">
                      <span className="text-sm md:text-lg font-black text-slate-900 uppercase truncate">{delivery.nome}</span>
                      <span className="text-[8px] md:text-xs font-bold text-slate-400 capitalize truncate">
                        {new Date(delivery.entregueAt).toLocaleString('pt-BR')}
                      </span>
                    </div>
                  </div>
                  <div className="flex-shrink-0 w-6 h-6 md:w-8 md:h-8 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center">
                    <PackageCheck size={12} className="md:w-4 md:h-4" />
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
