import { BANDAS } from '../data/bandas';

/**
 * Abre la plataforma de una banda (Spotify, YouTube, Bandcamp u otra) en una pestaña nueva.
 * Se llama desde un toque, para que el navegador no la bloquee como ventana emergente.
 */
export function abrirPlataforma(banda: string): void {
  const url = BANDAS[banda]?.plataforma?.url;
  if (url) window.open(url, '_blank', 'noopener');
}

/** Texto del botón: "Escuchar a Orate en Spotify", o null si la banda todavía no mandó su link. */
export function textoBotonPlataforma(banda: string, conNombre = true): string | null {
  const b = BANDAS[banda];
  if (!b?.plataforma) return null;
  return conNombre ? `Escuchar a ${b.nombre} en ${b.plataforma.nombre}` : `Escuchar en ${b.plataforma.nombre}`;
}
