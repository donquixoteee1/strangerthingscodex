"""Offline-only text SVG generation. Original placeholder until references arrive.
Optional: --reference FILE --sofa-box left,top,right,bottom (in mirrored coordinates).
"""
from PIL import Image, ImageDraw, ImageFont, ImageOps, ImageFilter
from pathlib import Path
import argparse, random, html, json, math
import xml.etree.ElementTree as ET
from collections import defaultdict
root=Path(__file__).resolve().parents[1]/'public/scene'
p=argparse.ArgumentParser(); p.add_argument('--reference'); p.add_argument('--sofa-box'); a=p.parse_args()
rng=random.Random(1983)
def svg(name,w,h,body):
    # One SVG text node per row/style; x lists retain the original fine grid.
    groups=defaultdict(list)
    for node in ET.fromstring('<g>'+body+'</g>'):
        opacity=round(float(node.attrib.get('opacity',1))*4)/4 if name=='wall.svg' else float(node.attrib.get('opacity',1))
        key=(node.attrib['y'],node.attrib['font-size'],node.attrib['fill'],opacity)
        groups[key].append((node.attrib['x'],node.text or ''))
    rows=[]
    for (y,size,fill,opacity),items in groups.items():
        xs=' '.join(x for x,_ in items); content=html.escape(''.join(c for _,c in items))
        rows.append(f'<text x="{xs}" y="{y}" font-size="{size}" fill="{fill}" opacity="{opacity}" style="font-variant-ligatures:none;white-space:pre">{content}</text>')
    (root/name).write_text(f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {w} {h}"><g font-family="monospace">{"".join(rows)}</g></svg>')
def text(x,y,s,fill,size=7,opacity=1):
    return f'<text x="{x}" y="{y}" font-size="{size}" fill="{fill}" opacity="{opacity}">{html.escape(s)}</text>'
# Sparse floral wallpaper: every mark is a real text character.
wall=[]
for y in range(18,660,28):
    for x in range(8,1200,30):
        phase=(x//30+y//28)%4
        wall.append(text(x,y,[':','+','.','*'][phase],'#9a8869',7,round(rng.uniform(.12,.44),2)))
svg('wall.svg',1200,680,''.join(wall))
# Pillow raster model supplies a fully reproducible original couch silhouette.
im=Image.new('L',(840,330)); d=ImageDraw.Draw(im)
d.rounded_rectangle((70,50,770,240),radius=44,fill=125)
for l,r in [(94,294),(304,520),(530,746)]:
    d.rounded_rectangle((l,65,r,187),radius=24,fill=155,outline=210,width=3)
    d.rounded_rectangle((l,194,r,257),radius=13,fill=165,outline=205,width=2)
d.rounded_rectangle((28,135,110,283),radius=28,fill=180,outline=225,width=3)
d.rounded_rectangle((730,135,812,283),radius=28,fill=180,outline=225,width=3)
d.rounded_rectangle((70,259,770,294),radius=8,fill=110)
d.rectangle((92,290,115,320),fill=120); d.rectangle((726,290,749,320),fill=120)
d.polygon([(167,88),(254,112),(231,190),(145,170)],fill=205)
d.polygon([(576,105),(660,86),(681,168),(599,192)],fill=195)
# Knitted throw, seams, stippled upholstery.
d.polygon([(363,58),(449,63),(475,276),(376,286)],fill=200)
for y in range(65,280,10): d.line((375,y,453+(y//40),y+8),fill=90,width=2)
for _ in range(15000):
    x,y=rng.randrange(840),rng.randrange(330)
    v=im.getpixel((x,y))
    if v: im.putpixel((x,y),max(35,min(240,v+rng.randrange(-38,39))))
if a.reference:
    if not a.sofa_box: p.error('--sofa-box is required; crop is explicit, not inferred')
    source=ImageOps.mirror(Image.open(a.reference).convert('RGB'))
    (root.parent.parent/'artifacts').mkdir(exist_ok=True)
    source.save(root.parent.parent/'artifacts/reference-mirrored.png')
    crop=source.crop(tuple(map(int,a.sofa_box.split(',')))).resize((840,330))
    im=ImageOps.autocontrast(ImageOps.grayscale(crop),cutoff=2)
    # Hand-traced outer contour removes wall, table and floor after mirroring.
    mask=Image.new('L',(840,330)); md=ImageDraw.Draw(mask)
    md.polygon([(0,155),(32,120),(40,32),(180,8),(276,5),(305,0),(410,14),(638,9),(735,20),(755,95),(810,119),(839,163),(829,322),(22,322)],fill=255)
    im=Image.composite(im,Image.new('L',im.size),mask)
    # Sample floral wallpaper separately; preserve sparse marks rather than photograph.
    sample=ImageOps.grayscale(source.crop((1300,130,1590,620))).resize((100,150))
    wall=[]
    for y in range(12,680,11):
        for x in range(8,1200,9):
            v=sample.getpixel(((x//9)%100,(y//11)%150))
            if v<100 and rng.random()<.48: wall.append(text(x,y,':+.*'[v%4],'#b8793f',6,round(.12+(100-v)/230,2)))
    svg('wall.svg',1200,680,''.join(wall))
pixel_sofa=ImageOps.colorize(im, '#201b18', '#c4a17a').convert('RGBA')
pixel_sofa.putalpha(im.point(lambda v: 255 if v>14 else 0))
pixel_sofa.save(root/'pixel-sofa.png')
edge=im.filter(ImageFilter.FIND_EDGES); chars=' .:-=+*#%@'; body=[]
for y in range(4,330,7):
    for x in range(3,840,5):
        v=im.getpixel((x,y))
        if v<15: continue
        value=min(255,int(v*.8+edge.getpixel((x,y))*.4))
        body.append(text(x,y,chars[min(9,value*10//256)],['#78543b','#a47b56','#c4a17a'][min(2,value//86)],7))
svg('sofa.svg',840,330,''.join(body))
letters=[]; alphabet=[]; colors=['#ffd079','#77d9a1','#ff7260','#8acdf2','#f6dba7']
font=ImageFont.truetype('/System/Library/Fonts/Supplemental/Courier New Bold.ttf',48)
for row,line in enumerate(['ABCDEFGH','IJKLMNOPQ','RSTUVWXYZ']):
    for col,letter in enumerate(line):
        x=110+col*(780/(len(line)-1)); y=65+row*125+[-8,7,-4,10,0,-7,6,-3,3][col]
        letters.append(dict(id=f'light-{letter}',letter=letter,x=round(x,2),y=y,color=colors[(col+row*2)%5]))
        mask=Image.new('L',(50,58)); ImageDraw.Draw(mask).text((4,-2),letter,font=font,fill=255)
        for py in range(5,48,4):
            for px in range(3,44,3):
                if mask.getpixel((px,py))>110: alphabet.append(text(round(x+px-24,2),y+py+12,'+' if (px+py)%3 else '#','#d1b08a',4.3,.92))
svg('alphabet.svg',1000,390,''.join(alphabet))
(root/'scene-layout.json').write_text(json.dumps({'width':1000,'height':390,'sofaRatio':.7,'provenance':'reference-crop' if a.reference else 'original-placeholder-no-references','lights':letters},indent=2))
print('Generated four static scene assets; provenance:', 'reference crop' if a.reference else 'original placeholder')

# Title is composed of literal ASCII glyphs, precomputed once, not a font effect.
heading="WHAT WOULD YOU LIKE TO BUILD?"
heading_font=ImageFont.truetype('/System/Library/Fonts/Supplemental/Courier New Bold.ttf',60)
bounds=heading_font.getbbox(heading)
w=bounds[2]+12; h=bounds[3]-bounds[1]+16
mask=Image.new('L',(w,h)); ImageDraw.Draw(mask).text((6,8-bounds[1]),heading,font=heading_font,fill=255)
pixel_title=Image.new('RGBA',mask.size,'#d4d2cb'); pixel_title.putalpha(mask); pixel_title.save(root/'pixel-title.png')
body=[]
for y in range(0,h,3):
    for x in range(0,w,3):
        v=mask.getpixel((x,y))
        if v>90: body.append(text(x,y,'+' if v>210 else ':','#d4d2cb',3.6,.95))
svg('title.svg',w,h,''.join(body))

if a.reference:
    exec((Path(__file__).parent/"reference-alphabet.py").read_text())
