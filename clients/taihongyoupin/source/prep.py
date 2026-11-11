"""Turns the shop photos into clean studio assets (no AI generation, the bag pixels are the real photo).

  python3 prep.py <cutouts-dir>     cutouts-dir holds the rembg (BiRefNet) cut-outs of ../reference/*.jpg
Writes ../assets/: one transparent PNG per view, a soft floor shadow for each, and the detail crops.
"""
import sys

import numpy as np
from PIL import Image, ImageDraw, ImageFilter
from scipy import ndimage

CUT, REF, OUT = sys.argv[1], '../reference', '../assets'


def white_balance(rgb, strength=.75):
    """Neutralise the warm shop light using the brightest near-white pixels (mirror frame, vase)."""
    a = np.asarray(rgb).astype(np.float32)
    lum = a.mean(-1)
    sat = a.max(-1) - a.min(-1)
    sel = (lum > np.percentile(lum, 97)) & (sat < 60)
    ref = a[sel].mean(0)
    gain = 1 + (ref.mean() / ref - 1) * strength
    return Image.fromarray(np.clip(a * gain, 0, 255).astype(np.uint8)), gain


def grade(rgb, black=0, gamma=1.0):
    a = np.asarray(rgb).astype(np.float32)
    a = np.clip((a - black) / (255 - black), 0, 1) ** gamma
    return Image.fromarray((a * 255).astype(np.uint8))


def clean_alpha(alpha, keep_poly=None, erode=1):
    a = np.asarray(alpha).copy()
    if keep_poly:
        m = Image.new('L', alpha.size, 0)
        ImageDraw.Draw(m).polygon(keep_poly, fill=255)
        a = np.minimum(a, np.asarray(m))
    lab, n = ndimage.label(a > 128)
    if n > 1:
        big = 1 + np.argmax(ndimage.sum(a > 128, lab, range(1, n + 1)))
        a = np.where(ndimage.binary_dilation(lab == big, iterations=3), a, 0)
    im = Image.fromarray(a.astype(np.uint8))
    if erode: im = im.filter(ImageFilter.MinFilter(3))
    return im.filter(ImageFilter.GaussianBlur(.7))


def shadow(alpha, pad):
    """Soft contact shadow that follows the bag's bottom edge (the photos are slightly tilted)."""
    w, h = alpha.size
    a = np.asarray(alpha) > 128
    cols = np.nonzero(a.any(0))[0]
    bottom = h - 1 - np.argmax(a[::-1], axis=0)
    canvas = Image.new('L', (w + pad * 2, h + pad * 2), 0)
    d = ImageDraw.Draw(canvas)
    pts = [(int(x) + pad, int(bottom[x]) + pad) for x in cols[::4]]
    d.line(pts, fill=255, width=22)
    tight = canvas.filter(ImageFilter.GaussianBlur(8))
    wide = Image.new('L', canvas.size, 0)
    ImageDraw.Draw(wide).line([(x, y + 10) for x, y in pts], fill=255, width=44)
    wide = wide.filter(ImageFilter.GaussianBlur(26))
    m = np.clip(np.asarray(tight, np.float32) * .5 + np.asarray(wide, np.float32) * .32, 0, 255)
    out = np.zeros(m.shape + (4,), np.uint8)
    out[..., :3] = (40, 28, 20)
    out[..., 3] = m.astype(np.uint8)
    return Image.fromarray(out)


def desaturate(rgb, amount):
    a = np.asarray(rgb).astype(np.float32)
    g = a.mean(-1, keepdims=True)
    return Image.fromarray(np.clip(g + (a - g) * (1 - amount), 0, 255).astype(np.uint8))


VIEWS = {
    # name: (photo, cut-out, polygon of what to keep, black point, gamma, white balance?)
    'black-front': ('black-front', 'black-front-birefnet-general-lite',
                    [(362, 250), (1150, 250), (1150, 440), (1172, 790), (1190, 1010), (1190, 1199), (362, 1199)], 22, 1.18, True),
    'black-back': ('black-back', 'black-back-birefnet-general', [(0, 0), (868, 0), (868, 1599), (0, 1599)], 0, 1.0, False),
    'taupe': ('taupe-front', 'taupe-front-birefnet-general-lite', [(0, 520), (1199, 520), (1199, 1598), (0, 1598)], 6, 1.0, True),
    'cognac': ('cognac-front', 'cognac-front-birefnet-general-lite', None, 6, 1.0, True),
}
PAD = 120
graded, cuts = {}, {}
for name, (photo, cut, poly, black, gamma, wb) in VIEWS.items():
    rgb = Image.open(f'{REF}/{photo}.jpg').convert('RGB')
    if wb: rgb, gain = white_balance(rgb); print(name, 'wb gain', np.round(gain, 3))
    rgb = grade(rgb, black, gamma)
    if name == 'black-front': rgb = desaturate(rgb, .6)   # the shop light tints the black bag brown
    graded[photo] = rgb
    alpha = clean_alpha(Image.open(f'{CUT}/{cut}.png').getchannel('A'), poly)
    box = alpha.point(lambda v: 255 if v > 40 else 0).getbbox()
    out = rgb.convert('RGBA'); out.putalpha(alpha)
    out = out.crop(box)
    cuts[name] = out
    out.save(f'{OUT}/{name}.png')
    shadow(out.getchannel('A'), PAD).save(f'{OUT}/{name}-shadow.png')
    print(name, out.size)


def detail(photo, box, name, size, sharpen=120):
    im = graded.get(photo) or Image.open(f'{REF}/{photo}.jpg').convert('RGB')
    c = im.crop(box).resize(size, Image.LANCZOS).filter(ImageFilter.UnsharpMask(2.2, sharpen, 2))
    c.save(f'{OUT}/{name}.jpg', quality=93); print(name, box, '->', size)


# detail crops (box in source pixels)
detail('black-front', (610, 505, 970, 955), 'detail-lock', (960, 1200))
detail('taupe-front', (165, 855, 495, 1267), 'detail-texture', (960, 1200), sharpen=150)
graded['black-bottom'] = grade(Image.open(f'{REF}/black-bottom.jpg').convert('RGB'), 0, .9)
detail('black-bottom', (215, 215, 615, 715), 'detail-feet', (960, 1200))


def studio_detail(name, box, out_name, size):
    """Detail taken from the cut-out on the studio backdrop, so no shop or bed shows behind it."""
    cut = cuts[name]
    bg = Image.new('RGB', cut.size, (233, 224, 211)); bg.paste(cut, (0, 0), cut)
    bg.crop(box).resize(size, Image.LANCZOS).filter(ImageFilter.UnsharpMask(2.2, 120, 2)).save(f'{OUT}/{out_name}.jpg', quality=93)
    print(out_name, box)


studio_detail('black-front', (330, 0, 760, 537), 'detail-handle', (960, 1200))
studio_detail('black-back', (40, 60, 680, 860), 'detail-zip', (960, 1200))
