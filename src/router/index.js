import Vue from "vue";
import VueRouter from "vue-router";
import LayoutPage1 from "@/components/layout/LayoutPage1.vue";

const originalPush = VueRouter.prototype.push;

VueRouter.prototype.push = function push(location) {
  return originalPush.call(this, location).catch((err) => {
    console.log(err);
  });
};

VueRouter.prototype.replace = function push(location) {
  return originalPush.call(this, location).catch((err) => err);
};

Vue.use(VueRouter);

const routes = [
  {
    path: "/",
    redirect: { name: "Home" },
    component: LayoutPage1,
    children: [
      // 登录
      {
        path: "home",
        name: "Home",
        meta: { title: "首页" },
        component: () => import("../pages/home/"),
      },
      // 登录
      {
        path: "login",
        name: "Login",
        meta: { title: "用户登录" },
        component: () => import("../pages/login/"),
      },
    ],
  },
  {
    path: "black",
    name: "Black",
    meta: { title: "黑名单人员" },
    component: () => import("../pages/black/"),
  },
];

const router = new VueRouter({
  routes,
});

router.beforeEach((to, from, next) => {
  window.scrollTo(0, 0);
  if (to.meta.title) {
    //判断是否有标题
    document.title = to.meta.title;
  }
  next();
});

export default router;
