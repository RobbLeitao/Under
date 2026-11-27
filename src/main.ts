import Phaser from 'phaser';
import { Boot } from './scenes/Boot';
import { Preload } from './scenes/Preload';
import { Inicio } from './scenes/Inicio';
import { EsquinaBunker } from './scenes/EsquinaBunker';
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
  scene: [Boot, Preload, Inicio, EsquinaBunker],
};

new Phaser.Game(config);
