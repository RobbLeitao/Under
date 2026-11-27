import Phaser from 'phaser';

/**
 * Balbuceo de los diálogos: blips cortos sintetizados con Web Audio,
 * con un tono base por personaje. No usa archivos de audio.
 */
export function balbucear(escena: Phaser.Scene, tono: number): void {
  const sonido = escena.sound;
  if (!(sonido instanceof Phaser.Sound.WebAudioSoundManager) || sonido.locked || sonido.mute) return;

  const contexto = sonido.context;
  const ahora = contexto.currentTime;
  const oscilador = contexto.createOscillator();
  const volumen = contexto.createGain();

  oscilador.type = 'square';
  oscilador.frequency.value = tono * (0.85 + Math.random() * 0.3);
  volumen.gain.setValueAtTime(0.0001, ahora);
  volumen.gain.exponentialRampToValueAtTime(0.04, ahora + 0.01);
  volumen.gain.exponentialRampToValueAtTime(0.0001, ahora + 0.07);

  oscilador.connect(volumen).connect(sonido.destination);
  oscilador.start(ahora);
  oscilador.stop(ahora + 0.08);
}
