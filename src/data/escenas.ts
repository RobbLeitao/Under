import type { Verbo } from './acciones';
import type { ClaveDialogo, ClaveHablante } from './dialogos';

/**
 * Datos de cada escena. Todas las medidas van en unidades de la grilla de 320x140
 * (las mismas del boceto SVG); la escena las multiplica por ESCALA.
 */

export interface Personaje {
  clave: string;
  textura: string;
  /** Posición de los pies (centro abajo del sprite). */
  x: number;
  y: number;
}

export interface Cartel {
  texto: string;
  /** Centro del texto. */
  x: number;
  y: number;
  /** Tamaño de letra en unidades. */
  tamano: number;
  color: string;
}

/** Una frase que dice el jugador, o un diálogo de data/dialogos.ts. */
export type Respuesta = string | { dialogo: ClaveDialogo };

/** Algo que se puede tocar en la escena: un personaje o un objeto del fondo. */
export interface PuntoInteres {
  clave: string;
  /** Cómo se nombra en la barra ("Nikola", "el banco"). */
  nombre: string;
  /** Zona que se puede tocar (esquina de arriba a la izquierda, ancho y alto). */
  zona: { x: number; y: number; ancho: number; alto: number };
  /** Adónde camina el jugador para interactuar (pies). */
  acercarse: { x: number; y: number };
  /** Respuesta a cada acción; si falta, se usa la respuesta por defecto. */
  respuestas: Partial<Record<Verbo, Respuesta>>;
}

export interface DatosEscena {
  fondo: string;
  carteles: Cartel[];
  /** Rectángulo donde pueden estar los pies del jugador. */
  zonaCaminable: { xMin: number; xMax: number; yMin: number; yMax: number };
  inicioJugador: { x: number; y: number };
  personajes: Personaje[];
  puntos: PuntoInteres[];
  /** Dónde salen las viñetas de quien habla sin sprite en la escena (arriba de la cabeza). */
  anclas: Partial<Record<ClaveHablante, { x: number; y: number }>>;
}

export const ESQUINA_EL_BUNKER: DatosEscena = {
  fondo: 'fondo-esquina-el-bunker',
  carteles: [
    { texto: 'KIOSCO', x: 178, y: 50.5, tamano: 7, color: '#F4EFE6' },
    { texto: 'EL', x: 214, y: 47, tamano: 3.5, color: '#F4EFE6' },
    { texto: 'BUNKER', x: 214, y: 51.25, tamano: 3.5, color: '#E8C46A' },
  ],
  zonaCaminable: { xMin: 8, xMax: 312, yMin: 106, yMax: 117 },
  inicioJugador: { x: 124, y: 116 },
  personajes: [
    { clave: 'perro', textura: 'perro', x: 169.5, y: 116 },
    { clave: 'nikola', textura: 'nikola', x: 198, y: 116 },
  ],
  // Respuestas fijas. Las que dependen del avance están en data/misiones/.
  puntos: [
    {
      clave: 'nikola',
      nombre: 'Nikola',
      zona: { x: 190, y: 84, ancho: 16, alto: 34 },
      acercarse: { x: 183, y: 116 },
      respuestas: {
        mirar: 'Es Nikola, de Orate. Se revisa los bolsillos como loco.',
        agarrar: 'Mejor no.',
        hablar: { dialogo: 'nikola-llegada' },
      },
    },
    {
      clave: 'perro',
      nombre: 'el perro',
      zona: { x: 158, y: 102, ancho: 22, alto: 16 },
      acercarse: { x: 154, y: 116 },
      respuestas: {
        mirar: 'Un perro de la cuadra, con algo negro de lana en la boca.',
        agarrar: 'No lo suelta ni loco.',
        hablar: 'Mueve la cola, pero no larga nada.',
      },
    },
    {
      clave: 'banco',
      nombre: 'el banco de la parada',
      zona: { x: 10, y: 98, ancho: 34, alto: 14 },
      acercarse: { x: 27, y: 114 },
      respuestas: {
        mirar: 'Un banco de la parada del colectivo.',
        agarrar: 'Está atornillado al piso.',
      },
    },
    {
      clave: 'kiosco',
      nombre: 'el kiosco',
      zona: { x: 150, y: 46, ancho: 56, alto: 52 },
      acercarse: { x: 178, y: 108 },
      respuestas: {
        mirar: 'Golosinas, galletitas y un kiosquero con cara de pocos amigos.',
      },
    },
    {
      clave: 'puerta-bunker',
      nombre: 'la puerta de El Bunker',
      zona: { x: 206, y: 44, ancho: 16, alto: 56 },
      acercarse: { x: 214, y: 108 },
      respuestas: {
        mirar: 'El Bunker, Estudio y Salas de Ensayo. Se escucha un bombo del otro lado.',
        agarrar: 'Está cerrada.',
      },
    },
  ],
  // El kiosquero se ve detrás del mostrador, sin sprite por ahora.
  anclas: { kiosquero: { x: 178, y: 62 } },
};
