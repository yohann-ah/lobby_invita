// 导入一个弹窗组件
import Popups from "./Popups.vue";
import Vue from "vue";

// 初始化弹窗实例
let popupsInstance;

/**
 * 创建新实例
 * @param {*} properties 实例属性
 */
Popups.newInstance = (properties) => {
  // 设置默认属性
  const _props = Object.assign(
    {
      // 这里面可以放一些默认的属性
    },
    properties || {}
  );

  // 创建新的Vue实例
  const Instance = new Vue({
    render(h) {
      return h(Popups, {
        props: _props,
      });
    },
  });

  // 获取Vue实例
  const component = Instance.$mount();

  // 把实例添加到body上
  document.body.appendChild(component.$el);

  // 获取实例
  const popups = Instance;

  return popups;
};

// 获取弹窗实例
function getPopupsInstance() {
  // 如果实例不存在则创建一个新实例
  if (!popupsInstance) popupsInstance = Popups.newInstance();

  // 返回实例
  return popupsInstance;
}

function showPopups() {
  // 获取实例
  let instance = getPopupsInstance();

  // 返回实例
  return instance.$children[0];
}

// 导出显示弹窗方法
export default showPopups;
