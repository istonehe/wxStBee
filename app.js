//app.js
App({
  onLaunch: function () {
    // 展示本地存储能力
    var logs = wx.getStorageSync('logs') || []
    logs.unshift(Date.now())
    wx.setStorageSync('logs', logs)
    const config = require('utils/config.js')
    const auth = require('utils/auth.js')
    const url = config.config.host
    const school_id = config.config.school_id
    console.log(school_id)
    // 登录
    auth.beeLogin('ddddddddd', url, school_id)
    
  },
  globalData: {
    userInfo: null
  }
})