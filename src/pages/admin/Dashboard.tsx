import React, { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { User } from '@/types';
import { 
  Plus, 
  Search, 
  MoreVertical, 
  UserPlus, 
  BadgeCheck, 
  AlertTriangle,
  UserCheck,
  UserX,
  Mail,
  Calendar,
  Settings
} from 'lucide-react';
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
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';

export default function AdminDashboard() {
  const [organizadores, setOrganizadores] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [editingOrg, setEditingOrg] = useState<User | null>(null);
  const [search, setSearch] = useState('');

  // Form states
  const [formData, setFormData] = useState({ nome: '', email: '', senha: '' });
  const [editFormData, setEditFormData] = useState({ nome: '', email: '', status: '', senha: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchOrganizadores = async () => {
    try {
      const data = await api.getOrganizadores();
      setOrganizadores(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrganizadores();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await api.criarOrganizador(formData);
      setIsCreating(false);
      setFormData({ nome: '', email: '', senha: '' });
      fetchOrganizadores();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingOrg) return;
    
    setIsSubmitting(true);
    try {
      // Only include password if it was typed
      const payload: any = { ...editFormData };
      if (!payload.senha) delete payload.senha;
      
      await api.atualizarOrganizador(editingOrg.id, payload);
      setEditingOrg(null);
      fetchOrganizadores();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const startEdit = (org: User) => {
    setEditingOrg(org);
    setEditFormData({
      nome: org.nome,
      email: org.email,
      status: org.status,
      senha: ''
    });
  };

  const toggleStatus = async (user: User) => {
    try {
      const newStatus = user.status === 'ATIVO' ? 'INATIVO' : 'ATIVO';
      await api.atualizarOrganizador(user.id, { status: newStatus });
      fetchOrganizadores();
    } catch (err) {
      alert('Erro ao atualizar status');
    }
  };

  const filteredOrganizadores = organizadores.filter(o => 
    o.nome.toLowerCase().includes(search.toLowerCase()) || 
    o.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-8">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border border-border shadow-sm bg-white">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Total de Parceiros</p>
                <h3 className="text-2xl font-bold text-foreground mt-1">{organizadores.length}</h3>
              </div>
              <div className="p-3 bg-secondary rounded-xl text-primary">
                <UserIcon className="w-6 h-6" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-xs text-green-600 font-medium bg-green-50 w-fit px-2 py-1 rounded-full">
              <BadgeCheck size={14} className="mr-1" />
              {organizadores.filter(o => o.status === 'ATIVO').length} Ativos agora
            </div>
          </CardContent>
        </Card>

        <Card className="border border-border shadow-sm bg-white">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Aguardando Ativação</p>
                <h3 className="text-2xl font-bold text-slate-400 mt-1">{organizadores.filter(o => o.status === 'INATIVO').length}</h3>
              </div>
              <div className="p-3 bg-secondary rounded-xl text-muted-foreground">
                <AlertTriangle className="w-6 h-6" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-xs text-muted-foreground font-medium">
              Contas pendentes ou suspensas
            </div>
          </CardContent>
        </Card>

        <Card className="border border-border shadow-sm bg-white">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Organizadores Ativos</p>
                <h3 className="text-2xl font-bold text-green-600 mt-1">{organizadores.filter(o => o.status === 'ATIVO').length}</h3>
              </div>
              <div className="p-3 bg-green-50 rounded-xl text-green-600">
                <Calendar className="w-6 h-6" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-xs text-muted-foreground font-medium">
              Próximos grandes desafios
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Management Section */}
      <div className="bg-white rounded-xl shadow-sm border border-border overflow-hidden">
        <div className="p-6 border-b border-border flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h3 className="text-lg font-bold text-foreground">Gerenciar Organizadores</h3>
            <p className="text-sm text-muted-foreground">Controle de acesso dos clientes da plataforma</p>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input 
                placeholder="Buscar por nome ou email..." 
                className="pl-10 w-full md:w-64 bg-secondary border-border focus:bg-white transition-all h-10 rounded-lg shadow-none ring-0 focus-visible:ring-1 focus-visible:ring-primary"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            <Dialog open={isCreating} onOpenChange={setIsCreating}>
              <DialogTrigger
                render={
                  <Button className="bg-primary hover:bg-primary/90 text-white gap-2 h-10 px-5 font-semibold rounded-lg shadow-sm">
                    <UserPlus size={18} />
                    Criar Organizador
                  </Button>
                }
              />
              <DialogContent className="sm:max-w-[480px] rounded-2xl border-0 shadow-2xl p-8">
                <form onSubmit={handleCreate}>
                  <DialogHeader className="mb-6">
                    <DialogTitle className="text-2xl font-bold text-foreground">Novo Organizador</DialogTitle>
                    <DialogDescription className="text-muted-foreground">
                      Preencha os dados abaixo para conceder acesso ao sistema.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-5 py-2">
                    <div className="space-y-1.5">
                       <label className="text-xs font-bold uppercase text-muted-foreground tracking-wider">Nome da Organização</label>
                       <Input 
                        placeholder="Ex: Eventos Pro" 
                        required 
                        className="h-11 bg-secondary/50 border-border focus:bg-white rounded-lg"
                        value={formData.nome}
                        onChange={(e) => setFormData({...formData, nome: e.target.value})}
                       />
                    </div>
                    <div className="space-y-1.5">
                       <label className="text-xs font-bold uppercase text-muted-foreground tracking-wider">Email do Administrador</label>
                       <Input 
                        type="email" 
                        placeholder="email@parceiro.com" 
                        required 
                        className="h-11 bg-secondary/50 border-border focus:bg-white rounded-lg"
                        value={formData.email}
                        onChange={(e) => setFormData({...formData, email: e.target.value})}
                       />
                    </div>
                    <div className="space-y-1.5">
                       <label className="text-xs font-bold uppercase text-muted-foreground tracking-wider">Senha Temporária</label>
                       <Input 
                        type="password" 
                        required 
                        className="h-11 bg-secondary/50 border-border focus:bg-white rounded-lg"
                        value={formData.senha}
                        onChange={(e) => setFormData({...formData, senha: e.target.value})}
                       />
                    </div>
                  </div>
                  <DialogFooter className="mt-8 flex gap-3 sm:justify-start">
                    <Button type="submit" className="flex-1 bg-primary text-white py-6 rounded-xl font-bold order-2" disabled={isSubmitting}>
                      {isSubmitting ? 'Salvando...' : 'Salvar Organizador'}
                    </Button>
                    <Button variant="outline" type="button" onClick={() => setIsCreating(false)} className="flex-1 border border-border text-muted-foreground py-6 rounded-xl font-bold order-1">
                      Cancelar
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-secondary/50 border-b border-border">
              <TableRow>
                <TableHead className="px-6 py-4 font-bold uppercase text-xs tracking-wider text-muted-foreground">Organizador</TableHead>
                <TableHead className="px-6 py-4 font-bold uppercase text-xs tracking-wider text-muted-foreground">Email</TableHead>
                <TableHead className="px-6 py-4 font-bold uppercase text-xs tracking-wider text-muted-foreground">Status</TableHead>
                <TableHead className="px-6 py-4 font-bold uppercase text-xs tracking-wider text-muted-foreground">Criado em</TableHead>
                <TableHead className="px-6 py-4 text-right font-bold uppercase text-xs tracking-wider text-muted-foreground">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody className="divide-y divide-border">
              {loading ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-10">
                    <p className="text-muted-foreground italic">Carregando base de usuários...</p>
                  </TableCell>
                </TableRow>
              ) : filteredOrganizadores.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-10">
                    <p className="text-muted-foreground italic">Nenhum organizador encontrado.</p>
                  </TableCell>
                </TableRow>
              ) : filteredOrganizadores.map((org) => (
                <TableRow key={org.id} className="hover:bg-secondary/30 transition-colors group">
                  <TableCell className="px-6 py-4 font-medium text-foreground">
                    {org.nome}
                  </TableCell>
                  <TableCell className="px-6 py-4 text-muted-foreground">
                    {org.email}
                  </TableCell>
                  <TableCell className="px-6 py-4 text-muted-foreground">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                      org.status === 'ATIVO' 
                        ? 'bg-green-100 text-green-700' 
                        : 'bg-red-100 text-red-700'
                    }`}>
                      {org.status === 'ATIVO' ? 'Ativo' : 'Inativo'}
                    </span>
                  </TableCell>
                  <TableCell className="px-6 py-4 text-muted-foreground">
                    {new Date(org.createdAt).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' })}
                  </TableCell>
                  <TableCell className="px-6 py-4 text-right space-x-3">
                    <button 
                      onClick={() => startEdit(org)}
                      className="text-primary hover:underline font-medium text-sm"
                    >
                      Editar
                    </button>
                    {org.status === 'ATIVO' ? (
                       <button onClick={() => toggleStatus(org)} className="text-slate-400 hover:text-red-500 font-medium text-sm transition-colors">Desativar</button>
                    ) : (
                       <button onClick={() => toggleStatus(org)} className="text-green-600 hover:text-green-700 font-bold text-sm transition-colors">Ativar</button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Edit Dialog */}
      <Dialog open={!!editingOrg} onOpenChange={(open) => !open && setEditingOrg(null)}>
        <DialogContent className="sm:max-w-[480px] rounded-2xl border-0 shadow-2xl p-8">
          <form onSubmit={handleUpdate}>
            <DialogHeader className="mb-6">
              <DialogTitle className="text-2xl font-bold text-foreground">Editar Organizador</DialogTitle>
              <DialogDescription className="text-muted-foreground">
                Atualize as informações de acesso do parceiro abaixo.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-5 py-2">
              <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase text-muted-foreground tracking-wider">Nome da Organização</label>
                  <Input 
                  placeholder="Ex: Eventos Pro" 
                  required 
                  className="h-11 bg-secondary/50 border-border focus:bg-white rounded-lg"
                  value={editFormData.nome}
                  onChange={(e) => setEditFormData({...editFormData, nome: e.target.value})}
                  />
              </div>
              <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase text-muted-foreground tracking-wider">Email do Administrador</label>
                  <Input 
                  type="email" 
                  placeholder="email@parceiro.com" 
                  required 
                  className="h-11 bg-secondary/50 border-border focus:bg-white rounded-lg"
                  value={editFormData.email}
                  onChange={(e) => setEditFormData({...editFormData, email: e.target.value})}
                  />
              </div>
              <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase text-muted-foreground tracking-wider">Status da Conta</label>
                  <select 
                    className="flex h-11 w-full rounded-lg border border-border bg-secondary/50 px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary focus-visible:ring-offset-0 disabled:cursor-not-allowed disabled:opacity-50"
                    value={editFormData.status}
                    onChange={(e) => setEditFormData({...editFormData, status: e.target.value})}
                  >
                    <option value="ATIVO">Ativo</option>
                    <option value="INATIVO">Inativo</option>
                  </select>
              </div>
              <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase text-muted-foreground tracking-wider">Nova Senha (Deixe em branco para não alterar)</label>
                  <Input 
                  type="password" 
                  placeholder="Mantenha em branco para manter a atual" 
                  className="h-11 bg-secondary/50 border-border focus:bg-white rounded-lg"
                  value={editFormData.senha}
                  onChange={(e) => setEditFormData({...editFormData, senha: e.target.value})}
                  />
              </div>
            </div>
            <DialogFooter className="mt-8 flex gap-3 sm:justify-start">
              <Button type="submit" className="flex-1 bg-primary text-white py-6 rounded-xl font-bold order-2" disabled={isSubmitting}>
                {isSubmitting ? 'Salvando...' : 'Salvar Alterações'}
              </Button>
              <Button variant="outline" type="button" onClick={() => setEditingOrg(null)} className="flex-1 border border-border text-muted-foreground py-6 rounded-xl font-bold order-1">
                Cancelar
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function UserIcon({ className }: { className?: string }) {
  return (
    <svg 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      className={className}
    >
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  );
}
