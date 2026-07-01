<script setup lang="ts">
import { computed } from 'vue'

import type { DirectRelationItem, DirectRelationQueryResponse } from '../expert-direct-types'

type ReferenceNode = {
  id: string
  kind: 'institution' | 'expert-blue' | 'expert-green'
  x: number
  y: number
  width: number
  height: number
  title: string
  subtitle?: string | null
}

type ReferenceEdge = {
  key: string
  d: string
  labelLines?: string[]
  labelX: number
  labelY: number
  stroke?: string
  width?: number
  startMarker?: 'dot' | 'arrow'
  endMarker?: 'dot' | 'arrow'
}

type Point = [number, number]

type PartnerSlot = {
  x: number
  y: number
  width: number
  height: number
  labelX: number
  labelY: number
  curve: [Point, Point, Point, Point]
}

const props = defineProps<{
  title: string
  loading: boolean
  errorMessage: string
  response: DirectRelationQueryResponse | null
}>()

const VIEWBOX_WIDTH = 920
const VIEWBOX_HEIGHT = 650
const relationColor = '#7b43e6'

const items = computed<DirectRelationItem[]>(() => props.response?.items?.slice(0, 4) ?? [])
const primaryExpert = computed(() => items.value[0]?.expertA ?? null)
const primaryInstitution = computed(() => items.value[0]?.institution || primaryExpert.value?.organization || '关系归属机构')

const centerNode = {
  x: 86,
  y: 114,
  width: 220,
  height: 88,
}

const institutionNode = {
  x: 342,
  y: 316,
  width: 244,
  height: 70,
}

const partnerSlots: PartnerSlot[] = [
  { x: 626, y: 114, width: 220, height: 88, labelX: 466, labelY: 144, curve: [[306, 158], [410, 158], [522, 158], [626, 158]] },
  { x: 86, y: 456, width: 220, height: 88, labelX: 226, labelY: 414, curve: [[196, 202], [78, 272], [76, 386], [176, 456]] },
  { x: 626, y: 456, width: 220, height: 88, labelX: 704, labelY: 414, curve: [[306, 184], [492, 246], [856, 344], [736, 456]] },
]

const institutionEdges = [
  {
    key: 'institution-primary',
    d: curve([196, centerNode.y + centerNode.height], [244, 246], [318, 292], [386, institutionNode.y]),
    labelX: 290,
    labelY: 268,
  },
  {
    key: 'institution-partner-0',
    d: curve(
      [partnerSlots[0].x + partnerSlots[0].width / 2, partnerSlots[0].y + partnerSlots[0].height],
      [738, 246],
      [654, 292],
      [552, institutionNode.y],
    ),
    labelX: 656,
    labelY: 268,
  },
  {
    key: 'institution-partner-1',
    d: curve(
      [partnerSlots[1].x + partnerSlots[1].width, partnerSlots[1].y + 44],
      [378, 502],
      [414, 424],
      [430, institutionNode.y + institutionNode.height],
    ),
    labelX: 388,
    labelY: 458,
  },
  {
    key: 'institution-partner-2',
    d: curve(
      [partnerSlots[2].x, partnerSlots[2].y + 44],
      [560, 502],
      [532, 424],
      [500, institutionNode.y + institutionNode.height],
    ),
    labelX: 548,
    labelY: 458,
  },
]

function curve(
  from: [number, number],
  c1: [number, number],
  c2: [number, number],
  to: [number, number],
) {
  return `M ${from[0]} ${from[1]} C ${c1[0]} ${c1[1]}, ${c2[0]} ${c2[1]}, ${to[0]} ${to[1]}`
}

function expertTitle(itemIndex: number) {
  const item = items.value[itemIndex]
  const expertLabel = String.fromCharCode(66 + itemIndex)
  if (!item) return `专家${expertLabel}：暂无`
  return `专家${expertLabel}：${item.expertB.name}`
}

function expertSubtitle(itemIndex: number) {
  const expert = items.value[itemIndex]?.expertB
  return expert?.title || expert?.organization || ''
}

function relationLines(itemIndex: number, fallback: string) {
  const item = items.value[itemIndex]
  if (!item) return [fallback]
  return [item.relationType || item.relationSummary || fallback]
}

const referenceNodes = computed<ReferenceNode[]>(() => {
  if (!primaryExpert.value || !items.value.length) return []

  const nodes: ReferenceNode[] = [
    {
      id: 'primary-institution',
      kind: 'institution',
      ...institutionNode,
      title: primaryInstitution.value,
    },
    {
      id: 'primary-expert',
      kind: 'expert-blue',
      ...centerNode,
      title: `专家A：${primaryExpert.value.name}`,
      subtitle: primaryExpert.value.title || primaryExpert.value.organization,
    },
  ]

  items.value.forEach((item, index) => {
    const slot = partnerSlots[index]
    if (!slot) return
    nodes.push({
      id: `partner-${item.expertB.expertId || index}`,
      kind: 'expert-green',
      x: slot.x,
      y: slot.y,
      width: slot.width,
      height: slot.height,
      title: expertTitle(index),
      subtitle: expertSubtitle(index),
    })
  })

  return nodes
})

const referenceEdges = computed<ReferenceEdge[]>(() => {
  if (!referenceNodes.value.length) return []

  const edges: ReferenceEdge[] = []

  institutionEdges.slice(0, items.value.length + 1).forEach((edge) => {
    edges.push({
      ...edge,
      labelLines: ['任职'],
      width: 2,
      endMarker: 'dot',
      stroke: '#7b43e6',
    })
  })

  items.value.forEach((_, index) => {
    const slot = partnerSlots[index]
    if (!slot) return
    const [from, c1, c2, to] = slot.curve
    edges.push({
      key: `primary-partner-${index}`,
      d: curve(from, c1, c2, to),
      labelLines: relationLines(index, '直接关系'),
      labelX: slot.labelX,
      labelY: slot.labelY,
      width: 2,
      endMarker: 'arrow',
    })
  })

  return edges
})

function nodeStyle(node: ReferenceNode) {
  return {
    left: `${(node.x / VIEWBOX_WIDTH) * 100}%`,
    top: `${(node.y / VIEWBOX_HEIGHT) * 100}%`,
    width: `${(node.width / VIEWBOX_WIDTH) * 100}%`,
    height: `${(node.height / VIEWBOX_HEIGHT) * 100}%`,
  }
}
</script>

<template>
  <div class="direct-graph-panel">
    <div v-if="errorMessage && !items.length" class="direct-graph-panel__empty">
      <strong>查询失败</strong>
      <p>{{ errorMessage }}</p>
    </div>

    <div v-else-if="items.length" class="reference-graph">
      <svg class="reference-graph__svg" viewBox="0 0 920 650" preserveAspectRatio="none" aria-hidden="true">
        <defs>
          <marker id="direct-reference-arrow" markerWidth="8" markerHeight="8" refX="7" refY="3" orient="auto">
            <path d="M0,0 L0,6 L8,3 z" :fill="relationColor"></path>
          </marker>
          <marker id="direct-reference-dot" markerWidth="7" markerHeight="7" refX="3.5" refY="3.5" orient="auto">
            <circle cx="3.5" cy="3.5" r="2.8" :fill="relationColor"></circle>
          </marker>
        </defs>

        <g v-for="edge in referenceEdges" :key="edge.key">
          <path
            :d="edge.d"
            fill="none"
            :stroke="edge.stroke || relationColor"
            :stroke-width="edge.width || 2"
            stroke-linecap="round"
            stroke-linejoin="round"
            :marker-start="edge.startMarker ? `url(#direct-reference-${edge.startMarker})` : undefined"
            :marker-end="edge.endMarker ? `url(#direct-reference-${edge.endMarker})` : undefined"
          />
          <text :x="edge.labelX" :y="edge.labelY" text-anchor="middle" class="reference-graph__edge-label">
            <tspan
              v-for="(lineText, index) in edge.labelLines"
              :key="`${edge.key}-${index}`"
              :x="edge.labelX"
              :dy="index === 0 ? 0 : 18"
            >
              {{ lineText }}
            </tspan>
          </text>
        </g>
      </svg>

      <article
        v-for="node in referenceNodes"
        :key="node.id"
        class="reference-graph__node"
        :class="`is-${node.kind}`"
        :style="nodeStyle(node)"
      >
        <strong>{{ node.title }}</strong>
        <span v-if="node.subtitle">{{ node.subtitle }}</span>
      </article>

    </div>

    <div v-else-if="loading" class="direct-graph-panel__empty">
      <strong>{{ title }}</strong>
      <span>正在生成关系图谱</span>
    </div>

    <div v-else class="direct-graph-panel__empty">
      <strong>{{ title }}</strong>
      <span>暂无匹配结果</span>
    </div>
  </div>
</template>

<style scoped>
.direct-graph-panel {
  position: relative;
  display: grid;
  width: 100%;
  height: 100%;
  min-height: 0;
  overflow: hidden;
  background:
    linear-gradient(#edf3ff 1px, transparent 1px),
    linear-gradient(90deg, #edf3ff 1px, transparent 1px),
    #fbfdff;
  background-size: 24px 24px;
}

.reference-graph {
  position: relative;
  width: 100%;
  height: 100%;
  min-height: 0;
}

.reference-graph__svg {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
}

.reference-graph__edge-label {
  fill: #5634e8;
  font-size: 9px;
  font-weight: 600;
  paint-order: stroke;
  stroke: rgba(255, 253, 248, 0.96);
  stroke-width: 5px;
}

.reference-graph__node {
  position: absolute;
  display: grid;
  align-content: center;
  justify-items: center;
  gap: 3px;
  padding: 14px 16px;
  border-radius: 8px;
  text-align: center;
  box-shadow: 0 10px 22px rgba(72, 132, 214, 0.08);
}

.reference-graph__node strong {
  display: block;
  overflow: hidden;
  width: 100%;
  font-size: 12px;
  font-weight: 700;
  line-height: 1.18;
  text-wrap: balance;
}

.reference-graph__node span {
  display: block;
  overflow: hidden;
  width: 100%;
  color: #171d2d;
  font-size: 10px;
  line-height: 1.22;
  text-wrap: balance;
}

.reference-graph__node.is-institution {
  border: 1.5px solid #ff8a1f;
  background: linear-gradient(180deg, rgba(255, 252, 246, 0.98), rgba(255, 247, 236, 0.98));
}

.reference-graph__node.is-institution strong {
  color: #ef6c00;
  font-size: 12px;
}

.reference-graph__node.is-expert-blue {
  border: 1.5px solid #4f8cff;
  background: linear-gradient(180deg, rgba(250, 252, 255, 0.98), rgba(240, 246, 255, 0.98));
}

.reference-graph__node.is-expert-blue strong {
  color: #2d65f6;
}

.reference-graph__node.is-expert-green {
  border: 1.5px solid #00b333;
  background: linear-gradient(180deg, rgba(247, 255, 247, 0.98), rgba(240, 249, 240, 0.98));
}

.reference-graph__node.is-expert-green strong {
  color: #16871f;
}

.direct-graph-panel__empty {
  display: grid;
  width: 360px;
  min-height: 180px;
  place-items: center;
  align-self: center;
  justify-self: center;
  padding: 24px;
  border: 1px dashed #b5d3fc;
  border-radius: 18px;
  color: var(--text-secondary);
  text-align: center;
}

.direct-graph-panel__empty strong {
  color: var(--text-primary);
  font-size: 18px;
}

.direct-graph-panel__empty p {
  margin: 0;
}

.direct-graph-panel__status {
  position: absolute;
  top: 18px;
  right: 18px;
  z-index: 3;
  padding: 6px 12px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.92);
  color: var(--text-secondary);
  font-size: 12px;
  box-shadow: 0 4px 12px rgba(72, 132, 214, 0.12);
}
</style>
