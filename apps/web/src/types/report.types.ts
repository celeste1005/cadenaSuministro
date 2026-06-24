export type PeriodType = 'monthly' | 'quarterly' | 'annual'
export type ReportFormat = 'pdf'

export interface ReportRequest {
  periodType: PeriodType
  year: number
  month?: number
  quarter?: number
  format?: ReportFormat
}

export interface ReportResponse {
  id: string
  name: string
  description: string | null
  type: string
  status: string
  fileUrl: string
  fileSizeBytes: number | null
  generatedAt: string
  createdAt: string
}

export interface ScheduledReportInfo {
  id: string
  name: string
  description: string | null
  scheduleCron: string
  nextExecution: string
  lastGeneratedAt: string | null
  isActive: boolean
}

export interface ReportSummary {
  totalKpis: number
  onTarget: number
  warning: number
  critical: number
  averageCompliance: number
}

export interface ReportHistoryItem {
  id: string
  name: string
  date: string
  format: ReportFormat
  status: string
  size: number | null
}
