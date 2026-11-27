import Phaser from 'phaser';

/** Primera escena: espera la tipografía y pasa a Preload. */
export class Boot extends Phaser.Scene {
  constructor() {
    super('Boot');
  }

  create() {
    // Las dos variantes: si la negrita no está cargada, el navegador la imita engrosando
    // la regular y la C queda cerrada (se lee como O).
    const fuentes = document.fonts
      ? Promise.all([document.fonts.load('16px "Pixelify Sans"'), document.fonts.load('bold 16px "Pixelify Sans"')])
      : Promise.resolve();
    fuentes.catch(() => undefined).finally(() => this.scene.start('Preload'));
  }
}
