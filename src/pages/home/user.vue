<template>
  <div class="user-item" @click="clickUser" @contextmenu="userContextmenu">
    <img
      v-if="!user.isBot"
      :src="
        'https://ddragon.leagueoflegends.com/cdn/11.15.1/img/profileicon/' +
        user.summonerIconId +
        '.png'
      "
      alt=""
    />
    <div class="name" v-if="!user.isBot">{{ user.summonerName }}</div>

    <!-- 机器人 -->
    <img
      v-if="user.isBot"
      :src="
        'https://ddragon.leagueoflegends.com/cdn/11.15.1/img/profileicon/' +
        0 +
        '.png'
      "
      alt=""
    />
    <div class="name" v-if="user.isBot">{{ botName }}</div>

    <div
      class="master"
      v-if="roomInfo.localMember.summonerId === user.summonerId"
    >
      <i class="el-icon-s-flag"></i>
    </div>
    <!-- <div class="kick" @click="kickUsers">
      <i class="el-icon-close"></i>
    </div> -->
  </div>
</template>

<script>
import { mapState } from "vuex";
const electron = window.require("electron");
export default {
  props: {
    user: Object,
    bots: Array,
  },
  computed: {
    ...mapState("list", ["roomInfo"]),
    botName() {
      if (!this.user.isBot) return "";
      let name = "机器人";
      this.bots.forEach((item) => {
        if (item.id === this.user.botChampionId) {
          name = item.name;
        }
      });
      return name;
    },
  },
  data() {
    return {};
  },
  methods: {
    clickUser() {
      console.log(this.roomInfo);
    },
    userContextmenu() {
      this.$contextmenu({
        items: [
          {
            label: "复制召唤师ID",
            onClick: () => {
              electron.clipboard.writeText(this.user.summonerId.toString());
              this.$message.success("复制成功");
            },
          },
          {
            label: "复制召唤师名称",
            onClick: () => {
              electron.clipboard.writeText(this.user.name);
              this.$message.success("复制成功");
            },
          },
        ],
        event: window.event,
        customClass: "userContextmenu",
        zIndex: 10,
      });
    },
    async kickUsers() {
      if (this.user.isBot) {
        console.log(this.user);
        // await api
        //   .POST("/api/send", {
        //     type: "post",
        //     url: "/lol-lobby/v1/lobby/custom/bots/",
        //   })
        //   .then((res) => {
        //     console.log(res);
        //   });
      }
    },
  },
};
</script>

<style lang="scss" scoped>
.user-item {
  display: flex;
  align-items: center;
  height: 59px;
  // border-bottom: 1px solid #626262;
  margin-bottom: 1px;
  color: #c89b3c;
  font-size: 20px;
  background: rgba(255, 255, 255, 0.1);
  padding: 0 10px;
  img {
    width: 36px;
    height: 36px;
    border-radius: 50%;
    border: 2px solid #62532e;
    margin-right: 10px;
  }
  .name {
    flex: 1;
  }
  .kick {
    font-size: 26px;
    font-weight: 400;
    cursor: pointer;
    transition: all 0.1s;
    transform-origin: center;
    &:hover {
      transform: scale(1.2);
    }
  }
  &:hover {
    background: rgba(255, 255, 255, 0.2);
  }
}
</style>
