const copy = [
 {title:['حبّة واحدة. لحظة لك.','One little seed. A moment for you.'], body:['خذ حبّة من الكيس. على مهلك… المتعة تبدأ من هنا.','Take one seed from the sachet. Slow down for a second. This is where the little ritual begins.'], note:['القشر يحمي النواة؛ النواة هي الجزء الذي يؤكل.','The shell holds the kernel. The kernel is the part we eat.']},
 {title:['طقّة خفيفة. وتبدأ الحكاية.','A little crack. And there it is.'], body:['اكسر القشر بخفّة عند حافة الأسنان الأمامية، ثم أبعد الحبّة وافصل نصفي القشر بأصابعك.','Gently crack the shell at the edge of your front teeth. Remove the seed, then separate the two husk halves with your fingers.'], note:['لا تمضغ الحبّة كاملة، ولا تستخدم قوة لفتحها.','Do not chew the whole seed or force the shell open.']},
 {title:['النكهة تكمل للنواة.','The flavour goes a little deeper.'], body:['أخرج النواة، وتخلّص من أي بقايا قشر. قرمشة صغيرة، ونكهة تستاهل هاللحظة.','Lift out the kernel and remove any shell fragments. A little crunch. A little flavour. A little happiness.'], note:['استمتع بالنواة فقط. القشر لا يؤكل.','Enjoy only the kernel. Do not eat the husk.']},
 {title:['القشور في كيسها. واللمّة تحلى.','Shells away. The good company stays.'], body:['القشور الفارغة تروح في كيسها الورقي المنفصل. مرّر العبوة، وخلّ السوالف تكمل.','Drop the empty husks into the separate paper shell bag. Pass the pack. Let the conversation carry on.'], note:['خلّ القشور بعيدة عن كيس الطعام والكوب.','Keep discarded husks out of the food sachet and cup.']}
];
const esc=s=>s.replaceAll('&','&amp;').replaceAll('"','&quot;').replaceAll('<','&lt;');
const line=(tag,values,lang,cls='')=>`<${tag}${cls?` class="${cls}"`:''} data-ar="${esc(values[0])}" data-en="${esc(values[1])}">${esc(values[lang==='ar'?0:1])}</${tag}>`;
export function renderCrack(lang){
 const img=(id,cls)=>`<img class="crack-object ${cls}" src="/assets/ritual-${id}-v4.webp" alt="" width="1024" height="1536" loading="lazy" draggable="false">`;
 return `<section id="ritual" class="crack-section section"><div class="wrap"><div class="section-heading"><div>${line('p',['طقّة، وبعدها تبدأ النكهة','THE LITTLE RITUAL WE LOVE'],lang,'eyebrow')}${line('h2',['اسمع الطقّة. ذوق النواة.','Hear the crack. Find the flavour.'],lang)}</div>${line('p',['لحظة صغيرة. سعادة نتشاركها.','A small pause. A little happiness to share.'],lang,'section-aside')}</div><div class="crack-scroll-track"><div class="crack-stage" aria-hidden="true"><div class="crack-stage-top"><span>H U B B</span>${line('span',['مع كل حبّة','IN EVERY LITTLE SEED'],lang)}</div><div class="crack-orbit"></div>${img('bag','crack-bag-back')}${img('kernel','crack-kernel')}${img('husk','crack-husk-left')}${img('husk','crack-husk-right')}${img('whole','crack-whole-left')}${img('whole','crack-whole-right')}${img('bag','crack-bag-front')}${line('span',['النواة للأكل','THE EDIBLE KERNEL'],lang,'crack-kernel-label')}${line('span',['كيس منفصل للقشور','A SEPARATE BAG FOR HUSKS'],lang,'crack-bag-label')}<div class="crack-stage-footer"><span class="crack-stage-count">01 / 04</span><div class="crack-stage-meter"><i></i></div>${line('span',['كمّل التمرير','KEEP SCROLLING'],lang,'crack-scroll-hint')}</div></div><ol class="crack-chapters">${copy.map((s,i)=>`<li class="crack-chapter" data-crack-chapter="${i}"><span class="crack-chapter-number">0${i+1}</span>${line('h3',s.title,lang)}${line('p',s.body,lang)}${line('small',s.note,lang)}</li>`).join('')}</ol></div>${line('p',['تصوّر توضيحي لطريقة الأكل والتخلّص من القشور.','An illustrated guide to the eating ritual and shell disposal.'],lang,'crack-concept-note')}</div></section>`;
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
  const rect=track.getBoundingClientRect(),h=stage.clientHeight,w=stage.clientWidth;
  if(!w||!h)return;
  const top=parseFloat(getComputedStyle(stage).top)||0;
  const p=clamp((top-rect.top)/Math.max(1,rect.height-h));
  stage.dataset.progress=p.toFixed(3);
  const split=phase(p,.13,.37),reveal=phase(p,.20,.34),reward=phase(p,.43,.63),bag=phase(p,.66,.77),moveKernel=phase(p,.78,.94),flip=phase(p,.17,.31);
  const fallLeft=phase(p,.65,.91),fallRight=phase(p,.69,.95);
  const put=(id,x,y,rot,scale,opacity,xScale=1)=>setObject(id,x,y,rot,scale,opacity,w,h,xScale);
  put('whole-left',.5-.11*split,.43-.018*split,-12*split,1,flip<.5?1:0,Math.abs(Math.cos(flip*Math.PI)));
  put('whole-right',.5+.11*split,.43-.018*split,12*split,1,flip<.5?1:0,Math.abs(Math.cos(flip*Math.PI)));
  put('kernel',.5-.23*moveKernel,.43-.13*reward,-8*reward,1+.05*reward,reveal);
  // Empty husks follow distinct arcs. The kernel never enters the bag's path.
  const husk=(side,drop,sign)=>{
   const startX=.5+sign*.235*split,startY=.43+.025*split;
   put(`husk-${side}`,startX+(.72-startX)*drop,startY+(.58-startY)*drop-Math.sin(drop*Math.PI)*.25,sign*(21*split+110*drop),1-.63*drop,(flip>=.5?1:0)*(1-phase(drop,.94,1)),Math.abs(Math.cos(flip*Math.PI)));
  };
  husk('left',fallLeft,-1);husk('right',fallRight,1);
  const settle=Math.sin(phase(p,.85,1)*Math.PI)*1.2;
  put('bag-back',.72,.63+(1-bag)*.15,settle,1,bag);
  put('bag-front',.72,.63+(1-bag)*.15,settle,1,bag);
  stage.querySelector('.crack-kernel-label').style.opacity=phase(p,.91,.98);
  stage.querySelector('.crack-bag-label').style.opacity=phase(p,.88,.98);
  stage.querySelector('.crack-stage-meter i').style.transform=`scaleX(${p})`;
  const chapter=Math.min(3,Math.floor(p*3.99));
  if(chapter!==lastChapter){lastChapter=chapter;stage.querySelector('.crack-stage-count').textContent=`0${chapter+1} / 04`;chapters.forEach((n,i)=>n.classList.toggle('is-active',i===chapter));}
 }
 function schedule(){if(!scheduled&&enabled){scheduled=true;requestAnimationFrame(paint);}}
 function configure(){
  enabled=!preference.matches&&innerHeight>480;
  track.classList.toggle('is-scroll-driven',enabled);
  if(!enabled){stage.querySelectorAll('[style]').forEach(n=>n.removeAttribute('style'));chapters.forEach(n=>n.classList.remove('is-active'));lastChapter=-1;}
  schedule();
 }
 addEventListener('scroll',schedule,{passive:true});addEventListener('resize',configure,{passive:true});
 addEventListener('pageshow',schedule);addEventListener('hubb:language',schedule);preference.addEventListener('change',configure);
 if('ResizeObserver' in window)new ResizeObserver(schedule).observe(track);
 configure();
}
