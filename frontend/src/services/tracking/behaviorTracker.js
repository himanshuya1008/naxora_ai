const FINGERPRINT_KEY = 'aisip_visitor_fingerprint';
const SESSION_KEY = 'aisip_session_id';
const VISITOR_KEY = 'aisip_visitor_id';

function generateFingerprint() {
  if (crypto.randomUUID) return crypto.randomUUID();
  return `fp_${Date.now()}_${Math.random().toString(36).slice(2)}`;
}

function getOrCreateFingerprint() {
  let fingerprint = localStorage.getItem(FINGERPRINT_KEY);
  if (!fingerprint) {
    fingerprint = generateFingerprint();
    localStorage.setItem(FINGERPRINT_KEY, fingerprint);
  }
  return fingerprint;
}

function detectDeviceType() {
  const ua = navigator.userAgent;
  if (/tablet|ipad/i.test(ua)) return 'TABLET';
  if (/mobi|android/i.test(ua)) return 'MOBILE';
  return 'DESKTOP';
}

/**
 * Standalone, embeddable behavior tracking client. Designed to run on any
 * website (not just this product's own dashboard) — authenticated purely via
 * a per-organization public API key (`x-api-key` header), with no dependency
 * on cookies/JWT, so it works cross-origin on a third-party domain.
 *
 * Usage:
 *   const tracker = new BehaviorTracker({ apiKey: 'pk_track_...', apiBaseUrl: '...' });
 *   await tracker.init();
 *   tracker.trackEvent('PRICING_VIEW', { page: '/pricing', value: secondsSpent });
 */
export class BehaviorTracker {
  constructor({ apiKey, apiBaseUrl, batchIntervalMs = 5000 }) {
    this.apiKey = apiKey;
    this.apiBaseUrl = apiBaseUrl.replace(/\/$/, '');
    this.batchIntervalMs = batchIntervalMs;
    this.visitorId = null;
    this.sessionId = null;
    this.queue = [];
    this.maxScrollDepth = 0;
    this.pageViewCount = 0;
    this.sessionStartedAt = Date.now();
    this._flushTimer = null;
  }

  async init(identity = {}) {
    this.visitorId = sessionStorage.getItem(VISITOR_KEY);
    this.sessionId = sessionStorage.getItem(SESSION_KEY);

    if (!this.visitorId) {
      const visitor = await this._request('POST', '/tracking/identify', {
        fingerprint: getOrCreateFingerprint(),
        ...identity,
      });
      this.visitorId = visitor.visitor.id;
      sessionStorage.setItem(VISITOR_KEY, this.visitorId);
    }

    if (!this.sessionId) {
      const session = await this._request('POST', '/tracking/sessions', {
        visitorId: this.visitorId,
        referrer: document.referrer || undefined,
        landingPage: window.location.pathname,
        userAgent: navigator.userAgent,
        deviceType: detectDeviceType(),
      });
      this.sessionId = session.session.id;
      sessionStorage.setItem(SESSION_KEY, this.sessionId);
    }

    this._attachAutoTracking();
    this._flushTimer = setInterval(() => this.flush(), this.batchIntervalMs);
    window.addEventListener('beforeunload', () => this._onUnload());

    this.trackEvent('PAGE_VIEW', { page: window.location.pathname });
  }

  trackEvent(type, { page = window.location.pathname, label, value, metadata } = {}) {
    if (type === 'PAGE_VIEW') this.pageViewCount += 1;
    this.queue.push({ type, page, label, value, metadata, occurredAt: new Date().toISOString() });
    if (this.queue.length >= 20) this.flush();
  }

  async flush() {
    if (this.queue.length === 0 || !this.sessionId) return;
    const events = this.queue.splice(0, this.queue.length);

    try {
      await this._request('POST', '/tracking/events', { visitorId: this.visitorId, sessionId: this.sessionId, events });
    } catch {
      // Drop the batch rather than retry indefinitely — a lost analytics
      // batch is an acceptable trade-off against unbounded memory growth
      // from a persistently failing endpoint.
    }
  }

  _attachAutoTracking() {
    let scrollTicking = false;
    window.addEventListener('scroll', () => {
      if (scrollTicking) return;
      scrollTicking = true;
      requestAnimationFrame(() => {
        const scrollable = document.documentElement.scrollHeight - window.innerHeight;
        const depth = scrollable > 0 ? Math.min(100, Math.round((window.scrollY / scrollable) * 100)) : 100;
        this.maxScrollDepth = Math.max(this.maxScrollDepth, depth);
        scrollTicking = false;
      });
    });

    document.addEventListener('click', (event) => {
      const el = event.target.closest('[data-track]');
      if (!el) return;
      const type = el.dataset.track;
      this.trackEvent(type, { label: el.dataset.trackLabel ?? el.textContent?.trim().slice(0, 120) });
    });

    document.addEventListener('click', (event) => {
      const link = event.target.closest('a[download], a[href$=".pdf"], a[href$=".zip"], a[href$=".csv"]');
      if (!link) return;
      this.trackEvent('DOWNLOAD', { label: link.getAttribute('download') || link.href });
    });
  }

  _onUnload() {
    const scrollDepthAvg = this.maxScrollDepth;
    const durationSeconds = Math.round((Date.now() - this.sessionStartedAt) / 1000);

    if (this.queue.length > 0 && navigator.sendBeacon) {
      const events = this.queue.splice(0, this.queue.length);
      const blob = new Blob([JSON.stringify({ visitorId: this.visitorId, sessionId: this.sessionId, events })], {
        type: 'application/json',
      });
      navigator.sendBeacon(`${this.apiBaseUrl}/tracking/events`, blob);
    }

    // fetch with keepalive survives page unload, unlike a plain fetch/PATCH
    // (sendBeacon only supports POST, so it can't be used for this update).
    fetch(`${this.apiBaseUrl}/tracking/sessions/${this.sessionId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', 'x-api-key': this.apiKey },
      body: JSON.stringify({ durationSeconds, pageViewCount: this.pageViewCount, scrollDepthAvg }),
      keepalive: true,
    }).catch(() => {});
  }

  async _request(method, path, body) {
    const response = await fetch(`${this.apiBaseUrl}${path}`, {
      method,
      headers: { 'Content-Type': 'application/json', 'x-api-key': this.apiKey },
      body: JSON.stringify(body),
    });
    if (!response.ok) throw new Error(`Tracking request failed: ${response.status}`);
    const json = await response.json();
    return json.data;
  }

  destroy() {
    if (this._flushTimer) clearInterval(this._flushTimer);
  }
}
