const config = require('../../utils/config.js')
const url = config.config.host
const requests = require('../../utils/requests.js')
const auth = require('../../utils/auth.js')
const base64 = require('../../utils/base64.min.js').Base64;
const moment = require('../../utils/moment-with-locales.js')
const util = require('../../utils/util.js')
moment.locale('zh-cn')

Page({
  data: {
    url: url,
    pageloading: true,
    auth_mask: false,

    asktext: '',
    askimgs: [],
    askrecordfile: '',
    askvoice_duration: 0,
    recordplaying: false,
    be_answered: false,
    postedtime: '',

    ask: {},
    ask_id: 0,
    answers: []
  },
  onLoad: function () {
    let that = this;
    let ask_id = 21
    requests.getAskDetailPromise(that, ask_id).then(
      function (data) {
        console.log(data)

        let ask = data.ask;
        ask.postedtime = moment(data.ask.timestamp).add(8, 'hours').fromNow();
        ask.recordplaying = false;

        let answers = [];
        let www_answers = data.ask.answers;
        for (let i = 0, n = www_answers.length; i < n; i++) {
          answers[i] = www_answers[i];
          answers[i].answered_time = moment(www_answers[i].timestamp).add(8, 'hours').fromNow();
          if (www_answers[i].teacher_imgurl){
            answers[i].teacher_imgurl = url + '/' + www_answers[i].teacher_imgurl;
          }
          if (www_answers[i].student_imgurl) {
            answers[i].student_imgurl = url + '/' + www_answers[i].student_imgurl;
          }
        }

        that.setData({
          ask: ask,
          //asktext: data.ask.ask_text,
          //askimgs: data.ask.imgs,
          //askrecordfile: url + '/' + data.ask.voice_url,
          //askvoice_duration: data.ask.voice_duration,
          //be_answered: data.ask.be_answered,
          //postedtime: postedtime,
          ask_id: ask_id,
          answers: answers,
          pageloading: false
        })
      },
      function (data) {
        console.log(data)
      }
    )
  },
  askPreviewImgs: function (e) {
    let that = this;
    console.log(e)
    let imgs = that.data.ask.imgs;
    util.previewImgs(imgs, e);
  },
  answerPreviewImgs: function(e){
    let that = this;
    console.log(e)
    let imgs = that.data.answers[e.currentTarget.dataset.parentindex].imgs;
    util.previewImgs(imgs, e);
  },
  playVoice: function () {
    let that = this;
    const innerAudioContext = wx.createInnerAudioContext();
    innerAudioContext.src = url + '/' + that.data.ask.voice_url;
    console.log(url + '/' + that.data.ask.voice_url)
    innerAudioContext.play();
    innerAudioContext.onPlay(() => {
      console.log('正在播放')
      let ask = that.data.ask;
      ask.recordplaying = true;
      that.setData({
        ask: ask
      });
    });
    innerAudioContext.onEnded(() => {
      console.log('播放完成')
      let ask = that.data.ask;
      ask.recordplaying = false;
      that.setData({
        ask: ask
      });
    });
    innerAudioContext.onError((res) =>{
      console.log('播放错误')
      console.log(res.errMsg)
      console.log(res.errCode)
    })
  },
  deleteAsk: function () {
    let that = this;
    let ask_id = that.data.ask_id;
    let user_info = wx.getStorageSync('user_info') || [];
    let beetoken = user_info.token;
    let student_id = user_info.student_id;
    wx.request({
      url: url + '/' + 'v1/student/ask/' + ask_id,
      method: 'DELETE',
      header: {
        'Authorization': 'Basic ' + base64.encode(beetoken + ':x')
      },
      success: function (res) {
        let data = res.data;
        console.log(data)
        if (data.code == 4) {
          that.setData({
            auth_mask: true
          });
        } else if (res.statusCode == 204) {
          console.log('删除成功,这里将来要指向来源界面，例如列表或发布界面')
        } else {
          wx.showToast({
            title: data.message || '服务器开小差了',
            icon: 'none',
            duration: 2000
          });
        }
      }
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