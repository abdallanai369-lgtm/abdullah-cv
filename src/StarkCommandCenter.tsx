import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Activity,
  BrainCircuit,
  CheckCircle2,
  Cloud,
  Code2,
  Database,
  Download,
  Gauge,
  Headphones,
  History,
  LoaderCircle,
  MemoryStick,
  Network,
  Play,
  RefreshCw,
  Save,
  ShieldCheck,
  Square,
  Trash2,
  Volume2,
  Wrench,
  XCircle,
} from 'lucide-react';
import { androidBridge, isAndroidApp, saveBlob } from './androidBridge';
import { generateSite } from './WebsiteGenerator';

type CenterTab = 'core' | 'models' | 'voice' | 'memory';
type ProviderState = 'ready' | 'not_configured' | 'not_tested' | 'error';

interface ProviderStatus {
  id: string;
  name: string;
  model?: string;
  configured: boolean;
  state: ProviderState;
  detail: string;
  limits: string;
  source?: string;
}

interface BackendHealth {
  ok: boolean;
  aiConfigured?: boolean;
  geminiConfigured?: boolean;
  model?: string;
  providers?: ProviderStatus[];
}

interface VoiceOption {
  id: string;
  name: string;
  language: string;
  local: boolean;
  network?: boolean;
  quality?: number | null;
}

interface MemoryEntry {
  command: string;
  success: boolean;
  message: string;
  time: number;
}

interface MemorySnapshot {
  commands: Record<string, string>;
  history: MemoryEntry[];
}

const emptyMemory: MemorySnapshot = { commands: {}, history: [] };

const providerDefaults: ProviderStatus[] = [
  {
    id: 'local', name: 'TITAN Local Engine', configured: true, state: 'ready',
    detail: 'قوالب وقواعد محلية لإنشاء المواقع والردود الأساسية؛ ليس نموذج ذكاء اصطناعي.',
    limits: 'لا توجد رسوم أو حصة سحابية. يعمل دون إنترنت.', source: '',
  },
  {
    id: 'gemini', name: 'Google Gemini', configured: false, state: 'not_tested',
    detail: 'توليد حقيقي عبر الخادم الوسيط عند ضبط المفتاح والنموذج.',
    limits: 'الخطة المجانية محدودة بـRPM وTPM وRPD وتختلف حسب النموذج والحساب.',
    source: 'https://ai.google.dev/gemini-api/docs/rate-limits',
  },
  {
    id: 'ollama', name: 'Ollama', configured: false, state: 'not_configured',
    detail: 'نماذج محلية أو سحابية. التشغيل المحلي لا يحتاج مفتاح API لكنه يحتاج خادمًا يمكن للواجهة الوصول إليه.',
    limits: 'التكلفة والذاكرة والسرعة تعتمدان على جهازك والنموذج. Ollama Cloud له حدوده المنفصلة.',
    source: 'https://docs.ollama.com/api/introduction',
  },
  {
    id: 'huggingface', name: 'Hugging Face', configured: false, state: 'not_configured',
    detail: 'موصل اختبار اتصال فقط في هذه النسخة؛ توليد المحادثة عبره غير مفعّل بعد.',
    limits: 'لا نعد بخطة مجانية دائمة؛ الرصيد والتسعير يعتمدان على الحساب والمزود.',
    source: 'https://huggingface.co/docs/api-inference/en/pricing',
  },
];

const providerStateLabels: Record<ProviderState, string> = {
  ready: 'جاهز ومختبر',
  not_configured: 'غير مضبوط',
  not_tested: 'لم يُختبر',
  error: 'خطأ اتصال',
};

function endpointBase(value: string): string {
  return value.trim().replace(/\/+$/, '');
}

function qualityLabel(quality?: number | null): string {
  if (quality === 400) return 'جودة عالية جدًا';
  if (quality === 300) return 'جودة عالية';
  if (quality === 200) return 'جودة عادية';
  if (quality === 100) return 'جودة منخفضة';
  return 'الجودة حسب المزود';
}

export function StarkCommandCenter({ endpoint }: { endpoint: string }) {
  const android = androidBridge();
  const [tab, setTab] = useState<CenterTab>('core');
  const [health, setHealth] = useState<BackendHealth | null>(null);
  const [healthLoading, setHealthLoading] = useState(false);
  const [modelError, setModelError] = useState('');
  const [testing, setTesting] = useState('');
  const [providerOverrides, setProviderOverrides] = useState<Record<string, Partial<ProviderStatus>>>({});
  const [testResults, setTestResults] = useState<Record<string, { ok: boolean; message: string }>>({});
  const [voices, setVoices] = useState<VoiceOption[]>([]);
  const [voiceFilter, setVoiceFilter] = useState<'all' | 'ar' | 'en'>('all');
  const [selectedVoice, setSelectedVoice] = useState(() => localStorage.getItem('titan.stark.voice') || '');
  const [rate, setRate] = useState(() => Number(localStorage.getItem('titan.stark.rate') || 0.95));
  const [pitch, setPitch] = useState(() => Number(localStorage.getItem('titan.stark.pitch') || 1));
  const [volume, setVolume] = useState(() => Number(localStorage.getItem('titan.stark.volume') || 1));
  const [voiceMessage, setVoiceMessage] = useState('');
  const [memory, setMemory] = useState<MemorySnapshot>(emptyMemory);
  const [memoryMessage, setMemoryMessage] = useState('');
  const [actionDrafts, setActionDrafts] = useState<Record<string, string>>({});
  const [accessibilityEnabled, setAccessibilityEnabled] = useState(() => android?.isAccessibilityEnabled?.() || false);
  const [checkedAt, setCheckedAt] = useState('');

  const refreshHealth = useCallback(async (manual = false) => {
    const base = endpointBase(endpoint);
    if (!base) {
      setHealth(null);
      if (manual) setModelError('أضف عنوان الخادم من إعدادات الاتصال أولًا. الأدوات المحلية تظل متاحة.');
      return;
    }
    setHealthLoading(true);
    if (manual) setModelError('');
    const controller = new AbortController();
    const timeout = window.setTimeout(() => controller.abort(), 10_000);
    try {
      const response = await fetch(`${base}/health`, { signal: controller.signal });
      const data = await response.json() as BackendHealth;
      if (!response.ok) throw new Error(`HTTP_${response.status}`);
      setHealth(data);
    } catch {
      setHealth(null);
      setModelError('تعذر الوصول إلى الخادم. تحقق من العنوان والشبكة؛ لم نغيّر حالة الأدوات المحلية.');
    } finally {
      window.clearTimeout(timeout);
      setHealthLoading(false);
    }
  }, [endpoint]);

  useEffect(() => { void refreshHealth(false); }, [refreshHealth]);

  const loadVoices = useCallback(() => {
    if (android?.getVoices) {
      try {
        const parsed = JSON.parse(android.getVoices()) as VoiceOption[];
        setVoices(Array.isArray(parsed) ? parsed : []);
        if (!parsed.length) setVoiceMessage('محرك الصوت ما زال يجهز الأصوات. اضغط تحديث بعد لحظة.');
        else setVoiceMessage('');
      } catch {
        setVoiceMessage('تعذر قراءة أصوات الجهاز.');
      }
      return;
    }
    if ('speechSynthesis' in window) {
      const available = window.speechSynthesis.getVoices().map((voice) => ({
        id: voice.voiceURI || voice.name,
        name: voice.name,
        language: voice.lang,
        local: voice.localService,
        quality: null,
      }));
      setVoices(available);
      setVoiceMessage(available.length ? '' : 'لم يعلن المتصفح عن أصوات. يمكنك إعادة التحميل أو اختبار الجهاز من إعدادات اللغة والصوت.');
    } else {
      setVoices([]);
      setVoiceMessage('تحويل النص إلى صوت غير مدعوم في هذا المتصفح.');
    }
  }, []);

  useEffect(() => {
    loadVoices();
    if (!android?.getVoices && 'speechSynthesis' in window) {
      window.speechSynthesis.addEventListener('voiceschanged', loadVoices);
      return () => window.speechSynthesis.removeEventListener('voiceschanged', loadVoices);
    }
  }, [loadVoices]);

  const refreshMemory = useCallback(() => {
    if (!android?.getMemorySnapshot) {
      setMemory(emptyMemory);
      return;
    }
    try {
      const parsed = JSON.parse(android.getMemorySnapshot()) as MemorySnapshot;
      const snapshot = { commands: parsed.commands || {}, history: Array.isArray(parsed.history) ? parsed.history : [] };
      setMemory(snapshot);
      setActionDrafts(snapshot.commands);
      setMemoryMessage('');
    } catch {
      setMemoryMessage('تعذر قراءة الذاكرة المحلية.');
    }
  }, []);

  useEffect(() => { if (tab === 'memory') refreshMemory(); }, [tab, refreshMemory]);

  const providers = useMemo(() => providerDefaults.map((provider) => {
    const fromServer = health?.providers?.find((item) => item.id === provider.id);
    const geminiConfigured = Boolean(health?.geminiConfigured ?? health?.aiConfigured);
    const legacy = provider.id === 'gemini' && health
      ? { configured: geminiConfigured, state: geminiConfigured ? 'not_tested' as const : 'not_configured' as const, model: health.model }
      : {};
    return { ...provider, ...legacy, ...fromServer, ...providerOverrides[provider.id] };
  }), [health, providerOverrides]);

  async function testProvider(provider: ProviderStatus) {
    setTesting(provider.id);
    const started = performance.now();
    try {
      if (provider.id === 'local') {
        const result = generateSite('شركة استشارات تقنية تعرض خدماتها وبيانات التواصل');
        if (!result.html.includes('<!doctype html>') || result.html.length < 1_000) throw new Error('INVALID_LOCAL_RESULT');
        const latency = Math.round(performance.now() - started);
        setProviderOverrides((current) => ({ ...current, local: { state: 'ready' } }));
        setTestResults((current) => ({ ...current, local: { ok: true, message: `تم إنشاء مستند HTML كامل محليًا (${latency}ms).` } }));
        return;
      }
      const base = endpointBase(endpoint);
      if (!base) throw new Error('NO_ENDPOINT');
      const response = await fetch(`${base}/api/models/test`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ provider: provider.id }),
      });
      const data = await response.json() as { error?: string; detail?: string; model?: string };
      if (!response.ok) throw new Error(data.error || `HTTP_${response.status}`);
      const latency = Math.round(performance.now() - started);
      setProviderOverrides((current) => ({ ...current, [provider.id]: { state: 'ready', model: data.model || provider.model } }));
      setTestResults((current) => ({ ...current, [provider.id]: { ok: true, message: `${data.detail || 'نجح اختبار الاتصال'} · ${latency}ms` } }));
    } catch (error) {
      const code = error instanceof Error ? error.message : '';
      const message = code === 'NO_ENDPOINT' ? 'لا يوجد عنوان خادم.' : code === 'MODEL_NOT_CONFIGURED' ? 'المزود غير مضبوط في الخادم.' : 'فشل الاختبار. راجع إعدادات المزود والشبكة.';
      setProviderOverrides((current) => ({ ...current, [provider.id]: { state: 'error' } }));
      setTestResults((current) => ({ ...current, [provider.id]: { ok: false, message } }));
    } finally {
      setTesting('');
    }
  }

  function applyNativeVoiceSettings() {
    android?.setVoiceRate?.(rate);
    android?.setVoicePitch?.(pitch);
    android?.setVoiceVolume?.(volume);
  }

  function previewVoice(voice: VoiceOption) {
    setSelectedVoice(voice.id);
    localStorage.setItem('titan.stark.voice', voice.id);
    localStorage.setItem('titan.stark.rate', String(rate));
    localStorage.setItem('titan.stark.pitch', String(pitch));
    localStorage.setItem('titan.stark.volume', String(volume));
    const sample = voice.language.toLowerCase().startsWith('ar')
      ? 'مساء الخير يا باشمهندس عبدالله. أنا TITAN STARK AI، جاهز لتنفيذ أوامرك.'
      : 'Hello Abdullah. I am TITAN STARK AI, ready to help with your next task.';
    if (android?.speak) {
      android.setVoice?.(voice.id);
      applyNativeVoiceSettings();
      android.speak(sample);
    } else if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(sample);
      utterance.voice = window.speechSynthesis.getVoices().find((item) => item.voiceURI === voice.id || item.name === voice.id) || null;
      utterance.lang = voice.language;
      utterance.rate = rate;
      utterance.pitch = pitch;
      utterance.volume = volume;
      window.speechSynthesis.speak(utterance);
    }
    setVoiceMessage(`تم اختيار ${voice.name} وتشغيل معاينته.`);
  }

  function stopVoice() {
    android?.stopSpeaking?.();
    if ('speechSynthesis' in window) window.speechSynthesis.cancel();
    setVoiceMessage('تم إيقاف الصوت.');
  }

  function updateVoiceSetting(kind: 'rate' | 'pitch' | 'volume', value: number) {
    if (kind === 'rate') { setRate(value); android?.setVoiceRate?.(value); }
    if (kind === 'pitch') { setPitch(value); android?.setVoicePitch?.(value); }
    if (kind === 'volume') { setVolume(value); android?.setVoiceVolume?.(value); }
    localStorage.setItem(`titan.stark.${kind}`, String(value));
  }

  function saveCommand(trigger: string) {
    const action = (actionDrafts[trigger] || '').trim();
    if (!action || !android?.saveMemoryCommand) return;
    if (android.saveMemoryCommand(trigger, action)) {
      setMemoryMessage('تم حفظ تصحيح الأمر محليًا.');
      refreshMemory();
    } else setMemoryMessage('لم يُحفظ التصحيح. تحقق من النص ومن عدم احتوائه على بيانات حساسة.');
  }

  function deleteMemory(kind: string, key: string) {
    if (!android?.deleteMemoryItem || !window.confirm('هل تريد حذف هذا العنصر من ذاكرة TITAN المحلية؟')) return;
    if (android.deleteMemoryItem(kind, key)) {
      setMemoryMessage('تم الحذف من الذاكرة المحلية.');
      refreshMemory();
    } else setMemoryMessage('تعذر حذف العنصر.');
  }

  async function exportMemory() {
    await saveBlob('titan-stark-memory.json', new Blob([JSON.stringify({
      product: 'TITAN STARK AI', exportedAt: new Date().toISOString(), scope: 'command-memory-only', data: memory,
    }, null, 2)], { type: 'application/json;charset=utf-8' }));
    setMemoryMessage('تم تجهيز نسخة JSON من ذاكرة الأوامر فقط.');
  }

  async function runToolCheck() {
    setAccessibilityEnabled(android?.isAccessibilityEnabled?.() || false);
    loadVoices();
    refreshMemory();
    await refreshHealth(false);
    setCheckedAt(new Date().toLocaleTimeString('ar-EG'));
  }

  const visibleVoices = voices.filter((voice) => voiceFilter === 'all' || voice.language.toLowerCase().startsWith(voiceFilter));
  const agentCards = [
    { name: 'TITAN ENGINEER', detail: 'إنشاء ومعاينة وتصدير المواقع.', active: true, action: () => document.getElementById('generator')?.scrollIntoView({ behavior: 'smooth' }), label: 'فتح الأداة' },
    { name: 'TITAN DESIGNER', detail: 'قوالب وتصميم متجاوب داخل المولد.', active: true, action: () => document.getElementById('generator')?.scrollIntoView({ behavior: 'smooth' }), label: 'فتح التصميم' },
    { name: 'TITAN AUTOMATION', detail: isAndroidApp() ? 'أوامر النظام والتذكيرات للمالك.' : 'يتطلب تطبيق Android.', active: isAndroidApp(), action: () => document.getElementById('titan-command-input')?.focus(), label: 'كتابة أمر' },
    { name: 'TITAN VOICE', detail: 'استماع وتحدث ومعاينة الأصوات المتاحة.', active: true, action: () => setTab('voice'), label: 'فتح Voice Lab' },
    { name: 'TITAN QA', detail: 'اختبارات البناء موثقة خارج الواجهة؛ لا يوجد وكيل QA مستقل هنا.', active: false },
    { name: 'TITAN SECURITY', detail: 'مراجعة المستودع تتم في بيئة التطوير؛ الفحص الذاتي غير مفعّل.', active: false },
    { name: 'TITAN BUSINESS', detail: 'يحتاج نموذجًا وأداة بحث قبل تنفيذ مهام فعلية.', active: false },
    { name: 'TITAN RESEARCH', detail: 'البحث والتحقق عبر نموذج متصل غير مفعّلين في هذه النسخة.', active: false },
  ];

  return (
    <section className="stark-command-center" id="stark-command-center" aria-label="مركز قيادة TITAN STARK AI">
      <div className="stark-center-header">
        <div><span className="stark-live-dot" /><span><strong>TITAN STARK AI</strong><small>COMMAND CENTER · OWNER ONLY</small></span></div>
        <span className="owner-badge"><ShieldCheck size={15} /> تحت سيطرتك</span>
      </div>
      <div className="stark-center-tabs" role="group" aria-label="أقسام مركز القيادة">
        <button type="button" aria-pressed={tab === 'core'} className={tab === 'core' ? 'active' : ''} onClick={() => setTab('core')}><BrainCircuit size={16} /> CORE</button>
        <button type="button" aria-pressed={tab === 'models'} className={tab === 'models' ? 'active' : ''} onClick={() => setTab('models')}><Network size={16} /> MODEL HUB</button>
        <button type="button" aria-pressed={tab === 'voice'} className={tab === 'voice' ? 'active' : ''} onClick={() => setTab('voice')}><Volume2 size={16} /> VOICE LAB</button>
        <button type="button" aria-pressed={tab === 'memory'} className={tab === 'memory' ? 'active' : ''} onClick={() => setTab('memory')}><MemoryStick size={16} /> MEMORY</button>
      </div>

      {tab === 'core' && (
        <div className="stark-core-panel">
          <div className="stark-status-grid">
            <div><Code2 size={18} /><span>المولد المحلي<strong>جاهز</strong></span></div>
            <div><Cloud size={18} /><span>النموذج السحابي<strong>{health ? (providers.find((item) => item.id === 'gemini')?.configured ? 'مضبوط · يحتاج اختبارًا' : 'غير مضبوط') : 'غير متصل'}</strong></span></div>
            <div><Wrench size={18} /><span>التحكم في النظام<strong>{isAndroidApp() ? (accessibilityEnabled ? 'Accessibility مفعّل' : 'يحتاج تفعيل Accessibility') : 'Android فقط'}</strong></span></div>
            <div><Database size={18} /><span>ذاكرة الأوامر<strong>{android?.getMemorySnapshot ? `${Object.keys(memory.commands).length} اختصارات` : 'تحديث التطبيق مطلوب'}</strong></span></div>
          </div>
          <button className="button button-secondary button-small stark-tool-check" type="button" onClick={() => void runToolCheck()} disabled={healthLoading}>
            {healthLoading ? <LoaderCircle className="spin" size={16} /> : <Activity size={16} />} فحص الأدوات الآن
          </button>
          {checkedAt && <p className="stark-muted" aria-live="polite">تم تحديث الحالات الفعلية الساعة {checkedAt}.</p>}
          <div className="stark-agent-grid">
            {agentCards.map((agent) => (
              <article className={`stark-agent ${agent.active ? 'is-active' : ''}`} key={agent.name}>
                <div><strong dir="ltr">{agent.name}</strong><span>{agent.active ? 'أداة متاحة' : 'غير مفعّل'}</span></div>
                <p>{agent.detail}</p>
                {agent.active && agent.action && <button type="button" onClick={agent.action}>{agent.label}</button>}
              </article>
            ))}
          </div>
          <p className="stark-disclaimer">هذه الأسماء توزيع للمسؤوليات فوق أدوات محددة، وليست ادعاءً بوجود ثمانية نماذج مستقلة تعمل الآن.</p>
        </div>
      )}

      {tab === 'models' && (
        <div className="stark-models-panel">
          <div className="stark-panel-intro">
            <div><strong>TITAN MODEL HUB</strong><p>الحالة من الخادم أو من اختبار فعلي. لا مفاتيح API داخل الواجهة.</p></div>
            <button className="icon-button" type="button" onClick={() => void refreshHealth(true)} disabled={healthLoading} aria-label="تحديث حالة النماذج">{healthLoading ? <LoaderCircle className="spin" size={18} /> : <RefreshCw size={18} />}</button>
          </div>
          {modelError && <p className="stark-inline-error" role="alert">{modelError}</p>}
          <div className="stark-provider-list">
            {providers.map((provider) => (
              <article className="stark-provider" key={provider.id}>
                <div className="stark-provider-top">
                  <div><strong>{provider.name}</strong><small dir="ltr">{provider.model || (provider.id === 'local' ? 'offline-rules' : 'model not selected')}</small></div>
                  <span className={`provider-state state-${provider.state}`}>{providerStateLabels[provider.state]}</span>
                </div>
                <p>{provider.detail}</p>
                <small className="provider-limits">{provider.limits}</small>
                <div className="stark-provider-actions">
                  <button type="button" onClick={() => void testProvider(provider)} disabled={testing === provider.id || (provider.id !== 'local' && (!endpointBase(endpoint) || provider.state === 'not_configured'))}>
                    {testing === provider.id ? <LoaderCircle className="spin" size={14} /> : <Gauge size={14} />} اختبار حقيقي
                  </button>
                  {provider.source && <a href={provider.source} target="_blank" rel="noreferrer">حدود الخدمة الرسمية</a>}
                </div>
                {testResults[provider.id] && <p className={testResults[provider.id].ok ? 'stark-test-success' : 'stark-inline-error'} aria-live="polite">{testResults[provider.id].ok ? <CheckCircle2 size={14} /> : <XCircle size={14} />}{testResults[provider.id].message}</p>}
              </article>
            ))}
          </div>
          <p className="stark-disclaimer">المولد المحلي هو البديل الحالي عند غياب Gemini. المقارنة متعددة النماذج وإضافة مزود من الواجهة لم تُفعّلا بعد؛ إضافة المزودين الحالية تتم بإعدادات الخادم.</p>
        </div>
      )}

      {tab === 'voice' && (
        <div className="stark-voice-panel">
          <div className="stark-panel-intro">
            <div><strong>TITAN VOICE LAB</strong><p>{android?.getVoices ? 'الأصوات مقروءة من محرك Android.' : 'الأصوات مقروءة من المتصفح والنظام.'} كل زر معاينة يشغّل الصوت نفسه.</p></div>
            <button className="icon-button" type="button" onClick={loadVoices} aria-label="تحديث قائمة الأصوات"><RefreshCw size={18} /></button>
          </div>
          <div className="voice-settings-grid">
            <label>سرعة الكلام <output>{rate.toFixed(2)}</output><input aria-label="سرعة الكلام" type="range" min="0.5" max="1.5" step="0.05" value={rate} onChange={(event) => updateVoiceSetting('rate', Number(event.target.value))} /></label>
            <label>درجة الصوت <output>{pitch.toFixed(2)}</output><input aria-label="درجة الصوت" type="range" min="0.5" max="1.5" step="0.05" value={pitch} onChange={(event) => updateVoiceSetting('pitch', Number(event.target.value))} /></label>
            <label>مستوى الصوت <output>{Math.round(volume * 100)}%</output><input aria-label="مستوى الصوت" type="range" min="0" max="1" step="0.05" value={volume} onChange={(event) => updateVoiceSetting('volume', Number(event.target.value))} /></label>
          </div>
          <div className="voice-toolbar">
            <div role="group" aria-label="تصفية الأصوات حسب اللغة">
              <button type="button" aria-pressed={voiceFilter === 'all'} className={voiceFilter === 'all' ? 'active' : ''} onClick={() => setVoiceFilter('all')}>الكل</button>
              <button type="button" aria-pressed={voiceFilter === 'ar'} className={voiceFilter === 'ar' ? 'active' : ''} onClick={() => setVoiceFilter('ar')}>العربية</button>
              <button type="button" aria-pressed={voiceFilter === 'en'} className={voiceFilter === 'en' ? 'active' : ''} onClick={() => setVoiceFilter('en')}>English</button>
            </div>
            <button className="voice-stop" type="button" onClick={stopVoice}><Square size={14} /> إيقاف الصوت</button>
          </div>
          {voiceMessage && <p className="stark-muted" aria-live="polite">{voiceMessage}</p>}
          <div className="voice-list">
            {visibleVoices.map((voice) => (
              <article className={`voice-option ${selectedVoice === voice.id ? 'selected' : ''}`} key={voice.id}>
                <div><Headphones size={18} /><span><strong dir="auto">{voice.name}</strong><small dir="ltr">{voice.language}</small></span></div>
                <p>{voice.local ? 'صوت محلي' : voice.network ? 'يحتاج شبكة' : 'المصدر حسب النظام'} · {qualityLabel(voice.quality)}</p>
                <button type="button" onClick={() => previewVoice(voice)}><Play size={14} /> اختيار واستماع</button>
              </article>
            ))}
            {!visibleVoices.length && <div className="stark-empty"><Volume2 size={24} /><p>لا توجد أصوات معلنة لهذا الفلتر حتى الآن.</p></div>}
          </div>
          <p className="stark-disclaimer">لا تكشف معظم محركات TTS نوع الصوت بشكل موثوق، لذلك لا نضع وسم «رجالي» أو «نسائي» تخمينيًا. اللهجة المصرية تعتمد على الصوت المثبت.</p>
        </div>
      )}

      {tab === 'memory' && (
        <div className="stark-memory-panel">
          <div className="stark-panel-intro">
            <div><strong>ذاكرة الأوامر المحلية</strong><p>راجع الاختصارات وصححها أو احذفها. السجل محدود بآخر 15 نتيجة ولا يحفظ كلمات المرور أو OTP.</p></div>
            <button className="icon-button" type="button" onClick={refreshMemory} aria-label="تحديث الذاكرة"><RefreshCw size={18} /></button>
          </div>
          {!android?.getMemorySnapshot ? (
            <div className="stark-empty"><MemoryStick size={25} /><p>إدارة الذاكرة تتطلب نسخة Android المحدثة. لا نعرض بيانات بديلة أو وهمية.</p></div>
          ) : (
            <>
              <div className="memory-actions">
                <button type="button" onClick={() => void exportMemory()} disabled={!Object.keys(memory.commands).length && !memory.history.length}><Download size={15} /> تصدير ذاكرة الأوامر</button>
                <button type="button" onClick={() => deleteMemory('history', 'all')} disabled={!memory.history.length}><Trash2 size={15} /> حذف السجل</button>
              </div>
              {memoryMessage && <p className="stark-muted" aria-live="polite">{memoryMessage}</p>}
              <h4><BrainCircuit size={16} /> الاختصارات المتعلمة <span>{Object.keys(memory.commands).length}</span></h4>
              <div className="memory-command-list">
                {Object.entries(memory.commands).map(([trigger, action]) => (
                  <article key={trigger}>
                    <strong>{trigger}</strong>
                    <label>الأمر المنفذ<input aria-label={`تصحيح أمر ${trigger}`} value={actionDrafts[trigger] ?? action} onChange={(event) => setActionDrafts((current) => ({ ...current, [trigger]: event.target.value }))} /></label>
                    <div><button type="button" onClick={() => saveCommand(trigger)} disabled={!actionDrafts[trigger]?.trim()}><Save size={14} /> حفظ التصحيح</button><button type="button" onClick={() => deleteMemory('command', trigger)}><Trash2 size={14} /> حذف</button></div>
                  </article>
                ))}
                {!Object.keys(memory.commands).length && <p className="stark-muted">لا توجد اختصارات محفوظة. علّم المساعد بقول: «لما أقول… اعمل…».</p>}
              </div>
              <h4><History size={16} /> سجل النتائج <span>{memory.history.length}</span></h4>
              <div className="memory-history-list">
                {[...memory.history].reverse().map((entry) => (
                  <article key={`${entry.time}-${entry.command}`}>
                    <div><span className={entry.success ? 'history-success' : 'history-failure'}>{entry.success ? 'نجح' : 'فشل'}</span><time>{new Date(entry.time).toLocaleString('ar-EG')}</time><button type="button" onClick={() => deleteMemory('history', String(entry.time))} aria-label={`حذف نتيجة ${entry.command}`}><Trash2 size={14} /></button></div>
                    <strong>{entry.command}</strong><p>{entry.message}</p>
                  </article>
                ))}
                {!memory.history.length && <p className="stark-muted">لا توجد نتائج محفوظة.</p>}
              </div>
            </>
          )}
        </div>
      )}
    </section>
  );
}
