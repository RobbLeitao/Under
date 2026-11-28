/**
 * Diálogos del juego. Variables: {jugador} es el nombre de quien juega;
 * {plataforma} es la plataforma de la banda del diálogo (ver bandas.ts).
 */

export type ClaveHablante = 'jugador' | 'nikola' | 'kiosquero' | 'raulo';

export interface Hablante {
  nombre: string;
  /** Frecuencia base del balbuceo, en Hz. */
  tono: number;
  /** Color del texto cuando habla (cada personaje tiene el suyo, como en Thimbleweed Park). */
  color: string;
}

export const HABLANTES: Record<ClaveHablante, Hablante> = {
  jugador: { nombre: '{jugador}', tono: 330, color: '#F4EFE6' },
  nikola: { nombre: 'Nikola', tono: 150, color: '#FF9A4A' },
  kiosquero: { nombre: 'Kiosquero', tono: 220, color: '#8FD9FF' },
  // Raulo: el más alto del juego, voz grave.
  raulo: { nombre: 'Raulo', tono: 110, color: '#FFD45A' },
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
          'Mi pasamontañas, loco. En Orate tocamos todos con pasamontañas. Pasé por el kiosco de acá al lado y después ya no lo tenía.',
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
    lineas: [
      { quien: 'jugador', texto: '¿Me fiás unas galletitas?' },
      { quien: 'kiosquero', texto: 'Acá no se fía, pibe.' },
    ],
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

  // Provisorios: no están en el guion; revisar con Nikola.
  'nikola-recordatorio': {
    lineas: [{ quien: 'nikola', texto: 'El pasamontañas, man. Pasé por el kiosco y después ya no lo tenía.' }],
  },
  'nikola-listo': {
    lineas: [{ quien: 'nikola', texto: '¡Ya estoy listo para el ensayo! Gracias, {jugador}.' }],
  },
  'kiosquero-saludo': {
    lineas: [{ quien: 'kiosquero', texto: 'Buenas. ¿Qué vas a llevar?' }],
  },
  'kiosquero-galletitas': {
    lineas: [
      { quien: 'jugador', texto: 'Unas galletitas, por favor.' },
      { quien: 'kiosquero', texto: 'Ahí tenés. Las más baratas que hay.' },
    ],
  },
  'perro-suelta': {
    lineas: [{ quien: 'jugador', texto: '¡Lo soltó! Un poco babeado, pero entero.' }],
  },

  // Vereda de Perrier (misión 2, docs/diseno.md). Los de Raulo se ajustan con él.
  'raulo-sin-mision': {
    lineas: [{ quien: 'raulo', texto: 'Todavía no abrimos, pendejo. Pasá más tarde.' }],
  },
  'raulo-llegada': {
    lineas: [
      { quien: 'jugador', texto: 'Buenas. ¿Se puede pasar?' },
      { quien: 'raulo', texto: 'Todavía no abrimos. Están probando sonido.' },
      { quien: 'raulo', texto: 'Volvé a la noche, que toca Exiliado.' },
    ],
  },
} satisfies Record<string, Dialogo>;

export type ClaveDialogo = keyof typeof DIALOGOS;
