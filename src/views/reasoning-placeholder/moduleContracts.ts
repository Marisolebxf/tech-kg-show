export type ContractField = {
  field: string
  type: string
  required?: string
  description: string
}

export type ModuleContract = {
  featureName: string
  endpoint: string
  method: 'POST' | 'GET'
  requirement: string
  requestParams: ContractField[]
  responseFields: ContractField[]
  requestExample: Record<string, unknown>
  responseExample: Record<string, unknown>
  structuredRows: Array<{ label: string; value: string }>
}

const pending = (title: string): ModuleContract => ({
  featureName: `${title}接口待补充`,
  endpoint: '待接口文档补充',
  method: 'POST',
  requirement: '当前模块已有模块要求，但接口路径、请求参数、返回字段和返回示例尚未在接口文档中明确。',
  requestParams: [{ field: '待补充', type: '待补充', required: '待定', description: '等待模块负责人补充接口文档' }],
  responseFields: [{ field: '待补充', type: '待补充', description: '等待模块负责人补充接口文档' }],
  requestExample: { status: 'pending_interface_document' },
  responseExample: { status: 'pending_interface_document' },
  structuredRows: [
    { label: '模块名称', value: title },
    { label: '接口状态', value: '待补充' },
    { label: '展示状态', value: '仅保留原型框架' },
  ],
})

export const moduleContracts: Record<string, ModuleContract> = {
  'expert-direct': {
    featureName: '科技专家直接关系查询接口',
    endpoint: '/api/v1/kg-construction/expert-direct',
    method: 'POST',
    requirement:
      '通过专家直接交互数据和知识图谱实体属性，识别专家之间的直接关联，记录关系类型、发生时间、协作场景和相关成果。',
    requestParams: [
      { field: 'expert_id', type: 'string', required: '是', description: '核心科技专家唯一标识' },
      { field: 'start_time', type: 'string', required: '否', description: '查询开始时间，格式 YYYY-MM' },
      { field: 'end_time', type: 'string', required: '否', description: '查询结束时间，格式 YYYY-MM' },
      { field: 'organization', type: 'string', required: '否', description: '工作单位或机构关键词' },
    ],
    responseFields: [
      { field: 'code', type: 'number', description: '业务状态码' },
      { field: 'data.expert', type: 'object', description: '核心专家信息' },
      { field: 'data.direct_relations', type: 'array', description: '直接关系结果列表' },
      { field: 'data.graph', type: 'object', description: '图谱节点和边' },
      { field: 'message', type: 'string', description: '返回消息' },
    ],
    requestExample: { expert_id: 'E10001', start_time: '2018-01', end_time: '2024-12', organization: '清华大学' },
    responseExample: {
      code: 0,
      data: {
        expert: { expert_id: 'E10001', expert_name: '李佳宁', title: '研究员' },
        direct_relations: [
          { target_expert_name: '张明远', relation_type: '共论文', relation_scene: '共同发表论文', relation_time: '2018-2024', strength: 0.99 },
          { target_expert_name: '周欣怡', relation_type: '项目协作', relation_scene: '智能决策联合实验室', relation_time: '2021-2024', strength: 0.87 },
        ],
        graph: { node_count: 5, edge_count: 5 },
      },
      message: 'success',
    },
    structuredRows: [
      { label: '专家 A', value: '李佳宁' },
      { label: '专家 B', value: '张明远 / 周欣怡' },
      { label: '关系类型', value: '共论文 / 项目协作' },
      { label: '共同机构/场景', value: '中国科学院自动化研究所 / 智能决策联合实验室' },
      { label: '合作论文数', value: '918 / 32' },
      { label: '关系强度', value: '0.99 / 0.87' },
    ],
  },
  'two-point-achievement': {
    featureName: '科技两点合作成果结构化结果接口',
    endpoint: '/api/v1/two-expert-cooperation-achievements/demo/structured-result',
    method: 'POST',
    requirement:
      '输入两个科技专家及筛选条件，返回两位专家之间合作成果的结构化结果，覆盖合作时间、领域、成果类型分布、代表成果、成果级别、核心贡献和合作模式。',
    requestParams: [
      { field: 'dataSource', type: 'string', required: '是', description: '数据来源范围' },
      { field: 'expertAId', type: 'string', required: '是', description: '专家 A 唯一标识，不能与 expertBId 相同' },
      { field: 'expertBId', type: 'string', required: '是', description: '专家 B 唯一标识，不能与 expertAId 相同' },
      { field: 'achievementTypes', type: 'array', required: '否', description: '成果类型，默认 paper/project/patent' },
      { field: 'startTime', type: 'string', required: '否', description: '查询开始时间，格式 YYYY-MM-DD' },
      { field: 'endTime', type: 'string', required: '否', description: '查询结束时间，格式 YYYY-MM-DD' },
    ],
    responseFields: [
      { field: 'code', type: 'number', description: '业务状态码' },
      { field: 'data.structuredResult', type: 'object', description: '结构化合作成果结果' },
      { field: 'data.structuredResult.achievementTypeDistribution', type: 'object', description: '成果类型分布' },
      { field: 'data.structuredResult.representativeAchievements', type: 'array', description: '代表合作成果' },
      { field: 'message', type: 'string', description: '返回消息' },
    ],
    requestExample: { dataSource: 'knowledge_graph', expertAId: 'EXPERT-001', expertBId: 'EXPERT-002', achievementTypes: ['paper', 'project', 'patent'], startTime: '2020-01-01', endTime: '2025-12-31' },
    responseExample: {
      code: 0,
      data: {
        structuredResult: {
          expertList: ['陈建国', '刘芳'],
          expertUnits: ['清华大学', '北京大学'],
          cooperationTimeRange: { displayText: '2020 - 2025' },
          cooperationFields: ['知识图谱', '智能计算', '图神经网络', '科技情报'],
          achievementCount: 17,
          achievementTypeDistribution: { paper: 10, project: 4, patent: 3, displayText: '共同论文10 / 关联项目4 / 关联专利3' },
          representativeAchievements: [{ title: '面向科技知识图谱的关系推理方法研究', type: 'paper', level: 'JCR-Q1论文' }],
          cooperationPattern: '长期稳定型科研合作',
        },
      },
      message: 'success',
    },
    structuredRows: [
      { label: '专家列表', value: '陈建国、刘芳' },
      { label: '专家单位', value: '清华大学、北京大学' },
      { label: '合作时间', value: '2020 - 2025' },
      { label: '合作领域', value: '知识图谱、智能计算、图神经网络、科技情报' },
      { label: '成果总数', value: '17' },
      { label: '合作模式', value: '长期稳定型科研合作' },
    ],
  },
  'industry-chain-panorama': {
    featureName: '产业链全景查询接口',
    endpoint: '/api/industry-chain/panorama/infer',
    method: 'POST',
    requirement:
      '整合产业链各环节实体、关系、事件等数据，构建覆盖全产业链的结构化全景图，展示核心节点、关联关系、关键技术、重点企业与核心专家。',
    requestParams: [
      { field: 'chain_code', type: 'string', required: '是', description: '产业链代码' },
      { field: 'chain_name', type: 'string', required: '是', description: '产业链名称' },
      { field: 'node_name', type: 'string', required: '否', description: '节点名称关键词' },
      { field: 'level', type: 'number', required: '否', description: '节点层级' },
      { field: 'include_enterprise', type: 'boolean', required: '否', description: '是否返回关联企业' },
      { field: 'include_patent', type: 'boolean', required: '否', description: '是否返回关联专利' },
    ],
    responseFields: [
      { field: 'code', type: 'number', description: '业务状态码' },
      { field: 'data.chain', type: 'object', description: '产业链基础信息' },
      { field: 'data.nodes', type: 'array', description: '产业链节点列表' },
      { field: 'data.relations', type: 'array', description: '上下游关系' },
      { field: 'data.statistics', type: 'object', description: '统计汇总' },
      { field: 'message', type: 'string', description: '返回消息' },
    ],
    requestExample: { chain_code: 'AI', chain_name: '人工智能', node_name: '大模型', level: 2, include_enterprise: true, include_patent: true },
    responseExample: {
      code: 0,
      data: {
        chain: { chain_code: 'AI', chain_name: '人工智能', chain_path: '人工智能 / 算法 / 大模型' },
        nodes: [{ node_name: '上游基础资源' }, { node_name: '中游核心技术' }, { node_name: '下游应用场景' }],
        relations: [{ relation_type: '上下游', relation_strength: 95 }],
        statistics: { node_count: 8, relation_count: 12, enterprise_count: 3, patent_count: 8 },
      },
      message: 'success',
    },
    structuredRows: [
      { label: '产业链', value: '人工智能' },
      { label: '当前节点', value: '中游核心技术' },
      { label: '上游关联', value: '数据资源 / 算力芯片' },
      { label: '核心技术', value: '知识图谱 / 机器学习 / 大模型' },
      { label: '下游应用', value: '智能制造 / 智慧医疗 / 自动驾驶' },
      { label: '统计汇总', value: '节点8 / 关系12 / 企业3 / 专利8' },
    ],
  },
  'node-indirect': {
    featureName: '科技单节点间接关系推理接口',
    endpoint: '/api/v1/indirect-relation/infer',
    method: 'POST',
    requirement:
      '输入一个科技专家或人才作为核心节点，返回间接关联节点、关系传递路径、关系类型标注以及关联强度。',
    requestParams: [
      { field: 'corenode_id', type: 'string', required: '是', description: '核心专家或人才节点 ID' },
      { field: 'relation_types', type: 'array', required: '否', description: '需要推理的关系类型，未传默认全部支持类型' },
      { field: 'path_depth', type: 'number', required: '否', description: '路径分析深度，默认分析 2 层关系路径' },
      { field: 'minstrength', type: 'number', required: '否', description: '最小关联强度阈值，未传使用系统默认值' },
    ],
    responseFields: [
      { field: 'expert', type: 'object', description: '核心专家基础信息' },
      { field: 'direct_relations', type: 'array', description: '核心专家的直接关联节点列表' },
      { field: 'indirect_relations', type: 'array', description: '通过中间节点推理得到的间接关联节点列表' },
      { field: 'path_analysis', type: 'array', description: '关系传递路径分析结果' },
      { field: 'relation_type_tags', type: 'array', description: '间接关系类型标注' },
    ],
    requestExample: {
      corenode_id: 'E10001',
      relation_types: ['学术关联', '项目关联', '专利关联', '机构关联'],
      path_depth: 2,
      minstrength: 0.6,
    },
    responseExample: {
      code: 0,
      message: 'success',
      data: {
        expert: { expert_id: 'E10001', expert_name: '张明远', expert_title: '研究员' },
        direct_relations: [{ node_id: 'E10002', node_name: '李佳宁', node_type: '专家', relation_name: '合作学者' }],
        indirect_relations: [{ node_id: 'E10003', node_name: '专家C', relation_type: '学术关联', path_text: '张明远 → 李佳宁 → 专家C', strength: 0.89 }],
      },
    },
    structuredRows: [
      { label: '核心专家', value: '张明远' },
      { label: '直接关联节点', value: '李佳宁' },
      { label: '间接关联节点', value: '专家C' },
      { label: '关系类型', value: '学术关联' },
      { label: '关联强度', value: '0.89' },
      { label: '传递路径', value: '张明远 → 李佳宁 → 专家C' },
    ],
  },
  'expert-alumni': {
    featureName: '校友关系判定接口',
    endpoint: '/api/v1/kg-construction/expert-alumni-relations/judge',
    method: 'POST',
    requirement:
      '判定两位专家是否存在校友关系，并返回关系子类型、关联维度、合作论文证据、置信度与判定理由。',
    requestParams: [
      { field: 'expertA', type: 'object', required: '是', description: '专家 A 引用，支持 scholarId 或 name' },
      { field: 'expertB', type: 'object', required: '是', description: '专家 B 引用，支持 scholarId 或 name' },
      { field: 'forceRefresh', type: 'bool', required: '否', description: '是否强制刷新缓存，默认 false' },
      { field: 'includeRawEducation', type: 'bool', required: '否', description: '是否回填原始中文教育背景文本' },
    ],
    responseFields: [
      { field: 'resolvedExperts', type: 'object', description: '双方专家身份解析结果' },
      { field: 'isAlumni', type: 'bool', description: '是否判定为校友' },
      { field: 'relationSubtype', type: 'string|null', description: '同专业校友 / 同院系校友 / 同期校友 / 同校校友' },
      { field: 'dimensions', type: 'object', description: '共同院校、院系、专业、就读时段、入学年份差' },
      { field: 'cooperation', type: 'object', description: '合作论文证据' },
      { field: 'reason', type: 'string', description: '判定理由' },
    ],
    requestExample: { expertA: { scholarId: '007Rb117' }, expertB: { scholarId: '016086V1' } },
    responseExample: {
      code: 200,
      success: true,
      message: 'success',
      data: {
        isAlumni: true,
        relationSubtype: '同专业校友',
        dimensions: { sharedSchool: { schoolNameZh: '清华大学' }, sharedCollege: '计算机科学与技术学院', sharedMajor: '人工智能' },
        cooperation: { coPaperCount: 3, evidenceCount: 1 },
      },
    },
    structuredRows: [
      { label: '专家 A', value: '吴边' },
      { label: '专家 B', value: '张垚' },
      { label: '是否校友', value: '是' },
      { label: '关系子类型', value: '同专业校友' },
      { label: '共同院校', value: '清华大学' },
    ],
  },
  'paper-cooperation': {
    featureName: '科技专家论文合作关系结构化结果接口',
    endpoint: '/api/v1/scholar-paper-cooperation/demo/structured-result',
    method: 'POST',
    requirement:
      '根据输入的两个科技专家及查询条件，返回两人论文合作关系的结构化结果，支撑算法测试页面结果详情区展示。',
    requestParams: [
      { field: 'dataSource', type: 'string', required: '是', description: '论文数据来源范围' },
      { field: 'expertAId', type: 'string', required: '是', description: '专家 A 唯一标识，不能与 expertBId 相同' },
      { field: 'expertBId', type: 'string', required: '是', description: '专家 B 唯一标识，不能与 expertAId 相同' },
      { field: 'startTime', type: 'string', required: '否', description: '查询开始时间，格式 YYYY-MM-DD' },
      { field: 'endTime', type: 'string', required: '否', description: '查询结束时间，格式 YYYY-MM-DD' },
    ],
    responseFields: [
      { field: 'authorList', type: 'array', description: '两位科技专家作者姓名' },
      { field: 'authorUnits', type: 'array', description: '作者单位信息' },
      { field: 'cooperationTimeRange', type: 'object', description: '合作发表论文的时间范围' },
      { field: 'paperTopics', type: 'array', description: '合作论文主题、研究方向或关键词' },
      { field: 'cooperationPaperCount', type: 'number', description: '合作论文数量' },
      { field: 'journalLevelCount', type: 'object', description: '不同期刊级别下的数量统计' },
      { field: 'citation', type: 'object', description: '总被引次数与最高被引次数' },
      { field: 'stableTeamName', type: 'string', description: '长期稳定合作团队名称' },
    ],
    requestExample: {
      dataSource: 'knowledge_graph',
      expertAId: 'COOP-SCH001',
      expertBId: 'COOP-SCH002',
      startTime: '2021-01-01',
      endTime: '2024-12-31',
    },
    responseExample: {
      structuredResult: {
        authorList: ['陈建国', '刘芳'],
        authorUnits: ['清华大学', '北京大学'],
        cooperationTimeRange: { startYear: 2021, endYear: 2024, displayText: '2021 - 2024' },
        paperTopics: ['知识图谱', '学术图谱', '合作网络', '社区发现'],
        cooperationPaperCount: 4,
        citation: { total: 225, max: 88 },
        stableTeamName: '清北学术图谱长期合作团队',
      },
    },
    structuredRows: [
      { label: '作者列表', value: '陈建国、刘芳' },
      { label: '作者单位', value: '清华大学、北京大学' },
      { label: '合作时间', value: '2021 - 2024' },
      { label: '合作论文数', value: '4' },
      { label: '总被引次数', value: '225' },
      { label: '稳定团队', value: '清北学术图谱长期合作团队' },
    ],
  },
  'enterprise-relation': {
    featureName: '专家-企业关系构建接口',
    endpoint: '/api/v1/kg-construction/expert-enterprise-relations/build',
    method: 'POST',
    requirement:
      '输入一个科技专家与一家重点关注科技企业及关系类型，在知识图谱中构建/合并专家企业关系边，并返回该专家当前企业关系列表。',
    requestParams: [
      { field: 'scholarId', type: 'string', required: '是', description: '科技专家唯一标识' },
      { field: 'enterpriseId', type: 'string', required: '是', description: '重点科技企业唯一标识' },
      { field: 'relationTypes', type: 'array', required: '是', description: '关系类型，如 employment、advisor' },
    ],
    responseFields: [
      { field: 'status', type: 'string', description: '构建状态' },
      { field: 'scholarId', type: 'string', description: '专家 ID' },
      { field: 'scholarName', type: 'string', description: '专家姓名' },
      { field: 'builtRelationId', type: 'string', description: '本次构建的关系 ID' },
      { field: 'relationType', type: 'string', description: '关系类型中文标签' },
      { field: 'effective', type: 'bool', description: '关系是否有效' },
      { field: 'relations', type: 'array', description: '该专家当前全部重点科技企业关系列表' },
    ],
    requestExample: { scholarId: 'COOP-SCH001', enterpriseId: 'ENT001', relationTypes: ['employment', 'advisor'] },
    responseExample: {
      code: 200,
      success: true,
      data: {
        status: 'success',
        scholarId: 'COOP-SCH001',
        scholarName: '陈建国',
        builtRelationId: 'COOP-SCH001->ENT001@0',
        relationType: '任职/顾问',
        effective: true,
      },
      message: 'success',
    },
    structuredRows: [
      { label: '专家', value: '陈建国' },
      { label: '企业', value: '企业001有限公司' },
      { label: '关系类型', value: '任职/顾问' },
      { label: '关系状态', value: '有效' },
      { label: '关系 ID', value: 'COOP-SCH001->ENT001@0' },
    ],
  },
  'industry-chain-event': {
    featureName: '高影响力事件筛选接口',
    endpoint: '/api/v1/industry-chain/topn-events/screen',
    method: 'POST',
    requirement:
      '按产业链节点、事件类型，通过多因子评估模型筛选 TOP-N 高影响力科技事件，为产业链事件看板提供核心数据源。',
    requestParams: [
      { field: 'industryChainNode', type: 'string', required: '是', description: '产业链节点名称' },
      { field: 'eventTypes', type: 'array', required: '否', description: '事件类型，如 patent、paper、fund' },
      { field: 'topN', type: 'number', required: '否', description: '返回事件数量' },
      { field: 'evaluationModel', type: 'string', required: '否', description: '事件影响力评估模型' },
      { field: 'startTime', type: 'string', required: '否', description: '开始时间，格式 YYYY-MM-DD' },
      { field: 'endTime', type: 'string', required: '否', description: '结束时间，格式 YYYY-MM-DD' },
    ],
    responseFields: [
      { field: 'industryChainNode', type: 'string', description: '产业链节点' },
      { field: 'evaluationModel', type: 'string', description: '评估模型' },
      { field: 'total', type: 'number', description: '满足条件事件总数' },
      { field: 'events', type: 'array', description: 'TOP-N 事件列表' },
      { field: 'impactFactors', type: 'object', description: '事件影响力多因子评分明细' },
      { field: 'relatedExperts', type: 'array', description: '相关专家及角色' },
    ],
    requestExample: {
      industryChainNode: '上游原材料',
      eventTypes: ['patent', 'paper', 'fund'],
      topN: 10,
      evaluationModel: 'multi_factor',
      startTime: '2020-01-01',
      endTime: '2024-12-31',
    },
    responseExample: {
      code: 200,
      success: true,
      data: {
        industryChainNode: '上游原材料',
        evaluationModel: 'multi_factor',
        total: 42,
        events: [{ eventId: 'P001', eventType: 'patent', title: 'CN2024XXXXXXA', eventTime: '2024-06-15', score: 92.5, rank: 1 }],
      },
      message: 'success',
    },
    structuredRows: [
      { label: '产业链节点', value: '上游原材料' },
      { label: '评估模型', value: 'multi_factor' },
      { label: '事件总数', value: '42' },
      { label: 'TOP1 事件', value: 'CN2024XXXXXXA' },
      { label: '事件评分', value: '92.5' },
      { label: '关联专家', value: '陈建国' },
    ],
  },
}

export function getModuleContract(name: string): ModuleContract {
  return moduleContracts[name] ?? pending('知识推理模块')
}
