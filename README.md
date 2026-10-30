# موقع عبدالله — CV & Portfolio

موقع شخصي عربي داكن ومتجاوب، مبني باستخدام React وTypeScript وVite. يحتوي على لوحة تحكم لتعديل المحتوى، ويعمل مباشرة كموقع ثابت، مع إمكانية ربط Supabase للحفظ الدائم.

## المميزات

- تصميم عربي RTL متجاوب مع الهاتف والكمبيوتر.
- أقسام النبذة والتخصصات والمشاريع والتقنيات والهدف المهني والتواصل.
- روابط مباشرة للبريد والهاتف وواتساب وGitHub.
- طباعة السيرة الذاتية أو حفظها PDF من المتصفح.
- لوحة تحكم في `admin.html` لتعديل البيانات وإضافة وحذف المشاريع والتخصصات.
- تصدير واستيراد نسخة احتياطية JSON.
- حفظ محلي للتجربة، أو حفظ سحابي آمن باستخدام Supabase Auth.
- إعداد جاهز للنشر التلقائي على GitHub Pages.

## التشغيل محليًا

```bash
npm install
npm run dev
```

- الموقع: العنوان الذي يظهر في الطرفية.
- لوحة التحكم: افتح `admin.html` بجوار عنوان الموقع، مثل `http://localhost:5173/admin.html`.

لبناء نسخة الإنتاج:

```bash
npm run build
npm run preview
```

## التعديل بدون قاعدة بيانات

الموقع يعمل بدون أي مفاتيح خارجية. توجد البيانات الأصلية في:

```text
src/cv.ts
```

ومن لوحة التحكم في الوضع المحلي يمكنك تعديل المحتوى وحفظه في المتصفح الحالي. هذا مناسب للتجربة فقط؛ التعديلات المحلية لا تظهر على الأجهزة الأخرى.

## تفعيل لوحة التحكم لكل الزوار

### 1. إنشاء مشروع Supabase

أنشئ مشروعًا في [Supabase](https://supabase.com)، ثم افتح **SQL Editor** وشغّل محتوى الملف:

```text
supabase/setup.sql
```

البريد المسموح له بالتعديل في الملف هو:

```text
abdallahai369@gmail.com
```

إذا أردت بريدًا آخر للمدير، غيّره داخل سياسات `Admin can insert CV` و`Admin can update CV` قبل تشغيل SQL.

### 2. إنشاء حساب المدير

من **Authentication → Users** أنشئ مستخدمًا بالبريد نفسه الموجود في SQL، واختر كلمة سر قوية خاصة بك. لا تضع كلمة السر في الكود أو في GitHub.

يُفضّل تعطيل التسجيل العام **Sign ups** من إعدادات Authentication؛ زوار الموقع لا يحتاجون إلى إنشاء حسابات.

### 3. إضافة مفاتيح المشروع

انسخ `.env.example` إلى `.env.local` وضع:

```env
VITE_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
VITE_SUPABASE_ANON_KEY=YOUR_PUBLIC_ANON_KEY
```

استخدم **المفتاح العام anon / publishable فقط**. لا تستخدم مفتاح `service_role` داخل الموقع نهائيًا.

بعد إعادة تشغيل خادم التطوير، افتح `admin.html` وسجّل الدخول بحساب المدير. زر **حفظ ونشر** سيحفظ التعديلات في Supabase ويعرضها لكل الزوار.

## النشر على GitHub Pages

المشروع يحتوي على Workflow جاهز في `.github/workflows/deploy.yml`.

### 1. إنشاء مستودع ورفع الملفات

أنشئ مستودعًا فارغًا باسم `abdullah-cv` ثم نفّذ داخل مجلد المشروع:

```bash
git init -b main
git config user.name "Abdullah"
git config user.email "abdallahai369@gmail.com"
git add .
git commit -m "Publish Abdullah CV portfolio"
git remote add origin https://github.com/abdallanai369-lgtm/abdullah-cv.git
git push -u origin main
```

هذه الأوامر تعمل أيضًا بعد فك ضغط نسخة المصدر التي لا تتضمن مجلد `.git`. إذا كان المشروع عندك داخل Git بالفعل وله Commit، يكفي تنفيذ أمرَي `remote add` و`push`.

إذا اخترت اسم مستودع مختلفًا، عدّل الرابط في الأمر. لا يلزم تغيير إعداد `base` لأن المشروع يستخدم مسارات نسبية.

### 2. إضافة أسرار Supabase إلى GitHub

من المستودع افتح **Settings → Secrets and variables → Actions** وأضف Repository secrets التالية:

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

هذه الخطوة اختيارية إذا كنت تريد الموقع الثابت فقط، ومطلوبة لعمل الحفظ السحابي بعد النشر.

### 3. تفعيل Pages

من **Settings → Pages** اختر **GitHub Actions** كمصدر للنشر. بعدها سيُنشر الموقع تلقائيًا مع كل Push إلى فرع `main`، ويمكن تشغيل Workflow يدويًا من تبويب Actions.

الرابط المتوقع عند استخدام اسم المستودع المقترح:

```text
https://abdallanai369-lgtm.github.io/abdullah-cv/
```

ولوحة التحكم:

```text
https://abdallanai369-lgtm.github.io/abdullah-cv/admin.html
```

## الاستخدام اليومي بعد النشر

1. افتح `admin.html`.
2. سجّل الدخول بالبريد وكلمة السر اللذين أنشأتهما في Supabase.
3. عدّل البيانات أو المشاريع.
4. اضغط **حفظ ونشر** ثم **معاينة الموقع**.
5. استخدم **النسخ والإعداد → تصدير نسخة احتياطية** للاحتفاظ بالمحتوى من وقت لآخر.

## أهم الملفات

```text
src/PublicSite.tsx       واجهة الموقع
src/AdminApp.tsx         لوحة التحكم
src/cv.ts                المحتوى الافتراضي وأنواع البيانات
src/content.ts           الحفظ المحلي وربط Supabase
src/styles.css           التصميم والتجاوب والطباعة
supabase/setup.sql       الجدول وصلاحيات القراءة والتعديل
.github/workflows/       النشر التلقائي على GitHub Pages
```
