// ─── Auth ────────────────────────────────────────────────────────────
export interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

export interface SignupResponse {
  message: string;
  userId: string;
}

export interface VerifyEmailResponse extends TokenPair {
  message: string;
}

export interface MessageResponse {
  message: string;
}

// ─── User ────────────────────────────────────────────────────────────
export interface User {
  id: string;
  email: string;
  createdAt: string;
}

export interface UsageLogEntry {
  id: string;
  userId: string;
  endpoint: string;
  promptTokens: number;
  outputTokens: number;
  totalTokens: number;
  createdAt: string;
}

export interface UsageSummary {
  totalRequests: number;
  totalTokens: number;
  byEndpoint: Record<string, { requests: number; tokens: number }>;
  recentLogs: UsageLogEntry[];
}

// ─── Startup & modules ───────────────────────────────────────────────
export interface Analysis {
  id: string;
  startupId: string;
  marketScore: number;
  difficultyScore: number;
  revenueScore: number;
  competitionLevel: 'Low' | 'Medium' | 'High';
  timeToBuildWeeks: number;
  recommendation: string;
  reasoning: string;
}

export interface ModuleProgress {
  analysis: boolean;
  businessPlan: boolean;
  marketResearch: boolean;
  schemaDesign: boolean;
  pitchDeck: boolean;
}

export interface StartupListItem {
  id: string;
  rawIdea: string;
  createdAt: string;
  updatedAt: string;
  analysis: Analysis | null;
  progress: ModuleProgress;
}

export interface Startup {
  id: string;
  userId: string;
  rawIdea: string;
  createdAt: string;
  updatedAt: string;
  analysis: Analysis | null;
}

export interface PainPoint {
  id: string;
  personaId: string;
  text: string;
}

export interface Persona {
  id: string;
  businessPlanId: string;
  name: string;
  ageRange: string;
  behavior: string;
  painPoints: PainPoint[];
}

export type SwotCategory = 'STRENGTH' | 'WEAKNESS' | 'OPPORTUNITY' | 'THREAT';

export interface SwotItem {
  id: string;
  businessPlanId: string;
  category: SwotCategory;
  text: string;
}

export interface RevenueStream {
  id: string;
  businessPlanId: string;
  name: string;
  pricing: string;
}

export interface BusinessPlan {
  id: string;
  startupId: string;
  mission: string;
  vision: string;
  usp: string;
  targetAudience: string;
  businessModel: string;
  growthStrategy: string[];
  persona: Persona | null;
  swotItems: SwotItem[];
  revenueStreams: RevenueStream[];
}

export interface MarketKeyword {
  id: string;
  marketReportId: string;
  keyword: string;
}

export interface HnSignal {
  id: string;
  marketReportId: string;
  title: string;
  points: number;
  url: string;
}

export interface MarketReport {
  id: string;
  startupId: string;
  trendDirection: 'rising' | 'flat' | 'declining';
  summary: string;
  cachedAt: string;
  keywords: MarketKeyword[];
  hnSignals: HnSignal[];
}

export interface SchemaEntityField {
  name: string;
  type: string;
}

export interface SchemaEntity {
  name: string;
  fields: SchemaEntityField[];
}

export interface SchemaRelation {
  from: string;
  to: string;
  type: 'one-to-one' | 'one-to-many' | 'many-to-many';
}

export interface SchemaDesign {
  id: string;
  startupId: string;
  entitiesJson: SchemaEntity[];
  relationsJson: SchemaRelation[];
  generatedAt: string;
}

export interface PitchDeck {
  id: string;
  startupId: string;
  pdfUrl: string;
  generatedAt: string;
}

export interface MentorMessage {
  id: string;
  startupId: string;
  role: 'user' | 'assistant';
  content: string;
  createdAt: string;
}

export interface RetrievedChunk {
  source: string;
  content: string;
  distance: number;
}

// ─── Response envelopes (matching backend exactly) ───────────────────
export interface CreateStartupResponse {
  startup: Startup;
  analysis: Analysis;
}

export interface StartupListResponse {
  startups: StartupListItem[];
}

export interface StartupDetailResponse {
  startup: Startup;
}

export interface BusinessPlanResponse {
  businessPlan: BusinessPlan;
}

export interface MarketResearchResponse {
  marketReport: MarketReport;
  cached: boolean;
}

export interface SchemaDesignResponse {
  schemaDesign: SchemaDesign;
  mermaidDiagram: string;
}

export interface PitchDeckResponse {
  pitchDeck: PitchDeck;
}

export interface IngestResponse {
  success: boolean;
  chunksCreated: number;
}

export interface MentorChatResponse {
  message: MentorMessage;
  usedChunks: RetrievedChunk[];
}

export interface MentorHistoryResponse {
  messages: MentorMessage[];
}

export interface ApiError {
  error: string;
}
