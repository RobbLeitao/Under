import Phaser from 'phaser';
import { estaSonando } from './musica';

/**
 * Sonido ambiente de calle, generado con Web Audio (sin archivos ni licencias):
 * un rumor de fondo de ruido filtrado y, cada tanto, un auto que pasa de un lado al otro.
 *
 * Todo sale por el destino del sonido de Phaser, así que respeta el Sonido sí/no de la pausa
 * y el volumen general. Baja todavía más mientras suena un tema en el Phone.
 */

/** Volumen del rumor de fondo: bajito, para acompañar sin molestar. */
const VOLUMEN_FONDO = 0.035;
/** Pico de volumen de un auto al pasar. */
const VOLUMEN_AUTO = 0.05;
/** Cuánto queda del ambiente mientras suena un tema en el Phone. */
const FACTOR_CON_MUSICA = 0.25;
/** Cada cuánto se revisa si hay que bajar o subir el ambiente. */
const MS_REVISION = 300;

let contexto: AudioContext | null = null;
let salida: GainNode | null = null;
let fondo: AudioBufferSourceNode | null = null;
let ruido: AudioBuffer | null = null;
let revision: number | undefined;
let pausado = false;

/** Ruido "marrón" (más grave que el blanco), de 2 segundos, para repetir en loop. */
function crearRuido(ctx: AudioContext): AudioBuffer {
  const largo = ctx.sampleRate * 2;
  const buffer = ctx.createBuffer(1, largo, ctx.sampleRate);
  const datos = buffer.getChannelData(0);
  let ultimo = 0;
  for (let i = 0; i < largo; i++) {
    const blanco = Math.random() * 2 - 1;
    ultimo = (ultimo + 0.02 * blanco) / 1.02;
    datos[i] = ultimo * 3.5;
  }
  return buffer;
}

/** Empieza el ambiente. Si ya estaba sonando, no hace nada. */
export function iniciarAmbiente(escena: Phaser.Scene): void {
  const sonido = escena.sound;
  if (contexto || !(sonido instanceof Phaser.Sound.WebAudioSoundManager)) return;
  contexto = sonido.context;
  ruido = crearRuido(contexto);

  salida = contexto.createGain();
  salida.gain.value = 0;
  salida.connect(sonido.destination);

  // Rumor de fondo: ruido grave, sin los extremos.
  const pasaBajos = contexto.createBiquadFilter();
  pasaBajos.type = 'lowpass';
  pasaBajos.frequency.value = 380;
  const pasaAltos = contexto.createBiquadFilter();
  pasaAltos.type = 'highpass';
  pasaAltos.frequency.value = 60;
  const volumen = contexto.createGain();
  volumen.gain.value = VOLUMEN_FONDO;

  fondo = contexto.createBufferSource();
  fondo.buffer = ruido;
  fondo.loop = true;
  fondo.connect(pasaBajos).connect(pasaAltos).connect(volumen).connect(salida);
  fondo.start();

  pausado = false;
  ajustar();
  revision = window.setInterval(ajustar, MS_REVISION);
}

/** Sube o baja el ambiente según haya pausa o un tema sonando en el Phone. */
function ajustar() {
  if (!contexto || !salida) return;
  const objetivo = pausado ? 0 : estaSonando() ? FACTOR_CON_MUSICA : 1;
  salida.gain.setTargetAtTime(objetivo, contexto.currentTime, 0.4);
}

/** Un auto que pasa: ruido con un filtro que sube y baja, y se mueve de un lado al otro. */
export function pasaUnAuto(): void {
  if (!contexto || !salida || !ruido || pausado) return;
  const ahora = contexto.currentTime;
  const duracion = 2.5 + Math.random() * 2;
  const deIzquierda = Math.random() < 0.5;

  const fuente = contexto.createBufferSource();
  fuente.buffer = ruido;
  fuente.loop = true;

  const filtro = contexto.createBiquadFilter();
  filtro.type = 'bandpass';
  filtro.Q.value = 0.8;
  filtro.frequency.setValueAtTime(250, ahora);
  filtro.frequency.linearRampToValueAtTime(700 + Math.random() * 300, ahora + duracion / 2);
  filtro.frequency.linearRampToValueAtTime(220, ahora + duracion);

  const volumen = contexto.createGain();
  volumen.gain.setValueAtTime(0.0001, ahora);
  volumen.gain.exponentialRampToValueAtTime(VOLUMEN_AUTO * (0.6 + Math.random() * 0.4), ahora + duracion / 2);
  volumen.gain.exponentialRampToValueAtTime(0.0001, ahora + duracion);

  const panorama = contexto.createStereoPanner();
  panorama.pan.setValueAtTime(deIzquierda ? -0.9 : 0.9, ahora);
  panorama.pan.linearRampToValueAtTime(deIzquierda ? 0.9 : -0.9, ahora + duracion);

  fuente.connect(filtro).connect(volumen).connect(panorama).connect(salida);
  fuente.start(ahora);
  fuente.stop(ahora + duracion + 0.1);
}

/** Nivel actual del ambiente (0 a 1, antes del volumen general), para pruebas en desarrollo. */
export function nivelAmbiente(): number | null {
  return salida ? salida.gain.value : null;
}

/** Silencia el ambiente mientras está abierto el menú de pausa. */
export function pausarAmbiente(pausa: boolean): void {
  pausado = pausa;
  ajustar();
}

/** Corta el ambiente (al salir de la escena). */
export function detenerAmbiente(): void {
  window.clearInterval(revision);
  revision = undefined;
  fondo?.stop();
  fondo?.disconnect();
  salida?.disconnect();
  fondo = null;
  salida = null;
  ruido = null;
  contexto = null;
  pausado = false;
}
