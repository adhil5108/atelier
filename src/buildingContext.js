import { BUILDING_CONTEXT, FOOTPRINT } from './layout.js'

// The building drawing, not the photographs, determines these surroundings.
// Room 2 and external circulation are context; the studio tour stays in Room 1.
export function addBuildingContext({scene,box,slab,material}) {
  const context=BUILDING_CONTEXT
  const paving=material('#d9d6c9'), walls=material('#dedbd1'), room2=material('#d6d1c2'), stairs=material('#b8b9ad')
  room2.name='context-room2-floor';paving.name='context-circulation';stairs.name='context-stairs'
  slab(-.12,.12,room2,context.room2)
  const ceiling=material('#eee7d9');ceiling.name='context-room2-ceiling'
  slab(FOOTPRINT.height,.08,ceiling,context.room2)
  const rectangle=([a,b,c,d],mat=paving)=>box((a+b)/2,-.06,(c+d)/2,b-a,.12,d-c,mat)
  for(const strip of context.verandahs)rectangle(strip)
  rectangle(context.landing)
  // Remaining outer edges of Room 2 complete the original rectangular building.
  box(6.52,FOOTPRINT.height/2,3,.16,FOOTPRINT.height,5.7,walls)
  box(4.1,FOOTPRINT.height/2,5.77,5,FOOTPRINT.height,.16,walls)
  // 120 cm verandah and parapet are explicitly labeled in the real plan.
  box(-7.74,.6,-.6,.12,context.parapetHeight,12.9,walls)
  box(7.74,.6,-.6,.12,context.parapetHeight,12.9,walls)
  box(0,.6,-6.99,15.6,context.parapetHeight,.12,walls)
  // Model the visible L-shaped stair flights. Riser heights and lower continuations
  // are approximate because the supplied drawing is cropped at the bottom.
  context.stairs.forEach(([a,b,c,d],flight)=>{
    const horizontal=b-a>d-c, count=horizontal?14:9
    for(let i=0;i<count;i++){
      const top=flight===0?-1.8+(i+1)/count*1.8:-i/count*1.8
      const height=top+1.92
      box(horizontal?a+(i+.5)*(b-a)/count:(a+b)/2,-1.92+height/2,
        horizontal?(c+d)/2:c+(i+.5)*(d-c)/count,
        horizontal?(b-a)/count:b-a,height,horizontal?d-c:(d-c)/count,stairs)
    }
  })
  // Preserve the toilet block as architectural cubicles with real openings.
  // No invented fixture/furniture artwork is added to these unreferenced areas.
  const cubicleWalls=new Set()
  const cubicleWall=(...args)=>{
    const key=args.join(',')
    if(cubicleWalls.has(key))return
    cubicleWalls.add(key);box(...args,walls)
  }
  context.toilets.forEach(([a,b,c,d],index)=>{
    const height=2.6, mid=(c+d)/2, doorSide=index===2?a:b
    // The first cubicle reuses Room 1's front boundary; neighbouring cubicles
    // share one dividing wall instead of emitting it twice.
    if(c!==FOOTPRINT.maxZ)cubicleWall((a+b)/2,height/2,c,b-a,height,.1)
    cubicleWall((a+b)/2,height/2,d,b-a,height,.1)
    cubicleWall(index===2?b:a,height/2,mid,.1,height,d-c)
    for(const [lo,hi] of [[c,mid-.35],[mid+.35,d]])if(hi>lo)cubicleWall(doorSide,height/2,(lo+hi)/2,.1,height,hi-lo)
    cubicleWall(doorSide,2.4,mid,.1,.4,.7)
  })
  scene.userData.buildingContext=context
}
