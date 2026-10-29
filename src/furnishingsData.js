// Supplementary usable pieces, styled from the originals, not replacements for
// photographed furniture. All sizes are approximate; keep the central aisle free.
// Nothing stands in front of a photo that already shows the same kind of piece,
// and nothing sits inside a tour camera's sightline to its photograph.
export const FURNISHINGS = [
  {id:'portrait-bench',kind:'bench',x:2.3,z:-4.65,width:1.5,depth:.56,source:'terracotta'},
  {id:'makeup-stool',kind:'stool',x:.99,z:3.62,width:.44,depth:.44,source:'makeup'},
  {id:'makeup-vanity',kind:'vanity',x:1.31,z:3.59,yaw:Math.PI/2,width:.72,depth:.26,source:'makeup'},
  // Beside the sweep, aimed across the set toward the backdrop (local +Z).
  {id:'studio-softbox',kind:'softbox',x:-3.5,z:4.35,yaw:.95,width:.7,depth:.7,source:'studio'},
]
export function furnitureBounds(item){
  const turned=Math.abs(Math.sin(item.yaw||0))>.5,w=turned?item.depth:item.width,d=turned?item.width:item.depth
  return [item.x-w/2,item.x+w/2,item.z-d/2,item.z+d/2]
}
