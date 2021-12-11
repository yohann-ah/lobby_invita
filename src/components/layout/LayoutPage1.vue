<template>
  <div class="main-page">
    <div class="rules_view" v-if="show_rules">
      <el-tabs :value="show_rules_name">
        <el-tab-pane label="自选模式" name="zixuan">
          <img referrer="no-referrer" :src="rulesImages[0]" alt="" />
        </el-tab-pane>
        <el-tab-pane label="随机&征召" name="suiji">
          <img :src="rulesImages[1]" alt="" />
        </el-tab-pane>
      </el-tabs>
    </div>
    <div class="setting_view" v-if="set_box_show">
      <el-card class="box-card" :body-style="{ padding: '0' }">
        <div
          slot="header"
          class="clearfix"
          @click="config.autoyc = !config.autoyc"
        >
          <span>自动邀请设置（开启后，创建房间是将自动邀请好友）</span>
          <el-switch
            @click.native.stop
            style="float: right"
            @change="saveConfig"
            v-model="config.autoyc"
          ></el-switch>
        </div>
        <el-radio-group
          @change="saveConfig"
          style="width: 100%"
          v-model="config.autoyc_type"
        >
          <div class="item">
            <el-radio label="all"> 邀请所有可邀请点好友 </el-radio>
          </div>
          <div class="item">
            <el-radio label="summoner"> 邀请指定用户 </el-radio>
            <textarea
              placeholder="填写要邀请玩家的名称或者ID，一行一个"
              v-model="config.autoyc_summoner"
              @change="saveConfig"
              rows="5"
            ></textarea>
            <div class="flex"></div>
          </div>
        </el-radio-group>
      </el-card>
      <el-card class="box-card" :body-style="{ padding: '0' }">
        <div
          slot="header"
          class="clearfix"
          @click="config.invita = !config.invita"
        >
          <span>自动接受邀请（开启后，收到邀请自动接受解放双手）</span>
          <el-switch
            @click.native.stop
            style="float: right"
            @change="saveConfig"
            v-model="config.invita"
          ></el-switch>
        </div>
        <div class="item">
          只接受训练模式邀请
          <div class="flex"></div>
          <el-switch
            size="mini"
            :disabled="!config.invita"
            @change="saveConfig"
            v-model="config.invita_config.only_practice.open"
          ></el-switch>
        </div>
        <div class="item">
          只接受固定人员邀请
          <input
            style="margin-left: 10px"
            type="text"
            @change="saveConfig"
            :disabled="!config.invita"
            v-model="config.invita_config.only_people.summoner"
            placeholder="输入唯一ID/名称(多个逗号隔开)"
          />
          <div class="flex"></div>
          <el-switch
            size="mini"
            :disabled="!config.invita"
            @change="saveConfig"
            v-model="config.invita_config.only_people.open"
          ></el-switch>
        </div>
      </el-card>
    </div>
    <div class="top-bar">
      <div class="titlt">
        <div class="button">
          <div class="icon">
            <img width="50" src="../../assets/icon.png" alt="" />
          </div>
          <div class="main-btn">
            <button
              class="button is-primary"
              @click="
                show_rules = !show_rules;
                set_box_show = false;
              "
            >
              {{ show_rules ? "主页" : "查看规则" }}
            </button>
          </div>
        </div>
      </div>
      <div class="geme_dir">
        <div class="tip">游戏目录</div>
        <el-input
          class="input"
          size="mini"
          disabled
          type="text"
          :value="exePath"
          placeholder="游戏目录"
        />
        <el-button @click="setGameDir" class="buttons" size="mini"
          >指定目录</el-button
        >
      </div>
      <div class="config-box">
        <el-checkbox
          @change="saveConfig"
          class="checkbox"
          v-model="config.invita"
        >
          自动接受邀请
        </el-checkbox>
        <el-checkbox
          @change="saveConfig"
          class="checkbox"
          v-model="config.autoyc"
        >
          自动发送邀请
        </el-checkbox>
      </div>
      <div class="window_opt">
        <div
          class="version"
          @click="show_version = !show_version"
          title="版本信息"
        >
          {{ version }}
        </div>
        <i class="el-icon-refresh btn" @click="init" title="刷新"></i>
        <i class="el-icon-minus btn" @click="minWindow" title="最小化"></i>
        <i class="el-icon-close btn" @click="closeApp" title="关闭"></i>
        <el-dialog
          title="版本信息"
          :visible.sync="show_version"
          :modal="false"
          :show-close="false"
          width="500px"
        >
          <div slot="title" class="version-title">版本信息</div>
          <div class="version-content">
            <div class="tip">
              <b>Lobby Invita</b> 英雄联盟建房工具 {{ version }}
            </div>
            <div class="tips">
              本工具完全基于拳头开放API制作<br />
              不修改游戏客户端的任何数据
            </div>
            <div class="contact">
              工具出现问题请联系作者：<a
                @click="
                  openUrl(
                    'tencent://AddContact/?fromId=45&fromSubId=1&subcmd=all&uin=492238647'
                  )
                "
                >Wang Lao Ji Ji</a
              >
              <br />
              <p v-for="(item, index) in qqGroupList" :key="index">
                交流QQ群：<a @click="openUrl(item.link)">{{ item.num }}</a>
              </p>
              <p>
                版本日志：<a
                  @click="openUrl('https://docs.qq.com/doc/DS3JlSHlab2poVlhV')"
                  >点击查看</a
                >
              </p>
            </div>
          </div>
          <span slot="footer" class="version-bottom">
            <el-button size="mini" type="warning" @click="show_version = false">
              关 闭 提 示
            </el-button>
            <a @click="reload">刷新版本</a>
          </span>
        </el-dialog>
      </div>
    </div>
    <div class="body">
      <div class="page-box">
        <router-view />
      </div>
      <div class="user-list">
        <div class="name-ss">
          <el-input
            placeholder="搜索召唤师名称"
            v-model="searchName"
            class="input-with-select"
          >
            <i slot="suffix" class="el-input__icon el-icon-search"></i>
          </el-input>
        </div>
        <div class="user-groups-list" v-if="userListTag == 'haoyou'">
          <div
            class="user-groups"
            v-for="(group, index) in groupList"
            v-show="group.id !== 10001"
            :key="index"
          >
            <div
              class="group-name"
              @click="groupOpen[group.id] = !groupOpen[group.id]"
            >
              <i
                class="el-icon-caret-bottom"
                :class="{ close: groupOpen[group.id] }"
              ></i>
              {{
                group.name == "**Default"
                  ? "综合"
                  : group.name == "MOBILE"
                  ? "手游"
                  : group.name
              }}
            </div>
            <div class="group-user-list" v-show="!groupOpen[group.id]">
              <div
                class="user-item"
                v-for="(user, index) in userList"
                v-show="
                  user.info.groupId === group.id &&
                  (searchName == '' || diffname(searchName, user.name))
                "
                :key="index"
                :summonerId="user.summonerId"
                :draggable="!!roomInfo"
                @dragstart="dragstart"
                @dragend="dragends(user)"
                @contextmenu="userContextmenu(user)"
              >
                <img
                  :src="
                    'https://ddragon.leagueoflegends.com/cdn/11.15.1/img/profileicon/' +
                    user.info.icon +
                    '.png'
                  "
                  alt=""
                />
                <div class="text">
                  <div class="name">{{ user.name }}</div>
                  <div class="tips">
                    <span :type="user.availability"></span>
                    {{ user.statusMessage }}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div class="user-groups-list" v-if="userListTag == 'lishi'">
          <div class="user-groups">
            <div class="group-name">
              <i class="el-icon-caret-bottom"></i>最近游戏
            </div>
            <div class="group-user-list">
              <div
                class="user-item"
                v-for="(user, index) in config.lishi_list"
                v-show="searchName == '' || diffname(searchName, user.name)"
                :key="index"
                :summonerId="user.summonerId"
                :draggable="!!roomInfo"
                @dragstart="dragstart"
                @dragend="dragends(user)"
                @contextmenu="userContextmenu(user)"
              >
                <img
                  :src="
                    'https://ddragon.leagueoflegends.com/cdn/11.15.1/img/profileicon/' +
                    user.icon +
                    '.png'
                  "
                  alt=""
                />
                <div class="text">
                  <div class="name">{{ user.name }}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div class="user-groups-list" v-if="userListTag == 'find'">
          <div class="user-groups">
            <div class="group-user-list">
              <div
                class="user-item"
                v-if="searchByName"
                :summonerId="searchByName.summonerId"
                :draggable="!!roomInfo"
                @dragstart="dragstart"
                @dragend="dragends(searchByName)"
                @contextmenu="userContextmenu(searchByName)"
              >
                <img
                  :src="
                    'https://ddragon.leagueoflegends.com/cdn/11.15.1/img/profileicon/' +
                    searchByName.icon +
                    '.png'
                  "
                  alt=""
                />
                <div class="text">
                  <div class="name">{{ searchByName.name }}</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="user-tags">
          <div
            class="tag-item"
            :class="{ active: userListTag == 'haoyou' }"
            @click="userListTag = 'haoyou'"
            title="好友列表"
          >
            <i class="iconfont icon-haoyou"></i>
          </div>
          <div
            class="tag-item"
            :class="{ active: userListTag == 'lishi' }"
            @click="userListTag = 'lishi'"
            title="一起游戏"
          >
            <i class="iconfont icon-lishi"></i>
          </div>
          <div
            class="tag-item"
            :class="{ active: userListTag == 'find' }"
            @click="userListTag = 'find'"
            title="通过名称查找"
          >
            <i class="iconfont icon-yonghuchazhao"></i>
          </div>
          <div class="flex"></div>
          <div
            class="tag-item"
            @click="
              set_box_show = !set_box_show;
              show_rules = false;
            "
            title="更多设置"
          >
            <i class="el-icon-s-tools"></i>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import api from "@/api";
import config from "@/libs/util.store";
import { mapState } from "vuex";
const electron = window.require("electron");
export default {
  name: "LayoutPage1",
  computed: {
    ...mapState("list", [
      "exePath",
      "selfinfo",
      "locainfo",
      "userList",
      "groupList",
      "blackList",
      "roomOwner",
      "roomInfo",
      "qqGroupList",
      "rulesImages",
    ]),
  },
  data() {
    return {
      version: "V 1.1.0",
      show_page_box: "",
      show_rules: false,
      set_box_show: false,
      show_rules_name: "suiji",
      searchByName: null,
      searchName: "",
      userListTag: "haoyou",
      groupOpen: {},
      config: {
        autoyc: false,
        autoyc_type: "all",
        autoyc_summoner: "",
        invita: false,
        invita_config: {
          only_practice: {
            open: false,
            gameMode: "PRACTICETOOL",
          }, // 只接受训练
          only_people: {
            open: false,
            summoner: "",
          },
        },
        lishi_list: [],
      },
      invitaTimer: null,
    };
  },
  watch: {
    roomInfo() {
      if (!this.roomInfo) return;
      let userList = [];
      userList.push(...this.roomInfo.gameConfig.customTeam100);
      userList.push(...this.roomInfo.gameConfig.customTeam200);
      userList = userList.filter((item) => {
        let isAdd = true;
        // 排除机器人
        if (item.isBot) isAdd = false;
        // 等于自己
        if (isAdd && item.summonerId === this.selfinfo.summonerId)
          isAdd = false;
        // 已存在好友列表中
        if (isAdd && this.userList.length) {
          this.userList.some((sub) => {
            if (sub.summonerId === item.summonerId) isAdd = false;
            return !isAdd;
          });
        }
        // 已存在最近游戏列表中
        if (isAdd && this.config.lishi_list.length) {
          this.config.lishi_list.some((sub) => {
            if (
              sub.summonerId === item.summonerId &&
              sub.name === item.summonerName
            )
              isAdd = false;
            return !isAdd;
          });
        }
        return isAdd;
      });

      // 把列表倒叙添加到最近游戏的最前面
      userList.forEach((item) => {
        // 最近列表大于1000 删除掉最早的一个
        if (this.config.lishi_list.length > 1000) this.config.lishi_list.pop();
        this.config.lishi_list.unshift({
          name: item.summonerName,
          icon: item.summonerIconId,
          summonerId: item.summonerId,
        });
      });

      config.setItem("lishi_list", this.config.lishi_list);
    },
    async searchName() {
      if (this.searchName.trim() === "127.0.0.1") {
        if (window.location.host === "127.0.0.1:49223") {
          window.location.href = "http://127.0.0.1:8080";
        } else {
          window.location.href =
            "http://127.0.0.1:49223/read/gitfile/index.html";
        }
        return;
      }
      // 为空不搜索
      if (!this.searchName.trim()) return (this.searchByName = null);
      let user = null;
      await api
        .POST("/api/send", {
          type: "post",
          url: "/lol-summoner/v2/summoners/names",
          data: [this.searchName],
        })
        .then((res) => {
          if (res[0]) user = res[0];
        })
        .catch(() => {});
      this.searchByName = user
        ? {
            name: user.displayName,
            summonerId: user.summonerId,
            icon: 6,
          }
        : null;
    },
  },
  created() {
    let _confog = config.getItem();
    _confog.lishi_list = _confog.lishi_list || [];
    Object.assign(this.config, _confog);
    this.invitaTimer = setInterval(() => {
      this.invitaWatch();
    }, 20);
  },
  destroyed() {
    clearInterval(this.invitaTimer);
  },
  methods: {
    reload() {
      window.location.reload();
    },
    async invitaWatch() {
      if (!this.config.invita) return;
      await api
        .POST("/api/send", {
          type: "get",
          url: "/lol-lobby/v2/received-invitations",
        })
        .then((res) => {
          res.forEach((item) => {
            if (item.state === "Pending") {
              // 判断自动接受邀请是否打开
              let _config = this.config.invita_config;
              // 开启了只接受固定模式 并且模式不相等
              if (
                _config.only_practice.open &&
                _config.only_practice.gameMode !== item.gameConfig.gameMode
              )
                return console.log("不是指定模式", item, _config);
              // 判断邀请人
              let summonerArr = _config.only_people.summoner.split(",");
              if (
                _config.only_people.open &&
                summonerArr.indexOf(item.fromSummonerName) === -1 &&
                summonerArr.indexOf(item.fromSummonerId.toString()) === -1
              )
                return console.log("不是指定用户邀请", item, _config);

              // 接收邀请
              api
                .POST("/api/send", {
                  type: "post",
                  // /lol-lobby/v2/received-invitations/{invitationId}/decline
                  // /lol-lobby/v2/received-invitations/{invitationId}/accept
                  url:
                    "/lol-lobby/v2/received-invitations/" +
                    item.invitationId +
                    "/accept",
                })
                .then((res) => {
                  console.log("接受结果", res);
                })
                .catch(() => {});
            }
          });
        })
        .catch(() => {});
    },
    saveConfig() {
      config.save(this.config);
      this.$message.success("设置成功");
    },
    diffname(ssname, name) {
      return name.toUpperCase().indexOf(ssname.toUpperCase()) !== -1;
    },
    userContextmenu(user) {
      this.$contextmenu({
        items: [
          {
            label: "邀请加入游戏",
            disabled: !this.roomInfo,
            onClick: () => {
              this.dragend(user);
            },
          },
          {
            label: "复制召唤师ID",
            onClick: () => {
              electron.clipboard.writeText(user.summonerId.toString());
              this.$message.success("复制成功");
            },
          },
          {
            label: "复制召唤师名称",
            onClick: () => {
              electron.clipboard.writeText(user.name);
              this.$message.success("复制成功");
            },
          },
        ],
        event: window.event,
        customClass: "userContextmenu",
        zIndex: 10,
      });
    },
    init() {
      this.initialize();
    },
    dragends(user) {
      this.$store.commit("list/set", ["draguserrelease_mask", false]);
      if (window.draguser_status) {
        this.dragend(user);
      }
    },
    dragstart() {
      this.$store.commit("list/set", ["draguserrelease_mask", true]);
      window.draguser_status = false;
    },
    dragend(user) {
      let isBlack = false;
      this.blackList.some((item) => {
        if (item.name === user.name || item.id === user.summonerId)
          isBlack = true;
        return isBlack;
      });
      if (isBlack) {
        this.$message.error(user.info.name + "是黑名单成员，不可邀请");
      } else {
        api.POST("/api/ids", [user.summonerId]).then((res) => {
          if (res !== "OK") this.$message.error("邀请失败");
        });
      }
    },
    minWindow() {
      electron.ipcRenderer.send("minchuangkou");
    },
    closeApp() {
      electron.ipcRenderer.send("closeapp");
    },
    openUrl(url) {
      electron.shell.openItem(url);
    },
    setGameDir() {
      console.log(this.exePath);
      let dir = electron.remote.dialog.showOpenDialogSync({
        defaultPath: this.exePath,
        properties: ["openFile"],
        filters: [{ name: "LeagueClient", extensions: ["exe"] }],
      });
      if (dir && dir[0]) {
        this.$store.commit("list/set", ["exePath", dir[0]]);
        this.$router.replace({ name: "Home" });
        this.initialize();
      }
    },
  },
};
</script>

<style lang="scss" scoped>
.main-page {
  width: 100%;
  height: 100%;
  position: absolute;
  top: 0;
  left: 0;
  z-index: 2;
  display: flex;
  flex-direction: column;
  .version-title {
    padding: 10px;
    text-align: center;
  }
  .version-bottom {
    text-align: center;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    button {
      padding: 8px 60px;
      opacity: 0.8;
    }
    a {
      margin-top: 10px;
      color: rgb(157, 211, 255);
      text-decoration: underline;
      cursor: pointer;
    }
  }
  .version-content {
    text-align: center;
    font-size: 20px;
    font-family: 宋体 Arial, Helvetica, sans-serif;
    .tip {
      display: flex;
      align-items: center;
      justify-content: center;
      b {
        font-size: 24px;
        margin-right: 10px;
      }
    }
    .tips {
      margin: 40px 0;
      color: yellow;
    }
    .contact {
      a {
        color: rgb(0, 140, 255);
        text-decoration: underline;
        cursor: pointer;
      }
    }
  }
  ::v-deep {
    .el-dialog__header {
      padding: 0;
    }
  }
  .setting_view {
    position: fixed;
    top: 100px;
    bottom: 0;
    left: 0;
    right: 284px;
    z-index: 2000;
    background: #1a303f;
    box-sizing: border-box;
    padding: 20px;
    .box-card {
      margin-bottom: 20px;
      .item {
        width: 100%;
        padding: 10px 20px;
        font-size: 14px;
        border-bottom: 1px solid #353535;
        display: flex;
        align-items: center;
        &:last-child {
          border-bottom: 0 solid #000;
        }
        .flex {
          flex: 1;
        }
        textarea {
          border-radius: 4px;
          width: 400px;
          padding: 5px 10px;
          font-size: 12px;
          outline: none;
          background: #c5c5c5;
          color: #000;
          &::placeholder {
            color: #999;
          }
        }
        input {
          border-radius: 4px;
          width: 400px;
          border: none;
          padding: 5px 10px;
          font-size: 12px;
          outline: none;
          background: #c5c5c5;
          color: #000;
          &::placeholder {
            color: #999;
          }
        }
      }
    }
  }
  .rules_view {
    position: fixed;
    top: 100px;
    bottom: 0;
    left: 0;
    right: 284px;
    z-index: 2000;
    background: #1a303f;
    box-sizing: border-box;
    padding: 0 20px;
  }
  .top-bar {
    width: 100%;
    height: 100px;
    box-sizing: border-box;
    border-top: 3px solid #785a28;
    border-bottom: 1px solid #3c3a35;
    display: flex;
    align-items: center;
    -webkit-app-region: drag;
    position: relative;
    .window_opt {
      position: absolute;
      top: 0;
      right: 2px;
      display: flex;
      align-items: center;
      .version {
        padding: 0 15px;
        -webkit-app-region: no-drag;
        cursor: pointer;
        &:hover {
          font-weight: 600;
        }
      }
      .btn {
        padding: 8px 8px;
        -webkit-app-region: no-drag;
        cursor: pointer;
        font-size: 18px;
        &:hover {
          font-weight: 600;
        }
      }
    }
    .config-box {
      display: flex;
      flex: 1;
      width: 0;
      justify-content: flex-end;
      padding: 10px 20px 0;
      .checkbox {
        -webkit-app-region: no-drag;
      }
    }
    .geme_dir {
      display: flex;
      width: 550px;
      align-items: center;
      .input,
      .buttons {
        -webkit-app-region: no-drag;
      }
      .input {
        flex: 1;
        width: 0;
        margin-right: 10px;
      }
      .tip {
        font-size: 14px;
        width: 70px;
        margin-bottom: 3px;
      }
    }
    .titlt {
      margin-left: 20px;
      font-size: 35px;
      color: #cdbe91;
      font-weight: bold;
      margin-right: 40px;
      .button {
        display: flex;
        -webkit-app-region: no-drag;
        .icon {
          position: relative;
          z-index: 2;
        }
        .main-btn {
          height: 50px;
          border: 1px solid #2e271f;
          padding: 6px;
          padding-left: 40px;
          padding-right: 10px;
          margin-left: -34px;
          button {
            padding: 0 50px;
            height: 100%;
            font-size: 20px;
            font-weight: bold;
            color: #fff;
            cursor: pointer;
          }
        }
      }
    }
    .room-type {
      .button {
        margin-left: 26px;
        -webkit-app-region: no-drag;
        opacity: 0.3;
        transform: all 0.3s;
        position: relative;
        height: 40px;
        padding: 0 30px;
        top: 0;
        &.active {
          opacity: 1;
        }
        &:active {
          top: 4px;
        }
      }
    }
  }
  .body {
    flex: 1;
    height: 0;
    width: 100%;
    display: flex;
    .page-box {
      flex: 1;
      width: 0;
      height: 100%;
    }
    .user-list {
      margin-right: 4px;
      width: 280px;
      height: 100%;
      background: #0d1e29;
      display: flex;
      flex-direction: column;

      .user-groups-list {
        flex: 1;
        height: 0;
        width: 100%;
        overflow: hidden;
        overflow-y: auto;
        &::-webkit-scrollbar {
          width: 7px;
          height: 7px;
          background-color: rgba(245, 245, 245, 0);
        }

        /*定义滚动条轨道 内阴影+圆角*/
        &::-webkit-scrollbar-track {
          box-shadow: inset 0 0 6px rgba(0, 0, 0, 0.3);
          -webkit-box-shadow: inset 0 0 6px rgba(0, 0, 0, 0);
          border-radius: 10px;
          background-color: #163447;
        }

        /*定义滑块 内阴影+圆角*/
        &::-webkit-scrollbar-thumb {
          border-radius: 10px;
          box-shadow: inset 0 0 6px rgba(0, 0, 0, 0.1);
          -webkit-box-shadow: inset 0 0 6px rgba(0, 0, 0, 0);
          background-color: #c8c8c8;
        }
      }
      .group-name {
        height: 30px;
        background: #163447;
        padding: 5px 10px;
        cursor: pointer;
        i {
          transform: rotate(0deg);
          transition: all 0.3s;
          &.close {
            transform: rotate(-90deg);
          }
        }
      }
      .user-tags {
        height: 41px;
        display: flex;
        border-top: 1px solid #1e282d;
        .flex {
          flex: 1;
        }
        .tag-item {
          width: 40px;
          height: 40px;
          box-sizing: border-box;
          border: 1px solid #a67e30;
          margin-right: 5px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.3s;
          i {
            transition: all 0.3s;
            font-size: 20px;
          }
          &:active,
          &.active {
            border: 3px solid #a67e30;
            i {
              font-size: 18px;
            }
          }
        }
      }

      .user-item {
        height: 60px;
        display: flex;
        align-items: center;
        padding: 10px;
        border-bottom: 1px solid #292929;
        cursor: pointer;
        &:hover {
          background: #102a3b;
        }
        img {
          width: 36px;
          height: 36px;
          border-radius: 50%;
          margin-right: 10px;
          border: 2px solid #c1a15f;
        }
        .text {
          .name {
            font-size: 20px;
            color: #fff;
          }
          .tips {
            font-size: 14px;
            span {
              padding-right: 10px;
            }
            span[type="1"] {
              color: #09a646;
              &::before {
                content: "在线";
              }
            }
            span[type="2"] {
              color: #c4c719;
              &::before {
                content: "游戏中";
              }
            }
            span[type="3"] {
              color: #5a5a5a;
              &::before {
                content: "离开";
              }
            }
            span[type="4"] {
              color: #363636;
              &::before {
                content: "离线";
              }
            }
          }
        }
      }
    }
  }
}
</style>
