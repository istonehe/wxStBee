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
      if (res.data.code == 4) {
        that.setData({
          hasUserInfo: false,
          auth_mask: true
        });
      } else if (res.data.code == 1) {
        that.setData({
          student: res.data
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

// 获取用户信息Promise
function getStudentInfoPromise(that){
  let user_info = wx.getStorageSync('user_info') || [];
  let beetoken = user_info.token;
  let student_id = user_info.student_id;
  let StudentInfoPromise = new Promise((resolve, reject) => {
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
        let data = res.data;
        if (res.data.code == 4) {
          that.setData({
            hasUserInfo: false,
            auth_mask: true
          });
          reject();
        } else if (res.data.code == 1) {
          resolve(data);
        } else {
          wx.showToast({
            title: '服务器开小差，请重试',
            icon: 'none',
            duration: 2000
          });
          reject();
        }
      }
    })
  })
  return StudentInfoPromise;
}



// 上传文件Promise
function upLoadFilePromise(that, tempFilePath){
  let user_info = wx.getStorageSync('user_info') || [];
  let beetoken = user_info.token;
  let student_id = user_info.student_id;
  let upLoadPromise = new Promise((resolve, reject) => {
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
  let submitPromise = new Promise((resolve, reject) => {
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

// 获取问题详情Promise
function getAskDetailPromise(that, ask_id) {
  let user_info = wx.getStorageSync('user_info') || [];
  let beetoken = user_info.token;
  let student_id = user_info.student_id;
  let askDetailPromise = new Promise((resolve, reject) => {
    wx.request({
      url: url + '/v1/student/ask/' + ask_id,
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
  return askDetailPromise;
}

// 获取问题列表Promise
function getAskListPromise(that, page, per_page, answered=0){
  let user_info = wx.getStorageSync('user_info') || [];
  let beetoken = user_info.token;
  let student_id = user_info.student_id;
  let askListPromise = new Promise((resolve, reject) => {
    wx.request({
      url: url + '/v1/student/asks',
      header: {
        'Authorization': 'Basic ' + base64.encode(beetoken + ':x')
      },
      data:{
        school_id: school_id,
        page: page,
        per_page: per_page,
        answered: answered
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
  return askListPromise;

}

module.exports = {
  getStudentInfo: getStudentInfo,
  upLoadFilePromise: upLoadFilePromise,
  submitAskPromise: submitAskPromise,
  getAskDetailPromise: getAskDetailPromise,
  getAskListPromise: getAskListPromise,
  getStudentInfoPromise: getStudentInfoPromise
}


