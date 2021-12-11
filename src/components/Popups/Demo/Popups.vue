<template>
  <transition name="fade">
    <div id="PopupsBox" v-if="popupsShow" @click="popupsShow = false">
      <div class="PopupsBox" @click.stop="() => {}"></div>
    </div>
  </transition>
</template>

<script>
export default {
  data() {
    return {
      popupsShow: false,
    };
  },
  methods: {
    show(config) {
      console.log(config);
      this.popupsShow = true;
    },
  },
};
</script>

<style lang="scss" scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.5s;
}
.fade-enter, .fade-leave-to /* .fade-leave-active, 2.1.8 版本以下 */ {
  opacity: 0;
}
#PopupsBox {
  position: fixed;
  top: 0;
  left: 0;
  bottom: 0;
  right: 0;
  z-index: 1000;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  .PopupsBox {
    width: 500px;
    height: 500px;
    background: #fff;
  }
}
</style>
