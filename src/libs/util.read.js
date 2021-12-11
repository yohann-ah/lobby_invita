export default {
  /**
   * 读取黑名单
   */
  readBlackList() {
    return window.GetGameDataList.readBlackList();
  },
  /**
   * 读取房主列表
   */
  readHomeOwner() {
    return window.GetGameDataList.readHomeOwner();
  },
  /**
   * QQ群列表
   */
  readQqGroup() {
    return window.GetGameDataList.readQqGroup();
  },
  /**
   * 规则列表
   */
  readRules() {
    return window.GetGameDataList.readRules();
  },
};
