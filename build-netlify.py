#!/usr/bin/env python3
"""Build the Netlify bundle from the canonical tracker file.

Single source of truth: ~/workspace/your_files/snow-route-5w/snow-5w-tracker-v5.html
The bundle's index.html is that file with exactly three scripted changes:
  1. BASEMAP_MODE 'raster' -> 'vector'
  2. MapLibre GL CSS injected after the Leaflet CSS link
  3. MapLibre GL JS + maplibre-gl-leaflet plugin injected after the Leaflet JS tag
plus sw.js copied beside it. Never hand-edit the bundle — re-run this script.
"""
import hashlib, shutil, sys, zipfile
from pathlib import Path

ROOT = Path.home() / 'workspace' / 'snow-route-5w'
CANON = Path.home() / 'workspace' / 'your_files' / 'snow-route-5w' / 'snow-5w-tracker-v5.html'
BUNDLE = ROOT / 'netlify-bundle'
ZIP_OUT = Path.home() / 'workspace' / 'your_files' / 'snow-route-5w' / 'snow-5w-tracker-netlify.zip'

LEAFLET_CSS = '<link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css">'
GL_CSS = '<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/maplibre-gl@4.7.1/dist/maplibre-gl.css">'
LEAFLET_JS = '<script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>'
GL_JS = ('<script src="https://cdn.jsdelivr.net/npm/maplibre-gl@4.7.1/dist/maplibre-gl.js"></script>\n'
         '<script src="https://cdn.jsdelivr.net/gh/maplibre/maplibre-gl-leaflet@v0.0.22/leaflet-maplibre-gl.js"></script>')

def main():
    s = CANON.read_text(encoding='utf-8')
    for needle in ("const BASEMAP_MODE = 'raster';", LEAFLET_CSS, LEAFLET_JS):
        assert s.count(needle) == 1, f'anchor not unique/found: {needle[:60]} (count={s.count(needle)})'
    s = s.replace("const BASEMAP_MODE = 'raster';", "const BASEMAP_MODE = 'vector';")
    s = s.replace(LEAFLET_CSS, LEAFLET_CSS + '\n' + GL_CSS)
    s = s.replace(LEAFLET_JS, LEAFLET_JS + '\n' + GL_JS)
    assert s.count("BASEMAP_MODE = 'vector'") == 1
    assert s.count('maplibre-gl-leaflet@v0.0.22') == 1
    BUNDLE.mkdir(parents=True, exist_ok=True)
    (BUNDLE / 'index.html').write_text(s, encoding='utf-8')
    shutil.copy(ROOT / 'netlify' / 'sw.js', BUNDLE / 'sw.js')
    with zipfile.ZipFile(ZIP_OUT, 'w', zipfile.ZIP_DEFLATED) as z:
        z.write(BUNDLE / 'index.html', 'index.html')
        z.write(BUNDLE / 'sw.js', 'sw.js')
    data = s.encode()
    print('bundle index.html:', len(data), 'bytes, SHA-256', hashlib.sha256(data).hexdigest())
    print('zip:', ZIP_OUT, ZIP_OUT.stat().st_size, 'bytes')

if __name__ == '__main__':
    sys.exit(main())
