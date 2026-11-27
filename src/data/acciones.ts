/** Las tres acciones de la barra y lo que se dice cuando una acción no tiene respuesta propia. */

export type Verbo = 'mirar' | 'agarrar' | 'hablar';

export const VERBOS: { verbo: Verbo; etiqueta: string }[] = [
  { verbo: 'mirar', etiqueta: 'Mirar' },
  { verbo: 'agarrar', etiqueta: 'Agarrar' },
  { verbo: 'hablar', etiqueta: 'Hablar' },
];

export const RESPUESTAS_POR_DEFECTO: Record<Verbo, string> = {
  mirar: 'Nada fuera de lo común.',
  agarrar: 'No me lo puedo llevar.',
  hablar: 'No contesta.',
};
