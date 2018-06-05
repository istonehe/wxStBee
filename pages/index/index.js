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
    canIUse: wx.canIUse('button.open-type.getUserInfo'),
    real_times: 0,
    asks_count: 0
  },
  //事件处理函数
  bindViewTap: function() {
    wx.navigateTo({
      url: '../logs/logs'
    })
  },
  onLoad: function () {
    let that = this

    let user_info = wx.getStorageSync('user_info') || []
    let beetoken = user_info.token
    let student_id = user_info.student_id
    
    // 请求学校信息
    wx.request({
      url: url + 'public/school/' + school_id,
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

    // 请求个人在校信息
    wx.request({
      url: url + 'student/' + student_id,
      header: {
        'Authorization': 'Basic ' + base64.encode(beetoken + ':x')
      },
      data: {
        school_id: school_id
      },
      success: res => {
        console.log(res.data)
        if (res.data.code == 4) {
          that.setData({
            hasUserInfo: false
          })
        } else if (res.data.code == 1){
          that.setData({
            real_times: res.data.real_times,
            asks_count: res.data.asks_count
          })
        }
      }
    })
    
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

    


  },
  getUserInfo: function(e) {
    let that = this;
    console.log(e)
    auth.beeLogin(that.onLoad)
    app.globalData.userInfo = e.detail.userInfo
    this.setData({
      userInfo: e.detail.userInfo,
      hasUserInfo: true
    })
  }
})
