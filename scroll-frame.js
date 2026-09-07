// One event-driven frame for the whole site. Read every scene before any writes.
const readers=new Set();
let pending=0,started=false;
export const clamp=value=>Math.max(0,Math.min(1,value));
export const smooth=value=>{const p=clamp(value);return p*p*(3-2*p);};
export function requestScrollFrame(){
 if(pending||document.hidden)return;
 pending=requestAnimationFrame(()=>{
  pending=0;
  const view={height:innerHeight,width:innerWidth,y:scrollY,reduced:matchMedia('(prefers-reduced-motion: reduce)').matches};
  const writes=[];
  for(const read of readers){const write=read(view);if(write)writes.push(write);}
  for(const write of writes)write();
 });
}
export function onScrollFrame(read){
 readers.add(read);
 if(!started){
  started=true;
  for(const event of ['scroll','resize','pageshow','load'])addEventListener(event,requestScrollFrame,{passive:true});
  document.addEventListener('visibilitychange',requestScrollFrame);
  document.addEventListener('toggle',requestScrollFrame,true);
  document.fonts?.ready.then(requestScrollFrame);
 }
 requestScrollFrame();
 return ()=>readers.delete(read);
}
