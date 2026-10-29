import * as THREE from 'three'
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js'
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js'
import { ENTRANCE, FOOTPRINT, WALLS } from './layout.js'
import { REFERENCE_IMAGES, REFERENCE_SURFACES, REFERENCE_FINISHES, canvaWorldAnchor } from './references.js'
import { addBuildingContext } from './buildingContext.js'
import { addArchitecturalFinishes, addMakeupEntrance, addWallCeilings } from './architecture.js'
import { addFurnishings, microTexture } from './furnishings.js'
import { ceilingAt } from './references.js'

// A real architectural shell and complete, unaltered photographic visual references.
// Original image finishes, retained boundaries and reference-guided usable furniture.
export function createStudio(renderer,{environment=true,loadImages=true}={}) {
  const scene=new THREE.Scene();scene.background=new THREE.Color('#e8e6db')
  const textures=new Set(),materials=new Set(),jobs=[],missing=[],assets=new Map()
  const colliders=WALLS.map(rect=>[...rect])
  let disposed=false,env=null
  if(environment){
    const pmrem=new THREE.PMREMGenerator(renderer),room=new RoomEnvironment()
    env=pmrem.fromScene(room,.04);scene.environment=env.texture
    room.dispose();pmrem.dispose()
  }
  scene.environmentIntensity=.5
  for(const asset of REFERENCE_IMAGES){
    let texture,resolve
    const ready=new Promise(r=>{resolve=r})
    if(loadImages)texture=new THREE.TextureLoader().load(encodeURI(asset.url),()=>{
      if(disposed)texture.dispose();resolve(true)
    },undefined,()=>{missing.push(asset.url);resolve(false)})
    else{texture=new THREE.Texture();resolve(true)}
    texture.name=asset.url;texture.colorSpace=THREE.SRGBColorSpace
    texture.anisotropy=Math.min(8,renderer.capabilities.getMaxAnisotropy())
    textures.add(texture);jobs.push(ready);assets.set(asset.id,{...asset,texture})
  }
  const material=(color,options={})=>{
    const value=new THREE.MeshStandardMaterial({color,roughness:.7,...options});materials.add(value);return value
  }
  const stone=microTexture('stone',textures)
  // Downward-facing ceilings receive almost no direct light; a faint self-lit
  // term stands in for bounce so they match the bright ceilings in the photos.
  const wall=material('#e1d8c9'),floor=material('#d5c6ae',{roughness:.3,bumpMap:stone,bumpScale:.003}),ceiling=material('#f4eee2',{emissive:'#efe6d6',emissiveIntensity:.32})
  const finishes=Object.fromEntries(Object.entries(REFERENCE_FINISHES).map(([id,color])=>{
    const mat=material(color);mat.name=`finish-${id}`;return [id,mat]
  }))
  floor.name='studio-floor';ceiling.name='studio-ceiling'
  function mesh(geometry,mat,x=0,y=0,z=0,shadow=true){
    const object=new THREE.Mesh(geometry,mat);object.position.set(x,y,z)
    object.castShadow=shadow;object.receiveShadow=true;scene.add(object);return object
  }
  function box(x,y,z,w,h,d,mat=wall){return mesh(new THREE.BoxGeometry(w,h,d),mat,x,y,z)}
  function slab(y,depth,mat,outline=FOOTPRINT.outline){
    const shape=new THREE.Shape()
    outline.forEach(([x,z],i)=>i?shape.lineTo(x,-z):shape.moveTo(x,-z));shape.closePath()
    const geometry=new THREE.ExtrudeGeometry(shape,{depth,bevelEnabled:false});geometry.rotateX(-Math.PI/2)
    return mesh(geometry,mat,0,y,0,false)
  }
  slab(-.12,.12,floor);slab(FOOTPRINT.height,.08,ceiling)
  addWallCeilings({box,ceiling})
  for(const [i,[a,b,c,d]] of WALLS.entries()){
    // Repaint the existing masonry, without layering more walls over it.
    const finish=i===1?finishes.classic:wall
    box((a+b)/2,FOOTPRINT.height/2,(c+d)/2,b-a,FOOTPRINT.height,d-c,finish)
  }
  // The entry is genuinely open toward the stair/service landing.
  box(ENTRANCE.x,2.975,ENTRANCE.z-.08,ENTRANCE.width,.55,.16)
  addBuildingContext({scene,box,slab,material})
  const {trim}=addArchitecturalFinishes({scene,box,mesh,material,wall,colliders})

  for(const surface of REFERENCE_SURFACES){
    const asset=assets.get(surface.image),h=surface.photoHeight,w=surface.photoWidth
    const photo=new THREE.MeshBasicMaterial({map:asset.texture,toneMapped:false,side:THREE.FrontSide})
    materials.add(photo)
    // A flat grid retains the existing scene's geometry/test contract. Every UV
    // stays 0..1, so every original pixel is visible without cropping or stretching.
    let geometry=new THREE.PlaneGeometry(w,h,24,24)
    if(surface.cornerFraction){
      geometry.dispose()
      // Two rigid wall faces share the complete source UV rectangle. Equal
      // physical scale on both faces preserves every pixel without distortion.
      const split=surface.cornerFraction,edge=-surface.width/2,door=w*split,front=w*(1-split)
      geometry=new THREE.BufferGeometry()
      geometry.setAttribute('position',new THREE.Float32BufferAttribute([
        edge,-h/2,door, edge,-h/2,0, edge,h/2,0, edge,h/2,door,
        edge,-h/2,0, edge+front,-h/2,0, edge+front,h/2,0, edge,h/2,0,
      ],3))
      geometry.setAttribute('uv',new THREE.Float32BufferAttribute([0,0,split,0,split,1,0,1,split,0,1,0,1,1,split,1],2))
      geometry.setIndex([0,1,2,0,2,3,4,5,6,4,6,7]);geometry.computeVertexNormals()
      if(surface.cornerSide==='right'){
        // Same complete UV mapping, mirrored geometry order, not mirrored art.
        const p=geometry.attributes.position,uv=geometry.attributes.uv
        for(let i=0;i<p.count;i++){p.setX(i,-p.getX(i));uv.setX(i,1-uv.getX(i))}
        geometry.setIndex([0,2,1,0,3,2,4,6,5,4,7,6]);geometry.computeVertexNormals()
      }
    }
    const object=mesh(geometry,photo,surface.x,h/2,surface.z,false)
    object.rotation.y=surface.yaw;object.name=`reference-${surface.image}`
    object.userData={reference:asset.url,zone:asset.zone,reliefDepth:0,panelWidth:w,panelHeight:h,wallWidth:surface.width,wallHeight:surface.wallHeight,fullWall:true,cornerFraction:surface.cornerFraction||0,canvaAnchor:canvaWorldAnchor(surface.image)}
    if(surface.image==='makeup')addMakeupEntrance({scene,box,wall,trim,colliders,photoHeight:h})
    // Photographs are finishes on existing masonry, never new walls or blockers.
    scene.userData.architecture.bays.push({id:surface.image,width:surface.width,height:surface.wallHeight,photoWidth:w,photoHeight:h,wallMounted:true})
  }
  addFurnishings({scene,mesh,material,textures,colliders})
  scene.add(new THREE.HemisphereLight('#fff8ed','#a59780',.65))
  const sun=new THREE.DirectionalLight('#fff1da',.35);sun.position.set(-3,7,6);scene.add(sun)
  // Interior keys sit below the ceiling. The old exterior sun could not illuminate
  // a closed shell, and the floor explicitly rejected shadows.
  // Only where a physical piece stands: each extra shadow map has a GPU cost.
  for(const [x,z,intensity] of [[2.5,-4.5,9],[-3.25,4.4,12]]){
    const light=new THREE.SpotLight('#fff0db',intensity,9,1.12,.9,2)
    light.position.set(x,ceilingAt(x,z)-.06,z);light.target.position.set(x,0,z+.2)
    light.castShadow=true;light.shadow.mapSize.set(1024,1024)
    light.shadow.bias=-.00015;light.shadow.normalBias=.012;light.shadow.radius=3
    scene.add(light,light.target)
  }

  scene.updateMatrixWorld(true)
  const batches=new Map(),originals=[]
  scene.traverse(o=>{
    if(!o.isMesh||o.userData.reference)return
    const key=o.material.uuid+o.castShadow
    if(!batches.has(key))batches.set(key,{material:o.material,shadow:o.castShadow,geometries:[]})
    const transformed=o.geometry.clone().applyMatrix4(o.matrixWorld)
    batches.get(key).geometries.push(transformed.index?transformed.toNonIndexed():transformed)
    if(transformed.index)transformed.dispose();originals.push(o)
  })
  for(const o of originals){o.removeFromParent();o.geometry.dispose()}
  for(const batch of batches.values()){
    const geometry=mergeGeometries(batch.geometries,false)
    for(const g of batch.geometries)g.dispose()
    if(geometry){const object=mesh(geometry,batch.material,0,0,0,batch.shadow);object.name=batch.material.name}
  }
  return{
    scene,colliders,ready:Promise.all(jobs).then(()=>missing),
    references:REFERENCE_IMAGES.map(({url,zone})=>({url,zone})),
    dispose(){disposed=true;scene.traverse(o=>o.geometry?.dispose());for(const m of materials)m.dispose();for(const t of textures)t.dispose();env?.dispose()},
  }
}
