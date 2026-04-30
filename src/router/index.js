import { createRouter, createWebHistory } from 'vue-router'
import QNAPage from '../views/QNAPage.vue'

const routes = [
    {
        path: '/',
        redirect: '/qna',
    },
    {
        path: '/qna',
        name: 'QNA',
        component: QNAPage,
    },
]

const router = createRouter({
    history: createWebHistory(),
    routes,
    scrollBehavior() {
        return { top: 0 }
    },
})

export default router