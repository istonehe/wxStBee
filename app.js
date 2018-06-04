//app.js
App({
  onLaunch: function () {    
    let user_info = wx.getStorageSync('user_info') || []
    let beetoken = user_info.token
    let student_id = user_info.student_id
    const auth = require('utils/auth.js')
    if (!beetoken) {
      auth.beeLogin()
    }


    // 获取用户信息
    wx.getSetting({
      success: res => {
        if (res.authSetting['scope.userInfo']) {
          // 已经授权，可以直接调用 getUserInfo 获取头像昵称，不会弹框
          wx.getUserInfo({
            success: res => {
              // 可以将 res 发送给后台解码出 unionId
              this.globalData.userInfo = res.userInfo

              // 由于 getUserInfo 是网络请求，可能会在 Page.onLoad 之后才返回
              // 所以此处加入 callback 以防止这种情况
              if (this.userInfoReadyCallback) {
                this.userInfoReadyCallback(res)
              }
            }
          })
        }
      }
    })


    

  },
  globalData: {
    userInfo: null
  }
})