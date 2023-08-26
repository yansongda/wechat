Page({
  data: {
    tools: [
      {
        "name": "TOTP身份验证器",
        "icon": "lock",
        "url": "/pages/tools/totp/index",
      },
      {
        "name": "短链生成服务",
        "icon": "link",
        "url": "/pages/tools/shorturl/index",
      }
    ]
  },
  navigate(e: any) {
    const { url } = e.currentTarget.dataset;

    wx.navigateTo({
      url
    })
  }
})