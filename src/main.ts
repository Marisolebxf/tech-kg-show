import 'ant-design-vue/dist/reset.css'
import './styles/tokens.css'
import './styles/reset.css'
import './styles/global.css'

import Antd from 'ant-design-vue'
import { createPinia } from 'pinia'
import { createApp } from 'vue'

import App from './App.vue'
import { router } from './router'

const scrollingTimers = new WeakMap<Element, number>()

function revealScrollbar(target: EventTarget | null) {
  const element =
    target instanceof Element
      ? target
      : document.scrollingElement ?? document.documentElement
  element.classList.add('kg-is-scrolling')
  const previousTimer = scrollingTimers.get(element)
  if (previousTimer) {
    window.clearTimeout(previousTimer)
  }
  scrollingTimers.set(
    element,
    window.setTimeout(() => {
      element.classList.remove('kg-is-scrolling')
      scrollingTimers.delete(element)
    }, 900),
  )
}

window.addEventListener('scroll', (event) => revealScrollbar(event.target), true)
window.addEventListener('wheel', (event) => revealScrollbar(event.target), { passive: true, capture: true })
window.addEventListener('touchmove', (event) => revealScrollbar(event.target), { passive: true, capture: true })

createApp(App).use(createPinia()).use(router).use(Antd).mount('#app')
