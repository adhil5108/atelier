import * as THREE from 'three'
import { COLUMN_SIZE, ENTRANCE, FOOTPRINT, MAKEUP_ENTRANCE, STRUCTURAL_COLUMNS, WALLS, containsPoint } from './layout.js'
import { WALL_CEILINGS, ceilingAt } from './references.js'

// Finishes only: no photographed furniture or additional enclosed rooms.
// All finish/column dimensions below are design assumptions, not survey data.
export function addArchitecturalFinishes({scene,box,mesh,material,wall,colliders}) {
  const height=FOOTPRINT.height
  const trim=material('#e0d4c2',{roughness:.5}),grout=material('#b7ad9d',{roughness:.85})
  const glow=material('#fff0ce',{emissive:'#ffe3b0',emissiveIntensity:1.8})
  const baffle=material('#827868',{roughness:.45,metalness:.25})
  trim.name='architectural-trim';grout.name='floor-joints';glow.name='ceiling-light-diffusers'

  // Continuous 1.2 m tile grid, clipped to the same three spans as Room 1.
  // Four-millimetre joints remain legible at walking height; no raised obstacles.
  const spans=[[-6.6,6.6,-5.85,.15],[-6.6,3.2,.15,1.85],[-6.6,1.6,1.85,5.85]]
  for(let x=-6;x<6.6;x+=1.2)for(const [a,b,c,d] of spans)if(x>a&&x<b)
    box(x,.001,(c+d)/2,.004,.001,d-c,grout).castShadow=false
  for(let z=-5.4;z<5.85;z+=1.2){
    const [a,b]=spans.find(([, ,c,d])=>z>=c&&z<d)
    box((a+b)/2,.001,z,b-a,.001,.004,grout).castShadow=false
  }

  // Keep floor-level photo pixels visible. Ceiling details use the *finished*
  // height; the previous coves were hidden above the lowered ceiling slabs.
  WALLS.forEach(([a,b,c,d])=>{
    const alongX=b-a>d-c, x=(a+b)/2,z=(c+d)/2
    box(x,.055,z,b-a+(alongX?0:.001),.11,d-c+(alongX?.001:0),trim)
    const start=alongX?a:c,end=alongX?b:d
    const cuts=[start,end,...WALL_CEILINGS.flatMap(({bounds:r})=>alongX?[r[0],r[1]]:[r[2],r[3]])]
      .filter(v=>v>=start&&v<=end).sort((a,b)=>a-b)
    for(let i=1;i<cuts.length;i++){
      const length=cuts[i]-cuts[i-1];if(length<.001)continue
      const mid=(cuts[i]+cuts[i-1])/2,xx=alongX?mid:x,zz=alongX?z:mid
      // Determine inward direction from the footprint, including both step faces.
      let nx=alongX?0:1,nz=alongX?1:0
      if(!containsPoint(xx+nx*.25,zz+nz*.25)){nx=-nx;nz=-nz}
      const y=ceilingAt(xx+nx*.25,zz+nz*.25)
      // Flush ceiling slot and an outer lip, not a new wall or a frame over art.
      box(xx+nx*.23,y-.002,zz+nz*.23,alongX?length:.035,.004,alongX?.035:length,glow).castShadow=false
      box(xx+nx*.28,y-.003,zz+nz*.28,alongX?length:.025,.006,alongX?.025:length,trim).castShadow=false
    }
  })

  // The solid column marks in the real plan, without the dashed shop partitions.
  for(const [x,z] of STRUCTURAL_COLUMNS){
    box(x,height/2,z,COLUMN_SIZE,height,COLUMN_SIZE,wall)
    box(x,.06,z,COLUMN_SIZE+.035,.12,COLUMN_SIZE+.035,trim)
    if(containsPoint(x,z))colliders.push([x-COLUMN_SIZE/2-.018,x+COLUMN_SIZE/2+.018,z-COLUMN_SIZE/2-.018,z+COLUMN_SIZE/2+.018])
  }

  // Door jambs sit outside the 1.4 m clear opening; a 24 cm reveal gives the
  // entry depth, with a flush stone threshold rather than a trip-height platform.
  for(const x of [ENTRANCE.x-ENTRANCE.width/2-.045,ENTRANCE.x+ENTRANCE.width/2+.045])
    box(x,1.35,ENTRANCE.z-.08,.09,2.7,.24,trim)
  box(ENTRANCE.x,2.745,ENTRANCE.z-.08,ENTRANCE.width+.18,.09,.24,trim)
  box(ENTRANCE.x,.003,ENTRANCE.z-.08,ENTRANCE.width,.006,.3,trim)

  const fixtures=[]
  for(const z of [-4.5,-.6,4.6])for(const x of [-5.5,-2.5,2.5,5.5]){
    if(!containsPoint(x,z))continue
    fixtures.push([x,z])
    mesh(new THREE.CylinderGeometry(.085,.085,.018,20),baffle,x,ceilingAt(x,z)-.012,z,false)
    mesh(new THREE.CylinderGeometry(.06,.06,.021,20),glow,x,ceilingAt(x,z)-.025,z,false)
  }
  // Shared soft downward beams originate at the fittings, avoiding artificial
  // ceiling hotspots. No shadow maps per fitting or re-lighting of photographs.
  for(const [x,z] of fixtures.filter((_,i)=>i%2===0||i===fixtures.length-1)){
    const light=new THREE.SpotLight('#fff0d8',7,10,Math.PI/2.4,.85,2)
    light.position.set(x,ceilingAt(x,z)-.045,z);light.target.position.set(x,0,z)
    scene.add(light,light.target)
  }
  scene.userData.architecture={tileSize:1.2,jointWidth:.004,columns:STRUCTURAL_COLUMNS,columnSize:COLUMN_SIZE,fixtures,entranceClearWidth:ENTRANCE.width,bays:[]}
  return {trim,glow}
}

export function addWallCeilings({box,ceiling}) {
  for(const {bounds:[a,b,c,d],height} of WALL_CEILINGS){
    const depth=FOOTPRINT.height-height
    box((a+b)/2,height+depth/2,(c+d)/2,b-a,depth,d-c,ceiling).castShadow=false
  }
}

export function addMakeupEntrance({scene,box,wall,trim,colliders,photoHeight}) {
  const m=MAKEUP_ENTRANCE
  for(const [a,b,c,d] of m.walls){
    box((a+b)/2,photoHeight/2,(c+d)/2,b-a,photoHeight,d-c,wall)
    colliders.push([a,b,c,d])
  }
  // Finish the actual recess edges without reducing the clear opening or
  // adding another return. The room photograph remains its terminal surface.
  for(const [x,side] of [[m.openingBounds[0],-1],[m.openingBounds[1],1]])
    box(x+side*.018,photoHeight/2,m.openingZ+.015,.035,photoHeight,.03,trim)
  // The original closed-door photograph fills the terminal wall to its ceiling.
  // The front opening stays physically empty and the continuous floor runs in.
  scene.userData.architecture.makeupEntrance=m
}
