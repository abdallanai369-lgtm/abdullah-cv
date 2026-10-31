import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import {
  Bot,
  Camera,
  CameraOff,
  Cloud,
  Download,
  ExternalLink,
  FileArchive,
  LoaderCircle,
  LockKeyhole,
  LogOut,
  MessageCircle,
  Mic,
  Monitor,
  Send,
  Settings,
  ShieldCheck,
  Smartphone,
  Sparkles,
  UserRound,
  WandSparkles,
} from 'lucide-react';
import { androidBridge, isAndroidApp, saveBlob, speak } from './androidBridge';
import { generateSite } from './WebsiteGenerator';
import { StarkCommandCenter } from './StarkCommandCenter';

type Role = 'client' | 'owner';
type BusyAction = 'generate' | 'edit' | 'chat' | 'publish' | null;

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

interface GeneratedWebsite {
  title: string;
  summary: string;
  html: string;
  source: 'gemini' | 'local';
}

interface SmartStudioProps {
  whatsappNumber: string;
}

function isSystemCommand(value: string): boolean {
  return /(?:ابحث|https?:\/\/|اقرأ(?: لي)? الشاشة|مرر|انزل|اطلع|اضغط على|انقر على|دوس على|اكتب |التطبيقات الأخيرة|مركز الإشعارات|افتح الإشعارات|ارجع|رجوع|الشاشة الرئيسية|ذكرني|فكرني|لما أقول|عندما أقول|تعلم|علمك)/i.test(value)
    || /^(?:افتح|شغل)\s+(?:كروم|المتصفح|يوتيوب|واتساب|جيميل|الخرائط|فيسبوك|انستجرام)/i.test(value);
}

function cleanEndpoint(value: string): string {
  return value.trim().replace(/\/+$/, '');
}

function readableError(error: unknown): string {
  const code = error instanceof Error ? error.message : '';
  const messages: Record<string, string> = {
    NO_ENDPOINT: 'لم يتم ضبط خادم Gemini بعد. يمكنك استخدام المولد المحلي الآن.',
    GEMINI_NOT_CONFIGURED: 'الخادم يعمل، لكن مفتاح Gemini الجديد لم يُضبط بعد.',
    RATE_LIMITED: 'وصلت إلى حد الاستخدام المؤقت. انتظر دقيقة ثم حاول مرة أخرى.',
    GEMINI_RATE_LIMIT: 'خدمة Gemini مشغولة حاليًا. حاول بعد قليل.',
    OWNER_AUTHORIZATION_REQUIRED: 'رمز النشر غير صحيح أو غير مضبوط في إعدادات المالك.',
    PUBLISH_NOT_CONFIGURED: 'النشر غير مفعل على الخادم بعد.',
    DESCRIPTION_REQUIRED: 'اكتب وصفًا أوضح للموقع أولًا.',
  };
  return messages[code] || 'تعذر تنفيذ الطلب. تحقق من الاتصال وإعدادات الخادم ثم حاول مرة أخرى.';
}

export function SmartStudio({ whatsappNumber }: SmartStudioProps) {
  const android = androidBridge();
  const [role, setRole] = useState<Role>(() => android?.isOwnerAuthenticated?.() ? 'owner' : 'client');
  const [description, setDescription] = useState('');
  const [messageInput, setMessageInput] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: 'assistant', content: 'أهلًا بك في TITAN Studio. صف نشاطك أو اطلب إنشاء موقع، وسأحوّله إلى معاينة فعلية قابلة للتنزيل.' },
  ]);
  const [site, setSite] = useState<GeneratedWebsite | null>(null);
  const [editInstruction, setEditInstruction] = useState('');
  const [previewMode, setPreviewMode] = useState<'desktop' | 'mobile'>('desktop');
  const [busy, setBusy] = useState<BusyAction>(null);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [publishedUrl, setPublishedUrl] = useState('');
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [endpoint, setEndpoint] = useState(() => cleanEndpoint(
    localStorage.getItem('titan-ai-endpoint') || import.meta.env.VITE_TITAN_AI_ENDPOINT || '',
  ));
  const [publishToken, setPublishToken] = useState(() => android?.isOwnerAuthenticated?.() ? android.getSecret?.('publish_token') || '' : '');
  const [listening, setListening] = useState(false);
  const [cameraEnabled, setCameraEnabled] = useState(false);
  const [accessibilityEnabled, setAccessibilityEnabled] = useState(() => android?.isAccessibilityEnabled?.() || false);
  const [deleteArmed, setDeleteArmed] = useState(false);

  async function request<T>(path: string, body: object, token = ''): Promise<T> {
    const base = cleanEndpoint(endpoint);
    if (!base) throw new Error('NO_ENDPOINT');
    const response = await fetch(`${base}${path}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify(body),
    });
    const data = await response.json().catch(() => ({})) as { error?: string };
    if (!response.ok) throw new Error(data.error || `HTTP_${response.status}`);
    return data as T;
  }

  function scrollToStudio() {
    document.getElementById('smart-studio')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  function useLocalGenerator(text: string) {
    const generated = generateSite(text);
    setSite({
      title: generated.title,
      summary: `${generated.category} — ناتج بالقالب المحلي، وليس بواسطة Gemini.`,
      html: generated.html,
      source: 'local',
    });
    setPublishedUrl('');
    setNotice('تم إنشاء موقع محلي كامل. يمكنك معاينته وتنزيله دون إنترنت.');
    setError('');
    window.setTimeout(scrollToStudio, 80);
  }

  async function generateWebsite(text = description) {
    const value = text.trim();
    if (!value || busy) return;
    setDescription(value);
    setDeleteArmed(false);
    if (!cleanEndpoint(endpoint)) {
      useLocalGenerator(value);
      return;
    }

    setBusy('generate');
    setError('');
    setNotice('');
    try {
      const generated = await request<Omit<GeneratedWebsite, 'source'>>('/api/generate', { description: value, role });
      setSite({ ...generated, source: 'gemini' });
      setPublishedUrl('');
      setNotice('أنشأ Gemini موقعًا كاملًا. راجع المعاينة واطلب أي تعديل قبل التنزيل أو النشر.');
      speak(role === 'owner' ? `تم إنشاء موقع ${generated.title}. المعاينة جاهزة يا باشمهندس.` : `تم إنشاء موقع ${generated.title}. المعاينة جاهزة.`);
    } catch (requestError) {
      setError(readableError(requestError));
    } finally {
      setBusy(null);
    }
  }

  async function editWebsite() {
    if (!site || !editInstruction.trim() || busy) return;
    setBusy('edit');
    setError('');
    try {
      const generated = await request<Omit<GeneratedWebsite, 'source'>>('/api/edit', {
        currentHtml: site.html,
        instruction: editInstruction,
        role,
      });
      setSite({ ...generated, source: 'gemini' });
      setEditInstruction('');
      setPublishedUrl('');
      setNotice('تم تطبيق التعديل على الموقع بالكامل.');
      speak('تم تعديل الموقع. راجع المعاينة الجديدة.');
    } catch (requestError) {
      setError(readableError(requestError));
    } finally {
      setBusy(null);
    }
  }

  async function sendMessage(text = messageInput) {
    const value = text.trim();
    if (!value || busy) return;
    setMessageInput('');
    const nextMessages: ChatMessage[] = [...messages, { role: 'user', content: value }];
    setMessages(nextMessages);

    if (role === 'owner' && android?.executeCommand && isSystemCommand(value)) {
      android.executeCommand(value);
      return;
    }

    if (/أنشئ|انشئ|اعمل|صمم|أنشيء/.test(value) && /موقع|متجر|صفحة|منصة/.test(value)) {
      await generateWebsite(value);
      return;
    }

    if (!cleanEndpoint(endpoint)) {
      setMessages([...nextMessages, {
        role: 'assistant',
        content: 'اكتب وصف النشاط في خانة إنشاء الموقع، مثل: مطعم في القاهرة يعرض المنيو والحجز. سأستخدم القالب المحلي إلى أن يتم ضبط اتصال Gemini.',
      }]);
      return;
    }

    setBusy('chat');
    setError('');
    try {
      const result = await request<{ reply: string }>('/api/chat', { messages: nextMessages, role });
      setMessages([...nextMessages, { role: 'assistant', content: result.reply }]);
    } catch (requestError) {
      setError(readableError(requestError));
    } finally {
      setBusy(null);
    }
  }

  function processVoiceCommand(text: string) {
    setMessageInput(text);
    if (/شغل الكاميرا|افتح الكاميرا/.test(text)) {
      android?.startCamera?.();
      return;
    }
    if (/اقفل الكاميرا|أوقف الكاميرا|ايقف الكاميرا/.test(text)) {
      android?.stopCamera?.();
      return;
    }
    if (deleteArmed && /تأكيد|أكد|اكد/.test(text) && /حذف|مسح/.test(text)) {
      setSite(null);
      setPublishedUrl('');
      setDeleteArmed(false);
      setNotice('تم حذف المسودة من هذه الجلسة فقط.');
      return;
    }
    if (/احذف|امسح/.test(text) && site) {
      setDeleteArmed(true);
      setMessages((current) => [...current, { role: 'assistant', content: 'لحماية عملك، قل: تأكيد حذف المسودة.' }]);
      speak('لحماية عملك، قل تأكيد حذف المسودة.');
      return;
    }
    void sendMessage(text);
  }

  function startListening() {
    if (!android?.startListening) {
      setError('الإدخال الصوتي متاح داخل تطبيق TITAN على أندرويد.');
      return;
    }
    scrollToStudio();
    android.startListening();
  }

  function toggleCamera() {
    if (cameraEnabled) android?.stopCamera?.();
    else android?.startCamera?.();
  }

  async function publishWebsite() {
    if (!site || role !== 'owner' || busy) return;
    setBusy('publish');
    setError('');
    try {
      const result = await request<{ url: string }>('/api/publish', { title: site.title, html: site.html }, publishToken);
      setPublishedUrl(result.url);
      setNotice('بدأ النشر على GitHub Pages. قد يستغرق ظهور الرابط حوالي دقيقة.');
      speak('بدأ نشر الموقع. الرابط جاهز وستظهر الصفحة خلال دقيقة تقريبًا.');
    } catch (requestError) {
      setError(readableError(requestError));
    } finally {
      setBusy(null);
    }
  }

  async function downloadHtml() {
    if (!site) return;
    await saveBlob('titan-website.html', new Blob([site.html], { type: 'text/html;charset=utf-8' }));
  }

  async function downloadZip() {
    if (!site) return;
    const { default: JSZip } = await import('jszip');
    const zip = new JSZip();
    zip.file('index.html', site.html);
    zip.file('README.txt', `${site.title}\n\nافتح index.html في المتصفح، أو ارفع الملف إلى أي استضافة ثابتة.\nتم الإنشاء داخل TITAN Digital.`);
    const blob = await zip.generateAsync({ type: 'blob' });
    await saveBlob('titan-website.zip', blob);
  }

  function saveSettings(event: FormEvent) {
    event.preventDefault();
    const value = cleanEndpoint(endpoint);
    if (value && !/^https:\/\//i.test(value) && !/^http:\/\/(?:localhost|127\.0\.0\.1)/i.test(value)) {
      setError('عنوان الخادم يجب أن يبدأ بـ https://');
      return;
    }
    setEndpoint(value);
    localStorage.setItem('titan-ai-endpoint', value);
    if (publishToken) android?.setSecret?.('publish_token', publishToken);
    setSettingsOpen(false);
    setError('');
    setNotice('تم حفظ إعدادات الاتصال. لم يتم حفظ رمز النشر في التخزين العادي للمتصفح.');
  }

  function logoutOwner() {
    android?.logoutOwner?.();
    android?.stopCamera?.();
    setRole('client');
    setPublishToken('');
    setSettingsOpen(false);
    setNotice('تم الخروج من وضع المالك.');
  }

  // Re-bind with the latest draft and command state after each render.
  useEffect(() => {
      const ownerHandler = (event: Event) => {
        const authenticated = (event as CustomEvent<{ authenticated: boolean }>).detail?.authenticated;
        if (!authenticated) return;
        setRole('owner');
        setPublishToken(android?.getSecret?.('publish_token') || '');
        setNotice('تم فتح وضع المالك. الكاميرا والإيماءات اختيارية ولا ترسل صورًا إلى الخادم.');
        window.setTimeout(scrollToStudio, 250);
      };
      const voiceHandler = (event: Event) => {
        const detail = (event as CustomEvent<{ text: string; final: boolean }>).detail;
        if (!detail?.text) return;
        setMessageInput(detail.text);
        if (detail.final) processVoiceCommand(detail.text);
      };
      const voiceStateHandler = (event: Event) => {
        const detail = (event as CustomEvent<{ listening: boolean; error?: string }>).detail;
        setListening(Boolean(detail?.listening));
        if (detail?.error) setError(detail.error);
      };
      const cameraHandler = (event: Event) => {
        const detail = (event as CustomEvent<{ enabled: boolean; error?: string }>).detail;
        setCameraEnabled(Boolean(detail?.enabled));
        if (detail?.error) setError(detail.error);
      };
      const commandHandler = (event: Event) => {
        const detail = (event as CustomEvent<{ ok: boolean; message: string }>).detail;
        if (!detail?.message) return;
        setMessages((current) => [...current, { role: 'assistant', content: detail.message }]);
      };
      const accessibilityHandler = (event: Event) => {
        const detail = (event as CustomEvent<{ enabled: boolean }>).detail;
        setAccessibilityEnabled(Boolean(detail?.enabled));
      };
      const gestureHandler = (event: Event) => {
        const gesture = (event as CustomEvent<{ gesture: string }>).detail?.gesture;
        if (gesture === 'open_palm') scrollToStudio();
        if (gesture === 'thumbs_up') startListening();
        if (gesture === 'fist') {
          android?.stopListening?.();
          android?.stopSpeaking?.();
        }
        if (gesture === 'swipe_left' || gesture === 'swipe_right') {
          setPreviewMode((current) => current === 'desktop' ? 'mobile' : 'desktop');
        }
      };
      window.addEventListener('titan-owner-auth', ownerHandler);
      window.addEventListener('titan-voice-result', voiceHandler);
      window.addEventListener('titan-voice-state', voiceStateHandler);
      window.addEventListener('titan-camera-state', cameraHandler);
      window.addEventListener('titan-command-result', commandHandler);
      window.addEventListener('titan-accessibility-state', accessibilityHandler);
      window.addEventListener('titan-gesture', gestureHandler);
      return () => {
        window.removeEventListener('titan-owner-auth', ownerHandler);
        window.removeEventListener('titan-voice-result', voiceHandler);
        window.removeEventListener('titan-voice-state', voiceStateHandler);
        window.removeEventListener('titan-camera-state', cameraHandler);
        window.removeEventListener('titan-command-result', commandHandler);
        window.removeEventListener('titan-accessibility-state', accessibilityHandler);
        window.removeEventListener('titan-gesture', gestureHandler);
      };
  });

  const whatsappRequest = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(
    `أريد مراجعة ونشر موقعي من TITAN Studio. الوصف: ${description || 'موقع أعمال جديد'}`,
  )}`;

  return (
    <section className="smart-studio section-shell" id="smart-studio" aria-labelledby="smart-studio-title">
      <div className="smart-studio-glow" aria-hidden="true" />
      <div className="smart-studio-heading">
        <div className="ai-orb" aria-hidden="true"><Bot size={30} /></div>
        <div>
          <span className="eyebrow"><Sparkles size={15} /> TITAN STARK AI · COMMAND CENTER</span>
          <h2 id="smart-studio-title">مساعدك الذي يبني الموقع، لا يكتفي بوصفه.</h2>
          <p>أدوات محلية تعمل الآن، واتصالات خارجية اختيارية بحالتها الحقيقية، مع وضع مالك محمي ووضع عميل محدود.</p>
        </div>
        <div className="smart-mode-actions">
          {role === 'owner' ? (
            <>
              <span className="owner-badge"><ShieldCheck size={16} /> وضع المالك</span>
              <button className="icon-button" type="button" onClick={() => setSettingsOpen((value) => !value)} aria-label="إعدادات الاتصال"><Settings size={19} /></button>
              {isAndroidApp() && <button className="icon-button" type="button" onClick={toggleCamera} aria-label={cameraEnabled ? 'إيقاف الكاميرا' : 'تشغيل الكاميرا'}>{cameraEnabled ? <CameraOff size={19} /> : <Camera size={19} />}</button>}
              <button className="icon-button" type="button" onClick={logoutOwner} aria-label="الخروج من وضع المالك"><LogOut size={19} /></button>
            </>
          ) : (
            <>
              <span className="client-badge"><UserRound size={16} /> وضع العميل</span>
              {isAndroidApp() && <button className="button button-secondary button-small" type="button" onClick={() => android?.authenticateOwner?.()}><LockKeyhole size={16} /> دخول المالك</button>}
            </>
          )}
        </div>
      </div>

      {settingsOpen && role === 'owner' && (
        <form className="smart-settings" onSubmit={saveSettings}>
          <label>عنوان الخادم الوسيط للنماذج<input dir="ltr" type="url" value={endpoint} onChange={(event) => setEndpoint(event.target.value)} placeholder="https://titan-digital-ai....workers.dev" /></label>
          <label>رمز النشر الخاص بالمالك<input dir="ltr" type="password" autoComplete="off" value={publishToken} onChange={(event) => setPublishToken(event.target.value)} placeholder="يُحفظ مشفرًا على الجهاز" /></label>
          <button className="button button-primary" type="submit">حفظ الاتصال</button>
          <p>لا تضع مفتاح Gemini هنا. المفتاح يبقى في الخادم فقط؛ هذا الحقل مخصص لرمز النشر المستقل.</p>
        </form>
      )}

      {role === 'owner' && <StarkCommandCenter endpoint={endpoint} />}

      {role === 'owner' && isAndroidApp() && (
        <div className="system-control-panel">
          <div><ShieldCheck size={20} /><span><strong>TITAN Commander</strong><small>{accessibilityEnabled ? 'التحكم في التطبيقات متصل' : 'التحكم في التطبيقات يحتاج تفعيلًا يدويًا'}</small></span></div>
          <button className="button button-secondary button-small" type="button" onClick={() => android?.openAccessibilitySettings?.()}>{accessibilityEnabled ? 'إدارة إمكانية الوصول' : 'تفعيل التحكم'}</button>
          <p>يمكنك أيضًا إضافة زر TITAN إلى مركز الإشعارات. أوامر كلمات المرور ورموز التحقق محظورة، والكاميرا والنصوص الحساسة لا تُرسل إلى Gemini.</p>
        </div>
      )}

      {(error || notice) && <div className={`smart-notice ${error ? 'is-error' : ''}`} role="status">{error || notice}</div>}

      <div className="smart-workspace">
        <div className="assistant-panel">
          <div className="panel-title"><MessageCircle size={19} /><h3>المساعد</h3><span>{role === 'owner' ? 'أوامر المالك المصرح بها' : 'مساعدة وإنشاء أولي'}</span></div>
          <div className="assistant-messages" aria-live="polite">
            {messages.map((message, index) => <div className={`assistant-message ${message.role}`} key={`${message.role}-${index}`}>{message.content}</div>)}
            {busy === 'chat' && <div className="assistant-message assistant"><LoaderCircle className="spin" size={18} /> جاري التفكير…</div>}
          </div>
          <form className="assistant-input" onSubmit={(event) => { event.preventDefault(); void sendMessage(); }}>
            <input id="titan-command-input" value={messageInput} onChange={(event) => setMessageInput(event.target.value)} placeholder="اكتب أمرك أو سؤالك…" aria-label="رسالة المساعد" />
            {isAndroidApp() && <button className={`icon-button ${listening ? 'is-listening' : ''}`} type="button" onClick={startListening} aria-label="إدخال صوتي"><Mic size={19} /></button>}
            <button className="icon-button send-button" type="submit" aria-label="إرسال" disabled={Boolean(busy)}><Send size={18} /></button>
          </form>
          <p className="privacy-note">لا تكتب كلمات مرور أو مفاتيح API في المحادثة.</p>
        </div>

        <div className="ai-builder-panel">
          <div className="panel-title"><WandSparkles size={19} /><h3>إنشاء موقع</h3><span>{endpoint ? 'عنوان خادم مضبوط · يحتاج فحصًا' : 'محلي + جاهز للاتصال'}</span></div>
          <label className="sr-only" htmlFor="ai-site-description">وصف موقع العمل</label>
          <textarea id="ai-site-description" value={description} onChange={(event) => setDescription(event.target.value)} placeholder="مثال: عيادة أسنان في القاهرة، أريد موقعًا فاخرًا يعرض الخدمات والأطباء والحجز وواتساب…" rows={7} />
          <button className="button button-primary ai-generate-button" type="button" disabled={!description.trim() || Boolean(busy)} onClick={() => void generateWebsite()}>
            {busy === 'generate' ? <LoaderCircle className="spin" size={19} /> : <Sparkles size={19} />}
            {busy === 'generate' ? 'جاري بناء الموقع…' : endpoint ? 'إنشاء موقع احترافي بـGemini' : 'إنشاء فوري بالقالب المحلي'}
          </button>
          {!endpoint && <button className="text-button" type="button" onClick={() => role === 'owner' ? setSettingsOpen(true) : setNotice('يمكن لمالك TITAN ضبط اتصال Gemini من داخل التطبيق. المولد المحلي متاح لك الآن.')}>كيف يعمل الاتصال بـGemini؟</button>}
          <div className="builder-assurances"><span>بدون نصوص وهمية</span><span>معاينة فعلية</span><span>HTML + ZIP</span></div>
        </div>
      </div>

      {site && (
        <div className="ai-site-result">
          <div className="ai-result-header">
            <div><span className={`source-badge ${site.source}`}>{site.source === 'gemini' ? 'Gemini' : 'قالب محلي'}</span><h3>{site.title}</h3><p>{site.summary}</p></div>
            <div className="preview-device-buttons">
              <button className={previewMode === 'desktop' ? 'active' : ''} type="button" onClick={() => setPreviewMode('desktop')} aria-label="معاينة سطح المكتب"><Monitor size={18} /></button>
              <button className={previewMode === 'mobile' ? 'active' : ''} type="button" onClick={() => setPreviewMode('mobile')} aria-label="معاينة الموبايل"><Smartphone size={18} /></button>
            </div>
          </div>
          <div className={`ai-site-preview ${previewMode}`}><iframe title={`معاينة ${site.title}`} srcDoc={site.html} sandbox="allow-scripts" referrerPolicy="no-referrer" /></div>
          <div className="ai-edit-row">
            <input value={editInstruction} onChange={(event) => setEditInstruction(event.target.value)} placeholder="اطلب تعديلًا: غيّر الألوان، أضف قسم الأسعار…" aria-label="أمر تعديل الموقع" />
            <button className="button button-secondary" type="button" disabled={!editInstruction.trim() || Boolean(busy)} onClick={() => void editWebsite()}>{busy === 'edit' ? <LoaderCircle className="spin" size={18} /> : <WandSparkles size={18} />} تعديل الموقع</button>
          </div>
          <div className="ai-result-actions">
            <button className="button button-secondary" type="button" onClick={() => void downloadHtml()}><Download size={18} /> HTML</button>
            <button className="button button-secondary" type="button" onClick={() => void downloadZip()}><FileArchive size={18} /> ZIP</button>
            {role === 'owner' ? <button className="button button-primary" type="button" disabled={Boolean(busy)} onClick={() => void publishWebsite()}>{busy === 'publish' ? <LoaderCircle className="spin" size={18} /> : <Cloud size={18} />} نشر برابط</button> : <a className="button button-primary" href={whatsappRequest} target="_blank" rel="noreferrer"><ExternalLink size={18} /> طلب المراجعة والنشر</a>}
          </div>
          {publishedUrl && <div className="published-link"><span>رابط الموقع:</span><a href={publishedUrl} target="_blank" rel="noreferrer" dir="ltr">{publishedUrl}</a></div>}
        </div>
      )}

      <button className="assistant-fab" type="button" onClick={scrollToStudio} aria-label="فتح مساعد TITAN"><Bot size={25} /><span>TITAN AI</span></button>
    </section>
  );
}
