<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'

import iconClose from '../../assets/icons/icon-close.svg'
import iconCopy from '../../assets/icons/icon-copy.svg'
import iconInfo from '../../assets/icons/icon-info.svg'
import iconModalSetting from '../../assets/icons/icon-modal-setting.svg'
import iconSelectArrow from '../../assets/icons/icon-select-arrow.svg'

type SubKey = 'build' | 'annotate' | 'analyze'

interface GraphNode {
  key: string
  title: string
  subtitle: string
  relation?: string
  x: number
  y: number
  width: number
  height: number
  kind: 'expert' | 'company'
}

const GW = 1320
const GH = 960

const mainTab = ref<'test' | 'developer'>('test')
const resultTab = ref<'structured' | 'api'>('structured')
const activeCode = ref<'python' | 'node' | 'curl'>('python')
const showConfig = ref(false)
const showTech = ref(false)
const copied = ref(false)

const subFunctions = [
  {
    key: 'build' as SubKey,
    name: '专家-企业关系构建',
    endpoint: '/v1/kg-construction/expert-enterprise-relations/build',
  },
  {
    key: 'annotate' as SubKey,
    name: '角色与合作详情标注',
    endpoint: '/v1/kg-construction/relation-detail-annotations/annotate',
  },
  {
    key: 'analyze' as SubKey,
    name: '企业背景关联分析',
    endpoint: '/v1/kg-construction/enterprise-background-analyses/analyze',
  },
]
const activeSub = ref<SubKey>('build')
const currentSub = computed(
  () => subFunctions.find((s) => s.key === activeSub.value) ?? subFunctions[0],
)
// http 客户端 baseURL 为 '/api'，endpoint 用 '/v1/...'；显示与代码示例用完整 '/api/v1/...' 路径
const apiPath = computed(() => '/api' + currentSub.value.endpoint)

interface OptionItem {
  value?: string
  label?: string
  scholarId?: string
  name?: string
  enterpriseId?: string
  relationId?: string
}
interface Options {
  scholars: OptionItem[]
  enterprises: OptionItem[]
  edges: OptionItem[]
  relationTypes: OptionItem[]
  roles: OptionItem[]
  dimensions: OptionItem[]
  techFields: string[]
  cpcCodes: string[]
}
const options = ref<Options>({
  scholars: [],
  enterprises: [],
  edges: [],
  relationTypes: [],
  roles: [],
  dimensions: [],
  techFields: [],
  cpcCodes: [],
})

const buildParams = ref({
  scholarId: 'COOP-SCH001',
  enterpriseId: 'ENT001',
  relationTypes: ['employment'] as string[],
})
const annotateParams = ref({
  relationId: 'COOP-SCH001->ENT001@0',
  roleType: 'chief_scientist',
  techField: '人工智能',
  period: { start: '2021-01-01', end: '2024-12-31' },
})
const analyzeParams = ref({
  enterpriseId: 'ENT001',
  analysisDimensions: ['industry_status', 'core_tech', 'financial'] as string[],
  patentCPC: ['G06N', 'G06F'] as string[],
})

const buildResult = ref<any>(null)
const annotationResp = ref<any>(null)
const analysisResp = ref<any>(null)
const loading = ref(false)
const errorMsg = ref('')
const lastTestTime = ref('待执行')
const graphNodes = ref<GraphNode[]>([])

type EnterpriseDetail = {
  id: string
  name: string
  orgType: string
  province: string
  city: string
  listingStatus: string
  registeredCapital: number
  incorporationYear: number
  tags: Array<{ tag: string; level: string }>
  industryChains: Array<{ chain: string; score: number }>
  industryClass: string
  mainActivities: string
  mainProducts: string[]
  patentCount: number
  patents: Array<{ id: string; applicant: string }>
  financial: {
    period: string
    operatingRevenue: number
    pureProfit: number
    totalAssets: number
    rdAmount: number
    employees: number
  }
  cpc: Array<{ cpcSection: string; count: number }>
  coreTechLayout: string
}

type ScholarDetail = {
  id: string
  name: string
  title: string
  institution: string
}

type RelationType = {
  value: string
  label: string
}

type RoleType = {
  value: string
  label: string
  level: string
}

type BuiltRelation = {
  relationId: string
  scholarId: string
  scholarName: string
  scholarTitle: string
  scholarInstitution: string
  enterpriseId: string
  enterpriseName: string
  enterpriseBasic: string
  relationType: string
  roleLabel: string
  roleLevel: string
  techField: string
  period: { start: string; end: string }
}

const scholarProfiles: Record<string, ScholarDetail> = {
  'COOP-SCH001': { id: 'COOP-SCH001', name: '陈建国', title: '研究员', institution: '清华大学智能产业研究院' },
  'COOP-SCH002': { id: 'COOP-SCH002', name: '李佳宁', title: '教授', institution: '北京航空航天大学计算机学院' },
  'COOP-SCH003': { id: 'COOP-SCH003', name: '张明远', title: '首席科学家', institution: '中国科学院自动化研究所' },
}

const enterpriseProfiles: Record<string, EnterpriseDetail> = {
  ENT001: {
    id: 'ENT001',
    name: '企业001有限公司',
    orgType: '国有企业',
    province: '浙江',
    city: '杭州',
    listingStatus: '已挂牌',
    registeredCapital: 383708,
    incorporationYear: 2017,
    tags: [{ tag: '独角兽', level: '省级' }],
    industryChains: [{ chain: '集成电路', score: 89 }],
    industryClass: '集成电路制造',
    mainActivities: '集成电路研发与制造',
    mainProducts: ['工业软件', '智能传感器', 'AI芯片'],
    patentCount: 7,
    patents: [{ id: 'P001', applicant: '企业001有限公司' }],
    financial: { period: '2024Q4', operatingRevenue: 1200000000, pureProfit: 150000000, totalAssets: 5000000000, rdAmount: 80000000, employees: 1200 },
    cpc: [{ cpcSection: 'G', count: 4 }, { cpcSection: 'H', count: 1 }, { cpcSection: 'A', count: 2 }],
    coreTechLayout: '深耕集成电路研发制造，核心聚焦工业软件，布局智能传感器。',
  },
  ENT002: {
    id: 'ENT002',
    name: '星河智能装备股份有限公司',
    orgType: '民营企业',
    province: '江苏',
    city: '苏州',
    listingStatus: '上市公司',
    registeredCapital: 268000,
    incorporationYear: 2014,
    tags: [{ tag: '专精特新', level: '国家级' }],
    industryChains: [{ chain: '智能装备', score: 86 }],
    industryClass: '智能装备制造',
    mainActivities: '工业机器人与智能产线研发',
    mainProducts: ['协作机器人', '工业控制器', '视觉检测系统'],
    patentCount: 16,
    patents: [{ id: 'P018', applicant: '星河智能装备股份有限公司' }],
    financial: { period: '2024Q4', operatingRevenue: 860000000, pureProfit: 92000000, totalAssets: 2600000000, rdAmount: 56000000, employees: 860 },
    cpc: [{ cpcSection: 'G', count: 7 }, { cpcSection: 'B', count: 5 }, { cpcSection: 'H', count: 4 }],
    coreTechLayout: '围绕机器人感知、运动控制与智能产线形成软硬件一体化技术布局。',
  },
  ENT003: {
    id: 'ENT003',
    name: '启明数据技术有限公司',
    orgType: '高新技术企业',
    province: '北京',
    city: '北京',
    listingStatus: '未上市',
    registeredCapital: 96000,
    incorporationYear: 2020,
    tags: [{ tag: '高新技术企业', level: '国家级' }],
    industryChains: [{ chain: '人工智能', score: 91 }],
    industryClass: '人工智能软件服务',
    mainActivities: '知识图谱平台与行业大模型研发',
    mainProducts: ['知识图谱平台', '行业大模型', '智能问答系统'],
    patentCount: 11,
    patents: [{ id: 'P032', applicant: '启明数据技术有限公司' }],
    financial: { period: '2024Q4', operatingRevenue: 430000000, pureProfit: 52000000, totalAssets: 980000000, rdAmount: 62000000, employees: 520 },
    cpc: [{ cpcSection: 'G', count: 9 }, { cpcSection: 'H', count: 2 }],
    coreTechLayout: '聚焦知识图谱、语义检索和行业大模型推理，形成数据智能产品矩阵。',
  },
}

const relationTypeOptions: RelationType[] = [
  { value: 'employment', label: '任职' },
  { value: 'advisor', label: '顾问' },
  { value: 'rd_cooperation', label: '研发合作' },
  { value: 'project_cooperation', label: '项目合作' },
  { value: 'tech_cooperation', label: '技术合作' },
]

const roleTypeOptions: RoleType[] = [
  { value: 'chief_scientist', label: '首席科学家', level: 'L1' },
  { value: 'technical_consultant', label: '技术顾问', level: 'L2' },
  { value: 'project_leader', label: '项目负责人', level: 'L2' },
  { value: 'technical_partner', label: '技术合伙人', level: 'L1' },
]

function relationLabel(value: string) {
  return relationTypeOptions.find((item) => item.value === value)?.label ?? value
}

function roleOption(value: string) {
  return roleTypeOptions.find((item) => item.value === value) ?? roleTypeOptions[0]
}

function currentScholar() {
  return scholarProfiles[buildParams.value.scholarId] ?? scholarProfiles['COOP-SCH001']
}

function enterpriseById(id: string) {
  return enterpriseProfiles[id] ?? enterpriseProfiles.ENT001
}

function formatMoney(value: number) {
  if (value >= 100000000) return `${Number((value / 100000000).toFixed(2))} 亿元`
  return `${value} 万元`
}

const dimensionChinese: Record<string, string> = {
  industry_status: '行业地位',
  core_tech: '核心技术',
  financial: '经营财务',
}

function buildRadialGraph(
  centerTitle: string,
  centerSubtitle: string,
  items: { title: string; subtitle: string; relation: string }[],
): GraphNode[] {
  const cx = GW / 2
  const cy = GH / 2
  const radius = 330
  const n = items.length
  return [
    {
      key: 'expert',
      title: centerTitle,
      subtitle: centerSubtitle,
      x: cx - 130,
      y: cy - 47,
      width: 260,
      height: 84,
      kind: 'expert',
    },
    ...items.map((item, i) => {
      const ang = (2 * Math.PI * i) / (n || 1) - Math.PI / 2
      const ccx = cx + radius * Math.cos(ang)
      const ccy = cy + radius * Math.sin(ang)
      return {
        key: `c${i + 1}`,
        title: item.title,
        subtitle: item.subtitle,
        relation: item.relation,
        x: ccx - 150,
        y: ccy - 50,
        width: 300,
        height: 100,
        kind: 'company' as const,
      }
    }),
  ]
}

const graphZoom = ref(0.78)
const graphStageRef = ref<HTMLElement | null>(null)
const activeDrag = ref<{ key: string; offsetX: number; offsetY: number } | null>(null)

const companyNodes = computed(() => graphNodes.value.filter((n) => n.kind === 'company'))

function getNode(key: string) {
  return graphNodes.value.find((n) => n.key === key)
}
function nodeCenter(node: GraphNode) {
  return { x: node.x + node.width / 2, y: node.y + node.height / 2 }
}
function nodeStyle(node: GraphNode) {
  return {
    left: `${node.x}px`,
    top: `${node.y}px`,
    width: `${node.width}px`,
    height: `${node.height}px`,
    zIndex: activeDrag.value?.key === node.key ? 6 : 2,
  }
}
const graphStageStyle = computed(() => ({
  width: `${GW}px`,
  height: `${GH}px`,
  transform: `translate(-50%, -50%) scale(${graphZoom.value})`,
}))
function boundaryPoint(node: GraphNode, toward: { x: number; y: number }) {
  const center = nodeCenter(node)
  const dx = toward.x - center.x
  const dy = toward.y - center.y
  const halfWidth = node.width / 2
  const halfHeight = node.height / 2
  if (dx === 0 && dy === 0) return center
  const scaleX = dx === 0 ? Number.POSITIVE_INFINITY : halfWidth / Math.abs(dx)
  const scaleY = dy === 0 ? Number.POSITIVE_INFINITY : halfHeight / Math.abs(dy)
  const scale = Math.min(scaleX, scaleY)
  return { x: center.x + dx * scale, y: center.y + dy * scale }
}
function relationPath(node: GraphNode) {
  const expert = getNode('expert')
  if (!expert) return ''
  const from = nodeCenter(expert)
  const to = nodeCenter(node)
  const start = boundaryPoint(expert, to)
  const end = boundaryPoint(node, from)
  const verticalGap = Math.abs(end.y - start.y)
  const control = {
    x: (start.x + end.x) / 2,
    y: (start.y + end.y) / 2 + (end.y < start.y ? -verticalGap * 0.42 : verticalGap * 0.18),
  }
  return `M ${start.x} ${start.y} Q ${control.x} ${control.y} ${end.x} ${end.y}`
}
function relationLabelStyle(node: GraphNode) {
  const expert = getNode('expert')
  if (!expert) return {}
  const from = nodeCenter(expert)
  const to = nodeCenter(node)
  const dx = to.x - from.x
  const dy = to.y - from.y
  const length = Math.hypot(dx, dy) || 1
  const normal = { x: (-dy / length) * 28, y: (dx / length) * 28 }
  const directionOffset = to.y < from.y ? -12 : 12
  return {
    left: `${(from.x + to.x) / 2 + normal.x}px`,
    top: `${(from.y + to.y) / 2 + normal.y + directionOffset}px`,
  }
}
function relationTone(relation = '') {
  if (relation === '任职') return 'relation-blue'
  if (relation === '顾问') return 'relation-purple'
  return 'relation-orange'
}
function relationMarker(relation = '') {
  if (relation === '任职') return 'url(#arrow-blue)'
  if (relation === '顾问') return 'url(#arrow-purple)'
  return 'url(#arrow-orange)'
}
function startDrag(event: PointerEvent, node: GraphNode) {
  const stage = graphStageRef.value
  if (!stage) return
  const rect = stage.getBoundingClientRect()
  const scaleX = GW / rect.width
  const scaleY = GH / rect.height
  activeDrag.value = {
    key: node.key,
    offsetX: (event.clientX - rect.left) * scaleX - node.x,
    offsetY: (event.clientY - rect.top) * scaleY - node.y,
  }
  ;(event.currentTarget as HTMLElement).setPointerCapture(event.pointerId)
}
function dragNode(event: PointerEvent) {
  const drag = activeDrag.value
  const stage = graphStageRef.value
  if (!drag || !stage) return
  const node = getNode(drag.key)
  if (!node) return
  const rect = stage.getBoundingClientRect()
  const scaleX = GW / rect.width
  const scaleY = GH / rect.height
  const nextX = (event.clientX - rect.left) * scaleX - drag.offsetX
  const nextY = (event.clientY - rect.top) * scaleY - drag.offsetY
  node.x = Math.max(0, Math.min(GW - node.width, nextX))
  node.y = Math.max(0, Math.min(GH - node.height, nextY))
}
function stopDrag() {
  activeDrag.value = null
}
function zoomGraph(event: WheelEvent) {
  event.preventDefault()
  const nextZoom = graphZoom.value + (event.deltaY > 0 ? -0.06 : 0.06)
  graphZoom.value = Math.max(0.55, Math.min(1.25, Number(nextZoom.toFixed(2))))
}

function loadOptions() {
  options.value = {
    scholars: Object.values(scholarProfiles).map((item) => ({ scholarId: item.id, name: item.name })),
    enterprises: Object.values(enterpriseProfiles).map((item) => ({ enterpriseId: item.id, name: item.name })),
    edges: [
      { relationId: 'COOP-SCH001->ENT001@0' },
      { relationId: 'COOP-SCH001->ENT002@1' },
      { relationId: 'COOP-SCH002->ENT003@0' },
    ],
    relationTypes: relationTypeOptions,
    roles: roleTypeOptions,
    dimensions: [
      { value: 'industry_status', label: '行业地位' },
      { value: 'core_tech', label: '核心技术' },
      { value: 'financial', label: '经营财务' },
    ],
    techFields: ['人工智能', '知识图谱', '智能制造', '集成电路', '工业软件'],
    cpcCodes: ['G06N', 'G06F', 'G05B', 'H01L', 'A61B'],
  }
}

function buildRelationsForScholar(scholar: ScholarDetail, selectedEnterprise: EnterpriseDetail) {
  const selectedLabels = buildParams.value.relationTypes.map(relationLabel)
  const defaults = Object.values(enterpriseProfiles)
    .filter((item) => item.id !== selectedEnterprise.id)
    .slice(0, 2)
    .map((enterprise, index): BuiltRelation => ({
      relationId: `${scholar.id}->${enterprise.id}@${index + 1}`,
      scholarId: scholar.id,
      scholarName: scholar.name,
      scholarTitle: scholar.title,
      scholarInstitution: scholar.institution,
      enterpriseId: enterprise.id,
      enterpriseName: enterprise.name,
      enterpriseBasic: `${enterprise.orgType}｜${enterprise.province}${enterprise.city}｜${enterprise.listingStatus}`,
      relationType: index === 0 ? '顾问' : '项目合作',
      roleLabel: index === 0 ? '技术顾问' : '项目负责人',
      roleLevel: index === 0 ? 'L2' : 'L2',
      techField: index === 0 ? '智能制造' : '知识图谱',
      period: { start: '2022-01-01', end: '2024-12-31' },
    }))

  return [
    {
      relationId: `${scholar.id}->${selectedEnterprise.id}@0`,
      scholarId: scholar.id,
      scholarName: scholar.name,
      scholarTitle: scholar.title,
      scholarInstitution: scholar.institution,
      enterpriseId: selectedEnterprise.id,
      enterpriseName: selectedEnterprise.name,
      enterpriseBasic: `${selectedEnterprise.orgType}｜${selectedEnterprise.province}${selectedEnterprise.city}｜${selectedEnterprise.listingStatus}`,
      relationType: selectedLabels.join('/') || '任职/顾问',
      roleLabel: roleOption(annotateParams.value.roleType).label,
      roleLevel: roleOption(annotateParams.value.roleType).level,
      techField: annotateParams.value.techField,
      period: annotateParams.value.period,
    },
    ...defaults,
  ]
}

function handleSearch() {
  loading.value = true
  errorMsg.value = ''
  if (activeSub.value === 'build') {
    const scholar = currentScholar()
    const enterprise = enterpriseById(buildParams.value.enterpriseId)
    const relations = buildRelationsForScholar(scholar, enterprise)
    const data = {
      status: 'success',
      scholarId: scholar.id,
      scholarName: scholar.name,
      scholarTitle: scholar.title,
      scholarInstitution: scholar.institution,
      builtRelationId: relations[0].relationId,
      relationType: relations[0].relationType,
      effective: true,
      relations: relations.map((item) => ({
        relationId: item.relationId,
        enterpriseId: item.enterpriseId,
        enterpriseName: item.enterpriseName,
        relationType: item.relationType,
        roleLabel: item.roleLabel,
        roleLevel: item.roleLevel,
        techField: item.techField,
        period: item.period,
        enterpriseBasic: item.enterpriseBasic,
      })),
    }
    buildResult.value = data
    graphNodes.value = buildRadialGraph(
      `专家：${data.scholarName}`,
      `${data.scholarTitle}｜${data.scholarInstitution}`,
      data.relations.map((r) => ({
        title: `企业：${r.enterpriseName}`,
        subtitle: `${r.enterpriseBasic}｜${r.techField}`,
        relation: r.relationType,
      })),
    )
  } else if (activeSub.value === 'annotate') {
    const role = roleOption(annotateParams.value.roleType)
    const enterprise = enterpriseById(annotateParams.value.relationId.includes('ENT002') ? 'ENT002' : annotateParams.value.relationId.includes('ENT003') ? 'ENT003' : 'ENT001')
    const scholarId = annotateParams.value.relationId.split('->')[0] || buildParams.value.scholarId
    const scholar = scholarProfiles[scholarId] ?? currentScholar()
    const data = {
      status: 'success',
      relationId: annotateParams.value.relationId,
      scholarName: scholar.name,
      scholarInstitution: scholar.institution,
      enterpriseName: enterprise.name,
      enterpriseBasic: `${enterprise.orgType}｜${enterprise.province}${enterprise.city}｜${enterprise.listingStatus}`,
      roleType: annotateParams.value.roleType,
      roleLabel: role.label,
      roleLevel: role.level,
      techField: annotateParams.value.techField,
      period: annotateParams.value.period,
      cooperationMode: '顾问合作',
      annotated: true,
    }
    annotationResp.value = data
    graphNodes.value = buildRadialGraph(`专家：${scholar.name}`, `${scholar.title}｜${scholar.institution}`, [
      {
        title: `企业：${enterprise.name}`,
        subtitle: `${data.roleLabel}｜${data.techField}｜${data.period.start}~${data.period.end}`,
        relation: data.cooperationMode,
      },
    ])
  } else {
    const enterprise = enterpriseById(analyzeParams.value.enterpriseId)
    const dimensions = {
      industry_status: {
        available: analyzeParams.value.analysisDimensions.includes('industry_status'),
        facts: {
          orgType: enterprise.orgType,
          listingStatus: enterprise.listingStatus,
          registeredCapital: enterprise.registeredCapital,
          province: enterprise.province,
          city: enterprise.city,
          incorporationYear: enterprise.incorporationYear,
          tags: enterprise.tags,
          industryChains: enterprise.industryChains,
          chainProducts: enterprise.mainProducts,
        },
        conclusion: `${enterprise.province}${enterprise.city}${enterprise.orgType}，上市状态：${enterprise.listingStatus}，处于${enterprise.industryChains[0]?.chain ?? '-'}产业链。`,
      },
      core_tech: {
        available: analyzeParams.value.analysisDimensions.includes('core_tech'),
        facts: {
          industryClass: enterprise.industryClass,
          mainActivities: enterprise.mainActivities,
          mainProducts: enterprise.mainProducts.join('、'),
          patentCount: enterprise.patentCount,
          patents: enterprise.patents,
        },
        conclusion: `主营${enterprise.mainProducts.join('、')}，相关专利 ${enterprise.patentCount} 项。`,
      },
      financial: {
        available: analyzeParams.value.analysisDimensions.includes('financial'),
        facts: { source: 'stock', ...enterprise.financial },
        conclusion: `最近一期营业收入 ${formatMoney(enterprise.financial.operatingRevenue)}，净利润 ${formatMoney(enterprise.financial.pureProfit)}。`,
      },
    }
    const data = {
      status: 'success',
      enterpriseId: enterprise.id,
      enterpriseName: enterprise.name,
      dimensions,
      patentDistribution: enterprise.cpc.filter((item) => !analyzeParams.value.patentCPC.length || analyzeParams.value.patentCPC.some((code) => code.startsWith(item.cpcSection))),
      coreTechLayout: enterprise.coreTechLayout,
    }
    analysisResp.value = data
    graphNodes.value = buildRadialGraph(
      `企业：${data.enterpriseName}`,
      `${enterprise.orgType}｜${enterprise.province}${enterprise.city}｜${enterprise.listingStatus}`,
      Object.keys(data.dimensions)
        .filter((k) => data.dimensions[k as keyof typeof data.dimensions].available)
        .map((k) => ({
          title: dimensionChinese[k] ?? k,
          subtitle: k === 'financial' ? `营收${formatMoney(enterprise.financial.operatingRevenue)}｜研发${formatMoney(enterprise.financial.rdAmount)}` : data.dimensions[k as keyof typeof data.dimensions].conclusion,
          relation: dimensionChinese[k] ?? k,
        })),
    )
  }
  lastTestTime.value = new Date().toLocaleString('zh-CN', { hour12: false })
  resultTab.value = 'structured'
  window.setTimeout(() => {
    loading.value = false
  }, 180)
}

const activeResult = computed(() => {
  if (activeSub.value === 'annotate') return annotationResp.value
  if (activeSub.value === 'analyze') return analysisResp.value
  return buildResult.value
})

const detailRows = computed<(string | number)[][]>(() => {
  if (activeSub.value === 'annotate') {
    const r = annotationResp.value
    if (!r) return []
    const p = r.period ?? annotateParams.value.period
    return [
      ['专家/人才名称', r.scholarName ?? '-'],
      ['重点关注科技企业', r.enterpriseName ?? '-'],
      ['专家角色', r.roleLabel ?? '-'],
      ['合作领域', r.techField ?? annotateParams.value.techField],
      ['合作时间', `${p?.start ?? ''} 至 ${p?.end ?? ''}`],
      ['合作模式', r.cooperationMode ?? '顾问合作'],
    ]
  }
  if (activeSub.value === 'analyze') {
    const r = analysisResp.value
    if (!r) return []
    const enterprise = enterpriseById(r.enterpriseId)
    const dims = r.dimensions ?? {}
    return [
      ['重点关注科技企业', r.enterpriseName ?? '-'],
      ['行业地位', dims.industry_status?.conclusion ?? `${enterprise.province}${enterprise.city}${enterprise.orgType}，上市状态为${enterprise.listingStatus}。`],
      ['技术方向', `${enterprise.mainActivities}，核心方向包括${enterprise.mainProducts.join('、')}。`],
      ['经营状况', `最近一期营业收入 ${formatMoney(enterprise.financial.operatingRevenue)}，净利润 ${formatMoney(enterprise.financial.pureProfit)}，研发投入 ${formatMoney(enterprise.financial.rdAmount)}。`],
    ]
  }
  const r = buildResult.value
  if (!r) return []
  const rels = Array.isArray(r.relations) ? r.relations : []
  const rows: (string | number)[][] = [
    ['专家/人才名称', r.scholarName ?? r.scholarId ?? '-'],
  ]
  rels.forEach((rel: any, index: number) => {
    rows.push(
      [`重点关注企业名称${index + 1}`, rel.enterpriseName ?? rel.enterpriseId ?? '-'],
      [`合作模式${index + 1}`, rel.relationType ?? '-'],
    )
  })
  return rows
})

const apiExample = computed(() => {
  const fallback =
    activeSub.value === 'annotate'
      ? {
          status: 'success',
          relationId: annotateParams.value.relationId,
          roleType: annotateParams.value.roleType,
          roleLabel: '',
          roleLevel: '',
          techField: annotateParams.value.techField,
          period: annotateParams.value.period,
          annotated: false,
        }
      : activeSub.value === 'analyze'
        ? {
            status: 'success',
            enterpriseId: analyzeParams.value.enterpriseId,
            enterpriseName: '',
            dimensions: {},
            patentDistribution: [],
            coreTechLayout: '',
          }
        : {
            status: 'success',
            scholarId: buildParams.value.scholarId,
            scholarName: '',
            builtRelationId: `${buildParams.value.scholarId}->${buildParams.value.enterpriseId}@0`,
            relationType: '',
            effective: false,
            relations: [],
          }
  const data = activeResult.value ?? fallback
  return JSON.stringify({ code: 200, success: true, data, msg: 'success' }, null, 2)
})

const requestRows = computed<string[][]>(() => {
  if (activeSub.value === 'annotate') {
    return [
      ['relationId', 'string', '是', '专家-企业关系边 ID'],
      ['roleType', 'string', '是', '专家在企业中的角色类型'],
      ['techField', 'string', '否', '合作领域或技术领域'],
      ['cooperationMode', 'string', '否', '合作模式，如顾问合作'],
    ]
  }
  if (activeSub.value === 'analyze') {
    return [
      ['enterpriseId', 'string', '是', '企业ID'],
      ['analysisDimensions', 'string[]', '是', '分析维度'],
      ['patentCPC', 'string[]', '否', '专利CPC分类号'],
    ]
  }
  return [
    ['scholarId', 'string', '是', '专家ID'],
    ['enterpriseId', 'string', '是', '企业ID'],
    ['relationTypes', 'string[]', '是', '关联关系类型（多选，英文编码）'],
  ]
})

const responseRows = computed<string[][]>(() => {
  if (activeSub.value === 'annotate') {
    return [
      ['code', 'int', '业务状态码（200 成功）'],
      ['data', 'object', '结果对象'],
      ['data.relationId', 'string', '政企关系ID'],
      ['data.roleType', 'string', '角色类型'],
      ['data.roleLabel', 'string', '专家角色'],
      ['data.techField', 'string', '合作领域'],
      ['data.period', 'object', '合作时间'],
      ['data.cooperationMode', 'string', '合作模式'],
      ['data.annotated', 'boolean', '标注结果'],
      ['message', 'string', '返回消息'],
    ]
  }
  if (activeSub.value === 'analyze') {
    return [
      ['code', 'int', '业务状态码（200 成功）'],
      ['data', 'object', '结果对象'],
      ['data.enterpriseName', 'string', '重点关注科技企业名称'],
      ['data.dimensions.industry_status.conclusion', 'string', '企业行业地位'],
      ['data.dimensions.core_tech.conclusion', 'string', '企业技术方向'],
      ['data.dimensions.financial.conclusion', 'string', '企业经营状况'],
      ['message', 'string', '返回消息'],
    ]
  }
  return [
    ['code', 'int', '业务状态码（200 成功）'],
    ['data', 'object', '结果对象'],
      ['data.scholarName', 'string', '专家/人才名称'],
      ['data.relations', 'array', '关联重点关注科技企业'],
      ['data.relations[].enterpriseName', 'string', '企业名称'],
      ['data.relations[].relationType', 'string', '合作模式'],
    ['message', 'string', '返回消息'],
  ]
})

const codeSamples = computed<Record<string, string>>(() => {
  const url = apiPath.value
  const payload =
    activeSub.value === 'annotate'
      ? JSON.stringify({ ...annotateParams.value, cooperationMode: '顾问合作' }, null, 2)
      : activeSub.value === 'analyze'
        ? JSON.stringify(analyzeParams.value, null, 2)
        : JSON.stringify(buildParams.value, null, 2)
  return {
    python: `import requests

url = "http://localhost:8200${url}"
payload = ${payload}
headers = {"Content-Type": "application/json"}
response = requests.post(url, json=payload, headers=headers, timeout=20)
print(response.json())`,
    node: `const res = await fetch("http://localhost:8200${url}", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify(${payload}),
});
console.log(await res.json());`,
    curl: `curl -X POST "http://localhost:8200${url}" \\
  -H "Content-Type: application/json" \\
  -d '${payload.replace(/\s+/g, ' ')}'`,
  }
})

const highlightedApiExample = computed(() => highlightCode(apiExample.value))
const highlightedCodeSample = computed(() => highlightCode(codeSamples.value[activeCode.value]))

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
    .replace(/\b(import|const|await|fetch|print|response|payload|url|curl|POST|JSON|headers|requests)\b/g, '<span class="code-token code-token--keyword">$1</span>')
}

async function handleCopyCode() {
  try {
    await navigator.clipboard?.writeText(codeSamples.value[activeCode.value])
  } catch {
    // 剪贴板被浏览器拒绝时仍保留视觉反馈
  }
  copied.value = true
  window.setTimeout(() => {
    copied.value = false
  }, 1200)
}

onMounted(() => {
  loadOptions()
  handleSearch()
})

watch(activeSub, () => {
  handleSearch()
})
</script>

<template>
  <div class="enterprise-relation">
    <header class="er-toolbar">
      <div class="kg-tabs" role="tablist" aria-label="功能视图">
        <button
          class="kg-tabs__item"
          :class="{ 'is-active': mainTab === 'test' }"
          type="button"
          @click="mainTab = 'test'"
        >
          算法测试
        </button>
        <button
          class="kg-tabs__item"
          :class="{ 'is-active': mainTab === 'developer' }"
          type="button"
          @click="mainTab = 'developer'"
        >
          开发者接口
        </button>
      </div>
      <button class="kg-button kg-button--text er-tech" type="button" @click="showTech = true">
        <img :src="iconInfo" alt="" aria-hidden="true" />
        技术方案
      </button>
    </header>

    <section v-if="mainTab === 'test'" class="search-panel-inline">
      <label class="search-panel-inline__field">
        <span>子功能名称：</span>
        <select v-model="activeSub" class="select-with-icon">
          <option v-for="s in subFunctions" :key="s.key" :value="s.key">{{ s.name }}</option>
        </select>
        <img class="select-icon" :src="iconSelectArrow" alt="" aria-hidden="true" />
        <img class="field-info-icon" :src="iconInfo" alt="" aria-hidden="true" />
      </label>
      <div class="search-panel-inline__actions">
        <button class="kg-button kg-button--secondary" type="button" @click="showConfig = true">
          参数设置
        </button>
        <button class="kg-button" type="button" @click="handleSearch">
          {{ loading ? '测试中...' : '执行测试' }}
        </button>
      </div>
    </section>

    <div v-if="mainTab === 'test'" class="er-main">
      <section class="kg-panel graph-panel">
        <div class="kg-panel__header">
          <h2 class="kg-panel__title">测试结果预览</h2>
          <div class="graph-panel__time">
            <span>最近测试时间：</span>
            <strong>{{ lastTestTime }}</strong>
          </div>
        </div>
        <div class="graph-panel__canvas kg-graph-canvas" @wheel="zoomGraph">
          <div v-if="errorMsg" class="er-error">{{ errorMsg }}</div>
          <div v-else-if="!graphNodes.length" class="er-empty">
            <strong>{{ currentSub.name }}</strong>
            <span>点击「执行测试」查看关系图谱</span>
          </div>
          <div
            v-else
            ref="graphStageRef"
            class="graph-stage"
            :style="graphStageStyle"
            @pointermove="dragNode"
            @pointerup="stopDrag"
            @pointercancel="stopDrag"
            @pointerleave="stopDrag"
          >
            <svg class="graph-lines" :viewBox="`0 0 ${GW} ${GH}`" aria-hidden="true">
              <defs>
                <marker id="arrow-blue" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="9" markerHeight="9" orient="auto-start-reverse">
                  <path d="M 0 0 L 10 5 L 0 10 z" fill="#2f7cff" />
                </marker>
                <marker id="arrow-purple" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="9" markerHeight="9" orient="auto-start-reverse">
                  <path d="M 0 0 L 10 5 L 0 10 z" fill="#8b5cf6" />
                </marker>
                <marker id="arrow-orange" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="9" markerHeight="9" orient="auto-start-reverse">
                  <path d="M 0 0 L 10 5 L 0 10 z" fill="#f59e0b" />
                </marker>
              </defs>
              <path
                v-for="node in companyNodes"
                :key="`${node.key}-path`"
                class="relation-edge"
                :class="relationTone(node.relation)"
                :d="relationPath(node)"
                :marker-end="relationMarker(node.relation)"
              />
            </svg>
            <span
              v-for="node in companyNodes"
              :key="`${node.key}-label`"
              class="relation-label"
              :class="relationTone(node.relation)"
              :style="relationLabelStyle(node)"
            >{{ node.relation }}</span>
            <div
              v-for="node in graphNodes"
              :key="node.key"
              class="graph-node"
              :class="[{ dragging: activeDrag?.key === node.key }, node.kind === 'expert' ? 'expert-node' : 'company-node']"
              :style="nodeStyle(node)"
              @pointerdown="startDrag($event, node)"
            >
              <strong>{{ node.title }}</strong>
              <span>{{ node.subtitle }}</span>
            </div>
          </div>
        </div>
      </section>

      <aside class="er-side">
        <section class="kg-panel result-panel">
          <div class="kg-panel__header">
            <h2 class="kg-panel__title">结果详情</h2>
            <div class="result-panel__tabs">
              <button
                :class="{ 'is-active': resultTab === 'structured' }"
                type="button"
                @click="resultTab = 'structured'"
              >
                结构化结果
              </button>
              <button
                :class="{ 'is-active': resultTab === 'api' }"
                type="button"
                @click="resultTab = 'api'"
              >
                API结果示例
              </button>
            </div>
          </div>
          <dl v-if="resultTab === 'structured' && detailRows.length" class="result-panel__table scroll-on-demand">
            <div v-for="(row, i) in detailRows" :key="i">
              <dt>{{ row[0] }}</dt>
              <dd>{{ row[1] }}</dd>
            </div>
          </dl>
          <div v-else-if="resultTab === 'structured'" class="result-empty">暂无结果，请先执行测试</div>
          <pre v-else class="result-panel__code scroll-on-demand" v-html="highlightedApiExample"></pre>
        </section>
      </aside>
    </div>

    <section v-else class="developer-view">
      <div class="developer-view__meta">
        <label>
          <span>子功能名称：</span>
          <select v-model="activeSub" class="select-with-icon">
            <option v-for="s in subFunctions" :key="s.key" :value="s.key">{{ s.name }}</option>
          </select>
          <img class="select-icon" :src="iconSelectArrow" alt="" aria-hidden="true" />
          <img class="field-info-icon" :src="iconInfo" alt="" aria-hidden="true" />
        </label>
        <label>
          <span>接口路径：</span>
          <input :value="apiPath" readonly />
        </label>
        <span>请求方法： POST</span>
      </div>
      <div class="developer-view__cards">
        <section class="kg-panel">
          <div class="kg-panel__header"><h2 class="kg-panel__title">请求参数</h2></div>
          <div class="developer-table-wrap scroll-on-demand">
            <table class="developer-table">
              <thead><tr><th>字段名</th><th>类型</th><th>必填</th><th>说明</th></tr></thead>
              <tbody>
                <tr v-for="(r, i) in requestRows" :key="i">
                  <td v-for="(c, j) in r" :key="j">{{ c }}</td>
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
                <tr v-for="(r, i) in responseRows" :key="i">
                  <td v-for="(c, j) in r" :key="j">{{ c }}</td>
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
          @click="handleCopyCode"
        >
          <span v-if="copied" aria-hidden="true">✓</span>
          <img v-else :src="iconCopy" alt="" aria-hidden="true" />
        </button>
        <pre class="scroll-on-demand" v-html="highlightedCodeSample"></pre>
      </section>
    </section>

    <div v-if="showConfig || showTech" class="modal-mask" @click.self="showConfig = false; showTech = false">
      <section v-if="showConfig" class="modal modal--config" role="dialog" aria-modal="true">
        <header class="modal__header">
          <h2><img :src="iconModalSetting" alt="" aria-hidden="true" />测试参数设置</h2>
          <div class="modal__header-extra">
            <span class="modal__required"><span>*</span> 为必填项</span>
            <button type="button" @click="showConfig = false"><img :src="iconClose" alt="" aria-hidden="true" /></button>
          </div>
        </header>
        <div class="modal__body config-form">
          <template v-if="activeSub === 'build'">
            <label>
              <span><i>*</i>scholarId</span>
              <select v-model="buildParams.scholarId">
                <option v-for="s in options.scholars" :key="s.scholarId" :value="s.scholarId">{{ s.name }}（{{ s.scholarId }}）</option>
              </select>
              <img class="select-icon" :src="iconSelectArrow" alt="" aria-hidden="true" />
            </label>
            <label>
              <span><i>*</i>enterpriseId</span>
              <select v-model="buildParams.enterpriseId">
                <option v-for="e in options.enterprises" :key="e.enterpriseId" :value="e.enterpriseId">{{ e.name }}（{{ e.enterpriseId }}）</option>
              </select>
              <img class="select-icon" :src="iconSelectArrow" alt="" aria-hidden="true" />
            </label>
            <label>
              <span><i>*</i>relationTypes</span>
              <select v-model="buildParams.relationTypes[0]">
                <option v-for="r in options.relationTypes" :key="r.value" :value="r.value">{{ r.label }}</option>
              </select>
              <img class="select-icon" :src="iconSelectArrow" alt="" aria-hidden="true" />
            </label>
          </template>

          <template v-else-if="activeSub === 'annotate'">
            <label>
              <span><i>*</i>relationId</span>
              <select v-model="annotateParams.relationId">
                <option v-for="e in options.edges" :key="e.relationId" :value="e.relationId">{{ e.relationId }}</option>
              </select>
              <img class="select-icon" :src="iconSelectArrow" alt="" aria-hidden="true" />
            </label>
            <label>
              <span><i>*</i>roleType</span>
              <select v-model="annotateParams.roleType">
                <option v-for="r in options.roles" :key="r.value" :value="r.value">{{ r.label }}</option>
              </select>
              <img class="select-icon" :src="iconSelectArrow" alt="" aria-hidden="true" />
            </label>
            <label>
              <span><i></i>techField</span>
              <select v-model="annotateParams.techField">
                <option v-for="t in options.techFields" :key="t" :value="t">{{ t }}</option>
              </select>
              <img class="select-icon" :src="iconSelectArrow" alt="" aria-hidden="true" />
            </label>
            <label>
              <span><i></i>period.start</span>
              <input v-model="annotateParams.period.start" type="date" />
            </label>
            <label>
              <span><i></i>period.end</span>
              <input v-model="annotateParams.period.end" type="date" />
            </label>
          </template>

          <template v-else>
            <label>
              <span><i>*</i>enterpriseId</span>
              <select v-model="analyzeParams.enterpriseId">
                <option v-for="e in options.enterprises" :key="e.enterpriseId" :value="e.enterpriseId">{{ e.name }}（{{ e.enterpriseId }}）</option>
              </select>
              <img class="select-icon" :src="iconSelectArrow" alt="" aria-hidden="true" />
            </label>
            <label>
              <span><i>*</i>analysisDimensions</span>
              <select v-model="analyzeParams.analysisDimensions[0]">
                <option v-for="d in options.dimensions" :key="d.value" :value="d.value">{{ d.label }}</option>
              </select>
              <img class="select-icon" :src="iconSelectArrow" alt="" aria-hidden="true" />
            </label>
            <label>
              <span><i></i>patentCPC</span>
              <select v-model="analyzeParams.patentCPC[0]">
                <option v-for="c in options.cpcCodes" :key="c" :value="c">{{ c }}</option>
              </select>
              <img class="select-icon" :src="iconSelectArrow" alt="" aria-hidden="true" />
            </label>
          </template>
        </div>
        <footer class="modal__footer">
          <button class="kg-button kg-button--secondary" type="button" @click="showConfig = false">取消</button>
          <button class="kg-button" type="button" @click="showConfig = false; handleSearch()">保存并执行</button>
        </footer>
      </section>

      <section v-if="showTech" class="modal modal--tech" role="dialog" aria-modal="true">
        <header class="modal__header">
          <h2>技术方案</h2>
          <button type="button" @click="showTech = false"><img :src="iconClose" alt="" aria-hidden="true" /></button>
        </header>
        <div class="modal__body">
          <h3 class="modal__section-title">功能描述</h3>
          <p class="modal__desc">
            重点关注科技企业关系服务围绕科技专家或人才，挖掘专家与重点科技企业之间的任职、顾问、项目合作和技术领域关联，标注专家在企业中的角色、合作时间、合作模式及企业背景信息。
          </p>
          <h3 class="modal__section-title">推理流程</h3>
          <p class="modal__desc">
            输入专家与企业筛选条件 → 汇聚任职履历、企业信息、专利与项目数据 → 识别专家企业关系并标注角色 → 聚合企业行业地位、核心技术和经营状况 → 输出结构化关系图谱与结果详情。
          </p>
        </div>
      </section>
    </div>
  </div>
</template>

<style scoped>
.enterprise-relation {
  display: flex;
  flex-direction: column;
  height: 100%;
  gap: var(--space-12);
  color: var(--text-primary);
}

.er-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  min-height: 46px;
  padding: 0 var(--space-16);
}

.er-tech {
  gap: 4px;
}

.er-tech img {
  width: 14px;
  height: 14px;
  object-fit: contain;
}

.kg-tabs {
  display: inline-flex;
  align-items: center;
  gap: var(--space-4);
}

.kg-tabs__item {
  height: 36px;
  padding: 0 var(--space-16);
  border: 0;
  border-radius: var(--radius-sm);
  cursor: pointer;
  color: var(--text-secondary);
  background: transparent;
  font-size: 16px;
}

.kg-tabs__item.is-active {
  color: var(--primary);
  background: var(--surface-subtle);
  font-weight: 500;
}

.kg-button {
  display: inline-flex;
  align-items: center;
  gap: var(--space-8);
  height: var(--control-height);
  padding: 0 var(--space-16);
  border: 0;
  border-radius: var(--radius-sm);
  cursor: pointer;
  color: var(--text-inverse);
  background: var(--primary);
  font-size: 15px;
}

.kg-button--secondary {
  color: var(--primary);
  background: var(--primary-subtle);
}

.kg-button--text {
  color: var(--text-secondary);
  background: transparent;
}

.search-panel-inline {
  display: grid;
  grid-template-columns: 420px minmax(220px, 1fr);
  gap: var(--space-12);
  align-items: end;
  min-height: 44px;
  padding: 0 var(--space-16) var(--space-4);
}

.search-panel-inline__field,
.developer-view__meta label {
  position: relative;
  display: grid;
  grid-template-columns: max-content minmax(0, 1fr) 14px;
  align-items: center;
  gap: var(--space-8);
}

.search-panel-inline__field select,
.developer-view__meta select,
.config-form select {
  width: 100%;
  height: var(--control-height);
  padding: 0 34px 0 var(--space-12);
  border: 1px solid var(--border-strong);
  border-radius: var(--radius-sm);
  background: var(--surface);
  color: var(--text-primary);
  appearance: none;
  -webkit-appearance: none;
  background-image: none;
}

.select-with-icon {
  appearance: none;
  -webkit-appearance: none;
  background-image: none;
  cursor: pointer;
}

.select-icon {
  position: absolute;
  right: 10px;
  width: 14px;
  height: 14px;
  pointer-events: none;
  object-fit: contain;
}

.search-panel-inline__field .select-icon,
.developer-view__meta label .select-icon {
  right: 28px;
  top: 50%;
  transform: translateY(-50%);
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

.er-main {
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

.er-side {
  display: flex;
  flex-direction: column;
  gap: var(--space-12);
  min-height: 0;
  overflow: hidden;
}

.kg-panel {
  display: flex;
  flex-direction: column;
  height: 100%;
  min-height: 0;
  overflow: hidden;
  border: 1px solid var(--border);
  border-radius: var(--radius-md);
  background: var(--surface);
}

.kg-panel__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  min-height: 48px;
  padding: 0 var(--space-16);
  border-bottom: 1px solid var(--border);
}

.kg-panel__title {
  margin: 0;
  font-size: 16px;
  font-weight: 500;
  color: var(--text-primary);
}

.graph-panel__time {
  display: flex;
  gap: var(--space-12);
  color: var(--text-tertiary);
  font-size: 14px;
}

.graph-panel__time strong {
  font-weight: 400;
}

.graph-panel__canvas {
  position: relative;
  display: grid;
  place-items: center;
  flex: 1;
  min-height: 0;
  margin: 0 var(--space-16) var(--space-16);
  overflow: hidden;
  border-radius: var(--radius-md);
}

.graph-stage {
  position: absolute;
  top: 50%;
  left: 50%;
  transform-origin: center center;
  touch-action: none;
  user-select: none;
}

.graph-lines {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  z-index: 4;
  pointer-events: none;
}

.graph-lines .relation-edge {
  fill: none;
  stroke-width: 2.5;
}

.er-empty,
.er-error {
  display: grid;
  width: 360px;
  min-height: 180px;
  place-items: center;
  padding: var(--space-24);
  border: 1px dashed #b5d3fc;
  border-radius: var(--radius-lg);
  color: var(--text-secondary);
  text-align: center;
}

.er-empty strong {
  color: var(--text-primary);
  font-size: 18px;
}

.er-empty span {
  margin-top: var(--space-8);
}

.er-error {
  border-color: var(--danger);
  color: var(--danger);
  word-break: break-all;
}

.result-empty {
  display: grid;
  place-items: center;
  flex: 1;
  min-height: 0;
  color: var(--text-tertiary);
  font-size: 15px;
}

.graph-node {
  position: absolute;
  z-index: 2;
  display: grid;
  align-content: center;
  padding: 10px 18px;
  border-radius: 9px;
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.95), rgba(246, 251, 255, 0.95));
  cursor: grab;
  transition:
    border-color 0.16s,
    box-shadow 0.16s;
}

.graph-node:hover,
.graph-node.dragging {
  box-shadow: 0 10px 26px rgba(31, 114, 255, 0.18);
}

.graph-node.dragging {
  cursor: grabbing;
}

.expert-node {
  border: 1px solid #91baff;
  text-align: center;
}

.expert-node strong {
  color: #1663e8;
  font-size: 20px;
}

.expert-node span {
  margin-top: 6px;
  color: #24466f;
  font-size: 16px;
  line-height: 1.35;
}

.company-node {
  border: 1px solid #76cf8e;
  background: linear-gradient(180deg, #f7fff8, #effaf2);
}

.company-node strong {
  color: var(--graph-green);
  font-size: 18px;
  line-height: 1.3;
}

.company-node span {
  margin-top: 6px;
  color: #314662;
  font-size: 15px;
  line-height: 1.35;
}

.relation-label {
  position: absolute;
  z-index: 5;
  transform: translate(-50%, -50%);
  border-radius: 4px;
  background: rgba(255, 255, 255, 0.92);
  padding: 3px 10px;
  font-size: 16px;
  font-weight: 700;
  line-height: 1.2;
  white-space: nowrap;
  pointer-events: none;
}

.relation-blue {
  color: #2f7cff;
  stroke: #2f7cff;
}

.relation-purple {
  color: #8b5cf6;
  stroke: #8b5cf6;
}

.relation-orange {
  color: #f59e0b;
  stroke: #f59e0b;
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
  font-size: 15px;
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
  grid-template-columns: 130px minmax(0, 1fr);
  min-height: 44px;
  border-bottom: 1px solid var(--border);
}

.result-panel__table dt,
.result-panel__table dd {
  display: flex;
  align-items: center;
  margin: 0;
  padding: 0 var(--space-16);
  font-size: 15px;
  overflow-wrap: anywhere;
  word-break: break-word;
}

.result-panel__table dt {
  justify-content: flex-start;
  border-right: 1px solid var(--border);
  color: var(--text-tertiary);
}

.result-panel__table dd {
  color: var(--text-primary);
}

.result-panel__code {
  flex: 1;
  min-height: 0;
  margin: 0;
  padding: var(--space-16) 24px;
  overflow: auto;
  overscroll-behavior: contain;
  color: #2f3442;
  background: var(--surface);
  font-family: "SFMono-Regular", Consolas, "Liberation Mono", monospace;
  font-size: 13px;
  line-height: 24px;
  white-space: pre-wrap;
}

.result-panel__code :deep(.code-token--key),
.result-panel__code :deep(.code-token--keyword),
.developer-code pre :deep(.code-token--key),
.developer-code pre :deep(.code-token--keyword) {
  color: #7c3aed;
}

.result-panel__code :deep(.code-token--string),
.developer-code pre :deep(.code-token--string) {
  color: #047857;
}

.result-panel__code :deep(.code-token--number),
.result-panel__code :deep(.code-token--literal),
.developer-code pre :deep(.code-token--number),
.developer-code pre :deep(.code-token--literal) {
  color: #d97706;
}

.developer-view {
  position: relative;
  display: grid;
  grid-template-rows: 44px minmax(0, 1.4fr) minmax(0, 1fr);
  gap: var(--space-16);
  flex: 1;
  min-height: 0;
  padding: 0 var(--space-16) var(--space-16);
  overflow: hidden;
}

.developer-view::before {
  position: absolute;
  z-index: 0;
  top: calc(44px + var(--space-16));
  right: var(--space-16);
  bottom: var(--space-16);
  left: var(--space-16);
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
  gap: 48px;
  align-items: center;
  min-height: 44px;
}

.developer-view__meta input,
.config-form input {
  height: var(--control-height);
  padding: 0 var(--space-12);
  border: 1px solid var(--border-strong);
  border-radius: var(--radius-sm);
  background: var(--surface);
  color: var(--text-primary);
}

.developer-view__meta input[readonly] {
  color: var(--text-primary);
}

.developer-view__cards {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--space-16);
  min-height: 0;
  padding: var(--space-16) var(--space-16) 0;
  overflow: hidden;
}

.developer-table-wrap {
  height: calc(100% - 52px);
  margin: 0 6px var(--space-16);
  overflow: auto;
}

.developer-table {
  width: 100%;
  table-layout: fixed;
  border-collapse: collapse;
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
  overflow-wrap: anywhere;
  word-break: break-word;
  white-space: normal;
}

.developer-table thead th {
  position: sticky;
  top: 0;
  z-index: 1;
  color: var(--text-secondary);
  background: var(--surface-muted);
  font-weight: 400;
}

.developer-table td {
  color: var(--text-primary);
}

.developer-view__cards .kg-panel:first-child .developer-table th:nth-child(1),
.developer-view__cards .kg-panel:first-child .developer-table td:nth-child(1) {
  width: 34%;
}

.developer-view__cards .kg-panel:first-child .developer-table th:nth-child(2),
.developer-view__cards .kg-panel:first-child .developer-table td:nth-child(2) {
  width: 18%;
}

.developer-view__cards .kg-panel:first-child .developer-table th:nth-child(3),
.developer-view__cards .kg-panel:first-child .developer-table td:nth-child(3) {
  width: 12%;
}

.developer-view__cards .kg-panel:nth-child(2) .developer-table th:nth-child(1),
.developer-view__cards .kg-panel:nth-child(2) .developer-table td:nth-child(1) {
  width: 46%;
}

.developer-view__cards .kg-panel:nth-child(2) .developer-table th:nth-child(2),
.developer-view__cards .kg-panel:nth-child(2) .developer-table td:nth-child(2) {
  width: 16%;
}

.developer-code {
  position: relative;
  display: flex;
  flex-direction: column;
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
  color: #2f3442;
  font-family: "SFMono-Regular", Consolas, "Liberation Mono", monospace;
  font-size: 13px;
  white-space: pre;
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

.scroll-on-demand.kg-is-scrolling {
  scrollbar-width: thin;
  scrollbar-color: #c9cdd4 transparent;
}

.scroll-on-demand.kg-is-scrolling::-webkit-scrollbar-thumb {
  background: #c9cdd4;
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
  width: 520px;
}

.modal--tech {
  width: 640px;
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
}

.modal__required span,
.config-form i {
  color: var(--danger);
  font-style: normal;
}

.modal__body {
  padding: var(--space-16);
  max-height: 60vh;
  overflow: auto;
}

.modal__footer {
  justify-content: flex-end;
  gap: var(--space-12);
  border-top: 1px solid var(--border);
  border-bottom: 0;
}

.config-form {
  display: grid;
  gap: var(--space-12);
}

.config-form label {
  position: relative;
  display: grid;
  grid-template-columns: 118px minmax(0, 1fr);
  align-items: center;
  gap: var(--space-8);
}

.config-form label > span {
  display: inline-flex;
  align-items: center;
  color: #86909c;
}

.config-form i {
  width: 10px;
}

.config-form .select-icon {
  right: 10px;
  top: 50%;
  transform: translateY(-50%);
}

.config-multi {
  display: grid;
  grid-template-columns: 82px minmax(0, 1fr);
  align-items: start;
  gap: var(--space-8);
}

.config-multi > span {
  display: inline-flex;
  align-items: center;
  color: #86909c;
  padding-top: 8px;
}

.ms-field {
  display: flex;
  flex-direction: column;
}

.ms-select-wrap {
  position: relative;
  width: 100%;
}

.ms-select-wrap .select-icon {
  right: 10px;
  top: 50%;
  transform: translateY(-50%);
}

.ms-add {
  width: 100%;
  height: var(--control-height);
  padding: 0 34px 0 var(--space-12);
  border: 1px solid var(--border-strong);
  border-radius: var(--radius-sm);
  background: var(--surface);
  color: var(--text-primary);
  font-size: 14px;
  appearance: none;
}

.ms-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-top: var(--space-8);
}

.ms-tag {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 3px 8px 3px 10px;
  background: var(--primary-subtle);
  border: 1px solid #c7d8ff;
  border-radius: 14px;
  font-size: 13px;
  color: var(--primary);
}

.ms-tag-x {
  border: 0;
  background: transparent;
  color: var(--text-tertiary);
  cursor: pointer;
  font-size: 15px;
  line-height: 1;
  padding: 0 2px;
}

.ms-tag-x:hover {
  color: var(--danger);
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
  margin: 0 0 var(--space-16);
  padding: var(--space-16);
  border-radius: var(--radius-md);
  color: var(--text-secondary);
  background: var(--surface-subtle);
  line-height: 24px;
}
</style>
