"""
Separa la parada de colectivo (techo, postes, vidrio, banco y el cartel con su poste) del
fondo de la esquina de El Bunker y la guarda como un sprite aparte. Así se puede ordenar
por profundidad: el jugador pasa por atrás (la parada lo tapa) o por adelante.

Uso (desde la raíz del repo): python scripts/separar-parada.py

Los rectángulos de la parada son los que están dentro de la caja de abajo y tienen los
colores de la parada. Se buscan por contenido, no por posición en el archivo, así que el
script se puede volver a correr. Si el fondo ya no los tiene, no hace nada.
"""
import re

FONDOS = ['assets/escenas/esquina-el-bunker.svg', 'public/assets/escenas/esquina-el-bunker.svg']
SALIDAS = ['assets/escenas/parada-colectivo.svg', 'public/assets/escenas/parada-colectivo.svg']

# Caja de la parada y su cartel, en unidades.
X0, Y0, X1, Y1 = 4, 60, 62, 110
# Rects de la parada, tal como están en el fondo (x, y, ancho, alto, color).
PARADA = [
    (4, 70, 48, 3, '#2a2a32'), (4, 70, 48, 1, '#55555f'),             # techo
    (6, 73, 2, 37, '#2a2a32'), (48, 73, 2, 37, '#2a2a32'),            # postes
    (10, 74, 36, 24, '#a9c4d4'), (11, 75, 3, 20, '#ffffff'),          # vidrio y reflejo
    (12, 101, 32, 3, '#6a4a32'), (12, 101, 32, 1, '#8a6a4a'),         # banco
    (14, 104, 2, 6, '#2a2a32'), (40, 104, 2, 6, '#2a2a32'),           # patas del banco
    (56, 66, 2, 44, '#2a2a32'),                                       # poste del cartel
    (52, 60, 10, 8, '#24407e'), (53, 61, 8, 6, '#3e60b0'),            # cartel
    (54, 62, 6, 3, '#f4efe6'), (55, 65, 1, 1, '#f4efe6'), (58, 65, 1, 1, '#f4efe6'),
]


def clave(attrs):
    a = dict(re.findall(r'([\w-]+)="([^"]*)"', attrs))
    return (int(float(a['x'])), int(float(a['y'])), int(float(a['width'])), int(float(a['height'])), a['fill'])


fuente = open(FONDOS[0], encoding='utf-8').read()
encontrados = []
def sacar(m):
    if clave(m.group(1)) in PARADA:
        encontrados.append(m.group(0))
        return ''
    return m.group(0)

sin_parada = re.sub(r'<rect([^>]*)/>\n?', sacar, fuente)
if not encontrados:
    print('El fondo ya no tiene la parada: nada que hacer.')
    raise SystemExit

# Después de la parada, el fondo dibuja capas semitransparentes de luz y sombra (el velo de
# noche, el brillo del farol, el oscurecido del borde). Como la parada ahora va arriba de
# todo, a cada uno de sus rects se le hornean, en orden, las capas que lo cubren entero.
# La cuenta es exacta también para el vidrio semitransparente: mezclar su color con la capa
# en la misma proporción da el mismo resultado que la capa encima.
todos = re.findall(r'<rect[^>]*/>', fuente)
sacados = {r.strip() for r in encontrados}
ultimo = max(i for i, r in enumerate(todos) if r in sacados)
CAPAS = []
for r in todos[ultimo + 1:]:
    a = dict(re.findall(r'([\w-]+)="([^"]*)"', r))
    if 'opacity' in a:
        x, y, w, h, color = clave(r[5:])
        CAPAS.append((x, y, x + w, y + h, color, float(a['opacity'])))


def con_capas(rect):
    x, y, w, h, _ = clave(rect[5:])
    color = re.search(r'fill="(#[0-9a-fA-F]{6})"', rect).group(1)
    canales = [int(color[i:i + 2], 16) for i in (1, 3, 5)]
    for cx0, cy0, cx1, cy1, capa, t in CAPAS:
        if cx0 <= x and cy0 <= y and x + w <= cx1 and y + h <= cy1:
            canales = [round(v * (1 - t) + int(capa[i:i + 2], 16) * t) for v, i in zip(canales, (1, 3, 5))]
    return rect.replace(f'fill="{color}"', 'fill="#' + ''.join(f'{v:02x}' for v in canales) + '"')


# La parada, en su propio SVG, con las coordenadas corridas a su caja.
def correr(rect):
    rect = con_capas(rect)
    def mover(m):
        nombre, valor = m.group(1), float(m.group(2))
        if nombre == 'x':
            valor -= X0
        elif nombre == 'y':
            valor -= Y0
        return f'{nombre}="{int(valor)}"'
    return re.sub(r'\b(x|y)="([\d.]+)"', mover, rect)

ancho, alto = X1 - X0, Y1 - Y0
parada = (f'<svg xmlns="http://www.w3.org/2000/svg" width="{ancho * 4}" height="{alto * 4}" '
          f'viewBox="0 0 {ancho} {alto}" shape-rendering="crispEdges">'
          + ''.join(correr(r.strip()) for r in encontrados) + '</svg>\n')

for ruta in FONDOS:
    open(ruta, 'w', encoding='utf-8').write(sin_parada)
for ruta in SALIDAS:
    open(ruta, 'w', encoding='utf-8').write(parada)
print(f'Parada separada: {len(encontrados)} rects, caja {ancho}x{alto} unidades en ({X0}, {Y0}).')
