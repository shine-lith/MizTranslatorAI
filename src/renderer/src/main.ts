import './assets/main.css'

import { createApp } from 'vue'
import router from './router'
import App from './App.vue'
import PrimeVue from 'primevue/config'
import Aura from '@primeuix/themes/aura'
import { definePreset } from '@primeuix/themes'
import ToastService from 'primevue/toastservice'
import ChatBubble from './components/ChatBubble.vue'

const MyPreset = definePreset(Aura, {
  components: {
    button: {
      border: {
        radius: '0px'
      }
    }
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
