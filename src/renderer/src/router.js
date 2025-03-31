import { createMemoryHistory, createRouter } from 'vue-router'

import Home from './Home.vue'
import Preference from './Preference.vue'

const routes = [
    { path: '/', component: Home },
    { path: '/preference', component: Preference },
]

const router = createRouter({
    history: createMemoryHistory(),
    routes,
})

export default router