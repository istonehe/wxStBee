//index.js
//获取应用实例
const app = getApp()
const config = require('../../utils/config.js')
const auth = require('../../utils/auth.js')
const base64 = require('../../utils/base64.min.js').Base64
const url = config.config.host
const school_id = config.config.school_id
Page({
  data: {
    schoolInfo: {},
    userInfo: {},
    hasUserInfo: false,
    canIUse: wx.canIUse('button.open-type.getUserInfo')
  },
  //事件处理函数
  bindViewTap: function() {
    wx.navigateTo({
      url: '../logs/logs'
    })
  },
  onLoad: function () {
    let that = this

    wx.request({
      url: url + 'public/school/' + school_id,
      header: {
        // 'Authorization': 'Basic ' + base64.encode(beetoken + ':x')
      },
      success: function (res) {
        console.log(res.data)
        if (res.data.code == 1) {
          let school_name = res.data.school.name;
          let course_name = res.data.course.course_name;
          let schoolInfo = {
            school_name: school_name,
            course_name: course_name
          }
          that.setData({
            schoolInfo: schoolInfo
          })
        }

      }
    })

    /*
    if (app.globalData.userInfo) {
      this.setData({
        userInfo: app.globalData.userInfo,
        hasUserInfo: true
      })
    } else if (this.data.canIUse){
      // 由于 getUserInfo 是网络请求，可能会在 Page.onLoad 之后才返回
      // 所以此处加入 callback 以防止这种情况
      app.userInfoReadyCallback = res => {
        this.setData({
          userInfo: res.userInfo,
          hasUserInfo: true
        })
      }
    } else {
      // 在没有 open-type=getUserInfo 版本的兼容处理
      wx.getUserInfo({
        success: res => {
          app.globalData.userInfo = res.userInfo
          this.setData({
            userInfo: res.userInfo,
            hasUserInfo: true
          })
        }
      })
    }
    */
    
    let beetoken = wx.getStorageSync('beetoken');
    if (!beetoken) {
      auth.beeLogin()
    } else {
      
    }


  },
  getUserInfo: function(e) {
    console.log(e)
    app.globalData.userInfo = e.detail.userInfo
    this.setData({
      userInfo: e.detail.userInfo,
      hasUserInfo: true
    })
  }
})
