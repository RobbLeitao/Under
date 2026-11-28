import type { Mision } from './tipos';

/**
 * Misión 1: El encuentro (docs/diseno.md), en la versión de una sola escena:
 * el kiosco está al lado de El Bunker.
 *
 * Marcas de avance: mision1-inicio, nikola-conto, kiosquero-conto, vio-monedas,
 * agarro-monedas, compro-galletitas, perro-solto y mision1-completa.
 */
export const MISION_1: Mision = {
  clave: 'mision1',
  marcaInicio: 'mision1-inicio',
  marcaFin: 'mision1-completa',
  titulo: 'El pasamontañas perdido',
  banda: 'orate',
  siguiente: 'Esta noche toca Exiliado en Vinoteca Perrier, acá al lado. Caminá hacia la derecha.',
  // El riff que suena en los auriculares del jugador mientras llega Nikola. El MP3 tiene
  // 12 s de silencio y una intro suave hasta 0:23; en 0:24 entra la banda con todo.
  musicaEntrada: { tema: 'orate-psicopata', desde: 24, duracion: 12, volumen: 0.15 },

  reglas: [
    // Pasos 2 y 8: Nikola.
    {
      punto: 'nikola',
      accion: { usar: 'pasamontanas' },
      respuesta: { dialogo: 'nikola-recibe-pasamontanas' },
      efectos: [
        { quitar: 'pasamontanas' },
        { marcar: 'mision1-completa' },
        { recompensa: 'tema:orate-psicopata' },
        { recompensa: 'figurita:nikola' },
      ],
    },
    { punto: 'nikola', accion: 'hablar', si: { con: ['mision1-completa'] }, respuesta: { dialogo: 'nikola-listo' } },
    {
      punto: 'nikola',
      accion: 'hablar',
      si: { sin: ['nikola-conto'] },
      respuesta: { dialogo: 'nikola-llegada' },
      efectos: [{ marcar: 'nikola-conto' }],
    },
    { punto: 'nikola', accion: 'hablar', respuesta: { dialogo: 'nikola-recordatorio' } },
    {
      punto: 'nikola',
      accion: 'mirar',
      si: { con: ['mision1-completa'] },
      respuesta: 'Nikola con su pasamontañas. Listo para el ensayo.',
    },

    // Pasos 3, 5 y 6: el kiosco. Con monedas se compra dándoselas o hablándole.
    {
      punto: 'kiosco',
      accion: { usar: 'monedas' },
      respuesta: { dialogo: 'kiosquero-galletitas' },
      efectos: [{ quitar: 'monedas' }, { agregar: 'galletitas' }, { marcar: 'compro-galletitas' }],
    },
    {
      punto: 'kiosco',
      accion: 'hablar',
      si: { tiene: ['monedas'] },
      respuesta: { dialogo: 'kiosquero-galletitas' },
      efectos: [{ quitar: 'monedas' }, { agregar: 'galletitas' }, { marcar: 'compro-galletitas' }],
    },
    {
      punto: 'kiosco',
      accion: 'hablar',
      si: { con: ['nikola-conto'], sin: ['kiosquero-conto'] },
      respuesta: { dialogo: 'kiosquero-perro' },
      efectos: [{ marcar: 'kiosquero-conto' }],
    },
    {
      punto: 'kiosco',
      accion: 'hablar',
      si: { con: ['kiosquero-conto'], sin: ['compro-galletitas'] },
      respuesta: { dialogo: 'kiosquero-sin-plata' },
    },
    { punto: 'kiosco', accion: 'hablar', respuesta: { dialogo: 'kiosquero-saludo' } },

    // Pasos 4 y 7: el perro.
    {
      punto: 'perro',
      accion: { usar: 'galletitas' },
      respuesta: { dialogo: 'perro-suelta' },
      efectos: [{ quitar: 'galletitas' }, { agregar: 'pasamontanas' }, { marcar: 'perro-solto' }],
    },
    { punto: 'perro', accion: 'mirar', si: { con: ['perro-solto'] }, respuesta: 'Está feliz con sus galletitas.' },
    { punto: 'perro', accion: 'mirar', si: { con: ['nikola-conto'] }, respuesta: { dialogo: 'mirar-perro' } },
    { punto: 'perro', accion: 'agarrar', si: { con: ['perro-solto'] }, respuesta: 'Ya me dio lo que necesitaba.' },

    // Paso 5: las monedas abajo del banco.
    {
      punto: 'banco',
      accion: 'mirar',
      si: { sin: ['agarro-monedas'] },
      respuesta: 'Abajo del banco hay unas monedas.',
      efectos: [{ marcar: 'vio-monedas' }],
    },
    {
      punto: 'banco',
      accion: 'agarrar',
      si: { con: ['vio-monedas'], sin: ['agarro-monedas'] },
      respuesta: 'Unas monedas. Me vienen bárbaro.',
      efectos: [{ agregar: 'monedas' }, { marcar: 'agarro-monedas' }],
    },
  ],

  apariencias: [
    { personaje: 'perro', textura: 'perro-sin-pasamontanas', si: { con: ['perro-solto'] } },
    { personaje: 'nikola', textura: 'nikola-pasamontanas', si: { con: ['mision1-completa'] } },
  ],
};
