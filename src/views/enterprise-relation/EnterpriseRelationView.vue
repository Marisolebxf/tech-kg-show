<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'

import iconClose from '../../assets/icons/icon-close.svg'
import iconCopy from '../../assets/icons/icon-copy.svg'
import iconInfo from '../../assets/icons/icon-info.svg'
import iconModalSetting from '../../assets/icons/icon-modal-setting.svg'
import iconSelectArrow from '../../assets/icons/icon-select-arrow.svg'

type SubKey = 'query' | 'detail' | 'analyze'

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
const activeCombo = ref('')

const subFunctions = [
  {
    key: 'query' as SubKey,
    name: '专家-重点科技企业关系查询',
    endpoint: '/v1/expert-enterprise-relations/query',
  },
  {
    key: 'detail' as SubKey,
    name: '专家-企业关系详情',
    endpoint: '/v1/expert-enterprise-relations/detail',
  },
  {
    key: 'analyze' as SubKey,
    name: '企业背景关联分析',
    endpoint: '/v1/enterprise-background/analyze',
  },
]
const activeSub = ref<SubKey>('query')
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
  relationTypes: OptionItem[]
  roles: OptionItem[]
  dimensions: OptionItem[]
  techFields: string[]
}
const options = ref<Options>({
  scholars: [],
  enterprises: [],
  relationTypes: [],
  roles: [],
  dimensions: [],
  techFields: [],
})

const queryParams = ref({
  expertId: 'COOP-SCH001',
  relationTypes: [] as string[],
  startTime: '2021-01-01',
  endTime: '2024-12-31',
  limit: 20,
  includeEnterpriseProfile: 'true',
})
const detailParams = ref({
  expertId: 'COOP-SCH001',
  enterpriseId: 'ENT001',
})
const analyzeParams = ref({
  enterpriseId: 'ENT001',
})

const queryResult = ref<any>(null)
const detailResp = ref<any>(null)
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
  expertId: string
  expertName: string
  expertTitle: string
  expertInstitution: string
  enterpriseId: string
  enterpriseName: string
  enterpriseProfile?: {
    industryStatus: string
    techDirection: string
    operationStatus: string
  }
  relationType: string
  relationLabel: string
  roleType: string
  roleLabel: string
  roleLevel: string
  cooperationField: string
  cooperationMode: string
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
  ENT004: {
    id: 'ENT004',
    name: '瀚海量子科技有限公司',
    orgType: '高新技术企业',
    province: '安徽',
    city: '合肥',
    listingStatus: '拟上市',
    registeredCapital: 128000,
    incorporationYear: 2019,
    tags: [{ tag: '未来产业', level: '省级' }],
    industryChains: [{ chain: '量子信息', score: 88 }],
    industryClass: '量子通信与量子计算',
    mainActivities: '量子安全通信设备与量子测控系统研发',
    mainProducts: ['量子密钥分发设备', '量子测控平台', '低温控制模块'],
    patentCount: 19,
    patents: [{ id: 'P041', applicant: '瀚海量子科技有限公司' }],
    financial: { period: '2024Q4', operatingRevenue: 390000000, pureProfit: 36000000, totalAssets: 1100000000, rdAmount: 78000000, employees: 410 },
    cpc: [{ cpcSection: 'H', count: 10 }, { cpcSection: 'G', count: 6 }, { cpcSection: 'B', count: 3 }],
    coreTechLayout: '围绕量子安全通信、低温测控和量子计算控制链路形成关键硬件布局。',
  },
  ENT005: {
    id: 'ENT005',
    name: '澜舟生物医药科技股份有限公司',
    orgType: '民营企业',
    province: '上海',
    city: '上海',
    listingStatus: '科创板辅导',
    registeredCapital: 186000,
    incorporationYear: 2016,
    tags: [{ tag: '创新药', level: '国家级' }],
    industryChains: [{ chain: '生物医药', score: 92 }],
    industryClass: '生物技术药物研发',
    mainActivities: 'AI辅助药物发现与抗体药物研发',
    mainProducts: ['靶点发现平台', '抗体筛选系统', '临床前评价服务'],
    patentCount: 24,
    patents: [{ id: 'P057', applicant: '澜舟生物医药科技股份有限公司' }],
    financial: { period: '2024Q4', operatingRevenue: 620000000, pureProfit: 74000000, totalAssets: 2100000000, rdAmount: 138000000, employees: 690 },
    cpc: [{ cpcSection: 'A', count: 15 }, { cpcSection: 'C', count: 6 }, { cpcSection: 'G', count: 3 }],
    coreTechLayout: '以AI靶点发现、抗体工程和临床前评价平台连接高校专家与产业化场景。',
  },
  ENT006: {
    id: 'ENT006',
    name: '北辰空天智能系统有限公司',
    orgType: '国有控股企业',
    province: '陕西',
    city: '西安',
    listingStatus: '未上市',
    registeredCapital: 226000,
    incorporationYear: 2015,
    tags: [{ tag: '军民融合', level: '省级' }],
    industryChains: [{ chain: '空天信息', score: 87 }],
    industryClass: '卫星应用与智能载荷',
    mainActivities: '遥感智能处理、星载边缘计算与空天数据服务',
    mainProducts: ['遥感智能解译平台', '星载边缘计算模块', '空天数据中台'],
    patentCount: 14,
    patents: [{ id: 'P069', applicant: '北辰空天智能系统有限公司' }],
    financial: { period: '2024Q4', operatingRevenue: 710000000, pureProfit: 81000000, totalAssets: 2400000000, rdAmount: 94000000, employees: 760 },
    cpc: [{ cpcSection: 'G', count: 8 }, { cpcSection: 'H', count: 4 }, { cpcSection: 'F', count: 2 }],
    coreTechLayout: '在遥感智能解译、空天数据融合和星载边缘计算方向具备工程转化基础。',
  },
  ENT007: {
    id: 'ENT007',
    name: '云脉新能源材料有限公司',
    orgType: '民营企业',
    province: '广东',
    city: '深圳',
    listingStatus: '上市公司',
    registeredCapital: 318000,
    incorporationYear: 2013,
    tags: [{ tag: '单项冠军', level: '国家级' }],
    industryChains: [{ chain: '新能源材料', score: 90 }],
    industryClass: '动力电池材料',
    mainActivities: '固态电池电解质与高镍正极材料研发',
    mainProducts: ['固态电解质', '高镍正极材料', '电池失效分析系统'],
    patentCount: 31,
    patents: [{ id: 'P084', applicant: '云脉新能源材料有限公司' }],
    financial: { period: '2024Q4', operatingRevenue: 1680000000, pureProfit: 210000000, totalAssets: 6100000000, rdAmount: 176000000, employees: 1480 },
    cpc: [{ cpcSection: 'H', count: 12 }, { cpcSection: 'C', count: 11 }, { cpcSection: 'G', count: 8 }],
    coreTechLayout: '围绕固态电池关键材料、材料表征和失效分析形成产学研协同网络。',
  },
  ENT008: {
    id: 'ENT008',
    name: '中科海图智能科技有限公司',
    orgType: '高新技术企业',
    province: '山东',
    city: '青岛',
    listingStatus: '未上市',
    registeredCapital: 88000,
    incorporationYear: 2021,
    tags: [{ tag: '海洋强国', level: '省级' }],
    industryChains: [{ chain: '海洋智能装备', score: 84 }],
    industryClass: '海洋观测与智能装备',
    mainActivities: '海洋传感器、无人船和海洋数据智能分析',
    mainProducts: ['海洋多参数传感器', '无人观测船', '海洋数据图谱'],
    patentCount: 12,
    patents: [{ id: 'P091', applicant: '中科海图智能科技有限公司' }],
    financial: { period: '2024Q4', operatingRevenue: 280000000, pureProfit: 24000000, totalAssets: 760000000, rdAmount: 43000000, employees: 330 },
    cpc: [{ cpcSection: 'G', count: 7 }, { cpcSection: 'B', count: 3 }, { cpcSection: 'H', count: 2 }],
    coreTechLayout: '以海洋传感、无人平台和海洋知识图谱支撑专家团队开展应用验证。',
  },
  ENT009: {
    id: 'ENT009',
    name: '矩阵安全计算技术有限公司',
    orgType: '民营企业',
    province: '四川',
    city: '成都',
    listingStatus: '新三板挂牌',
    registeredCapital: 72000,
    incorporationYear: 2018,
    tags: [{ tag: '网络安全', level: '国家级' }],
    industryChains: [{ chain: '数据安全', score: 86 }],
    industryClass: '隐私计算与数据安全',
    mainActivities: '隐私计算、可信执行环境与数据要素流通平台研发',
    mainProducts: ['联邦学习平台', '可信数据空间', '安全多方计算引擎'],
    patentCount: 17,
    patents: [{ id: 'P102', applicant: '矩阵安全计算技术有限公司' }],
    financial: { period: '2024Q4', operatingRevenue: 510000000, pureProfit: 66000000, totalAssets: 1320000000, rdAmount: 69000000, employees: 590 },
    cpc: [{ cpcSection: 'G', count: 13 }, { cpcSection: 'H', count: 4 }],
    coreTechLayout: '在隐私计算、可信数据空间和安全算法工程化方面沉淀企业级产品。',
  },
  ENT010: {
    id: 'ENT010',
    name: '曜石光电芯片有限公司',
    orgType: '合资企业',
    province: '湖北',
    city: '武汉',
    listingStatus: '拟上市',
    registeredCapital: 246000,
    incorporationYear: 2017,
    tags: [{ tag: '专精特新', level: '国家级' }],
    industryChains: [{ chain: '光电子信息', score: 89 }],
    industryClass: '光通信芯片与硅光器件',
    mainActivities: '硅光芯片、光模块和高速互连器件研发',
    mainProducts: ['硅光调制器', '高速光模块', '光电协同封装'],
    patentCount: 22,
    patents: [{ id: 'P116', applicant: '曜石光电芯片有限公司' }],
    financial: { period: '2024Q4', operatingRevenue: 940000000, pureProfit: 118000000, totalAssets: 3300000000, rdAmount: 112000000, employees: 830 },
    cpc: [{ cpcSection: 'H', count: 14 }, { cpcSection: 'G', count: 5 }, { cpcSection: 'B', count: 3 }],
    coreTechLayout: '聚焦硅光芯片、高速光模块与光电协同封装，适合承接科研成果转化。',
  },
}

const relationTypeOptions: RelationType[] = [
  { value: 'employment', label: '任职' },
  { value: 'advisor', label: '顾问' },
  { value: 'cooperation', label: '合作' },
  { value: 'tech_transfer', label: '技术转化' },
  { value: 'patent_cooperation', label: '专利合作' },
  { value: 'investment', label: '投资' },
  { value: 'founder', label: '创始人' },
  { value: 'consultant', label: '咨询顾问' },
]

const roleTypeOptions: RoleType[] = [
  { value: 'chief_scientist', label: '首席科学家', level: 'L1' },
  { value: 'technical_consultant', label: '技术顾问', level: 'L2' },
  { value: 'project_leader', label: '项目负责人', level: 'L2' },
  { value: 'technical_partner', label: '技术合伙人', level: 'L1' },
]

const cooperationModeOptions = [
  '联合研发',
  '技术顾问',
  '项目合作',
  '技术转化',
  '专利合作',
  '平台共建',
]

function relationLabel(value: string) {
  return relationTypeOptions.find((item) => item.value === value)?.label ?? value
}

function roleOption(value: string) {
  return roleTypeOptions.find((item) => item.value === value) ?? roleTypeOptions[0]
}

function currentScholar() {
  return scholarProfiles[queryParams.value.expertId]
}

function enterpriseById(id: string) {
  return enterpriseProfiles[id]
}

function formatMoney(value: number) {
  if (value >= 100000000) return `${Number((value / 100000000).toFixed(2))} 亿元`
  return `${value} 万元`
}

function toBoolean(value: boolean | string) {
  return value === true || String(value).toLowerCase() === 'true'
}

function queryRequestPayload() {
  return {
    ...queryParams.value,
    limit: Number(queryParams.value.limit) || 20,
    includeEnterpriseProfile: toBoolean(queryParams.value.includeEnterpriseProfile),
  }
}

function detailRequestPayload() {
  return {
    ...detailParams.value,
  }
}

function analyzeRequestPayload() {
  return {
    ...analyzeParams.value,
  }
}

const dimensionChinese: Record<string, string> = {
  industry_status: '行业地位',
  tech_direction: '技术方向',
  operation_status: '经营状况',
}

type ComboOption = {
  value: string
  label: string
}

const booleanOptions: ComboOption[] = [
  { value: 'true', label: '是' },
  { value: 'false', label: '否' },
]
const limitOptions: ComboOption[] = [
  { value: '10', label: '返回 10 条' },
  { value: '20', label: '返回 20 条' },
  { value: '50', label: '返回 50 条' },
]
const scholarComboOptions = computed<ComboOption[]>(() =>
  options.value.scholars.map((item) => ({
    value: item.scholarId ?? '',
    label: item.name ?? '',
  })),
)
const enterpriseComboOptions = computed<ComboOption[]>(() =>
  options.value.enterprises.map((item) => ({
    value: item.enterpriseId ?? '',
    label: item.name ?? '',
  })),
)
const relationComboOptions = computed<ComboOption[]>(() =>
  options.value.relationTypes.map((item) => ({
    value: item.value ?? '',
    label: item.label ?? '',
  })),
)
function openCombo(key: string) {
  activeCombo.value = key
}

function toggleCombo(key: string) {
  activeCombo.value = activeCombo.value === key ? '' : key
}

function scholarDisplay(value: string) {
  return scholarProfiles[value]?.name ?? scholarComboOptions.value.find((item) => item.value === value)?.label ?? value
}

function enterpriseDisplay(value: string) {
  return enterpriseProfiles[value]?.name ?? enterpriseComboOptions.value.find((item) => item.value === value)?.label ?? value
}

function relationDisplay(value: string) {
  return relationComboOptions.value.find((item) => item.value === value)?.label ?? relationLabel(value)
}

function booleanDisplay(value: string | boolean) {
  return toBoolean(value) ? '是' : '否'
}

function pickComboValue(_key: string, apply: (value: string) => void, value: string) {
  apply(value)
  activeCombo.value = ''
}

function parseScholarInput(value: string) {
  return Object.values(scholarProfiles).find((item) => item.name === value)?.id ?? value
}

function parseEnterpriseInput(value: string) {
  return Object.values(enterpriseProfiles).find((item) => item.name === value)?.id ?? value
}

function parseRelationInput(value: string) {
  return relationTypeOptions.find((item) => item.label === value || item.value === value)?.value ?? value
}

function parseBooleanInput(value: string) {
  if (value === '是') return 'true'
  if (value === '否') return 'false'
  return value
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
    relationTypes: relationTypeOptions,
    roles: roleTypeOptions,
    dimensions: [
      { value: 'industry_status', label: '行业地位' },
      { value: 'tech_direction', label: '技术方向' },
      { value: 'operation_status', label: '经营状况' },
    ],
    techFields: ['人工智能', '知识图谱', '智能制造', '集成电路', '工业软件'],
  }
}

function queryRelationsForExpert(scholar: ScholarDetail) {
  const params = queryRequestPayload()
  const selectedTypes = params.relationTypes.length
    ? params.relationTypes.filter(Boolean)
    : relationTypeOptions.map((item) => item.value)
  const relationSeeds = [
    { type: 'employment', role: 'chief_scientist', field: '人工智能', mode: cooperationModeOptions[0] },
    { type: 'advisor', role: 'technical_consultant', field: '智能制造', mode: cooperationModeOptions[1] },
    { type: 'cooperation', role: 'project_leader', field: '知识图谱', mode: cooperationModeOptions[2] },
    { type: 'tech_transfer', role: 'technical_partner', field: '集成电路', mode: cooperationModeOptions[3] },
    { type: 'patent_cooperation', role: 'project_leader', field: '生物医药', mode: cooperationModeOptions[4] },
    { type: 'investment', role: 'chief_scientist', field: '新能源材料', mode: cooperationModeOptions[5] },
    { type: 'founder', role: 'technical_partner', field: '工业软件', mode: cooperationModeOptions[0] },
    { type: 'consultant', role: 'technical_consultant', field: '量子信息', mode: cooperationModeOptions[1] },
  ].filter((seed) => selectedTypes.includes(seed.type))
  if (!relationSeeds.length) return []

  const selectedIndex = params.relationTypes.length
    ? relationTypeOptions.findIndex((item) => item.value === params.relationTypes[0])
    : 0
  const startIndex = selectedIndex >= 0 ? selectedIndex : 0
  return Object.values(enterpriseProfiles)
    .slice(startIndex)
    .concat(Object.values(enterpriseProfiles).slice(0, startIndex))
    .slice(0, Math.max(1, Math.min(params.limit, params.relationTypes.length ? relationSeeds.length + 1 : Object.keys(enterpriseProfiles).length)))
    .map((enterprise, index): BuiltRelation => {
      const seed = relationSeeds[index % relationSeeds.length]
      const role = roleOption(seed.role)
      return {
        relationId: `${scholar.id}->${enterprise.id}@${index}`,
        expertId: scholar.id,
        expertName: scholar.name,
        expertTitle: scholar.title,
        expertInstitution: scholar.institution,
        enterpriseId: enterprise.id,
        enterpriseName: enterprise.name,
        relationType: seed.type,
        relationLabel: relationLabel(seed.type),
        roleType: role.value,
        roleLabel: role.label,
        roleLevel: role.level,
        cooperationField: seed.field,
        cooperationMode: seed.mode,
        period: { start: params.startTime, end: params.endTime },
        enterpriseProfile: params.includeEnterpriseProfile
          ? {
              industryStatus: `${enterprise.province}${enterprise.city}${enterprise.orgType}，${enterprise.listingStatus}`,
              techDirection: enterprise.mainProducts.join('、'),
              operationStatus: `营收${formatMoney(enterprise.financial.operatingRevenue)}，研发投入${formatMoney(enterprise.financial.rdAmount)}`,
            }
          : undefined,
      }
    })
}

function handleSearch() {
  loading.value = true
  errorMsg.value = ''
  if (activeSub.value === 'query') {
    const scholar = currentScholar()
    if (!scholar) {
      queryResult.value = null
      detailResp.value = null
      analysisResp.value = null
      graphNodes.value = []
      errorMsg.value = '未查询到相关结果，请检查输入信息是否正确。'
      lastTestTime.value = new Date().toLocaleString('zh-CN', { hour12: false })
      resultTab.value = 'structured'
      loading.value = false
      return
    }
    const relations = queryRelationsForExpert(scholar)
    const data = {
      status: 'success',
      expertId: scholar.id,
      expertName: scholar.name,
      expertTitle: scholar.title,
      expertInstitution: scholar.institution,
      relationCount: relations.length,
      relations: relations.map((item) => ({
        relationId: item.relationId,
        enterpriseId: item.enterpriseId,
        enterpriseName: item.enterpriseName,
        relationType: item.relationType,
        relationLabel: item.relationLabel,
        roleType: item.roleType,
        roleLabel: item.roleLabel,
        roleLevel: item.roleLevel,
        cooperationField: item.cooperationField,
        cooperationMode: item.cooperationMode,
        period: item.period,
        enterpriseProfile: item.enterpriseProfile,
      })),
    }
    queryResult.value = data
    const firstRelation = relations[0]
    if (firstRelation) {
      detailParams.value.expertId = scholar.id
      detailParams.value.enterpriseId = firstRelation.enterpriseId
      analyzeParams.value.enterpriseId = firstRelation.enterpriseId
    }
    graphNodes.value = buildRadialGraph(
      `专家：${data.expertName}`,
      `${data.expertTitle}｜${data.expertInstitution}`,
      data.relations.map((r) => ({
        title: `企业：${r.enterpriseName}`,
        subtitle: `${r.enterpriseProfile?.industryStatus ?? '-'}｜${r.cooperationField}`,
        relation: r.relationLabel,
      })),
    )
  } else if (activeSub.value === 'detail') {
    const params = detailRequestPayload()
    const scholar = scholarProfiles[params.expertId] ?? currentScholar()
    const enterprise = enterpriseById(params.enterpriseId)
    if (!scholar || !enterprise) {
      detailResp.value = null
      graphNodes.value = []
      errorMsg.value = '未查询到相关结果，请检查输入信息是否正确。'
      lastTestTime.value = new Date().toLocaleString('zh-CN', { hour12: false })
      resultTab.value = 'structured'
      loading.value = false
      return
    }
    const matchedRelation = queryRelationsForExpert(scholar).find((item) => item.enterpriseId === enterprise.id)
    const role = roleOption(matchedRelation?.roleType ?? 'technical_consultant')
    const data = {
      status: 'success',
      relationId: `${scholar.id}->${enterprise.id}@detail`,
      expertId: scholar.id,
      expertName: scholar.name,
      expertInstitution: scholar.institution,
      enterpriseId: enterprise.id,
      enterpriseName: enterprise.name,
      relationType: matchedRelation?.relationType ?? 'advisor',
      relationLabel: matchedRelation?.relationLabel ?? relationLabel('advisor'),
      roleType: role.value,
      roleLabel: role.label,
      roleLevel: role.level,
      cooperationField: matchedRelation?.cooperationField ?? enterprise.mainProducts[0] ?? '人工智能',
      cooperationMode: matchedRelation?.cooperationMode ?? cooperationModeOptions[1],
      period: { start: '2021-01-01', end: '2024-12-31' },
      evidence: [
        { evidenceType: 'project', title: `${enterprise.mainProducts[0]}联合研发项目`, time: '2022-06-18' },
        { evidenceType: 'patent', title: `${enterprise.mainProducts[1] ?? '核心技术'}相关专利共同申请`, time: '2023-09-12' },
        { evidenceType: 'paper', title: `${enterprise.industryChains[0]?.chain ?? '产业'}技术合作论文`, time: '2024-03-28' },
      ],
    }
    detailResp.value = data
    analyzeParams.value.enterpriseId = enterprise.id
    graphNodes.value = buildRadialGraph(`专家：${scholar.name}`, `${scholar.title}｜${scholar.institution}`, [
      {
        title: `企业：${enterprise.name}`,
        subtitle: `${data.roleLabel}｜${data.cooperationField}｜${data.period.start}~${data.period.end}`,
        relation: data.relationLabel,
      },
    ])
  } else {
    const params = analyzeRequestPayload()
    const enterprise = enterpriseById(params.enterpriseId)
    if (!enterprise) {
      analysisResp.value = null
      graphNodes.value = []
      errorMsg.value = '未查询到相关结果，请检查输入信息是否正确。'
      lastTestTime.value = new Date().toLocaleString('zh-CN', { hour12: false })
      resultTab.value = 'structured'
      loading.value = false
      return
    }
    const dimensions = {
      industry_status: {
        available: true,
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
      tech_direction: {
        available: true,
        facts: {
          industryClass: enterprise.industryClass,
          mainActivities: enterprise.mainActivities,
          mainProducts: enterprise.mainProducts.join('、'),
          patentCount: enterprise.patentCount,
          patents: enterprise.patents,
        },
        conclusion: `主营${enterprise.mainProducts.join('、')}，相关专利 ${enterprise.patentCount} 项。`,
      },
      operation_status: {
        available: true,
        facts: { source: 'stock', ...enterprise.financial },
        conclusion: `最近一期营业收入 ${formatMoney(enterprise.financial.operatingRevenue)}，净利润 ${formatMoney(enterprise.financial.pureProfit)}。`,
      },
    }
    const data = {
      status: 'success',
      enterpriseId: enterprise.id,
      enterpriseName: enterprise.name,
      dimensions,
      patentStats: {
        total: enterprise.patentCount,
        distribution: enterprise.cpc,
      },
      conclusion: `${enterprise.name}在${enterprise.industryChains[0]?.chain ?? enterprise.industryClass}方向具备专家合作与技术转化价值。`,
      cooperationValue: `${enterprise.coreTechLayout} 可支撑专家合作、成果转化和产业链协同分析。`,
    }
    analysisResp.value = data
    graphNodes.value = buildRadialGraph(
      `企业：${data.enterpriseName}`,
      `${enterprise.orgType}｜${enterprise.province}${enterprise.city}｜${enterprise.listingStatus}`,
      Object.keys(data.dimensions)
        .filter((k) => data.dimensions[k as keyof typeof data.dimensions].available)
        .map((k) => ({
          title: dimensionChinese[k] ?? k,
          subtitle: k === 'operation_status' ? `营收${formatMoney(enterprise.financial.operatingRevenue)}｜研发${formatMoney(enterprise.financial.rdAmount)}` : data.dimensions[k as keyof typeof data.dimensions].conclusion,
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
  if (activeSub.value === 'detail') return detailResp.value
  if (activeSub.value === 'analyze') return analysisResp.value
  return queryResult.value
})

const detailRows = computed<(string | number)[][]>(() => {
  if (activeSub.value === 'detail') {
    const r = detailResp.value
    if (!r) return []
    const p = r.period ?? {}
    return [
      ['专家/人才名称', r.expertName ?? '-'],
      ['重点关注科技企业', r.enterpriseName ?? '-'],
      ['关系类型', r.relationLabel ?? '-'],
      ['专家角色', r.roleLabel ?? '-'],
      ['合作领域', r.cooperationField ?? '-'],
      ['合作时间', `${p?.start ?? ''} 至 ${p?.end ?? ''}`],
      ['合作模式', r.cooperationMode ?? '-'],
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
      ['合作价值', r.cooperationValue ?? r.conclusion ?? '-'],
    ]
  }
  const r = queryResult.value
  if (!r) return []
  const rels = Array.isArray(r.relations) ? r.relations : []
  const rows: (string | number)[][] = [
    ['专家/人才名称', r.expertName ?? r.expertId ?? '-'],
  ]
  rels.forEach((rel: any, index: number) => {
    rows.push(
      [`重点关注企业名称${index + 1}`, rel.enterpriseName ?? rel.enterpriseId ?? '-'],
      [`关系类型${index + 1}`, rel.relationLabel ?? rel.relationType ?? '-'],
      [`专家角色${index + 1}`, rel.roleLabel ?? '-'],
      [`合作领域${index + 1}`, rel.cooperationField ?? '-'],
      [`合作模式${index + 1}`, rel.cooperationMode ?? '-'],
      [`企业背景${index + 1}`, rel.enterpriseProfile ? `${rel.enterpriseProfile.industryStatus}；${rel.enterpriseProfile.techDirection}` : '-'],
    )
  })
  return rows
})

const apiExample = computed(() => {
  const fallback =
    activeSub.value === 'detail'
      ? {
          status: 'success',
      expertId: detailParams.value.expertId,
      enterpriseId: detailParams.value.enterpriseId,
      relationType: '',
      relationLabel: '',
      roleLabel: '',
      cooperationField: '',
      cooperationMode: '',
      period: {},
    }
      : activeSub.value === 'analyze'
        ? {
            status: 'success',
            enterpriseId: analyzeParams.value.enterpriseId,
            enterpriseName: '',
            dimensions: {},
            patentStats: {},
            conclusion: '',
          }
        : {
            status: 'success',
            expertId: queryParams.value.expertId,
            expertName: '',
            relationCount: 0,
            relations: [],
          }
  const data = activeResult.value ?? fallback
  return JSON.stringify({ code: 200, success: true, data, msg: 'success' }, null, 2)
})

const requestRows = computed<string[][]>(() => {
  if (activeSub.value === 'detail') {
    return [
      ['expertId', 'string', '是', '专家ID'],
      ['enterpriseId', 'string', '是', '企业ID'],
    ]
  }
  if (activeSub.value === 'analyze') {
    return [
      ['enterpriseId', 'string', '是', '企业ID'],
    ]
  }
  return [
    ['expertId', 'string', '是', '专家ID'],
    ['relationTypes', 'string[]', '否', '关系类型：employment、advisor、cooperation、tech_transfer、patent_cooperation 等'],
    ['startTime', 'string', '否', '关系开始时间'],
    ['endTime', 'string', '否', '关系结束时间'],
    ['limit', 'int', '否', '返回企业数量上限'],
    ['includeEnterpriseProfile', 'boolean', '否', '是否返回企业背景摘要'],
  ]
})

const responseRows = computed<string[][]>(() => {
  if (activeSub.value === 'detail') {
    return [
      ['code', 'int', '业务状态码（200 成功）'],
      ['data', 'object', '结果对象'],
      ['data.expertName', 'string', '专家姓名'],
      ['data.enterpriseName', 'string', '企业名称'],
      ['data.relationLabel', 'string', '关系类型中文标签'],
      ['data.roleLabel', 'string', '专家角色标签'],
      ['data.cooperationField', 'string', '合作领域'],
      ['data.cooperationMode', 'string', '合作模式'],
      ['data.period', 'object', '合作时间'],
      ['message', 'string', '返回消息'],
    ]
  }
  if (activeSub.value === 'analyze') {
    return [
      ['code', 'int', '业务状态码（200 成功）'],
      ['data', 'object', '结果对象'],
      ['data.enterpriseName', 'string', '重点关注科技企业名称'],
      ['data.dimensions.industry_status.conclusion', 'string', '企业行业地位'],
      ['data.dimensions.tech_direction.conclusion', 'string', '企业技术方向'],
      ['data.dimensions.operation_status.conclusion', 'string', '企业经营状况'],
      ['data.patentStats', 'object', '专利统计摘要'],
      ['data.conclusion', 'string', '分析结论'],
      ['message', 'string', '返回消息'],
    ]
  }
  return [
    ['code', 'int', '业务状态码（200 成功）'],
    ['data', 'object', '结果对象'],
    ['data.expertName', 'string', '专家/人才名称'],
    ['data.relations', 'array', '关联重点关注科技企业'],
    ['data.relations[].enterpriseName', 'string', '企业名称'],
    ['data.relations[].relationLabel', 'string', '关系类型中文标签'],
    ['data.relations[].roleLabel', 'string', '专家角色'],
    ['data.relations[].cooperationField', 'string', '合作领域'],
    ['data.relations[].cooperationMode', 'string', '合作模式'],
    ['data.relations[].enterpriseProfile', 'object', '企业背景摘要'],
    ['message', 'string', '返回消息'],
  ]
})

const codeSamples = computed<Record<string, string>>(() => {
  const url = apiPath.value
  const payload =
    activeSub.value === 'detail'
      ? JSON.stringify(detailRequestPayload(), null, 2)
      : activeSub.value === 'analyze'
        ? JSON.stringify(analyzeRequestPayload(), null, 2)
        : JSON.stringify(queryRequestPayload(), null, 2)
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
          <div v-if="!graphNodes.length" class="er-empty">
            <strong>{{ errorMsg ? '查询失败' : currentSub.name }}</strong>
            <span>{{ errorMsg || '点击「执行测试」查看关系图谱' }}</span>
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
          <div v-else-if="resultTab === 'structured'" class="result-empty">
            <strong v-if="errorMsg">查询失败</strong>
            <span>{{ errorMsg || '暂无结果，请先执行测试' }}</span>
          </div>
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
        <div class="modal__body config-form" @click="activeCombo = ''">
          <template v-if="activeSub === 'query'">
            <label>
              <span><i>*</i>expertId</span>
              <div class="combo-field" @click.stop>
                <input :value="scholarDisplay(queryParams.expertId)" placeholder="请选择或输入专家名称" @focus="openCombo('query-expert')" @input="queryParams.expertId = parseScholarInput(($event.target as HTMLInputElement).value)" />
                <button class="combo-field__arrow" type="button" @click="toggleCombo('query-expert')"><img :src="iconSelectArrow" alt="" aria-hidden="true" /></button>
                <ul v-if="activeCombo === 'query-expert'" class="combo-field__menu">
                  <li v-for="item in scholarComboOptions" :key="item.value">
                    <button type="button" @mousedown.prevent="pickComboValue('query-expert', (value) => { queryParams.expertId = value }, item.value)">
                      <strong>{{ item.label }}</strong>
                    </button>
                  </li>
                </ul>
              </div>
            </label>
            <label>
              <span><i></i>relationTypes</span>
              <div class="combo-field" @click.stop>
                <input :value="relationDisplay(queryParams.relationTypes[0] ?? '')" placeholder="请选择或输入关系类型" @focus="openCombo('query-relation')" @input="queryParams.relationTypes[0] = parseRelationInput(($event.target as HTMLInputElement).value)" />
                <button class="combo-field__arrow" type="button" @click="toggleCombo('query-relation')"><img :src="iconSelectArrow" alt="" aria-hidden="true" /></button>
                <ul v-if="activeCombo === 'query-relation'" class="combo-field__menu">
                  <li v-for="item in relationComboOptions" :key="item.value">
                    <button type="button" @mousedown.prevent="pickComboValue('query-relation', (value) => { queryParams.relationTypes[0] = value }, item.value)">
                      <strong>{{ item.label }}</strong>
                    </button>
                  </li>
                </ul>
              </div>
            </label>
            <label>
              <span><i></i>startTime</span>
              <input v-model="queryParams.startTime" type="date" />
            </label>
            <label>
              <span><i></i>endTime</span>
              <input v-model="queryParams.endTime" type="date" />
            </label>
            <label>
              <span><i></i>limit</span>
              <div class="combo-field" @click.stop>
                <input v-model.number="queryParams.limit" type="number" min="1" placeholder="请选择或输入返回数量" @focus="openCombo('query-limit')" />
                <button class="combo-field__arrow" type="button" @click="toggleCombo('query-limit')"><img :src="iconSelectArrow" alt="" aria-hidden="true" /></button>
                <ul v-if="activeCombo === 'query-limit'" class="combo-field__menu">
                  <li v-for="item in limitOptions" :key="item.value">
                    <button type="button" @mousedown.prevent="pickComboValue('query-limit', (value) => { queryParams.limit = Number(value) }, item.value)">
                      <strong>{{ item.label }}</strong>
                    </button>
                  </li>
                </ul>
              </div>
            </label>
            <label>
              <span><i></i>includeEnterpriseProfile</span>
              <div class="combo-field" @click.stop>
                <input :value="booleanDisplay(queryParams.includeEnterpriseProfile)" placeholder="请选择是否包含企业画像" @focus="openCombo('query-profile')" @input="queryParams.includeEnterpriseProfile = parseBooleanInput(($event.target as HTMLInputElement).value)" />
                <button class="combo-field__arrow" type="button" @click="toggleCombo('query-profile')"><img :src="iconSelectArrow" alt="" aria-hidden="true" /></button>
                <ul v-if="activeCombo === 'query-profile'" class="combo-field__menu">
                  <li v-for="item in booleanOptions" :key="item.value">
                    <button type="button" @mousedown.prevent="pickComboValue('query-profile', (value) => { queryParams.includeEnterpriseProfile = value }, item.value)">
                      <strong>{{ item.label }}</strong>
                    </button>
                  </li>
                </ul>
              </div>
            </label>
          </template>

          <template v-else-if="activeSub === 'detail'">
            <label>
              <span><i>*</i>expertId</span>
              <div class="combo-field" @click.stop>
                <input :value="scholarDisplay(detailParams.expertId)" placeholder="请选择或输入专家名称" @focus="openCombo('detail-expert')" @input="detailParams.expertId = parseScholarInput(($event.target as HTMLInputElement).value)" />
                <button class="combo-field__arrow" type="button" @click="toggleCombo('detail-expert')"><img :src="iconSelectArrow" alt="" aria-hidden="true" /></button>
                <ul v-if="activeCombo === 'detail-expert'" class="combo-field__menu">
                  <li v-for="item in scholarComboOptions" :key="item.value">
                    <button type="button" @mousedown.prevent="pickComboValue('detail-expert', (value) => { detailParams.expertId = value }, item.value)">
                      <strong>{{ item.label }}</strong>
                    </button>
                  </li>
                </ul>
              </div>
            </label>
            <label>
              <span><i>*</i>enterpriseId</span>
              <div class="combo-field" @click.stop>
                <input :value="enterpriseDisplay(detailParams.enterpriseId)" placeholder="请选择或输入企业名称" @focus="openCombo('detail-enterprise')" @input="detailParams.enterpriseId = parseEnterpriseInput(($event.target as HTMLInputElement).value)" />
                <button class="combo-field__arrow" type="button" @click="toggleCombo('detail-enterprise')"><img :src="iconSelectArrow" alt="" aria-hidden="true" /></button>
                <ul v-if="activeCombo === 'detail-enterprise'" class="combo-field__menu">
                  <li v-for="item in enterpriseComboOptions" :key="item.value">
                    <button type="button" @mousedown.prevent="pickComboValue('detail-enterprise', (value) => { detailParams.enterpriseId = value }, item.value)">
                      <strong>{{ item.label }}</strong>
                    </button>
                  </li>
                </ul>
              </div>
            </label>
          </template>

          <template v-else>
            <label>
              <span><i>*</i>enterpriseId</span>
              <div class="combo-field" @click.stop>
                <input :value="enterpriseDisplay(analyzeParams.enterpriseId)" placeholder="请选择或输入企业名称" @focus="openCombo('analyze-enterprise')" @input="analyzeParams.enterpriseId = parseEnterpriseInput(($event.target as HTMLInputElement).value)" />
                <button class="combo-field__arrow" type="button" @click="toggleCombo('analyze-enterprise')"><img :src="iconSelectArrow" alt="" aria-hidden="true" /></button>
                <ul v-if="activeCombo === 'analyze-enterprise'" class="combo-field__menu">
                  <li v-for="item in enterpriseComboOptions" :key="item.value">
                    <button type="button" @mousedown.prevent="pickComboValue('analyze-enterprise', (value) => { analyzeParams.enterpriseId = value }, item.value)">
                      <strong>{{ item.label }}</strong>
                    </button>
                  </li>
                </ul>
              </div>
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
            重点关注科技企业关系服务围绕科技专家或人才，查询专家与重点科技企业之间的任职、顾问、合作、技术转化、专利合作等关系，并展示专家角色、合作领域、合作模式及企业背景信息。第一接口返回的 expertId 与 enterpriseId 可直接作为第二接口输入，第二接口确定的 enterpriseId 可继续作为第三接口输入，形成专家企业列表、关系详情、企业背景分析的连续测试链路。
          </p>
          <h3 class="modal__section-title">推理流程</h3>
          <p class="modal__desc">
            输入专家 → 返回多家相关重点科技企业 → 选择专家与企业查看关系详情 → 选择企业聚合行业地位、技术方向和经营状况 → 输出结构化关系图谱与分析结果。
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
  width: 360px;
  min-height: 180px;
  place-items: center;
  align-self: center;
  justify-self: center;
  padding: var(--space-24);
  border: 1px dashed #b5d3fc;
  border-radius: var(--radius-lg);
  color: var(--text-secondary);
  text-align: center;
  font-size: 15px;
}

.result-empty strong {
  color: var(--text-primary);
  font-size: 18px;
}

.result-empty span {
  margin-top: var(--space-8);
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
  object-fit: contain;
}

.combo-field__menu {
  position: absolute;
  z-index: 36;
  top: calc(100% + 6px);
  right: 0;
  left: 0;
  display: grid;
  max-height: 186px;
  margin: 0;
  padding: 6px;
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  background: var(--surface);
  box-shadow: 0 12px 30px rgba(29, 33, 41, 0.14);
  overflow-y: auto;
  list-style: none;
}

.combo-field__menu li {
  min-width: 0;
}

.combo-field__menu button {
  display: block;
  width: 100%;
  min-height: 34px;
  padding: 0 10px;
  border: 0;
  border-radius: var(--radius-sm);
  color: #86909c;
  cursor: pointer;
  background: transparent;
  text-align: left;
}

.combo-field__menu button:hover {
  color: var(--primary);
  background: rgba(47, 102, 246, 0.08);
}

.combo-field__menu strong {
  font-weight: 400;
}

.combo-field__menu span {
  margin-left: 8px;
  color: inherit;
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
