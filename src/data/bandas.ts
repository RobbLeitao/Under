/** Bandas del juego. Solo las que figuran en docs/diseno.md. */

export interface Banda {
  clave: string;
  nombre: string;
  /**
   * Dónde quiere la banda que la escuchen. Lo manda cada banda;
   * mientras sea null, los diálogos dicen "todas las plataformas".
   */
  plataforma: { nombre: string; url: string } | null;
}

export const BANDAS: Record<string, Banda> = {
  // PENDIENTE: pedirle a Orate su link (Spotify, YouTube, Bandcamp u otra).
  orate: { clave: 'orate', nombre: 'Orate', plataforma: null },
};
