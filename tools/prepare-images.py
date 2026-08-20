#!/usr/bin/env python3
"""
Подготовка изображений сайта СКБ «Источник».

Берёт исходники заказчика из source-materials/ и раскладывает готовые
оптимизированные JPEG в site/src/images/. Скрипт идемпотентный: можно
запускать заново после того, как заказчик пришлёт новые фото.

    python3 tools/prepare-images.py

Что откуда:
  • Рендеры/*/*.JPG              → изделия: защита стеллажей (6 моделей × 2 ракурса)
  • Рендеры/*/*.pdf              → габаритные чертежи ГОСТ (рендерятся через qlmanage)
  • источник-1.pdf               → рендеры мобильной пожарной установки ТГЗ-1000
  • Ещё/Untitled.pdf             → рендеры установки рекуперации KorMax
  • Описнаие по блокам/Блок №3   → фото лазерной резки и заготовок (HEIC → JPEG)
  • Производство/*.jpg           → фото сварочного участка

Требуется Pillow; HEIC и PDF конвертируются системными sips/qlmanage (macOS).
"""

import io
import os
import re
import shutil
import subprocess
import sys
import zlib
from pathlib import Path

from PIL import Image

ROOT = Path(__file__).resolve().parent.parent
SRC = ROOT / 'source-materials'
OUT = ROOT / 'site' / 'src' / 'images'
TMP = ROOT / '.image-cache'

# Целевые пропорции и ширина под каждое место на сайте.
WIDE = (16, 9, 1600)      # первый экран
CARD = (4, 3, 1000)       # карточки, галереи, лента производства
DOC = (None, None, 1600)  # чертежи — как есть, без кадрирования


def save(img, dest, spec, quality=78):
    """Кадрирует по центру под нужные пропорции, ужимает и пишет JPEG."""
    ar_w, ar_h, width = spec
    img = img.convert('RGB')

    if ar_w:
        target = ar_w / ar_h
        w, h = img.size
        if w / h > target:                       # шире нужного — режем по бокам
            new_w = int(h * target)
            left = (w - new_w) // 2
            img = img.crop((left, 0, left + new_w, h))
        else:                                    # выше нужного — режем сверху и снизу
            new_h = int(w / target)
            top = int((h - new_h) * 0.42)        # чуть выше центра: так кадр живее
            img = img.crop((0, top, w, top + new_h))

    if img.width > width:
        img = img.resize((width, round(img.height * width / img.width)), Image.LANCZOS)

    dest.parent.mkdir(parents=True, exist_ok=True)
    img.save(dest, 'JPEG', quality=quality, optimize=True, progressive=True)
    return dest


def open_any(path):
    """Открывает JPEG/PNG напрямую, HEIC — через системный sips."""
    path = Path(path)
    if path.suffix.lower() in {'.heic', '.heif'}:
        TMP.mkdir(exist_ok=True)
        tmp = TMP / (path.stem + '.jpg')
        subprocess.run(
            ['sips', '-s', 'format', 'jpeg', '-Z', '2200', str(path), '--out', str(tmp)],
            capture_output=True, check=True)
        return Image.open(tmp)
    return Image.open(path)


def render_pdf(path):
    """Рендерит первую страницу PDF через Quick Look (macOS)."""
    TMP.mkdir(exist_ok=True)
    stage = TMP / 'ql'
    shutil.rmtree(stage, ignore_errors=True)
    stage.mkdir(parents=True)
    subprocess.run(['qlmanage', '-t', '-s', '2000', '-o', str(stage), str(path)],
                   capture_output=True)
    pngs = list(stage.glob('*.png'))
    return Image.open(pngs[0]) if pngs else None


# ---------------------------------------------------------------------------
# Извлечение растровых картинок из PDF (рендеры лежат внутри с альфа-маской)
# ---------------------------------------------------------------------------

def pdf_images(path, min_side=600):
    """Достаёт из PDF картинки со SMask и накладывает их на белый фон."""
    data = Path(path).read_bytes()
    objs = {int(m.group(1)): m.group(2)
            for m in re.finditer(rb'(\d+)\s+0\s+obj(.*?)endobj', data, re.S)}

    def split(body):
        s = body.find(b'stream')
        start = body.find(b'\n', s) + 1
        return body[:s], body[start:body.find(b'endstream', start)]

    result = []
    for num, body in objs.items():
        if b'/Image' not in body or b'stream' not in body:
            continue
        head, raw = split(body)
        wm = re.search(rb'/Width\s+(\d+)', head)
        hm = re.search(rb'/Height\s+(\d+)', head)
        sm = re.search(rb'/SMask\s+(\d+)\s+0\s+R', head)
        if not (wm and hm and sm):
            continue
        w, h = int(wm.group(1)), int(hm.group(1))
        if min(w, h) < min_side:
            continue
        try:
            if b'DCTDecode' in head:
                rgb = Image.open(io.BytesIO(raw.strip())).convert('RGB')
            else:
                rgb = Image.frombytes('RGB', (w, h), zlib.decompress(raw.strip())[:w * h * 3])
            mask = Image.frombytes('L', (w, h),
                                   zlib.decompress(split(objs[int(sm.group(1))])[1].strip())[:w * h])
        except Exception:
            continue
        # Почти прозрачные объекты — это тени и подложки, они не нужны.
        if sum(mask.resize((40, 40)).getdata()) < 40 * 40 * 12:
            continue
        flat = Image.new('RGB', (w, h), (255, 255, 255))
        flat.paste(rgb, mask=mask)
        result.append((num, flat))
    return dict(result)


# ---------------------------------------------------------------------------
# Карта: что из чего собираем
# ---------------------------------------------------------------------------

RENDERS = [
    ('ЗСФ-1/1-ЗСФ-1.JPG', 'products/zsf-1.jpg'),
    ('ЗСФ-1/2-ЗСФ-1.JPG', 'products/zsf-1-b.jpg'),
    ('ЗСФ-2/1-ЗСФ-2.JPG', 'products/zsf-2.jpg'),
    ('ЗСФ-2/2-ЗСФ-2.JPG', 'products/zsf-2-b.jpg'),
    ('ЗСУ-1/1-ЗСУ-1.JPG', 'products/zsu-1.jpg'),
    ('ЗСУ-1/2-ЗСУ-1.JPG', 'products/zsu-1-b.jpg'),
    ('ЗСУ-2/1-ЗСУ-2.JPG', 'products/zsu-2.jpg'),
    ('ЗСУ-2/2-ЗСУ-2.JPG', 'products/zsu-2-b.jpg'),
    ('ЗСФт-1/ЗСФт-1У.JPG', 'products/zsft-1.jpg'),
    ('ЗСФт-1/ЗСФт-1У-1.JPG', 'products/zsft-1-b.jpg'),
    ('ЗСФт-2/1 - ЗСФт-2.JPG', 'products/zsft-2.jpg'),
    ('ЗСФт-2/2 - ЗСФт-2.JPG', 'products/zsft-2-b.jpg'),
]

DRAWINGS = [
    ('ЗСФ-1/ЗСФ.00.001 - Защита для стеллажа фронт. ЗСФ-1.pdf', 'drawings/zsf-1.jpg'),
    ('ЗСФ-2/ЗСФ.00.002 - Защита для стеллажа фронт. ЗСФ-2.pdf', 'drawings/zsf-2.jpg'),
    ('ЗСУ-1/ЗСУ.00.001 - Защита для стеллажа угловая ЗСУ-1.pdf', 'drawings/zsu-1.jpg'),
    ('ЗСУ-2/ЗСУ.00.002 - Защита для стеллажа угловая ЗСУ-2.pdf', 'drawings/zsu-2.jpg'),
]

# Отобранные вручную кадры: номер объекта в PDF → имя файла на сайте.
FIRE_PICKS = [(376, 'tgz-1.jpg'), (16, 'tgz-2.jpg'), (380, 'tgz-3.jpg'),
              (8, 'tgz-4.jpg'), (50, 'tgz-5.jpg'), (24, 'tgz-6.jpg'), (384, 'tgz-7.jpg')]
KORMAX_PICKS = [(372, 'kormax-1.jpg'), (1280, 'kormax-2.jpg'),
                (383, 'kormax-3.jpg'), (387, 'kormax-4.jpg')]

# Фотографии цеха, разложенные по смыслу кадра.
LASER = ['image-03-06-25-01-30-8.heic',   # рез по листу, сноп искр
         'image-03-06-25-01-31-4.heic',   # искры крупным планом
         'image-03-06-25-01-30-4.heic',
         'image-03-06-25-01-30-3.heic',
         'image-03-06-25-01-30-1.heic',
         'image-03-06-25-01-30-5.heic',
         'image-03-06-25-01-31-5.heic']
STOCK = ['image-03-06-25-01-31-1.heic',   # профиль и трубы после раскроя
         'image-03-06-25-01-31-2.heic',
         'image-03-06-25-01-31-3.heic',
         'image-03-06-25-01-31-1.jpeg',
         'image-03-06-25-01-31-2.jpeg']
PANELS = ['image-03-06-25-01-31.jpeg',    # готовая резаная деталь
          'image-03-06-25-01-30-6.heic',
          'image-03-06-25-01-30.jpeg']


def main():
    if not SRC.exists():
        sys.exit(f'Не найдены исходники: {SRC}')

    made = 0

    # 1. Логотип
    logo = SRC / '1234-removebg-previe.png.webp'
    if logo.exists():
        (OUT / 'logo').mkdir(parents=True, exist_ok=True)
        subprocess.run(['sips', '-s', 'format', 'png', str(logo),
                        '--out', str(OUT / 'logo' / 'logo.png')], capture_output=True)
        made += 1

    # 2. Рендеры изделий
    for rel, dest in RENDERS:
        path = SRC / 'Рендеры' / rel
        if path.exists():
            save(Image.open(path), OUT / dest, CARD, quality=82)
            made += 1

    # 3. Габаритные чертежи
    for rel, dest in DRAWINGS:
        path = SRC / 'Рендеры' / rel
        if path.exists():
            img = render_pdf(path)
            if img:
                save(img, OUT / dest, DOC, quality=84)
                made += 1

    # 4. Пожарная установка ТГЗ-1000
    fire_pdf = SRC / 'источник-1.pdf'
    if fire_pdf.exists():
        pool = pdf_images(fire_pdf)
        for num, name in FIRE_PICKS:
            if num in pool:
                save(pool[num], OUT / 'products' / name, CARD, quality=80)
                made += 1

    # 5. Установка рекуперации KorMax
    kormax_pdf = SRC / 'Ещё' / 'Untitled.pdf'
    if kormax_pdf.exists():
        pool = pdf_images(kormax_pdf, min_side=900)
        for num, name in KORMAX_PICKS:
            if num in pool:
                save(pool[num], OUT / 'products' / name, CARD, quality=80)
                made += 1

    kormax_dwg = SRC / 'Ещё' / 'Габаритные КорМакс500.PDF'
    if kormax_dwg.exists():
        img = render_pdf(kormax_dwg)
        if img:
            save(img, OUT / 'drawings' / 'kormax.jpg', DOC, quality=84)
            made += 1

    # 6. Цех: лазерная резка, заготовки, готовые панели
    block3 = SRC / 'Описнаие по блокам' / 'Блок №3'
    for group, prefix in ((LASER, 'laser'), (STOCK, 'stock'), (PANELS, 'panel')):
        for i, name in enumerate(group, 1):
            path = block3 / name
            if path.exists():
                save(open_any(path), OUT / 'production' / f'{prefix}-{i}.jpg', CARD, quality=76)
                made += 1

    # 7. Сварочный участок
    welding = sorted((SRC / 'Производство (нужно обработать)').glob('*.jpg'))
    for i, path in enumerate(welding, 1):
        save(Image.open(path), OUT / 'production' / f'welding-{i}.jpg', CARD, quality=74)
        made += 1

    # 8. Первый экран — кадр лазерной резки в широком формате
    hero_src = block3 / 'image-03-06-25-01-30-8.heic'
    if hero_src.exists():
        save(open_any(hero_src), OUT / 'common' / 'hero.jpg', WIDE, quality=72)
        made += 1

    shutil.rmtree(TMP, ignore_errors=True)

    total = sum(1 for _ in OUT.rglob('*.jpg')) + sum(1 for _ in OUT.rglob('*.png'))
    size = sum(f.stat().st_size for f in OUT.rglob('*') if f.is_file())
    print(f'✓ Обработано: {made} файлов')
    print(f'  Всего в site/src/images: {total} шт., {size / 1024 / 1024:.1f} МБ')


if __name__ == '__main__':
    main()
