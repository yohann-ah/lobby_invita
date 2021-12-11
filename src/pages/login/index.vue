<template>
  <div class="content">
    <div class="login-box" v-if="type == 'login'">
      <div class="input">
        <icon name="icondenglu" size="16" />
        <input type="text" v-model="user.phone" placeholder="请输入手机号" />
      </div>
      <div class="input">
        <icon name="iconmima" size="16" />
        <input
          type="password"
          v-model="user.password"
          @keypress.enter="loginHander"
          placeholder="请输入密码"
        />
      </div>
      <div class="login-btn" @click="loginHander">登录</div>
      <div class="reg-link"><a @click="type = 'register'">注册</a></div>

      <div class="other">
        <div class="tit"><span>其他登录方式</span></div>
        <div class="wx-login">
          <icon name="iconweixin" size="36" />
          <div class="tip">授权微信用户信息和微信手机号</div>
        </div>
      </div>
    </div>
    <div class="login-box" v-else>
      <div class="input">
        <icon name="icondenglu" size="16" />
        <input
          type="text"
          v-model="register.phone"
          placeholder="请输入手机号"
        />
      </div>
      <div class="input">
        <icon name="iconmima" size="16" />
        <input
          type="text"
          v-model="register.verification"
          placeholder="请输入验证码"
        />
        <div class="send-code" v-if="!codeTime" @click="sendCode">
          获取验证码
        </div>
        <div class="show-time" v-else>{{ codeTime }}s后重试</div>
      </div>
      <div class="input">
        <icon name="iconmima" size="16" />
        <input
          type="password"
          v-model="register.password"
          placeholder="请输入密码"
        />
      </div>
      <div class="login-btn" @click="registerHander">注册</div>
      <div class="reg-link">
        <a @click="type = 'login'">已有账号，去登录</a>
      </div>
    </div>
  </div>
</template>

<script>
import verify from "@/libs/util.verify";
import store from "@/libs/util.store";
import api from "@/api";

export default {
  name: "Login",
  data() {
    return {
      type: "login",
      user: {
        phone: "",
        password: "",
      },
      register: {
        phone: "",
        password: "",
        verification: "",
      },
      codeTime: 0, // 验证码发送计时
    };
  },
  watch: {
    type() {
      if (this.type === "login") document.title = "用户登录";
      else document.title = "用户注册";
    },
    "$route.name": function () {
      this.type = this.$route.params.type || "login";
    },
  },
  created() {
    this.type = this.$route.params.type || "login";
  },
  methods: {
    // 发送验证码
    sendCode() {
      if (!verify.isPhone(this.register.phone)) {
        return this.$message.error("不是合法的手机号码");
      }
      // 发送验证码
      api
        .GET_CODE({
          phone: this.register.phone,
        })
        .then(() => {
          // 验证码发送成功 开始倒计时
          this.codeTime = 60;
          let timer = setInterval(() => {
            this.codeTime--;
            if (this.codeTime <= 0) {
              this.codeTime = 0;
              clearInterval(timer);
            }
          }, 1000);
        })
        .catch((err) => {
          // 验证码发送失败
          console.error(err);
        });
    },
    // 登录方法
    loginHander() {
      if (!verify.isPhone(this.user.phone)) {
        return this.$message.error("不是合法的手机号码");
      } else if (verify.isEmpty(this.user.password)) {
        return this.$message.error("密码不能为空");
      }
      api
        .USER_LOGIN(this.user)
        .then((res) => {
          this.$message.success("登录成功");
          this.user = { phone: "", password: "." };
          // 记录登录状态
          this.$store.commit("user/set", res);
          // 获取登录成功需要的重定向
          let redirectUrl = store.getItem("login-redirect");
          store.delItem("login-redirect");
          this.$router.replace(redirectUrl);
        })
        .catch((err) => {
          console.error(err);
        });
    },
    // 注册方法
    registerHander() {
      if (!verify.isPhone(this.register.phone)) {
        return this.$message.error("不是合法的手机号码");
      } else if (verify.isEmpty(this.register.password)) {
        return this.$message.error("密码不能为空");
      } else if (verify.isEmpty(this.register.verification)) {
        return this.$message.error("短信验证码不能为空");
      }
      api
        .USER_REGISTER(this.register)
        .then(() => {
          this.$message.success("注册成功");
          this.register = { phone: "", password: ".", verification: "" };
          this.type = "login";
        })
        .catch((err) => {
          console.error(err);
        });
    },
  },
};
</script>

<style lang="scss" scoped>
.content {
  padding: 60px 0;
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  justify-content: center;
  align-items: center;
  .login-box {
    width: 317px;
    padding: 30px 40px 0;
    background: #ffffff;
    border-radius: 5px;
    .input {
      height: 18px;
      padding: 10px 14px;
      border-bottom: 1px solid #f0f1f2;
      display: flex;
      align-items: center;
      font-size: 14px;
      color: #999999;
      margin-top: 10px;
      i {
        padding-right: 11px;
      }
      input {
        flex: 1;
        color: #333;
        outline: none;
        border: none;
        &::placeholder {
          color: #999999;
        }
      }
      .send-code {
        cursor: pointer;
      }
    }
    .login-btn {
      width: 268px;
      height: 44px;
      background: #d52c1a;
      border-radius: 22px;
      border: none;
      font-size: 14px;
      font-weight: 400;
      color: #ffffff;
      margin: 30px auto 20px;
      line-height: 44px;
      text-align: center;
      cursor: pointer;
      user-select: none;
      &:active {
        opacity: 0.8;
      }
    }
    .reg-link {
      display: block;
      margin: 0 auto;
      text-align: center;
      margin-bottom: 40px;
      a {
        cursor: pointer;
        color: #9b9b9b;
        font-size: 16px;
        text-decoration: none;
        &:hover {
          text-decoration: underline;
        }
      }
    }
    .other {
      width: 270px;
      margin: 0 auto;
      .tit {
        text-align: center;
        color: #9b9b9b;
        font-size: 14px;
        display: flex;
        align-items: center;
        span {
          padding: 0 18px;
        }
        &::after,
        &::before {
          content: "";
          display: block;
          flex: 1;
          height: 1px;
          background: #f0f1f2;
        }
      }
      .wx-login {
        i {
          text-align: center;
          display: block;
          color: #46bb36;
          margin: 16px auto 12px;
        }
        .tip {
          text-align: center;
          font-size: 14px;
          color: #999999;
          padding-bottom: 40px;
        }
      }
    }
  }
}
</style>
