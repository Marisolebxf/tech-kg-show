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

function isDateFieldName(fieldName: string) {
  return /(^|_)(start|end)_?time$/i.test(fieldName) || /^(start|end)Time$/.test(fieldName) || fieldName.includes('Time') || fieldName.includes('_time')
}

function defaultInterfaceIndex(routeName: string) {
  return routeName === 'expert-alumni' ? 1 : 0
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
  relations: Array<{ from: string; to: string; type: string; strength: number; dataFlow: string }>
}

const industryChainForm = reactive({
  chain_code: 'AI',
  chain_name: '人工智能',
  node_id: 'all',
  node_name: '全部环节',
  level: '3',
  relation_type: '全部',
  include_enterprise: 'true',
  include_expert: 'true',
  include_patent: 'true',
  include_product: 'true',
  include_news: 'true',
  limit: '50',
})

const industryChainSeeds: Record<string, IndustryChainSeed> = {
  AI: {
    code: 'AI',
    name: '人工智能',
    path: '人工智能 / 算力基础 / 大模型 / 行业应用',
    links: [
      { id: 'ai-up', name: '上游基础资源', level: 1, technologies: ['数据治理', '算力芯片', '向量数据库'], enterprises: ['寒武纪', '阿里云', '华为昇腾'], experts: ['李佳宁', '张明远'], products: ['训练数据集', 'AI服务器'], patents: 18, news: ['智算中心扩容', '国产算力适配'] },
      { id: 'ai-core', name: '中游核心技术', level: 2, technologies: ['知识图谱', '机器学习', '大模型'], enterprises: ['百度智能云', '智谱AI', '商汤科技'], experts: ['周欣怡', '王启航'], products: ['大模型平台', '图谱推理引擎'], patents: 26, news: ['多模态模型升级', '产业合作发布'] },
      { id: 'ai-down', name: '下游应用场景', level: 3, technologies: ['智能制造', '智慧医疗', '自动驾驶'], enterprises: ['科大讯飞', '旷视科技', '中科创达'], experts: ['陈思远', '赵清宁'], products: ['工业质检系统', '智能问诊助手'], patents: 14, news: ['行业大模型落地', '场景应用示范'] },
    ],
    relations: [
      { from: '上游基础资源', to: '中游核心技术', type: '算力与数据供给', strength: 94, dataFlow: '数据集 / 算力指标 / 模型训练日志' },
      { from: '中游核心技术', to: '下游应用场景', type: '模型能力输出', strength: 91, dataFlow: 'API服务 / 推理结果 / 行业知识库' },
      { from: '下游应用场景', to: '中游核心技术', type: '场景反馈', strength: 82, dataFlow: '用户行为 / 质检样本 / 效果评估' },
    ],
  },
  ROBOT: {
    code: 'ROBOT',
    name: '机器人',
    path: '机器人 / 关键零部件 / 控制系统 / 场景应用',
    links: [
      { id: 'robot-up', name: '上游关键零部件', level: 1, technologies: ['传感器', '伺服电机', '减速器'], enterprises: ['汇川技术', '绿的谐波', '奥比中光'], experts: ['陈建国', '韩思远'], products: ['六维力传感器', '高精度减速器'], patents: 21, news: ['核心零部件国产化', '高精度传感升级'] },
      { id: 'robot-core', name: '中游控制系统', level: 2, technologies: ['运动控制', '具身智能', '多模态感知'], enterprises: ['优必选', '傅利叶智能', '节卡机器人'], experts: ['刘芳', '王启航'], products: ['机器人控制器', '灵巧手系统'], patents: 29, news: ['灵巧手控制突破', '具身智能平台发布'] },
      { id: 'robot-down', name: '下游工业场景', level: 3, technologies: ['工业巡检', '康复医疗', '物流分拣'], enterprises: ['新松机器人', '极智嘉', '达闼机器人'], experts: ['赵清宁', '林远航'], products: ['巡检机器人', '协作机械臂'], patents: 16, news: ['工厂试点扩容', '康复机器人入院'] },
    ],
    relations: [
      { from: '上游关键零部件', to: '中游控制系统', type: '硬件供给', strength: 92, dataFlow: '传感数据 / 控制参数 / 零部件指标' },
      { from: '中游控制系统', to: '下游工业场景', type: '系统集成', strength: 89, dataFlow: '控制指令 / 运动轨迹 / 任务日志' },
      { from: '下游工业场景', to: '中游控制系统', type: '运行反馈', strength: 80, dataFlow: '故障记录 / 环境样本 / 作业效率' },
    ],
  },
  BIO: {
    code: 'BIO',
    name: '生物医药',
    path: '生物医药 / 靶点发现 / 临床前评价 / 产业转化',
    links: [
      { id: 'bio-up', name: '上游实验资源', level: 1, technologies: ['多组学数据', '高通量筛选', '实验动物模型'], enterprises: ['华大智造', '药明康德', '金域医学'], experts: ['周子谦', '何嘉禾'], products: ['组学数据库', '筛选试剂盒'], patents: 17, news: ['多组学平台升级', '样本库扩容'] },
      { id: 'bio-core', name: '中游靶点发现', level: 2, technologies: ['药物筛选', 'AI制药', '靶点验证'], enterprises: ['晶泰科技', '英矽智能', '百图生科'], experts: ['吴若彤', '林远航'], products: ['AI筛选平台', '候选化合物库'], patents: 24, news: ['靶点验证突破', '候选药物推进'] },
      { id: 'bio-down', name: '下游临床转化', level: 3, technologies: ['临床前评价', '药物递送', '伴随诊断'], enterprises: ['恒瑞医药', '君实生物', '复星医药'], experts: ['顾雨辰', '陈思远'], products: ['临床评价方案', '递送载体'], patents: 13, news: ['转化平台升级', '联合临床研究'] },
    ],
    relations: [
      { from: '上游实验资源', to: '中游靶点发现', type: '实验数据供给', strength: 90, dataFlow: '组学数据 / 样本标签 / 筛选结果' },
      { from: '中游靶点发现', to: '下游临床转化', type: '候选方案输出', strength: 87, dataFlow: '候选靶点 / 化合物结构 / 安全性报告' },
      { from: '下游临床转化', to: '中游靶点发现', type: '临床反馈', strength: 78, dataFlow: '疗效指标 / 不良反应 / 入组特征' },
    ],
  },
  QUANTUM: {
    code: 'QUANTUM',
    name: '量子信息',
    path: '量子信息 / 低温设备 / 量子计算 / 安全通信',
    links: [
      { id: 'quantum-up', name: '上游低温设备', level: 1, technologies: ['稀释制冷', '低噪声测控', '超导材料'], enterprises: ['国盾量子', '中船鹏力', '中科酷原'], experts: ['韩思远', '李明哲'], products: ['低温制冷机', '量子测控线缆'], patents: 12, news: ['低温设备国产替代', '测控链路优化'] },
      { id: 'quantum-core', name: '中游量子计算', level: 2, technologies: ['量子芯片', '量子算法', '量子纠错'], enterprises: ['本源量子', '玻色量子', '量旋科技'], experts: ['张明远', '王启航'], products: ['量子计算云平台', '超导量子芯片'], patents: 20, news: ['量子芯片突破', '云平台开放'] },
      { id: 'quantum-down', name: '下游安全通信', level: 3, technologies: ['量子密钥分发', '量子传感', '量子测量'], enterprises: ['科大国盾', '问天量子', '华为云'], experts: ['周欣怡', '赵清宁'], products: ['量子保密通信终端', '量子传感器'], patents: 11, news: ['城域网应用示范', '传感场景验证'] },
    ],
    relations: [
      { from: '上游低温设备', to: '中游量子计算', type: '设备支撑', strength: 88, dataFlow: '低温参数 / 噪声指标 / 芯片测试数据' },
      { from: '中游量子计算', to: '下游安全通信', type: '能力转化', strength: 84, dataFlow: '算法服务 / 密钥分发策略 / 测量结果' },
      { from: '下游安全通信', to: '中游量子计算', type: '应用反馈', strength: 76, dataFlow: '链路稳定性 / 误码率 / 场景需求' },
    ],
  },
}

const industryChainOptions = computed(() => {
  const chainCodes = Object.keys(industryChainSeeds)
  const seed = industryChainSeeds[industryChainForm.chain_code] ?? industryChainSeeds.AI
  return {
    chain_code: chainCodes,
    chain_name: chainCodes.map((code) => industryChainSeeds[code].name),
    node_id: ['all', ...seed.links.map((link) => link.id)],
    node_name: ['全部环节', ...seed.links.map((link) => link.name)],
    level: ['1', '2', '3'],
    relation_type: ['全部', '上下游关系', '应用反馈'],
    include_enterprise: ['true', 'false'],
    include_expert: ['true', 'false'],
    include_patent: ['true', 'false'],
    include_product: ['true', 'false'],
    include_news: ['true', 'false'],
    limit: ['20', '50', '100'],
  }
})

const industryChainNameToCode = computed(() => Object.fromEntries(Object.values(industryChainSeeds).map((seed) => [seed.name, seed.code])))

type IndustryEventItem = {
  id: string
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
  industryChainNode: '上游原材料',
  eventTypes: '全部',
  topN: '5',
  evaluationModel: 'multi_factor',
  startTime: '2020-01-01',
  endTime: '2024-12-31',
})

const industryEventOptions = {
  industryChainNode: ['上游原材料', '中游核心技术', '下游应用场景', '关键零部件', '产业转化节点'],
  eventTypes: ['全部', 'patent', 'paper', 'fund', 'project', 'policy', 'product'],
  topN: ['3', '5', '10', '20'],
  evaluationModel: ['multi_factor', 'expert_enterprise_influence', 'industry_chain_impact', 'growth_trend'],
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

const industryEventModelNames: Record<string, string> = {
  multi_factor: '多因子综合评估',
  expert_enterprise_influence: '专家企业影响力评估',
  industry_chain_impact: '产业链影响评估',
  growth_trend: '成长趋势评估',
}

function formatIndustryEventType(value: string) {
  return industryEventTypeNames[value] ?? value
}

function formatIndustryEventModel(value: string) {
  return industryEventModelNames[value] ?? value
}

const industryEventItems: IndustryEventItem[] = [
  { id: 'evt-mat-01', industryChainNode: '上游原材料', eventType: 'patent', title: '高纯前驱体材料制备专利授权', eventTime: '2024-06-15', score: 96.2, expert: '陈建国', talentRole: '首席科学顾问', enterprise: '华材科技', enterpriseRole: '联合研发单位', cooperationField: '高纯材料制备', cooperationTime: '2022-03 至 2024-06', cooperationMode: '联合实验室 + 专利共研', industryStatus: '细分材料国产替代龙头', techDirection: '高纯前驱体与材料缺陷控制', businessStatus: '订单增长，产线扩建中', impact: '提升上游材料自给率，降低中游制造成本', trend: '进入中试放大与客户验证阶段' },
  { id: 'evt-mat-02', industryChainNode: '上游原材料', eventType: 'fund', title: '战略融资投向低碳原材料产线', eventTime: '2024-03-20', score: 89.4, expert: '李佳宁', talentRole: '技术尽调专家', enterprise: '源材新能', enterpriseRole: '产业化主体', cooperationField: '低碳原材料', cooperationTime: '2023-01 至 2024-03', cooperationMode: '技术评估 + 产线规划', industryStatus: '区域供应链核心企业', techDirection: '低碳合成与质量追溯', businessStatus: '融资完成，新增产能建设', impact: '增强上游供给稳定性', trend: '与中游头部企业签订长协' },
  { id: 'evt-mat-03', industryChainNode: '上游原材料', eventType: 'paper', title: '材料缺陷预测模型论文发表', eventTime: '2023-11-08', score: 85.7, expert: '周欣怡', talentRole: '通讯作者', enterprise: '华材科技', enterpriseRole: '数据合作方', cooperationField: '材料计算与质量检测', cooperationTime: '2021-09 至 2023-11', cooperationMode: '企业数据 + 高校建模', industryStatus: '质量检测数据优势企业', techDirection: 'AI 材料表征', businessStatus: '检测服务收入提升', impact: '缩短材料研发迭代周期', trend: '模型将嵌入在线质检系统' },
  { id: 'evt-core-01', industryChainNode: '中游核心技术', eventType: 'project', title: '图谱推理引擎联合攻关项目验收', eventTime: '2024-09-18', score: 95.1, expert: '张明远', talentRole: '项目负责人', enterprise: '智谱云图', enterpriseRole: '平台共建企业', cooperationField: '知识图谱推理', cooperationTime: '2022-06 至 2024-09', cooperationMode: '联合课题组 + 平台共建', industryStatus: '知识智能平台头部企业', techDirection: '大规模图谱推理与模型融合', businessStatus: '客户数持续增长，经营稳健', impact: '强化中游技术供给能力，带动应用侧适配', trend: '向行业专用模型和实时推理扩展' },
  { id: 'evt-core-02', industryChainNode: '中游核心技术', eventType: 'product', title: '行业大模型平台发布', eventTime: '2024-05-12', score: 91.6, expert: '王启航', talentRole: '架构顾问', enterprise: '百度智能云', enterpriseRole: '产品发布主体', cooperationField: '行业大模型与图谱增强', cooperationTime: '2023-02 至 2024-05', cooperationMode: '顾问咨询 + 场景验证', industryStatus: '云与 AI 平台领先企业', techDirection: '多模态大模型与知识增强', businessStatus: '云业务稳步增长', impact: '提升下游应用开发效率', trend: '扩大制造、医疗、政务场景落地' },
  { id: 'evt-core-03', industryChainNode: '中游核心技术', eventType: 'patent', title: '图谱向量混合检索专利公开', eventTime: '2023-12-22', score: 87.9, expert: '李明哲', talentRole: '联合发明人', enterprise: '智谱云图', enterpriseRole: '专利申请人', cooperationField: '混合检索', cooperationTime: '2022-10 至 2023-12', cooperationMode: '联合发明 + 工程验证', industryStatus: '创新型平台企业', techDirection: '向量检索与符号推理融合', businessStatus: '研发投入加大', impact: '提升图谱查询召回与解释能力', trend: '形成可复用底层组件' },
  { id: 'evt-down-01', industryChainNode: '下游应用场景', eventType: 'policy', title: '智能制造场景应用示范入选', eventTime: '2024-07-05', score: 90.8, expert: '陈思远', talentRole: '评审专家', enterprise: '科大讯飞', enterpriseRole: '示范应用单位', cooperationField: '工业质检与知识问答', cooperationTime: '2023-04 至 2024-07', cooperationMode: '专家评审 + 场景试点', industryStatus: '智能语音与行业 AI 领军企业', techDirection: '工业质检大模型', businessStatus: '行业解决方案放量', impact: '拉动下游应用生态建设', trend: '复制到更多离散制造场景' },
  { id: 'evt-down-02', industryChainNode: '下游应用场景', eventType: 'product', title: '智能问诊助手完成多院部署', eventTime: '2024-02-28', score: 86.5, expert: '赵清宁', talentRole: '临床转化顾问', enterprise: '医智云', enterpriseRole: '应用落地主体', cooperationField: '智慧医疗应用', cooperationTime: '2022-12 至 2024-02', cooperationMode: '医工协同 + 试点部署', industryStatus: '医疗 AI 成长型企业', techDirection: '医学知识图谱与问诊大模型', businessStatus: '试点医院增加，收入爬坡', impact: '验证下游商业化路径', trend: '推进医保控费和专科助手场景' },
  { id: 'evt-part-01', industryChainNode: '关键零部件', eventType: 'project', title: '高精度传感器国产化项目启动', eventTime: '2024-04-10', score: 92.3, expert: '韩思远', talentRole: '技术负责人', enterprise: '奥比中光', enterpriseRole: '核心零部件企业', cooperationField: '三维视觉传感', cooperationTime: '2023-08 至 2024-04', cooperationMode: '联合攻关 + 样机验证', industryStatus: '视觉传感器重点企业', techDirection: '高精度三维感知', businessStatus: '新产品导入客户验证', impact: '补强关键零部件短板', trend: '向机器人和低空设备延伸' },
  { id: 'evt-transfer-01', industryChainNode: '产业转化节点', eventType: 'fund', title: '成果转化基金支持联合实验室', eventTime: '2024-08-16', score: 88.2, expert: '林远航', talentRole: '转化顾问', enterprise: '启明生物科技', enterpriseRole: '成果承接企业', cooperationField: 'AI 制药转化', cooperationTime: '2023-05 至 2024-08', cooperationMode: '基金支持 + 企业孵化', industryStatus: '生物医药创新企业', techDirection: '靶点发现与候选药物筛选', businessStatus: '研发管线推进，现金流充足', impact: '加速科研成果从实验室走向产业', trend: '进入临床前评价和商务合作阶段' },
]

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
  dataSource: 'knowledge_graph',
  expertAId: 'E10001',
  expertBId: 'E10002',
  achievementTypes: '全部',
  startTime: '2020-01-01',
  endTime: '2025-12-31',
})

const achievementOptions = {
  dataSource: ['all', 'knowledge_graph', 'mysql'],
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
const isIndustryChainEventModule = computed(() => String(route.name ?? '') === 'industry-chain-event')
const isIndustryChainPanoramaModule = computed(() => String(route.name ?? '') === 'industry-chain-panorama' || currentInterface.value.endpoint === '/api/industry-chain/panorama/infer')
const title = computed(() => moduleInfo.value.title || String(route.meta.title ?? '知识推理模块'))
const baseInterface = computed(() => moduleInfo.value.interfaces[activeInterfaceIndex.value] ?? moduleInfo.value.interfaces[0])
const sampleScenarios = computed(() => buildSampleScenarios(String(route.name ?? ''), baseInterface.value.name))
const activeScenario = computed(() => sampleScenarios.value[activeSampleIndex.value] ?? sampleScenarios.value[0])
const currentInterface = computed(() => applyScenario(baseInterface.value, activeScenario.value.replacements))
const isIndustryChainEventScreenInterface = computed(() => isIndustryChainEventModule.value && activeInterfaceIndex.value === 0)
const requestJson = computed(() => JSON.stringify(currentInterface.value.requestExample, null, 2))
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
  if (isAchievementModule.value) return achievementErrorMessage.value
  if (isIndirectModule.value) return indirectErrorMessage.value
  return ''
})
const industryEventFilteredItems = computed(() => {
  const topN = Number(industryEventForm.topN) || 5
  return industryEventItems
    .filter((item) => item.industryChainNode === industryEventForm.industryChainNode)
    .filter((item) => industryEventForm.eventTypes === '全部' || item.eventType === industryEventForm.eventTypes)
    .filter((item) => item.eventTime >= industryEventForm.startTime && item.eventTime <= industryEventForm.endTime)
    .sort((a, b) => b.score - a.score)
    .slice(0, topN)
})
const industryEventDetailRows = computed<Array<[string, string | string[]]>>(() => {
  const items = industryEventFilteredItems.value
  const primary = items[0]
  if (!primary) {
    return [
      ['产业链节点', industryEventForm.industryChainNode],
      ['事件类型', formatIndustryEventType(industryEventForm.eventTypes)],
      ['时间范围', `${industryEventForm.startTime} 至 ${industryEventForm.endTime}`],
      ['结果状态', '当前参数下暂无匹配事件'],
    ]
  }

  return [
    ['产业链节点', industryEventForm.industryChainNode],
    ['事件类型', industryEventForm.eventTypes === '全部' ? '专利事件、论文事件、基金事件' : formatIndustryEventType(industryEventForm.eventTypes)],
    ['时间范围', `${industryEventForm.startTime} 至 ${industryEventForm.endTime}`],
    ['评估模型', formatIndustryEventModel(industryEventForm.evaluationModel)],
    ['TOP-N核心事件', items.map((item, index) => `TOP${index + 1}：${item.title}｜${formatIndustryEventType(item.eventType)}｜影响力评分 ${item.score.toFixed(1)}`)],
    ['评分因素', '引用次数、事件级别、时效性、产业链相关度'],
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
    .filter((item) => item.strength >= minStrength)
    .filter((item) => item.pathDepth <= pathDepth)
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
  const items = indirectItems.value.slice(0, 3)
  if (!expert || !items.length) return { nodes: [], edges: [] }

  const slots = [
    { x: 470, y: 60, tone: 'green' as const },
    { x: 470, y: 232, tone: 'orange' as const },
    { x: 470, y: 404, tone: 'gold' as const },
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
    const y = [103, 275, 447][index]
    const labelY = [86, 258, 430][index]
    const tone = ['green', 'orange', 'gold'][index] as 'green' | 'orange' | 'gold'
    return {
      id: item.key,
      path: `M294 267 C360 ${y}, 408 ${y}, 470 ${y}`,
      label: item.relationType,
      labelX: 386,
      labelY,
      tone,
      dashed: index > 0,
    }
  })

  return {
    nodes,
    edges,
  }
})
const activeGraph = computed(() => {
  if (isIndustryChainEventScreenInterface.value) return industryEventGraph.value
  if (isIndustryChainPanoramaModule.value) return industryChainGraph.value
  if (isAchievementModule.value) return achievementGraph.value
  if (isIndirectModule.value) return indirectGraph.value
  return currentInterface.value.graph
})
const activeDetailRows = computed(() => {
  if (isIndustryChainEventScreenInterface.value) return industryEventDetailRows.value
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
    isIndustryChainEventScreenInterface.value
      ? industryEventResponseExample.value
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
      { name: 'industryChainNode', type: 'string', required: '是', description: '产业链节点名称，可选上游原材料、中游核心技术等' },
      { name: 'eventTypes', type: 'array[string]', required: '否', description: '事件类型：patent、paper、fund、project、policy、product' },
      { name: 'topN', type: 'number', required: '否', description: '返回影响力排名前 N 的核心事件' },
      { name: 'evaluationModel', type: 'string', required: '否', description: '事件影响力评估模型' },
      { name: 'startTime', type: 'string', required: '否', description: '开始时间，格式 YYYY-MM-DD' },
      { name: 'endTime', type: 'string', required: '否', description: '结束时间，格式 YYYY-MM-DD' },
    ]
  }
  if (isIndustryChainPanoramaModule.value) {
    return [
      { name: 'chain_code', type: 'string', required: '是', description: '产业链代码，可选：AI、ROBOT、BIO、QUANTUM' },
      { name: 'chain_name', type: 'string', required: '是', description: '产业链名称，与 chain_code 联动' },
      { name: 'node_id', type: 'string', required: '否', description: '产业链环节 ID，支持 all 或具体环节' },
      { name: 'node_name', type: 'string', required: '否', description: '环节名称，支持全部环节或具体环节' },
      { name: 'level', type: 'number', required: '否', description: '层级展开深度：1 上游、2 中游、3 全链路' },
      { name: 'relation_type', type: 'string', required: '否', description: '关系筛选类型' },
      { name: 'include_enterprise', type: 'boolean', required: '否', description: '是否返回重点企业' },
      { name: 'include_expert', type: 'boolean', required: '否', description: '是否返回核心专家' },
      { name: 'include_patent', type: 'boolean', required: '否', description: '是否返回关联专利统计' },
      { name: 'include_product', type: 'boolean', required: '否', description: '是否返回核心产品' },
      { name: 'include_news', type: 'boolean', required: '否', description: '是否返回动态事件' },
      { name: 'limit', type: 'number', required: '否', description: '返回条数限制' },
    ]
  }
  if (isAchievementModule.value) {
    return [
      { name: 'dataSource', type: 'string', required: '是', description: '数据来源，可选值：all、knowledge_graph、mysql' },
      { name: 'expertAId', type: 'string', required: '是', description: '专家A唯一标识' },
      { name: 'expertBId', type: 'string', required: '是', description: '专家B唯一标识' },
      { name: 'achievementTypes', type: 'array[string]', required: '否', description: '成果类型过滤，可选值：paper、project、patent' },
      { name: 'startTime', type: 'string', required: '否', description: '统计开始时间，格式 YYYY-MM-DD' },
      { name: 'endTime', type: 'string', required: '否', description: '统计结束时间，格式 YYYY-MM-DD' },
    ]
  }
  return currentInterface.value.requestFields
})
function uniqueValues(values: string[][]) {
  return Array.from(new Set(values.flat()))
}

const industryChainSeed = computed(() => industryChainSeeds[industryChainForm.chain_code] ?? industryChainSeeds.AI)
const industryChainVisibleLinks = computed(() => {
  const level = Number(industryChainForm.level) || 3
  const seed = industryChainSeed.value
  return seed.links
    .filter((link) => link.level <= level)
    .filter((link) => industryChainForm.node_id === 'all' || link.id === industryChainForm.node_id)
    .filter((link) => industryChainForm.node_name === '全部环节' || link.name === industryChainForm.node_name)
})
const industryChainVisibleRelations = computed(() => {
  const names = new Set(industryChainVisibleLinks.value.map((link) => link.name))
  return industryChainSeed.value.relations
    .filter((relation) => names.has(relation.from) && names.has(relation.to))
    .filter((relation) => industryChainForm.relation_type === '全部' || relation.type === industryChainForm.relation_type)
})
const industryChainDetailRows = computed<Array<[string, string | string[]]>>(() => {
  const seed = industryChainSeed.value
  const links = industryChainVisibleLinks.value
  const relations = industryChainVisibleRelations.value
  const nodePath = [seed.name, ...links.map((link) => link.name)].join(' / ')
  const patentCount = links.reduce((sum, link) => sum + link.patents, 0)
  const products = uniqueValues(links.map((link) => link.products))
  const statistics = [
    `节点数量：${links.length}`,
    `关系数量：${relations.length || '若干'}`,
    `企业数量：${industryChainForm.include_enterprise === 'true' ? uniqueValues(links.map((link) => link.enterprises)).length : '若干'}`,
    `专家数量：${industryChainForm.include_expert === 'true' ? uniqueValues(links.map((link) => link.experts)).length : '若干'}`,
    `专利数量：${industryChainForm.include_patent === 'true' ? patentCount : '若干'}`,
    `产品数量：${industryChainForm.include_product === 'true' ? products.length : '若干'}`,
    `动态资讯数量：${industryChainForm.include_news === 'true' ? uniqueValues(links.map((link) => link.news)).length : '若干'}`,
  ]
  return [
    ['产业链', seed.name],
    ['核心节点', links.map((link) => `${link.name}｜L${link.level}`)],
    ['节点层级', nodePath],
    ['上下游关系', relations.length ? relations.map((relation) => `${relation.from} → ${relation.to}`) : ['当前筛选仅展示单环节']],
    ['数据流向', relations.length ? relations.map((relation) => `${relation.dataFlow}由${relation.from}流向${relation.to}`) : ['当前筛选暂无上下游数据流向']],
    ['关键技术', uniqueValues(links.map((link) => link.technologies))],
    ['重点企业', industryChainForm.include_enterprise === 'true' ? uniqueValues(links.map((link) => link.enterprises)) : '未返回重点企业'],
    ['核心专家', industryChainForm.include_expert === 'true' ? uniqueValues(links.map((link) => link.experts)) : '未返回核心专家'],
    ['专利产品', industryChainForm.include_patent === 'true' || industryChainForm.include_product === 'true' ? [`专利 ${industryChainForm.include_patent === 'true' ? patentCount : '若干'} 件`, `代表产品包括${industryChainForm.include_product === 'true' ? products.join('、') : '若干产品'}。`] : '未返回专利产品'],
    ['动态资讯/事件', industryChainForm.include_news === 'true' ? uniqueValues(links.map((link) => link.news)) : '未返回动态资讯'],
    ['运行态势', '上游资源持续增强，中游技术持续迭代，下游应用场景扩展。'],
    ['发展机遇', '智能制造、智慧医疗、自动驾驶等应用场景具备产业化发展机会。'],
    ['统计信息', statistics],
  ]
})
const industryChainGraph = computed(() => {
  const links = industryChainVisibleLinks.value
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

  if (industryChainForm.include_enterprise === 'true') nodes.push({ id: 'ent', x: 46, y: 36, w: 250, h: 118, title: '重点企业', subtitle: '企业分布', tone: 'blue', chips: uniqueValues(links.map((link) => link.enterprises)).slice(0, 4) })
  if (industryChainForm.include_expert === 'true') nodes.push({ id: 'expert', x: 604, y: 36, w: 250, h: 118, title: '核心专家', subtitle: '技术职称', tone: 'purple', chips: uniqueValues(links.map((link) => link.experts)).slice(0, 4) })
  if (industryChainForm.include_news === 'true') nodes.push({ id: 'update', x: 46, y: 420, w: 250, h: 118, title: '动态资讯变化', subtitle: '事件/资讯', tone: 'orange', chips: uniqueValues(links.map((link) => link.news)).slice(0, 4) })
  if (industryChainForm.include_product === 'true' || industryChainForm.include_patent === 'true') {
    const productChips = industryChainForm.include_product === 'true' ? uniqueValues(links.map((link) => link.products)).slice(0, 3) : []
    const patentCount = links.reduce((sum, link) => sum + link.patents, 0)
    nodes.push({ id: 'asset', x: 604, y: 420, w: 250, h: 118, title: '专利产品覆盖', subtitle: '成果沉淀', tone: 'gold', chips: [...productChips, ...(industryChainForm.include_patent === 'true' ? [`专利${patentCount}`] : [])].slice(0, 4) })
  }

  const edges: PrototypeEdge[] = []
  industryChainVisibleRelations.value.forEach((relation, index) => {
    const fromIndex = links.findIndex((link) => link.name === relation.from)
    const toIndex = links.findIndex((link) => link.name === relation.to)
    if (fromIndex < 0 || toIndex < 0) return

    if (relation.type.includes('反馈')) {
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
      label: relation.type,
      labelX: (fromX + toX) / 2,
      labelY: 252,
      tone: 'purple',
    })
  })
  const centerNode = nodes.find((node) => node.id === links[Math.min(1, links.length - 1)]?.id) ?? nodes[0]
  const centerX = centerNode.x + centerNode.w / 2
  if (nodes.some((node) => node.id === 'ent')) edges.push({ id: 'ent-core', path: `M296 95 C374 120 ${centerX - 96} 178 ${centerX - 34} 226`, label: '企业布局', labelX: 340, labelY: 146, tone: 'blue' })
  if (nodes.some((node) => node.id === 'expert')) edges.push({ id: 'expert-core', path: `M604 95 C526 120 ${centerX + 96} 178 ${centerX + 34} 226`, label: '专家支撑', labelX: 560, labelY: 146, tone: 'purple' })
  if (nodes.some((node) => node.id === 'update')) edges.push({ id: 'update-core', path: `M296 472 C360 448 ${centerX - 88} 390 ${centerX - 42} 352`, label: '动态更新', labelX: 340, labelY: 405, tone: 'orange', dashed: true })
  if (nodes.some((node) => node.id === 'asset')) edges.push({ id: 'core-asset', path: `M${centerX + 42} 352 C${centerX + 88} 390 540 448 604 472`, label: '专利产品', labelX: 560, labelY: 405, tone: 'gold' })
  return { nodes, edges }
})
const industryChainResponseExample = computed(() => {
  const seed = industryChainSeed.value
  const links = industryChainVisibleLinks.value
  const relations = industryChainVisibleRelations.value
  return {
    code: 0,
    message: 'success',
    data: {
      chain: { chain_code: seed.code, chain_name: seed.name, chain_path: seed.path, node_total: links.length, relation_total: relations.length },
      coreNodes: links.map((link) => ({ node_id: link.id, node_name: link.name, level: link.level, key_technologies: link.technologies, enterprises: industryChainForm.include_enterprise === 'true' ? link.enterprises : [], experts: industryChainForm.include_expert === 'true' ? link.experts : [], products: industryChainForm.include_product === 'true' ? link.products : [], patent_count: industryChainForm.include_patent === 'true' ? link.patents : 0, dynamic_updates: industryChainForm.include_news === 'true' ? link.news : [] })),
      relations: relations.map((relation) => ({ source: relation.from, target: relation.to, relation_type: relation.type, relation_strength: relation.strength, data_flow: relation.dataFlow })),
      data_flow: relations.map((relation) => ({ from: relation.from, to: relation.to, flow: relation.dataFlow })),
      key_technologies: uniqueValues(links.map((link) => link.technologies)),
      keyTechnologies: uniqueValues(links.map((link) => link.technologies)),
      enterprises: industryChainForm.include_enterprise === 'true' ? uniqueValues(links.map((link) => link.enterprises)) : [],
      experts: industryChainForm.include_expert === 'true' ? uniqueValues(links.map((link) => link.experts)) : [],
      products: industryChainForm.include_product === 'true' ? uniqueValues(links.map((link) => link.products)) : [],
      patents: industryChainForm.include_patent === 'true' ? links.reduce((sum, link) => sum + link.patents, 0) : 0,
      dynamicUpdates: industryChainForm.include_news === 'true' ? uniqueValues(links.map((link) => link.news)) : [],
      interaction: { hierarchyExpandLevel: Number(industryChainForm.level), relationFilter: relations.map((relation) => relation.type), dynamicUpdateEnabled: industryChainForm.include_news === 'true' },
    },
  }
})

const industryEventGraph = computed(() => {
  const items = industryEventFilteredItems.value.slice(0, 4)
  if (!items.length) {
    return {
      nodes: [
        { id: 'chain-node', x: 320, y: 230, w: 250, h: 104, title: industryEventForm.industryChainNode, subtitle: '暂无匹配事件', tone: 'orange' as const },
      ],
      edges: [],
    }
  }

  const topTitles = items.map((item, index) => `TOP${index + 1} ${item.title}`)
  const experts = Array.from(new Set(items.map((item) => item.expert)))
  const enterprises = Array.from(new Set(items.map((item) => item.enterprise)))
  const fields = Array.from(new Set(items.map((item) => item.cooperationField)))
  const trends = Array.from(new Set(items.map((item) => item.trend)))
  const nodes: PrototypeNode[] = [
    { id: 'chain-node', x: 328, y: 232, w: 244, h: 116, title: industryEventForm.industryChainNode, subtitle: `TOP${items.length} 核心事件`, tone: 'purple', chips: fields.slice(0, 4) },
    { id: 'events', x: 60, y: 72, w: 262, h: 128, title: '影响力核心事件', subtitle: formatIndustryEventModel(industryEventForm.evaluationModel), tone: 'orange', chips: topTitles.slice(0, 4) },
    { id: 'experts', x: 610, y: 72, w: 250, h: 128, title: '科技专家或人才', subtitle: '节点关联人才', tone: 'green', chips: experts.slice(0, 4) },
    { id: 'enterprise', x: 610, y: 376, w: 250, h: 128, title: '重点科技企业', subtitle: '角色/合作/经营状况', tone: 'blue', chips: enterprises.slice(0, 4) },
    { id: 'trend', x: 60, y: 376, w: 262, h: 128, title: '影响与后续趋势', subtitle: '产业链节点分析', tone: 'gold', chips: trends.slice(0, 4) },
  ]
  const edges: PrototypeEdge[] = [
    { id: 'events-node', path: 'M322 136 C384 162 384 220 328 264', label: '事件归属节点', labelX: 382, labelY: 188, tone: 'orange' },
    { id: 'node-experts', path: 'M572 264 C640 228 688 200 735 200', label: '节点关联人才', labelX: 668, labelY: 220, tone: 'green' },
    { id: 'node-enterprise', path: 'M572 294 C648 314 706 344 735 376', label: '节点涉及企业', labelX: 668, labelY: 332, tone: 'blue' },
    { id: 'node-trend', path: 'M328 318 C252 338 198 356 164 376', label: '影响及趋势', labelX: 250, labelY: 352, tone: 'gold', dashed: true },
  ]
  return { nodes, edges }
})

const industryEventResponseExample = computed(() => {
  const items = industryEventFilteredItems.value
  return {
    code: 200,
    success: true,
    data: {
      industryChainNode: industryEventForm.industryChainNode,
      eventTypes: industryEventForm.eventTypes === '全部' ? ['patent', 'paper', 'fund'] : [industryEventForm.eventTypes],
      timeRange: { startTime: industryEventForm.startTime, endTime: industryEventForm.endTime },
      evaluationModel: industryEventForm.evaluationModel,
      total: items.length,
      events: items.map((item, index) => ({
        eventId: item.id,
        rank: index + 1,
        eventType: item.eventType,
        eventTypeName: industryEventTypeNames[item.eventType] ?? item.eventType,
        title: item.title,
        eventTime: item.eventTime,
        score: item.score,
        impactFactors: ['引用次数', '事件级别', '时效性', '产业链相关度'],
      })),
    },
    message: 'success',
  }
})

const activeResponseFields = computed(() => {
  if (isIndustryChainEventScreenInterface.value) {
    return [
      { name: 'industryChainNode', type: 'string', description: '产业链节点名称' },
      { name: 'eventTypes', type: 'array[string]', description: '事件类型' },
      { name: 'timeRange', type: 'object', description: '时间范围' },
      { name: 'evaluationModel', type: 'string', description: '事件影响力评估模型' },
      { name: 'total', type: 'number', description: '本次返回 TOP-N 事件数量' },
      { name: 'events', type: 'array[object]', description: '影响力排名前 N 的核心事件' },
      { name: 'events[].score', type: 'number', description: '影响力评分' },
      { name: 'events[].impactFactors', type: 'array[string]', description: '评分因素' },
    ]
  }
  if (isIndustryChainPanoramaModule.value) {
    return [
      { name: 'chain', type: 'object', description: '产业链基础信息、路径与统计' },
      { name: 'coreNodes', type: 'array[object]', description: '各环节核心节点、层级与展开状态' },
      { name: 'relations', type: 'array[object]', description: '上下游关联关系' },
      { name: 'data_flow', type: 'array[object]', description: '数据流向' },
      { name: 'key_technologies', type: 'array[string]', description: '关键技术清单' },
      { name: 'enterprises', type: 'array[string]', description: '重点企业清单' },
      { name: 'experts', type: 'array[string]', description: '核心专家清单' },
      { name: 'dynamicUpdates', type: 'array[string]', description: '动态事件与更新内容' },
      { name: 'interaction', type: 'object', description: '层级展开、关系筛选与动态更新状态' },
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
const requestFieldValues = (fieldName: string) =>
  Array.from(new Set(sampleScenarios.value.map((sample) => {
    const scenarioInterface = applyScenario(baseInterface.value, sample.replacements)
    const value = scenarioInterface.requestExample[fieldName]
    if (Array.isArray(value)) return value.join('、')
    if (value && typeof value === 'object') return JSON.stringify(value)
    return String(value ?? '')
  })))

const displayParamValue = (fieldName: string, value: string) => {
  if (!['expertA', 'expertB'].includes(fieldName)) return value
  try {
    const parsed = JSON.parse(value) as { scholarId?: string; name?: string }
    return [parsed.scholarId, parsed.name].filter(Boolean).join('  ')
  } catch {
    return value
  }
}

function genericParamValue(fieldName: string) {
  if (fieldName in genericParams.value) return genericParams.value[fieldName]
  return requestFieldValues(fieldName)[activeSampleIndex.value] ?? ''
}

function handleGenericParamInput(fieldName: string, event: Event) {
  const value = (event.target as HTMLInputElement).value
  genericParams.value = { ...genericParams.value, [fieldName]: value }
  const matchedIndex = requestFieldValues(fieldName).findIndex((item) => item === value)
  if (matchedIndex >= 0) activeSampleIndex.value = matchedIndex
}

function toggleGenericCombo(fieldName: string) {
  activeGenericCombo.value = activeGenericCombo.value === fieldName ? null : fieldName
}

function selectGenericOption(fieldName: string, value: string) {
  genericParams.value = { ...genericParams.value, [fieldName]: value }
  const matchedIndex = requestFieldValues(fieldName).findIndex((item) => item === value)
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
        industryChainNode: industryEventForm.industryChainNode,
        eventTypes: industryEventForm.eventTypes === '全部' ? ['patent', 'paper', 'fund', 'project', 'policy', 'product'] : [industryEventForm.eventTypes],
        topN: Number(industryEventForm.topN),
        evaluationModel: industryEventForm.evaluationModel,
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
        chain_code: industryChainForm.chain_code,
        chain_name: industryChainForm.chain_name,
        node_id: industryChainForm.node_id,
        node_name: industryChainForm.node_name,
        level: Number(industryChainForm.level),
        relation_type: industryChainForm.relation_type,
        include_enterprise: industryChainForm.include_enterprise === 'true',
        include_expert: industryChainForm.include_expert === 'true',
        include_patent: industryChainForm.include_patent === 'true',
        include_product: industryChainForm.include_product === 'true',
        include_news: industryChainForm.include_news === 'true',
        limit: Number(industryChainForm.limit),
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
        dataSource: achievementForm.dataSource,
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
  const name = indirectExpertNames[value]
  return name ? `${value}  ${name}` : value
}

function selectIndustryOption(field: keyof typeof industryChainForm, value: string) {
  if (field === 'chain_code') {
    const seed = industryChainSeeds[value] ?? industryChainSeeds.AI
    industryChainForm.chain_code = seed.code
    industryChainForm.chain_name = seed.name
    industryChainForm.node_id = 'all'
    industryChainForm.node_name = '全部环节'
  } else if (field === 'chain_name') {
    const code = industryChainNameToCode.value[value] ?? 'AI'
    const seed = industryChainSeeds[code]
    industryChainForm.chain_code = seed.code
    industryChainForm.chain_name = seed.name
    industryChainForm.node_id = 'all'
    industryChainForm.node_name = '全部环节'
  } else if (field === 'node_id') {
    industryChainForm.node_id = value
    industryChainForm.node_name = value === 'all' ? '全部环节' : industryChainSeed.value.links.find((link) => link.id === value)?.name ?? '全部环节'
  } else if (field === 'node_name') {
    industryChainForm.node_name = value
    industryChainForm.node_id = value === '全部环节' ? 'all' : industryChainSeed.value.links.find((link) => link.name === value)?.id ?? 'all'
  } else {
    industryChainForm[field] = value
  }
  activeIndustryCombo.value = null
}

function toggleIndustryCombo(field: string) {
  activeIndustryCombo.value = activeIndustryCombo.value === field ? null : field
}

function formatIndustryOption(field: string, value: string) {
  if (field === 'chain_code') return `${value}  ${industryChainSeeds[value]?.name ?? ''}`
  if (field === 'node_id') return value === 'all' ? 'all  全部环节' : `${value}  ${industryChainSeed.value.links.find((link) => link.id === value)?.name ?? ''}`
  return value
}

function toggleAchievementCombo(field: 'expertAId' | 'expertBId' | 'achievementTypes') {
  activeAchievementCombo.value = activeAchievementCombo.value === field ? null : field
}

function selectAchievementOption(field: 'expertAId' | 'expertBId' | 'achievementTypes', value: string) {
  achievementForm[field] = value
  activeAchievementCombo.value = null
}

function formatAchievementExpertOption(value: string) {
  const name = achievementExpertNames[value]
  return name ? `${value}  ${name}` : value
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
                      <svg class="prototype-graph" viewBox="0 0 900 580" role="img" :aria-label="`${title}图谱预览`">
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
        <dl v-else-if="resultMode === 'structured'" class="reasoning-placeholder__table">
          <div v-for="([label, value]) in activeDetailRows" :key="label">
            <dt>{{ label }}</dt>
            <dd>
              <template v-if="Array.isArray(value)">
                <span
                  v-for="(item, index) in value"
                  :key="item"
                  :class="{ 'reasoning-placeholder__tag': !isIndustryChainPanoramaModule && !isIndustryChainEventModule }"
                >
                  {{ item }}<template v-if="(isIndustryChainPanoramaModule || isIndustryChainEventModule) && index < value.length - 1">、</template>
                </span>
              </template>
              <template v-else>{{ value }}</template>
            </dd>
          </div>
        </dl>
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
            <span><i>{{ field.required === '是' ? '*' : '' }}</i>{{ field.name }}</span>
            <div v-if="isDateFieldName(field.name)" class="combo-field date-field" @click.stop>
              <input
                :value="industryEventForm[field.name as keyof typeof industryEventForm]"
                :placeholder="`请选择${field.name}`"
                type="date"
                @input="industryEventForm[field.name as keyof typeof industryEventForm] = ($event.target as HTMLInputElement).value"
              />
            </div>
            <div v-else class="combo-field" @click.stop>
              <input
                :value="industryEventForm[field.name as keyof typeof industryEventForm]"
                :placeholder="`请选择或输入${field.name}`"
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
                  {{ field.name === 'eventTypes' ? `${value}  ${industryEventTypeNames[value] ?? ''}` : value }}
                </button>
              </div>
            </div>
          </label>
        </div>
        <div v-else-if="isIndustryChainPanoramaModule" class="modal__body config-form" @click="activeIndustryCombo = null">
          <label v-for="field in activeRequestFields" :key="field.name">
            <span><i>{{ field.required === '是' ? '*' : '' }}</i>{{ field.name }}</span>
            <div class="combo-field" @click.stop>
              <input
                :value="industryChainForm[field.name as keyof typeof industryChainForm]"
                :placeholder="`请选择或输入${field.name}`"
                @focus="activeIndustryCombo = field.name"
                @input="industryChainForm[field.name as keyof typeof industryChainForm] = ($event.target as HTMLInputElement).value"
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
            <span><i>*</i>corenode_id</span>
            <div class="combo-field" @click.stop>
              <input v-model="indirectForm.corenode_id" placeholder="请选择或输入专家ID" @focus="activeIndirectCombo = 'corenode_id'" />
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
            <span>relation_type</span>
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
            <span>path_depth</span>
            <select v-model="indirectForm.path_depth">
              <option v-for="value in indirectOptions.path_depth" :key="value" :value="value">{{ value }}</option>
            </select>
            <img class="select-icon" :src="iconSelectArrow" alt="" aria-hidden="true" />
          </label>
          <label>
            <span>minstrength</span>
            <select v-model="indirectForm.minstrength">
              <option v-for="value in indirectOptions.minstrength" :key="value" :value="value">{{ value }}</option>
            </select>
            <img class="select-icon" :src="iconSelectArrow" alt="" aria-hidden="true" />
          </label>
        </div>
        <div v-else-if="isAchievementModule" class="modal__body config-form" @click="activeAchievementCombo = null">
          <label>
            <span><i>*</i>dataSource</span>
            <select v-model="achievementForm.dataSource">
              <option v-for="value in achievementOptions.dataSource" :key="value" :value="value">{{ value }}</option>
            </select>
            <img class="select-icon" :src="iconSelectArrow" alt="" aria-hidden="true" />
          </label>
          <label>
            <span><i>*</i>expertAId</span>
            <div class="combo-field" @click.stop>
              <input v-model="achievementForm.expertAId" placeholder="请选择或输入专家A ID" @focus="activeAchievementCombo = 'expertAId'" />
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
            <span><i>*</i>expertBId</span>
            <div class="combo-field" @click.stop>
              <input v-model="achievementForm.expertBId" placeholder="请选择或输入专家B ID" @focus="activeAchievementCombo = 'expertBId'" />
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
                  {{ value }}  {{ achievementPartnerNames[value] ?? '' }}
                </button>
              </div>
            </div>
          </label>
          <label>
            <span>achievementTypes</span>
            <div class="combo-field" @click.stop>
              <input v-model="achievementForm.achievementTypes" placeholder="请选择或输入成果类型" @focus="activeAchievementCombo = 'achievementTypes'" />
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
                  {{ value }}
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
                :value="genericParamValue(field.name)"
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

.reasoning-placeholder__table {
  margin: 0;
  overflow-x: hidden;
  overflow-y: auto;
}

.reasoning-placeholder__table div {
  display: grid;
  grid-template-columns: 112px minmax(0, 1fr);
  min-height: 44px;
  border-bottom: 1px solid var(--border);
}

.reasoning-placeholder__table dt,
.reasoning-placeholder__table dd {
  display: flex;
  align-items: center;
  margin: 0;
  padding: 0 var(--space-16);
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
  align-items: center;
  min-height: 24px;
  padding: 0 10px;
  border-radius: var(--radius-sm);
  color: var(--text-secondary);
  background: #f2f4f7;
  line-height: 20px;
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
  overflow-y: auto;
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

.combo-field input {
  width: 100%;
  padding-right: 38px;
  overflow: hidden;
  text-overflow: ellipsis;
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
