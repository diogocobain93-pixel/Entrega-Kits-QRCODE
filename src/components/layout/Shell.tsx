import React, { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { LogOut, User as UserIcon, LayoutDashboard, Settings, Ticket, MonitorSpeaker, FileText, Menu, X, CircleDollarSign, QrCode } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate, Link, useLocation } from 'react-router-dom';

const NavItem = ({ to, icon: Icon, children, currentPath, onClick }: { to: string, icon: any, children: React.ReactNode, currentPath: string, onClick?: () => void }) => {
  const isActive = currentPath === to;
  return (
    <Link to={to} onClick={onClick}>
      <Button 
        variant="ghost" 
        className={`w-full justify-start gap-3 font-medium h-10 ${
          isActive 
            ? 'text-primary bg-primary/10' 
            : 'text-muted-foreground hover:text-primary hover:bg-primary/10'
        }`}
      >
        <Icon size={18} />
        {children}
      </Button>
    </Link>
  );
};

export function Shell({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (!user) return <>{children}</>;

  return (
    <div className="min-h-screen bg-background flex flex-col lg:flex-row">
      {/* Mobile Header */}
      <header className="lg:hidden h-[72px] bg-background border-b border-border flex items-center justify-between px-6 sticky top-0 z-40">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
            <div className="w-4 h-4 border-2 border-primary-foreground rounded-sm"></div>
          </div>
          <span className="text-xl font-bold text-foreground tracking-tight">KitCheck</span>
        </div>
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="text-muted-foreground"
        >
          {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </Button>
      </header>

      {/* Sidebar - Desktop and Mobile Drawer */}
      <aside className={`
        fixed inset-y-0 left-0 z-30 w-[280px] bg-sidebar border-r border-sidebar-border flex flex-col h-screen transition-transform duration-300 transform
        ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:translate-x-0 lg:sticky lg:top-0 lg:w-[260px] pt-[72px] lg:pt-0
      `}>
        <div className="p-8 hidden lg:flex items-center gap-3">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
            <div className="w-4 h-4 border-2 border-primary-foreground rounded-sm"></div>
          </div>
          <span className="text-xl font-bold text-foreground tracking-tight">KitCheck</span>
        </div>
        
        <nav className="flex-1 px-4 py-4 lg:py-0 space-y-1">
          <NavItem to={user.tipo === 'ADMIN' ? '/admin/dashboard' : '/organizador/dashboard'} icon={LayoutDashboard} currentPath={location.pathname} onClick={() => setIsMobileMenuOpen(false)}>
            Dashboard
          </NavItem>
          
          {user.tipo === 'ADMIN' ? (
            <>
              <NavItem to="/admin/dashboard" icon={UserIcon} currentPath={location.pathname} onClick={() => setIsMobileMenuOpen(false)}>
                Organizadores
              </NavItem>
              <NavItem to="/admin/eventos" icon={Ticket} currentPath={location.pathname} onClick={() => setIsMobileMenuOpen(false)}>
                Eventos
              </NavItem>
              <NavItem to="/admin/a-receber" icon={CircleDollarSign} currentPath={location.pathname} onClick={() => setIsMobileMenuOpen(false)}>
                A Receber
              </NavItem>
            </>
          ) : (
            <>
              <NavItem to="/organizador/eventos" icon={Ticket} currentPath={location.pathname} onClick={() => setIsMobileMenuOpen(false)}>
                Meus Eventos
              </NavItem>
              <NavItem to="/organizador/leitor-qr" icon={QrCode} currentPath={location.pathname} onClick={() => setIsMobileMenuOpen(false)}>
                Leitor de QR Code
              </NavItem>
            </>
          )}

          <NavItem to="/painel-entrega" icon={MonitorSpeaker} currentPath={location.pathname} onClick={() => setIsMobileMenuOpen(false)}>
            Painel de Entrega
          </NavItem>

          <NavItem to="/organizador/relatorios" icon={FileText} currentPath={location.pathname} onClick={() => setIsMobileMenuOpen(false)}>
            Relatórios
          </NavItem>
        </nav>

        <div className="p-6 border-t border-border mt-auto">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center text-primary font-bold text-sm overflow-hidden border border-border">
               <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user.nome}`} alt="Avatar" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold truncate text-foreground">{user.nome}</p>
              <p className="text-xs text-muted-foreground truncate">{user.email}</p>
            </div>
          </div>
          <Button 
            variant="outline" 
            className="w-full justify-center gap-2 text-muted-foreground border-border hover:bg-secondary hover:text-foreground h-9 font-bold"
            onClick={handleLogout}
          >
            <LogOut size={16} />
            Sair do Sistema
          </Button>
        </div>
      </aside>

      {/* Overlay for mobile menu */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-20 lg:hidden backdrop-blur-sm"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0">
        <header className="hidden lg:flex h-[72px] bg-background border-b border-border items-center justify-between px-8 sticky top-0 z-10 font-bold uppercase tracking-widest text-xs">
           <h1 className="text-xl font-bold text-foreground">
            {user.tipo === 'ADMIN' ? 'Gestão de Organizadores' : 'Painel do Organizador'}
           </h1>
           <div className="flex items-center gap-4">
              <span className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] bg-secondary px-3 py-1.5 rounded-full border border-border">v1.1.0 (PRO)</span>
           </div>
        </header>

        <div className="p-4 md:p-8 transition-all animate-in fade-in duration-500 overflow-x-hidden">
          {children}
        </div>
      </main>
    </div>
  );
}
