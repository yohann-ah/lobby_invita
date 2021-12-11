import Vue from "vue";
import Vuex from "vuex";

import store from "./store";

Vue.use(Vuex);

// 调用mutations
// this.$store.commit("test/set", "调用mutations");

// 调用actions
// this.$store.dispatch("test/set", "调用actions");

// 获取state
// import { mapState } from "vuex";
// computed: {
//   ...mapState("test", ["info"])
// }

export default new Vuex.Store({
  namespaced: true,
  modules: store,
});
