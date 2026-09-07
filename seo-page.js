import {initMotion} from './motion.js';
import { products, packImage } from './catalog.js';
import { initCommerce, openProduct, openCart, openSearch } from './commerce.js';

initCommerce();
document.addEventListener('click', event => {
  const productButton = event.target.closest('[data-seo-product]');
  if (productButton) {
    const format = productButton.dataset.seoFormat;
    if (format === 'cup' || format === 'case') openProduct(productButton.dataset.seoProduct, format);
    return;
  }
  if (event.target.closest('[data-seo-cart]')) openCart();
  if (event.target.closest('[data-seo-search]')) openSearch();
});

const galleryImage=document.querySelector('[data-seo-hero-image]');
const galleryProduct=products.find(p=>p.id===document.body.dataset.productId);
function showPack(format){
 if(!galleryImage||!galleryProduct||!['cup','case'].includes(format))return;
 galleryImage.src=packImage(galleryProduct,format);
 galleryImage.alt=galleryProduct.name[document.documentElement.lang]+(format==='cup'?' · 5 × 30 g':' · 24 × 30 g');
 document.querySelectorAll('[data-gallery-format]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.galleryFormat===format)));
 document.querySelectorAll('.seo-language').forEach(link=>{const target=new URL(link.href);target.searchParams.set('pack',format);link.href=target.href;});
 const page=new URL(location.href);page.searchParams.set('pack',format);history.replaceState(null,'',page);
}
showPack(new URLSearchParams(location.search).get('pack')==='case'?'case':'cup');
document.querySelectorAll('[data-gallery-format]').forEach(b=>b.addEventListener('click',()=>showPack(b.dataset.galleryFormat)));

initMotion();
