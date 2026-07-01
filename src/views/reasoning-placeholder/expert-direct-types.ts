export interface DirectRelationQueryRequest {
  expert_id: string
  start_time: string
  end_time: string
  organization: string
}

export interface DirectRelationExpert {
  expertId: string
  name: string
  organization?: string | null
  title: string
  paperCount: number
  citationCount: number
  hIndex: number
}

export interface DirectRelationItem {
  key: string
  relationType: string
  expertA: DirectRelationExpert
  expertB: DirectRelationExpert
  institution?: string | null
  coPaperCount: number
  relationStrength: number
  reasonTags: string[]
  relationSummary: string
  collaborationScene: string
  cooperationTime: string
  cooperationOutcome: string
  relationStart: string
  relationEnd: string
  lastUpdatedAt?: string | null
  detailRows: [string, unknown][]
}

export interface DirectRelationGraphNode {
  id: string
  type: string
  label: string
  subtitle?: string | null
  data: Record<string, unknown>
}

export interface DirectRelationGraphEdge {
  source: string
  target: string
  label: string
  data: Record<string, unknown>
}

export interface DirectRelationQueryResponse {
  expert_direct_relation: {
    expert_id: string
    expert_name: string
    title: string
    organization: string
    relation_count: number
  }
  items: DirectRelationItem[]
  expert: Array<{
    expert_id: string
    expert_name: string
    title: string
    organization: string
    department: string
    team_or_project: string
    start_time: string
    end_time: string
  }>
  graph: {
    nodes: DirectRelationGraphNode[]
    edges: DirectRelationGraphEdge[]
  }
  detailRows: [string, unknown][][]
}

export interface DocField {
  name: string
  type: string
  required?: string
  description: string
}
