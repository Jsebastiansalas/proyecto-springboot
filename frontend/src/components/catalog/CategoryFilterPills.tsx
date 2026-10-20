import React from 'react';
import { Category } from '../../types';
import { 
  Layers, 
  Wrench, 
  Zap, 
  Hammer, 
  Truck, 
  HardHat 
} from 'lucide-react';

interface CategoryFilterPillsProps {
  categories: Category[];
  selectedCategoryId: number | null;
  onSelectCategory: (id: number | null) => void;
}

export const CategoryFilterPills: React.FC<CategoryFilterPillsProps> = ({
  categories,
  selectedCategoryId,
  onSelectCategory,
}) => {
  const getCategoryIcon = (name: string) => {
    const lower = name.toLowerCase();
    if (lower.includes('energía') || lower.includes('generador')) return Zap;
    if (lower.includes('tierra') || lower.includes('excav')) return Truck;
    if (lower.includes('compact') || lower.includes('pavi')) return Hammer;
    if (lower.includes('elev') || lower.includes('altura')) return HardHat;
    return Wrench;
  };

  return (
    <div className="flex items-center gap-2 overflow-x-auto pb-3 pt-1 scrollbar-none">
      <button
        onClick={() => onSelectCategory(null)}
        className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap flex items-center gap-2 transition-all shrink-0 ${
          selectedCategoryId === null
            ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30 border border-indigo-500'
            : 'bg-slate-900/80 text-slate-300 hover:bg-slate-800 border border-slate-800'
        }`}
      >
        <Layers className="w-3.5 h-3.5" />
        <span>Todos los Equipos</span>
      </button>

      {categories.map(cat => {
        const Icon = getCategoryIcon(cat.name);
        const isSelected = selectedCategoryId === cat.id;

        return (
          <button
            key={cat.id}
            onClick={() => onSelectCategory(cat.id)}
            className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap flex items-center gap-2 transition-all shrink-0 ${
              isSelected
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30 border border-indigo-500'
                : 'bg-slate-900/80 text-slate-300 hover:bg-slate-800 border border-slate-800'
            }`}
          >
            <Icon className={`w-3.5 h-3.5 ${isSelected ? 'text-white' : 'text-indigo-400'}`} />
            <span>{cat.name}</span>
            {cat.toolCount !== undefined && (
              <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded-full ${
                isSelected ? 'bg-indigo-700 text-indigo-100' : 'bg-slate-800 text-slate-400'
              }`}>
                {cat.toolCount}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
};
