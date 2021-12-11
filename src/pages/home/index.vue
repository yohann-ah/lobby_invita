<template>
  <div
    class="pages"
    id="home-page"
    v-loading="loading"
    @dragenter="dragenter"
    @dragleave="dragleave"
    element-loading-text="创建房间"
    element-loading-background="rgba(0, 0, 0, 0.8)"
  >
    <div class="drag-release" v-if="draguserrelease_mask">
      <span v-if="dragrelease_mask">释放，完成邀请</span>
      <span v-else>拖动到此处</span>
    </div>
    <div class="game-status" v-if="gameStatus || champSelect">
      <span v-if="gameStatus">游戏中</span>
      <span v-if="champSelect">英雄选择</span>
    </div>
    <div class="qq-group-list" v-for="(item, i) in qqGroupList" :key="i">
      <div
        class="qq-group-item"
        title="添加Q群，查看规则寻找开黑小伙伴"
        @click="openLink(item.link)"
      >
        <span>{{ numText[i] }}群</span>
        <img src="http://pub.idqqimg.com/wpa/images/group.png" alt="" />
      </div>
    </div>
    <div class="roomName" v-show="!roomInfo">
      <span>房间名称： </span>
      <input type="text" v-model="roomName" placeholder="房间名称" />
    </div>
    <div class="roomType" v-show="!roomInfo">
      <div class="card" v-for="item in roomType" :key="item.id">
        <span></span> <span></span> <span></span> <span></span>
        <div class="content">
          <h2>{{ item.title }}</h2>
          <p>{{ item.desc }}</p>
          <button
            class="button is-secondary is-tiny"
            @click="createdRoom(item)"
          >
            创建房间
          </button>
        </div>
      </div>
    </div>
    <div class="roomInfo" v-if="roomInfo">
      <div class="room-name">
        <div class="name">
          {{ roomInfo.gameConfig.customLobbyName }}
          <span
            v-if="
              roomInfo.gameConfig.customMutatorName == 'GAME_CFG_PICK_BLIND'
            "
          >
            自选模式
          </span>
          <span
            v-if="
              roomInfo.gameConfig.customMutatorName == 'GAME_CFG_PICK_RANDOM'
            "
          >
            全随机
          </span>
          <span
            v-if="
              roomInfo.gameConfig.customMutatorName ==
              'GAME_CFG_DRAFT_TOURNAMENT'
            "
          >
            征召模式
          </span>
        </div>
        <div class="room-type">
          <button
            class="button is-secondary is-tiny"
            v-for="item in roomType"
            :key="item.id"
            @click="createdRoom(item)"
          >
            {{ item.title }}
          </button>
        </div>
      </div>
      <div class="wanjia-list">
        <div class="invit_box">
          <div class="invit_name">
            <el-input
              class="input_text"
              v-model="invit_name"
              placeholder="通过召唤师名称邀请"
              size="mini"
            ></el-input>
            <el-button
              size="mini"
              type="primary"
              icon="el-icon-plus"
              @click="invitToName"
            ></el-button>
          </div>
          <div class="invit_list">
            <invit
              :invit="invit"
              v-for="(invit, index) in invit_list"
              :key="index"
            />
          </div>
        </div>
        <div class="spec"></div>
        <div class="team team-one">
          <user
            :user="user"
            :bots="botsList"
            v-for="(user, index) in roomInfo.gameConfig.customTeam100"
            :key="index"
          />
          <div
            class="switch_teams"
            v-show="roomInfo.gameConfig.customTeam100.length < 5"
          >
            <button class="button is-secondary is-tiny" @click="switchTeams">
              加入
            </button>
          </div>
        </div>
        <div class="spec"></div>
        <div class="team team-two">
          <user
            :user="user"
            :bots="botsList"
            v-for="(user, index) in roomInfo.gameConfig.customTeam200"
            :key="index"
          />
          <div
            class="switch_teams"
            v-show="roomInfo.gameConfig.customTeam200.length < 5"
          >
            <button class="button is-secondary is-tiny" @click="switchTeams">
              加入
            </button>
          </div>
        </div>
      </div>
      <div class="game-tips">好友列表拖拽到房间列表中，可以快速邀请</div>
      <div class="room-option">
        <button class="button is-secondary is-tiny" @click="delGame">
          退出房间
        </button>
        <button class="button is-secondary is-tiny" @click="startGame">
          开始游戏
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import api from "@/api";
import config from "@/libs/util.store";
import { mapState } from "vuex";
import user from "./user.vue";
import invit from "./invit.vue";
const electron = window.require("electron");
export default {
  name: "Home",
  components: { user, invit },
  data() {
    return {
      loading: false,
      dragrelease_mask: false,
      roomName: "5V5训练 全随机模式",
      invitTimer: null,
      invit_name: "",
      botsList: [],
      invit_list: [],
      numText: "一二三四五六七八九十",
      roomType: [
        {
          title: "自选",
          desc: "自选模式：可以只有选择除规则禁止之外的英雄，",
          id: 1,
        },
        {
          title: "随机",
          desc: "随机模式：系统自动随机选择英雄，赌狗模式",
          id: 4,
        },
        {
          title: "征召",
          desc: "征召模式：规则参考随机自选模式，可以禁用6名英雄",
          id: 6,
        },
      ],
    };
  },
  watch: {
    roomName() {
      config.setItem("roomName", this.roomName);
    },
    roomExist() {
      // /lol-lobby/v2/lobby/custom/available-bots
      api
        .POST("/api/send", {
          type: "get",
          url: "/lol-lobby/v2/lobby/custom/available-bots",
        })
        .then((res) => {
          this.botsList = res;
        });
    },
  },
  computed: {
    ...mapState("list", [
      "blackList",
      "roomInfo",
      "userList",
      "draguserrelease_mask",
      "champSelect",
      "gameStatus",
      "qqGroupList",
    ]),
    roomExist() {
      return !!this.roomInfo;
    },
  },
  async created() {
    window.runApi = this.runApi;
    this.roomName = config.getItem("roomName") || "5V5训练 全随机模式";
    this.invitTimer = setInterval(() => {
      this.getInvitList();
    }, 150);
    this.timer = setInterval(() => {
      this.checkUser();
    }, 50);
  },
  beforeDestroy() {
    this.timer && clearInterval(this.timer);
    this.invitTimer && clearInterval(this.invitTimer);
  },
  methods: {
    openLink(link) {
      electron.shell.openItem(link);
    },
    dragenter() {
      window.draguser_status = true;
      this.dragrelease_mask = true;
    },
    dragleave() {
      setTimeout(() => {
        window.draguser_status = false;
        this.dragrelease_mask = false;
      }, 0);
    },
    async invitToName() {
      await api
        .POST("/api/send", {
          type: "post",
          url: "/lol-summoner/v2/summoners/names",
          data: [this.invit_name],
        })
        .then(async (res) => {
          if (res[0]) {
            console.log(res[0]);
            // await connection.request('POST', '/lol-lobby/v2/lobby/members/{summonerId}/grant-invite')
            await api
              .POST("/api/send", {
                type: "post",
                url: "/lol-lobby/v2/lobby/invitations",
                data: [
                  {
                    state: "Requested",
                    toSummonerId: res[0].summonerId,
                  },
                ],
              })
              .then((res1) => {
                if (typeof res1 == "string") this.$message.error("邀请失败");
                else {
                  this.invit_name = "";
                }
              });
          } else {
            this.$message.error("没有找到召唤师");
          }
        });
    },
    async getInvitList() {
      await api
        .POST("/api/send", {
          type: "get",
          url: "/lol-lobby/v1/lobby/invitations",
        })
        .then((res) => {
          this.invit_list = res;
        });
    },
    checkUser() {
      if (!this.roomInfo) return;
      let userList = [
        ...this.roomInfo.gameConfig.customTeam100,
        ...this.roomInfo.gameConfig.customTeam200,
      ];
      userList.forEach((item) => {
        if (!item.isBot) {
          this.blackList.some((sub) => {
            if (
              sub.name === item.summonerName ||
              sub.name === item.summonerInternalName ||
              sub.id === item.summonerId
            ) {
              this.kickUsersId(item.summonerId);
              return true;
            }
          });
        }
      });
    },
    async createdRoom(type) {
      this.loading = true;

      // if (this.loading) {
      //   let data = await api.POST("/api/send", {
      //     type: "get",
      //     url: "/lol-lobby-team-builder/champ-select/v1/bannable-champion-ids",
      //   });
      //   console.log(data);
      //   this.loading = false;
      //   return;
      // }
      console.log(type);
      let lolbody = {
        queueId: 900,
        customGameLobby: {
          configuration: {
            // gameMode: "URF",
            // gameMode: "CLASSIC",
            gameMutator: "",
            gameServerRegion: "",
            mapId: 11,
            maxHumanPlayers: 0,
            mutators: { id: type.id, maxHumanPlayers: 0 },
            spectatorPolicy: "AllAllowed",
            teamSize: 2,
          },
          maxHumanPlayers: 0,
          lobbyName: this.roomName,
          lobbyPassword: "",
        },
        isCustom: true,
      };

      let roomInfo = await api.POST("/api/send", {
        type: "post",
        url: "/lol-lobby/v2/lobby",
        data: lolbody,
      });
      console.log(roomInfo);

      // /lol-lobby/v1/parties/queue
      // let aaaa = await api.POST("/api/send", {
      //   type: "get",
      //   url: "/lol-platform-config/v1/namespaces",
      //   // data: 900,
      // });
      // console.log(JSON.stringify(aaaa));

      this.$store.commit("list/set", ["roomInfo", roomInfo]);
      let autoyc = config.getItem("autoyc");
      if (autoyc) {
        // 判断自动邀请模式
        let autoyc_type = config.getItem("autoyc_type") || "all";
        if (autoyc_type === "all") {
          let ids = [];
          this.userList.forEach((user) => {
            if (user.availability == 1 || user.availability == 3) {
              let isBlack = false;
              this.blackList.some((item) => {
                if (
                  item.name === user.info.gameName ||
                  item.name === user.info.name ||
                  item.id === user.summonerId
                )
                  isBlack = true;
                return isBlack;
              });
              if (!isBlack) ids.push(user.summonerId);
            }
          });
          if (ids.length) {
            api.POST("/api/ids", ids).then(() => {
              this.$message.success("邀请" + ids.length + "人");
            });
          }
        } else if (autoyc_type === "summoner") {
          let autoyc_summoner = config.getItem("autoyc_summoner") || "";
          let names = autoyc_summoner.split("\n").filter((item) => item);
          // 名字转为ID
          let ids = [];
          for (let name of names) {
            if (parseInt(name) == name) ids.push(parseInt(name));
            else {
              let user = await api.POST("/api/send", {
                type: "post",
                url: "/lol-summoner/v2/summoners/names",
                data: [name],
              });
              if (user && typeof user !== "string" && user[0]) {
                ids.push(user[0].summonerId);
              } else {
                this.$message.error("找不到玩家：" + name);
              }
            }
          }

          // 发起邀请
          ids.forEach((id) => {
            api.POST("/api/send", {
              type: "post",
              url: "/lol-lobby/v2/lobby/invitations",
              data: [{ state: "Requested", toSummonerId: id }],
            });
          });
        }
      }
      this.loading = false;
    },
    async kickUsersId(id) {
      let result = await api.POST("/room/del", { id });
      console.log(result);
    },
    async startGame() {
      await api.GET("/start/game");
    },
    async switchTeams() {
      await api
        .POST("/api/send", {
          type: "post",
          url: "/lol-lobby/v1/lobby/custom/switch-teams",
        })
        .then((res) => {
          // PutLolLobbyV1PartiesMetadata
          // GetLolLobbyV1PartiesGamemode
          // PutLolLobbyV1PartiesQueue
          console.log(res);
        });
    },
    async delGame() {
      await api.GET("/del/game");
    },
    async runApi() {
      await api
        .POST("/api/send", {
          type: "get",
          url: "/lol-lobby/v2/received-invitations",
        })
        .then((res) => {
          res.forEach((item, index) => {
            if (item.state !== "Pending") {
              console.log(
                index,
                item.fromSummonerName,
                item.gameConfig.gameMode,
                item.state
              );
            }
          });
          console.log("****************");
        });
    },
  },
};
</script>

<style lang="scss" scoped>
.pages {
  // width: 100%;
  height: 100%;
  padding: 0 30px;
  display: flex;
  // align-items: center;
  // justify-content: space-evenly;
  flex-direction: column;
  position: relative;

  .drag-release,
  .game-status {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: 99;
    background: rgba(255, 255, 255, 0.3);
    display: flex;
    font-size: 34px;
    align-items: center;
    justify-content: center;
    color: yellow;
    span {
      pointer-events: none;
    }
  }
  .game-status {
    z-index: 100;
  }
  .qq-group-list {
    display: flex;
    margin-top: 20px;
    align-items: center;
    justify-content: center;
    .qq-group-item {
      margin: 0 20px;
      display: flex;
      align-items: center;
      background: #046ee7;
      border-radius: 4px;
      height: 22px;
      cursor: pointer;
      transition: all 0.2s;
      font-size: 0;
      opacity: 0.6;
      &:hover {
        opacity: 1;
      }
      span {
        font-size: 12px;
        padding: 0 5px;
        font-weight: 600;
      }
      img {
        height: 100%;
        border-radius: 4px;
      }
    }
  }
  .roomName {
    text-align: center;
    margin-top: 20px;
    span {
      font-size: 20px;
      color: #cdbe91;
    }
    input {
      width: 600px;
      height: 40px;
      border: 2px solid #785a28;
      outline: none;
      background: #000000;
      padding: 0 20px 2px;
      color: #cdbe91;
      font-size: 20px;
    }
  }
  .roomType {
    margin-top: 40px;
    display: flex;
    align-items: center;
    justify-content: space-evenly;
  }
  @keyframes animate1 {
    0% {
      transform: translateX(-100%);
    }
    100% {
      transform: translateX(100%);
    }
  }

  @keyframes animate2 {
    0% {
      transform: translateY(-100%);
    }
    100% {
      transform: translateY(100%);
    }
  }

  @keyframes animate3 {
    0% {
      transform: translateX(100%);
    }
    100% {
      transform: translateX(-100%);
    }
  }

  @keyframes animate4 {
    0% {
      transform: translateY(100%);
    }
    100% {
      transform: translateY(-100%);
    }
  }
  .card {
    position: relative;
    width: 300px;
    height: 400px;
    transition: 0.5s;
    background: #020b10;
    display: flex;
    justify-content: center;
    opacity: 0.8;
    /* flex中交叉轴居中 */
    align-items: center;
    margin: 20px;
    box-shadow: 0 0 20px -10px rgba(192, 252, 253, 0.4),
      inset 0 0 5px 2px rgba(192, 252, 253, 0.3);
    overflow: hidden;
    cursor: pointer;
    &::before {
      content: "";
      position: absolute;
      top: 2px;
      left: 2px;
      bottom: 2px;
      width: 50%;
      background: rgba(255, 255, 255, 0.05);
      pointer-events: none;
    }
    span {
      transition: 0.5s;
      opacity: 0;
      position: absolute;
      &:nth-child(1) {
        top: 0;
        left: 0;
        width: 100%;
        height: 3px;
        /* 线性渐变，默认tobottom */
        background: linear-gradient(to right, transparent, #08a8ab);
        animation: animate1 2s linear infinite;
      }
      &:nth-child(2) {
        top: 0;
        right: 0;
        width: 3px;
        height: 100%;
        background: linear-gradient(to bottom, transparent, #08a8ab);
        animation: animate2 2s linear infinite;
        /* 动画延时 */
        animation-delay: 1s;
      }
      &:nth-child(3) {
        bottom: 0;
        left: 0;
        width: 100%;
        height: 3px;
        background: linear-gradient(to left, transparent, #08a8ab);
        animation: animate3 2s linear infinite;
      }
      &:nth-child(4) {
        top: 0;
        left: 0;
        width: 3px;
        height: 100%;
        background: linear-gradient(to top, transparent, #08a8ab);
        animation: animate4 2s linear infinite;
        animation-delay: 1s;
      }
    }
    .content {
      padding: 50px 30px 0;
      text-align: center;
      h2 {
        position: absolute;
        font-size: 50px;
        width: calc(100% - 60px);
        text-align: center;
        font-weight: 800;
        color: #cdbe91;
        z-index: 1;
        opacity: 0.4;
        transition: 0.5s;
        transform: translateY(-70px);
      }
      p {
        position: relative;
        font-size: 16px;
        line-height: 2em;
        color: #fff;
        z-index: 2;
        opacity: 0.5;
        font-weight: 300;
        transition: 0.5s;
        margin-top: 15px;
      }
      button {
        margin-top: 50px;
        transform: translateY(0);
        &:active {
          opacity: 0.6;
          transform: translateY(4px);
        }
      }
    }
    &:hover,
    &.active {
      opacity: 1;
      .content {
        h2 {
          opacity: 1;
        }
        h3 {
          opacity: 1;
        }
        p {
          opacity: 1;
        }
      }
      span {
        opacity: 1;
      }
    }
  }

  .roomInfo {
    .room-name {
      display: flex;
      align-items: center;
      margin: 10px 0;
      .name {
        font-size: 32px;
        color: #fff;
        flex: 1;
        width: 0;
        span {
          font-size: 16px;
          margin-left: 10px;
        }
      }
      .room-type {
        button {
          margin: 0 10px;
          height: 28px;
          width: 60px;
          line-height: 1em;
          font-size: 12px;
          padding: 0;
          &:active {
            transform: translateY(2px);
          }
        }
      }
    }
    .wanjia-list {
      display: flex;
      margin: 30px 0;
      .spec {
        width: 15px;
      }
      .invit_box {
        height: 300px;
        display: flex;
        flex-direction: column;
        width: 200px;
        .invit_name {
          display: flex;
          ::v-deep {
            .el-input {
              flex: 1;
              width: 0;
              margin-right: 5px;
              input {
                background: #a7a7a7;
                color: #000;
                border: 1px solid #a7a7a7;
                &::placeholder {
                  color: #666;
                }
              }
            }
            .el-button {
              background: #242731;
              border: 1px solid #d1a453;
              &:active {
                margin-top: 1px;
              }
            }
          }
        }
        .invit_list {
          flex: 1;
          height: 0;
          overflow: hidden;
          overflow-y: auto;
          margin-top: 10px;
          background: rgba(255, 255, 255, 0.1);
          transition: all 0.3s;
          &:hover {
            background: rgba(255, 255, 255, 0.2);
          }
          &::-webkit-scrollbar {
            width: 3px;
            height: 3px;
            background-color: rgba(245, 245, 245, 0);
          }

          /*定义滚动条轨道 内阴影+圆角*/
          &::-webkit-scrollbar-track {
            box-shadow: inset 0 0 6px rgba(255, 255, 255, 0);
            border-radius: 10px;
            background-color: rgba(255, 255, 255, 0.1);
          }

          /*定义滑块 内阴影+圆角*/
          &::-webkit-scrollbar-thumb {
            border-radius: 10px;
            box-shadow: inset 0 0 6px rgba(0, 0, 0, 0.1);
            -webkit-box-shadow: inset 0 0 6px rgba(0, 0, 0, 0);
            background-color: #c8c8c8;
          }
        }
      }
      .team {
        flex: 1;
        height: 300px;
        .switch_teams {
          height: 59px;
          text-align: right;
          display: flex;
          align-items: center;
          justify-content: flex-end;
          background: rgba(255, 255, 255, 0.1);

          padding: 0 10px;
          button {
            height: 36px;
            padding: 0 30px;
            font-size: 14px;
          }
        }
        .item {
          display: flex;
          align-items: center;
          height: 59px;
          border-bottom: 1px solid #42423c;
          color: #c89b3c;
          font-size: 20px;
          img {
            width: 36px;
            height: 36px;
            border-radius: 50%;
            border: 2px solid #62532e;
            margin-right: 10px;
          }
        }
      }
    }
    .game-tips {
      height: 70px;
      text-align: center;
      font-size: 14px;
      line-height: 40px;
      opacity: 0.6;
    }
    .room-option {
      display: flex;
      justify-content: center;
      .button {
        margin: 0 20px;
        &:active {
          transform: translateY(2px);
        }
      }
    }
  }
}
</style>
