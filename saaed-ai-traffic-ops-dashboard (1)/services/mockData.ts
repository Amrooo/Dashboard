import { KPIStats, ChannelMetric, ChartDataPoint, Incident, ReportStatus, CallCenterStats, ComplaintCategory } from '../types';

export const getKpis = (timeframe: string): KPIStats => {
  const multipliers: Record<string, number> = { 
    'Today': 0.15, 
    'Week': 0.8, 
    'Month': 1.2,
    'Year': 12.0
  };
  const m = multipliers[timeframe] || 1;
  return {
    totalReports: Math.floor(1452 * m),
    aiHandledRate: Math.min(100, 64.5 + (Math.random() * 5)),
    opsHandledRate: Math.max(0, 21.2 - (Math.random() * 2)),
    patrolHandledRate: 14.3,
    avgClosureTime: Math.max(5, 12.5 - (Math.random() * 2)),
    slaCompliance: Math.min(100, 92.8 + (Math.random() * 1)),
    digitalAdoption: 78.5,
    voiceAdoption: 21.5,
    avgDispatchTime: Math.max(1, 2.8 - (Math.random() * 0.5)),
    avgArrivalTime: Math.max(5, 9.4 - (Math.random() * 1)),
    avgRoadClearanceTime: Math.max(10, 14.8 - (Math.random() * 1)),
    patrolSlaCompliance: Math.min(100, 94.2 + (Math.random() * 1)),
    intentAccuracy: Math.min(100, 97.4 + (Math.random() * 0.5)),
    avgAiHandlingTime: Math.max(0.5, 3.2 - (Math.random() * 0.2)),
    aiEscalationRate: Math.max(5, 12.4 - (Math.random() * 1)),
    automationByIntent: [
      { intent: 'Report minor accident', rate: 88.5 },
      { intent: 'Check status', rate: 94.2 },
      { intent: 'Modify report', rate: 76.8 },
      { intent: 'Payment query', rate: 91.0 },
    ]
  };
};

export const getCallCenterKpis = (timeframe: string): CallCenterStats => {
  return {
    totalCalls: Math.floor(Math.random() * 5000 + 1000),
    aiResolvedRate: 72.4,
    avgHoldTime: 45,
    csatScore: 4.7,
    firstCallResolution: 88.2,
    complaintsTotal: 450,
    complaintsFixedByAi: 310,
    complaintsFixedByHuman: 140
  };
};

export const getComplaintCategories = (): ComplaintCategory[] => [
  { name: 'Delayed Patrol', count: 145, aiSuccessRate: 65, color: '#ef4444' },
  { name: 'App Technical Issue', count: 98, aiSuccessRate: 92, color: '#3b82f6' },
  { name: 'Fine Dispute', count: 112, aiSuccessRate: 48, color: '#f59e0b' },
  { name: 'Information Request', count: 205, aiSuccessRate: 98, color: '#10b981' },
];

export const getMockIncidents = (): Incident[] => {
  const types: Incident['type'][] = ['Minor', 'Major', 'Hazard', 'Obstruction'];
  const statuses = [ReportStatus.NEW, ReportStatus.IN_PROGRESS_AI, ReportStatus.IN_PROGRESS_OPS, ReportStatus.PATROL_ASSIGNED];
  const locations = ['Sheikh Zayed Rd', 'Al Khail Rd', 'D3 District', 'Downtown', 'Business Bay', 'Jumeirah', 'Dubai Marina', 'Al Qudra'];
  
  return Array.from({ length: 12 }).map((_, i) => ({
    id: `INC-${1000 + i}`,
    type: types[Math.floor(Math.random() * types.length)],
    status: statuses[Math.floor(Math.random() * statuses.length)],
    x: 10 + Math.random() * 80,
    y: 10 + Math.random() * 80,
    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    locationName: locations[Math.floor(Math.random() * locations.length)],
  }));
};

export const getChannelMatrix = (timeframe: string): ChannelMetric[] => {
  const multipliers: Record<string, number> = { 
    'Today': 0.1, 
    'Week': 0.7, 
    'Month': 1.1, 
    'Year': 10.0
  };
  const m = multipliers[timeframe] || 1;
  return [
    { channel: 'App / Web', created: Math.floor(580 * m), percentage: 40, avgSubmitTime: 2.5, avgFinalTime: 8.2, dropOffRate: 4.2, csat: 4.8 },
    { channel: 'WhatsApp AI', created: Math.floor(558 * m), percentage: 38.5, avgSubmitTime: 1.8, avgFinalTime: 6.5, dropOffRate: 2.1, csat: 4.6 },
    { channel: 'Phone (800)', created: Math.floor(312 * m), percentage: 21.5, avgSubmitTime: 4.5, avgFinalTime: 15.2, dropOffRate: 8.5, csat: 4.2 },
    { channel: 'Patrol On-site', created: Math.floor(208 * m), percentage: 14.3, avgSubmitTime: 12.0, avgFinalTime: 22.0, dropOffRate: 0.5, csat: 4.9 },
    { channel: 'Other', created: Math.floor(2 * m), percentage: 0.2, avgSubmitTime: 15.0, avgFinalTime: 45.0, dropOffRate: 12.0, csat: 3.5 },
  ];
};

export const getTrendData = (timeframe: string): ChartDataPoint[] => {
  const generateRate = (base: number) => Math.min(95, Math.max(50, base + (Math.random() * 10 - 5)));
  
  const weekData = [
    { date: 'Mon', total: 120, ai: 80, ops: 25, patrol: 15, aiRate: generateRate(66), sla: 92, closureTime: 14.2, digital: 75, voice: 25, calls: 450, resolutions: 310 },
    { date: 'Tue', total: 145, ai: 95, ops: 30, patrol: 20, aiRate: generateRate(65), sla: 90, closureTime: 13.8, digital: 78, voice: 22, calls: 480, resolutions: 340 },
    { date: 'Wed', total: 132, ai: 88, ops: 28, patrol: 16, aiRate: generateRate(67), sla: 94, closureTime: 12.5, digital: 76, voice: 24, calls: 420, resolutions: 290 },
    { date: 'Thu', total: 160, ai: 110, ops: 32, patrol: 18, aiRate: generateRate(69), sla: 91, closureTime: 15.1, digital: 80, voice: 20, calls: 510, resolutions: 380 },
    { date: 'Fri', total: 175, ai: 125, ops: 35, patrol: 15, aiRate: generateRate(71), sla: 89, closureTime: 16.2, digital: 82, voice: 18, calls: 550, resolutions: 410 },
    { date: 'Sat', total: 155, ai: 105, ops: 28, patrol: 22, aiRate: generateRate(68), sla: 95, closureTime: 11.4, digital: 74, voice: 26, calls: 490, resolutions: 350 },
    { date: 'Sun', total: 165, ai: 115, ops: 30, patrol: 20, aiRate: generateRate(70), sla: 93, closureTime: 12.0, digital: 79, voice: 21, calls: 520, resolutions: 390 },
  ];

  const yearData = [
    { date: 'Jan', total: 2400, ai: 1600, ops: 500, patrol: 300, aiRate: generateRate(66), sla: 88, closureTime: 18.2, digital: 68, voice: 32 },
    { date: 'Feb', total: 2100, ai: 1450, ops: 420, patrol: 230, aiRate: generateRate(69), sla: 89, closureTime: 17.5, digital: 70, voice: 30 },
    { date: 'Mar', total: 2800, ai: 1900, ops: 550, patrol: 350, aiRate: generateRate(68), sla: 90, closureTime: 16.8, digital: 72, voice: 28 },
    { date: 'Apr', total: 2500, ai: 1700, ops: 480, patrol: 320, aiRate: generateRate(68), sla: 91, closureTime: 16.0, digital: 74, voice: 26 },
    { date: 'May', total: 3100, ai: 2200, ops: 600, patrol: 300, aiRate: generateRate(71), sla: 92, closureTime: 15.5, digital: 75, voice: 25 },
    { date: 'Jun', total: 2900, ai: 2000, ops: 550, patrol: 350, aiRate: generateRate(69), sla: 92, closureTime: 15.2, digital: 76, voice: 24 },
    { date: 'Jul', total: 3400, ai: 2400, ops: 650, patrol: 350, aiRate: generateRate(70), sla: 93, closureTime: 14.8, digital: 78, voice: 22 },
    { date: 'Aug', total: 3200, ai: 2250, ops: 600, patrol: 350, aiRate: generateRate(70), sla: 93, closureTime: 14.5, digital: 79, voice: 21 },
    { date: 'Sep', total: 3000, ai: 2100, ops: 580, patrol: 320, aiRate: generateRate(70), sla: 94, closureTime: 14.0, digital: 80, voice: 20 },
    { date: 'Oct', total: 3600, ai: 2600, ops: 700, patrol: 300, aiRate: generateRate(72), sla: 94, closureTime: 13.8, digital: 81, voice: 19 },
    { date: 'Nov', total: 3800, ai: 2800, ops: 700, patrol: 300, aiRate: generateRate(73), sla: 95, closureTime: 13.5, digital: 83, voice: 17 },
    { date: 'Dec', total: 4200, ai: 3100, ops: 800, patrol: 300, aiRate: generateRate(74), sla: 95, closureTime: 13.2, digital: 85, voice: 15 },
  ];

  if (timeframe === 'Today') return weekData.slice(-2).map(d => ({ ...d, date: d.date === 'Sun' ? '12:00' : '06:00' }));
  if (timeframe === 'Year') return yearData;
  if (timeframe === 'Month') return yearData.slice(-4);
  return weekData;
};

export const getStatusDistribution = () => [
  { name: 'New', value: 85, color: '#3b82f6' },
  { name: 'AI Processing', value: 120, color: '#06b6d4' },
  { name: 'Ops Handling', value: 45, color: '#a855f7' },
  { name: 'Patrol En Route', value: 32, color: '#f59e0b' },
  { name: 'Closed', value: 1170, color: '#10b981' },
];