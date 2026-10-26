import React, { useState } from 'react';
import { Star, X, CheckCircle, MessageSquare, ThumbsUp, Wrench } from 'lucide-react';
import { Reservation } from '../../types';

interface CreateReviewModalProps {
  reservation: Reservation;
  onClose: () => void;
  onSuccess: () => void;
}

export const CreateReviewModal: React.FC<CreateReviewModalProps> = ({
  reservation,
  onClose,
  onSuccess
}) => {
  const [rating, setRating] = useState<number>(5);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [comment, setComment] = useState<string>('');
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const ratingDescriptions: Record<number, string> = {
    1: 'Deficiente — Fallas mecánicas o bajo rendimiento en obra',
    2: 'Regular — Cumplió con limitaciones operativas',
    3: 'Aceptable — Operación estándar esperada',
    4: 'Muy Buena — Excelente fuerza y bajo consumo',
    5: 'Excelente (5/5) — Rendimiento industrial sobresaliente'
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!comment.trim()) {
      setError('Por favor redacta un comentario técnico sobre el desempeño del equipo.');
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const token = localStorage.getItem('auth_token') || sessionStorage.getItem('auth_token');
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const res = await fetch('/api/v1/reviews', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          reservationId: reservation.id,
          rating,
          comment: comment.trim()
        })
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.detail || errorData.message || 'Error al enviar reseña');
      }

      onSuccess();
    } catch (err: any) {
      setError(err.message || 'No se pudo registrar la calificación');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs animate-in fade-in">
      <div className="bg-[#181816] border border-[#363632] rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-5 text-[#F5F4F0]">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#363632] pb-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center border border-amber-500/30">
              <Star className="w-5 h-5 fill-amber-400" />
            </div>
            <div>
              <h3 className="text-base font-bold text-[#F5F4F0]">
                Calificar Maquinaria de Obra
              </h3>
              <p className="text-xs text-[#A8A69E] font-mono">
                {reservation.reservationCode || `RES-${reservation.id}`} · {reservation.toolName}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-[#232320] hover:bg-[#2C2C28] text-[#A8A69E] hover:text-[#F5F4F0] flex items-center justify-center border border-[#363632] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Info Banner */}
        <div className="p-3 bg-[#232320] rounded-xl border border-[#363632] text-xs text-[#A8A69E] flex items-center gap-2">
          <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>
            Tu alquiler ha finalizado exitosamente. Tu calificación técnica ayudará a otros contratistas a elegir maquinaria de alto rendimiento.
          </span>
        </div>

        {error && (
          <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-xs text-rose-300">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* Star Rating Selector */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-[#A8A69E] uppercase tracking-wider block">
              Puntuación General (1 a 5 Estrellas)
            </label>
            <div className="flex items-center gap-2">
              {[1, 2, 3, 4, 5].map(star => {
                const isFilled = (hoverRating || rating) >= star;
                return (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(0)}
                    className="p-1 focus:outline-none transition-transform hover:scale-110"
                  >
                    <Star
                      className={`w-8 h-8 transition-colors ${
                        isFilled
                          ? 'text-amber-400 fill-amber-400 drop-shadow-[0_0_8px_rgba(251,191,36,0.4)]'
                          : 'text-[#444440] hover:text-amber-200'
                      }`}
                    />
                  </button>
                );
              })}
              <span className="font-mono font-bold text-lg text-amber-400 ml-2">
                {hoverRating || rating}.0
              </span>
            </div>
            <p className="text-xs text-amber-300/80 font-mono italic">
              {ratingDescriptions[hoverRating || rating]}
            </p>
          </div>

          {/* Comment Field */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-[#A8A69E] uppercase tracking-wider flex items-center gap-1.5">
              <MessageSquare className="w-3.5 h-3.5 text-[#D94E1F]" />
              <span>Comentario Técnico y Experiencia en Terreno</span>
            </label>
            <textarea
              rows={4}
              value={comment}
              onChange={e => setComment(e.target.value)}
              placeholder="Describe el estado de entrega, fuerza del motor, consumo de combustible, horas trabajadas y confiabilidad en obra..."
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#232320] border border-[#363632] text-xs text-[#F5F4F0] placeholder-[#706E66] focus:border-[#D94E1F] focus:outline-none transition-colors resize-none"
            />
          </div>

          {/* Footer Buttons */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#363632]">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="px-4 py-2 rounded-xl bg-[#232320] hover:bg-[#2C2C28] text-xs font-bold text-[#A8A69E] hover:text-[#F5F4F0] border border-[#363632] transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2 rounded-xl bg-[#D94E1F] hover:bg-[#B83D14] text-white text-xs font-bold flex items-center gap-2 transition-colors shadow-lg disabled:opacity-50"
            >
              <ThumbsUp className="w-4 h-4" />
              <span>{submitting ? 'Publicando...' : 'Publicar Calificación'}</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
