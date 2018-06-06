//auth.js

// 登录模块
function beeLogin(callback) {
  const config = require('config.js')
  const url = config.config.host
  const school_id = config.config.school_id
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
            if (res.data.code == 1) {
              console.log("登录成功1")
              let user_info = {
                token: res.data.token,
                student_id: res.data.student_id
              }
              wx.setStorageSync('user_info', user_info)
              if (callback && typeof (callback) === "function") {
                callback();
              }
            } else {
              console.log('登录失败！' + res.data.message)
            }   
          }
        })
      } else {
        console.log('登录失败！' + res.errMsg)
      }
    }
  })
}

//Promise封装登录模块

function beeLoginPromise(){
  var LoginPromise = new Promise((resolve, reject) => {
    const config = require('config.js')
    const url = config.config.host
    const school_id = config.config.school_id

    wx.login({
      success: res => {
        if (res.code) {
          wx.request({
            url: url + 'public/wxstlogin',
            data: {
              code: res.code,
              school_id: school_id
            },
            method: 'POST',
            header: {
              'content-type': 'application/json' // 默认值
            },
            success: function (res) {
              if (res.data.code == 1) {
                console.log("登录成功")
                let user_info = {
                  token: res.data.token,
                  student_id: res.data.student_id
                }
                wx.setStorageSync('user_info', user_info)
                resolve(user_info)
              } else {
                console.log('登录失败！' + res.data.message)
                reject(res.data.message);
              }
            }
          })
        } else {
          console.log('登录失败！' + res.errMsg)
          reject(res.errMsg);
        }
      }
    })
  });
  return LoginPromise;
}


module.exports = {
  beeLogin: beeLogin,
  beeLoginPromise: beeLoginPromise
}


