/**
 * Temas que se desbloquean en la app Música del Phone, con la recompensa "tema:<clave>".
 * Los archivos los pasa cada banda y van en public/assets/audio/.
 */

export interface Tema {
  banda: string;
  titulo: string;
  archivo: string;
}

export const TEMAS: Record<string, Tema> = {
  'orate-psicopata': {
    banda: 'orate',
    titulo: 'Psicopata (El Loco de la Ruta)',
    archivo: 'assets/audio/orate-psicopata.mp3',
  },
  // PENDIENTE: el tema de Exiliado. Mientras no esté el archivo, suena un placeholder silencioso
  // de 10 segundos (assets/audio/exiliado-pendiente.wav). Al llegar, cambiar archivo y título.
  'exiliado-pendiente': {
    banda: 'exiliado',
    titulo: 'Tema de Exiliado',
    archivo: 'assets/audio/exiliado-pendiente.wav',
  },
};
