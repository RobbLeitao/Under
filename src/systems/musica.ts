import Phaser from 'phaser';
import { TEMAS } from '../data/temas';

/**
 * Reproductor de la app Música. Usa el sonido global del juego, así que el tema
 * sigue sonando aunque se cierre el Phone. Los MP3 se cargan recién cuando se tocan.
 */
let actual: { clave: string; sonido: Phaser.Sound.BaseSound } | null = null;

const claveAudio = (tema: string) => `tema-${tema}`;

export function temaActual() {
  return actual?.clave ?? null;
}

export function estaSonando() {
  return actual?.sonido.isPlaying ?? false;
}

/** Segundos reproducidos y duración total del tema actual (0 si no hay). */
export function progreso(): { segundos: number; duracion: number } {
  if (!actual) return { segundos: 0, duracion: 0 };
  const sonido = actual.sonido as Phaser.Sound.WebAudioSound | Phaser.Sound.HTML5AudioSound;
  return { segundos: sonido.seek ?? 0, duracion: sonido.duration ?? 0 };
}

/** Carga el MP3 de un tema si todavía no está. Se cumple con true si quedó listo. */
export function cargarTema(escena: Phaser.Scene, tema: string): Promise<boolean> {
  const clave = claveAudio(tema);
  if (escena.cache.audio.exists(clave)) return Promise.resolve(true);
  return new Promise((resolver) => {
    escena.load.audio(clave, TEMAS[tema].archivo);
    escena.load.once(Phaser.Loader.Events.COMPLETE, () => resolver(escena.cache.audio.exists(clave)));
    escena.load.start();
  });
}

/** Reproduce, pausa o retoma un tema. Devuelve una promesa que se cumple cuando empieza a sonar. */
export async function alternar(escena: Phaser.Scene, tema: string): Promise<void> {
  cortarFragmento();
  if (actual?.clave === tema) {
    if (actual.sonido.isPlaying) actual.sonido.pause();
    else if (actual.sonido.isPaused) actual.sonido.resume();
    else actual.sonido.play();
    return;
  }

  actual?.sonido.stop();
  actual?.sonido.destroy();
  actual = null;

  if (!(await cargarTema(escena, tema))) return;
  const sonido = escena.sound.add(claveAudio(tema));
  sonido.once(Phaser.Sound.Events.COMPLETE, () => sonido.stop());
  actual = { clave: tema, sonido };
  sonido.play();
}

/** Un fragmento de fondo (como el riff del inicio de una misión), aparte del reproductor. */
let fragmento: { sonido: Phaser.Sound.BaseSound; fundido?: Phaser.Tweens.Tween } | null = null;

const MS_FUNDIDO = 1500;

/**
 * Toca un pedazo de un tema con fundido de entrada y de salida.
 * No suena si el reproductor del Phone ya está sonando.
 */
export async function tocarFragmento(
  escena: Phaser.Scene,
  tema: string,
  opciones: { desde: number; duracion: number; volumen: number },
): Promise<void> {
  if (estaSonando() || !(await cargarTema(escena, tema)) || !escena.scene.isActive()) return;
  cortarFragmento();

  const sonido = escena.sound.add(claveAudio(tema), { volume: 0 }) as Phaser.Sound.WebAudioSound;
  fragmento = { sonido };
  sonido.play({ seek: opciones.desde, volume: 0 });
  fragmento.fundido = escena.tweens.add({ targets: sonido, volume: opciones.volumen, duration: MS_FUNDIDO });
  escena.time.delayedCall(Math.max(0, opciones.duracion * 1000 - MS_FUNDIDO), () => {
    if (fragmento?.sonido !== sonido) return;
    fragmento.fundido = escena.tweens.add({
      targets: sonido,
      volume: 0,
      duration: MS_FUNDIDO,
      onComplete: () => cortarFragmento(),
    });
  });
}

/** Corta el fragmento de fondo, si hay uno sonando. */
export function cortarFragmento() {
  if (!fragmento) return;
  fragmento.fundido?.remove();
  fragmento.sonido.stop();
  fragmento.sonido.destroy();
  fragmento = null;
}

/** Corta todo lo que suene (tema del Phone y fragmento), por ejemplo al reiniciar la partida. */
export function detenerMusica() {
  cortarFragmento();
  actual?.sonido.stop();
  actual?.sonido.destroy();
  actual = null;
}

export function formatoTiempo(segundos: number) {
  const s = Math.max(0, Math.floor(segundos));
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
}
