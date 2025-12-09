
import axios from 'axios';
import fs from 'fs';
import 'dotenv/config';

const ALX_APP_KEY = process.env.ALX_APP_KEY;
const ALX_APP_SECRET = process.env.ALX_APP_SECRET;
const ALX_ACCESS_TOKEN = process.env.ALX_ACCESS_TOKEN; // افترض أنك حصلت عليه عبر OAuth
const TARGET_DIR = process.env.TARGET_PAGES_DIR || './data/pages';

// ملاحظة: واجهات Aliexpress Open Platform تتطلّب صلاحيات مطوّر وتبديل رموز OAuth.
// هذا سكريبت توضيحي لكيفية جلب منتجات عبر endpoint افتراضي (غيّر حسب وثائقك المفعّلة).

async function searchAliExpress(q){
  // Endpoint افتراضي — راجع وثائق مزوّدك أو خدمة الـOpen Platform الفعلية.
  const url = 'https://openapi.aliexpress.com/xxxx/product/search';
  const params = { q, access_token: ALX_ACCESS_TOKEN, app_key: ALX_APP_KEY };
  try{
    const { data } = await axios.get(url, { params });
    const list = (data.items || []).map(normalize);
    return list;
  }catch(e){ console.error('AliExpress fetch error (placeholder):', e.message); return []; }
}

function normalize(item){
  return {
    id: item.product_id || ('ALX_'+Math.random().toString(36).slice(2)),
    name: item.product_title || 'منتج AliExpress',
    brand: item.brand || 'AliExpress',
    category: item.category_name || 'إلكترونيات',
    source: 'AliExpress',
    price: Number(item.price_usd || item.price || 0),
    currency: 'USD',
    rating: item.rating || 4.2,
    reviewsCount: item.reviews || 50,
    image: item.main_image || '',
    originUrl: item.product_url || '',
    keyword: (item.product_title||'').split(' ').slice(0,3).join('+'),
    short: 'منتج من AliExpress',
    description: item.summary || 'تفاصيل من AliExpress Open Platform',
    features: ['منصة رسمية AliExpress']
  };
}

(async()=>{
  const queries=['smartphone','laptop','camera'];
  let items=[]; for(const q of queries){ items = items.concat(await searchAliExpress(q)); }
  const page='page_003.json';
  writePage(TARGET_DIR, page, items);
})();

function writePage(dir, page, items){
  if(!fs.existsSync(dir)) fs.mkdirSync(dir,{recursive:true});
  fs.writeFileSync(`${dir}/${page}`, JSON.stringify(items,null,2),'utf-8');
  const indexPath=`${dir}/index.json`, lookupPath=`${dir}/lookup.json`;
  let index=[]; try{ index=JSON.parse(fs.readFileSync(indexPath,'utf-8')); }catch(e){}
  if(!index.includes(page)) index.push(page);
  fs.writeFileSync(indexPath, JSON.stringify(index,null,2),'utf-8');
  let lookup={}; try{ lookup=JSON.parse(fs.readFileSync(lookupPath,'utf-8')); }catch(e){}
  items.forEach(it=> lookup[it.id]=page);
  fs.writeFileSync(lookupPath, JSON.stringify(lookup,null,2),'utf-8');
  console.log('AliExpress fetch done (placeholder):', items.length);
}
