import React from 'react';

/**
 * Normaliza cualquier URL de imagen de maquinaria para asegurar que resuelva
 * desde la raíz del servidor o conserve URLs absolutas HTTP(S).
 */
export const formatImageUrl = (url?: string | null): string => {
  if (!url || !url.trim()) return '/images/tools/placeholder-tool.svg';
  const clean = url.trim();
  if (clean.startsWith('http://') || clean.startsWith('https://')) return clean;
  return '/' + clean.replace(/^\//, '');
};

/**
 * Manejador defensivo de errores en etiquetas <img> para evitar el ícono de imagen rota.
 * Si falla la imagen principal, primero intenta con la imagen de catálogo Caterpillar y
 * si esa fallara, recurre al placeholder vectorial SVG de RENTAMAQ.
 */
export const handleImageError = (
  e: React.SyntheticEvent<HTMLImageElement, Event>,
  fallback: string = '/images/tools/generador-diesel-caterpillar.jpg'
): void => {
  const target = e.target as HTMLImageElement;
  if (!target.dataset.fallback) {
    target.dataset.fallback = 'primary';
    target.src = fallback;
  } else if (target.dataset.fallback === 'primary') {
    target.dataset.fallback = 'final';
    target.src = '/images/tools/placeholder-tool.svg';
  }
};
