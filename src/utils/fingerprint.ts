import FingerprintJS from '@fingerprintjs/fingerprintjs';

let cachedFingerprint: string | null = null;

export async function getFingerprint(): Promise<string> {
  if (cachedFingerprint) return cachedFingerprint;
  const stored = localStorage.getItem('qf_fingerprint');
  if (stored) {
    cachedFingerprint = stored;
    return stored;
  }
  const fp = await FingerprintJS.load();
  const result = await fp.get();
  cachedFingerprint = result.visitorId;
  localStorage.setItem('qf_fingerprint', cachedFingerprint);
  return cachedFingerprint;
}
