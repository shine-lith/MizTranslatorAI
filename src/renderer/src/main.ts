import { createApp } from 'vue'
import router from './router'
import App from './App.vue'
import PrimeVue from 'primevue/config'
import Aura from '@primeuix/themes/aura'
import { definePreset } from '@primeuix/themes'
import ToastService from 'primevue/toastservice'
import ChatBubble from './components/ChatBubble.vue'

const MyPreset = definePreset(Aura, {
  semantic: {
    primary: {
      50: '{gray.50}',
      100: '{gray.100}',
      200: '{gray.200}',
      300: '{gray.300}',
      400: '{gray.400}',
      500: '{gray.500}',
      600: '{gray.600}',
      700: '{gray.700}',
      800: '{gray.800}',
      900: '{gray.900}',
      950: '{gray.950}'
    }
  }
})

router.afterEach((to, from) => {
  if (to.path !== from.path) {
    const toDepth = to.path.split('/').filter((item) => item !== '').length
    const fromDepth = from.path.split('/').filter((item) => item !== '').length
    to.meta.transition = toDepth < fromDepth ? 'slide-out' : 'slide-in'
  }
})

const app = createApp(App)
app.use(router)
app.use(ToastService)
app.use(PrimeVue, {
  theme: {
    preset: MyPreset,
    options: {
      cssLayer: {
        name: 'primevue',
        order: 'theme, base, primevue'
      }
    }
  }
})
app.component('ChatBubble', ChatBubble)
app.mount('#app')
