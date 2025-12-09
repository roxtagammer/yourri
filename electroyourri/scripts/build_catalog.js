
import fs from 'fs';
import 'dotenv/config';

const TARGET_DIR = process.env.TARGET_PAGES_DIR || './data/pages';
const FX_MAD = Number(process.env.FX_RATE_MAD || '10');

function load(jsonPath){ try{ return JSON.parse(fs.readFileSync(jsonPath,'utf-8')); }catch(e){ return []; } }
function save(path, data){ fs.writeFileSync(path, JSON.stringify(data,null,2),'utf-8'); }

function normalizeCurrency(items){
  // نخلي السعر الأساسي USD كما هو (للـfilters)، والواجهة تعرض MAD
  return items.map(it=> ({ ...it }));
}

function splitPages(items, per=100){
  const pages=[]; for(let i=0;i<items.length;i+=per){ pages.push(items.slice(i,i+per)); } return pages;
}

(function main(){
  // جمع صفحات موجودة
  const files = fs.readdirSync(TARGET_DIR).filter(f=>/^page_\d+\.json$/.test(f));
  let all=[]; for(const f of files){ all = all.concat(load(`${TARGET_DIR}/${f}`)); }
  // تنظيف بسيط حسب id
  const seen=new Set(); all = all.filter(x=>{ if(seen.has(x.id)) return false; seen.add(x.id); return true; });
  // حفظ lookup/index
  const pages = splitPages(normalizeCurrency(all), 100);
  const index=[]; const lookup={};
  pages.forEach((arr, idx)=>{ const page=`page_${String(idx+1).padStart(3,'0')}.json`; save(`${TARGET_DIR}/${page}`, arr); index.push(page); arr.forEach(it=> lookup[it.id]=page); });
  save(`${TARGET_DIR}/index.json`, index);
  save(`${TARGET_DIR}/lookup.json`, lookup);
  console.log('Catalog built. Pages:', index.length, 'Items:', all.length);
})();
