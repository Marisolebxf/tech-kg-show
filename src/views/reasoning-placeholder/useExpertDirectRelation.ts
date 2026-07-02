import { computed, reactive, ref, watch } from 'vue'

import type {
  DirectRelationExpert,
  DirectRelationItem,
  DirectRelationQueryRequest,
  DirectRelationQueryResponse,
  DocField,
} from './expert-direct-types'

const ENDPOINT = '/api/v1/kg-construction/expert-direct'

const requestFields: DocField[] = [
  { name: 'expert_id', type: 'string', required: '是', description: '核心专家，算法测试中展示中文姓名，接口传参使用专家ID' },
  { name: 'start_time', type: 'string', required: '否', description: '查询开始时间，格式 YYYY-MM-DD' },
  { name: 'end_time', type: 'string', required: '否', description: '查询结束时间，格式 YYYY-MM-DD' },
  { name: 'organization', type: 'string', required: '否', description: '机构/项目关键词，算法测试中使用中文机构名称；与 expert_id 组合返回不同直接关系结果' },
]

const responseFields: DocField[] = [
  { name: 'expert_direct_relation', type: 'object', description: '当前查询的科技专家直接关系信息' },
  { name: 'items', type: 'array', description: '直接关系专家列表，与算法测试图谱节点、结构化详情保持一致' },
  { name: 'expert', type: 'array', description: '专家在不同时期的工作单位、部门、团队或项目组信息' },
  { name: 'graph', type: 'array', description: '图谱相关数据' },
  { name: 'detailRows', type: 'array', description: '结构化展示' },
]

type ExpertProfile = DirectRelationExpert & {
  department: string
  team_or_project: string
  start_time: string
  end_time: string
}

type RelationSeed = {
  key: string
  relationType: string
  expertB: DirectRelationExpert
  institution: string
  coPaperCount: number
  relationStrength: number
  reasonTags: string[]
  relationSummary: string
  collaborationScene: string
  cooperationTime: string
  cooperationOutcome: string
  relationStart: string
  relationEnd: string
}

type ExpertSeed = {
  expert: ExpertProfile
  relations: RelationSeed[]
}

const expertSeeds: Record<string, ExpertSeed> = {
  E10001: {
    expert: {
      expertId: 'E10001',
      name: '李佳宁',
      organization: '清华大学智能产业研究院',
      title: '研究员',
      paperCount: 86,
      citationCount: 1240,
      hIndex: 21,
      department: '知识图谱与智能推理中心',
      team_or_project: '智能科研协同平台建设项目',
      start_time: '2018-01',
      end_time: '至今',
    },
    relations: [
      {
        key: 'direct-e10001-paper',
        relationType: '论文合作关系',
        expertB: {
          expertId: 'E10002',
          name: '张明远',
          organization: '中国科学院自动化研究所',
          title: '研究员',
          paperCount: 112,
          citationCount: 1850,
          hIndex: 28,
        },
        institution: '中国科学院自动化研究所',
        coPaperCount: 8,
        relationStrength: 94,
        reasonTags: ['论文合作', '共同通讯作者', '知识图谱'],
        relationSummary: '论文合作',
        collaborationScene: '共同发表科技知识图谱与关系推理方向论文',
        cooperationTime: '2021-06 至 2024-12',
        cooperationOutcome: '共论文 8 篇，代表成果：面向科技知识图谱的关系推理研究',
        relationStart: '2021-06',
        relationEnd: '2024-12',
      },
      {
        key: 'direct-e10001-project',
        relationType: '项目合作关系',
        expertB: {
          expertId: 'E10003',
          name: '周欣怡',
          organization: '北京航空航天大学计算机学院',
          title: '教授',
          paperCount: 74,
          citationCount: 980,
          hIndex: 18,
        },
        institution: '智能决策联合实验室',
        coPaperCount: 3,
        relationStrength: 87,
        reasonTags: ['项目协作', '联合实验室', '算法评测'],
        relationSummary: '项目合作',
        collaborationScene: '智能决策联合实验室项目协作',
        cooperationTime: '2020-03 至 2023-12',
        cooperationOutcome: '智能科研协同平台建设项目，形成算法评测报告 5 份',
        relationStart: '2020-03',
        relationEnd: '2023-12',
      },
      {
        key: 'direct-e10001-patent',
        relationType: '专利合作关系',
        expertB: {
          expertId: 'E10004',
          name: '王启航',
          organization: '上海交通大学智能制造学院',
          title: '副教授',
          paperCount: 52,
          citationCount: 760,
          hIndex: 16,
        },
        institution: '上海交通大学智能制造学院',
        coPaperCount: 2,
        relationStrength: 81,
        reasonTags: ['专利共创', '成果转化'],
        relationSummary: '专利合作',
        collaborationScene: '联合申请图谱推理加速与知识融合相关专利',
        cooperationTime: '2022-01 至 2024-06',
        cooperationOutcome: '发明专利 2 件，其中 1 件进入产业化验证',
        relationStart: '2022-01',
        relationEnd: '2024-06',
      },
    ],
  },
  E20001: {
    expert: {
      expertId: 'E20001',
      name: '陈建国',
      organization: '浙江大学机器人研究院',
      title: '教授',
      paperCount: 94,
      citationCount: 1560,
      hIndex: 25,
      department: '智能机器人与具身智能团队',
      team_or_project: '机器人联合攻关项目',
      start_time: '2019-01',
      end_time: '至今',
    },
    relations: [
      {
        key: 'direct-e20001-paper',
        relationType: '论文合作关系',
        expertB: {
          expertId: 'E20002',
          name: '刘芳',
          organization: '哈尔滨工业大学机器人技术中心',
          title: '研究员',
          paperCount: 81,
          citationCount: 1320,
          hIndex: 22,
        },
        institution: '机器人联合创新中心',
        coPaperCount: 6,
        relationStrength: 91,
        reasonTags: ['论文合作', '共同实验室'],
        relationSummary: '论文合作',
        collaborationScene: '机器人感知与控制方向共同论文研究',
        cooperationTime: '2020-01 至 2025-12',
        cooperationOutcome: '联合发表机器人感知论文 6 篇，建设联合测试数据集 1 套',
        relationStart: '2020-01',
        relationEnd: '2025-12',
      },
      {
        key: 'direct-e20001-project',
        relationType: '项目合作关系',
        expertB: {
          expertId: 'E20003',
          name: '王启航',
          organization: '上海交通大学智能制造学院',
          title: '副教授',
          paperCount: 52,
          citationCount: 760,
          hIndex: 16,
        },
        institution: '具身智能攻关项目',
        coPaperCount: 2,
        relationStrength: 84,
        reasonTags: ['项目成员', '样机验证'],
        relationSummary: '项目合作',
        collaborationScene: '具身智能攻关项目中的算法与装备联合验证',
        cooperationTime: '2021-05 至 2024-10',
        cooperationOutcome: '完成服务机器人样机 2 台，提交项目验收材料 4 项',
        relationStart: '2021-05',
        relationEnd: '2024-10',
      },
      {
        key: 'direct-e20001-patent',
        relationType: '专利合作关系',
        expertB: {
          expertId: 'E20004',
          name: '赵清宁',
          organization: '灵动机器人有限公司',
          title: '高级工程师',
          paperCount: 24,
          citationCount: 280,
          hIndex: 9,
        },
        institution: '灵动机器人有限公司',
        coPaperCount: 1,
        relationStrength: 76,
        reasonTags: ['专利合作', '企业转化'],
        relationSummary: '专利合作',
        collaborationScene: '联合推进机器人末端执行器专利转化',
        cooperationTime: '2022-04 至 2025-03',
        cooperationOutcome: '联合申请专利 3 件，完成企业试制批次 2 次',
        relationStart: '2022-04',
        relationEnd: '2025-03',
      },
    ],
  },
  E30001: {
    expert: {
      expertId: 'E30001',
      name: '周子谦',
      organization: '复旦大学药学院',
      title: '研究员',
      paperCount: 67,
      citationCount: 1180,
      hIndex: 19,
      department: '药物靶点与转化医学团队',
      team_or_project: '药物靶点联合实验室',
      start_time: '2019-01',
      end_time: '至今',
    },
    relations: [
      {
        key: 'direct-e30001-paper',
        relationType: '论文合作关系',
        expertB: {
          expertId: 'E30002',
          name: '吴若彤',
          organization: '上海药物研究所',
          title: '副研究员',
          paperCount: 58,
          citationCount: 920,
          hIndex: 17,
        },
        institution: '上海药物研究所',
        coPaperCount: 7,
        relationStrength: 88,
        reasonTags: ['共同论文', '药物靶点'],
        relationSummary: '论文合作',
        collaborationScene: '药物靶点发现与验证方向共同研究',
        cooperationTime: '2019-01 至 2024-12',
        cooperationOutcome: '联合发表靶点验证论文 7 篇，形成实验数据集 2 套',
        relationStart: '2019-01',
        relationEnd: '2024-12',
      },
      {
        key: 'direct-e30001-project',
        relationType: '项目合作关系',
        expertB: {
          expertId: 'E30003',
          name: '林远航',
          organization: '中国科学院上海药物研究所',
          title: '研究员',
          paperCount: 73,
          citationCount: 1420,
          hIndex: 23,
        },
        institution: '药物靶点联合实验室',
        coPaperCount: 4,
        relationStrength: 85,
        reasonTags: ['项目合作', '临床前研究'],
        relationSummary: '项目合作',
        collaborationScene: '创新药物靶点筛选与临床前评价项目',
        cooperationTime: '2020-06 至 2025-06',
        cooperationOutcome: '完成候选靶点 4 个，提交项目阶段报告 3 份',
        relationStart: '2020-06',
        relationEnd: '2025-06',
      },
      {
        key: 'direct-e30001-patent',
        relationType: '专利合作关系',
        expertB: {
          expertId: 'E30004',
          name: '何嘉禾',
          organization: '同济大学生命科学学院',
          title: '教授',
          paperCount: 63,
          citationCount: 1010,
          hIndex: 20,
        },
        institution: '复旦大学药学院',
        coPaperCount: 1,
        relationStrength: 78,
        reasonTags: ['专利共创', '成果转化'],
        relationSummary: '专利合作',
        collaborationScene: '药物递送与靶向治疗相关专利合作',
        cooperationTime: '2021-08 至 2024-08',
        cooperationOutcome: '联合申请发明专利 2 件，转化意向 1 项',
        relationStart: '2021-08',
        relationEnd: '2024-08',
      },
    ],
  },
}

const organizationOptions = [
  '清华大学智能产业研究院',
  '中国科学院自动化研究所',
  '浙江大学机器人研究院',
]

const combinationCounts: Record<string, number[]> = {
  E10001: [6, 4, 5],
  E20001: [3, 7, 4],
  E30001: [5, 3, 6],
}

const syntheticExperts = [
  { name: '周威', title: '教授', organization: '北京航空航天大学计算机学院' },
  { name: '陈思远', title: '副研究员', organization: '中国科学院自动化研究所' },
  { name: '赵清宁', title: '高级工程师', organization: '灵动机器人有限公司' },
  { name: '马清源', title: '研究员', organization: '上海交通大学智能制造学院' },
  { name: '顾雨辰', title: '副教授', organization: '复旦大学药学院' },
  { name: '何嘉禾', title: '教授', organization: '同济大学生命科学学院' },
  { name: '韩思远', title: '副研究员', organization: '西安交通大学人工智能学院' },
  { name: '林远航', title: '研究员', organization: '中国科学院上海药物研究所' },
]

const syntheticRelationTypes = [
  { type: '论文合作关系', summary: '论文合作', tags: ['论文合作', '共同作者'], outcome: '联合发表高水平论文并形成持续合作团队' },
  { type: '项目合作关系', summary: '项目合作', tags: ['项目协作', '联合攻关'], outcome: '共同承担科研项目并完成阶段性验收' },
  { type: '专利合作关系', summary: '专利合作', tags: ['专利共创', '成果转化'], outcome: '联合申请发明专利并推进成果转化' },
  { type: '学术交流关系', summary: '学术交流', tags: ['学术交流', '会议报告'], outcome: '围绕前沿方向开展系列学术交流' },
  { type: '技术合作关系', summary: '技术合作', tags: ['技术合作', '平台共建'], outcome: '共建技术验证平台并输出技术报告' },
]

function buildSyntheticRelation(expertId: string, organization: string, index: number): RelationSeed {
  const expert = syntheticExperts[(index + expertId.charCodeAt(1) + organization.length) % syntheticExperts.length]
  const relation = syntheticRelationTypes[(index + organization.length) % syntheticRelationTypes.length]
  const startMonth = String((index % 9) + 1).padStart(2, '0')
  const endMonth = String(((index + 4) % 9) + 3).padStart(2, '0')
  return {
    key: `direct-${expertId}-${organization}-${index}`,
    relationType: relation.type,
    expertB: {
      expertId: `${expertId}-R${index}`,
      name: expert.name,
      organization: expert.organization,
      title: expert.title,
      paperCount: 36 + index * 7,
      citationCount: 420 + index * 160,
      hIndex: 10 + index,
    },
    institution: organization,
    coPaperCount: index + 2,
    relationStrength: 70 + index * 3,
    reasonTags: relation.tags,
    relationSummary: relation.summary,
    collaborationScene: `${organization}牵头的${relation.summary}场景`,
    cooperationTime: `2020-${startMonth} 至 2024-${endMonth}`,
    cooperationOutcome: relation.outcome,
    relationStart: `2020-${startMonth}`,
    relationEnd: `2024-${endMonth}`,
  }
}

function relationsForCombination(expertId: string, seed: ExpertSeed, organization: string) {
  const orgIndex = organizationOptions.indexOf(organization)
  if (orgIndex < 0) return seed.relations
  const count = combinationCounts[expertId]?.[orgIndex] ?? seed.relations.length
  return Array.from({ length: count }, (_, index) => {
    const relation = index < seed.relations.length ? seed.relations[index] : buildSyntheticRelation(expertId, organization, index)
    return {
      ...relation,
      key: `${relation.key}-${orgIndex}-${index}`,
      institution: organization,
      collaborationScene: `${organization}｜${relation.collaborationScene}`,
    }
  })
}
const timeOptions = {
  start_time: ['2018-01-01', '2019-01-01', '2020-01-01', '2021-01-01', '2022-01-01'],
  end_time: ['2023-12-31', '2024-12-31', '2025-12-31', '2026-12-31'],
}

function buildDetailRows(item: DirectRelationItem): [string, unknown][] {
  return [
    ['专家A', item.expertA.name],
    ['专家A职称', item.expertA.title],
    ['专家A机构', item.expertA.organization],
    ['关系专家', item.expertB.name],
    ['关系专家职称', item.expertB.title],
    ['关系专家机构', item.expertB.organization],
    ['关系类型', item.relationType],
    ['协作场景', item.collaborationScene],
    ['合作时间', item.cooperationTime],
    ['合作成果', item.cooperationOutcome],
    ['原因标签', item.reasonTags],
  ]
}

function normalizeDateBoundary(value: string, boundary: 'start' | 'end') {
  if (!value) return boundary === 'start' ? '0000-00-00' : '9999-99-99'
  if (/^\d{4}-\d{2}$/.test(value)) return boundary === 'start' ? `${value}-01` : `${value}-31`
  return value
}

function relationMatchesTime(item: DirectRelationItem, startTime: string, endTime: string) {
  const start = startTime ? normalizeDateBoundary(startTime, 'start') : '0000-00-00'
  const end = endTime ? normalizeDateBoundary(endTime, 'end') : '9999-99-99'
  return normalizeDateBoundary(item.relationEnd, 'end') >= start && normalizeDateBoundary(item.relationStart, 'start') <= end
}

function createItem(seed: RelationSeed, expertA: DirectRelationExpert, now: string): DirectRelationItem {
  const item: DirectRelationItem = {
    ...seed,
    expertA,
    lastUpdatedAt: now,
    detailRows: [],
  }
  item.detailRows = buildDetailRows(item)
  return item
}

function makeResponse(input: DirectRelationQueryRequest, now: string): DirectRelationQueryResponse | null {
  const seed = expertSeeds[input.expert_id.trim()]
  if (!seed) return null

  const relations = input.organization.trim()
    ? relationsForCombination(input.expert_id.trim(), seed, input.organization.trim())
    : seed.relations
  const items = relations
    .map((relation) => createItem(relation, seed.expert, now))
    .filter((item) => relationMatchesTime(item, input.start_time, input.end_time))

  if (!items.length) {
    return {
      expert_direct_relation: {
        expert_id: seed.expert.expertId,
        expert_name: seed.expert.name,
        title: seed.expert.title,
        organization: seed.expert.organization ?? '',
        relation_count: 0,
      },
      items: [],
      expert: [],
      graph: { nodes: [], edges: [] },
      detailRows: [],
    }
  }

  const nodes = [
    {
      id: seed.expert.expertId,
      type: 'expert',
      label: seed.expert.name,
      subtitle: seed.expert.title,
      data: { role: '专家A', organization: seed.expert.organization },
    },
    ...items.map((item, index) => ({
      id: item.expertB.expertId,
      type: 'expert',
      label: item.expertB.name,
      subtitle: item.expertB.title,
      data: { role: `专家${String.fromCharCode(66 + index)}`, organization: item.expertB.organization },
    })),
  ]

  const edges = items.map((item) => ({
    source: item.expertA.expertId,
    target: item.expertB.expertId,
    label: item.relationType,
    data: {
      strength: item.relationStrength,
      scene: item.collaborationScene,
      time: item.cooperationTime,
    },
  }))

  return {
    expert_direct_relation: {
      expert_id: seed.expert.expertId,
      expert_name: seed.expert.name,
      title: seed.expert.title,
      organization: seed.expert.organization ?? '',
      relation_count: items.length,
    },
    items,
    expert: [
      {
        expert_id: seed.expert.expertId,
        expert_name: seed.expert.name,
        title: seed.expert.title,
        organization: seed.expert.organization ?? '',
        department: seed.expert.department,
        team_or_project: seed.expert.team_or_project,
        start_time: seed.expert.start_time,
        end_time: seed.expert.end_time,
      },
      ...items.map((item) => ({
        expert_id: item.expertB.expertId,
        expert_name: item.expertB.name,
        title: item.expertB.title,
        organization: item.expertB.organization ?? '',
        department: '协作专家',
        team_or_project: item.institution ?? item.collaborationScene,
        start_time: item.relationStart,
        end_time: item.relationEnd,
      })),
    ],
    graph: { nodes, edges },
    detailRows: items.map((item) => item.detailRows),
  }
}

export function useExpertDirectRelation(enabled: () => boolean) {
  const form = reactive<DirectRelationQueryRequest>({
    expert_id: 'E10001',
    start_time: '2020-01-01',
    end_time: '2024-12-31',
    organization: '',
  })

  const loading = ref(false)
  const errorMessage = ref('')
  const response = ref<DirectRelationQueryResponse | null>(null)
  const fieldOptions = computed(() => ({
    expert_id: Object.keys(expertSeeds),
    organization: organizationOptions,
    start_time: timeOptions.start_time,
    end_time: timeOptions.end_time,
  }))

  function getNow() {
    return new Date().toLocaleString('zh-CN', { hour12: false })
  }

  function runQuery() {
    const expertId = form.expert_id.trim()
    if (!expertId || !expertSeeds[expertId]) {
      response.value = null
      errorMessage.value = '未在专家人才库中找到该专家，请检查专家ID是否正确。'
      return
    }

    const result = makeResponse(
      {
        expert_id: expertId,
        start_time: form.start_time.trim(),
        end_time: form.end_time.trim(),
        organization: form.organization.trim(),
      },
      getNow(),
    )

    if (!result?.items.length) {
      response.value = null
      errorMessage.value = '未查询到相关结果，请检查输入信息是否正确。'
      return
    }

    response.value = result
    errorMessage.value = ''
  }

  const execute = async () => {
    if (!enabled()) return
    loading.value = true
    runQuery()
    window.setTimeout(() => {
      loading.value = false
    }, 180)
  }

  const lastTestTime = computed(() => {
    const first = response.value?.items?.[0]?.lastUpdatedAt
    return first || '待执行'
  })

  const apiExampleText = computed(() =>
    JSON.stringify({ code: 0, data: response.value, message: errorMessage.value || 'success' }, null, 2),
  )

  const codeSamples = computed(() => {
    const payload = JSON.stringify({ ...form }, null, 2)
    return {
      python:
        `import json\nimport requests\n\nurl = "http://127.0.0.1:9002${ENDPOINT}"\npayload = ${payload}\n\nresponse = requests.post(url, json=payload, timeout=30)\nresponse.raise_for_status()\nprint(json.dumps(response.json(), ensure_ascii=False, indent=2))`,
      node:
        `const url = "http://127.0.0.1:9002${ENDPOINT}";\nconst payload = ${payload};\n\nasync function main() {\n  const response = await fetch(url, {\n    method: "POST",\n    headers: { "Content-Type": "application/json" },\n    body: JSON.stringify(payload),\n  });\n  if (!response.ok) throw new Error(\`HTTP \${response.status}\`);\n  console.log(await response.json());\n}\n\nmain().catch(console.error);`,
      curl:
        `curl -X POST "http://127.0.0.1:9002${ENDPOINT}" \\\n  -H "Content-Type: application/json" \\\n  -d '${payload}'`,
    }
  })

  watch(
    () => enabled(),
    (value) => {
      if (value) {
        void execute()
      }
    },
    { immediate: true },
  )

  return {
    endpoint: ENDPOINT,
    form,
    fieldOptions,
    loading,
    errorMessage,
    response,
    lastTestTime,
    apiExampleText,
    requestFields,
    responseFields,
    codeSamples,
    execute,
  }
}
