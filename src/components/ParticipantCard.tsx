import React from 'react';
import { Participant } from '@/types';
import { 
  User, 
  Tag as TagIcon, 
  MapPin, 
  CheckCircle2, 
  AlertCircle,
  Package
} from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ParticipantCardProps {
  participant: Participant;
  onDeliver: (id: string) => void;
  isLoading?: boolean;
}

export const ParticipantCard: React.FC<ParticipantCardProps> = ({ participant, onDeliver, isLoading }) => {
  const isDelivered = participant.status === 'ENTREGUE';

  return (
    <div className={`p-6 rounded-2xl border-2 transition-all shadow-lg ${
      isDelivered 
        ? 'bg-emerald-50 border-emerald-200' 
        : 'bg-white border-slate-200 hover:border-primary/50'
    }`}>
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
        <div className="space-y-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
               <span className="bg-primary text-white text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-widest">
                #{participant.numero || 'S/N'}
               </span>
               {participant.numeroPeito && (
                 <span className="bg-slate-900 text-white text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-widest">
                   Peito: {participant.numeroPeito}
                 </span>
               )}
            </div>
            <h3 className="text-2xl font-black text-slate-900 uppercase leading-none">
              {participant.nome}
            </h3>
            <p className="text-slate-500 font-mono text-sm mt-1">CPF: {participant.cpf}</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-3">
             <div className="flex items-center gap-2 text-slate-600">
               <TagIcon className="w-4 h-4 text-primary" />
               <span className="text-sm font-bold uppercase">{participant.modalidade || 'Geral'}</span>
             </div>
             <div className="flex items-center gap-2 text-slate-600">
               <Package className="w-4 h-4 text-primary" />
               <span className="text-sm font-bold uppercase">{participant.kit || 'Kit Básico'}</span>
             </div>
             <div className="flex items-center gap-2 text-slate-600">
               <MapPin className="w-4 h-4 text-primary" />
               <span className="text-sm uppercase">{participant.cidade || 'Não informada'}</span>
             </div>
             <div className="flex items-center gap-2 text-slate-600">
               <User className="w-4 h-4 text-primary" />
               <span className="text-sm uppercase">{participant.sexo || 'N/A'} - Tam: {participant.tamanhoCamiseta || '?'}</span>
             </div>
          </div>
        </div>

        <div className="flex flex-col items-center md:items-end justify-center min-w-[200px]">
          {isDelivered ? (
            <div className="flex flex-col items-center gap-1 animate-in zoom-in-95">
              <CheckCircle2 className="w-12 h-12 text-emerald-500" />
              <span className="text-emerald-700 font-black uppercase text-sm">Kit Entregue</span>
              {participant.entregueAt && (
                <span className="text-[10px] text-emerald-600/70 font-mono">
                  {new Date(participant.entregueAt).toLocaleTimeString()}
                </span>
              )}
            </div>
          ) : (
            <Button
              onClick={() => onDeliver(participant.id)}
              disabled={isLoading}
              className="w-full h-20 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-xl shadow-indigo-200 text-xl font-black uppercase tracking-tighter transition-all active:scale-95 flex flex-col gap-0"
            >
              {isLoading ? (
                <span className="animate-pulse">Processando...</span>
              ) : (
                <>
                  <span>Entregar Kit</span>
                  <span className="text-[10px] opacity-70 font-normal">Clique para confirmar</span>
                </>
              )}
            </Button>
          )}

          {!isDelivered && (
             <div className="mt-3 flex items-center gap-2 text-amber-600">
               <AlertCircle className="w-4 h-4" />
               <span className="text-[10px] font-bold uppercase tracking-tight">Verifique o documento do atleta</span>
             </div>
          )}
        </div>
      </div>
    </div>
  );
}
