<template>
  <div class="invit_item" v-if="invit">
    <span class="status">
      <i v-if="invit.state === 'Pending'" class="el-icon-loading"></i>
      <i v-else-if="invit.state === 'Accepted'" class="el-icon-check"></i>
      <i v-else-if="invit.state === 'Declined'" class="el-icon-close"></i>
    </span>
    <span class="name">{{ name }}</span>
    <!-- <span class="clear" @click="revokeInvite(invit.toSummonerId)">
      <i class="el-icon-error"></i>
    </span> -->
  </div>
</template>

<script>
import api from "@/api";

export default {
  name: "Invit",
  props: {
    invit: Object,
  },
  data() {
    return {
      name: "",
    };
  },
  created() {
    api
      .POST("/api/send", {
        type: "get",
        url: "/lol-summoner/v1/summoners/" + this.invit.toSummonerId,
      })
      .then((res) => {
        this.name = res.internalName;
      });
  },
  methods: {
    revokeInvite(summonerId) {
      api
        .POST("/api/send", {
          type: "post",
          url: "/lol-lobby/v2/lobby/members/" + summonerId + "/revoke-invite",
        })
        .then((res) => {
          console.log(res);
        });
      // await connection.request('POST', '/lol-lobby/v2/lobby/members/{summonerId}/revoke-invite')
    },
  },
};
</script>

<style lang="scss" scoped>
.invit_item {
  padding: 6px 10px;
  border-bottom: 1px solid rgb(39, 39, 39);
  display: flex;
  align-items: center;
  .status {
    font-weight: 600;
    text-shadow: 0 1px 1px #c39056;
    padding-right: 6px;
  }
  .name {
    flex: 1;
    width: 0;
  }
  .clear {
    display: none;
    cursor: pointer;
    &:active {
      opacity: 0.6;
    }
  }
  &:hover {
    .clear {
      display: block;
    }
  }
}
</style>
