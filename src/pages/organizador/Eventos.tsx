import React, { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { Event } from '@/types';
import { 
  Plus, 
  Search, 
  MapPin, 
  Calendar, 
  Edit,
  LayoutDashboard,
  MoreVertical,
  Ticket,
  Users,
  Monitor,
  Image as ImageIcon,
  Upload,
  X as CloseIcon,
  Loader2,
  Trash2,
  AlertTriangle
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';

export default function OrganizadorEventos() {
  const [eventos, setEventos] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
  const [eventToDelete, setEventToDelete] = useState<Event | null>(null);
  const [deleteConfirmationName, setDeleteConfirmationName] = useState('');
  const [search, setSearch] = useState('');

  // Form states
  const [formData, setFormData] = useState({ 
    nome: '', 
    descricao: '', 
    dataEvento: '', 
    local: '',
    imageUrl: ''
  });
  const [isUploading, setIsUploading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

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

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await api.criarEvento(formData);
      setIsCreating(false);
      setFormData({ nome: '', descricao: '', dataEvento: '', local: '', imageUrl: '' });
      fetchEventos();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingEvent) return;
    setIsSubmitting(true);
    try {
      await api.atualizarEvento(editingEvent.id, formData);
      setEditingEvent(null);
      setFormData({ nome: '', descricao: '', dataEvento: '', local: '', imageUrl: '' });
      fetchEventos();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const { imageUrl } = await api.uploadImage(file);
      setFormData(prev => ({ ...prev, imageUrl }));
    } catch (err: any) {
      alert('Erro ao subir imagem: ' + err.message);
    } finally {
      setIsUploading(false);
    }
  };

  const startEditing = (event: Event) => {
    setEditingEvent(event);
    setFormData({
      nome: event.nome,
      descricao: event.descricao || '',
      dataEvento: new Date(event.dataEvento).toISOString().split('T')[0],
      local: event.local,
      imageUrl: event.imageUrl || ''
    });
  };

  const handleDelete = async () => {
    if (!eventToDelete) return;
    if (deleteConfirmationName !== eventToDelete.nome) return;

    setIsSubmitting(true);
    try {
      await api.deletarEvento(eventToDelete.id);
      setEventToDelete(null);
      setDeleteConfirmationName('');
      fetchEventos();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredEventos = eventos.filter(e => 
    e.nome.toLowerCase().includes(search.toLowerCase()) || 
    e.local.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
           <h1 className="text-3xl font-bold tracking-tight text-foreground flex items-center gap-3">
            Meus Eventos <Ticket size={32} className="text-primary" />
           </h1>
           <p className="text-muted-foreground mt-1">Gerencie aqui seus eventos e logística de entrega.</p>
        </div>

        <Dialog open={isCreating} onOpenChange={(open) => {
          setIsCreating(open);
          if (!open) setFormData({ nome: '', descricao: '', dataEvento: '', local: '', imageUrl: '' });
        }}>
          <DialogTrigger
            render={
              <Button className="bg-primary hover:bg-primary/90 text-white gap-2 px-6 font-bold h-11 rounded-xl shadow-lg shadow-primary/10 transition-all active:scale-[0.98]">
                <Plus size={18} />
                Criar Novo Evento
              </Button>
            }
          />
          <DialogContent className="sm:max-w-[500px] rounded-2xl p-8 border-0 shadow-2xl">
            <form onSubmit={handleCreate}>
              <DialogHeader className="mb-6">
                <DialogTitle className="text-2xl font-bold">Novo Evento</DialogTitle>
                <DialogDescription className="text-muted-foreground">
                  Preencha os detalhes do evento para começar a organização.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-5 py-2">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Nome do Evento</label>
                  <Input 
                    placeholder="Ex: Maratona de Verão 2024" 
                    required 
                    value={formData.nome}
                    onChange={(e) => setFormData({...formData, nome: e.target.value})}
                    className="h-11 bg-secondary/50 border-border focus:bg-white rounded-lg shadow-none"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Descrição (Opcional)</label>
                  <Input 
                    placeholder="Breve resumo sobre o evento" 
                    value={formData.descricao}
                    onChange={(e) => setFormData({...formData, descricao: e.target.value})}
                    className="h-11 bg-secondary/50 border-border focus:bg-white rounded-lg shadow-none"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Data</label>
                    <Input 
                      type="date"
                      required 
                      value={formData.dataEvento}
                      onChange={(e) => setFormData({...formData, dataEvento: e.target.value})}
                      className="h-11 bg-secondary/50 border-border focus:bg-white rounded-lg shadow-none"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Local</label>
                    <Input 
                      placeholder="Cidade, UF ou Endereço"
                      required 
                      value={formData.local}
                      onChange={(e) => setFormData({...formData, local: e.target.value})}
                      className="h-11 bg-secondary/50 border-border focus:bg-white rounded-lg shadow-none"
                    />
                  </div>
                </div>

                <div className="space-y-1.5 mt-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Imagem do Evento</label>
                  <div className="flex flex-col gap-4">
                    {formData.imageUrl ? (
                      <div className="relative w-full h-40 bg-slate-50 border-2 border-dashed border-slate-200 rounded-xl overflow-hidden group">
                        <img 
                          src={formData.imageUrl} 
                          alt="Banner do evento" 
                          className="w-full h-full object-cover"
                          referrerPolicy="no-referrer"
                        />
                        <button 
                          type="button"
                          onClick={() => setFormData({ ...formData, imageUrl: '' })}
                          className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity active:scale-90"
                        >
                          <CloseIcon size={16} />
                        </button>
                      </div>
                    ) : (
                      <div className="relative w-full h-40 bg-slate-50 border-2 border-dashed border-slate-200 rounded-xl flex items-center justify-center group hover:bg-slate-100 transition-all cursor-pointer">
                        <input 
                          type="file" 
                          accept="image/png, image/jpeg"
                          onChange={handleFileUpload}
                          className="absolute inset-0 opacity-0 cursor-pointer z-10"
                          disabled={isUploading}
                        />
                        <div className="flex flex-col items-center gap-2 text-slate-400 group-hover:text-primary transition-colors">
                          {isUploading ? <Loader2 size={32} className="animate-spin text-primary" /> : <Upload size={32} />}
                          <span className="text-xs font-black uppercase">{isUploading ? 'Subindo...' : 'Subir Imagem (PNG/JPG)'}</span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              <DialogFooter className="mt-8 gap-3 sm:justify-start">
                <Button type="submit" className="flex-1 bg-primary text-white py-6 rounded-xl font-bold order-2" disabled={isSubmitting}>
                  {isSubmitting ? 'Salvando...' : 'Salvar Evento'}
                </Button>
                <Button variant="outline" type="button" onClick={() => setIsCreating(false)} className="flex-1 border-border text-muted-foreground py-6 rounded-xl font-bold order-1">
                  Cancelar
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {editingEvent && (
        <Dialog open={!!editingEvent} onOpenChange={(open) => {
          if (!open) {
             setEditingEvent(null);
             setFormData({ nome: '', descricao: '', dataEvento: '', local: '', imageUrl: '' });
          }
        }}>
          <DialogContent className="sm:max-w-[500px] rounded-2xl p-8 border-0 shadow-2xl">
            <form onSubmit={handleUpdate}>
              <DialogHeader className="mb-6">
                <DialogTitle className="text-2xl font-bold">Editar Evento</DialogTitle>
                <DialogDescription className="text-muted-foreground">
                  Atualize as informações principais do seu evento.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-5 py-2">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Nome do Evento</label>
                  <Input 
                    placeholder="Ex: Maratona de Verão 2024" 
                    required 
                    value={formData.nome}
                    onChange={(e) => setFormData({...formData, nome: e.target.value})}
                    className="h-11 bg-secondary/50 border-border focus:bg-white rounded-lg shadow-none"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Descrição</label>
                  <Input 
                    placeholder="Breve resumo sobre o evento" 
                    value={formData.descricao}
                    onChange={(e) => setFormData({...formData, descricao: e.target.value})}
                    className="h-11 bg-secondary/50 border-border focus:bg-white rounded-lg shadow-none"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Data</label>
                    <Input 
                      type="date"
                      required 
                      value={formData.dataEvento}
                      onChange={(e) => setFormData({...formData, dataEvento: e.target.value})}
                      className="h-11 bg-secondary/50 border-border focus:bg-white rounded-lg shadow-none"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Local</label>
                    <Input 
                      placeholder="Cidade, UF ou Endereço"
                      required 
                      value={formData.local}
                      onChange={(e) => setFormData({...formData, local: e.target.value})}
                      className="h-11 bg-secondary/50 border-border focus:bg-white rounded-lg shadow-none"
                    />
                  </div>
                </div>

                <div className="space-y-1.5 mt-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Imagem do Evento</label>
                  <div className="flex flex-col gap-4">
                    {formData.imageUrl ? (
                      <div className="relative w-full h-40 bg-slate-50 border-2 border-dashed border-slate-200 rounded-xl overflow-hidden group">
                        <img 
                          src={formData.imageUrl} 
                          alt="Banner do evento" 
                          className="w-full h-full object-cover"
                          referrerPolicy="no-referrer"
                        />
                        <button 
                          type="button"
                          onClick={() => setFormData({ ...formData, imageUrl: '' })}
                          className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity active:scale-90"
                        >
                          <CloseIcon size={16} />
                        </button>
                      </div>
                    ) : (
                      <div className="relative w-full h-40 bg-slate-50 border-2 border-dashed border-slate-200 rounded-xl flex items-center justify-center group hover:bg-slate-100 transition-all cursor-pointer">
                        <input 
                          type="file" 
                          accept="image/png, image/jpeg"
                          onChange={handleFileUpload}
                          className="absolute inset-0 opacity-0 cursor-pointer z-10"
                          disabled={isUploading}
                        />
                        <div className="flex flex-col items-center gap-2 text-slate-400 group-hover:text-primary transition-colors">
                          {isUploading ? <Loader2 size={32} className="animate-spin text-primary" /> : <Upload size={32} />}
                          <span className="text-xs font-black uppercase">{isUploading ? 'Subindo...' : 'Subir Imagem (PNG/JPG)'}</span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              <DialogFooter className="mt-8 gap-3 sm:justify-start">
                <Button type="submit" className="flex-1 bg-primary text-white py-6 rounded-xl font-bold order-2" disabled={isSubmitting}>
                  {isSubmitting ? 'Atualizando...' : 'Confirmar Alterações'}
                </Button>
                <Button variant="outline" type="button" onClick={() => setEditingEvent(null)} className="flex-1 border-border text-muted-foreground py-6 rounded-xl font-bold order-1">
                  Voltar
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      )}

      {eventToDelete && (
        <Dialog open={!!eventToDelete} onOpenChange={(open) => {
          if (!open) {
            setEventToDelete(null);
            setDeleteConfirmationName('');
          }
        }}>
          <DialogContent className="sm:max-w-[500px] rounded-2xl p-8 border-0 shadow-2xl">
            <DialogHeader className="mb-6 flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mb-4">
                <AlertTriangle size={32} />
              </div>
              <DialogTitle className="text-2xl font-bold text-red-600">Deletar Evento?</DialogTitle>
              <DialogDescription className="text-slate-500 mt-2">
                Essa ação é <strong>irreversível</strong> e irá apagar todos os participantes, solicitações de retirada e imagens vinculadas.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-2">
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 italic text-sm text-slate-600">
                Para confirmar a exclusão de <span className="font-bold text-slate-900">"{eventToDelete.nome}"</span>, digite o nome do evento abaixo:
              </div>
              
              <Input 
                placeholder="Digite o nome do evento para confirmar"
                value={deleteConfirmationName}
                onChange={(e) => setDeleteConfirmationName(e.target.value)}
                className="h-12 bg-white border-red-200 focus:border-red-500 focus:ring-red-500 rounded-xl"
              />
            </div>

            <DialogFooter className="mt-8 gap-3 sm:justify-start flex-row">
              <Button 
                variant="outline" 
                onClick={() => setEventToDelete(null)}
                className="flex-1 py-6 rounded-xl font-bold border-slate-200 text-slate-500"
              >
                Cancelar
              </Button>
              <Button 
                variant="destructive"
                disabled={isSubmitting || deleteConfirmationName !== eventToDelete.nome}
                onClick={handleDelete}
                className="flex-1 py-6 rounded-xl font-bold bg-red-600 hover:bg-red-700 text-white"
              >
                {isSubmitting ? 'Excluindo...' : 'Confirmar Exclusão'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Events List */}
      <div className="bg-white rounded-xl shadow-sm border border-border overflow-hidden">
        <div className="p-6 border-b border-border flex flex-col md:flex-row md:items-center justify-between gap-4">
           <div className="relative w-full md:w-96">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input 
                placeholder="Buscar eventos..." 
                className="pl-10 w-full bg-secondary/50 border-border focus:bg-white h-11 rounded-xl shadow-none"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
           </div>
        </div>

        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-secondary/50 border-b border-border">
              <TableRow>
                <TableHead className="px-6 py-4 font-bold uppercase text-xs tracking-wider text-muted-foreground">Evento</TableHead>
                <TableHead className="px-6 py-4 font-bold uppercase text-xs tracking-wider text-muted-foreground">Localização</TableHead>
                <TableHead className="px-6 py-4 font-bold uppercase text-xs tracking-wider text-muted-foreground">Data</TableHead>
                <TableHead className="px-6 py-4 font-bold uppercase text-xs tracking-wider text-muted-foreground">Status</TableHead>
                <TableHead className="px-6 py-4 text-right font-bold uppercase text-xs tracking-wider text-muted-foreground">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody className="divide-y divide-border">
              {loading ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-10 text-muted-foreground italic">
                    Carregando cronograma...
                  </TableCell>
                </TableRow>
              ) : filteredEventos.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-20 bg-secondary/10">
                    <div className="flex flex-col items-center gap-2">
                       <LayoutDashboard size={40} className="text-muted-foreground/30" />
                       <p className="text-muted-foreground font-medium">Nenhum evento encontrado.</p>
                       <Button variant="link" onClick={() => setIsCreating(true)} className="text-primary font-bold">Crie seu primeiro evento agora</Button>
                    </div>
                  </TableCell>
                </TableRow>
              ) : filteredEventos.map((event) => (
                <TableRow key={event.id} className="hover:bg-secondary/20 transition-all group">
                  <TableCell className="px-6 py-5">
                    <div className="flex items-center gap-4">
                      {event.imageUrl ? (
                        <div className="w-12 h-12 rounded-xl overflow-hidden border border-border shadow-sm flex-shrink-0">
                          <img 
                            src={event.imageUrl} 
                            alt={event.nome} 
                            className="w-full h-full object-cover"
                            referrerPolicy="no-referrer"
                          />
                        </div>
                      ) : (
                        <div className="w-12 h-12 rounded-xl bg-secondary flex items-center justify-center text-muted-foreground/40 border border-border flex-shrink-0">
                          <ImageIcon size={24} />
                        </div>
                      )}
                      <div>
                        <p className="font-bold text-foreground group-hover:text-primary transition-colors text-base">{event.nome}</p>
                        {event.descricao && <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1 italic">{event.descricao}</p>}
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
                    <div className="flex flex-wrap justify-end gap-2">
                      {event.slug && (
                        <Link to={`/totem/${event.slug}`} target="_blank">
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="border-amber-100 text-amber-600 hover:text-amber-700 hover:bg-amber-50 rounded-lg font-bold gap-2 text-[10px] md:text-xs h-8 md:h-9"
                          >
                            <Monitor size={14} />
                            <span className="hidden sm:inline">Totem</span>
                          </Button>
                        </Link>
                      )}
                      <Link to={`/organizador/eventos/${event.id}/participantes`}>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="border-indigo-100 text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 rounded-lg font-bold gap-2 text-[10px] md:text-xs h-8 md:h-9"
                        >
                          <Users size={14} />
                          <span className="hidden sm:inline">Participantes</span>
                        </Button>
                      </Link>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="border-border text-muted-foreground hover:text-primary hover:bg-primary/5 rounded-lg font-bold gap-2 text-[10px] md:text-xs h-8 md:h-9"
                        onClick={() => startEditing(event)}
                      >
                        <Edit size={14} />
                        <span className="hidden sm:inline">Editar</span>
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="border-red-100 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg font-bold gap-2 text-[10px] md:text-xs h-8 md:h-9"
                        onClick={() => {
                          setEventToDelete(event);
                          setDeleteConfirmationName('');
                        }}
                      >
                        <Trash2 size={14} />
                        <span className="hidden sm:inline">Excluir</span>
                      </Button>
                    </div>
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
