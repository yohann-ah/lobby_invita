import api from "@/api";
import util from "@/libs/util";

export default {
  namespaced: true,
  state: {
    userinfo: util.store.getItem("userinfo"),
  },
  actions: {
    async check() {
      await api.CHECK_TOKEN().catch(() => {
        this.commit("user/remove");
      });
    },
  },
  /**
   * mutations 通过 this.$store.commit 来调用
   * 专注于修改 state 不能异步 state相关的操作尽量在 mutations中完成
   */
  mutations: {
    /**
     * @description 设置数据
     * @param {Object} state
     * @param {*} info info
     */
    set(state, info) {
      let userinfo = Object.assign({}, state.userinfo, info);
      util.store.setItem("userinfo", userinfo);
      if (userinfo.token) {
        util.store.setItem("token", userinfo.token);
        delete userinfo.token;
      }
      state.userinfo = userinfo;
    },
    /**
     * 清空登录数据
     * @param {*} state 状态管理
     */
    remove(state) {
      util.store.delItem("userinfo");
      state.userinfo = null;
    },
  },
};
