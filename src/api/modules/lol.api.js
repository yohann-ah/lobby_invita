export default ({ request }) => ({
  INIT() {
    return request({
      url: "/api/init",
      method: "get",
    });
  },
});
