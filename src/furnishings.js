import * as THREE from 'three'
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js'

import { FURNISHINGS, furnitureBounds } from './furnishingsData.js'

// Small deterministic surface textures only: no generated replacement artwork.
export function microTexture(kind,textures){
  const size=128,data=new Uint8Array(size*size*4)
  for(let y=0;y<size;y++)for(let x=0;x<size;x++){
    const noise=((x*73856093^y*19349663)>>>0)%31
    const grain=kind==='wood'?Math.sin(x*.32+Math.sin(y*.05)*2)*17:
      kind==='fabric'?((x%3===0||y%3===0)?-21:6):Math.sin(x*.065+y*.11)*3
    const v=Math.max(0,Math.min(255,205+grain+noise)),i=(y*size+x)*4
    data[i]=data[i+1]=data[i+2]=v;data[i+3]=255
  }
  const texture=new THREE.DataTexture(data,size,size);texture.needsUpdate=true
  texture.wrapS=texture.wrapT=THREE.RepeatWrapping;texture.repeat.set(kind==='fabric'?10:3,kind==='fabric'?10:3)
  textures.add(texture);return texture
}

export function addFurnishings({scene,mesh,material,textures,colliders}){
  const fabricMap=microTexture('fabric',textures),woodMap=microTexture('wood',textures)
  const linen=material('#d7c9ae',{roughness:.95,bumpMap:fabricMap,bumpScale:.008})
  const wood=material('#825937',{roughness:.48,map:woodMap,bumpMap:woodMap,bumpScale:.004})
  const metal=material('#302e29',{metalness:.72,roughness:.32})
  const brass=material('#a58b59',{metalness:.7,roughness:.35})
  const oat=material('#9f8a70',{roughness:.95,bumpMap:fabricMap,bumpScale:.008})
  const diffuser=material('#f5eee0',{emissive:'#fff0d8',emissiveIntensity:.45,roughness:.9})
  // No live reflections: a pale silvered face with a soft diagonal sheen reads
  // as glass, where a fully metallic one only mirrored the dark environment.
  const sheenPixels=new Uint8Array(32*64*4)
  for(let y=0;y<64;y++)for(let x=0;x<32;x++){
    const band=Math.max(0,1-Math.abs(x/31-y/63+.15)/.14),i=(y*32+x)*4
    sheenPixels[i]=sheenPixels[i+1]=sheenPixels[i+2]=Math.min(255,Math.round(165+55*y/63+45*band));sheenPixels[i+3]=255
  }
  const sheen=new THREE.DataTexture(sheenPixels,32,64);sheen.needsUpdate=true;textures.add(sheen)
  const mirror=material('#dfe3df',{metalness:.5,roughness:.16,map:sheen,emissive:'#8a8f8b',emissiveMap:sheen,emissiveIntensity:.55})
  for(const [name,mat] of Object.entries({linen,oat,wood,metal,brass,diffuser,mirror}))mat.name=`furnishing-${name}`
  // A gentle contact term under each object supplements the moving light shadows.
  // It is transparent, floor-bound and never used as a wall image or replacement art.
  const shadowPixels=new Uint8Array(64*64*4)
  for(let y=0;y<64;y++)for(let x=0;x<64;x++){
    const r=Math.hypot((x-31.5)/31.5,(y-31.5)/31.5)
    shadowPixels[(y*64+x)*4+3]=Math.round(Math.max(0,1-r)**1.5*105)
  }
  const contact=new THREE.DataTexture(shadowPixels,64,64);contact.needsUpdate=true;textures.add(contact)
  const shadowMat=material('#27221c',{map:contact,transparent:true,depthWrite:false,roughness:1})
  shadowMat.name='furniture-contact-shadows'
  const add=(group,g,m,x,y,z)=>{const o=mesh(g,m);group.add(o);o.position.set(x,y,z);return o}
  const rounded=(g,x,y,z,w,h,d,r,mat)=>add(g,new RoundedBoxGeometry(w,h,d,4,r),mat,x,y,z)
  const cylinder=(g,x,y,z,top,bottom,h,mat)=>add(g,new THREE.CylinderGeometry(top,bottom,h,32),mat,x,y,z)
  const rod=(g,a,b,r,mat)=>{
    const start=new THREE.Vector3(...a),end=new THREE.Vector3(...b),o=add(g,new THREE.CylinderGeometry(r,r,start.distanceTo(end),12),mat,...start.clone().add(end).multiplyScalar(.5).toArray())
    o.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),end.sub(start).normalize());return o
  }
  const feet=(g,w,d,top=.3)=>{
    for(const x of [-w/2+.1,w/2-.1])for(const z of [-d/2+.08,d/2-.08])rod(g,[x*1.04,.025,z*1.06],[x,top,z],.026,wood)
  }
  for(const item of FURNISHINGS){
    const group=new THREE.Group();scene.add(group);group.position.set(item.x,0,item.z);group.rotation.y=item.yaw||0
    const w=item.width,d=item.depth
    if(item.kind!=='vanity'){
      const shadow=add(group,new THREE.PlaneGeometry(w+.4,d+.4),shadowMat,0,.008,0)
      shadow.rotation.x=-Math.PI/2;shadow.castShadow=false
    }
    if(item.kind==='bench'){
      // Timber slat bench with a slim oat squab, after the bohemian reference.
      feet(group,w,d,.34)
      rounded(group,0,.32,0,w,.07,d,.015,wood)
      rounded(group,0,.4,0,w-.06,.09,d-.05,.035,oat)
    }else if(item.kind==='stool'){
      feet(group,w,d,.41)
      for(const z of [-d/2+.08,d/2-.08])rod(group,[-w/2+.1,.18,z],[w/2-.1,.18,z],.014,wood)
      rounded(group,0,.44,0,w,.1,d,.04,linen)
    }else if(item.kind==='vanity'){
      // Slim floor-standing counter under the wall mirror; legs stop it floating.
      rounded(group,0,.78,0,w,.035,d,.012,wood)
      for(const x of [-w/2+.04,w/2-.04])for(const z of [-d/2+.04,d/2-.04])rod(group,[x,0,z],[x,.77,z],.014,wood)
    }else if(item.kind==='softbox'){
      cylinder(group,0,.84,0,.015,.022,1.65,metal)
      for(let i=0;i<3;i++){const a=i*Math.PI*2/3;rod(group,[0,.25,0],[Math.sin(a)*.32,.025,Math.cos(a)*.32],.015,metal)}
      rod(group,[-.2,1.6,0],[.2,1.6,0],.018,metal)
      // Shell narrows toward the stand; the diffuser closes its wide front,
      // pitched slightly down toward a subject in front of the sweep.
      const head=new THREE.Group();group.add(head);head.position.set(0,1.72,0);head.rotation.x=.18
      add(head,new THREE.CylinderGeometry(.3,.12,.26,8),metal,0,0,0).rotation.x=Math.PI/2
      add(head,new THREE.CircleGeometry(.29,8),diffuser,0,0,.132)
    }
    colliders.push(furnitureBounds(item))
  }
  // A slim real vanity mirror on the existing inner Room 2 face. The original
  // closed-door photograph remains unobstructed at the end of the recess.
  const vanity=new THREE.Group();scene.add(vanity);vanity.position.set(1.435,0,3.59);vanity.rotation.y=-Math.PI/2
  rounded(vanity,0,1.5,0,.63,.96,.025,.025,brass)
  rounded(vanity,0,1.5,.017,.57,.90,.012,.025,mirror)
  for(const x of [-.34,.34])rounded(vanity,x,1.5,.025,.025,.93,.025,.01,diffuser)
  const fill=new THREE.PointLight('#fff3df',1.2,2.2,2);fill.position.set(1.0,1.9,3.6);scene.add(fill)
  scene.userData.furnishings=FURNISHINGS.map(item=>({...item,bounds:furnitureBounds(item)}))
}
