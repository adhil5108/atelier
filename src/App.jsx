import { lazy, Suspense, useCallback, useEffect, useRef, useState } from 'react'
import { ArrowDown, ArrowLeft, ArrowRight, ArrowUp, Check, ChevronDown, ChevronLeft, ChevronRight, Compass, Expand, Flower2, Focus, Footprints, HelpCircle, Map, Maximize, Menu, MousePointer2, Move, Navigation, Pause, Play, RotateCcw, Settings2, Sun, X } from 'lucide-react'
import MiniMap from './MiniMap.jsx'
import { BUILDING_PLAN_REFERENCE, CANVA_PLAN_REFERENCE, ENTRANCE_VIEW, PLAN_REFERENCE, SPACES } from './layout.js'

const Walkthrough=lazy(()=>import('./Walkthrough.jsx'))

const IconButton=({label,children,...props})=><button className="icon-button" title={label} aria-label={label} {...props}>{children}</button>
const groups=[['THE STUDIO',SPACES.slice(0,3)],['THE PHOTOGRAPHY SETS',SPACES.slice(3)]]

function Dialog({title,eyebrow,children,onClose,wide=false}) {
  const dialog=useRef(null)
  useEffect(()=>{
    const previous=document.activeElement;dialog.current?.focus()
    function onKey(e){
      if(e.key==='Escape')onClose()
      if(e.key==='Tab'){
        const focusable=dialog.current.querySelectorAll('button,a[href],input,select,[tabindex="0"]'),first=focusable[0],last=focusable[focusable.length-1]
        if(e.shiftKey&&document.activeElement===first){e.preventDefault();last.focus()}
        else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus()}
      }
    }
    document.addEventListener('keydown',onKey)
    return()=>{document.removeEventListener('keydown',onKey);previous?.focus()}
  },[onClose])
  return <div className="modal-shade" onClick={e=>{if(e.target===e.currentTarget)onClose()}}><section ref={dialog} tabIndex="-1" className={`dialog ${wide?'wide':''}`} role="dialog" aria-modal="true" aria-labelledby="dialog-title">
    <IconButton label="Close dialog" onClick={onClose}><X size={20}/></IconButton>
    <span className="eyebrow">{eyebrow}</span><h2 id="dialog-title">{title}</h2>{children}
  </section></div>
}

export default function App(){
  const viewer=useRef(null),viewport=useRef(null)
  const [active,setActive]=useState('reception'),[position,setPosition]=useState({x:ENTRANCE_VIEW.position[0],z:ENTRANCE_VIEW.position[1],yaw:0}),[ready,setReady]=useState(false),[locked,setLocked]=useState(false)
  const [tour,setTour]=useState({active:false,paused:false,index:0,traveling:false}),[modal,setModal]=useState(null),[sidebar,setSidebar]=useState(false),[map,setMap]=useState(true)
  const [high,setHigh]=useState(true),[warm,setWarm]=useState(true),[fullscreen,setFullscreen]=useState(false),[error,setError]=useState(''),[toast,setToast]=useState(''),[hint,setHint]=useState(true)
  const space=SPACES.find(s=>s.id===active)||SPACES[0]
  useEffect(()=>{if(!toast)return;const t=setTimeout(()=>setToast(''),3000);return()=>clearTimeout(t)},[toast])
  useEffect(()=>{const f=()=>setFullscreen(Boolean(document.fullscreenElement));document.addEventListener('fullscreenchange',f);return()=>document.removeEventListener('fullscreenchange',f)},[])
  useEffect(()=>{if(locked)setHint(false)},[locked])
  useEffect(()=>{if(modal){document.exitPointerLock?.();viewer.current?.move(0,0)}},[modal])
  function jump(id){viewer.current?.jump(id);setActive(id);setSidebar(false);setHint(false)}
  function reset(){viewer.current?.reset();setHint(true);setToast('Back at the entrance. Make yourself at home.')}
  async function toggleFullscreen(){try{if(document.fullscreenElement)await document.exitFullscreen();else await viewport.current.requestFullscreen()}catch{setToast('Full screen is unavailable in this browser.')}}
  function startTour(){setHint(false);viewer.current?.tour();setSidebar(false)}
  function touchMove(e,x,z){e.preventDefault();e.currentTarget.setPointerCapture(e.pointerId);viewer.current?.move(x,z)}
  const closeModal=useCallback(()=>setModal(null),[])
  return <div className="app-shell">
    <aside className={`sidebar ${sidebar?'is-open':''}`}>
      <a href="#" className="brand" onClick={e=>{e.preventDefault();reset()}} aria-label="Atelier — return to reception"><span className="brand-symbol">A<span/></span><span>ATELIER<small>THE MARRIAGE STUDIO</small></span></a>
      <button className="mobile-close icon-button" aria-label="Close navigation" onClick={()=>setSidebar(false)}><X size={20}/></button>
      <div className="sidebar-heading"><span className="eyebrow">A SPACE FOR YOUR STORY</span><h1>Every corner.<br/><em>A new beginning.</em></h1><p>Step inside our thoughtfully crafted<br className="desktop-break"/> wedding & portrait studio.</p></div>
      <div className="explore-label"><span>EXPLORE THE SPACE</span><span>09</span></div>
      <nav aria-label="Studio spaces">
        {groups.map(([name,items])=><div className="nav-group" key={name}><div className="nav-group-title">{name}</div>{items.map(s=><button className={`space-link ${active===s.id?'active':''}`} key={s.id} onClick={()=>jump(s.id)}><span className="space-number">{s.number}</span><span>{s.short}</span>{active===s.id?<span className="active-dot"/>:<ChevronRight size={13}/>}</button>)}</div>)}
      </nav>
      <div className="sidebar-bottom"><div className="private-tour"><Flower2 size={19} strokeWidth={1.2}/><div>Designed for beautiful moments.<span>Come in. Feel inspired.</span></div></div><div className="sidebar-footer"><span>ATELIER STUDIO © 2026</span><button onClick={()=>setModal('about')}>About this space <ArrowRight size={12}/></button></div></div>
    </aside>
    {sidebar&&<button className="sidebar-scrim" onClick={()=>setSidebar(false)} aria-label="Close navigation"/>}
    <main className="main-content">
      <header className="topbar"><div className="breadcrumb"><button className="mobile-menu icon-button" aria-label="Open navigation" onClick={()=>setSidebar(true)}><Menu size={20}/></button><span>THE EXPERIENCE</span><ChevronRight size={12}/><strong>Studio walkthrough</strong></div><div className="topbar-right"><span className="live-badge"><i/> INTERACTIVE 3D TOUR</span><button className="help-button" onClick={()=>setModal('help')}><HelpCircle size={15}/><span>How to explore</span></button></div></header>
      <section className="experience-header"><div><div className="eyebrow">EXPLORE AT YOUR OWN PACE</div><h2>Your story starts here<span>.</span></h2></div><p>Beautiful spaces. Endless possibilities.<br/>Take a look around — you’re welcome here.</p></section>
      <div className={`viewport ${locked?'is-locked':''}`} ref={viewport}>
        <Suspense fallback={null}><Walkthrough ref={viewer} onReady={()=>setReady(true)} onPosition={setPosition} onSpace={setActive} onLock={setLocked} onTour={setTour} onError={setError}/></Suspense>
        {!ready&&!error&&<div className="loading"><span className="loading-mark">A</span><p>Opening the doors<span>Preparing your studio experience</span></p><i/></div>}
        {error&&<div className="error-panel"><Focus size={28}/><h3>A moment to reconnect</h3><p>{error}</p><button className="primary-button" onClick={()=>window.location.reload()}>Reload the experience</button></div>}
        <div className="viewport-top"><div className="view-label"><span className="status-dot"/>{tour.active?'GUIDED WALKTHROUGH':'WALKTHROUGH MODE'}<span className="view-label-divider"/> <span>{warm?'WARM DAYLIGHT':'BRIGHT DAYLIGHT'}</span></div><div className="view-tools"><IconButton label="View floor plan" onClick={()=>setModal('map')}><Map size={17}/></IconButton><IconButton label="Display settings" onClick={()=>setModal('settings')}><Settings2 size={17}/></IconButton><IconButton label={fullscreen?'Exit full screen':'Enter full screen'} onClick={toggleFullscreen}><Maximize size={17}/></IconButton></div></div>
        <div className="room-caption"><span className="caption-number">{space.number}</span><div><span className="eyebrow">{space.kind}</span><h3>{space.name}</h3></div></div>
        {!locked&&hint&&ready&&!tour.active&&!error&&<div className="look-hint"><div className="look-icon"><Move size={23} strokeWidth={1.3}/></div><div><strong>Around you, a little inspiration.</strong><span>Drag to look around · WASD to move</span></div><button onClick={()=>{viewer.current?.enter();setHint(false)}}>Step inside <ArrowRight size={15}/></button><button className="hint-close" onClick={()=>setHint(false)} aria-label="Dismiss movement hint"><X size={13}/></button></div>}
        {locked&&<><div className="crosshair"/><div className="lock-hint">Press <kbd>esc</kbd> to release your mouse</div></>}
        <div className="viewport-bottom"><div className="room-tag"><span/>{space.tag}</div><div className="bottom-view-actions"><button onClick={()=>setModal('reference')}><Focus size={14}/> View inspiration</button><span/><button onClick={reset} title="Reset view (R)"><RotateCcw size={15}/><span className="reset-label">Reset view</span></button></div></div>
        {map&&!locked&&<div className="map-card"><div className="map-card-header"><span><Navigation size={11}/> YOU ARE HERE</span><button onClick={()=>setMap(false)} aria-label="Hide mini map"><ChevronDown size={14}/></button></div><MiniMap position={position} active={active} onJump={jump}/><div className="map-card-footer"><span><i/> {space.short}</span><button onClick={()=>setModal('map')} aria-label="Expand floor plan"><Expand size={12}/></button></div></div>}
        {!map&&!locked&&<button className="show-map" onClick={()=>setMap(true)}><Map size={15}/> Floor plan</button>}
        <div className="touch-controls" aria-label="Touch movement"><button aria-label="Walk forward" onPointerDown={e=>touchMove(e,0,-1)} onPointerUp={()=>viewer.current?.move(0,0)} onPointerCancel={()=>viewer.current?.move(0,0)}><ArrowUp size={19}/></button><div><button aria-label="Walk left" onPointerDown={e=>touchMove(e,-1,0)} onPointerUp={()=>viewer.current?.move(0,0)} onPointerCancel={()=>viewer.current?.move(0,0)}><ArrowLeft size={19}/></button><button aria-label="Walk backward" onPointerDown={e=>touchMove(e,0,1)} onPointerUp={()=>viewer.current?.move(0,0)} onPointerCancel={()=>viewer.current?.move(0,0)}><ArrowDown size={19}/></button><button aria-label="Walk right" onPointerDown={e=>touchMove(e,1,0)} onPointerUp={()=>viewer.current?.move(0,0)} onPointerCancel={()=>viewer.current?.move(0,0)}><ArrowRight size={19}/></button></div></div>
        {toast&&<div className="toast" role="status"><Check size={15}/>{toast}</div>}
      </div>
      <section className="tour-bar"><div className="tour-intro"><div className="tour-icon"><Footprints size={21} strokeWidth={1.5}/></div><div><h3>{tour.active?(tour.paused?'Take a moment.':'Let us show you around.'):'A little guidance, if you like.'}</h3><p>{tour.active?`${tour.traveling?'Walking to':'Exploring'} ${SPACES[tour.index].short.toLowerCase()} · Stop ${tour.index+1} of ${SPACES.length}`:'Discover every space with a curated walkthrough.'}</p></div></div>{tour.active?<div className="tour-controls"><IconButton label="Previous tour stop" disabled={tour.index===0} onClick={()=>viewer.current?.next(-1)}><ChevronLeft size={17}/></IconButton><button className="primary-button" onClick={()=>viewer.current?.pause()}>{tour.paused?<Play size={14}/>:<Pause size={14}/>} {tour.paused?'Resume tour':'Pause tour'}</button><IconButton label="Next tour stop" disabled={tour.index===SPACES.length-1} onClick={()=>viewer.current?.next(1)}><ChevronRight size={17}/></IconButton><IconButton label="End guided tour" onClick={()=>viewer.current?.stop()}><X size={16}/></IconButton></div>:<button className="primary-button start-tour" onClick={startTour} disabled={!ready}><Play size={14} fill="currentColor"/> Start guided tour <ArrowRight size={16}/></button>}</section>
      <footer className="experience-footer"><div><span className="key-cluster"><kbd>W</kbd><span><kbd>A</kbd><kbd>S</kbd><kbd>D</kbd></span></span><span>Move around</span><span className="footer-divider"/><MousePointer2 size={14}/><span>Drag to look</span><span className="footer-divider"/><kbd>R</kbd><span>Reset position</span></div><span><span className="small-dot"/> MADE TO BE EXPLORED</span></footer>
    </main>
    {modal==='help'&&<Dialog title="Make yourself at home." eyebrow="A FEW SIMPLE CONTROLS" onClose={closeModal}><p>Walk through the studio freely, select a room from the menu, or let the guided tour lead the way.</p><div className="help-grid"><div><Move/><strong>Move around</strong><p>W A S D or the arrow keys.<br/>Hold Shift to walk faster.</p></div><div><MousePointer2/><strong>Take a look</strong><p>Drag anywhere in the 3D view.<br/>“Step inside” locks mouse-look.</p></div><div><Compass/><strong>Find your way</strong><p>Choose any numbered room<br/>on the floor plan to jump there.</p></div><div><RotateCcw/><strong>Start afresh</strong><p>Press R to return to reception.<br/>Esc releases your mouse.</p></div></div><div className="dialog-note">On a phone or tablet, drag to look and use the on-screen arrows to walk. The guided tour pauses when you leave this tab.</div><button className="primary-button" onClick={closeModal}>I’m ready to explore <ArrowRight size={16}/></button></Dialog>}
    {modal==='map'&&<Dialog title="A place for every moment." eyebrow="THE STUDIO FLOOR PLAN" onClose={closeModal} wide><div className="floorplan-layout"><MiniMap position={position} active={active} large onJump={id=>{jump(id);setModal(null)}}/><div>{SPACES.map(s=><button className={`plan-room ${s.id===active?'selected':''}`} key={s.id} onClick={()=>{jump(s.id);setModal(null)}}><span>{s.number}</span><div><strong>{s.name}</strong><small>{s.kind.toLowerCase()}</small></div><ArrowRight size={15}/></button>)}</div></div><div className="dialog-note">The studio tour stays in Room 1. Room 2, stairs, toilets and the 120 cm verandah are shown as surrounding building context. Photos follow the Canva placement collage; their display sizes are illustrative. <a href={BUILDING_PLAN_REFERENCE} target="_blank" rel="noreferrer">Building plan ↗</a> · <a href={PLAN_REFERENCE} target="_blank" rel="noreferrer">Room 1 selection ↗</a> · <a href={CANVA_PLAN_REFERENCE} target="_blank" rel="noreferrer">Canva placement ↗</a></div></Dialog>}
    {modal==='settings'&&<Dialog title="Set the atmosphere." eyebrow="YOUR VIEWING EXPERIENCE" onClose={closeModal}><div className="setting-row"><div><strong>Lighting</strong><p>{warm?'Soft, warm studio daylight':'A brighter, neutral daylight balance'}</p></div><button className="setting-select" onClick={()=>{setWarm(!warm);viewer.current?.light(!warm)}}><Sun size={15}/>{warm?'Warm':'Bright'}<ChevronDown size={14}/></button></div><div className="setting-row"><div><strong>High quality rendering</strong><p>Detailed shadows and a sharper image.</p></div><button className={`toggle ${high?'on':''}`} role="switch" aria-checked={high} aria-label="High quality rendering" onClick={()=>{setHigh(!high);viewer.current?.quality(!high)}}><span/></button></div><div className="setting-row"><div><strong>Mini floor plan</strong><p>Keep your bearings as you explore.</p></div><button className={`toggle ${map?'on':''}`} role="switch" aria-checked={map} aria-label="Mini floor plan" onClick={()=>setMap(!map)}><span/></button></div><div className="dialog-note">For smoother movement on older devices, switch off high quality rendering. Your studio experience runs entirely in your browser.</div></Dialog>}
    {modal==='reference'&&<Dialog title={space.name} eyebrow="THE INSPIRATION BEHIND THE SPACE" onClose={closeModal} wide><div className="reference-layout"><img src={space.photo} alt={`Original design reference for ${space.name}`} /><div><span className="reference-tag">{space.kind}</span><h3>{space.tag}</h3><p>{space.description}</p><div className="material-palette"><i style={{background:'#e6ddcb'}}/><i style={{background:'#60694d'}}/><i style={{background:'#ab8353'}}/><i style={{background:'#bca678'}}/><span>A considered palette.</span></div><div className="dialog-note">This supplied photograph is used directly in the walkthrough. Walkable proportions and depth are approximate; the image retains its original lighting and perspective.</div><button className="text-button" onClick={closeModal}>Return to the space <ArrowRight size={15}/></button></div></div></Dialog>}
    {modal==='about'&&<Dialog title="Spaces to fall in love with." eyebrow="WELCOME TO ATELIER" onClose={closeModal}><p>A spacious studio tour displaying all twelve supplied photographs directly, complete and at their original aspect ratios.</p><p>The building follows the first-floor drawing and stepped Room 1 selection. Photo zones follow the Canva placement collage; thumbnail sizes are references rather than room measurements. Room 2, the verandah, stairs and toilets remain visible as building context.</p><div className="dialog-note">Photographs are flat visual references, not reconstructed furniture or a 360° scan. Unmeasured dimensions, exact door alignment and stair heights remain approximate.</div><button className="primary-button" onClick={()=>setModal('map')}>Explore the floor plan <ArrowRight size={15}/></button></Dialog>}
  </div>
}
