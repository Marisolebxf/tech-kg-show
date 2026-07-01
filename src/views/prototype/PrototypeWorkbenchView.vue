<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRoute } from 'vue-router'

import iconCopy from '../../assets/icons/icon-copy.svg'
import iconInfo from '../../assets/icons/icon-info.svg'
import { getModuleByKey } from './mock'

const route = useRoute()
const activeTab = ref<'debug' | 'contract' | 'preview'>('debug')
const copied = ref(false)

const moduleInfo = computed(() => getModuleByKey(String(route.name ?? 'expert-direct')))
const requestJson = computed(() => JSON.stringify(moduleInfo.value.requestExample, null, 2))
const responseJson = computed(() => {
  const example = moduleInfo.value.responseExample
  const code = typeof example.code === 'number' ? example.code : 0
  const message =
    typeof example.message === 'string'
      ? example.message
      : typeof example.msg === 'string'
        ? example.msg
        : 'success'
  const data = 'data' in example ? example.data : example
  return JSON.stringify({ code, data, message }, null, 2)
})
const curlSample = computed(
  () => `curl -X ${moduleInfo.value.method} "https://api.example.com${moduleInfo.value.endpoint}" \\
  -H "Content-Type: application/json" \\
  -d '${requestJson.value.replaceAll("'", "\\'")}'`,
)

async function copySample() {
  try {
    await navigator.clipboard?.writeText(curlSample.value)
  } catch {
    // Browser clipboard can be unavailable in local prototype previews.
  }
  copied.value = true
  window.setTimeout(() => {
    copied.value = false
  }, 1200)
}
</script>

<template>
  <div class="prototype-page">
    <header class="prototype-header">
      <div>
        <p class="prototype-header__eyebrow">知识推理服务 API 原型</p>
        <h1>{{ moduleInfo.title }}</h1>
        <p>{{ moduleInfo.subtitle }}</p>
      </div>
      <div class="prototype-status">
        <span>{{ moduleInfo.method }}</span>
        <strong>{{ moduleInfo.endpoint }}</strong>
      </div>
    </header>

    <nav class="prototype-tabs" aria-label="原型视图">
      <button type="button" :class="{ 'is-active': activeTab === 'debug' }" @click="activeTab = 'debug'">接口调试</button>
      <button type="button" :class="{ 'is-active': activeTab === 'contract' }" @click="activeTab = 'contract'">接口契约</button>
      <button type="button" :class="{ 'is-active': activeTab === 'preview' }" @click="activeTab = 'preview'">结果预览</button>
    </nav>

    <main v-if="activeTab === 'debug'" class="prototype-debug">
      <section class="kg-panel prototype-request">
        <div class="kg-panel__header">
          <h2 class="kg-panel__title">请求配置</h2>
          <button class="prototype-copy" type="button" @click="copySample">
            <span v-if="copied">已复制</span>
            <img v-else :src="iconCopy" alt="" aria-hidden="true" />
          </button>
        </div>
        <div class="prototype-form">
          <label v-for="field in moduleInfo.requestFields" :key="field.name">
            <span>{{ field.description }}</span>
            <input :value="moduleInfo.requestExample[field.name] ?? ''" />
          </label>
        </div>
        <div class="prototype-code-block">
          <div>请求 JSON</div>
          <pre>{{ requestJson }}</pre>
        </div>
      </section>

      <section class="kg-panel prototype-response">
        <div class="kg-panel__header">
          <h2 class="kg-panel__title">Mock 响应</h2>
          <span class="prototype-latency">128 ms</span>
        </div>
        <pre>{{ responseJson }}</pre>
      </section>

      <aside class="kg-panel prototype-summary">
        <div class="kg-panel__header">
          <h2 class="kg-panel__title">模块要求</h2>
          <img :src="iconInfo" alt="" aria-hidden="true" />
        </div>
        <p>{{ moduleInfo.moduleRequirement }}</p>
        <div class="prototype-metrics">
          <div v-for="row in moduleInfo.resultRows" :key="row.label" :class="['prototype-metric', `is-${row.tone ?? 'blue'}`]">
            <strong>{{ row.value }}</strong>
            <span>{{ row.label }}</span>
          </div>
        </div>
      </aside>
    </main>

    <main v-else-if="activeTab === 'contract'" class="prototype-contract">
      <section class="kg-panel">
        <div class="kg-panel__header"><h2 class="kg-panel__title">请求参数</h2></div>
        <table class="prototype-table">
          <thead>
            <tr><th>参数名</th><th>类型</th><th>必填</th><th>说明</th></tr>
          </thead>
          <tbody>
            <tr v-for="field in moduleInfo.requestFields" :key="field.name">
              <td>{{ field.name }}</td>
              <td>{{ field.type }}</td>
              <td>{{ field.required }}</td>
              <td>{{ field.description }}</td>
            </tr>
          </tbody>
        </table>
      </section>

      <section class="kg-panel">
        <div class="kg-panel__header"><h2 class="kg-panel__title">返回字段</h2></div>
        <table class="prototype-table">
          <thead>
            <tr><th>字段名</th><th>类型</th><th>说明</th></tr>
          </thead>
          <tbody>
            <tr v-for="field in moduleInfo.responseFields" :key="field.name">
              <td>{{ field.name }}</td>
              <td>{{ field.type }}</td>
              <td>{{ field.description }}</td>
            </tr>
          </tbody>
        </table>
      </section>

      <section class="kg-panel prototype-curl">
        <div class="kg-panel__header"><h2 class="kg-panel__title">cURL 示例</h2></div>
        <pre>{{ curlSample }}</pre>
      </section>
    </main>

    <main v-else class="prototype-preview">
      <section class="kg-panel prototype-graph">
        <div class="kg-panel__header">
          <h2 class="kg-panel__title">图谱结果预览</h2>
          <span>虚拟数据</span>
        </div>
        <svg class="kg-graph-canvas" viewBox="0 0 640 460" role="img" aria-label="图谱结果">
          <defs>
            <marker id="arrow" markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto">
              <path d="M0,0 L8,4 L0,8 Z" fill="#4080ff" />
            </marker>
          </defs>
          <line
            v-for="edge in moduleInfo.graphEdges"
            :key="`${edge.source}-${edge.target}-${edge.label}`"
            :x1="moduleInfo.graphNodes.find((node) => node.id === edge.source)?.x"
            :y1="moduleInfo.graphNodes.find((node) => node.id === edge.source)?.y"
            :x2="moduleInfo.graphNodes.find((node) => node.id === edge.target)?.x"
            :y2="moduleInfo.graphNodes.find((node) => node.id === edge.target)?.y"
            stroke="#4080ff"
            stroke-width="1.8"
            marker-end="url(#arrow)"
          />
          <g v-for="node in moduleInfo.graphNodes" :key="node.id" :transform="`translate(${node.x}, ${node.y})`">
            <rect x="-72" y="-26" width="144" height="52" rx="8" />
            <text y="-4">{{ node.label }}</text>
            <text y="15" class="node-type">{{ node.type }}</text>
          </g>
        </svg>
      </section>

      <aside class="prototype-preview-side">
        <section class="kg-panel">
          <div class="kg-panel__header"><h2 class="kg-panel__title">结构化结果</h2></div>
          <div class="prototype-result-list">
            <div v-for="row in moduleInfo.resultRows" :key="row.label">
              <span>{{ row.label }}</span>
              <strong>{{ row.value }}</strong>
            </div>
          </div>
        </section>
        <section class="kg-panel">
          <div class="kg-panel__header"><h2 class="kg-panel__title">证据链</h2></div>
          <ul class="prototype-evidence">
            <li v-for="item in moduleInfo.evidence" :key="item">{{ item }}</li>
          </ul>
        </section>
      </aside>
    </main>
  </div>
</template>

<style scoped>
.prototype-page {
  display: flex;
  flex-direction: column;
  height: 100%;
  min-width: 0;
  gap: 12px;
}

.prototype-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 24px;
  min-height: 96px;
  padding: 18px 22px;
  border: 1px solid rgba(255, 255, 255, 0.72);
  border-radius: var(--radius-md);
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.84), rgba(255, 255, 255, 0.58));
  box-shadow: 0 8px 24px rgba(72, 132, 214, 0.1);
}

.prototype-header h1 {
  margin: 4px 0 8px;
  color: var(--text-primary);
  font-size: 24px;
  line-height: 32px;
  font-weight: 600;
}

.prototype-header p {
  margin: 0;
  color: var(--text-secondary);
  font-size: 14px;
}

.prototype-header__eyebrow {
  color: var(--primary) !important;
}

.prototype-status {
  display: grid;
  gap: 8px;
  min-width: 340px;
  padding: 12px 14px;
  border: 1px solid var(--border);
  border-radius: var(--radius-md);
  background: var(--surface);
}

.prototype-status span {
  width: 52px;
  padding: 2px 0;
  border-radius: 4px;
  color: var(--text-inverse);
  background: var(--success);
  text-align: center;
  font-size: 12px;
}

.prototype-status strong {
  color: var(--text-primary);
  font-family: Consolas, Monaco, monospace;
  font-size: 14px;
  font-weight: 500;
}

.prototype-tabs {
  display: inline-flex;
  align-items: center;
  width: fit-content;
  border: 1px solid var(--border);
  border-radius: var(--radius-md);
  background: var(--surface);
  overflow: hidden;
}

.prototype-tabs button {
  width: 108px;
  height: 36px;
  border: 0;
  border-right: 1px solid var(--border);
  color: var(--text-secondary);
  background: transparent;
  cursor: pointer;
}

.prototype-tabs button:last-child {
  border-right: 0;
}

.prototype-tabs button.is-active {
  color: var(--text-inverse);
  background: var(--primary);
}

.prototype-debug,
.prototype-contract,
.prototype-preview {
  min-height: 0;
  flex: 1;
}

.prototype-debug {
  display: grid;
  grid-template-columns: minmax(320px, 0.95fr) minmax(380px, 1.1fr) 280px;
  gap: 12px;
}

.prototype-contract {
  display: grid;
  grid-template-columns: 1fr 1fr;
  grid-auto-rows: min-content;
  gap: 12px;
  overflow: auto;
}

.prototype-preview {
  display: grid;
  grid-template-columns: minmax(560px, 1fr) 320px;
  gap: 12px;
}

.prototype-form {
  display: grid;
  gap: 12px;
  padding: 16px;
}

.prototype-form label {
  display: grid;
  gap: 6px;
  color: var(--text-secondary);
  font-size: 13px;
}

.prototype-form input {
  height: 34px;
  padding: 0 10px;
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  color: var(--text-primary);
  background: var(--surface);
}

.prototype-code-block,
.prototype-response pre,
.prototype-curl pre {
  margin: 0;
  padding: 14px 16px;
  color: #2f3442;
  background: #f7f9fc;
  font-family: Consolas, Monaco, monospace;
  font-size: 13px;
  line-height: 1.65;
  white-space: pre-wrap;
  overflow: auto;
}

.prototype-code-block div {
  margin-bottom: 8px;
  color: var(--text-secondary);
  font-family: var(--font-family);
}

.prototype-response pre {
  height: calc(100% - 52px);
}

.prototype-summary p {
  margin: 0;
  padding: 16px;
  color: var(--text-secondary);
  font-size: 14px;
  line-height: 1.8;
}

.prototype-summary .kg-panel__header img {
  width: 16px;
  height: 16px;
}

.prototype-copy {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 58px;
  height: 30px;
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  color: var(--primary);
  background: var(--surface);
  cursor: pointer;
}

.prototype-copy img {
  width: 15px;
  height: 15px;
}

.prototype-latency {
  color: var(--success);
  font-size: 13px;
}

.prototype-metrics {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 10px;
  padding: 0 16px 16px;
}

.prototype-metric {
  display: grid;
  gap: 4px;
  min-height: 72px;
  padding: 12px;
  border-radius: var(--radius-md);
  background: var(--primary-subtle);
}

.prototype-metric strong {
  color: var(--text-primary);
  font-size: 22px;
  line-height: 1;
}

.prototype-metric span {
  color: var(--text-secondary);
  font-size: 13px;
}

.prototype-metric.is-green {
  background: var(--success-subtle);
}

.prototype-metric.is-orange {
  background: var(--warning-subtle);
}

.prototype-metric.is-purple {
  background: #f4efff;
}

.prototype-table {
  width: 100%;
  border-collapse: collapse;
  table-layout: fixed;
}

.prototype-table th,
.prototype-table td {
  padding: 13px 14px;
  border-bottom: 1px solid var(--border);
  color: var(--text-secondary);
  text-align: left;
  font-size: 14px;
  line-height: 20px;
  vertical-align: top;
}

.prototype-table th {
  color: var(--text-primary);
  background: #f7f9fc;
  font-weight: 600;
}

.prototype-table td:first-child {
  color: var(--text-primary);
  font-family: Consolas, Monaco, monospace;
}

.prototype-curl {
  grid-column: 1 / -1;
}

.prototype-graph svg {
  display: block;
  width: 100%;
  height: calc(100vh - 260px);
  min-height: 420px;
}

.prototype-graph rect {
  fill: #ffffff;
  stroke: #4080ff;
  stroke-width: 1.4;
  filter: drop-shadow(0 8px 14px rgba(64, 128, 255, 0.14));
}

.prototype-graph text {
  fill: var(--text-primary);
  text-anchor: middle;
  font-size: 14px;
  font-weight: 600;
}

.prototype-graph .node-type {
  fill: var(--text-tertiary);
  font-size: 12px;
  font-weight: 400;
}

.prototype-preview-side {
  display: grid;
  grid-template-rows: min-content 1fr;
  gap: 12px;
  min-height: 0;
}

.prototype-result-list {
  display: grid;
  gap: 0;
}

.prototype-result-list div {
  display: flex;
  align-items: center;
  justify-content: space-between;
  min-height: 48px;
  padding: 0 16px;
  border-bottom: 1px solid var(--border);
}

.prototype-result-list span {
  color: var(--text-secondary);
}

.prototype-result-list strong {
  color: var(--text-primary);
  font-size: 18px;
}

.prototype-evidence {
  display: grid;
  gap: 10px;
  margin: 0;
  padding: 16px 18px 18px 34px;
  color: var(--text-secondary);
  line-height: 1.6;
}

@media (max-width: 1180px) {
  .prototype-debug,
  .prototype-preview,
  .prototype-contract {
    grid-template-columns: 1fr;
    overflow: auto;
  }

  .prototype-header {
    align-items: flex-start;
    flex-direction: column;
  }

  .prototype-status {
    min-width: 0;
    width: 100%;
  }
}
</style>
