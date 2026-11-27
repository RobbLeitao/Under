/**
 * Hojas de cuadros de public/assets/sprites/anim/ (PNG ya a escala x4, cuadros en fila;
 * el SVG fuente está en assets/sprites/anim/). Cada cuadro deja 3 unidades libres a cada
 * lado y 2 arriba, así que con origen (0.5, 1) los pies quedan donde estaba el sprite base.
 *
 * La clave sigue la convención <sprite base>-<acción>: "nikola-pasamontanas-habla" es la
 * animación de hablar de la textura "nikola-pasamontanas". Así cada escena encuentra la
 * animación que le toca al personaje según su textura actual.
 */

export interface Animacion {
  clave: string;
  /** Tamaño de cada cuadro, en unidades. */
  ancho: number;
  alto: number;
  cuadros: number;
  fps: number;
}

export const ANIMACIONES: Animacion[] = [
  { clave: 'jugador-camina', ancho: 26, alto: 51, cuadros: 4, fps: 7 },
  { clave: 'jugador-habla', ancho: 26, alto: 51, cuadros: 3, fps: 4 },
  // nikola-camina y nikola-pasamontanas-camina salen de scripts/generar-caminar.py, con el
  // mismo movimiento que jugador-camina.
  { clave: 'nikola-camina', ancho: 28, alto: 53, cuadros: 4, fps: 7 },
  { clave: 'nikola-pasamontanas-camina', ancho: 28, alto: 53, cuadros: 4, fps: 7 },
  { clave: 'nikola-habla', ancho: 28, alto: 53, cuadros: 3, fps: 4 },
  { clave: 'nikola-pasamontanas-habla', ancho: 28, alto: 53, cuadros: 3, fps: 4 },
  { clave: 'kiosquero-habla', ancho: 24, alto: 25, cuadros: 3, fps: 4 },
  { clave: 'perro-camina', ancho: 32, alto: 17, cuadros: 4, fps: 8 },
  { clave: 'perro-sin-pasamontanas-camina', ancho: 32, alto: 17, cuadros: 4, fps: 8 },
];
