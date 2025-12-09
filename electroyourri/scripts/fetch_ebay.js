
import axios from 'axios';
import fs from 'fs';
import 'dotenv/config';

const CLIENT_ID = process.env.EBAY_CLIENT_ID;
const CLIENT_SECRET = process.env.EBAY_CLIENT_SECRET;
const SCOPE = process.env.EBAY_SCOPE || 'https://api.ebay.com/oauth/api_scope';
const TARGET_DIR = process.env.TARGET_PAGES_DIR || './data/pages';

async function getToken(){
  const params = new URLSearchParams();
  params.append('grant_type','client_credentials');
  params.append('scope', SCOPE);
  const { data } = await axios.post('https://api.ebay.com/identity/v1/oauth2/token', params, {
    auth: { username: CLIENT_ID, password: CLIENT_SECRET },
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
  });
  return data.access_token;
}

function normalize(item){
  const priceObj = item.price || item.currentPrice || { value: 0, currency: 'USD' };
  return {
    id: item.itemId || item.legacyItemId || ('EBAY_'+Math.random().toString(36).slice(2)),
    name: item.title,
    brand: item.brand || (item.itemBrand?.value) || 'eBay',
    category: item.categoryPath || 'إلكترونيات',
    source: 'eBay',
    price: Number(priceObj.value) || 0,
    currency: priceObj.currency || 'USD',
    rating: (item.rating && item.rating.averageRating) || 4.2,
    reviewsCount: (item.rating && item.rating.reviewCount) || 100,
    image: (item.image?.imageUrl) || (item.thumbnailImages?.[0]?.imageUrl) || '',
    originUrl: item.itemWebUrl || '',
    keyword: item.title?.split(' ').slice(0,3).join('+') || 'electronics',
    short: 'منتج من eBay',
    description: item.shortDescription || 'تفاصيل من eBay Browse API',
    features: ['مصدر رسمي eBay']
  };
}

async function search(accessToken, q, limit=50, offset=0){
  const { data } = await axios.get('https://api.ebay.com/buy/browse/v1/item_summary/search', {
    params: { q, limit, offset },
    headers: { Authorization: `Bearer ${accessToken}` }
  });
  return data.itemSummaries?.map(normalize) || [];
}

(async ()=>{
  const token = await getToken();
  const queries = ['smartphone','laptop','ssd','router','monitor','headphones','camera'];
  let items=[];
  for(const q of queries){
    const batch = await search(token, q, 50, 0);
    items = items.concat(batch);
  }
  const pageName = 'page_001.json';
  fs.writeFileSync(`${TARGET_DIR}/${pageName}`, JSON.stringify(items, null, 2), 'utf-8');
  // update index/lookup minimal
  const indexPath = `${TARGET_DIR}/index.json`;
  const lookupPath = `${TARGET_DIR}/lookup.json`;
  let index=[]; try{ index = JSON.parse(fs.readFileSync(indexPath,'utf-8')); }catch(e){}
  if(!index.includes(pageName)) index.push(pageName);
  fs.writeFileSync(indexPath, JSON.stringify(index, null, 2),'utf-8');
  const lookup={}; items.forEach(it=> lookup[it.id]=pageName);
  fs.writeFileSync(lookupPath, JSON.stringify(lookup, null, 2),'utf-8');
  console.log('eBay fetch done:', items.length);
})();
