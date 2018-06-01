//auth.js

// 登录模块
function beeLogin(key, url, school_id, callback) {
  wx.login({
    success: res => {
      if (res.code) {
        wx.request({
          url: url + 'public/wxstlogin',
          data:{
            code: res.code,
            school_id: school_id
          },
          method: 'POST',
          header: {
            'content-type': 'application/json' // 默认值
          },
          success: function (res) {
            console.log(res.data)
          }
        })
      }
      // 发送 res.code 到后台换取 openId, sessionKey, unionId
      console.log(res.code)
    }
  })
}

module.exports = {
  beeLogin: beeLogin
}