import validator from "validator";

export default {
  isPhone(str) {
    return validator.isMobilePhone(str, "zh-CN");
  },
  isEmpty(str) {
    return validator.isEmpty(str);
  },
};
