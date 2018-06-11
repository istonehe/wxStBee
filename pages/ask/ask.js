const config = require('../../utils/config.js')
const url = config.config.host
const requests = require('../../utils/requests.js')
const auth = require('../../utils/auth.js')
// 定义录音管理器
const recorderManager = wx.getRecorderManager()
// 定义录音管理器配置
const options = {
  duration: 60000,
  sampleRate: 44100,
  numberOfChannels: 1,
  encodeBitRate: 192000,
  format: 'MP3',
  frameSize: 50
}

Page({
  data: {
    url: url,
    asktext: '',
    askimgs: [],
    auth_mask: false,
    recording: false,
    recordfile: '',
    recordtmp: '',
    recordauth_mask: false,
    voice_duration: 0,
    recordplaying: false
  },
  onLoad: function(){
    // 可以通过 wx.getSetting 先查询一下用户是否授权了 "scope.record" 这个 scope
    wx.getSetting({
      success(res) {
        if (!res.authSetting['scope.record']) {
          wx.authorize({
            scope: 'scope.record',
            success() {
              // 用户已经同意小程序使用录音功能，后续调用 wx.startRecord 接口不会弹窗询问
              
            }
          })
        }
      }
    })
    console.log('ok')
  },
  textInput: function(e){
    let that = this;
    console.log(e.detail)
    that.setData({
      asktext: e.detail.value
    })
  },
  uploadImg: function(e){
    let that = this;
    let nowcount = 3 - that.data.askimgs.length  // 剩余能够上传的数量
    let selectcount = 0; // 选择图片的数量
    let complete = 0; // 无论上传成功失败，最终的数量
    wx.chooseImage({
      count: nowcount,
      success: function (res) {
        var tempFilePaths = res.tempFilePaths;
        wx.showLoading({
          title: '上传中...',
          mask: true
        });
        for (let i = 0, n = tempFilePaths.length; i < n; i++){
          selectcount += 1;
          requests.upLoadFilePromise(that, tempFilePaths[i]).then(
            function(data){
              console.log(data)
              let askimgs = that.data.askimgs;
              askimgs.push(data);
              that.setData({
                askimgs: askimgs
              });
              complete += 1;
              if (complete == selectcount) {
                wx.hideLoading()
              }
            },
            function(value){
              complete += 1;
              if (complete == selectcount) {
                wx.hideLoading()
              }
            }
          )
        }
      }
    })
  },
  deleteImg: function(e) {
    let that = this;
    console.log(e)
    let askimgs = that.data.askimgs;
    askimgs.splice(e.currentTarget.id, 1)
    that.setData({
      askimgs: askimgs
    })
  },
  previewImgs: function(e){
    let that = this;
    let askimgs = that.data.askimgs;
    let imgurls =[]
    for (let i = 0, n = askimgs.length; i < n; i++) {
      imgurls.push(url + '/' + askimgs[i].url)
    }
    console.log(url + '/' + askimgs[e.currentTarget.id].url)
    wx.previewImage({
      current: url + '/' + askimgs[e.currentTarget.id].url, // 当前显示图片的http链接
      urls: imgurls // 需要预览的图片http链接列表
    })
  },
  touchDown: function(e){
    let that = this;
    console.log(e)
    wx.getSetting({
      success(res) {
        if (!res.authSetting['scope.record']) {
          wx.authorize({
            scope: 'scope.record',
            success() {
              // 用户已经同意小程序使用录音功能，后续调用 wx.startRecord 接口不会弹窗询问
            },
            fail(){
              that.setData({
                recordauth_mask: true
              })
            }
          })
        }
      }
    })
    that.setData({
      recording: true
    });
    recorderManager.start(options);
    let startTime = new Date().getTime();
    that.setData({
      voice_duration: startTime
    })
  },
  touchUp: function(e){
    console.log(e)
    let that = this;
    recorderManager.stop()
    let endTime = new Date().getTime();
    let startTime = that.data.voice_duration;
    let voice_duration = Math.round((endTime - startTime)/1000)
    that.setData({
      recording: false,
      voice_duration: voice_duration
    });
    recorderManager.onStop((res) => {
      console.log('recorder stop', res)
      const { tempFilePath } = res
      wx.showLoading({
        title: '上传中...',
        mask: true
      });
      requests.upLoadFilePromise(that, tempFilePath).then(
        function(data){
          that.setData({
            recordfile: data.url,
            recordtmp: tempFilePath
          })
          wx.hideLoading()
        },
        function(){
          wx.hideLoading()
        }
      );
    })
  },
  closeRecordAuthMask: function(){
    let that = this;
    that.setData({
      recordauth_mask: false
    })
  },
  playRecordVoice: function(){
    let that = this;
    const innerAudioContext = wx.createInnerAudioContext();
    innerAudioContext.src = that.data.recordtmp;
    innerAudioContext.play();
    innerAudioContext.onPlay(() => {
      console.log('正在播放')
      that.setData({
        recordplaying: true
      });
    })
    innerAudioContext.onEnded(() => {
      console.log('播放完成')
      that.setData({
        recordplaying: false
      })
    })
  },
  deleteVoice: function(){
    let that = this;
    that.setData({
      recordfile: '',
      recordtmp: '',
      voice_duration: 0
    });
  },
  submitAsk: function(){
    let that = this;
    let ask_text = that.data.asktext;
    let voice_url = that.data.recordfile;
    let voice_duration = that.data.voice_duration;
    let askimgs = that.data.askimgs;
    let img_list = [];
    for (let i = 0, n = askimgs.length; i < n; i++){
      img_list.push(askimgs[i].id)
    }
    let img_ids = img_list.toString()
    requests.submitAskPromise(that, ask_text, voice_url, voice_duration, img_ids).then(
      function(data){
        console.log(data)
      },
      function(data){
        console.log(data)
      }
    );
  },
  goLogin: function () {
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
  }

})