export type FieldRow = {
  name: string
  type: string
  required?: string
  description: string
}

export type ResultRow = {
  label: string
  value: string
  tone?: 'blue' | 'green' | 'orange' | 'purple'
}

export type GraphNode = {
  id: string
  label: string
  type: string
  x: number
  y: number
}

export type GraphEdge = {
  source: string
  target: string
  label: string
}

export type PrototypeModule = {
  key: string
  path: string
  title: string
  subtitle: string
  endpoint: string
  method: 'POST' | 'GET'
  moduleRequirement: string
  requestFields: FieldRow[]
  responseFields: FieldRow[]
  requestExample: Record<string, unknown>
  responseExample: Record<string, unknown>
  resultRows: ResultRow[]
  graphNodes: GraphNode[]
  graphEdges: GraphEdge[]
  evidence: string[]
}

const commonGraph = (center = '张明远', target = '李佳宁'): { nodes: GraphNode[]; edges: GraphEdge[] } => ({
  nodes: [
    { id: 'n1', label: center, type: '专家', x: 48, y: 54 },
    { id: 'n2', label: target, type: '专家', x: 450, y: 54 },
    { id: 'n3', label: '知识图谱实验室', type: '机构/团队', x: 248, y: 212 },
    { id: 'n4', label: '论文成果', type: '成果', x: 78, y: 360 },
    { id: 'n5', label: '产业事件', type: '事件', x: 462, y: 360 },
  ],
  edges: [
    { source: 'n1', target: 'n2', label: '推理关系' },
    { source: 'n1', target: 'n3', label: '关联' },
    { source: 'n2', target: 'n3', label: '关联' },
    { source: 'n3', target: 'n4', label: '产出' },
    { source: 'n3', target: 'n5', label: '影响' },
  ],
})

const colleagueGraph = commonGraph('张三', '李四')

export const modules: PrototypeModule[] = [
  {
    key: 'expert-direct',
    path: '/expert-direct',
    title: '科技专家/人才直接关系',
    subtitle: '识别专家之间的直接关联类型、时间、场景和成果。',
    endpoint: '/api/v1/kg-construction/expert-direct',
    method: 'POST',
    moduleRequirement:
      '通过专家直接交互数据和知识图谱实体属性，识别并构建专家之间的直接关联，记录关系类型、发生时间、场景和相关成果。',
    requestFields: [
      { name: 'source_expert_id', type: 'string', required: '是', description: '第一个专家唯一标识' },
      { name: 'target_expert_id', type: 'string', required: '否', description: '第二个专家唯一标识，不传时查询直接关系网络' },
      { name: 'relation_scene', type: 'string', required: '否', description: '交互场景筛选条件' },
      { name: 'start_time', type: 'string', required: '否', description: '查询起始时间' },
      { name: 'end_time', type: 'string', required: '否', description: '查询结束时间' },
    ],
    responseFields: [
      { name: 'expert', type: 'object', description: '核心专家信息' },
      { name: 'direct_relations', type: 'array', description: '直接关系列表' },
      { name: 'relation_type', type: 'string', description: '直接关系类型' },
      { name: 'relation_time', type: 'string', description: '关系发生时间' },
      { name: 'related_outputs', type: 'array', description: '相关成果' },
    ],
    requestExample: { source_expert_id: 'E10001', target_expert_id: 'E10002', relation_scene: '科研合作', start_time: '2020-01', end_time: '2024-12' },
    responseExample: {
      code: 0,
      data: {
        expert: { expert_id: 'E10001', expert_name: '张明远' },
        direct_relations: [{ target_expert_name: '李佳宁', relation_type: '论文合作', relation_scene: '共同发表论文', relation_time: '2022-06' }],
      },
    },
    resultRows: [
      { label: '直接关系', value: '12', tone: 'blue' },
      { label: '关系类型', value: '4', tone: 'green' },
      { label: '关联成果', value: '18', tone: 'orange' },
      { label: '最高置信度', value: '0.94', tone: 'purple' },
    ],
    graphNodes: commonGraph().nodes,
    graphEdges: commonGraph().edges,
    evidence: ['共同发表论文 4 篇', '共同参与项目 2 项', '同机构科研协作记录'],
  },
  {
    key: 'node-indirect',
    path: '/node-indirect',
    title: '科技单节点间接关系',
    subtitle: '从直接关系和多跳路径中推理潜在关联。',
    endpoint: '/api/v1/indirect-relation/infer',
    method: 'POST',
    moduleRequirement:
      '以单个科技专家或人才作为核心节点，挖掘知识图谱中与该节点存在间接关联的其他节点，输出传递路径、关系类型和关联强度。',
    requestFields: [
      { name: 'corenode_id', type: 'string', required: '是', description: '核心专家或人才节点 ID' },
      { name: 'relation_types', type: 'array', required: '否', description: '需要推理的间接关系类型' },
      { name: 'path_depth', type: 'number', required: '否', description: '路径分析深度，默认 2' },
      { name: 'minstrength', type: 'number', required: '否', description: '最小关联强度阈值' },
    ],
    responseFields: [
      { name: 'expert', type: 'object', description: '核心专家基础信息' },
      { name: 'direct_relations', type: 'array', description: '核心节点直接关联节点' },
      { name: 'indirect_relations', type: 'array', description: '间接关联节点列表' },
      { name: 'path_analysis', type: 'array', description: '关系传递路径分析' },
      { name: 'relation_type_tags', type: 'array', description: '关系类型标注' },
    ],
    requestExample: { corenode_id: 'E10001', relation_types: ['学术关联', '项目关联', '机构关联'], path_depth: 2, minstrength: 0.6 },
    responseExample: {
      code: 0,
      data: {
        expert: { expert_id: 'E10001', expert_name: '张明远' },
        indirect_relations: [{ node_name: '专家C', path_text: '张明远 → 李佳宁 → 专家C', strength: 0.89 }],
      },
    },
    resultRows: [
      { label: '间接节点', value: '36', tone: 'blue' },
      { label: '路径数量', value: '58', tone: 'green' },
      { label: '关系类型', value: '4', tone: 'orange' },
      { label: '平均强度', value: '0.76', tone: 'purple' },
    ],
    graphNodes: commonGraph().nodes,
    graphEdges: [
      { source: 'n1', target: 'n2', label: '直接关系' },
      { source: 'n2', target: 'n5', label: '间接路径' },
      { source: 'n1', target: 'n3', label: '机构关联' },
      { source: 'n3', target: 'n5', label: '传递' },
    ],
    evidence: ['路径：张明远 → 李佳宁 → 专家C', '路径深度：2', '关系类型：学术关联、机构关联'],
  },
  {
    key: 'two-point-achievement',
    path: '/two-point-achievement',
    title: '科技两点合作成果',
    subtitle: '汇总两个专家之间的论文、项目、专利和奖项成果。',
    endpoint: '/api/v1/two-expert-cooperation-achievements/demo/structured-result',
    method: 'POST',
    moduleRequirement:
      '针对两个科技专家或人才节点，整合合作数据，提取并汇总两者的合作成果、时间、领域、评价和合作模式。',
    requestFields: [
      { name: 'source_expert_id', type: 'string', required: '是', description: '第一个专家 ID' },
      { name: 'target_expert_id', type: 'string', required: '是', description: '第二个专家 ID' },
      { name: 'achievement_types', type: 'array', required: '否', description: '成果类型筛选' },
      { name: 'start_time', type: 'string', required: '否', description: '开始时间' },
      { name: 'end_time', type: 'string', required: '否', description: '结束时间' },
    ],
    responseFields: [
      { name: 'source_expert', type: 'object', description: '第一个专家信息' },
      { name: 'target_expert', type: 'object', description: '第二个专家信息' },
      { name: 'achievement_summary', type: 'object', description: '成果分类统计' },
      { name: 'achievements', type: 'array', description: '合作成果明细' },
      { name: 'cooperation_mode', type: 'string', description: '合作模式分析' },
    ],
    requestExample: { source_expert_id: 'E10001', target_expert_id: 'E10002', achievement_types: ['论文', '项目', '专利'], start_time: '2019-01', end_time: '2024-12' },
    responseExample: { code: 0, data: { achievement_summary: { papers: 6, projects: 2, patents: 1 }, cooperation_mode: '长期稳定合作' } },
    resultRows: [
      { label: '论文', value: '6', tone: 'blue' },
      { label: '项目', value: '2', tone: 'green' },
      { label: '专利', value: '1', tone: 'orange' },
      { label: '合作深度', value: '高', tone: 'purple' },
    ],
    graphNodes: commonGraph().nodes,
    graphEdges: commonGraph().edges,
    evidence: ['合作论文 6 篇', '共同项目 2 项', '共同专利 1 件'],
  },
  {
    key: 'expert-colleague',
    path: '/expert-colleague',
    title: '科技专家同事关系',
    subtitle: '根据工作经历、机构架构和任职时间推理同事关系。',
    endpoint: '/api/expert-colleague-relation/list',
    method: 'POST',
    moduleRequirement:
      '提取专家在不同时期的工作单位、所属部门、参与团队等机构信息，结合机构架构与人员任职数据，推理专家之间的同事关系。',
    requestFields: [
      { name: 'expert_id', type: 'string', required: '是', description: '科技专家唯一标识' },
      { name: 'start_time', type: 'string', required: '否', description: '查询起始时间' },
      { name: 'end_time', type: 'string', required: '否', description: '查询结束时间' },
      { name: 'organization', type: 'string', required: '否', description: '工作单位筛选条件' },
    ],
    responseFields: [
      { name: 'expert', type: 'object', description: '当前查询的科技专家信息' },
      { name: 'work_history', type: 'array', description: '专家工作单位、部门、团队和任职时间' },
      { name: 'organization_structure', type: 'array', description: '与同事关系相关的机构架构信息' },
      { name: 'colleague_relations', type: 'array', description: '同事关系列表' },
      { name: 'total', type: 'number', description: '同事关系数量' },
    ],
    requestExample: { expert_id: 'E10001', start_time: '2018-01', end_time: '2024-12', organization: '清华大学' },
    responseExample: {
      code: 0,
      data: {
        expert: { expert_id: 'E10001', expert_name: '张三' },
        colleague_relations: [{ colleague_expert: { expert_id: 'E10002', expert_name: '李四' }, organization: '清华大学', effective_start_time: '2019-01', effective_end_time: '2023-12' }],
        total: 18,
      },
    },
    resultRows: [
      { label: '同事关系', value: '18', tone: 'blue' },
      { label: '共同机构', value: '3', tone: 'green' },
      { label: '合作成果', value: '12', tone: 'orange' },
      { label: '最高置信度', value: '0.92', tone: 'purple' },
    ],
    graphNodes: colleagueGraph.nodes,
    graphEdges: colleagueGraph.edges,
    evidence: ['任职时间重叠：2019-01 至 2023-12', '共同机构：清华大学计算机科学与技术系', '同事期间合作论文 1 篇'],
  },
  {
    key: 'expert-alumni',
    path: '/expert-alumni',
    title: '科技专家校友关系',
    subtitle: '基于教育经历识别院校、院系、导师和同届关联。',
    endpoint: '/api/v1/kg-construction/expert-alumni-relations/judge',
    method: 'POST',
    moduleRequirement:
      '基于科技专家教育背景数据和院校信息，识别并构建专家之间的校友关系，记录关联维度和后续交流合作。',
    requestFields: [
      { name: 'expert_id', type: 'string', required: '是', description: '专家唯一标识' },
      { name: 'school', type: 'string', required: '否', description: '院校筛选条件' },
      { name: 'education_stage', type: 'string', required: '否', description: '教育阶段筛选' },
      { name: 'start_year', type: 'number', required: '否', description: '开始年份' },
      { name: 'end_year', type: 'number', required: '否', description: '结束年份' },
    ],
    responseFields: [
      { name: 'expert', type: 'object', description: '核心专家信息' },
      { name: 'education_history', type: 'array', description: '教育背景列表' },
      { name: 'alumni_relations', type: 'array', description: '校友关系列表' },
      { name: 'relation_dimensions', type: 'array', description: '校友关系维度' },
      { name: 'follow_up_interactions', type: 'array', description: '后续学术交流或合作互动' },
    ],
    requestExample: { expert_id: 'E10001', school: '北京大学', education_stage: '博士', start_year: 2008, end_year: 2014 },
    responseExample: { code: 0, data: { alumni_relations: [{ target_name: '王青', dimension: '同校同院系' }] } },
    resultRows: [
      { label: '校友关系', value: '24', tone: 'blue' },
      { label: '关联院校', value: '4', tone: 'green' },
      { label: '合作互动', value: '9', tone: 'orange' },
      { label: '关系维度', value: '5', tone: 'purple' },
    ],
    graphNodes: commonGraph('张明远', '王青').nodes,
    graphEdges: commonGraph('张明远', '王青').edges,
    evidence: ['同校：北京大学', '同院系：信息科学技术学院', '后续合作论文 2 篇'],
  },
  {
    key: 'paper-cooperation',
    path: '/paper-cooperation',
    title: '科技专家论文合作关系',
    subtitle: '基于论文作者列表和合作频次构建学术合作网络。',
    endpoint: '/api/v1/scholar-paper-cooperation/demo/structured-result',
    method: 'POST',
    moduleRequirement:
      '分析专家发表论文数据，提取作者列表、作者单位、发表时间、论文主题，构建论文合作关系并统计合作频次和影响力。',
    requestFields: [
      { name: 'expert_id', type: 'string', required: '是', description: '核心专家 ID' },
      { name: 'coauthor_id', type: 'string', required: '否', description: '合作专家 ID' },
      { name: 'paper_topic', type: 'string', required: '否', description: '论文主题筛选' },
      { name: 'start_year', type: 'number', required: '否', description: '开始年份' },
      { name: 'end_year', type: 'number', required: '否', description: '结束年份' },
    ],
    responseFields: [
      { name: 'expert', type: 'object', description: '核心专家信息' },
      { name: 'coauthors', type: 'array', description: '合作作者列表' },
      { name: 'papers', type: 'array', description: '合作论文列表' },
      { name: 'citation_summary', type: 'object', description: '被引统计' },
      { name: 'stable_teams', type: 'array', description: '长期合作团队' },
    ],
    requestExample: { expert_id: 'E10001', paper_topic: '知识图谱', start_year: 2018, end_year: 2024 },
    responseExample: { code: 0, data: { coauthors: [{ name: '李佳宁', paper_count: 8 }], citation_summary: { total: 326 } } },
    resultRows: [
      { label: '合作论文', value: '42', tone: 'blue' },
      { label: '合作作者', value: '16', tone: 'green' },
      { label: '总被引', value: '326', tone: 'orange' },
      { label: '稳定团队', value: '3', tone: 'purple' },
    ],
    graphNodes: commonGraph().nodes,
    graphEdges: commonGraph().edges,
    evidence: ['共同作者列表', '论文发表时间', '期刊会议级别与被引统计'],
  },
  {
    key: 'enterprise-relation',
    path: '/enterprise-relation',
    title: '重点关注科技企业关系',
    subtitle: '查询专家与重点科技企业的关系和企业背景。',
    endpoint: '/api/v1/expert-enterprise-relations/query',
    method: 'POST',
    moduleRequirement:
      '围绕科技专家或人才，查询其与重点关注科技企业之间的任职、顾问、合作、技术转化、专利合作等关系，并支撑企业背景分析展示。',
    requestFields: [
      { name: 'expertId', type: 'string', required: '是', description: '专家唯一标识' },
      { name: 'relationTypes', type: 'array', required: '否', description: '关系类型筛选：employment、advisor、cooperation、tech_transfer、patent_cooperation 等' },
      { name: 'startTime', type: 'string', required: '否', description: '开始时间' },
      { name: 'endTime', type: 'string', required: '否', description: '结束时间' },
      { name: 'limit', type: 'number', required: '否', description: '返回企业数量上限' },
      { name: 'includeEnterpriseProfile', type: 'boolean', required: '否', description: '是否返回企业背景摘要' },
    ],
    responseFields: [
      { name: 'expertName', type: 'string', description: '专家姓名' },
      { name: 'relations', type: 'array', description: '专家关联的重点科技企业列表' },
      { name: 'relations[].relationLabel', type: 'string', description: '关系类型' },
      { name: 'relations[].roleLabel', type: 'string', description: '专家角色' },
      { name: 'relations[].cooperationField', type: 'string', description: '合作领域' },
      { name: 'relations[].enterpriseProfile', type: 'object', description: '企业行业地位、技术方向和经营状况' },
    ],
    requestExample: { expertId: 'COOP-SCH001', relationTypes: ['employment', 'advisor', 'cooperation'], startTime: '2021-01-01', endTime: '2024-12-31', limit: 20, includeEnterpriseProfile: true },
    responseExample: { code: 200, data: { expertName: '陈建国', relations: [{ enterpriseName: '企业001有限公司', relationLabel: '任职', roleLabel: '首席科学家', cooperationField: '人工智能', cooperationMode: '联合研发' }, { enterpriseName: '启明数据技术有限公司', relationLabel: '合作', roleLabel: '项目负责人', cooperationField: '知识图谱', cooperationMode: '项目合作' }] } },
    resultRows: [
      { label: '关联企业', value: '8', tone: 'blue' },
      { label: '合作领域', value: '5', tone: 'green' },
      { label: '成果转化', value: '6', tone: 'orange' },
      { label: '重点企业', value: '3', tone: 'purple' },
    ],
    graphNodes: commonGraph('张明远', '深算科技').nodes,
    graphEdges: commonGraph('张明远', '深算科技').edges,
    evidence: ['第一接口返回企业列表后，可复用 expertId 与 enterpriseId 查询关系详情', '第二接口选定 enterpriseId 后，可继续进入企业背景分析', '关系类型与合作模式在查询和详情接口中保持一致'],
  },
  {
    key: 'industry-chain-event',
    path: '/industry-chain-event',
    title: '科技产业链点事件关系',
    subtitle: '筛选产业链节点影响力最高的核心事件。',
    endpoint: '/api/v1/industry-chain/topn-events/screen',
    method: 'POST',
    moduleRequirement:
      '针对产业链特定环节或节点，筛选影响力排名前 N 的核心事件，并构建事件与专家、企业和产业链节点的关联。',
    requestFields: [
      { name: 'industryChainName', type: 'string', required: '是', description: '产业链中文名称' },
      { name: 'industryChainSegment', type: 'string', required: '是', description: '产业链环节或节点' },
      { name: 'eventTypes', type: 'string', required: '否', description: '事件类型中文单选' },
      { name: 'topN', type: 'number', required: '是', description: '返回影响力排名前 N 的事件' },
      { name: 'startTime', type: 'string', required: '否', description: '筛选开始时间' },
      { name: 'endTime', type: 'string', required: '否', description: '筛选结束时间' },
    ],
    responseFields: [
      { name: 'industryChainName', type: 'string', description: '当前分析的产业链中文名称' },
      { name: 'industryChainSegment', type: 'string', description: '当前分析的产业链环节/节点' },
      { name: 'industryChainNodeCode', type: 'string', description: '内部追踪代码' },
      { name: 'total', type: 'number', description: '符合条件的事件总数' },
      { name: 'topN', type: 'number', description: '返回数量限制' },
      { name: 'events', type: 'array', description: '高影响力事件列表' },
      { name: 'events[].impactScore', type: 'number', description: '事件影响力评分' },
      { name: 'events[].relatedExpertName', type: 'string', description: '关联专家/人才姓名' },
    ],
    requestExample: { industryChainName: '集成电路产业链', industryChainSegment: '上游原材料', eventTypes: '专利突破', topN: 10, startTime: '2020-01-01', endTime: '2024-12-31' },
    responseExample: { code: 200, success: true, data: { industryChainName: '集成电路产业链', industryChainSegment: '上游原材料', industryChainNodeCode: 'IC_UPSTREAM_MATERIAL', total: 10, topN: 10, events: [{ eventTitle: '高性能半导体材料制备关键技术专利', eventTime: '2024年6月15日', impactScore: 91, relatedExpertName: '陈建国' }] }, msg: 'success' },
    resultRows: [
      { label: '重点事件', value: '10', tone: 'blue' },
      { label: '关联专家', value: '23', tone: 'green' },
      { label: '关联企业', value: '18', tone: 'orange' },
      { label: '最高影响', value: '0.91', tone: 'purple' },
    ],
    graphNodes: commonGraph('AI芯片节点', '国产算力芯片发布').nodes,
    graphEdges: commonGraph('AI芯片节点', '国产算力芯片发布').edges,
    evidence: ['产业链资讯数据', '事件影响力评分', '专家与企业关联记录'],
  },
  {
    key: 'industry-chain-panorama',
    path: '/industry-chain-panorama',
    title: '科技产业链全景图',
    subtitle: '展示产业链环节、关键技术、重点企业和核心专家。',
    endpoint: '/api/industry-chain/panorama/infer',
    method: 'POST',
    moduleRequirement:
      '整合产业链各环节实体、关系和事件数据，构建覆盖全产业链的结构化全景图，支持层级展开、关系筛选和动态更新。',
    requestFields: [
      { name: 'chain_code', type: 'string', required: '是', description: '产业链代码，用于唯一定位要查询的产业链' },
      { name: 'level', type: 'number', required: '否', description: '产业链节点展开层级' },
      { name: 'relation_type', type: 'string', required: '否', description: '关系类型筛选条件，默认返回全部关系' },
      { name: 'limit', type: 'number', required: '否', description: '返回结果数量限制' },
    ],
    responseFields: [
      { name: 'chain_info', type: 'object', description: '产业链基本信息' },
      { name: 'nodes', type: 'array', description: '产业链图谱节点列表' },
      { name: 'relations', type: 'array', description: '图谱关系列表' },
      { name: 'data_flows', type: 'array', description: '数据流向信息' },
      { name: 'technologies', type: 'array', description: '关键技术列表' },
      { name: 'enterprises', type: 'array', description: '重点企业列表' },
      { name: 'experts', type: 'array', description: '核心专家列表' },
      { name: 'events', type: 'array', description: '产业动态事件列表' },
      { name: 'update_info', type: 'object', description: '动态更新信息' },
      { name: 'statistics', type: 'object', description: '返回结果统计信息' },
    ],
    requestExample: { chain_code: 'AI_CHAIN', level: 3, relation_type: 'all', limit: 100 },
    responseExample: { code: 0, data: { chain_info: { chain_code: 'AI_CHAIN', chain_name: '人工智能产业链' }, nodes: [], relations: [], data_flows: [], update_info: { is_updated: true }, statistics: {} } },
    resultRows: [
      { label: '产业节点', value: '46', tone: 'blue' },
      { label: '重点企业', value: '128', tone: 'green' },
      { label: '核心专家', value: '72', tone: 'orange' },
      { label: '关键技术', value: '35', tone: 'purple' },
    ],
    graphNodes: commonGraph('人工智能芯片产业链', '重点企业群').nodes,
    graphEdges: commonGraph('人工智能芯片产业链', '重点企业群').edges,
    evidence: ['产业链节点数据', '企业与专利关联', '核心专家与技术方向关联'],
  },
]

export function getModuleByKey(key: string): PrototypeModule {
  return modules.find((item) => item.key === key) ?? modules[0]
}
