import { forwardRef, useEffect, useImperativeHandle, useRef } from 'react'
import * as THREE from 'three'
import { createStudio } from './scene.js'
import { ENTRANCE_VIEW, SPACES, EYE_HEIGHT, moveWithCollision, findPath, spaceAt } from './layout.js'

const Walkthrough = forwardRef(function Walkthrough({ onReady, onPosition, onSpace, onLock, onTour, onError }, ref) {
  const mount = useRef(null), engine = useRef(null)
  const callbacks = useRef({onReady,onPosition,onSpace,onLock,onTour,onError})
  callbacks.current = {onReady,onPosition,onSpace,onLock,onTour,onError}
  useImperativeHandle(ref, () => ({
    jump: id => engine.current?.jump(id),
    enter: () => engine.current?.enter(),
    reset: () => engine.current?.reset(),
    tour: () => engine.current?.startTour(),
    pause: () => engine.current?.pauseTour(),
    stop: () => engine.current?.stopTour(),
    next: n => engine.current?.next(n),
    quality: high => engine.current?.quality(high),
    light: warm => engine.current?.light(warm),
    move: (x,z) => engine.current?.touchMove(x,z),
  }), [])
  useEffect(() => {
    const host=mount.current
    let renderer, studio, raf, observer
    try {
      renderer=new THREE.WebGLRenderer({antialias:true, powerPreference:'high-performance'})
      renderer.setPixelRatio(Math.min(window.devicePixelRatio,1.5))
      renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap
      renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.12
      host.appendChild(renderer.domElement)
      studio=createStudio(renderer)
    } catch(error) {
      renderer?.dispose();callbacks.current.onError?.('This device could not start the 3D view. Enable hardware acceleration or try a WebGL 2 browser.');return
    }
    const canvas=renderer.domElement, camera=new THREE.PerspectiveCamera(62,1,.055,50)
    camera.rotation.order='YXZ'
    const keys=new Set(), touch={x:0,z:0}
    let yaw=0,pitch=0,drag=false,lastX=0,lastY=0,disposed=false,lastTime=performance.now(),lastUpdate=0,currentSpace='reception'
    let atEntrance=false
    function updateLens(){camera.fov=atEntrance&&camera.aspect>1.8?46:62;camera.updateProjectionMatrix()}
    let tour={active:false,paused:false,index:0,path:[],wait:0}, arriveAim=null
    const reduced=window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const tempCamera=new THREE.PerspectiveCamera();tempCamera.rotation.order='YXZ'
    const reportTour = () => callbacks.current.onTour?.({active:tour.active,paused:tour.paused,index:tour.index,traveling:tour.path.length>0})
    function aim(space) {
      tempCamera.position.copy(camera.position);tempCamera.lookAt(...space.target)
      return {yaw:tempCamera.rotation.y,pitch:tempCamera.rotation.x}
    }
    function stopTour() {tour.active=false;tour.path=[];arriveAim=null;reportTour()}
    function jump(id) {
      const space=SPACES.find(s=>s.id===id)||SPACES[0]
      stopTour();keys.clear();touch.x=touch.z=0
      atEntrance=false
      camera.position.set(space.position[0],EYE_HEIGHT,space.position[1]);const a=aim(space);yaw=a.yaw;pitch=a.pitch
      camera.rotation.set(pitch,yaw,0)
      currentSpace=space.id;callbacks.current.onSpace?.(space.id)
      updateLens()
      callbacks.current.onPosition?.({x:camera.position.x,z:camera.position.z,yaw})
      canvas.focus({preventScroll:true})
    }
    function reset(){
      stopTour();keys.clear();touch.x=touch.z=0
      camera.position.set(ENTRANCE_VIEW.position[0],EYE_HEIGHT,ENTRANCE_VIEW.position[1])
      const a=aim(ENTRANCE_VIEW);yaw=a.yaw;pitch=a.pitch;camera.rotation.set(pitch,yaw,0)
      currentSpace='reception';atEntrance=true;updateLens()
      callbacks.current.onSpace?.('reception');callbacks.current.onPosition?.({x:camera.position.x,z:camera.position.z,yaw})
      canvas.focus({preventScroll:true})
    }
    function routeTo(index) {
      tour.index=THREE.MathUtils.clamp(index,0,SPACES.length-1);tour.wait=0
      const s=SPACES[tour.index]
      tour.path=findPath(camera.position,{x:s.position[0],z:s.position[1]},studio.colliders)
      if(!tour.path.length){stopTour();callbacks.current.onError?.(`Could not find a route to ${s.short}. Use its room shortcut to visit.`);return}
      reportTour()
    }
    function startTour(){document.exitPointerLock?.();keys.clear();atEntrance=false;updateLens();tour.active=true;tour.paused=false;routeTo(0)}
    function pauseTour(){if(!tour.active)return;tour.paused=!tour.paused;reportTour()}
    function next(n){if(!tour.active)tour.active=true;tour.paused=false;routeTo(tour.index+n)}
    function enter(){
      stopTour()
      if(canvas.requestPointerLock){try{const result=canvas.requestPointerLock();result?.catch(()=>callbacks.current.onLock?.(false))}catch{callbacks.current.onLock?.(false)}}
      canvas.focus()
    }
    function keyDown(e){
      if(e.target instanceof HTMLInputElement||e.target instanceof HTMLTextAreaElement||['BUTTON','SELECT','DIALOG'].includes(e.target.tagName)||document.querySelector('[role="dialog"]'))return
      if(['KeyW','KeyA','KeyS','KeyD','ArrowUp','ArrowDown','ArrowLeft','ArrowRight','ShiftLeft','ShiftRight'].includes(e.code)){
        e.preventDefault();if(tour.active)stopTour();keys.add(e.code)
      }
      if(e.code==='KeyR')reset()
      if(e.code==='Escape'){keys.clear();drag=false;if(tour.active)pauseTour()}
    }
    function keyUp(e){keys.delete(e.code)}
    function clear(){keys.clear();drag=false;touch.x=touch.z=0}
    function look(dx,dy){yaw-=dx*.0025;pitch=THREE.MathUtils.clamp(pitch-dy*.0025,-1.2,1.2)}
    function mouseMove(e){if(document.pointerLockElement===canvas)look(e.movementX,e.movementY)}
    function pointerDown(e){if(e.button!==0)return;if(tour.active)stopTour();drag=true;lastX=e.clientX;lastY=e.clientY;canvas.setPointerCapture(e.pointerId);canvas.focus()}
    function pointerMove(e){if(drag&&document.pointerLockElement!==canvas){look(e.clientX-lastX,e.clientY-lastY);lastX=e.clientX;lastY=e.clientY}}
    function pointerUp(){drag=false}
    function lockChange(){clear();callbacks.current.onLock?.(document.pointerLockElement===canvas)}
    function visibility(){if(document.hidden){clear();if(tour.active&&!tour.paused){tour.paused=true;reportTour()}}}
    function contextLost(e){e.preventDefault();stopTour();callbacks.current.onError?.('The 3D graphics context was interrupted. Reload this page to restart the walkthrough.')}
    canvas.tabIndex=0;canvas.setAttribute('aria-label','Interactive 3D studio. Drag to look around. Use W A S D or arrow keys to walk. R resets your position.');
    canvas.addEventListener('pointerdown',pointerDown);canvas.addEventListener('pointermove',pointerMove);canvas.addEventListener('pointerup',pointerUp);canvas.addEventListener('pointercancel',pointerUp);canvas.addEventListener('webglcontextlost',contextLost)
    window.addEventListener('keydown',keyDown);window.addEventListener('keyup',keyUp);window.addEventListener('mousemove',mouseMove);window.addEventListener('blur',clear)
    document.addEventListener('pointerlockchange',lockChange);document.addEventListener('visibilitychange',visibility)
    observer=new ResizeObserver(()=>{const {width,height}=host.getBoundingClientRect();renderer.setSize(width,height);camera.aspect=width/height;updateLens()});observer.observe(host)
    engine.current={jump,reset,enter,startTour,pauseTour,stopTour,next,
      quality:high=>{renderer.setPixelRatio(Math.min(window.devicePixelRatio,high?2:1));renderer.shadowMap.enabled=high;renderer.shadowMap.needsUpdate=true},
      light:warm=>{renderer.toneMappingExposure=warm?1.12:1.25;studio.scene.environmentIntensity=warm?.5:.7},
      touchMove:(x,z)=>{if(tour.active)stopTour();touch.x=x;touch.z=z},
    }
    reset()
    const angleLerp=(a,b,t)=>a+Math.atan2(Math.sin(b-a),Math.cos(b-a))*t
    function tick(time){
      if(disposed)return
      raf=requestAnimationFrame(tick)
      const dt=Math.min((time-lastTime)/1000,.05);lastTime=time
      if(document.hidden)return
      if(tour.active&&!tour.paused){
        if(tour.path.length){
          const p=tour.path[0],dx=p.x-camera.position.x,dz=p.z-camera.position.z,d=Math.hypot(dx,dz)
          if(d<.035){tour.path.shift();if(!tour.path.length){arriveAim=aim(SPACES[tour.index]);tour.wait=0;currentSpace=SPACES[tour.index].id;updateLens();callbacks.current.onSpace?.(currentSpace);reportTour()}}
          else{
            const step=Math.min(dt*(reduced?.7:1.15),d),pos=moveWithCollision(camera.position,dx/d*step,dz/d*step,studio.colliders)
            camera.position.x=pos.x;camera.position.z=pos.z
            const next= tour.path[Math.min(4,tour.path.length-1)]
            yaw=angleLerp(yaw,Math.atan2(camera.position.x-next.x,camera.position.z-next.z),Math.min(1,dt*3));pitch=THREE.MathUtils.lerp(pitch,-.03,dt*3)
          }
        } else {
          if(arriveAim){yaw=angleLerp(yaw,arriveAim.yaw,Math.min(1,dt*2.5));pitch=THREE.MathUtils.lerp(pitch,arriveAim.pitch,dt*2.5)}
          tour.wait+=dt
          if(tour.wait>7){if(tour.index<SPACES.length-1)routeTo(tour.index+1);else{tour.active=false;reportTour()}}
        }
      }else if(!tour.active){
        let f=(keys.has('KeyW')||keys.has('ArrowUp')?1:0)-(keys.has('KeyS')||keys.has('ArrowDown')?1:0)-touch.z
        let r=(keys.has('KeyD')||keys.has('ArrowRight')?1:0)-(keys.has('KeyA')||keys.has('ArrowLeft')?1:0)+touch.x
        const length=Math.hypot(f,r);if(length>1){f/=length;r/=length}
        if(length>0&&atEntrance){atEntrance=false;updateLens()}
        const speed=(keys.has('ShiftLeft')||keys.has('ShiftRight')?3.1:1.75)*dt
        const p=moveWithCollision(camera.position,(-Math.sin(yaw)*f+Math.cos(yaw)*r)*speed,(-Math.cos(yaw)*f-Math.sin(yaw)*r)*speed,studio.colliders)
        camera.position.x=p.x;camera.position.z=p.z
      }
      camera.rotation.set(pitch,yaw,0)
      if(time-lastUpdate>150){
        callbacks.current.onPosition?.({x:camera.position.x,z:camera.position.z,yaw})
        const s=atEntrance?'reception':spaceAt(camera.position.x,camera.position.z)
        if(s!==currentSpace){currentSpace=s;updateLens();callbacks.current.onSpace?.(s)}lastUpdate=time
      }
      renderer.render(studio.scene,camera)
    }
    raf=requestAnimationFrame(tick)
    studio.ready.then(missing=>{
      if(disposed)return
      if(missing.length)callbacks.current.onError?.(`Missing reference images: ${missing.join(', ')}. Restore these files in public/references; no replacement designs have been substituted.`)
      else callbacks.current.onReady?.()
    })
    return ()=>{
      disposed=true;engine.current=null;cancelAnimationFrame(raf);observer.disconnect()
      window.removeEventListener('keydown',keyDown);window.removeEventListener('keyup',keyUp);window.removeEventListener('mousemove',mouseMove);window.removeEventListener('blur',clear)
      document.removeEventListener('pointerlockchange',lockChange);document.removeEventListener('visibilitychange',visibility)
      if(document.pointerLockElement===canvas)document.exitPointerLock()
      studio.dispose();renderer.dispose();canvas.remove()
    }
  }, [])
  return <div className="three-host" ref={mount} />
})

export default Walkthrough
