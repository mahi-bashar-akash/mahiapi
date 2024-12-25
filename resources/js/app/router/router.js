import {createRouter, createWebHistory} from "vue-router";

// === === === === Portal layout === === === === //
import Layout from "../layout/layout.vue";
import Posts from "../pages/post.vue";
import Comments from "../pages/comments.vue";
import Albums from "../pages/album.vue";
import Users from "../pages/user.vue";

// === === === === Routes Declare === === === === //
const routes = [
    {
        path: '', name: 'portalLayout', component: Layout,
        children: [
            {path: '', name: 'Posts', component: Posts},
            {path: 'comments', name: 'Comments', component: Comments},
            {path: 'albums', name: 'Albums', component: Albums},
            {path: 'users', name: 'Users', component: Users},
        ]
    },
];

// === === === === Routes create router as show history and scroll behavior === === === === //
const router = createRouter({
    history: createWebHistory(), routes,
    scrollBehavior(to, from, savedPosition) {
        if (to.hash) {
            return {el: to.hash, behavior: 'smooth'};
        } else {
            return {top: 0, behavior: 'smooth'};
        }
    }
});

export default router;
