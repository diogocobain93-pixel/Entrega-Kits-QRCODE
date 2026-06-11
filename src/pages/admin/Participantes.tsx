import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '@/lib/api';
import { Participant, Event } from '@/types';
import { 
  Users, 
  Search, 
  MapPin, 
  Calendar,
  ChevronLeft,
  Loader2,
  AlertCircle
} from 'lucide-react';
import { Input } from '@/components/ui/input';

export default function AdminParticipantes() {
  const { id } = useParams<{ id: string }>();
  const [event, setEvent] = useState<Event | null>(null);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    fetchData();
  }, [id]);

  const fetchData = async () => {
    if (!id) return;
    setIsLoading(true);
    try {
      const [eventData, participantsData] = await Promise.all([
        api.getEvento(id),
        api.getParticipantes(id)
      ]);
      setEvent(eventData);
      setParticipants(participantsData);
    } catch (err: any) {
      setError(err.message || 'Erro ao carregar dados');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;
    try {
      const results = await api.getParticipantes(id, search);
      setParticipants(results);
    } catch (err: any) {
      setError(err.message || 'Erro na busca');
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <Link to="/admin/eventos" className="flex items-center text-sm text-slate-500 hover:text-indigo-600 mb-2 transition-colors">
          <ChevronLeft className="w-4 h-4 mr-1" />
          Voltar para Eventos
        </Link>
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-3">
              <Users className="w-8 h-8 text-indigo-600" />
              Visualização de Participantes
            </h1>
            <p className="text-slate-500 mt-1">Evento: {event?.nome}</p>
          </div>
          <div className="text-right text-xs text-slate-400 font-mono">
            MODO: APENAS LEITURA (ADMIN)
          </div>
        </div>
        <div className="flex items-center gap-4 mt-1 text-sm text-slate-500">
           <span className="flex items-center gap-1"><MapPin className="w-4 h-4" /> {event?.local}</span>
           <span className="flex items-center gap-1"><Calendar className="w-4 h-4" /> {event && new Date(event.dataEvento).toLocaleDateString()}</span>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl flex items-center gap-3">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <p className="text-sm font-medium">{error}</p>
        </div>
      )}

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden border-t-4 border-t-amber-500">
        <div className="p-4 border-b border-slate-200">
          <form onSubmit={handleSearch} className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input 
              placeholder="Buscar na lista de participantes..." 
              className="pl-10 h-10 border-slate-200 focus-visible:ring-indigo-600"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </form>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Nº / Peito</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Participante</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">CPF</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Equipe / Cidade</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Modalidade / Kit</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {participants.length > 0 ? (
                participants.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50/50 transition-colors text-sm">
                    <td className="px-6 py-4">
                      <div className="font-bold text-indigo-600">{p.numero || '-'}</div>
                      <div className="text-xs text-slate-400">Peito: {p.numeroPeito || '-'}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-medium text-slate-900">{p.nome}</div>
                      <div className="text-xs text-slate-400">{p.sexo} | {p.tamanhoCamiseta}</div>
                    </td>
                    <td className="px-6 py-4 text-slate-600 font-mono text-xs">
                      {p.cpf}
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-slate-600">{p.equipe || '-'}</div>
                      <div className="text-xs text-slate-400">{p.cidade || '-'}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-slate-600 font-medium">{p.modalidade || '-'}</div>
                      <div className="text-xs text-slate-400">Kit: {p.kit || '-'}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        p.status === 'ENTREGUE' 
                          ? 'bg-emerald-100 text-emerald-800' 
                          : 'bg-indigo-100 text-indigo-800'
                      }`}>
                        {p.status}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-500">
                    Nenhum participante encontrado neste evento.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
