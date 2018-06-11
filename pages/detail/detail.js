const config = require('../../utils/config.js')
const url = config.config.host
const requests = require('../../utils/requests.js')
const auth = require('../../utils/auth.js')

Page({
  data:{
    url: url,
    pageloading: true,
    auth_mask: false,
    asktext: '',
    askimgs: [],
    recordfile: '',
    voice_duration: 0
  },
  onLoad: function(){
    let that = this;
    requests.getAskDetailPromise(that, 5).then(
      function(data){
        console.log(data)
        that.setData({
          pageloading: false,
          asktext: data.ask.ask_text,
          askimgs: data.ask.imgs,
          recordfile: data.ask.voice_url,

        })
      },
      function(data){
        console.log(data)
      }
    )
  },
  previewImgs: function (e) {
    let that = this;
    let askimgs = that.data.askimgs;
    let imgurls = []
    for (let i = 0, n = askimgs.length; i < n; i++) {
      imgurls.push(url + '/' + askimgs[i])
    }
    console.log(url + '/' + askimgs[e.currentTarget.id])
    wx.previewImage({
      current: url + '/' + askimgs[e.currentTarget.id], // 当前显示图片的http链接
      urls: imgurls // 需要预览的图片http链接列表
    })
  },
  goLogin: function () {
    let that = this;
    auth.beeLoginPromise().then(
      function (value) {
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
  }
})