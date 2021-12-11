<template>
  <div class="pages">
    <div class="tit">您处于黑名单列表，无法使用本软件</div>
    <div class="info">
      <div class="item">
        查看黑名单：<a @click="jumpUrl">{{ blackDocUrl }}</a>
      </div>
    </div>
    <button @click="restartApp" class="button is-secondary is-tiny">
      刷新重试
    </button>
    <a class="closeApp" @click="closeApp">关闭软件</a>
  </div>
</template>

<script>
const electron = window.require("electron");
export default {
  name: "Black",
  data() {
    return {
      blackDocids: window.GetGameDataList.docids[0],
    };
  },
  computed: {
    blackDocUrl() {
      return "https://docs.qq.com/sheet/" + this.blackDocids;
    },
  },
  methods: {
    jumpUrl() {
      electron.shell.openExternal(this.blackDocUrl);
    },
    closeApp() {
      electron.ipcRenderer.send("closeapp");
    },
    restartApp() {
      this.$router.replace({ name: "Home" });
      this.initialize();
    },
  },
};
</script>

<style lang="scss" scoped>
.pages {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  -webkit-app-region: drag;
  position: relative;
  z-index: 10;
  .tit {
    font-size: 34px;
    margin-bottom: 25px;
  }
  .info {
    margin-bottom: 25px;
    .item {
      -webkit-app-region: no-drag;
      a {
        cursor: pointer;
        &:hover {
          text-decoration: underline;
        }
      }
    }
  }
  .button {
    -webkit-app-region: no-drag;
    margin-bottom: 20px;
  }
  .closeApp {
    -webkit-app-region: no-drag;
    cursor: pointer;
    &:hover {
      text-decoration: underline;
    }
  }
}
</style>
