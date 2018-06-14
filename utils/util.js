// util.js

const config = require('config.js');
const url = config.config.host;
const school_id = config.config.school_id;
const base64 = require('base64.min.js').Base64;

const formatTime = date => {
  const year = date.getFullYear()
  const month = date.getMonth() + 1
  const day = date.getDate()
  const hour = date.getHours()
  const minute = date.getMinutes()
  const second = date.getSeconds()

  return [year, month, day].map(formatNumber).join('/') + ' ' + [hour, minute, second].map(formatNumber).join(':')
}

const formatNumber = n => {
  n = n.toString()
  return n[1] ? n : '0' + n
}

function previewImgs(imgs, e) {
  let imgurls = []
  for (let i = 0, n = imgs.length; i < n; i++) {
    imgurls.push(url + '/' + imgs[i])
  }
  console.log(url + '/' + imgs[e.currentTarget.id])
  wx.previewImage({
    current: url + '/' + imgs[e.currentTarget.id], // 当前显示图片的http链接
    urls: imgurls // 需要预览的图片http链接列表
  })
}

module.exports = {
  previewImgs: previewImgs,
  formatTime: formatTime
}

