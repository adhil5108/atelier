// The first-floor drawing supplies the building grid and approximate human scale.
// The highlighted plan specifies which part is ours: ONLY its stepped Room 1 outline.
export const PLAN_REFERENCE = '/references/actual-floor-plan.png'
export const BUILDING_PLAN_REFERENCE = '/references/first floor plan.jpeg'
export const CANVA_PLAN_REFERENCE = '/references/canva placement.png'
export const FOOTPRINT = {
  minX: -6.6, maxX: 6.6, minZ: -5.85, maxZ: 5.85, height: 3.25,
  outline: [[-6.6,-5.85],[6.6,-5.85],[6.6,.15],[3.2,.15],[3.2,1.85],[1.6,1.85],[1.6,5.85],[-6.6,5.85]],
}
// The building drawing shows access near the center of its lower edge. Door width
// and alignment to the Room 1 selection remain approximate. The Canva collage
// locates reception at the front-left but does not dimension an entrance opening.
export const ENTRANCE = { x: .65, z: FOOTPRINT.maxZ, width: 1.4 }
// Start just past the left turn from the building doorway, looking into Room 1
// rather than into the rear of the inward-facing makeup entrance.
export const ENTRANCE_VIEW = { position:[-1.7,4.8], target:[-3.5,1.45,-2.5] }
// The supplied modified plan, "canva placement.png", confirms the front group
// after a clockwise rotation. Makeup approaches from Room 1, before Room 2.
// Its exact opening/depth are not dimensioned. Keep the whole recess inside Room 1.
export const MAKEUP_ENTRANCE = {
  x:.15, photoZ:4.068, openingZ:3.05, rearZ:4.23, width:2.4, openingHeight:2.88, openingBounds:[-1.05,1.44],
  yaw:Math.PI, position:[.95,1.25], target:[.15,1.44,4.05],
  // The existing Room 2 wall supplies the right side; do not duplicate it.
  walls:[[-1.21,-1.05,3.05,4.07],[-1.21,1.44,4.07,4.23]],
}
// Solid marks on the 330 x 390 cm bay grid in the first-floor drawing.
// Positions follow that grid; the 30 cm column section is an assumption.
export const STRUCTURAL_COLUMNS = [
  [-6.44,-1.95],[0,-1.95],[6.44,-1.95],
  [-6.44,1.95],[-3.3,1.95],[0,1.95],[3.3,1.95],[6.44,1.95],
  [-.22,5.7], // Lower central support aligned beside the assumed entrance jamb.
]
export const COLUMN_SIZE = .3
export const BUILDING_CONTEXT = {
  verandahWidth:1.2, parapetHeight:1.2,
  bounds:{minX:-7.8,maxX:7.8,minZ:-7.05,maxZ:9.3},
  room2:[[1.6,5.85],[1.6,1.85],[3.2,1.85],[3.2,.15],[6.6,.15],[6.6,5.85]],
  // [left,right,back,front], traced approximately from the first-floor drawing.
  verandahs:[[-7.8,-6.6,-7.05,5.85],[-6.6,6.6,-7.05,-5.85],[6.6,7.8,-7.05,5.85]],
  landing:[-2.1,2.1,5.85,9.3],
  stairs:[[-6.6,-2.1,5.85,7.05],[2.1,6.6,5.85,7.05],[-3.3,-2.1,7.05,9.3],[2.1,3.3,7.05,9.3]],
  toilets:[[-2.1,-.5,5.85,6.95],[-2.1,-.5,6.95,8.05],[1,2.1,6.95,8.05]],
}
export const EYE_HEIGHT = 1.62
const photo = (name) => `/references/WhatsApp Image 2026-10-25 at ${name}.jpeg`

export const SPACES = [
  { id:'reception',number:'01',name:'Entrance & reception',short:'Reception',kind:'WELCOME',description:'The complete reception reference occupies the front-left, as shown in the Canva placement collage. The photographs do not determine room dimensions.',position:[-5,2.8],target:[-5,1.45,5.55],photo:photo('7.26.04 PM'),tag:'A warm welcome',bounds:[-6.6,1.6,1.95,5.85],mapPosition:[-5,4.3]},
  { id:'studio',number:'02',name:'Photography studio',short:'Photo studio',kind:'CREATE',description:'The original photography-studio photograph covers its complete front wall beside reception, following the Canva collage.',position:[-2,3.1],target:[-1.9,1.3,5.65],photo:photo('7.26.04 PM (1)'),tag:'A blank canvas',bounds:[-3.4,-.3,1.95,5.85],mapPosition:[-1.9,4.25]},
  { id:'makeup',number:'03',name:'Makeup & dressing',short:'Makeup room',kind:'PREPARE',description:'An inward-facing entrance recess in Room 1, before Room 2. The complete makeup photograph covers the terminal wall of the approach; Room 2 remains closed.',position:MAKEUP_ENTRANCE.position,target:MAKEUP_ENTRANCE.target,photo:photo('7.26.04 PM (2)'),tag:'Before the spotlight',bounds:[-1.3,1.6,.7,3.6],mapPosition:[MAKEUP_ENTRANCE.x,MAKEUP_ENTRANCE.openingZ]},
  { id:'classic',number:'04',name:'The ivory salon',short:'Ivory salon',kind:'WEDDING SET',description:'The original ivory salon reference is placed by the upper Room 2 step, following its position in the Canva collage.',position:[4.8,-2.75],target:[4.8,1.4,-.02],photo:photo('7.26.04 PM (3)'),tag:'Timeless romance',bounds:[3.2,6.6,-2.95,.15],mapPosition:[4.8,-.9]},
  { id:'velvet', number:'05', name:'Crimson story', short:'Crimson story', kind:'WEDDING SET', description:'The original crimson photograph covers the complete wall, with the curtains and folds left unchanged.', position:[-1.3,-2.8], target:[-1.3,1.5,-5.65], photo:photo('7.26.06 PM (2)'), tag:'A little drama', bounds:[-3.1,.52,-5.85,-1.95] },
  { id:'terracotta',number:'06',name:'Terracotta muse',short:'Terracotta muse',kind:'PORTRAIT SET',description:'The full original terracotta wall occupies the back-middle, preserving its Canva zone.',position:[2.33,-2.8],target:[2.33,1.5,-5.65],photo:photo('7.26.06 PM (1)'),tag:'Earth & intimacy',bounds:[.52,4.14,-5.85,-2.1]},
  { id:'rattan',number:'07',name:'The natural edit',short:'Natural edit',kind:'PORTRAIT SET',description:'The cane seating and nearby console photographs occupy the back-left, following the supplied placement collage.',position:[-4.75,-2.8],target:[-4.75,1.4,-5.55],photo:photo('7.26.07 PM'),tag:'Naturally together',bounds:[-6.6,-3.4,-5.85,-1.95]},
  { id:'boho',number:'08',name:'The bohemian nook',short:'Bohemian nook',kind:'DAYLIGHT SET',description:'The bench and olive-curtain originals cover the two separate walls meeting at the back-right corner.',position:[5.27,-2.8],target:[5.27,1.5,-5.65],photo:photo('7.26.06 PM'),tag:'Soft light, slow moments',bounds:[4.14,6.6,-5.85,-2.6]},
  { id:'daylight',number:'09',name:'Golden hour',short:'Golden hour',kind:'DAYLIGHT SET',description:'The complete swing reference shares the existing left perimeter with the sofa. The original plan has no central partition; this wall location was confirmed by the user.',position:[-3.5,3.56],target:[-6.438,1.15,3.56],photo:photo('7.26.08 PM (1)'),tag:'Chasing the light',bounds:[-6.6,-2.5,2.14,4.98],mapPosition:[-5.3,2.8]},
]

// All rectangles are inset from the polygon. Leave only the assumed entrance opening.
export const PERIMETER_WALLS = [
  [-6.6, -6.44, -5.85, 5.85], [6.44, 6.6, -5.85, .15], [-6.6, 6.6, -5.85, -5.69],
  [3.2, 6.6, -.01, .15], [3.04, 3.2, -.01, 1.85],
  [1.6, 3.2, 1.69, 1.85], [1.44, 1.6, 1.69, 5.85],
  [-6.6, ENTRANCE.x - ENTRANCE.width / 2, 5.69, 5.85], [ENTRANCE.x + ENTRANCE.width / 2, 1.6, 5.69, 5.85],
]
// X/Z rectangles share the exact architecture used by the renderer and map.
export const WALLS = [...PERIMETER_WALLS]

export function containsPoint(x, z, outline = FOOTPRINT.outline) {
  let inside = false
  for (let i = 0, j = outline.length - 1; i < outline.length; j = i++) {
    const [ax, az] = outline[i], [bx, bz] = outline[j]
    if ((az > z) !== (bz > z) && x < (bx - ax) * (z - az) / (bz - az) + ax) inside = !inside
  }
  return inside
}

export function insideFootprint(x, z, radius = 0) {
  if (!containsPoint(x, z)) return false
  // Distance to every contour segment also protects the re-entrant step corners.
  if (radius > 0) for (let i = 0; i < FOOTPRINT.outline.length; i++) {
    const [ax, az] = FOOTPRINT.outline[i], [bx, bz] = FOOTPRINT.outline[(i + 1) % FOOTPRINT.outline.length]
    const dx = bx - ax, dz = bz - az
    const t = Math.max(0, Math.min(1, ((x - ax) * dx + (z - az) * dz) / (dx * dx + dz * dz)))
    if (Math.hypot(x - ax - t * dx, z - az - t * dz) < radius) return false
  }
  return true
}

export function isFree(x, z, colliders = WALLS, radius = .22) {
  if (!insideFootprint(x, z, radius)) return false
  return !colliders.some(([x1, x2, z1, z2]) => x > x1 - radius && x < x2 + radius && z > z1 - radius && z < z2 + radius)
}

export function moveWithCollision(position, dx, dz, colliders) {
  // Small substeps prevent tunnelling even at low frame rates; separate axes let the player slide along walls.
  const steps = Math.max(1, Math.ceil(Math.hypot(dx, dz) / .08))
  let { x, z } = position
  for (let i = 0; i < steps; i++) {
    if (isFree(x + dx / steps, z, colliders)) x += dx / steps
    if (isFree(x, z + dz / steps, colliders)) z += dz / steps
  }
  return { x, z }
}

export function spaceAt(x, z) {
  // Overlapping display zones are not physical partitions. Prefer the nearest
  // viewpoint within them, so the open makeup/reception area keeps correct labels.
  return SPACES.filter(({bounds:[a,b,c,d]})=>x>=a&&x<=b&&z>=c&&z<=d)
    .sort((a,b)=>Math.hypot(x-a.position[0],z-a.position[1])-Math.hypot(x-b.position[0],z-b.position[1]))[0]?.id || 'reception'
}

// Keep guided movement away from columns and reveal edges. Manual movement keeps
// its smaller body radius, so the doorway recess remains independently explorable.
export function findPath(start, end, colliders, clearance = .5) {
  const step = .2, width = Math.ceil((FOOTPRINT.maxX - FOOTPRINT.minX) / step) + 1, height = Math.ceil((FOOTPRINT.maxZ - FOOTPRINT.minZ) / step) + 1
  const point = (i) => ({ x: FOOTPRINT.minX + (i % width) * step, z: FOOTPRINT.minZ + Math.floor(i / width) * step })
  const nearest = (p) => {
    let best = -1, distance = Infinity
    for (let i = 0; i < width * height; i++) {
      const q = point(i), d = (p.x - q.x) ** 2 + (p.z - q.z) ** 2
      if (d < distance && isFree(q.x, q.z, colliders, clearance)) { distance = d; best = i }
    }
    return best
  }
  const from = nearest(start), to = nearest(end)
  if (from < 0 || to < 0) return []
  const open = new Set([from]), previous = new Map(), cost = new Map([[from, 0]])
  const goal = point(to)
  const score = (i) => { const p = point(i); return cost.get(i) + Math.hypot(p.x - goal.x, p.z - goal.z) }
  while (open.size) {
    let current = -1, best = Infinity
    for (const i of open) { const s = score(i); if (s < best) { best = s; current = i } }
    if (current === to) {
      const path = [point(to)]
      while (previous.has(current)) { current = previous.get(current); path.unshift(point(current)) }
      // Include the exact endpoint only if it is free; destinations are all walkable.
      if (isFree(end.x, end.z, colliders, clearance)) path.push(end)
      return path
    }
    open.delete(current)
    for (const delta of [-1, 1, -width, width]) {
      const n = current + delta
      if (n < 0 || n >= width * height || (Math.abs(delta) === 1 && Math.floor(n / width) !== Math.floor(current / width))) continue
      const p = point(n)
      if (!isFree(p.x, p.z, colliders, clearance)) continue
      const nextCost = cost.get(current) + step
      if (nextCost < (cost.get(n) ?? Infinity)) { cost.set(n, nextCost); previous.set(n, current); open.add(n) }
    }
  }
  return []
}
