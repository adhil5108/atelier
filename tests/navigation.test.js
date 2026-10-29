import test from 'node:test'
import assert from 'node:assert/strict'
import { accessSync } from 'node:fs'
import { Raycaster, Vector3 } from 'three'
import { BUILDING_CONTEXT, BUILDING_PLAN_REFERENCE, CANVA_PLAN_REFERENCE, COLUMN_SIZE, ENTRANCE, ENTRANCE_VIEW, EYE_HEIGHT, FOOTPRINT, MAKEUP_ENTRANCE, PERIMETER_WALLS, PLAN_REFERENCE, SPACES, STRUCTURAL_COLUMNS, WALLS, containsPoint, insideFootprint, isFree, moveWithCollision, findPath, spaceAt } from '../src/layout.js'
import { CANVA_PLACEMENTS, WALL_FACES, REFERENCE_PLACEMENT_OVERRIDES, MAIN_WALL_SIZE, REFERENCE_IMAGES, REFERENCE_SURFACES, canvaWorldAnchor, canvaWorldPoint } from '../src/references.js'
import { createStudio } from '../src/scene.js'
import { FURNISHINGS, furnitureBounds } from '../src/furnishingsData.js'

// Build the actual architectural scene and colliders without a GPU.
const context = new Proxy({}, {get: (_, key) => () => {},set: () => true})
globalThis.document = {createElement:()=>({width:512,height:512,getContext:()=>context})}
const studio = createStudio({capabilities:{getMaxAnisotropy:()=>8}}, {environment:false,loadImages:false})

test('every room shortcut starts in unoccupied, walkable space',()=>{
  for(const room of SPACES){
    assert.ok(isFree(...room.position,studio.colliders,.25),`${room.name} is blocked`)
    assert.equal(spaceAt(...room.position),room.id,`${room.name} shortcut must keep its own room label`)
  }
})

test('both plans and every supplied interior photo are present and used by the 3D scene',()=>{
  accessSync(new URL(`../public${BUILDING_PLAN_REFERENCE}`,import.meta.url))
  assert.equal(REFERENCE_IMAGES.length,12)
  for(const image of REFERENCE_IMAGES){
    accessSync(new URL(`../public${image.url}`,import.meta.url))
    const surface=studio.scene.getObjectByName(`reference-${image.id}`)
    assert.ok(surface,`${image.url} has no 3D surface`)
    assert.equal(surface.material.map.name,image.url,'Surface must use the original photo')
    assert.equal(surface.material.toneMapped,false,'Baked photo lighting should not be tone-mapped again')
    assert.ok(surface.userData.reliefDepth<.5,'Relief must not become an oversized obstacle')
  }
  assert.equal(REFERENCE_SURFACES.length,12)
})

test('entrance camera looks down the clear entry gallery past the inner makeup recess',()=>{
  const start=new Vector3(ENTRANCE_VIEW.position[0],EYE_HEIGHT,ENTRANCE_VIEW.position[1])
  const target=new Vector3(...ENTRANCE_VIEW.target), delta=target.clone().sub(start)
  const ray=new Raycaster(start,delta.clone().normalize(),.01,delta.length())
  studio.scene.updateMatrixWorld(true)
  const hits=ray.intersectObjects(studio.scene.children,true)
  assert.equal(hits.length,0,'The entrance view should not face the back of the makeup recess')
  for(let t=0;t<=1;t+=.05){
    const p=start.clone().addScaledVector(delta,t)
    assert.ok(isFree(p.x,p.z,studio.colliders,.25),'Entry gallery is blocked')
  }
  const studioSurface=REFERENCE_SURFACES.find(s=>s.image==='studio')
  const studioDistance=Math.hypot(SPACES[1].position[0]-studioSurface.x,SPACES[1].position[1]-studioSurface.z)
  assert.ok(studioDistance>2.5,'Studio camera needs space in front of its backdrop')
})

test('every tour camera faces its assigned reference with no intervening wall or prop',()=>{
  studio.scene.updateMatrixWorld(true)
  for(const room of SPACES){
    const start=new Vector3(room.position[0],EYE_HEIGHT,room.position[1]), target=new Vector3(...room.target)
    const delta=target.sub(start),ray=new Raycaster(start,delta.clone().normalize(),.01,delta.length()+1)
    const hit=ray.intersectObjects(studio.scene.children,true)[0]
    assert.equal(hit?.object.name,`reference-${room.id}`,`${room.name} is obstructed or aimed at the wrong backdrop`)
  }
})

test('authoritative plan is available and the two lower-right exclusions are outside Room 1',()=>{
  accessSync(new URL(`../public${PLAN_REFERENCE}`,import.meta.url))
  // Samples distinguish both steps from the previous full rectangular floor.
  for(const [x,z] of [[5,-3],[2,1],[0,4],[-5,4]])assert.ok(insideFootprint(x,z),`Expected interior at ${x}, ${z}`)
  for(const [x,z] of [[4,1],[2,4],[5,5]]){
    assert.equal(insideFootprint(x,z),false,`Room 2 must be excluded at ${x}, ${z}`)
    assert.equal(isFree(x,z,[],0),false,'Removing walls must not make the excluded floor navigable')
  }
})

test('floor and ceiling are actual stepped meshes, with no surface spanning Room 2',()=>{
  const ray=new Raycaster(new Vector3(),new Vector3(0,-1,0))
  for(const name of ['studio-floor','studio-ceiling']){
    const slab=studio.scene.getObjectByName(name)
    assert.ok(slab,`${name} mesh was not created`)
    for(const [x,z,inside] of [[5,-3,true],[2,1,true],[0,4,true],[4,1,false],[2,4,false],[5,5,false]]){
      ray.set(new Vector3(x,10,z),new Vector3(0,-1,0))
      assert.equal(ray.intersectObject(slab).length>0,inside,`${name} contour mismatch at ${x}, ${z}`)
    }
  }
})

test('both step faces stop manual movement, including large frame displacements',()=>{
  const a=moveWithCollision({x:2,z:.8},5,0,WALLS)
  assert.ok(a.x<2.83&&a.x>2.6,'The middle vertical step must stop rightward walking')
  const b=moveWithCollision({x:2,z:.8},0,5,WALLS)
  assert.ok(b.z<1.48&&b.z>1.2,'The lower horizontal step must stop forward walking')
  const c=moveWithCollision({x:5,z:-.6},0,5,WALLS)
  assert.ok(c.z<-.22,'The upper horizontal step must stop walking into Room 2')
  for(const p of [a,b,c])assert.ok(isFree(p.x,p.z,WALLS))
})

test('reception connects to studio and makeup through generous open circulation',()=>{
  const [reception,photo,makeup]=SPACES
  const route=room=>findPath({x:reception.position[0],z:reception.position[1]},{x:room.position[0],z:room.position[1]},studio.colliders)
  assert.equal(WALLS.length,PERIMETER_WALLS.length,'Unreferenced internal partitions must not be reintroduced')
  for(const room of [photo,makeup]){
    const path=route(room);assert.ok(path.length,`No route to ${room.name}`)
    for(const p of path)assert.ok(isFree(p.x,p.z,studio.colliders,.5),'The entry connections should have generous clearance')
  }
})

test('photographs retain complete UV coverage and their native developed aspect ratios',()=>{
  for(const image of REFERENCE_IMAGES){
    const panel=studio.scene.getObjectByName(`reference-${image.id}`), {panelWidth,panelHeight}=panel.userData
    assert.ok(Math.abs(panelWidth/panelHeight-image.width/image.height)<1e-8,'Photo aspect ratio changed')
    const uv=panel.geometry.attributes.uv,p=panel.geometry.attributes.position
    let minU=1,maxU=0,minV=1,maxV=0
    for(let i=0;i<uv.count;i++){
      minU=Math.min(minU,uv.getX(i));maxU=Math.max(maxU,uv.getX(i));minV=Math.min(minV,uv.getY(i));maxV=Math.max(maxV,uv.getY(i))
      if(!panel.userData.cornerFraction)assert.equal(p.getZ(i),0,'An unrelated reference photo was warped')
    }
    assert.deepEqual([minU,maxU,minV,maxV],[0,1,0,1],'Reference photo was cropped')
    assert.ok(panelHeight>2.1&&panelWidth>2,'Reference should be a large display, not a tiny picture')
  }
})

test('photo assignments follow the collage except the confirmed swing relocation',()=>{
  accessSync(new URL(`../public${CANVA_PLAN_REFERENCE}`,import.meta.url))
  assert.equal(Object.keys(CANVA_PLACEMENTS).length,12)
  for(const surface of REFERENCE_SURFACES){
    if(REFERENCE_PLACEMENT_OVERRIDES[surface.image]){
      assert.equal(surface.image,'daylight')
      assert.equal(surface.x,WALL_FACES.west)
      assert.ok(surface.z>2.1&&surface.z<5,'Confirmed swing wall must stay beside sofa')
      continue
    }
    const [x,z]=canvaWorldAnchor(surface.image)
    assert.ok(Math.hypot(surface.x-x,surface.z-z)<2.2,`${surface.image} has moved away from its Canva zone`)
  }
  const byId=id=>REFERENCE_SURFACES.find(s=>s.image===id)
  assert.ok(byId('reception').x<byId('studio').x&&byId('studio').x<byId('makeup').x,'Front zones must keep their Canva order')
  assert.ok(byId('rattan').x<byId('velvet').x&&byId('velvet').x<byId('terracotta').x&&byId('terracotta').x<byId('boho').x,'Back-wall zones must keep their Canva order')
})

test('the replacement modified plan registers its step corners without stretching its cropped edges',()=>{
  assert.equal(CANVA_PLAN_REFERENCE,'/references/canva placement.png')
  for(const [pixel,world] of [[[300,127],[3.2,.15]],[[384,206],[1.6,1.85]]]){
    const mapped=canvaWorldPoint(...pixel)
    assert.ok(Math.hypot(mapped[0]-world[0],mapped[1]-world[1])<.08,'Modified-plan step is registered incorrectly')
  }
  for(const point of Object.values(CANVA_PLACEMENTS))assert.ok(point.every(v=>v>=0&&v<582),'Old export coordinates remain')
})

test('Room 2, verandah, stairs and toilet block remain represented as building context',()=>{
  assert.equal(BUILDING_CONTEXT.verandahWidth,1.2)
  assert.equal(BUILDING_CONTEXT.parapetHeight,1.2)
  assert.equal(studio.scene.userData.buildingContext.toilets.length,3)
  const ray=new Raycaster(new Vector3(4,10,4),new Vector3(0,-1,0))
  assert.ok(ray.intersectObject(studio.scene.getObjectByName('context-room2-floor')).length)
  ray.set(new Vector3(-7.2,10,0),new Vector3(0,-1,0))
  assert.ok(ray.intersectObject(studio.scene.getObjectByName('context-circulation')).length)
  assert.ok(studio.scene.getObjectByName('context-stairs').geometry.attributes.position.count>100)
})

test('the full guided tour can reach every room around actual walls, bays and columns',()=>{
  for(let i=0;i<SPACES.length-1;i++) {
    const a=SPACES[i],b=SPACES[i+1]
    const path=findPath({x:a.position[0],z:a.position[1]},{x:b.position[0],z:b.position[1]},studio.colliders)
    assert.ok(path.length,`No route from ${a.name} to ${b.name}`)
    for(const p of path)assert.ok(isFree(p.x,p.z,studio.colliders,.25),'Route intersects a collider')
    let simulated={x:a.position[0],z:a.position[1]}
    for(const point of path){simulated=moveWithCollision(simulated,point.x-simulated.x,point.z-simulated.z,studio.colliders);assert.ok(Math.hypot(simulated.x-point.x,simulated.z-point.z)<.035,'Walk simulation could not follow the path')}
  }
})

test('complete photos fit their bays without obstruction and bays meet the finished ceiling',()=>{
  studio.scene.updateMatrixWorld(true)
  const cast=(surface,u,y)=>{
    if(surface.cornerFraction){
      const sign=surface.cornerSide==='right'?-1:1
      const t=sign===1?(u+surface.photoWidth/2)/surface.photoWidth:1-(u+surface.photoWidth/2)/surface.photoWidth,f=surface.cornerFraction
      const lx=sign*(-surface.width/2+Math.max(0,t-f)*surface.photoWidth),lz=Math.max(0,f-t)*surface.photoWidth
      const n=t<f?new Vector3(sign*Math.cos(surface.yaw),0,-sign*Math.sin(surface.yaw)):new Vector3(Math.sin(surface.yaw),0,Math.cos(surface.yaw))
      const p=new Vector3(surface.x+Math.cos(surface.yaw)*lx+Math.sin(surface.yaw)*lz,y,surface.z-Math.sin(surface.yaw)*lx+Math.cos(surface.yaw)*lz)
      return new Raycaster(p.addScaledVector(n,.4),n.negate(),.001,.6).intersectObjects(studio.scene.children,true)[0]
    }
    const n=new Vector3(Math.sin(surface.yaw),0,Math.cos(surface.yaw))
    const point=new Vector3(surface.x+Math.cos(surface.yaw)*u,y,surface.z-Math.sin(surface.yaw)*u)
    return new Raycaster(point.addScaledVector(n,.4),n.negate(),.001,.6).intersectObjects(studio.scene.children,true)[0]
  }
  for(const surface of REFERENCE_SURFACES){
    const photo=studio.scene.getObjectByName(`reference-${surface.image}`), h=photo.userData.panelHeight
    // Every corner is visible head-on: no frame, column or ceiling trims overlap
    // the original image. Oblique views still have normal architectural occlusion.
    for(const u of [-surface.photoWidth/2+.01,surface.photoWidth/2-.01])for(const y of [.025,h-.01])
      assert.equal(cast(surface,u,y)?.object.name,photo.name,`${surface.image}: a photo corner is covered`)
    assert.ok(Math.abs(photo.position.y-h/2)<1e-8,'A blank strip remains below the wall image')
    const x=surface.x+Math.sin(surface.yaw)*.05,z=surface.z+Math.cos(surface.yaw)*.05
    const ceilingRay=new Raycaster(new Vector3(x,.1,z),new Vector3(0,1,0),0,4)
    const ceilingHit=ceilingRay.intersectObject(studio.scene.getObjectByName('studio-ceiling'))[0]
    assert.ok(ceilingHit,`${surface.image}: ceiling missing`)
    assert.ok(Math.abs(ceilingHit.point.y-surface.wallHeight)<.001,`${surface.image}: bay does not meet the finished ceiling`)
    assert.equal(studio.scene.userData.architecture.bays.find(b=>b.id===surface.image).height,surface.wallHeight)
  }
})

test('native-proportion walls form continuous runs and paired corner walls meet',()=>{
  const byId=id=>REFERENCE_SURFACES.find(s=>s.image===id)
  for(const [ids,start,end] of [[['rattan','velvet','terracotta','boho'],WALL_FACES.west,WALL_FACES.east],[['reception','studio'],WALL_FACES.west,-.3875]]){
    let edge=start
    for(const id of ids){const s=byId(id);assert.ok(Math.abs(s.x-s.width/2-edge)<1e-8,'White filler remains between wall images');edge=s.x+s.width/2+(s.joinAfter||0)}
    assert.ok(Math.abs(edge-end)<1e-8)
  }
  for(const [a,b] of [['rattan','console'],['boho','olive']]){
    const rear=byId(a),side=byId(b)
    assert.equal(rear.wallHeight,side.wallHeight)
    assert.ok(Math.abs(side.z-side.width/2-rear.z)<1e-8,'The paired wall corner has a gap')
    assert.equal(REFERENCE_IMAGES.find(i=>i.id===a).zone,REFERENCE_IMAGES.find(i=>i.id===b).zone)
  }
})

test('photos fit existing wall spans and uncovered areas remain on the same masonry',()=>{
  for(const s of REFERENCE_SURFACES){
    const bay=studio.scene.userData.architecture.bays.find(b=>b.id===s.image)
    if(s.image==='makeup'){
      assert.equal(bay.width,MAKEUP_ENTRANCE.width)
      assert.equal(bay.height,MAKEUP_ENTRANCE.openingHeight)
    }else{
      assert.ok(bay.height>=2.8&&bay.height<=MAIN_WALL_SIZE.height)
      assert.ok(bay.width>2,'A design has become a tiny picture')
    }
    const frontWidth=s.photoWidth*(1-(s.cornerFraction||0))
    assert.ok(frontWidth<=bay.width+1e-8&&s.photoHeight<=bay.height+1e-8)
    if(s.image!=='daylight')assert.ok(Math.abs(s.photoHeight-bay.height)<1e-8,'A blank header remains above the photo')
    if(s.image!=='classic')assert.ok(Math.abs(frontWidth-bay.width)<1e-8,'An arbitrary image border remains')
    // Sample the whole bay, including fitted strips: no holes or floating edges.
    const n=new Vector3(Math.sin(s.yaw),0,Math.cos(s.yaw))
    for(const u of [-s.width/2+.01,0,s.width/2-.01])for(const y of [.025,s.wallHeight/2,s.wallHeight-.01]){
      const start=new Vector3(s.x+Math.cos(s.yaw)*u,y,s.z-Math.sin(s.yaw)*u).addScaledVector(n,.1)
      const hit=new Raycaster(start,n.clone().negate(),.001,.15).intersectObjects(studio.scene.children,true)[0]
      assert.ok(hit,`${s.image}: wall bay has a gap`)
      assert.ok(Math.abs(hit.distance-.1)<.003,`${s.image}: infill is not flush with photo`)
    }
  }
})

test('Room 04 glazed door occupies the exterior return with an intact continuous image',()=>{
  const wall=studio.scene.getObjectByName('reference-classic'),p=wall.geometry.attributes.position,uv=wall.geometry.attributes.uv
  const at=i=>new Vector3().fromBufferAttribute(p,i),world=i=>wall.localToWorld(at(i))
  for(const i of [0,1,2,3])assert.ok(Math.abs(world(i).x-WALL_FACES.east)<1e-6,'Door is not on the outer wall')
  for(const i of [4,5,6,7])assert.ok(Math.abs(world(i).z-WALL_FACES.room2)<1e-6,'Fireplace moved from its original wall')
  assert.ok(at(1).distanceTo(at(4))<1e-8&&at(2).distanceTo(at(7))<1e-8,'Corner has a seam gap')
  assert.equal(uv.getX(1),uv.getX(4));assert.equal(uv.getX(2),uv.getX(7))
  const scale=at(0).distanceTo(at(1))/(uv.getX(1)-uv.getX(0))
  assert.ok(Math.abs(scale-at(4).distanceTo(at(5))/(uv.getX(5)-uv.getX(4)))<1e-6,'Door and fireplace scales differ')
  assert.ok(Math.abs(scale/at(0).distanceTo(at(3))-1374/1145)<1e-6,'Source image was stretched')
  let area=0
  const indices=wall.geometry.index
  for(let i=0;i<indices.count;i+=3){
    const [a,b,c]=[indices.getX(i),indices.getX(i+1),indices.getX(i+2)]
    area+=Math.abs((uv.getX(b)-uv.getX(a))*(uv.getY(c)-uv.getY(a))-(uv.getY(b)-uv.getY(a))*(uv.getX(c)-uv.getX(a)))/2
  }
  assert.ok(Math.abs(area-1)<1e-8,'Some original image area is cropped or repeated')
  const stopped=moveWithCollision({x:5.8,z:-.45},2,0,studio.colliders)
  assert.ok(stopped.x<=6.44-.22+1e-8&&stopped.x>6.1,'The existing exterior wall must stop movement')
  assert.ok(isFree(5.8,-.45,studio.colliders,.25),'The approach is blocked')
})

test('reception wraps its green side wall without mirroring or discarding source content',()=>{
  const wall=studio.scene.getObjectByName('reference-reception'),p=wall.geometry.attributes.position,uv=wall.geometry.attributes.uv
  const at=i=>new Vector3().fromBufferAttribute(p,i),world=i=>wall.localToWorld(at(i))
  for(const i of [0,1,2,3])assert.ok(Math.abs(world(i).x-WALL_FACES.west)<1e-6,'Reception return is not on the exterior left wall')
  for(const i of [4,5,6,7])assert.ok(Math.abs(world(i).z-WALL_FACES.front)<1e-6,'Reception front moved away from the front group')
  assert.ok(at(1).distanceTo(at(4))<1e-8&&at(2).distanceTo(at(7))<1e-8)
  assert.equal(uv.getX(1),uv.getX(4));assert.equal(uv.getX(2),uv.getX(7))
  assert.equal(uv.getX(0),1);assert.equal(uv.getX(5),0,'Art must not be mirrored')
  const scale=at(0).distanceTo(at(1))/Math.abs(uv.getX(1)-uv.getX(0))
  assert.ok(Math.abs(scale-at(4).distanceTo(at(5))/Math.abs(uv.getX(5)-uv.getX(4)))<1e-6)
  assert.ok(Math.abs(scale/at(0).distanceTo(at(3))-1357/1159)<1e-6)
})

test('every original photograph has a reachable inspection position from the entrance',()=>{
  for(const s of REFERENCE_SURFACES){
    const endpoint={x:s.x+Math.sin(s.yaw)*2.9,z:s.z+Math.cos(s.yaw)*2.9}
    assert.ok(isFree(endpoint.x,endpoint.z,studio.colliders,.25),`${s.image}: inspection position blocked`)
    const route=findPath({x:ENTRANCE_VIEW.position[0],z:ENTRANCE_VIEW.position[1]},endpoint,studio.colliders)
    assert.ok(route.length,`${s.image}: no continuous route from entrance`)
    let pos={x:ENTRANCE_VIEW.position[0],z:ENTRANCE_VIEW.position[1]}
    for(const point of route){pos=moveWithCollision(pos,point.x-pos.x,point.z-pos.z,studio.colliders);assert.ok(Math.hypot(pos.x-point.x,pos.z-point.z)<.035)}
  }
})

test('only plan boundaries, retained recess, columns and physical furniture create collision barriers',()=>{
  const expected=[...WALLS,...STRUCTURAL_COLUMNS.filter(([x,z])=>containsPoint(x,z)).map(([x,z])=>[x-COLUMN_SIZE/2-.018,x+COLUMN_SIZE/2+.018,z-COLUMN_SIZE/2-.018,z+COLUMN_SIZE/2+.018]),...MAKEUP_ENTRANCE.walls]
  assert.deepEqual(studio.colliders,[...expected,...FURNISHINGS.map(furnitureBounds)],'A photo or unplanned wall introduced a new blocker')
  assert.equal(expected.length,18,'The retained architectural boundaries must not change')
  assert.equal(MAKEUP_ENTRANCE.walls.length,2,'The Room 2 boundary must supply the recess right side')
  for(const [a,b,c,d] of MAKEUP_ENTRANCE.walls)for(const [e,f,g,h] of WALLS)
    assert.ok(Math.min(b,f)<=Math.max(a,e)||Math.min(d,h)<=Math.max(c,g),'Recess duplicates an existing boundary wall')
  const start={x:1,z:-.6},end=moveWithCollision(start,0,-2.4,studio.colliders)
  assert.ok(Math.abs(end.z+3)<1e-8,'The old central photo partition still blocks walking')
  const ray=new Raycaster(new Vector3(1,1.6,-.6),new Vector3(0,0,-1),0,2.4)
  assert.equal(ray.intersectObjects(studio.scene.children,true).length,0,'The central partition still renders')
})

test('all twelve photos sit directly against existing masonry, not freestanding wall layers',()=>{
  const masonry=studio.scene.children.filter(o=>o.isMesh&&!o.userData.reference)
  for(const image of REFERENCE_IMAGES){
    const photo=studio.scene.getObjectByName(`reference-${image.id}`),g=photo.geometry,p=g.attributes.position,n=g.attributes.normal,idx=g.index
    for(const offset of [0,Math.floor(idx.count/6)*3,idx.count-3]){
      const ids=[idx.getX(offset),idx.getX(offset+1),idx.getX(offset+2)]
      const point=new Vector3(),normal=new Vector3()
      for(const id of ids){point.add(new Vector3().fromBufferAttribute(p,id));normal.add(new Vector3().fromBufferAttribute(n,id))}
      point.divideScalar(3);photo.localToWorld(point);normal.normalize().applyQuaternion(photo.quaternion)
      point.addScaledVector(normal,-.0005)
      const hit=new Raycaster(point,normal.negate(),0,.01).intersectObjects(masonry,true)[0]
      assert.ok(hit&&hit.distance<.003,`${image.id}: photo is detached from its existing wall`)
    }
  }
})

test('structural columns collide while the central circulation stays connected',()=>{
  for(const [x,z] of STRUCTURAL_COLUMNS){
    assert.equal(isFree(x,z,studio.colliders),false,`Column at ${x}, ${z} has no collision`)
  }
  assert.equal(studio.scene.userData.architecture.columnSize,COLUMN_SIZE)
  for(const side of [-1,1]){
    const start={x:side*2.6,z:.6},end={x:side*2.6,z:-3.1}
    const path=findPath(start,end,studio.colliders.map(([a,b,c,d])=>[a-.25,b+.25,c-.25,d+.25]))
    assert.ok(path.length,'A generous route around a backdrop has been blocked')
    for(const p of path)assert.ok(isFree(p.x,p.z,studio.colliders,.48))
  }
})

test('entry is a real clear opening and the reset position connects to the tour',()=>{
  const ray=new Raycaster(new Vector3(ENTRANCE.x,1.6,5.45),new Vector3(0,0,1),0,.6)
  assert.equal(ray.intersectObjects(studio.scene.children,true).length,0,'Entry geometry blocks the doorway')
  assert.equal(studio.scene.userData.architecture.entranceClearWidth,1.4)
  const start={x:ENTRANCE_VIEW.position[0],z:ENTRANCE_VIEW.position[1]}
  assert.ok(isFree(start.x,start.z,studio.colliders,.25))
  assert.ok(findPath(start,{x:SPACES[0].position[0],z:SPACES[0].position[1]},studio.colliders).length)
})

test('makeup doorway faces the inner Room 1 passage and shares its location with the photo, tour and map',()=>{
  const m=MAKEUP_ENTRANCE,photo=REFERENCE_SURFACES.find(s=>s.image==='makeup'),space=SPACES.find(s=>s.id==='makeup')
  assert.equal(photo.yaw,Math.PI,'The inward-facing front group must not rotate onto the east wall')
  assert.equal(photo.x,m.x);assert.equal(photo.z,m.photoZ)
  assert.deepEqual(space.position,m.position);assert.deepEqual(space.target,m.target)
  assert.deepEqual(space.mapPosition,[m.x,m.openingZ])
  assert.ok(m.openingZ<m.photoZ&&m.photoZ<FOOTPRINT.maxZ-.8,'The recess must sit inside Room 1, away from the exterior')
  assert.ok(m.x+m.width/2<1.44,'Do not breach the closed Room 2 boundary')
  for(const [a,b,c,d] of m.walls)for(const [x,z] of [[a,c],[b,d]])assert.ok(insideFootprint(x,z),'Makeup geometry extends into Room 2')
  const p=moveWithCollision({x:m.x,z:m.openingZ-.4},0,.9,studio.colliders)
  assert.ok(p.z>m.openingZ+.4,'A hidden panel or collider still blocks the opening')
  const stopped=moveWithCollision(p,0,4,studio.colliders)
  assert.ok(stopped.z<m.photoZ-.2,'The closed-door photo needs a matching rear collision')
  const ray=new Raycaster(new Vector3(m.x,1.6,m.openingZ-.2),new Vector3(0,0,1),.01,2)
  const hit=ray.intersectObjects(studio.scene.children,true)[0]
  assert.equal(hit?.object.name,'reference-makeup','The opening must look into the full original photo')
  assert.ok(hit.distance>1,'The entrance opening must have real depth')
  // Original perimeter wall, not a replacement entrance, still closes Room 2.
  const boundary=new Raycaster(new Vector3(.8,1.6,3.6),new Vector3(1,0,0),.01,1.2)
  assert.ok(boundary.intersectObjects(studio.scene.children,true)[0],'Room 2 boundary has been opened accidentally')
})

test('the makeup passage has continuous real floor and ceiling',()=>{
  for(const z of [2.8,3.1,3.5,3.8])for(const name of ['studio-floor','studio-ceiling']){
    const ray=new Raycaster(new Vector3(MAKEUP_ENTRANCE.x,4,z),new Vector3(0,-1,0))
    assert.ok(ray.intersectObject(studio.scene.getObjectByName(name)).length,`${name} has a gap at the entrance`)
  }
})

test('collision substeps stop high-speed wall tunnelling and allow sliding',()=>{
  const blockers=[[-.1,.1,-2,2]]
  const position=moveWithCollision({x:-1,z:0},5,.7,blockers)
  assert.ok(position.x<-.31)
  assert.ok(position.z>.65)
  assert.ok(isFree(position.x,position.z,blockers))
})

test('outer shell remains impenetrable',()=>{
  for(const [dx,dz] of [[50,0],[-50,0],[0,50],[0,-50]]){
    const p=moveWithCollision({x:0,z:0},dx,dz,WALLS)
    assert.ok(isFree(p.x,p.z,WALLS))
    assert.ok(Math.abs(p.x)<6.6&&Math.abs(p.z)<5.85)
  }
})

test('scene batches detail geometry and releases its resources',()=>{
  let meshes=0,triangles=0
  studio.scene.traverse(o=>{if(o.isMesh){meshes++;triangles+=(o.geometry.index?.count||o.geometry.attributes.position.count)/3}})
  assert.ok(meshes<110,`${meshes} draw batches exceed the intended budget`)
  assert.ok(triangles>10000,'The interior should contain real geometry')
  studio.dispose()
})
