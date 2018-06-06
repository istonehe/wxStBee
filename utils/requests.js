
function getStudentInfo(that){
  const config = require('config.js')
  const url = config.config.host
  const school_id = config.config.school_id
  const base64 = require('base64.min.js').Base64
  let user_info = wx.getStorageSync('user_info') || []
  let beetoken = user_info.token
  let student_id = user_info.student_id

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
          hasUserInfo: false,
          auth_mask: true
        })
      } else if (res.data.code == 1) {
        that.setData({
          real_times: res.data.real_times,
          asks_count: res.data.asks_count
        })
      } else {
        wx.showToast({
          title: '服务器开小差，请重试',
          icon: 'none',
          duration: 2000
        })
      }
    }
  })

}


module.exports = {
  getStudentInfo: getStudentInfo
}


