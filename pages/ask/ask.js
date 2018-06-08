const requests = require('../../utils/requests.js')
Page({
  data: {
    asktext: '',
    imgIds: []
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
    wx.chooseImage({
      count: 3,
      success: function (res) {
        var tempFilePaths = res.tempFilePaths
        
        for (let i = 0, n = tempFilePaths.length; i < n; i++){
          console.log('x')
        }

        
      }
    })
  }

})