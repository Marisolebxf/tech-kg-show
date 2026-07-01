export type FieldSpec = {
  name: string
  type: string
  required?: string
  description: string
}

export type PrototypeNode = {
  id: string
  x: number
  y: number
  w: number
  h: number
  title: string
  subtitle?: string
  tone: 'blue' | 'green' | 'purple' | 'orange' | 'gold'
  chips?: string[]
}

export type PrototypeEdge = {
  id: string
  path: string
  label: string
  labelX: number
  labelY: number
  tone: 'blue' | 'green' | 'purple' | 'orange' | 'gold'
  dashed?: boolean
}

export type InterfacePrototype = {
  name: string
  endpoint: string
  method: 'POST' | 'GET'
  purpose: string
  requestFields: FieldSpec[]
  responseFields: FieldSpec[]
  requestExample: Record<string, unknown>
  responseExample: Record<string, unknown>
  detailRows: Array<[string, string | string[]]>
  graph: {
    nodes: PrototypeNode[]
    edges: PrototypeEdge[]
  }
}

export type ModulePrototype = {
  title: string
  requirement: string
  flow: string[]
  interfaces: InterfacePrototype[]
}

const expertPairNodes = (
  centerTitle: string,
  centerSubtitle: string,
  leftTitle: string,
  leftSubtitle: string,
  rightTitle: string,
  rightSubtitle: string,
  bottomTitle: string,
  bottomChips: string[],
): PrototypeNode[] => [
  { id: 'left', x: 70, y: 48, w: 178, h: 70, title: leftTitle, subtitle: leftSubtitle, tone: 'blue' },
  { id: 'right', x: 468, y: 48, w: 178, h: 70, title: rightTitle, subtitle: rightSubtitle, tone: 'green' },
  { id: 'center', x: 252, y: 208, w: 220, h: 84, title: centerTitle, subtitle: centerSubtitle, tone: 'purple' },
  { id: 'types', x: 32, y: 340, w: 168, h: 122, title: '关系类型', tone: 'green', chips: ['学术关联', '项目关联', '成果关联'] },
  { id: 'bottom', x: 262, y: 384, w: 206, h: 80, title: bottomTitle, tone: 'gold', chips: bottomChips },
  { id: 'result', x: 500, y: 340, w: 168, h: 122, title: '结果输出', tone: 'orange', chips: ['论文', '专利', '项目'] },
]

const expertPairEdges = (mainLabel: string): PrototypeEdge[] => [
  { id: 'left-center', path: 'M158 118 C168 160 218 188 252 216', label: '关联', labelX: 190, labelY: 158, tone: 'blue' },
  { id: 'right-center', path: 'M556 118 C546 160 502 188 472 216', label: '关联', labelX: 512, labelY: 158, tone: 'blue' },
  { id: 'main', path: 'M248 84 H468', label: mainLabel, labelX: 358, labelY: 70, tone: 'purple' },
  { id: 'type', path: 'M252 264 C174 276 112 305 92 340', label: '类型标注', labelX: 108, labelY: 286, tone: 'green' },
  { id: 'path', path: 'M362 292 V384', label: '路径/时段', labelX: 396, labelY: 342, tone: 'blue', dashed: true },
  { id: 'result', path: 'M472 264 C540 278 584 308 598 340', label: '成果归因', labelX: 558, labelY: 286, tone: 'orange' },
]

export const modulePrototypes: Record<string, ModulePrototype> = {
  'node-indirect': {
    title: '科技单节点间接关系',
    requirement:
      '以单个科技专家或人才作为核心节点，通过路径分析与关系传递算法，挖掘间接关联节点、传递路径、关系类型和关联强度。',
    flow: ['输入核心节点', '抽取直接关系', '多跳路径分析', '输出间接网络'],
    interfaces: [
      {
        name: '科技单节点间接关系推理接口',
        endpoint: '/api/v1/indirect-relation/infer',
        method: 'POST',
        purpose: '输入一个科技专家或人才作为核心节点，返回间接关联节点、关系传递路径、关系类型标注以及关联强度。',
        requestFields: [
          { name: 'corenode_id', type: 'string', required: '是', description: '核心专家或人才节点 ID' },
          { name: 'relation_types', type: 'array', required: '否', description: '需要推理的间接关系类型' },
          { name: 'path_depth', type: 'number', required: '否', description: '路径分析深度，默认 2' },
          { name: 'minstrength', type: 'number', required: '否', description: '最小关联强度阈值' },
        ],
        responseFields: [
          { name: 'code', type: 'int', description: '业务状态码' },
          { name: 'message', type: 'string', description: '返回消息' },
          { name: 'data.expert', type: 'object', description: '核心专家基础信息' },
          { name: 'data.direct_relations', type: 'array', description: '核心专家直接关联节点' },
          { name: 'data.indirect_relations', type: 'array', description: '间接关联节点列表' },
          { name: 'data.path_analysis', type: 'array', description: '关系传递路径分析' },
          { name: 'data.relation_type_tags', type: 'array', description: '间接关系类型标注' },
        ],
        requestExample: { corenode_id: 'E10001', relation_types: ['学术关联', '项目关联', '专利关联', '机构关联'], path_depth: 2, minstrength: 0.6 },
        responseExample: {
          code: 0,
          message: 'success',
          data: {
            expert: { expert_id: 'E10001', expert_name: '张明远', expert_title: '研究员' },
            direct_relations: [{ node_id: 'E10002', node_name: '李佳宁', node_type: '专家', relation_type: '直接关系', relation_name: '合作学者' }],
            indirect_relations: [{ node_id: 'E10003', node_name: '专家C', node_type: '专家', relation_type: '学术关联', path_text: '张明远 → 李佳宁 → 专家C', strength: 0.89 }],
            path_analysis: [
              {
                path_id: 'PATH10001',
                path_type: '学术路径',
                path_text: '张明远 → 李佳宁 → 专家C',
                path_nodes: [
                  { node_id: 'E10001', node_name: '张明远', node_type: '专家' },
                  { node_id: 'E10002', node_name: '李佳宁', node_type: '专家' },
                  { node_id: 'E10003', node_name: '专家C', node_type: '专家' },
                ],
              },
            ],
            relation_type_tags: [
              { relation_type: 'academic', relation_name: '学术关联', description: '基于论文合作、共同作者或学术合作路径形成的间接关系' },
              { relation_type: 'project', relation_name: '项目关联', description: '基于项目参与、项目承担单位、项目合作单位等项目关系形成的间接关系' },
              { relation_type: 'patent', relation_name: '专利关联', description: '基于共同发明、专利申请人、专利权利人等专利关系形成的间接关系' },
              { relation_type: 'org', relation_name: '机构关联', description: '基于专家所属机构、项目承担机构、专利权利人机构等形成的间接关系' },
            ],
          },
        },
        detailRows: [
          ['核心节点', '张明远'],
          ['节点职称', '研究员'],
          ['直接关联节点', '李佳宁/智能科研协同平台建设项目'],
          ['关系类型', '间接关系'],
          ['间接关系类型', '学术关联/项目关联/成果关联'],
          ['间接关联节点', '专家C/企业E'],
          ['学术路径', '专家A→专家B→专家C'],
          ['项目路径', '专家A→项目P→企业E'],
          ['关联强度', ['专家C 0.89', '企业E 0.64']],
        ],
        graph: {
          nodes: [
            { id: 'core', x: 268, y: 186, w: 210, h: 90, title: '核心节点', subtitle: '专家A：张明远', tone: 'purple' },
            { id: 'expert', x: 72, y: 42, w: 210, h: 70, title: '专家B：李佳宁', subtitle: '合作学者', tone: 'blue' },
            { id: 'project', x: 452, y: 42, w: 244, h: 70, title: '项目P：智能科研协同平台建设项目', subtitle: '科研项目', tone: 'green' },
            { id: 'types', x: 24, y: 334, w: 178, h: 138, title: '间接关系类型', tone: 'green', chips: ['学术关联', '项目关联', '成果关联'] },
            { id: 'paths', x: 260, y: 384, w: 224, h: 82, title: '传递路径', subtitle: '专家A→专家B→专家C', tone: 'gold' },
            { id: 'targets', x: 532, y: 334, w: 158, h: 104, title: '间接关联节点', tone: 'orange', chips: ['专家C', '企业E'] },
          ],
          edges: [
            { id: 'e1', path: 'M180 112 C184 148 244 164 318 186', label: '直接联系', labelX: 216, labelY: 150, tone: 'blue' },
            { id: 'e2', path: 'M574 112 C570 148 516 166 428 186', label: '直接联系', labelX: 532, labelY: 150, tone: 'blue' },
            { id: 'e3', path: 'M268 246 C168 260 88 296 82 334', label: '关系标注', labelX: 90, labelY: 288, tone: 'green' },
            { id: 'e4', path: 'M373 276 V384', label: '路径分析', labelX: 404, labelY: 334, tone: 'blue', dashed: true },
            { id: 'e5', path: 'M478 246 C562 268 608 300 612 334', label: '关系传递', labelX: 586, labelY: 286, tone: 'orange' },
          ],
        },
      },
    ],
  },
  'two-point-achievement': {
    title: '科技两点合作成果',
    requirement:
      '针对两个科技专家或人才节点整合知识图谱合作数据，提取合作成果、时间范围、合作领域、成果类型分布、成果级别、核心贡献和合作模式。',
    flow: ['输入两位专家', '聚合成果数据', '成果归因统计', '输出合作评估'],
    interfaces: [
      {
        name: '科技两点合作成果结构化结果接口',
        endpoint: '/api/v1/two-expert-cooperation-achievements/demo/structured-result',
        method: 'POST',
        purpose: '输入两个科技专家及筛选条件，返回两位专家之间合作成果的结构化结果。',
        requestFields: [
          { name: 'dataSource', type: 'string', required: '是', description: '数据来源范围' },
          { name: 'expertAId', type: 'string', required: '是', description: '专家 A 唯一标识，不能与 expertBId 相同' },
          { name: 'expertBId', type: 'string', required: '是', description: '专家 B 唯一标识，不能与 expertAId 相同' },
          { name: 'achievementTypes', type: 'array', required: '否', description: '成果类型，默认 paper/project/patent' },
          { name: 'startTime', type: 'string', required: '否', description: '查询开始时间，格式 YYYY-MM-DD' },
          { name: 'endTime', type: 'string', required: '否', description: '查询结束时间，格式 YYYY-MM-DD' },
        ],
        responseFields: [
          { name: 'structuredResult.expertList', type: 'array[string]', description: '两位科技专家姓名' },
          { name: 'structuredResult.expertUnits', type: 'array[string]', description: '两位专家单位信息' },
          { name: 'structuredResult.cooperationTimeRange', type: 'object', description: '合作成果时间范围' },
          { name: 'structuredResult.cooperationFields', type: 'array[string]', description: '合作领域、研究方向或关键词' },
          { name: 'structuredResult.achievementCount', type: 'number', description: '合作成果总数量' },
          { name: 'structuredResult.achievementTypeDistribution', type: 'object', description: '论文/项目/专利成果类型分布' },
          { name: 'structuredResult.representativeAchievements', type: 'array', description: '代表成果名称、类型、时间、领域和级别' },
          { name: 'structuredResult.achievementLevel', type: 'object', description: '项目级别、Q1论文、顶刊顶会论文和授权专利统计' },
          { name: 'structuredResult.coreContribution', type: 'array[string]', description: '核心贡献标签' },
          { name: 'structuredResult.cooperationPattern', type: 'string', description: '合作模式分析' },
        ],
        requestExample: {
          dataSource: 'knowledge_graph',
          expertAId: 'EXPERT-001',
          expertBId: 'EXPERT-002',
          achievementTypes: ['paper', 'project', 'patent'],
          startTime: '2020-01-01',
          endTime: '2025-12-31',
        },
        responseExample: {
          structuredResult: {
            expertList: ['陈建国', '刘芳'],
            expertUnits: ['清华大学', '北京大学'],
            cooperationTimeRange: { startYear: 2020, endYear: 2025, displayText: '2020 - 2025' },
            cooperationFields: ['知识图谱', '智能计算', '图神经网络', '科技情报'],
            achievementCount: 17,
            achievementTypeDistribution: { paper: 10, project: 4, patent: 3, displayText: '共同论文10 / 关联项目4 / 关联专利3' },
            representativeAchievements: [
              {
                achievementId: 'ACH-PAPER-001',
                title: '面向科技知识图谱的关系推理方法研究',
                type: 'paper',
                publishOrCompleteTime: '2023-06-01',
                field: '知识图谱',
                level: 'JCR-Q1论文',
              },
              {
                achievementId: 'ACH-PROJECT-001',
                title: '跨机构科研合作网络分析系统',
                type: 'project',
                publishOrCompleteTime: '2024-12-31',
                field: '科技情报',
                level: '国家级项目',
              },
            ],
            achievementLevel: {
              nationalProject: 2,
              provincialProject: 2,
              jcrQ1Paper: 5,
              topJournalOrConferencePaper: 3,
              authorizedPatent: 3,
              displayText: '国家级项目2 / 省部级项目2 / JCR-Q1论文5 / 顶刊顶会论文3 / 授权专利3',
            },
            coreContribution: ['共同承担重点科研项目', '联合发表高水平论文', '形成可复用技术成果', '推动科研成果转化'],
            cooperationPattern: '长期稳定型科研合作',
          },
        },
        detailRows: [
          ['专家 A', '陈建国'],
          ['专家 A 单位', '清华大学'],
          ['专家 B', '刘芳'],
          ['专家 B 单位', '北京大学'],
          ['成果类型', '论文 / 项目 / 专利'],
          ['合作时间', '2020 - 2025'],
          ['共同领域', '知识图谱、智能计算、图神经网络、科技情报'],
          ['成果总量', '17'],
          ['成果分布', ['论文 10', '项目 4', '专利 3']],
          ['代表成果', ['关系推理方法研究', '科研合作网络分析系统']],
          ['成果级别', '国家级项目2 / 省部级项目2 / JCR-Q1论文5 / 顶刊顶会论文3 / 授权专利3'],
          ['核心贡献', ['重点项目', '高水平论文', '成果转化']],
          ['合作模式', '长期稳定型科研合作'],
        ],
        graph: {
          nodes: expertPairNodes('合作成果', '结构化归因', '专家A：陈建国', '清华大学', '专家B：刘芳', '北京大学', '成果级别', ['Q1论文5', '国家项目2', '授权专利3']),
          edges: expertPairEdges('合作成果'),
        },
      },
    ],
  },
  'expert-colleague': {
    title: '科技专家同事关系',
    requirement:
      '基于专家任职履历、机构部门、团队项目组和成果数据，识别专家之间的同事关系，输出同事关系生效时段、所属团队、协作场景和同事期间合作成果。',
    flow: ['输入核心专家', '匹配任职履历', '识别团队同事', '输出同事网络'],
    interfaces: [
      {
        name: '科技专家同事关系查询接口',
        endpoint: '/api/expert-colleague-relation/list',
        method: 'POST',
        purpose: '输入核心专家及筛选条件，返回该专家与其他专家之间的同事关系和结构化详情。',
        requestFields: [
          { name: 'expert_id', type: 'string', required: '是', description: '核心科技专家唯一标识' },
          { name: 'target_expert_id', type: 'string', required: '否', description: '目标同事专家 ID，不填返回全部候选同事' },
          { name: 'organization', type: 'string', required: '否', description: '工作单位、团队或项目组筛选条件' },
          { name: 'start_time', type: 'string', required: '否', description: '查询开始时间，格式 YYYY-MM' },
          { name: 'end_time', type: 'string', required: '否', description: '查询结束时间，格式 YYYY-MM' },
        ],
        responseFields: [
          { name: 'data.expert', type: 'object', description: '当前查询专家基础信息' },
          { name: 'data.colleague_relations', type: 'array', description: '同事关系列表' },
          { name: 'data.colleague_relations[].effectivePeriod', type: 'object', description: '同事关系生效时段' },
          { name: 'data.colleague_relations[].teamOrProject', type: 'string', description: '所属团队或项目组' },
          { name: 'data.colleague_relations[].workContent', type: 'string', description: '共同工作内容与协作场景' },
          { name: 'data.colleague_relations[].cooperationAchievements', type: 'array', description: '同事期间产生的合作成果' },
        ],
        requestExample: { expert_id: 'E10001', target_expert_id: '', organization: '清华大学智能产业研究院', start_time: '2019-01', end_time: '2025-12' },
        responseExample: { code: 0, data: { expert: { expert_id: 'E10001', expert_name: '李佳宁' }, colleague_relations: [] }, message: 'success' },
        detailRows: [],
        graph: { nodes: [], edges: [] },
      },
    ],
  },
  'expert-alumni': {
    title: '科技专家校友关系',
    requirement:
      '基于教育背景数据、院校信息和校友网络数据，识别并构建专家之间的校友关系，记录校友维度和后续合作互动。',
    flow: ['解析专家身份', '抽取教育经历', '院校维度匹配', '输出校友关系'],
    interfaces: [
      {
        name: '专家检索接口',
        endpoint: '/api/v1/kg-construction/expert-alumni-relations/scholars/search',
        method: 'GET',
        purpose: '按姓名关键词检索专家候选列表，供校友关系判定进行身份消歧。',
        requestFields: [
          { name: 'keyword', type: 'string', required: '是', description: '姓名关键词（中/英）' },
          { name: 'organization', type: 'string', required: '否', description: '单位关键词，消歧' },
          { name: 'page', type: 'int', required: '否', description: '页码，默认 1' },
          { name: 'pageSize', type: 'int', required: '否', description: '每页条数，默认 20' },
        ],
        responseFields: [
          { name: 'code', type: 'int', description: '业务状态码，200 成功，400 参数错误' },
          { name: 'success', type: 'bool', description: '是否成功' },
          { name: 'msg', type: 'string', description: '提示消息' },
          { name: 'data.total', type: 'int', description: '满足条件总记录数' },
          { name: 'data.page', type: 'int', description: '当前页码' },
          { name: 'data.pageSize', type: 'int', description: '每页条数' },
          { name: 'data.items[].scholarId', type: 'string', description: '专家唯一 ID' },
          { name: 'data.items[].nameZh', type: 'string', description: '中文名' },
          { name: 'data.items[].nameEn', type: 'string', description: '英文名' },
          { name: 'data.items[].organizationZh', type: 'string', description: '中文单位名' },
          { name: 'data.items[].organizationEn', type: 'string', description: '英文单位名' },
          { name: 'data.items[].hasEducationBackground', type: 'bool', description: '是否有教育背景文本' },
          { name: 'data.items[].matchScore', type: 'float', description: '匹配分' },
        ],
        requestExample: { keyword: '吴边', organization: '中国科学院', page: 1, pageSize: 20 },
        responseExample: { code: 200, data: { total: 1, page: 1, pageSize: 20, items: [{ scholarId: '007Rb117', nameZh: '吴边', nameEn: 'Bian Wu', organizationZh: '中国科学院微生物研究所', organizationEn: '', hasEducationBackground: true, matchScore: 0.9 }] }, message: 'success' },
        detailRows: [
          ['检索关键词', '吴边'],
          ['候选专家', '吴边'],
          ['专家 ID', '007Rb117'],
          ['所属机构', '中国科学院微生物研究所'],
          ['教育背景', '已识别'],
          ['匹配分', '0.90'],
        ],
        graph: {
          nodes: [
            { id: 'keyword', x: 92, y: 92, w: 190, h: 70, title: '关键词：吴边', subtitle: '姓名检索', tone: 'blue' },
            { id: 'org', x: 92, y: 292, w: 190, h: 70, title: '中国科学院', subtitle: '机构过滤', tone: 'purple' },
            { id: 'expert', x: 430, y: 188, w: 230, h: 82, title: '专家：吴边', subtitle: '007Rb117｜教育背景已识别', tone: 'green' },
          ],
          edges: [
            { id: 'keyword-expert', path: 'M282 127 C340 144 382 168 430 202', label: '姓名匹配', labelX: 360, labelY: 154, tone: 'blue' },
            { id: 'org-expert', path: 'M282 327 C340 306 384 282 430 246', label: '机构消歧', labelX: 362, labelY: 304, tone: 'purple' },
          ],
        },
      },
      {
        name: '校友关系推理构建',
        endpoint: '/api/v1/kg-construction/expert-alumni-relations/judge',
        method: 'POST',
        purpose: '判定两位专家是否存在校友关系，并返回关系子类型、关联维度、合作论文证据、置信度与判定理由。',
        requestFields: [
          { name: 'expertA', type: 'object', required: '是', description: '专家 A 引用，支持 scholarId 或 name' },
          { name: 'expertB', type: 'object', required: '是', description: '专家 B 引用，支持 scholarId 或 name' },
          { name: 'forceRefresh', type: 'bool', required: '否', description: '是否强制刷新缓存' },
          { name: 'includeRawEducation', type: 'bool', required: '否', description: '是否回填原始教育背景文本' },
        ],
        responseFields: [
          { name: 'code', type: 'int', description: '业务状态码，200 成功，400/404/40901/422 失败' },
          { name: 'success', type: 'bool', description: '是否成功' },
          { name: 'msg', type: 'string', description: '提示消息' },
          { name: 'data.resolvedExperts', type: 'object', description: '双方专家解析结果' },
          { name: 'data.isAlumni', type: 'bool', description: '是否校友' },
          { name: 'data.relationSubtype', type: 'string|null', description: '校友关系子类型' },
          { name: 'data.dimensions', type: 'object', description: '共同院校、院系、专业、就读时段等维度' },
          { name: 'data.cooperation', type: 'object', description: '后续合作论文证据' },
          { name: 'data.reason', type: 'string', description: '判定理由' },
          { name: 'data.ruleVersion', type: 'string', description: '规则版本' },
          { name: 'data.cached', type: 'bool', description: '是否命中缓存' },
          { name: 'data.relationId', type: 'string|null', description: '关系记录 ID' },
        ],
        requestExample: { expertA: { scholarId: 'ALU-001', name: '周子谦' }, expertB: { scholarId: 'ALU-002', name: '吴若彤' }, forceRefresh: false, includeRawEducation: true },
        responseExample: { code: 200, data: { resolvedExperts: { a: { scholarId: 'ALU-001', nameZh: '周子谦', nameEn: 'Ziqian Zhou', organizationZh: '复旦大学药学院', matchType: 'id' }, b: { scholarId: 'ALU-002', nameZh: '吴若彤', nameEn: 'Ruotong Wu', organizationZh: '上海药物研究所', matchType: 'id' } }, isAlumni: true, relationSubtype: '同院系同专业校友', dimensions: { sharedSchool: { schoolId: 'org_ucas', schoolNameZh: '中国科学院大学', schoolNameEn: 'University of Chinese Academy of Sciences' }, sharedCollege: '计算机科学与技术学院', sharedMajor: '人工智能', sharedPeriod: { start: '2015-09', end: '2019-06' }, entryYearGap: 0 }, cooperation: { coPaperCount: 3, patentCount: 1, projectCount: 2, evidenceCount: 6 }, confidence: 0.96, reason: '双方均有中国科学院大学教育经历，院系和专业一致，就读时段重叠，并在毕业后产生论文、专利和项目合作。', ruleVersion: 'rule-v1.0', cached: false, relationId: 'ALUMNI-REL-001' }, message: 'success' },
        detailRows: [
          ['专家 A', '周子谦'],
          ['专家 A 职称', '研究员'],
          ['专家 B', '吴若彤'],
          ['专家 B 职称', '副研究员'],
          ['关系类型', '同院系同专业校友'],
          ['共同院校', '中国科学院大学'],
          ['共同院系', '计算机科学与技术学院'],
          ['共同专业', '人工智能'],
          ['共同学习时段', '2015-09 - 2019-06'],
          ['后续学术交流', '人工智能与知识图谱方向学术互访'],
          ['合作互动', ['论文 3', '专利 1', '项目 2']],
        ],
        graph: {
          nodes: [
            { id: 'a', x: 112, y: 72, w: 176, h: 70, title: '专家A：周子谦', subtitle: '研究员', tone: 'blue' },
            { id: 'relation', x: 350, y: 84, w: 150, h: 54, title: '校友关系', subtitle: '同院系同专业', tone: 'purple' },
            { id: 'b', x: 562, y: 72, w: 176, h: 70, title: '专家B：吴若彤', subtitle: '副研究员', tone: 'green' },
            { id: 'school', x: 312, y: 204, w: 226, h: 70, title: '中国科学院大学', subtitle: '共同院校', tone: 'blue' },
            { id: 'college', x: 296, y: 316, w: 258, h: 68, title: '计算机科学与技术学院', subtitle: '共同院系', tone: 'green' },
            { id: 'major', x: 306, y: 414, w: 240, h: 72, title: '人工智能', subtitle: '共同专业', tone: 'gold' },
            { id: 'period', x: 76, y: 476, w: 220, h: 78, title: '共同学习时段', subtitle: '2015.09 - 2019.06', tone: 'purple' },
            { id: 'coop', x: 568, y: 438, w: 170, h: 118, title: '后续合作', tone: 'orange', chips: ['论文3', '专利1', '项目2'] },
          ],
          edges: [
            { id: 'e1', path: 'M288 107 H350', label: '', labelX: 319, labelY: 96, tone: 'purple' },
            { id: 'e2', path: 'M500 107 H562', label: '', labelX: 531, labelY: 96, tone: 'purple' },
            { id: 'e3', path: 'M200 142 C238 180 278 208 312 236', label: '就读', labelX: 260, labelY: 188, tone: 'blue' },
            { id: 'e4', path: 'M650 142 C614 180 574 208 538 236', label: '就读', labelX: 590, labelY: 188, tone: 'blue' },
            { id: 'e5', path: 'M425 274 V316', label: '所属', labelX: 452, labelY: 300, tone: 'green' },
            { id: 'e6', path: 'M425 384 V414', label: '所属', labelX: 452, labelY: 404, tone: 'green' },
            { id: 'e7', path: 'M306 460 C270 486 240 500 210 515', label: '学习', labelX: 282, labelY: 494, tone: 'green' },
            { id: 'e8', path: 'M546 462 C558 454 562 448 568 448', label: '后续合作', labelX: 570, labelY: 434, tone: 'orange' },
          ],
        },
      },
    ],
  },
  'paper-cooperation': {
    title: '专家论文合作关系',
    requirement:
      '基于论文作者、作者单位、发表时间、主题、期刊会议级别和被引情况，识别专家之间的论文合作关系，分析合作方向、共同贡献、稳定团队和核心合作人员。',
    flow: ['输入核心专家', '聚合论文数据', '识别合作作者', '输出论文合作网络'],
    interfaces: [
      {
        name: '专家论文合作关系结构化结果接口',
        endpoint: '/api/v1/scholar-paper-cooperation/demo/structured-result',
        method: 'POST',
        purpose: '输入核心专家和筛选条件，返回论文合作作者、合作论文统计、期刊会议级别、被引情况与稳定合作团队。',
        requestFields: [
          { name: 'expert_id', type: 'string', required: '是', description: '核心专家 ID' },
          { name: 'coauthor_id', type: 'string', required: '否', description: '合作专家 ID，不填返回全部合作作者' },
          { name: 'paper_topic', type: 'string', required: '否', description: '论文主题筛选' },
          { name: 'start_year', type: 'number', required: '否', description: '开始年份' },
          { name: 'end_year', type: 'number', required: '否', description: '结束年份' },
        ],
        responseFields: [
          { name: 'data.expert', type: 'object', description: '核心专家信息' },
          { name: 'data.coauthors', type: 'array', description: '合作作者列表' },
          { name: 'data.papers', type: 'array', description: '合作论文列表' },
          { name: 'data.citationSummary', type: 'object', description: '论文被引统计' },
          { name: 'data.researchDirections', type: 'array', description: '合作论文研究方向与共同贡献' },
          { name: 'data.stableTeams', type: 'array', description: '长期稳定论文合作团队与核心人员' },
        ],
        requestExample: { expert_id: 'E10001', coauthor_id: '', paper_topic: '知识图谱', start_year: 2019, end_year: 2025 },
        responseExample: { code: 0, data: { expert: { expert_id: 'E10001', expert_name: '李佳宁' }, coauthors: [] }, message: 'success' },
        detailRows: [],
        graph: { nodes: [], edges: [] },
      },
    ],
  },
  'industry-chain-event': {
    title: '科技产业链点 TOP-N 事件关系',
    requirement:
      '针对产业链特定环节，通过事件影响力评估算法筛选 TOP-N 核心事件，构建事件与专家关联，分析产业链影响和发展趋势。',
    flow: ['输入产业链节点', '筛选高影响事件', '构建事件专家关系', '分析趋势风险'],
    interfaces: [
      {
        name: '高影响力事件筛选接口',
        endpoint: '/api/v1/industry-chain/topn-events/screen',
        method: 'POST',
        purpose: '按产业链节点、事件类型，通过多因子评估模型筛选 TOP-N 高影响力科技事件。',
        requestFields: [
          { name: 'industryChainNode', type: 'string', required: '是', description: '产业链节点名称' },
          { name: 'eventTypes', type: 'string[]', required: '是', description: '事件类型集合' },
          { name: 'topN', type: 'int', required: '是', description: 'TOP-N 阈值' },
          { name: 'evaluationModel', type: 'string', required: '否', description: '评估模型' },
          { name: 'startTime', type: 'string', required: '否', description: '开始时间' },
          { name: 'endTime', type: 'string', required: '否', description: '结束时间' },
        ],
        responseFields: [
          { name: 'code', type: 'int', description: '业务状态码，200 成功' },
          { name: 'success', type: 'bool', description: '是否成功' },
          { name: 'msg', type: 'string', description: '提示消息' },
          { name: 'data.industryChainNode', type: 'string', description: '产业链节点' },
          { name: 'data.evaluationModel', type: 'string', description: '事件评估模型' },
          { name: 'data.total', type: 'int', description: '命中事件总数' },
          { name: 'data.events', type: 'array', description: 'TOP-N 事件列表' },
          { name: 'data.events[].impactFactors', type: 'object', description: '事件影响力因子' },
          { name: 'data.events[].relatedExperts', type: 'array', description: '相关专家及角色' },
        ],
        requestExample: { industryChainNode: '上游原材料', eventTypes: ['patent', 'paper', 'fund'], topN: 10, evaluationModel: 'multi_factor', startTime: '2020-01-01', endTime: '2024-12-31' },
        responseExample: {
          code: 200,
          data: {
            industryChainNode: '上游原材料',
            evaluationModel: 'multi_factor',
            total: 42,
            events: [
              { eventId: 'P001', eventType: 'patent', title: 'CN2024XXXXXXA', eventTime: '2024-06-15', score: 92.5, rank: 1, impactFactors: { citation: 18, fundedAmount: null, level: null, timeliness: 95.0, chainRelevance: 88.0 }, relatedExperts: [{ expertId: 'COOP-SCH001', expertName: '陈建国', role: 'inventor' }] },
              { eventId: 'PAPER001', eventType: 'paper', title: '面向科技知识图谱的关系推理研究', eventTime: '2021-06-01', score: 85.0, rank: 2, impactFactors: { citation: 32, fundedAmount: null, level: 'SCI-Q1', timeliness: 70.0, chainRelevance: 90.0 }, relatedExperts: [{ expertId: 'COOP-SCH002', expertName: '刘芳', role: 'author' }] },
            ],
          },
          message: 'success',
        },
        detailRows: [
          ['产业链节点', '大模型产业链'],
          ['关键环节', '算力与模型环节'],
          ['影响领域', '场景应用生态'],
          ['Top-N事件', ['事件1', '事件2', '事件3']],
          ['事件节点', ['算力芯片突破', '多模态发布', '开源生态升级']],
          ['专家节点', ['专家A', '专家B']],
          ['机构节点', ['高校', '研究院', '企业']],
          ['成果节点', ['论文', '专利', '项目']],
        ],
        graph: {
          nodes: [
            { id: 'a', x: 48, y: 44, w: 154, h: 66, title: '专家A：李明哲', subtitle: '算法专家', tone: 'blue' },
            { id: 'b', x: 558, y: 44, w: 154, h: 66, title: '专家B：陈思远', subtitle: '产业分析师', tone: 'green' },
            { id: 'chain', x: 284, y: 104, w: 192, h: 70, title: '大模型产业链', subtitle: '核心节点', tone: 'blue' },
            { id: 'node', x: 296, y: 214, w: 168, h: 70, title: '算力与模型环节', subtitle: '关键环节', tone: 'green' },
            { id: 'scene', x: 292, y: 326, w: 176, h: 70, title: '场景应用生态', subtitle: '影响领域', tone: 'green' },
            { id: 'events', x: 548, y: 226, w: 164, h: 72, title: 'Top-N事件', subtitle: '核心事件集', tone: 'orange' },
            { id: 'top1', x: 42, y: 442, w: 132, h: 60, title: 'TOP1', subtitle: '算力芯片突破', tone: 'purple' },
            { id: 'top2', x: 210, y: 456, w: 132, h: 60, title: 'TOP2', subtitle: '多模态发布', tone: 'purple' },
            { id: 'top3', x: 378, y: 442, w: 132, h: 60, title: 'TOP3', subtitle: '开源生态升级', tone: 'purple' },
            { id: 'orgs', x: 552, y: 340, w: 150, h: 84, title: '关联机构', tone: 'blue', chips: ['高校', '研究院', '企业'] },
            { id: 'outputs', x: 548, y: 466, w: 156, h: 48, title: '成果节点', subtitle: '论文/专利/项目', tone: 'gold' },
          ],
          edges: [
            { id: 'e1', path: 'M202 76 C232 82 254 104 284 130', label: '研究/关联', labelX: 236, labelY: 88, tone: 'blue' },
            { id: 'e2', path: 'M558 76 C526 84 502 106 476 130', label: '产业研判', labelX: 526, labelY: 88, tone: 'blue' },
            { id: 'e3', path: 'M380 174 V214', label: '聚焦', labelX: 402, labelY: 200, tone: 'green' },
            { id: 'e4', path: 'M380 284 V326', label: '带动', labelX: 402, labelY: 312, tone: 'green' },
            { id: 'e5', path: 'M468 360 C506 332 526 286 548 262', label: '影响', labelX: 518, labelY: 324, tone: 'orange' },
            { id: 'e6', path: 'M630 298 V340', label: '关联机构', labelX: 668, labelY: 324, tone: 'blue' },
            { id: 'e7', path: 'M548 280 C402 348 190 382 108 442', label: 'TOP1', labelX: 316, labelY: 370, tone: 'orange', dashed: true },
            { id: 'e8', path: 'M588 298 C520 380 350 420 276 456', label: 'TOP2', labelX: 448, labelY: 406, tone: 'orange', dashed: true },
            { id: 'e9', path: 'M626 298 C594 374 506 410 444 442', label: 'TOP3', labelX: 550, labelY: 406, tone: 'orange', dashed: true },
            { id: 'e10', path: 'M626 424 V466', label: '产出', labelX: 652, labelY: 450, tone: 'gold' },
          ],
        },
      },
      {
        name: '事件-专家关系构建接口',
        endpoint: '/api/v1/industry-chain/topn-events/event-expert-relations/build',
        method: 'POST',
        purpose: '建立产业链事件与科研专家的关联关系，标定发明人、作者、项目参与人等关联角色。',
        requestFields: [
          { name: 'eventIds', type: 'string[]', required: '是', description: '事件 ID 数组' },
          { name: 'expertIds', type: 'string[]', required: '是', description: '专家 ID 数组' },
          { name: 'relationTypes', type: 'string[]', required: '是', description: '关联角色类型' },
        ],
        responseFields: [
          { name: 'code', type: 'int', description: '业务状态码，200 成功' },
          { name: 'success', type: 'bool', description: '是否成功' },
          { name: 'msg', type: 'string', description: '提示消息' },
          { name: 'data.relations', type: 'array', description: '事件-专家关联关系列表' },
          { name: 'data.relations[].relationId', type: 'string', description: '关联关系主键' },
          { name: 'data.relations[].eventId', type: 'string', description: '事件 ID' },
          { name: 'data.relations[].expertId', type: 'string', description: '专家 ID' },
          { name: 'data.relations[].relationType', type: 'string', description: '关联类型' },
          { name: 'data.relations[].roleLabel', type: 'string', description: '关联角色中文标签' },
          { name: 'data.relations[].effective', type: 'bool', description: '关系是否有效' },
          { name: 'data.skipped', type: 'array', description: '跳过的记录' },
        ],
        requestExample: { eventIds: ['P001', 'P002'], expertIds: ['COOP-SCH001', 'COOP-SCH002'], relationTypes: ['inventor', 'author', 'participant'] },
        responseExample: { code: 200, data: { relations: [{ relationId: 'EV001-S001', eventId: 'P001', expertId: 'COOP-SCH001', relationType: 'inventor', roleLabel: '发明人', effective: true }, { relationId: 'PAPER001-S002', eventId: 'PAPER001', expertId: 'COOP-SCH002', relationType: 'author', roleLabel: '作者', effective: true }], skipped: [] }, message: 'success' },
        detailRows: [
          ['事件ID', 'P001'],
          ['专家ID', 'COOP-SCH001'],
          ['关联角色', '发明人'],
          ['关系ID', 'EV001-S001'],
          ['构建状态', '有效'],
        ],
        graph: {
          nodes: expertPairNodes('事件专家关系', '关系边构建', '事件P001', '算力芯片突破', '专家：陈建国', '发明人', '构建结果', ['EV001-S001', '有效']),
          edges: expertPairEdges('关联角色'),
        },
      },
      {
        name: '事件影响与发展趋势分析接口',
        endpoint: '/api/v1/industry-chain/topn-events/impact-trend/analyze',
        method: 'POST',
        purpose: '针对单条重点事件，从产业链范围、时间周期维度分析事件影响力及后续发展趋势。',
        requestFields: [
          { name: 'eventId', type: 'string', required: '是', description: '事件 ID' },
          { name: 'analysisScope', type: 'string', required: '否', description: '分析范围维度' },
          { name: 'timeHorizon', type: 'int', required: '否', description: '时间分析周期（月）' },
        ],
        responseFields: [
          { name: 'code', type: 'int', description: '业务状态码，200 成功' },
          { name: 'success', type: 'bool', description: '是否成功' },
          { name: 'msg', type: 'string', description: '提示消息' },
          { name: 'data.eventId', type: 'string', description: '事件 ID' },
          { name: 'data.eventTitle', type: 'string', description: '事件标题' },
          { name: 'data.eventType', type: 'string', description: '事件类型' },
          { name: 'data.impactCoverage', type: 'object', description: '影响覆盖面' },
          { name: 'data.industryConduction', type: 'object', description: '行业传导效应' },
          { name: 'data.trendStages', type: 'array', description: '多阶段趋势' },
          { name: 'data.riskWarning', type: 'string', description: '风险预警' },
          { name: 'data.opportunity', type: 'string', description: '机会挖掘提示' },
        ],
        requestExample: { eventId: 'P001', analysisScope: 'industry_chain', timeHorizon: 3 },
        responseExample: { code: 200, data: { eventId: 'P001', eventTitle: 'CN2024XXXXXXA', eventType: 'patent', impactCoverage: { affectedNodes: ['上游原材料', '中游制造'], affectedEnterprises: ['企业001有限公司'], affectedExperts: ['陈建国'], coverageScore: 78.0 }, industryConduction: { upstreamImpact: '推动上游原材料工艺升级', downstreamImpact: '降低下游制造成本', crossChainImpact: '辐射集成电路与高端装备产业链' }, trendStages: [{ stage: 'short_term', period: '2024-07 ~ 2024-09', trend: '上升', description: '专利公开后短期内引发同类技术跟进。' }], riskWarning: '注意上游原材料供应集中度风险。', opportunity: '可布局下游制造环节的产业化合作。' }, message: 'success' },
        detailRows: [
          ['事件', '算力芯片突破'],
          ['影响节点', '上游原材料、中游制造'],
          ['覆盖评分', '78'],
          ['短期趋势', '上升'],
          ['中期趋势', '平稳'],
          ['风险预警', '供应集中度风险'],
          ['机会挖掘', '下游制造合作'],
        ],
        graph: {
          nodes: expertPairNodes('事件影响分析', '趋势研判', '事件P001', '算力芯片突破', '产业链节点', '中游制造', '发展趋势', ['短期上升', '中期平稳', '长期上升']),
          edges: expertPairEdges('影响传导'),
        },
      },
    ],
  },
  'industry-chain-panorama': {
    title: '科技产业链全景图',
    requirement:
      '整合产业链各环节实体、关系、事件等数据，构建覆盖全产业链的结构化全景图，支持层级展开、关系筛选和动态更新。',
    flow: ['输入产业链', '汇聚节点实体', '建模上下游关系', '输出全景图'],
    interfaces: [
      {
        name: '产业链全景查询接口',
        endpoint: '/api/industry-chain/panorama/infer',
        method: 'POST',
        purpose: '输入产业链代码或产业链名称，返回产业链全景结构、节点层级、上下游关系及关联实体集合。',
        requestFields: [
          { name: 'chain_code', type: 'string', required: '是', description: '产业链代码' },
          { name: 'chain_name', type: 'string', required: '是', description: '产业链名称' },
          { name: 'node_id', type: 'string', required: '否', description: '节点 ID' },
          { name: 'node_name', type: 'string', required: '否', description: '节点名称关键词' },
          { name: 'level', type: 'number', required: '否', description: '节点层级' },
          { name: 'include_enterprise', type: 'boolean', required: '否', description: '是否返回关联企业' },
          { name: 'include_patent', type: 'boolean', required: '否', description: '是否返回关联专利' },
          { name: 'include_product', type: 'boolean', required: '否', description: '是否返回关联产品' },
          { name: 'include_news', type: 'boolean', required: '否', description: '是否返回产业动态资讯' },
          { name: 'limit', type: 'number', required: '否', description: '返回结果条数限制' },
        ],
        responseFields: [
          { name: 'code', type: 'int', description: '业务状态码' },
          { name: 'message', type: 'string', description: '返回消息' },
          { name: 'data.chain', type: 'object', description: '产业链基础信息' },
          { name: 'data.nodes', type: 'array', description: '产业链节点列表' },
          { name: 'data.relations', type: 'array', description: '上下游关系' },
          { name: 'data.enterprises', type: 'array', description: '关联企业' },
          { name: 'data.patents', type: 'array', description: '关联专利' },
          { name: 'data.products', type: 'array', description: '关联产品' },
          { name: 'data.news', type: 'array', description: '产业资讯' },
          { name: 'data.statistics', type: 'object', description: '统计汇总' },
        ],
        requestExample: { chain_code: 'AI', chain_name: '人工智能', node_id: '', node_name: '', level: '', include_enterprise: true, include_patent: true, include_product: true, include_news: true, limit: 50 },
        responseExample: { code: 0, message: 'success', data: { chain: { chain_code: 'AI', chain_name: '人工智能', chain_path: '人工智能 / 算法 / 大模型', node_total: 3, enterprise_total: 2, patent_total: 1, product_total: 2, news_total: 1 }, nodes: [{ node_name: '大模型', level: 1 }], relations: [{ relation_type: '上下游', relation_strength: 95 }], statistics: { node_count: 3, relation_count: 1, enterprise_count: 2, patent_count: 1, product_count: 2, news_count: 1 } } },
        detailRows: [
          ['当前节点', '中游核心技术'],
          ['上游关联', '数据资源/算力芯片'],
          ['核心技术', '知识图谱/机器学习/大模型'],
          ['下游应用', '智能制造/智慧医疗/自动驾驶'],
          ['重点企业', '企业A/企业B/企业C'],
          ['核心专家', '张明远/李佳宁'],
          ['TOP事件', '技术突破/产业合作'],
          ['关联成果', ['论文 12', '专利 8', '项目 5']],
        ],
        graph: {
          nodes: [
            { id: 'up', x: 70, y: 214, w: 168, h: 80, title: '上游基础资源', tone: 'blue', chips: ['数据资源', '算力芯片'] },
            { id: 'core', x: 292, y: 220, w: 220, h: 88, title: '中游核心技术', tone: 'purple', chips: ['知识图谱', '机器学习', '大模型'] },
            { id: 'down', x: 560, y: 214, w: 178, h: 80, title: '下游应用场景', tone: 'green', chips: ['智能制造', '智慧医疗', '自动驾驶'] },
            { id: 'ent', x: 154, y: 56, w: 178, h: 72, title: '重点企业', tone: 'blue', chips: ['企业A', '企业B', '企业C'] },
            { id: 'expert', x: 432, y: 56, w: 178, h: 72, title: '核心专家', tone: 'purple', chips: ['张明远', '李佳宁'] },
            { id: 'event', x: 132, y: 388, w: 176, h: 82, title: 'TOP事件', tone: 'orange', chips: ['技术突破', '产业合作'] },
            { id: 'result', x: 454, y: 388, w: 196, h: 82, title: '合作成果', tone: 'gold', chips: ['论文12', '专利8', '项目5'] },
          ],
          edges: [
            { id: 'e1', path: 'M238 254 H292', label: '', labelX: 264, labelY: 240, tone: 'blue' },
            { id: 'e2', path: 'M512 254 H560', label: '', labelX: 536, labelY: 240, tone: 'purple' },
            { id: 'e3', path: 'M243 128 C242 170 270 184 335 220', label: '布局与参与', labelX: 286, labelY: 170, tone: 'blue' },
            { id: 'e4', path: 'M520 128 C522 170 500 184 468 220', label: '研究与推动', labelX: 510, labelY: 170, tone: 'purple' },
            { id: 'e5', path: 'M168 294 C168 340 188 362 220 388', label: '影响与驱动', labelX: 188, labelY: 334, tone: 'orange' },
            { id: 'e6', path: 'M636 294 C632 340 602 364 552 388', label: '产出与沉淀', labelX: 610, labelY: 334, tone: 'gold' },
            { id: 'e7', path: 'M250 428 C324 390 374 356 402 308', label: '影响与反馈', labelX: 336, labelY: 382, tone: 'orange', dashed: true },
            { id: 'e8', path: 'M506 388 C492 354 464 336 430 308', label: '影响与反馈', labelX: 470, labelY: 356, tone: 'gold', dashed: true },
          ],
        },
      },
    ],
  },
}

export function getPrototypeModule(key: string): ModulePrototype {
  return modulePrototypes[key] ?? modulePrototypes['node-indirect']
}
