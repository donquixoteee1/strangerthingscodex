"""Manual source bounds + offline dark-stroke extraction; preserve painted letter shapes.
Executed by prepare-assets.py with its helpers and source arguments.
"""
boxes=[(480,270,550,346),(560,260,628,346),(638,255,708,335),(720,255,796,341),(812,253,883,333),(898,250,970,329),(974,243,1057,323),(1070,226,1141,314),
(377,399,451,485),(480,402,557,486),(575,401,643,485),(653,396,723,488),(727,397,810,487),(814,375,884,474),(895,377,968,469),(983,364,1065,462),(1106,362,1205,449),
(488,534,561,620),(569,535,638,618),(645,545,719,618),(729,537,799,618),(805,524,883,614),(882,528,976,615),(977,515,1049,608),(1050,502,1130,611),(1131,509,1235,600)]
centers=[(509,257),(582,241),(670,238),(753,247),(839,246),(926,240),(1010,233),(1098,210),
(438,380),(516,390),(594,398),(674,405),(760,396),(845,386),(928,357),(1016,349),(1155,347),
(466,533),(513,518),(592,524),(674,532),(845,529),(922,512),(1013,510),(1098,492),(1178,496)]
# Relative coordinates preserve original spacing, slanted baselines, and lamp offsets.
origin=(350,190); width,height=920,450
reference=Image.open(a.reference).convert('RGB')
pixel_mask=Image.new('L',(width,height))
alphabet=[]; frames=[[],[],[]]; letters=[]; measured=[]
for i,(box,center) in enumerate(zip(boxes,centers)):
    letter=chr(65+i); l,t,r,b=box
    pixels=set()
    for y in range(t,b):
        for x in range(l,r):
            red,green,blue=reference.getpixel((x,y))
            if red<105 and green<85 and blue<75: pixels.add((x,y))
    # Remove wallpaper specks while keeping disconnected brush marks.
    clean=set()
    while pixels:
        seed=pixels.pop(); component={seed}; stack=[seed]
        while stack:
            x,y=stack.pop()
            for n in [(x-1,y),(x+1,y),(x,y-1),(x,y+1)]:
                if n in pixels: pixels.remove(n);component.add(n);stack.append(n)
        if len(component)>=24:clean.update(component)
    for x,y in clean: pixel_mask.putpixel((x-origin[0],y-origin[1]),255)
    # Larger cells and lighter punctuation leave space between marks.
    # Only one third of cells change; the silhouette never moves or disappears.
    for y in range(t,b,4):
        for x in range(l,r,4):
            if (x,y) in clean:
                seed=(x*17+y*31+i*7)
                for phase in range(3):
                    char=':+*'[seed%3] if seed%3 else ['+','/','*'][phase]
                    opacity=.76 if seed%3 else [.9,.68,.84][phase]
                    frames[phase].append(text(x-origin[0],y-origin[1],char,'#d8bc99',3.8,opacity))
    letters.append(dict(id=f'light-{letter}',letter=letter,x=center[0]-origin[0],y=center[1]-origin[1],color=colors[i%5]))
    measured.append(dict(letter=letter,sourceBounds=box,sourceBulb=center,height=b-t,width=r-l))
for phase,body in enumerate(frames):
    svg('alphabet.svg' if phase==0 else f'alphabet-{phase}.svg',width,height,''.join(body))
# Trace continuous serpentine cable from the reference instead of regular scallops.
wires=['M 26 68 Q 55 72 60 43 Q 110 66 159 57 Q 220 48 320 39 Q 390 58 490 45 Q 560 37 660 24 Q 770 -8 842 15 Q 872 58 875 140',
'M 875 140 Q 820 148 787 137 Q 720 135 666 145 Q 605 150 578 158 Q 500 179 410 191 Q 340 206 324 200 Q 230 198 166 183 Q 104 164 88 174 Q 48 164 33 187',
'M 33 187 Q 24 260 12 352 Q 4 400 62 414 Q 87 423 94 358 Q 104 322 116 327 Q 151 312 163 317 Q 203 326 242 322 Q 298 326 324 326 Q 400 333 495 328 Q 535 319 572 313 Q 645 302 663 303 Q 708 290 748 288 Q 800 276 828 284 Q 865 276 892 286 Q 902 347 914 414']
(root/'scene-layout.json').write_text(json.dumps(dict(width=width,height=height,sofaRatio=.7,provenance='reference-painted-letter-extraction',lights=letters,wires=wires,referenceMeasurements=measured),indent=2))

pixel_art=Image.new('RGBA',(width,height),'#d8bc99');pixel_art.putalpha(pixel_mask);pixel_art.save(root/'pixel-alphabet.png')
