import { BANDAS } from '../data/bandas';
import { cargarNombre } from './guardado';

/**
 * Pixelify Sans dibuja mal las ligaduras "fi" y "fl" en canvas ("figurita" se ve "Agurita").
 * Un separador invisible (U+200C) entre las letras las evita.
 */
export function sinLigaduras(texto: string): string {
  return texto.replace(/f(?=[fil])/g, 'f\u200C');
}

/** Reemplaza {jugador} y {plataforma} en un texto del juego. */
export function completarTexto(texto: string, banda?: string): string {
  const plataforma = (banda && BANDAS[banda]?.plataforma?.nombre) || 'todas las plataformas';
  return sinLigaduras(
    texto.replaceAll('{jugador}', cargarNombre() ?? 'vos').replaceAll('{plataforma}', plataforma),
  );
}
