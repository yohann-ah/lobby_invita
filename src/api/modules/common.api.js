export default ({ request }) => ({
  GET(url, params, timeout) {
    return request({
      url: url,
      method: "get",
      params,
      timeout,
    });
  },
  POST(url, data) {
    return request({
      url,
      method: "post",
      data,
    });
  },
});
