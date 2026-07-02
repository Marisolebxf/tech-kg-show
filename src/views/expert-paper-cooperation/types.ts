export interface ExpertPaperCooperationDemoRequest {
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
}

export interface ExpertPaperCooperationStructuredResultOnlyResponse {
  structuredResult: StructuredResultPayload
}
