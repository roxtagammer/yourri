
// === CONFIG (MAD افتراضيًا) ===
const FX = { updated: '2025-12-08', rates: { USD:1, MAD:10.0, EUR:0.93, GBP:0.79, AED:3.67, SAR:3.75 } };
const MARKET = { AMAZON_SITE:'amazon.fr', EBAY_SITE:'ebay.fr', DEFAULT_CURRENCY:'MAD' };
const AFF = {
  AMAZON_PARTNER_TAG:'yourtag-21', // ضع الوسم الرسمي ديالك Amazon FR
  EBAY_CAMPID:'', EBAY_CUSTOMID:'',
  ALIEXPRESS_PID:'', ALIEXPRESS_DEEPLINK_PREFIX:'',
  BESTBUY_AFFID:'', NEWEGG_AFF:'', WALMART_AFF:'', JUMIA_AFFID:''
};
const Currency = { current(){ return localStorage.getItem('currency')||MARKET.DEFAULT_CURRENCY; }, set(c){ localStorage.setItem('currency',c); location.reload(); } };
function convertPrice(usd,c){ const r=FX.rates[c]||1; return usd*r; }
function fmtMoney(v,c){ try{ return new Intl.NumberFormat('ar-MA',{style:'currency',currency:c}).format(v); }catch(e){ return v.toFixed(2)+' '+c; } }
function affiliateUrl(p){ const kw=encodeURIComponent(p.keyword||p.name.replace(/\s+/g,'+')); switch(p.source){
  case 'Amazon': return `https://${MARKET.AMAZON_SITE}/s?k=${kw}&tag=${AFF.AMAZON_PARTNER_TAG}`;
  case 'eBay':   return `https://${MARKET.EBAY_SITE}/sch/i.html?_nkw=${kw}`; // زِد campid عبر ريديركت إن شئت
  case 'AliExpress': { const deep=`https://www.aliexpress.com/w/wholesale-${kw}.html`; return AFF.ALIEXPRESS_DEEPLINK_PREFIX?AFF.ALIEXPRESS_DEEPLINK_PREFIX+encodeURIComponent(deep):deep; }
  case 'Jumia':  return `https://www.jumia.ma/catalog/?q=${kw}`+(AFF.JUMIA_AFFID?`&affid=${AFF.JUMIA_AFFID}`:'');
  default: return p.originUrl||'#';
}}
