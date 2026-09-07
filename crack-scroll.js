const copy = [
 {title:['حبّة، على مهلك.','One seed. Take your time.'],body:['خذ حبّة من الكيس.','Take one seed from the sachet.'],note:['النواة للأكل. القشر لا يؤكل.','Eat the kernel. Discard the husk.']},
 {title:['طقّة من الطرف.','A little crack at the edge.'],body:['افتح القشر بخفّة، وافصله عن النواة.','Gently crack the shell and separate the kernel.'],note:['لا تمضغ الحبّة بقشرها.','Do not chew the whole shell.']},
 {title:['النكهة في النواة.','Find the flavour inside.'],body:['استمتع بالنواة فقط.','Enjoy only the kernel.'],note:['أبعد أي بقايا قشر.','Remove any shell fragments.']},
 {title:['القشور في كيسها.','Shells away. Company stays.'],body:['اجمع القشور في الكيس الورقي المنفصل.','Drop empty husks into the separate paper bag.'],note:['خلّها بعيدة عن كيس الطعام.','Keep husks out of the food pack.']}
];
const esc=s=>s.replaceAll('&','&amp;').replaceAll('"','&quot;').replaceAll('<','&lt;');
const line=(tag,values,lang,cls='')=>`<${tag}${cls?` class="${cls}"`:''} data-ar="${esc(values[0])}" data-en="${esc(values[1])}">${esc(values[lang==='ar'?0:1])}</${tag}>`;
export function renderCrack(lang){
 const img=(id,cls)=>`<img class="crack-object ${cls}" src="/assets/ritual-${id==='whole'?'whole-edge-v5':id+'-v4'}.webp" alt="" width="1024" height="1536" loading="lazy" draggable="false">`;
 return `<section id="ritual" class="crack-section section"><div class="wrap"><div class="section-heading"><div>${line('p',['طقّة، وبعدها تبدأ النكهة','THE LITTLE RITUAL WE LOVE'],lang,'eyebrow')}${line('h2',['طقّة. نواة. لحظة حُبّ.','Crack. Enjoy. Shells away.'],lang)}</div>${line('p',['النواة للأكل. والقشور في كيسها.','Eat the kernel. Collect the husks.'],lang,'section-aside')}</div><div class="crack-scroll-track"><div class="crack-stage" aria-hidden="true"><svg class="crack-edge-masks" width="0" height="0" aria-hidden="true"><defs><clipPath id="crack-front-edge" clipPathUnits="objectBoundingBox"><path d="M0 0H.52C.62 .13 .70 .34 .70 .58C.70 .80 .64 .93 .52 1H0Z"/></clipPath><clipPath id="crack-far-edge" clipPathUnits="objectBoundingBox"><path d="M.52 0H1V1H.52C.64 .93 .70 .80 .70 .58C.70 .34 .62 .13 .52 0Z"/></clipPath></defs></svg><div class="crack-stage-top"><span>H U B B</span>${line('span',['مع كل حبّة','IN EVERY LITTLE SEED'],lang)}</div><div class="crack-studio-light"></div><div class="crack-orbit"></div>${img('bag','crack-bag-back')}${img('kernel','crack-kernel')}${img('husk','crack-husk-left')}${img('husk','crack-husk-right')}${img('whole','crack-whole-left')}${img('whole','crack-whole-right')}${img('bag','crack-bag-front')}${line('span',['النواة للأكل','THE EDIBLE KERNEL'],lang,'crack-kernel-label')}${line('span',['كيس منفصل للقشور','A SEPARATE BAG FOR HUSKS'],lang,'crack-bag-label')}<div class="crack-stage-footer"><span class="crack-stage-count">01 / 04</span><div class="crack-stage-meter"><i></i></div>${line('span',['كمّل التمرير','KEEP SCROLLING'],lang,'crack-scroll-hint')}</div><div class="crack-live-caption"><h3>${esc(copy[0].title[lang==='ar'?0:1])}</h3><p>${esc(copy[0].body[lang==='ar'?0:1])}</p></div></div><ol class="crack-chapters">${copy.map((s,i)=>`<li class="crack-chapter" data-crack-chapter="${i}"><span class="crack-chapter-number">0${i+1}</span>${line('h3',s.title,lang)}${line('p',s.body,lang)}${line('small',s.note,lang)}</li>`).join('')}</ol></div>${line('p',['تصوّر توضيحي لطريقة الأكل والتخلّص من القشور.','An illustrated guide to the eating ritual and shell disposal.'],lang,'crack-concept-note')}</div></section>`;
}

export function initCrack(){
 const track=document.querySelector('.crack-scroll-track'),stage=document.querySelector('.crack-stage');
 if(!track||!stage)return;
 const preference=matchMedia('(prefers-reduced-motion: reduce)');
 const objects=Object.fromEntries(['kernel','husk-left','husk-right','whole-left','whole-right','bag-back','bag-front'].map(id=>[id,stage.querySelector(`.crack-${id}`)]));
 const chapters=[...track.querySelectorAll('.crack-chapter')];
 const clamp=v=>Math.max(0,Math.min(1,v));
 const ease=v=>{v=clamp(v);return v*v*(3-2*v);};
 const phase=(p,start,end)=>ease((p-start)/(end-start));
 let scheduled=false,enabled=false,lastChapter=-1;
 function setObject(id,x,y,rotation,scale,opacity,w,h,xScale=1){
  const n=objects[id];n.style.transform=`translate3d(${x*w}px,${y*h}px,0) translate(-50%,-50%) rotate(${rotation}deg) scale(${scale}) scaleX(${xScale})`;n.style.opacity=opacity;
 }
 function paint(){
  scheduled=false;if(!enabled)return;
  const rect=track.getBoundingClientRect(),stageHeight=stage.clientHeight,h=stageHeight-138,w=stage.clientWidth;
  if(!w||!h)return;
  const top=parseFloat(getComputedStyle(stage).top)||0;
  const p=clamp((top-rect.top)/Math.max(1,rect.height-stageHeight));
  stage.dataset.progress=p.toFixed(3);
  stage.style.setProperty('--art-height',`${h}px`);
  const reward=phase(p,.44,.63),bag=phase(p,.66,.77),moveKernel=phase(p,.59,.70);
  const put=(id,x,y,rot,scale,opacity,xScale=1)=>setObject(id,x,y,rot,scale,opacity,w,h,xScale);
  // The right edge opens first. Each exterior and hollow interior shares one
  // continuous pose, changing faces only while edge-on, without a position jump.
  const shell=(side,sign,start,end,dropStart,dropEnd)=>{
   const peel=phase(p,start,end),travel=phase(p,start,end+.035),drop=phase(p,dropStart,dropEnd);
   const startX=.5+sign*.235*travel,startY=.43+.025*travel;
   const x=startX+(.72-startX)*drop,y=startY+(.58-startY)*drop-Math.sin(drop*Math.PI)*.25;
   const rotation=sign*(21*travel+110*drop),scale=(1.16-.10*travel)*(1-.63*drop);
   const faceScale=Math.abs(Math.cos(peel*Math.PI));
   put(`whole-${side}`,x,y,rotation,scale,peel<.5?1:0,faceScale);
   put(`husk-${side}`,x,y,rotation,scale,(peel>=.5?1:0)*(1-phase(drop,.94,1)),faceScale);
  };
  shell('right',1,.14,.33,.69,.95);
  shell('left',-1,.22,.40,.65,.91);
  put('kernel',.5-.23*moveKernel,.43-.13*reward,-8*reward,1+.15*reward,phase(p,.23,.38));
  stage.style.setProperty('--kernel-light',(phase(p,.30,.52)*(1-.55*moveKernel)).toFixed(3));
  const settle=Math.sin(phase(p,.85,1)*Math.PI)*1.2;
  put('bag-back',.72,.63+(1-bag)*.15,settle,1,bag);
  put('bag-front',.72,.63+(1-bag)*.15,settle,1,bag);
  stage.querySelector('.crack-kernel-label').style.opacity=phase(p,.91,.98);
  stage.querySelector('.crack-bag-label').style.opacity=phase(p,.88,.98);
  stage.querySelector('.crack-stage-meter i').style.transform=`scaleX(${p})`;
  const chapter=p<.12?0:p<.40?1:p<.66?2:3;
  if(chapter!==lastChapter){lastChapter=chapter;const lang=document.documentElement.lang==='ar'?0:1;stage.querySelector('.crack-live-caption h3').textContent=copy[chapter].title[lang];stage.querySelector('.crack-live-caption p').textContent=copy[chapter].body[lang];stage.querySelector('.crack-stage-count').textContent=`0${chapter+1} / 04`;chapters.forEach((n,i)=>n.classList.toggle('is-active',i===chapter));}
 }
 function schedule(){if(!scheduled&&enabled){scheduled=true;requestAnimationFrame(paint);}}
 function configure(){
  enabled=!preference.matches&&innerHeight>480;
  track.classList.toggle('is-scroll-driven',enabled);
  if(!enabled){stage.querySelectorAll('[style]').forEach(n=>n.removeAttribute('style'));chapters.forEach(n=>n.classList.remove('is-active'));lastChapter=-1;}
  schedule();
 }
 addEventListener('scroll',schedule,{passive:true});addEventListener('resize',configure,{passive:true});
 addEventListener('pageshow',schedule);addEventListener('hubb:language',()=>{lastChapter=-1;schedule();});preference.addEventListener('change',configure);
 if('ResizeObserver' in window)new ResizeObserver(schedule).observe(track);
 configure();
}
