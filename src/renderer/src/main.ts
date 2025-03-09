import './assets/main.css'

import { createApp } from 'vue'
import App from './App.vue'
import PrimeVue from 'primevue/config'
import Aura from '@primeuix/themes/aura'
import { definePreset } from '@primeuix/themes'
import ToastService from 'primevue/toastservice'
import MyBubble from './components/MyBubble.vue'

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
app.component('MyBubble', MyBubble)
app.mount('#app')
