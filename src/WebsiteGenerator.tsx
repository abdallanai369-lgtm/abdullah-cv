import { useState } from 'react';
import type { FormEvent } from 'react';
import {
  Check,
  Copy,
  Download,
  Globe2,
  MessageCircle,
  Monitor,
  RefreshCw,
  Smartphone,
  Sparkles,
  WandSparkles,
} from 'lucide-react';

type Category = 'business' | 'restaurant' | 'medical' | 'store' | 'portfolio' | 'education' | 'realestate';

interface Service {
  title: string;
  description: string;
}

interface Template {
  label: string;
  defaultName: string;
  tagline: string;
  hero: string;
  aboutTitle: string;
  primary: string;
  accent: string;
  services: Service[];
}

interface GeneratedSite {
  title: string;
  category: string;
  html: string;
}

const templates: Record<Category, Template> = {
  business: {
    label: 'موقع شركة وأعمال',
    defaultName: 'شركتك',
    tagline: 'حلول احترافية تساعدك على النمو.',
    hero: 'نحوّل أهدافك إلى خدمات وتجارب رقمية واضحة، بتصميم احترافي وتركيز على النتائج.',
    aboutTitle: 'شريكك نحو النمو',
    primary: '#2563eb',
    accent: '#60a5fa',
    services: [
      { title: 'خدمات مخصصة', description: 'حلول مصممة حول احتياجات عملائك وأهداف مشروعك.' },
      { title: 'تجربة احترافية', description: 'واجهة واضحة تساعد الزائر على معرفة خدماتك بسرعة.' },
      { title: 'تواصل أسهل', description: 'مسارات بسيطة تساعد العملاء على الوصول إليك.' },
    ],
  },
  restaurant: {
    label: 'موقع مطعم أو كافيه',
    defaultName: 'مطعمك',
    tagline: 'نكهات تستحق التجربة.',
    hero: 'اكتشف أصنافنا المميزة وعروضنا، واستمتع بتجربة تجمع بين المذاق الرائع والخدمة السهلة.',
    aboutTitle: 'تجربة طعام لا تُنسى',
    primary: '#ea580c',
    accent: '#fb923c',
    services: [
      { title: 'قائمة الطعام', description: 'اعرض الأصناف والأقسام بطريقة منظمة وشهية.' },
      { title: 'عروض خاصة', description: 'مساحة مميزة لأحدث الوجبات والعروض الموسمية.' },
      { title: 'الحجز والطلبات', description: 'سهّل على عملائك معرفة طرق الحجز والطلب.' },
    ],
  },
  medical: {
    label: 'موقع طبي',
    defaultName: 'مركزك الطبي',
    tagline: 'رعاية تبدأ من الاهتمام.',
    hero: 'معلومات واضحة عن خدماتنا الطبية وفرقنا المتخصصة، مع تجربة تساعد المرضى على الوصول إلى الرعاية المناسبة.',
    aboutTitle: 'رعاية تتمحور حول المريض',
    primary: '#0d9488',
    accent: '#5eead4',
    services: [
      { title: 'الخدمات الطبية', description: 'تعريف واضح بالتخصصات والخدمات المتاحة.' },
      { title: 'حجز المواعيد', description: 'معلومات مباشرة تساعد المريض على طلب موعده.' },
      { title: 'دليل المريض', description: 'إرشادات ومعلومات مهمة قبل الزيارة وبعدها.' },
    ],
  },
  store: {
    label: 'متجر ومنتجات',
    defaultName: 'متجرك',
    tagline: 'كل ما تحتاجه في مكان واحد.',
    hero: 'تسوّق مجموعتنا المختارة من المنتجات، واكتشف العروض الجديدة بتجربة بسيطة وسريعة على كل الأجهزة.',
    aboutTitle: 'تجربة تسوق أبسط',
    primary: '#7c3aed',
    accent: '#a78bfa',
    services: [
      { title: 'منتجات مختارة', description: 'عرض منظم للمنتجات الأكثر أهمية لعملائك.' },
      { title: 'عروض وخصومات', description: 'إبراز أفضل العروض بطريقة واضحة وجذابة.' },
      { title: 'طلب سهل', description: 'خطوات مبسطة تساعد العميل على إتمام طلبه.' },
    ],
  },
  portfolio: {
    label: 'موقع شخصي وأعمال',
    defaultName: 'اسمك',
    tagline: 'أصنع قيمة من خلال العمل والإبداع.',
    hero: 'أعرض هنا خبراتي ومشروعاتي والخدمات التي أقدمها، مع تركيز على الجودة والتفاصيل والنتائج العملية.',
    aboutTitle: 'الشغف يتحول إلى عمل',
    primary: '#0891b2',
    accent: '#67e8f9',
    services: [
      { title: 'أحدث المشاريع', description: 'مساحة لعرض أفضل الأعمال والنتائج المحققة.' },
      { title: 'المهارات والخبرات', description: 'تلخيص واضح لنقاط القوة ومجالات التخصص.' },
      { title: 'لنعمل معًا', description: 'طريقة مباشرة لبدء حديث عن المشروع القادم.' },
    ],
  },
  education: {
    label: 'منصة تعليمية',
    defaultName: 'منصتك التعليمية',
    tagline: 'تعلّم خطوة بخطوة نحو هدفك.',
    hero: 'محتوى تعليمي منظم ومسارات واضحة تساعد المتعلم على اكتساب المعرفة وتطبيقها بثقة.',
    aboutTitle: 'تعليم أوضح وأكثر تأثيرًا',
    primary: '#4f46e5',
    accent: '#818cf8',
    services: [
      { title: 'دورات ومسارات', description: 'تنظيم المحتوى في خطوات تعليمية سهلة المتابعة.' },
      { title: 'مصادر تعليمية', description: 'مواد وأدوات تساعد على الفهم والتطبيق.' },
      { title: 'متابعة التقدم', description: 'رؤية واضحة للمراحل والإنجازات التعليمية.' },
    ],
  },
  realestate: {
    label: 'موقع عقارات',
    defaultName: 'شركتك العقارية',
    tagline: 'مساحتك المناسبة تبدأ من هنا.',
    hero: 'استكشف العقارات والمشاريع المتاحة، واحصل على المعلومات التي تساعدك على اتخاذ قرارك بثقة.',
    aboutTitle: 'خبرة تساعدك على الاختيار',
    primary: '#0369a1',
    accent: '#38bdf8',
    services: [
      { title: 'عقارات مميزة', description: 'عرض العقارات بصور ووصف وتفاصيل منظمة.' },
      { title: 'مشاريع ومناطق', description: 'معلومات عن المواقع والمشروعات المتاحة.' },
      { title: 'طلب معاينة', description: 'مسار واضح للتواصل وطلب التفاصيل أو المعاينة.' },
    ],
  },
};

const keywords: Record<Category, string[]> = {
  business: ['شركة', 'مؤسسة', 'خدمات', 'أعمال', 'business', 'company', 'agency'],
  restaurant: ['مطعم', 'مطاعم', 'كافيه', 'مقهى', 'منيو', 'طعام', 'restaurant', 'cafe', 'food'],
  medical: ['عيادة', 'عياده', 'طبي', 'طبية', 'دكتور', 'طبيب', 'مستشفى', 'أسنان', 'clinic', 'medical', 'doctor'],
  store: ['متجر', 'محل', 'منتجات', 'بيع', 'تسوق', 'تجارة', 'store', 'shop', 'ecommerce', 'products'],
  portfolio: ['شخصي', 'سيرة', 'أعمالي', 'مطور', 'مصمم', 'portfolio', 'cv', 'developer', 'designer'],
  education: ['تعليم', 'تعليمي', 'كورس', 'كورسات', 'دورة', 'دورات', 'مدرسة', 'تدريب', 'course', 'education', 'school'],
  realestate: ['عقار', 'عقارات', 'شقق', 'شقة', 'فلل', 'سكني', 'real estate', 'property'],
};

const examples = [
  { label: 'مطعم', text: 'أريد موقعًا باسم مطعم أمواج في القاهرة، يعرض المنيو والعروض وطرق الحجز والتواصل.' },
  { label: 'شركة', text: 'أريد موقعًا باسم شركة الرواد للخدمات، يعرض خدماتنا ومجالات عملنا ووسائل التواصل.' },
  { label: 'عيادة', text: 'أريد موقعًا باسم مركز الحياة الطبي، يعرض التخصصات والخدمات وحجز المواعيد.' },
  { label: 'متجر', text: 'أريد متجرًا باسم متجر النخبة لعرض المنتجات والعروض وتسهيل الطلب للعملاء.' },
  { label: 'موقع شخصي', text: 'أريد موقعًا شخصيًا باسم أحمد محمد لعرض مشروعاتي ومهاراتي وخبراتي في التصميم.' },
];

function escapeHtml(value: string): string {
  return value.replace(/[&<>'"]/g, (character) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;',
  })[character]!);
}

function cleanName(value: string): string {
  return value
    .split(/[،.!؟:\n]/)[0]
    .split(/\s+(?:في|بمدينة|يعرض|يقدم|لعرض|متخصص|متخصصة|لتقديم|لتوفير|مصر|القاهرة|الجيزة|السعودية|دبي)(?=\s|$|[،.!؟])/u)[0]
    .replace(/^(?:موقع|موقعًا)\s+/u, '')
    .trim()
    .slice(0, 38);
}

function detectCategory(description: string): Category {
  const normalized = description.toLowerCase();
  let bestCategory: Category = 'business';
  let bestScore = 0;
  (Object.entries(keywords) as [Category, string[]][]).forEach(([category, words]) => {
    const score = words.reduce((total, word) => total + (normalized.includes(word) ? 1 : 0), 0);
    if (score > bestScore) {
      bestCategory = category;
      bestScore = score;
    }
  });
  return bestCategory;
}

function extractName(description: string, template: Template): string {
  const patterns = [
    /(?:باسم|بإسم|اسم(?:ه|ها)?)\s+([\p{L}\p{N}&][\p{L}\p{N}& _-]{1,48})/u,
    /(?:called|named)\s+([a-z0-9&][a-z0-9& _-]{1,48})/i,
    /(?:لمطعم|لمقهى|لكافيه|لشركة|لعيادة|لمركز|لمتجر)\s+([\p{L}\p{N}&][\p{L}\p{N}& _-]{1,48})/u,
  ];
  for (const pattern of patterns) {
    const match = description.match(pattern);
    if (match?.[1]) {
      const name = cleanName(match[1]);
      if (name.length >= 2) return name;
    }
  }
  return template.defaultName;
}

function buildHtml(description: string, template: Template, name: string): string {
  const safeName = escapeHtml(name);
  const safeDescription = escapeHtml(description);
  const email = description.match(/[\w.+-]+@[\w.-]+\.[a-z]{2,}/i)?.[0] ?? '';
  const phone = description.match(/\+?\d[\d\s()-]{7,}\d/)?.[0] ?? '';
  const contactLinks = [
    email ? `<a href="mailto:${escapeHtml(email)}" dir="ltr">${escapeHtml(email)}</a>` : '',
    phone ? `<a href="tel:${escapeHtml(phone.replace(/\s/g, ''))}" dir="ltr">${escapeHtml(phone)}</a>` : '',
  ].filter(Boolean).join('');

  return `<!doctype html>
<html lang="ar" dir="rtl">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<meta name="description" content="${safeDescription.slice(0, 155)}">
<title>${safeName}</title>
<style>
:root{--primary:${template.primary};--accent:${template.accent};--ink:#102033;--muted:#5d6b7c;--bg:#f6f8fb}*{box-sizing:border-box}html{scroll-behavior:smooth}body{margin:0;font-family:Tahoma,Arial,sans-serif;color:var(--ink);background:var(--bg);line-height:1.8}a{color:inherit;text-decoration:none}.container{width:min(1120px,calc(100% - 36px));margin:auto}.nav{display:flex;align-items:center;justify-content:space-between;gap:20px;padding:22px 0}.logo{font-size:22px;font-weight:800}.logo span{color:var(--primary)}.nav-links{display:flex;gap:22px;color:var(--muted);font-size:13px}.hero{padding:80px 0 65px;background:radial-gradient(circle at 15% 15%,${template.accent}35,transparent 34%)}.hero-grid{display:grid;grid-template-columns:1.15fr .85fr;gap:45px;align-items:center}.badge{display:inline-block;padding:6px 12px;color:var(--primary);background:#fff;border:1px solid #e1e8f0;border-radius:30px;font-size:12px}h1{margin:18px 0 10px;font-size:clamp(38px,6vw,64px);line-height:1.3}h1 span{color:var(--primary)}.tagline{color:var(--primary);font-size:22px;font-weight:700}.hero-text{max-width:650px;color:var(--muted);font-size:16px}.actions{display:flex;flex-wrap:wrap;gap:10px;margin-top:25px}.button{display:inline-block;padding:12px 20px;border-radius:10px;background:var(--primary);color:#fff;font-weight:700;font-size:13px}.button.secondary{color:var(--primary);background:#fff;border:1px solid #dce4ed}.visual{min-height:330px;display:grid;place-items:center;padding:35px;color:#fff;background:linear-gradient(145deg,var(--primary),#14233a);border-radius:28px;box-shadow:0 30px 60px #18283c25;text-align:center}.visual-icon{width:76px;height:76px;display:grid;place-items:center;margin:0 auto 20px;background:#ffffff1c;border:1px solid #ffffff35;border-radius:22px;font-size:36px}.visual h2{margin:0 0 10px;font-size:27px}.visual p{margin:0;color:#ffffffbc;font-size:13px}.section{padding:70px 0}.section-head{max-width:650px;margin-bottom:30px}.section-head small{color:var(--primary);font-weight:700}.section-head h2{margin:8px 0;font-size:31px}.cards{display:grid;grid-template-columns:repeat(3,1fr);gap:16px}.card{padding:26px;background:#fff;border:1px solid #e2e9f0;border-radius:17px}.card-number{color:var(--primary);font-size:12px;font-weight:800}.card h3{margin:12px 0 7px;font-size:20px}.card p{margin:0;color:var(--muted);font-size:13px}.about{display:grid;grid-template-columns:.75fr 1.25fr;gap:45px;padding:35px;background:#fff;border:1px solid #e2e9f0;border-radius:22px}.about h2{margin:0;color:var(--primary);font-size:28px}.about p{margin:0;color:var(--muted);white-space:pre-line}.contact{padding:35px;color:#fff;background:linear-gradient(135deg,var(--primary),#14233a);border-radius:22px;text-align:center}.contact h2{margin:0 0 8px}.contact p{margin:0 0 15px;color:#ffffffc4}.contact a{display:inline-block;margin:5px;padding:8px 12px;background:#ffffff17;border-radius:8px;direction:ltr}.note{margin-top:16px;color:var(--muted);font-size:11px;text-align:center}footer{padding:25px 0;color:var(--muted);font-size:12px;text-align:center}@media(max-width:760px){.hero-grid,.about{grid-template-columns:1fr}.hero{padding-top:45px}.cards{grid-template-columns:1fr}.nav-links{display:none}.visual{min-height:260px}.section{padding:45px 0}.about{gap:20px}.hero h1{font-size:39px}}@media(max-width:420px){.actions{display:grid}.button{text-align:center}.hero h1{font-size:34px}.tagline{font-size:19px}.visual{padding:25px}.about,.contact{padding:24px}}
</style>
</head>
<body>
<header class="container nav"><a class="logo" href="#">${safeName} <span>●</span></a><nav class="nav-links"><a href="#services">الخدمات</a><a href="#about">من نحن</a><a href="#contact">تواصل</a></nav></header>
<main>
<section class="hero"><div class="container hero-grid"><div><span class="badge">${template.label}</span><h1>${safeName}</h1><div class="tagline">${template.tagline}</div><p class="hero-text">${template.hero}</p><div class="actions"><a class="button" href="#services">اكتشف خدماتنا</a><a class="button secondary" href="#contact">تواصل معنا</a></div></div><div class="visual"><div><div class="visual-icon">✦</div><h2>${safeName}</h2><p>${template.tagline}</p></div></div></div></section>
<section class="section" id="services"><div class="container"><div class="section-head"><small>ماذا نقدم؟</small><h2>كل ما يحتاجه الزائر في مكان واحد</h2></div><div class="cards">${template.services.map((service, index) => `<article class="card"><span class="card-number">0${index + 1}</span><h3>${service.title}</h3><p>${service.description}</p></article>`).join('')}</div></div></section>
<section class="section" id="about"><div class="container about"><h2>${template.aboutTitle}</h2><p>${safeDescription}</p></div></section>
<section class="section" id="contact"><div class="container"><div class="contact"><h2>لنبدأ الحديث</h2><p>${contactLinks ? 'يمكنك التواصل معنا من خلال:' : 'أضف بيانات التواصل الخاصة بالنشاط هنا قبل نشر الموقع.'}</p>${contactLinks}</div><p class="note">هذا نموذج أولي قابل للتخصيص. راجع النصوص وبيانات التواصل قبل النشر.</p></div></section>
</main>
<footer>© ${new Date().getFullYear()} ${safeName} — نموذج أولي تم إنشاؤه بواسطة مولد TITAN Digital</footer>
</body>
</html>`;
}

function generateSite(description: string): GeneratedSite {
  const category = detectCategory(description);
  const template = templates[category];
  const title = extractName(description, template);
  return { title, category: template.label, html: buildHtml(description, template, title) };
}

function fileName(value: string): string {
  return value.normalize('NFKD').replace(/[^a-zA-Z0-9]+/g, '-').replace(/^-+|-+$/g, '').toLowerCase() || 'titan-website';
}

export function WebsiteGenerator({ whatsappNumber }: { whatsappNumber: string }) {
  const [description, setDescription] = useState('');
  const [result, setResult] = useState<GeneratedSite | null>(null);
  const [device, setDevice] = useState<'desktop' | 'mobile'>('desktop');
  const [copied, setCopied] = useState(false);

  function handleGenerate(event: FormEvent) {
    event.preventDefault();
    if (description.trim().length < 10) return;
    setResult(generateSite(description.trim()));
    setCopied(false);
    window.setTimeout(() => document.getElementById('generator-result')?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 80);
  }

  function downloadHtml() {
    if (!result) return;
    const blob = new Blob([result.html], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = `${fileName(result.title)}.html`;
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  async function copyHtml() {
    if (!result) return;
    try {
      await navigator.clipboard.writeText(result.html);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2200);
    } catch {
      setCopied(false);
    }
  }

  const whatsappUrl = whatsappNumber && description.trim()
    ? `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(`مرحبًا فريق TITAN Digital، أريد طلب موقع. هذا وصف الفكرة:\n\n${description.trim()}`)}`
    : '';

  return (
    <section className="section generator-section" id="generator">
      <div className="generator-glow" />
      <div className="container">
        <div className="section-heading reveal">
          <div className="section-kicker"><span>01</span><span className="kicker-line" /><span>مولد المواقع المجاني</span></div>
          <h2>اكتب فكرتك… وشاهد موقعك جاهزًا.</h2>
          <p>مولد قوالب فوري يعمل داخل المتصفح بدون API. اكتب وصفًا مختصرًا لتحصل على نموذج أولي يمكنك معاينته ونسخه أو تنزيله كملف HTML.</p>
        </div>

        <div className="generator-layout reveal">
          <form className="generator-form" onSubmit={handleGenerate}>
            <div className="generator-form-heading">
              <span><WandSparkles size={23} /></span>
              <div><h3>ما الموقع الذي تريده؟</h3><p>اذكر نوع النشاط والاسم والأقسام المهمة إن أمكن.</p></div>
            </div>
            <label className="generator-textarea">
              <span>وصف الموقع</span>
              <textarea
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                placeholder="مثال: أريد موقعًا باسم مطعم أمواج، يعرض المنيو والعروض وطرق الحجز والتواصل..."
                rows={6}
                minLength={10}
                maxLength={600}
                required
              />
              <small dir="ltr">{description.length} / 600</small>
            </label>
            <div className="generator-examples">
              <span>جرّب مثالًا:</span>
              <div>{examples.map((example) => <button key={example.label} type="button" onClick={() => setDescription(example.text)}>{example.label}</button>)}</div>
            </div>
            <button className="button button-primary generator-submit" type="submit" disabled={description.trim().length < 10}>
              <Sparkles size={19} /> إنشاء الموقع الآن
            </button>
            <div className="generator-local-note"><Globe2 size={16} /><span>مجاني • بدون تسجيل • بدون API • يعمل محليًا في متصفحك</span></div>
          </form>

          <div className="generator-benefits">
            <article><span>1</span><div><h3>اكتب الوصف</h3><p>وضّح نوع الموقع واسم النشاط وما تريد عرضه.</p></div></article>
            <article><span>2</span><div><h3>عاين النتيجة</h3><p>اختر قالبًا مناسبًا تلقائيًا وشاهد شكله على الكمبيوتر والموبايل.</p></div></article>
            <article><span>3</span><div><h3>حمّل أو اطلب التطوير</h3><p>نزّل ملف HTML، أو أرسل الوصف لفريق TITAN Digital لتنفيذه بشكل مخصص.</p></div></article>
          </div>
        </div>

        {result && (
          <div className="generator-result" id="generator-result">
            <div className="generator-result-header">
              <div className="generator-success"><span><Check size={20} /></span><div><h3>تم إنشاء: {result.title}</h3><p>{result.category} — نموذج أولي جاهز للمعاينة</p></div></div>
              <div className="generator-result-tools">
                <div className="preview-devices" aria-label="حجم المعاينة">
                  <button type="button" className={device === 'desktop' ? 'active' : ''} onClick={() => setDevice('desktop')} aria-label="معاينة كمبيوتر" aria-pressed={device === 'desktop'}><Monitor size={17} /></button>
                  <button type="button" className={device === 'mobile' ? 'active' : ''} onClick={() => setDevice('mobile')} aria-label="معاينة موبايل" aria-pressed={device === 'mobile'}><Smartphone size={17} /></button>
                </div>
                <button type="button" onClick={() => setResult(null)}><RefreshCw size={16} /> وصف جديد</button>
              </div>
            </div>

            <div className={`generated-preview ${device}`}>
              <div className="preview-browser-bar" dir="ltr"><span /><span /><span /><small>generated-site.html</small></div>
              <iframe title={`معاينة ${result.title}`} srcDoc={result.html} sandbox="" />
            </div>

            <div className="generator-downloads">
              <button className="button button-primary" type="button" onClick={downloadHtml}><Download size={18} /> تنزيل ملف HTML</button>
              <button className="button button-secondary" type="button" onClick={copyHtml}>{copied ? <Check size={18} /> : <Copy size={18} />}{copied ? 'تم نسخ الكود' : 'نسخ الكود'}</button>
              {whatsappUrl && <a className="button button-secondary" href={whatsappUrl} target="_blank" rel="noreferrer"><MessageCircle size={18} /> إرسال الوصف للفريق</a>}
            </div>
            <p className="generator-disclaimer">النتيجة نموذج أولي بقالب مناسب للوصف، وليست موقعًا نهائيًا منشورًا. يمكنك تعديل الملف أو إرسال الوصف لفريقنا للتخصيص والنشر.</p>
          </div>
        )}
      </div>
    </section>
  );
}
