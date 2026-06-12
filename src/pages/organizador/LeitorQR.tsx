import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { api } from '@/lib/api';
import { Participant } from '@/types';
import { Html5Qrcode } from 'html5-qrcode';
import { 
  QrCode, 
  Search, 
  Loader2, 
  Clock, 
  User, 
  MapPin, 
  CheckCircle2,
  Bell,
  Fingerprint,
  Calendar,
  Target,
  Package,
  Shirt,
  Info,
  ChevronLeft,
  AlertTriangle,
  Camera,
  CornerDownLeft,
  XCircle,
  Sparkles
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default function LeitorQRPage() {
  const { user } = useAuth();
  const [mode, setMode] = useState<'scan' | 'loading' | 'review' | 'not_found' | 'success'>('scan');
  const [cpfInput, setCpfInput] = useState('');
  const [scannedCpf, setScannedCpf] = useState('');
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  
  const [deliveryReq, setDeliveryReq] = useState<any | null>(null);
  const [alreadyDeliveredParticipant, setAlreadyDeliveredParticipant] = useState<any | null>(null);
  const [processingId, setProcessingId] = useState<string | null>(null);
  
  const scannerRef = useRef<Html5Qrcode | null>(null);

  // Initialize and clean up html5-qrcode scanner
  useEffect(() => {
    if (mode === 'scan') {
      const containerId = 'qr-reader';
      let activeScanner: Html5Qrcode | null = null;
      setError('');

      const timer = setTimeout(() => {
        const element = document.getElementById(containerId);
        if (!element) return;

        try {
          const html5QrCode = new Html5Qrcode(containerId);
          activeScanner = html5QrCode;
          scannerRef.current = html5QrCode;

          html5QrCode.start(
            { facingMode: 'environment' },
            {
              fps: 10,
              qrbox: (width, height) => {
                const min = Math.min(width, height);
                const size = Math.floor(min * 0.7);
                return { width: size, height: size };
              },
              aspectRatio: 1.0
            },
            (decodedText) => {
              handleCpfFound(decodedText);
            },
            () => {
              // Verbose error callback ignored for smooth experience
            }
          ).catch((startErr) => {
            console.error('Câmera start error:', startErr);
            setError('Não foi possível ativar a câmera secundária. Use a busca manual abaixo caso persistir.');
          });
        } catch (scannerErr) {
          console.error('Scanner init error:', scannerErr);
        }
      }, 400);

      return () => {
        clearTimeout(timer);
        if (activeScanner) {
          if (activeScanner.isScanning) {
            activeScanner.stop().then(() => {
              console.log('Câmera encerrada.');
            }).catch(err => {
              console.error('Erro ao parar câmera:', err);
            });
          }
        }
      };
    }
  }, [mode]);

  const extractCpf = (rawInput: string): string | null => {
    let text = rawInput.trim();
    // Remove any trailing slashes
    while (text.endsWith('/')) {
      text = text.slice(0, -1);
    }

    // Check if it represents a URL or hierarchy path
    if (text.includes('/') || text.toLowerCase().startsWith('http')) {
      const lastSlashIndex = text.lastIndexOf('/');
      if (lastSlashIndex !== -1) {
        text = text.slice(lastSlashIndex + 1);
      }
    }

    // Retain only digits to build the Brazilian CPF sequence
    const digitsOnly = text.replace(/\D/g, '');
    if (digitsOnly.length === 11) {
      return digitsOnly;
    }
    return null;
  };

  const handleCpfFound = async (cpf: string) => {
    const cleaned = extractCpf(cpf);
    if (!cleaned) {
      setError('CPF não identificado no QR Code.');
      return;
    }

    // Stop scanner if scanning before moving out of scan view
    if (scannerRef.current && scannerRef.current.isScanning) {
      try {
        await scannerRef.current.stop();
      } catch (err) {
        console.error('Falha ao parar câmera:', err);
      }
    }

    setScannedCpf(cleaned);
    setMode('loading');
    setError('');

    try {
      const result = await api.buscarPorCpf(cleaned);
      if (result.alreadyDelivered) {
        setAlreadyDeliveredParticipant(result.participant);
        setDeliveryReq(null);
        setMode('review');
      } else if (result.deliveryRequest) {
        setDeliveryReq(result.deliveryRequest);
        setAlreadyDeliveredParticipant(null);
        setMode('review');
      } else {
        setMode('not_found');
      }
    } catch (err: any) {
      setError(err.message || 'Código/CPF não localizado.');
      setMode('not_found');
    }
  };

  const handleManualSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!cpfInput) return;
    handleCpfFound(cpfInput);
  };

  const handleDeliverKit = async () => {
    if (!deliveryReq) return;
    setProcessingId(deliveryReq.id);
    setError('');

    try {
      // 1. If status is PENDENTE, call separarEntrega first
      if (deliveryReq.status === 'PENDENTE') {
        await api.separarEntrega(deliveryReq.id);
      }
      
      // 2. Call confirmarEntrega to finalize
      await api.confirmarEntrega(deliveryReq.id);
      
      // Play high quality audio indicator of success
      try {
        const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2568/2568-84.wav');
        audio.volume = 0.5;
        audio.play();
      } catch (audioErr) {
        console.warn('Som de confirmação bloqueado pelo navegador:', audioErr);
      }

      setMode('success');

      // Auto return to scanner after 2.5 seconds
      setTimeout(() => {
        handleReset();
      }, 2500);

    } catch (err: any) {
      setError(err.message || 'Erro ao registrar entrega do kit');
    } finally {
      setProcessingId(null);
    }
  };

  const handleReset = () => {
    setMode('scan');
    setCpfInput('');
    setScannedCpf('');
    setError('');
    setSuccessMsg('');
    setDeliveryReq(null);
    setAlreadyDeliveredParticipant(null);
  };

  const formatCpf = (v: string) => {
    const cleaned = v.replace(/\D/g, '');
    if (cleaned.length <= 11) {
      return cleaned
        .replace(/(\d{3})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d{1,2})$/, '$1-$2');
    }
    return cleaned;
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Title block */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
            <QrCode className="w-9 h-9 text-[#2563EB]" />
            Leitor de QR Code
          </h1>
          <p className="text-sm font-semibold text-slate-400 mt-1">
            Entrega expressa de kit realizando a leitura do QR Code / CPF do atleta.
          </p>
        </div>
        
        {mode !== 'scan' && (
          <Button onClick={handleReset} variant="outline" className="gap-2 rounded-xl">
            <ChevronLeft size={16} /> Voltar para Leitor
          </Button>
        )}
      </div>

      <AnimatePresence mode="wait">
        {mode === 'scan' && (
          <motion.div
            key="scan-view"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="grid grid-cols-1 md:grid-cols-5 gap-8 items-start"
          >
            {/* Camera scanner card */}
            <div className="md:col-span-3 bg-white border border-slate-200 rounded-[2rem] shadow-xl p-8 flex flex-col items-center">
              <h2 className="text-lg font-black text-slate-900 uppercase tracking-tighter mb-4 flex items-center gap-2">
                <Camera size={18} className="text-blue-600 animate-pulse" />
                Câmera do Atendimento
              </h2>
              
              <div className="w-full relative rounded-2xl overflow-hidden aspect-square bg-slate-900 border border-slate-800 flex items-center justify-center">
                {/* Visual Target box */}
                <div className="absolute inset-0 pointer-events-none border-[16px] border-slate-950/40 z-10 flex items-center justify-center">
                  <div className="w-2/3 h-2/3 border-2 border-indigo-500 rounded-2xl relative shadow-[0_0_20px_rgba(99,102,241,0.3)]">
                    {/* Glowing Scan Bar */}
                    <div className="absolute left-0 right-0 h-0.5 bg-indigo-500 shadow-[0_0_10px_#6366f1] animate-bounce top-1/2" />
                    
                    {/* Corners details */}
                    <div className="absolute top-0 left-0 w-4 h-4 border-t-4 border-l-4 border-indigo-500 -mt-[3px] -ml-[3px]" />
                    <div className="absolute top-0 right-0 w-4 h-4 border-t-4 border-r-4 border-indigo-500 -mt-[3px] -mr-[3px]" />
                    <div className="absolute bottom-0 left-0 w-4 h-4 border-b-4 border-l-4 border-indigo-500 -mb-[3px] -ml-[3px]" />
                    <div className="absolute bottom-0 right-0 w-4 h-4 border-b-4 border-r-4 border-indigo-500 -mb-[3px] -mr-[3px]" />
                  </div>
                </div>

                <div id="qr-reader" className="w-full h-full object-cover" />
              </div>

              <p className="text-xs text-slate-400 font-bold text-center mt-4 uppercase tracking-widest leading-none">
                Posicione o QR Code obtido no Totem na área verde do vídeo
              </p>
            </div>

            {/* Manual input fallback card */}
            <div className="md:col-span-2 space-y-6">
              <div className="bg-white border border-slate-200 rounded-[2rem] shadow-xl p-8">
                <h3 className="text-lg font-black text-slate-900 uppercase tracking-tighter mb-3 flex items-center gap-2">
                  <Search size={18} className="text-indigo-600" />
                  Busca por CPF
                </h3>
                <p className="text-xs font-semibold text-slate-400 leading-relaxed mb-6">
                  Se o atleta não tiver o QR Code em mãos ou a câmera falhar, digite o CPF abaixo para buscar.
                </p>

                <form onSubmit={handleManualSearch} className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-black uppercase tracking-wider text-slate-400">CPF do Atleta</label>
                    <Input 
                      placeholder="000.000.000-00"
                      className="h-14 font-semibold text-base border-slate-200 rounded-xl focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all font-mono"
                      value={formatCpf(cpfInput)}
                      onChange={(e) => setCpfInput(e.target.value)}
                    />
                  </div>

                  <Button type="submit" disabled={!cpfInput} className="w-full h-14 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl tracking-wide text-sm flex items-center justify-center gap-2 shadow-xl shadow-indigo-100 transition-all active:scale-[0.98]">
                    <Search size={18} />
                    Buscar Atleta
                  </Button>
                </form>
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-600 px-5 py-4 rounded-2xl flex items-start gap-3 shadow-md animate-in slide-in-from-bottom-2 duration-300">
                  <XCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-sm font-black uppercase tracking-tight">
                      {error.includes('câmera') || error.includes('ativar') ? 'Falha na ativação' : 'Aviso do Scanner'}
                    </h4>
                    <p className="text-xs mt-1 font-semibold text-red-500/90 leading-relaxed">{error}</p>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}

        {mode === 'loading' && (
          <motion.div
            key="loading-view"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="bg-white border border-slate-200 rounded-[2.5rem] p-16 shadow-2xl flex flex-col items-center justify-center text-center min-h-[400px]"
          >
            <Loader2 className="w-16 h-16 animate-spin text-blue-600 mb-6" />
            <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tighter mb-2">Localizando Registro</h2>
            <p className="text-sm font-semibold text-slate-400 max-w-sm uppercase tracking-wide">
              Buscando atletas inscritos e mapeando requisições com CPF <span className="font-mono text-indigo-600 font-black">{formatCpf(scannedCpf)}</span>...
            </p>
          </motion.div>
        )}

        {mode === 'not_found' && (
          <motion.div
            key="not-found-view"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="bg-white border border-slate-200 rounded-[2.5rem] p-12 shadow-2xl text-center flex flex-col items-center min-h-[400px] justify-center"
          >
            <div className="w-20 h-20 rounded-full bg-red-50 text-red-500 flex items-center justify-center mb-6 border border-red-100 shadow-md">
              <AlertTriangle size={36} />
            </div>
            <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tighter mb-2">Atleta Não Encontrado</h2>
            <p className="text-sm font-semibold text-slate-400 max-w-sm font-mono mb-8 bg-slate-50 px-4 py-2 rounded-xl border border-slate-100">
              CPF: {formatCpf(scannedCpf)}
            </p>
            <p className="text-slate-500 text-sm max-w-md leading-relaxed mb-8">
              Não encontramos nenhum participante ativo cadastrado com este CPF nos seus eventos deste painel. Verifique se o atleta está inscrito neste evento.
            </p>
            <Button onClick={handleReset} className="px-8 h-14 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl shadow-lg transition-transform active:scale-[0.98]">
              Tentar Novamente
            </Button>
          </motion.div>
        )}

        {mode === 'success' && (
          <motion.div
            key="success-view"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="bg-white border border-slate-200 rounded-[2.5rem] p-12 shadow-2xl text-center flex flex-col items-center min-h-[460px] justify-center"
          >
            <div className="w-24 h-24 rounded-full bg-emerald-50 text-emerald-500 flex items-center justify-center mb-6 border border-emerald-100 shadow-xl relative">
              <div className="absolute inset-0 bg-emerald-500/10 rounded-full animate-ping pointer-events-none" />
              <CheckCircle2 size={54} className="animate-in zoom-in duration-300 md:scale-110" />
            </div>
            
            <h2 className="text-3xl font-black text-slate-900 uppercase tracking-tight mb-2 flex items-center gap-2">
              <Sparkles className="w-6 h-6 text-emerald-500" />
              Kit Entregue com Sucesso!
            </h2>
            
            <p className="text-sm font-semibold text-slate-400 font-mono mb-8 bg-slate-50 px-6 py-2.5 rounded-xl border border-slate-100 decoration-none inline-block">
              {deliveryReq?.participant?.nome?.toUpperCase() || 'ATLETA'}
            </p>

            <p className="text-slate-500 text-sm max-w-md leading-relaxed mb-8">
              A entrega foi registrada permanentemente no banco de dados e sincronizada na nuvem com o sistema. O status do atendimento agora é finalizado.
            </p>

            <div className="text-[10px] font-black uppercase text-slate-300 tracking-[0.2em] animate-pulse">
              Redirecionando para o scanner em instantes...
            </div>
          </motion.div>
        )}

        {mode === 'review' && (
          <motion.div
            key="review-view"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 30 }}
            className="bg-white border border-slate-100 rounded-[2.5rem] p-8 md:p-10 shadow-2xl max-w-3xl mx-auto flex flex-col relative text-slate-900"
          >
            {/* Already Delivered Header Banner */}
            {alreadyDeliveredParticipant ? (
              <div className="mb-6 p-5 bg-amber-50 rounded-[1.5rem] border border-amber-200 flex items-start gap-4">
                <AlertTriangle className="w-8 h-8 text-amber-500 flex-shrink-0 mt-0.5 animate-bounce" />
                <div>
                  <h3 className="text-base font-black text-amber-900 uppercase tracking-tight">KITS JÁ ENTREGUES!</h3>
                  <p className="text-xs font-semibold text-amber-700 leading-relaxed mt-1">
                    Este atleta/kit de CPF <span className="font-mono font-black">{formatCpf(scannedCpf)}</span> já foi retirado anteriormente.
                  </p>
                  {alreadyDeliveredParticipant.entregueAt && (
                    <p className="text-[11px] font-bold text-amber-600 mt-2 bg-white/60 p-2 rounded-lg border border-amber-200 inline-block font-mono">
                      Data da Entrega: {new Date(alreadyDeliveredParticipant.entregueAt).toLocaleString('pt-BR')}
                    </p>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2 mb-6">
                <span className="text-[10px] bg-indigo-50 text-indigo-600 border border-indigo-100 px-3 py-1 rounded-full font-black uppercase tracking-wider">
                  Check-in QR Code Express
                </span>
                <span className="text-[10px] bg-slate-50 text-slate-500 border border-slate-100 px-3 py-1 rounded-full font-bold uppercase truncate max-w-xs">
                  Evento: {deliveryReq?.event?.nome}
                </span>
              </div>
            )}

            {/* Visual highlight representation of chest/registration number matching exact panel */}
            {(() => {
              const p = alreadyDeliveredParticipant || deliveryReq?.participant;
              if (!p) return null;
              return (
                <>
                  {/* HUGE NUMERO DE PEITO VISUAL */}
                  <div className={`flex flex-col items-center justify-center border py-6 md:py-8 px-10 rounded-2xl mb-8 relative group overflow-hidden shadow-sm ${
                    alreadyDeliveredParticipant 
                      ? 'from-amber-50 to-orange-50/50 border-amber-200 bg-amber-50/20'
                      : 'from-indigo-50 to-blue-50/50 border-indigo-100 bg-indigo-50/30'
                  }`}>
                    <p className={`text-[11px] font-black uppercase tracking-[0.2em] md:tracking-[0.35em] mb-2 ${
                      alreadyDeliveredParticipant ? 'text-amber-500' : 'text-indigo-400'
                    }`}>NÚMERO DE PEITO</p>
                    <span className={`text-7xl md:text-8xl font-black leading-none drop-shadow-sm select-all ${
                      alreadyDeliveredParticipant ? 'text-amber-600' : 'text-indigo-600'
                    }`}>{p.numeroPeito || '---'}</span>
                  </div>

                  {/* Header Participant Info */}
                  <div className="mb-6 text-center md:text-left">
                    <h3 className="text-3xl md:text-4xl font-black text-slate-900 uppercase leading-none tracking-tight mb-2">
                      {p.nome}
                    </h3>
                    <p className="text-sm md:text-md font-bold text-slate-400 capitalize flex items-center justify-center md:justify-start gap-1.5">
                      <Target size={16} className="text-slate-400" />
                      {p.modalidade || 'Individual'}
                    </p>
                  </div>

                  {/* Carbon-Copy Data Grid with elegant pairings */}
                  <div className="grid grid-cols-2 gap-y-5 gap-x-4 mb-8 bg-slate-50/50 p-6 rounded-2xl border border-slate-100">
                    <div className="space-y-1">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5 font-mono">
                        <Fingerprint size={12} className="text-indigo-500" /> CPF
                      </p>
                      <p className="text-sm font-black text-slate-950 uppercase truncate leading-none">{formatCpf(p.cpf)}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5 font-mono">
                        <Calendar size={12} className="text-indigo-500" /> NASCIMENTO
                      </p>
                      <p className="text-sm font-black text-slate-950 uppercase truncate leading-none">{p.dataNascimento || '---'}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5 font-mono">
                        <Info size={12} className="text-indigo-500" /> MODALIDADE
                      </p>
                      <p className="text-sm font-black text-slate-950 uppercase truncate leading-none">{p.modalidade || '---'}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5 font-mono">
                        <User size={12} className="text-indigo-500" /> SEXO
                      </p>
                      <p className="text-sm font-black text-slate-950 uppercase truncate leading-none">{p.sexo || '---'}</p>
                    </div>
                    <div className="space-y-1 col-span-2 bg-white p-3.5 rounded-xl border border-slate-100 shadow-sm">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5 mb-1 font-mono">
                        <Package size={14} className="text-indigo-500" /> KIT PARA ENTREGA
                      </p>
                      <p className="text-sm font-black text-slate-950 uppercase break-words whitespace-pre-wrap leading-relaxed">{p.kit || '---'}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5 font-mono">
                        <Shirt size={12} className="text-indigo-500" /> CAMISETA
                      </p>
                      <p className="text-sm font-black text-slate-950 uppercase truncate leading-none">{p.tamanhoCamiseta || '---'}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5 font-mono">
                        <MapPin size={12} className="text-indigo-500" /> CIDADE
                      </p>
                      <p className="text-sm font-black text-slate-950 uppercase truncate leading-none">{p.cidade || '---'}</p>
                    </div>
                  </div>

                  {/* Actions exactly replicating delivery panel visual buttons */}
                  <div className="mt-auto">
                    {alreadyDeliveredParticipant ? (
                      <Button 
                        onClick={handleReset}
                        className="w-full h-16 bg-slate-900 hover:bg-slate-800 text-white rounded-2xl font-black uppercase text-sm tracking-widest shadow-xl flex items-center justify-center gap-3 transition-transform active:scale-[0.98]"
                      >
                        ESCANEAR PRÓXIMO QR CODE
                      </Button>
                    ) : (
                      <div className="flex flex-col md:flex-row gap-4">
                        <Button 
                          onClick={handleReset}
                          variant="outline"
                          disabled={processingId === deliveryReq.id}
                          className="flex-1 h-16 border-slate-200 text-slate-600 rounded-2xl font-black uppercase text-xs tracking-widest transition-all"
                        >
                          Voltar
                        </Button>
                        <Button 
                          onClick={handleDeliverKit}
                          disabled={processingId === deliveryReq.id}
                          className="flex-[2] h-16 bg-emerald-600 text-white hover:bg-emerald-700 rounded-2xl font-black uppercase text-sm tracking-widest shadow-xl shadow-emerald-200 flex items-center justify-center gap-3 transition-transform active:scale-[0.98]"
                        >
                          {processingId === deliveryReq.id ? (
                            <Loader2 size={24} className="animate-spin" />
                          ) : (
                            <>
                              <CheckCircle2 size={24} />
                              ENTREGAR KIT
                            </>
                          )}
                        </Button>
                      </div>
                    )}
                  </div>
                </>
              );
            })()}

            {error && (
              <div className="mt-4 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl-lg flex items-center gap-3 animate-pulse">
                <AlertTriangle className="w-5 h-5 flex-shrink-0" />
                <p className="text-xs font-bold">{error}</p>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
