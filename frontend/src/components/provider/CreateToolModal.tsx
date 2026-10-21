import React, { useState, useEffect } from 'react';
import { rentaService } from '../../services/rentaService';
import { Category } from '../../types';
import { useApp } from '../../context/AppContext';
import { X, Plus, Wrench, DollarSign, ShieldAlert, CheckCircle2 } from 'lucide-react';

interface CreateToolModalProps {
  providerId: number;
  onClose: () => void;
  onSuccess: () => void;
}

export const CreateToolModal: React.FC<CreateToolModalProps> = ({
  providerId,
  onClose,
  onSuccess
}) => {
  const { showToast } = useApp();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    brand: '',
    model: '',
    codeSku: `HERR-${Math.floor(1000 + Math.random() * 9000)}`,
    categoryId: 1,
    baseDailyPrice: 150000,
    depositAmount: 500000,
    description: '',
    mainImageUrl: 'images/hero-excavator-studio.jpg'
  });

  useEffect(() => {
    rentaService.tools.getCategories()
      .then(cats => {
        setCategories(cats);
        if (cats.length > 0) {
          setFormData(prev => ({ ...prev, categoryId: cats[0].id }));
        }
      })
      .catch(() => {});
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.brand || !formData.model || !formData.description) {
      showToast('Por favor completa todos los campos obligatorios.', 'error');
      return;
    }
    if (Number(formData.baseDailyPrice) <= 0) {
      showToast('El precio diario de alquiler debe ser mayor a 0 COP.', 'error');
      return;
    }
    if (Number(formData.depositAmount) < 0) {
      showToast('El depósito de garantía no puede ser negativo.', 'error');
      return;
    }

    setLoading(true);
    try {
      await rentaService.tools.create({
        providerId,
        categoryId: Number(formData.categoryId),
        codeSku: formData.codeSku,
        name: formData.name,
        brand: formData.brand,
        model: formData.model,
        description: formData.description,
        baseDailyPrice: Number(formData.baseDailyPrice),
        depositAmount: Number(formData.depositAmount),
        mainImageUrl: formData.mainImageUrl
      });

      showToast(`Herramienta "${formData.name}" incorporada exitosamente al inventario.`, 'success');
      onSuccess();
      onClose();
    } catch (err: any) {
      showToast(`Error al registrar herramienta: ${err.message}`, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
      <div 
        className="bg-[#0f172a] border border-slate-700/80 rounded-2xl max-w-lg w-full shadow-2xl overflow-hidden glass-modal"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-5 border-b border-slate-800 bg-[#0a0f1d] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Plus className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white tracking-tight">
                Registrar Nueva Maquinaria / Herramienta
              </h3>
              <p className="text-xs text-slate-400 font-mono">
                Inventario Proveedor #{providerId} · Estándar 4FN
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto text-xs">
          <div>
            <label className="block text-slate-300 font-medium mb-1">Nombre del Equipo *</label>
            <input
              type="text"
              required
              placeholder="Ej: Excavadora de Orugas 20T"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-300 font-medium mb-1">Marca *</label>
              <input
                type="text"
                required
                placeholder="Ej: CAT, Bobcat, DeWalt"
                value={formData.brand}
                onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500"
              />
            </div>
            <div>
              <label className="block text-slate-300 font-medium mb-1">Modelo *</label>
              <input
                type="text"
                required
                placeholder="Ej: 320D, S570"
                value={formData.model}
                onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-300 font-medium mb-1">Código SKU *</label>
              <input
                type="text"
                required
                value={formData.codeSku}
                onChange={(e) => setFormData({ ...formData, codeSku: e.target.value })}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-slate-100 font-mono focus:outline-none focus:border-amber-500"
              />
            </div>
            <div>
              <label className="block text-slate-300 font-medium mb-1">Categoría *</label>
              <select
                value={formData.categoryId}
                onChange={(e) => setFormData({ ...formData, categoryId: Number(e.target.value) })}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-slate-100 focus:outline-none focus:border-amber-500"
              >
                {categories.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-300 font-medium mb-1">Precio Diario (COP) *</label>
              <input
                type="number"
                min="1000"
                step="1000"
                required
                value={formData.baseDailyPrice}
                onChange={(e) => setFormData({ ...formData, baseDailyPrice: Number(e.target.value) })}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-slate-100 font-mono focus:outline-none focus:border-amber-500"
              />
            </div>
            <div>
              <label className="block text-slate-300 font-medium mb-1">Depósito Garantía (COP) *</label>
              <input
                type="number"
                min="0"
                step="1000"
                required
                value={formData.depositAmount}
                onChange={(e) => setFormData({ ...formData, depositAmount: Number(e.target.value) })}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-slate-100 font-mono focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-300 font-medium mb-1">Descripción Técnica & Estado *</label>
            <textarea
              required
              rows={3}
              placeholder="Especifica cilindrada, capacidad operativa, horas de uso y accesorios incluidos..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500 resize-none"
            />
          </div>

          <div>
            <label className="block text-slate-300 font-medium mb-1">Ruta o URL de Imagen</label>
            <input
              type="text"
              value={formData.mainImageUrl}
              onChange={(e) => setFormData({ ...formData, mainImageUrl: e.target.value })}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2 text-slate-300 font-mono text-[11px] focus:outline-none focus:border-amber-500"
            />
          </div>

          <div className="pt-3 border-t border-slate-800 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl text-slate-400 hover:text-white transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold transition-all shadow-lg shadow-amber-500/20 disabled:opacity-50 flex items-center gap-2"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{loading ? 'Guardando...' : 'Guardar en Inventario'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
