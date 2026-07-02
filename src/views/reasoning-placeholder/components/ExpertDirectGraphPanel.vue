<script setup lang="ts">
import { computed } from 'vue'

import type { DirectRelationItem, DirectRelationQueryResponse } from '../expert-direct-types'

type NodeTone = 'center' | 'green' | 'purple' | 'orange' | 'cyan' | 'blue' | 'gold'

type GraphNode = {
  id: string
  tone: NodeTone
  x: number
  y: number
  width: number
  height: number
  title: string
  subtitle: string
  meta?: string
  chips?: string[]
}

type GraphEdge = {
  id: string
  path: string
  label: string
  labelX: number
  labelY: number
  tone: Exclude<NodeTone, 'center'>
}

type Slot = {
  x: number
  y: number
  width: number
  height: number
  path: string
  labelX: number
  labelY: number
  tone: Exclude<NodeTone, 'center'>
}

const props = defineProps<{
  title: string
  loading: boolean
  errorMessage: string
  response: DirectRelationQueryResponse | null
}>()

const viewBoxWidth = 920
const viewBoxHeight = 650
const center = { x: 350, y: 278, width: 220, height: 86 }
const markerTones: Array<Exclude<NodeTone, 'center'>> = ['green', 'purple', 'orange', 'cyan', 'blue', 'gold']
const slots: Slot[] = [
  { x: 80, y: 42, width: 186, height: 82, path: 'M420 278 C374 218 318 142 266 96', labelX: 322, labelY: 168, tone: 'green' },
  { x: 367, y: 32, width: 186, height: 82, path: 'M460 278 V114', labelX: 492, labelY: 186, tone: 'purple' },
  { x: 654, y: 42, width: 186, height: 82, path: 'M500 278 C546 218 602 142 654 96', labelX: 598, labelY: 168, tone: 'cyan' },
  { x: 38, y: 282, width: 186, height: 82, path: 'M350 321 H224', labelX: 286, labelY: 308, tone: 'orange' },
  { x: 696, y: 282, width: 186, height: 82, path: 'M570 321 H696', labelX: 634, labelY: 308, tone: 'green' },
  { x: 80, y: 526, width: 186, height: 82, path: 'M420 364 C374 430 318 506 266 568', labelX: 322, labelY: 462, tone: 'gold' },
  { x: 367, y: 536, width: 186, height: 82, path: 'M460 364 V536', labelX: 492, labelY: 462, tone: 'blue' },
  { x: 654, y: 526, width: 186, height: 82, path: 'M500 364 C546 430 602 506 654 568', labelX: 598, labelY: 462, tone: 'purple' },
]

const items = computed<DirectRelationItem[]>(() => props.response?.items?.slice(0, slots.length) ?? [])
const primaryExpert = computed(() => items.value[0]?.expertA ?? null)

const graphNodes = computed<GraphNode[]>(() => {
  if (!primaryExpert.value || !items.value.length) return []

  const nodes: GraphNode[] = [
    {
      id: 'center',
      tone: 'center',
      ...center,
      title: `专家A：${primaryExpert.value.name}`,
      subtitle: primaryExpert.value.title || '专家',
      meta: primaryExpert.value.organization || '',
    },
  ]

  items.value.forEach((item, index) => {
    const slot = slots[index]
    if (!slot) return
    nodes.push({
      id: item.expertB.expertId || `partner-${index}`,
      tone: slot.tone,
      x: slot.x,
      y: slot.y,
      width: slot.width,
      height: slot.height,
      title: `专家${String.fromCharCode(66 + index)}：${item.expertB.name}`,
      subtitle: item.expertB.title || '专家',
      meta: item.expertB.organization || '',
      chips: [],
    })
  })

  return nodes
})

const graphEdges = computed<GraphEdge[]>(() => items.value.map((item, index) => {
  const slot = slots[index]
  return slot
    ? {
        id: item.key || `edge-${index}`,
        path: slot.path,
        label: item.relationSummary || item.relationType || '直接关系',
        labelX: slot.labelX,
        labelY: slot.labelY,
        tone: slot.tone,
      }
    : null
}).filter((edge): edge is GraphEdge => Boolean(edge)))

function toneColor(tone: NodeTone) {
  const colors: Record<NodeTone, string> = {
    center: '#4f8cff',
    green: '#36b24a',
    purple: '#8a35e6',
    orange: '#ff7a00',
    cyan: '#13a8a8',
    blue: '#3478f6',
    gold: '#d99a00',
  }
  return colors[tone]
}

function nodeFill(tone: NodeTone) {
  const colors: Record<NodeTone, string> = {
    center: '#f4f8ff',
    green: '#f2fff4',
    purple: '#fbf7ff',
    orange: '#fff8f1',
    cyan: '#f0ffff',
    blue: '#f3f7ff',
    gold: '#fffbed',
  }
  return colors[tone]
}

function nodeTitleFill(tone: NodeTone) {
  const colors: Record<NodeTone, string> = {
    center: '#2d65f6',
    green: '#168326',
    purple: '#7532d8',
    orange: '#d85c00',
    cyan: '#008c8c',
    blue: '#1f5eea',
    gold: '#a86d00',
  }
  return colors[tone]
}

function nodeMainY(node: GraphNode) {
  return node.y + node.height / 2 - (node.meta ? 12 : 6)
}

function nodeSubY(node: GraphNode) {
  return node.y + node.height / 2 + 6
}

function nodeMetaY(node: GraphNode) {
  return node.y + node.height / 2 + 24
}
</script>

<template>
  <div class="direct-graph-panel">
    <div v-if="errorMessage && !items.length" class="direct-graph-panel__empty">
      <strong>查询失败</strong>
      <p>{{ errorMessage }}</p>
    </div>

    <div v-else-if="items.length" class="direct-graph">
      <svg class="direct-graph__svg" viewBox="0 0 920 650" preserveAspectRatio="xMidYMid meet" role="img" :aria-label="`${title}图谱`">
        <defs>
          <marker
            v-for="tone in markerTones"
            :id="`direct-graph-arrow-${tone}`"
            :key="tone"
            markerWidth="8"
            markerHeight="8"
            refX="7"
            refY="4"
            orient="auto"
          >
            <path d="M0,0 L8,4 L0,8 Z" class="direct-graph__marker" :fill="toneColor(tone)" />
          </marker>
        </defs>
        <g v-for="edge in graphEdges" :key="edge.id">
          <path class="direct-graph__edge" :d="edge.path" :stroke="toneColor(edge.tone)" :marker-end="`url(#direct-graph-arrow-${edge.tone})`" />
          <text class="direct-graph__label" :fill="toneColor(edge.tone)" :x="edge.labelX" :y="edge.labelY" text-anchor="middle">{{ edge.label }}</text>
        </g>
        <g v-for="node in graphNodes" :key="node.id" class="direct-graph__node" :class="`is-${node.tone}`">
          <rect :x="node.x" :y="node.y" :width="node.width" :height="node.height" rx="8" :fill="nodeFill(node.tone)" :stroke="toneColor(node.tone)" />
          <text class="direct-graph__node-title" :fill="nodeTitleFill(node.tone)" :x="node.x + node.width / 2" :y="nodeMainY(node)">{{ node.title }}</text>
          <text class="direct-graph__node-sub" :x="node.x + node.width / 2" :y="nodeSubY(node)">{{ node.subtitle }}</text>
          <text v-if="node.meta" class="direct-graph__node-meta" :x="node.x + node.width / 2" :y="nodeMetaY(node)">{{ node.meta }}</text>
        </g>
      </svg>
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

.direct-graph {
  position: relative;
  width: 100%;
  height: 100%;
  min-height: 0;
}

.direct-graph__svg {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
}

.direct-graph__edge {
  fill: none;
  stroke-width: 2;
  stroke-linecap: round;
  stroke-linejoin: round;
}

.direct-graph__edge.is-green { stroke: #36b24a; }
.direct-graph__edge.is-purple { stroke: #8a35e6; }
.direct-graph__edge.is-orange { stroke: #ff7a00; }
.direct-graph__edge.is-cyan { stroke: #13a8a8; }
.direct-graph__edge.is-blue { stroke: #3478f6; }

.direct-graph__marker--green { fill: #36b24a; }
.direct-graph__marker--purple { fill: #8a35e6; }
.direct-graph__marker--orange { fill: #ff7a00; }
.direct-graph__marker--cyan { fill: #13a8a8; }
.direct-graph__marker--blue { fill: #3478f6; }

.direct-graph__label {
  font-size: 12px;
  font-weight: 800;
  paint-order: stroke;
  stroke: rgba(255, 255, 255, 0.96);
  stroke-width: 5px;
}

.direct-graph__label.is-green { fill: #238b35; }
.direct-graph__label.is-purple { fill: #7532d8; }
.direct-graph__label.is-orange { fill: #d85c00; }
.direct-graph__label.is-cyan { fill: #008c8c; }
.direct-graph__label.is-blue { fill: #1f5eea; }

.direct-graph__node rect {
  stroke-width: 1.6;
  filter: drop-shadow(0 10px 16px rgba(72, 132, 214, 0.08));
}

.direct-graph__node text {
  text-anchor: middle;
  dominant-baseline: middle;
}

.direct-graph__node-title {
  font-size: 13px;
  font-weight: 800;
}

.direct-graph__node-sub {
  fill: #4e5969;
  font-size: 11px;
}

.direct-graph__node-meta {
  fill: #86909c;
  font-size: 10px;
}

.direct-graph__node.is-center rect {
  fill: #f4f8ff;
  stroke: #4f8cff;
}

.direct-graph__node.is-center .direct-graph__node-title { fill: #2d65f6; }

.direct-graph__node.is-green rect {
  fill: #f2fff4;
  stroke: #49c76f;
}

.direct-graph__node.is-green .direct-graph__node-title { fill: #168326; }

.direct-graph__node.is-purple rect {
  fill: #fbf7ff;
  stroke: #b57cff;
}

.direct-graph__node.is-purple .direct-graph__node-title { fill: #7532d8; }

.direct-graph__node.is-orange rect {
  fill: #fff8f1;
  stroke: #ffb071;
}

.direct-graph__node.is-orange .direct-graph__node-title { fill: #d85c00; }

.direct-graph__node.is-cyan rect {
  fill: #f0ffff;
  stroke: #68d8d8;
}

.direct-graph__node.is-cyan .direct-graph__node-title { fill: #008c8c; }

.direct-graph__node.is-blue rect {
  fill: #f3f7ff;
  stroke: #6da0ff;
}

.direct-graph__node.is-blue .direct-graph__node-title { fill: #1f5eea; }

.direct-graph__node.is-gold rect {
  fill: #fffbed;
  stroke: #f7df90;
}

.direct-graph__node.is-gold .direct-graph__node-title { fill: #a86d00; }

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
</style>
