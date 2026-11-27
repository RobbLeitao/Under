"""
Genera la hoja de caminar de un personaje a partir de su cuadro quieto, con el mismo
movimiento que jugador-camina (4 cuadros, en fila):

  0 y 2: paso largo. Las piernas se separan desde unas filas debajo de la cintura
         (izquierda -1 unidad, derecha +1), los pies se abren 1 unidad más y los brazos
         se balancean al revés (el izquierdo sube 1, el derecho baja 1).
  1:     pie derecho en el aire. Todo el cuerpo sube 1 unidad y el pie derecho sube 2 más.
  3:     lo mismo con el pie izquierdo.

Uso (desde la raíz del repo, con Pillow instalado):
  python scripts/generar-caminar.py

Lee el primer cuadro de la hoja de hablar (que es el personaje quieto, con el mismo margen
de 3 unidades a cada lado y 2 arriba) y escribe en public/assets/sprites/anim/ el PNG a
escala x4 y en assets/sprites/anim/ el SVG fuente, como las demás hojas.
"""
from PIL import Image

ESCALA = 4
CUADROS = 4

# Medidas en unidades, dentro del cuadro (con margen). Ver el mapa de Nikola en el PR.
PERSONAJES = {
    'nikola': dict(quieto='nikola-habla', ancho=28, alto=53,
                   centro=14,      # primera columna de la pierna derecha
                   separar=41,     # fila desde la que se separan las piernas
                   pies=48,        # fila desde la que los pies se abren más
                   brazos=(27, 36), brazo_izq=(4, 7), brazo_der=(21, 24)),
    'nikola-pasamontanas': dict(quieto='nikola-pasamontanas-habla', ancho=28, alto=53,
                                centro=14, separar=41, pies=48,
                                brazos=(27, 36), brazo_izq=(4, 7), brazo_der=(21, 24)),
}

VACIO = (0, 0, 0, 0)


def leer_quieto(clave, ancho, alto):
    hoja = Image.open(f'public/assets/sprites/anim/{clave}.png').convert('RGBA')
    hoja = hoja.resize((hoja.width // ESCALA, hoja.height // ESCALA), Image.NEAREST)
    return hoja.crop((0, 0, ancho, alto))


def copia_vacia(im):
    return Image.new('RGBA', im.size, VACIO)


def mover_region(im, x0, x1, y0, y1, dx, dy):
    """Mueve el rectángulo [x0,x1) x [y0,y1) por (dx, dy), dejando vacío lo que queda atrás."""
    region = im.crop((x0, y0, x1, y1))
    for y in range(y0, y1):
        for x in range(x0, x1):
            im.putpixel((x, y), VACIO)
    w, h = im.size
    for y in range(region.height):
        for x in range(region.width):
            p = region.getpixel((x, y))
            nx, ny = x0 + x + dx, y0 + y + dy
            if p[3] and 0 <= nx < w and 0 <= ny < h:
                im.putpixel((nx, ny), p)


def paso_largo(base, c):
    im = base.copy()
    w, h = im.size
    # Piernas: se separan, y los pies un poco más.
    mover_region(im, 0, c['centro'], c['separar'], h, -1, 0)
    mover_region(im, c['centro'], w, c['separar'], h, 1, 0)
    mover_region(im, 0, c['centro'], c['pies'], h, -1, 0)
    mover_region(im, c['centro'], w, c['pies'], h, 1, 0)
    # Brazos al revés que las piernas.
    y0, y1 = c['brazos']
    mover_region(im, *c['brazo_izq'], y0, y1, 0, -1)
    mover_region(im, *c['brazo_der'], y0, y1, 0, 1)
    return im


def pie_en_el_aire(base, c, derecho):
    im = copia_vacia(base)
    w, h = im.size
    # Todo el cuerpo sube 1 unidad.
    im.alpha_composite(base.crop((0, 1, w, h)), (0, 0))
    # El pie de ese lado sube 2 más (tapa la parte baja del pantalón).
    x0, x1 = (c['centro'], w) if derecho else (0, c['centro'])
    mover_region(im, x0, x1, c['pies'] - 1, h, 0, -2)
    return im


def svg(hoja):
    rects = []
    for y in range(hoja.height):
        for x in range(hoja.width):
            r, g, b, a = hoja.getpixel((x, y))
            if a:
                rects.append(f'<rect x="{x}" y="{y}" width="1" height="1" fill="#{r:02x}{g:02x}{b:02x}"/>')
    return (f'<svg xmlns="http://www.w3.org/2000/svg" width="{hoja.width}" height="{hoja.height}" '
            f'viewBox="0 0 {hoja.width} {hoja.height}" shape-rendering="crispEdges">\n'
            + ''.join(rects) + '\n</svg>\n')


for nombre, c in PERSONAJES.items():
    base = leer_quieto(c['quieto'], c['ancho'], c['alto'])
    cuadros = [paso_largo(base, c), pie_en_el_aire(base, c, True),
               paso_largo(base, c), pie_en_el_aire(base, c, False)]
    hoja = Image.new('RGBA', (c['ancho'] * CUADROS, c['alto']), VACIO)
    for i, cuadro in enumerate(cuadros):
        hoja.alpha_composite(cuadro, (i * c['ancho'], 0))
    hoja.resize((hoja.width * ESCALA, hoja.height * ESCALA), Image.NEAREST).save(
        f'public/assets/sprites/anim/{nombre}-camina.png')
    with open(f'assets/sprites/anim/{nombre}-camina.svg', 'w', encoding='utf-8') as f:
        f.write(svg(hoja))
    print(f'{nombre}-camina: {CUADROS} cuadros de {c["ancho"]}x{c["alto"]} unidades')
