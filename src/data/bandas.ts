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
  /** Archivo del logo en public/assets/logos/ (se muestra en el álbum); null mientras no lo manden. */
  logo: string | null;
}

// PENDIENTE: pedirle a las demás bandas su link (Spotify, YouTube, Bandcamp u otra) y su logo.
export const BANDAS: Record<string, Banda> = {
  orate: {
    clave: 'orate',
    nombre: 'Orate',
    estilo: 'Old school death metal',
    plataforma: { nombre: 'Spotify', url: 'https://open.spotify.com/artist/6B7WCiPeOEK3zJ1nRoe9St' },
    logo: 'orate.jpg',
  },
  kainoas: { clave: 'kainoas', nombre: 'Kainoas', estilo: 'Nu metal', plataforma: null, logo: null },
  abismal: { clave: 'abismal', nombre: 'Abismal', estilo: 'Groove metal', plataforma: null, logo: null },
  avtomata: { clave: 'avtomata', nombre: 'Avtomata', estilo: 'Modern death metal', plataforma: null, logo: null },
  // PENDIENTE: el link de Exiliado. Mientras tanto, los diálogos dicen "todas las plataformas" y no hay botón.
  exiliado: { clave: 'exiliado', nombre: 'Exiliado', estilo: 'Rock metal alternativo', plataforma: null, logo: 'exiliado.png' },
};
