const fs = window.require("fs");
const path = window.require("path");
const electron = window.require("electron");

let configPath = path.join(
  path.dirname(electron.remote.app.getPath("exe")),
  "config.json"
);

export default {
  /**
   * 获取本地存储数据
   * @param {*} name 存储键值
   * @returns 本地存储的数据不存才返回null
   */
  getItem(name) {
    let exis = fs.existsSync(configPath);
    let config = null;
    if (exis) config = JSON.parse(fs.readFileSync(configPath).toString());
    else config = {};
    return name ? config[name] : config;
  },
  /**
   * 设置本地存储数据
   * @param {*} name 存储键值
   * @param {*} value 要存储的数据
   */
  setItem(name, value) {
    let config = this.getItem();
    if (value == null) delete config[name];
    else config[name] = value;
    fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
  },
  /**
   * 保存配置
   * @param {*} config
   */
  save(config) {
    fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
  },
  /**
   * 删除本地存储的数据
   * @param {*} name 存储键值
   */
  delItem(name) {
    let config = this.getItem();
    delete config[name];
    fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
  },
};
