<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRoute } from 'vue-router'

import iconClose from '../../assets/icons/icon-close.svg'
import iconInfo from '../../assets/icons/icon-info.svg'
import iconModalSetting from '../../assets/icons/icon-modal-setting.svg'
import iconSelectArrow from '../../assets/icons/icon-select-arrow.svg'
import flowReasoning from '../../assets/icons/技术方案-关系推理.svg'
import flowStandardize from '../../assets/icons/技术方案-标准化处理.svg'
import flowOutput from '../../assets/icons/技术方案-结果输出.svg'
import flowInput from '../../assets/icons/技术方案-输入数据.svg'
import flowArrow from '../../assets/icons/技术方案-箭头.svg'

import ExpertDirectDetailPanel from '../reasoning-placeholder/components/ExpertDirectDetailPanel.vue'
import ExpertDirectDeveloperPanel from '../reasoning-placeholder/components/ExpertDirectDeveloperPanel.vue'
import ExpertDirectGraphPanel from '../reasoning-placeholder/components/ExpertDirectGraphPanel.vue'
import { useExpertDirectRelation } from '../reasoning-placeholder/useExpertDirectRelation'

const route = useRoute()

const activeView = ref<'test' | 'developer'>('test')
const resultMode = ref<'structured' | 'api'>('structured')
const showConfigModal = ref(false)
const showTechModal = ref(false)
const activeComboField = ref<'expert_id' | 'organization' | null>(null)
const expertOptionNames: Record<string, string> = {
  E10001: '李佳宁',
  E20001: '陈建国',
  E30001: '周子谦',
}

const title = computed(() => String(route.meta.title ?? '科技专家直接关系'))
const featureName = computed(() => String(route.meta.featureName ?? `${title.value}推理构建`))
const {
  endpoint,
  form,
  fieldOptions,
  loading,
  errorMessage,
  response,
  lastTestTime,
  apiExampleText,
  requestFields,
  responseFields,
  codeSamples,
  execute,
} = useExpertDirectRelation(() => true)

function toggleCombo(field: 'expert_id' | 'organization') {
  activeComboField.value = activeComboField.value === field ? null : field
}

function selectComboOption(field: 'expert_id' | 'organization', value: string) {
  form[field] = value
  activeComboField.value = null
}

function formatExpertOption(value: string) {
  return expertOptionNames[value] ?? value
}

function parseExpertOption(value: string) {
  return Object.entries(expertOptionNames).find(([, name]) => name === value)?.[0] ?? value
}

function handleExpertInput(event: Event) {
  form.expert_id = parseExpertOption((event.target as HTMLInputElement).value)
}

function handleOrganizationInput(event: Event) {
  form.organization = (event.target as HTMLInputElement).value
}

function closeModal() {
  showConfigModal.value = false
  showTechModal.value = false
  activeComboField.value = null
}

async function handleExecute() {
  await execute()
}

async function handleSaveAndExecute() {
  showConfigModal.value = false
  await handleExecute()
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
        <select class="select-with-icon">
          <option>{{ featureName }}</option>
        </select>
        <img class="select-icon" :src="iconSelectArrow" alt="" aria-hidden="true" />
        <img class="field-info-icon" :src="iconInfo" alt="" aria-hidden="true" />
      </label>
      <div class="reasoning-placeholder__actions">
        <button class="kg-button kg-button--secondary" type="button" @click="showConfigModal = true">参数设置</button>
        <button class="kg-button" type="button" :disabled="loading" @click="handleExecute">
          {{ loading ? '查询中...' : '执行测试' }}
        </button>
      </div>
    </section>

    <main v-if="activeView === 'test'" class="reasoning-placeholder__main">
      <section class="kg-panel reasoning-placeholder__graph">
        <div class="kg-panel__header">
          <h2 class="kg-panel__title">测试结果预览</h2>
          <div class="reasoning-placeholder__time">最近测试时间：{{ lastTestTime }}</div>
        </div>
        <div class="reasoning-placeholder__canvas">
          <ExpertDirectGraphPanel
            :title="title"
            :loading="loading"
            :error-message="errorMessage"
            :response="response"
          />
        </div>
      </section>

      <ExpertDirectDetailPanel
        :result-mode="resultMode"
        :api-example-text="apiExampleText"
        :loading="loading"
        :error-message="errorMessage"
        :response="response"
        @update:result-mode="resultMode = $event"
      />
    </main>

    <ExpertDirectDeveloperPanel
      v-if="activeView === 'developer'"
      :feature-name="featureName"
      :endpoint="endpoint"
      :request-fields="requestFields"
      :response-fields="responseFields"
      :code-samples="codeSamples"
    />

    <div v-if="showConfigModal || showTechModal" class="modal-mask" @click.self="closeModal">
      <section v-if="showConfigModal" class="modal modal--config" role="dialog" aria-modal="true">
        <header class="modal__header">
          <h2><img :src="iconModalSetting" alt="" aria-hidden="true" />测试参数设置</h2>
          <div class="modal__header-extra">
            <span class="modal__required"><span>*</span> 为必填项</span>
            <button type="button" @click="showConfigModal = false"><img :src="iconClose" alt="" aria-hidden="true" /></button>
          </div>
        </header>
        <div class="modal__body config-form" @click="activeComboField = null">
          <label>
            <span><i>*</i>expert_id</span>
            <div class="combo-field" @click.stop>
              <input :value="formatExpertOption(form.expert_id)" placeholder="请选择或输入专家姓名" @focus="activeComboField = 'expert_id'" @input="handleExpertInput" />
              <button class="combo-field__arrow" type="button" @click="toggleCombo('expert_id')">
                <img :src="iconSelectArrow" alt="" aria-hidden="true" />
              </button>
              <div v-if="activeComboField === 'expert_id'" class="combo-field__menu">
                <button
                  v-for="value in fieldOptions.expert_id"
                  :key="value"
                  type="button"
                  :class="{ 'is-selected': form.expert_id === value }"
                  @click="selectComboOption('expert_id', value)"
                >
                  {{ formatExpertOption(value) }}
                </button>
              </div>
            </div>
          </label>
          <label>
            <span>organization</span>
            <div class="combo-field" @click.stop>
              <input :value="form.organization" placeholder="请选择或输入机构/项目关键词" @focus="activeComboField = 'organization'" @input="handleOrganizationInput" />
              <button class="combo-field__arrow" type="button" @click="toggleCombo('organization')">
                <img :src="iconSelectArrow" alt="" aria-hidden="true" />
              </button>
              <div v-if="activeComboField === 'organization'" class="combo-field__menu">
                <button
                  v-for="value in fieldOptions.organization"
                  :key="value"
                  type="button"
                  :class="{ 'is-selected': form.organization === value }"
                  @click="selectComboOption('organization', value)"
                >
                  {{ value }}
                </button>
              </div>
            </div>
          </label>
          <label>
            <span>start_time</span>
            <input v-model="form.start_time" type="date" />
          </label>
          <label>
            <span>end_time</span>
            <input v-model="form.end_time" type="date" />
          </label>
        </div>
        <footer class="modal__footer">
          <button class="kg-button kg-button--secondary" type="button" @click="showConfigModal = false">取消</button>
          <button class="kg-button" type="button" @click="handleSaveAndExecute">保存并执行</button>
        </footer>
      </section>

      <section v-if="showTechModal" class="modal modal--tech" role="dialog" aria-modal="true">
        <header class="modal__header">
          <h2>技术方案</h2>
          <button type="button" @click="showTechModal = false"><img :src="iconClose" alt="" aria-hidden="true" /></button>
        </header>
        <div class="modal__body">
          <h3 class="modal__section-title">功能描述</h3>
          <p class="modal__desc">
            科技专家/人才直接关系服务通过专家履历、论文成果、项目成员、机构任职等直接交互数据，结合知识图谱实体属性与关系信息，识别专家之间的直接关联类型、发生时间、关联场景及相关成果。
          </p>
          <h3 class="modal__section-title">推理流程</h3>
          <div class="flow-steps">
            <div class="flow-step"><img :src="flowInput" alt="" /><strong>输入数据</strong><span>查询参数与筛选条件</span></div>
            <img class="flow-step__arrow flow-step__arrow--one" :src="flowArrow" alt="" />
            <div class="flow-step"><img :src="flowStandardize" alt="" /><strong>标准化处理</strong><span>姓名、机构与时间条件归一化</span></div>
            <img class="flow-step__arrow flow-step__arrow--two" :src="flowArrow" alt="" />
            <div class="flow-step"><img :src="flowReasoning" alt="" /><strong>关系推理</strong><span>直接关系查询与图谱组装</span></div>
            <img class="flow-step__arrow flow-step__arrow--three" :src="flowArrow" alt="" />
            <div class="flow-step"><img :src="flowOutput" alt="" /><strong>结果输出</strong><span>图谱、详情卡片与接口示例</span></div>
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
  gap: var(--space-12);
}

.reasoning-placeholder__toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  min-height: 46px;
  padding: 0 var(--space-16);
}

.reasoning-placeholder__controls {
  display: grid;
  grid-template-columns: 420px minmax(220px, 1fr);
  gap: var(--space-12);
  align-items: end;
  min-height: 44px;
  padding: 0 var(--space-16) var(--space-4);
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
  height: var(--control-height);
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

.reasoning-placeholder__controls .select-icon {
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
  gap: var(--space-16);
  flex: 1;
  min-height: 0;
  padding: var(--space-16);
  border-radius: var(--radius-md);
  background: var(--surface-subtle);
  overflow: hidden;
}

.reasoning-placeholder__graph {
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
  place-items: stretch;
  background: var(--surface);
  overflow: hidden;
}

.reasoning-placeholder__summary {
  display: flex;
  align-items: center;
  gap: 12px;
  margin: 12px 16px 0;
  padding: 10px 14px;
  border: 1px solid rgba(79, 140, 255, 0.18);
  border-radius: 12px;
  background: rgba(79, 140, 255, 0.06);
  color: var(--text-primary);
}

.reasoning-placeholder__summary strong {
  color: #2d65f6;
  font-size: 14px;
}

.reasoning-placeholder__summary span {
  color: var(--text-secondary);
  font-size: 13px;
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
  width: 560px;
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
  grid-template-columns: 96px 1fr;
  align-items: center;
  gap: var(--space-8);
}

.config-form label span {
  display: inline-flex;
  color: #86909c;
  font-weight: 400;
}

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

.config-form select {
  appearance: none;
  -webkit-appearance: none;
  padding-right: 34px;
  background-image: none;
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
  color: #86909c;
  cursor: pointer;
  background: transparent;
  text-align: left;
}

.combo-field__menu button:hover,
.combo-field__menu button.is-selected {
  color: var(--primary);
  background: rgba(47, 102, 246, 0.08);
}

.calendar-icon {
  right: 10px;
}

.date-field {
  position: relative;
  min-width: 0;
}

.date-field input {
  width: 100%;
  padding-right: 42px;
  cursor: pointer;
}

.date-field__icon {
  position: absolute;
  top: 50%;
  z-index: 2;
  display: grid;
  place-items: center;
  border: 0;
  cursor: pointer;
  background: transparent;
  transform: translateY(-50%);
}

.date-field__icon {
  right: 8px;
  width: 28px;
  height: 28px;
}

.date-field__icon .calendar-icon {
  position: static;
  width: 14px;
  height: 14px;
  transform: none;
}

.calendar-popover {
  position: absolute;
  z-index: 30;
  top: calc(100% + 6px);
  right: 0;
  width: 252px;
  padding: 10px;
  border: 1px solid var(--border);
  border-radius: var(--radius-md);
  background: var(--surface);
  box-shadow: 0 12px 32px rgba(29, 33, 41, 0.16);
}

.calendar-popover__header {
  display: grid;
  grid-template-columns: 28px 1fr 28px;
  align-items: center;
  margin-bottom: 8px;
}

.calendar-popover__header strong {
  color: var(--text-primary);
  font-size: 13px;
  font-weight: 600;
  text-align: center;
}

.calendar-popover__header button,
.calendar-popover__days button {
  border: 0;
  cursor: pointer;
  background: transparent;
}

.calendar-popover__header button {
  height: 28px;
  border-radius: var(--radius-sm);
  color: var(--text-secondary);
  font-size: 18px;
}

.calendar-popover__header button:hover,
.calendar-popover__days button:hover {
  background: var(--surface-subtle);
}

.calendar-popover__week,
.calendar-popover__days {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
}

.calendar-popover__week span {
  height: 24px;
  color: var(--text-tertiary);
  font-size: 12px;
  line-height: 24px;
  text-align: center;
}

.calendar-popover__days button {
  height: 28px;
  border-radius: var(--radius-sm);
  color: var(--text-primary);
  font-size: 12px;
}

.calendar-popover__days button.is-muted {
  color: var(--text-tertiary);
}

.calendar-popover__days button.is-selected {
  color: #fff;
  background: var(--primary);
}

.calendar-popover__footer {
  display: flex;
  justify-content: flex-end;
  margin-top: 8px;
  padding-top: 8px;
  border-top: 1px solid var(--border);
}

.calendar-popover__footer button {
  height: 26px;
  padding: 0 10px;
  border: 0;
  border-radius: var(--radius-sm);
  color: var(--text-secondary);
  cursor: pointer;
  background: var(--surface-subtle);
  font-size: 12px;
}

.calendar-popover__footer button:hover {
  color: var(--primary);
  background: rgba(47, 102, 246, 0.08);
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
