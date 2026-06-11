import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { api } from '@/lib/api';
import { Participant, Event } from '@/types';
import { 
  Loader2, 
  CheckCircle2,
  AlertCircle,
  User,
  X,
  ArrowRight,
  Fingerprint,
  Calendar,
  Target,
  Users,
  Package,
  MapPin,
  ChevronRight,
  Layers,
  Hash
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

export default function TotemPage() {
  const { slug } = useParams<{ slug: string }>();
  const [event, setEvent] = useState<Event | null>(null);
  const [step, setStep] = useState<'welcome' | 'search' | 'details' | 'confirmation'>('welcome');
  const [selectedParticipant, setSelectedParticipant] = useState<Participant | null>(null);
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSearching, setIsSearching] = useState(false);
  const [deliveringId, setDeliveringId] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  const inputRef = useRef<HTMLInputElement>(null);

  // Return to welcome screen automatically after 5 seconds of the final confirmation screen
  useEffect(() => {
    if (step === 'confirmation') {
      const timer = setTimeout(() => {
        resetTotem();
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [step]);

  useEffect(() => {
    if (slug) {
      fetchEvent();
    }
  }, [slug]);

  useEffect(() => {
    if (step === 'search' && inputRef.current) {
      inputRef.current.focus();
    }
  }, [step]);

  const fetchEvent = async () => {
    try {
      const data = await api.getTotemEvento(slug!);
      setEvent(data);
    } catch (err: any) {
      setError(err.message || 'Evento não encontrado');
    } finally {
      setIsLoading(false);
    }
  };

  const performSearch = async (customSearch?: string) => {
    const term = customSearch !== undefined ? customSearch : search;
    if (!term || term.length < 2) return;
    setIsSearching(true);
    setError('');
    try {
      const results = await api.buscarParticipantesTotem(slug!, term);
      if (results.length > 0) {
        // Find by exact CPF match if possible, or take the first result
        const exactMatch = results.find(p => p.cpf.replace(/\D/g, '') === term.replace(/\D/g, ''));
        const p = exactMatch || results[0];
        
        if (p.status === 'ENTREGUE') {
          setError('Kit já retirado anteriormente.');
          return;
        }

        setSelectedParticipant(p);
        setStep('details');
      } else {
        setError('CPF não encontrado ou já retirado');
      }
    } catch (err) {
      setError('Erro ao buscar participante');
    } finally {
      setIsSearching(false);
    }
  };

  const handleDeliver = async (id: string) => {
    setDeliveringId(id);
    setError('');
    setSuccess('');
    try {
      await api.entregarKit(id);
      
      setStep('confirmation');

    } catch (err: any) {
      setError(err.message || 'Erro ao realizar entrega');
    } finally {
      setDeliveringId(null);
    }
  };

  const resetTotem = () => {
    setSearch('');
    setSelectedParticipant(null);
    setSuccess('');
    setError('');
    setStep('welcome');
  };

  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-slate-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-12 h-12 animate-spin text-primary" />
          <p className="text-slate-500 font-bold uppercase tracking-widest text-sm">Carregando Totem...</p>
        </div>
      </div>
    );
  }

  if (error && !event) {
    return (
      <div className="fixed inset-0 bg-slate-50 flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-white p-8 rounded-3xl shadow-2xl text-center border-t-8 border-red-500">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-black text-slate-900 mb-2">{error}</h1>
          <p className="text-slate-500">Verifique se o link está correto ou contate o administrador.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-indigo-600 flex flex-col font-sans select-none overflow-x-hidden">
      
      {/* TELA 1 — BOAS-VINDAS */}
      {step === 'welcome' && (
        <div 
          className="min-h-screen flex flex-col items-center justify-center p-6 md:p-12 text-white cursor-pointer relative"
          onClick={() => setStep('search')}
        >
          <div className="absolute inset-0 overflow-hidden opacity-20 pointer-events-none">
            <div className="absolute -top-48 -left-48 w-[400px] md:w-[800px] h-[400px] md:h-[800px] bg-white rounded-full blur-[100px] md:blur-[160px] animate-pulse" />
            <div className="absolute -bottom-48 -right-48 w-[400px] md:w-[800px] h-[400px] md:h-[800px] bg-indigo-400 rounded-full blur-[100px] md:blur-[160px] animate-pulse delay-700" />
          </div>

          <div className="relative z-10 w-full max-w-5xl mx-auto text-center space-y-6 md:space-y-8 animate-in fade-in zoom-in duration-700 flex flex-col items-center justify-center">
            {event?.imageUrl && (
              <div className="mx-auto w-full max-w-[200px] md:max-w-lg flex justify-center mb-0 md:mb-6">
                <img 
                  src={event.imageUrl} 
                  alt={event.nome} 
                  className="max-h-[150px] md:max-h-[300px] w-auto object-contain rounded-2xl md:rounded-3xl shadow-2xl"
                  referrerPolicy="no-referrer"
                />
              </div>
            )}

            <div className="space-y-2">
               <p className="text-lg md:text-3xl font-bold uppercase tracking-[0.2em] md:tracking-[0.3em] text-indigo-100">Bem-vindo ao</p>
               <h1 className="text-3xl sm:text-5xl md:text-7xl font-black uppercase tracking-tighter leading-none drop-shadow-xl text-balance">
                 Autoatendimento
               </h1>
               <p className="text-xl sm:text-3xl md:text-5xl font-black uppercase tracking-tight text-white/90 px-4">
                 {event?.nome}
               </p>
            </div>

            <div className="pt-4 md:pt-8 w-full max-w-xs md:max-w-2xl mx-auto">
               <button className="w-full px-6 md:px-16 py-6 md:py-10 bg-white text-indigo-600 rounded-2xl md:rounded-full shadow-[0_15px_40px_-10px_rgba(0,0,0,0.3)] md:shadow-[0_25px_60px_-15px_rgba(0,0,0,0.4)] transition-all active:scale-95 group">
                 <span className="text-xl sm:text-3xl md:text-5xl font-black uppercase tracking-tight">CLIQUE AQUI PARA INICIAR</span>
               </button>
            </div>
          </div>
        </div>
      )}

      {/* TELA 2 — BUSCA */}
      {step === 'search' && (
        <div className="min-h-screen bg-white flex flex-col items-center justify-center p-6 md:p-8 animate-in fade-in duration-500 overflow-y-auto">
          <div className="max-w-5xl w-full flex flex-col items-center space-y-8 md:space-y-16 my-auto">
            
            <div className="text-center space-y-4">
               <h2 className="text-4xl sm:text-6xl md:text-8xl font-black text-slate-900 uppercase tracking-tighter leading-none">Retirada de Kit</h2>
               <p className="text-lg sm:text-2xl md:text-3xl text-slate-400 font-bold uppercase tracking-widest leading-tight text-balance">
                 Digite seu CPF para iniciar o autoatendimento
               </p>
            </div>

            <div className="w-full flex flex-col items-center gap-6 justify-center">
              <div className="relative w-full max-w-3xl">
                <Input 
                  ref={inputRef}
                  type="tel"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  placeholder="DIGITE SEU CPF"
                  className="w-full h-24 md:h-40 px-6 md:px-10 bg-slate-50 border-2 md:border-4 border-slate-100 rounded-2xl md:rounded-[2.5rem] text-3xl sm:text-4xl md:text-6xl font-black uppercase placeholder:text-slate-200 focus-visible:ring-indigo-600 focus-visible:border-indigo-600 transition-all text-center text-slate-800 shadow-inner"
                  value={search}
                  onChange={(e) => {
                    const val = e.target.value;
                    const cleaned = val.replace(/\D/g, '');
                    
                    if (cleaned.length <= 11) {
                      setSearch(val);
                      if (cleaned.length === 11) {
                        inputRef.current?.blur();
                        performSearch(cleaned);
                      }
                    }
                  }}
                  onKeyDown={(e) => e.key === 'Enter' && performSearch()}
                />
              </div>
              
              <Button 
                onClick={performSearch}
                disabled={isSearching}
                className="w-full max-w-3xl h-20 md:h-40 px-10 md:px-16 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl md:rounded-[2.5rem] shadow-xl md:shadow-2xl shadow-indigo-200 text-xl sm:text-3xl md:text-4xl font-black uppercase tracking-tight flex items-center justify-center transition-all active:scale-95 disabled:opacity-50"
              >
                {isSearching ? <Loader2 className="w-12 h-12 md:w-16 md:h-16 animate-spin" /> : "BUSCAR MEU KIT"}
              </Button>
            </div>

            {error && (
              <div className="w-full max-w-3xl p-6 md:p-10 rounded-2xl md:rounded-[2.5rem] border-2 md:border-4 bg-red-50 border-red-200 text-red-800 flex flex-col md:flex-row items-center text-center md:text-left gap-4 md:gap-8 animate-in slide-in-from-top-6 duration-300">
                 <AlertCircle className="w-12 h-12 md:w-16 md:h-16 flex-shrink-0" />
                 <p className="text-xl sm:text-2xl md:text-4xl font-black uppercase tracking-tight leading-tight">{error}</p>
              </div>
            )}

            <div className="pt-4">
              <button onClick={resetTotem} className="text-slate-300 hover:text-indigo-600 font-black uppercase tracking-[0.2em] text-xs transition-colors px-6 py-3">
                Recomeçar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TELA 3 — DADOS DO ATLETA */}
      {step === 'details' && selectedParticipant && (
        <div className="min-h-screen bg-slate-100 flex flex-col sm:items-center sm:justify-center p-4 md:p-8 animate-in slide-in-from-right duration-500 overflow-y-auto">
          <div className="max-w-4xl w-full bg-white rounded-[2rem] md:rounded-[3rem] shadow-2xl overflow-hidden flex flex-col my-auto border-4 border-white">
            
            <div className="text-center py-8 md:py-12">
               <h2 className="text-primary text-3xl md:text-5xl font-black uppercase tracking-tighter">SEUS DADOS</h2>
               <p className="text-slate-400 font-bold uppercase tracking-widest mt-1 md:mt-2 px-6">{event?.nome}</p>
            </div>

            <div className="px-6 md:px-12 pb-12">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
                
                {/* Data Card Blocks */}
                <div className="flex items-center gap-4 p-4 md:p-5 bg-slate-50/50 rounded-2xl border border-slate-100 group transition-all hover:bg-white hover:shadow-md">
                  <div className="w-10 h-10 md:w-12 md:h-12 bg-white rounded-xl shadow-sm flex items-center justify-center text-slate-300 group-hover:text-primary transition-colors">
                    <User size={20} className="md:w-24 md:h-24" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest leading-none mb-1">NOME COMPLETO</p>
                    <p className="text-base md:text-lg font-black text-slate-900 uppercase truncate leading-tight">{selectedParticipant.nome}</p>
                  </div>
                </div>

                <div className="flex items-center gap-4 p-4 md:p-5 bg-slate-50/50 rounded-2xl border border-slate-100 group transition-all hover:bg-white hover:shadow-md">
                  <div className="w-10 h-10 md:w-12 md:h-12 bg-white rounded-xl shadow-sm flex items-center justify-center text-slate-300 group-hover:text-primary transition-colors">
                    <Hash size={20} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest leading-none mb-1">CPF</p>
                    <p className="text-base md:text-lg font-black text-slate-900 uppercase truncate leading-tight">{selectedParticipant.cpf}</p>
                  </div>
                </div>

                <div className="flex items-center gap-4 p-4 md:p-5 bg-slate-50/50 rounded-2xl border border-slate-100 group transition-all hover:bg-white hover:shadow-md">
                  <div className="w-10 h-10 md:w-12 md:h-12 bg-white rounded-xl shadow-sm flex items-center justify-center text-slate-300 group-hover:text-primary transition-colors">
                    <Calendar size={20} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest leading-none mb-1">DATA DE NASCIMENTO</p>
                    <p className="text-base md:text-lg font-black text-slate-900 uppercase truncate leading-tight">{selectedParticipant.dataNascimento || '---'}</p>
                  </div>
                </div>

                <div className="flex items-center gap-4 p-4 md:p-5 bg-slate-50/50 rounded-2xl border border-slate-100 group transition-all hover:bg-white hover:shadow-md">
                  <div className="w-10 h-10 md:w-12 md:h-12 bg-white rounded-xl shadow-sm flex items-center justify-center text-slate-300 group-hover:text-primary transition-colors">
                    <Layers size={20} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest leading-none mb-1">MODALIDADE</p>
                    <p className="text-base md:text-lg font-black text-slate-900 uppercase truncate leading-tight">{selectedParticipant.modalidade}</p>
                  </div>
                </div>

                <div className="flex items-center gap-4 p-4 md:p-5 bg-slate-50/50 rounded-2xl border border-slate-100 group transition-all hover:bg-white hover:shadow-md">
                  <div className="w-10 h-10 md:w-12 md:h-12 bg-white rounded-xl shadow-sm flex items-center justify-center text-slate-300 group-hover:text-primary transition-colors">
                    <Users size={20} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest leading-none mb-1">EQUIPE</p>
                    <p className="text-base md:text-lg font-black text-slate-900 uppercase truncate leading-tight">{selectedParticipant.equipe || '---'}</p>
                  </div>
                </div>

                <div className="flex items-center gap-4 p-4 md:p-5 bg-slate-50/50 rounded-2xl border border-slate-100 group transition-all hover:bg-white hover:shadow-md">
                  <div className="w-10 h-10 md:w-12 md:h-12 bg-white rounded-xl shadow-sm flex items-center justify-center text-slate-300 group-hover:text-primary transition-colors">
                    <User size={20} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest leading-none mb-1">SEXO</p>
                    <p className="text-base md:text-lg font-black text-slate-900 uppercase truncate leading-tight">{selectedParticipant.sexo || '---'}</p>
                  </div>
                </div>

                <div className="flex items-center gap-4 p-4 md:p-5 bg-slate-50/50 rounded-2xl border border-slate-100 group transition-all hover:bg-white hover:shadow-md">
                  <div className="w-10 h-10 md:w-12 md:h-12 bg-white rounded-xl shadow-sm flex items-center justify-center text-slate-300 group-hover:text-primary transition-colors">
                    <Package size={20} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest leading-none mb-1">KIT DO ATLETA</p>
                    <p className="text-base md:text-lg font-black text-slate-900 uppercase truncate leading-tight">{selectedParticipant.kit || '---'}</p>
                  </div>
                </div>

                <div className="flex items-center gap-4 p-4 md:p-5 bg-slate-50/50 rounded-2xl border border-slate-100 group transition-all hover:bg-white hover:shadow-md">
                  <div className="w-10 h-10 md:w-12 md:h-12 bg-white rounded-xl shadow-sm flex items-center justify-center text-slate-300 group-hover:text-primary transition-colors">
                    <Package size={20} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest leading-none mb-1">TAMANHO CAMISETA</p>
                    <p className="text-base md:text-lg font-black text-slate-900 uppercase truncate leading-tight">{selectedParticipant.tamanhoCamiseta || '---'}</p>
                  </div>
                </div>

                <div className="flex items-center gap-4 p-4 md:p-5 bg-slate-50/50 rounded-2xl border border-slate-100 md:col-span-2 group transition-all hover:bg-white hover:shadow-md">
                  <div className="w-10 h-10 md:w-12 md:h-12 bg-white rounded-xl shadow-sm flex items-center justify-center text-slate-300 group-hover:text-primary transition-colors">
                    <MapPin size={20} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest leading-none mb-1">CIDADE DE RESIDÊNCIA</p>
                    <p className="text-base md:text-lg font-black text-slate-900 uppercase truncate leading-tight">{selectedParticipant.cidade || '---'}</p>
                  </div>
                </div>

              </div>

              {/* Action Area */}
              <div className="mt-8 md:mt-12 flex flex-col md:flex-row items-center gap-4 w-full">
                {success ? (
                  <div className="w-full p-8 bg-emerald-50 border-2 border-emerald-200 rounded-3xl text-emerald-800 text-center flex flex-col items-center gap-4 animate-in zoom-in-95">
                    <CheckCircle2 className="w-12 h-12 animate-bounce" />
                    <h3 className="text-2xl md:text-3xl font-black uppercase tracking-tight">Solicitação Enviada!</h3>
                    <p className="text-sm font-bold uppercase">Aguarde no balcão de entregas.</p>
                  </div>
                ) : error ? (
                   <div className="w-full p-6 bg-red-50 border-2 border-red-200 rounded-2xl text-red-800 flex items-center justify-center gap-4">
                      <AlertCircle className="w-8 h-8 flex-shrink-0" />
                      <p className="text-lg font-black uppercase tracking-tight">{error}</p>
                   </div>
                ) : (
                  <>
                    <Button 
                      variant="secondary"
                      onClick={resetTotem}
                      className="w-full md:w-1/3 h-16 md:h-20 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-2xl md:rounded-3xl font-black uppercase tracking-widest text-base md:text-lg"
                    >
                      CANCELAR
                    </Button>
                    <Button 
                      onClick={() => handleDeliver(selectedParticipant.id)}
                      disabled={deliveringId !== null}
                      className="w-full md:w-2/3 h-16 md:h-20 bg-primary hover:bg-primary/90 text-white rounded-2xl md:rounded-3xl shadow-xl shadow-primary/20 flex items-center justify-center gap-3 font-black uppercase tracking-widest text-base md:text-lg group"
                    >
                      {deliveringId ? (
                        <Loader2 className="w-10 h-10 animate-spin" />
                      ) : (
                        <>
                          SOLICITAR RETIRADA
                          <ArrowRight className="w-6 h-6 md:w-8 md:h-8 group-hover:translate-x-2 transition-transform" />
                        </>
                      )}
                    </Button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TELA 4 — CONFIRMAÇÃO FINAL */}
      {step === 'confirmation' && (
        <div className="min-h-screen bg-white flex flex-col items-center justify-center p-8 md:p-12 animate-in fade-in zoom-in duration-500 overflow-y-auto">
          <div className="max-w-5xl w-full text-center space-y-8 md:space-y-12 my-auto">
            <div className="flex justify-center mb-4 md:mb-8">
              <div className="w-24 h-24 md:w-40 md:h-40 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center animate-bounce shadow-inner">
                <CheckCircle2 className="w-16 h-16 md:w-24 md:h-24" />
              </div>
            </div>
            
            <h1 className="text-6xl sm:text-8xl md:text-[10rem] font-black text-emerald-600 uppercase tracking-tighter leading-none mb-4 md:mb-8">
              SOLICITADO!
            </h1>
            
            <div className="space-y-4 md:space-y-6 px-4">
              <p className="text-2xl sm:text-4xl md:text-6xl font-black text-slate-800 uppercase tracking-tight leading-tight">
                DIRIJA-SE AO GUICHÊ PARA RETIRADA DO KIT.
              </p>
              <p className="text-lg sm:text-2xl md:text-4xl font-bold text-slate-400 uppercase tracking-widest leading-tight pt-2 md:pt-4">
                VOCÊ SERÁ CHAMADO PELO NOME.
              </p>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 8px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #E2E8F0; border-radius: 99px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #CBD5E1; }
      `}</style>
    </div>
  );
}
