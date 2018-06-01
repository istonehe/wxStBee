//auth.js

// 登录模块
// key 本地存储健值
// url 请求url
// school_id 学校或机构id
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
            if (res.data.code == 1) {
              console.log("登录成功")
              let token = res.data.token
              wx.setStorageSync(key, token)
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

function sessionAuth(key, url, school_id, callback){
  try{
    
    // 看看本地库是否存在记录
    let beetoken = wx.getStorageSync(key)
    
    // 如果存在
    if (beetoken) {
      // 先看看wx的session是否过期
      wx.checkSession({
        success: function(){
          //没有过期，且在本生命周期一直有效
          //检查自定义授权key是否有效
          wx.request({
            url: '',
          })

        },
        fail: function () {
          // session_key 已经失效，需要重新执行登录流程
          // wx.login() //重新登录
          
        }
      })

    } else {

    }


  } catch(e){

  }
  
}


module.exports = {
  beeLogin: beeLogin
}


