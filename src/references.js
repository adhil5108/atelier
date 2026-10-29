// Every supplied interior image is used in the 3D view, not just in the inspiration dialog.
// Width/height are the actual local image dimensions; no replacement/generated images.
import { FOOTPRINT, MAKEUP_ENTRANCE } from './layout.js'
const file = name => `/references/WhatsApp Image 2026-10-25 at ${name}.jpeg`
export const REFERENCE_IMAGES = [
  { id:'reception', zone:'reception', label:'Entrance, lounge, floral arch and wall decorations', url:file('7.26.04 PM'), width:1357, height:1159 },
  { id:'studio', zone:'studio', label:'Enclosed photo studio, paper sweep and lighting', url:file('7.26.04 PM (1)'), width:1383, height:1137 },
  { id:'makeup', zone:'makeup', label:'Makeup walkway, display shelving and glazed doors', url:file('7.26.04 PM (2)'), width:1145, height:1374 },
  { id:'classic', zone:'classic', label:'Ivory wall relief, fireplace and chandelier', url:file('7.26.04 PM (3)'), width:1374, height:1145 },
  { id:'olive', zone:'boho', label:'Olive curtains, standing mirror, plants and stool', url:file('7.26.05 PM'), width:1182, height:1330 },
  { id:'boho', zone:'boho', label:'Sheer curtains, bench, baskets and pampas', url:file('7.26.06 PM'), width:1086, height:1448 },
  { id:'terracotta', zone:'terracotta', label:'Terracotta arch, linen sofa and pendant', url:file('7.26.06 PM (1)'), width:1374, height:1145 },
  { id:'velvet', zone:'velvet', label:'Original crimson backdrop and curtain folds', url:file('7.26.06 PM (2)'), width:1374, height:1145 },
  { id:'rattan', zone:'rattan', label:'Cane arches, chairs, table and greenery', url:file('7.26.07 PM'), width:1312, height:1199 },
  { id:'console', zone:'rattan', label:'Timber console, bar stools and brown curtains', url:file('7.26.07 PM (1)'), width:1256, height:1199 },
  { id:'sofa', zone:'daylight', label:'Sculptural ivory sofa in daylight', url:file('7.26.08 PM'), width:1333, height:1100 },
  { id:'daylight', zone:'daylight', label:'Cane swing, ivory cushions and window backdrop', url:file('7.26.08 PM (1)'), width:1430, height:1100 },
]

// The 3 m target remains the main ceiling datum. Wall widths now follow native
// photo proportions: square contain-bays left unwanted plaster picture borders.
export const MAIN_WALL_SIZE = Object.freeze({width:3,height:3})
const ratio=id=>{const a=REFERENCE_IMAGES.find(a=>a.id===id);return a.width/a.height}
const height=MAIN_WALL_SIZE.height,entryHeight=2.8,sofaHeight=3.54/ratio('sofa')
function photoWall(image,x,z,yaw,wallHeight=height){
  return {image,x,z,yaw,width:wallHeight*ratio(image),wallHeight}
}
function wallRun(ids,start,end,z,yaw){
  const gap=(end-start-ids.reduce((sum,id)=>sum+height*ratio(id),0))/(ids.length-1)
  return ids.map((image,i)=>{const width=height*ratio(image),x=start+width/2;start+=width+gap;return {...photoWall(image,x,z,yaw),joinAfter:i<ids.length-1?gap:0}})
}
// Mount 2 mm in front of the retained wall faces, not on 4 cm wall layers.
export const WALL_FACES={west:-6.438,east:6.438,rear:-5.688,front:5.688,room2:-.012}
const studioWidth=entryHeight*ratio('studio'),frontEnd=-.3875
const receptionFront=frontEnd-studioWidth-WALL_FACES.west,receptionWidth=entryHeight*ratio('reception')
export const REFERENCE_SURFACES = [
  // The reception photo's green right wall turns onto the left exterior wall.
  {image:'reception',x:WALL_FACES.west+receptionFront/2,z:WALL_FACES.front,yaw:Math.PI,width:receptionFront,wallHeight:entryHeight,cornerSide:'right',cornerFraction:1-receptionFront/receptionWidth},
  photoWall('studio',frontEnd-studioWidth/2,WALL_FACES.front,Math.PI,entryHeight),
  {image:'makeup',x:MAKEUP_ENTRANCE.x,z:MAKEUP_ENTRANCE.photoZ,width:MAKEUP_ENTRANCE.width,wallHeight:MAKEUP_ENTRANCE.openingHeight,yaw:MAKEUP_ENTRANCE.yaw},
  // Keep the corrected Room 04 glazed-door return and its existing front bay.
  {image:'classic',x:WALL_FACES.east-MAIN_WALL_SIZE.width/2,z:WALL_FACES.room2,yaw:Math.PI,width:MAIN_WALL_SIZE.width,wallHeight:height,cornerFraction:.22},
  ...wallRun(['rattan','velvet','terracotta','boho'],WALL_FACES.west,WALL_FACES.east,WALL_FACES.rear,0),
  photoWall('olive',WALL_FACES.east,WALL_FACES.rear+height*ratio('olive')/2,-Math.PI/2),
  {image:'daylight',x:WALL_FACES.west,z:3.56,yaw:Math.PI/2,width:2.84,wallHeight:entryHeight},
  photoWall('sofa',WALL_FACES.west,0,Math.PI/2,sofaHeight),
  photoWall('console',WALL_FACES.west,WALL_FACES.rear+height*ratio('console')/2,Math.PI/2),
].map(s=>{
  const photoWidth=Math.min(s.width/(1-(s.cornerFraction||0)),s.wallHeight*ratio(s.image))
  return {...s,photoWidth,photoHeight:photoWidth/ratio(s.image)}
})

// Continuous main ceiling plus shallow local finishes at the entrance and sofa.
// These meet complete image tops without changing the stepped footprint.
export const WALL_CEILINGS = [
  ...[[-6.6,6.6,-5.85,.15],[-6.6,3.2,.15,1.85],[-6.6,1.6,1.85,5.85]]
    .map((bounds,i)=>({id:`main-${i}`,bounds,height})),
  {id:'entry-left',bounds:[-6.6,-1.21,2.1,5.85],height:entryHeight},
  {id:'entry-front',bounds:[-1.21,frontEnd,MAKEUP_ENTRANCE.rearZ,5.85],height:entryHeight},
  {id:'sofa',bounds:[-6.6,-4.6,-1.85,1.85],height:sofaHeight},
  {id:'makeup',bounds:[-1.21,1.44,MAKEUP_ENTRANCE.openingZ,MAKEUP_ENTRANCE.rearZ],height:MAKEUP_ENTRANCE.openingHeight},
]
export function ceilingAt(x,z){
  return WALL_CEILINGS.reduce((height,c)=>{
    const [a,b,d,e]=c.bounds
    return x>=a&&x<=b&&z>=d&&z<=e?Math.min(height,c.height):height
  },FOOTPRINT.height)
}

// Plain architectural finishes are drawn from the reference palettes. They are
// not additional artwork: columns and uncovered circulation intervals stay plain.
export const REFERENCE_FINISHES={
  reception:'#77705a',studio:'#cbbca7',makeup:'#8a816b',classic:'#dbcfba',
  olive:'#a59d79',boho:'#cdbfa4',terracotta:'#aa7c61',velvet:'#b79b83',
  rattan:'#c2ad8f',console:'#b3a28b',sofa:'#c8b79b',daylight:'#b7a184',
}

// The collage places a swing in open floor space but supplies no wall there.
// User confirmed the existing left wall beside the sofa after reviewing the plan.
export const REFERENCE_PLACEMENT_OVERRIDES={daylight:'User-confirmed existing left wall beside sofa; no freestanding partition.'}

// Pixel centres measured from the user's replacement 582 x 582 modified plan,
// public/references/canva placement.png. Thumbnails specify zones, not dimensions.
export const CANVA_PLACEMENTS = {
  reception:[509,519],studio:[509,379],makeup:[529,254],classic:[252,54],
  olive:[96,30],boho:[47,85],terracotta:[74,216],velvet:[54,369],
  rattan:[48,497],console:[128,552],sofa:[299,520],daylight:[279,288],
}

export function canvaWorldPoint(x,y){
  // Register the visible structural grid, not the screenshot edges: the modified
  // image clips the two side edges of the full building. Approximate grid lines
  // are x=199/389 (3.90 m bays), y=126/287/455 (3.30 m bays).
  // This also places the two visible Room 2 step corners at the existing contour.
  return [(287-y)*3.3/164.5,(x-293.5)*3.9/190]
}

export const canvaWorldAnchor=id=>canvaWorldPoint(...CANVA_PLACEMENTS[id])
