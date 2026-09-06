import fs from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const root=path.dirname(fileURLToPath(import.meta.url));
const out=path.join(root,'public');
await fs.mkdir(path.join(out,'assets'),{recursive:true});
for(const file of ['index.html','styles.css','commerce.css','catalog.js','commerce.js','app.js'])await fs.copyFile(path.join(root,file),path.join(out,file));
for(const file of await fs.readdir(path.join(root,'assets'))){if(file.endsWith('.webp')||file==='favicon.svg')await fs.copyFile(path.join(root,'assets',file),path.join(out,'assets',file));}
await fs.writeFile(path.join(out,'robots.txt'),'User-agent: *\nDisallow: /\n');
console.log('Built static storefront in public/');
