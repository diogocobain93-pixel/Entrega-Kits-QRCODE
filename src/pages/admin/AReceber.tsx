import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { User } from '@/types';
import { 
  CircleDollarSign, 
  Search, 
  Trash2, 
  CheckCircle2, 
  ArrowRight,
  Filter,
  Calendar,
  Users,
  Trophy
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from '@/components/ui/badge';

interface FinancialEvent {
  id: string;
  nome: string;
  organizadorNome: string;
  atletasImportados: number;
  kitsRetirados: number;
  dataEvento: string;
  pagamentoStatus: 'A_RECEBER' | 'RECEBIDO';
}

export default function AdminAReceber() {
  const [events, setEvents] = useState<FinancialEvent[]>([]);
  const [organizadores, setOrganizadores] = useState<User[]>([]);
  const [selectedOrganizadorId, setSelectedOrganizadorId] = useState<string>('all');
  const [loading, setLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState<string | null>(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [orgsData, eventsData] = await Promise.all([
        api.getOrganizadores(),
        api.getAReceber(selectedOrganizadorId === 'all' ? undefined : selectedOrganizadorId)
      ]);
      setOrganizadores(orgsData);
      setEvents(eventsData);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [selectedOrganizadorId]);

  const handleTogglePayment = async (eventId: string, currentStatus: string) => {
    const newStatus = currentStatus === 'A_RECEBER' ? 'RECEBIDO' : 'A_RECEBER';
    setIsUpdating(eventId);
    try {
      await api.atualizarPagamentoEvento(eventId, newStatus);
      setEvents(prev => prev.map(e => e.id === eventId ? { ...e, pagamentoStatus: newStatus as any } : e));
    } catch (err) {
      alert('Erro ao atualizar status de pagamento');
    } finally {
      setIsUpdating(null);
    }
  };

  const handleDeleteEvent = async (eventId: string) => {
    if (!confirm('Deseja realmente excluir este registro de evento? Esta ação é irreversível.')) return;
    
    try {
      await api.deletarEvento(eventId);
      setEvents(prev => prev.filter(e => e.id !== eventId));
    } catch (err) {
      alert('Erro ao excluir evento');
    }
  };

  const totalA_Receber = events.filter(e => e.pagamentoStatus === 'A_RECEBER').length;
  const totalRecebido = events.filter(e => e.pagamentoStatus === 'RECEBIDO').length;

  return (
    <div className="space-y-8">
      {/* Metrics Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border border-border shadow-sm bg-white">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Eventos A Receber</p>
                <h3 className="text-2xl font-bold text-orange-600 mt-1">{totalA_Receber}</h3>
              </div>
              <div className="p-3 bg-orange-50 rounded-xl text-orange-600">
                <CircleDollarSign className="w-6 h-6" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border border-border shadow-sm bg-white">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Eventos Recebidos</p>
                <h3 className="text-2xl font-bold text-green-600 mt-1">{totalRecebido}</h3>
              </div>
              <div className="p-3 bg-green-50 rounded-xl text-green-600">
                <CheckCircle2 className="w-6 h-6" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border border-border shadow-sm bg-white">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Total de Atletas</p>
                <h3 className="text-2xl font-bold text-primary mt-1">
                  {events.reduce((acc, curr) => acc + curr.atletasImportados, 0)}
                </h3>
              </div>
              <div className="p-3 bg-primary/10 rounded-xl text-primary">
                <Users className="w-6 h-6" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-border overflow-hidden">
        <div className="p-6 border-b border-border flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h3 className="text-lg font-bold text-foreground">A Receber</h3>
            <p className="text-sm text-muted-foreground">Controle financeiro por organizador e evento</p>
          </div>

          <div className="flex items-center gap-3">
             <div className="flex items-center gap-2">
                <Filter size={16} className="text-muted-foreground" />
                <Select value={selectedOrganizadorId} onValueChange={setSelectedOrganizadorId}>
                  <SelectTrigger className="w-[200px] h-10 border-border bg-secondary/50 focus:bg-white rounded-lg">
                    <SelectValue placeholder="Todos Organizadores" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos Organizadores</SelectItem>
                    {organizadores.map(org => (
                      <SelectItem key={org.id} value={org.id}>{org.nome}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
             </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-secondary/50 border-b border-border">
              <TableRow>
                <TableHead className="px-6 py-4 font-bold uppercase text-xs tracking-wider text-muted-foreground">Evento</TableHead>
                <TableHead className="px-6 py-4 font-bold uppercase text-xs tracking-wider text-muted-foreground">Organizador</TableHead>
                <TableHead className="px-6 py-4 font-bold uppercase text-xs tracking-wider text-muted-foreground text-center">Inscritos</TableHead>
                <TableHead className="px-6 py-4 font-bold uppercase text-xs tracking-wider text-muted-foreground text-center">Retirados</TableHead>
                <TableHead className="px-6 py-4 font-bold uppercase text-xs tracking-wider text-muted-foreground">Data</TableHead>
                <TableHead className="px-6 py-4 font-bold uppercase text-xs tracking-wider text-muted-foreground text-center">Status</TableHead>
                <TableHead className="px-6 py-4 text-right font-bold uppercase text-xs tracking-wider text-muted-foreground">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody className="divide-y divide-border">
              {loading ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-10">
                    <div className="flex flex-col items-center gap-2">
                       <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                       <p className="text-muted-foreground italic text-sm">Carregando dados financeiros...</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : events.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-10">
                    <p className="text-muted-foreground italic">Nenhum registro encontrado para a seleção atual.</p>
                  </TableCell>
                </TableRow>
              ) : events.map((event) => (
                <TableRow key={event.id} className="hover:bg-secondary/30 transition-colors group">
                  <TableCell className="px-6 py-4">
                     <div className="flex flex-col">
                        <span className="font-bold text-foreground flex items-center gap-2">
                           <Trophy size={14} className="text-orange-500" />
                           {event.nome}
                        </span>
                        <span className="text-[10px] text-muted-foreground uppercase font-mono tracking-tighter">{event.id.split('-')[0]}</span>
                     </div>
                  </TableCell>
                  <TableCell className="px-6 py-4 text-muted-foreground text-sm font-medium">
                    {event.organizadorNome}
                  </TableCell>
                  <TableCell className="px-6 py-4 text-center">
                    <Badge variant="secondary" className="font-mono text-xs px-2 py-0.5 rounded-md border border-border">
                      {event.atletasImportados}
                    </Badge>
                  </TableCell>
                  <TableCell className="px-6 py-4 text-center">
                    <Badge className="bg-primary/10 text-primary border-primary/20 font-mono text-xs px-2 py-0.5 rounded-md">
                      {event.kitsRetirados}
                    </Badge>
                  </TableCell>
                  <TableCell className="px-6 py-4 text-muted-foreground text-sm flex items-center gap-2 mt-2">
                    <Calendar size={14} className="text-muted-foreground/50" />
                    {new Date(event.dataEvento).toLocaleDateString('pt-BR')}
                  </TableCell>
                  <TableCell className="px-6 py-4 text-center">
                    {event.pagamentoStatus === 'RECEBIDO' ? (
                       <Button 
                        size="sm" 
                        variant="ghost"
                        className="bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 hover:bg-green-200 dark:hover:bg-green-900/50 h-8 px-4 font-bold rounded-full gap-2 transition-all"
                        onClick={() => handleTogglePayment(event.id, event.pagamentoStatus)}
                        disabled={isUpdating === event.id}
                       >
                         <CheckCircle2 size={14} />
                         Recebido
                       </Button>
                    ) : (
                       <Button 
                        size="sm" 
                        variant="outline"
                        className="border-orange-500 text-orange-600 hover:bg-orange-50 h-8 px-4 font-bold rounded-full gap-2 transition-all"
                        onClick={() => handleTogglePayment(event.id, event.pagamentoStatus)}
                        disabled={isUpdating === event.id}
                       >
                         {isUpdating === event.id ? (
                           <div className="w-3 h-3 border border-orange-500 border-t-transparent rounded-full animate-spin"></div>
                         ) : (
                           <ArrowRight size={14} />
                         )}
                         A Receber
                       </Button>
                    )}
                  </TableCell>
                  <TableCell className="px-6 py-4 text-right">
                     <Button 
                        size="icon" 
                        variant="ghost" 
                        className="text-muted-foreground hover:text-red-500 hover:bg-red-50 transition-colors"
                        onClick={() => handleDeleteEvent(event.id)}
                     >
                        <Trash2 size={18} />
                     </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}
