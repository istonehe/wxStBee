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
    askrecordfile: '',
    askvoice_duration: 0,
    be_answered: false,
  },
  onLoad: function(){
    let that = this;
    requests.getAskDetailPromise(that, 17).then(
      function(data){
        console.log(data)
        that.setData({
          pageloading: false,
          asktext: data.ask.ask_text,
          askimgs: data.ask.imgs,
          askrecordfile: data.ask.voice_url,
          askvoice_duration: data.ask.voice_duration,
          be_answered: data.ask.be_answered
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