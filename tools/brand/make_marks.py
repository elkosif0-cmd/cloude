"""SQC mark 2026-10-08 «كوبالت وجليد»: S in ice, Q as a cut crystal whose tail is the audit tick, C in cobalt/white.
Writes ui/art/sqc-mark.svg (on dark), sqc-mark-dark.svg (on light), sqc-logo.svg (mark + wordmark, on dark),
sqc-icon.svg (app icon) and renders payload/icon-192/512/apple-touch PNGs (base64) with headless Edge.
Run from the repo root."""
import base64, pathlib, asyncio

ICE = ('<linearGradient id="{p}i" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#b6f3fa"/>'
       '<stop offset=".5" stop-color="#19c3d9"/><stop offset="1" stop-color="#0a8aa0"/></linearGradient>')
FACET = ('<linearGradient id="{p}f" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#9beef7" stop-opacity=".55"/>'
         '<stop offset="1" stop-color="#2340c4" stop-opacity=".25"/></linearGradient>')


def body(p, letter):
    """letter = stroke for Q/C (a paint or url)."""
    hexa = "150,16 183,35 183,73 150,92 117,73 117,35"
    return (
        f'<g fill="none" stroke-linecap="round" stroke-linejoin="round">'
        f'<path stroke="url(#{p}i)" stroke-width="19" d="M84 20H40a17 17 0 0 0 0 34h24a17 17 0 0 1 0 34H14"/>'
        # the crystal: a soft facet fill, the outline, two inner facet edges
        f'<polygon points="{hexa}" fill="url(#{p}f)" stroke="none"/>'
        f'<polygon points="{hexa}" stroke="{letter}" stroke-width="15"/>'
        f'<path stroke="{letter}" stroke-opacity=".55" stroke-width="5" d="M117 35 150 54 183 35M150 54v38"/>'
        # the tail = the audit tick
        f'<path stroke="url(#{p}i)" stroke-width="17" d="M164 80l13 13 28-33"/>'
        f'<path stroke="{letter}" stroke-width="19" d="M278 30a34 34 0 1 0 0 50"/>'
        f'</g>'
        f'<rect x="270" y="74" width="12" height="12" rx="2" transform="rotate(45 276 80)" fill="#19c3d9"/>'
    )


def mark(p, letter_grad):
    defs = ICE.format(p=p) + FACET.format(p=p) + letter_grad
    return ('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 110" role="img" aria-label="SQC">\n'
            f'  <defs>{defs}</defs>\n  {body(p, "url(#" + p + "w)")}\n</svg>\n')


WHITE = '<linearGradient id="{p}w" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffffff"/><stop offset="1" stop-color="#d4dbf5"/></linearGradient>'
COBALT = '<linearGradient id="{p}w" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#2340c4"/><stop offset="1" stop-color="#0b1030"/></linearGradient>'


def main():
    art = pathlib.Path('ui/art')
    (art / 'sqc-mark.svg').write_bytes(mark('m', WHITE.format(p='m')).encode())
    (art / 'sqc-mark-dark.svg').write_bytes(mark('d', COBALT.format(p='d')).encode())
    logo = ('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 110" role="img" aria-label="SQC — Smart Quality Control">\n'
            f'  <defs>{ICE.format(p="l")}{FACET.format(p="l")}{WHITE.format(p="l")}</defs>\n  {body("l", "url(#lw)")}\n'
            '  <text x="300" y="22" font-family="Arial,sans-serif" font-size="11" fill="#d4dbf5">TM</text>\n'
            '  <text x="330" y="58" font-family="Montserrat,Arial,sans-serif" font-weight="800" font-size="32" letter-spacing=".5" fill="#ffffff" textLength="455" lengthAdjust="spacingAndGlyphs">SMART QUALITY CONTROL</text>\n'
            '  <text x="330" y="90" font-family="Arial,sans-serif" font-size="21" fill="#9beef7" textLength="430" lengthAdjust="spacingAndGlyphs">AI-Powered Audit &amp; Assurance Platform</text>\n'
            '</svg>\n')
    (art / 'sqc-logo.svg').write_bytes(logo.encode())
    icon = ('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" role="img" aria-label="SQC">\n'
            '  <defs><radialGradient id="bg" cx=".28" cy=".18" r="1.05"><stop offset="0" stop-color="#2a46d6"/><stop offset=".55" stop-color="#0b1030"/><stop offset="1" stop-color="#04061a"/></radialGradient>'
            '<linearGradient id="gl" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffffff" stop-opacity=".16"/><stop offset=".5" stop-color="#ffffff" stop-opacity="0"/></linearGradient>'
            f'{ICE.format(p="c")}{FACET.format(p="c")}{WHITE.format(p="c")}</defs>\n'
            '  <rect width="512" height="512" rx="112" fill="url(#bg)"/>\n'
            '  <rect x="10" y="10" width="492" height="492" rx="104" fill="url(#gl)"/>\n'
            f'  <g transform="translate(46 178) scale(1.4)">{body("c", "url(#cw)")}</g>\n'
            '  <text x="256" y="402" text-anchor="middle" font-family="Montserrat,Arial,sans-serif" font-weight="800" font-size="30" letter-spacing="3" fill="#9beef7">QUALITY CONTROL</text>\n'
            '</svg>\n')
    (art / 'sqc-icon.svg').write_bytes(icon.encode())
    asyncio.run(pngs(icon))


async def pngs(icon):
    from playwright.async_api import async_playwright
    async with async_playwright() as p:
        b = await p.chromium.launch(channel='msedge', headless=True)
        for name, size in (('icon-192.png', 192), ('icon-512.png', 512), ('apple-touch-icon.png', 180)):
            pg = await b.new_page(viewport={'width': size, 'height': size})
            svg = icon.replace('rx="112"', 'rx="0"') if name == 'apple-touch-icon.png' else icon
            await pg.set_content('<html><body style="margin:0;background:transparent">' + svg.replace('<svg ', f'<svg width="{size}" height="{size}" ') + '</body></html>')
            png = await pg.screenshot(omit_background=True, clip={'x': 0, 'y': 0, 'width': size, 'height': size})
            pathlib.Path('payload', name + '.b64').write_bytes(base64.b64encode(png) + b'\n')
            await pg.close()
        await b.close()


main()
