
export enum StepStatus {
  IDLE = 'IDLE',
  RUNNING = 'RUNNING',
  SUCCESS = 'SUCCESS',
  FAILED = 'FAILED',
  WARNING = 'WARNING'
}

export interface PipelineStep {
  id: string;
  name: string;
  description: string;
  status: StepStatus;
  logs: string[];
}

export interface SecurityFinding {
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  description: string;
  recommendation: string;
}

export interface ScanResult {
  score: number;
  findings: SecurityFinding[];
  summary: string;
  performanceInsights: string[];
}
