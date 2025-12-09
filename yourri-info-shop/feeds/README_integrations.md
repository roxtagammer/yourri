
# تكامل جلب 10,000+ منتج من مصادر متعددة

> **تنبيه**: هذا المجلد يحتوي شروح وسكريبتات نموذجية فقط. ستحتاج مفاتيح/حسابات رسمية لكل منصة (AliExpress، Amazon، eBay، Shopify). 

## مصادر موصى بها قانونياً
- **AliExpress Open Platform / Affiliate API**: يجلب بيانات المنتجات والروابط التتبعية.
- **Amazon Product Advertising API (PA‑API)**: يجلب بيانات المنتجات للأفلييت.
- **eBay Developers / Browse & Feed APIs**: لجلب قوائم ضخمة بفاعلية.
- **Shopify Storefront API**: لجلب منتجات من متاجر Shopify (يتطلب توكن من صاحب المتجر).

## خط تجميع (Pipeline) مقترح
1. وظائف مجدولة (Cron) على سيرفر/Serverless تستدعي APIs وتنتج JSON موحّد.
2. تنظيف وتطبيع البيانات (العملة/الفئات/الصور).
3. تحديث تدريجي (تقسيم JSON إلى صفحات) لتسريع التحميل.
4. التخزين على CDN مع Cache-Control.

## قالب JSON موحّد
```
{
  "id": "string",
  "name": "string",
  "category": "string",
  "source": "AliExpress|Amazon|eBay|Shopify",
  "price": 0.0,
  "currency": "USD",
  "rating": 0.0,
  "reviewsCount": 0,
  "image": "URL أو data URI",
  "originUrl": "رابط المنتج/البحث في المصدر",
  "description": "نص"
}
```

## ملاحظات قانونية
- اعمل عبر برامج الأفلييت واحترم شروط الاستخدام.
- لا تستخدم شعارات/علامات تجارية ضمن الهوية.
- الأسعار تتغير؛ نفّذ مزامنة دورية وحفظ تاريخ آخر تحديث.

