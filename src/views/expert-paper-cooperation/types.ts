export type DataSource = 'all' | 'mysql' | 'knowledge_graph'

export interface ExpertPaperCooperationDemoRequest {
  dataSource: DataSource
  expertAId: string
  expertBId: string
  startTime: string
  endTime: string
}

export interface StructuredResultPayload {
  authorList: string[]
  authorUnits: string[]
  paperTopics: string[]
  researchDirections: string[]
  cooperationPaperCount: number
  journalLevelCount: Record<string, number>
  conferenceLevelCount: Record<string, number>
  cooperationFrequency: number
  academicImpactScore: number
  citation: { total: number; max: number }
  cooperationTimeRange: { startTime: string; endTime: string; displayText: string }
  stableTeamMembers?: string[]
  coreTeamMembers?: string[]
  sharedContribution?: string[]
  dataSource?: DataSource
}

export interface ExpertPaperCooperationStructuredResultOnlyResponse {
  structuredResult: StructuredResultPayload
}
