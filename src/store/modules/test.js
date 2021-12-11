export default {
  namespaced: true,
  state: {
    info: "",
  },
  /**
   * actions 通过 this.$store.dispatch 来调用
   * 可以异步请求，放置一些业务代码
   */
  actions: {
    /**
     * @description 设置数据
     * @param {Object} context
     * @param {*} info info
     */
    async set({ state }, info) {
      // store 赋值
      state.info = info;
    },
  },
  /**
   * mutations 通过 this.$store.commit() 来调用
   * 专注于修改 state 不能异步 state相关的操作尽量在 mutations中完成
   */
  mutations: {
    /**
     * @description 设置数据
     * @param {Object} state
     * @param {*} info info
     */
    set(state, info) {
      state.info = info;
    },
  },
};
