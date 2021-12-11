<template>
  <div
    id="app"
    :style="{ transform: 'scale(' + zoom + ')' }"
    v-loading="initLoading"
    element-loading-text="初始化"
    element-loading-background="rgba(0, 0, 0, 0.8)"
  >
    <router-view />
    <div class="background">
      <img src="./assets/bg/2.jpg" />
    </div>
  </div>
</template>

<script>
import { mapState } from "vuex";
import config from "@/libs/util.store";

const electron = window.require("electron");
// Vue.prototype
export default {
  data() {
    return {
      loading: true,
      zoom: 1,
      first: false,
      win_size: [1280, 720],
    };
  },
  computed: {
    ...mapState("list", [
      "initLoading",
      "exePath",
      "locainfo",
      "userList",
      "blackList",
      "roomOwner",
    ]),
  },
  watch: {
    initLoading() {
      if (this.initLoading && !this.first) {
        this.first = true;
        const h = this.$createElement;
        this.$msgbox({
          title: "友情提示",
          showClose: false,
          closeOnClickModal: false,
          message: h("p", null, [
            h(
              "span",
              null,
              "请遵守游戏规则，文明游戏，多次违规将被添加到黑名单并且无法使用本工具！"
            ),
            h("a", { style: "color: yellow" }, "请添加Q群 了解游戏规则"),
          ]),
          confirmButtonText: "确定",
        });
      }
    },
  },
  created() {
    window.addEventListener("resize", this.setWindowZoom);
    this.setWindowZoom();

    this.initialize();

    let win_size = config.getItem("win_size");
    this.win_size = win_size || [1280, 720];

    let win = electron.remote.getCurrentWindow();
    win.setResizable(window.location.host === "127.0.0.1:8080");
  },
  methods: {
    // async ,
    setWindowZoom() {
      this.zoom = document.body.clientWidth / 1280;
    },
  },
};
</script>

<style lang="scss">
body,
html {
  width: 100%;
  height: 100%;
  box-sizing: border-box;
  padding: 0;
  margin: 0;
  background: #f6f6f8;
  font-family: pingFangSC, Helvetica, Arial, sans-serif;
  overflow: hidden;
  background: #000000;
}

.userContextmenu {
  background: #010a13 !important;
  border: 2px solid #dbae60;
  border-radius: 0 !important;
  .menu_item {
    &:hover {
      background: #1e2328 !important;
      color: #fff !important;
    }
  }
}

// .el-loading-mask {
//   background-color: rgba(0, 0, 0, 0.8) !important;
// }

#app {
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: #cdbe91;
  width: 1280px;
  height: 720px;
  user-select: none;
  transform-origin: top left;
  position: relative;
  .background {
    width: 100%;
    height: 100%;
    opacity: 0.3;
    position: absolute;
    top: 0;
    left: 0;
    z-index: 1;
    img {
      width: 100%;
      height: 100%;
    }
  }
}
</style>
