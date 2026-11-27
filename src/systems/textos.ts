import { BANDAS } from '../data/bandas';
import { cargarNombre } from './guardado';

/** Reemplaza {jugador} y {plataforma} en un texto del juego. */
export function completarTexto(texto: string, banda?: string): string {
  const plataforma = (banda && BANDAS[banda]?.plataforma?.nombre) || 'todas las plataformas';
  return texto.replaceAll('{jugador}', cargarNombre() ?? 'vos').replaceAll('{plataforma}', plataforma);
}
