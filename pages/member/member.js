const config = require('../../utils/config.js')
const url = config.config.host
const requests = require('../../utils/requests.js')
const auth = require('../../utils/auth.js')
const base64 = require('../../utils/base64.min.js').Base64;
const moment = require('../../utils/moment-with-locales.js')
const util = require('../../utils/util.js')
moment.locale('zh-cn')

Page({
  data:{
    student: {},
    auth_mask: false,
    vip_expire_show: ''
  },
  onLoad: function(){
    let that = this;
    requests.getStudentInfoPromise(that).then(
      function(data){
        console.log(moment(data.vip_expire).format('YYYY-MM-DD HH:SS'))
        // 比较时间
        if (moment().isBefore(data.vip_expire) ){
          that.setData({
            vip_expire_show: moment(data.vip_expire).format('YYYY-MM-DD HH:SS')
          })
        } else {
          that.setData({
            vip_expire_show: '已过期'
          })
        }
        that.setData({
          student: data
        })
      },
      function(value){
        console.log(value)
      }
    )
    

  },
  goLogin: function () {
    let that = this;
    auth.beeLoginPromise().then(function (value) {
      that.onLoad()
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
})