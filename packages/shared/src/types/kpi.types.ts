export type KpiDirection = 'up' | 'down'
export type KpiStatus = 'success' | 'warning' | 'danger' | 'neutral'
export type KpiPeriodicity = 'monthly' | 'quarterly' | 'annual'
export type IndicatorClass = 'UTILIZATION' | 'PERFORMANCE' | 'PRODUCTIVITY'
export type PeriodType = 'monthly' | 'quarterly' | 'annual'
export type ReportFormat = 'pdf'

export interface KpiCategoryInfo {
  code: string
  name: string
  color: string
  displayOrder: number
}

export interface KpiDefinitionInfo {
  id: number
  code: string
  name: string
  category: KpiCategoryInfo
  indicatorClass: IndicatorClass
  description: string
  objective: string
  formula: string
  unit: string
  direction: KpiDirection
  targetValue: number | null
  minValue: number | null
  maxValue: number | null
  periodicity: string
}

export interface KpiValueData {
  period: string
  month: string
  value: number | null
  target: number | null
  previous: number | null
  status: string | null
  variancePercentage: number | null
  code: string
  name: string
  unit: string | null
  chartType: string
  category: string
}

export interface KpiSnapshot {
  code: string
  name: string
  formula: string
  unit: string | null
  chartType: string
  category: KpiCategoryInfo
  periodDate: string
  value: number | null
  target: number | null
  previous: number | null
  status: string | null
  variancePercentage: number | null
  direction: string | null
}

export interface KpiCategoryGroup {
  category: KpiCategoryInfo
  items: KpiSnapshot[]
}

export interface ReportData {
  companyId: string
  companyName: string
  companyLogo: string
  generatedBy: string
  generatedAt: string
  periodType: PeriodType
  year: number
  month?: number
  quarter?: number
  categories: KpiCategoryGroup[]
  summary: ReportSummary
}

export interface ReportSummary {
  totalKpis: number
  onTarget: number
  warning: number
  critical: number
  averageCompliance: number
}

export interface ComparativeData {
  year: number
  previousYear: number
  monthlyComparison: Array<{
    month: string
    currentYear: number
    previousYear: number
  }>
  annualComparison: Array<{
    code: string
    name: string
    currentYearValue: number
    previousYearValue: number
    variance: number
  }>
}

export interface ReportRequest {
  companyId: string
  periodType: PeriodType
  year: number
  month?: number
  quarter?: number
  format?: ReportFormat
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
