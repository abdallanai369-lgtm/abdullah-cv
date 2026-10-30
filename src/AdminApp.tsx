import { useEffect, useState } from 'react';
import type { FormEvent, ReactNode } from 'react';
import {
  ArrowRight,
  Check,
  Cloud,
  Code2,
  Download,
  Eye,
  FileJson,
  Layers3,
  LoaderCircle,
  LockKeyhole,
  LogOut,
  Plus,
  RotateCcw,
  Save,
  Settings2,
  ShieldCheck,
  Trash2,
  Upload,
  UserRound,
} from 'lucide-react';
import type { Session } from '@supabase/supabase-js';
import { freshDefaultCV } from './cv';
import type { CVData, Profile, Project, SkillCategory } from './cv';
import {
  cloudConfigured,
  loadCloudCV,
  loadLocalCV,
  normalizeCV,
  saveCloudCV,
  saveLocalCV,
  supabase,
} from './content';

type Tab = 'profile' | 'skills' | 'projects' | 'more' | 'backup';

const tabs: { id: Tab; label: string; icon: typeof UserRound }[] = [
  { id: 'profile', label: 'البيانات الأساسية', icon: UserRound },
  { id: 'skills', label: 'المهارات والتخصصات', icon: Layers3 },
  { id: 'projects', label: 'المشاريع', icon: Code2 },
  { id: 'more', label: 'التقنيات والهدف', icon: Settings2 },
  { id: 'backup', label: 'النسخ والإعداد', icon: ShieldCheck },
];

function linesToArray(value: string): string[] {
  return value.split('\n');
}

function commaToArray(value: string): string[] {
  return value.split(/[,،]/).map((item) => item.trim()).filter(Boolean);
}

function Field({ label, value, onChange, type = 'text', dir, placeholder, hint }: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  dir?: 'ltr' | 'rtl';
  placeholder?: string;
  hint?: string;
}) {
  return (
    <label className="admin-field">
      <span>{label}</span>
      <input type={type} value={value} onChange={(event) => onChange(event.target.value)} dir={dir} placeholder={placeholder} />
      {hint && <small>{hint}</small>}
    </label>
  );
}

function TextArea({ label, value, onChange, rows = 5, dir, hint }: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  rows?: number;
  dir?: 'ltr' | 'rtl';
  hint?: string;
}) {
  return (
    <label className="admin-field admin-field-full">
      <span>{label}</span>
      <textarea value={value} onChange={(event) => onChange(event.target.value)} rows={rows} dir={dir} />
      {hint && <small>{hint}</small>}
    </label>
  );
}

function EditorSection({ title, description, children }: {
  title: string;
  description: string;
  children: ReactNode;
}) {
  return (
    <section className="editor-section">
      <div className="editor-section-heading"><h2>{title}</h2><p>{description}</p></div>
      {children}
    </section>
  );
}

export function AdminApp() {
  const [content, setContent] = useState<CVData>(() => cloudConfigured ? freshDefaultCV() : loadLocalCV());
  const [session, setSession] = useState<Session | null>(null);
  const [authChecking, setAuthChecking] = useState(cloudConfigured);
  const [contentLoading, setContentLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<Tab>('profile');
  const [email, setEmail] = useState('abdallahai369@gmail.com');
  const [password, setPassword] = useState('');
  const [authBusy, setAuthBusy] = useState(false);
  const [saving, setSaving] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const localMode = !cloudConfigured;
  const canEdit = localMode || Boolean(session);

  useEffect(() => {
    if (!supabase) {
      setAuthChecking(false);
      return;
    }

    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setAuthChecking(false);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
      setAuthChecking(false);
    });
    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!session) return;
    setContentLoading(true);
    loadCloudCV()
      .then((cloudContent) => {
        setContent(cloudContent);
        setDirty(false);
      })
      .catch((error: Error) => setMessage({ type: 'error', text: `تعذر تحميل المحتوى: ${error.message}` }))
      .finally(() => setContentLoading(false));
  }, [session]);

  useEffect(() => {
    const warnBeforeLeave = (event: BeforeUnloadEvent) => {
      if (!dirty) return;
      event.preventDefault();
    };
    window.addEventListener('beforeunload', warnBeforeLeave);
    return () => window.removeEventListener('beforeunload', warnBeforeLeave);
  }, [dirty]);

  useEffect(() => {
    if (!message) return;
    const timer = window.setTimeout(() => setMessage(null), 5000);
    return () => window.clearTimeout(timer);
  }, [message]);

  function changeContent(next: CVData) {
    setContent(next);
    setDirty(true);
  }

  function updateProfile<K extends keyof Profile>(key: K, value: Profile[K]) {
    changeContent({ ...content, profile: { ...content.profile, [key]: value } });
  }

  function updateSkill(index: number, patch: Partial<SkillCategory>) {
    const skills = content.skills.map((skill, skillIndex) => skillIndex === index ? { ...skill, ...patch } : skill);
    changeContent({ ...content, skills });
  }

  function updateProject(index: number, patch: Partial<Project>) {
    const projects = content.projects.map((project, projectIndex) => projectIndex === index ? { ...project, ...patch } : project);
    changeContent({ ...content, projects });
  }

  function addSkill() {
    changeContent({
      ...content,
      skills: [...content.skills, { id: `skill-${Date.now()}`, title: 'تخصص جديد', icon: 'web', items: ['المهارة الأولى'] }],
    });
  }

  function removeSkill(index: number) {
    if (!window.confirm('هل تريد حذف هذا التخصص؟')) return;
    changeContent({ ...content, skills: content.skills.filter((_, skillIndex) => skillIndex !== index) });
  }

  function addProject() {
    changeContent({
      ...content,
      projects: [...content.projects, {
        id: `project-${Date.now()}`,
        title: 'مشروع جديد',
        description: 'اكتب وصفًا مختصرًا للمشروع.',
        status: 'قيد التطوير',
        technologies: [],
        features: [],
        link: '',
        github: '',
      }],
    });
  }

  function removeProject(index: number) {
    if (!window.confirm('هل تريد حذف هذا المشروع نهائيًا من المحتوى؟')) return;
    changeContent({ ...content, projects: content.projects.filter((_, projectIndex) => projectIndex !== index) });
  }

  async function handleLogin(event: FormEvent) {
    event.preventDefault();
    if (!supabase) return;
    setAuthBusy(true);
    setMessage(null);
    const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
    if (error) setMessage({ type: 'error', text: `لم نتمكن من تسجيل الدخول: ${error.message}` });
    setPassword('');
    setAuthBusy(false);
  }

  async function handleSave() {
    setSaving(true);
    setMessage(null);
    try {
      if (localMode) {
        saveLocalCV(content);
        setMessage({ type: 'success', text: 'تم الحفظ في هذا المتصفح. افتح الموقع هنا لمعاينة التعديلات.' });
      } else {
        await saveCloudCV(content);
        setMessage({ type: 'success', text: 'تم حفظ التعديلات ونشرها لكل زوار الموقع.' });
      }
      setDirty(false);
    } catch (error) {
      setMessage({ type: 'error', text: `تعذر الحفظ: ${error instanceof Error ? error.message : 'خطأ غير معروف'}` });
    } finally {
      setSaving(false);
    }
  }

  function resetContent() {
    if (!window.confirm('سيتم استبدال كل المحتوى الموجود في المحرر بالنسخة الأصلية. هل تريد المتابعة؟')) return;
    changeContent(freshDefaultCV());
    setMessage({ type: 'success', text: 'تمت استعادة النسخة الأصلية داخل المحرر. اضغط حفظ لتأكيد التغيير.' });
  }

  function exportContent() {
    const blob = new Blob([JSON.stringify(content, null, 2)], { type: 'application/json;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = `abdullah-cv-backup-${new Date().toISOString().slice(0, 10)}.json`;
    anchor.click();
    URL.revokeObjectURL(url);
  }

  async function importContent(file: File | undefined) {
    if (!file) return;
    try {
      const parsed = JSON.parse(await file.text()) as CVData;
      if (!parsed.profile || !Array.isArray(parsed.projects) || !Array.isArray(parsed.skills)) {
        throw new Error('الملف لا يحتوي على بنية محتوى صالحة.');
      }
      changeContent(normalizeCV(parsed));
      setMessage({ type: 'success', text: 'تم استيراد النسخة. راجع المحتوى ثم اضغط حفظ.' });
    } catch (error) {
      setMessage({ type: 'error', text: `تعذر الاستيراد: ${error instanceof Error ? error.message : 'ملف غير صالح'}` });
    }
  }

  if (authChecking) {
    return <div className="admin-loading"><LoaderCircle className="spin" size={32} /><p>جارٍ فحص تسجيل الدخول...</p></div>;
  }

  if (!canEdit) {
    return (
      <main className="login-page">
        <a className="login-back" href="./index.html"><ArrowRight size={17} /> العودة إلى الموقع</a>
        <section className="login-card">
          <div className="login-logo"><LockKeyhole size={28} /></div>
          <span className="mini-label">ADMIN DASHBOARD</span>
          <h1>لوحة تحكم الموقع</h1>
          <p>سجّل الدخول بحساب المدير لتعديل المحتوى ونشره.</p>
          <form onSubmit={handleLogin}>
            <Field label="البريد الإلكتروني" type="email" value={email} onChange={setEmail} dir="ltr" />
            <Field label="كلمة السر" type="password" value={password} onChange={setPassword} dir="ltr" />
            <button className="button button-primary admin-login-button" type="submit" disabled={authBusy || !email || !password}>
              {authBusy ? <LoaderCircle className="spin" size={19} /> : <LockKeyhole size={19} />}
              {authBusy ? 'جارٍ الدخول...' : 'تسجيل الدخول'}
            </button>
          </form>
          <div className="login-security"><ShieldCheck size={17} /><span>كلمة السر محمية بواسطة Supabase Auth ولا تُحفظ داخل كود الموقع.</span></div>
        </section>
        {message && <div className={`admin-toast ${message.type}`}>{message.text}</div>}
      </main>
    );
  }

  return (
    <div className="admin-shell">
      <header className="admin-header">
        <a className="brand" href="./index.html">
          <span className="brand-mark"><Code2 size={22} /></span>
          <span className="brand-copy"><strong>لوحة التحكم</strong><small>موقع {content.profile.name}</small></span>
        </a>
        <div className="admin-header-actions">
          <span className={`save-state ${dirty ? 'has-changes' : ''}`}><span />{dirty ? 'تغييرات غير محفوظة' : 'كل التغييرات محفوظة'}</span>
          <a className="button button-secondary admin-preview" href="./index.html" target="_blank" rel="noreferrer"><Eye size={18} /> معاينة الموقع</a>
          <button className="button button-primary" type="button" onClick={handleSave} disabled={saving || !dirty || contentLoading}>
            {saving ? <LoaderCircle className="spin" size={18} /> : <Save size={18} />}
            {saving ? 'جارٍ الحفظ...' : 'حفظ ونشر'}
          </button>
        </div>
      </header>

      {localMode && (
        <div className="local-mode-banner">
          <Cloud size={19} />
          <div><strong>أنت في وضع التجربة المحلية.</strong><span>الحفظ يعمل في هذا المتصفح فقط. اربط Supabase كما هو موضح في تبويب «النسخ والإعداد» لتعديل الموقع المنشور لكل الزوار.</span></div>
        </div>
      )}

      <div className="admin-layout">
        <aside className="admin-sidebar">
          <div className="admin-user">
            <span><UserRound size={20} /></span>
            <div><strong>{content.profile.name}</strong><small dir="ltr">{localMode ? 'Local editor' : session?.user.email}</small></div>
          </div>
          <nav aria-label="أقسام المحرر">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return <button key={tab.id} type="button" className={activeTab === tab.id ? 'active' : ''} onClick={() => setActiveTab(tab.id)}><Icon size={18} />{tab.label}</button>;
            })}
          </nav>
          {!localMode && (
            <button className="admin-logout" type="button" onClick={() => supabase?.auth.signOut()}><LogOut size={17} /> تسجيل الخروج</button>
          )}
        </aside>

        <main className="admin-main">
          {contentLoading ? (
            <div className="admin-loading"><LoaderCircle className="spin" size={30} /><p>جارٍ تحميل المحتوى...</p></div>
          ) : (
            <>
              {activeTab === 'profile' && (
                <EditorSection title="البيانات الأساسية" description="هذه المعلومات تظهر في الواجهة وبيانات التواصل وأسفل الموقع.">
                  <div className="admin-form-grid">
                    <Field label="الاسم" value={content.profile.name} onChange={(value) => updateProfile('name', value)} />
                    <Field label="الموقع" value={content.profile.location} onChange={(value) => updateProfile('location', value)} />
                    <Field label="العنوان الرئيسي" value={content.profile.headline} onChange={(value) => updateProfile('headline', value)} />
                    <Field label="التخصص المختصر" value={content.profile.specialty} onChange={(value) => updateProfile('specialty', value)} />
                    <TextArea label="المسميات الوظيفية" value={content.profile.roles.join('\n')} onChange={(value) => updateProfile('roles', linesToArray(value))} rows={4} hint="اكتب كل مسمى في سطر مستقل." />
                    <TextArea label="النبذة الشخصية" value={content.profile.summary.join('\n')} onChange={(value) => updateProfile('summary', linesToArray(value))} rows={8} hint="كل سطر سيظهر كفقرة مستقلة في قسم النبذة." />
                    <Field label="البريد الإلكتروني" type="email" value={content.profile.email} onChange={(value) => updateProfile('email', value)} dir="ltr" />
                    <Field label="رقم الهاتف" value={content.profile.phone} onChange={(value) => updateProfile('phone', value)} dir="ltr" />
                    <Field label="رقم واتساب بالكود الدولي" value={content.profile.whatsapp} onChange={(value) => updateProfile('whatsapp', value)} dir="ltr" hint="أرقام فقط، مثال: 201055365106" />
                    <Field label="رابط GitHub" value={content.profile.github} onChange={(value) => updateProfile('github', value)} dir="ltr" />
                    <Field label="رابط الصورة الشخصية (اختياري)" value={content.profile.photoUrl} onChange={(value) => updateProfile('photoUrl', value)} dir="ltr" hint="اتركه فارغًا لإظهار التصميم البرمجي بدل الصورة." />
                  </div>
                </EditorSection>
              )}

              {activeTab === 'skills' && (
                <EditorSection title="المهارات والتخصصات" description="عدّل بطاقات التخصص والعناصر التي تظهر داخل كل بطاقة.">
                  <div className="editor-list">
                    {content.skills.map((skill, index) => (
                      <article className="editor-item" key={skill.id}>
                        <div className="editor-item-header"><span>التخصص {index + 1}</span><button type="button" onClick={() => removeSkill(index)} aria-label="حذف التخصص"><Trash2 size={17} /></button></div>
                        <div className="admin-form-grid">
                          <Field label="اسم التخصص" value={skill.title} onChange={(value) => updateSkill(index, { title: value })} />
                          <label className="admin-field"><span>الأيقونة</span><select value={skill.icon} onChange={(event) => updateSkill(index, { icon: event.target.value as SkillCategory['icon'] })}><option value="web">مواقع إلكترونية</option><option value="apps">تطبيقات وأنظمة</option><option value="ai">ذكاء اصطناعي</option><option value="automation">أتمتة</option></select></label>
                          <TextArea label="عناصر التخصص" value={skill.items.join('\n')} onChange={(value) => updateSkill(index, { items: linesToArray(value) })} rows={7} hint="كل سطر يظهر كنقطة مستقلة." />
                        </div>
                      </article>
                    ))}
                  </div>
                  <button className="add-item-button" type="button" onClick={addSkill}><Plus size={18} /> إضافة تخصص جديد</button>
                </EditorSection>
              )}

              {activeTab === 'projects' && (
                <EditorSection title="المشاريع والأعمال" description="أضف مشاريعك أو عدّل الوصف والتقنيات والوظائف والروابط.">
                  <div className="editor-list">
                    {content.projects.map((project, index) => (
                      <article className="editor-item" key={project.id}>
                        <div className="editor-item-header"><span dir="auto">{index + 1}. {project.title}</span><button type="button" onClick={() => removeProject(index)} aria-label={`حذف ${project.title}`}><Trash2 size={17} /></button></div>
                        <div className="admin-form-grid">
                          <Field label="اسم المشروع" value={project.title} onChange={(value) => updateProject(index, { title: value })} dir="ltr" />
                          <Field label="حالة المشروع" value={project.status} onChange={(value) => updateProject(index, { status: value })} />
                          <TextArea label="وصف المشروع" value={project.description} onChange={(value) => updateProject(index, { description: value })} rows={3} />
                          <Field label="التقنيات" value={project.technologies.join(', ')} onChange={(value) => updateProject(index, { technologies: commaToArray(value) })} dir="ltr" hint="افصل بين التقنيات بعلامة , أو ،" />
                          <Field label="رابط المشروع" value={project.link} onChange={(value) => updateProject(index, { link: value })} dir="ltr" placeholder="https://..." />
                          <Field label="رابط GitHub" value={project.github} onChange={(value) => updateProject(index, { github: value })} dir="ltr" placeholder="https://github.com/..." />
                          <TextArea label="وظائف وتفاصيل المشروع" value={project.features.join('\n')} onChange={(value) => updateProject(index, { features: linesToArray(value) })} rows={7} hint="كل سطر يظهر كنقطة مستقلة." />
                        </div>
                      </article>
                    ))}
                  </div>
                  <button className="add-item-button" type="button" onClick={addProject}><Plus size={18} /> إضافة مشروع جديد</button>
                </EditorSection>
              )}

              {activeTab === 'more' && (
                <>
                  <EditorSection title="التقنيات والأدوات" description="القائمة التي تظهر في الشريط المتحرك وقسم التقنيات.">
                    <TextArea label="التقنيات" value={content.technologies.join(', ')} onChange={(value) => changeContent({ ...content, technologies: commaToArray(value) })} rows={5} dir="ltr" hint="افصل بين كل تقنية وأخرى بعلامة , أو ،" />
                  </EditorSection>
                  <EditorSection title="بيئة العمل" description="النقاط التي تظهر داخل بطاقة بيئة العمل في قسم النبذة.">
                    <TextArea label="عناصر بيئة العمل" value={content.workEnvironment.join('\n')} onChange={(value) => changeContent({ ...content, workEnvironment: linesToArray(value) })} rows={6} />
                  </EditorSection>
                  <EditorSection title="الهدف المهني" description="رسالتك المهنية ومجالات العمل التي تستهدفها.">
                    <TextArea label="الهدف المهني" value={content.goal} onChange={(value) => changeContent({ ...content, goal: value })} rows={6} />
                    <TextArea label="مجالات العمل المستهدفة" value={content.targetFields.join(', ')} onChange={(value) => changeContent({ ...content, targetFields: commaToArray(value) })} rows={4} dir="ltr" hint="افصل بين المجالات بعلامة , أو ،" />
                  </EditorSection>
                </>
              )}

              {activeTab === 'backup' && (
                <>
                  <EditorSection title="النسخ الاحتياطي والاستيراد" description="احتفظ بنسخة JSON من كل المحتوى، أو استعد نسخة سابقة.">
                    <div className="backup-actions">
                      <button type="button" onClick={exportContent}><Download size={22} /><strong>تصدير نسخة احتياطية</strong><span>تنزيل كل بيانات الموقع في ملف JSON.</span></button>
                      <label><Upload size={22} /><strong>استيراد نسخة</strong><span>اختر ملف JSON تم تصديره سابقًا.</span><input type="file" accept="application/json,.json" onChange={(event) => { importContent(event.target.files?.[0]); event.target.value = ''; }} /></label>
                    </div>
                  </EditorSection>
                  <EditorSection title="إعداد الحفظ الدائم" description="مطلوب مرة واحدة فقط لتعمل لوحة التحكم على الموقع المنشور.">
                    <div className="setup-guide">
                      <div><span>1</span><p>أنشئ مشروعًا مجانيًا في <a href="https://supabase.com" target="_blank" rel="noreferrer">Supabase</a>.</p></div>
                      <div><span>2</span><p>افتح SQL Editor وشغّل الأوامر الموجودة في ملف <code dir="ltr">supabase/setup.sql</code>.</p></div>
                      <div><span>3</span><p>أنشئ مستخدم مدير من Authentication ← Users، واختر كلمة سر قوية.</p></div>
                      <div><span>4</span><p>أضف <code dir="ltr">VITE_SUPABASE_URL</code> و<code dir="ltr">VITE_SUPABASE_ANON_KEY</code> إلى متغيرات البيئة وأسرار GitHub.</p></div>
                      <p className="setup-note"><FileJson size={18} /> التفاصيل الكاملة وخطوات النشر موجودة في ملف README.md داخل المشروع.</p>
                    </div>
                  </EditorSection>
                  <EditorSection title="استعادة المحتوى الأصلي" description="ترجع بيانات عبدالله الأصلية إلى المحرر، ولا تتغير للزوار حتى تضغط حفظ.">
                    <button className="danger-button" type="button" onClick={resetContent}><RotateCcw size={18} /> استعادة النسخة الأصلية</button>
                  </EditorSection>
                </>
              )}
            </>
          )}
        </main>
      </div>

      <div className="admin-mobile-save">
        <button className="button button-primary" type="button" onClick={handleSave} disabled={saving || !dirty}><Save size={18} />{saving ? 'جارٍ الحفظ...' : 'حفظ ونشر'}</button>
      </div>

      {message && <div className={`admin-toast ${message.type}`}>{message.type === 'success' && <Check size={18} />}{message.text}</div>}
    </div>
  );
}
