export type KpiDirection = 'up' | 'down'
export type KpiStatus = 'success' | 'warning' | 'danger' | 'neutral'
export type PeriodType = 'monthly' | 'quarterly' | 'annual'

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
  indicatorClass: string
  description: string
  objective: string
  formula: string
  unit: string
  direction: KpiDirection
  targetValue: number | null
  minValue: number | null
  maxValue: number | null
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
