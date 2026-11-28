import type { Mision } from './tipos';

/**
 * Misión 2: La cuarta cuerda (docs/diseno.md), en la vereda de Vinoteca Perrier.
 * Arranca recién con la misión 1 terminada (antes, la vereda está sin misión: ver
 * VEREDA_PERRIER en data/escenas.ts). Cada objeto se usa solo; no se combinan objetos.
 *
 * Marcas de avance: jota-salio, jota-conto, raulo-conto-llave, jota-dio-cuerda, pesco-llave,
 * raulo-abrio, mision2-completa, jota-entro (volvió a entrar para el show), mision2-cierre (ya se vio el cierre en la vereda) y
 * flyer-exiliado-retirado (el jugador se fue de la vereda después del show).
 */
export const MISION_2: Mision = {
  clave: 'mision2',
  marcaInicio: 'jota-salio',
  marcaFin: 'mision2-completa',
  titulo: 'La cuarta cuerda',
  banda: 'exiliado',
  siguiente: 'La noche del show en Teatro Vorterix. Muy pronto.',
  // En el show suenan 10 segundos del tema desde que entra la banda con todo (0:30; antes hay una intro bajita).
  musicaShow: { tema: 'exiliado-el-hombre-en-el-cuadro', desde: 30, duracion: 10, volumen: 0.6 },

  reglas: [
    // Paso 9 y 10: darle las cuerdas a Jota (o hablarle teniéndolas). Las recompensas se dan
    // acá, antes del show, así que saltarlo da lo mismo.
    {
      punto: 'jota',
      accion: { usar: 'cuerdas-bajo' },
      respuesta: { dialogo: 'jota-recibe-cuerdas' },
      efectos: [
        { quitar: 'cuerdas-bajo' },
        { marcar: 'mision2-completa' },
        { recompensa: 'tema:exiliado-el-hombre-en-el-cuadro' },
        { recompensa: 'figurita:jota' },
      ],
      // Jota termina de hablar, entra por la puerta y arranca el show.
      secuencia: 'jota-entra',
      despues: { efectos: [{ marcar: 'jota-entro' }], secuencia: 'show' },
    },
    {
      punto: 'jota',
      accion: 'hablar',
      si: { tiene: ['cuerdas-bajo'] },
      respuesta: { dialogo: 'jota-recibe-cuerdas' },
      efectos: [
        { quitar: 'cuerdas-bajo' },
        { marcar: 'mision2-completa' },
        { recompensa: 'tema:exiliado-el-hombre-en-el-cuadro' },
        { recompensa: 'figurita:jota' },
      ],
      // Jota termina de hablar, entra por la puerta y arranca el show.
      secuencia: 'jota-entra',
      despues: { efectos: [{ marcar: 'jota-entro' }], secuencia: 'show' },
    },
    // Paso 6: después de que Raulo contó lo de la llave, Jota da la cuerda cortada.
    {
      punto: 'jota',
      accion: 'hablar',
      si: { con: ['raulo-conto-llave'], sin: ['jota-dio-cuerda'] },
      respuesta: { dialogo: 'jota-da-cuerda' },
      efectos: [{ agregar: 'cuerda-cortada' }, { marcar: 'jota-dio-cuerda' }],
    },
    {
      punto: 'jota',
      accion: 'hablar',
      si: { sin: ['jota-dio-cuerda'] },
      respuesta: { dialogo: 'jota-ayuda' },
      efectos: [{ marcar: 'jota-conto' }],
    },
    { punto: 'jota', accion: 'hablar', respuesta: { dialogo: 'jota-espera' } },
    { punto: 'bajo', accion: 'hablar', respuesta: 'Un bajo no contesta. Su dueño, capaz.' },

    // Paso 9: darle la llave a Raulo. Entra al depósito, vuelve con las cuerdas y deja pasar.
    {
      punto: 'raulo',
      accion: { usar: 'llave-deposito' },
      respuesta: { dialogo: 'raulo-recibe-llave' },
      efectos: [{ quitar: 'llave-deposito' }],
      secuencia: 'deposito',
      despues: {
        respuesta: { dialogo: 'raulo-trae-cuerdas' },
        efectos: [{ agregar: 'cuerdas-bajo' }, { marcar: 'raulo-abrio' }],
      },
    },
    // Paso 11: de vuelta en la vereda, después del show.
    { punto: 'raulo', accion: 'hablar', si: { con: ['mision2-completa'] }, respuesta: { dialogo: 'raulo-buena-banda' } },
    { punto: 'raulo', accion: 'hablar', si: { con: ['raulo-abrio'] }, respuesta: { dialogo: 'raulo-pasa' } },
    // Pasos 2 y 3: la primera charla con Raulo y, al terminar, Jota sale a la vereda.
    {
      punto: 'raulo',
      accion: 'hablar',
      si: { sin: ['jota-salio'] },
      respuesta: { dialogo: 'raulo-llegada' },
      secuencia: 'jota-sale',
      despues: { respuesta: { dialogo: 'jota-sale' }, efectos: [{ marcar: 'jota-salio' }] },
    },
    // Paso 4: Raulo se acuerda del depósito y de la llave.
    {
      punto: 'raulo',
      accion: 'hablar',
      si: { sin: ['raulo-conto-llave'] },
      respuesta: { dialogo: 'raulo-deposito' },
      efectos: [{ marcar: 'raulo-conto-llave' }],
    },
    { punto: 'raulo', accion: 'hablar', si: { sin: ['pesco-llave'] }, respuesta: { dialogo: 'raulo-recordatorio' } },

    // Pasos 5, 7 y 8: la rejilla y la cuerda enrulada como gancho.
    {
      punto: 'rejilla',
      accion: { usar: 'cuerda-cortada' },
      si: { sin: ['pesco-llave'] },
      respuesta: { dialogo: 'pescar-llave' },
      efectos: [{ quitar: 'cuerda-cortada' }, { agregar: 'llave-deposito' }, { marcar: 'pesco-llave' }],
    },
    {
      punto: 'rejilla',
      accion: 'mirar',
      si: { con: ['pesco-llave'] },
      // Provisorio: no está en el guion.
      respuesta: 'Ya no queda nada allá abajo.',
    },
  ],

  apariencias: [],
};
