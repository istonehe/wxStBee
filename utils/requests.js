// requests.js

const config = require('config.js');
const url = config.config.host;
const school_id = config.config.school_id;
const base64 = require('base64.min.js').Base64;

// 获取用户信息
function getStudentInfo(that){
  let user_info = wx.getStorageSync('user_info') || [];
  let beetoken = user_info.token;
  let student_id = user_info.student_id;
  wx.request({
    url: url + '/v1/student/' + student_id,
    header: {
      'Authorization': 'Basic ' + base64.encode(beetoken + ':x')
    },
    data: {
      school_id: school_id
    },
    success: res => {
      console.log(res.data)
      console.log(typeof(res.data))
      if (res.data.code == 4) {
        that.setData({
          hasUserInfo: false,
          auth_mask: true
        });
      } else if (res.data.code == 1) {
        that.setData({
          real_times: res.data.real_times,
          asks_count: res.data.asks_count
        });
      } else {
        wx.showToast({
          title: '服务器开小差，请重试',
          icon: 'none',
          duration: 2000
        });
      }
    }
  })
}

// 上传文件Promise
function upLoadFilePromise(that, tempFilePath){
  let user_info = wx.getStorageSync('user_info') || [];
  let beetoken = user_info.token;
  let student_id = user_info.student_id;
  var upLoadPromise = new Promise((resolve, reject) => {
    wx.uploadFile({
      url: url + '/v1/public/uploads', 
      filePath: tempFilePath,
      name: 'file',
      header:{
        'Authorization': 'Basic ' + base64.encode(beetoken + ':x'),
        'content-type': 'application/json'
      },
      success: function (res) {
        if (res.statusCode == 413){
          reject();
          wx.showToast({
            title: '单张图片不能大于5M',
            icon: 'none',
            duration: 2000
          });
        } else{
          let data = JSON.parse(res.data);
          if (data.code == 4) {
            that.setData({
              auth_mask: true
            });
            reject();
          } else if (data.code == 1) {
            resolve(data);
          } else {
            wx.showToast({
              title: data.message || '服务器开小差了',
              icon: 'none',
              duration: 2000
            });
            reject();
          }
        }
      }
    });
  });
  return upLoadPromise;
}

// 提交问题Promise
function submitAskPromise(that, ask_text, voice_url, voice_duration, img_ids){
  let user_info = wx.getStorageSync('user_info') || [];
  let beetoken = user_info.token;
  let student_id = user_info.student_id;
  var submitPromise = new Promise((resolve, reject) => {
    wx.request({
      url: url + '/v1/student/asks',
      method: 'POST',
      header: {
        'Authorization': 'Basic ' + base64.encode(beetoken + ':x')
      },
      data: {
        school_id: school_id,
        ask_text: ask_text,
        voice_url: voice_url,
        voice_duration: voice_duration,
        img_ids: img_ids
      },
      success: function (res) {
        let data = res.data;
        console.log(data)
        if (data.code == 4) {
          that.setData({
            auth_mask: true
          });
          reject();
        } else if (data.code == 1) {
          resolve(data);
        } else {
          wx.showToast({
            title: data.message || '服务器开小差了',
            icon: 'none',
            duration: 2000
          });
          reject();
        }
      }
    })
  });
  return submitPromise;
}

module.exports = {
  getStudentInfo: getStudentInfo,
  upLoadFilePromise: upLoadFilePromise,
  submitAskPromise: submitAskPromise
}


