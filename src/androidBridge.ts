export interface TitanAndroidBridge {
  downloadFile: (fileName: string, base64Content: string) => void;
  authenticateOwner?: () => void;
  logoutOwner?: () => void;
  startListening?: () => void;
  stopListening?: () => void;
  speak?: (text: string) => void;
  stopSpeaking?: () => void;
  startCamera?: () => void;
  stopCamera?: () => void;
  setSecret?: (key: string, value: string) => void;
  getSecret?: (key: string) => string;
  isOwnerAuthenticated?: () => boolean;
  executeCommand?: (command: string) => void;
  openAccessibilitySettings?: () => void;
  isAccessibilityEnabled?: () => boolean;
  getVoices?: () => string;
  setVoice?: (voiceId: string) => void;
  setVoiceRate?: (rate: number) => void;
  setVoicePitch?: (pitch: number) => void;
  setVoiceVolume?: (volume: number) => void;
  getMemorySnapshot?: () => string;
  saveMemoryCommand?: (trigger: string, action: string) => boolean;
  deleteMemoryItem?: (kind: string, key: string) => boolean;
}

interface RawAndroidBridge {
  downloadFile: (fileName: string, base64Content: string, sessionToken: string) => void;
  authenticateOwner?: (sessionToken: string) => void;
  logoutOwner?: (sessionToken: string) => void;
  startListening?: (sessionToken: string) => void;
  stopListening?: (sessionToken: string) => void;
  speak?: (text: string, sessionToken: string) => void;
  stopSpeaking?: (sessionToken: string) => void;
  startCamera?: (sessionToken: string) => void;
  stopCamera?: (sessionToken: string) => void;
  setSecret?: (key: string, value: string, sessionToken: string) => void;
  getSecret?: (key: string, sessionToken: string) => string;
  isOwnerAuthenticated?: () => boolean;
  executeCommand?: (command: string, sessionToken: string) => void;
  openAccessibilitySettings?: (sessionToken: string) => void;
  isAccessibilityEnabled?: () => boolean;
  getVoices?: (sessionToken: string) => string;
  setVoice?: (voiceId: string, sessionToken: string) => void;
  setVoiceRate?: (rate: number, sessionToken: string) => void;
  setVoicePitch?: (pitch: number, sessionToken: string) => void;
  setVoiceVolume?: (volume: number, sessionToken: string) => void;
  getMemorySnapshot?: (sessionToken: string) => string;
  saveMemoryCommand?: (trigger: string, action: string, sessionToken: string) => boolean;
  deleteMemoryItem?: (kind: string, key: string, sessionToken: string) => boolean;
}

function rawBridge(): RawAndroidBridge | undefined {
  return (window as Window & { Android?: RawAndroidBridge }).Android;
}

function sessionToken(): string {
  return (window as Window & { __TITAN_NATIVE_TOKEN__?: string }).__TITAN_NATIVE_TOKEN__ || '';
}

// Sensitive methods require a random token injected only into the trusted top page.
// Sandboxed generated-site frames can see the raw Android object but cannot read this token.
export function androidBridge(): TitanAndroidBridge | undefined {
  const native = rawBridge();
  if (!native) return undefined;
  const bridge: TitanAndroidBridge = {
    downloadFile: (fileName, content) => native.downloadFile(fileName, content, sessionToken()),
  };
  if (native.authenticateOwner) bridge.authenticateOwner = () => native.authenticateOwner?.(sessionToken());
  if (native.logoutOwner) bridge.logoutOwner = () => native.logoutOwner?.(sessionToken());
  if (native.startListening) bridge.startListening = () => native.startListening?.(sessionToken());
  if (native.stopListening) bridge.stopListening = () => native.stopListening?.(sessionToken());
  if (native.speak) bridge.speak = (text) => native.speak?.(text, sessionToken());
  if (native.stopSpeaking) bridge.stopSpeaking = () => native.stopSpeaking?.(sessionToken());
  if (native.startCamera) bridge.startCamera = () => native.startCamera?.(sessionToken());
  if (native.stopCamera) bridge.stopCamera = () => native.stopCamera?.(sessionToken());
  if (native.setSecret) bridge.setSecret = (key, value) => native.setSecret?.(key, value, sessionToken());
  if (native.getSecret) bridge.getSecret = (key) => native.getSecret?.(key, sessionToken()) || '';
  if (native.isOwnerAuthenticated) bridge.isOwnerAuthenticated = () => native.isOwnerAuthenticated?.() || false;
  if (native.executeCommand) bridge.executeCommand = (command) => native.executeCommand?.(command, sessionToken());
  if (native.openAccessibilitySettings) bridge.openAccessibilitySettings = () => native.openAccessibilitySettings?.(sessionToken());
  if (native.isAccessibilityEnabled) bridge.isAccessibilityEnabled = () => native.isAccessibilityEnabled?.() || false;
  if (native.getVoices) bridge.getVoices = () => native.getVoices?.(sessionToken()) || '[]';
  if (native.setVoice) bridge.setVoice = (voiceId) => native.setVoice?.(voiceId, sessionToken());
  if (native.setVoiceRate) bridge.setVoiceRate = (rate) => native.setVoiceRate?.(rate, sessionToken());
  if (native.setVoicePitch) bridge.setVoicePitch = (pitch) => native.setVoicePitch?.(pitch, sessionToken());
  if (native.setVoiceVolume) bridge.setVoiceVolume = (volume) => native.setVoiceVolume?.(volume, sessionToken());
  if (native.getMemorySnapshot) bridge.getMemorySnapshot = () => native.getMemorySnapshot?.(sessionToken()) || '{"commands":{},"history":[]}';
  if (native.saveMemoryCommand) bridge.saveMemoryCommand = (trigger, action) => native.saveMemoryCommand?.(trigger, action, sessionToken()) || false;
  if (native.deleteMemoryItem) bridge.deleteMemoryItem = (kind, key) => native.deleteMemoryItem?.(kind, key, sessionToken()) || false;
  return bridge;
}

export function isAndroidApp(): boolean {
  return Boolean(rawBridge());
}

export async function saveBlob(fileName: string, blob: Blob): Promise<void> {
  const android = androidBridge();
  if (android) {
    const bytes = new Uint8Array(await blob.arrayBuffer());
    let binary = '';
    for (let index = 0; index < bytes.length; index += 8192) {
      binary += String.fromCharCode(...bytes.subarray(index, index + 8192));
    }
    android.downloadFile(fileName, btoa(binary));
    return;
  }

  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = fileName;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export function speak(text: string): void {
  const android = androidBridge();
  if (android?.speak) {
    android.speak(text);
    return;
  }
  if ('speechSynthesis' in window) {
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    const selected = localStorage.getItem('titan.stark.voice') || '';
    const voice = window.speechSynthesis.getVoices().find((item) => item.voiceURI === selected || item.name === selected);
    if (voice) utterance.voice = voice;
    utterance.lang = voice?.lang || 'ar-EG';
    const rate = Number(localStorage.getItem('titan.stark.rate') || 0.95);
    const pitch = Number(localStorage.getItem('titan.stark.pitch') || 1);
    const volume = Number(localStorage.getItem('titan.stark.volume') || 1);
    utterance.rate = Number.isFinite(rate) ? Math.min(1.5, Math.max(0.5, rate)) : 0.95;
    utterance.pitch = Number.isFinite(pitch) ? Math.min(1.5, Math.max(0.5, pitch)) : 1;
    utterance.volume = Number.isFinite(volume) ? Math.min(1, Math.max(0, volume)) : 1;
    window.speechSynthesis.speak(utterance);
  }
}
