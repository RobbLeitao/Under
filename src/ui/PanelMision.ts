import Phaser from 'phaser';
import { ANCHO, ALTO } from '../config';
import { BANDAS } from '../data/bandas';
import { FIGURITAS } from '../data/figuritas';
import { TEMAS } from '../data/temas';
import type { Mision } from '../data/misiones/tipos';
import { abrirPlataforma, textoBotonPlataforma } from '../systems/enlaces';
import { sinLigaduras } from '../systems/textos';
import { crearBoton } from './Boton';

const FUENTE = '"Pixelify Sans"';
const ANCHO_PANEL = 620;
const RELLENO = 28;
const BORDE = 4;
const SOMBRA = 6;
const LADO_ICONO = 64;

/** Qué eligió el jugador al cerrar el panel. */
export type SalidaPanel = 'seguir' | 'phone';

/**
 * Panel de "¡Misión cumplida!": qué se ganó, el botón para escuchar a la banda,
 * abrir el Phone y lo que viene después. Tapa toda la pantalla hasta que se cierra.
 */
export function mostrarMisionCumplida(
  escena: Phaser.Scene,
  mision: Mision,
  recompensas: string[],
): Promise<SalidaPanel> {
  return new Promise((resolver) => {
    const objetos: Phaser.GameObjects.GameObject[] = [];
    const texto = (x: number, y: number, t: string, tamano: number, color: string, ancho?: number) => {
      const o = escena.add.text(x, y, sinLigaduras(t), {
        fontFamily: FUENTE,
        fontSize: `${tamano}px`,
        color,
        lineSpacing: 4,
        wordWrap: ancho ? { width: ancho, useAdvancedWrap: true } : undefined,
      });
      contenido.push(o);
      return o;
    };
    const contenido: Phaser.GameObjects.GameObject[] = [];
    const interior = ANCHO_PANEL - RELLENO * 2;

    // Contenido, armado de arriba hacia abajo en coordenadas del panel.
    let y = RELLENO;
    texto(ANCHO_PANEL / 2, y, '¡Misión cumplida!', 40, '#A7362F').setOrigin(0.5, 0);
    y += 52;
    texto(ANCHO_PANEL / 2, y, mision.titulo, 24, '#15131A').setOrigin(0.5, 0);
    y += 44;
    texto(RELLENO, y, 'Ganaste:', 20, '#5A5068');
    y += 32;

    for (const recompensa of recompensas) {
      const [tipo, clave] = recompensa.split(':');
      let titulo = '';
      let detalle = '';
      let banda = '';
      if (tipo === 'tema' && TEMAS[clave]) {
        banda = TEMAS[clave].banda;
        titulo = TEMAS[clave].titulo;
        detalle = `Tema de ${BANDAS[banda]?.nombre ?? banda}. Está en Música, en tu Phone.`;
      } else if (tipo === 'figurita') {
        const f = FIGURITAS.find((x) => x.clave === clave);
        if (!f) continue;
        banda = f.banda;
        titulo = `Figurita de ${f.nombre}`;
        detalle = `${BANDAS[banda]?.nombre ?? banda}. Está en el Álbum, en tu Phone.`;
      } else continue;

      // Ícono: el logo de la banda sobre fondo oscuro.
      contenido.push(escena.add.rectangle(RELLENO, y, LADO_ICONO + 40, LADO_ICONO, 0x15131a).setOrigin(0));
      const logo = `logo-${banda}`;
      if (escena.textures.exists(logo)) {
        const img = escena.add.image(RELLENO + (LADO_ICONO + 40) / 2, y + LADO_ICONO / 2, logo).setOrigin(0.5);
        img.setScale(Math.min(1, (LADO_ICONO + 32) / img.width, (LADO_ICONO - 8) / img.height));
        contenido.push(img);
      }
      const xTexto = RELLENO + LADO_ICONO + 56;
      const t1 = texto(xTexto, y + 2, titulo, 22, '#15131A', interior - (xTexto - RELLENO));
      texto(xTexto, y + 6 + t1.height, detalle, 16, '#5A5068', interior - (xTexto - RELLENO));
      y += LADO_ICONO + 16;
    }

    y += 4;
    const cerrar = (salida: SalidaPanel) => {
      objetos.forEach((o) => o.destroy());
      resolver(salida);
    };
    const etiquetaEnlace = textoBotonPlataforma(mision.banda);
    if (etiquetaEnlace) {
      contenido.push(crearBoton(escena, RELLENO, y, interior, etiquetaEnlace, () => abrirPlataforma(mision.banda)));
      y += 52 + 16;
    }
    const mitad = (interior - 16) / 2;
    contenido.push(crearBoton(escena, RELLENO, y, mitad, 'Abrir el Phone', () => cerrar('phone'), 'oscuro'));
    contenido.push(crearBoton(escena, RELLENO + mitad + 16, y, mitad, 'Seguir', () => cerrar('seguir'), 'oscuro'));
    y += 52 + 24;

    const viene = texto(RELLENO, y, `Lo que viene: ${mision.siguiente}`, 18, '#5A5068', interior);
    y += viene.height + RELLENO;

    // Fondo: oscurece todo y bloquea los toques; después, la caja con sombra dura.
    const altoPanel = y;
    const x0 = Math.round((ANCHO - ANCHO_PANEL) / 2);
    const y0 = Math.round((ALTO - altoPanel) / 2);
    const velo = escena.add.rectangle(0, 0, ANCHO, ALTO, 0x15131a, 0.75).setOrigin(0).setInteractive();
    const g = escena.add.graphics();
    g.fillStyle(0x15131a).fillRect(SOMBRA, SOMBRA, ANCHO_PANEL, altoPanel);
    g.fillRect(0, 0, ANCHO_PANEL, altoPanel);
    g.fillStyle(0xf4efe6).fillRect(BORDE, BORDE, ANCHO_PANEL - BORDE * 2, altoPanel - BORDE * 2);
    const panel = escena.add.container(x0, y0, [g, ...contenido]);
    velo.setDepth(25000);
    panel.setDepth(25001);
    objetos.push(velo, panel);

    // Entrada: el panel cae un poco desde arriba.
    panel.y = y0 - 24;
    panel.alpha = 0;
    escena.tweens.add({ targets: panel, y: y0, alpha: 1, duration: 250, ease: 'Back.easeOut' });
  });
}
