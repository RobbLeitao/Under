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

/** Reproduce, pausa o retoma un tema. Devuelve una promesa que se cumple cuando empieza a sonar. */
export function alternar(escena: Phaser.Scene, tema: string): Promise<void> {
  if (actual?.clave === tema) {
    if (actual.sonido.isPlaying) actual.sonido.pause();
    else if (actual.sonido.isPaused) actual.sonido.resume();
    else actual.sonido.play();
    return Promise.resolve();
  }

  actual?.sonido.stop();
  actual?.sonido.destroy();
  actual = null;

  const clave = claveAudio(tema);
  const empezar = () => {
    const sonido = escena.sound.add(clave);
    sonido.once(Phaser.Sound.Events.COMPLETE, () => sonido.stop());
    actual = { clave: tema, sonido };
    sonido.play();
  };

  if (escena.cache.audio.exists(clave)) {
    empezar();
    return Promise.resolve();
  }
  return new Promise((resolver) => {
    escena.load.audio(clave, TEMAS[tema].archivo);
    escena.load.once(Phaser.Loader.Events.COMPLETE, () => {
      if (escena.cache.audio.exists(clave)) empezar();
      resolver();
    });
    escena.load.start();
  });
}

export function formatoTiempo(segundos: number) {
  const s = Math.max(0, Math.floor(segundos));
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
}
