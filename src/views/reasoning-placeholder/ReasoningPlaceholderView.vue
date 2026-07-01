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
const genericParams = ref<Record<string, string>>({})

function defaultInterfaceIndex(routeName: string) {
  return routeName === 'expert-alumni' ? 1 : 0
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
const title = computed(() => moduleInfo.value.title || String(route.meta.title ?? '知识推理模块'))
const baseInterface = computed(() => moduleInfo.value.interfaces[activeInterfaceIndex.value] ?? moduleInfo.value.interfaces[0])
const sampleScenarios = computed(() => buildSampleScenarios(String(route.name ?? ''), baseInterface.value.name))
const activeScenario = computed(() => sampleScenarios.value[activeSampleIndex.value] ?? sampleScenarios.value[0])
const currentInterface = computed(() => applyScenario(baseInterface.value, activeScenario.value.replacements))
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
  if (isAchievementModule.value) return achievementGraph.value
  if (isIndirectModule.value) return indirectGraph.value
  return currentInterface.value.graph
})
const activeDetailRows = computed(() => {
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
    isAchievementModule.value
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
const activeResponseFields = computed(() => {
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

const highlightedResponseJson = computed(() => highlightCode(currentResponseJson.value))
const highlightedCodeSample = computed(() => highlightCode(currentCodeSamples.value[activeCode.value]))

watch(
  () => route.name,
  (routeName) => {
    activeInterfaceIndex.value = defaultInterfaceIndex(String(routeName ?? ''))
    activeSampleIndex.value = 0
    genericParams.value = {}
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
          <svg class="prototype-graph" viewBox="0 0 760 580" role="img" :aria-label="`${title}图谱预览`">
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
                    <rect class="prototype-chip" :x="14 + (index % 3) * 56" :y="node.h - 30 + Math.floor(index / 3) * 24" width="48" height="22" rx="6" />
                    <text class="prototype-chip-text" :x="38 + (index % 3) * 56" :y="node.h - 16 + Math.floor(index / 3) * 24">{{ chip }}</text>
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
                <span v-for="item in value" :key="item" class="reasoning-placeholder__tag">{{ item }}</span>
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
        <div v-if="isIndirectModule" class="modal__body config-form" @click="activeIndirectCombo = null">
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
            <select v-model="achievementForm.startTime">
              <option v-for="value in achievementOptions.startTime" :key="value" :value="value">{{ value }}</option>
            </select>
            <img class="select-icon" :src="iconSelectArrow" alt="" aria-hidden="true" />
          </label>
          <label>
            <span>endTime</span>
            <select v-model="achievementForm.endTime">
              <option v-for="value in achievementOptions.endTime" :key="value" :value="value">{{ value }}</option>
            </select>
            <img class="select-icon" :src="iconSelectArrow" alt="" aria-hidden="true" />
          </label>
        </div>
        <div v-else class="modal__body config-form" @click="activeGenericCombo = null">
          <label v-for="field in visibleParams" :key="field.name">
            <span><i>{{ field.required === '是' ? '*' : '' }}</i>{{ field.name }}</span>
            <div class="combo-field" @click.stop>
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
  width: min(100%, 860px);
  height: min(100%, 620px);
  min-height: 420px;
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
  font-size: 15px;
  font-weight: 500;
  text-anchor: middle;
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
