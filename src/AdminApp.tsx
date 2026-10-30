import { ArrowRight, Check, ExternalLink, Github, ShieldCheck } from 'lucide-react';

const steps = [
  'سجّل الدخول بحساب GitHub نفسه.',
  'اختر مستودع abdullah-cv، ووافق على تثبيت Pages CMS في أول مرة.',
  'افتح «محتوى السيرة الذاتية»، عدّل الحقول ثم اضغط Save.',
];

export function AdminApp() {
  return (
    <main className="login-page">
      <a className="login-back" href="./index.html"><ArrowRight size={17} /> العودة إلى الموقع</a>
      <section className="login-card cms-card">
        <div className="login-logo"><Github size={29} /></div>
        <span className="mini-label">EASY GITHUB EDITOR</span>
        <h1>تعديل الموقع أصبح أبسط</h1>
        <p>لا تحتاج إلى Supabase أو كلمة سر جديدة. لوحة Pages CMS تحفظ التعديل في GitHub، والموقع يُنشر تلقائيًا.</p>

        <div className="setup-guide">
          {steps.map((step, index) => (
            <div key={step}><span>{index + 1}</span><p>{step}</p></div>
          ))}
        </div>

        <a className="button button-primary admin-login-button" href="https://app.pagescms.org/" target="_blank" rel="noreferrer">
          <Github size={19} /> فتح لوحة التحكم <ExternalLink size={17} />
        </a>

        <div className="cms-publish-note"><Check size={18} /><span>بعد الحفظ، انتظر عادةً من دقيقة إلى دقيقتين حتى يظهر التعديل على الموقع.</span></div>
        <div className="login-security"><ShieldCheck size={17} /><span>الزوار يمكنهم مشاهدة هذه الصفحة فقط؛ التعديل الفعلي يتطلب حساب GitHub يملك صلاحية الكتابة على المستودع.</span></div>
      </section>
    </main>
  );
}
