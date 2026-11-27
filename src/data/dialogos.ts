/**
 * Diálogos del juego. Variables: {jugador} es el nombre de quien juega;
 * {plataforma} es la plataforma de la banda del diálogo (ver bandas.ts).
 */

export type ClaveHablante = 'jugador' | 'nikola' | 'kiosquero';

export interface Hablante {
  nombre: string;
  /** Frecuencia base del balbuceo, en Hz. */
  tono: number;
}

export const HABLANTES: Record<ClaveHablante, Hablante> = {
  jugador: { nombre: '{jugador}', tono: 330 },
  nikola: { nombre: 'Nikola', tono: 150 },
  kiosquero: { nombre: 'Kiosquero', tono: 220 },
};

export interface Linea {
  quien: ClaveHablante;
  texto: string;
}

export interface Dialogo {
  /** Banda de la que sale {plataforma}, si el diálogo la usa. */
  banda?: string;
  lineas: Linea[];
}

/** Misión 1 (docs/diseno.md). Los de Nikola se ajustan con él. */
export const DIALOGOS = {
  'nikola-llegada': {
    lineas: [
      { quien: 'nikola', texto: '¡No, man, no puedo tocar sin mi pasamontañas!' },
      { quien: 'jugador', texto: '¿Tu qué?' },
      {
        quien: 'nikola',
        texto:
          'Mi pasamontañas, loco. En Orate tocamos todos con pasamontañas. Pasé por el kiosco de Independencia y después ya no lo tenía.',
      },
    ],
  },
  'kiosquero-perro': {
    lineas: [
      { quien: 'kiosquero', texto: 'Un perro de la cuadra pasó con algo negro de lana en la boca. Y no lo larga más.' },
    ],
  },
  'mirar-perro': {
    lineas: [{ quien: 'jugador', texto: 'Tiene el pasamontañas y una cara de hambre tremenda.' }],
  },
  'kiosquero-sin-plata': {
    lineas: [{ quien: 'kiosquero', texto: 'Acá no se fía, pibe.' }],
  },
  'nikola-recibe-pasamontanas': {
    banda: 'orate',
    lineas: [
      {
        quien: 'nikola',
        texto:
          '¡Ahí está! Un poco babeado, pero sirve. Gracias man.. Sos un crack, cracken, TITAN! Che, {jugador}, tomá, escuchanos en {plataforma}.',
      },
    ],
  },
} satisfies Record<string, Dialogo>;

export type ClaveDialogo = keyof typeof DIALOGOS;
