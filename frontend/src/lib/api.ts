// =============================================================================
// Mock API — returns static data, no backend required
// =============================================================================
import * as D from './staticData';

type Params = Record<string, string | number | undefined>;

function paginate<T>(arr: T[], page = 1, limit = 20) {
  const start = (page - 1) * limit;
  return { data: arr.slice(start, start + limit), meta: { total: arr.length, page, limit } };
}

function filterBySearch<T extends Record<string, unknown>>(arr: T[], search: string, keys: string[]): T[] {
  if (!search) return arr;
  const q = search.toLowerCase();
  return arr.filter((item) => keys.some((k) => String(item[k] ?? '').toLowerCase().includes(q)));
}

function filterByField<T extends Record<string, unknown>>(arr: T[], field: string, value: string): T[] {
  if (!value) return arr;
  return arr.filter((item) => String(item[field]) === value);
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function resolve(data: any): Promise<{ data: any }> {
  return Promise.resolve({ data: typeof data === 'object' && data !== null && 'meta' in data ? data : { data } });
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function route(method: string, url: string, params: Params = {}, _body?: unknown): Promise<{ data: any }> {
  const path = url.replace(/^\//, '');

  // ── Auth ──────────────────────────────────────────────────────
  if (path === 'auth/login')   return resolve({ accessToken: 'static-token', refreshToken: 'static-refresh', user: D.STATIC_USER });
  if (path === 'auth/me')      return resolve(D.STATIC_USER);
  if (path === 'auth/logout')  return resolve({ ok: true });
  if (path === 'auth/refresh') return resolve({ accessToken: 'static-token' });

  // ── Dashboard ─────────────────────────────────────────────────
  if (path === 'dashboard/kpis')           return resolve(D.DASHBOARD_KPIS);
  if (path.startsWith('dashboard/trends')) return resolve(D.DASHBOARD_TRENDS(String(params.range || '12m')));
  if (path === 'dashboard/upcoming')       return resolve(D.DASHBOARD_UPCOMING);
  if (path === 'dashboard/equipment-dist') return resolve(D.DASHBOARD_EQUIPMENT_DIST);
  if (path === 'dashboard/cert-health')    return resolve(D.DASHBOARD_CERT_HEALTH);
  if (path === 'dashboard/partner-map')    return resolve(D.DASHBOARD_PARTNER_MAP);

  // ── Labs ──────────────────────────────────────────────────────
  if (path === 'labs') {
    let list = [...D.LABS];
    list = filterBySearch(list, String(params.search || ''), ['name', 'labCode', 'city']);
    list = filterByField(list, 'type', String(params.type || ''));
    list = filterByField(list, 'status', String(params.status || ''));
    return resolve(paginate(list, Number(params.page || 1), Number(params.limit || 20)));
  }
  if (/^labs\/[^/]+\/history$/.test(path)) {
    const id = path.split('/')[1];
    return resolve(D.LAB_HISTORY(id));
  }

  // ── Equipment ─────────────────────────────────────────────────
  if (path === 'equipment') {
    let list = [...D.EQUIPMENT_LIST];
    list = filterBySearch(list, String(params.search || ''), ['name', 'equipmentCode', 'type']);
    list = filterByField(list, 'type', String(params.type || ''));
    list = filterByField(list, 'status', String(params.status || ''));
    return resolve(paginate(list, Number(params.page || 1), Number(params.limit || 20)));
  }
  if (path === 'equipment/utilisation') return resolve(D.EQUIPMENT_UTILISATION);
  if (path === 'equipment/matrix')      return resolve(D.EQUIPMENT_MATRIX);

  // ── Certifications ────────────────────────────────────────────
  if (path === 'certifications') {
    let list = [...D.CERTIFICATIONS_LIST];
    list = filterBySearch(list, String(params.search || ''), ['name', 'certCode', 'body']);
    list = filterByField(list, 'status', String(params.status || ''));
    list = filterByField(list, 'type', String(params.type || ''));
    return resolve(paginate(list, Number(params.page || 1), Number(params.limit || 20)));
  }
  if (path === 'certifications/health-chart')    return resolve(D.CERT_HEALTH_CHART);
  if (path === 'certifications/expiry-timeline') return resolve(D.CERT_EXPIRY_TIMELINE);

  // ── Partners ──────────────────────────────────────────────────
  if (path === 'partners/finder') return resolve(D.FINDER_RESULTS);
  if (path === 'partners') {
    let list = [...D.PARTNERS_LIST];
    list = filterBySearch(list, String(params.search || ''), ['name', 'partnerCode', 'city']);
    list = filterByField(list, 'type', String(params.type || ''));
    list = filterByField(list, 'status', String(params.status || ''));
    return resolve(paginate(list, Number(params.page || 1), Number(params.limit || 20)));
  }
  if (/^partners\/[^/]+\/scorecard$/.test(path)) {
    const id = path.split('/')[1];
    return resolve(D.PARTNER_SCORECARD(id));
  }

  // ── CAPA ──────────────────────────────────────────────────────
  if (path === 'capa') {
    let list = [...D.CAPAS];
    list = filterBySearch(list, String(params.search || ''), ['title', 'capaCode', 'source']);
    list = filterByField(list, 'status', String(params.status || ''));
    list = filterByField(list, 'severity', String(params.severity || ''));
    return resolve(paginate(list, Number(params.page || 1), Number(params.limit || 20)));
  }
  if (path === 'capa/monthly-trend') return resolve(D.CAPA_MONTHLY_TREND);
  if (path === 'capa/by-severity')   return resolve(D.CAPA_BY_SEVERITY);

  // ── Audits ────────────────────────────────────────────────────
  if (path === 'audits') {
    let list = [...D.AUDITS_LIST];
    list = filterBySearch(list, String(params.search || ''), ['auditCode', 'auditorName']);
    list = filterByField(list, 'type', String(params.type || ''));
    list = filterByField(list, 'status', String(params.status || ''));
    return resolve(paginate(list, Number(params.page || 1), Number(params.limit || 20)));
  }
  if (path === 'audits/score-trend') return resolve(D.AUDIT_SCORE_TREND);
  if (path === 'audits/calendar')    return resolve(D.AUDIT_CALENDAR(Number(params.year || new Date().getFullYear())));

  // ── SOPs ──────────────────────────────────────────────────────
  if (path === 'sops') {
    let list = [...D.SOPS];
    list = filterBySearch(list, String(params.search || ''), ['title', 'sopCode', 'category']);
    list = filterByField(list, 'category', String(params.category || ''));
    list = filterByField(list, 'status', String(params.status || ''));
    return resolve(paginate(list, Number(params.page || 1), Number(params.limit || 20)));
  }
  if (path === 'sops/due-for-review') {
    return resolve(D.SOPS.filter((s) => (s.daysUntilReview ?? 999) <= 90));
  }
  if (/^sops\/[^/]+\/versions$/.test(path)) return resolve({ ok: true });

  // ── Batches ───────────────────────────────────────────────────
  if (path === 'batches') {
    let list = [...D.BATCHES];
    list = filterBySearch(list, String(params.search || ''), ['batchCode', 'productName']);
    list = filterByField(list, 'status', String(params.status || ''));
    return resolve(paginate(list, Number(params.page || 1), Number(params.limit || 20)));
  }
  if (path === 'batches/monthly-output') return resolve(D.BATCH_MONTHLY_OUTPUT);
  if (path === 'batches/yield-trend')    return resolve(D.BATCH_YIELD_TREND);

  // ── Documents ─────────────────────────────────────────────────
  if (path === 'documents') {
    let list = [...D.DOCUMENTS];
    list = filterBySearch(list, String(params.search || ''), ['title', 'docCode', 'type']);
    list = filterByField(list, 'type', String(params.type || ''));
    list = filterByField(list, 'status', String(params.status || ''));
    return resolve(paginate(list, Number(params.page || 1), Number(params.limit || 20)));
  }
  if (/^documents\/[^/]+\/download$/.test(path)) return resolve({ url: '#' });

  // ── Requests ──────────────────────────────────────────────────
  if (path === 'requests') {
    let list = [...D.REQUESTS_LIST];
    list = filterBySearch(list, String(params.search || ''), ['title', 'requestCode']);
    list = filterByField(list, 'status', String(params.status || ''));
    list = filterByField(list, 'priority', String(params.priority || ''));
    return resolve(paginate(list, Number(params.page || 1), Number(params.limit || 20)));
  }
  if (path === 'requests/monthly-volume') return resolve(D.REQUESTS_MONTHLY_VOLUME);
  if (path === 'requests/by-lab')         return resolve(D.REQUESTS_BY_LAB);

  // ── Workflows ─────────────────────────────────────────────────
  if (path === 'workflows/workflow-runs') {
    let list = [...D.WORKFLOW_RUNS];
    if (params.status) list = list.filter((r) => r.status === params.status);
    return resolve(paginate(list, Number(params.page || 1), Number(params.limit || 20)));
  }
  if (path === 'workflows') return resolve(D.WORKFLOW_TEMPLATES);
  if (/^workflows\/workflow-runs\/[^/]+\/steps\//.test(path)) return resolve({ ok: true });

  // ── Integrations ──────────────────────────────────────────────
  if (path === 'integrations') return resolve(D.INTEGRATIONS_LIST);

  // ── Notifications ─────────────────────────────────────────────
  if (path === 'notifications/unread-count') return resolve({ count: D.NOTIFICATIONS.filter((n) => !n.isRead).length });
  if (path === 'notifications')              return resolve(D.NOTIFICATIONS);
  if (/^notifications\/[^/]+\/read$/.test(path)) return resolve({ ok: true });

  // ── Search ────────────────────────────────────────────────────
  if (path.startsWith('search')) {
    const q = (String(params.q || '')).toLowerCase();
    const results: Record<string, unknown[]> = {};
    const matchLabs = D.LABS.filter((l) => l.name.toLowerCase().includes(q) || l.labCode.toLowerCase().includes(q));
    if (matchLabs.length) results.lab = matchLabs.map((l) => ({ ...l, entityType: 'lab', href: '/registry' }));
    const matchCapas = D.CAPAS.filter((c) => c.title.toLowerCase().includes(q) || c.capaCode.toLowerCase().includes(q));
    if (matchCapas.length) results.capa = matchCapas.map((c) => ({ ...c, entityType: 'capa', href: '/capa' }));
    const matchCerts = D.CERTIFICATIONS_LIST.filter((c) => c.name.toLowerCase().includes(q) || c.certCode.toLowerCase().includes(q));
    if (matchCerts.length) results.certification = matchCerts.map((c) => ({ ...c, entityType: 'certification', href: '/certifications' }));
    const matchSops = D.SOPS.filter((s) => s.title.toLowerCase().includes(q) || s.sopCode.toLowerCase().includes(q));
    if (matchSops.length) results.sop = matchSops.map((s) => ({ ...s, entityType: 'sop', href: '/sop' }));
    const total = Object.values(results).reduce((s, a) => s + a.length, 0);
    return resolve({ results, total });
  }

  // ── Fallback (POST/PUT/DELETE mutations) ──────────────────────
  return resolve({ ok: true, message: 'Static mock — mutation simulated' });
}

// ── Mock axios-compatible API object ────────────────────────────
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const api: any = {
  get:    (url: string, config?: { params?: Params }) => route('GET', url, config?.params),
  post:   (url: string, body?: unknown)               => route('POST', url, {}, body),
  put:    (url: string, body?: unknown)                => route('PUT', url, {}, body),
  delete: (url: string)                                => route('DELETE', url),
  interceptors: {
    request:  { use: () => {} },
    response: { use: () => {} },
  },
};

export { api };
export default api;
