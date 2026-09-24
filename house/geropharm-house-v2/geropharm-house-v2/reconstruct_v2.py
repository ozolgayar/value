"""Blender 5.x / bpy reconstruction. Run with VERDANA_FONT pointing to a licensed Verdana TTF.
Text is rasterized at fixed world-space sizes; no per-label font autosizing.
Existing public/sections.json is read-only. Coordinates: Blender Z up, front -Y.
"""
import bpy, math, os, json, random
from pathlib import Path
from mathutils import Vector
from PIL import Image, ImageDraw, ImageFont
ROOT=Path(__file__).resolve().parent
TEX=ROOT/'textures'; TEX.mkdir(exist_ok=True)
FONT=Path(os.environ.get('VERDANA_FONT','/home/user/verdana/Verdana.TTF'))
if not FONT.exists(): raise FileNotFoundError('Set VERDANA_FONT to your licensed Verdana.ttf')
BOLD=FONT.with_name('Verdanab.TTF')
if not BOLD.exists():BOLD=FONT
S=json.loads((ROOT/'public/sections.json').read_text(encoding='utf-8'))
BODY=.115; CAPTION=.13; HEADING=.145; PPU=420
bpy.ops.object.select_all(action='SELECT');bpy.ops.object.delete(use_global=False)
for d in list(bpy.data.materials):bpy.data.materials.remove(d)
random.seed(12)
parents={}; mats={}; audit=[]
for sec in [s['id'] for s in S]+['environment']:
 o=bpy.data.objects.new(sec,None);bpy.context.collection.objects.link(o);o['sectionId']=sec;parents[sec]=o

def srgb(v):return v/12.92 if v<=.04045 else ((v+.055)/1.055)**2.4
palette={'cream':'#F1DFC0','peach':'#F8AE79','deck':'#F8C49F','glass':'#30CEAF','teal':'#13977F','green':'#267F64','leaf':'#339E78','metal':'#A3B5BA','base':'#BBCAD1','white':'#F3F1E7','dark':'#223B39','soil':'#625347','carton':'#E3B389','gold':'#E7C061','light':'#FFE4B4'}
def mat(sec,role):
 key=(sec,role)
 if key in mats:return mats[key]
 h=palette[role].lstrip('#');col=tuple(srgb(int(h[i:i+2],16)/255) for i in (0,2,4))
 m=bpy.data.materials.new(sec+'_'+role);m.diffuse_color=(*col,1);m.use_nodes=True
 bs=m.node_tree.nodes.get('Principled BSDF');bs.inputs['Base Color'].default_value=(*col,1);bs.inputs['Roughness'].default_value=.38 if role=='glass' else .65
 bs.inputs['Metallic'].default_value=.25 if role=='metal' else 0
 if role in ['glass','light']:
  bs.inputs['Emission Color'].default_value=(*col,1);bs.inputs['Emission Strength'].default_value=.22 if role=='glass' else .6
 m['sectionId']=sec;m['role']=role;mats[key]=m;return m

def finish(o,name,sec,role,bev=0):
 o.name=name;o.parent=parents[sec];o['sectionId']=sec;o['role']=role;o.data.materials.append(mat(sec,role))
 if bev:
  mod=o.modifiers.new('Soft manufactured edges','BEVEL');mod.width=bev;mod.segments=3
  mod=o.modifiers.new('Weighted corner normals','WEIGHTED_NORMAL');mod.keep_sharp=True
 return o

def box(name,sec,x,y,z,w,d,h,role='cream',bev=.025):
 bpy.ops.mesh.primitive_cube_add(size=1,location=(x,y,z));o=bpy.context.object;o.dimensions=(w,d,h)
 bpy.ops.object.transform_apply(location=False,rotation=False,scale=True)
 return finish(o,name,sec,role,min(bev,w*.12,d*.12,h*.12))

def cyl(name,sec,x,y,z,r,h,role='metal',r2=None,vertices=24):
 bpy.ops.mesh.primitive_cone_add(vertices=vertices,radius1=r,radius2=r if r2 is None else r2,depth=h,location=(x,y,z));o=bpy.context.object
 for f in o.data.polygons:f.use_smooth=True
 return finish(o,name,sec,role,.018)

def rod(name,sec,a,b,r,role='metal'):
 mid=(Vector(a)+Vector(b))*.5;o=cyl(name,sec,*mid,r,(Vector(b)-Vector(a)).length,role,vertices=12)
 o.rotation_euler=(Vector(b)-Vector(a)).to_track_quat('Z','Y').to_euler();return o

def sphere(name,sec,x,y,z,scale,role='leaf',ico=False):
 if ico:bpy.ops.mesh.primitive_ico_sphere_add(subdivisions=1,radius=1,location=(x,y,z))
 else:bpy.ops.mesh.primitive_uv_sphere_add(segments=16,ring_count=8,radius=1,location=(x,y,z))
 o=bpy.context.object;o.scale=scale
 if not ico:
  for f in o.data.polygons:f.use_smooth=True
 return finish(o,name,sec,role)

def wrap(text,font,width):
 d=ImageDraw.Draw(Image.new('RGB',(1,1)));lines=[]
 for para in text.split('\n'):
  row=''
  for word in para.split():
   test=(row+' '+word).strip()
   if d.textlength(test,font=font)>width and row:lines.append(row);row=word
   else:row=test
  lines.append(row)
 return lines

def label(name,sec,text,x,y,z,w,h,size=BODY,bg='#D6F1E8',fg='#243F39',side=False,vertical=False,bold=False,badge=False):
 # Same pixel density and world-space type size on EVERY surface.
 rw,rh=(h,w) if vertical else (w,h)
 W,H=round(rw*PPU),round(rh*PPU);fs=round(size*PPU);pad=round(.065*PPU)
 font=ImageFont.truetype(str(BOLD if bold else FONT),fs)
 img=Image.new('RGB',(W,H),bg);draw=ImageDraw.Draw(img)
 left=pad
 if badge:
  r=round(.105*PPU);left=2*r+pad*2
  draw.ellipse((pad,pad,pad+2*r,pad+2*r),fill='#208D72')
  bf=ImageFont.truetype(str(FONT),round(.085*PPU));draw.text((pad+r,pad+r),'СИ',font=bf,fill='white',anchor='mm')
  if text.startswith('СИ: '):text=text[4:]
 lines=wrap(text,font,W-left-pad);lh=round(fs*1.23)
 if len(lines)*lh>H-2*pad:raise ValueError(f'Text overflow: {name}: {len(lines)*lh}/{H-2*pad}; enlarge panel, not shrink font')
 yy=pad
 for line in lines:
  draw.text((left,yy),line,font=font,fill=fg,stroke_width=0);yy+=lh
 if vertical:img=img.transpose(Image.Transpose.ROTATE_90)
 path=TEX/(name+'.png');img.save(path)
 audit.append({'name':name,'section':sec,'text':text,'font':'Verdana Bold' if bold else 'Verdana','sizeWorld':size,'panel':[w,h],'vertical':vertical,'lines':len(lines)})
 m=bpy.data.materials.new(name+'_ink');m.use_nodes=True;bs=m.node_tree.nodes.get('Principled BSDF');bs.inputs['Roughness'].default_value=.85
 tex=m.node_tree.nodes.new('ShaderNodeTexImage');tex.image=bpy.data.images.load(str(path));m.node_tree.links.new(tex.outputs['Color'],bs.inputs['Base Color'])
 m['role']='text';m['sectionId']=sec
 # a thin backing with soft corners
 if side:box(name+'_back',sec,x-.03,y,z,.045,w,h,'white',.015)
 else:box(name+'_back',sec,x,y+.03,z,w,.045,h,'white',.015)
 if side:vs=[(x,y-w/2,z-h/2),(x,y+w/2,z-h/2),(x,y+w/2,z+h/2),(x,y-w/2,z+h/2)]
 else:vs=[(x-w/2,y,z-h/2),(x+w/2,y,z-h/2),(x+w/2,y,z+h/2),(x-w/2,y,z+h/2)]
 me=bpy.data.meshes.new(name);me.from_pydata(vs,[],[(0,1,2,3)]);me.uv_layers.new()
 for i,uv in enumerate([(0,0),(1,0),(1,1),(0,1)]):me.uv_layers.active.data[i].uv=uv
 o=bpy.data.objects.new(name,me);bpy.context.collection.objects.link(o);o.parent=parents[sec];o['sectionId']=sec;o['role']='text';o.data.materials.append(m)
 return o

def floor_shell(sec,cx,cy,w,d,bottom,height):
 front=cy-d/2;top=bottom+height
 box('Interior floor',sec,cx,cy,bottom+.07,w,d,.14,'deck')
 box('Back wall',sec,cx,cy+d/2-.13,bottom+height/2,w,.22,height)
 box('Left wall',sec,cx-w/2+.13,cy,bottom+height/2,.22,d,height)
 # glass on front and right, framing on outer surfaces
 for i in range(math.ceil(w/.85)):
  ww=w/math.ceil(w/.85);xx=cx-w/2+(i+.5)*ww
  box('Front glazing',sec,xx,front+.25,bottom+height/2,ww-.05,.06,height-.18,'glass',.01)
  box('Front mullion',sec,xx+ww/2,front+.21,bottom+height/2,.045,.085,height-.12,'cream',.006)
 for i in range(math.ceil(d/.85)):
  dd=d/math.ceil(d/.85);yy=cy-d/2+(i+.5)*dd
  box('Side glazing',sec,cx+w/2-.25,yy,bottom+height/2,.06,dd-.05,height-.18,'glass',.01)
  box('Side mullion',sec,cx+w/2-.21,yy+dd/2,bottom+height/2,.085,.045,height-.12,'cream',.006)
 for xx in [cx-w/2+.14,cx+w/2-.14]:
  for yy in [front+.12,cy+d/2-.12]:box('Corner pier',sec,xx,yy,bottom+height/2,.26,.26,height)
 box('Ceiling',sec,cx,cy,top-.06,w,d,.18)
 box('Warm soffit strip',sec,cx,front+.22,top-.16,w-.4,.06,.04,'light',.004)
 return front,top

def terrace(sec,cx,cy,w,d,z,parapet=True):
 box('Peach coping',sec,cx,cy,z,w+.3,d+.3,.17,'peach',.035)
 box('Cream fascia',sec,cx,cy,z-.15,w+.12,d+.12,.17,'cream')
 if parapet:
  for yy in [cy-d/2+.06,cy+d/2-.06]:box('Terrace parapet',sec,cx,yy,z+.2,w,.12,.35,'peach')
  for xx in [cx-w/2+.06,cx+w/2-.06]:box('Terrace return',sec,xx,cy,z+.2,.12,d,.35,'peach')

def topiary(x,y,z):
 box('Terracotta planter','environment',x,y,z+.14,.46,.46,.28,'peach',.045)
 cyl('Planter soil','environment',x,y,z+.285,.17,.025,'soil')
 # teardrop profile built as lathed mesh, not stacked cubes
 radii=[(.01,0),(.17,.12),(.20,.32),(.16,.55),(.08,.79),(.008,1.08)];v=[];f=[];N=16
 for r,h in radii:
  for j in range(N):a=j*math.tau/N;v.append((x+r*math.cos(a),y+r*math.sin(a),z+.29+h))
 for i in range(len(radii)-1):
  for j in range(N):f.append((i*N+j,i*N+(j+1)%N,(i+1)*N+(j+1)%N,(i+1)*N+j))
 me=bpy.data.meshes.new('Cypress');me.from_pydata(v,[],f);o=bpy.data.objects.new('Cypress',me);bpy.context.collection.objects.link(o);finish(o,'Cypress','environment','leaf')
 for p in me.polygons:p.use_smooth=True

# Broad plaza, separate values foundation.
box('Plaza edge','environment',0,0,-.12,19,11.5,.24,'base',.08)
box('Peach paving','environment',0,0,.035,18.92,11.42,.09,'deck',.045)
box('Values foundation','foundation',0,-.1,.49,15.1,7.4,.8,'base',.06)
label('Values_title','foundation','ЦЕННОСТИ\nГЕРОФАРМ',-6.35,-3.815,.52,1.65,.6,size=HEADING,bg='#CDD8DE',bold=True)
for i,item in enumerate(S[0]['items']):
 title,body=item.split(' — ')
 label('Value_'+str(i),'foundation',title.upper()+'\n'+body,-3.4+i*4.25,-3.815,.52,3.7,.55,bg='#CDD8DE')
 # small coloured emblems, not substituted corporate artwork
 sphere('Value emblem','foundation',-5.12+i*4.25,-3.86,.51,(.11,.035,.17),'peach' if i==0 else 'teal',ico=True)

# Ground floor, entrance offset to the left and five readable columns to right.
floor_shell('floor1',0,.0,14.3,6.7,.92,2.25)
terrace('floor1',0,0,14.65,7.0,3.18,False)
for i,txt in enumerate(S[1]['items'][:5]):
 x=-1.1+i*1.76
 box('Column shaft '+str(i+1),'floor1',x,-3.33,2.04,.47,.51,2.12)
 box('Column plinth','floor1',x,-3.33,1.06,.69,.7,.2)
 box('Column capital','floor1',x,-3.33,3.04,.61,.65,.2)
 label('Column_'+str(i+1),'floor1',txt,x,-3.593,2.03,.43,1.79,vertical=True,bg='#F1DFC0')
# Entry door and stairs.
box('Door frame','floor1',-4.18,-3.24,1.87,1.52,.16,1.78)
box('Entry glass','floor1',-4.18,-3.34,1.87,1.27,.07,1.56,'glass')
rod('Door handle','floor1',(-3.77,-3.4,1.62),(-3.77,-3.4,2.12),.018)
for j in range(3):box('Entry step','floor1',-4.18,-4.09+j*.18,.92+j*.1,2.37-j*.14,.65,.15,'base')
box('Portico canopy','floor1',-4.18,-3.75,2.93,2.6,1.25,.2)
box('Portico trim','floor1',-4.18,-3.75,3.07,2.78,1.38,.1,'peach')
for x in [-5.27,-3.1]:box('Entry pier','floor1',x,-4.15,1.97,.31,.31,1.91)
label('Employer','floor1',S[1]['items'][5],7.19,-.1,2.14,5.72,.62,side=True,badge=True)
label('Title_floor1','floor1','1 ЭТАЖ: КОМАНДА И ЛИДЕРСТВО',7.36,-.1,1.12,5.9,.32,HEADING,bg='#13977F',fg='#FFFFFF',side=True,bold=True)

# Production storey with open-front workshop niches.
floor_shell('floor2',0,.1,14.3,6.4,3.36,1.96)
terrace('floor2',0,.1,14.7,6.85,5.36,True)
p=S[2]['items']
label('Production_biotech','floor2',p[0]+'\n\n'+p[1],-5.42,-3.22,4.35,3.1,1.65)
label('Tablets','floor2',p[2],-1.51,-3.24,4.97,4.1,.52)
label('Obolensk_initiatives','floor2',p[5]+'\n\n'+p[6],4.25,-3.23,4.38,5.1,1.49)
label('Pushkino','floor2',p[3].upper(),-3.65,-3.42,3.56,6.75,.3,CAPTION,bg='#D6E5CC')
label('Obolensk','floor2',p[4].upper(),3.55,-3.42,3.56,6.95,.3,CAPTION,bg='#D6E5CC')
label('Shared_goal','floor2',p[7],0,-3.56,3.29,14.1,.29,BODY)
label('Planning','floor2',p[8],7.19,-.1,4.89,5.65,.52,side=True,badge=True)
label('Title_floor2','floor2','2 ЭТАЖ: БИЗНЕС-ПРОЦЕССЫ И ПРОИЗВОДСТВО',7.5,.1,3.51,6.9,.33,HEADING,bg='#13977F',fg='#FFFFFF',side=True,bold=True)
# Conveyors protrude into the open frontage; rollers and goods.
box('Conveyor orange edge','floor2',-1.7,-3.02,3.94,2.95,.9,.18,'peach')
box('Conveyor belt','floor2',-1.7,-3.02,4.06,2.88,.78,.1,'teal')
for i in range(20):
 x=-3.02+i*.139
 rod('Roller','floor2',(x,-3.37,4.13),(x,-2.68,4.13),.025)
for x in [-2.65,-.75]:
 for y in [-3.27,-2.77]:box('Conveyor leg','floor2',x,y,3.69,.08,.08,.42,'metal')
for i in range(5):box('Tablet carton','floor2',-2.77+i*.47,-3.01,4.25,.27,.3,.23,'white')
for x,y,z in [(.38,-3.01,3.86),(.9,-3.01,3.86),(.66,-3.01,4.36)]:
 box('Shipping box','floor2',x,y,z,.46,.48,.47,'carton')
 label('Carton_'+str(z)+'_'+str(x),'floor2','↑',x,y-.248,z,.36,.3,BODY,bg='#E3B389')
# Vertical cylindrical vessels on the visible right facade.
for yy in [-1.5,-.25,1.0]:
 x=7.1
 cyl('Bioreactor tank','floor2',x,yy,4.05,.33,.94,'metal')
 sphere('Dished tank lid','floor2',x,yy,4.53,(.33,.33,.12),'metal')
 cyl('Vessel base','floor2',x,yy,3.48,.36,.12,'peach')
 for dx in [-.2,.2]:rod('Tank leg','floor2',(x+dx,yy,3.48),(x+dx,yy,3.65),.035)
 rod('Vessel neck','floor2',(x,yy,4.58),(x,yy,4.7),.05)
rod('Process pipe','floor2',(7.1,-1.5,4.72),(7.1,1,4.72),.035)

# Portfolio tier: asymmetric terrace, with uniform body type throughout.
floor_shell('floor3',-1.15,.52,9.45,5.45,5.65,1.99)
terrace('floor3',-1.15,.52,9.75,5.74,7.66,True)
texts=[S[3]['items'][0],S[3]['items'][1]+'\n\n'+S[3]['items'][2],*S[3]['items'][3:]]
widths=[1.18,2.08,1.8,1.35,1.58,1.22];left=-5.72
for i,(txt,w) in enumerate(zip(texts,widths)):
 label('Portfolio_'+str(i),'floor3',txt,left+w/2,-2.235,6.72,w-.055,1.69)
 left+=w
label('Title_floor3','floor3','3 ЭТАЖ: ПОРТФЕЛЬ И РЫНКИ',7.52,.1,5.44,6.9,.33,HEADING,bg='#13977F',fg='#FFFFFF',side=True,bold=True)
# Small innovation workbench in the left terrace niche.
box('Innovation desk','floor3',-5.2,-1.95,6.06,.8,.55,.08,'peach')
for x in [-5.5,-4.9]:box('Desk leg','floor3',x,-1.94,5.86,.04,.04,.36,'metal')

# Finance set back from the portfolio cornice.
floor_shell('floor4',-.3,.72,6.65,4.52,7.93,1.75)
terrace('floor4',-.3,.72,6.88,4.76,9.68,False)
label('Finance','floor4','\n'.join(S[4]['items']),.6,-1.58,8.75,4.1,1.33)
label('Title_floor4','floor4','ФИНАНСОВЫЕ ПОКАЗАТЕЛИ',3.25,.72,7.85,4.3,.32,HEADING,bg='#13977F',fg='#FFFFFF',side=True,bold=True)
label('Mission','mission','МИССИЯ КОМПАНИИ: '+S[5]['items'][0],-.3,-1.78,9.67,6.74,.43,BODY,bg='#13977F',fg='#FFFFFF')
# Separate raised letters; font gets converted to geometry before export.
font3d=bpy.data.fonts.load(str(FONT))
def lettering(name,text,sec,x,y,z,size,role='dark'):
 cu=bpy.data.curves.new(name,'FONT');cu.body=text;cu.font=font3d;cu.size=size;cu.extrude=.028;cu.bevel_depth=.006;cu.bevel_resolution=2
 o=bpy.data.objects.new(name,cu);bpy.context.collection.objects.link(o);o.location=(x,y,z);o.rotation_euler=(math.pi/2,0,0);o.parent=parents[sec];o['sectionId']=sec;o['role']=role;cu.materials.append(mat(sec,role));return o
lettering('Roof wordmark','ГЕРОФАРМ','mission',-1.85,-.2,10.13,.72)
for xx in [-1.7,2.65]:
 rod('Sign upright','mission',(xx,-.18,9.78),(xx,-.18,10.18),.026)
 rod('Sign brace','mission',(xx,.38,9.78),(xx,-.18,10.2),.025)
for xx,role in [(-3.15,'teal'),(-2.49,'peach')]:
 o=cyl('Logo roundel','mission',xx,-.18,10.47,.46,.095,role);o.rotation_euler.x=math.pi/2
lettering('Logo g','g','mission',-3.43,-.245,10.23,.69,'white')
lettering('Logo Ph','Ph','mission',-2.82,-.247,10.25,.53,'white')

# Site furniture: conical topiary, organic low-poly hedge, curved lamps.
for x in [-6.38,-5.62,-2.43,-1.74,.13,1.89,3.65,5.41]:topiary(x,-3.43,.92)
box('Long landscape trough','environment',8.0,.25,.23,.68,6.35,.26,'peach',.07)
box('Trough soil','environment',8,.25,.38,.5,6.1,.035,'soil')
for i in range(20):sphere('Hedge shrub','environment',8+random.uniform(-.1,.1),-2.7+i*.31,.61,(.3,.32,.29),'leaf' if i%3 else 'green',ico=True)
for x,y in [(-7.6,-4.65),(3.7,-4.83)]:
 for dy in [-.11,.11]:box('Bench slat','environment',x,y+dy,.51,1.3,.16,.09,'teal')
 for dx in [-.46,.46]:box('Bench support','environment',x+dx,y,.31,.1,.32,.4,'cream')
for x,y in [(-8.5,-4.7),(6.2,-4.75),(8.6,3.8)]:
 pts=[(x,y,.1),(x,y,1.75),(x+.12,y,2.38),(x+.35,y,2.77)]
 for a,b in zip(pts,pts[1:]):rod('Bent streetlight','environment',a,b,.036)
 o=box('Lamp shade','environment',x+.44,y,2.83,.48,.19,.075,'metal');o.rotation_euler.y=-.35
 box('Lamp diffuser','environment',x+.43,y,2.785,.34,.14,.018,'light')

# Apply bevels, convert brand lettering, merge by section and material.
bpy.ops.object.select_all(action='DESELECT')
for o in list(bpy.context.scene.objects):
 if o.type in {'MESH','FONT'}:o.select_set(True)
bpy.context.view_layer.objects.active=next(o for o in bpy.context.selected_objects if o.type=='MESH')
bpy.ops.object.convert(target='MESH')
groups={}
for o in list(bpy.context.scene.objects):
 if o.type=='MESH':groups.setdefault((o.get('sectionId'),o.data.materials[0].name),[]).append(o)
for (sec,mname),objects in groups.items():
 bpy.ops.object.select_all(action='DESELECT')
 for o in objects:o.select_set(True)
 bpy.context.view_layer.objects.active=objects[0]
 if len(objects)>1:bpy.ops.object.join()
 o=bpy.context.object;o.name=sec+'__'+mname;o.parent=parents[sec];o['sectionId']=sec
for img in bpy.data.images:
 if img.source=='FILE':img.pack()
for f in list(bpy.data.fonts):
 if f.users==0:bpy.data.fonts.remove(f)
(ROOT/'typography-audit.json').write_text(json.dumps(audit,ensure_ascii=False,indent=2),encoding='utf-8')
bpy.ops.export_scene.gltf(filepath=str(ROOT/'public/geropharm-house.glb'),export_format='GLB',export_extras=True,export_cameras=False,export_lights=False,export_yup=True)

# Studio render for geometry review, not a substitute for browser screenshot.
scene=bpy.context.scene
scene.render.engine='CYCLES';scene.cycles.samples=32;scene.cycles.use_denoising=True
scene.render.resolution_x=1500;scene.render.resolution_y=1100;scene.render.resolution_percentage=100
scene.world.use_nodes=True;scene.world.node_tree.nodes['Background'].inputs[0].default_value=(.78,.85,.87,1);scene.world.node_tree.nodes['Background'].inputs[1].default_value=.65
scene.view_settings.view_transform='AgX';scene.view_settings.look='AgX - Medium High Contrast';scene.view_settings.exposure=.3
box('Studio ground','environment',0,0,-.3,200,200,.05,'white',0)
def area(name,loc,power,size,col):
 data=bpy.data.lights.new(name,'AREA');data.energy=power;data.shape='DISK';data.size=size;data.color=col
 o=bpy.data.objects.new(name,data);bpy.context.collection.objects.link(o);o.location=loc;o.rotation_euler=(Vector((0,0,4))-o.location).to_track_quat('-Z','Y').to_euler()
area('Large warm key',(-7,-10,18),2300,10,(1,.89,.76))
area('Cool broad fill',(10,-3,12),1800,9,(.83,.94,1))
area('Rim',(0,8,16),1700,8,(1,.94,.84))
bpy.ops.object.camera_add(location=(17,-29,17));cam=bpy.context.object;cam.name='Reference angle';cam.rotation_euler=(Vector((0,0,4.7))-cam.location).to_track_quat('-Z','Y').to_euler();cam.data.type='ORTHO';cam.data.ortho_scale=23.4;scene.camera=cam
bpy.ops.wm.save_as_mainfile(filepath=str(ROOT/'house-v2.blend'))
scene.render.filepath=str(ROOT/'studio-preview.png')
if os.environ.get('SKIP_RENDER')!='1':bpy.ops.render.render(write_still=True)
print('RECONSTRUCTION COMPLETE',flush=True)
