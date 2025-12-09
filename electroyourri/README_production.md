
# Electro Yourri — نسخة نهائية مع MAD ودمج APIs

هذه النسخة جاهزة للإطلاق الرسمي. الواجهة تعرض الأسعار بعملة MAD (محلياً من USD)، وروابط إحالة لكل منصة. تم تضمين سكريبتات Node.js لسحب بيانات حقيقية من:
- **Amazon Product Advertising API 5.0** (SearchItems)
- **eBay Browse API** (item_summary/search)
- **AliExpress Open Platform** (يتطلب صلاحيات مطوّر — السكريبت توضيحي placeholder)

> **مهم:** الالتزام بشروط البرامج الرسمية ضروري، والولوج للبيانات يتطلب مفاتيح وOAuth حسب المنصة.

## التثبيت
```bash
# داخل electro-yourri-pro-final/
cp scripts/.env.example scripts/.env
# حرّر scripts/.env وضع مفاتيحك
npm install

# جلب دفعة أولى من eBay
npm run fetch:ebay
# جلب دفعة من Amazon
npm run fetch:amazon
# إن كان لديك صلاحيات AliExpress
npm run fetch:aliexpress

# بناء الكاتالوج النهائي وتقسيم الصفحات
npm run build
```
بعدها شغّل محلياً:
```bash
python -m http.server 8000
# http://localhost:8000/index.html
```

## إعدادات الإحالة والعملة
- `config.js`:
  - `MARKET.DEFAULT_CURRENCY='MAD'` (افتراضي).
  - `MARKET.AMAZON_SITE='amazon.fr'` و `MARKET.EBAY_SITE='ebay.fr'` — غيّرها حسب السوق.
  - `AFF.*` ضع بارامتراتك الرسمية لكل منصة.

> الواجهة تعرض السعر بـMAD بناءً على تحويل محلي من USD. الفلاتر السعرية تعتمد على USD (كما هو شائع في APIs).

## مراجع رسمية
- Amazon PA‑API 5.0 (SearchItems وSDKs): https://webservices.amazon.com/paapi5/documentation/  
- eBay Browse API overview: https://developer.ebay.com/api-docs/buy/browse/overview.html  
- AliExpress Open Platform (بوابة المطوّرين): https://openservice.aliexpress.com/doc/doc.htm

## نشر
- Netlify/Vercel: ارفع مجلّد المشروع — لا حاجة لبناء.
- حدّث `robots.txt` و`sitemap.xml` بالدومين النهائي، وسجّل الموقع في Google Search Console.

## تنبيه قانوني
- لا تنسخ محتوى محمي بدون إذن؛ اعمل فقط عبر الواجهات الرسمية وبرامج الإحالة.
- راقب حدود الاستدعاء (Rate Limits) لكل API.
