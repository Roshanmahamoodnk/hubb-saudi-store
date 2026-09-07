import fs from 'node:fs/promises';
import path from 'node:path';
import assert from 'node:assert/strict';
import {fileURLToPath, pathToFileURL} from 'node:url';

const root=path.dirname(fileURLToPath(import.meta.url));
const out=path.join(root,process.env.HUBB_OUT_DIR||'out');
const deployment=new URL(process.env.HUBB_SITE_URL||'https://hubb-saudi-gathering-store.r0shan911.chatgpt.site');
const basePath=deployment.pathname.replace(/\/+$/,'');
const siteRoot=deployment.origin+basePath+'/';
const files=[];
async function walk(dir){for(const e of await fs.readdir(dir,{withFileTypes:true})){const f=path.join(dir,e.name);if(e.isDirectory())await walk(f);else files.push(f);}}
await walk(out);
let checked=0;
async function checkUrl(value,documentUrl){
 if(/^(?:#|mailto:|tel:|data:|blob:)/i.test(value))return;
 const url=new URL(value.replaceAll('&amp;','&'),documentUrl);
 if(url.origin!==deployment.origin)return;
 assert.ok(url.pathname.startsWith(basePath+'/'),`URL escapes deployment: ${url.href}`);
 let relative=decodeURIComponent(url.pathname.slice(basePath.length));
 if(relative.endsWith('/'))relative+='index.html';
 const target=path.join(out,relative.slice(1));
 await fs.access(target).catch(()=>{throw new Error(`Missing local resource: ${url.href}`);});
 checked++;
}
const pages=files.filter(f=>f.endsWith('.html'));
assert.equal(pages.length,11,'Expected three home routes and eight product pages');
for(const file of pages){
 const html=await fs.readFile(file,'utf8');
 const relative=path.relative(out,file).replace(/index\.html$/,'');
 const documentUrl=siteRoot+relative;
 assert.equal((html.match(/<h1\b/g)||[]).length,1,`${relative}: one H1`);
 assert.ok(!html.includes('id="scene-story-root"')&&!html.includes('id="crack-scroll-root"'),`${relative}: unbuilt placeholder`);
 const ids=[...html.matchAll(/\bid="([^"]+)"/g)].map(m=>m[1]);
 assert.equal(new Set(ids).size,ids.length,`${relative}: duplicate IDs`);
 for(const match of html.matchAll(/href="#([^"\s]+)"/g))assert.ok(ids.includes(match[1]),`${relative}: broken section link #${match[1]}`);
 if(!relative.includes('/products/')){
  assert.equal((html.match(/data-scene="/g)||[]).length,4,`${relative}: four flavour scenes`);
  assert.ok(html.includes('class="crack-live-caption"'),`${relative}: missing ritual caption`);
  assert.ok(html.includes('<section id="wholesale"'),`${relative}: existing volume section retained`);
 }
 const locale=relative.startsWith('en/')?'en':'ar';
 assert.ok(html.includes(`<html lang="${locale}"`),`${relative}: incorrect language`);
 for(const match of html.matchAll(/\b(?:src|href)=["']([^"']+)["']/g))await checkUrl(match[1],documentUrl);
 for(const match of html.matchAll(/<meta property="og:(?:url|image)" content="([^"]+)"/g))await checkUrl(match[1],documentUrl);
 const canonical=html.match(/<link rel="canonical" href="([^"]+)"/);
 assert.ok(canonical&&canonical[1].startsWith(siteRoot),`${relative}: incorrect canonical deployment`);
 for(const match of html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)){
  const graph=JSON.parse(match[1])['@graph']||[];
  for(const item of graph)for(const key of ['url','image','@id'])if(item[key])await checkUrl(item[key],documentUrl);
 }
}
for(const file of files.filter(f=>f.endsWith('.js'))){
 const code=await fs.readFile(file,'utf8');
 const moduleUrl=siteRoot+path.relative(out,file);
 for(const match of code.matchAll(/\bfrom\s*['"]([^'"]+)['"]/g))await checkUrl(match[1],moduleUrl);
}
const sitemap=await fs.readFile(path.join(out,'sitemap.xml'),'utf8');
for(const match of sitemap.matchAll(/<loc>([^<]+)<\/loc>/g))await checkUrl(match[1],siteRoot);
const {sitePath}=await import(pathToFileURL(path.join(out,'paths.js')));
assert.equal(sitePath('/en/'),basePath+'/en/');
assert.equal(sitePath(basePath+'/assets/sea-salt.webp'),basePath+'/assets/sea-salt.webp');
assert.equal(sitePath('#ritual'),'#ritual');
assert.equal(sitePath('https://wa.me/966553127999'),'https://wa.me/966553127999');
const {products,packImage}=await import(pathToFileURL(path.join(out,'catalog.js')));
for(const product of products)for(const format of ['cup','case','sachet'])await checkUrl(packImage(product,format),siteRoot);
console.log(`Verified ${pages.length} pages and ${checked} local URLs at ${siteRoot}`);
