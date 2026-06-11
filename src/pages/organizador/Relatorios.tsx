import React, { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { Participant, Event } from '@/types';
import { 
  FileText, 
  Search, 
  Trash2, 
  CheckCircle2, 
  XCircle,
  AlertTriangle,
  Loader2,
  Filter,
  Download,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { motion, AnimatePresence } from 'motion/react';

export default function RelatoriosPage() {
  const [participants, setParticipants] = useState<(Participant & { eventName?: string })[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedEventId, setSelectedEventId] = useState<string>('all');
  const [participantToDelete, setParticipantToDelete] = useState<Participant | null>(null);
  const [deleteConfirmName, setDeleteConfirmName] = useState('');
  const [isActionLoading, setIsActionLoading] = useState(false);
  
  // Export states
  const [isExportDialogOpen, setIsExportDialogOpen] = useState(false);
  const [exportEventId, setExportEventId] = useState<string>('');
  const [isExporting, setIsExporting] = useState(false);
  
  // Pagination state
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const limit = 25;

  useEffect(() => {
    fetchEvents();
  }, []);

  useEffect(() => {
    // Reset to page 1 on search or filter change
    setPage(1);
  }, [search, selectedEventId]);

  useEffect(() => {
    fetchParticipants();
  }, [page, search, selectedEventId]);

  const fetchEvents = async () => {
    try {
      const eventsList = await api.getEventos();
      setEvents(eventsList);
    } catch (err) {
      console.error('Erro ao carregar eventos:', err);
    }
  };

  const fetchParticipants = async () => {
    setLoading(true);
    try {
      const data = await api.getParticipantesPaginado({
        page,
        limit,
        search,
        eventId: selectedEventId
      });
      setParticipants(data.participants);
      setTotalPages(data.pages);
      setTotalItems(data.total);
    } catch (err) {
      console.error('Erro ao carregar participantes:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async (participant: Participant) => {
    const newStatus = participant.status === 'ENTREGUE' ? 'INSCRITO' : 'ENTREGUE';
    try {
      await api.atualizarStatusParticipante(participant.id, newStatus);
      setParticipants(prev => prev.map(p => 
        p.id === participant.id ? { ...p, status: newStatus } : p
      ));
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleDelete = async () => {
    if (!participantToDelete) return;
    setIsActionLoading(true);
    try {
      await api.deletarParticipante(participantToDelete.id);
      setParticipants(prev => prev.filter(p => p.id !== participantToDelete.id));
      setTotalItems(prev => prev - 1);
      setParticipantToDelete(null);
      setDeleteConfirmName('');
    } catch (err: any) {
      alert(err.message);
    } finally {
      setIsActionLoading(false);
    }
  };
  
  const handleOpenExportDialog = () => {
    if (selectedEventId !== 'all') {
      setExportEventId(selectedEventId);
    } else if (events.length > 0) {
      setExportEventId(events[0].id);
    } else {
      setExportEventId('');
    }
    setIsExportDialogOpen(true);
  };

  const handleConfirmExport = async () => {
    if (!exportEventId) return;
    setIsExporting(true);
    try {
      const participantsToExport = await api.getParticipantes(exportEventId);
      
      if (participantsToExport.length === 0) {
        alert('Este evento não possui participantes para exportação.');
        setIsExporting(false);
        return;
      }

      const headers = [
        'numero',
        'chip',
        'nome',
        'sexo',
        'equipe',
        'cidade',
        'data_nascimento',
        'cpf',
        'modalidade',
        'kit',
        'tamanho_camiseta',
        'numero_peito',
        'entregue',
        'hora_entrega',
        'solicitou_retirada',
        'solicitou_retirada_at',
        'em_entrega'
      ];

      const escapeCSV = (val: any) => {
        if (val === null || val === undefined) return '';
        const str = String(val);
        if (str.includes(',') || str.includes('"') || str.includes('\n')) {
          return `"${str.replace(/"/g, '""')}"`;
        }
        return str;
      };

      const rows = participantsToExport.map(p => {
        const hasDelivery = p.deliveryRequests && p.deliveryRequests.length > 0;
        const deliveryStatus = hasDelivery ? p.deliveryRequests[0].status : null;
        const deliveryCreatedAt = hasDelivery ? p.deliveryRequests[0].createdAt : null;

        return [
          escapeCSV(p.numero),
          escapeCSV(p.chip),
          escapeCSV(p.nome),
          escapeCSV(p.sexo),
          escapeCSV(p.equipe),
          escapeCSV(p.cidade),
          escapeCSV(p.dataNascimento),
          escapeCSV(p.cpf),
          escapeCSV(p.modalidade),
          escapeCSV(p.kit),
          escapeCSV(p.tamanhoCamiseta),
          escapeCSV(p.numeroPeito),
          escapeCSV(p.status === 'ENTREGUE' ? 'SIM' : 'NÃO'),
          escapeCSV(p.status === 'ENTREGUE' && p.entregueAt ? new Date(p.entregueAt).toLocaleString('pt-BR') : ''),
          escapeCSV(hasDelivery ? 'SIM' : 'NÃO'),
          escapeCSV(deliveryCreatedAt ? new Date(deliveryCreatedAt).toLocaleString('pt-BR') : ''),
          escapeCSV(deliveryStatus === 'EM_SEPARACAO' ? 'SIM' : 'NÃO')
        ];
      });

      const csvContent = [
        headers.join(','),
        ...rows.map(r => r.join(','))
      ].join('\n');

      const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');

      const selectedEvent = events.find(e => e.id === exportEventId);
      const eventName = selectedEvent ? selectedEvent.nome.toLowerCase().replace(/\s+/g, '-') : 'evento';

      link.setAttribute('href', url);
      link.setAttribute('download', `relatorio-evento-${eventName}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      setIsExportDialogOpen(false);
    } catch (err: any) {
      console.error(err);
      alert('Erro ao exportar participantes: ' + err.message);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
           <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-foreground flex items-center gap-3">
            Relatórios <FileText size={24} className="text-primary md:w-8 md:h-8" />
           </h1>
           <p className="text-sm md:text-base text-muted-foreground mt-1">Visão completa e controle manual de todos os participantes.</p>
        </div>
        <Button 
          onClick={handleOpenExportDialog} 
          disabled={loading || events.length === 0}
          className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold h-11 md:h-12 rounded-xl px-4 md:px-6 flex items-center gap-2 shadow-lg shadow-emerald-200 transition-all active:scale-95 text-xs md:text-base w-full md:w-auto"
        >
          <Download size={18} className="md:w-5 md:h-5" />
          <span>EXPORTAR CSV</span>
        </Button>
      </div>

      <div className="bg-white rounded-2xl border border-border shadow-sm overflow-hidden flex flex-col">
        <div className="p-4 md:p-6 border-b border-border flex flex-col lg:flex-row gap-4 items-center">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input 
              placeholder="Buscar por nome ou CPF..." 
              className="pl-10 w-full bg-secondary/50 border-border focus:bg-white h-10 md:h-11 rounded-xl shadow-none"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          
          <div className="flex items-center gap-3 w-full lg:w-auto">
            <Filter size={18} className="text-muted-foreground hidden lg:block" />
            <select 
              className="h-10 md:h-11 bg-secondary/50 border border-border rounded-xl px-4 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all w-full lg:w-64"
              value={selectedEventId}
              onChange={(e) => setSelectedEventId(e.target.value)}
            >
              <option value="all">Todos os Eventos</option>
              {events.map(ev => (
                <option key={ev.id} value={ev.id}>{ev.nome}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-secondary/50 border-b border-border">
              <TableRow>
                <TableHead className="px-4 md:px-6 py-4 font-bold uppercase text-[10px] md:text-xs tracking-wider text-muted-foreground">Nome</TableHead>
                <TableHead className="px-4 md:px-6 py-4 font-bold uppercase text-[10px] md:text-xs tracking-wider text-muted-foreground hidden sm:table-cell">CPF</TableHead>
                <TableHead className="px-4 md:px-6 py-4 font-bold uppercase text-[10px] md:text-xs tracking-wider text-muted-foreground hidden md:table-cell">Modalidade</TableHead>
                <TableHead className="px-4 md:px-6 py-4 font-bold uppercase text-[10px] md:text-xs tracking-wider text-muted-foreground hidden lg:table-cell">Kit</TableHead>
                <TableHead className="px-4 md:px-6 py-4 font-bold uppercase text-[10px] md:text-xs tracking-wider text-muted-foreground hidden lg:table-cell">Camiseta</TableHead>
                <TableHead className="px-4 md:px-6 py-4 font-bold uppercase text-[10px] md:text-xs tracking-wider text-muted-foreground hidden lg:table-cell">Cidade</TableHead>
                <TableHead className="px-4 md:px-6 py-4 font-bold uppercase text-[10px] md:text-xs tracking-wider text-muted-foreground">Status</TableHead>
                <TableHead className="px-4 md:px-6 py-4 text-right font-bold uppercase text-[10px] md:text-xs tracking-wider text-muted-foreground">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody className="divide-y divide-border">
              {loading ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-12 md:py-20 text-muted-foreground">
                    <div className="flex flex-col items-center gap-2">
                       <Loader2 className="w-8 h-8 animate-spin text-primary" />
                       <p className="font-medium animate-pulse text-xs md:text-sm">Cruzando dados dos participantes...</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : participants.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-12 md:py-20 text-muted-foreground text-xs md:text-sm">
                    Nenhum participante encontrado.
                  </TableCell>
                </TableRow>
              ) : participants.map((p) => (
                <TableRow key={p.id} className="hover:bg-secondary/20 transition-all group">
                  <TableCell className="px-4 md:px-6 py-4">
                    <div className="font-bold text-foreground text-xs md:text-sm truncate max-w-[120px] md:max-w-none">{p.nome}</div>
                    <div className="text-[8px] md:text-[10px] text-muted-foreground uppercase font-black truncate max-w-[120px] md:max-w-none">{p.eventName}</div>
                  </TableCell>
                  <TableCell className="px-4 md:px-6 py-4 font-mono text-[10px] md:text-xs hidden sm:table-cell">{p.cpf}</TableCell>
                  <TableCell className="px-4 md:px-6 py-4 text-xs md:text-sm hidden md:table-cell">{p.modalidade || '-'}</TableCell>
                  <TableCell className="px-4 md:px-6 py-4 text-xs md:text-sm hidden lg:table-cell">{p.kit || '-'}</TableCell>
                  <TableCell className="px-4 md:px-6 py-4 text-xs md:text-sm hidden lg:table-cell">{p.tamanhoCamiseta || '-'}</TableCell>
                  <TableCell className="px-4 md:px-6 py-4 text-xs md:text-sm hidden lg:table-cell">{p.cidade || '-'}</TableCell>
                  <TableCell className="px-4 md:px-6 py-4">
                    <Badge 
                      variant={p.status === 'ENTREGUE' ? 'default' : 'secondary'}
                      className={p.status === 'ENTREGUE' ? 'bg-emerald-100 text-emerald-700 border-0 text-[8px] md:text-[10px]' : 'bg-amber-100 text-amber-700 border-0 text-[8px] md:text-[10px]'}
                    >
                      {p.status === 'ENTREGUE' ? 'Entregue' : 'Pendente'}
                    </Badge>
                  </TableCell>
                  <TableCell className="px-4 md:px-6 py-4 text-right">
                    <div className="flex justify-end gap-1 md:gap-2">
                      <Button 
                        size="sm" 
                        variant="outline"
                        className={`h-8 rounded-lg ${p.status === 'ENTREGUE' ? 'border-amber-100 text-amber-600 hover:bg-amber-50' : 'border-emerald-100 text-emerald-600 hover:bg-emerald-50'} px-2 md:px-3 text-[10px] md:text-xs`}
                        onClick={() => handleToggleStatus(p)}
                        title={p.status === 'ENTREGUE' ? 'Marcar como Pendente' : 'Marcar como Entregue'}
                      >
                        {p.status === 'ENTREGUE' ? <XCircle size={14} /> : <CheckCircle2 size={14} />}
                        <span className="ml-1.5 hidden sm:inline">{p.status === 'ENTREGUE' ? 'Pendente' : 'Entregue'}</span>
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline"
                        className="border-red-100 text-red-600 hover:bg-red-50 h-8 w-8 p-0"
                        onClick={() => setParticipantToDelete(p)}
                      >
                        <Trash2 size={14} />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {/* CONTROLES DE PAGINAÇÃO */}
        <div className="p-4 md:p-6 border-t border-border bg-slate-50/50 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="text-[10px] md:text-sm text-muted-foreground order-2 md:order-1">
            Mostrando <span className="font-bold text-foreground">{(page - 1) * limit + 1}</span> a <span className="font-bold text-foreground">{Math.min(page * limit, totalItems)}</span> de <span className="font-bold text-foreground">{totalItems}</span> participantes
          </div>
          
          <div className="flex items-center gap-2 order-1 md:order-2 w-full md:w-auto justify-center">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1 || loading}
              className="h-9 md:h-10 rounded-xl px-3 md:px-4 flex items-center gap-2 font-bold transition-all active:scale-95 text-xs"
            >
              <ChevronLeft size={16} />
              <span className="hidden sm:inline">Anterior</span>
            </Button>
            
            <div className="h-9 md:h-10 px-3 md:px-4 bg-white border border-border rounded-xl flex items-center justify-center font-bold text-[10px] md:text-sm min-w-[80px] md:min-w-[100px] shadow-sm">
              <span className="hidden sm:inline">Página </span>{page} / {totalPages || 1}
            </div>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages || loading}
              className="h-9 md:h-10 rounded-xl px-3 md:px-4 flex items-center gap-2 font-bold transition-all active:scale-95 text-xs"
            >
              <span className="hidden sm:inline">Próximo</span>
              <ChevronRight size={16} />
            </Button>
          </div>
        </div>
      </div>

      <Dialog open={!!participantToDelete} onOpenChange={(open) => !open && setParticipantToDelete(null)}>
        <DialogContent className="rounded-2xl p-8 border-0 shadow-2xl">
          <DialogHeader className="flex flex-col items-center text-center">
            <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mb-4">
              <AlertTriangle size={32} />
            </div>
            <DialogTitle className="text-2xl font-bold">Deletar Participante?</DialogTitle>
            <DialogDescription className="text-muted-foreground mt-2">
              Tem certeza que deseja remover este participante? Essa ação é imediata e irreversível.
            </DialogDescription>
          </DialogHeader>
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 mt-4 space-y-3">
             <div>
               <div className="text-sm font-bold text-slate-900">{participantToDelete?.nome}</div>
               <div className="text-xs text-slate-500">{participantToDelete?.cpf}</div>
             </div>
             
             <div className="space-y-1">
               <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Confirme o nome para excluir</label>
               <Input 
                placeholder="Digite o nome completo"
                value={deleteConfirmName}
                onChange={(e) => setDeleteConfirmName(e.target.value)}
                className="bg-white border-slate-200"
               />
             </div>
          </div>
          <DialogFooter className="-mx-8 -mb-8 mt-8 rounded-b-2xl p-8 gap-3 sm:justify-center">
            <Button variant="outline" onClick={() => { setParticipantToDelete(null); setDeleteConfirmName(''); }} disabled={isActionLoading} className="px-8 rounded-xl font-bold">
              Cancelar
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleDelete} 
              disabled={isActionLoading || deleteConfirmName !== participantToDelete?.nome} 
              className="px-8 rounded-xl font-bold bg-red-600 hover:bg-red-700 disabled:opacity-50"
            >
              {isActionLoading ? 'Removendo...' : 'Confirmar Exclusão'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isExportDialogOpen} onOpenChange={(open) => !open && !isExporting && setIsExportDialogOpen(false)}>
        <DialogContent className="rounded-2xl p-8 border-0 shadow-2xl">
          <DialogHeader className="flex flex-col items-center text-center">
            <div className="w-16 h-16 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center mb-4">
              <Download size={32} className="text-emerald-600" />
            </div>
            <DialogTitle className="text-2xl font-bold">Exportar Participantes</DialogTitle>
            <DialogDescription className="text-muted-foreground mt-2 text-sm">
              Selecione o evento desejado para gerar e baixar o relatório completo em formato CSV.
            </DialogDescription>
          </DialogHeader>
          
          <div className="mt-6 space-y-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Selecione o Evento</label>
              <select 
                className="h-11 w-full bg-secondary/50 border border-border rounded-xl px-4 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all uppercase"
                value={exportEventId}
                onChange={(e) => setExportEventId(e.target.value)}
                disabled={isExporting}
              >
                {events.map(ev => (
                  <option key={ev.id} value={ev.id}>{ev.nome}</option>
                ))}
              </select>
            </div>
          </div>

          <DialogFooter className="mt-8 gap-3 sm:justify-center">
            <Button 
              variant="outline" 
              onClick={() => setIsExportDialogOpen(false)} 
              disabled={isExporting}
              className="px-8 rounded-xl font-bold"
            >
              Cancelar
            </Button>
            <Button 
              onClick={handleConfirmExport} 
              disabled={isExporting || !exportEventId} 
              className="px-8 rounded-xl font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-100 flex items-center gap-2"
            >
              {isExporting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-white" />
                  <span>Gerando CSV...</span>
                </>
              ) : (
                'Confirmar Exportação'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
