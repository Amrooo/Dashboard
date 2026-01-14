export enum ReportStatus {
  NEW = 'New',
  IN_PROGRESS_AI = 'In progress (AI)',
  IN_PROGRESS_OPS = 'In progress (Ops)',
  PATROL_ASSIGNED = 'Patrol En Route',
  CLOSED = 'Closed',
  ON_HOLD = 'On Hold'
}

export interface IntentPerformance {
  intent: string;
  rate: number;
}

export interface KPIStats {
  totalReports: number;
  aiHandledRate: number;
  opsHandledRate: number;
  patrolHandledRate: number;
  avgClosureTime: number;
  slaCompliance: number;
  digitalAdoption: number;
  voiceAdoption: number;
  // Field Patrol Specifics
  avgDispatchTime: number;
  avgArrivalTime: number;
  avgRoadClearanceTime: number;
  patrolSlaCompliance: number;
  // AI Agent Specifics
  intentAccuracy: number;
  avgAiHandlingTime: number;
  aiEscalationRate: number;
  automationByIntent: IntentPerformance[];
}

export interface CallCenterStats {
  totalCalls: number;
  aiResolvedRate: number;
  avgHoldTime: number;
  csatScore: number;
  firstCallResolution: number;
  complaintsTotal: number;
  complaintsFixedByAi: number;
  complaintsFixedByHuman: number;
}

export interface ComplaintCategory {
  name: string;
  count: number;
  aiSuccessRate: number;
  color: string;
}

export interface ChannelMetric {
  channel: string;
  created: number;
  percentage: number;
  avgSubmitTime: number;
  avgFinalTime: number;
  dropOffRate: number;
  csat: number;
}

export interface ChartDataPoint {
  date: string;
  total: number;
  ai: number;
  ops: number;
  patrol: number;
  aiRate: number;
  sla: number;
  closureTime: number;
  digital: number;
  voice: number;
  calls?: number;
  resolutions?: number;
}

export interface Incident {
  id: string;
  type: 'Minor' | 'Major' | 'Hazard' | 'Obstruction';
  status: ReportStatus;
  x: number; 
  y: number; 
  timestamp: string;
  locationName: string;
}

export interface CustomChartConfig {
  id: string;
  title: string;
  metric: keyof Omit<ChartDataPoint, 'date'>;
  type: 'line' | 'bar' | 'area' | 'pie' | 'funnel' | 'table';
  color: string;
  timeframe: string;
  dateRange: 'Today' | 'Week' | 'Month' | 'Year';
  smooth?: boolean;
  showGrid?: boolean;
  showLegend?: boolean;
  strokeWidth?: number;
  showXAxis?: boolean;
  showYAxis?: boolean;
  xAxisLabel?: string;
  yAxisLabel?: string;
  showDataLabels?: boolean;
  showDataTable?: boolean;
  showTrendline?: boolean;
  markerSize?: number;
}