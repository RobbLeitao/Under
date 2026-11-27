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

export interface DatosEscena {
  fondo: string;
  carteles: Cartel[];
  /** Rectángulo donde pueden estar los pies del jugador. */
  zonaCaminable: { xMin: number; xMax: number; yMin: number; yMax: number };
  inicioJugador: { x: number; y: number };
  personajes: Personaje[];
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
};
