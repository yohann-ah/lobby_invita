// import { Message } from "element-ui";
import axios from "axios";
import { get, isEmpty } from "lodash";
import qs from "qs";
// import store from "@/store";

/**
 * @description 创建请求实例
 */
function createService() {
  // 创建一个 axios 实例
  const service = axios.create();

  // 请求拦截
  service.interceptors.request.use(
    (config) => config,
    (error) => {
      // 发送失败
      console.log(error);
      return Promise.reject(error);
    }
  );

  // 响应拦截
  service.interceptors.response.use(
    (response) => {
      // 没有 code 视为非项目接口不作处理
      if (response.data.code === undefined) {
        return response.data;
      }

      // 有 code 判断为项目接口请求
      switch (response.data.code) {
        // 返回响应内容
        case 0:
          return response.data.data;
        case 400:
          // Message.error(response.data.msg);
          throw new Error(`${response.data.msg}: ${response.config.url}`);
        // 根据需要添加其它判断
        default:
          // Message.error(response.data.msg);
          throw new Error(`${response.data.msg}: ${response.config.url}`);
      }
    },
    (error) => {
      const status = get(error, "response.status");
      switch (status) {
        case 400:
          error.message = "请求错误";
          break;
        case 401:
          error.message = "未授权，请登录";
          break;
        case 403:
          error.message = "拒绝访问";
          break;
        case 404:
          error.message = `请求地址出错: ${error.response.config.url}`;
          break;
        case 408:
          error.message = "请求超时";
          break;
        case 500:
          error.message = "服务器内部错误";
          break;
        case 501:
          error.message = "服务未实现";
          break;
        case 502:
          error.message = "网关错误";
          break;
        case 503:
          error.message = "服务不可用";
          break;
        case 504:
          error.message = "网关超时";
          break;
        case 505:
          error.message = "HTTP版本不受支持";
          break;
        default:
          break;
      }
      let excludeUrl = ["/game/stats"];
      if (excludeUrl.indexOf(error.config.url) === -1) {
        console.error(error.config.data);
        console.error(error.config.url, error.message);
      }
    }
  );
  return service;
}

function stringify(data) {
  return qs.stringify(data, { allowDots: true, encode: false });
}

/**
 * @description 创建请求方法
 * @param {Object} service axios 实例
 */
function createRequest(service) {
  return function (config) {
    const configDefault = {
      baseURL: "http://127.0.0.1:49223",
      headers: {
        "Content-Type": get(config, "headers.Content-Type", "application/json"),
      },
      timeout: 5000,
      data: {},
    };

    const option = Object.assign(configDefault, config);
    // 处理 get 请求的参数
    if (!isEmpty(option.params)) {
      option.url = option.url + "?" + stringify(option.params);
      option.params = {};
    }

    // 当需要以 form 形式发送时 处理发送的数据
    if (
      !isEmpty(option.data) &&
      option.headers["Content-Type"] === "application/x-www-form-urlencoded"
    ) {
      option.data = stringify(option.data);
    }

    return service(option);
  };
}

// 用于网络请求的实例和请求方法
export const service = createService();
export const request = createRequest(service);
