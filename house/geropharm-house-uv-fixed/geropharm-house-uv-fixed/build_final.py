#!/usr/bin/env python3
"""Final procedural reconstruction of the Geropharm strategy house.

The source reference is a single front/three-quarter render, so this builds the visible
facade deliberately: stepped tiers, porch, columns, production details, value icons,
logo, and all supplied facade copy. The GLB nodes carry sectionId in extras for the
site's interaction layer.
"""
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont
import json, struct, io, math, shutil, os

ROOT=Path(__file__).parent
PUBLIC=ROOT/'public'; TEX=ROOT/'textures'; PUBLIC.mkdir(exist_ok=True); TEX.mkdir(exist_ok=True)
REPO_FONTS=ROOT.parents[1]/'fonts'  # house/fonts when nested under house/...
if not (REPO_FONTS/'Verdana.ttf').exists():
 REPO_FONTS=ROOT.parents[2]/'fonts' if len(ROOT.parents)>2 else REPO_FONTS
FONT_CANDIDATES=[
 Path(os.environ['VERDANA_FONT']) if os.environ.get('VERDANA_FONT') else None,
 REPO_FONTS/'Verdana.ttf',
 Path(r'C:\Windows\Fonts\verdana.ttf'),
 Path('/home/user/verdana/Verdana.ttf'),Path('/home/user/verdana/verdana.ttf'),
 Path('/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf')]
FONT_CANDIDATES=[p for p in FONT_CANDIDATES if p is not None]
FONT=next((p for p in FONT_CANDIDATES if p.exists()),FONT_CANDIDATES[-1])
BOLD_CANDIDATES=[
 FONT.with_name('Verdanab.ttf'),FONT.with_name('Verdana-Bold.ttf'),
 REPO_FONTS/'Verdana-Bold.ttf',
 Path(r'C:\Windows\Fonts\verdanab.ttf'),
 Path('/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf')]
BOLD=next((p for p in BOLD_CANDIDATES if p.exists()),FONT)
FONT_NOTE = 'Licensed Verdana was not present in the uploaded archive; the build used DejaVu Sans as a temporary fallback. Set VERDANA_FONT to licensed Verdana.ttf and rerun build_final.py for exact Verdana.' if 'DejaVu' in FONT.name else 'Licensed Verdana loaded from '+str(FONT)

sections=[
 {'id':'foundation','title':'Фундамент — ценности','items':['Страсть\nМы увлечены работой','Амбициозность\nМы устремлены в будущее','Ответственность\nМы отвечаем за результат']},
 {'id':'floor1','title':'1 этаж. Команда и лидерство','items':['Трансформация культуры','Лидерство и карьера','Эффективность и мотивация','Мышление долголетия','Сильный бренд работодателя','СИ: ГЕРОФАРМ — лучший работодатель фармацевтического рынка России']},
 {'id':'floor2','title':'2 этаж: Бизнес-процессы и производство','items':['СИ: Развитие биотехнологического производства для увеличения годовой мощности до 2000 кг в год','СИ: Модернизация производства продуктов экстрактов сухих для увеличения годовой мощности производства','СИ: Повышение мощности и эффективности производства ТЛФ до 1 миллиарда таблеток в год','Производственная площадка в Оболенске:','СИ: Модернизация производства продуктов в шприц-ручках, флаконированных и картриджных форм','СИ: Модернизация производства биотехнологических субстанций','Производственная площадка в Пушкине:','Цель производственных площадок: Обеспечить бездефектурное производство препаратов','СИ: Развитие интегрированного бизнес-планирование']},
 {'id':'floor3','title':'3 этаж: Портфель и рынки','items':['СИ: Инновации','СИ: Формирование портфеля продуктами с выручкой до 1 млрд*','СИ: Развитие функции обеспечения дсотупа на рынок','СИ: Наполнение портфеля биоаналогами, препаратами first-in-class, best-in-class через партнерство','СИ: Лидерство в сегменте метаболическое здоровье','СИ: Обеспечение эффективности продаж продуктов основного портфеля','СИ: Развитие экспорта']},
 {'id':'floor4','title':'Финансовые показатели','items':['EBITA* ≥ 35%','Рентабельность по валовой прибыли > 55%','ROA** > 15% (эффективность активов)','ROE*** > 25% (отдача на капитал)']},
 {'id':'mission','title':'Миссия компании','items':['Создаем инновации для увеличения продолжительности жизни в России и мире']}
]
(PUBLIC/'sections.json').write_text(json.dumps(sections,ensure_ascii=False,indent=2),encoding='utf8')

# glTF builder
verts=[]; norms=[]; uvs=[]; inds=[]; meshes=[]; nodes=[]; materials=[]; tex_images=[]; mat_cache={}; tex_cache={}; audit=[]

def align(b): return b+b'\0'*((-len(b))%4)
def rgba(hexv):
 h=hexv.lstrip('#');return [int(h[i:i+2],16)/255 for i in (0,2,4)]+[1]

def color_value(key):
 return colors[key] if key in colors else key
colors={
 'cream':'#FBF1DC','cream2':'#F0E0C4','fascia':'#F5E8D2','peach':'#F4A66C',
 'peach2':'#E8955A','rim':'#F2B07A','deck':'#F8D2B0','deck2':'#F3C49A',
 'glass':'#18C8B0','teal':'#0B8F7A','green':'#1FA85C','leaf':'#22B35F','leaf2':'#2BC46C',
 'base':'#B7C6D0','white':'#F7F4EC','dark':'#24302E','metal':'#A8B5B8',
 'soil':'#6A5040','gold':'#E8BF63','orange':'#F58257','carton':'#E3B389',
 'mint':'#D8F2E6','niche_light':'#A8E6D6','frame':'#E8D9C0'
}

def add_mat(name,color,texture=None,emissive=False,alpha=False):
 key=(name,texture,emissive,alpha)
 if key in mat_cache:return mat_cache[key]
 metallic=0.0
 rough=.78
 if color=='glass':
  metallic=.04; rough=.26
 elif color=='metal':
  metallic=.15; rough=.45
 elif color in ('cream','cream2','fascia','peach','peach2','rim','base','deck','deck2','mint','white','frame'):
  metallic=.0; rough=.82
 m={'name':name,'pbrMetallicRoughness':{'baseColorFactor':rgba(color_value(color)),'metallicFactor':metallic,'roughnessFactor':rough}}
 if texture is not None:
  ti=add_texture(texture);m['pbrMetallicRoughness']['baseColorTexture']={'index':ti};m['pbrMetallicRoughness']['baseColorFactor']=[1,1,1,1]
 if alpha or name.startswith('Logo') or name.startswith('Wordmark'):
   m['alphaMode']='BLEND';m['doubleSided']=True
 mild_emissive=(color in ('glass','gold','niche_light')) or emissive
 if mild_emissive:
  e=rgba(color_value(color))[:3]
  m['emissiveFactor']=[round(c*.18,3) for c in e]
 materials.append(m);mat_cache[key]=len(materials)-1;return mat_cache[key]

def add_texture(data):
 key=('raw',hash(data)) if isinstance(data,(bytes,bytearray)) else str(data)
 if key in tex_cache:return tex_cache[key]
 if isinstance(data,(str,Path)): raw=Path(data).read_bytes();name=Path(data).name
 else: raw=data;name='embedded.png'
 tex_images.append((name,raw));tex_cache[key]=len(tex_images)-1;return tex_cache[key]

def node(name,mesh,section,role):
 n={'name':name,'mesh':mesh,'extras':{'sectionId':section,'role':role}};nodes.append(n);return len(nodes)-1

def add_mesh(name,section,role,positions,faces,material,uvcoords=None):
 start=len(verts); before=len(inds)
 for face in faces:
  for k in range(1,len(face)-1):
   ids=[face[0],face[k],face[k+1]]
   pts=[positions[i] for i in ids]
   a=[pts[1][i]-pts[0][i] for i in range(3)]; b=[pts[2][i]-pts[0][i] for i in range(3)]
   n=[a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]]
   length=math.sqrt(sum(v*v for v in n)) or 1; n=[v/length for v in n]
   for i,point in zip(ids,pts):
    inds.append(len(verts)); verts.append((point[0],point[2],-point[1]))
    norms.append((n[0],n[2],-n[1])); uvs.append(uvcoords[i] if uvcoords else (0,0))
 count=len(inds)-before
 meshes.append({'name':name,'positions':list(range(start,len(verts))),'indices':count,'index_count':count,'material':material})
 return node(name,len(meshes)-1,section,role)

def box(name,section,x,y,z,w,d,h,kind='cream',bevel=0):
 x0,x1=x-w/2,x+w/2;y0,y1=y-d/2,y+d/2;z0,z1=z-h/2,z+h/2
 p=[(x0,y0,z0),(x1,y0,z0),(x1,y1,z0),(x0,y1,z0),(x0,y0,z1),(x1,y0,z1),(x1,y1,z1),(x0,y1,z1)]
 f=[(3,2,1,0),(5,6,7,4),(1,5,4,0),(2,6,5,1),(3,7,6,2),(7,3,0,4)]
 return add_mesh(name,section,kind,p,f,add_mat(kind,kind,emissive=kind in ('glass','gold')))

def cylinder(name,section,x,y,z,r,h,kind='metal',vertices=24,front=False):
 p=[];f=[]
 for zz in [-h/2,h/2]:
  for i in range(vertices):
   a=2*math.pi*i/vertices;p.append((x+r*math.cos(a),y+r*math.sin(a),z+zz))
 
 if front:p=[(px,y-(pz-z),z+(py-y)) for px,py,pz in p]
 f.append(tuple(range(vertices-1,-1,-1)));f.append(tuple(range(vertices,2*vertices)))
 for i in range(vertices):f.append((i,(i+1)%vertices,vertices+(i+1)%vertices,vertices+i))
 return add_mesh(name,section,kind,p,f,add_mat(kind,kind,emissive=kind in ('glass','gold')))

def image_label(name,section,text,x,y,z,w,h,size=20,bg='#D7F0E6',fg='#173D38',bold=False,vertical=False,badge=False,icon=None,side=False,lock_size=None):
 # Use moderate proportional pixel density; fit text to panel with consistent margins.
 # lock_size: keep initiative hierarchy uniform (short panels must not render larger than long ones).
 ppu=380
 rw,rh=(h,w) if vertical else (w,h)
 W=max(220,round(rw*ppu));H=max(120,round(rh*ppu))
 img=Image.new('RGB',(W,H),bg);d=ImageDraw.Draw(img)
 fp=str(BOLD if bold else FONT)
 pad=max(10,int(min(W,H)*.07));left=pad
 if icon:
  im=Image.open(icon).convert('RGBA'); icon_side=min(int(H*.72),int(W*.24)); im.thumbnail((icon_side,icon_side)); img.paste(im,(pad,(H-im.height)//2),im); left=pad+icon_side+pad//2
 top_pad=pad
 if badge:
  r=max(12,int(H*.12));d.ellipse((pad,pad,pad+2*r,pad+2*r),fill='#1A997A');d.text((pad+r,pad+r),'СИ',font=ImageFont.truetype(fp,max(10,int(r*.7))),fill='white',anchor='mm');left=max(left,pad+2*r+pad);top_pad=max(top_pad,pad+r*2+pad//2)
 maxw=max(20,W-left-pad)
 maxh=max(20,H-top_pad-pad)
 paragraphs=[p.strip() for p in text.split('\n')]
 def wrap(font):
  lines=[]
  for paragraph in paragraphs:
   if not paragraph:
    lines.append('')
    continue
  row=''
  for word in paragraph.split():
   test=(row+' '+word).strip()
    if d.textlength(test,font=font)>maxw and row:
     lines.append(row);row=word
    else:
     row=test
   if row: lines.append(row)
  return lines or ['']
 def fits(px):
  f=ImageFont.truetype(fp,px)
  lines=wrap(f)
  lh=max(12,int(px*1.22))
  longest=max((d.textlength(line,font=f) for line in lines), default=0)
  return longest<=maxw and lh*len(lines)<=maxh, lines, f, lh
 lo,hi=8,max(10,int(min(W,H)*0.32))
 if lock_size is not None:
  hi=min(hi,int(lock_size))
 best=(wrap(ImageFont.truetype(fp,8)),ImageFont.truetype(fp,8),12,8)
 while lo<=hi:
  mid=(lo+hi)//2
  ok,lines,font,lh=fits(mid)
  if ok:
   best=(lines,font,lh,mid);lo=mid+1
  else:
   hi=mid-1
 if lock_size is not None:
  ok,lines,font,lh=fits(int(lock_size))
  if ok:
   best=(lines,font,lh,int(lock_size))
 lines,font,lh,size=best
 total=lh*len(lines)
 yy=top_pad+max(0,(maxh-total)//2)
 for line in lines:
  d.text((left,yy),line,font=font,fill=fg);yy+=lh
 if vertical:img=img.rotate(90,expand=True)
 buf=io.BytesIO();img.save(buf,'PNG',optimize=False);raw=buf.getvalue();TEX.mkdir(exist_ok=True);(TEX/(name+'.png')).write_bytes(raw)
 audit.append({'name':name,'section':section,'text':text,'font':FONT.name,'fontSizePx':size,'worldSize':[w,h],'vertical':vertical,'lockSize':lock_size})
 if not side and not vertical:
  y=min(y, {'foundation':-4.94,'floor2':-3.66,'floor3':-2.49,'floor4':-1.9}.get(section,y))
 p=[(x-w/2,y,z-h/2),(x+w/2,y,z-h/2),(x+w/2,y,z+h/2),(x-w/2,y,z+h/2)]
 if side:
  t=0.045
  x0,x1=x,x+t
  y0,y1=y-w/2,y+w/2
  z0,z1=z-h/2,z+h/2
  p=[(x0,y0,z0),(x1,y0,z0),(x1,y1,z0),(x0,y1,z0),(x0,y0,z1),(x1,y0,z1),(x1,y1,z1),(x0,y1,z1)]
  f=[(3,2,1,0),(5,6,7,4),(1,5,4,0),(2,6,5,1),(3,7,6,2),(7,3,0,4)]
  uv=[(0,0),(0,1),(1,1),(0,0),(0,0),(0,0),(1,0),(0,0)]
  return add_mesh(name,section,'text',p,f,add_mat(name,'white',texture=raw),uv)
 return add_mesh(name,section,'text',p,[(0,1,2,3)],add_mat(name,'white',texture=raw),[(0,1),(1,1),(1,0),(0,0)])

def roundel_label(name,section,text,x,y,z,d,fill,fg='#FFFFFF',size=30):
 PPU=440; size=max(1,round(size*2));S=max(280,int(d*PPU));img=Image.new('RGBA',(S,S),(0,0,0,0));dr=ImageDraw.Draw(img);dr.ellipse((2,2,S-3,S-3),fill=fill)
 font=ImageFont.truetype(str(BOLD),size);dr.text((S/2,S/2),text,font=font,fill=fg,anchor='mm')
 buf=io.BytesIO();img.save(buf,'PNG',optimize=False);raw=buf.getvalue();
 audit.append({'name':name,'section':section,'text':text,'font':FONT.name,'fontSizePx':size,'worldSize':[d,d],'roundel':True})
 p=[(x-d/2,y,z-d/2),(x+d/2,y,z-d/2),(x+d/2,y,z+d/2),(x-d/2,y,z+d/2)]
 return add_mesh(name,section,'text',p,[(0,1,2,3)],add_mat(name,'white',texture=raw),[(0,1),(1,1),(1,0),(0,0)])

def rod(name,section,a,b,r,kind='metal'):
 # Oriented box between A->B with local long axis along segment direction.
 ax,ay,az=a; bx,by,bz=b
 dx,dy,dz=bx-ax,by-ay,bz-az
 length=math.sqrt(dx*dx+dy*dy+dz*dz)
 if length<1e-6:
  return box(name,section,ax,ay,az,r*2,r*2,r*2,kind)
 ux,uy,uz=dx/length,dy/length,dz/length
 hx,hy,hz=(0,0,1) if abs(uz)<0.95 else (0,1,0)
 vx=uy*hz-uz*hy; vy=uz*hx-ux*hz; vz=ux*hy-uy*hx
 vl=math.sqrt(vx*vx+vy*vy+vz*vz) or 1.0
 vx,vy,vz=vx/vl,vy/vl,vz/vl
 wx=uy*vz-uz*vy; wy=uz*vx-ux*vz; wz=ux*vy-uy*vx
 def pt(base,du,dv,dw):
  return (base[0]+du*ux+dv*vx+dw*wx, base[1]+du*uy+dv*vy+dw*wy, base[2]+du*uz+dv*vz+dw*wz)
 h=length/2.0
 c=((ax+bx)/2.0,(ay+by)/2.0,(az+bz)/2.0)
 p=[
  pt(c,-h,-r,-r),pt(c,-h, r,-r),pt(c,-h, r, r),pt(c,-h,-r, r),
  pt(c, h,-r,-r),pt(c, h, r,-r),pt(c, h, r, r),pt(c, h,-r, r)
 ]
 f=[(3,2,1,0),(5,6,7,4),(1,5,4,0),(2,6,5,1),(3,7,6,2),(7,3,0,4)]
 return add_mesh(name,section,kind,p,f,add_mat(kind,kind,emissive=kind in ('glass','gold','niche_light')))

def lamp_curve(name,section,base_xyz,height,arm_out,r):
 x,y,z=base_xyz
 p0=(x,y,z)
 p1=(x,y,z+height)
 p2=(x,y-arm_out*0.28,z+height+r*3.2)
 p3=(x,y-arm_out*0.68,z+height+r*4.6)
 p4=(x,y-arm_out,z+height+r*3.4)
 rod(name+'_pole',section,p0,p1,r,'metal')
 rod(name+'_arm0',section,p1,p2,r,'metal')
 rod(name+'_arm1',section,p2,p3,r,'metal')
 rod(name+'_arm2',section,p3,p4,r,'metal')
 box(name+'_head',section,p4[0],p4[1]-0.11,p4[2],0.44,0.22,0.11,'gold')
 rod(name+'_stem',section,p4,(p4[0],p4[1]-0.08,p4[2]-0.08),r*0.75,'metal')

# Value icons from book art (img/11–13), upscaled for facade plaques.
BOOK_IMG=ROOT.parents[2]/'img'
if not (BOOK_IMG/'12.png').exists():
 BOOK_IMG=Path(__file__).resolve().parents[3]/'img'
def prepare_value_icon(src, dest, canvas=420):
 im=Image.open(src).convert('RGBA')
 # Drop near-black backdrop if present; keep colored strokes.
 px=im.load(); w,h=im.size
 for y in range(h):
  for x in range(w):
   r,g,b,a=px[x,y]
   if a and r<28 and g<28 and b<28: px[x,y]=(0,0,0,0)
 # Trim transparent margins, then fit into a square canvas.
 bbox=im.getbbox() or (0,0,w,h)
 im=im.crop(bbox)
 out=Image.new('RGBA',(canvas,canvas),(0,0,0,0))
 im.thumbnail((int(canvas*0.86),int(canvas*0.86)), Image.Resampling.LANCZOS)
 out.paste(im,((canvas-im.width)//2,(canvas-im.height)//2),im)
 out.save(dest)
prepare_value_icon(BOOK_IMG/'12.png', TEX/'icon_passion.png')
prepare_value_icon(BOOK_IMG/'11.png', TEX/'icon_ambition.png')
prepare_value_icon(BOOK_IMG/'13.png', TEX/'icon_responsibility.png')

# Site / foundation
box('Plaza','environment',0,0,-.2,19,12,.4,'base',.08);box('Peach paving','environment',0,0,.02,18.8,11.7,.1,'deck')
box('Foundation','foundation',0,-.1,.55,15.3,9.6,.95,'base',.08)
vals=[('Страсть\nМы увлечены работой',-4.0,TEX/'icon_passion.png'),('Амбициозность\nМы устремлены в будущее',0,TEX/'icon_ambition.png'),('Ответственность\nМы отвечаем за результат',4.0,TEX/'icon_responsibility.png')]
for i,(txt,x,ic) in enumerate(vals):image_label('Value_'+str(i),'foundation',txt,x,-3.9,.62,3.55,.72,20,bg='#D8F2E6',icon=ic)
image_label('Values_title','foundation','ЦЕННОСТИ\nГЕРОФАРМ',-6.45,-3.9,.62,1.45,.72,19,bg='#D8F2E6',bold=True)

# Main floor shells — layered terraces (cream fascia + peach rim + deck), not flat orange boards.
def terrace_stack(sec, cx, cy, w, d, z_wall_top,
                  oh_f=0.30, oh_b=0.16, oh_l=0.22, oh_r=0.22,
                  fascia_h=0.20, deck_h=0.055, rim_h=0.038,
                  fascia_mat='fascia', deck_mat='deck', rim_mat='rim',
                  curb_sides=()):
 """Build a terrace above a floor body. Returns dict with geometry metrics + top Z."""
 tw = w + oh_l + oh_r
 td = d + oh_f + oh_b
 tcx = cx + (oh_r - oh_l) * 0.5
 tcy = cy + (oh_b - oh_f) * 0.5
 # 1) Vertical cream fascia — the visible edge mass
 box(sec+'_fascia', sec, tcx, tcy, z_wall_top + fascia_h * 0.5, tw, td, fascia_h, fascia_mat)
 # 2) Thin peach/rim lip, slightly proud — catches light (chamfered by dual plates)
 rim_z = z_wall_top + fascia_h + rim_h * 0.5
 box(sec+'_rim', sec, tcx, tcy, rim_z, tw + 0.07, td + 0.07, rim_h, rim_mat)
 # micro-bevel: slightly smaller, darker peach plate under outer lip
 box(sec+'_rimBevel', sec, tcx, tcy, z_wall_top + fascia_h - 0.012, tw + 0.03, td + 0.03, 0.024, 'peach2')
 # 3) Separate terrace deck, inset from rim
 deck_z = z_wall_top + fascia_h + deck_h * 0.5 + 0.004
 box(sec+'_deck', sec, tcx, tcy, deck_z, max(0.4, tw - 0.16), max(0.4, td - 0.16), deck_h, deck_mat)
 top = z_wall_top + fascia_h + max(deck_h + 0.004, rim_h)
 # 4) Low curbs with corner returns — only on requested sides
 curb_h, curb_t = 0.11, 0.085
 cz = top + curb_h * 0.5
 if 'front' in curb_sides:
  box(sec+'_curbF', sec, tcx, tcy - td * 0.5 + curb_t * 0.5, cz, tw - 0.12, curb_t, curb_h, 'cream2')
 if 'back' in curb_sides:
  box(sec+'_curbB', sec, tcx, tcy + td * 0.5 - curb_t * 0.5, cz, tw - 0.12, curb_t, curb_h, 'cream2')
 if 'left' in curb_sides:
  box(sec+'_curbL', sec, tcx - tw * 0.5 + curb_t * 0.5, tcy, cz, curb_t, td - 0.12, curb_h, 'cream2')
 if 'right' in curb_sides:
  box(sec+'_curbR', sec, tcx + tw * 0.5 - curb_t * 0.5, tcy, cz, curb_t, td - 0.12, curb_h, 'cream2')
 # Corner returns where two curbs meet
 if 'front' in curb_sides and 'right' in curb_sides:
  box(sec+'_curbFR', sec, tcx + tw * 0.5 - curb_t * 0.5, tcy - td * 0.5 + curb_t * 0.5, cz, curb_t, curb_t * 1.6, curb_h, 'cream2')
 if 'front' in curb_sides and 'left' in curb_sides:
  box(sec+'_curbFL', sec, tcx - tw * 0.5 + curb_t * 0.5, tcy - td * 0.5 + curb_t * 0.5, cz, curb_t, curb_t * 1.6, curb_h, 'cream2')
 if curb_sides:
  top = top + curb_h
 return {
  'tcx': tcx, 'tcy': tcy, 'tw': tw, 'td': td,
  'right': tcx + tw * 0.5, 'left': tcx - tw * 0.5,
  'front': tcy - td * 0.5, 'back': tcy + td * 0.5,
  'fascia_h': fascia_h, 'top': top, 'z_wall_top': z_wall_top,
  'fascia_mid': z_wall_top + fascia_h * 0.5,
 }

def side_glazing(sec, fl, z_mid, pane_h, cols=3, rows=1):
 """Framed glass on the RIGHT body face (upper floors), leaving terrace rim free for titles."""
 x = fl['cx'] + fl['w'] * 0.5 + 0.03
 y0 = fl['cy'] - fl['d'] * 0.38
 y1 = fl['cy'] + fl['d'] * 0.38
 span = y1 - y0
 # Outer frame plate (cream) slightly proud of wall
 box(sec+'_sideFrame', sec, x, fl['cy'], z_mid, 0.08, span + 0.18, pane_h + 0.22, 'frame')
 for r in range(rows):
  for c in range(cols):
   yy = y0 + (c + 0.5) * span / cols
   zz = z_mid + (r - (rows - 1) * 0.5) * (pane_h * 0.55 if rows > 1 else 0)
   pw = span / cols - 0.12
   ph = pane_h * (0.72 if rows > 1 else 0.78)
   # mullion
   box(sec+'_sideMullion', sec, x + 0.01, yy, zz, 0.05, pw + 0.06, ph + 0.08, 'cream2')
   box(sec+'_sideGlass', sec, x + 0.045, yy, zz, 0.04, pw, ph, 'glass')

def floor(sec, cx, cy, w, d, z_bottom, h, show_windows=True,
          oh_f=0.30, oh_b=0.16, oh_l=0.22, oh_r=0.22,
          fascia_h=0.20, deck_h=0.055, rim_h=0.038,
          fascia_mat='fascia', deck_mat='deck', rim_mat='rim',
          curb_sides=(), side_glass=False, glass_cols=3,
          open_right_bay=None):
 """Build a floor shell. open_right_bay={'x0','depth'} cuts an L-shaped body:
 front-right volume is empty (real niche), left mass + rear strip remain."""
 z = z_bottom + h / 2
 left, right = cx - w / 2, cx + w / 2
 front, back = cy - d / 2, cy + d / 2
 if open_right_bay:
  x0 = float(open_right_bay['x0'])
  depth = float(open_right_bay['depth'])
  main_w = max(0.4, x0 - left)
  box(sec+'_body', sec, left + main_w / 2, cy, z, main_w, d, h, 'cream')
  rear_front = front + depth
  rear_d = back - rear_front
  if rear_d > 0.2:
   bay_w = max(0.4, right - x0)
   box(sec+'_bodyRear', sec, x0 + bay_w / 2, rear_front + rear_d / 2, z, bay_w, rear_d, h, 'cream')
 else:
  box(sec+'_body', sec, cx, cy, z, w, d, h, 'cream')
 terr = terrace_stack(
  sec, cx, cy, w, d, z_bottom + h,
  oh_f=oh_f, oh_b=oh_b, oh_l=oh_l, oh_r=oh_r,
  fascia_h=fascia_h, deck_h=deck_h, rim_h=rim_h,
  fascia_mat=fascia_mat, deck_mat=deck_mat, rim_mat=rim_mat,
  curb_sides=curb_sides,
 )
 if show_windows:
  n = max(3, int(w / 1.25))
 for i in range(n):
   xx = cx - w / 2 + (i + 0.5) * w / n
   box(sec+'_window', sec, xx, cy - d / 2 - 0.02, z, 0.9, 0.07, h - 0.45, 'glass')
   box(sec+'_winFrame', sec, xx, cy - d / 2 - 0.01, z, 1.02, 0.05, h - 0.32, 'frame')
  for xx in [cx - w / 2 + 0.14, cx + w / 2 - 0.14]:
   box(sec+'_pier', sec, xx, cy - d / 2 - 0.06, z, 0.22, 0.28, h, 'cream')
 if side_glass:
  side_glazing(sec, {'cx': cx, 'cy': cy, 'w': w, 'd': d}, z, h - 0.55, cols=glass_cols, rows=2 if h > 1.6 else 1)
 return {
  'top': terr['top'], 'bottom': z_bottom, 'h': h,
  'cx': cx, 'cy': cy, 'w': w, 'd': d, 'mid': z_bottom + h / 2,
  'slab_z': terr['fascia_mid'],
  'tcx': terr['tcx'], 'tcy': terr['tcy'], 'tw': terr['tw'], 'td': terr['td'],
  'right': terr['right'], 'left': terr['left'],
  'front': terr['front'], 'fascia_mid': terr['fascia_mid'],
  'fascia_h': terr['fascia_h'],
 }

def side_title(name, section, text, fl, z=None, band_h=0.18, size=13):
 # Floor name on the outer RIGHT vertical face of the terrace fascia (бортик), not floating.
 x = fl['right'] + 0.04
 if z is None:
  z = fl['fascia_mid']
 band_len = min(fl['td'] * 0.78, 4.8)
 image_label(name, section, text, x, fl['tcy'], z, band_len, band_h, size, bg='#0B8F7A', fg='#FFFFFF', bold=True, side=True)

def side_panel(name, section, text, fl, z, w_panel, h_panel, size=15, badge=False):
 # Initiative panel on right BODY face (inside terrace overhang), not on rim.
 x = fl['cx'] + fl['w'] / 2 + 0.04
 w_panel = min(w_panel, fl['d'] * 0.55)
 image_label(name, section, text, x, fl['cy'], z, w_panel, h_panel, size, bg='#D8F2E6', badge=badge, side=True)

# --- Floor-2 facade typography (Verdana, world-relative size, no microscopic lock) ---
F2_PPU = 480
F2_INIT_PX = 56          # unified initiative body size — fills panel, not microscopic
F2_SITE_PX = 34
F2_GOAL_TITLE_PX = 32
F2_GOAL_BODY_PX = 30
F2_TEAL = '#0B8F7A'
F2_INK = '#1A2E2A'
F2_PANEL_BG = '#F3FBF7'
F2_SI = '#1A997A'

def _strip_si_prefix(text):
 t = (text or '').strip()
 if t.upper().startswith('СИ:'):
  return t[3:].lstrip()
 return t

def _wrap_words(draw, text, font, maxw):
 lines = []
 for paragraph in (text or '').split('\n'):
  paragraph = paragraph.strip()
  if not paragraph:
   lines.append('')
   continue
  row = ''
  for word in paragraph.split():
   test = (row + ' ' + word).strip()
   if draw.textlength(test, font=font) > maxw and row:
    lines.append(row)
    row = word
   else:
    row = test
  if row:
   lines.append(row)
 return lines or ['']

def _place_text_quad(name, section, raw, x, y, z, w, h, side=False, audit_text=''):
 audit.append({'name': name, 'section': section, 'text': audit_text, 'font': FONT.name,
               'fontSizePx': F2_INIT_PX, 'worldSize': [w, h], 'floor2Style': True, 'side': side})
 (TEX / (name + '.png')).write_bytes(raw)
 if side:
  t = 0.045
  x0, x1 = x, x + t
  y0, y1 = y - w / 2, y + w / 2
  z0, z1 = z - h / 2, z + h / 2
  p = [(x0, y0, z0), (x1, y0, z0), (x1, y1, z0), (x0, y1, z0),
       (x0, y0, z1), (x1, y0, z1), (x1, y1, z1), (x0, y1, z1)]
  f = [(3, 2, 1, 0), (5, 6, 7, 4), (1, 5, 4, 0), (2, 6, 5, 1), (3, 7, 6, 2), (7, 3, 0, 4)]
  uv = [(0, 0), (0, 1), (1, 1), (0, 0), (0, 0), (0, 0), (1, 0), (0, 0)]
  return add_mesh(name, section, 'text', p, f, add_mat(name, 'white', texture=raw), uv)
 # Slightly proud of facade; UV matches existing image_label front quads (readable upright)
 p = [(x - w / 2, y, z - h / 2), (x + w / 2, y, z - h / 2),
      (x + w / 2, y, z + h / 2), (x - w / 2, y, z + h / 2)]
 return add_mesh(name, section, 'text', p, [(0, 1, 2, 3)], add_mat(name, 'white', texture=raw),
                 [(0, 1), (1, 1), (1, 0), (0, 0)])

def f2_initiative_panel(name, section, texts, x, y, z, w, h, side=False):
 """One or two initiative blocks with СИ markers. Fixed readable size; top-aligned; no auto-shrink."""
 items = [_strip_si_prefix(t) for t in texts if t and str(t).strip()]
 if not items:
  return
 W = max(280, round(w * F2_PPU))
 H = max(160, round(h * F2_PPU))
 img = Image.new('RGB', (W, H), F2_PANEL_BG)
 d = ImageDraw.Draw(img)
 font = ImageFont.truetype(str(FONT), F2_INIT_PX)
 si_font = ImageFont.truetype(str(BOLD), max(14, int(F2_INIT_PX * 0.55)))
 lh = max(20, int(F2_INIT_PX * 1.26))
 pad = max(12, int(min(W, H) * 0.04))
 si_r = max(14, int(F2_INIT_PX * 0.62))
 gap = max(14, int(F2_INIT_PX * 0.55))
 yy = pad
 for text in items:
  cx = pad + si_r
  cy = yy + si_r
  d.ellipse((cx - si_r, cy - si_r, cx + si_r, cy + si_r), fill=F2_SI)
  d.text((cx, cy), 'СИ', font=si_font, fill='white', anchor='mm')
  text_left = pad + 2 * si_r + int(pad * 0.85)
  maxw = max(40, W - text_left - pad)
  lines = _wrap_words(d, text, font, maxw)
  ty = yy + max(0, si_r - F2_INIT_PX // 2)
  for line in lines:
   if ty + lh > H - pad:
    break
   d.text((text_left, ty), line, font=font, fill=F2_INK)
   ty += lh
  # Pack next block under content (no equal half-split → no huge empty band)
  yy = max(ty, yy + 2 * si_r) + gap
 buf = io.BytesIO(); img.save(buf, 'PNG', optimize=False)
 audit_text = '\n\n'.join('СИ: ' + t for t in items)
 return _place_text_quad(name, section, buf.getvalue(), x, y, z, w, h, side=side, audit_text=audit_text)

def f2_site_strip(name, section, text, x, y, z, w, h):
 """Production-site name: bold caps, white on teal."""
 display = _strip_si_prefix(text).rstrip(':').strip().upper()
 W = max(320, round(w * F2_PPU))
 H = max(64, round(h * F2_PPU))
 img = Image.new('RGB', (W, H), F2_TEAL)
 d = ImageDraw.Draw(img)
 font = ImageFont.truetype(str(BOLD), F2_SITE_PX)
 pad = max(10, int(H * 0.18))
 maxw = W - 2 * pad
 lines = _wrap_words(d, display, font, maxw)
 lh = max(16, int(F2_SITE_PX * 1.15))
 total = lh * len(lines)
 yy = max(pad // 2, (H - total) // 2)
 for line in lines:
  d.text((W / 2, yy + lh / 2), line, font=font, fill='white', anchor='mm')
  yy += lh
 buf = io.BytesIO(); img.save(buf, 'PNG', optimize=False)
 return _place_text_quad(name, section, buf.getvalue(), x, y, z, w, h, audit_text=text)

def f2_goal_fascia(name, section, text, x, y, z, w, h):
 """Shared goal on vertical slab fascia: green title left, dark body right."""
 raw = (text or '').strip()
 if ':' in raw:
  title, body = raw.split(':', 1)
  title = title.strip() + ':'
  body = body.strip()
 else:
  title, body = raw, ''
 W = max(640, round(w * F2_PPU))
 H = max(72, round(h * F2_PPU))
 img = Image.new('RGB', (W, H), '#F7F1E6')
 d = ImageDraw.Draw(img)
 title_font = ImageFont.truetype(str(BOLD), F2_GOAL_TITLE_PX)
 body_font = ImageFont.truetype(str(FONT), F2_GOAL_BODY_PX)
 pad = max(12, int(H * 0.2))
 title_disp = title.upper()
 tw = d.textlength(title_disp, font=title_font)
 title_w = min(int(W * 0.36), int(tw + pad * 2))
 d.text((pad, H / 2), title_disp, font=title_font, fill=F2_TEAL, anchor='lm')
 body_left = title_w + pad
 maxw = max(40, W - body_left - pad)
 lines = _wrap_words(d, body, body_font, maxw)
 lh = max(14, int(F2_GOAL_BODY_PX * 1.2))
 total = lh * len(lines)
 yy = max(4, (H - total) // 2)
 for line in lines:
  d.text((body_left, yy), line, font=body_font, fill=F2_INK)
  yy += lh
 buf = io.BytesIO(); img.save(buf, 'PNG', optimize=False)
 return _place_text_quad(name, section, buf.getvalue(), x, y, z, w, h, audit_text=text)

def mission_band(name, section, title, body, x, y, z, w, h):
 """Roof fascia band: compact white-bold title (2 lines) left, white-regular mission right."""
 W = max(720, round(w * F2_PPU))
 H = max(80, round(h * F2_PPU))
 img = Image.new('RGB', (W, H), F2_TEAL)
 d = ImageDraw.Draw(img)
 title_font = ImageFont.truetype(str(BOLD), max(18, int(H * 0.28)))
 body_font = ImageFont.truetype(str(FONT), max(16, int(H * 0.26)))
 pad = max(10, int(H * 0.14))
 words = [ln.strip() for ln in (title or 'МИССИЯ КОМПАНИИ').upper().replace(':', '').split() if ln.strip()]
 if len(words) >= 2:
  t_lines = [words[0], ' '.join(words[1:])]
 elif words:
  t_lines = [words[0], '']
 else:
  t_lines = ['МИССИЯ', 'КОМПАНИИ']
 t_lines = [ln for ln in t_lines if ln]
 tlh = max(14, int(title_font.size * 1.05))
 title_block_w = max(d.textlength(ln, font=title_font) for ln in t_lines) + pad
 ty = max(4, (H - tlh * len(t_lines)) // 2)
 for ln in t_lines:
  d.text((pad, ty), ln, font=title_font, fill='white')
  ty += tlh
 body_left = int(title_block_w + pad * 1.4)
 maxw = max(40, W - body_left - pad)
 body_lines = _wrap_words(d, body, body_font, maxw)
 blh = max(14, int(body_font.size * 1.18))
 by = max(4, (H - blh * len(body_lines)) // 2)
 for ln in body_lines:
  d.text((body_left, by), ln, font=body_font, fill='white')
  by += blh
 buf = io.BytesIO(); img.save(buf, 'PNG', optimize=False)
 audit_text = f'{title}: {body}'
 return _place_text_quad(name, section, buf.getvalue(), x, y, z, w, h, audit_text=audit_text)

def finance_panel(name, section, lines, x, y, z, w, h):
 """Financial KPIs: dark regular on light mint, equal size, top-aligned, word wrap."""
 items = [ln.strip() for ln in lines if ln and str(ln).strip()]
 W = max(360, round(w * F2_PPU))
 H = max(200, round(h * F2_PPU))
 img = Image.new('RGB', (W, H), F2_PANEL_BG)
 d = ImageDraw.Draw(img)
 font = ImageFont.truetype(str(FONT), F2_INIT_PX)
 lh = max(20, int(F2_INIT_PX * 1.28))
 pad = max(14, int(min(W, H) * 0.055))
 gap = max(10, int(F2_INIT_PX * 0.35))
 yy = pad
 maxw = max(40, W - 2 * pad)
 for text in items:
  wrapped = _wrap_words(d, text, font, maxw)
  for line in wrapped:
   if yy + lh > H - pad:
    break
   d.text((pad, yy), line, font=font, fill=F2_INK)
   yy += lh
  yy += gap
 buf = io.BytesIO(); img.save(buf, 'PNG', optimize=False)
 return _place_text_quad(name, section, buf.getvalue(), x, y, z, w, h, audit_text='\n'.join(items))

# Floor 1 — wide base tier, modest intentional overhangs, front curb only
f1_bottom = 1.05
f1 = floor(
 'floor1', 0, 0, 14.2, 6.7, f1_bottom, 2.15,
 oh_f=0.36, oh_b=0.14, oh_l=0.24, oh_r=0.24,
 fascia_h=0.24, deck_h=0.05, rim_h=0.04,
 fascia_mat='fascia', deck_mat='deck', rim_mat='peach',
 curb_sides=('front',),
)
f1_top = f1['top']
for i, txt in enumerate(sections[1]['items'][:5]):
 x = -1.0 + i * 1.75
 col_h = f1['h'] - 0.12
 col_z = f1_bottom + 0.06 + col_h / 2
 box('Column_'+str(i+1), 'floor1', x, -3.45, col_z, .62, .58, col_h, 'cream')
 box('Column_cap', 'floor1', x, -3.45, f1_bottom + f1['h'] - 0.08, .78, .74, .16, 'peach')
 box('Column_base', 'floor1', x, -3.45, f1_bottom + 0.12, .78, .74, .16, 'cream')
 image_label('ColumnText_'+str(i+1), 'floor1', txt, x, -3.76, col_z, .42, col_h - 0.35, 16, bg='#FBF1DC', vertical=True)
box('Porch canopy', 'floor1', -4.25, -3.62, f1_bottom + f1['h'] - 0.12, 2.85, 1.25, .2, 'cream')
box('Porch orange rim', 'floor1', -4.25, -4.2, f1_bottom + f1['h'] - 0.05, 3.0, .18, .14, 'peach')
box('Door surround', 'floor1', -4.25, -3.65, f1_bottom + 0.95, 1.75, .22, 1.75, 'cream')
box('Door glass', 'floor1', -4.25, -3.8, f1_bottom + 0.95, 1.3, .07, 1.4, 'glass')
for j in range(3):
 box('Porch step', 'floor1', -4.25, -4.1 - j * .22, f1_bottom - 0.15 + j * .08, 2.5 - j * .14, .7, .14, 'base')
side_panel('Employer', 'floor1', sections[1]['items'][5], f1, f1_bottom + 1.05, 4.2, .7, 16, badge=True)
side_title('Floor1Title', 'floor1', '1 ЭТАЖ: КОМАНДА И ЛИДЕРСТВО', f1)

# Floor 2 — production; open-right Obolensk bay cut into body (real niche, not a painted recess)
f2_bottom = f1_top
f2_h = 1.85
# Bay starts after carton stacks; deeper cut so right face reads open (like original corner niche).
OB_BAY_X0 = 3.05
OB_BAY_DEPTH = 2.25
f2 = floor(
 'floor2', 0.15, 0.08, 13.6, 6.2, f2_bottom, f2_h, show_windows=False,
 oh_f=0.28, oh_b=0.12, oh_l=0.18, oh_r=0.26,
 fascia_h=0.21, deck_h=0.05, rim_h=0.036,
 fascia_mat='fascia', deck_mat='deck2', rim_mat='rim',
 # front curb only — right curb would visually box the open bay corner
 curb_sides=('front',),
 open_right_bay={'x0': OB_BAY_X0, 'depth': OB_BAY_DEPTH},
)
f2_top = f2['top']
f2_mid = f2['mid']
ob_left = OB_BAY_X0
ob_right = f2['cx'] + f2['w'] * 0.5
ob_w = ob_right - ob_left
ob_cx = (ob_left + ob_right) * 0.5
ob_front = f2['cy'] - f2['d'] * 0.5
ob_back_y = ob_front + OB_BAY_DEPTH
ob_front_y = ob_front - 0.06

# Pushkino — shallow front niche only (unchanged role)
nx, nw = -1.35, 4.1
box('Floor2PushkinoNicheBack', 'floor2', nx, -2.45, f2_mid, nw, .2, f2_h - 0.35, 'white')
box('Floor2PushkinoNicheTop', 'floor2', nx, -3.05, f2_bottom + f2_h - 0.12, nw, .4, .16, 'peach')
box('Floor2PushkinoNicheSill', 'floor2', nx, -3.05, f2_bottom + 0.1, nw, .4, .14, 'deck')
box('Floor2PushkinoNicheJambL', 'floor2', nx - nw / 2 + .1, -3.0, f2_mid, .2, .48, f2_h - 0.35, 'cream')
box('Floor2PushkinoNicheJambR', 'floor2', nx + nw / 2 - .1, -3.0, f2_mid, .2, .48, f2_h - 0.35, 'cream')
box('Floor2PushkinoNicheLight', 'floor2', nx, -2.6, f2_bottom + f2_h - 0.28, nw - .4, .1, .07, 'niche_light')

# Obolensk — real niche: floor, ceiling, back, left jamb; RIGHT open (no jambR)
box('ObolenskBayFloor', 'floor2', ob_cx, ob_front + OB_BAY_DEPTH * 0.5, f2_bottom + 0.08,
    ob_w - 0.08, OB_BAY_DEPTH - 0.1, 0.16, 'deck')
box('ObolenskBayCeiling', 'floor2', ob_cx, ob_front + OB_BAY_DEPTH * 0.5, f2_bottom + f2_h - 0.05,
    ob_w - 0.08, OB_BAY_DEPTH - 0.1, 0.1, 'cream2')
box('ObolenskBayBack', 'floor2', ob_cx, ob_back_y - 0.07, f2_mid,
    ob_w - 0.1, 0.14, f2_h - 0.28, 'white')
box('ObolenskBayJambL', 'floor2', ob_left + 0.1, ob_front + OB_BAY_DEPTH * 0.5, f2_mid,
    0.2, OB_BAY_DEPTH - 0.12, f2_h - 0.28, 'cream')
# Lintel/sill only on the LEFT~60% of the bay so the open-right tank volume stays clear
plaque_w = ob_w * 0.58
plaque_cx = ob_left + plaque_w * 0.5 + 0.12
box('ObolenskBayLintel', 'floor2', plaque_cx, ob_front + 0.14, f2_bottom + f2_h - 0.14,
    plaque_w, 0.38, 0.16, 'peach')
box('ObolenskBaySill', 'floor2', plaque_cx, ob_front + 0.12, f2_bottom + 0.14,
    plaque_w, 0.34, 0.16, 'deck')
box('ObolenskBayLight', 'floor2', ob_cx, ob_back_y - 0.22, f2_bottom + f2_h - 0.28,
    ob_w - 0.4, 0.1, 0.07, 'niche_light')

p = sections[2]['items']
f2_body_front = f2['cy'] - f2['d'] * 0.5
f2_label_y = f2_body_front - 0.055  # proud of cream body, no z-fight

# Left front vertical panel — two initiatives (bio + dry extracts), each with СИ
f2_initiative_panel(
 'ProductionLeft', 'floor2', [p[0], p[1]],
 -5.05, f2_label_y, f2_mid + 0.02, 2.95, 1.52
)

# Horizontal panel ABOVE conveyor (upper band of Pushkino niche opening)
f2_initiative_panel(
 'TabletProduction', 'floor2', [p[2]],
 nx, f2_label_y, f2_bottom + f2_h - 0.46, 3.55, 0.58
)

# Site strip under Pushkino conveyor niche only
f2_site_strip(
 'PushkinoName', 'floor2', p[6],
 nx, f2_label_y, f2_bottom + 0.20, nw - 0.55, 0.26
)

# Obolensk front panel — two initiatives with СИ; sits on bay plaque surface
ob_panel_w = min(2.55, plaque_w - 0.1)
ob_panel_h = 1.38
f2_initiative_panel(
 'ObolenskProduction', 'floor2', [p[4], p[5]],
 plaque_cx, ob_front_y, f2_mid + 0.02, ob_panel_w, ob_panel_h
)

# Site strip under Obolensk panel
f2_site_strip(
 'ObolenskName', 'floor2', p[3],
 plaque_cx, ob_front_y - 0.01, f2_bottom + 0.20, ob_panel_w + 0.1, 0.26
)

# Shared goal on front VERTICAL fascia of the slab under floor2 (floor1 terrace edge)
f2_goal_fascia(
 'SharedGoal', 'floor2', p[7],
 0.15, f1['front'] - 0.04, f1['fascia_mid'], 12.4, min(0.22, f1['fascia_h'] * 0.92)
)

# Integrated planning — on the open RIGHT plane above tanks (side facade), not frontal
f2_initiative_panel(
 'Planning', 'floor2', [p[8]],
 ob_right + 0.05, ob_front + OB_BAY_DEPTH * 0.40, f2_bottom + f2_h * 0.70,
 1.65, 0.78, side=True
)

side_title('Floor2Title', 'floor2', '2 ЭТАЖ: БИЗНЕС-ПРОЦЕССЫ И ПРОИЗВОДСТВО', f2)
box('ConveyorBody', 'floor2', -1.4, -3.15, f2_bottom + 0.55, 3.5, .82, .18, 'orange')
box('ConveyorBelt', 'floor2', -1.4, -3.19, f2_bottom + 0.66, 3.3, .6, .07, 'teal')
for i in range(2):
 box('ConveyorRail', 'floor2', -1.4, -3.49 + i * .6, f2_bottom + 0.72, 3.2, .05, .12, 'metal')
for i in range(2):
 box('ConveyorSupport', 'floor2', -2.8 + i * 2.8, -3.15, f2_bottom + 0.32, .12, .55, .42, 'metal')
for i in range(9):
 box('ConveyorPack', 'floor2', -2.7 + i * .32, -3.2, f2_bottom + 0.82, .18, .2, .14, 'white')
for x in [.5, 1.0, 1.5]:
 box('CartonStack', 'floor2', x, -3.12, f2_bottom + 0.75, .38, .38, .4, 'carton')

# --- Process vessels inside the open Obolensk bay (legs on bay floor; clear of walls) ---
def process_vessel(tag, x, y, z_pad_top, r, body_h):
 """Recognizable bioreactor/tank: pad legs, skirt, body, lid, top nozzle."""
 leg_h, skirt_h, lid_h, nozzle_h = 0.18, 0.09, 0.1, 0.11
 for sx, sy in ((-1, -1), (1, -1), (-1, 1), (1, 1)):
  box(tag+'_Leg', 'floor2', x + sx * r * 0.7, y + sy * r * 0.7,
      z_pad_top + leg_h * 0.5, 0.07, 0.07, leg_h, 'metal')
 z_skirt = z_pad_top + leg_h + skirt_h * 0.5
 cylinder(tag+'_Skirt', 'floor2', x, y, z_skirt, r * 1.1, skirt_h, 'metal', 28)
 cylinder(tag+'_Heel', 'floor2', x, y, z_skirt + skirt_h * 0.5 + 0.04, r * 1.02, 0.08, 'metal', 28)
 z_body = z_skirt + skirt_h * 0.5 + 0.08 + body_h * 0.5
 cylinder(tag+'_Body', 'floor2', x, y, z_body, r, body_h, 'metal', 28)
 cylinder(tag+'_Band', 'floor2', x, y, z_body + body_h * 0.08, r * 1.045, 0.055, 'metal', 28)
 z_lid = z_body + body_h * 0.5 + lid_h * 0.5
 cylinder(tag+'_Lid', 'floor2', x, y, z_lid, r * 0.94, lid_h, 'metal', 28)
 cylinder(tag+'_Nozzle', 'floor2', x, y, z_lid + lid_h * 0.5 + nozzle_h * 0.5, r * 0.2, nozzle_h, 'metal', 16)
 box(tag+'_Cap', 'floor2', x, y, z_lid + lid_h * 0.5 + nozzle_h + 0.02, r * 0.32, r * 0.32, 0.04, 'metal')
 stub_z = z_body - body_h * 0.15
 # stub toward +X (open right) so it reads from the side view
 rod(tag+'_Stub', 'floor2', (x + r * 0.95, y, stub_z), (x + r * 1.35, y, stub_z), 0.035, 'metal')
 return z_body, stub_z

pad_top = f2_bottom + 0.08 + 0.08  # top of ObolenskBayFloor
# Two vessels toward the open-right volume; clear of left jamb / back / ceiling
tank_y = ob_front + 0.82
t1x, t1r = ob_cx + 0.15, 0.40
t2x, t2r = ob_cx + 1.15, 0.44
# keep clear of right edge and back wall
t2x = min(t2x, ob_right - t2r - 0.35)
t1x = min(t1x, t2x - t1r - t2r - 0.35)
v1_body, v1_stub = process_vessel('TankA', t1x, tank_y, pad_top, t1r, 0.95)
v2_body, v2_stub = process_vessel('TankB', t2x, tank_y + 0.08, pad_top, t2r, 1.05)
rod('TankBridge', 'floor2',
    (t1x + t1r * 1.2, tank_y, v1_stub),
    (t2x - t2r * 1.2, tank_y + 0.08, v2_stub), 0.032, 'metal')
rod('TankDrain', 'floor2',
    ((t1x + t2x) * 0.5, tank_y + 0.15, v1_stub),
    ((t1x + t2x) * 0.5, tank_y + 0.15, pad_top + 0.12), 0.03, 'metal')

# Floor 3 — architectural bays: innovation niche | panels in spans | export glass bay
f3_bottom = f2_top
f3_h = 1.75
f3 = floor(
 'floor3', -0.55, 0.35, 9.6, 4.9, f3_bottom, f3_h, show_windows=False,
 oh_f=0.26, oh_b=0.14, oh_l=0.16, oh_r=0.20,
 fascia_h=0.18, deck_h=0.048, rim_h=0.034,
 fascia_mat='cream2', deck_mat='deck', rim_mat='peach',
 curb_sides=('front', 'right'),
 side_glass=True, glass_cols=3,
)
f3_top = f3['top']
f3_mid = f3['mid']
p3 = sections[3]['items']

f3_left = f3['cx'] - f3['w'] * 0.5
f3_right = f3['cx'] + f3['w'] * 0.5
f3_front = f3['cy'] - f3['d'] * 0.5
f3_label_y = f3_front - 0.05
pier_w = 0.18
# Order matches approved layout: innov | pair | fill | lead | sales | export
# Widths fit body (5 piers + margins); long copy gets wider bays — same type size for all.
bay_specs = [
 ('innov', 1.40),
 ('pair', 2.05),   # portfolio formation + market access
 ('fill', 1.85),   # partnership fill — longest copy
 ('lead', 1.15),   # metabolic leadership
 ('sales', 1.15),  # sales efficiency
 ('export', 1.00), # export in glazed end bay
]
cursor = f3_left + 0.1
bay_layout = []
for i, (kind, bw) in enumerate(bay_specs):
 if i:
  box('F3Pier_'+str(i), 'floor3', cursor + pier_w * 0.5, f3_front - 0.04, f3_mid, pier_w, 0.28, f3_h - 0.4, 'cream')
  cursor += pier_w
 bay_layout.append((kind, cursor + bw * 0.5, bw))
 cursor += bw
assert cursor <= f3_right + 0.05, (cursor, f3_right)

def f3_recess(name_prefix, cx, bw, deep=0.35):
 """Recessed bay: back wall, sill, lintel, side jambs."""
 box(name_prefix+'Back', 'floor3', cx, f3_front + deep, f3_mid, bw - 0.06, 0.12, f3_h - 0.4, 'white')
 box(name_prefix+'Sill', 'floor3', cx, f3_front + 0.08, f3_bottom + 0.12, bw - 0.04, 0.35, 0.12, 'deck')
 box(name_prefix+'Lintel', 'floor3', cx, f3_front + 0.08, f3_bottom + f3_h - 0.18, bw - 0.04, 0.35, 0.14, 'peach')
 box(name_prefix+'JambL', 'floor3', cx - bw * 0.5 + 0.06, f3_front + 0.1, f3_mid, 0.12, 0.4, f3_h - 0.45, 'cream2')
 box(name_prefix+'JambR', 'floor3', cx + bw * 0.5 - 0.06, f3_front + 0.1, f3_mid, 0.12, 0.4, f3_h - 0.45, 'cream2')
 box(name_prefix+'Light', 'floor3', cx, f3_front + deep - 0.05, f3_bottom + f3_h - 0.32, bw - 0.25, 0.08, 0.06, 'niche_light')

PANEL_H = 1.18

for kind, cx, bw in bay_layout:
 pw = max(0.55, bw - 0.24)
 if kind == 'innov':
  f3_recess('Innov', cx, bw, deep=0.55)
  box('InnovDesk', 'floor3', cx - 0.15, f3_front + 0.32, f3_bottom + 0.42, 0.7, 0.38, 0.08, 'carton')
  box('InnovDeskLegL', 'floor3', cx - 0.4, f3_front + 0.32, f3_bottom + 0.28, 0.06, 0.06, 0.28, 'metal')
  box('InnovDeskLegR', 'floor3', cx + 0.1, f3_front + 0.32, f3_bottom + 0.28, 0.06, 0.06, 0.28, 'metal')
  box('InnovChair', 'floor3', cx + 0.35, f3_front + 0.22, f3_bottom + 0.32, 0.28, 0.28, 0.22, 'orange')
  box('InnovMonitor', 'floor3', cx - 0.15, f3_front + 0.48, f3_bottom + 0.72, 0.42, 0.04, 0.32, 'dark')
  chart = Image.new('RGB', (320, 240), '#1a3030'); cd = ImageDraw.Draw(chart)
  cd.rectangle((20, 20, 300, 220), fill='#0d2222')
  pts = [(40, 170), (90, 140), (140, 150), (190, 100), (240, 80), (280, 55)]
  cd.line(pts, fill='#3ECF9A', width=6)
  for px_, py_ in pts:
   cd.ellipse((px_ - 5, py_ - 5, px_ + 5, py_ + 5), fill='#F4A66C')
  buf = io.BytesIO(); chart.save(buf, 'PNG'); raw = buf.getvalue()
  (TEX / 'InnovChart.png').write_bytes(raw)
  add_mesh(
   'InnovChart', 'floor3', 'text',
   [(cx - 0.34, f3_front + 0.501, f3_bottom + 0.58), (cx + 0.04, f3_front + 0.501, f3_bottom + 0.58),
    (cx + 0.04, f3_front + 0.501, f3_bottom + 0.86), (cx - 0.34, f3_front + 0.501, f3_bottom + 0.86)],
   [(0, 1, 2, 3)], add_mat('InnovChart', 'white', texture=raw), [(0, 1), (1, 1), (1, 0), (0, 0)]
  )
  # Compact caption above the open innovation niche
  f2_initiative_panel(
   'Portfolio_Innov', 'floor3', [p3[0]],
   cx, f3_label_y, f3_bottom + f3_h - 0.36, pw, 0.34
  )
 elif kind == 'export':
  f3_recess('Export', cx, bw, deep=0.3)
  box('ExportGlass', 'floor3', cx, f3_front - 0.01, f3_mid, bw - 0.22, 0.05, f3_h - 0.55, 'glass')
  box('ExportFrame', 'floor3', cx, f3_front - 0.005, f3_mid, bw - 0.12, 0.04, f3_h - 0.42, 'frame')
  px = min(cx, f3_right - pw * 0.5 - 0.1)
  # Same initiative size as long panels — do not enlarge short "Экспорт"
  f2_initiative_panel(
   'Portfolio_Export', 'floor3', [p3[6]],
   px, f3_label_y, f3_mid + 0.02, pw, PANEL_H
  )
 elif kind == 'pair':
  f3_recess('Bay_pair', cx, bw, deep=0.28)
  f2_initiative_panel(
   'Portfolio_Pair', 'floor3', [p3[1], p3[2]],
   cx, f3_label_y, f3_mid + 0.02, pw, PANEL_H
  )
 else:
  f3_recess('Bay_'+kind, cx, bw, deep=0.28)
  if kind == 'fill':
   txt, name = p3[3], 'Portfolio_Fill'
  elif kind == 'lead':
   txt, name = p3[4], 'Portfolio_Lead'
  else:
   txt, name = p3[5], 'Portfolio_Sales'
  f2_initiative_panel(
   name, 'floor3', [txt],
   cx, f3_label_y, f3_mid + 0.02, pw, PANEL_H
  )

side_title('Floor3Title', 'floor3', '3 ЭТАЖ: ПОРТФЕЛЬ И РЫНКИ', f3)

# Floor 4 — further setback; thinner terrace; side glazing; front curb only
f4_bottom = f3_top
f4_h = 1.45
f4 = floor(
 'floor4', 0.05, 0.45, 6.4, 4.0, f4_bottom, f4_h,
 oh_f=0.20, oh_b=0.12, oh_l=0.14, oh_r=0.14,
 fascia_h=0.16, deck_h=0.045, rim_h=0.032,
 fascia_mat='fascia', deck_mat='deck2', rim_mat='rim',
 curb_sides=('front',),
 side_glass=True, glass_cols=2,
)
f4_top = f4['top']
f4_mid = f4['mid']
f4_front = f4['cy'] - f4['d'] * 0.5
f4_right = f4['cx'] + f4['w'] * 0.5
# Finance on the RIGHT of the front facade; leave left glazing visible (as in original)
fin_w = 2.95
fin_h = 1.18
fin_x = f4_right - fin_w * 0.5 - 0.18
finance_panel(
 'Finance', 'floor4', sections[4]['items'],
 fin_x, f4_front - 0.06, f4_mid + 0.02, fin_w, fin_h
)
side_title('Floor4Title', 'floor4', 'ФИНАНСОВЫЕ ПОКАЗАТЕЛИ', f4)

# Roof — cream fascia + peach lip; taller front band for readable mission
ROOF_FASCIA = 0.34
ROOF_RIM = 0.04
roof_w, roof_d = 7.0, 4.25
roof_cx, roof_cy = 0.05, 0.45
box('RoofFascia', 'mission', roof_cx, roof_cy, f4_top + ROOF_FASCIA * 0.5, roof_w, roof_d, ROOF_FASCIA, 'fascia')
box('RoofRim', 'mission', roof_cx, roof_cy, f4_top + ROOF_FASCIA + ROOF_RIM * 0.5, roof_w + 0.08, roof_d + 0.08, ROOF_RIM, 'peach')
box('RoofDeck', 'mission', roof_cx, roof_cy, f4_top + ROOF_FASCIA + 0.03, roof_w - 0.2, roof_d - 0.2, 0.05, 'deck')
roof_z = f4_top + ROOF_FASCIA * 0.5
mission_band(
 'MissionBand', 'mission',
 'МИССИЯ КОМПАНИИ', sections[5]['items'][0],
 roof_cx, roof_cy - roof_d / 2 - 0.035, roof_z, roof_w - 0.12, ROOF_FASCIA * 0.90
)
roof_top = f4_top + ROOF_FASCIA + ROOF_RIM


# Logo roundels + readable glyph boards (not solid bars)
cylinder('Logo green circle','mission',-2.55,-1.55,roof_top+0.42,.42,.12,'teal',32,front=True)
cylinder('Logo gold circle','mission',-1.65,-1.55,roof_top+0.42,.42,.12,'gold',32,front=True)
roundel_label('LogoG','mission','g',-2.55,-1.66,roof_top+0.42,.7,'#0B8F7A',size=110)
roundel_label('LogoPh','mission','Ph',-1.65,-1.66,roof_top+0.42,.7,'#E8BF63',size=78)

def glyph_board(name,section,ch,x,y,z,w,h):
 S=320
 img=Image.new('RGBA',(S,S),(0,0,0,0)); d=ImageDraw.Draw(img)
 font=ImageFont.truetype(str(BOLD), 240)
 d.text((S/2,S/2),ch,font=font,fill=(36,48,46,255),anchor='mm')
 buf=io.BytesIO(); img.save(buf,'PNG',optimize=False); raw=buf.getvalue()
 (TEX/(name+'.png')).write_bytes(raw)
 p=[(x-w/2,y,z-h/2),(x+w/2,y,z-h/2),(x+w/2,y,z+h/2),(x-w/2,y,z+h/2)]
 return add_mesh(name,section,'text',p,[(0,1,2,3)],add_mat(name,'white',texture=raw,alpha=True),[(0,1),(1,1),(1,0),(0,0)])

word='ГЕРОФАРМ'
glyph_w={'Г':.38,'Е':.36,'Р':.38,'О':.4,'Ф':.46,'А':.38,'М':.44}
cursor_x=-0.85
letter_z=roof_top+0.48
for ch in word:
 w=glyph_w.get(ch,.36)
 cx=cursor_x+w/2
 box('WordmarkSupport','mission',cx,-1.72,roof_top+0.22,.08,.08,.22,'metal')
 glyph_board('WordmarkLetter_'+ch,'mission',ch,cx,-1.78,letter_z,w,.42)
 cursor_x+=w+.07

# Surface-of-revolution teardrop bushes (not stacked cylinders)
def lathe_bush(name,x,y,z0,height,r_max,kind='leaf',rings=15,segs=18):
 def rad(t):
  # bulb near lower third, taper to tip
  return max(0.01, r_max*(math.sin(math.pi*min(1.0,t*1.02))**1.05)*(1.0-0.62*t*t))
 positions=[]; faces=[]
 for i in range(rings+1):
  t=i/rings; zz=z0+height*t; rr=0.01 if i==rings else rad(t)
  for j in range(segs):
   a=2*math.pi*j/segs
   jit=1.0+0.045*math.sin(2.7*a+0.6*i)
   positions.append((x+rr*jit*math.cos(a), y+rr*jit*math.sin(a), zz))
 for i in range(rings):
  for j in range(segs):
   a=i*segs+j; b=i*segs+(j+1)%segs
   c=(i+1)*segs+(j+1)%segs; d=(i+1)*segs+j
   faces.append((a,b,c,d))
 return add_mesh(name,'environment',kind,positions,faces,add_mat(kind,kind))

for x in [-5.15,-3.35]:
 box('EntryPot','environment',x,-4.05,.55,.7,.7,.42,'peach')
 box('EntrySoil','environment',x,-4.05,.78,.58,.58,.08,'soil')
 lathe_bush('EntryBush',x,-4.05,.82,1.15,.36,'leaf')
box('PlanterBed','environment',5.35,-3.5,.55,4.0,.85,.4,'peach')
box('PlanterSoil','environment',5.35,-3.5,.76,3.7,.65,.08,'soil')
for i,bx in enumerate([3.9,4.55,5.2,5.85,6.5,7.05]):
 lathe_bush('BedBush',bx,-3.5,.8,.55,.2,'leaf2' if i%2 else 'leaf',rings=10,segs=12)
for x in [-5.7,-4.1,-2.8]:
 box('Bench','environment',x,-4.75,.42,1.05,.15,.11,'teal')
for x in [-8.1,-1.0,6.9]:
 lamp_curve('LampCurve','environment',(x,-4.2,.22),1.95,.9,.032)

# --- Approved text → GLB object coverage check ---
TEXT_MAP = [
 ('Страсть\nМы увлечены работой', 'Value_0'),
 ('Амбициозность\nМы устремлены в будущее', 'Value_1'),
 ('Ответственность\nМы отвечаем за результат', 'Value_2'),
 ('ЦЕННОСТИ\nГЕРОФАРМ', 'Values_title'),
 ('Трансформация культуры', 'ColumnText_1'),
 ('Лидерство и карьера', 'ColumnText_2'),
 ('Эффективность и мотивация', 'ColumnText_3'),
 ('Мышление долголетия', 'ColumnText_4'),
 ('Сильный бренд работодателя', 'ColumnText_5'),
 (sections[1]['items'][5], 'Employer'),
 ('1 ЭТАЖ: КОМАНДА И ЛИДЕРСТВО', 'Floor1Title'),
 (sections[2]['items'][0], 'ProductionLeft'),
 (sections[2]['items'][1], 'ProductionLeft'),
 (sections[2]['items'][2], 'TabletProduction'),
 (sections[2]['items'][3], 'ObolenskName'),
 (sections[2]['items'][4], 'ObolenskProduction'),
 (sections[2]['items'][5], 'ObolenskProduction'),
 (sections[2]['items'][6], 'PushkinoName'),
 (sections[2]['items'][7], 'SharedGoal'),
 (sections[2]['items'][8], 'Planning'),
 ('2 ЭТАЖ: БИЗНЕС-ПРОЦЕССЫ И ПРОИЗВОДСТВО', 'Floor2Title'),
 (sections[3]['items'][0], 'Portfolio_Innov'),
 (sections[3]['items'][1], 'Portfolio_Pair'),
 (sections[3]['items'][2], 'Portfolio_Pair'),
 (sections[3]['items'][3], 'Portfolio_Fill'),
 (sections[3]['items'][4], 'Portfolio_Lead'),
 (sections[3]['items'][5], 'Portfolio_Sales'),
 (sections[3]['items'][6], 'Portfolio_Export'),
 ('3 ЭТАЖ: ПОРТФЕЛЬ И РЫНКИ', 'Floor3Title'),
 (sections[4]['items'][0], 'Finance'),
 (sections[4]['items'][1], 'Finance'),
 (sections[4]['items'][2], 'Finance'),
 (sections[4]['items'][3], 'Finance'),
 ('ФИНАНСОВЫЕ ПОКАЗАТЕЛИ', 'Floor4Title'),
 (sections[5]['items'][0], 'MissionBand'),
]
node_names = {n['name'] for n in nodes}
audit_by_name = {a['name']: a for a in audit}
missing = []
for txt, obj in TEXT_MAP:
 if obj not in node_names:
  missing.append((txt[:48], obj, 'NODE_MISSING'))
  continue
 a = audit_by_name.get(obj)
 if a and txt not in a.get('text','') and not any(part and part in a.get('text','') for part in txt.split('\n')):
  if obj == 'MissionBand' and sections[5]['items'][0] in a.get('text',''):
   continue
  missing.append((txt[:48], obj, 'TEXT_NOT_IN_PANEL'))
if missing:
 print('TEXT COVERAGE ISSUES:')
 for m in missing:
  print(' ', m)
else:
 print('TEXT COVERAGE OK:', len(TEXT_MAP), 'mappings')
(ROOT/'text-map.json').write_text(json.dumps(
 [{'text': t, 'object': o} for t, o in TEXT_MAP], ensure_ascii=False, indent=2), encoding='utf8')

# Write GLB buffers
binbuf=bytearray();
def add_bytes(data,target=None):
 global binbuf
 while len(binbuf)%4:binbuf.append(0)
 off=len(binbuf);binbuf.extend(data);return off,len(data)
# positions/normals/uvs shared buffers
pos_data=struct.pack('<%sf'% (len(verts)*3),*[v for p in verts for v in p]);norm_data=struct.pack('<%sf'%(len(norms)*3),*[v for p in norms for v in p]);uv_data=struct.pack('<%sf'%(len(uvs)*2),*[v for p in uvs for v in p]);idx_data=struct.pack('<%sI'%len(inds),*inds)
views=[];accessors=[]
def view(data,target=None):
 off,n=add_bytes(data,target);v={'buffer':0,'byteOffset':off,'byteLength':n};
 if target:v['target']=target
 views.append(v);return len(views)-1
pv=view(pos_data,34962);nv=view(norm_data,34962);uvv=view(uv_data,34962);iv=view(idx_data,34963)
views[pv]['byteStride']=12;views[nv]['byteStride']=12;views[uvv]['byteStride']=8
# accessor positions / normals / uv / indices
accessors.append({'bufferView':pv,'componentType':5126,'count':len(verts),'type':'VEC3','min':[min(p[i] for p in verts) for i in range(3)],'max':[max(p[i] for p in verts) for i in range(3)]})
accessors.append({'bufferView':nv,'componentType':5126,'count':len(norms),'type':'VEC3'})
accessors.append({'bufferView':uvv,'componentType':5126,'count':len(uvs),'type':'VEC2'})
accessors.append({'bufferView':iv,'componentType':5125,'count':len(inds),'type':'SCALAR'})
# embedded images and their views
image_defs=[]
for name,raw in tex_images:
 v=view(raw);image_defs.append({'bufferView':v,'mimeType':'image/png','name':name})
# mesh primitive per generated object, all share global accessors but use ranges through accessor clones
mesh_defs=[];gltf_nodes=[]
for m,nidx in zip(meshes,range(len(meshes))):
 # indices range accessor
 start_index=sum(meshes[j]['indices'] for j in range(meshes.index(m))) if False else None
# rebuild exact by deriving index starts from sequential mesh list
cursor=0
for m in meshes:
 count=m['index_count']; ai=len(accessors);accessors.append({'bufferView':iv,'byteOffset':cursor*4,'componentType':5125,'count':count,'type':'SCALAR'})
 # vertex range contiguous, find start from positions list
 first=m['positions'][0]; vc=len(m['positions']); ap=len(accessors);accessors.append({'bufferView':pv,'byteOffset':first*12,'componentType':5126,'count':vc,'type':'VEC3','min':[min(verts[k][i] for k in m['positions']) for i in range(3)],'max':[max(verts[k][i] for k in m['positions']) for i in range(3)]})
 an=len(accessors);accessors.append({'bufferView':nv,'byteOffset':first*12,'componentType':5126,'count':vc,'type':'VEC3'})
 au=len(accessors);accessors.append({'bufferView':uvv,'byteOffset':first*8,'componentType':5126,'count':vc,'type':'VEC2'})
 # Need indices local to object; global indices include start. Build a local copy by subtracting first for this mesh.
 # replace shared global index range with a per-object local index buffer
 local=[]
 for q in inds[cursor:cursor+count]:local.append(q-first)
 ldata=struct.pack('<%sI'%len(local),*local);liv=view(ldata,34963);ali=len(accessors);accessors.append({'bufferView':liv,'componentType':5125,'count':len(local),'type':'SCALAR'})
 mat=m['material'];mesh_defs.append({'name':m['name'],'primitives':[{'attributes':{'POSITION':ap,'NORMAL':an,'TEXCOORD_0':au},'indices':ali,'material':mat}]})
 gltf_nodes.append({'name':m['name'],'mesh':len(mesh_defs)-1,'extras':nodes[len(gltf_nodes)]['extras']})
 cursor+=count
# root + grouped section children
root={'name':'GeropharmHouseFinal','children':list(range(1,len(gltf_nodes)+1)),'extras':{'version':'final-reconstruction','font':FONT_NOTE}}
gltf_nodes=[root]+gltf_nodes
# fix scene children root only
# LINEAR (no mipmaps): text plaques stay sharp and do not shimmer when viewed at grazing angles.
samplers=[{'magFilter':9729,'minFilter':9729,'wrapS':33071,'wrapT':33071}]
textures=[{'source':i,'sampler':0} for i in range(len(image_defs))]
# Remap texture material indices were created with texture list indices but materials have no texture defs yet
for mat in materials:
 if 'pbrMetallicRoughness' in mat and 'baseColorTexture' in mat['pbrMetallicRoughness']:
  # texture index already is tex_images index
  pass
# add images/textures, buffer
G={'asset':{'version':'2.0','generator':'SYNTX final Geropharm reconstruction'},'scene':0,'scenes':[{'nodes':[0]}],'nodes':gltf_nodes,'meshes':mesh_defs,'materials':materials,'textures':textures,'images':image_defs,'samplers':samplers,'accessors':accessors,'bufferViews':views,'buffers':[{'byteLength':len(binbuf)}]}
raw=json.dumps(G,ensure_ascii=False,separators=(',',':')).encode();raw += b' ' *((-len(raw))%4);binary=align(bytes(binbuf));total=12+8+len(raw)+8+len(binary)
glb=b'glTF'+struct.pack('<II',2,total)+struct.pack('<II',len(raw),0x4E4F534A)+raw+struct.pack('<II',len(binary),0x004E4942)+binary
(PUBLIC/'geropharm-house-final.glb').write_bytes(glb);(PUBLIC/'geropharm-house.glb').write_bytes(glb)
(ROOT/'typography-audit.json').write_text(json.dumps(audit,ensure_ascii=False,indent=2),encoding='utf8')
(ROOT/'FONT-NOTE.txt').write_text(FONT_NOTE+'\n\nThe generator accepts VERDANA_FONT=/path/to/licensed/Verdana.ttf.\n',encoding='utf8')
print('created',len(glb),'bytes',len(meshes),'objects',len(tex_images),'textures','font',FONT)
