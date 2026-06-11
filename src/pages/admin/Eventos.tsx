import React, { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { Event } from '@/types';
import { 
  Search, 
  MapPin, 
  Calendar, 
  Ticket,
  User,
  Users
} from 'lucide-react';
import { Link } from 'react-router-dom';
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
import { Badge } from '@/components/ui/badge';

export default function AdminEventos() {
  const [eventos, setEventos] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const fetchEventos = async () => {
    try {
      const data = await api.getEventos();
      setEventos(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEventos();
  }, []);

  const filteredEventos = eventos.filter(e => 
    e.nome.toLowerCase().includes(search.toLowerCase()) || 
    e.local.toLowerCase().includes(search.toLowerCase()) ||
    e.organizador?.nome.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
           <h1 className="text-3xl font-bold tracking-tight text-foreground flex items-center gap-3">
            Eventos da Plataforma <Ticket size={32} className="text-primary" />
           </h1>
           <p className="text-muted-foreground mt-1">Visão geral de todos os eventos criados pelos organizadores.</p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-border overflow-hidden">
        <div className="p-6 border-b border-border flex flex-col md:flex-row md:items-center justify-between gap-4">
           <div className="relative w-full md:w-96">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input 
                placeholder="Buscar por evento, local ou organizador..." 
                className="pl-10 w-full bg-secondary/50 border-border focus:bg-white h-11 rounded-xl shadow-none"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
           </div>
           
           <div className="flex items-center gap-2 px-3 py-1 bg-secondary rounded-lg text-xs font-bold text-muted-foreground uppercase tracking-widest">
              Total: {eventos.length}
           </div>
        </div>

        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-secondary/50 border-b border-border">
              <TableRow>
                <TableHead className="px-6 py-4 font-bold uppercase text-xs tracking-wider text-muted-foreground">Evento</TableHead>
                <TableHead className="px-6 py-4 font-bold uppercase text-xs tracking-wider text-muted-foreground">Organizador</TableHead>
                <TableHead className="px-6 py-4 font-bold uppercase text-xs tracking-wider text-muted-foreground">Localização</TableHead>
                <TableHead className="px-6 py-4 font-bold uppercase text-xs tracking-wider text-muted-foreground">Data</TableHead>
                <TableHead className="px-6 py-4 font-bold uppercase text-xs tracking-wider text-muted-foreground">Status</TableHead>
                <TableHead className="px-6 py-4 text-right font-bold uppercase text-xs tracking-wider text-muted-foreground">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody className="divide-y divide-border">
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-10 text-muted-foreground italic">
                    Auditando eventos...
                  </TableCell>
                </TableRow>
              ) : filteredEventos.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-20 text-muted-foreground italic font-medium">
                    Nenhum evento registrado no sistema.
                  </TableCell>
                </TableRow>
              ) : filteredEventos.map((event) => (
                <TableRow key={event.id} className="hover:bg-secondary/20 transition-all group">
                  <TableCell className="px-6 py-5">
                    <div>
                      <p className="font-bold text-foreground group-hover:text-primary transition-colors text-base">{event.nome}</p>
                      {event.descricao && <p className="text-xs text-muted-foreground mt-1 line-clamp-1 italic">{event.descricao}</p>}
                    </div>
                  </TableCell>
                  <TableCell className="px-6 py-5">
                    <div className="flex items-center gap-2">
                       <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary font-bold text-xs">
                          {event.organizador?.nome.charAt(0)}
                       </div>
                       <div>
                          <p className="font-bold text-sm text-foreground">{event.organizador?.nome}</p>
                          <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-tighter">{event.organizador?.email}</p>
                       </div>
                    </div>
                  </TableCell>
                  <TableCell className="px-6 py-5">
                    <div className="flex items-center gap-1.5 text-muted-foreground text-sm">
                       <MapPin size={14} className="text-primary/70" />
                       {event.local}
                    </div>
                  </TableCell>
                  <TableCell className="px-6 py-5">
                    <div className="flex items-center gap-1.5 text-muted-foreground text-sm font-medium">
                       <Calendar size={14} className="text-primary/70" />
                       {new Date(event.dataEvento).toLocaleDateString('pt-BR')}
                    </div>
                  </TableCell>
                  <TableCell className="px-6 py-5">
                    <Badge variant={event.status === 'ATIVO' ? 'default' : 'secondary'} className={
                      event.status === 'ATIVO' 
                        ? 'bg-green-100 text-green-700 hover:bg-green-200 border-0 font-bold px-3' 
                        : 'bg-slate-100 text-slate-500 hover:bg-slate-200 border-0 font-bold px-3'
                    }>
                      {event.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="px-6 py-5 text-right">
                    <Link to={`/admin/eventos/${event.id}/participantes`}>
                      <Button variant="outline" size="sm" className="rounded-lg font-bold gap-2 text-muted-foreground hover:text-indigo-600 hover:border-indigo-200">
                        <Users size={14} />
                        Participantes
                      </Button>
                    </Link>
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
