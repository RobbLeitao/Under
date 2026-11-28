import type { Verbo } from './acciones';
import type { ClaveDialogo, ClaveHablante } from './dialogos';
import type { Condicion, Regla } from './misiones/tipos';

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
  /**
   * Si está, el personaje pasea solo de un lado al otro entre xMin y xMax (posición de los
   * pies), a `velocidad` unidades por segundo. Su zona tocable y su punto "acercarse" se
   * mueven con él. Usa la animación <textura>-camina.
   */
  paseo?: { xMin: number; xMax: number; velocidad: number };
  /**
   * Lo que ocupa en el piso, en unidades: la mitad de su ancho y cuánto se extiende hacia atrás
   * y hacia adelante de sus pies. El jugador no lo puede atravesar: lo rodea por atrás.
   */
  cuerpo?: { mitadAncho: number; mitadFondo: number };
  /** Si está, el personaje solo está en la escena mientras se cumpla. */
  si?: Condicion;
}

/**
 * Algo del fondo que se ordena por profundidad con el jugador, como la parada de colectivo:
 * si los pies del jugador están más atrás que `base`, lo tapa; si están más adelante, no.
 */
export interface Decorado {
  textura: string;
  /** Esquina de arriba a la izquierda, en unidades. */
  x: number;
  y: number;
  /** Línea del piso donde se apoya (en unidades). */
  base: number;
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
  /** Si está, solo se puede tocar mientras se cumpla (el flyer, solo con misión). */
  si?: Condicion;
}

/** Algo dibujado en la escena que aparece o desaparece según el avance (las monedas del piso). */
export interface ObjetoEnEscena {
  textura: string;
  /** Esquina de arriba a la izquierda. */
  x: number;
  y: number;
  /** Se ve mientras se cumpla. */
  si: Condicion;
  /** Un destello de vez en cuando, para que se note. */
  brilla?: boolean;
}

/** Lado de la escena por el que se entra o se sale caminando. */
export type Lado = 'izquierda' | 'derecha';

export interface DatosEscena {
  /** Clave de la escena de Phaser. */
  clave: string;
  fondo: string;
  /** Otros fondos según el avance: gana el primero que se cumpla; si ninguno, `fondo`. */
  fondoSegun?: { textura: string; si: Condicion }[];
  carteles: Cartel[];
  /** Rectángulo donde pueden estar los pies del jugador. */
  zonaCaminable: { xMin: number; xMax: number; yMin: number; yMax: number };
  inicioJugador: { x: number; y: number };
  personajes: Personaje[];
  decorados: Decorado[];
  objetos: ObjetoEnEscena[];
  puntos: PuntoInteres[];
  /** Dónde salen las viñetas de quien habla sin sprite en la escena (arriba de la cabeza). */
  anclas: Partial<Record<ClaveHablante, { x: number; y: number }>>;
  /**
   * Escena a la que se pasa caminando por cada borde. Se sale tocando el piso cerca del borde
   * o llegando a él con el teclado, y se entra por el borde opuesto de la otra escena.
   */
  salidas?: Partial<Record<Lado, string>>;
  /**
   * Respuestas que dependen del avance pero no son de una misión (la vereda sin misión).
   * Se revisan después de las reglas de las misiones; gana la primera que coincide.
   */
  reglas?: Regla[];
}

export const ESQUINA_EL_BUNKER: DatosEscena = {
  clave: 'EsquinaBunker',
  fondo: 'fondo-esquina-el-bunker',
  carteles: [
    { texto: 'KIOSCO', x: 177, y: 49, tamano: 7, color: '#F4EFE6' },
    // Sobre la banda roja del logo de El Bunker, en el cartel de la puerta.
    { texto: 'EL BUNKER', x: 215, y: 37.4, tamano: 3.3, color: '#F4EFE6' },
  ],
  zonaCaminable: { xMin: 8, xMax: 312, yMin: 106, yMax: 117 },
  inicioJugador: { x: 124, y: 116 },
  personajes: [
    // El perro pasea entre la parada y el kiosco. El tramo deja su cuerpo (13 unidades a cada
    // lado) y su zona tocable lejos de Nikola (x 187 a 209), del lugar donde el jugador se para
    // para hablarle (x 165 a 185) y del banco (x 10 a 44).
    {
      clave: 'perro',
      textura: 'perro',
      x: 150,
      y: 116,
      paseo: { xMin: 62, xMax: 150, velocidad: 9 },
      cuerpo: { mitadAncho: 11, mitadFondo: 3 },
    },
    { clave: 'nikola', textura: 'nikola', x: 198, y: 116, cuerpo: { mitadAncho: 7, mitadFondo: 3 } },
    // El kiosquero: una silueta detrás del mostrador del kiosco (la tapa está en y 84). No camina
    // ni ocupa lugar en la vereda; al hablar gesticula con kiosquero-habla. Se toca con el kiosco.
    { clave: 'kiosquero', textura: 'kiosquero', x: 177, y: 84 },
  ],
  // La parada de colectivo (techo, postes, vidrio, banco y cartel), separada del fondo con
  // scripts/separar-parada.py. Se apoya en la vereda en y 110.
  decorados: [
    { textura: 'parada-colectivo', x: 4, y: 60, base: 110 },
    // La farola está al borde de la vereda, casi sobre el asfalto (el pie, en y 116).
    { textura: 'farola-esquina', x: 231, y: 28, base: 116 },
  ],
  objetos: [
    // Paso 5: las monedas, en el piso abajo del banco de la parada.
    { textura: 'monedas-piso', x: 22, y: 107, si: { sin: ['agarro-monedas'] }, brilla: true },
  ],
  // Respuestas fijas. Las que dependen del avance están en data/misiones/.
  puntos: [
    {
      clave: 'nikola',
      nombre: 'Nikola',
      zona: { x: 187, y: 65, ancho: 22, alto: 52 },
      acercarse: { x: 175, y: 116 },
      respuestas: {
        mirar: 'Es Nikola, de Orate. Se revisa los bolsillos como loco.',
        agarrar: 'Mejor no.',
        hablar: { dialogo: 'nikola-llegada' },
      },
    },
    {
      clave: 'perro',
      nombre: 'el perro',
      zona: { x: 137, y: 101, ancho: 27, alto: 16 },
      acercarse: { x: 125, y: 116 },
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
      zona: { x: 150, y: 22, ancho: 54, alto: 76 },
      // A un costado de la ventanita, para no tapar al kiosquero mientras habla.
      acercarse: { x: 158, y: 108 },
      respuestas: {
        mirar: 'Golosinas, galletitas y un kiosquero con cara de pocos amigos.',
      },
    },
    {
      clave: 'puerta-bunker',
      nombre: 'la puerta de El Bunker',
      zona: { x: 204, y: 28, ancho: 22, alto: 72 },
      acercarse: { x: 214, y: 108 },
      respuestas: {
        mirar: 'El Bunker, Estudio y Salas de Ensayo. Se escucha un bombo del otro lado.',
        agarrar: 'Está cerrada.',
      },
    },
  ],
  // Todos los que hablan tienen sprite; la viñeta sale arriba de su cabeza.
  anclas: {},
  salidas: { derecha: 'VeredaPerrier' },
};

/** Marca de avance con la que la vereda de Perrier pasa a tener misión (flyer y ventanal encendido). */
const CON_MISION: Condicion = { con: ['mision1-completa'] };
const SIN_MISION: Condicion = { sin: ['mision1-completa'] };

/**
 * La vereda de Vinoteca Perrier, a la derecha de la esquina de El Bunker. Sin la misión 1
 * terminada está sin misión: sin flyer, el ventanal apagado y Raulo que todavía no abrió.
 */
export const VEREDA_PERRIER: DatosEscena = {
  clave: 'VeredaPerrier',
  fondo: 'fondo-vereda-perrier',
  fondoSegun: [{ textura: 'fondo-vereda-perrier-sin-mision', si: SIN_MISION }],
  carteles: [],
  // La fachada se apoya en y 100 y el cordón empieza en y 117. Atrás de Raulo (pies en 108)
  // queda una fila para rodearlo.
  zonaCaminable: { xMin: 8, xMax: 312, yMin: 104, yMax: 117 },
  inicioJugador: { x: 60, y: 114 },
  personajes: [
    // Raulo, parado frente a la puerta de madera.
    { clave: 'raulo', textura: 'raulo', x: 164, y: 108, cuerpo: { mitadAncho: 9, mitadFondo: 3 } },
  ],
  decorados: [
    // La farola al borde de la vereda (el pie, en y 116): tapa al jugador cuando pasa por detrás.
    { textura: 'farola-perrier', x: 212, y: 28, base: 116 },
  ],
  objetos: [
    // El flyer del show de esa noche, pegado en la pared de ladrillo. Solo con misión.
    { textura: 'flyer-exiliado', x: 186, y: 55, si: CON_MISION },
  ],
  puntos: [
    {
      clave: 'raulo',
      nombre: 'Raulo',
      // Raulo tapa casi toda la puerta y la chapa: su zona empieza en la cara (y 57) y deja
      // libres la cresta, donde se toca la chapa, y los bordes de la puerta.
      zona: { x: 155, y: 57, ancho: 18, alto: 51 },
      acercarse: { x: 146, y: 110 },
      respuestas: {
        mirar: 'Raulo, el encargado. Es enorme, pero tiene cara de buen tipo.',
        agarrar: 'Mejor no.',
        hablar: { dialogo: 'raulo-llegada' },
      },
    },
    {
      clave: 'chapa',
      nombre: 'la chapa',
      zona: { x: 154, y: 50, ancho: 21, alto: 9 },
      acercarse: { x: 182, y: 110 },
      respuestas: { mirar: 'Perrier, 2051. Desde 1992.' },
    },
    {
      clave: 'puerta',
      nombre: 'la puerta',
      zona: { x: 151, y: 58, ancho: 26, alto: 42 },
      acercarse: { x: 182, y: 110 },
      respuestas: { mirar: 'Una puerta de madera de las de antes.' },
    },
    {
      clave: 'flyer',
      nombre: 'el flyer',
      zona: { x: 186, y: 55, ancho: 39, alto: 40 },
      acercarse: { x: 205, y: 110 },
      respuestas: {
        mirar: 'Hoy toca Exiliado. Está bueno el símbolo.',
        agarrar: 'Mejor lo dejo. Si no, ¿cómo se enteran?',
      },
      si: CON_MISION,
    },
    {
      clave: 'ventanal',
      nombre: 'el ventanal',
      zona: { x: 52, y: 68, ancho: 88, alto: 32 },
      acercarse: { x: 96, y: 110 },
      respuestas: { mirar: 'Exiliado está probando. Se escucha hasta acá afuera.' },
    },
    {
      clave: 'rejilla',
      nombre: 'la rejilla',
      zona: { x: 104, y: 112, ancho: 16, alto: 10 },
      acercarse: { x: 112, y: 116 },
      respuestas: {
        mirar: 'Allá abajo brilla un llavero con una argolla. Con la mano no llego.',
        agarrar: 'No entra ni un dedo.',
      },
    },
  ],
  anclas: {},
  salidas: { izquierda: 'EsquinaBunker' },
  reglas: [
    { punto: 'raulo', accion: 'hablar', si: SIN_MISION, respuesta: { dialogo: 'raulo-sin-mision' } },
    { punto: 'ventanal', accion: 'mirar', si: SIN_MISION, respuesta: 'Está oscuro. No hay nadie.' },
  ],
};
