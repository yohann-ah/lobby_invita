<template>
  <i class="iconfont" :class="name" :style="{ fontSize }"></i>
</template>

<script>
export default {
  props: {
    // 图标名称
    name: String,
    // 图标大小，默认继承父级的字体大小
    size: {
      type: [Number, String],
    },
  },
  computed: {
    fontSize() {
      if (this.size) {
        return this.size + "px";
      } else {
        return "inherit";
      }
    },
  },
};
</script>

<style lang="scss" scoped>
.iconfont {
  vertical-align: middle;
}
</style>
