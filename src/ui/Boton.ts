import Phaser from 'phaser';
import { sinLigaduras } from '../systems/textos';

const FUENTE = '"Pixelify Sans"';

export type EstiloBoton = 'acento' | 'oscuro';

const ESTILOS: Record<EstiloBoton, { fondo: number; borde: number; texto: string }> = {
  acento: { fondo: 0xe8c46a, borde: 0x15131a, texto: '#15131A' },
  oscuro: { fondo: 0x241f2e, borde: 0x3a3348, texto: '#F4EFE6' },
};

/**
 * Botón con borde y sombra dura (estilo de las viñetas). Mínimo 44 px de alto.
 * Devuelve un contenedor ubicado en (x, y), esquina de arriba a la izquierda.
 */
export function crearBoton(
  escena: Phaser.Scene,
  x: number,
  y: number,
  ancho: number,
  etiqueta: string,
  alTocar: () => void,
  estilo: EstiloBoton = 'acento',
  alto = 52,
): Phaser.GameObjects.Container {
  const e = ESTILOS[estilo];
  const sombra = escena.add.rectangle(4, 4, ancho, alto, 0x15131a).setOrigin(0);
  const fondo = escena.add
    .rectangle(0, 0, ancho, alto, e.fondo)
    .setOrigin(0)
    .setStrokeStyle(4, e.borde)
    .setInteractive({ useHandCursor: true });
  const texto = escena.add
    .text(ancho / 2, alto / 2, sinLigaduras(etiqueta), { fontFamily: FUENTE, fontSize: '22px', color: e.texto })
    .setOrigin(0.5);
  const boton = escena.add.container(x, y, [sombra, fondo, texto]);

  fondo.on('pointerdown', () => {
    fondo.setPosition(4, 4);
    texto.setPosition(ancho / 2 + 4, alto / 2 + 4);
  });
  const soltar = () => {
    fondo.setPosition(0, 0);
    texto.setPosition(ancho / 2, alto / 2);
  };
  fondo.on('pointerout', soltar);
  // En 'pointerup' para que abrir un enlace cuente como acción del usuario.
  fondo.on('pointerup', () => {
    soltar();
    alTocar();
  });
  return boton;
}

/** Ancho que necesita un botón para su etiqueta. */
export function anchoBoton(escena: Phaser.Scene, etiqueta: string): number {
  const medida = escena.add.text(0, 0, sinLigaduras(etiqueta), { fontFamily: FUENTE, fontSize: '22px' });
  const ancho = Math.ceil(medida.width) + 48;
  medida.destroy();
  return ancho;
}
