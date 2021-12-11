export default {
  namespaced: true,
  state: {
    initLoading: false,
    exePath: "", // 根目录
    locainfo: {}, // loca文件信息
    selfinfo: {}, // 自己的信息
    userList: [], // 好友列表
    groupList: [], // 分组列表
    blackList: [], // 黑名单列表
    roomOwner: [], // 房主列表
    qqGroupList: [], // QQ群列表
    rulesImages: [], // 规则图片列表
    roomInfo: null, // 房间信息
    draguserrelease_mask: false, // 拖拽释放遮罩
    champSelect: false, // 英雄选择状态
    gameStatus: false, // 游戏状态
  },
  /**
   * actions 通过 this.$store.dispatch 来调用
   * 可以异步请求，放置一些业务代码
   */
  actions: {},
  /**
   * mutations 通过 this.$store.commit('list/set', ['', {}]) 来调用
   * 专注于修改 state 不能异步 state相关的操作尽量在 mutations中完成
   */
  mutations: {
    /**
     * @description 设置列表数据
     * @param {Object} state
     */
    set(state, [name, data]) {
      state[name] = data;
    },
  },
};
