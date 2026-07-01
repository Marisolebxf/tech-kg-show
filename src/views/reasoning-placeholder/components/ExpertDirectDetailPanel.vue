<script setup lang="ts">
import { computed } from 'vue'

import type { DirectRelationQueryResponse } from '../expert-direct-types'

const props = defineProps<{
  resultMode: 'structured' | 'api'
  apiExampleText: string
  loading: boolean
  errorMessage: string
  response: DirectRelationQueryResponse | null
}>()

const emit = defineEmits<{
  'update:resultMode': [value: 'structured' | 'api']
}>()

const items = computed(() => props.response?.items ?? [])
const structuredRows = computed<[string, unknown][]>(() => {
  const first = items.value[0]
  if (!first) return []

  const rows: [string, unknown][] = [
    ['专家 A', first.expertA.name],
    ['专家 A 职称', first.expertA.title],
    ['专家A机构', first.expertA.organization],
  ]

  items.value.forEach((item, index) => {
    const expertLabel = String.fromCharCode(66 + index)
    rows.push(
      [`专家 ${expertLabel}`, item.expertB.name],
      [`专家${expertLabel}职称`, item.expertB.title],
      [`专家${expertLabel}机构`, item.expertB.organization],
      [`专家${expertLabel}关系类型`, item.relationType],
      [`专家${expertLabel}协作场景`, item.collaborationScene],
      [`专家${expertLabel}合作时间`, item.cooperationTime],
      [`专家${expertLabel}合作成果`, item.cooperationOutcome],
      [`专家${expertLabel}原因标签`, item.reasonTags],
    )
  })

  return rows
})

function displayValue(value: unknown) {
  if (Array.isArray(value)) return value.join('、')
  if (value === null || value === undefined || value === '') return '-'
  return String(value)
}

</script>

<template>
  <aside class="kg-panel reasoning-placeholder__detail">
    <div class="kg-panel__header">
      <h2 class="kg-panel__title">结果详情</h2>
      <div class="reasoning-placeholder__tabs">
        <button :class="{ 'is-active': resultMode === 'structured' }" type="button" @click="emit('update:resultMode', 'structured')">
          结构化结果
        </button>
        <button :class="{ 'is-active': resultMode === 'api' }" type="button" @click="emit('update:resultMode', 'api')">
          API结果示例
        </button>
      </div>
    </div>

    <div v-if="resultMode === 'structured'" class="reasoning-placeholder__detail-scroll">
      <div v-if="errorMessage && !items.length" class="reasoning-placeholder__empty">
        <strong>查询失败</strong>
        <p>{{ errorMessage }}</p>
      </div>
      <div v-else-if="items.length" class="reasoning-placeholder__detail-table-wrap">
        <div v-if="loading" class="reasoning-placeholder__refresh-tip">正在刷新结果...</div>
        <dl class="reasoning-placeholder__table reasoning-placeholder__table--merged">
          <div v-for="[label, value] in structuredRows" :key="label">
            <dt>{{ label }}</dt>
            <dd>
              <template v-if="String(label).includes('原因标签') && Array.isArray(value)">
                <span
                  v-for="tag in value"
                  :key="String(tag)"
                  class="reasoning-placeholder__tag"
                >
                  {{ tag }}
                </span>
              </template>
              <template v-else>
                {{ displayValue(value) }}
              </template>
            </dd>
          </div>
        </dl>
      </div>
      <div v-else-if="loading" class="reasoning-placeholder__empty">
        <strong>结果详情</strong>
        <span>正在加载真实结果</span>
      </div>
      <div v-else class="reasoning-placeholder__empty">
        <strong>结果详情</strong>
        <span>暂无匹配结果</span>
      </div>
    </div>

    <pre v-else class="reasoning-placeholder__code">{{ apiExampleText }}</pre>
  </aside>
</template>

<style scoped>
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

.reasoning-placeholder__detail-table-wrap {
  padding: 16px;
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
  padding: 0 16px;
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
  gap: 8px;
  color: var(--text-primary);
}

.reasoning-placeholder__tag {
  display: inline-flex;
  align-items: center;
  height: 24px;
  padding: 0 10px;
  border-radius: 8px;
  background: var(--surface-muted);
  color: var(--text-primary);
  font-size: 12px;
}

.reasoning-placeholder__code {
  flex: 1;
  min-height: 0;
  margin: 0;
  padding: 16px 24px;
  overflow: auto;
  color: #2f3442;
  background: #f7f9fc;
  font-family: "SFMono-Regular", Consolas, "Liberation Mono", monospace;
  font-size: 13px;
  line-height: 24px;
  white-space: pre-wrap;
}

.reasoning-placeholder__empty {
  display: grid;
  width: 100%;
  min-height: 180px;
  place-items: center;
  padding: 24px;
  color: var(--text-secondary);
  text-align: center;
}

.reasoning-placeholder__empty strong {
  color: var(--text-primary);
  font-size: 18px;
}

.reasoning-placeholder__empty p {
  margin: 0;
}
</style>
