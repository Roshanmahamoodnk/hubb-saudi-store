import {scenes} from './scenes.js';
let revealObserver;
const observed=new WeakSet();
const reduced=()=>matchMedia('(prefers-reduced-motion: reduce)').matches;
export function refreshMotion(root=document){
 if(!revealObserver)return;
 root.querySelectorAll('.product-card,.research-priorities article,.partner-paths article,.section-heading,.research-heading,.family-visual,.moment-card,.location-card,.sku-ugc-post').forEach((node,i)=>{
  if(observed.has(node))return;
  observed.add(node);node.classList.add('reveal-target');node.style.setProperty('--reveal-delay',`${Math.min(i%4,3)*60}ms`);revealObserver.observe(node);
 });
}
export function initMotion(){
 const preference=matchMedia('(prefers-reduced-motion: reduce)');
 document.documentElement.classList.add('has-motion');
 if('IntersectionObserver' in window&&!reduced()){
  revealObserver=new IntersectionObserver(entries=>{entries.forEach(entry=>{if(entry.isIntersecting){entry.target.classList.add('is-revealed');revealObserver.unobserve(entry.target);}else if(!entry.target.isConnected)revealObserver.unobserve(entry.target);});},{threshold:.08,rootMargin:'0px 0px 35px 0px'});refreshMotion();
 }
 const chapters=[...document.querySelectorAll('[data-scene]')];
 const images=[...document.querySelectorAll('[data-scene-image]')];
 const links=[...document.querySelectorAll('[data-scene-link]')];
 const scene=document.querySelector('.scene-story');
 const stage=document.querySelector('.scene-stage-inner');
 const meter=document.querySelector('.reading-progress i');
 let active='',scheduled=false;
 function select(id){
  if(id===active)return;active=id;
  const index=chapters.findIndex(n=>n.dataset.scene===id);
  chapters.forEach(n=>n.classList.toggle('is-active',n.dataset.scene===id));
  images.forEach(n=>{const show=n.dataset.sceneImage===id;n.classList.toggle('is-active',show);n.setAttribute('aria-hidden',String(!show));});
  links.forEach(n=>{if(n.dataset.sceneLink===id)n.setAttribute('aria-current','step');else n.removeAttribute('aria-current');});
  const data=scenes.find(s=>s.id===id),lang=document.documentElement.lang==='en'?'en':'ar';
  if(data&&stage){stage.querySelector('.scene-location').textContent=data.place[lang];stage.querySelector('.scene-stage-number').textContent=`${String(index+1).padStart(2,'0')} / 04`;stage.style.setProperty('--scene-progress',String((index+1)/chapters.length));}
 }
 function paint(){
  scheduled=false;
  const height=innerHeight;
  const extent=document.documentElement.scrollHeight-height;
  if(meter)meter.style.transform=`scaleX(${extent>0?Math.min(1,Math.max(0,scrollY/extent)):0})`;
  if(!scene||!chapters.length)return;
  const rect=scene.getBoundingClientRect();
  if(rect.bottom<0||rect.top>height)return;
  let nearest=chapters[0],distance=Infinity;
  for(const chapter of chapters){const r=chapter.getBoundingClientRect();const d=Math.abs(r.top+r.height/2-height*.52);if(d<distance){nearest=chapter;distance=d;}}
  select(nearest.dataset.scene);
  if(stage&&!reduced()&&innerWidth>760){const r=nearest.getBoundingClientRect();const drift=Math.max(-14,Math.min(14,(r.top+r.height/2-height*.52)*.035));stage.style.setProperty('--scene-drift',`${drift}px`);}
 }
 function schedule(){if(scheduled)return;scheduled=true;requestAnimationFrame(paint);}
 addEventListener('scroll',schedule,{passive:true});addEventListener('resize',schedule,{passive:true});
 preference.addEventListener('change',()=>{if(reduced()){revealObserver?.disconnect();document.querySelectorAll('.reveal-target').forEach(n=>n.classList.add('is-revealed'));stage?.style.setProperty('--scene-drift','0px');}schedule();});
 document.querySelectorAll('.scene-nav a').forEach(link=>link.addEventListener('click',()=>select(link.dataset.sceneLink)));
 select('football');schedule();
}
