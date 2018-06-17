const config = require('../../utils/config.js')
const url = config.config.host
const requests = require('../../utils/requests.js')
const auth = require('../../utils/auth.js')
const base64 = require('../../utils/base64.min.js').Base64;
const moment = require('../../utils/moment-with-locales.js')
const util = require('../../utils/util.js')
const per_page = 5;

moment.locale('zh-cn')

Page({
  data: {
    url: '',
    pageloading: true,
    answered_sort_open: false,
    answered_sort_value: 0,
    auth_mask: false,
    asks: [],
    page: 1,
    count: 0,
    bottom_loading: false,
    next: ''
  },
  onLoad: function () {
    let that = this;
    that.setData({
      url: url
    });
    let answered_sort_value = that.data.answered_sort_value;
    requests.getAskListPromise(that, 1, per_page, answered_sort_value).then(
      function (data) {
        console.log(data)
        let asks = data.asks;
        for (let i = 0, n = asks.length; i < n; i++) {
          asks[i].postedtime = moment(asks[i].timestamp).add(8, 'hours').fromNow();
        }
        that.setData({
          asks: asks,
          page: 1,
          next: data.next,
          count: data.count,
          bottom_loading: false,
          pageloading: false
        })
      }, function (data) {
        console.log(data)
      }
    )
  },
  onPullDownRefresh: function () {
    let that = this;
    let answered_sort_value = that.data.answered_sort_value;
    requests.getAskListPromise(that, 1, per_page, answered_sort_value).then(
      function (data) {
        console.log(data)
        let asks = data.asks;
        for (let i = 0, n = asks.length; i < n; i++) {
          asks[i].postedtime = moment(asks[i].timestamp).add(8, 'hours').fromNow();
        }
        that.setData({
          asks: asks,
          page: 1,
          next: data.next,
          bottom_loading: false
        })
        wx.stopPullDownRefresh()
      }, function (data) {
        console.log(data)
      }
    )
  },
  onReachBottom: function(){
    let that = this;

    let answered_sort_value = that.data.answered_sort_value;
    let page = that.data.page;
    let asks = that.data.asks;
    if (that.data.next){
      that.setData({
        bottom_loading: true
      });

      requests.getAskListPromise(that, page + 1, per_page, answered_sort_value).then(
        function (data) {
          console.log(data)
          let added_asks = data.asks;
          asks = asks.concat(added_asks);
          for (let i = 0, n = asks.length; i < n; i++) {
            asks[i].postedtime = moment(asks[i].timestamp).add(8, 'hours').fromNow();
          }
          that.setData({
            asks: asks,
            page: page + 1,
            next: data.next,
            bottom_loading: false
          })
          wx.stopPullDownRefresh()
        }, function (data) {
          console.log(data)
        }
      )
    } else{
      console.log('已经到底了')
    }   
    
  },
  openAnswerSortNav: function () {
    let that = this;
    that.setData({
      answered_sort_open: true
    })
  },
  closeAnswerSortNav: function () {
    let that = this;
    that.setData({
      answered_sort_open: false
    })
  },
  toAnsweredSort: function (e) {
    let that = this;
    console.log(e.currentTarget)
    let selected_value = e.currentTarget.dataset.value;
    that.setData({
      answered_sort_value: selected_value,
      answered_sort_open: false
    })
    that.onLoad();
  },
  goAskDetail: function(e){
    let that = this;
    console.log(e.currentTarget)
    let ask_id = e.currentTarget.id;
    wx.navigateTo({
      url: '../detail/detail?ask_id=' + ask_id 
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