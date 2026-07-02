<script setup lang="ts">
import { computed, reactive, ref, watch } from 'vue'
import { useRoute } from 'vue-router'

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
import { getPrototypeModule } from './prototype-data'
import type { InterfacePrototype, PrototypeEdge, PrototypeNode } from './prototype-data'

type DraggablePrototypeNode = PrototypeNode & { icon?: string }
type LinkedPrototypeEdge = PrototypeEdge & { sourceId?: string; targetId?: string }

const route = useRoute()

const activeView = ref<'test' | 'developer'>('test')
const resultMode = ref<'structured' | 'api'>('structured')
const activeCode = ref<'python' | 'node' | 'curl'>('python')
const showConfigModal = ref(false)
const showTechModal = ref(false)
const copied = ref(false)
const activeInterfaceIndex = ref(defaultInterfaceIndex(String(route.name ?? '')))
const activeSampleIndex = ref(0)
const lastTestTime = ref('2026-07-23 11:00:00')
const activeIndirectCombo = ref<'corenode_id' | 'relation_type' | null>(null)
const indirectErrorMessage = ref('')
const activeAchievementCombo = ref<'expertAId' | 'expertBId' | 'achievementTypes' | null>(null)
const achievementErrorMessage = ref('')
const activeGenericCombo = ref<string | null>(null)
const activeIndustryCombo = ref<string | null>(null)
const genericParams = ref<Record<string, string>>({})
const collapsedIndustryLinks = ref<Record<string, boolean>>({})
const INDUSTRY_ROOT_COLLAPSED_KEY = '__root__'

function isDateFieldName(fieldName: string) {
  return /(^|_)(start|end)_?(time|year)$/i.test(fieldName) || /^(start|end)(Time|Year)$/.test(fieldName) || fieldName.includes('Time') || fieldName.includes('_time')
}

function defaultInterfaceIndex(_routeName: string) {
  return 0
}

type IndustryChainLink = {
  id: string
  name: string
  level: number
  technologies: string[]
  enterprises: string[]
  experts: string[]
  products: string[]
  patents: number
  news: string[]
}

type IndustryChainSeed = {
  code: string
  name: string
  path: string
  links: IndustryChainLink[]
  description: string
  relations: Array<{ from: string; to: string; type: string; name: string; strength: number; dataFlow: string }>
}

const industryChainForm = reactive({
  chain_name: '人工智能产业链',
  level: '3',
  relation_type: '全部',
  limit: '100',
})

const industryChainSeeds: Record<string, IndustryChainSeed> = {
  AI_CHAIN: {
    code: 'AI_CHAIN',
    name: '人工智能产业链',
    path: '人工智能 / 算力基础 / 大模型 / 行业应用',
    description: '围绕人工智能核心技术、基础设施、平台服务和应用场景形成的产业链结构',
    links: [
      { id: 'ai-up', name: '上游基础资源', level: 1, technologies: ['数据治理', '算力芯片', '向量数据库'], enterprises: ['寒武纪', '阿里云', '华为昇腾'], experts: ['李佳宁', '张明远'], products: ['训练数据集', 'AI服务器'], patents: 18, news: ['智算中心扩容', '国产算力适配'] },
      { id: 'ai-core', name: '中游核心技术', level: 2, technologies: ['知识图谱', '机器学习', '大模型'], enterprises: ['百度智能云', '智谱AI', '商汤科技'], experts: ['周欣怡', '王启航'], products: ['大模型平台', '图谱推理引擎'], patents: 26, news: ['多模态模型升级', '产业合作发布'] },
      { id: 'ai-down', name: '下游应用场景', level: 3, technologies: ['智能制造', '智慧医疗', '自动驾驶'], enterprises: ['科大讯飞', '旷视科技', '中科创达'], experts: ['陈思远', '赵清宁'], products: ['工业质检系统', '智能问诊助手'], patents: 14, news: ['行业大模型落地', '场景应用示范'] },
    ],
    relations: [
      { from: '上游基础资源', to: '中游核心技术', type: 'upstream_downstream', name: '上下游关系', strength: 94, dataFlow: '数据集 / 算力指标 / 模型训练日志' },
      { from: '中游核心技术', to: '下游应用场景', type: 'data_flow', name: '数据流向关系', strength: 91, dataFlow: 'API服务 / 推理结果 / 行业知识库' },
      { from: '下游应用场景', to: '中游核心技术', type: 'event_related', name: '事件关联关系', strength: 82, dataFlow: '用户行为 / 质检样本 / 效果评估' },
    ],
  },
  ROBOT_CHAIN: {
    code: 'ROBOT_CHAIN',
    name: '机器人产业链',
    path: '机器人 / 关键零部件 / 控制系统 / 场景应用',
    description: '围绕机器人关键零部件、控制系统、具身智能和应用场景形成的产业链结构',
    links: [
      { id: 'robot-up', name: '上游关键零部件', level: 1, technologies: ['传感器', '伺服电机', '减速器'], enterprises: ['汇川技术', '绿的谐波', '奥比中光'], experts: ['陈建国', '韩思远'], products: ['六维力传感器', '高精度减速器'], patents: 21, news: ['核心零部件国产化', '高精度传感升级'] },
      { id: 'robot-core', name: '中游控制系统', level: 2, technologies: ['运动控制', '具身智能', '多模态感知'], enterprises: ['优必选', '傅利叶智能', '节卡机器人'], experts: ['刘芳', '王启航'], products: ['机器人控制器', '灵巧手系统'], patents: 29, news: ['灵巧手控制突破', '具身智能平台发布'] },
      { id: 'robot-down', name: '下游工业场景', level: 3, technologies: ['工业巡检', '康复医疗', '物流分拣'], enterprises: ['新松机器人', '极智嘉', '达闼机器人'], experts: ['赵清宁', '林远航'], products: ['巡检机器人', '协作机械臂'], patents: 16, news: ['工厂试点扩容', '康复机器人入院'] },
    ],
    relations: [
      { from: '上游关键零部件', to: '中游控制系统', type: 'upstream_downstream', name: '上下游关系', strength: 92, dataFlow: '传感数据 / 控制参数 / 零部件指标' },
      { from: '中游控制系统', to: '下游工业场景', type: 'data_flow', name: '数据流向关系', strength: 89, dataFlow: '控制指令 / 运动轨迹 / 任务日志' },
      { from: '下游工业场景', to: '中游控制系统', type: 'event_related', name: '事件关联关系', strength: 80, dataFlow: '故障记录 / 环境样本 / 作业效率' },
    ],
  },
  BIO_CHAIN: {
    code: 'BIO_CHAIN',
    name: '生物医药产业链',
    path: '生物医药 / 靶点发现 / 临床前评价 / 产业转化',
    description: '围绕生物医药实验资源、靶点发现、临床前评价和产业转化形成的产业链结构',
    links: [
      { id: 'bio-up', name: '上游实验资源', level: 1, technologies: ['多组学数据', '高通量筛选', '实验动物模型'], enterprises: ['华大智造', '药明康德', '金域医学'], experts: ['周子谦', '何嘉禾'], products: ['组学数据库', '筛选试剂盒'], patents: 17, news: ['多组学平台升级', '样本库扩容'] },
      { id: 'bio-core', name: '中游靶点发现', level: 2, technologies: ['药物筛选', 'AI制药', '靶点验证'], enterprises: ['晶泰科技', '英矽智能', '百图生科'], experts: ['吴若彤', '林远航'], products: ['AI筛选平台', '候选化合物库'], patents: 24, news: ['靶点验证突破', '候选药物推进'] },
      { id: 'bio-down', name: '下游临床转化', level: 3, technologies: ['临床前评价', '药物递送', '伴随诊断'], enterprises: ['恒瑞医药', '君实生物', '复星医药'], experts: ['顾雨辰', '陈思远'], products: ['临床评价方案', '递送载体'], patents: 13, news: ['转化平台升级', '联合临床研究'] },
    ],
    relations: [
      { from: '上游实验资源', to: '中游靶点发现', type: 'upstream_downstream', name: '上下游关系', strength: 90, dataFlow: '组学数据 / 样本标签 / 筛选结果' },
      { from: '中游靶点发现', to: '下游临床转化', type: 'data_flow', name: '数据流向关系', strength: 87, dataFlow: '候选靶点 / 化合物结构 / 安全性报告' },
      { from: '下游临床转化', to: '中游靶点发现', type: 'event_related', name: '事件关联关系', strength: 78, dataFlow: '疗效指标 / 不良反应 / 入组特征' },
    ],
  },
  QUANTUM_CHAIN: {
    code: 'QUANTUM_CHAIN',
    name: '量子信息产业链',
    path: '量子信息 / 低温设备 / 量子计算 / 安全通信',
    description: '围绕量子低温设备、量子计算、量子安全通信和量子测量形成的产业链结构',
    links: [
      { id: 'quantum-up', name: '上游低温设备', level: 1, technologies: ['稀释制冷', '低噪声测控', '超导材料'], enterprises: ['国盾量子', '中船鹏力', '中科酷原'], experts: ['韩思远', '李明哲'], products: ['低温制冷机', '量子测控线缆'], patents: 12, news: ['低温设备国产替代', '测控链路优化'] },
      { id: 'quantum-core', name: '中游量子计算', level: 2, technologies: ['量子芯片', '量子算法', '量子纠错'], enterprises: ['本源量子', '玻色量子', '量旋科技'], experts: ['张明远', '王启航'], products: ['量子计算云平台', '超导量子芯片'], patents: 20, news: ['量子芯片突破', '云平台开放'] },
      { id: 'quantum-down', name: '下游安全通信', level: 3, technologies: ['量子密钥分发', '量子传感', '量子测量'], enterprises: ['科大国盾', '问天量子', '华为云'], experts: ['周欣怡', '赵清宁'], products: ['量子保密通信终端', '量子传感器'], patents: 11, news: ['城域网应用示范', '传感场景验证'] },
    ],
    relations: [
      { from: '上游低温设备', to: '中游量子计算', type: 'upstream_downstream', name: '上下游关系', strength: 88, dataFlow: '低温参数 / 噪声指标 / 芯片测试数据' },
      { from: '中游量子计算', to: '下游安全通信', type: 'data_flow', name: '数据流向关系', strength: 84, dataFlow: '算法服务 / 密钥分发策略 / 测量结果' },
      { from: '下游安全通信', to: '中游量子计算', type: 'event_related', name: '事件关联关系', strength: 76, dataFlow: '链路稳定性 / 误码率 / 场景需求' },
    ],
  },
  IC_CHAIN: {
    code: 'IC_CHAIN',
    name: '集成电路产业链',
    path: '集成电路 / 材料设备 / 芯片制造 / 终端应用',
    description: '围绕材料设备、芯片设计制造、封测和终端应用形成的产业链结构',
    links: [
      { id: 'ic-up', name: '上游材料设备', level: 1, technologies: ['光刻胶', '刻蚀设备', '硅片材料'], enterprises: ['中微公司', '沪硅产业', '南大光电'], experts: ['沈若谷', '高若琳'], products: ['电子级硅片', '刻蚀机'], patents: 23, news: ['关键材料验证', '设备导入产线'] },
      { id: 'ic-core', name: '中游芯片制造', level: 2, technologies: ['先进制程', 'EDA工具', '封装测试'], enterprises: ['中芯国际', '华虹公司', '长电科技'], experts: ['马清源', '罗文博'], products: ['逻辑芯片', '先进封装'], patents: 31, news: ['产能扩建', '工艺平台升级'] },
      { id: 'ic-down', name: '下游终端应用', level: 3, technologies: ['智能终端', '车规芯片', '工业控制'], enterprises: ['比亚迪半导体', '兆易创新', '韦尔股份'], experts: ['唐静雅', '邱海宁'], products: ['车规MCU', '图像传感器'], patents: 19, news: ['车规认证通过', '终端订单增长'] },
    ],
    relations: [
      { from: '上游材料设备', to: '中游芯片制造', type: 'upstream_downstream', name: '上下游关系', strength: 93, dataFlow: '材料参数 / 设备工艺 / 良率数据' },
      { from: '中游芯片制造', to: '下游终端应用', type: 'data_flow', name: '数据流向关系', strength: 88, dataFlow: '芯片规格 / 测试报告 / 供货计划' },
      { from: '下游终端应用', to: '中游芯片制造', type: 'event_related', name: '事件关联关系', strength: 79, dataFlow: '应用需求 / 失效分析 / 认证反馈' },
    ],
  },
  NEV_CHAIN: {
    code: 'NEV_CHAIN',
    name: '新能源汽车产业链',
    path: '新能源汽车 / 电池材料 / 三电系统 / 整车应用',
    description: '围绕电池材料、三电系统、整车制造和补能服务形成的产业链结构',
    links: [
      { id: 'nev-up', name: '上游电池材料', level: 1, technologies: ['正极材料', '固态电解质', '热管理材料'], enterprises: ['宁德时代', '赣锋锂业', '容百科技'], experts: ['许念青', '周子谦'], products: ['动力电池材料', '固态电池样品'], patents: 27, news: ['固态电池中试', '材料回收扩产'] },
      { id: 'nev-core', name: '中游三电系统', level: 2, technologies: ['电池管理', '电驱控制', '智能底盘'], enterprises: ['比亚迪', '汇川技术', '华为数字能源'], experts: ['陈建国', '刘芳'], products: ['BMS系统', '电驱总成'], patents: 34, news: ['高压平台发布', '电驱效率提升'] },
      { id: 'nev-down', name: '下游整车服务', level: 3, technologies: ['智能座舱', '补能网络', '自动驾驶'], enterprises: ['蔚来汽车', '理想汽车', '小鹏汽车'], experts: ['赵清宁', '王启航'], products: ['整车平台', '换电站'], patents: 22, news: ['车型交付增长', '补能网络扩张'] },
    ],
    relations: [
      { from: '上游电池材料', to: '中游三电系统', type: 'upstream_downstream', name: '上下游关系', strength: 95, dataFlow: '材料性能 / 电芯测试 / 安全指标' },
      { from: '中游三电系统', to: '下游整车服务', type: 'data_flow', name: '数据流向关系', strength: 90, dataFlow: '控制策略 / 能耗数据 / 诊断结果' },
      { from: '下游整车服务', to: '中游三电系统', type: 'event_related', name: '事件关联关系', strength: 81, dataFlow: '用户工况 / 维保记录 / 体验反馈' },
    ],
  },
  LOW_ALTITUDE_CHAIN: {
    code: 'LOW_ALTITUDE_CHAIN',
    name: '低空经济产业链',
    path: '低空经济 / 航材部件 / 飞行平台 / 场景运营',
    description: '围绕航材部件、飞行平台、空域管理和低空场景运营形成的产业链结构',
    links: [
      { id: 'low-up', name: '上游航材部件', level: 1, technologies: ['复合材料', '电推进系统', '导航传感'], enterprises: ['中无人机', '卧龙电驱', '航天彩虹'], experts: ['韩思远', '李明哲'], products: ['电机模组', '机体材料'], patents: 18, news: ['部件国产化', '航材认证推进'] },
      { id: 'low-core', name: '中游飞行平台', level: 2, technologies: ['飞控系统', 'eVTOL', '低空通信'], enterprises: ['亿航智能', '峰飞航空', '小鹏汇天'], experts: ['林远航', '王启航'], products: ['eVTOL整机', '飞控平台'], patents: 25, news: ['适航取证推进', '飞行平台发布'] },
      { id: 'low-down', name: '下游场景运营', level: 3, technologies: ['低空物流', '城市巡检', '应急救援'], enterprises: ['顺丰丰翼', '美团无人机', '中科星图'], experts: ['顾雨辰', '赵清宁'], products: ['配送航线', '巡检平台'], patents: 15, news: ['低空试点扩容', '航线运营示范'] },
    ],
    relations: [
      { from: '上游航材部件', to: '中游飞行平台', type: 'upstream_downstream', name: '上下游关系', strength: 89, dataFlow: '部件指标 / 适航材料 / 测试数据' },
      { from: '中游飞行平台', to: '下游场景运营', type: 'data_flow', name: '数据流向关系', strength: 86, dataFlow: '飞行状态 / 调度计划 / 航线数据' },
      { from: '下游场景运营', to: '中游飞行平台', type: 'event_related', name: '事件关联关系', strength: 77, dataFlow: '运营记录 / 场景需求 / 安全反馈' },
    ],
  },
}

const industryChainOptions = computed(() => ({
  chain_name: Object.values(industryChainSeeds).map((seed) => seed.name),
  level: ['1', '2', '3'],
  relation_type: ['全部', '上下游关系'],
}))

type IndustryEventItem = {
  id: string
  industryChainNodeCode: string
  industryChainNode: string
  eventType: string
  title: string
  eventTime: string
  score: number
  expert: string
  talentRole: string
  enterprise: string
  enterpriseRole: string
  cooperationField: string
  cooperationTime: string
  cooperationMode: string
  industryStatus: string
  techDirection: string
  businessStatus: string
  impact: string
  trend: string
}

const industryEventForm = reactive({
  industryChainNodeCode: '集成电路产业链',
  industryChainSegment: '全部环节',
  eventTypes: '全部',
  topN: '10',
  startTime: '2020-01-01',
  endTime: '2024-12-31',
})

const industryChainNodeNames: Record<string, string> = {
  IC_UPSTREAM_MATERIAL: '集成电路产业链',
  IC_MID_CORE_TECH: '人工智能产业链',
  IC_DOWNSTREAM_APPLICATION: '人工智能产业链',
  IC_KEY_COMPONENT: '机器人产业链',
  IC_INDUSTRY_TRANSFER: '生物医药产业链',
}

const industryChainNameToCode = Object.fromEntries(
  Object.entries(industryChainNodeNames).map(([code, name]) => [name, code]),
)

const industryEventOptions = {
  industryChainNodeCode: ['集成电路产业链', '人工智能产业链', '机器人产业链', '生物医药产业链'],
  industryChainSegment: ['全部环节', '上游原材料', '中游核心技术', '下游应用场景', '关键零部件', '产业转化节点'],
  eventTypes: ['全部', '专利突破', '论文成果', '融资并购', '重大项目', '政策试点', '产品发布'],
  topN: ['3', '5', '10', '20'],
  startTime: ['2019-01-01', '2020-01-01', '2021-01-01', '2022-01-01'],
  endTime: ['2023-12-31', '2024-12-31', '2025-12-31', '2026-12-31'],
}

const industryEventTypeNames: Record<string, string> = {
  全部: '全部事件',
  patent: '专利突破',
  paper: '论文成果',
  fund: '融资并购',
  project: '重大项目',
  policy: '政策试点',
  product: '产品发布',
}

const industryEventTypeCodes = Object.fromEntries(
  Object.entries(industryEventTypeNames).map(([code, name]) => [name, code]),
)

function formatIndustryEventType(value: string) {
  if (value.includes('、')) {
    return value.split('、').map((item) => industryEventTypeNames[item] ?? item).join(' / ')
  }
  return industryEventTypeNames[value] ?? value
}

function formatIndustryChainNodeCode(value: string) {
  return industryChainNodeNames[value] ?? value
}

function formatChineseDate(value: string) {
  const [year, month, day] = value.split('-')
  if (!year || !month || !day) return value
  return `${Number(year)}年${Number(month)}月${Number(day)}日`
}

const industryEventItems: IndustryEventItem[] = [
  { id: 'EVT_PATENT_001', industryChainNodeCode: 'IC_UPSTREAM_MATERIAL', industryChainNode: '上游原材料', eventType: 'patent', title: '高纯前驱体材料制备专利授权', eventTime: '2024-06-15', score: 96.2, expert: '陈建国', talentRole: '发明人', enterprise: '华材科技', enterpriseRole: '联合研发单位', cooperationField: '高纯材料制备', cooperationTime: '2022-03 至 2024-06', cooperationMode: '联合实验室 + 专利共研', industryStatus: '细分材料国产替代龙头', techDirection: '高纯前驱体与材料缺陷控制', businessStatus: '订单增长，产线扩建中', impact: '提升上游材料自给率，降低中游制造成本', trend: '进入中试放大与客户验证阶段' },
  { id: 'EVT_FUND_001', industryChainNodeCode: 'IC_UPSTREAM_MATERIAL', industryChainNode: '上游原材料', eventType: 'fund', title: '战略融资投向低碳原材料产线', eventTime: '2024-03-20', score: 89.4, expert: '李佳宁', talentRole: '项目参与人', enterprise: '源材新能', enterpriseRole: '产业化主体', cooperationField: '低碳原材料', cooperationTime: '2023-01 至 2024-03', cooperationMode: '技术评估 + 产线规划', industryStatus: '区域供应链核心企业', techDirection: '低碳合成与质量追溯', businessStatus: '融资完成，新增产能建设', impact: '增强上游供给稳定性', trend: '与中游头部企业签订长协' },
  { id: 'EVT_PAPER_001', industryChainNodeCode: 'IC_UPSTREAM_MATERIAL', industryChainNode: '上游原材料', eventType: 'paper', title: '材料缺陷预测模型论文发表', eventTime: '2023-11-08', score: 85.7, expert: '周欣怡', talentRole: '作者', enterprise: '华材科技', enterpriseRole: '数据合作方', cooperationField: '材料计算与质量检测', cooperationTime: '2021-09 至 2023-11', cooperationMode: '企业数据 + 高校建模', industryStatus: '质量检测数据优势企业', techDirection: 'AI 材料表征', businessStatus: '检测服务收入提升', impact: '缩短材料研发迭代周期', trend: '模型将嵌入在线质检系统' },
  { id: 'EVT_PROJECT_003', industryChainNodeCode: 'IC_UPSTREAM_MATERIAL', industryChainNode: '上游原材料', eventType: 'project', title: '高纯靶材国产化联合攻关启动', eventTime: '2024-01-18', score: 84.9, expert: '沈若谷', talentRole: '项目参与人', enterprise: '华材科技', enterpriseRole: '联合攻关单位', cooperationField: '高纯靶材制备', cooperationTime: '2023-04 至 2024-01', cooperationMode: '联合攻关 + 工艺验证', industryStatus: '关键材料供应企业', techDirection: '高纯靶材与晶圆材料', businessStatus: '试生产线稳定运行', impact: '补强关键材料供给能力', trend: '进入小批量客户验证' },
  { id: 'EVT_POLICY_003', industryChainNodeCode: 'IC_UPSTREAM_MATERIAL', industryChainNode: '上游原材料', eventType: 'policy', title: '关键材料国产替代示范名单发布', eventTime: '2023-09-26', score: 83.6, expert: '高若琳', talentRole: '项目参与人', enterprise: '源材新能', enterpriseRole: '示范应用单位', cooperationField: '材料国产替代评估', cooperationTime: '2022-08 至 2023-09', cooperationMode: '专家评审 + 示范验证', industryStatus: '区域材料供应链核心企业', techDirection: '关键材料评价体系', businessStatus: '示范订单增加', impact: '提升国产材料导入速度', trend: '形成行业示范推广路径' },
  { id: 'EVT_PATENT_003', industryChainNodeCode: 'IC_UPSTREAM_MATERIAL', industryChainNode: '上游原材料', eventType: 'patent', title: '低缺陷晶圆清洗材料专利公开', eventTime: '2023-06-12', score: 82.8, expert: '马清源', talentRole: '发明人', enterprise: '晶澜材料', enterpriseRole: '专利申请人', cooperationField: '晶圆清洗材料', cooperationTime: '2021-06 至 2023-06', cooperationMode: '联合发明 + 样品测试', industryStatus: '半导体材料成长型企业', techDirection: '低缺陷清洗材料', businessStatus: '研发投入持续提升', impact: '降低材料缺陷导致的良率损失', trend: '向先进制程材料验证推进' },
  { id: 'EVT_PRODUCT_003', industryChainNodeCode: 'IC_UPSTREAM_MATERIAL', industryChainNode: '上游原材料', eventType: 'product', title: '电子级特气纯化设备完成交付', eventTime: '2023-02-24', score: 81.1, expert: '罗文博', talentRole: '项目参与人', enterprise: '清源特气', enterpriseRole: '设备交付企业', cooperationField: '电子级特气纯化', cooperationTime: '2022-02 至 2023-02', cooperationMode: '设备验证 + 工艺优化', industryStatus: '电子特气装备供应商', techDirection: '高纯气体纯化设备', businessStatus: '客户交付能力提升', impact: '提升上游关键材料稳定供给', trend: '扩大到更多晶圆厂产线' },
  { id: 'EVT_FUND_003', industryChainNodeCode: 'IC_UPSTREAM_MATERIAL', industryChainNode: '上游原材料', eventType: 'fund', title: '先进材料中试平台获得产业基金支持', eventTime: '2022-10-09', score: 79.8, expert: '许念青', talentRole: '项目参与人', enterprise: '源材新能', enterpriseRole: '中试平台主体', cooperationField: '先进材料中试', cooperationTime: '2021-11 至 2022-10', cooperationMode: '基金支持 + 平台建设', industryStatus: '中试服务平台企业', techDirection: '材料中试放大', businessStatus: '平台服务收入增长', impact: '提升实验室成果产业化效率', trend: '承接更多高校材料成果' },
  { id: 'EVT_PAPER_003', industryChainNodeCode: 'IC_UPSTREAM_MATERIAL', industryChainNode: '上游原材料', eventType: 'paper', title: '高介电材料可靠性评价论文发表', eventTime: '2022-05-17', score: 78.6, expert: '邱海宁', talentRole: '作者', enterprise: '晶澜材料', enterpriseRole: '实验数据合作方', cooperationField: '高介电材料评价', cooperationTime: '2020-09 至 2022-05', cooperationMode: '企业数据 + 联合测试', industryStatus: '材料评价数据优势企业', techDirection: '高介电材料可靠性', businessStatus: '检测合作扩大', impact: '完善关键材料可靠性评价体系', trend: '纳入企业材料准入流程' },
  { id: 'EVT_PROJECT_004', industryChainNodeCode: 'IC_UPSTREAM_MATERIAL', industryChainNode: '上游原材料', eventType: 'project', title: '材料质量追溯平台试点上线', eventTime: '2021-12-03', score: 76.9, expert: '唐静雅', talentRole: '项目参与人', enterprise: '华材科技', enterpriseRole: '试点企业', cooperationField: '材料质量追溯', cooperationTime: '2020-06 至 2021-12', cooperationMode: '平台试点 + 数据治理', industryStatus: '材料供应链数字化企业', techDirection: '质量追溯与数据治理', businessStatus: '试点客户留存提升', impact: '提升材料批次追溯能力', trend: '扩展到供应链协同场景' },
  { id: 'EVT_PROJECT_001', industryChainNodeCode: 'IC_MID_CORE_TECH', industryChainNode: '中游核心技术', eventType: 'project', title: '图谱推理引擎联合攻关项目验收', eventTime: '2024-09-18', score: 95.1, expert: '张明远', talentRole: '项目参与人', enterprise: '智谱云图', enterpriseRole: '平台共建企业', cooperationField: '知识图谱推理', cooperationTime: '2022-06 至 2024-09', cooperationMode: '联合课题组 + 平台共建', industryStatus: '知识智能平台头部企业', techDirection: '大规模图谱推理与模型融合', businessStatus: '客户数持续增长，经营稳健', impact: '强化中游技术供给能力，带动应用侧适配', trend: '向行业专用模型和实时推理扩展' },
  { id: 'EVT_PRODUCT_001', industryChainNodeCode: 'IC_MID_CORE_TECH', industryChainNode: '中游核心技术', eventType: 'product', title: '行业大模型平台发布', eventTime: '2024-05-12', score: 91.6, expert: '王启航', talentRole: '项目参与人', enterprise: '百度智能云', enterpriseRole: '产品发布主体', cooperationField: '行业大模型与图谱增强', cooperationTime: '2023-02 至 2024-05', cooperationMode: '顾问咨询 + 场景验证', industryStatus: '云与 AI 平台领先企业', techDirection: '多模态大模型与知识增强', businessStatus: '云业务稳步增长', impact: '提升下游应用开发效率', trend: '扩大制造、医疗、政务场景落地' },
  { id: 'EVT_PATENT_002', industryChainNodeCode: 'IC_MID_CORE_TECH', industryChainNode: '中游核心技术', eventType: 'patent', title: '图谱向量混合检索专利公开', eventTime: '2023-12-22', score: 87.9, expert: '李明哲', talentRole: '发明人', enterprise: '智谱云图', enterpriseRole: '专利申请人', cooperationField: '混合检索', cooperationTime: '2022-10 至 2023-12', cooperationMode: '联合发明 + 工程验证', industryStatus: '创新型平台企业', techDirection: '向量检索与符号推理融合', businessStatus: '研发投入加大', impact: '提升图谱查询召回与解释能力', trend: '形成可复用底层组件' },
  { id: 'EVT_POLICY_001', industryChainNodeCode: 'IC_DOWNSTREAM_APPLICATION', industryChainNode: '下游应用场景', eventType: 'policy', title: '智能制造场景应用示范入选', eventTime: '2024-07-05', score: 90.8, expert: '陈思远', talentRole: '项目参与人', enterprise: '科大讯飞', enterpriseRole: '示范应用单位', cooperationField: '工业质检与知识问答', cooperationTime: '2023-04 至 2024-07', cooperationMode: '专家评审 + 场景试点', industryStatus: '智能语音与行业 AI 领军企业', techDirection: '工业质检大模型', businessStatus: '行业解决方案放量', impact: '拉动下游应用生态建设', trend: '复制到更多离散制造场景' },
  { id: 'EVT_PRODUCT_002', industryChainNodeCode: 'IC_DOWNSTREAM_APPLICATION', industryChainNode: '下游应用场景', eventType: 'product', title: '智能问诊助手完成多院部署', eventTime: '2024-02-28', score: 86.5, expert: '赵清宁', talentRole: '项目参与人', enterprise: '医智云', enterpriseRole: '应用落地主体', cooperationField: '智慧医疗应用', cooperationTime: '2022-12 至 2024-02', cooperationMode: '医工协同 + 试点部署', industryStatus: '医疗 AI 成长型企业', techDirection: '医学知识图谱与问诊大模型', businessStatus: '试点医院增加，收入爬坡', impact: '验证下游商业化路径', trend: '推进医保控费和专科助手场景' },
  { id: 'EVT_PROJECT_002', industryChainNodeCode: 'IC_KEY_COMPONENT', industryChainNode: '关键零部件', eventType: 'project', title: '高精度传感器国产化项目启动', eventTime: '2024-04-10', score: 92.3, expert: '韩思远', talentRole: '项目参与人', enterprise: '奥比中光', enterpriseRole: '核心零部件企业', cooperationField: '三维视觉传感', cooperationTime: '2023-08 至 2024-04', cooperationMode: '联合攻关 + 样机验证', industryStatus: '视觉传感器重点企业', techDirection: '高精度三维感知', businessStatus: '新产品导入客户验证', impact: '补强关键零部件短板', trend: '向机器人和低空设备延伸' },
  { id: 'EVT_FUND_002', industryChainNodeCode: 'IC_INDUSTRY_TRANSFER', industryChainNode: '产业转化节点', eventType: 'fund', title: '成果转化基金支持联合实验室', eventTime: '2024-08-16', score: 88.2, expert: '林远航', talentRole: '项目参与人', enterprise: '启明生物科技', enterpriseRole: '成果承接企业', cooperationField: 'AI 制药转化', cooperationTime: '2023-05 至 2024-08', cooperationMode: '基金支持 + 企业孵化', industryStatus: '生物医药创新企业', techDirection: '靶点发现与候选药物筛选', businessStatus: '研发管线推进，现金流充足', impact: '加速科研成果从实验室走向产业', trend: '进入临床前评价和商务合作阶段' },
]

function selectedIndustryEventTypes() {
  if (industryEventForm.eventTypes === '全部') return ['patent', 'paper', 'fund', 'project', 'policy', 'product']
  return industryEventForm.eventTypes
    .split('、')
    .map((item) => item.trim())
    .filter(Boolean)
    .map((item) => industryEventTypeCodes[item] ?? item)
}

function selectedIndustryEventTypeLabels() {
  if (industryEventForm.eventTypes === '全部') return ['全部事件']
  return selectedIndustryEventTypes().map((item) => industryEventTypeNames[item] ?? item)
}

function resolveIndustryChainCode(value: string) {
  return industryChainNodeNames[value] ? value : industryChainNameToCode[value] ?? value
}

function resolveIndustryChainName(value: string) {
  return industryChainNodeNames[value] ?? value
}

function shortGraphText(value: string, maxLength = 12) {
  const text = String(value ?? '').trim()
  if (text.length <= maxLength) return text
  return `${text.slice(0, maxLength)}…`
}

const industryEventTitleSummaries: Record<string, string> = {
  EVT_PATENT_001: '高纯材料专利授权',
  EVT_FUND_001: '低碳材料产线融资',
  EVT_PAPER_001: '材料缺陷模型论文',
  EVT_PROJECT_003: '高纯靶材联合攻关',
  EVT_POLICY_003: '国产替代示范名单',
  EVT_PATENT_003: '晶圆清洗材料专利',
  EVT_PRODUCT_003: '特气纯化设备交付',
  EVT_FUND_003: '中试平台基金支持',
  EVT_PAPER_003: '高介电材料评价论文',
  EVT_PROJECT_004: '质量追溯平台试点',
}

function summarizeIndustryEventTitle(item: IndustryEventItem) {
  return industryEventTitleSummaries[item.id] ?? shortGraphText(item.title.replace(/制备|获得|完成|发布|启动|公开/g, ''), 10)
}

type IndirectRelationItem = {
  key: string
  targetId: string
  targetName: string
  targetTitle: string
  targetOrganization: string
  relationType: string
  relationTag: string
  transferPath: string
  pathDepth: number
  strength: number
}

type IndirectExpertSeed = {
  expertId: string
  name: string
  title: string
  organization: string
  relations: IndirectRelationItem[]
}

const indirectForm = reactive({
  corenode_id: 'E10001',
  relation_type: '全部',
  path_depth: '2',
  minstrength: '0.6',
})

const indirectExpertSeeds: Record<string, IndirectExpertSeed> = {
  E10001: {
    expertId: 'E10001',
    name: '李佳宁',
    title: '研究员',
    organization: '清华大学智能产业研究院',
    relations: [
      { key: 'indirect-e10001-paper', targetId: 'E10011', targetName: '张明远', targetTitle: '研究员', targetOrganization: '中国科学院自动化研究所', relationType: '论文合作', relationTag: '学术间接关系', transferPath: '专家A 李佳宁 → 中间专家 吴若彤 → 专家B 张明远', pathDepth: 2, strength: 0.91 },
      { key: 'indirect-e10001-project', targetId: 'E10012', targetName: '周欣怡', targetTitle: '教授', targetOrganization: '北京航空航天大学计算机学院', relationType: '项目合作', relationTag: '项目间接关系', transferPath: '专家A 李佳宁 → 智能科研协同平台建设项目 → 专家C 周欣怡', pathDepth: 2, strength: 0.84 },
      { key: 'indirect-e10001-patent', targetId: 'E10013', targetName: '王启航', targetTitle: '副教授', targetOrganization: '上海交通大学智能制造学院', relationType: '专利合作', relationTag: '成果间接关系', transferPath: '专家A 李佳宁 → 图谱推理加速专利 → 专家D 王启航', pathDepth: 2, strength: 0.77 },
      { key: 'indirect-e10001-depth3-paper', targetId: 'E10014', targetName: '陈思远', targetTitle: '副研究员', targetOrganization: '中国科学院计算技术研究所', relationType: '论文合作', relationTag: '三跳学术路径', transferPath: '专家A 李佳宁 → 中间专家 吴若彤 → 共同数据集 KG-Bench → 专家E 陈思远', pathDepth: 3, strength: 0.86 },
      { key: 'indirect-e10001-depth3-project', targetId: 'E10015', targetName: '赵清宁', targetTitle: '高级工程师', targetOrganization: '灵动机器人有限公司', relationType: '项目合作', relationTag: '三跳项目路径', transferPath: '专家A 李佳宁 → 智能科研协同平台 → 产业验证课题 → 专家F 赵清宁', pathDepth: 3, strength: 0.79 },
      { key: 'indirect-e10001-depth3-patent', targetId: 'E10016', targetName: '顾雨辰', targetTitle: '副教授', targetOrganization: '复旦大学计算机学院', relationType: '专利合作', relationTag: '三跳成果路径', transferPath: '专家A 李佳宁 → 图谱推理专利族 → 成果转化机构 → 专家G 顾雨辰', pathDepth: 3, strength: 0.72 },
    ],
  },
  E20001: {
    expertId: 'E20001',
    name: '陈建国',
    title: '教授',
    organization: '浙江大学机器人研究院',
    relations: [
      { key: 'indirect-e20001-paper', targetId: 'E20011', targetName: '刘芳', targetTitle: '研究员', targetOrganization: '哈尔滨工业大学机器人技术中心', relationType: '论文合作', relationTag: '学术间接关系', transferPath: '专家A 陈建国 → 中间专家 林远航 → 专家B 刘芳', pathDepth: 2, strength: 0.88 },
      { key: 'indirect-e20001-project', targetId: 'E20012', targetName: '赵清宁', targetTitle: '高级工程师', targetOrganization: '灵动机器人有限公司', relationType: '项目合作', relationTag: '项目间接关系', transferPath: '专家A 陈建国 → 机器人联合创新中心 → 专家C 赵清宁', pathDepth: 2, strength: 0.8 },
      { key: 'indirect-e20001-patent', targetId: 'E20013', targetName: '韩思远', targetTitle: '副教授', targetOrganization: '西安交通大学人工智能学院', relationType: '专利合作', relationTag: '成果间接关系', transferPath: '专家A 陈建国 → 机器人末端执行器专利 → 专家D 韩思远', pathDepth: 2, strength: 0.73 },
      { key: 'indirect-e20001-depth3-paper', targetId: 'E20014', targetName: '马清源', targetTitle: '研究员', targetOrganization: '上海交通大学智能制造学院', relationType: '论文合作', relationTag: '三跳学术路径', transferPath: '专家A 陈建国 → 中间专家 林远航 → 机器人感知数据集 → 专家E 马清源', pathDepth: 3, strength: 0.83 },
      { key: 'indirect-e20001-depth3-project', targetId: 'E20015', targetName: '王启航', targetTitle: '副教授', targetOrganization: '上海交通大学智能制造学院', relationType: '项目合作', relationTag: '三跳项目路径', transferPath: '专家A 陈建国 → 机器人联合创新中心 → 具身智能攻关课题 → 专家F 王启航', pathDepth: 3, strength: 0.76 },
      { key: 'indirect-e20001-depth3-patent', targetId: 'E20016', targetName: '周欣怡', targetTitle: '教授', targetOrganization: '北京航空航天大学计算机学院', relationType: '专利合作', relationTag: '三跳成果路径', transferPath: '专家A 陈建国 → 末端执行器专利族 → 企业试制平台 → 专家G 周欣怡', pathDepth: 3, strength: 0.71 },
    ],
  },
  E30001: {
    expertId: 'E30001',
    name: '周子谦',
    title: '研究员',
    organization: '复旦大学药学院',
    relations: [
      { key: 'indirect-e30001-paper', targetId: 'E30011', targetName: '吴若彤', targetTitle: '副研究员', targetOrganization: '上海药物研究所', relationType: '论文合作', relationTag: '学术间接关系', transferPath: '专家A 周子谦 → 中间专家 何嘉禾 → 专家B 吴若彤', pathDepth: 2, strength: 0.87 },
      { key: 'indirect-e30001-project', targetId: 'E30012', targetName: '林远航', targetTitle: '研究员', targetOrganization: '中国科学院上海药物研究所', relationType: '项目合作', relationTag: '项目间接关系', transferPath: '专家A 周子谦 → 药物靶点联合实验室 → 专家C 林远航', pathDepth: 2, strength: 0.82 },
      { key: 'indirect-e30001-patent', targetId: 'E30013', targetName: '顾雨辰', targetTitle: '教授', targetOrganization: '同济大学生命科学学院', relationType: '专利合作', relationTag: '成果间接关系', transferPath: '专家A 周子谦 → 靶向治疗发明专利 → 专家D 顾雨辰', pathDepth: 2, strength: 0.75 },
      { key: 'indirect-e30001-depth3-paper', targetId: 'E30014', targetName: '何嘉禾', targetTitle: '教授', targetOrganization: '同济大学生命科学学院', relationType: '论文合作', relationTag: '三跳学术路径', transferPath: '专家A 周子谦 → 中间专家 吴若彤 → 药物靶点数据集 → 专家E 何嘉禾', pathDepth: 3, strength: 0.84 },
      { key: 'indirect-e30001-depth3-project', targetId: 'E30015', targetName: '韩思远', targetTitle: '副教授', targetOrganization: '西安交通大学人工智能学院', relationType: '项目合作', relationTag: '三跳项目路径', transferPath: '专家A 周子谦 → 药物靶点联合实验室 → 临床前评价项目 → 专家F 韩思远', pathDepth: 3, strength: 0.77 },
      { key: 'indirect-e30001-depth3-patent', targetId: 'E30016', targetName: '林远航', targetTitle: '研究员', targetOrganization: '中国科学院上海药物研究所', relationType: '专利合作', relationTag: '三跳成果路径', transferPath: '专家A 周子谦 → 靶向治疗专利族 → 成果转化机构 → 专家G 林远航', pathDepth: 3, strength: 0.7 },
    ],
  },
}

const indirectOptions = {
  corenode_id: ['E10001', 'E20001', 'E30001'],
  relation_type: ['全部', '论文合作', '项目合作', '专利合作'],
  path_depth: ['2', '3'],
  minstrength: ['0.6', '0.7', '0.8', '0.9'],
}

const indirectExpertNames: Record<string, string> = {
  E10001: '李佳宁',
  E20001: '陈建国',
  E30001: '周子谦',
}

type AchievementItem = {
  key: string
  expertId: string
  expertName: string
  title: string
  organization: string
  relationType: string
  achievementType: string
  categoryStats: string
  completedAt: string
  field: string
  award: string
  contribution: string
  cooperationMode: string
}

type AchievementExpertSeed = {
  expertId: string
  name: string
  title: string
  organization: string
  achievements: AchievementItem[]
}

const achievementForm = reactive({
  expertAId: 'E10001',
  expertBId: 'E10002',
  achievementTypes: '全部',
  startTime: '2020-01-01',
  endTime: '2025-12-31',
})

const achievementOptions = {
  expertAId: ['E10001', 'E20001', 'E30001'],
  expertBId: ['E10002', 'E10003', 'E10004', 'E20002', 'E20003', 'E20004', 'E30002', 'E30003', 'E30004'],
  achievementTypes: ['全部', 'paper', 'project', 'patent'],
  startTime: ['2019-01-01', '2020-01-01', '2021-01-01', '2022-01-01'],
  endTime: ['2023-12-31', '2024-12-31', '2025-12-31', '2026-12-31'],
}

const achievementExpertNames: Record<string, string> = {
  E10001: '李佳宁',
  E20001: '陈建国',
  E30001: '周子谦',
}

const achievementPartnerNames: Record<string, string> = {
  E10002: '张明远',
  E10003: '周欣怡',
  E10004: '王启航',
  E20002: '刘芳',
  E20003: '王启航',
  E20004: '赵清宁',
  E30002: '吴若彤',
  E30003: '林远航',
  E30004: '何嘉禾',
}

const achievementSeeds: Record<string, AchievementExpertSeed> = {
  E10001: {
    expertId: 'E10001',
    name: '李佳宁',
    title: '研究员',
    organization: '清华大学智能产业研究院',
    achievements: [
      { key: 'ach-e10001-paper', expertId: 'E10002', expertName: '张明远', title: '研究员', organization: '中国科学院自动化研究所', relationType: '论文合作', achievementType: '论文成果', categoryStats: '论文 8 篇 / Q1 论文 3 篇 / 高被引 2 篇', completedAt: '2023-06', field: '科技知识图谱、关系推理', award: '省部级科技进步二等奖', contribution: '提出跨机构专家关系识别模型', cooperationMode: '共同通讯作者 + 数据集共建' },
      { key: 'ach-e10001-project-with-e10002', expertId: 'E10002', expertName: '张明远', title: '研究员', organization: '中国科学院自动化研究所', relationType: '项目合作', achievementType: '项目成果', categoryStats: '项目 1 项 / 平台模块 2 个 / 验收报告 1 份', completedAt: '2024-09', field: '智能科研协同平台', award: '国家级重点研发课题阶段成果', contribution: '完成专家关系发现与验证子模块', cooperationMode: '联合课题组 + 平台共建' },
      { key: 'ach-e10001-patent-with-e10002', expertId: 'E10002', expertName: '张明远', title: '研究员', organization: '中国科学院自动化研究所', relationType: '专利合作', achievementType: '专利成果', categoryStats: '发明专利 1 件 / 授权 1 件', completedAt: '2024-06', field: '关系推理、知识融合', award: '行业奖项优秀创新成果', contribution: '形成专家关系推理方法专利', cooperationMode: '联合发明人 + 成果验证' },
      { key: 'ach-e10001-project', expertId: 'E10003', expertName: '周欣怡', title: '教授', organization: '北京航空航天大学计算机学院', relationType: '项目合作', achievementType: '项目成果', categoryStats: '项目 2 项 / 验收 1 项 / 软件著作权 2 项', completedAt: '2024-12', field: '智能科研协同平台', award: '国家级重点研发课题验收优秀', contribution: '完成科研协同图谱推理模块', cooperationMode: '联合项目组 + 任务分工协作' },
      { key: 'ach-e10001-patent', expertId: 'E10004', expertName: '王启航', title: '副教授', organization: '上海交通大学智能制造学院', relationType: '专利合作', achievementType: '专利成果', categoryStats: '发明专利 2 件 / 授权 1 件 / 转化 1 项', completedAt: '2024-06', field: '图谱推理加速、知识融合', award: '行业奖项优秀创新成果', contribution: '形成图谱推理加速专利方案', cooperationMode: '联合发明人 + 成果转化验证' },
    ],
  },
  E20001: {
    expertId: 'E20001',
    name: '陈建国',
    title: '教授',
    organization: '浙江大学机器人研究院',
    achievements: [
      { key: 'ach-e20001-paper', expertId: 'E20002', expertName: '刘芳', title: '研究员', organization: '哈尔滨工业大学机器人技术中心', relationType: '论文合作', achievementType: '论文成果', categoryStats: '论文 6 篇 / 顶会 2 篇 / 数据集 1 套', completedAt: '2025-03', field: '机器人感知与控制', award: '省部级自然科学二等奖', contribution: '构建机器人多模态感知模型', cooperationMode: '共同实验室 + 论文联合署名' },
      { key: 'ach-e20001-project', expertId: 'E20003', expertName: '王启航', title: '副教授', organization: '上海交通大学智能制造学院', relationType: '项目合作', achievementType: '项目成果', categoryStats: '项目 3 项 / 样机 2 台 / 报告 4 份', completedAt: '2024-10', field: '具身智能装备验证', award: '国家级重点研发项目阶段优秀', contribution: '完成服务机器人样机和验证流程', cooperationMode: '项目牵头 + 跨校联合验证' },
      { key: 'ach-e20001-patent', expertId: 'E20004', expertName: '赵清宁', title: '高级工程师', organization: '灵动机器人有限公司', relationType: '专利合作', achievementType: '专利成果', categoryStats: '专利 3 件 / 授权 2 件 / 企业试制 2 次', completedAt: '2025-03', field: '机器人末端执行器', award: '行业奖项技术创新奖', contribution: '推进末端执行器专利转化', cooperationMode: '高校算法团队 + 企业工程化团队' },
    ],
  },
  E30001: {
    expertId: 'E30001',
    name: '周子谦',
    title: '研究员',
    organization: '复旦大学药学院',
    achievements: [
      { key: 'ach-e30001-paper', expertId: 'E30002', expertName: '吴若彤', title: '副研究员', organization: '上海药物研究所', relationType: '论文合作', achievementType: '论文成果', categoryStats: '论文 7 篇 / Q1 论文 4 篇 / 实验数据集 2 套', completedAt: '2024-12', field: '药物靶点发现', award: '省部级自然科学一等奖', contribution: '完成候选靶点验证方法', cooperationMode: '联合实验设计 + 共同论文发表' },
      { key: 'ach-e30001-project', expertId: 'E30003', expertName: '林远航', title: '研究员', organization: '中国科学院上海药物研究所', relationType: '项目合作', achievementType: '项目成果', categoryStats: '项目 2 项 / 候选靶点 4 个 / 阶段报告 3 份', completedAt: '2025-06', field: '临床前评价', award: '国家级重点专项阶段成果', contribution: '形成药物靶点筛选流程', cooperationMode: '联合课题组 + 实验平台共建' },
      { key: 'ach-e30001-patent', expertId: 'E30004', expertName: '何嘉禾', title: '教授', organization: '同济大学生命科学学院', relationType: '专利合作', achievementType: '专利成果', categoryStats: '发明专利 2 件 / 转化意向 1 项', completedAt: '2024-08', field: '药物递送与靶向治疗', award: '行业奖项转化潜力奖', contribution: '完成靶向治疗专利方案', cooperationMode: '联合发明 + 医工交叉验证' },
    ],
  },
}

const moduleInfo = computed(() => getPrototypeModule(String(route.name ?? 'node-indirect')))
const isIndirectModule = computed(() => String(route.name ?? '') === 'node-indirect')
const isAchievementModule = computed(() => String(route.name ?? '') === 'two-point-achievement')
const isIndustryChainEventModule = computed(() => String(route.name ?? '') === 'industry-chain-event' || currentInterface.value.endpoint.startsWith('/api/v1/industry-chain/topn-events'))
const isIndustryChainPanoramaModule = computed(() => String(route.name ?? '') === 'industry-chain-panorama' || currentInterface.value.endpoint === '/api/industry-chain/panorama/infer')
const title = computed(() => moduleInfo.value.title || String(route.meta.title ?? '知识推理模块'))
const baseInterface = computed(() => moduleInfo.value.interfaces[activeInterfaceIndex.value] ?? moduleInfo.value.interfaces[0])
const sampleScenarios = computed(() => buildSampleScenarios(String(route.name ?? ''), baseInterface.value.name))
const activeScenario = computed(() => sampleScenarios.value[activeSampleIndex.value] ?? sampleScenarios.value[0])
const currentInterface = computed(() => applyScenario(baseInterface.value, activeScenario.value.replacements))
const isIndustryChainEventScreenInterface = computed(() => isIndustryChainEventModule.value && activeInterfaceIndex.value === 0)
function normalizeGenericParamValue(fieldName: string, value: string) {
  const original = currentInterface.value.requestExample[fieldName]
  if (Array.isArray(original)) return value.split('、').map((item) => item.trim()).filter(Boolean)
  if (typeof original === 'number') return Number(value)
  if (typeof original === 'boolean') return value === 'true'
  if (original && typeof original === 'object') {
    try {
      return JSON.parse(value)
    } catch {
      return value
    }
  }
  return value
}
const requestPayload = computed(() => {
  if (isIndustryChainEventModule.value && activeInterfaceIndex.value === 1) {
    const event = selectedIndustryEventForRelation()
    return {
      eventName: event.title,
      expertName: relatedExpertsForSelectedEvent().includes(selectedExpertName()) ? selectedExpertName() : event.expert,
      trace: {
        eventId: event.id,
        expertRole: event.talentRole,
      },
    }
  }
  if (isIndustryChainEventModule.value && activeInterfaceIndex.value === 2) {
    const event = selectedIndustryEventForImpact()
    return {
      eventName: event.title,
      industryChainName: industryChainNodeNames[event.industryChainNodeCode] ?? event.industryChainNode,
      industryChainSegment: event.industryChainNode,
      trace: {
        eventId: event.id,
        industryChainNodeCode: event.industryChainNodeCode,
      },
    }
  }
  if (!Object.keys(genericParams.value).length) return currentInterface.value.requestExample
  return {
    ...currentInterface.value.requestExample,
    ...Object.fromEntries(
      Object.entries(genericParams.value).map(([fieldName, value]) => [fieldName, normalizeGenericParamValue(fieldName, value)]),
    ),
  }
})
const requestJson = computed(() => JSON.stringify(requestPayload.value, null, 2))
const normalizedResponseExample = computed(() => {
  const example = currentInterface.value.responseExample
  const message =
    typeof example.message === 'string'
      ? example.message
      : typeof example.msg === 'string'
        ? example.msg
        : 'success'
  const code = typeof example.code === 'number' ? example.code : 0
  const data = 'data' in example ? example.data : example
  return { code, data, message }
})
const visibleParams = computed(() => currentInterface.value.requestFields)
const activeErrorMessage = computed(() => {
  if (isGenericInputOutOfRange.value) return '未查询到相关结果，请检查输入信息是否正确。'
  if (isIndustryChainEventScreenInterface.value && !industryEventFilteredItems.value.length) return '未查询到相关结果，请检查输入信息是否正确。'
  if (isAchievementModule.value) return achievementErrorMessage.value
  if (isIndirectModule.value) return indirectErrorMessage.value
  return ''
})
const industryEventFilteredItems = computed(() => {
  const topN = Number(industryEventForm.topN) || 5
  const eventTypes = selectedIndustryEventTypes()
  const chainName = resolveIndustryChainName(industryEventForm.industryChainNodeCode)
  return industryEventItems
    .filter((item) => (industryChainNodeNames[item.industryChainNodeCode] ?? item.industryChainNode) === chainName)
    .filter((item) => industryEventForm.industryChainSegment === '全部环节' || item.industryChainNode === industryEventForm.industryChainSegment)
    .filter((item) => eventTypes.includes(item.eventType))
    .filter((item) => item.eventTime >= industryEventForm.startTime && item.eventTime <= industryEventForm.endTime)
    .sort((a, b) => b.score - a.score)
    .slice(0, topN)
})
const industryEventDetailRows = computed<Array<[string, string | string[]]>>(() => {
  const items = industryEventFilteredItems.value
  const nodeName = resolveIndustryChainName(industryEventForm.industryChainNodeCode)
  const eventTypeText = industryEventForm.eventTypes === '全部' ? '全部事件类型' : formatIndustryEventType(industryEventForm.eventTypes)
  const rows: Array<[string, string | string[]]> = [
    ['产业链', nodeName],
    ['产业链环节/节点', industryEventForm.industryChainSegment],
    ['事件类型', eventTypeText],
    ['时间范围', `${formatChineseDate(industryEventForm.startTime)} 至 ${formatChineseDate(industryEventForm.endTime)}`],
    ['返回数量', String(items.length)],
  ]

  if (!items.length) {
    rows.push(['结果状态', '当前参数下暂无匹配事件'])
    return rows
  }

  items.forEach((item, index) => {
    const label = `第${index + 1}`
    rows.push(
      [`${label}事件`, item.title],
      [`${label}关联专家`, item.expert],
    )
  })

  return rows
})

function firstFilteredIndustryEvent() {
  return industryEventFilteredItems.value[0] ?? industryEventItems[0]
}

function selectedEventTitle() {
  return String(genericParams.value.eventName ?? genericParams.value.eventId ?? currentInterface.value.requestExample.eventName ?? currentInterface.value.requestExample.eventId ?? firstFilteredIndustryEvent().title)
}

function selectedExpertName() {
  return String(genericParams.value.expertName ?? genericParams.value.expertId ?? currentInterface.value.requestExample.expertName ?? currentInterface.value.requestExample.expertId ?? selectedIndustryEventForRelation().expert)
}

function selectedIndustryEventByTitle(title: string) {
  return industryEventFilteredItems.value.find((item) => item.title === title) ?? firstFilteredIndustryEvent()
}

function selectedIndustryEventForRelation() {
  return selectedIndustryEventByTitle(selectedEventTitle())
}

function relatedExpertsForSelectedEvent() {
  const event = selectedIndustryEventForRelation()
  return [event.expert]
}

function selectedIndustryEventForImpact() {
  return selectedIndustryEventByTitle(selectedEventTitle())
}

const industryEventRelationRows = computed<Array<[string, string | string[]]>>(() => {
  const event = selectedIndustryEventForRelation()
  const expertName = relatedExpertsForSelectedEvent().includes(selectedExpertName()) ? selectedExpertName() : event.expert
  return [
    ['事件名称', event.title],
    ['专家姓名', expertName],
    ['专家角色', event.talentRole],
    ['关系描述', `${expertName}作为${event.talentRole}参与“${event.title}”，主要承担${event.cooperationField}相关工作。`],
    ['合作模式', event.cooperationMode],
    ['合作时间', event.cooperationTime.replace(/(\d{4})-(\d{2})/g, (_m, year, month) => `${Number(year)}年${Number(month)}月`)],
  ]
})

const industryEventImpactRows = computed<Array<[string, string | string[]]>>(() => {
  const event = selectedIndustryEventForImpact()
  return [
    ['重点事件名称', event.title],
    ['产业链', industryChainNodeNames[event.industryChainNodeCode] ?? event.industryChainNode],
    ['产业链环节/节点', event.industryChainNode],
    ['事件时间', formatChineseDate(event.eventTime)],
    ['事件影响', event.impact],
    ['风险预警', `${event.industryChainNode}环节需关注供应稳定性与技术替代风险。`],
    ['机遇挖掘', `可围绕${event.cooperationField}开展产业化合作和成果转化。`],
  ]
})
const indirectCoreExpert = computed(() => indirectExpertSeeds[indirectForm.corenode_id.trim()] ?? null)
const indirectItems = computed(() => {
  const expert = indirectCoreExpert.value
  if (!expert) return []

  const minStrength = Number(indirectForm.minstrength) || 0
  const pathDepth = Number(indirectForm.path_depth) || 2
  return expert.relations
    .filter((item) => indirectForm.relation_type === '全部' || item.relationType === indirectForm.relation_type)
    .filter((item) => item.pathDepth <= pathDepth)
    .filter((item) => item.strength >= minStrength)
})
const indirectDetailRows = computed<Array<[string, string | string[]]>>(() => {
  const expert = indirectCoreExpert.value
  if (!expert || !indirectItems.value.length) return []

  const rows: Array<[string, string | string[]]> = [
    ['专家 A', expert.name],
    ['专家 A 职称', expert.title],
    ['专家A机构', expert.organization],
  ]

  indirectItems.value.forEach((item, index) => {
    const label = String.fromCharCode(66 + index)
    rows.push(
      [`专家 ${label}`, item.targetName],
      [`专家${label}职称`, item.targetTitle],
      [`专家${label}机构`, item.targetOrganization],
      [`专家${label}间接关系类型`, item.relationType],
      [`专家${label}间接关系传递路径`, item.transferPath],
      [`专家${label}关联强度`, item.strength.toFixed(2)],
    )
  })

  return rows
})
const indirectGraph = computed(() => {
  const expert = indirectCoreExpert.value
  const items = indirectItems.value.slice(0, Number(indirectForm.path_depth) >= 3 ? 5 : 3)
  if (!expert || !items.length) return { nodes: [], edges: [] }

  const slots = [
    { x: 470, y: 30, tone: 'green' as const },
    { x: 470, y: 150, tone: 'orange' as const },
    { x: 470, y: 270, tone: 'gold' as const },
    { x: 470, y: 390, tone: 'blue' as const },
    { x: 470, y: 510, tone: 'purple' as const },
  ]

  const nodes: PrototypeNode[] = [
    { id: 'core', x: 74, y: 224, w: 220, h: 86, title: `专家A：${expert.name}`, subtitle: expert.title, tone: 'purple' },
    ...items.map((item, index): PrototypeNode => ({
      id: item.targetId,
      x: slots[index].x,
      y: slots[index].y,
      w: 224,
      h: 86,
      title: `专家${String.fromCharCode(66 + index)}：${item.targetName}`,
      subtitle: `${item.relationTag}｜${item.strength.toFixed(2)}`,
      tone: slots[index].tone,
    })),
  ]

  const edges: PrototypeEdge[] = items.map((item, index) => {
    const y = slots[index].y + 43
    const labelY = y - 16
    const tone = slots[index].tone
    return {
      id: item.key,
      path: item.pathDepth >= 3
        ? `M294 267 C344 ${y - 42}, 404 ${y + 42}, 470 ${y}`
        : `M294 267 C360 ${y}, 408 ${y}, 470 ${y}`,
      label: `${item.relationType}｜${item.pathDepth}跳`,
      labelX: 386,
      labelY,
      tone,
      dashed: item.pathDepth >= 3 || index > 0,
    }
  })

  return {
    nodes,
    edges,
  }
})
function displayDetailValue(value: string | string[]) {
  if (Array.isArray(value)) return value.join('、')
  return value || '-'
}

function normalizeGraph(graph: Partial<{ nodes: PrototypeNode[]; edges: PrototypeEdge[] }> | undefined | null) {
  return {
    nodes: Array.isArray(graph?.nodes) ? graph.nodes : [],
    edges: Array.isArray(graph?.edges) ? graph.edges : [],
  }
}

const activeGraph = computed(() => {
  if (isGenericInputOutOfRange.value) return normalizeGraph(null)
  if (isIndustryChainEventModule.value) {
    if (activeInterfaceIndex.value === 0) return normalizeGraph(industryEventGraph.value)
    if (activeInterfaceIndex.value === 1) return normalizeGraph(industryEventRelationGraph.value)
    if (activeInterfaceIndex.value === 2) return normalizeGraph(industryEventImpactGraph.value)
    return normalizeGraph(currentInterface.value?.graph)
  }
  if (isIndustryChainPanoramaModule.value) return normalizeGraph(industryChainGraph.value)
  if (isAchievementModule.value) return normalizeGraph(achievementGraph.value)
  if (isIndirectModule.value) return normalizeGraph(indirectGraph.value)
  return normalizeGraph(currentInterface.value?.graph)
})
const activeDetailRows = computed(() => {
  if (isGenericInputOutOfRange.value) return []
  if (isIndustryChainEventScreenInterface.value) return industryEventDetailRows.value
  if (isIndustryChainEventModule.value && activeInterfaceIndex.value === 1) return industryEventRelationRows.value
  if (isIndustryChainEventModule.value && activeInterfaceIndex.value === 2) return industryEventImpactRows.value
  if (isIndustryChainPanoramaModule.value) return industryChainDetailRows.value
  if (isAchievementModule.value) return achievementDetailRows.value
  if (isIndirectModule.value) return indirectDetailRows.value
  return currentInterface.value.detailRows
})
const indirectResponseExample = computed(() => ({
  code: indirectErrorMessage.value ? 404 : 0,
  data: indirectCoreExpert.value && indirectItems.value.length
    ? {
        expert: {
          expert_id: indirectCoreExpert.value.expertId,
          expert_name: indirectCoreExpert.value.name,
          expert_title: indirectCoreExpert.value.title,
          organization: indirectCoreExpert.value.organization,
        },
        indirect_relations: indirectItems.value.map((item, index) => ({
          node_id: item.targetId,
          node_name: item.targetName,
          node_type: '专家',
          node_alias: `专家${String.fromCharCode(66 + index)}`,
          relation_type: item.relationType,
          relation_type_tag: item.relationTag,
          path_text: item.transferPath,
          strength: item.strength,
        })),
        path_analysis: indirectItems.value.map((item) => ({
          path_id: item.key,
          path_depth: item.pathDepth,
          path_text: item.transferPath,
          strength: item.strength,
        })),
        relation_type_tags: Array.from(new Set(indirectItems.value.map((item) => item.relationTag))),
      }
    : null,
  message: indirectErrorMessage.value || 'success',
}))
const currentResponseJson = computed(() =>
  JSON.stringify(
    isGenericInputOutOfRange.value
      ? { code: 404, data: null, message: activeErrorMessage.value }
      : isIndustryChainEventScreenInterface.value
        ? industryEventResponseExample.value
      : isIndustryChainEventModule.value && activeInterfaceIndex.value === 1
        ? {
            code: 200,
            success: true,
            data: {
              eventName: selectedIndustryEventForRelation().title,
              expertName: relatedExpertsForSelectedEvent().includes(selectedExpertName()) ? selectedExpertName() : selectedIndustryEventForRelation().expert,
              roleLabel: selectedIndustryEventForRelation().talentRole,
              relationDescription: industryEventRelationRows.value.find(([label]) => label === '关系描述')?.[1] ?? '',
              cooperationMode: selectedIndustryEventForRelation().cooperationMode,
            },
            msg: 'success',
          }
      : isIndustryChainEventModule.value && activeInterfaceIndex.value === 2
        ? {
            code: 200,
            success: true,
            data: {
              keyEventName: selectedIndustryEventForImpact().title,
              industryChainName: industryChainNodeNames[selectedIndustryEventForImpact().industryChainNodeCode] ?? selectedIndustryEventForImpact().industryChainNode,
              industryChainSegment: selectedIndustryEventForImpact().industryChainNode,
              eventTime: formatChineseDate(selectedIndustryEventForImpact().eventTime),
              impactDescription: selectedIndustryEventForImpact().impact,
              riskWarning: industryEventImpactRows.value.find(([label]) => label === '风险预警')?.[1] ?? '',
              opportunity: industryEventImpactRows.value.find(([label]) => label === '机遇挖掘')?.[1] ?? '',
            },
            msg: 'success',
          }
      : isIndustryChainPanoramaModule.value
      ? industryChainResponseExample.value
      : isAchievementModule.value
        ? achievementResponseExample.value
        : isIndirectModule.value
          ? indirectResponseExample.value
          : normalizedResponseExample.value,
    null,
    2,
  ),
)
const achievementCoreExpert = computed(() => achievementSeeds[achievementForm.expertAId.trim()] ?? null)
const achievementItems = computed(() => {
  const expert = achievementCoreExpert.value
  if (!expert) return []
  const startMonth = achievementForm.startTime.slice(0, 7)
  const endMonth = achievementForm.endTime.slice(0, 7)
  const typeMap: Record<string, string> = {
    paper: '论文合作',
    project: '项目合作',
    patent: '专利合作',
  }
  const selectedType = typeMap[achievementForm.achievementTypes] ?? achievementForm.achievementTypes
  return expert.achievements
    .filter((item) => !achievementForm.expertBId.trim() || item.expertId === achievementForm.expertBId.trim())
    .filter((item) => achievementForm.achievementTypes === '全部' || item.relationType === selectedType)
    .filter((item) => item.completedAt >= startMonth && item.completedAt <= endMonth)
})

function shiftYearMonth(value: string, yearOffset: number) {
  const [yearText, monthText] = value.split('-')
  const year = Number(yearText)
  const month = Number(monthText)
  if (!year || !month) return value
  return `${year + yearOffset}-${String(month).padStart(2, '0')}`
}

function achievementTimeRange(item: AchievementItem) {
  const offset = item.relationType === '专利合作' ? -1 : -2
  return `${shiftYearMonth(item.completedAt, offset)} 至 ${item.completedAt}`
}

function achievementStartTime(item: AchievementItem) {
  const offset = item.relationType === '专利合作' ? -1 : -2
  return shiftYearMonth(item.completedAt, offset)
}

function compactFieldLabel(fields: string[]) {
  const firstField = fields[0]?.split(/[、，,]/)[0] ?? '共同领域'
  return fields.length > 1 ? `${firstField}等领域` : firstField
}

const achievementDetailRows = computed<Array<[string, string | string[]]>>(() => {
  const expert = achievementCoreExpert.value
  if (!expert || !achievementItems.value.length) return []

  const primaryPartner = achievementItems.value[0]
  const typeStats = achievementItems.value.reduce<Record<string, number>>((stats, item) => {
    stats[item.achievementType] = (stats[item.achievementType] ?? 0) + 1
    return stats
  }, {})
  const statsText = Object.entries(typeStats).map(([type, count]) => `${type} ${count} 类`).join(' / ')
  const fields = Array.from(new Set(achievementItems.value.map((item) => item.field))).join('、')
  const awards = Array.from(new Set(achievementItems.value.map((item) => item.award)))
  const contributions = achievementItems.value.map((item) => item.contribution)
  const modes = Array.from(new Set(achievementItems.value.map((item) => item.cooperationMode)))
  const paperTimes = achievementItems.value
    .filter((item) => item.relationType === '论文合作')
    .map((item) => achievementTimeRange(item))
  const projectTimes = achievementItems.value
    .filter((item) => item.relationType === '项目合作')
    .map((item) => achievementTimeRange(item))
  const patentTimes = achievementItems.value
    .filter((item) => item.relationType === '专利合作')
    .map((item) => achievementTimeRange(item))

  const rows: Array<[string, string | string[]]> = [
    ['专家 A', expert.name],
    ['专家 A 职称', expert.title],
    ['专家A机构', expert.organization],
    ['专家 B', primaryPartner.expertName],
    ['专家 B 职称', primaryPartner.title],
    ['专家B机构', primaryPartner.organization],
    ['合作成果分类统计', statsText],
    ['论文合作起止时间', paperTimes.length ? paperTimes : '-'],
    ['项目合作起止时间', projectTimes.length ? projectTimes : '-'],
    ['专利合作起止时间', patentTimes.length ? patentTimes : '-'],
    ['所属领域', fields],
    ['获得奖项', awards],
    ['核心贡献', contributions],
    ['合作模式', modes],
  ]

  return rows
})
const achievementGraph = computed(() => {
  const expert = achievementCoreExpert.value
  const items = achievementItems.value
  if (!expert || !items.length) return { nodes: [], edges: [] }

  const primaryPartner = items[0]
  const paperCount = items.filter((item) => item.relationType === '论文合作').length || 0
  const projectCount = items.filter((item) => item.relationType === '项目合作').length || 0
  const patentCount = items.filter((item) => item.relationType === '专利合作').length || 0
  const fieldLabel = compactFieldLabel(Array.from(new Set(items.map((item) => item.field))))
  const cooperationStart = items.map((item) => achievementStartTime(item)).sort()[0]
  const cooperationEnd = items.map((item) => item.completedAt).sort().at(-1)
  const nodes: PrototypeNode[] = [
    { id: 'expert-a', x: 58, y: 58, w: 184, h: 64, title: `专家A：${expert.name}`, subtitle: expert.title, tone: 'blue' },
    { id: 'expert-b', x: 520, y: 58, w: 184, h: 64, title: `专家B：${primaryPartner.expertName}`, subtitle: primaryPartner.title, tone: 'green' },
    {
      id: 'achievement',
      x: 296,
      y: 142,
      w: 176,
      h: 92,
      title: '合作成果',
      subtitle: '分类统计',
      tone: 'purple',
      chips: [`论文 ${paperCount}`, `专利 ${patentCount}`, `项目 ${projectCount}`],
    },
    { id: 'unit', x: 270, y: 276, w: 220, h: 62, title: expert.organization, subtitle: '合作单位', tone: 'blue' },
    { id: 'time', x: 84, y: 438, w: 230, h: 78, title: '合作起止时间', subtitle: `${cooperationStart} 至 ${cooperationEnd}`, tone: 'purple' },
    { id: 'field', x: 452, y: 438, w: 230, h: 78, title: fieldLabel || '共同领域', subtitle: '共同领域', tone: 'green' },
  ]
  const edges: PrototypeEdge[] = [
    { id: 'a-achievement', path: 'M242 90 C270 106 284 142 296 174', label: '', labelX: 270, labelY: 112, tone: 'blue' },
    { id: 'b-achievement', path: 'M520 90 C492 104 478 142 464 174', label: '', labelX: 496, labelY: 112, tone: 'blue' },
    { id: 'achievement-unit', path: 'M384 234 V276', label: '合作单位', labelX: 438, labelY: 258, tone: 'green' },
    { id: 'unit-time', path: 'M316 338 C272 378 236 402 200 438', label: '合作时间', labelX: 264, labelY: 382, tone: 'orange' },
    { id: 'unit-field', path: 'M438 338 C482 378 526 402 568 438', label: '共同领域', labelX: 514, labelY: 382, tone: 'green' },
  ]
  return { nodes, edges }
})
const achievementResponseExample = computed(() => ({
  code: achievementErrorMessage.value ? 404 : 0,
  data: achievementCoreExpert.value && achievementItems.value.length
    ? {
        expertList: [achievementCoreExpert.value.name, achievementItems.value[0].expertName],
        expertUnits: [achievementCoreExpert.value.organization, achievementItems.value[0].organization],
        cooperationTimeRange: {
          startTime: achievementForm.startTime,
          endTime: achievementForm.endTime,
          displayText: `${achievementForm.startTime} - ${achievementForm.endTime}`,
        },
        cooperationFields: Array.from(new Set(achievementItems.value.map((item) => item.field))),
        achievementCount: achievementItems.value.length,
        achievementTypeDistribution: {
          paper: achievementItems.value.filter((item) => item.relationType === '论文合作').length,
          project: achievementItems.value.filter((item) => item.relationType === '项目合作').length,
          patent: achievementItems.value.filter((item) => item.relationType === '专利合作').length,
        },
        representativeAchievements: achievementItems.value.map((item) => ({
          achievementId: item.key,
          title: item.categoryStats,
          type: item.achievementType,
          publishOrCompleteTime: item.completedAt,
          field: item.field,
          award: item.award,
        })),
        achievementLevel: {
          awards: Array.from(new Set(achievementItems.value.map((item) => item.award))),
          displayText: Array.from(new Set(achievementItems.value.map((item) => item.award))).join('、'),
        },
        coreContribution: achievementItems.value.map((item) => item.contribution),
        cooperationPattern: Array.from(new Set(achievementItems.value.map((item) => item.cooperationMode))).join('；'),
      }
    : null,
  message: achievementErrorMessage.value || 'success',
}))

const normalizedResponseFields = computed(() => {
  const base = [
    { name: 'code', type: 'int', description: '业务状态码' },
    { name: 'data', type: 'object', description: '接口结构化返回数据' },
    { name: 'message', type: 'string', description: '返回消息' },
  ]
  const fields = currentInterface.value.responseFields
    .filter((field) => !['code', 'data', 'message', 'msg', 'success'].includes(field.name))
    .map((field) => ({
      ...field,
      name: field.name.startsWith('data.') ? field.name : `data.${field.name}`,
    }))
  return [...base, ...fields]
})
const activeRequestFields = computed(() => {
  if (isIndustryChainEventScreenInterface.value) {
    return [
      { name: 'industryChainNodeCode', type: 'string', required: '是', description: '产业链中文名称，用中文选择，如集成电路产业链' },
      { name: 'industryChainSegment', type: 'string', required: '是', description: '产业链环节或节点，用中文选择，如上游原材料' },
      { name: 'eventTypes', type: 'string', required: '否', description: '事件类型单选，用中文选择，如专利突破、论文成果、融资并购' },
      { name: 'topN', type: 'number', required: '是', description: '返回影响力排名前 N 的事件' },
      { name: 'startTime', type: 'string', required: '否', description: '开始时间，格式 YYYY-MM-DD' },
      { name: 'endTime', type: 'string', required: '否', description: '结束时间，格式 YYYY-MM-DD' },
    ]
  }
  if (isIndustryChainPanoramaModule.value) {
    return [
      { name: 'chain_name', type: 'string', required: '是', description: '产业链名称，用中文选择，如人工智能产业链' },
      { name: 'level', type: 'number', required: '否', description: '产业链节点展开层级：1 一级环节，2 二级节点，3 三级节点' },
      { name: 'relation_type', type: 'string', required: '否', description: '关系类型筛选条件，可选：全部、上下游关系' },
    ]
  }
  if (isAchievementModule.value) {
    return [
      { name: 'expertAId', type: 'string', required: '是', description: '专家A，算法测试中展示中文姓名，接口传参使用专家ID' },
      { name: 'expertBId', type: 'string', required: '是', description: '专家B，算法测试中展示中文姓名，接口传参使用专家ID' },
      { name: 'achievementTypes', type: 'array[string]', required: '否', description: '成果类型过滤，可选值：paper、project、patent；算法测试展示中文成果类型' },
      { name: 'startTime', type: 'string', required: '否', description: '统计开始时间，格式 YYYY-MM-DD' },
      { name: 'endTime', type: 'string', required: '否', description: '统计结束时间，格式 YYYY-MM-DD' },
    ]
  }
  return currentInterface.value.requestFields
})
function uniqueValues(values: string[][]) {
  return Array.from(new Set(values.flat()))
}

const industryChainSeed = computed(() => {
  const matched = Object.values(industryChainSeeds).find((seed) => seed.name === industryChainForm.chain_name || seed.code === industryChainForm.chain_name)
  return matched ?? industryChainSeeds.AI_CHAIN
})
const industryChainMatchedRelations = computed(() => {
  const seed = industryChainSeed.value
  return seed.relations.filter((relation) => industryChainForm.relation_type === '全部' || relation.name === industryChainForm.relation_type)
})
const industryChainVisibleLinks = computed(() => {
  const seed = industryChainSeed.value
  if (industryChainForm.relation_type === '全部') return seed.links.slice(0, Number(industryChainForm.limit) || 100)
  if (industryChainForm.relation_type === '上下游关系') return seed.links.slice(0, 3)

  const names = new Set(industryChainMatchedRelations.value.flatMap((relation) => [relation.from, relation.to]))
  return seed.links.filter((link) => names.has(link.name)).slice(0, Number(industryChainForm.limit) || 100)
})
const industryChainDepth = computed(() => Number(normalizeIndustryLevel(industryChainForm.level)))
const industryChainVisibleRelations = computed(() => {
  const names = new Set(industryChainVisibleLinks.value.map((link) => link.name))
  return industryChainMatchedRelations.value
    .filter((relation) => names.has(relation.from) && names.has(relation.to))
    .slice(0, Number(industryChainForm.limit) || 100)
})
const industryChainDataFlowText = computed(() =>
  industryChainVisibleLinks.value.map((link) => link.name).join(' → '),
)
const industryChainDetailRows = computed<Array<[string, string | string[]]>>(() => {
  const seed = industryChainSeed.value
  const links = industryChainVisibleLinks.value
  const relations = industryChainVisibleRelations.value
  const statistics = [
    `节点 ${links.length}`,
    `关系 ${relations.length || 0}`,
    `企业 ${uniqueValues(links.map((link) => link.enterprises)).length}`,
    `专家 ${uniqueValues(links.map((link) => link.experts)).length}`,
    `技术 ${uniqueValues(links.map((link) => link.technologies)).length}`,
    `事件 ${uniqueValues(links.map((link) => link.news)).length}`,
  ]
  const rows: Array<[string, string | string[]]> = [
    ['产业链名称', seed.name],
    ['展开层级', String(industryChainForm.level)],
    ['关系筛选', industryChainForm.relation_type],
    ['数据流向', industryChainDataFlowText.value],
  ]

  links.forEach((link, index) => {
    const label = `节点${index + 1}`
    rows.push(
      [`${label}名称`, `${link.name}｜产业节点｜L${link.level}`],
      [`${label}关键技术`, link.technologies.slice(0, 3).join('、')],
      [`${label}重点企业`, link.enterprises.slice(0, 3).join('、')],
      [`${label}核心专家`, link.experts.slice(0, 3).join('、')],
      [`${label}动态事件`, link.news.join('、')],
    )
  })

  rows.push(['统计信息', statistics])

  return rows
})
const industryChainGraph = computed(() => {
  const seed = industryChainSeed.value
  const links = industryChainForm.relation_type === '上下游关系'
    ? seed.links.slice(0, 3)
    : industryChainVisibleLinks.value
  if (!links.length) return { nodes: [], edges: [] }

  const xSlots = links.length === 1 ? [345] : links.length === 2 ? [180, 560] : [46, 345, 644]
  const toneSlots = ['blue', 'purple', 'green'] as Array<'blue' | 'purple' | 'green'>
  const nodes: PrototypeNode[] = links.map((link, index) => ({
    id: link.id,
    x: xSlots[index],
    y: 226,
    w: 210,
    h: 126,
    title: link.name,
    subtitle: `L${link.level}｜核心环节`,
    tone: toneSlots[index] ?? 'blue',
    chips: link.technologies.slice(0, 4),
  }))

  if (industryChainForm.relation_type !== '上下游关系') {
    nodes.push({ id: 'ent', x: 46, y: 36, w: 250, h: 118, title: '重点企业', subtitle: '企业布局', tone: 'blue', chips: uniqueValues(links.map((link) => link.enterprises)).slice(0, 4) })
    nodes.push({ id: 'expert', x: 604, y: 36, w: 250, h: 118, title: '核心专家', subtitle: '专家支撑', tone: 'purple', chips: uniqueValues(links.map((link) => link.experts)).slice(0, 4) })
    nodes.push({ id: 'update', x: 46, y: 420, w: 250, h: 118, title: '产业动态事件', subtitle: '动态更新', tone: 'orange', chips: uniqueValues(links.map((link) => link.news)).slice(0, 4) })
    nodes.push({ id: 'tech', x: 604, y: 420, w: 250, h: 118, title: '关键技术', subtitle: '技术支撑', tone: 'gold', chips: uniqueValues(links.map((link) => link.technologies)).slice(0, 4) })
  }

  const edges: PrototypeEdge[] = []
  const graphRelations = industryChainForm.relation_type === '上下游关系'
    ? seed.relations.filter((relation) => relation.type === 'upstream_downstream' || relation.name === '上下游关系')
    : industryChainVisibleRelations.value
  graphRelations.forEach((relation, index) => {
    const fromIndex = links.findIndex((link) => link.name === relation.from)
    const toIndex = links.findIndex((link) => link.name === relation.to)
    if (fromIndex < 0 || toIndex < 0) return

    if (relation.type === 'event_related') {
      edges.push({
        id: `rel-${index}`,
        path: 'M644 346 C548 410 352 410 256 346',
        label: '场景反馈',
        labelX: 450,
        labelY: 404,
        tone: 'orange',
        dashed: true,
      })
      return
    }

    const fromX = xSlots[fromIndex] + 210
    const toX = xSlots[toIndex]
    edges.push({
      id: `rel-${index}`,
      path: `M${fromX} 286 C${fromX + 34} 286 ${toX - 34} 286 ${toX} 286`,
      label: relation.name,
      labelX: (fromX + toX) / 2,
      labelY: 252,
      tone: 'purple',
    })
  })
  const centerNode = nodes.find((node) => node.id === links[Math.min(1, links.length - 1)]?.id) ?? nodes[0]
  const centerX = centerNode.x + centerNode.w / 2
  if (industryChainForm.relation_type !== '上下游关系') {
    if (nodes.some((node) => node.id === 'ent')) edges.push({ id: 'ent-core', path: `M296 95 C374 120 ${centerX - 96} 178 ${centerX - 34} 226`, label: '企业布局', labelX: 340, labelY: 146, tone: 'blue' })
    if (nodes.some((node) => node.id === 'expert')) edges.push({ id: 'expert-core', path: `M604 95 C526 120 ${centerX + 96} 178 ${centerX + 34} 226`, label: '专家支撑', labelX: 560, labelY: 146, tone: 'purple' })
    if (nodes.some((node) => node.id === 'update')) edges.push({ id: 'update-core', path: `M296 472 C360 448 ${centerX - 88} 390 ${centerX - 42} 352`, label: '动态更新', labelX: 340, labelY: 405, tone: 'orange', dashed: true })
    if (nodes.some((node) => node.id === 'tech')) edges.push({ id: 'core-tech', path: `M${centerX + 42} 352 C${centerX + 88} 390 540 448 604 472`, label: '技术支撑', labelX: 560, labelY: 405, tone: 'gold' })
  }
  return { nodes, edges }
})
const industryChainResponseExample = computed(() => {
  const seed = industryChainSeed.value
  const links = industryChainVisibleLinks.value
  const relations = industryChainVisibleRelations.value
  const technologies = links.flatMap((link, linkIndex) =>
    link.technologies.map((technology, index) => ({
      technology_id: `T${linkIndex + 1}${index + 1}`.padEnd(4, '0'),
      technology_name: technology,
      related_node_id: link.id,
      description: `支撑${link.name}的关键技术`,
    })),
  )
  const enterprises = links.flatMap((link, linkIndex) =>
    link.enterprises.map((enterprise, index) => ({
      enterprise_id: `E${linkIndex + 1}${index + 1}`.padEnd(4, '0'),
      enterprise_name: enterprise,
      related_node_id: link.id,
      layout_area: link.name,
      description: '在该产业链节点具有重点布局',
    })),
  )
  const experts = links.flatMap((link, linkIndex) =>
    link.experts.map((expert, index) => ({
      expert_id: `P${linkIndex + 1}${index + 1}`.padEnd(4, '0'),
      expert_name: expert,
      related_node_id: link.id,
      research_field: link.technologies[index % link.technologies.length],
      description: '对关键技术和产业节点形成专家支撑',
    })),
  )
  const events = links.flatMap((link, linkIndex) =>
    link.news.map((news, index) => ({
      event_id: `EV${linkIndex + 1}${index + 1}`.padEnd(5, '0'),
      event_title: news,
      event_type: '产业动态',
      related_node_id: link.id,
      event_time: '2026-07-01',
      description: `反映${link.name}的最新发展动态`,
    })),
  )
  return {
    code: 0,
    message: 'success',
    data: {
      chain_info: {
        chain_name: seed.name,
        description: seed.description,
        update_time: '2026-07-02 10:30:00',
      },
      nodes: [
        { node_id: seed.code, node_name: seed.name, node_type: '产业链', level: 0 },
        ...links.map((link) => ({ node_id: link.id, node_name: link.name, node_type: '产业节点', level: link.level })),
        ...technologies.map((item) => ({ node_id: item.technology_id, node_name: item.technology_name, node_type: '关键技术', level: 3 })),
        ...enterprises.slice(0, 6).map((item) => ({ node_id: item.enterprise_id, node_name: item.enterprise_name, node_type: '重点企业', level: 3 })),
        ...experts.slice(0, 4).map((item) => ({ node_id: item.expert_id, node_name: item.expert_name, node_type: '核心专家', level: 3 })),
        ...events.slice(0, 4).map((item) => ({ node_id: item.event_id, node_name: item.event_title, node_type: '产业事件', level: 3 })),
      ].slice(0, Number(industryChainForm.limit) || 100),
      relations: relations.map((relation, index) => ({
        relation_id: `R${String(index + 1).padStart(3, '0')}`,
        source_node_id: links.find((link) => link.name === relation.from)?.id ?? relation.from,
        target_node_id: links.find((link) => link.name === relation.to)?.id ?? relation.to,
        relation_type: relation.type,
        relation_name: relation.name,
      })),
      data_flows: relations.map((relation) => ({
        source_node_id: links.find((link) => link.name === relation.from)?.id ?? relation.from,
        target_node_id: links.find((link) => link.name === relation.to)?.id ?? relation.to,
        flow_name: relation.name,
        flow_description: `${relation.from}向${relation.to}提供${relation.dataFlow}`,
      })),
      technologies,
      enterprises,
      experts,
      events,
      update_info: {
        data_version: 'v20260702',
        last_update_time: '2026-07-02 10:30:00',
        is_updated: true,
        update_description: '产业链节点、企业布局和产业动态数据已更新',
      },
      statistics: {
        node_count: links.length,
        relation_count: relations.length,
        technology_count: technologies.length,
        enterprise_count: enterprises.length,
        expert_count: experts.length,
        event_count: events.length,
      },
    },
  }
})

const industryEventGraph = computed(() => {
  const items = industryEventFilteredItems.value.slice(0, 10)
  const chainName = industryChainNodeNames[industryEventForm.industryChainNodeCode] ?? industryEventForm.industryChainNodeCode
  if (!items.length) {
    return { nodes: [], edges: [] }
  }

  const eventRows = items.map((item, index) => {
    const column = index % 2
    const row = Math.floor(index / 2)
    const eventX = column === 0 ? 226 : 460
    return {
      item,
      column,
      eventX,
      expertX: column === 0 ? 18 : 770,
      y: 250 + row * 64,
    }
  })
  const nodes: DraggablePrototypeNode[] = [
    { id: 'chain-node', x: 325, y: 28, w: 250, h: 62, title: shortGraphText(chainName, 10), subtitle: '产业链', tone: 'purple', icon: '链' },
    { id: 'segment-node', x: 325, y: 128, w: 250, h: 64, title: shortGraphText(industryEventForm.industryChainSegment, 10), subtitle: `包含 ${items.length} 个核心事件`, tone: 'blue', icon: '节' },
    ...eventRows.map(({ item, eventX, y }, index) => ({
      id: `event-${item.id}`,
      x: eventX,
      y,
      w: 214,
      h: 58,
      title: `TOP${index + 1} ${formatIndustryEventType(item.eventType)}`,
      subtitle: summarizeIndustryEventTitle(item),
      tone: 'orange' as const,
      icon: '事',
    })),
    ...eventRows.map(({ item, expertX, y }) => ({
      id: `expert-${item.id}`,
      x: expertX,
      y: y - 2,
      w: 112,
      h: 58,
      title: item.expert,
      subtitle: shortGraphText(item.talentRole, 6),
      tone: 'green' as const,
      icon: '专',
    })),
  ]
  const edges: LinkedPrototypeEdge[] = [
    { id: 'chain-segment', path: 'M450 90 V128', label: '包含环节', labelX: 492, labelY: 110, tone: 'blue' },
    ...(eventRows.some((row) => row.column === 0) ? [{ id: 'segment-event-left', path: 'M450 192 V222 H333 V250', label: 'TOP-N筛选', labelX: 382, labelY: 214, tone: 'orange' as const }] : []),
    ...(eventRows.some((row) => row.column === 1) ? [{ id: 'segment-event-right', path: 'M450 222 H567 V250', label: 'TOP-N筛选', labelX: 524, labelY: 214, tone: 'orange' as const }] : []),
    ...eventRows.map(({ item, column, eventX, expertX, y }) => ({
      id: `event-expert-${item.id}`,
      path: column === 0
        ? `M${eventX} ${y + 29} H${expertX + 112}`
        : `M${eventX + 214} ${y + 29} H${expertX}`,
      label: '关联专家',
      labelX: column === 0 ? (expertX + 112 + eventX) / 2 : (eventX + 214 + expertX) / 2,
      labelY: y + 17,
      tone: 'green' as const,
    })),
  ]
  return { nodes, edges }
})

const industryEventRelationGraph = computed(() => {
  const event = selectedIndustryEventForRelation()
  const expertName = relatedExpertsForSelectedEvent().includes(selectedExpertName()) ? selectedExpertName() : event.expert
  const nodes: DraggablePrototypeNode[] = [
    { id: 'expert', x: 32, y: 42, w: 230, h: 76, title: expertName, subtitle: `专家 / ${event.talentRole}`, tone: 'green', icon: '专' },
    { id: 'event', x: 574, y: 42, w: 260, h: 76, title: shortGraphText(event.title, 15), subtitle: '事件', tone: 'orange', icon: '事' },
    { id: 'relation', x: 244, y: 214, w: 300, h: 96, title: '关系描述', subtitle: `${expertName}作为${event.talentRole}参与该事件，主要承担${shortGraphText(event.cooperationField, 10)}相关工作。`, tone: 'gold', icon: '关' },
    { id: 'mode', x: 586, y: 350, w: 246, h: 84, title: '合作模式', subtitle: shortGraphText(event.cooperationMode, 14), tone: 'blue', icon: '合' },
    { id: 'time', x: 274, y: 430, w: 250, h: 78, title: '合作时间', subtitle: event.cooperationTime.replace(/(\d{4})-(\d{2})/g, (_m, year, month) => `${Number(year)}年${Number(month)}月`), tone: 'blue', icon: '时' },
  ]
  const edges: LinkedPrototypeEdge[] = [
    { id: 'expert-event', path: 'M262 80 H574', label: `${event.talentRole}参与`, labelX: 418, labelY: 62, tone: 'blue' },
    { id: 'expert-relation', path: 'M146 118 L310 214', label: '关系描述', labelX: 236, labelY: 172, tone: 'blue' },
    { id: 'event-relation', path: 'M704 118 L482 214', label: '关系描述', labelX: 584, labelY: 172, tone: 'blue' },
    { id: 'event-mode', path: 'M704 118 V350', label: '合作模式', labelX: 740, labelY: 240, tone: 'blue' },
    { id: 'relation-time', path: 'M394 310 V430', label: '合作时间', labelX: 434, labelY: 374, tone: 'blue' },
  ]
  return {
    nodes,
    edges,
  }
})

const industryEventImpactGraph = computed(() => {
  const event = selectedIndustryEventForImpact()
  const chainName = industryChainNodeNames[event.industryChainNodeCode] ?? event.industryChainNode
  const nodes: DraggablePrototypeNode[] = [
    { id: 'chain', x: 328, y: 36, w: 244, h: 78, title: shortGraphText(chainName, 10), subtitle: '产业链', tone: 'purple', icon: '链' },
    { id: 'event', x: 20, y: 234, w: 244, h: 88, title: shortGraphText(event.title, 15), subtitle: `${formatIndustryEventType(event.eventType)}｜${formatChineseDate(event.eventTime)}`, tone: 'orange', icon: '事' },
    { id: 'segment', x: 340, y: 234, w: 220, h: 88, title: event.industryChainNode, subtitle: '影响环节 / 节点', tone: 'blue', icon: '节' },
    { id: 'risk', x: 680, y: 174, w: 200, h: 98, title: '风险预警', subtitle: '上游材料环节需关注供应稳定性与技术替代风险', tone: 'orange', icon: '险' },
    { id: 'impact', x: 318, y: 414, w: 260, h: 92, title: '事件影响', subtitle: shortGraphText(event.impact, 16), tone: 'gold', icon: '影' },
    { id: 'opportunity', x: 680, y: 394, w: 200, h: 98, title: '机遇挖掘', subtitle: `可围绕${shortGraphText(event.cooperationField, 9)}开展产业化合作和成果转化`, tone: 'green', icon: '机' },
  ]
  const edges: LinkedPrototypeEdge[] = [
    { id: 'chain-segment', path: 'M450 114 V234', label: '限定环节', labelX: 496, labelY: 174, tone: 'blue' },
    { id: 'event-segment', path: 'M264 278 H340', label: '事件关联', labelX: 302, labelY: 258, tone: 'orange' },
    { id: 'segment-risk', path: 'M560 278 L680 224', label: '风险预警', labelX: 624, labelY: 238, tone: 'orange' },
    { id: 'segment-impact', path: 'M450 322 V414', label: '影响分析', labelX: 492, labelY: 370, tone: 'gold' },
    { id: 'impact-opportunity', path: 'M578 460 H680', label: '机会挖掘', labelX: 630, labelY: 438, tone: 'green' },
  ]
  return {
    nodes,
    edges,
  }
})

const industryEventResponseExample = computed(() => {
  const items = industryEventFilteredItems.value
  return {
    code: 200,
    success: true,
    data: {
      industryChainName: resolveIndustryChainName(industryEventForm.industryChainNodeCode),
      industryChainSegment: industryEventForm.industryChainSegment,
      industryChainNodeCode: resolveIndustryChainCode(industryEventForm.industryChainNodeCode),
      total: items.length,
      topN: Number(industryEventForm.topN),
      events: items.map((item, index) => ({
        eventId: item.id,
        eventTitle: item.title,
        eventTime: formatChineseDate(item.eventTime),
        impactScore: item.score,
        rank: index + 1,
        relatedExpertName: item.expert,
      })),
    },
    msg: 'success',
  }
})

const activeResponseFields = computed(() => {
  if (isIndustryChainEventScreenInterface.value) {
    return [
      { name: 'industryChainName', type: 'string', description: '当前分析的产业链中文名称' },
      { name: 'industryChainSegment', type: 'string', description: '当前分析的产业链环节/节点' },
      { name: 'industryChainNodeCode', type: 'string', description: '当前分析的产业链内部追踪代码' },
      { name: 'total', type: 'number', description: '本次实际返回的事件数量' },
      { name: 'topN', type: 'number', description: '请求的 TOP-N 数量上限' },
      { name: 'events', type: 'array[object]', description: '影响力排名前 N 的核心事件' },
      { name: 'events[].eventId', type: 'string', description: '事件 ID' },
      { name: 'events[].eventTitle', type: 'string', description: '事件标题' },
      { name: 'events[].eventTime', type: 'string', description: '中文格式事件时间' },
      { name: 'events[].impactScore', type: 'number', description: '影响力得分' },
      { name: 'events[].rank', type: 'number', description: '影响力排名' },
      { name: 'events[].relatedExpertName', type: 'string', description: '关联专家/人才姓名' },
    ]
  }
  if (isIndustryChainPanoramaModule.value) {
    return [
      { name: 'chain_info', type: 'object', description: '产业链基本信息，包括名称、描述、更新时间' },
      { name: 'nodes', type: 'array[object]', description: '图谱节点列表，包括产业环节、关键技术、重点企业、核心专家、产业事件' },
      { name: 'relations', type: 'array[object]', description: '图谱关系列表；选择上下游关系时只返回上游-中游-下游之间的上下游关系' },
      { name: 'data_flows', type: 'array[object]', description: '产业链各环节之间的数据、技术、资源流动方向' },
      { name: 'technologies', type: 'array[object]', description: '各产业链节点关联的关键技术信息' },
      { name: 'enterprises', type: 'array[object]', description: '各产业链节点关联的重点企业信息' },
      { name: 'experts', type: 'array[object]', description: '各产业链节点或关键技术关联的核心专家信息' },
      { name: 'events', type: 'array[object]', description: '产业链相关动态事件信息' },
      { name: 'update_info', type: 'object', description: '数据版本、更新时间、更新状态等动态更新信息' },
      { name: 'statistics', type: 'object', description: '返回结果统计信息，包括节点数、关系数、企业数、专家数、事件数' },
    ]
  }
  if (isAchievementModule.value) {
    return [
      { name: 'expertList', type: 'array[string]', description: '专家列表，按专家A、专家B顺序输出' },
      { name: 'expertUnits', type: 'array[string]', description: '专家单位列表，按专家A、专家B顺序输出' },
      { name: 'cooperationTimeRange', type: 'object', description: '合作时间范围' },
      { name: 'cooperationFields', type: 'array[string]', description: '合作领域列表' },
      { name: 'achievementCount', type: 'integer', description: '合作成果总数量' },
      { name: 'achievementTypeDistribution', type: 'object', description: '成果类型分布统计' },
      { name: 'representativeAchievements', type: 'array[object]', description: '代表合作成果列表' },
      { name: 'achievementLevel', type: 'object', description: '成果级别统计' },
      { name: 'coreContribution', type: 'array[string]', description: '核心贡献标签' },
      { name: 'cooperationPattern', type: 'string', description: '合作模式' },
    ]
  }
  return normalizedResponseFields.value
})

const industryEventInterfaceOptions: Record<string, Record<string, string[]>> = {
  高影响力事件筛选接口: {
    industryChainNodeCode: industryEventOptions.industryChainNodeCode,
    industryChainSegment: industryEventOptions.industryChainSegment,
    eventTypes: industryEventOptions.eventTypes,
    topN: industryEventOptions.topN,
    startTime: industryEventOptions.startTime,
    endTime: industryEventOptions.endTime,
  },
  '事件-专家关系查询接口': {
    eventId: [],
    expertId: [],
  },
  事件影响与发展趋势分析接口: {
    eventId: [],
    industryChainNodeCode: [],
    industryChainSegment: [],
  },
}

const requestFieldValues = (fieldName: string) => {
  if (isIndustryChainEventModule.value) {
    if (activeInterfaceIndex.value === 1) {
      if (fieldName === 'eventName' || fieldName === 'eventId') return industryEventFilteredItems.value.map((item) => item.title)
      if (fieldName === 'expertName' || fieldName === 'expertId') return relatedExpertsForSelectedEvent()
    }
    if (activeInterfaceIndex.value === 2) {
      if (fieldName === 'eventName' || fieldName === 'eventId') return industryEventFilteredItems.value.map((item) => item.title)
      if (fieldName === 'industryChainName' || fieldName === 'industryChainNodeCode') {
        const event = selectedIndustryEventForImpact()
        return [industryChainNodeNames[event.industryChainNodeCode] ?? event.industryChainNode]
      }
      if (fieldName === 'industryChainSegment') {
        return [selectedIndustryEventForImpact().industryChainNode]
      }
    }
    const customValues = industryEventInterfaceOptions[baseInterface.value.name]?.[fieldName]
    if (customValues?.length) return customValues
  }
  return Array.from(new Set(sampleScenarios.value.map((sample) => {
    const scenarioInterface = applyScenario(baseInterface.value, sample.replacements)
    const value = scenarioInterface.requestExample[fieldName]
    if (Array.isArray(value)) return value.join('、')
    if (value && typeof value === 'object') return JSON.stringify(value)
    return String(value ?? '')
  })))
}

const displayParamValue = (fieldName: string, value: string) => {
  if (fieldName === 'industryChainNodeCode') return formatIndustryChainNodeCode(value)
  if (['expertA', 'expertB'].includes(fieldName)) {
    try {
      const parsed = JSON.parse(value) as { name?: string; scholarId?: string }
      return parsed.name ?? parsed.scholarId ?? value
    } catch {
      return value
    }
  }
  return value
}

function normalizeDateInputValue(fieldName: string, value: string) {
  if (!/year/i.test(fieldName) && value && /^\d{4}-\d{2}$/.test(value)) {
    return fieldName.toLowerCase().includes('end') ? `${value}-30` : `${value}-01`
  }
  return value
}

function displayRequestFieldName(fieldName: string) {
  const names: Record<string, string> = {
    industryChainNodeCode: 'industryChainName',
    industryChainSegment: 'industryChainSegment',
    eventTypes: 'eventType',
  }
  return names[fieldName] ?? fieldName
}

function genericParamValue(fieldName: string) {
  if (isIndustryChainEventModule.value && activeInterfaceIndex.value === 2 && (fieldName === 'industryChainName' || fieldName === 'industryChainNodeCode')) {
    const event = selectedIndustryEventForImpact()
    return industryChainNodeNames[event.industryChainNodeCode] ?? event.industryChainNode
  }
  if (isIndustryChainEventModule.value && activeInterfaceIndex.value === 2 && fieldName === 'industryChainSegment') {
    return selectedIndustryEventForImpact().industryChainNode
  }
  if (fieldName in genericParams.value) return genericParams.value[fieldName]
  return requestFieldValues(fieldName)[activeSampleIndex.value] ?? ''
}

function matchedGenericScenarioIndex() {
  const fields = visibleParams.value.map((field) => field.name)
  if (!fields.length || !Object.keys(genericParams.value).length) return activeSampleIndex.value
  return sampleScenarios.value.findIndex((_, index) => fields.every((fieldName) => {
    const value = genericParams.value[fieldName]
    if (!value) return true
    return requestFieldValues(fieldName)[index] === value
  }))
}

const isGenericInputOutOfRange = computed(() => {
  if (isIndustryChainEventModule.value || isIndustryChainPanoramaModule.value || isAchievementModule.value || isIndirectModule.value) return false
  return Object.keys(genericParams.value).length > 0 && matchedGenericScenarioIndex() < 0
})

function handleGenericParamInput(fieldName: string, event: Event) {
  const value = (event.target as HTMLInputElement).value
  genericParams.value = { ...genericParams.value, [fieldName]: value }
  const matchedIndex = matchedGenericScenarioIndex()
  if (matchedIndex >= 0) activeSampleIndex.value = matchedIndex
}

function toggleGenericCombo(fieldName: string) {
  activeGenericCombo.value = activeGenericCombo.value === fieldName ? null : fieldName
}

function selectGenericOption(fieldName: string, value: string) {
  genericParams.value = { ...genericParams.value, [fieldName]: value }
  const matchedIndex = matchedGenericScenarioIndex()
  if (matchedIndex >= 0) activeSampleIndex.value = matchedIndex
  activeGenericCombo.value = null
}
const codeSamples = computed(() => ({
  python: `import requests

url = "http://127.0.0.1:8891${currentInterface.value.endpoint}"
payload = ${requestJson.value}

response = requests.${currentInterface.value.method.toLowerCase()}(url, json=payload, timeout=30)
response.raise_for_status()
print(response.json())`,
  node: `const url = "http://127.0.0.1:8891${currentInterface.value.endpoint}";
const payload = ${requestJson.value};

const response = await fetch(url, {
  method: "${currentInterface.value.method}",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify(payload),
});

console.log(await response.json());`,
  curl: `curl -X ${currentInterface.value.method} "http://127.0.0.1:8891${currentInterface.value.endpoint}" \\
  -H "Content-Type: application/json" \\
  -d '${requestJson.value.replaceAll("'", "\\'")}'`,
}))

const currentCodeSamples = computed(() => {
  if (isIndustryChainEventScreenInterface.value) {
    const payload = JSON.stringify(
      {
        industryChainName: resolveIndustryChainName(industryEventForm.industryChainNodeCode),
        industryChainSegment: industryEventForm.industryChainSegment,
        eventTypes: selectedIndustryEventTypeLabels(),
        topN: Number(industryEventForm.topN),
        startTime: industryEventForm.startTime,
        endTime: industryEventForm.endTime,
      },
      null,
      2,
    )
    return {
      python: `import requests\n\nurl = "http://127.0.0.1:8891/api/v1/industry-chain/topn-events/screen"\npayload = ${payload}\n\nresponse = requests.post(url, json=payload, timeout=30)\nresponse.raise_for_status()\nprint(response.json())`,
      node: `const url = "http://127.0.0.1:8891/api/v1/industry-chain/topn-events/screen";\nconst payload = ${payload};\n\nconst response = await fetch(url, {\n  method: "POST",\n  headers: { "Content-Type": "application/json" },\n  body: JSON.stringify(payload),\n});\n\nconsole.log(await response.json());`,
      curl: `curl -X POST "http://127.0.0.1:8891/api/v1/industry-chain/topn-events/screen" \\\n  -H "Content-Type: application/json" \\\n  -d '${payload.replaceAll("'", "\\'")}'`,
    }
  }
  if (isIndustryChainPanoramaModule.value) {
    const payload = JSON.stringify(
      {
        chain_name: industryChainForm.chain_name,
        level: Number(industryChainForm.level),
        relation_type: industryChainForm.relation_type,
      },
      null,
      2,
    )
    return {
      python: `import requests\n\nurl = "http://127.0.0.1:8891/api/industry-chain/panorama/infer"\npayload = ${payload}\n\nresponse = requests.post(url, json=payload, timeout=30)\nresponse.raise_for_status()\nprint(response.json())`,
      node: `const url = "http://127.0.0.1:8891/api/industry-chain/panorama/infer";\nconst payload = ${payload};\n\nconst response = await fetch(url, {\n  method: "POST",\n  headers: { "Content-Type": "application/json" },\n  body: JSON.stringify(payload),\n});\n\nconsole.log(await response.json());`,
      curl: `curl -X POST "http://127.0.0.1:8891/api/industry-chain/panorama/infer" \\\n  -H "Content-Type: application/json" \\\n  -d '${payload.replaceAll("'", "\\'")}'`,
    }
  }
  if (isAchievementModule.value) {
    const payload = JSON.stringify(
      {
        expertAId: achievementForm.expertAId,
        expertBId: achievementForm.expertBId,
        achievementTypes: achievementForm.achievementTypes === '全部' ? ['paper', 'project', 'patent'] : [achievementForm.achievementTypes],
        startTime: achievementForm.startTime,
        endTime: achievementForm.endTime,
      },
      null,
      2,
    )
    return {
      python: `import requests\n\nurl = "http://127.0.0.1:8891/api/v1/two-expert-cooperation-achievements/demo/structured-result"\npayload = ${payload}\n\nresponse = requests.post(url, json=payload, timeout=30)\nresponse.raise_for_status()\nprint(response.json())`,
      node: `const url = "http://127.0.0.1:8891/api/v1/two-expert-cooperation-achievements/demo/structured-result";\nconst payload = ${payload};\n\nconst response = await fetch(url, {\n  method: "POST",\n  headers: { "Content-Type": "application/json" },\n  body: JSON.stringify(payload),\n});\n\nconsole.log(await response.json());`,
      curl: `curl -X POST "http://127.0.0.1:8891/api/v1/two-expert-cooperation-achievements/demo/structured-result" \\\n  -H "Content-Type: application/json" \\\n  -d '${payload.replaceAll("'", "\\'")}'`,
    }
  }
  if (!isIndirectModule.value) return codeSamples.value
  const payload = JSON.stringify(
    {
      corenode_id: indirectForm.corenode_id,
      relation_types: indirectForm.relation_type === '全部' ? ['论文合作', '项目合作', '专利合作'] : [indirectForm.relation_type],
      path_depth: Number(indirectForm.path_depth) || 2,
      minstrength: Number(indirectForm.minstrength) || 0.6,
    },
    null,
    2,
  )
  return {
    python: `import requests\n\nurl = "http://127.0.0.1:8891/api/v1/indirect-relation/infer"\npayload = ${payload}\n\nresponse = requests.post(url, json=payload, timeout=30)\nresponse.raise_for_status()\nprint(response.json())`,
    node: `const url = "http://127.0.0.1:8891/api/v1/indirect-relation/infer";\nconst payload = ${payload};\n\nconst response = await fetch(url, {\n  method: "POST",\n  headers: { "Content-Type": "application/json" },\n  body: JSON.stringify(payload),\n});\n\nconsole.log(await response.json());`,
    curl: `curl -X POST "http://127.0.0.1:8891/api/v1/indirect-relation/infer" \\\n  -H "Content-Type: application/json" \\\n  -d '${payload.replaceAll("'", "\\'")}'`,
  }
})

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

function splitGraphText(value: string | undefined, maxLength = 10) {
  const text = String(value ?? '').trim()
  if (!text) return []
  if (text.length <= maxLength) return [text]

  const rawParts = text.split(/[、，,\/／\s]+/).filter(Boolean)
  const parts = rawParts.length > 1 ? rawParts : text.match(new RegExp(`.{1,${maxLength}}`, 'g')) ?? [text]
  const lines: string[] = []
  let current = ''

  parts.forEach((part) => {
    if (!current) {
      current = part
      return
    }
    if ((current + part).length <= maxLength) {
      current += part
    } else {
      lines.push(current)
      current = part
    }
  })

  if (current) lines.push(current)
  return lines.flatMap((line) => (line.length > maxLength ? line.match(new RegExp(`.{1,${maxLength}}`, 'g')) ?? [line] : [line])).slice(0, 2)
}

function graphTitleLimit(width: number) {
  if (width >= 300) return 16
  if (width >= 250) return 14
  if (width >= 218) return 12
  if (width >= 200) return 10
  return 9
}

function graphChipWidth(width: number) {
  if (width >= 250) return 110
  return width >= 196 ? 96 : 48
}

function graphChipX(width: number, index: number) {
  if (width >= 250) return (width - 232) / 2 + (index % 2) * 122
  return width >= 196 ? 18 + (index % 2) * 106 : 14 + (index % 3) * 56
}

function graphChipY(height: number, width: number, index: number) {
  return width >= 196 ? height - 58 + Math.floor(index / 2) * 26 : height - 30 + Math.floor(index / 3) * 24
}

function graphChipTextLimit(width: number) {
  if (width >= 250) return 10
  if (width >= 196) return 8
  return 4
}

const highlightedResponseJson = computed(() => highlightCode(currentResponseJson.value))
const highlightedCodeSample = computed(() => highlightCode(currentCodeSamples.value[activeCode.value]))

watch(
  () => route.name,
  (routeName) => {
    activeInterfaceIndex.value = defaultInterfaceIndex(String(routeName ?? ''))
    activeSampleIndex.value = 0
    genericParams.value = {}
    activeIndustryCombo.value = null
    resultMode.value = 'structured'
    activeView.value = 'test'
  },
)

watch(activeInterfaceIndex, () => {
  activeSampleIndex.value = 0
  handleRun()
})

watch(activeSampleIndex, () => {
  handleRun()
})

type SampleScenario = {
  name: string
  replacements: Record<string, string>
}

const commonScenarios: SampleScenario[] = [
  { name: '智能科研合作网络', replacements: {} },
  {
    name: '机器人联合攻关网络',
    replacements: {
      张明远: '陈建国',
      李佳宁: '刘芳',
      李明哲: '王启航',
      陈思远: '赵清宁',
      专家C: '专家D',
      企业E: '灵动机器人有限公司',
      智能科研协同平台建设项目: '具身智能协同攻关项目',
      知识图谱: '机器人感知',
      机器学习: '多模态控制',
      大模型产业链: '机器人产业链',
      算力与模型环节: '感知与控制环节',
      场景应用生态: '工业巡检生态',
      算力芯片突破: '灵巧手控制突破',
      多模态发布: '多模态交互发布',
      开源生态升级: '机器人平台升级',
      人工智能: '具身智能',
      中游核心技术: '中游控制系统',
      上游基础资源: '上游传感器资源',
      下游应用场景: '下游工业场景',
    },
  },
  {
    name: '生物医药转化网络',
    replacements: {
      张明远: '周子谦',
      李佳宁: '吴若彤',
      李明哲: '林远航',
      陈思远: '何嘉禾',
      专家C: '专家E',
      企业E: '启明生物科技有限公司',
      智能科研协同平台建设项目: '药物靶点发现联合项目',
      知识图谱: '生物医药',
      机器学习: '药物筛选',
      大模型产业链: '生物医药产业链',
      算力与模型环节: '靶点发现环节',
      场景应用生态: '临床转化生态',
      算力芯片突破: '靶点验证突破',
      多模态发布: '多组学平台发布',
      开源生态升级: '转化平台升级',
      人工智能: '生物医药',
      中游核心技术: '中游靶点发现',
      上游基础资源: '上游实验资源',
      下游应用场景: '下游临床应用',
    },
  },
]

function buildSampleScenarios(moduleKey: string, interfaceName: string): SampleScenario[] {
  if (moduleKey === 'industry-chain-event') {
    return [
      { name: '大模型产业链事件筛选', replacements: {} },
      commonScenarios[1],
      {
        name: '低空经济事件筛选',
        replacements: {
          大模型产业链: '低空经济产业链',
          算力与模型环节: '飞控与通信环节',
          场景应用生态: '物流巡检生态',
          算力芯片突破: '低空飞控突破',
          多模态发布: '空地通信发布',
          开源生态升级: '航线平台升级',
          李明哲: '韩思远',
          陈思远: '顾雨辰',
          产业分析师: '低空经济分析师',
        },
      },
    ]
  }
  if (moduleKey === 'industry-chain-panorama') {
    return [
      { name: '人工智能产业链全景', replacements: {} },
      commonScenarios[1],
      {
        name: '量子信息产业链全景',
        replacements: {
          人工智能: '量子信息',
          中游核心技术: '中游量子计算',
          上游基础资源: '上游低温设备',
          下游应用场景: '下游安全通信',
          知识图谱: '量子算法',
          机器学习: '量子测控',
          大模型: '量子芯片',
          智能制造: '量子测量',
          智慧医疗: '量子传感',
          自动驾驶: '安全通信',
          技术突破: '量子芯片突破',
          产业合作: '校企联合验证',
        },
      },
    ]
  }
  if (interfaceName.includes('校友')) {
    return [
      { name: '清华大学校友网络', replacements: {} },
      {
        name: '机器人学院校友网络',
        replacements: {
          'ALU-001': 'ALU-101',
          'ALU-002': 'ALU-102',
          周子谦: '陈建国',
          吴若彤: '刘芳',
          复旦大学药学院: '浙江大学机器人研究院',
          上海药物研究所: '哈尔滨工业大学机器人技术中心',
          中国科学院大学: '浙江大学',
          计算机科学与技术学院: '机器人研究院',
          人工智能: '具身智能',
          '2015-09': '2016-09',
          '2019-06': '2020-06',
        },
      },
      {
        name: '生物医药校友网络',
        replacements: {
          'ALU-001': 'ALU-201',
          'ALU-002': 'ALU-202',
          周子谦: '林远航',
          吴若彤: '何嘉禾',
          复旦大学药学院: '中国科学院上海药物研究所',
          上海药物研究所: '同济大学生命科学学院',
          中国科学院大学: '复旦大学',
          计算机科学与技术学院: '药学院',
          人工智能: '药物靶点发现',
          '2015-09': '2014-09',
          '2019-06': '2018-06',
        },
      },
    ]
  }
  return commonScenarios
}

function replaceText(value: string, replacements: Record<string, string>) {
  return Object.entries(replacements).reduce(
    (text, [from, to]) => text.replaceAll(from, to),
    value,
  )
}

function replaceDeep<T>(value: T, replacements: Record<string, string>): T {
  if (typeof value === 'string') return replaceText(value, replacements) as T
  if (Array.isArray(value)) return value.map((item) => replaceDeep(item, replacements)) as T
  if (value && typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value).map(([key, item]) => [key, replaceDeep(item, replacements)]),
    ) as T
  }
  return value
}

function applyScenario(item: InterfacePrototype, replacements: Record<string, string>): InterfacePrototype {
  if (!Object.keys(replacements).length) return item
  return replaceDeep(item, replacements)
}

function handleRun() {
  lastTestTime.value = new Date().toLocaleString('zh-CN', {
    hour12: false,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  })
  if (isIndirectModule.value) {
    if (!indirectCoreExpert.value) {
      indirectErrorMessage.value = '未在专家人才库中找到该专家，请检查专家ID是否正确。'
    } else if (!indirectItems.value.length) {
      indirectErrorMessage.value = '未查询到相关结果，请检查输入信息是否正确。'
    } else {
      indirectErrorMessage.value = ''
    }
  }
  if (isAchievementModule.value) {
    if (!achievementCoreExpert.value) {
      achievementErrorMessage.value = '未在专家人才库中找到该专家，请检查专家ID是否正确。'
    } else if (!achievementItems.value.length) {
      achievementErrorMessage.value = '未查询到相关结果，请检查输入信息是否正确。'
    } else {
      achievementErrorMessage.value = ''
    }
  }
  resultMode.value = 'structured'
}

async function handleCopyCode() {
  try {
    await navigator.clipboard?.writeText(currentCodeSamples.value[activeCode.value])
  } catch {
    // Keep prototype feedback even when browser blocks clipboard access.
  }
  copied.value = true
  window.setTimeout(() => {
    copied.value = false
  }, 1200)
}

function closeModal() {
  showConfigModal.value = false
  showTechModal.value = false
  activeIndirectCombo.value = null
  activeAchievementCombo.value = null
  activeGenericCombo.value = null
  activeIndustryCombo.value = null
}

function toggleIndirectCombo(field: 'corenode_id' | 'relation_type') {
  activeIndirectCombo.value = activeIndirectCombo.value === field ? null : field
}

function selectIndirectOption(field: 'corenode_id' | 'relation_type', value: string) {
  indirectForm[field] = value
  activeIndirectCombo.value = null
}

function formatIndirectExpertOption(value: string) {
  return indirectExpertNames[value] ?? value
}

function parseIndirectExpertOption(value: string) {
  return Object.entries(indirectExpertNames).find(([, name]) => name === value)?.[0] ?? value
}

function handleIndirectExpertInput(event: Event) {
  indirectForm.corenode_id = parseIndirectExpertOption((event.target as HTMLInputElement).value)
}

function formatIndirectFieldName(field: string) {
  return field
}

function formatAchievementExpertOption(value: string) {
  return achievementExpertNames[value] ?? achievementPartnerNames[value] ?? value
}

function parseAchievementExpertOption(value: string) {
  return Object.entries({ ...achievementExpertNames, ...achievementPartnerNames }).find(([, name]) => name === value)?.[0] ?? value
}

function handleAchievementExpertInput(field: 'expertAId' | 'expertBId', event: Event) {
  achievementForm[field] = parseAchievementExpertOption((event.target as HTMLInputElement).value)
}

function handleAchievementTypeInput(event: Event) {
  const label = (event.target as HTMLInputElement).value
  const match = Object.entries({ paper: '论文成果', project: '项目成果', patent: '专利成果' }).find(([, name]) => name === label)
  achievementForm.achievementTypes = match?.[0] ?? label
}

function formatAchievementTypeOption(value: string) {
  const names: Record<string, string> = {
    paper: '论文成果',
    project: '项目成果',
    patent: '专利成果',
  }
  return names[value] ?? value
}

function formatAchievementFieldName(field: string) {
  return field
}

function selectIndustryOption(field: keyof typeof industryChainForm, value: string) {
  if (field === 'chain_name') {
    const seed = Object.values(industryChainSeeds).find((item) => item.name === value || item.code === value) ?? industryChainSeeds.AI_CHAIN
    industryChainForm.chain_name = seed.name
  } else if (field === 'level') {
    industryChainForm.level = normalizeIndustryLevel(value)
  } else {
    industryChainForm[field] = value
  }
  activeIndustryCombo.value = null
}

function toggleIndustryCombo(field: string) {
  activeIndustryCombo.value = activeIndustryCombo.value === field ? null : field
}

function formatIndustryOption(_field: string, value: string) {
  return value
}

function shouldShowIndustryRelation(relationName: string) {
  return industryChainForm.relation_type === '全部' || industryChainForm.relation_type === relationName
}

function normalizeIndustryLevel(value: string) {
  const level = Number.parseInt(value, 10)
  if (!Number.isFinite(level)) return '3'
  return String(Math.min(3, Math.max(1, level)))
}

function handleIndustryInput(field: keyof typeof industryChainForm, value: string) {
  if (field === 'level') {
    industryChainForm.level = normalizeIndustryLevel(value)
    return
  }
  industryChainForm[field] = value
}

function toggleIndustryLink(linkId: string) {
  collapsedIndustryLinks.value = {
    ...collapsedIndustryLinks.value,
    [linkId]: !collapsedIndustryLinks.value[linkId],
  }
}

function isIndustryLinkCollapsed(linkId: string) {
  return Boolean(collapsedIndustryLinks.value[linkId])
}

function isIndustryRootCollapsed() {
  return Boolean(collapsedIndustryLinks.value[INDUSTRY_ROOT_COLLAPSED_KEY])
}

function toggleAllIndustryLinks() {
  const linkIds = industryChainVisibleLinks.value.map((link) => link.id)
  const allCollapsed = isIndustryRootCollapsed()
  collapsedIndustryLinks.value = allCollapsed
    ? {}
    : {
        [INDUSTRY_ROOT_COLLAPSED_KEY]: true,
        ...Object.fromEntries(linkIds.map((id) => [id, true])),
      }
}

function toggleAchievementCombo(field: 'expertAId' | 'expertBId' | 'achievementTypes') {
  activeAchievementCombo.value = activeAchievementCombo.value === field ? null : field
}

function selectAchievementOption(field: 'expertAId' | 'expertBId' | 'achievementTypes', value: string) {
  achievementForm[field] = value
  activeAchievementCombo.value = null
}

</script>

<template>
  <div class="reasoning-placeholder">
    <header class="reasoning-placeholder__toolbar">
      <div class="kg-tabs" role="tablist" aria-label="功能视图">
        <button class="kg-tabs__item" :class="{ 'is-active': activeView === 'test' }" type="button" @click="activeView = 'test'">算法测试</button>
        <button class="kg-tabs__item" :class="{ 'is-active': activeView === 'developer' }" type="button" @click="activeView = 'developer'">开发者接口</button>
      </div>
      <button class="kg-button kg-button--text reasoning-placeholder__tech" type="button" @click="showTechModal = true">
        <img :src="iconInfo" alt="" aria-hidden="true" />
        技术方案
      </button>
    </header>

    <section v-if="activeView === 'test'" class="reasoning-placeholder__controls">
      <label>
        <span>子功能名称：</span>
        <select v-model.number="activeInterfaceIndex" class="select-with-icon">
          <option v-for="(item, index) in moduleInfo.interfaces" :key="item.name" :value="index">
            {{ item.name }}
          </option>
        </select>
        <img class="select-icon" :src="iconSelectArrow" alt="" aria-hidden="true" />
        <img class="field-info-icon" :src="iconInfo" alt="" aria-hidden="true" />
      </label>
      <div class="reasoning-placeholder__actions">
        <button class="kg-button kg-button--secondary" type="button" @click="showConfigModal = true">参数设置</button>
        <button class="kg-button" type="button" @click="handleRun">执行测试</button>
      </div>
    </section>

    <main v-if="activeView === 'test'" class="reasoning-placeholder__main">
      <section class="kg-panel reasoning-placeholder__graph">
        <div class="kg-panel__header">
          <h2 class="kg-panel__title">测试结果预览</h2>
          <div class="reasoning-placeholder__time">最近测试时间：{{ lastTestTime }}</div>
        </div>
        <div class="reasoning-placeholder__canvas kg-graph-canvas">
          <svg v-if="isIndustryChainPanoramaModule" class="industry-chain-svg" viewBox="0 0 900 620" role="img" :aria-label="`${industryChainSeed.name}全景图`">
            <defs>
              <marker id="industry-arrow-blue" markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto">
                <path d="M0,0 L8,4 L0,8 Z" fill="#3478f6" />
              </marker>
              <marker id="industry-arrow-orange" markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto">
                <path d="M0,0 L8,4 L0,8 Z" fill="#ff7a00" />
              </marker>
              <marker id="industry-arrow-purple" markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto">
                <path d="M0,0 L8,4 L0,8 Z" fill="#8a35e6" />
              </marker>
            </defs>

            <g class="industry-svg-root" role="button" tabindex="0" @click="toggleAllIndustryLinks">
              <rect x="330" y="18" width="240" height="58" rx="8" />
              <text x="450" y="52">{{ industryChainSeed.name }}</text>
            </g>

            <template v-if="!isIndustryRootCollapsed()">
              <g class="industry-svg-tree">
                <path v-if="industryChainVisibleLinks.length >= 1" d="M450 68 V100 H128 V132" />
                <path v-if="industryChainVisibleLinks.length >= 2" d="M450 100 V132" />
                <path v-if="industryChainVisibleLinks.length >= 3" d="M450 100 H772 V132" />
                <text v-if="industryChainVisibleLinks.length >= 1" x="164" y="116">包含环节</text>
                <text v-if="industryChainVisibleLinks.length >= 2" x="488" y="116">包含环节</text>
                <text v-if="industryChainVisibleLinks.length >= 3" x="810" y="116">包含环节</text>
              </g>

              <template v-for="(link, index) in industryChainVisibleLinks" :key="link.id">
                <g class="industry-svg-stage" :transform="`translate(${[48, 370, 692][index] ?? 48} 132)`" role="button" tabindex="0" @click="toggleIndustryLink(link.id)">
                  <rect width="160" height="78" rx="8" />
                  <text class="industry-svg-stage__title" x="80" y="32">{{ link.name }}</text>
                  <text class="industry-svg-stage__sub" x="80" y="56">产业节点 | L{{ link.level }}</text>
                </g>

                <g v-if="industryChainDepth >= link.level && !isIndustryLinkCollapsed(link.id)" :transform="`translate(${[53, 375, 697][index] ?? 53} 238)`">
                  <path class="industry-svg-branch" d="M75 -28 V-12 H-10 V310" />
                  <path class="industry-svg-branch industry-svg-branch--blue" d="M-10 34 H0" />
                  <path class="industry-svg-branch industry-svg-branch--purple" d="M-10 126 H0" />
                  <path class="industry-svg-branch industry-svg-branch--gold" d="M-10 218 H0" />
                  <path class="industry-svg-branch industry-svg-branch--orange" d="M-10 310 H0" />

                  <g class="industry-svg-card industry-svg-card--green">
                    <rect width="150" height="68" rx="8" />
                    <text class="industry-svg-card__title" x="75" y="24">企业布局</text>
                    <text class="industry-svg-card__body" x="75" y="48">{{ shortGraphText(link.enterprises.slice(0, 3).join('、'), 15) }}</text>
                  </g>
                  <g class="industry-svg-card industry-svg-card--purple" transform="translate(0 92)">
                    <rect width="150" height="68" rx="8" />
                    <text class="industry-svg-card__title" x="75" y="24">核心专家</text>
                    <text class="industry-svg-card__body" x="75" y="48">{{ shortGraphText(link.experts.slice(0, 3).join('、'), 15) }}</text>
                  </g>
                  <g class="industry-svg-card industry-svg-card--gold" transform="translate(0 184)">
                    <rect width="150" height="68" rx="8" />
                    <text class="industry-svg-card__title" x="75" y="24">关键技术</text>
                    <text class="industry-svg-card__body" x="75" y="48">{{ shortGraphText(link.technologies.slice(0, 3).join('、'), 15) }}</text>
                  </g>
                  <g class="industry-svg-card industry-svg-card--orange" transform="translate(0 276)">
                    <rect width="150" height="68" rx="8" />
                    <text class="industry-svg-card__title" x="75" y="24">动态事件</text>
                    <text class="industry-svg-card__body" x="75" y="48">{{ shortGraphText(link.news.slice(0, 3).join('、'), 15) }}</text>
                  </g>
                </g>
              </template>

              <g v-if="industryChainVisibleLinks.length >= 2 && shouldShowIndustryRelation('上下游关系')" class="industry-svg-relations">
                <path d="M208 166 H370" marker-end="url(#industry-arrow-blue)" />
                <text x="289" y="150">上下游关系</text>
              </g>
              <g v-if="industryChainVisibleLinks.length >= 2 && shouldShowIndustryRelation('数据流向关系')" class="industry-svg-relations">
                <path class="industry-svg-data-line" d="M208 198 H370" marker-end="url(#industry-arrow-orange)" />
                <text class="industry-svg-data-text" x="289" y="214">数据流向</text>
              </g>
              <g v-if="industryChainVisibleLinks.length >= 3 && shouldShowIndustryRelation('上下游关系')" class="industry-svg-relations">
                <path d="M530 166 H692" marker-end="url(#industry-arrow-blue)" />
                <text x="611" y="150">上下游关系</text>
              </g>
              <g v-if="industryChainVisibleLinks.length >= 3 && shouldShowIndustryRelation('数据流向关系')" class="industry-svg-relations">
                <path class="industry-svg-data-line" d="M530 198 H692" marker-end="url(#industry-arrow-orange)" />
                <text class="industry-svg-data-text" x="611" y="214">数据流向</text>
              </g>
            </template>
          </svg>
          <svg v-else-if="activeGraph.nodes.length || activeGraph.edges.length" class="prototype-graph" viewBox="0 0 900 580" role="img" :aria-label="`${title}图谱预览`">
            <defs>
              <marker
                v-for="tone in ['blue', 'green', 'purple', 'orange', 'gold']"
                :id="`proto-arrow-${tone}`"
                :key="tone"
                markerWidth="8"
                markerHeight="8"
                refX="7"
                refY="4"
                orient="auto"
              >
                <path d="M0,0 L8,4 L0,8 Z" :class="`marker marker--${tone}`" />
              </marker>
            </defs>
            <g>
              <template v-for="edge in activeGraph.edges" :key="edge.id">
                <path
                  class="prototype-edge"
                  :class="[`prototype-edge--${edge.tone}`, { 'is-dashed': edge.dashed }]"
                  :d="edge.path"
                  :marker-end="`url(#proto-arrow-${edge.tone})`"
                />
                  <text
                    v-if="edge.label"
                    class="prototype-edge-label"
                    :class="`prototype-edge-label--${edge.tone}`"
                    :x="edge.labelX"
                    :y="edge.labelY"
                  >
                    {{ edge.label }}
                  </text>
              </template>
            </g>
            <g>
              <g
                v-for="node in activeGraph.nodes"
                :key="node.id"
                class="prototype-node"
                :class="`prototype-node--${node.tone}`"
                :transform="`translate(${node.x} ${node.y})`"
              >
                <rect :width="node.w" :height="node.h" rx="8" />
                <text class="prototype-node__title" :x="node.w / 2" :y="node.chips?.length ? 22 : node.h / 2 - (node.subtitle ? 12 : 0)">
                  <tspan
                    v-for="(line, index) in splitGraphText(node.title, graphTitleLimit(node.w))"
                    :key="`${node.id}-title-${index}`"
                    :x="node.w / 2"
                    :dy="index === 0 ? 0 : 18"
                  >
                    {{ line }}
                  </tspan>
                </text>
                <text v-if="node.subtitle" class="prototype-node__subtitle" :x="node.w / 2" :y="node.chips?.length ? 50 : node.h / 2 + 18">
                  <tspan
                    v-for="(line, index) in splitGraphText(node.subtitle, graphTitleLimit(node.w) + 2)"
                    :key="`${node.id}-subtitle-${index}`"
                    :x="node.w / 2"
                    :dy="index === 0 ? 0 : 15"
                  >
                    {{ line }}
                  </tspan>
                </text>
                <template v-if="node.chips?.length">
                  <g v-for="(chip, index) in node.chips.slice(0, 4)" :key="chip">
                    <rect class="prototype-chip" :x="graphChipX(node.w, index)" :y="graphChipY(node.h, node.w, index)" :width="graphChipWidth(node.w)" height="22" rx="6" />
                    <text class="prototype-chip-text" :x="graphChipX(node.w, index) + graphChipWidth(node.w) / 2" :y="graphChipY(node.h, node.w, index) + 14">
                      <tspan v-for="(line, lineIndex) in splitGraphText(chip, graphChipTextLimit(node.w)).slice(0, 1)" :key="line" :x="graphChipX(node.w, index) + graphChipWidth(node.w) / 2" :dy="lineIndex === 0 ? 0 : 12">{{ line }}</tspan>
                    </text>
                  </g>
                </template>
              </g>
            </g>
          </svg>
          <div v-else class="reasoning-placeholder__empty">
            <strong>查询失败</strong>
            <p>{{ activeErrorMessage || '未查询到相关结果，请检查输入信息是否正确。' }}</p>
          </div>
        </div>
      </section>

      <aside class="kg-panel reasoning-placeholder__detail">
        <div class="kg-panel__header">
          <h2 class="kg-panel__title">结果详情</h2>
          <div class="reasoning-placeholder__tabs">
            <button :class="{ 'is-active': resultMode === 'structured' }" type="button" @click="resultMode = 'structured'">结构化结果</button>
            <button :class="{ 'is-active': resultMode === 'api' }" type="button" @click="resultMode = 'api'">API结果示例</button>
          </div>
        </div>
        <div v-if="resultMode === 'structured' && activeErrorMessage" class="reasoning-placeholder__empty">
          <strong>查询失败</strong>
          <p>{{ activeErrorMessage }}</p>
        </div>
        <div v-else-if="resultMode === 'structured'" class="reasoning-placeholder__detail-table-wrap">
          <dl class="reasoning-placeholder__table reasoning-placeholder__table--merged">
            <div v-for="([label, value], index) in activeDetailRows" :key="`${label}-${index}`">
              <dt>{{ label }}</dt>
              <dd>
                <template v-if="(String(label).includes('原因标签') || String(label).includes('标签')) && Array.isArray(value)">
                  <span
                    v-for="item in value"
                    :key="item"
                    class="reasoning-placeholder__tag"
                  >
                    {{ item }}
                  </span>
                </template>
                <template v-else>{{ displayDetailValue(value) }}</template>
              </dd>
            </div>
          </dl>
        </div>
        <pre v-else class="reasoning-placeholder__code" v-html="highlightedResponseJson"></pre>
      </aside>
    </main>

    <section v-else class="reasoning-placeholder__developer">
      <div class="reasoning-placeholder__developer-meta">
        <label>
          <span>子功能名称：</span>
          <select v-model.number="activeInterfaceIndex" class="select-with-icon">
            <option v-for="(item, index) in moduleInfo.interfaces" :key="item.name" :value="index">
              {{ item.name }}
            </option>
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

      <div class="reasoning-placeholder__developer-cards">
        <section class="kg-panel">
          <div class="kg-panel__header"><h2 class="kg-panel__title">请求参数</h2></div>
          <div class="reasoning-placeholder__table-wrap">
            <table class="reasoning-placeholder__developer-table">
              <thead><tr><th>字段名</th><th>类型</th><th>必填</th><th>说明</th></tr></thead>
              <tbody>
                <tr v-for="field in activeRequestFields" :key="field.name">
                  <td>{{ field.name }}</td>
                  <td>{{ field.type }}</td>
                  <td>{{ field.required ?? '否' }}</td>
                  <td>{{ field.description }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>
        <section class="kg-panel">
          <div class="kg-panel__header"><h2 class="kg-panel__title">返回字段</h2></div>
          <div class="reasoning-placeholder__table-wrap">
            <table class="reasoning-placeholder__developer-table">
              <thead><tr><th>字段名</th><th>类型</th><th>说明</th></tr></thead>
              <tbody>
                <tr v-for="field in activeResponseFields" :key="field.name">
                  <td>{{ field.name }}</td>
                  <td>{{ field.type }}</td>
                  <td>{{ field.description }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>
      </div>

      <section class="kg-panel reasoning-placeholder__developer-code">
        <div class="kg-panel__header">
          <h2 class="kg-panel__title">代码示例</h2>
          <div class="reasoning-placeholder__tabs">
            <button :class="{ 'is-active': activeCode === 'python' }" type="button" @click="activeCode = 'python'">Python</button>
            <button :class="{ 'is-active': activeCode === 'node' }" type="button" @click="activeCode = 'node'">Node.js</button>
            <button :class="{ 'is-active': activeCode === 'curl' }" type="button" @click="activeCode = 'curl'">cURL</button>
          </div>
        </div>
        <button class="reasoning-placeholder__copy" :class="{ 'is-copied': copied }" type="button" @click="handleCopyCode">
          <span v-if="copied" aria-hidden="true">✓</span>
          <img v-else :src="iconCopy" alt="" aria-hidden="true" />
        </button>
        <pre v-html="highlightedCodeSample"></pre>
      </section>
    </section>

    <div v-if="showConfigModal || showTechModal" class="modal-mask" @click.self="closeModal">
      <section v-if="showConfigModal" class="modal modal--config" role="dialog" aria-modal="true">
        <header class="modal__header">
          <h2><img :src="iconModalSetting" alt="" aria-hidden="true" />测试参数设置</h2>
          <div class="modal__header-extra">
            <span class="modal__required"><span>*</span> 为必填项</span>
            <button type="button" @click="closeModal"><img :src="iconClose" alt="" aria-hidden="true" /></button>
          </div>
        </header>
        <div v-if="isIndustryChainEventScreenInterface" class="modal__body config-form" @click="activeIndustryCombo = null">
          <label v-for="field in activeRequestFields" :key="field.name">
            <span><i>{{ field.required === '是' ? '*' : '' }}</i>{{ displayRequestFieldName(field.name) }}</span>
            <div v-if="isDateFieldName(field.name)" class="combo-field date-field" @click.stop>
              <input
                :value="industryEventForm[field.name as keyof typeof industryEventForm]"
                :placeholder="`请选择${displayRequestFieldName(field.name)}`"
                type="date"
                @input="industryEventForm[field.name as keyof typeof industryEventForm] = ($event.target as HTMLInputElement).value"
              />
            </div>
            <div v-else class="combo-field" @click.stop>
              <input
                :value="industryEventForm[field.name as keyof typeof industryEventForm]"
                :placeholder="`请选择或输入${displayRequestFieldName(field.name)}`"
                @focus="activeIndustryCombo = field.name"
                @input="industryEventForm[field.name as keyof typeof industryEventForm] = ($event.target as HTMLInputElement).value"
              />
              <button class="combo-field__arrow" type="button" @click="toggleIndustryCombo(field.name)">
                <img :src="iconSelectArrow" alt="" aria-hidden="true" />
              </button>
              <div v-if="activeIndustryCombo === field.name" class="combo-field__menu">
                <button
                  v-for="value in industryEventOptions[field.name as keyof typeof industryEventOptions]"
                  :key="value"
                  type="button"
                  :class="{ 'is-selected': industryEventForm[field.name as keyof typeof industryEventForm] === value }"
                  @click="industryEventForm[field.name as keyof typeof industryEventForm] = value; activeIndustryCombo = null"
                >
                  {{ field.name === 'eventTypes' ? formatIndustryEventType(value) : field.name === 'industryChainNodeCode' ? formatIndustryChainNodeCode(value) : value }}
                </button>
              </div>
            </div>
          </label>
        </div>
        <div v-else-if="isIndustryChainPanoramaModule" class="modal__body config-form config-form--panorama" @click="activeIndustryCombo = null">
          <label v-for="field in activeRequestFields" :key="field.name">
            <span><i>{{ field.required === '是' ? '*' : '' }}</i>{{ displayRequestFieldName(field.name) }}</span>
            <div class="combo-field" @click.stop>
              <input
                :value="industryChainForm[field.name as keyof typeof industryChainForm]"
                :placeholder="`请选择或输入${displayRequestFieldName(field.name)}`"
                @focus="activeIndustryCombo = field.name"
                @input="handleIndustryInput(field.name as keyof typeof industryChainForm, ($event.target as HTMLInputElement).value)"
              />
              <button class="combo-field__arrow" type="button" @click="toggleIndustryCombo(field.name)">
                <img :src="iconSelectArrow" alt="" aria-hidden="true" />
              </button>
              <div v-if="activeIndustryCombo === field.name" class="combo-field__menu">
                <button
                  v-for="value in industryChainOptions[field.name as keyof typeof industryChainOptions]"
                  :key="value"
                  type="button"
                  :class="{ 'is-selected': industryChainForm[field.name as keyof typeof industryChainForm] === value }"
                  @click="selectIndustryOption(field.name as keyof typeof industryChainForm, value)"
                >
                  {{ formatIndustryOption(field.name, value) }}
                </button>
              </div>
            </div>
          </label>
        </div>
        <div v-else-if="isIndirectModule" class="modal__body config-form" @click="activeIndirectCombo = null">
          <label>
            <span><i>*</i>{{ formatIndirectFieldName('corenode_id') }}</span>
            <div class="combo-field" @click.stop>
              <input :value="formatIndirectExpertOption(indirectForm.corenode_id)" placeholder="请选择或输入核心专家" @focus="activeIndirectCombo = 'corenode_id'" @input="handleIndirectExpertInput" />
              <button class="combo-field__arrow" type="button" @click="toggleIndirectCombo('corenode_id')">
                <img :src="iconSelectArrow" alt="" aria-hidden="true" />
              </button>
              <div v-if="activeIndirectCombo === 'corenode_id'" class="combo-field__menu">
                <button
                  v-for="value in indirectOptions.corenode_id"
                  :key="value"
                  type="button"
                  :class="{ 'is-selected': indirectForm.corenode_id === value }"
                  @click="selectIndirectOption('corenode_id', value)"
                >
                  {{ formatIndirectExpertOption(value) }}
                </button>
              </div>
            </div>
          </label>
          <label>
            <span>{{ formatIndirectFieldName('relation_type') }}</span>
            <div class="combo-field" @click.stop>
              <input v-model="indirectForm.relation_type" placeholder="请选择或输入关系类型" @focus="activeIndirectCombo = 'relation_type'" />
              <button class="combo-field__arrow" type="button" @click="toggleIndirectCombo('relation_type')">
                <img :src="iconSelectArrow" alt="" aria-hidden="true" />
              </button>
              <div v-if="activeIndirectCombo === 'relation_type'" class="combo-field__menu">
                <button
                  v-for="value in indirectOptions.relation_type"
                  :key="value"
                  type="button"
                  :class="{ 'is-selected': indirectForm.relation_type === value }"
                  @click="selectIndirectOption('relation_type', value)"
                >
                  {{ value }}
                </button>
              </div>
            </div>
          </label>
          <label>
            <span>{{ formatIndirectFieldName('path_depth') }}</span>
            <select v-model="indirectForm.path_depth">
              <option v-for="value in indirectOptions.path_depth" :key="value" :value="value">{{ value }}</option>
            </select>
            <img class="select-icon" :src="iconSelectArrow" alt="" aria-hidden="true" />
          </label>
          <label>
            <span>{{ formatIndirectFieldName('minstrength') }}</span>
            <select v-model="indirectForm.minstrength">
              <option v-for="value in indirectOptions.minstrength" :key="value" :value="value">{{ value }}</option>
            </select>
            <img class="select-icon" :src="iconSelectArrow" alt="" aria-hidden="true" />
          </label>
        </div>
        <div v-else-if="isAchievementModule" class="modal__body config-form" @click="activeAchievementCombo = null">
          <label>
            <span><i>*</i>{{ formatAchievementFieldName('expertAId') }}</span>
            <div class="combo-field" @click.stop>
              <input :value="formatAchievementExpertOption(achievementForm.expertAId)" placeholder="请选择或输入专家A" @focus="activeAchievementCombo = 'expertAId'" @input="handleAchievementExpertInput('expertAId', $event)" />
              <button class="combo-field__arrow" type="button" @click="toggleAchievementCombo('expertAId')">
                <img :src="iconSelectArrow" alt="" aria-hidden="true" />
              </button>
              <div v-if="activeAchievementCombo === 'expertAId'" class="combo-field__menu">
                <button
                  v-for="value in achievementOptions.expertAId"
                  :key="value"
                  type="button"
                  :class="{ 'is-selected': achievementForm.expertAId === value }"
                  @click="selectAchievementOption('expertAId', value)"
                >
                  {{ formatAchievementExpertOption(value) }}
                </button>
              </div>
            </div>
          </label>
          <label>
            <span><i>*</i>{{ formatAchievementFieldName('expertBId') }}</span>
            <div class="combo-field" @click.stop>
              <input :value="formatAchievementExpertOption(achievementForm.expertBId)" placeholder="请选择或输入专家B" @focus="activeAchievementCombo = 'expertBId'" @input="handleAchievementExpertInput('expertBId', $event)" />
              <button class="combo-field__arrow" type="button" @click="toggleAchievementCombo('expertBId')">
                <img :src="iconSelectArrow" alt="" aria-hidden="true" />
              </button>
              <div v-if="activeAchievementCombo === 'expertBId'" class="combo-field__menu">
                <button
                  v-for="value in achievementOptions.expertBId"
                  :key="value"
                  type="button"
                  :class="{ 'is-selected': achievementForm.expertBId === value }"
                  @click="selectAchievementOption('expertBId', value)"
                >
                  {{ formatAchievementExpertOption(value) }}
                </button>
              </div>
            </div>
          </label>
          <label>
            <span>achievementTypes</span>
            <div class="combo-field" @click.stop>
              <input :value="formatAchievementTypeOption(achievementForm.achievementTypes)" placeholder="请选择或输入成果类型" @focus="activeAchievementCombo = 'achievementTypes'" @input="handleAchievementTypeInput" />
              <button class="combo-field__arrow" type="button" @click="toggleAchievementCombo('achievementTypes')">
                <img :src="iconSelectArrow" alt="" aria-hidden="true" />
              </button>
              <div v-if="activeAchievementCombo === 'achievementTypes'" class="combo-field__menu">
                <button
                  v-for="value in achievementOptions.achievementTypes"
                  :key="value"
                  type="button"
                  :class="{ 'is-selected': achievementForm.achievementTypes === value }"
                  @click="selectAchievementOption('achievementTypes', value)"
                >
                  {{ formatAchievementTypeOption(value) }}
                </button>
              </div>
            </div>
          </label>
          <label>
            <span>startTime</span>
            <input v-model="achievementForm.startTime" type="date" />
          </label>
          <label>
            <span>endTime</span>
            <input v-model="achievementForm.endTime" type="date" />
          </label>
        </div>
        <div v-else class="modal__body config-form" @click="activeGenericCombo = null">
          <label v-for="field in visibleParams" :key="field.name">
            <span><i>{{ field.required === '是' ? '*' : '' }}</i>{{ field.name }}</span>
            <div v-if="isDateFieldName(field.name)" class="combo-field date-field" @click.stop>
              <input
                :value="normalizeDateInputValue(field.name, genericParamValue(field.name))"
                :placeholder="`请选择${field.name}`"
                type="date"
                @input="handleGenericParamInput(field.name, $event)"
              />
            </div>
            <div v-else class="combo-field" @click.stop>
              <input
                :value="genericParamValue(field.name)"
                :placeholder="`请选择或输入${field.name}`"
                @focus="activeGenericCombo = field.name"
                @input="handleGenericParamInput(field.name, $event)"
              />
              <button class="combo-field__arrow" type="button" @click="toggleGenericCombo(field.name)">
                <img :src="iconSelectArrow" alt="" aria-hidden="true" />
              </button>
              <div v-if="activeGenericCombo === field.name" class="combo-field__menu">
                <button
                  v-for="value in requestFieldValues(field.name)"
                  :key="value"
                  type="button"
                  :class="{ 'is-selected': genericParamValue(field.name) === value }"
                  @click="selectGenericOption(field.name, value)"
                >
                  {{ displayParamValue(field.name, value) }}
                </button>
              </div>
            </div>
          </label>
        </div>
        <footer class="modal__footer">
          <button class="kg-button kg-button--secondary" type="button" @click="closeModal">取消</button>
          <button class="kg-button" type="button" @click="closeModal(); handleRun()">保存并执行</button>
        </footer>
      </section>

      <section v-if="showTechModal" class="modal modal--tech" role="dialog" aria-modal="true">
        <header class="modal__header">
          <h2>技术方案</h2>
          <button type="button" @click="showTechModal = false"><img :src="iconClose" alt="" aria-hidden="true" /></button>
        </header>
        <div class="modal__body">
          <h3 class="modal__section-title">功能描述</h3>
          <p class="modal__desc">{{ moduleInfo.requirement }}</p>
          <h3 class="modal__section-title">推理流程</h3>
          <div class="flow-steps">
            <div class="flow-step"><img :src="flowInput" alt="" /><strong>{{ moduleInfo.flow[0] }}</strong><span>接收参数与筛选条件</span></div>
            <img class="flow-step__arrow flow-step__arrow--one" :src="flowArrow" alt="" />
            <div class="flow-step"><img :src="flowStandardize" alt="" /><strong>{{ moduleInfo.flow[1] }}</strong><span>统一实体与时间口径</span></div>
            <img class="flow-step__arrow flow-step__arrow--two" :src="flowArrow" alt="" />
            <div class="flow-step"><img :src="flowReasoning" alt="" /><strong>{{ moduleInfo.flow[2] }}</strong><span>执行模块算法规则</span></div>
            <img class="flow-step__arrow flow-step__arrow--three" :src="flowArrow" alt="" />
            <div class="flow-step"><img :src="flowOutput" alt="" /><strong>{{ moduleInfo.flow[3] }}</strong><span>输出结构化结果和图谱</span></div>
          </div>
        </div>
      </section>
    </div>
  </div>
</template>

<style scoped>
.reasoning-placeholder {
  display: flex;
  flex-direction: column;
  height: 100%;
  gap: 10px;
}

.reasoning-placeholder__toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 var(--space-16);
}

.reasoning-placeholder__toolbar {
  min-height: 46px;
}

.reasoning-placeholder__controls {
  display: grid;
  grid-template-columns: 420px minmax(220px, 1fr);
  gap: 10px;
  align-items: end;
  min-height: 40px;
  padding: 0 14px 2px;
  font-size: 14px;
}

.reasoning-placeholder__controls label {
  position: relative;
  display: grid;
  grid-template-columns: max-content minmax(0, 1fr) 14px;
  align-items: center;
  gap: var(--space-8);
}

.reasoning-placeholder__controls select {
  width: 100%;
  height: 32px;
  padding: 0 34px 0 var(--space-12);
  border: 1px solid var(--border-strong);
  border-radius: var(--radius-sm);
  background: var(--surface);
  color: var(--text-primary);
}

.reasoning-placeholder__tech {
  gap: 4px;
}

.reasoning-placeholder__tech img,
.field-info-icon {
  width: 14px;
  height: 14px;
  object-fit: contain;
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

.reasoning-placeholder__controls .select-icon,
.reasoning-placeholder__developer-meta label .select-icon {
  right: 28px;
}

.reasoning-placeholder__actions {
  display: flex;
  justify-content: flex-end;
  gap: var(--space-16);
}

.reasoning-placeholder__main {
  display: grid;
  grid-template-columns: minmax(0, 1.6fr) minmax(0, 1fr);
  gap: 12px;
  flex: 1;
  min-height: 0;
  padding: 12px;
  border-radius: var(--radius-md);
  background: var(--surface-subtle);
  overflow: hidden;
}

.reasoning-placeholder__graph,
.reasoning-placeholder__detail {
  display: flex;
  flex-direction: column;
  min-height: 0;
  overflow: hidden;
}

.reasoning-placeholder__time {
  color: var(--text-tertiary);
}

.reasoning-placeholder__canvas {
  display: grid;
  flex: 1;
  min-height: 0;
  margin: 0 var(--space-16) var(--space-16);
  place-items: center;
}

.industry-chain-svg {
  width: min(100%, 960px);
  height: auto;
  max-height: min(100%, 640px);
  aspect-ratio: 900 / 620;
}

.industry-svg-tree path {
  fill: none;
  stroke: #8a35e6;
  stroke-width: 2;
  marker-end: url("#industry-arrow-purple");
}

.industry-svg-tree text {
  fill: #7532d8;
  font-size: 12px;
  font-weight: 700;
  text-anchor: middle;
}

.industry-svg-root,
.industry-svg-stage {
  cursor: pointer;
}

.industry-svg-root rect {
  fill: #fbf7ff;
  stroke: #9d6cff;
  stroke-width: 2;
}

.industry-svg-root text {
  fill: #7532d8;
  font-size: 18px;
  font-weight: 800;
  text-anchor: middle;
  dominant-baseline: middle;
}

.industry-svg-stage rect {
  fill: #f8fbff;
  stroke: #6da0ff;
  stroke-width: 2;
}

.industry-svg-stage text,
.industry-svg-card text,
.industry-svg-relations text {
  text-anchor: middle;
  dominant-baseline: middle;
}

.industry-svg-stage__title {
  fill: #1f5eea;
  font-size: 16px;
  font-weight: 800;
}

.industry-svg-stage__sub {
  fill: #1f5eea;
  font-size: 13px;
  font-weight: 700;
}

.industry-svg-branch {
  fill: none;
  stroke: #34c678;
  stroke-width: 2;
}

.industry-svg-branch--blue {
  stroke: #6da0ff;
}

.industry-svg-branch--purple {
  stroke: #b57cff;
}

.industry-svg-branch--gold {
  stroke: #f2bd45;
}

.industry-svg-branch--orange {
  stroke: #ff9a4a;
}

.industry-svg-card rect {
  stroke-width: 1.6;
}

.industry-svg-card--green rect {
  fill: #f3fbf5;
  stroke: #97dbab;
}

.industry-svg-card--purple rect {
  fill: #fbf7ff;
  stroke: #d6c2ff;
}

.industry-svg-card--gold rect {
  fill: #fffbed;
  stroke: #f2d883;
}

.industry-svg-card--orange rect {
  fill: #fff7ef;
  stroke: #ffbf89;
}

.industry-svg-card--green .industry-svg-card__title {
  fill: #168326;
}

.industry-svg-card--purple .industry-svg-card__title {
  fill: #7532d8;
}

.industry-svg-card--gold .industry-svg-card__title {
  fill: #b77900;
}

.industry-svg-card--orange .industry-svg-card__title {
  fill: #e85d00;
}

.industry-svg-card__title {
  font-size: 14px;
  font-weight: 800;
}

.industry-svg-card__body {
  fill: #253247;
  font-size: 10.5px;
  font-weight: 600;
}

.industry-svg-relations path {
  fill: none;
  stroke: #3478f6;
  stroke-width: 2;
}

.industry-svg-relations text {
  fill: #3478f6;
  font-size: 12px;
  font-weight: 700;
}

.industry-svg-relations .industry-svg-data-line {
  stroke: #ff7a00;
  stroke-dasharray: 6 5;
}

.industry-svg-relations .industry-svg-data-text {
  fill: #ff7a00;
}

.reasoning-placeholder__empty {
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

.reasoning-placeholder__empty strong {
  color: var(--text-primary);
  font-size: 18px;
}

.reasoning-placeholder__empty p {
  margin: 0;
  line-height: 24px;
}

.prototype-graph {
  width: min(100%, 960px);
  height: auto;
  max-height: min(100%, 620px);
  aspect-ratio: 900 / 580;
}

.prototype-edge {
  fill: none;
  stroke-width: 2.4;
}

.prototype-edge.is-dashed {
  stroke-dasharray: 8 7;
}

.prototype-edge--blue {
  stroke: #3478f6;
}

.prototype-edge--green {
  stroke: #36b24a;
}

.prototype-edge--purple {
  stroke: #8a35e6;
}

.prototype-edge--orange {
  stroke: #ff7a00;
}

.prototype-edge--gold {
  stroke: #f2a400;
}

.marker--blue {
  fill: #3478f6;
}

.marker--green {
  fill: #36b24a;
}

.marker--purple {
  fill: #8a35e6;
}

.marker--orange {
  fill: #ff7a00;
}

.marker--gold {
  fill: #f2a400;
}

.prototype-edge-label {
  font-size: 14px;
  font-weight: 700;
  text-anchor: middle;
  dominant-baseline: middle;
  stroke: rgba(255, 255, 255, 0.96);
  stroke-width: 5px;
  paint-order: stroke fill;
}

.prototype-edge-label-bg {
  fill: rgba(255, 255, 255, 0.94);
  stroke-width: 1;
}

.prototype-edge-label-bg--blue {
  stroke: #b7cdfc;
}

.prototype-edge-label-bg--green {
  stroke: #b8e6c0;
}

.prototype-edge-label-bg--purple {
  stroke: #d7b8ff;
}

.prototype-edge-label-bg--orange {
  stroke: #ffd0a6;
}

.prototype-edge-label-bg--gold {
  stroke: #f2d883;
}

.prototype-edge-label--blue {
  fill: #1f5eea;
}

.prototype-edge-label--green {
  fill: #218b36;
}

.prototype-edge-label--purple {
  fill: #7430d9;
}

.prototype-edge-label--orange {
  fill: #ed6a00;
}

.prototype-edge-label--gold {
  fill: #b77900;
}

.prototype-node rect {
  fill: #fff;
  stroke-width: 2;
  filter: drop-shadow(0 4px 12px rgba(47, 84, 150, 0.08));
}

.prototype-node {
  cursor: grab;
  touch-action: none;
}

.prototype-node.is-dragging {
  cursor: grabbing;
}

.prototype-node__icon circle {
  fill: currentColor;
  opacity: 0.14;
}

.prototype-node__icon text {
  fill: currentColor;
  font-size: 13px;
  font-weight: 700;
  dominant-baseline: middle;
  text-anchor: middle;
}

.prototype-node--blue rect {
  fill: #f5f9ff;
  stroke: #6da0ff;
}

.prototype-node--green rect {
  fill: #f3fbf5;
  stroke: #62c975;
}

.prototype-node--purple rect {
  fill: #faf5ff;
  stroke: #b57cff;
}

.prototype-node--orange rect {
  fill: #fff7ef;
  stroke: #ff9a4a;
}

.prototype-node--gold rect {
  fill: #fffbed;
  stroke: #f2bd45;
}

.prototype-node__title,
.prototype-node__subtitle,
.prototype-chip-text {
  dominant-baseline: middle;
  text-anchor: middle;
}

.prototype-node__title {
  fill: #1f4fbf;
  font-size: 17px;
  font-weight: 700;
}

.prototype-node--green .prototype-node__title {
  fill: #168326;
}

.prototype-node--purple .prototype-node__title {
  fill: #7532d8;
}

.prototype-node--orange .prototype-node__title {
  fill: #e85d00;
}

.prototype-node--gold .prototype-node__title {
  fill: #b77900;
}

.prototype-node__subtitle {
  fill: #3f4b5d;
  font-size: 14px;
  font-weight: 500;
}

.prototype-chip {
  fill: rgba(255, 255, 255, 0.82);
  stroke: currentColor;
  stroke-width: 1.4;
}

.prototype-chip-text {
  fill: currentColor;
  font-size: 11px;
  font-weight: 600;
}

.prototype-node--blue {
  color: #3478f6;
}

.prototype-node--green {
  color: #36b24a;
}

.prototype-node--purple {
  color: #8a35e6;
}

.prototype-node--orange {
  color: #ff7a00;
}

.prototype-node--gold {
  color: #f2a400;
}

.reasoning-placeholder__detail {
  display: flex;
  flex-direction: column;
  min-height: 0;
  overflow: hidden;
}

.reasoning-placeholder__detail-scroll {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
}

.reasoning-placeholder__refresh-tip {
  padding: 0 4px;
  color: var(--text-secondary);
  font-size: 12px;
}

.reasoning-placeholder__tabs {
  display: inline-flex;
  padding: 2px;
  border-radius: var(--radius-sm);
  background: var(--surface-subtle);
}

.reasoning-placeholder__tabs button {
  height: 28px;
  padding: 0 var(--space-12);
  border: 0;
  border-radius: var(--radius-sm);
  cursor: pointer;
  color: var(--text-secondary);
  background: transparent;
}

.reasoning-placeholder__tabs .is-active {
  color: var(--primary);
  background: var(--surface);
}

.reasoning-placeholder__detail-table-wrap {
  flex: 1;
  min-height: 0;
  padding: 16px;
  overflow-y: auto;
}

.reasoning-placeholder__table {
  margin: 0;
  overflow: hidden;
}

.reasoning-placeholder__table--merged {
  border: 1px solid var(--border);
  border-radius: var(--radius-md);
  background: var(--surface);
}

.reasoning-placeholder__table div {
  display: grid;
  grid-template-columns: 132px minmax(0, 1fr);
  min-height: 48px;
  border-bottom: 1px solid var(--border);
}

.reasoning-placeholder__table div:last-child {
  border-bottom: 0;
}

.reasoning-placeholder__table dt,
.reasoning-placeholder__table dd {
  display: flex;
  align-items: center;
  margin: 0;
  padding: 10px 16px;
  min-width: 0;
  overflow-wrap: anywhere;
  word-break: break-word;
}

.reasoning-placeholder__table dt {
  justify-content: flex-end;
  border-right: 1px solid var(--border);
  color: var(--text-tertiary);
}

.reasoning-placeholder__table dd {
  flex-wrap: wrap;
  gap: 8px;
  color: var(--text-primary);
}

.reasoning-placeholder__tag {
  display: inline-flex;
  max-width: 100%;
  align-items: center;
  min-height: 24px;
  padding: 0 10px;
  border-radius: var(--radius-sm);
  color: var(--text-secondary);
  background: #f2f4f7;
  line-height: 20px;
}

.industry-chain-detail {
  display: grid;
  gap: 12px;
  padding: 16px;
  overflow-y: auto;
}

.industry-chain-detail__flow {
  display: grid;
  grid-template-columns: 88px minmax(0, 1fr);
  align-items: center;
  min-height: 44px;
  border-top: 1px solid #e4e9f2;
  border-bottom: 1px solid #e4e9f2;
  background: #fff;
}

.industry-chain-detail__flow strong {
  color: #101828;
}

.industry-chain-detail__flow span {
  text-align: center;
  color: #101828;
  font-weight: 700;
}

.industry-chain-detail__relations {
  border: 1px solid #dbe7ff;
  border-radius: 8px;
  background: #fff;
  overflow: hidden;
}

.industry-chain-detail__relations h3 {
  margin: 0;
  padding: 10px 12px;
  color: #101828;
  font-size: 15px;
  border-bottom: 1px solid #e4e9f2;
}

.industry-chain-detail__relation-line {
  padding: 8px 12px;
  color: #344054;
  line-height: 20px;
  border-bottom: 1px solid #e4e9f2;
}

.industry-chain-detail__relation-line:last-child {
  border-bottom: 0;
}

.industry-structured {
  display: grid;
  gap: 10px;
  padding: 0 12px 16px;
  overflow: auto;
}

.industry-structured-card {
  padding: 12px;
  border: 1px solid #dbe7ff;
  border-radius: 12px;
  background: linear-gradient(135deg, #f7fbff 0%, #ffffff 100%);
}

.industry-structured-card h3 {
  margin: 0 0 10px;
  color: #1f4fbf;
  font-size: 15px;
}

.industry-structured-card__row {
  display: grid;
  grid-template-columns: 118px minmax(0, 1fr);
  gap: 8px;
  align-items: start;
  padding: 8px 0;
  border-top: 1px dashed rgba(52, 120, 246, 0.22);
}

.industry-structured-card__row strong {
  color: #344054;
  font-weight: 700;
}

.industry-structured-card__row span,
.industry-structured-card__tags span {
  display: inline-flex;
  width: fit-content;
  margin: 0 6px 6px 0;
  padding: 4px 9px;
  border-radius: 999px;
  color: #2456c7;
  background: #eaf2ff;
  line-height: 18px;
}

.industry-structured-card__tags {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.industry-structured-card--green {
  border-color: #c9efd1;
  background: linear-gradient(135deg, #f2fff4 0%, #ffffff 100%);
}

.industry-structured-card--green h3,
.industry-structured-card--green span {
  color: #168326;
}

.industry-structured-card--green span {
  background: #e8f8ec;
}

.industry-structured-card--purple {
  border-color: #e5d4ff;
  background: linear-gradient(135deg, #fbf7ff 0%, #ffffff 100%);
}

.industry-structured-card--purple h3,
.industry-structured-card--purple span {
  color: #7532d8;
}

.industry-structured-card--purple span {
  background: #f1e8ff;
}

.industry-structured-card--orange {
  border-color: #ffd9b8;
  background: linear-gradient(135deg, #fff8f1 0%, #ffffff 100%);
}

.industry-structured-card--orange h3,
.industry-structured-card--orange span {
  color: #d85c00;
}

.industry-structured-card--orange span {
  background: #fff0df;
}

.industry-structured-card--gold {
  border-color: #f7df90;
  background: linear-gradient(135deg, #fffbed 0%, #ffffff 100%);
}

.industry-structured-card--gold h3,
.industry-structured-card--gold span {
  color: #a86d00;
}

.industry-structured-card--gold span {
  background: #fff4cc;
}

.reasoning-placeholder__code {
  flex: 1;
  min-height: 0;
  margin: 0;
  padding: var(--space-16) 24px;
  overflow: auto;
  color: #2f3442;
  background: #f7f9fc;
  font-family: "SFMono-Regular", Consolas, "Liberation Mono", monospace;
  font-size: 13px;
  line-height: 24px;
  white-space: pre-wrap;
}

:deep(.code-token--key) {
  color: #7c3aed;
}

:deep(.code-token--string) {
  color: #0f8f61;
}

:deep(.code-token--number) {
  color: #d97706;
}

:deep(.code-token--literal) {
  color: #2563eb;
}

:deep(.code-token--keyword) {
  color: #c026d3;
  font-weight: 600;
}

.reasoning-placeholder__developer {
  position: relative;
  display: grid;
  grid-template-rows: 40px minmax(0, 1.35fr) minmax(0, 1fr);
  gap: 12px;
  flex: 1;
  min-height: 0;
  padding: 0 14px 14px;
  overflow: hidden;
}

.reasoning-placeholder__developer::before {
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

.reasoning-placeholder__developer > * {
  position: relative;
  z-index: 1;
}

.reasoning-placeholder__developer-meta {
  display: grid;
  grid-template-columns: 420px 1fr 160px;
  gap: 36px;
  align-items: center;
  min-height: 40px;
  font-size: 14px;
}

.reasoning-placeholder__developer-meta label {
  position: relative;
  display: grid;
  grid-template-columns: max-content minmax(0, 1fr) 14px;
  align-items: center;
  gap: var(--space-8);
}

.reasoning-placeholder__developer-meta input,
.reasoning-placeholder__developer-meta select,
.config-form input,
.config-form select {
  width: 100%;
  height: var(--control-height);
  padding: 0 var(--space-12);
  border: 1px solid var(--border-strong);
  border-radius: var(--radius-sm);
  color: #86909c;
  background: var(--surface);
  font-weight: 400;
}

.reasoning-placeholder__developer-meta select,
.config-form select {
  appearance: none;
  -webkit-appearance: none;
  padding-right: 34px;
  background-image: none;
}

.reasoning-placeholder__developer-cards {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
  min-height: 0;
  padding: 12px 12px 0;
  overflow: hidden;
}

.reasoning-placeholder__developer-cards > .kg-panel,
.reasoning-placeholder__developer-code {
  overflow: hidden;
}

.reasoning-placeholder__table-wrap {
  height: calc(100% - 52px);
  margin: 0 6px var(--space-16);
  overflow: auto;
}

.reasoning-placeholder__developer-table {
  width: 100%;
  table-layout: fixed;
  border-collapse: collapse;
}

.reasoning-placeholder__developer-table th,
.reasoning-placeholder__developer-table td {
  min-height: 34px;
  padding: 8px 12px;
  border-bottom: 1px solid var(--border);
  font-size: 14px;
  line-height: 20px;
  overflow: visible;
  text-align: left;
  vertical-align: top;
  overflow-wrap: anywhere;
  word-break: break-word;
  white-space: normal;
}

.reasoning-placeholder__developer-table thead th {
  position: sticky;
  top: 0;
  z-index: 1;
}

.reasoning-placeholder__developer-table th {
  color: var(--text-secondary);
  background: var(--surface-muted);
  font-weight: 400;
}

.reasoning-placeholder__developer-table th:nth-child(1),
.reasoning-placeholder__developer-table td:nth-child(1) {
  width: 36%;
}

.reasoning-placeholder__developer-table th:nth-child(2),
.reasoning-placeholder__developer-table td:nth-child(2) {
  width: 16%;
}

.reasoning-placeholder__developer-code {
  position: relative;
  display: flex;
  flex-direction: column;
  height: 100%;
  margin: 0 var(--space-16) var(--space-16);
}

.reasoning-placeholder__developer-code pre {
  flex: 1;
  min-height: 0;
  margin: 0;
  padding: var(--space-16) 32px;
  overflow: auto;
  color: #2f3442;
  background: #f7f9fc;
  font-family: "SFMono-Regular", Consolas, "Liberation Mono", monospace;
  font-size: 13px;
  line-height: 24px;
  white-space: pre;
}

.reasoning-placeholder__copy {
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

.reasoning-placeholder__copy img {
  width: 16px;
  height: 16px;
}

.reasoning-placeholder__copy span {
  color: var(--success);
  font-size: 20px;
  font-weight: 600;
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
  display: flex;
  flex-direction: column;
  width: 640px;
  max-height: calc(100vh - 64px);
  overflow: visible;
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
  font-size: 16px;
  font-weight: 500;
}

.modal__header h2 img {
  width: 24px;
  height: 24px;
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

.modal__header button {
  display: grid;
  width: 28px;
  height: 28px;
  place-items: center;
  border: 0;
  cursor: pointer;
  background: transparent;
}

.modal__header button img {
  width: 16px;
  height: 16px;
}

.modal__body {
  padding: var(--space-16);
}

.modal--config .modal__body {
  min-height: 0;
  overflow: visible;
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

.config-form label {
  position: relative;
  display: grid;
  grid-template-columns: 104px 1fr;
  align-items: center;
  gap: var(--space-8);
}

.config-form label span {
  display: inline-flex;
  align-items: center;
  min-width: 0;
  color: #86909c;
  font-weight: 400;
  overflow-wrap: anywhere;
  word-break: break-word;
}

.config-form--panorama label {
  grid-template-columns: 96px minmax(0, 1fr);
}

.config-form--panorama label span {
  align-self: center;
  line-height: 16px;
}

.config-form input::placeholder {
  color: #86909c;
  opacity: 1;
}

.config-form option {
  color: #86909c;
}

.config-form i {
  width: 10px;
}

.config-form .select-icon {
  right: 10px;
}

.combo-field {
  position: relative;
  min-width: 0;
}

.combo-field--dynamic {
  min-width: 180px;
  max-width: 100%;
}

.combo-field input {
  width: 100%;
  padding-right: 38px;
  overflow: hidden;
  text-overflow: ellipsis;
}

.date-field input {
  position: relative;
  padding-right: 44px;
  line-height: var(--control-height);
}

.date-field input::-webkit-calendar-picker-indicator {
  position: absolute;
  top: 50%;
  right: 10px;
  width: 36px;
  height: calc(var(--control-height) - 2px);
  margin: 0;
  padding: 0;
  cursor: pointer;
  background-position: center;
  background-size: 16px 16px;
  transform: translateY(-50%);
}

.combo-field__arrow {
  position: absolute;
  top: 1px;
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
}

.combo-field__arrow img {
  width: 14px;
  height: 14px;
}

.combo-field__menu {
  position: absolute;
  z-index: 1000;
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
  padding: 7px 10px;
  border: 0;
  border-radius: var(--radius-sm);
  color: #86909c;
  cursor: pointer;
  background: transparent;
  line-height: 20px;
  text-align: left;
  white-space: normal;
  overflow-wrap: anywhere;
  word-break: break-word;
}

.combo-field__menu button:hover,
.combo-field__menu button.is-selected {
  color: var(--primary);
  background: rgba(47, 102, 246, 0.08);
}

.calendar-icon {
  right: 10px;
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
  text-align: center;
}

.flow-step img {
  width: 38px;
  height: 38px;
  margin-bottom: var(--space-12);
}

.flow-step strong,
.flow-step span {
  display: block;
}

.flow-step strong {
  margin-bottom: var(--space-12);
}

.flow-step span {
  color: var(--text-secondary);
  line-height: 22px;
}

.flow-step__arrow {
  position: absolute;
  top: 67px;
  width: 14px;
  height: 9px;
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
</style>
