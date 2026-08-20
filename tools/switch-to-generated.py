#!/usr/bin/env python3
"""
Переключает сайт со скачанных заглушек на сгенерированные кадры.

Меняет в site/partials/data.js пути /images/stock/<файл> → /images/gen/<файл>
для тех файлов, которые реально появились в site/src/images/gen/.
Остальные пути остаются на месте — так можно переключать частями.

    python3 tools/switch-to-generated.py          # показать, что будет сделано
    python3 tools/switch-to-generated.py --apply  # применить
"""
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
DATA = ROOT / 'site' / 'partials' / 'data.js'
GEN = ROOT / 'site' / 'src' / 'images' / 'gen'

def main():
    apply = '--apply' in sys.argv
    if not GEN.exists():
        sys.exit('Нет каталога site/src/images/gen — сначала запусти prepare-images.py')

    ready = {p.name for p in GEN.glob('*.jpg')}
    text = DATA.read_text(encoding='utf-8')

    used = set(re.findall(r'/images/stock/([\w.-]+\.jpg)', text))
    switch = sorted(used & ready)
    left = sorted(used - ready)

    for name in switch:
        text = text.replace(f'/images/stock/{name}', f'/images/gen/{name}')

    print(f'Переключаю: {len(switch)}')
    for n in switch:
        print(f'  stock/{n} → gen/{n}')
    if left:
        print(f'\nОстаются на заглушках ({len(left)}): ' + ', '.join(left))

    if apply:
        DATA.write_text(text, encoding='utf-8')
        print('\ndata.js обновлён. Дальше: cd site && node build.js')
    else:
        print('\nЭто предпросмотр. Запусти с --apply, чтобы применить.')

if __name__ == '__main__':
    main()
