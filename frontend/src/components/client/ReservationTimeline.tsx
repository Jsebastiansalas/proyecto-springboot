import React from 'react';
import { ReservationStatus } from '../../types';
import { 
  FileText, 
  CheckCircle2, 
  Truck, 
  HardHat, 
  ClipboardCheck, 
  Receipt,
  Clock
} from 'lucide-react';

interface ReservationTimelineProps {
  status: ReservationStatus;
}

export const ReservationTimeline: React.FC<ReservationTimelineProps> = ({ status }) => {
  const steps = [
    { key: 'SOLICITADA', label: 'Solicitada', icon: FileText, desc: 'Contrato firmado' },
    { key: 'APROBADA', label: 'Aprobada', icon: CheckCircle2, desc: 'Seguro y patio listos' },
    { key: 'DESPACHADA', label: 'Despachada', icon: Truck, desc: 'En ruta a obra' },
    { key: 'EN_OBRA', label: 'En Obra', icon: HardHat, desc: 'Operando en cuadrilla' },
    { key: 'INSPECCION', label: 'Inspección', icon: ClipboardCheck, desc: 'Retorno 4FN' },
    { key: 'LIQUIDADA', label: 'Liquidada', icon: Receipt, desc: 'Escrow liberado' },
  ];

  // Map database status to current step index
  let activeIndex = 0;
  if (status === 'APROBADA') activeIndex = 1;
  else if (status === 'EN_CURSO') activeIndex = 3;
  else if (status === 'FINALIZADA') activeIndex = 5;

  return (
    <div className="w-full py-4">
      {/* Stepper Grid */}
      <div className="relative flex items-center justify-between">
        
        {/* Background connecting line */}
        <div className="absolute top-4 left-6 right-6 h-0.5 bg-slate-800 -z-0" />
        
        {/* Active progress line */}
        <div 
          className="absolute top-4 left-6 h-0.5 bg-gradient-to-r from-indigo-500 via-sky-400 to-emerald-400 -z-0 transition-all duration-500"
          style={{ width: `${(activeIndex / (steps.length - 1)) * 90}%` }}
        />

        {steps.map((step, idx) => {
          const Icon = step.icon;
          const isCompleted = idx < activeIndex;
          const isCurrent = idx === activeIndex;

          let circleStyle = 'bg-slate-900 border-slate-700 text-slate-500';
          if (isCompleted) {
            circleStyle = 'bg-emerald-600 border-emerald-400 text-white shadow-lg shadow-emerald-600/30';
          } else if (isCurrent) {
            circleStyle = 'bg-[#D94E1F] border-[#D94E1F] text-white shadow-lg shadow-sm ring-4 ring-indigo-500/20';
          }

          return (
            <div key={step.key} className="flex flex-col items-center text-center z-10 px-1">
              <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all ${circleStyle}`}>
                <Icon className="w-3.5 h-3.5" />
              </div>
              <span className={`text-[11px] font-semibold mt-2 ${isCurrent ? 'text-[#D94E1F]' : isCompleted ? 'text-emerald-400' : 'text-slate-500'}`}>
                {step.label}
              </span>
              <span className="text-[9px] text-slate-500 hidden sm:block">
                {step.desc}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
