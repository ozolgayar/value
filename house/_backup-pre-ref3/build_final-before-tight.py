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
 'cream':'#F7E7C8','cream2':'#E8D7B8','peach':'#F3B07A','deck':'#F6C49A',
 'glass':'#2AD4B8','teal':'#0FAF93','green':'#229D62','leaf':'#2BB673',
 'base':'#C9D5DC','white':'#F7F4EC','dark':'#2A3432','metal':'#B7C4C7',
 'soil':'#6F5547','gold':'#E8BF63','orange':'#F58257','carton':'#E3B389',
 'niche_light':'#A8E6D6'
}

def add_mat(name,color,texture=None,emissive=False):
 key=(name,texture,emissive)
 if key in mat_cache:return mat_cache[key]
 metallic=0.0
 rough=.78
 if color=='glass':
  metallic=.05; rough=.28
 elif color=='metal':
  metallic=.0; rough=.78
 elif color in ('cream','cream2','peach','base','deck'):
  metallic=.0; rough=.78
 m={'name':name,'pbrMetallicRoughness':{'baseColorFactor':rgba(color_value(color)),'metallicFactor':metallic,'roughnessFactor':rough}}
 if texture is not None:
  ti=add_texture(texture);m['pbrMetallicRoughness']['baseColorTexture']={'index':ti};m['pbrMetallicRoughness']['baseColorFactor']=[1,1,1,1]
  if name.startswith('Logo'):
   m['alphaMode']='BLEND';m['doubleSided']=True
 mild_emissive=(color in ('glass','gold','niche_light')) or emissive
 if mild_emissive:
  e=rgba(color_value(color))[:3]
  m['emissiveFactor']=[round(c*.22,3) for c in e]
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

def image_label(name,section,text,x,y,z,w,h,size=20,bg='#D7F0E6',fg='#173D38',bold=False,vertical=False,badge=False,icon=None,side=False):
 # Use moderate proportional pixel density; fit text to panel with consistent margins.
 ppu=380
 rw,rh=(h,w) if vertical else (w,h)
 W=max(220,round(rw*ppu));H=max(120,round(rh*ppu))
 img=Image.new('RGB',(W,H),bg);d=ImageDraw.Draw(img)
 fp=str(BOLD if bold else FONT)
 pad=max(10,int(min(W,H)*.07));left=pad
 if icon:
  # paste a transparent icon to the left; icon is already square
  # Do not reuse name `side` — it is the face-orientation flag below.
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
 best=(wrap(ImageFont.truetype(fp,8)),ImageFont.truetype(fp,8),12,8)
 while lo<=hi:
  mid=(lo+hi)//2
  ok,lines,font,lh=fits(mid)
  if ok:
   best=(lines,font,lh,mid);lo=mid+1
  else:
   hi=mid-1
 lines,font,lh,size=best
 total=lh*len(lines)
 yy=top_pad+max(0,(maxh-total)//2)
 for line in lines:
  d.text((left,yy),line,font=font,fill=fg);yy+=lh
 if vertical:img=img.rotate(90,expand=True)
 buf=io.BytesIO();img.save(buf,'PNG',optimize=False);raw=buf.getvalue();TEX.mkdir(exist_ok=True);(TEX/(name+'.png')).write_bytes(raw)
 audit.append({'name':name,'section':section,'text':text,'font':FONT.name,'fontSizePx':size,'worldSize':[w,h],'vertical':vertical})
 # Face-mounted signage outside the projecting slab; vertical text stays on columns.
 if not side and not vertical:
  y=min(y, {'foundation':-4.94,'floor2':-3.66,'floor3':-2.49,'floor4':-1.9}.get(section,y))
 # plane facing -Y/front
 p=[(x-w/2,y,z-h/2),(x+w/2,y,z-h/2),(x+w/2,y,z+h/2),(x-w/2,y,z+h/2)]
 if side:p=[(x,y-w/2,z-h/2),(x,y+w/2,z-h/2),(x,y+w/2,z+h/2),(x,y-w/2,z+h/2)]
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
# value boards, same front plane and equal typography
vals=[('Страсть\nМы увлечены работой',-4.0,TEX/'icon_passion.png'),('Амбициозность\nМы устремлены в будущее',0,TEX/'icon_ambition.png'),('Ответственность\nМы отвечаем за результат',4.0,TEX/'icon_responsibility.png')]
for i,(txt,x,ic) in enumerate(vals):image_label('Value_'+str(i),'foundation',txt,x,-3.9,.62,3.55,.72,20,bg='#DCE2E3',icon=ic)
image_label('Values_title','foundation','ЦЕННОСТИ\nГЕРОФАРМ',-6.45,-3.9,.62,1.45,.72,19,bg='#DCE2E3',bold=True)

# Main floor shell helper, visible teal glazing and cream columns
def floor(sec,cx,cy,w,d,z,h,front_labels=True,show_windows=True):
 box(sec+'_body',sec,cx,cy,z,w,d,h,'cream',.06);box(sec+'_slab',sec,cx,cy,z+h/2+.1,w+.6,d+.6,.25,'peach',.04)
 # front windows / panels
 if show_windows:
  n=max(3,int(w/1.15))
  for i in range(n):
   xx=cx-w/2+(i+.5)*w/n;box(sec+'_window',sec,xx,cy-d/2-.03,z,.85,.08,h-.35,'glass',.015)
 for xx in [cx-w/2+.15,cx+w/2-.15]:box(sec+'_pier',sec,xx,cy-d/2-.08,z,.25,.3,h,'cream')
# floor 1 and porch
a=floor('floor1',0,0,14.2,6.7,2.08,2.25)
# five genuine columns and readable vertical labels
for i,txt in enumerate(sections[1]['items'][:5]):
 x=-1.0+i*1.75;box('Column_'+str(i+1),'floor1',x,-3.45,2.0,.62,.58,2.15,'cream',.04);box('Column_cap','floor1',x,-3.45,3.12,.78,.74,.18,'peach');box('Column_base','floor1',x,-3.45,.92,.78,.74,.18,'cream')
 image_label('ColumnText_'+str(i+1),'floor1',txt,x,-3.76,2.03,.46,1.75,17,bg='#F2DDB9',vertical=True)
# closer reference porch: canopy, framed doorway and three broad steps
box('Porch canopy','floor1',-4.25,-3.62,3.1,2.85,1.25,.22,'cream',.05);box('Porch orange rim','floor1',-4.25,-4.25,3.18,3.05,.2,.18,'peach',.03)
box('Door surround','floor1',-4.25,-3.65,1.9,1.75,.23,1.95,'cream',.04);box('Door glass','floor1',-4.25,-3.8,1.9,1.3,.07,1.55,'glass',.01)
for j in range(3):box('Porch step','floor1',-4.25,-4.12-j*.24,.72+j*.11,2.55-j*.16,.72,.16,'base',.025)
image_label('Employer', 'floor1', sections[1]['items'][5], 7.115, 0, 2.12, 5.9, 0.85, 18, bg='#D7F0E6', badge=True, side=True)
image_label('Floor1Title', 'floor1', '1 ЭТАЖ: КОМАНДА И ЛИДЕРСТВО', 7.78, 0, 1.22, 6.1, 0.26, 15, bg='#118F76', fg='#FFFFFF', bold=True, side=True)

# floor 2 / production
floor('floor2',0,.1,14.5,6.55,4.37,1.9,show_windows=False)
# open niches reveal production modules from front-right angle
for nx,nw in [(-1.35,4.2),(4.35,3.9)]:
 box('Floor2NicheBack','floor2',nx,-2.63,4.36,nw,.22,1.33,'white',.02)
 box('Floor2NicheTop','floor2',nx,-3.26,5.33,nw,.42,.2,'peach',.02)
 box('Floor2NicheSill','floor2',nx,-3.26,3.43,nw,.42,.18,'deck',.02)
 box('Floor2NicheJambL','floor2',nx-nw/2+0.11,-3.2,4.36,.22,.52,1.34,'cream',.02)
 box('Floor2NicheJambR','floor2',nx+nw/2-0.11,-3.2,4.36,.22,.52,1.34,'cream',.02)
 box('Floor2NicheLight','floor2',nx,-2.75,5.18,nw-.35,.12,.08,'niche_light',.01)
# left / middle / right large readable panels
p=sections[2]['items']
image_label('ProductionLeft','floor2',p[0]+'\n\n'+p[1],-5.0,-3.45,4.75,3.5,1.45,17,bg='#D7F0E6',badge=True)
image_label('TabletProduction','floor2',p[2],-1.25,-3.45,4.78,3.8,.8,17,bg='#D7F0E6',badge=True)
image_label('ObolenskProduction','floor2',p[4]+'\n\n'+p[5],3.85,-3.45,4.77,5.25,1.35,16,bg='#D7F0E6',badge=True)
image_label('PushkinoName','floor2',p[6],-3.9,-3.86,3.68,5.7,.27,14,bg='#DCE8D6',bold=True)
image_label('ObolenskName','floor2',p[3],3.8,-3.86,3.68,5.7,.27,14,bg='#DCE8D6',bold=True)
image_label('SharedGoal','floor2',p[7],0,-3.86,3.4,12.6,.3,14,bg='#DCE8D6')
image_label('Planning', 'floor2', p[8], 7.565, 0.1, 4.7, 5.8, 0.55, 15, bg='#D7F0E6', badge=True, side=True)
image_label('Floor2Title', 'floor2', '2 ЭТАЖ: БИЗНЕС-ПРОЦЕССЫ И ПРОИЗВОДСТВО', 7.265, 0.1, 3.62, 6.1, 0.27, 14, bg='#118F76', fg='#FFFFFF', bold=True, side=True)
# production conveyor and cartons, moved forward so they remain visible
box('ConveyorBody','floor2',-1.45,-3.32,4.02,3.65,.86,.2,'orange')
box('ConveyorBelt','floor2',-1.45,-3.36,4.14,3.45,.64,.08,'teal')
for i in range(2):
 box('ConveyorRailL','floor2',-1.45,-3.67+i*0.62,4.22,3.35,.05,.14,'metal')
for i in range(2):
 box('ConveyorSupport','floor2',-2.9+i*2.9,-3.32,3.78,.14,.58,.48,'metal')
for i in range(10):
 box('ConveyorPack','floor2',-2.75+i*.31,-3.37,4.31,.2,.22,.16,'white')
for x in [0.42,0.9,1.36,1.82]:
 box('CartonStack','floor2',x,-3.28,4.26,.42,.42,.44,'carton')
# tanks + stands + pipes in right niche
for i,y in enumerate([-3.26,-2.65]):
 cylinder('TankMain','floor2',4.35+i*1.1,y,4.72,.36,.98,'metal')
 box('TankStand','floor2',4.35+i*1.1,y,3.98,.52,.52,.09,'metal')
 rod('TankPipe','floor2',(4.35+i*1.1,y,5.2),(5.0,y,5.38),.04,'metal')

# floor 3 / portfolio
floor('floor3',-.8,.5,10.1,5.3,6.52,1.85)
p3=sections[3]['items'];texts=[p3[0],p3[1]+'\n\n'+p3[2],p3[3],p3[4],p3[5],p3[6]]
xs=[-4.65,-2.9,-.8,.85,2.4,4.1];ws=[1.5,2.0,1.7,1.4,1.55,1.3]
for i,(txt,x,w) in enumerate(zip(texts,xs,ws)):image_label('Portfolio_'+str(i),'floor3',txt,x,-2.25,6.75,w,1.45,15,bg='#D7F0E6',badge=True)
image_label('Floor3Title', 'floor3', '3 ЭТАЖ: ПОРТФЕЛЬ И РЫНКИ', 7.565, 0.1, 5.49, 6.3, 0.27, 14, bg='#118F76', fg='#FFFFFF', bold=True, side=True)

# floor 4 / financials and mission band
floor('floor4',.1,.65,6.9,4.4,8.62,1.55)
image_label('Finance','floor4','\n'.join(sections[4]['items']),.3,-1.65,9.05,4.9,1.15,19,bg='#D7F0E6')
image_label('Floor4Title', 'floor4', 'ФИНАНСОВЫЕ ПОКАЗАТЕЛИ', 3.565, 0.65, 8.0, 4.0, 0.28, 14, bg='#118F76', fg='#FFFFFF', bold=True, side=True)
image_label('MissionBand','mission','МИССИЯ КОМПАНИИ:  Создаем инновации для увеличения продолжительности жизни в России и мире',.1,-2.38,10.14,7.9,.48,16,bg='#118F76',fg='#FFFFFF',bold=True)

# roof and separated logo circles
box('Roof','mission',.1,.65,10.45,7.5,4.65,.24,'peach',.05)
# circles face forward; actual letters are separate panels
cylinder('Logo green circle','mission',-2.7,-1.78,10.83,.48,.13,'teal',32,front=True);cylinder('Logo gold circle','mission',-1.75,-1.78,10.83,.48,.13,'gold',32,front=True)
roundel_label('LogoG','mission','g',-2.7,-1.89,10.83,.78,'#118F76',size=125)
roundel_label('LogoPh','mission','Ph',-1.75,-1.89,10.83,.78,'#E8BF63',size=85)
# 3D letter blocks instead of one flat beige panel
word='ГЕРОФАРМ'
glyph_w={'Г':.35,'Е':.34,'Р':.35,'О':.37,'Ф':.44,'А':.35,'М':.42}
cursor_x=-1.02
for i,ch in enumerate(word):
 w=glyph_w.get(ch,.34)
 cx=cursor_x+w/2
 box('WordmarkSupport','mission',cx,-1.9,10.7,w*0.95,.24,.08,'cream')
 box('WordmarkLetter','mission',cx,-1.96,10.84,w,.12,.34,'dark')
 cursor_x+=w+.08
# light logo support frames
for x in [-2.7,-1.75,.0,2.2]:rod('Roof sign support','mission',(x,-1.8,10.58),(x,-1.8,11.13),.025,'metal')
# site topiary, benches, lights
def teardrop_bush(name,x,y,z,h=.98):
 cylinder(name+'_low','environment',x,y,z+h*.28,.25,h*.45,'leaf',18)
 cylinder(name+'_mid','environment',x,y,z+h*.63,.19,h*.34,'leaf',18)
 cylinder(name+'_top','environment',x,y,z+h*.87,.11,h*.24,'leaf',16)
for x in [-5.2,-3.1]:
 box('EntryPot','environment',x,-4.1,.72,.62,.62,.46,'peach',.03)
 teardrop_bush('EntryPlant',x,-4.1,.9,1.12)
# right side long planter + clustered rounded bushes
box('PlanterBed','environment',5.4,-3.55,.72,3.9,.82,.44,'peach',.03)
for bx in [4.2,5.0,5.8,6.6]:
 cylinder('PlantBedBush','environment',bx,-3.55,1.1,.24,.48,'leaf',18)
for x in [-5.8,-4.2,-2.9]:
 box('Bench','environment',x,-4.82,.45,1.1,.16,.12,'teal')
for x in [-8.2,-1.2,6.8]:
 lamp_curve('LampCurve','environment',(x,-4.22,.25),1.92,.86,.035)

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
samplers=[{'magFilter':9729,'minFilter':9987,'wrapS':33071,'wrapT':33071}]
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
