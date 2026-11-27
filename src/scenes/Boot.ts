import Phaser from 'phaser';

/** Primera escena: espera la tipografía y pasa a Preload. */
export class Boot extends Phaser.Scene {
  constructor() {
    super('Boot');
  }

  create() {
    const fuente = document.fonts?.load('16px "Pixelify Sans"') ?? Promise.resolve();
    fuente.catch(() => undefined).finally(() => this.scene.start('Preload'));
  }
}
