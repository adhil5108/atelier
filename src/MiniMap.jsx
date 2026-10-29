import { useId } from 'react'
import { BUILDING_CONTEXT, COLUMN_SIZE, ENTRANCE, FOOTPRINT, MAKEUP_ENTRANCE, SPACES, STRUCTURAL_COLUMNS, WALLS } from './layout.js'
import { REFERENCE_SURFACES } from './references.js'
import { FURNISHINGS, furnitureBounds } from './furnishingsData.js'

export default function MiniMap({position,active,onJump,large=false}) {
  const id=useId(),scale=15.2
  const px=x=>(x-BUILDING_CONTEXT.bounds.minX)*scale+12,pz=z=>(z-BUILDING_CONTEXT.bounds.minZ)*scale+12
  const path=points=>points.map(([x,z],i)=>`${i?'L':'M'}${px(x)},${pz(z)}`).join(' ')+' Z'
  const contour=path(FOOTPRINT.outline)
  const rect=([a,b,c,d],props={})=><rect x={px(a)} y={pz(c)} width={(b-a)*scale} height={(d-c)*scale} {...props}/>
  return <svg className={`mini-map ${large?'large':''}`} viewBox="0 0 262 276" role="img" aria-label="Studio Room 1 and surrounding building: Room 2, 120 centimetre verandah, stairs and toilets. Select a numbered studio space to visit.">
    <defs><clipPath id={`${id}-footprint`}><path d={contour}/></clipPath></defs>
    {BUILDING_CONTEXT.verandahs.map((r,i)=><g key={`verandah-${i}`}>{rect(r,{fill:'#e7ebdf',stroke:'#c9cebd',strokeWidth:.6})}</g>)}
    <text x={px(0)} y={pz(-6.3)} fontSize="5.5" textAnchor="middle" fill="#849073" letterSpacing=".6">120 cm VERANDAH</text>
    <path d={path(BUILDING_CONTEXT.room2)} fill="#e0ddd4" stroke="#aaa99d" strokeWidth="1"/>
    <text x={px(4.5)} y={pz(3.4)} fontSize="7" textAnchor="middle" fill="#8e9082">ROOM 2</text>
    <text x={px(4.5)} y={pz(3.95)} fontSize="4.5" textAnchor="middle" fill="#9a9c8f">BUILDING CONTEXT</text>
    {rect(BUILDING_CONTEXT.landing,{fill:'#eeece2',stroke:'#c7c9b9',strokeWidth:.5})}
    {BUILDING_CONTEXT.stairs.map((r,i)=>{
      const [a,b,c,d]=r,horizontal=b-a>d-c
      return <g key={`stairs-${i}`}>{rect(r,{fill:'#e6e7dc',stroke:'#b9beab',strokeWidth:.6})}
        {Array.from({length:horizontal?13:8},(_,n)=>horizontal?<path key={n} d={`M${px(a+(n+1)*(b-a)/14)},${pz(c)} V${pz(d)}`} stroke="#b8beaa" strokeWidth=".5"/>:<path key={n} d={`M${px(a)},${pz(c+(n+1)*(d-c)/9)} H${px(b)}`} stroke="#b8beaa" strokeWidth=".5"/>)}
      </g>
    })}
    {BUILDING_CONTEXT.toilets.map((r,i)=><g key={`wc-${i}`}>{rect(r,{fill:'#dce0d0',stroke:'#939d81',strokeWidth:.7})}<text x={px((r[0]+r[1])/2)} y={pz((r[2]+r[3])/2)+2} textAnchor="middle" fontSize="5" fill="#768164">WC</text></g>)}
    <text x={px(-4.35)} y={pz(7.48)} fontSize="5.3" textAnchor="middle" fill="#8b927d">STAIRS ↑</text>
    <text x={px(4.35)} y={pz(7.48)} fontSize="5.3" textAnchor="middle" fill="#8b927d">STAIRS ↓</text>
    <path d={contour} fill="#f5f2e9"/>
    <g clipPath={`url(#${id}-footprint)`}>
      {SPACES.map(s=>{const [a,b,c,d]=s.bounds;return <rect key={s.id} x={px(a)+1} y={pz(c)+1} width={(b-a)*scale-2} height={(d-c)*scale-2} rx="2" fill={active===s.id?'#dde2cf':'#efede4'}/>})}
      {WALLS.map((r,i)=><g key={i}>{rect(r,{fill:'#757f65'})}</g>)}
      {MAKEUP_ENTRANCE.walls.map((r,i)=><g key={`makeup-return-${i}`}>{rect(r,{fill:'#757f65'})}</g>)}
      {FURNISHINGS.map(item=><g key={item.id}><title>{item.id.replaceAll('-',' ')}</title>{rect(furnitureBounds(item),{fill:'#c6b59b',stroke:'#9f8e73',strokeWidth:.35,rx:1})}</g>)}
      <path d={`M${px(MAKEUP_ENTRANCE.openingBounds[0])},${pz(MAKEUP_ENTRANCE.openingZ)} H${px(MAKEUP_ENTRANCE.openingBounds[1])}`} stroke="#9c927c" strokeWidth=".6" strokeDasharray="2 2"/>
      {REFERENCE_SURFACES.map(s=>{const dx=Math.cos(s.yaw)*s.width/2,dz=-Math.sin(s.yaw)*s.width/2;return <path key={s.image} d={`M${px(s.x-dx)},${pz(s.z-dz)} L${px(s.x+dx)},${pz(s.z+dz)}${s.cornerFraction?` M${px(s.x-(s.cornerSide==='right'?-dx:dx))},${pz(s.z-(s.cornerSide==='right'?-dz:dz))} L${px(s.x-(s.cornerSide==='right'?-dx:dx)+Math.sin(s.yaw)*s.photoWidth*s.cornerFraction)},${pz(s.z-(s.cornerSide==='right'?-dz:dz)+Math.cos(s.yaw)*s.photoWidth*s.cornerFraction)}`:''}`} stroke="#aba18c" strokeWidth="1"/>})}
      {STRUCTURAL_COLUMNS.map(([x,z],i)=><g key={`column-${i}`}>{rect([x-COLUMN_SIZE/2,x+COLUMN_SIZE/2,z-COLUMN_SIZE/2,z+COLUMN_SIZE/2],{fill:'#757f65'})}</g>)}
    </g>
    {SPACES.map(s=>{
      const [a,b,c,d]=s.bounds,[mx,mz]=s.mapPosition||[(a+b)/2,(c+d)/2],x=px(mx),y=pz(mz)
      return <g key={s.id} role="button" tabIndex="0" aria-label={`Visit ${s.name}`} onClick={()=>onJump(s.id)} onKeyDown={e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();onJump(s.id)}}} className="map-pin">
        <rect x={x-12} y={y-12} width="24" height="24" fill="transparent"/>
        <circle cx={x} cy={y} r={large?9:8} fill={active===s.id?'#46533d':'#f8f5ed'}/>
        <text x={x} y={y+3} fontSize="7.5" textAnchor="middle" fill={active===s.id?'#fff':'#68705d'} fontFamily="Arial">{s.number}</text>
      </g>
    })}
    {position&&<g transform={`translate(${px(position.x)},${pz(position.z)}) rotate(${-position.yaw*180/Math.PI})`}><path d="M 0 0 L -12 -21 Q 0 -28 12 -21 Z" fill="#7c8a61" opacity=".2"/><circle r="4" fill="#7a8958" stroke="#fff" strokeWidth="1.5"/><path d="M 0 -7 L -2 -3 L 2 -3 Z" fill="#46533d"/></g>}
    <path d={`M${px(ENTRANCE.x)},${pz(ENTRANCE.z)+7} v-11 m-3 3 l3-3 3 3`} fill="none" stroke="#71835b" strokeWidth="1.1"/>
    <text x={px(ENTRANCE.x)} y={pz(6.7)} fontSize="4.5" textAnchor="middle" fill="#8a8b7c">ENTRY</text>
    <text x="130" y="272" fontSize="5.5" textAnchor="middle" fill="#8a8b7c" letterSpacing=".5">ROOM 1 · STUDIO TOUR</text>
  </svg>
}
