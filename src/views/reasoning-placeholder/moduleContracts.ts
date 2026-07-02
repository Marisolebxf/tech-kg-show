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
    requestExample: { expertAId: 'EXPERT-001', expertBId: 'EXPERT-002', achievementTypes: ['paper', 'project', 'patent'], startTime: '2020-01-01', endTime: '2025-12-31' },
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
      '以产业链名称作为查询入口，支持按照产业链节点层级和中文关系类型进行筛选，返回指定产业链的全景图数据，覆盖核心节点、关联关系、数据流向、关键技术、重点企业、核心专家及产业动态事件。',
    requestParams: [
      { field: 'chain_name', type: 'string', required: '是', description: '产业链名称，用中文选择，如人工智能产业链' },
      { field: 'level', type: 'number', required: '否', description: '产业链节点展开层级，默认值按接口约定' },
      { field: 'relation_type', type: 'string', required: '否', description: '关系类型筛选条件，默认“全部”返回全部关系' },
      { field: 'limit', type: 'number', required: '否', description: '返回结果数量限制，默认值按接口约定' },
    ],
    responseFields: [
      { field: 'code', type: 'number', description: '业务状态码' },
      { field: 'data.chain_info', type: 'object', description: '产业链基本信息，包括产业链名称、描述、更新时间等' },
      { field: 'data.nodes', type: 'array', description: '产业链图谱节点列表，包括产业环节、核心节点、关键技术、重点企业、核心专家、产业事件等' },
      { field: 'data.relations', type: 'array', description: '图谱关系列表，包括上下游关系、数据流向关系、技术支撑关系、企业布局关系、专家支撑关系、事件关联关系等' },
      { field: 'data.data_flows', type: 'array', description: '产业链各环节之间的数据流向信息' },
      { field: 'data.technologies', type: 'array', description: '各产业链节点关联的关键技术信息' },
      { field: 'data.enterprises', type: 'array', description: '各产业链节点关联的重点企业信息' },
      { field: 'data.experts', type: 'array', description: '各产业链节点或关键技术关联的核心专家信息' },
      { field: 'data.events', type: 'array', description: '产业链相关动态事件信息' },
      { field: 'data.update_info', type: 'object', description: '数据版本、更新时间、更新状态等动态更新信息' },
      { field: 'data.statistics', type: 'object', description: '返回结果统计信息，包括节点数、关系数、企业数、专家数、事件数等' },
      { field: 'message', type: 'string', description: '返回消息' },
    ],
    requestExample: { chain_name: '人工智能产业链', level: 3, relation_type: '全部', limit: 100 },
    responseExample: {
      code: 0,
      data: {
        chain_info: { chain_name: '人工智能产业链', description: '围绕人工智能核心技术、基础设施、平台服务和应用场景形成的产业链结构', update_time: '2026-07-02 10:30:00' },
        nodes: [{ node_id: 'AI_CHAIN', node_name: '人工智能产业链', node_type: '产业链', level: 0 }],
        relations: [{ relation_id: 'R001', source_node_id: 'ai-up', target_node_id: 'ai-core', relation_type: 'upstream_downstream', relation_name: '上下游关系' }],
        data_flows: [{ source_node_id: 'ai-up', target_node_id: 'ai-core', flow_name: '上下游关系', flow_description: '上游基础资源向中游核心技术提供算力和数据资源' }],
        technologies: [],
        enterprises: [],
        experts: [],
        events: [],
        update_info: { data_version: 'v20260702', last_update_time: '2026-07-02 10:30:00', is_updated: true },
        statistics: { node_count: 36, relation_count: 52, technology_count: 8, enterprise_count: 12, expert_count: 6, event_count: 5 },
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
    featureName: '专家-重点科技企业关系查询接口',
    endpoint: '/api/v1/expert-enterprise-relations/query',
    method: 'POST',
    requirement:
      '输入科技专家、关系类型和时间范围，查询专家关联的多家重点科技企业，并返回关系类型、专家角色、合作领域、合作模式、合作周期及企业背景摘要。返回的 expertId 与 enterpriseId 可继续作为关系详情和企业背景分析接口输入。',
    requestParams: [
      { field: 'expertId', type: 'string', required: '是', description: '科技专家唯一标识' },
      { field: 'relationTypes', type: 'array', required: '否', description: '关系类型，如 employment、advisor、cooperation、tech_transfer、patent_cooperation' },
      { field: 'startTime', type: 'string', required: '否', description: '开始时间，格式 YYYY-MM-DD' },
      { field: 'endTime', type: 'string', required: '否', description: '结束时间，格式 YYYY-MM-DD' },
      { field: 'limit', type: 'number', required: '否', description: '返回企业数量上限' },
      { field: 'includeEnterpriseProfile', type: 'boolean', required: '否', description: '是否返回企业背景摘要' },
    ],
    responseFields: [
      { field: 'status', type: 'string', description: '查询状态' },
      { field: 'expertId', type: 'string', description: '专家 ID' },
      { field: 'expertName', type: 'string', description: '专家姓名' },
      { field: 'relationCount', type: 'number', description: '命中的企业关系数量' },
      { field: 'relations', type: 'array', description: '专家关联的重点科技企业列表' },
      { field: 'relations[].relationLabel', type: 'string', description: '关系类型中文标签' },
      { field: 'relations[].roleLabel', type: 'string', description: '专家角色' },
      { field: 'relations[].enterpriseProfile', type: 'object', description: '企业行业地位、技术方向和经营状况摘要' },
    ],
    requestExample: {
      expertId: 'COOP-SCH001',
      relationTypes: ['employment', 'advisor', 'cooperation'],
      startTime: '2021-01-01',
      endTime: '2024-12-31',
      limit: 20,
      includeEnterpriseProfile: true,
    },
    responseExample: {
      code: 200,
      success: true,
      data: {
        status: 'success',
        expertId: 'COOP-SCH001',
        expertName: '陈建国',
        relationCount: 10,
        relations: [
          {
            enterpriseName: '企业001有限公司',
            relationLabel: '任职',
            roleLabel: '首席科学家',
            cooperationField: '人工智能',
            cooperationMode: '联合研发',
          },
          {
            enterpriseName: '启明数据技术有限公司',
            relationLabel: '合作',
            roleLabel: '项目负责人',
            cooperationField: '知识图谱',
            cooperationMode: '项目合作',
          },
        ],
      },
      message: 'success',
    },
    structuredRows: [
      { label: '专家', value: '陈建国' },
      { label: '关联企业', value: '企业001有限公司、星河智能装备股份有限公司' },
      { label: '关系类型', value: '任职、顾问、合作' },
      { label: '合作领域', value: '人工智能、智能制造' },
      { label: '企业背景', value: '行业地位、技术方向、经营状况' },
    ],
  },
  'industry-chain-event': {
    featureName: '高影响力事件筛选接口',
    endpoint: '/api/v1/industry-chain/topn-events/screen',
    method: 'POST',
    requirement:
      '根据产业链节点/环节代码、事件类型、时间范围和返回数量筛选核心事件，并支撑后续事件-专家关系查询与事件影响分析。',
    requestParams: [
      { field: 'industryChainName', type: 'string', required: '是', description: '产业链中文名称，如集成电路产业链' },
      { field: 'industryChainSegment', type: 'string', required: '是', description: '产业链环节或节点，如上游原材料' },
      { field: 'eventTypes', type: 'string', required: '否', description: '事件类型中文单选，如专利突破、论文成果、融资并购' },
      { field: 'topN', type: 'number', required: '是', description: '返回影响力排名前 N 的事件' },
      { field: 'startTime', type: 'string', required: '否', description: '开始时间，格式 YYYY-MM-DD' },
      { field: 'endTime', type: 'string', required: '否', description: '结束时间，格式 YYYY-MM-DD' },
    ],
    responseFields: [
      { field: 'industryChainName', type: 'string', description: '当前分析的产业链中文名称' },
      { field: 'industryChainSegment', type: 'string', description: '当前分析的产业链环节/节点' },
      { field: 'industryChainNodeCode', type: 'string', description: '当前分析的产业链内部追踪代码' },
      { field: 'total', type: 'number', description: '满足条件事件总数' },
      { field: 'topN', type: 'number', description: '本次返回的事件数量限制' },
      { field: 'events', type: 'array', description: '高影响力事件列表' },
      { field: 'events[].impactScore', type: 'number', description: '影响力得分' },
      { field: 'events[].eventTime', type: 'string', description: '中文格式事件时间' },
      { field: 'events[].relatedExpertName', type: 'string', description: '关联专家/人才姓名' },
    ],
    requestExample: {
      industryChainName: '集成电路产业链',
      industryChainSegment: '上游原材料',
      eventTypes: '专利突破',
      topN: 10,
      startTime: '2020-01-01',
      endTime: '2024-12-31',
    },
    responseExample: {
      code: 200,
      success: true,
      data: {
        industryChainName: '集成电路产业链',
        industryChainSegment: '上游原材料',
        industryChainNodeCode: 'IC_UPSTREAM_MATERIAL',
        total: 10,
        topN: 10,
        events: [{ eventId: 'EVT_PATENT_001', eventTitle: '高性能半导体材料制备关键技术专利', eventTime: '2024年6月15日', impactScore: 92.5, rank: 1, relatedExpertName: '陈建国' }],
      },
      msg: 'success',
    },
    structuredRows: [
      { label: '产业链', value: '集成电路产业链' },
      { label: '产业链环节/节点', value: '上游原材料' },
      { label: '事件总数', value: '10' },
      { label: '第1事件', value: '高性能半导体材料制备关键技术专利' },
      { label: '事件评分', value: '92.5' },
      { label: '关联专家', value: '陈建国' },
    ],
  },
}

export function getModuleContract(name: string): ModuleContract {
  return moduleContracts[name] ?? pending('知识推理模块')
}
