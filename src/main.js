import Vue from "vue";
import App from "./App.vue";
import router from "./router";
import store from "./store";
import Icon from "@/components/Iconfont.vue";
import Popups from "@/components/Popups";
import ElementUI from "element-ui";
import api from "@/api";
import util from "@/libs/util";
import "element-theme-dark";
import "./assets/hextech/hextech.min.css";
import Contextmenu from "vue-contextmenujs";

Vue.component("icon", Icon);
Vue.use(Contextmenu);
Vue.config.productionTip = false;
Vue.prototype.Popups = Popups;
Vue.use(ElementUI);

// 循环的计时器
Vue.prototype.looptimer = null;

Vue.prototype.initialize = async function () {
  try {
    // 获取QQ群列表
    let qqGroupList = await util.read.readQqGroup();
    this.$store.commit("list/set", ["qqGroupList", qqGroupList]);

    this.$store.commit("list/set", ["initLoading", true]);
    this.looptimer && clearInterval(this.looptimer);
    await new Promise((resolve) => setTimeout(resolve, 500));

    // 获取游戏目录
    if (!this.exePath) {
      let exePath = await api.GET("/get/exe");
      if (!exePath) throw Error("游戏目录获取失败，请手动选择目录");
      this.$store.commit("list/set", ["exePath", exePath]);
    } else console.log("已有游戏目录");

    // 获取 loca文件信息
    let locainfo = await api.GET("/get/loca", { path: this.exePath });
    // if (!locainfo) throw Error("游戏客户端异常");
    this.$store.commit("list/set", ["locainfo", locainfo]);

    this.$store.commit("list/set", ["initLoading", false]);

    // 创建定时器
    this.looptimer = setInterval(async () => {
      try {
        // 获取用户信息
        let userInfo = await api.GET("/get/self").catch(() => {});
        // if (!userInfo) throw Error("游戏客户端异常");
        // console.log(userInfo);
        this.$store.commit("list/set", ["selfinfo", userInfo]);

        // 获取黑名单
        let backList = await util.read.readBlackList();
        if (!backList) throw Error("获取黑名单异常");
        backList.forEach((user) => {
          // 判断黑名单的ID 或者昵称 等于自己 跳转到黑名单页面不给使用软件
          if (
            user.id === userInfo.summonerId ||
            user.name === userInfo.displayName ||
            user.name === userInfo.internalName
          ) {
            this.$router.replace({ name: "Black" });
            this.looptimer && clearInterval(this.looptimer);
          }
        });
        this.$store.commit("list/set", ["blackList", backList]);

        // 房主列表信息
        let roomOwner = await util.read.readHomeOwner();
        if (!roomOwner) throw Error("获取房主列表出错");
        this.$store.commit("list/set", ["roomOwner", roomOwner]);

        // 规则图片
        let rulesImages = await util.read.readRules();
        if (!rulesImages) throw Error("获取房主列表出错");
        this.$store.commit("list/set", ["rulesImages", rulesImages]);

        // 获取好友/分组信息
        let friends = await api.GET("/get/users");
        // if (!friends) throw Error("游戏客户端异常");
        this.$store.commit("list/set", ["userList", friends.userlist]);
        this.$store.commit("list/set", ["groupList", friends.groupList]);

        // 获取房间信息
        let roomInfo = await api.GET("/get/room");
        this.$store.commit("list/set", ["roomInfo", roomInfo]);

        // 获取是否英雄选择页面
        // await connection.request('GET', '/lol-champ-select/v1/pickable-champion-ids')
        let selectStatus = await api.POST("/api/send", {
          type: "get",
          url: "/lol-champ-select/v1/pickable-champion-ids",
        });
        // No active delegate
        if (!selectStatus || typeof selectStatus == "string") {
          this.$store.commit("list/set", ["champSelect", false]);
          let gameStatus = await api
            .GET("/game/stats", {}, 100)
            .catch(() => {});
          if (!gameStatus || typeof gameStatus == "string") {
            this.$store.commit("list/set", ["gameStatus", false]);
          } else {
            this.$store.commit("list/set", ["gameStatus", true]);
          }
        } else {
          this.$store.commit("list/set", ["champSelect", true]);
        }
      } catch (err) {
        this.$message.closeAll();
        this.$message.error(err.message);
      }
    }, 500);
  } catch (err) {
    this.$message.error(err.message);
    this.$store.commit("list/set", ["initLoading", false]);
  }
};

new Vue({
  router,
  store,
  render: (h) => h(App),
}).$mount("#app");
