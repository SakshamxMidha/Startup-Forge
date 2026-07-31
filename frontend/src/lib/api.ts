import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import type {
  TokenPair, SignupResponse, VerifyEmailResponse, MessageResponse,
  User, UsageSummary,
  CreateStartupResponse, StartupListResponse, StartupDetailResponse,
  BusinessPlanResponse, MarketResearchResponse, SchemaDesignResponse,
  PitchDeckResponse, IngestResponse, MentorChatResponse, MentorHistoryResponse,
} from '@/types/api';

// In dev, Vite proxies /api → http://localhost:4000 (see vite.config.ts).
// In production, set VITE_API_URL to the deployed backend origin.
const BASE_URL = import.meta.env.VITE_API_URL || '/api';

const ACCESS_KEY = 'sf_access_token';
const REFRESH_KEY = 'sf_refresh_token';

export const tokenStore = {
  getAccess: () => localStorage.getItem(ACCESS_KEY),
  getRefresh: () => localStorage.getItem(REFRESH_KEY),
  set: ({ accessToken, refreshToken }: TokenPair) => {
    localStorage.setItem(ACCESS_KEY, accessToken);
    localStorage.setItem(REFRESH_KEY, refreshToken);
  },
  clear: () => {
    localStorage.removeItem(ACCESS_KEY);
    localStorage.removeItem(REFRESH_KEY);
  },
};

export const api = axios.create({ baseURL: BASE_URL });

// Attach access token to every request
api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = tokenStore.getAccess();
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ─── Automatic token refresh on 401 ─────────────────────────────────
// Single-flight: if multiple requests 401 at once, only one refresh
// call fires; the rest queue behind the same promise.
let refreshPromise: Promise<string | null> | null = null;

async function refreshTokens(): Promise<string | null> {
  const refreshToken = tokenStore.getRefresh();
  if (!refreshToken) return null;
  try {
    // Use a bare axios call (not `api`) so this doesn't loop through interceptors
    const { data } = await axios.post<TokenPair>(`${BASE_URL}/auth/refresh`, { refreshToken });
    tokenStore.set(data);
    return data.accessToken;
  } catch {
    tokenStore.clear();
    return null;
  }
}

api.interceptors.response.use(
  (res) => res,
  async (error: AxiosError) => {
    const original = error.config as InternalAxiosRequestConfig & { _retried?: boolean };
    const isAuthRoute = original?.url?.startsWith('/auth/');

    if (error.response?.status === 401 && !original._retried && !isAuthRoute) {
      original._retried = true;
      refreshPromise = refreshPromise ?? refreshTokens();
      const newAccess = await refreshPromise;
      refreshPromise = null;

      if (newAccess) {
        original.headers.Authorization = `Bearer ${newAccess}`;
        return api(original);
      }
      // Refresh failed → force logout state; AuthContext listens for this
      window.dispatchEvent(new CustomEvent('sf:session-expired'));
    }
    return Promise.reject(error);
  }
);

export function isNotFound(err: unknown): boolean {
  return axios.isAxiosError(err) && err.response?.status === 404;
}

export function extractError(err: unknown): string {
  if (axios.isAxiosError(err)) {
    const data = err.response?.data as { error?: string } | undefined;
    if (data?.error) return data.error;
    if (err.code === 'ERR_NETWORK') return 'Cannot reach the server. Is the backend running?';
  }
  return 'Something went wrong. Please try again.';
}

// ─── Endpoint wrappers ──────────────────────────────────────────────
export const authApi = {
  signup: (email: string, password: string) =>
    api.post<SignupResponse>('/auth/signup', { email, password }).then(r => r.data),
  verifyEmail: (email: string, code: string) =>
    api.post<VerifyEmailResponse>('/auth/verify-email', { email, code }).then(r => r.data),
  login: (email: string, password: string) =>
    api.post<TokenPair>('/auth/login', { email, password }).then(r => r.data),
  forgotPassword: (email: string) =>
    api.post<MessageResponse>('/auth/forgot-password', { email }).then(r => r.data),
  resetPassword: (email: string, code: string, newPassword: string) =>
    api.post<MessageResponse>('/auth/reset-password', { email, code, newPassword }).then(r => r.data),
};

export const userApi = {
  me: () => api.get<{ user: User }>('/me').then(r => r.data.user),
  usage: () => api.get<UsageSummary>('/usage').then(r => r.data),
};

export const startupsApi = {
  create: (rawIdea: string) =>
    api.post<CreateStartupResponse>('/startups', { rawIdea }).then(r => r.data),
  list: () =>
    api.get<StartupListResponse>('/startups').then(r => r.data.startups),
  get: (id: string) =>
    api.get<StartupDetailResponse>(`/startups/${id}`).then(r => r.data.startup),
  generateBusinessPlan: (id: string) =>
    api.post<BusinessPlanResponse>(`/startups/${id}/business-plan`).then(r => r.data.businessPlan),
  generateMarketResearch: (id: string) =>
    api.post<MarketResearchResponse>(`/startups/${id}/market-research`).then(r => r.data),
  generateSchemaDesign: (id: string) =>
    api.post<SchemaDesignResponse>(`/startups/${id}/schema-design`).then(r => r.data),
  generatePitchDeck: (id: string) =>
    api.post<PitchDeckResponse>(`/startups/${id}/pitch-deck`).then(r => r.data.pitchDeck),
  getBusinessPlan: (id: string) =>
    api.get<BusinessPlanResponse>(`/startups/${id}/business-plan`).then(r => r.data.businessPlan),
  getMarketResearch: (id: string) =>
    api.get<MarketResearchResponse>(`/startups/${id}/market-research`).then(r => r.data),
  getSchema: (id: string) =>
    api.get<SchemaDesignResponse>(`/startups/${id}/schema-design`).then(r => r.data),
  getPitchDeck: (id: string) =>
    api.get<PitchDeckResponse>(`/startups/${id}/pitch-deck`).then(r => r.data.pitchDeck),
  ingestKnowledge: (id: string) =>
    api.post<IngestResponse>(`/startups/${id}/ingest-knowledge`).then(r => r.data),
  mentorChat: (id: string, message: string) =>
    api.post<MentorChatResponse>(`/startups/${id}/mentor/chat`, { message }).then(r => r.data),
  mentorHistory: (id: string) =>
    api.get<MentorHistoryResponse>(`/startups/${id}/mentor/history`).then(r => r.data.messages),
};
