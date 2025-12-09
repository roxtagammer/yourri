
import crypto from 'crypto';
import https from 'https';
import fs from 'fs';
import 'dotenv/config';

const accessKey = process.env.AMAZON_ACCESS_KEY;
const secretKey = process.env.AMAZON_SECRET_KEY;
const partnerTag = process.env.AMAZON_PARTNER_TAG;
const host = process.env.AMAZON_HOST || 'webservices.amazon.com';
const region = process.env.AMAZON_REGION || 'us-east-1';
const targetDir = process.env.TARGET_PAGES_DIR || './data/pages';

function sign(key, msg){ return crypto.createHmac('sha256', key).update(msg, 'utf8').digest(); }
function sha256(msg){ return crypto.createHash('sha256').update(msg, 'utf8').digest('hex'); }
function getSignatureKey(key, dateStamp, regionName, serviceName){
  const kDate = sign('AWS4' + key, dateStamp);
  const kRegion = sign(kDate, regionName);
  const kService = sign(kRegion, serviceName);
  const kSigning = sign(kService, 'aws4_request');
  return kSigning;
}

function buildRequestBody(){
  return JSON.stringify({
    "Keywords": "electronics",
    "SearchIndex": "All",
    "PartnerTag": partnerTag,
    "PartnerType": "Associates",
    "Marketplace": "www.amazon.fr",
    "ItemPage": 1,
    "Resources": [
      "Images.Primary.Large","ItemInfo.Title","ItemInfo.ByLineInfo","Offers.Listings.Price","ItemInfo.Features","ItemInfo.ProductInfo"
    ]
  });
}

async function callPAAPI(){
  const method='POST', service='ProductAdvertisingAPI', amzTarget='com.amazon.paapi5.v1.ProductAdvertisingAPIv1.SearchItems';
  const path='/paapi5/searchitems';
  const body = buildRequestBody();
  const now = new Date();
  const amzdate = now.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
  const dateStamp = amzdate.slice(0,8);
  const headers = {
    'content-encoding':'amz-1.0',
    'content-type':'application/json; charset=UTF-8',
    'host': host,
    'x-amz-date': amzdate,
    'x-amz-target': amzTarget
  };
  const signedHeaders = Object.keys(headers).sort().join(';');
  const canonicalHeaders = Object.keys(headers).sort().map(h=> h+':'+headers[h]).join('
')+'
';
  const canonicalRequest = [method, path, '', canonicalHeaders, signedHeaders, sha256(body)].join('
');
  const algorithm='AWS4-HMAC-SHA256';
  const credentialScope = `${dateStamp}/${region}/${service}/aws4_request`;
  const stringToSign = [algorithm, amzdate, credentialScope, sha256(canonicalRequest)].join('
');
  const signingKey = getSignatureKey(secretKey, dateStamp, region, service);
  const signature = crypto.createHmac('sha256', signingKey).update(stringToSign, 'utf8').digest('hex');
  const authorization = `${algorithm} Credential=${accessKey}/${credentialScope}, SignedHeaders=${signedHeaders}, Signature=${signature}`;
  const options = { hostname: host, port: 443, path, method, headers: { ...headers, Authorization: authorization } };
  const items = await new Promise((resolve,reject)=>{
    const req = https.request(options, (res)=>{
      let data=''; res.on('data',(d)=>data+=d); res.on('end',()=>{ try{ const json=JSON.parse(data); resolve(json.ItemsResult?.Items||[]); }catch(e){ reject(e); } });
    }); req.on('error',reject); req.write(body); req.end();
  });
  return items.map(it=>({
    id: it.ASIN || ('AMZ_'+Math.random().toString(36).slice(2)),
    name: it.ItemInfo?.Title?.DisplayValue,
    brand: it.ItemInfo?.ByLineInfo?.Brand?.DisplayValue || it.ItemInfo?.ByLineInfo?.Manufacturer?.DisplayValue || 'Amazon',
    category: 'إلكترونيات',
    source: 'Amazon',
    price: Number(it.Offers?.Listings?.[0]?.Price?.Amount || 0),
    currency: it.Offers?.Listings?.[0]?.Price?.Currency || 'USD',
    rating: 4.5,
    reviewsCount: 100,
    image: it.Images?.Primary?.Large?.URL || '',
    originUrl: it.DetailPageURL || '',
    keyword: (it.ItemInfo?.Title?.DisplayValue||'').split(' ').slice(0,3).join('+'),
    short: 'منتج من Amazon',
    description: it.ItemInfo?.Features?.DisplayValues?.join(' • ') || 'تفاصيل من Amazon PA-API',
    features: it.ItemInfo?.Features?.DisplayValues || []
  }));
}

(async ()=>{
  const items = await callPAAPI();
  const targetDir = targetDirFromEnv();
  const pageName='page_002.json';
  writePage(targetDir, pageName, items);
})();

function targetDirFromEnv(){ return process.env.TARGET_PAGES_DIR || './data/pages'; }
function writePage(dir, page, items){
  if(!fs.existsSync(dir)) fs.mkdirSync(dir,{recursive:true});
  fs.writeFileSync(`${dir}/${page}`, JSON.stringify(items, null, 2),'utf-8');
  // update index/lookup
  const indexPath=`${dir}/index.json`, lookupPath=`${dir}/lookup.json`;
  let index=[]; try{ index=JSON.parse(fs.readFileSync(indexPath,'utf-8')); }catch(e){}
  if(!index.includes(page)) index.push(page);
  fs.writeFileSync(indexPath, JSON.stringify(index,null,2),'utf-8');
  let lookup={}; try{ lookup=JSON.parse(fs.readFileSync(lookupPath,'utf-8')); }catch(e){}
  items.forEach(it=> lookup[it.id]=page);
  fs.writeFileSync(lookupPath, JSON.stringify(lookup,null,2),'utf-8');
  console.log('Amazon fetch done:', items.length);
}
