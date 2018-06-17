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
    ask: {},
    ask_id: 0,
    answers: [],
    ask_recordplaying: false,
    answers_playstatus: [],
    grate_value: 0
  },
  onLoad: function (res) {
    let that = this;
    console.log(res)
    let ask_id = res.ask_id;
    
    requests.getAskDetailPromise(that, ask_id).then(
      function (data) {
        console.log(data)

        // 载入ask数据
        let ask = data.ask;
        // 将ask时间转换成相对时间
        ask.postedtime = moment(data.ask.timestamp).add(8, 'hours').fromNow();
        
        // 定义answers数据组
        let answers = [];
        // 载入answers数据组
        // 定义answers录音播放状态数据组
        let answers_playstatus = [];
        let www_answers = data.ask.answers;
        for (let i = 0, n = www_answers.length; i < n; i++) {
          answers[i] = www_answers[i];
          answers[i].answered_time = moment(www_answers[i].timestamp).add(8, 'hours').fromNow();
          answers_playstatus[i] = false;
        }

        that.setData({
          ask: ask,
          ask_id: ask_id,
          answers: answers,
          ask_recordplaying: false,
          answers_playstatus: answers_playstatus,
          pageloading: false
        })

        let user_info = wx.getStorageSync('user_info') || [];
        let beetoken = user_info.token;
        let student_id = user_info.student_id;

        //获取回答评价值
        wx.request({
          url: url + '/v1/student/ask/' + ask_id + '/answergrate',
          header: {
            'Authorization': 'Basic ' + base64.encode(beetoken + ':x')
          },
          success: function(res){
            let data = res.data;
            console.log(data)
            if (data.code == 4) {
              that.setData({
                auth_mask: true
              });             
            } else if (data.code == 1) {
              that.setData({
                grate_value: data.grate_value
              })
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
  askPlayVoice: function () {
    let that = this;
    const innerAudioContext = wx.createInnerAudioContext();
    innerAudioContext.src = url + '/' + that.data.ask.voice_url;
    console.log(url + '/' + that.data.ask.voice_url)
    innerAudioContext.play();
    innerAudioContext.onPlay(() => {
      console.log('正在播放')
      that.setData({
        ask_recordplaying: true
      });
    });
    innerAudioContext.onEnded(() => {
      console.log('播放完成')
      that.setData({
        ask_recordplaying: false
      });
    });
    innerAudioContext.onError((res) =>{
      console.log('播放错误')
      console.log(res.errMsg)
      console.log(res.errCode)
    })
  },
  answerPlayVoice: function (e) {
    let that = this;
    console.log(e)
    let answer_id = e.currentTarget.id;
    const innerAudioContext = wx.createInnerAudioContext();
    innerAudioContext.src = url + '/' + that.data.answers[answer_id].voice_url;
    console.log(url + '/' + that.data.answers[answer_id].voice_url)
    innerAudioContext.play();
    innerAudioContext.onPlay(() => {
      console.log('正在播放')
      let answers_playstatus = that.data.answers_playstatus;
      answers_playstatus[answer_id] = true;
      that.setData({
        answers_playstatus: answers_playstatus
      });
    });
    innerAudioContext.onEnded(() => {
      console.log('播放完成')
      let answers_playstatus = that.data.answers_playstatus;
      answers_playstatus[answer_id] = false;
      that.setData({
        answers_playstatus: answers_playstatus
      });
    });
    innerAudioContext.onError((res) => {
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
  submitGrate: function(e){
    let that = this;
    console.log(e.currentTarget)
    let grate_value = e.currentTarget.dataset.value;
    //提交回答评价值
    let user_info = wx.getStorageSync('user_info') || [];
    let beetoken = user_info.token;
    let student_id = user_info.student_id;
    let ask_id = that.data.ask_id;
    wx.request({
      url: url + '/v1/student/ask/' + ask_id + '/answergrate',
      method: 'PUT',
      header: {
        'Authorization': 'Basic ' + base64.encode(beetoken + ':x'),
        'content-type': 'application/json'
      },
      data:{
        grate: grate_value
      },
      success: function (res) {
        let data = res.data;
        console.log(data)
        if (data.code == 4) {
          that.setData({
            auth_mask: true
          });
        } else if (data.code == 1) {
          that.setData({
            grate_value: grate_value
          })
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