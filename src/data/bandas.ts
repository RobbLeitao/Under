/** Bandas del juego. Solo las que figuran en docs/diseno.md. */

export interface Banda {
  clave: string;
  nombre: string;
  estilo: string;
  /**
   * Dónde quiere la banda que la escuchen. Lo manda cada banda;
   * mientras sea null, los diálogos dicen "todas las plataformas" y el Phone no muestra el botón.
   */
  plataforma: { nombre: string; url: string } | null;
}

// PENDIENTE: pedirle a cada banda su link (Spotify, YouTube, Bandcamp u otra).
export const BANDAS: Record<string, Banda> = {
  orate: { clave: 'orate', nombre: 'Orate', estilo: 'Old school death metal', plataforma: null },
  kainoas: { clave: 'kainoas', nombre: 'Kainoas', estilo: 'Nu metal', plataforma: null },
  abismal: { clave: 'abismal', nombre: 'Abismal', estilo: 'Groove metal', plataforma: null },
  avtomata: { clave: 'avtomata', nombre: 'Avtomata', estilo: 'Modern death metal', plataforma: null },
  exiliado: { clave: 'exiliado', nombre: 'Exiliado', estilo: 'Rock metal alternativo', plataforma: null },
};
