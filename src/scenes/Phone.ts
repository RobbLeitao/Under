import Phaser from 'phaser';
import { ANCHO, ALTO, CAJA_LOGO } from '../config';
import { BANDAS } from '../data/bandas';
import { FIGURITAS } from '../data/figuritas';
import { TEMAS } from '../data/temas';
import { listaRecompensas } from '../systems/estado';
import { alternar, estaSonando, formatoTiempo, progreso, temaActual } from '../systems/musica';
import { sinLigaduras } from '../systems/textos';

const FUENTE = '"Pixelify Sans"';
const COLOR = {
  fondo: 0x15131a,
  marco: 0x0e0e10,
  bordeMarco: 0x3a3348,
  boton: 0x241f2e,
  bordeBoton: 0x3a3348,
  acento: 0xe8c46a,
  rojo: 0xa7362f,
  naranja: 0xd98a4e,
  papel: 0xf4efe6,
  apagado: 0x3a3348,
};
const TEXTO = { claro: '#F4EFE6', acento: '#E8C46A', apagado: '#9A8FB0', oscuro: '#15131A', rojo: '#A7362F' };
const CIELO = [0x2b1d3a, 0x4a2a52, 0x7a3b55, 0xc25a4a, 0xe8875a];

/** Pantalla del Phone: 360x640, centrada en el lienzo. */
const W = 360;
const H = 640;
const X0 = (ANCHO - W) / 2;
const Y0 = (ALTO - H) / 2;
const MARCO = 16;
const ALTO_ESTADO = 32;
const ALTO_CABECERA = 64;
const MARGEN = 16;

type Pantalla = 'inicio' | 'musica' | 'album';

/**
 * El Phone del jugador, abierto encima de la escena. Apps Música y Álbum;
 * Mapa y Chats se ven deshabilitadas en la demo. La hora es la del dispositivo.
 */
export class Phone extends Phaser.Scene {
  private volverA = '';
  private contenido!: Phaser.GameObjects.Container;
  private hora!: Phaser.GameObjects.Text;
  /** Lo que se actualiza solo mientras suena un tema. */
  private reproductor: {
    tema: string;
    boton: Phaser.GameObjects.Graphics;
    relleno: Phaser.GameObjects.Rectangle;
    tiempo: Phaser.GameObjects.Text;
    sonando: boolean;
  } | null = null;

  constructor() {
    super('Phone');
  }

  init(datos: { volverA: string }) {
    this.volverA = datos.volverA;
  }

  create() {
    // Fondo oscuro: tocarlo cierra el Phone.
    this.add
      .rectangle(0, 0, ANCHO, ALTO, COLOR.fondo, 0.75)
      .setOrigin(0)
      .setInteractive()
      .on('pointerup', () => this.cerrar());

    // Marco del celular (bloquea los toques para que no cierren).
    this.add
      .rectangle(X0 - MARCO, Y0 - MARCO, W + MARCO * 2, H + MARCO * 2, COLOR.marco)
      .setOrigin(0)
      .setStrokeStyle(4, COLOR.bordeMarco)
      .setInteractive();
    this.add.rectangle(X0, Y0, W, H, COLOR.fondo).setOrigin(0);

    this.contenido = this.add.container(0, 0);
    this.dibujarBarraEstado();
    this.mostrar('inicio');

    this.time.addEvent({ delay: 250, loop: true, callback: () => this.actualizar() });
    this.input.keyboard?.on('keydown-ESC', () => this.cerrar());
  }

  private cerrar() {
    this.scene.resume(this.volverA);
    this.scene.stop();
  }

  // ---------- Partes comunes ----------

  /**
   * Texto del Phone. La negrita de Pixelify Sans cierra la C, el 2 y el 5 (se leen O, 8, 8),
   * así que se usa solo en textos fijos sin esas letras, como el logo.
   */
  private texto(x: number, y: number, texto: string, tamano: number, color: string, negrita = false, ancho?: number) {
    return this.add.text(x, y, sinLigaduras(texto), {
      fontFamily: FUENTE,
      fontSize: `${tamano}px`,
      fontStyle: negrita ? 'bold' : 'normal',
      color,
      lineSpacing: 4,
      wordWrap: ancho ? { width: ancho, useAdvancedWrap: true } : undefined,
    });
  }

  /** Botón rectangular de al menos 44 px de alto. */
  private boton(x: number, y: number, ancho: number, alto: number, etiqueta: string, alTocar: () => void) {
    const fondo = this.add
      .rectangle(x, y, ancho, alto, COLOR.boton)
      .setOrigin(0)
      .setStrokeStyle(4, COLOR.bordeBoton)
      .setInteractive({ useHandCursor: true });
    const texto = this.texto(x + ancho / 2, y + alto / 2, etiqueta, 22, TEXTO.claro).setOrigin(0.5);
    fondo.on('pointerdown', () => fondo.setStrokeStyle(4, COLOR.acento));
    fondo.on('pointerout', () => fondo.setStrokeStyle(4, COLOR.bordeBoton));
    fondo.on('pointerup', () => {
      fondo.setStrokeStyle(4, COLOR.bordeBoton);
      alTocar();
    });
    return [fondo, texto];
  }

  private dibujarBarraEstado() {
    this.add.rectangle(X0, Y0, W, ALTO_ESTADO, COLOR.marco).setOrigin(0).setDepth(1);
    this.hora = this.texto(X0 + MARGEN, Y0 + 6, '', 20, TEXTO.claro).setDepth(1);
    // Batería en pixel art.
    const g = this.add.graphics().setDepth(1);
    const bx = X0 + W - MARGEN - 28;
    g.fillStyle(COLOR.papel).fillRect(bx, Y0 + 10, 24, 12).fillRect(bx + 24, Y0 + 14, 4, 4);
    g.fillStyle(COLOR.marco).fillRect(bx + 2, Y0 + 12, 20, 8);
    g.fillStyle(0x5ab45a).fillRect(bx + 4, Y0 + 14, 12, 4);
    this.actualizarHora();
  }

  private actualizarHora() {
    const ahora = new Date();
    this.hora.setText(`${String(ahora.getHours()).padStart(2, '0')}:${String(ahora.getMinutes()).padStart(2, '0')}`);
  }

  private cabecera(titulo: string, detalle?: string) {
    const y = Y0 + ALTO_ESTADO;
    this.contenido.add(this.add.rectangle(X0, y, W, ALTO_CABECERA, COLOR.boton).setOrigin(0));
    this.contenido.add(this.boton(X0 + 8, y + 8, 48, 48, '‹', () => this.mostrar('inicio')));
    this.contenido.add(this.texto(X0 + 72, y + ALTO_CABECERA / 2, titulo, 26, TEXTO.claro).setOrigin(0, 0.5));
    if (detalle) {
      this.contenido.add(
        this.texto(X0 + W - MARGEN, y + ALTO_CABECERA / 2, detalle, 18, TEXTO.apagado).setOrigin(1, 0.5),
      );
    }
  }

  private mostrar(pantalla: Pantalla) {
    this.contenido.removeAll(true);
    this.reproductor = null;
    if (pantalla === 'inicio') this.pantallaInicio();
    else if (pantalla === 'musica') this.pantallaMusica();
    else this.pantallaAlbum();
  }

  private actualizar() {
    this.actualizarHora();
    const r = this.reproductor;
    if (!r) return;
    const esteSuena = temaActual() === r.tema;
    const sonando = esteSuena && estaSonando();
    if (sonando !== r.sonando) {
      r.sonando = sonando;
      this.dibujarIconoPlay(r.boton, sonando);
    }
    const { segundos, duracion } = esteSuena ? progreso() : { segundos: 0, duracion: 0 };
    r.relleno.width = duracion ? (W - MARGEN * 2) * Math.min(1, segundos / duracion) : 0;
    r.tiempo.setText(duracion ? `${formatoTiempo(segundos)} / ${formatoTiempo(duracion)}` : '');
  }

  // ---------- Inicio ----------

  private pantallaInicio() {
    const arriba = Y0 + ALTO_ESTADO;
    const alto = (H - ALTO_ESTADO) / CIELO.length;
    CIELO.forEach((color, i) => {
      this.contenido.add(this.add.rectangle(X0, arriba + i * alto, W, Math.ceil(alto), color).setOrigin(0));
    });
    this.contenido.add(this.texto(X0 + W / 2, arriba + 40, 'UNDER', 40, TEXTO.acento, true).setOrigin(0.5));

    const apps: { nombre: string; color: number; dibujar: (g: Phaser.GameObjects.Graphics, x: number, y: number) => void; abrir?: Pantalla }[] = [
      { nombre: 'Música', color: COLOR.rojo, dibujar: (g, x, y) => this.iconoNota(g, x, y), abrir: 'musica' },
      { nombre: 'Álbum', color: COLOR.naranja, dibujar: (g, x, y) => this.iconoFigurita(g, x, y), abrir: 'album' },
      { nombre: 'Mapa', color: COLOR.apagado, dibujar: (g, x, y) => this.iconoMapa(g, x, y) },
      { nombre: 'Chats', color: COLOR.apagado, dibujar: (g, x, y) => this.iconoChat(g, x, y) },
    ];
    const LADO = 96;
    apps.forEach((app, i) => {
      const x = X0 + (i % 2 === 0 ? 72 : W - 72 - LADO);
      const y = arriba + 110 + Math.floor(i / 2) * 170;
      const g = this.add.graphics();
      g.fillStyle(COLOR.marco).fillRect(x + 4, y + 4, LADO, LADO);
      g.fillStyle(app.color).fillRect(x, y, LADO, LADO);
      app.dibujar(g, x, y);
      this.contenido.add(g);
      this.contenido.add(
        this.texto(x + LADO / 2, y + LADO + 10, app.nombre, 20, app.abrir ? TEXTO.claro : TEXTO.apagado).setOrigin(0.5, 0),
      );
      if (app.abrir) {
        const destino = app.abrir;
        const zona = this.add
          .zone(x, y, LADO, LADO + 40)
          .setOrigin(0)
          .setInteractive({ useHandCursor: true })
          .on('pointerup', () => this.mostrar(destino));
        this.contenido.add(zona);
      } else {
        this.contenido.add(this.texto(x + LADO / 2, y + LADO + 36, 'Pronto', 16, TEXTO.apagado).setOrigin(0.5, 0));
      }
    });

    this.contenido.add(this.boton(X0 + MARGEN, Y0 + H - 64, W - MARGEN * 2, 48, 'Cerrar', () => this.cerrar()));
  }

  // ---------- Música ----------

  private pantallaMusica() {
    this.contenido.add(this.add.rectangle(X0, Y0 + ALTO_ESTADO, W, H - ALTO_ESTADO, COLOR.fondo).setOrigin(0));
    this.cabecera('Música');
    const temas = listaRecompensas('tema').filter((t) => TEMAS[t]);
    let y = Y0 + ALTO_ESTADO + ALTO_CABECERA + MARGEN;

    if (temas.length === 0) {
      this.contenido.add(
        this.texto(X0 + MARGEN, y, 'Todavía no tenés temas. Ayudá a las bandas y te pasan su música.', 20, TEXTO.apagado, false, W - MARGEN * 2),
      );
      return;
    }

    for (const clave of temas) {
      const tema = TEMAS[clave];
      const banda = BANDAS[tema.banda];

      // Botón de reproducir / pausar.
      const LADO = 64;
      const fondo = this.add
        .rectangle(X0 + MARGEN, y, LADO, LADO, COLOR.acento)
        .setOrigin(0)
        .setInteractive({ useHandCursor: true });
      const icono = this.add.graphics();
      icono.setPosition(X0 + MARGEN, y);
      const sonando = temaActual() === clave && estaSonando();
      this.dibujarIconoPlay(icono, sonando);
      fondo.on('pointerup', () => void alternar(this, clave).then(() => this.actualizar()));
      this.contenido.add([fondo, icono]);

      const xTexto = X0 + MARGEN + LADO + 12;
      const titulo = this.texto(xTexto, y, tema.titulo, 20, TEXTO.claro, false, W - (xTexto - X0) - MARGEN);
      const nombreBanda = this.texto(xTexto, y + titulo.height + 4, banda?.nombre ?? tema.banda, 18, TEXTO.acento);
      this.contenido.add([titulo, nombreBanda]);
      y += Math.max(LADO, titulo.height + nombreBanda.height + 4) + 12;

      // Barra de progreso y tiempo.
      const largo = W - MARGEN * 2;
      this.contenido.add(this.add.rectangle(X0 + MARGEN, y, largo, 8, COLOR.boton).setOrigin(0));
      const relleno = this.add.rectangle(X0 + MARGEN, y, 0, 8, COLOR.acento).setOrigin(0);
      const tiempo = this.texto(X0 + W - MARGEN, y + 14, '', 16, TEXTO.apagado).setOrigin(1, 0);
      this.contenido.add([relleno, tiempo]);
      this.reproductor = { tema: clave, boton: icono, relleno, tiempo, sonando };
      y += 44;

      if (banda?.plataforma) {
        const { nombre, url } = banda.plataforma;
        this.contenido.add(
          this.boton(X0 + MARGEN, y, W - MARGEN * 2, 52, `Escuchanos en ${nombre}`, () =>
            window.open(url, '_blank', 'noopener'),
          ),
        );
        y += 68;
      }
    }
    this.actualizar();
  }

  /** Triángulo de play o dos barras de pausa, dentro de un botón de 64x64. */
  private dibujarIconoPlay(g: Phaser.GameObjects.Graphics, sonando: boolean) {
    g.clear().fillStyle(COLOR.marco);
    if (sonando) {
      g.fillRect(20, 18, 8, 28).fillRect(36, 18, 8, 28);
    } else {
      for (let i = 0; i < 7; i++) g.fillRect(22 + i * 4, 18 + i * 2, 4, 28 - i * 4);
    }
  }

  // ---------- Álbum ----------

  private pantallaAlbum() {
    this.contenido.add(this.add.rectangle(X0, Y0 + ALTO_ESTADO, W, H - ALTO_ESTADO, COLOR.fondo).setOrigin(0));
    const conseguidas = new Set(listaRecompensas('figurita'));
    const total = FIGURITAS.length;
    const tengo = FIGURITAS.filter((f) => conseguidas.has(f.clave)).length;
    this.cabecera('Álbum', `${tengo} de ${total}`);

    const COLUMNAS = 3;
    const SEP = 12;
    const ANCHO_CARTA = (W - MARGEN * 2 - SEP * (COLUMNAS - 1)) / COLUMNAS;
    const ALTO_CARTA = 172;
    const arriba = Y0 + ALTO_ESTADO + ALTO_CABECERA + MARGEN;

    FIGURITAS.forEach((f, i) => {
      const x = X0 + MARGEN + (i % COLUMNAS) * (ANCHO_CARTA + SEP);
      const y = arriba + Math.floor(i / COLUMNAS) * (ALTO_CARTA + SEP);
      const la = conseguidas.has(f.clave);
      const g = this.add.graphics();
      g.fillStyle(COLOR.marco).fillRect(x + 4, y + 4, ANCHO_CARTA, ALTO_CARTA);
      g.fillStyle(la ? COLOR.papel : COLOR.boton).fillRect(x, y, ANCHO_CARTA, ALTO_CARTA);
      g.lineStyle(4, la ? COLOR.marco : COLOR.bordeBoton).strokeRect(x + 2, y + 2, ANCHO_CARTA - 4, ALTO_CARTA - 4);
      this.contenido.add(g);
      const cx = x + ANCHO_CARTA / 2;

      if (!la) {
        this.contenido.add(this.texto(cx, y + ALTO_CARTA / 2, '?', 48, TEXTO.apagado, true).setOrigin(0.5));
        return;
      }
      // Logo de la banda sobre una franja oscura (los logos suelen venir sobre negro).
      const ALTO_FRANJA = CAJA_LOGO.alto + 8;
      this.contenido.add(this.add.rectangle(x + 4, y + 4, ANCHO_CARTA - 8, ALTO_FRANJA, COLOR.fondo).setOrigin(0));
      const nombreBanda = BANDAS[f.banda]?.nombre ?? f.banda;
      const logo = `logo-${f.banda}`;
      this.contenido.add(
        this.textures.exists(logo)
          ? this.add.image(Math.round(cx), y + 4 + ALTO_FRANJA / 2, logo).setOrigin(0.5)
          : this.texto(cx, y + 4 + ALTO_FRANJA / 2, nombreBanda, 18, TEXTO.claro).setOrigin(0.5),
      );
      this.contenido.add(this.texto(cx, y + 76, f.nombre, 18, TEXTO.rojo).setOrigin(0.5, 0));
      this.contenido.add(this.texto(cx, y + 100, nombreBanda, 14, TEXTO.oscuro).setOrigin(0.5, 0));
      this.contenido.add(
        this.texto(cx, y + 122, f.rol, 12, TEXTO.oscuro, false, ANCHO_CARTA - 12).setOrigin(0.5, 0).setAlign('center'),
      );
    });

    if (tengo < total) {
      this.contenido.add(
        this.texto(X0 + MARGEN, arriba + 2 * (ALTO_CARTA + SEP) + 8, 'Ayudá a los músicos de la escena para completar el álbum.', 16, TEXTO.apagado, false, W - MARGEN * 2),
      );
    }
  }

  // ---------- Íconos de las apps (96x96, en pixel art de 4 px) ----------

  private iconoNota(g: Phaser.GameObjects.Graphics, x: number, y: number) {
    g.fillStyle(COLOR.papel);
    g.fillRect(x + 52, y + 20, 8, 48).fillRect(x + 52, y + 20, 24, 8).fillRect(x + 68, y + 28, 8, 8);
    g.fillRect(x + 32, y + 60, 28, 16).fillRect(x + 36, y + 56, 20, 24);
  }

  private iconoFigurita(g: Phaser.GameObjects.Graphics, x: number, y: number) {
    g.fillStyle(COLOR.papel).fillRect(x + 24, y + 16, 48, 64);
    g.fillStyle(COLOR.rojo).fillRect(x + 40, y + 28, 16, 16).fillRect(x + 36, y + 44, 24, 20);
    g.fillStyle(COLOR.marco).fillRect(x + 32, y + 68, 32, 4);
  }

  private iconoMapa(g: Phaser.GameObjects.Graphics, x: number, y: number) {
    g.fillStyle(0x9a8fb0);
    g.fillRect(x + 36, y + 20, 24, 32).fillRect(x + 32, y + 24, 32, 24).fillRect(x + 40, y + 52, 16, 12).fillRect(x + 44, y + 64, 8, 8);
    g.fillStyle(COLOR.apagado).fillRect(x + 44, y + 32, 8, 8);
  }

  private iconoChat(g: Phaser.GameObjects.Graphics, x: number, y: number) {
    g.fillStyle(0x9a8fb0);
    g.fillRect(x + 20, y + 24, 56, 36).fillRect(x + 28, y + 60, 12, 8).fillRect(x + 28, y + 68, 4, 4);
    g.fillStyle(COLOR.apagado).fillRect(x + 32, y + 40, 8, 4).fillRect(x + 44, y + 40, 8, 4).fillRect(x + 56, y + 40, 8, 4);
  }
}
