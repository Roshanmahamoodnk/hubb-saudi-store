import {scenes} from './scenes.js';
import {onScrollFrame,requestScrollFrame,clamp,smooth} from './scroll-frame.js';

const targets=new Map(),activeTargets=new Set();
let observer,initialized=false;
function register(node,type,anchor=node){
 if(targets.has(node))return;
 const entry={node,type,anchor,y:0,index:targets.size%4};
 targets.set(node,entry);node.classList.add(`scroll-${type}`);
 if(observer)observer.observe(anchor);else activeTargets.add(entry);
}
export function refreshMotion(root=document){
 if(!initialized)return;
 for(const [node,entry] of targets)if(!node.isConnected){targets.delete(node);activeTargets.delete(entry);observer?.unobserve(entry.anchor);}
 root.querySelectorAll('main h1,main h2,main h3,main p,.footer-top>div,.footer-bottom,.product-card h3,.product-card .product-meta').forEach(n=>{
  if(n.closest('.crack-stage,.crack-chapters,.scene-chapter-copy,dialog'))return;
  register(n,'copy');
  if(n.tagName==='H2')n.classList.add('scroll-heading');
 });
 root.querySelectorAll('.product-image-button>img,.family-visual>img,.seo-hero-image>img,.seo-pack-format-image').forEach(n=>register(n,'pack',n.parentElement));
 root.querySelectorAll('.hero-image-frame>.frame-photo,.moment-photo>.photo-sequence').forEach(n=>register(n,'photo',n.parentElement));
 root.querySelectorAll('.brand-strip>b,.circle-stamp').forEach(n=>register(n,'detail',n.parentElement));
 requestScrollFrame();
}

function sequenceState(sequence,p,lang){
 const frames=[...sequence.querySelectorAll('[data-photo-frame]')];
 const scaled=clamp(p)*3;
 const from=Math.floor(scaled),to=Math.min(3,from+1),mix=smooth((scaled-from-.62)/.38);
 const current=mix>.5?to:from;
 const caption=sequence.querySelector('.sequence-caption');
 return ()=>{
  sequence.dataset.frame=String(current);sequence.style.setProperty('--sequence-progress',clamp(p));
  frames.forEach((n,i)=>{const opacity=i===from?1-mix:i===to?mix:0;n.style.opacity=String(opacity);n.setAttribute('aria-hidden',String(i!==current));});
  if(caption)caption.textContent=sequence.dataset[`beat${current}${lang==='ar'?'Ar':'En'}`]||'';
 };
}

export function initMotion(){
 if(initialized)return;initialized=true;
 const html=document.documentElement,preference=matchMedia('(prefers-reduced-motion: reduce)');
 html.classList.add('has-motion','scroll-experience');
 if('IntersectionObserver' in window)observer=new IntersectionObserver(entries=>{
  for(const e of entries)for(const record of targets.values())if(record.anchor===e.target){if(e.isIntersecting)activeTargets.add(record);else activeTargets.delete(record);}
  requestScrollFrame();
 },{rootMargin:'100px 0px',threshold:0});
 refreshMotion();
 const chapters=[...document.querySelectorAll('[data-scene]')];
 const images=[...document.querySelectorAll('[data-scene-image]')];
 const links=[...document.querySelectorAll('[data-scene-link]')];
 const stage=document.querySelector('.scene-stage-inner');
 const meter=document.querySelector('.reading-progress i');
 const sequences=[...document.querySelectorAll('[data-photo-sequence]')];
 let active='';
 function configure(){
  html.classList.toggle('motion-reduced',preference.matches);
  for(const chapter of chapters){
   const panel=chapter.querySelector('.scene-chapter-inner');
   chapter.classList.toggle('is-pinnable',!preference.matches&&innerWidth<=760&&innerHeight>620&&panel?.offsetHeight<innerHeight-24);
  }
  if(preference.matches){
   for(const record of targets.values()){record.node.style.removeProperty('--scroll-y');record.node.style.removeProperty('--scroll-rotate');record.node.style.removeProperty('--scroll-scale');record.node.style.removeProperty('--scroll-opacity');record.node.style.removeProperty('--line-progress');record.y=0;}
   sequences.forEach(s=>s.querySelectorAll('[data-photo-frame]').forEach(n=>{n.style.removeProperty('opacity');n.removeAttribute('aria-hidden');}));
  }
  requestScrollFrame();
 }
 addEventListener('resize',configure,{passive:true});preference.addEventListener('change',configure);
 document.fonts?.ready.then(configure);
 function select(id){
  if(id===active)return;active=id;
  const index=chapters.findIndex(n=>n.dataset.scene===id);
  chapters.forEach(n=>n.classList.toggle('is-active',n.dataset.scene===id));
  images.forEach(n=>{const show=n.dataset.sceneImage===id;n.classList.toggle('is-active',show);n.setAttribute('aria-hidden',String(!show));});
  links.forEach(n=>{if(n.dataset.sceneLink===id)n.setAttribute('aria-current','step');else n.removeAttribute('aria-current');});
  const data=scenes.find(s=>s.id===id),lang=html.lang==='en'?'en':'ar';
  if(data&&stage){stage.querySelector('.scene-location').textContent=data.place[lang];stage.querySelector('.scene-stage-number').textContent=`${String(index+1).padStart(2,'0')} / 04`;stage.style.setProperty('--scene-progress',String((index+1)/chapters.length));}
 }
 onScrollFrame(view=>{
  const extent=document.documentElement.scrollHeight-view.height;
  const changes=[];
  if(meter)changes.push(()=>meter.style.transform=`scaleX(${extent>0?clamp(view.y/extent):0})`);
  if(view.reduced)return ()=>{changes.forEach(f=>f());};
  for(const record of activeTargets){
   const {node,anchor,type,index}=record;if(!node.isConnected)continue;
   const rect=anchor.getBoundingClientRect();
   const top=rect.top-(node===anchor?record.y:0);
   const p=clamp((view.height-top)/(view.height+rect.height));
   const enter=smooth((view.height*.97-top-index*10)/Math.min(230,view.height*.29));
   let y=0,rotation=0,scale=1,opacity=1;
   if(type==='copy'){y=(1-enter)*18;opacity=.58+.42*enter;}
   if(type==='pack'){y=(.5-p)*(view.width<=760?38:64);rotation=(p-.5)*(view.width<=760?9:13)*(index%2?-1:1);scale=.965+Math.sin(p*Math.PI)*.055;}
   if(type==='photo'){y=(.5-p)*24;scale=1.06;}
   if(type==='detail')rotation=(p-.5)*40;
   changes.push(()=>{record.y=y;node.style.setProperty('--scroll-y',`${y.toFixed(2)}px`);node.style.setProperty('--scroll-rotate',`${rotation.toFixed(2)}deg`);node.style.setProperty('--scroll-scale',scale.toFixed(4));node.style.setProperty('--scroll-opacity',opacity.toFixed(3));if(node.classList.contains('scroll-heading'))node.style.setProperty('--line-progress',enter.toFixed(3));});
  }
  const chapterRects=chapters.map(node=>({node,rect:node.getBoundingClientRect()}));
  const nearest=chapterRects.reduce((best,item)=>{const d=Math.abs(item.rect.top+item.rect.height/2-view.height*.52);return !best||d<best.d?{...item,d}:best;},null);
  if(nearest)changes.push(()=>select(nearest.node.dataset.scene));
  const lang=html.lang==='en'?'en':'ar';
  for(const sequence of sequences){
   const id=sequence.dataset.photoSequence,chapter=sequence.closest('.moment-card')?null:chapterRects.find(c=>c.node.dataset.scene===id);
   const inStage=sequence.closest('.scene-stage');
   if(inStage&&(view.width<=760||nearest?.node.dataset.scene!==id))continue;
   let p;
   if(chapter){
    if(chapter.rect.bottom<-80||chapter.rect.top>view.height+80)continue;
    if(view.width<=760&&chapter.node.classList.contains('is-pinnable')){
     const panel=chapter.node.querySelector('.scene-chapter-inner');
     p=clamp((10-chapter.rect.top)/Math.max(1,chapter.rect.height-panel.offsetHeight));
    }else p=clamp((view.height*.52-chapter.rect.top)/chapter.rect.height);
   }else{
    const anchor=sequence.closest('.moment-card');if(!anchor)continue;
    const r=anchor.getBoundingClientRect();if(r.bottom<0||r.top>view.height)continue;
    p=clamp((view.height*.78-r.top)/(r.height+view.height*.3));
   }
   changes.push(sequenceState(sequence,p,lang));
  }
  return ()=>{for(const change of changes)change();};
 });
 configure();select(scenes[0]?.id);
}
