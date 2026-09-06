import fs from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {generateSeoPages} from './seo-pages.mjs';
import {products,formats,packImage} from './catalog.js';
import {renderScenes,scenes} from './scenes.js';
import {renderSkuPosts,skuPosts} from './sku-posts.js';
import {renderCrack} from './crack-scroll.js';
const root=path.dirname(fileURLToPath(import.meta.url));
const out=path.join(root,process.env.HUBB_OUT_DIR||'out');
const deployment=new URL(process.env.HUBB_SITE_URL||'https://hubb-saudi-gathering-store.r0shan911.chatgpt.site');
if(!['https:','http:'].includes(deployment.protocol)||deployment.username||deployment.password||deployment.search||deployment.hash)throw new Error('HUBB_SITE_URL must be a plain HTTP(S) deployment URL');
const basePath=deployment.pathname.replace(/\/+$/,'');
const origin=deployment.origin+basePath;
const requiredImages=[...products.flatMap(p=>['cup','case'].map(f=>packImage(p,f))),...scenes.map(s=>s.image),...skuPosts.map(s=>s.image),...['whole','husk','kernel','bag'].map(id=>`/assets/ritual-${id==='whole'?'whole-edge-v5':id+'-v4'}.webp`)];
await Promise.all(requiredImages.map(file=>fs.access(path.join(root,file.replace(/^\//,'')))));
await fs.mkdir(path.join(out,'assets'),{recursive:true});
for(const file of ['paths.js','site-config.js','crack-scroll.js','crack-scroll.css','styles.css','story.css','story.js','motion.js','motion.css','scenes.js','sku-posts.js','commerce.css','catalog.js','commerce.js','app.js'])await fs.copyFile(path.join(root,file),path.join(out,file));
for(const file of await fs.readdir(path.join(root,'assets'))){if(file.endsWith('.webp')||file==='favicon.svg')await fs.copyFile(path.join(root,'assets',file),path.join(out,'assets',file));}
const source=await fs.readFile(path.join(root,'index.html'),'utf8');
const escape=s=>s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
function localized(lang,route){let html=source.replace('<div id="scene-story-root"></div>',renderScenes(lang)).replace('<div id="sku-posts-root"></div>',renderSkuPosts(lang)).replace('<div id="crack-scroll-root"></div>',renderCrack(lang)).replace('<html lang="ar" dir="rtl">',`<html lang="${lang}" dir="${lang==='ar'?'rtl':'ltr'}">`);
html=html.replace(/<([a-z][a-z0-9]*)\b([^>]*\bdata-ar="([^"]*)"\s+data-en="([^"]*)"[^>]*)>[\s\S]*?<\/\1>/gi,(all,tag,attrs,ar,en)=>`<${tag}${attrs}>${escape(lang==='ar'?ar:en)}</${tag}>`);
html=html.replace(/(<[^>]*data-alt-ar="([^"]*)"\s+data-alt-en="([^"]*)"[^>]*>)/g,(all,tag,ar,en)=>tag.replace(/\balt="[^"]*"/,`alt="${escape(lang==='ar'?ar:en)}"`));
const title=lang==='ar'?'حُبّ | حب دوار الشمس — حبّة حُبّ ولمّة تحلى':'HUBB | Saudi sunflower seeds — Happiness to share.';
const description=lang==='ar'?'حُبّ: حب دوار الشمس بنكهات تصل للنواة، نصنعه في السعودية للحظات المشاركة. اكتشف أربع نكهات وأكواب الرحلة وعبوات العائلة وطلبات الجملة.':'A little HUBB. Happiness to share. Saudi-made in-shell sunflower seeds with flavour beyond the shell. Explore four flavours, sharing cups, family packs and wholesale.';
html=html.replace(/<title>.*?<\/title>/,`<title>${title}</title>`).replace(/<meta name="description" content="[^"]*">/,`<meta name="description" content="${description}">`);
const meta=`<link rel="canonical" href="${origin}${route}"><link rel="alternate" hreflang="ar-SA" href="${origin}/ar/"><link rel="alternate" hreflang="en-SA" href="${origin}/en/"><link rel="alternate" hreflang="x-default" href="${origin}/"><meta property="og:type" content="website"><meta property="og:title" content="${title}"><meta property="og:description" content="${description}"><meta property="og:url" content="${origin}${route}"><meta property="og:image" content="${origin}/assets/hero-gathering.webp"><meta property="og:locale" content="${lang==='ar'?'ar_SA':'en_SA'}"><meta name="twitter:card" content="summary_large_image">`;
html=html.replace('</head>',meta+'</head>');
html=html.replace('id="language-toggle" class="language-button" aria-label="Switch to English">EN','id="language-toggle" class="language-button" aria-label="'+(lang==='ar'?'Switch to English':'التبديل إلى العربية')+'">'+(lang==='ar'?'EN':'عربي'));
const cup=formats.find(f=>f.id==='cup');
const cards=products.slice(0,4).map(p=>`<article class="product-card" style="--flavour:${p.color};--tint:${p.pale}"><button class="product-image-button" data-product="${p.id}" aria-label="${escape(p.name[lang])}"><span class="product-note">${escape(p.note[lang])}</span><img src="${packImage(p,'cup')}" width="1086" height="1448" loading="lazy" alt="${escape(p.name[lang])}"><span class="product-open" aria-hidden="true">↗</span></button><h3><a href="/${lang}/products/${p.id}/">${escape(p.name[lang])}</a></h3><div class="product-meta"><span>${escape(cup.name[lang])} · 5 × 30 g</span><span>150 g</span></div><button class="product-add" data-add="${p.id}"><span>SAR 12.00</span><span>${lang==='ar'?'أضف للسلة':'Add to bag'} +</span></button></article>`).join('');
html=html.replace('<div id="product-grid" class="product-grid"></div>',`<div id="product-grid" class="product-grid">${cards}</div>`);
return html;}
await fs.writeFile(path.join(out,'index.html'),localized('ar','/'));
for(const lang of ['ar','en']){await fs.mkdir(path.join(out,lang),{recursive:true});await fs.writeFile(path.join(out,lang,'index.html'),localized(lang,`/${lang}/`));}
await generateSeoPages({root,out,origin});
await fs.writeFile(path.join(out,'robots.txt'),'User-agent: *\nDisallow: /\n');
// HTML is generated from root-relative source templates; scope only local URLs.
async function scopeHtml(directory){
 for(const entry of await fs.readdir(directory,{withFileTypes:true})){
  const file=path.join(directory,entry.name);
  if(entry.isDirectory())await scopeHtml(file);
  else if(entry.name.endsWith('.html')){
   const html=await fs.readFile(file,'utf8');
   await fs.writeFile(file,html.replace(/(\b(?:src|href)=["'])\/(?!\/)/g,`$1${basePath}/`));
  }
 }
}
await scopeHtml(out);
await fs.writeFile(path.join(out,'site-config.js'),`export const basePath = ${JSON.stringify(basePath)};\n`);
await fs.writeFile(path.join(out,'.nojekyll'),'');
console.log(`Built 11 bilingual pages for ${origin}/ in ${path.relative(root,out)}/`);
