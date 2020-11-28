const db = wx.cloud.database()    //这一句必不可少
Page({
  data: {
    username: '', //姓名
    schoolnumber: '', //学号
    pass1: '', //密码
  },
  // 用户名失去焦点
  username(e) {
    this.data.username = e.detail.value
  },
  // 手机号失去焦点
  mobile(e) {
    this.data.schoolnumber = e.detail.value
  },
  // 密码失去焦点
  pass1(e) {
    this.data.pass1 = e.detail.value
  },
  // 确认密码失去焦点
  // 点击注册按钮
  bindGetUserInfo: function(e){
    if (e.detail.userInfo) {
      //用户按了允许授权按钮
        wx.showLoading({
          title: '正在注册...',
        })
        if (this.data.username == '') {
          wx.showToast({
            title: '用户名不能为空',
            icon: 'none',
            duration: 2000
          })
        } else if (this.data.schoolnumber == '') {
          wx.showToast({
            title: '学号不能为空',
            icon: 'none',
            duration: 2000
          })
        } 
         else if (this.data.pass1 == '') {
          wx.showToast({
            title: '密码不能为空',
            icon: 'none',
            duration: 2000
          })
        } else {
          var that = this
          // 注册这个账户之前，我们首先要做的就是查询一下这个集合表中是否已经存在过这个用户了
          db.collection('admin_info').where({ //查询接口
              username: that.data.username //传参，输入的用户名
            })
        .get({
              success: function(res) {
                if (res.data.length == 0) { //判断用户名是否被注册过，等于空说明没被查询到，就是没有注册过，
                  db.collection('admin_info').where({ //我写的数用户名和手机号都可以登录，所以同一个手机号和用户名只能算一个账号，也要验证一下手机号是否被注册过
                    schoolnumber: that.data.schoolnumber
                    })
                    .get({
                      success: function(res) {
                        if (res.data.length == 0) { //判断手机号是否被注册过，等于空说明没被查询到，就是没有注册过，
                          db.collection('admin_info').add({ //验证完成之后，添加的接口
                            data: {
                              username: that.data.username, //老师姓名
                              name:that.data.username,//推送消息发送的批改老师姓名
                              schoolnumber: that.data.schoolnumber, //学号
                              pass1: that.data.pass1, //密码
                              name: that.data.username //创建时间
                            },
                            success: function(res) {
                              if (res.errMsg == 'collection.add:ok') { //接口调取成功，也就是注册成功
                                // 这里面你可以加一下注册成功之后的逻辑，是直接登录也好，或者是跳到登录页面页面
                                wx.hideLoading();
                                wx.showToast({
                                  title: '注册成功!',
                                  icon: 'none',
                                  duration:2000,
                                })
                                wx.redirectTo({
                                  url: '../../checkinsystem/welcomecheck/welcome',
                                })
                              }                                                
                            }
                          })
                        } else {
                          wx.showToast({
                            title: '此手机号已被别人注册，换一个试试！',
                            icon: 'none',
                            duration: 2000
                          })
                        }
                      }
                    })
                } else {
                  wx.showToast({
                    title: '此用户名已被别人注册，换一个试试！',
                    icon: 'none',
                    duration: 2000
                  })
                }
              }
            })
          }
      } else {
        //用户按了拒绝按钮
          wx.showModal({
            title: '警告',
            content: '您点击了拒绝授权，将无法进行账号注册，请授权之后再注册!!!',
            showCancel: false,
            confirmText: '返回授权',
            success: function(res) {}
          })
      }
  },
})