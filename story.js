import {getLang} from './catalog.js';
const places={factory:{lat:25.131754,lng:46.0797011,title:{ar:'مصنع روزانا الرياض للمواد الغذائية — حريملاء',en:'Rozana Al Riyadh Foodstuff Factory — Huraymila'},url:'https://www.google.com/maps/place/Rozana+Al+Riyadh+Foodstuff+Factory/@25.131754,46.0771262,17z/data=!3m1!4b1!4m6!3m5!1s0x3e2957ded4967ebb:0x9820725213d7f568!8m2!3d25.131754!4d46.0797011!16s%2Fg%2F11vpt7ngn7'},warehouse:{lat:24.5634184,lng:46.7556442,title:{ar:'روزانا للمواد الغذائية — مستودع الرياض',en:'Rozana Foodstuff — Riyadh warehouse'},url:'https://www.google.com/maps/place/Rozana+foodstuff/@24.5631677,46.7553478,19.8z/data=!4m6!3m5!1s0x3e2f093c04bcac1d:0x5bb58ad0c4dcee22!8m2!3d24.5634184!4d46.7556442!16s%2Fg%2F11n72754c1'}};
export function initStory(){
 let place='factory';
 function renderPlace(change=true){
  const p=places[place];
  document.querySelectorAll('[data-location]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.location===place)));
  const map=document.querySelector('#location-map');if(!map)return;
  map.title=p.title[getLang()];
  if(change)map.src=`https://maps.google.com/maps?q=${p.lat},${p.lng}&z=15&output=embed&hl=${getLang()}`;
  const directions=document.querySelector('#location-directions');if(directions)directions.href=p.url;
 }
 document.querySelectorAll('[data-location]').forEach(b=>b.addEventListener('click',()=>{place=b.dataset.location;renderPlace();}));
 window.addEventListener('hubb:language',()=>renderPlace(false));renderPlace();
}
