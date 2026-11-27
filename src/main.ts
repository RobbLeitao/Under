import Phaser from 'phaser';
import { Boot } from './scenes/Boot';
import { Preload } from './scenes/Preload';
import { Inicio } from './scenes/Inicio';
import { EsquinaBunker } from './scenes/EsquinaBunker';
import { Phone } from './scenes/Phone';
import { Pausa } from './scenes/Pausa';
import { ANCHO, ALTO } from './config';

const config: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  parent: 'juego',
  width: ANCHO,
  height: ALTO,
  backgroundColor: '#15131A',
  pixelArt: true,
  roundPixels: true,
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },
  input: { activePointers: 2 },
  dom: { createContainer: true },
  scene: [Boot, Preload, Inicio, EsquinaBunker, Phone, Pausa],
};

const juego = new Phaser.Game(config);

// Solo en desarrollo: acceso al juego desde la consola o desde pruebas automáticas.
if (import.meta.env.DEV) {
  void import('./systems/ambiente').then(({ nivelAmbiente }) => {
    (window as unknown as { __under: unknown }).__under = { juego, nivelAmbiente };
  });
}
