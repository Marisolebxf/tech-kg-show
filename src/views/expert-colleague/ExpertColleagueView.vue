<script setup lang="ts">
import { computed, ref, watch } from 'vue'

import iconClose from '../../assets/icons/icon-close.svg'
import iconCopy from '../../assets/icons/icon-copy.svg'
import iconInfo from '../../assets/icons/icon-info.svg'
import iconModalSetting from '../../assets/icons/icon-modal-setting.svg'
import iconSelectArrow from '../../assets/icons/icon-select-arrow.svg'
import flowReasoning from '../../assets/icons/技术方案-关系推理.svg'
import flowStandardize from '../../assets/icons/技术方案-标准化处理.svg'
import flowOutput from '../../assets/icons/技术方案-结果输出.svg'
import flowInput from '../../assets/icons/技术方案-输入数据.svg'
import flowArrow from '../../assets/icons/技术方案-箭头.svg'
import { inferenceResult } from './mock'

const activeView = ref<'test' | 'developer'>('test')
const resultMode = ref<'structured' | 'api'>('structured')
const activeCode = ref<'python' | 'node' | 'curl'>('python')
const result = ref({ ...inferenceResult })
const running = ref(false)
const copied = ref(false)
const showConfigModal = ref(false)
const showTechModal = ref(false)
const activeInterfaceKey = ref<'list' | 'detail'>('list')
const activeSampleIndex = ref(0)
const activeParamMenu = ref<string | null>(null)
const colleagueParams = ref<Record<string, string>>({
  expert_id: 'E10001',
  source_expert_id: 'E10001',
  target_expert_id: 'E10002',
  start_time: '2018-01-01',
  end_time: '2024-12-31',
  organization: '清华大学',
})
const colleagueErrorMessage = ref('')

type ColleagueExpert = {
  expert_id: string
  expert_name: string
  expert_title: string
}

type ColleagueAchievement = {
  achievement_id: string
  achievement_name: string
  achievement_type: string
  achievement_time: string
}

type ColleagueRelationResult = {
  colleague_expert: ColleagueExpert
  organization: string
  department: string
  team_or_project: string
  effective_start_time: string
  effective_end_time: string
  common_work_content: string
  collaboration_scenario: string
  cooperation_achievements: ColleagueAchievement[]
}

type ColleagueListData = {
  expert: ColleagueExpert
  work_history: Array<{
    organization: string
    department: string
    team_or_project: string
    start_time: string
    end_time: string
  }>
  organization_structure: Array<{
    organization: string
    department: string
    team_or_project: string
  }>
  colleague_relations: ColleagueRelationResult[]
  total: number
}

const colleagueSamples = [
  {
    name: '专家A｜清华知识工程团队',
    query: { expert_id: 'E10001', start_time: '2018-01-01', end_time: '2024-12-31', organization: '清华大学' },
    data: {
      expert: { expert_id: 'E10001', expert_name: '专家A', expert_title: '研究员' },
      work_history: [
        {
          organization: '清华大学',
          department: '计算机科学与技术系',
          team_or_project: '知识工程实验室',
          start_time: '2018-01',
          end_time: '2024-12',
        },
      ],
      organization_structure: [
        { organization: '清华大学', department: '计算机科学与技术系', team_or_project: '知识工程实验室' },
      ],
      colleague_relations: [
        {
          colleague_expert: { expert_id: 'E10002', expert_name: '专家B', expert_title: '副研究员' },
          organization: '清华大学',
          department: '计算机科学与技术系',
          team_or_project: '知识工程实验室',
          effective_start_time: '2019-01',
          effective_end_time: '2023-12',
          common_work_content: '共同参与知识图谱相关研究工作',
          collaboration_scenario: '同一团队科研协作',
          cooperation_achievements: [
            {
              achievement_id: 'A10001',
              achievement_name: '面向科技知识图谱的关系推理研究',
              achievement_type: '论文',
              achievement_time: '2021-06',
            },
          ],
        },
        {
          colleague_expert: { expert_id: 'E10003', expert_name: '专家C', expert_title: '教授' },
          organization: '清华大学',
          department: '计算机科学与技术系',
          team_or_project: '知识工程实验室',
          effective_start_time: '2020-03',
          effective_end_time: '2024-12',
          common_work_content: '共同承担科技知识组织与语义检索平台建设',
          collaboration_scenario: '同一项目组算法设计与系统联调',
          cooperation_achievements: [
            {
              achievement_id: 'A10002',
              achievement_name: '科技人才知识图谱语义检索平台',
              achievement_type: '项目',
              achievement_time: '2023-10',
            },
          ],
        },
        {
          colleague_expert: { expert_id: 'E10004', expert_name: '专家D', expert_title: '高级工程师' },
          organization: '清华大学',
          department: '计算机科学与技术系',
          team_or_project: '智能科研协同平台建设项目',
          effective_start_time: '2021-06',
          effective_end_time: '2024-06',
          common_work_content: '共同推进专家关系抽取与图谱质量评测',
          collaboration_scenario: '平台建设、数据治理与评测协作',
          cooperation_achievements: [
            {
              achievement_id: 'A10003',
              achievement_name: '专家关系图谱质量评测规范',
              achievement_type: '标准/报告',
              achievement_time: '2024-03',
            },
          ],
        },
      ],
      total: 3,
    } satisfies ColleagueListData,
  },
  {
    name: '专家A｜浙江机器人联合实验室',
    query: { expert_id: 'E20001', start_time: '2020-01-01', end_time: '2025-12-31', organization: '浙江大学' },
    data: {
      expert: { expert_id: 'E20001', expert_name: '专家A', expert_title: '教授' },
      work_history: [
        { organization: '浙江大学', department: '机器人研究院', team_or_project: '机器人联合实验室', start_time: '2020-01', end_time: '2025-12' },
      ],
      organization_structure: [
        { organization: '浙江大学', department: '机器人研究院', team_or_project: '机器人联合实验室' },
      ],
      colleague_relations: [
        {
          colleague_expert: { expert_id: 'E20002', expert_name: '专家B', expert_title: '研究员' },
          organization: '浙江大学',
          department: '机器人研究院',
          team_or_project: '机器人联合实验室',
          effective_start_time: '2021-03',
          effective_end_time: '2024-12',
          common_work_content: '共同开展具身智能感知与控制研究',
          collaboration_scenario: '联合实验室课题攻关',
          cooperation_achievements: [{ achievement_id: 'A20001', achievement_name: '面向服务机器人的多模态控制系统', achievement_type: '项目', achievement_time: '2024-05' }],
        },
        {
          colleague_expert: { expert_id: 'E20003', expert_name: '专家C', expert_title: '副教授' },
          organization: '浙江大学',
          department: '机器人研究院',
          team_or_project: '智能装备攻关项目组',
          effective_start_time: '2022-01',
          effective_end_time: '2025-06',
          common_work_content: '共同推进机器人样机验证与测试数据集建设',
          collaboration_scenario: '跨团队工程验证协作',
          cooperation_achievements: [{ achievement_id: 'A20002', achievement_name: '机器人感知测试数据集', achievement_type: '数据集', achievement_time: '2025-01' }],
        },
      ],
      total: 2,
    } satisfies ColleagueListData,
  },
  {
    name: '专家A｜复旦药物靶点项目组',
    query: { expert_id: 'E30001', start_time: '2019-01-01', end_time: '2024-12-31', organization: '复旦大学' },
    data: {
      expert: { expert_id: 'E30001', expert_name: '专家A', expert_title: '研究员' },
      work_history: [
        { organization: '复旦大学', department: '药学院', team_or_project: '药物靶点项目组', start_time: '2019-01', end_time: '2024-12' },
      ],
      organization_structure: [
        { organization: '复旦大学', department: '药学院', team_or_project: '药物靶点项目组' },
      ],
      colleague_relations: [
        {
          colleague_expert: { expert_id: 'E30002', expert_name: '专家B', expert_title: '副研究员' },
          organization: '复旦大学',
          department: '药学院',
          team_or_project: '药物靶点项目组',
          effective_start_time: '2020-06',
          effective_end_time: '2024-06',
          common_work_content: '共同参与药物靶点发现与验证研究',
          collaboration_scenario: '同一项目组实验设计与论文协作',
          cooperation_achievements: [{ achievement_id: 'A30001', achievement_name: '基于知识图谱的药物靶点发现方法', achievement_type: '论文', achievement_time: '2022-11' }],
        },
        {
          colleague_expert: { expert_id: 'E30003', expert_name: '专家C', expert_title: '博士后' },
          organization: '复旦大学',
          department: '药学院',
          team_or_project: '转化医学联合课题组',
          effective_start_time: '2021-09',
          effective_end_time: '2023-12',
          common_work_content: '共同整理靶点证据链并完成候选化合物筛选',
          collaboration_scenario: '课题组数据分析协作',
          cooperation_achievements: [{ achievement_id: 'A30002', achievement_name: '候选靶点证据链分析报告', achievement_type: '报告', achievement_time: '2023-08' }],
        },
      ],
      total: 2,
    } satisfies ColleagueListData,
  },
]

function replaceScenarioText(value: string) {
  return value
}

function replaceScenarioDeep<T>(value: T): T {
  if (typeof value === 'string') return replaceScenarioText(value) as T
  if (Array.isArray(value)) return value.map((item) => replaceScenarioDeep(item)) as T
  if (value && typeof value === 'object') {
    return Object.fromEntries(Object.entries(value).map(([key, item]) => [key, replaceScenarioDeep(item)])) as T
  }
  return value
}

function currentParameterValue(field: string) {
  return colleagueParams.value[field] ?? ''
}

function parameterOptionValues(field: string) {
  if (field === 'source_expert_id') return colleagueSamples.map((sample) => sample.query.expert_id)
  if (field === 'target_expert_id') {
    return Array.from(new Set(colleagueSamples.flatMap((sample) => sample.data.colleague_relations.map((relation) => relation.colleague_expert.expert_id))))
  }
  return Array.from(new Set(colleagueSamples.map((sample) => String(sample.query[field as keyof typeof sample.query] ?? '')).filter(Boolean)))
}

function handleParameterInput(field: string, event: Event) {
  const value = (event.target as HTMLInputElement).value
  colleagueParams.value = { ...colleagueParams.value, [field]: value }
}

function toggleParameterMenu(field: string) {
  activeParamMenu.value = activeParamMenu.value === field ? null : field
}

function selectParameterOption(field: string, value: string) {
  colleagueParams.value = { ...colleagueParams.value, [field]: value }
  activeParamMenu.value = null
}

function validateColleagueParams() {
  const fields = currentInterface.value.requestParams.map((param) => param.field)
  const query = Object.fromEntries(fields.map((field) => [field, currentParameterValue(field).trim()]))
  if (activeInterfaceKey.value === 'detail') {
    if (!query.source_expert_id || !query.target_expert_id) return '请输入源专家ID和目标专家ID。'
    const sampleIndex = colleagueSamples.findIndex((sample) => sample.query.expert_id === query.source_expert_id)
    const targetInLibrary = parameterOptionValues('target_expert_id').includes(query.target_expert_id)
    if (sampleIndex === -1 || !targetInLibrary) return '未在专家人才库中找到该专家，请检查专家ID是否正确。'
    const sample = colleagueSamples[sampleIndex]
    const matchedRelation = sample.data.colleague_relations.find((relation) => relation.colleague_expert.expert_id === query.target_expert_id)
    if (!matchedRelation) return '未查询到相关结果，请检查输入信息是否正确。'
    if (query.start_time && query.start_time !== sample.query.start_time) return '未查询到相关结果，请检查输入信息是否正确。'
    if (query.end_time && query.end_time !== sample.query.end_time) return '未查询到相关结果，请检查输入信息是否正确。'
    activeSampleIndex.value = sampleIndex
    return ''
  }

  if (!query.expert_id) return '请输入专家ID。'
  if (!parameterOptionValues('expert_id').includes(query.expert_id)) {
    return '未在专家人才库中找到该专家，请检查专家ID是否正确。'
  }
  const matchedSample = colleagueSamples.findIndex((sample) => {
    if (sample.query.expert_id !== query.expert_id) return false
    return ['start_time', 'end_time', 'organization'].every((field) => {
      const value = query[field]
      return !value || String(sample.query[field as keyof typeof sample.query] ?? '') === value
    })
  })
  if (matchedSample === -1) return '未查询到相关结果，请检查输入信息是否正确。'
  activeSampleIndex.value = matchedSample
  return ''
}

function syncInterfaceDefaults() {
  const sample = colleagueSamples[activeSampleIndex.value] ?? colleagueSamples[0]
  if (activeInterfaceKey.value === 'list') {
    colleagueParams.value = {
      ...colleagueParams.value,
      expert_id: colleagueParams.value.expert_id || sample.query.expert_id,
      start_time: colleagueParams.value.start_time || sample.query.start_time,
      end_time: colleagueParams.value.end_time || sample.query.end_time,
      organization: colleagueParams.value.organization || sample.query.organization,
    }
    return
  }
  const relation = sample.data.colleague_relations[0]
  colleagueParams.value = {
    ...colleagueParams.value,
    source_expert_id: colleagueParams.value.source_expert_id || sample.query.expert_id,
    target_expert_id: colleagueParams.value.target_expert_id || relation.colleague_expert.expert_id,
    start_time: colleagueParams.value.start_time || sample.query.start_time,
    end_time: colleagueParams.value.end_time || sample.query.end_time,
  }
}

function escapeHtml(value: string) {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
}

function highlightCode(value: string) {
  return escapeHtml(value)
    .replace(/("(?:\\.|[^"\\])*")(?=\s*:)/g, '<span class="code-token code-token--key">$1</span>')
    .replace(/(:\s*)("(?:\\.|[^"\\])*")/g, '$1<span class="code-token code-token--string">$2</span>')
    .replace(/\b(true|false|null)\b/g, '<span class="code-token code-token--literal">$1</span>')
    .replace(/\b(\d+(?:\.\d+)?)\b/g, '<span class="code-token code-token--number">$1</span>')
    .replace(/\b(import|const|await|fetch|print|response|payload|url|curl|POST)\b/g, '<span class="code-token code-token--keyword">$1</span>')
}

const colleagueInterfaces = [
  {
    key: 'list',
    featureName: '单专家同事关系查询接口',
    endpoint: '/api/expert-colleague-relation/list',
    method: 'POST',
    requestParams: [
      { field: 'expert_id', type: 'string', required: '是', description: '核心专家唯一标识' },
      { field: 'start_time', type: 'string', required: '否', description: '查询开始时间，格式 YYYY-MM' },
      { field: 'end_time', type: 'string', required: '否', description: '查询结束时间，格式 YYYY-MM' },
      { field: 'organization', type: 'string', required: '否', description: '工作单位关键词过滤' },
    ],
    responseFields: [
      { field: 'code', type: 'int', description: '业务状态码' },
      { field: 'message', type: 'string', description: '返回消息' },
      { field: 'data.expert', type: 'object', description: '核心专家基础信息' },
      { field: 'data.work_history', type: 'array', description: '专家工作经历' },
      { field: 'data.organization_structure', type: 'array', description: '机构架构信息' },
      { field: 'data.colleague_relations', type: 'array', description: '同事关系列表' },
      { field: 'data.total', type: 'number', description: '同事关系数量' },
    ],
  },
  {
    key: 'detail',
    featureName: '双专家同事关系详情接口',
    endpoint: '/api/expert-colleague-relation/detail',
    method: 'POST',
    requestParams: [
      { field: 'source_expert_id', type: 'string', required: '是', description: '源专家唯一标识' },
      { field: 'target_expert_id', type: 'string', required: '是', description: '目标专家唯一标识' },
      { field: 'start_time', type: 'string', required: '否', description: '查询开始时间，格式 YYYY-MM' },
      { field: 'end_time', type: 'string', required: '否', description: '查询结束时间，格式 YYYY-MM' },
    ],
    responseFields: [
      { field: 'code', type: 'int', description: '业务状态码' },
      { field: 'message', type: 'string', description: '返回消息' },
      { field: 'data.source_expert', type: 'object', description: '源专家基础信息' },
      { field: 'data.target_expert', type: 'object', description: '目标专家基础信息' },
      { field: 'data.has_colleague_relation', type: 'boolean', description: '是否存在同事关系' },
      { field: 'data.organization_structure', type: 'object', description: '机构架构信息' },
      { field: 'data.employment_time_match', type: 'object', description: '任职时间匹配结果' },
      { field: 'data.team_belonging_match', type: 'object', description: '团队归属匹配结果' },
      { field: 'data.colleague_relation', type: 'object', description: '同事关系详情' },
      { field: 'data.cooperation_achievements', type: 'array', description: '同事期间合作成果' },
    ],
  },
] as const

const currentInterface = computed(
  () => colleagueInterfaces.find((item) => item.key === activeInterfaceKey.value) ?? colleagueInterfaces[0],
)

type GraphNodeKind = 'expert' | 'organization' | 'field' | 'period' | 'achievement' | 'count'

interface GraphNode {
  id: string
  kind: GraphNodeKind
  variant?: 'blue' | 'green' | 'purple' | 'gold' | 'orange'
  x: number
  y: number
  width: number
  height: number
  title?: string
  subtitle?: string
  items?: string[]
  value?: number
}

interface GraphEdge {
  id: string
  source: string
  target: string
  relation: string
  path: string
  labelX: number
  labelY: number
  marker: 'blue' | 'purple' | 'green' | 'orange'
  dashed?: boolean
  labelVariant?: 'blue' | 'purple' | 'green' | 'orange'
}

const currentListData = computed(() => colleagueSamples[activeSampleIndex.value]?.data ?? colleagueSamples[0].data)

const currentDetailData = computed(() => {
  const sourceId = currentParameterValue('source_expert_id') || currentListData.value.expert.expert_id
  const targetId = currentParameterValue('target_expert_id')
  const sample = colleagueSamples.find((item) => item.query.expert_id === sourceId) ?? colleagueSamples[activeSampleIndex.value] ?? colleagueSamples[0]
  const relation = sample.data.colleague_relations.find((item) => item.colleague_expert.expert_id === targetId) ?? sample.data.colleague_relations[0]
  const work = sample.data.work_history[0]
  return {
    source_expert: sample.data.expert,
    target_expert: relation.colleague_expert,
    has_colleague_relation: true,
    organization_structure: {
      organization: relation.organization,
      department: relation.department,
      team_or_project: relation.team_or_project,
    },
    employment_time_match: {
      source_start_time: work.start_time,
      source_end_time: work.end_time,
      target_start_time: relation.effective_start_time,
      target_end_time: relation.effective_end_time,
      overlap_start_time: relation.effective_start_time,
      overlap_end_time: relation.effective_end_time,
    },
    team_belonging_match: {
      matched: true,
      team_or_project: relation.team_or_project,
    },
    colleague_relation: {
      organization: relation.organization,
      department: relation.department,
      team_or_project: relation.team_or_project,
      effective_start_time: relation.effective_start_time,
      effective_end_time: relation.effective_end_time,
      common_work_content: relation.common_work_content,
      collaboration_scenario: relation.collaboration_scenario,
    },
    cooperation_achievements: relation.cooperation_achievements,
  }
})

const colleagueNodePositions = [
  { x: 462, y: 40 },
  { x: 462, y: 218 },
  { x: 462, y: 396 },
]

const colleagueEdgePaths = [
  { path: 'M436 242 H450 V75 H462', labelX: 485, labelY: 158 },
  { path: 'M436 251 H462', labelX: 485, labelY: 236 },
  { path: 'M436 260 H450 V431 H462', labelX: 485, labelY: 358 },
]

function buildListGraphNodes(data: ColleagueListData): GraphNode[] {
  const work = data.work_history[0]
  return [
    {
      id: 'core-expert',
      kind: 'expert',
      variant: 'blue',
      x: 42,
      y: 218,
      width: 170,
      height: 72,
      title: `专家A：${data.expert.expert_name}`,
      subtitle: data.expert.expert_title,
    },
    {
      id: 'work-org',
      kind: 'organization',
      variant: 'purple',
      x: 238,
      y: 218,
      width: 198,
      height: 66,
      title: '所属团队/项目组：',
      subtitle: work.team_or_project,
    },
    {
      id: 'work-period',
      kind: 'period',
      variant: 'gold',
      x: 246,
      y: 386,
      width: 180,
      height: 58,
      title: '任职时段：',
      subtitle: `${work.start_time} - ${work.end_time}`,
    },
    {
      id: 'work-output',
      kind: 'achievement',
      variant: 'orange',
      x: 252,
      y: 54,
      width: 162,
      height: 88,
      title: '同事期间成果',
      items: ['论文', '项目', '报告'],
    },
    ...data.colleague_relations.slice(0, 3).map((relation, index) => {
      const position = colleagueNodePositions[index]
      return {
        id: `colleague-${index}`,
        kind: 'expert' as const,
        variant: 'green' as const,
        x: position.x,
        y: position.y,
        width: 168,
        height: 70,
        title: `专家${String.fromCharCode(66 + index)}：${relation.colleague_expert.expert_name}`,
        subtitle: relation.colleague_expert.expert_title,
      }
    }),
  ]
}

function buildListGraphEdges(data: ColleagueListData): GraphEdge[] {
  return [
    {
      id: 'core-employment',
      source: 'core-expert',
      target: 'work-org',
      relation: '任职',
      path: 'M212 254 H238',
      labelX: 225,
      labelY: 240,
      marker: 'blue',
      labelVariant: 'blue',
    },
    {
      id: 'period-list',
      source: 'work-org',
      target: 'work-period',
      relation: '任职时段',
      path: 'M337 284 V386',
      labelX: 366,
      labelY: 340,
      marker: 'blue',
      dashed: true,
    },
    {
      id: 'output-list',
      source: 'work-org',
      target: 'work-output',
      relation: '合作成果',
      path: 'M337 218 V142',
      labelX: 374,
      labelY: 178,
      marker: 'orange',
      labelVariant: 'orange',
    },
    ...data.colleague_relations.slice(0, 3).map((_, index) => {
      const edge = colleagueEdgePaths[index]
      return {
        id: `colleague-list-${index}`,
        source: 'work-org',
        target: `colleague-${index}`,
        relation: '同事关系',
        path: edge.path,
        labelX: edge.labelX,
        labelY: edge.labelY,
        marker: 'purple' as const,
        labelVariant: 'purple' as const,
      }
    }),
  ]
}

function buildDetailGraphNodes(): GraphNode[] {
  const detail = currentDetailData.value
  const achievements = detail.cooperation_achievements.map((item) => item.achievement_type).slice(0, 3)
  return [
    {
      id: 'expert-a',
      kind: 'expert',
      variant: 'blue',
      x: 70,
      y: 62,
      width: 172,
      height: 70,
      title: `专家A：${detail.source_expert.expert_name}`,
      subtitle: detail.source_expert.expert_title,
    },
    {
      id: 'expert-b',
      kind: 'expert',
      variant: 'green',
      x: 418,
      y: 62,
      width: 172,
      height: 70,
      title: `专家B：${detail.target_expert.expert_name}`,
      subtitle: detail.target_expert.expert_title,
    },
    {
      id: 'common-org',
      kind: 'organization',
      variant: 'purple',
      x: 220,
      y: 220,
      width: 220,
      height: 70,
      title: '共同团队/项目组：',
      subtitle: detail.organization_structure.team_or_project,
    },
    {
      id: 'overlap-period',
      kind: 'period',
      variant: 'gold',
      x: 238,
      y: 378,
      width: 184,
      height: 58,
      title: '同事关系时段：',
      subtitle: `${detail.colleague_relation.effective_start_time} - ${detail.colleague_relation.effective_end_time}`,
    },
    {
      id: 'achievements',
      kind: 'achievement',
      variant: 'orange',
      x: 440,
      y: 338,
      width: 160,
      height: 88,
      title: '同事期间成果',
      items: achievements.length ? achievements : ['论文', '项目'],
    },
    {
      id: 'scene',
      kind: 'field',
      variant: 'green',
      x: 52,
      y: 328,
      width: 150,
      height: 112,
      title: '协作场景',
      items: ['共同工作', '科研协作'],
    },
  ]
}

function buildDetailGraphEdges(): GraphEdge[] {
  return [
    {
      id: 'colleague',
      source: 'expert-a',
      target: 'expert-b',
      relation: '同事关系',
      path: 'M242 97 H418',
      labelX: 330,
      labelY: 82,
      marker: 'purple',
      labelVariant: 'purple',
    },
    {
      id: 'employment-a',
      source: 'expert-a',
      target: 'common-org',
      relation: '任职',
      path: 'M156 132 C176 174, 220 196, 278 220',
      labelX: 198,
      labelY: 176,
      marker: 'blue',
      labelVariant: 'blue',
    },
    {
      id: 'employment-b',
      source: 'expert-b',
      target: 'common-org',
      relation: '任职',
      path: 'M504 132 C482 174, 438 198, 382 220',
      labelX: 454,
      labelY: 176,
      marker: 'blue',
      labelVariant: 'blue',
    },
    {
      id: 'period',
      source: 'common-org',
      target: 'overlap-period',
      relation: '生效时段',
      path: 'M330 290 V378',
      labelX: 360,
      labelY: 336,
      marker: 'blue',
      dashed: true,
    },
    {
      id: 'scene',
      source: 'common-org',
      target: 'scene',
      relation: '协作场景',
      path: 'M220 270 C152 288, 106 306, 96 328',
      labelX: 130,
      labelY: 296,
      marker: 'green',
      labelVariant: 'green',
    },
    {
      id: 'achievement',
      source: 'common-org',
      target: 'achievements',
      relation: '合作成果',
      path: 'M440 270 C494 286, 526 312, 528 338',
      labelX: 520,
      labelY: 300,
      marker: 'orange',
      labelVariant: 'orange',
    },
  ]
}

const currentGraphNodes = computed(() =>
  activeInterfaceKey.value === 'list' ? buildListGraphNodes(currentListData.value) : buildDetailGraphNodes(),
)
const currentGraphEdges = computed(() =>
  activeInterfaceKey.value === 'list' ? buildListGraphEdges(currentListData.value) : buildDetailGraphEdges(),
)

const codeSamples = {
  python: `import requests

url = "http://localhost:3001/api/expert-colleague-relation/list"
payload = {
    "expert_id": "E10001",
    "start_time": "2018-01",
    "end_time": "2024-12",
    "organization": "清华大学"
}
headers = {"Content-Type": "application/json"}

response = requests.post(url, json=payload, headers=headers, timeout=15)
response.raise_for_status()
data = response.json()

print(data["data"]["expert"])
print(data["data"]["colleague_relations"])`,
  node: `const url = "http://localhost:3001/api/expert-colleague-relation/list";

const payload = {
  expert_id: "E10001",
  start_time: "2018-01",
  end_time: "2024-12",
  organization: "清华大学",
};

async function queryColleagueRelations() {
  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error(\`Request failed: \${response.status}\`);
  }

  const data = await response.json();
  console.log(data.data.expert, data.data.colleague_relations);
}

queryColleagueRelations().catch(console.error);`,
  curl: `curl -X POST "http://localhost:3001/api/expert-colleague-relation/list" \\
  -H "Content-Type: application/json" \\
  -d '{
    "expert_id": "E10001",
    "start_time": "2018-01",
    "end_time": "2024-12",
    "organization": "清华大学"
  }'`,
}

const detailCodeSamples = {
  python: `import requests

url = "http://localhost:3001/api/expert-colleague-relation/detail"
payload = {
    "source_expert_id": "E10001",
    "target_expert_id": "E10002",
    "start_time": "2018-01",
    "end_time": "2024-12"
}
print(requests.post(url, json=payload, timeout=15).json())`,
  node: `const response = await fetch("http://localhost:3001/api/expert-colleague-relation/detail", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    source_expert_id: "E10001",
    target_expert_id: "E10002",
    start_time: "2018-01",
    end_time: "2024-12",
  }),
});
console.log(await response.json());`,
  curl: `curl -X POST "http://localhost:3001/api/expert-colleague-relation/detail" \\
  -H "Content-Type: application/json" \\
  -d '{
    "source_expert_id": "E10001",
    "target_expert_id": "E10002",
    "start_time": "2018-01",
    "end_time": "2024-12"
  }'`,
}

const currentCodeSamples = computed(() =>
  activeInterfaceKey.value === 'list' ? codeSamples : detailCodeSamples,
)
const highlightedCodeSample = computed(() => highlightCode(currentCodeSamples.value[activeCode.value]))

const structuredRows = computed(() => {
  let rows: string[][]
  if (activeInterfaceKey.value === 'list') {
    const data = currentListData.value
    const work = data.work_history[0]
    rows = [
      ['同事关系数量', String(data.total)],
      ...data.colleague_relations.flatMap((relation, index) => {
        const expertLabel = `专家${String.fromCharCode(66 + index)}`
        const achievements = relation.cooperation_achievements
          .map((item) => `${item.achievement_name}（${item.achievement_type}，${item.achievement_time}）`)
          .join('；')
        return [
          ['专家A', data.expert.expert_name],
          ['专家A职称', data.expert.expert_title],
          ['专家A机构', work.organization],
          [expertLabel, relation.colleague_expert.expert_name],
          [`${expertLabel}职称`, relation.colleague_expert.expert_title],
          [`${expertLabel}机构`, relation.organization],
          [`${expertLabel}所属部门`, relation.department],
          [`${expertLabel}所属团队/项目组`, relation.team_or_project],
          [`${expertLabel}同事关系生效时段`, `${relation.effective_start_time} - ${relation.effective_end_time}`],
          [`${expertLabel}共同工作内容`, relation.common_work_content],
          [`${expertLabel}协作场景`, relation.collaboration_scenario],
          [`${expertLabel}合作成果`, achievements],
        ]
      }),
    ]
  } else {
    const detail = currentDetailData.value
    const achievements = detail.cooperation_achievements
      .map((item) => `${item.achievement_name}（${item.achievement_type}，${item.achievement_time}）`)
      .join('；')
    rows = [
      ['专家A', detail.source_expert.expert_name],
      ['专家A职称', detail.source_expert.expert_title],
      ['专家A机构', detail.organization_structure.organization],
      ['专家B', detail.target_expert.expert_name],
      ['专家B职称', detail.target_expert.expert_title],
      ['专家B机构', detail.organization_structure.organization],
      ['专家B所属部门', detail.organization_structure.department],
      ['专家B所属团队/项目组', detail.organization_structure.team_or_project],
      ['专家B同事关系生效时段', `${detail.colleague_relation.effective_start_time} - ${detail.colleague_relation.effective_end_time}`],
      ['专家B共同工作内容', detail.colleague_relation.common_work_content],
      ['专家B协作场景', detail.colleague_relation.collaboration_scenario],
      ['专家B合作成果', achievements],
    ]
  }
  return replaceScenarioDeep(rows)
})

const apiExampleText = computed(() => {
  if (activeInterfaceKey.value === 'list') {
    return JSON.stringify(
      {
        code: 0,
        data: currentListData.value,
        message: 'success',
      },
      null,
      2,
    )
  }
  return JSON.stringify(
    {
      code: 0,
      data: currentDetailData.value,
      message: 'success',
    },
    null,
    2,
  )
})
const highlightedApiExampleText = computed(() => highlightCode(apiExampleText.value))

function handleSearch() {
  colleagueErrorMessage.value = validateColleagueParams()
  running.value = true
  result.value = {
    ...result.value,
    lastTestTime: new Date().toLocaleString('zh-CN', {
      hour12: false,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    }),
  }
  resultMode.value = 'structured'
  window.setTimeout(() => {
    running.value = false
  }, 180)
}

async function handleCopyCode() {
  try {
    await navigator.clipboard?.writeText(currentCodeSamples.value[activeCode.value])
  } catch {
    // Ignore clipboard permission failures; keep the visual feedback for the prototype.
  }
  copied.value = true
  window.setTimeout(() => {
    copied.value = false
  }, 1200)
}

watch(activeInterfaceKey, () => {
  activeParamMenu.value = null
  syncInterfaceDefaults()
  handleSearch()
})

watch(activeSampleIndex, () => {
  handleSearch()
})
</script>

<template>
  <div class="expert-colleague">
    <header class="expert-colleague__toolbar">
      <div class="kg-tabs" role="tablist" aria-label="功能视图">
        <button
          class="kg-tabs__item"
          :class="{ 'is-active': activeView === 'test' }"
          type="button"
          @click="activeView = 'test'; activeInterfaceKey = 'list'"
        >
          算法测试
        </button>
        <button
          class="kg-tabs__item"
          :class="{ 'is-active': activeView === 'developer' }"
          type="button"
          @click="activeView = 'developer'"
        >
          开发者接口
        </button>
      </div>
      <button class="kg-button kg-button--text expert-colleague__tech" type="button" @click="showTechModal = true">
        <img :src="iconInfo" alt="" aria-hidden="true" />
        技术方案
      </button>
    </header>

    <section v-if="activeView === 'test'" class="search-panel-inline">
      <label class="search-panel-inline__field">
        <span>子功能名称：</span>
        <select v-model="activeInterfaceKey" class="select-with-icon">
          <option v-for="item in colleagueInterfaces" :key="item.key" :value="item.key">{{ item.featureName }}</option>
        </select>
        <img class="select-icon" :src="iconSelectArrow" alt="" aria-hidden="true" />
        <img class="field-info-icon" :src="iconInfo" alt="" aria-hidden="true" />
      </label>
      <div class="search-panel-inline__actions">
        <button class="kg-button kg-button--secondary" type="button" @click="showConfigModal = true">
          参数设置
        </button>
        <button class="kg-button" type="button" @click="handleSearch">
          {{ running ? '测试中...' : '执行测试' }}
        </button>
      </div>
    </section>

    <div v-if="activeView === 'test'" class="expert-colleague__main">
      <section class="kg-panel graph-panel">
        <div class="kg-panel__header">
          <h2 class="kg-panel__title">测试结果预览</h2>
          <div class="graph-panel__time">
            <span>最近测试时间：</span>
            <strong>{{ result.lastTestTime }}</strong>
          </div>
        </div>
        <div class="graph-panel__canvas kg-graph-canvas">
          <div v-if="colleagueErrorMessage" class="graph-panel__state graph-panel__state--error">
            <strong>查询失败</strong>
            <p>{{ colleagueErrorMessage }}</p>
          </div>
          <svg v-else class="colleague-graph-svg" viewBox="0 0 700 560" role="img" aria-label="科技专家同事关系推理结果">
            <defs>
              <marker id="arrow-blue-page" markerHeight="8" markerWidth="8" orient="auto" refX="7" refY="4">
                <path d="M0,0 L8,4 L0,8 Z" fill="#4080ff" />
              </marker>
              <marker id="arrow-purple-page" markerHeight="8" markerWidth="8" orient="auto" refX="7" refY="4">
                <path d="M0,0 L8,4 L0,8 Z" fill="#722ed1" />
              </marker>
              <marker id="arrow-green-page" markerHeight="8" markerWidth="8" orient="auto" refX="7" refY="4">
                <path d="M0,0 L8,4 L0,8 Z" fill="#00b42a" />
              </marker>
              <marker id="arrow-orange-page" markerHeight="8" markerWidth="8" orient="auto" refX="7" refY="4">
                <path d="M0,0 L8,4 L0,8 Z" fill="#ff7d00" />
              </marker>
            </defs>
            <g class="graph-edges">
              <template v-for="edge in currentGraphEdges" :key="edge.id">
                <path
                  class="edge"
                  :class="[`edge--${edge.marker}`, { 'edge--dash': edge.dashed }]"
                  :d="edge.path"
                  :marker-end="`url(#arrow-${edge.marker}-page)`"
                />
                <text
                  class="edge-label"
                  :class="edge.labelVariant ? `edge-label--${edge.labelVariant}` : ''"
                  :x="edge.labelX"
                  :y="edge.labelY"
                >
                  {{ edge.relation }}
                </text>
              </template>
            </g>

            <g class="graph-nodes">
              <g
                v-for="node in currentGraphNodes"
                :key="node.id"
                class="box"
                :class="[`box--${node.kind}`, node.variant ? `box--${node.variant}` : '']"
                :transform="`translate(${node.x} ${node.y})`"
              >
                <template v-if="node.kind === 'count'">
                  <rect :width="node.width" :height="node.height" rx="8" />
                  <text :x="node.width / 2" :y="node.height / 2 + 1">{{ node.value }}</text>
                </template>

                <template v-else-if="node.kind === 'field'">
                  <rect :width="node.width" :height="node.height" rx="6" />
                  <text :x="node.width / 2" y="26">{{ node.title }}</text>
                  <template v-for="(item, index) in node.items" :key="item">
                    <rect class="chip" :x="(node.width - 70) / 2" :y="42 + index * 30" width="70" height="26" rx="6" />
                    <text :x="node.width / 2" :y="60 + index * 30">{{ item }}</text>
                  </template>
                </template>

                <template v-else-if="node.kind === 'achievement'">
                  <rect :width="node.width" :height="node.height" rx="6" />
                  <text :x="node.width / 2" y="28">{{ node.title }}</text>
                  <template v-for="(item, index) in node.items" :key="item">
                    <rect class="result-chip" :x="18 + index * 42" y="46" width="36" height="34" rx="6" />
                    <text class="result-text" :x="36 + index * 42" y="68">{{ item }}</text>
                  </template>
                </template>

                <template v-else>
                  <rect :width="node.width" :height="node.height" rx="6" />
                  <text :x="node.width / 2" :y="node.kind === 'period' ? 24 : 27">{{ node.title }}</text>
                  <text :x="node.width / 2" :y="node.kind === 'period' ? 44 : 50">{{ node.subtitle }}</text>
                </template>
              </g>
            </g>
          </svg>
        </div>
      </section>

      <aside class="expert-colleague__side">
        <section class="kg-panel result-panel">
          <div class="kg-panel__header">
            <h2 class="kg-panel__title">结果详情</h2>
            <div class="result-panel__tabs">
              <button
                :class="{ 'is-active': resultMode === 'structured' }"
                type="button"
                @click="resultMode = 'structured'"
              >
                结构化结果
              </button>
              <button
                :class="{ 'is-active': resultMode === 'api' }"
                type="button"
                @click="resultMode = 'api'"
              >
                API结果示例
              </button>
            </div>
          </div>
          <div v-if="resultMode === 'structured' && colleagueErrorMessage" class="result-empty">
            <strong>查询失败</strong>
            <p>{{ colleagueErrorMessage }}</p>
          </div>
          <dl v-else-if="resultMode === 'structured'" class="result-panel__table scroll-on-demand">
            <div v-for="([label, value], index) in structuredRows" :key="`${label}-${index}`">
              <dt>{{ label }}</dt>
              <dd>{{ value }}</dd>
            </div>
          </dl>
          <pre v-else class="result-panel__code scroll-on-demand" v-html="highlightedApiExampleText"></pre>
        </section>
      </aside>
    </div>

    <section v-else class="developer-view">
      <div class="developer-view__meta">
        <label>
          <span>子功能名称：</span>
          <select v-model="activeInterfaceKey" class="select-with-icon">
            <option v-for="item in colleagueInterfaces" :key="item.key" :value="item.key">{{ item.featureName }}</option>
          </select>
          <img class="select-icon" :src="iconSelectArrow" alt="" aria-hidden="true" />
          <img class="field-info-icon" :src="iconInfo" alt="" aria-hidden="true" />
        </label>
        <label>
          <span>接口路径：</span>
          <input :value="currentInterface.endpoint" readonly />
        </label>
        <span>请求方法： {{ currentInterface.method }}</span>
      </div>
      <div class="developer-view__cards">
        <section class="kg-panel">
          <div class="kg-panel__header"><h2 class="kg-panel__title">请求参数</h2></div>
          <div class="developer-table-wrap scroll-on-demand">
            <table class="developer-table">
              <thead><tr><th>字段名</th><th>类型</th><th>必填</th><th>说明</th></tr></thead>
              <tbody>
                <tr v-for="param in currentInterface.requestParams" :key="param.field">
                  <td>{{ param.field }}</td>
                  <td>{{ param.type }}</td>
                  <td>{{ param.required }}</td>
                  <td>{{ param.description }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>
        <section class="kg-panel">
          <div class="kg-panel__header"><h2 class="kg-panel__title">返回字段</h2></div>
          <div class="developer-table-wrap scroll-on-demand">
            <table class="developer-table">
              <thead><tr><th>字段名</th><th>类型</th><th>说明</th></tr></thead>
              <tbody>
                <tr v-for="field in currentInterface.responseFields" :key="field.field">
                  <td>{{ field.field }}</td>
                  <td>{{ field.type }}</td>
                  <td>{{ field.description }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>
      </div>
      <section class="kg-panel developer-code">
        <div class="kg-panel__header">
          <h2 class="kg-panel__title">代码示例</h2>
          <div class="profile-card-like-tabs">
            <button :class="{ 'is-active': activeCode === 'python' }" type="button" @click="activeCode = 'python'">Python</button>
            <button :class="{ 'is-active': activeCode === 'node' }" type="button" @click="activeCode = 'node'">Node.js</button>
            <button :class="{ 'is-active': activeCode === 'curl' }" type="button" @click="activeCode = 'curl'">cURL</button>
          </div>
        </div>
        <button
          class="developer-code__copy"
          :class="{ 'is-copied': copied }"
          type="button"
          :aria-label="copied ? '复制成功' : '复制代码'"
          @click="handleCopyCode"
        >
          <span v-if="copied" aria-hidden="true">✓</span>
          <img v-else :src="iconCopy" alt="" aria-hidden="true" />
        </button>
        <pre class="scroll-on-demand" v-html="highlightedCodeSample"></pre>
      </section>
    </section>

    <div v-if="showConfigModal || showTechModal" class="modal-mask" @click.self="showConfigModal = false; showTechModal = false">
      <section v-if="showConfigModal" class="modal modal--config" role="dialog" aria-modal="true">
        <header class="modal__header">
          <h2><img :src="iconModalSetting" alt="" aria-hidden="true" />测试参数设置</h2>
          <div class="modal__header-extra">
            <span class="modal__required"><span>*</span> 为必填项</span>
            <button type="button" @click="showConfigModal = false">
              <img :src="iconClose" alt="" aria-hidden="true" />
            </button>
          </div>
        </header>
        <div class="modal__body config-form" @click="activeParamMenu = null">
          <p v-if="colleagueErrorMessage" class="config-form__error">{{ colleagueErrorMessage }}</p>
          <label v-for="param in currentInterface.requestParams" :key="param.field">
            <span><i>{{ param.required === '是' ? '*' : '' }}</i>{{ param.field }}</span>
            <input
              v-if="param.field.includes('time') || param.field.includes('Time')"
              :value="currentParameterValue(param.field)"
              type="date"
              @input="handleParameterInput(param.field, $event)"
            />
            <div v-else class="combo-field" @click.stop>
              <input
                :value="currentParameterValue(param.field)"
                :placeholder="`请选择或输入${param.field}`"
                @focus="activeParamMenu = param.field"
                @input="handleParameterInput(param.field, $event)"
              />
              <button class="combo-field__arrow" type="button" @click="toggleParameterMenu(param.field)">
                <img :src="iconSelectArrow" alt="" aria-hidden="true" />
              </button>
              <div v-if="activeParamMenu === param.field" class="combo-field__menu">
                <button
                  v-for="value in parameterOptionValues(param.field)"
                  :key="value"
                  type="button"
                  :class="{ 'is-selected': currentParameterValue(param.field) === value }"
                  @click="selectParameterOption(param.field, value)"
                >
                  {{ value }}
                </button>
              </div>
            </div>
          </label>
        </div>
        <footer class="modal__footer">
          <button class="kg-button kg-button--secondary" type="button" @click="showConfigModal = false">取消</button>
          <button class="kg-button" type="button" @click="showConfigModal = false; handleSearch()">保存并执行</button>
        </footer>
      </section>

      <section v-if="showTechModal" class="modal modal--tech" role="dialog" aria-modal="true">
        <header class="modal__header">
          <h2>技术方案</h2>
          <button type="button" @click="showTechModal = false">
            <img :src="iconClose" alt="" aria-hidden="true" />
          </button>
        </header>
        <div class="modal__body">
          <h3 class="modal__section-title">功能描述</h3>
          <p class="modal__desc">本模块基于专家任职履历、机构信息、部门与团队信息及成果数据，结合知识图谱中的组织与任命关系，识别并推断专家之间是否存在同事关系，并输出结构化结果。</p>
          <h3 class="modal__section-title">推理流程</h3>
          <div class="flow-steps">
            <div class="flow-step"><img class="flow-step__icon" :src="flowInput" alt="" aria-hidden="true" /><strong>输入数据</strong><span>接收专家ID及相关筛选参数</span></div>
            <img class="flow-step__arrow flow-step__arrow--one" :src="flowArrow" alt="" aria-hidden="true" />
            <div class="flow-step"><img class="flow-step__icon" :src="flowStandardize" alt="" aria-hidden="true" /><strong>标准化处理</strong><span>清洗并归一化参数</span></div>
            <img class="flow-step__arrow flow-step__arrow--two" :src="flowArrow" alt="" aria-hidden="true" />
            <div class="flow-step"><img class="flow-step__icon" :src="flowReasoning" alt="" aria-hidden="true" /><strong>关系推理</strong><span>基于时间重叠与团队归属规则</span></div>
            <img class="flow-step__arrow flow-step__arrow--three" :src="flowArrow" alt="" aria-hidden="true" />
            <div class="flow-step"><img class="flow-step__icon" :src="flowOutput" alt="" aria-hidden="true" /><strong>结果输出</strong><span>输出关系类型、时间区间等结构化结果</span></div>
          </div>
        </div>
      </section>
    </div>
  </div>
</template>

<style scoped>
.expert-colleague {
  display: flex;
  flex-direction: column;
  height: 100%;
  gap: 10px;
  color: var(--text-primary);
}

.expert-colleague__toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  min-height: 40px;
  padding: 0 14px;
}

.expert-colleague__tech {
  gap: 4px;
}

.expert-colleague__tech img {
  width: 14px;
  height: 14px;
  object-fit: contain;
}

.search-panel-inline {
  display: grid;
  grid-template-columns: 420px minmax(220px, 1fr);
  gap: 10px;
  align-items: end;
  min-height: 40px;
  padding: 0 14px 2px;
  font-size: 14px;
}

.search-panel-inline--compact {
  grid-template-columns: minmax(0, 1fr) max-content;
}

.search-panel-inline__summary {
  display: flex;
  min-width: 0;
  align-items: center;
  gap: 12px;
  color: var(--text-secondary);
}

.search-panel-inline__summary strong {
  flex: 0 0 auto;
  color: var(--text-primary);
  font-weight: 500;
}

.search-panel-inline__summary span {
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.search-panel-inline__field {
  position: relative;
  display: grid;
  grid-template-columns: max-content minmax(0, 1fr) 14px;
  align-items: center;
  gap: var(--space-8);
}

.search-panel-inline__field select {
  width: 100%;
  height: 32px;
  padding: 0 34px 0 var(--space-12);
  border: 1px solid var(--border-strong);
  border-radius: var(--radius-sm);
  background: var(--surface);
  color: var(--text-primary);
}

.select-with-icon {
  appearance: none;
  -webkit-appearance: none;
  background-image: none;
  cursor: pointer;
}

.select-icon,
.calendar-icon {
  position: absolute;
  right: 10px;
  width: 14px;
  height: 14px;
  pointer-events: none;
  object-fit: contain;
}

.select-icon {
  top: 50%;
  transform: translateY(-50%);
}

.search-panel-inline__field .select-icon,
.developer-view__meta label .select-icon {
  right: 28px;
}

.field-info-icon {
  width: 14px;
  height: 14px;
  object-fit: contain;
}

.search-panel-inline__actions {
  display: flex;
  justify-content: flex-end;
  gap: var(--space-16);
}

.expert-colleague__main {
  display: grid;
  grid-template-columns: minmax(0, 1.6fr) minmax(0, 1fr);
  gap: var(--space-16);
  flex: 1;
  min-height: 0;
  padding: var(--space-16);
  border-radius: var(--radius-md);
  background: var(--surface-subtle);
  overflow: hidden;
}

.expert-colleague__side {
  display: flex;
  flex-direction: column;
  gap: var(--space-12);
  min-height: 0;
  overflow: hidden;
}

.graph-panel,
.result-panel {
  display: flex;
  flex-direction: column;
  height: 100%;
  min-height: 0;
  overflow: hidden;
}

.graph-panel__time {
  display: flex;
  gap: var(--space-12);
  color: var(--text-tertiary);
}

.graph-panel__time strong {
  font-weight: 400;
}

.graph-panel__canvas {
  display: grid;
  place-items: center;
  height: calc(100% - 68px);
  min-height: 0;
  margin: 0 var(--space-16) var(--space-16);
  padding: var(--space-16);
  overflow: hidden;
}

.graph-panel__canvas svg {
  display: block;
  width: min(100%, 980px);
  height: auto;
  max-height: min(100%, 720px);
  aspect-ratio: 700 / 560;
}

.graph-panel__state {
  display: grid;
  width: 360px;
  min-height: 180px;
  place-items: center;
  padding: 24px;
  border: 1px dashed #b5d3fc;
  border-radius: 18px;
  color: var(--text-secondary);
  text-align: center;
  line-height: 1.7;
}

.graph-panel__state--error {
  border-color: #ffccc7;
  background: #fff2f0;
}

.graph-panel__state strong {
  color: var(--text-primary);
  font-size: 18px;
}

.graph-panel__state p {
  margin: 0;
}

.edge {
  fill: none;
  stroke-width: 2;
}

.edge--blue {
  stroke: var(--graph-blue);
}

.edge--purple {
  stroke: var(--graph-purple);
}

.edge--green {
  stroke: var(--graph-green);
}

.edge--orange {
  stroke: var(--graph-orange);
}

.edge--dash {
  stroke: var(--text-tertiary);
  stroke-dasharray: 5 5;
}

.edge--dash.edge--orange {
  stroke: var(--graph-orange);
}

.edge-label {
  paint-order: stroke;
  stroke: #ffffff;
  stroke-width: 5px;
  stroke-linejoin: round;
  fill: var(--text-secondary);
  font-size: 12px;
  text-anchor: middle;
}

.edge-label--blue {
  fill: #1d4ed8;
}

.edge-label--purple {
  fill: #722ed1;
}

.edge-label--green {
  fill: #237804;
}

.edge-label--orange {
  fill: #d46b08;
}

.box rect {
  fill: #f8fbff;
  stroke: var(--graph-blue);
  stroke-width: 1.4;
}

.box text {
  fill: #174ea6;
  font-size: 11px;
  font-weight: 500;
  text-anchor: middle;
  dominant-baseline: middle;
}

.box--green rect {
  fill: #f5fff7;
  stroke: var(--graph-green);
}

.box--green text {
  fill: #237804;
}

.box--purple rect {
  fill: #fbf7ff;
  stroke: #b37feb;
}

.box--purple text {
  fill: #722ed1;
}

.box--gold rect {
  fill: #fffbe6;
  stroke: var(--graph-gold);
}

.box--gold text {
  fill: #ad6800;
}

.box--orange rect {
  fill: #fff7ed;
  stroke: var(--graph-orange);
}

.box--orange text {
  fill: #d46b08;
}

.box .chip,
.box .result-chip {
  fill: var(--surface);
}

.box .chip {
  stroke: #95de64;
}

.box .result-chip {
  stroke: var(--graph-orange);
}

.box .result-text {
  fill: #ff4d00;
  font-size: 11px;
}

.box--count rect {
  fill: #f8fbff;
  stroke: var(--graph-blue);
}

.box--count text {
  fill: var(--primary);
  font-size: 13px;
  font-weight: 500;
  text-anchor: middle;
  dominant-baseline: middle;
}

.box--count.box--green rect {
  fill: var(--success-subtle);
  stroke: var(--graph-green);
}

.box--count.box--green text {
  fill: #237804;
}

.box--count.box--orange rect {
  fill: var(--warning-subtle);
  stroke: var(--graph-orange);
}

.box--count.box--orange text {
  fill: #d46b08;
}

.result-panel__tabs,
.profile-card-like-tabs {
  display: inline-flex;
  align-items: center;
  padding: 2px;
  border-radius: var(--radius-sm);
  background: var(--surface-subtle);
}

.result-panel__tabs button,
.profile-card-like-tabs button {
  height: 28px;
  padding: 0 var(--space-12);
  border: 0;
  border-radius: var(--radius-sm);
  cursor: pointer;
  color: var(--text-secondary);
  background: transparent;
  font-size: 16px;
}

.result-panel__tabs button.is-active,
.profile-card-like-tabs button.is-active {
  color: var(--primary);
  background: var(--surface);
  font-weight: 500;
}

.result-panel__table {
  flex: 1;
  min-height: 0;
  margin: 0;
  overflow: auto;
  overscroll-behavior: contain;
}

.result-panel__table div {
  display: grid;
  grid-template-columns: 150px minmax(0, 1fr);
  min-height: 44px;
  border-bottom: 1px solid var(--border);
}

.result-panel__table dt,
.result-panel__table dd {
  display: flex;
  align-items: center;
  margin: 0;
  padding: 0 var(--space-16);
  font-size: 16px;
}

.result-panel__table dt {
  justify-content: flex-end;
  border-right: 1px solid var(--border);
  color: var(--text-tertiary);
}

.result-panel__table dd {
  color: var(--text-primary);
  line-height: 1.5;
  overflow-wrap: anywhere;
}

.result-panel__tag {
  display: inline-flex;
  align-items: center;
  height: 24px;
  margin-right: var(--space-8);
  padding: 0 var(--space-8);
  border-radius: var(--radius-sm);
  background: var(--surface-muted);
  font-size: 12px;
}

.result-empty {
  display: grid;
  flex: 1;
  min-height: 0;
  place-content: center;
  padding: 24px;
  color: var(--text-secondary);
  text-align: center;
}

.result-empty strong {
  margin-bottom: 8px;
  color: var(--text-primary);
  font-size: 16px;
  font-weight: 500;
}

.result-empty p {
  margin: 0;
  color: var(--text-tertiary);
  line-height: 1.7;
}

.result-panel__code {
  flex: 1;
  min-height: 0;
  margin: 0;
  padding: var(--space-16) 24px;
  overflow: auto;
  overscroll-behavior: contain;
  color: #52c41a;
  background: var(--surface);
  font-family: "SFMono-Regular", Consolas, "Liberation Mono", monospace;
  font-size: 13px;
  line-height: 24px;
  white-space: pre-wrap;
}

.developer-view {
  position: relative;
  display: grid;
  grid-template-rows: 40px minmax(0, 1.35fr) minmax(0, 1fr);
  gap: 12px;
  flex: 1;
  min-height: 0;
  padding: 0 14px 14px;
  overflow: hidden;
}

.developer-view::before {
  position: absolute;
  z-index: 0;
  top: 52px;
  right: 14px;
  bottom: 14px;
  left: 14px;
  border-radius: var(--radius-md);
  background: var(--surface-subtle);
  content: "";
}

.developer-view > * {
  position: relative;
  z-index: 1;
}

.developer-view__meta {
  display: grid;
  grid-template-columns: 420px 1fr 160px;
  gap: 36px;
  align-items: center;
  min-height: 40px;
  font-size: 14px;
}

.developer-view__meta label {
  position: relative;
  display: grid;
  grid-template-columns: max-content minmax(0, 1fr) 14px;
  align-items: center;
  gap: var(--space-8);
}

.developer-view__meta input,
.developer-view__meta select,
.config-form input,
.config-form select {
  height: 32px;
  padding: 0 var(--space-12);
  border: 1px solid var(--border-strong);
  border-radius: var(--radius-sm);
  background: var(--surface);
  color: var(--text-primary);
}

.developer-view__meta select,
.config-form select {
  appearance: none;
  -webkit-appearance: none;
  background-image: none;
  padding-right: 34px;
}

.developer-view__meta input[readonly] {
  color: var(--text-primary);
}

.developer-view__cards {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
  min-height: 0;
  padding: 12px 12px 0;
  overflow: hidden;
}

.developer-view__cards > .kg-panel {
  overflow: hidden;
}

.developer-table {
  width: 100%;
  table-layout: fixed;
  border-collapse: collapse;
}

.developer-table-wrap {
  height: calc(100% - 52px);
  margin: 0 6px var(--space-16);
  overflow: auto;
}

.developer-table th,
.developer-table td {
  min-height: 34px;
  padding: 8px 12px;
  border-bottom: 1px solid var(--border);
  font-size: 14px;
  line-height: 20px;
  text-align: left;
  vertical-align: top;
}

.developer-table thead th {
  position: sticky;
  top: 0;
  z-index: 1;
  white-space: nowrap;
}

.developer-table th {
  color: var(--text-secondary);
  background: var(--surface-muted);
  font-weight: 400;
}

.developer-table td {
  color: var(--text-primary);
  overflow-wrap: anywhere;
  word-break: break-word;
  white-space: normal;
}

.developer-table th:nth-child(1),
.developer-table td:nth-child(1) {
  width: 34%;
}

.developer-table th:nth-child(2),
.developer-table td:nth-child(2) {
  width: 18%;
}

.developer-table th:nth-child(3),
.developer-table td:nth-child(3) {
  width: 12%;
}

.developer-table th:nth-child(4),
.developer-table td:nth-child(4) {
  width: 36%;
}

.developer-view__cards .kg-panel:nth-child(2) .developer-table th:nth-child(1),
.developer-view__cards .kg-panel:nth-child(2) .developer-table td:nth-child(1) {
  width: 46%;
}

.developer-view__cards .kg-panel:nth-child(2) .developer-table th:nth-child(2),
.developer-view__cards .kg-panel:nth-child(2) .developer-table td:nth-child(2) {
  width: 16%;
}

.developer-view__cards .kg-panel:nth-child(2) .developer-table th:nth-child(3),
.developer-view__cards .kg-panel:nth-child(2) .developer-table td:nth-child(3) {
  width: 38%;
}

.developer-code {
  display: flex;
  flex-direction: column;
  position: relative;
  min-height: 0;
  height: 100%;
  margin: 0 var(--space-16) var(--space-16);
  overflow: hidden;
}

.developer-code__copy {
  position: absolute;
  right: 22px;
  bottom: 22px;
  z-index: 1;
  display: grid;
  width: 40px;
  height: 40px;
  place-items: center;
  border: 0;
  border-radius: 50%;
  cursor: pointer;
  background: var(--surface);
  box-shadow: 0 8px 18px rgba(29, 33, 41, 0.16);
}

.developer-code__copy img {
  width: 16px;
  height: 16px;
  object-fit: contain;
}

.developer-code__copy span {
  color: var(--success);
  font-size: 20px;
  line-height: 1;
  font-weight: 600;
}

.developer-code__copy.is-copied {
  box-shadow: 0 8px 18px rgba(0, 180, 42, 0.18);
}

.developer-code pre {
  flex: 1;
  min-height: 0;
  margin: 0;
  padding: var(--space-16) 32px;
  overflow: auto;
  overscroll-behavior: contain;
  color: #95c47a;
  font-size: 13px;
  line-height: 24px;
  white-space: pre;
}

.developer-code pre::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}

.result-panel__code :deep(.code-token--key),
.developer-code pre :deep(.code-token--key) {
  color: #7c3aed;
}

.result-panel__code :deep(.code-token--string),
.developer-code pre :deep(.code-token--string) {
  color: #047857;
}

.result-panel__code :deep(.code-token--number),
.developer-code pre :deep(.code-token--number) {
  color: #d97706;
}

.result-panel__code :deep(.code-token--literal),
.developer-code pre :deep(.code-token--literal),
.result-panel__code :deep(.code-token--keyword),
.developer-code pre :deep(.code-token--keyword) {
  color: #2563eb;
}

.scroll-on-demand {
  scrollbar-width: thin;
  scrollbar-color: transparent transparent;
  scrollbar-gutter: stable;
}

.scroll-on-demand::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}

.scroll-on-demand::-webkit-scrollbar-track {
  background: transparent;
}

.scroll-on-demand::-webkit-scrollbar-thumb {
  border-radius: 999px;
  background: transparent;
}

.scroll-on-demand::-webkit-scrollbar-button {
  display: none;
  width: 0;
  height: 0;
}

.scroll-on-demand.kg-is-scrolling {
  scrollbar-width: thin;
  scrollbar-color: #c9cdd4 transparent;
}

.scroll-on-demand.kg-is-scrolling::-webkit-scrollbar-thumb {
  background: #c9cdd4;
}

.profile-card-like-tabs {
  display: inline-flex;
  padding: 2px;
  background: var(--surface-subtle);
}

.profile-card-like-tabs button {
  height: 28px;
  padding: 0 var(--space-12);
  border: 0;
  background: transparent;
  color: var(--text-secondary);
}

.profile-card-like-tabs .is-active {
  color: var(--primary);
  background: var(--surface);
}

.modal-mask {
  position: fixed;
  inset: 0;
  z-index: 20;
  display: grid;
  place-items: center;
  background: rgba(29, 33, 41, 0.42);
}

.modal {
  overflow: hidden;
  border-radius: var(--radius-lg);
  background: var(--surface);
  box-shadow: 0 18px 48px rgba(29, 33, 41, 0.2);
}

.modal--config {
  width: 560px;
}

.modal--tech {
  width: 780px;
}

.modal__header,
.modal__footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  min-height: 56px;
  padding: 0 var(--space-16);
  border-bottom: 1px solid var(--border);
}

.modal__header h2 {
  display: inline-flex;
  align-items: center;
  gap: var(--space-8);
  margin: 0;
  color: var(--text-primary);
  font-size: 16px;
  font-weight: 500;
}

.modal__header h2 img {
  width: 24px;
  height: 24px;
  object-fit: contain;
}

.modal__header button {
  display: grid;
  width: 28px;
  height: 28px;
  place-items: center;
  border: 0;
  cursor: pointer;
  color: var(--text-tertiary);
  background: transparent;
  font-size: 24px;
}

.modal__header button img {
  width: 16px;
  height: 16px;
  object-fit: contain;
}

.modal__header-extra {
  display: inline-flex;
  align-items: center;
  gap: var(--space-12);
}

.modal__required {
  color: var(--text-tertiary);
  font-size: 12px;
  line-height: 20px;
}

.modal__required span {
  color: var(--danger);
}

.modal__body {
  padding: var(--space-16);
}

.modal__footer {
  justify-content: flex-end;
  gap: var(--space-12);
  border-top: 1px solid var(--border);
  border-bottom: 0;
}

.config-form {
  display: grid;
  gap: var(--space-16);
}

.config-form__error {
  margin: 0;
  padding: 10px 12px;
  border: 1px solid #ffccc7;
  border-radius: var(--radius-sm);
  background: #fff2f0;
  color: #cf1322;
  font-size: 13px;
  line-height: 20px;
}

.config-form label {
  position: relative;
  display: grid;
  grid-template-columns: 96px 1fr;
  align-items: center;
  gap: var(--space-8);
}

.config-form label > span {
  display: inline-flex;
  align-items: center;
  color: #86909c;
  font-weight: 400;
}

.config-form label > span i {
  width: 10px;
  font-style: normal;
  color: var(--danger);
}

.config-form input::placeholder {
  color: #86909c;
  opacity: 1;
}

.config-form select:invalid,
.config-form input {
  font-weight: 400;
}

.config-form input,
.config-form select {
  color: #86909c;
  font-weight: 400;
}

.combo-field {
  position: relative;
  min-width: 0;
}

.combo-field input {
  width: 100%;
  padding-right: 38px;
}

.combo-field__arrow {
  position: absolute;
  top: 50%;
  right: 1px;
  z-index: 2;
  display: grid;
  width: 36px;
  height: calc(var(--control-height) - 2px);
  place-items: center;
  border: 0;
  border-radius: 0 var(--radius-sm) var(--radius-sm) 0;
  cursor: pointer;
  background: transparent;
  transform: translateY(-50%);
}

.combo-field__arrow img {
  width: 14px;
  height: 14px;
}

.combo-field__menu {
  position: absolute;
  z-index: 36;
  top: calc(100% + 6px);
  right: 0;
  left: 0;
  display: grid;
  max-height: 186px;
  padding: 6px;
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  background: var(--surface);
  box-shadow: 0 12px 30px rgba(29, 33, 41, 0.14);
  overflow-y: auto;
}

.combo-field__menu button {
  min-height: 34px;
  padding: 0 10px;
  border: 0;
  border-radius: var(--radius-sm);
  background: transparent;
  color: var(--text-secondary);
  font-size: 14px;
  text-align: left;
  cursor: pointer;
}

.combo-field__menu button:hover,
.combo-field__menu button.is-selected {
  background: var(--surface-subtle);
  color: var(--primary);
}

.date-field {
  position: relative;
  min-width: 0;
}

.date-field input {
  width: 100%;
  padding-right: 42px;
}

.date-field__icon {
  position: absolute;
  top: 50%;
  right: 1px;
  z-index: 2;
  display: grid;
  width: 40px;
  height: calc(var(--control-height) - 2px);
  place-items: center;
  border: 0;
  border-radius: 0 var(--radius-sm) var(--radius-sm) 0;
  cursor: pointer;
  background: transparent;
  transform: translateY(-50%);
}

.date-field__icon .calendar-icon {
  position: static;
  width: 16px;
  height: 16px;
}

.config-form input::placeholder {
  color: #86909c;
  opacity: 1;
}

.config-form option {
  color: #86909c;
}

.config-form .select-icon {
  right: 10px;
}

.calendar-icon {
  top: 9px;
}

.modal__section-title {
  position: relative;
  margin: 0 0 var(--space-12);
  padding-left: var(--space-12);
  font-size: 14px;
  font-weight: 500;
}

.modal__section-title::before {
  position: absolute;
  left: 0;
  width: 3px;
  height: 16px;
  border-radius: 2px;
  background: var(--primary);
  content: "";
}

.modal__desc {
  margin: 0 0 var(--space-20);
  padding: var(--space-16);
  border-radius: var(--radius-md);
  color: var(--text-secondary);
  background: var(--surface-subtle);
  line-height: 24px;
}

.flow-steps {
  position: relative;
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: var(--space-16);
}

.flow-step {
  min-height: 136px;
  padding: var(--space-16);
  border: 1px solid var(--border);
  border-radius: var(--radius-md);
  background: var(--surface);
  text-align: center;
}

.flow-step__icon {
  display: block;
  width: 38px;
  height: 38px;
  margin: 0 auto var(--space-12);
  object-fit: contain;
}

.flow-step__arrow {
  position: absolute;
  top: 67px;
  width: 14px;
  height: 9px;
  object-fit: contain;
  opacity: 0.86;
}

.flow-step__arrow--one {
  left: calc(25% - 15px);
}

.flow-step__arrow--two {
  left: calc(50% - 7px);
}

.flow-step__arrow--three {
  left: calc(75% + 1px);
}

.flow-steps strong,
.flow-steps span {
  display: block;
}

.flow-steps strong {
  margin-bottom: var(--space-12);
}

.flow-steps span {
  color: var(--text-secondary);
  line-height: 22px;
}
</style>
