//index.js
//获取应用实例
const app = getApp()
const config = require('../../utils/config.js')
const auth = require('../../utils/auth.js')
const requests = require('../../utils/requests.js')
const base64 = require('../../utils/base64.min.js').Base64
const url = config.config.host
const school_id = config.config.school_id

Page({
  data: {
    schoolInfo: {},
    userInfo: {},
    hasUserInfo: false,
    canIUse: wx.canIUse('button.open-type.getUserInfo'),
    student: {},
    auth_mask: false
  },
  onLoad: function () {
    let that = this
    let user_info = wx.getStorageSync('user_info') || []
    let beetoken = user_info.token
    let student_id = user_info.student_id
    // 请求学校信息
    wx.request({
      url: url + '/v1/public/school/' + school_id,
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

    if(!beetoken){
      //无token 首次登录
      auth.beeLoginPromise().then(function (value) {
        requests.getStudentInfo(that)
      }, function (error) {
        wx.showToast({
          title: '服务器开小差，请重试',
          icon: 'none',
          duration: 2000
        })
      });
    } else if (beetoken){
      //带token 再次运行
      requests.getStudentInfo(that)
    }
    
    if (app.globalData.userInfo) {
      that.setData({
        userInfo: app.globalData.userInfo,
        hasUserInfo: true
      })
    } else if (that.data.canIUse) {
      // 由于 getUserInfo 是网络请求，可能会在 Page.onLoad 之后才返回
      // 所以此处加入 callback 以防止这种情况
      app.userInfoReadyCallback = res => {
        that.setData({
          userInfo: res.userInfo,
          hasUserInfo: true
        })
      }
    } else {
      // 在没有 open-type=getUserInfo 版本的兼容处理
      wx.getUserInfo({
        success: res => {
          app.globalData.userInfo = res.userInfo
          that.setData({
            userInfo: res.userInfo,
            hasUserInfo: true
          })
        }
      })
    }
  },
  getUserInfo: function(e) {
    let that = this;
    let user_info = wx.getStorageSync('user_info') || []
    let student_id = user_info.student_id
    console.log(e)
    app.globalData.userInfo = e.detail.userInfo
    if (e.detail.userInfo){
      this.setData({
        userInfo: e.detail.userInfo,
        hasUserInfo: true
      })
      //交换敏感数据
      wx.request({
        url: url + '/v1/public/studentwxsecret/' + school_id + '/' + student_id,
        method: 'PUT',
        data:{
          nickname: e.detail.userInfo.nickName,
          city: e.detail.userInfo.city,
          province: e.detail.userInfo.province,
          country: e.detail.userInfo.country,
          gender: e.detail.userInfo.gender,
          avatarUrl: e.detail.userInfo.avatarUrl,
          encryptedData: e.detail.encryptedData,
          iv: e.detail.iv
        },
        success: function (res) {
          console.log(res.data)
          if (res.data.code == 1) {
            console.log('数据正常获取')
          } else {
            wx.showToast({
              title: '服务器开小差，请重试',
              icon: 'none',
              duration: 2000
            })
          }
        }
      })
    } else {
      wx.showToast({
        title: '允许授权可以获得更好的服务哦！',
        icon: 'none',
        duration: 2000
      })
    }
  },
  goLogin: function(){
    let that = this;
    auth.beeLoginPromise().then(function (value) {
      requests.getStudentInfo(that)
    }, function (error) {
      wx.showToast({
        title: error,
        icon: 'none',
        duration: 2000
      })
    });
    that.setData({
      auth_mask: false
    })
  },
  goAsk: function () {
    let that = this;
    let real_times = that.data.student.real_times;
    if (real_times > 0 || real_times == -1) {
      console.log('yes')
      wx.navigateTo({
        url: '../ask/ask'
      })
    } else {
      wx.showToast({
        title: '提问次数已经用完，请联系老师！',
        icon: 'none',
        duration: 2000
      })
    }
  },
  goAskList: function(){
    let that = this;
    wx.navigateTo({
      url: '../asklist/asklist'
    })
  },
  goMemberInfo: function(){
    wx.navigateTo({
      url: '../member/member'
    })
  }
})
