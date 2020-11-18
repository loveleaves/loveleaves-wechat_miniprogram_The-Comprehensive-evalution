const db = wx.cloud.database()
Page({
  data: {
    items: [{
      name: '1',
      checked: false,
      value: '记住密码'
    }],//记住密码的复选框
    schoolnumber: '',//用户名或者手机号
    pass: ''//密码
  },
  // 授权登录,这里我是先让用户授权才登录的，不需要的也可以直接放个登录按钮，不授权登录
  bindGetUserInfo: function(e) {
    if (e.detail.userInfo) {
      //用户按了允许授权按钮
      wx.showLoading({
        title: '正在登录...',
        mask: true
      })
      if (this.data.schoolnumber == '') {
        wx.showToast({
          title: '用户名或手机号不能为空',
          icon: 'none',
          duration: 2000
        })
      } else if (this.data.pass == '') {
        wx.showToast({
          title: '密码不能为空',
          icon: 'none',
          duration: 2000
        })
      } else {
        var that = this
        // 登录接口
        var parame = {}
        // 此处要先判断你输入的是用户名还是手机号，用户名就要用户名的字段去查，手机号就要使用手机号的字段去查
        if ((/^\d{11}$/.test(this.data.schoolnumber))) {//验证手机号码是否正确的正则表达式
          // 不是手机号，说明是输入的用户名
          parame = {
            schoolnumber: this.data.schoolnumber
          }
        } else {
          parame = {
            username : this.data.schoolnumber 
          }
        }
        db.collection('admin_info').where(parame)//查询语句
          .get({
            success: function(res) {
              wx:wx.hideLoading();
              if (res.data == '') {//为空说明没有查到数据
                wx.showToast({
                  title: '用户不存在',
                  icon: 'none',
                  duration: 3000
                })
              } else {//不为空说明查询到数据了
                if (res.data[0].pass1 == that.data.pass) {//查询到数据后再判断用户输入的密码是否正确
                  wx.showToast({
                    title: '登录成功',
                    icon: 'none',
                    duration: 3000,
                    mask : true
                  })
                  setTimeout(() => {
                    wx.redirectTo({
                      url: '/pages/checkinsystem/welcomecheck/welcome',
                    })
                  }, 1000);
                  // 这里还可以写一些登录成功后的操作，比如登录成功后跳转到首页之类的
                }else{
                  wx.showToast({
                    title: '密码错误',
                    icon: 'none',
                    duration: 3000
                  })
                }
              }
            }
          })
      }
    } else {
      //用户按了拒绝按钮
      wx.showModal({
        title: '警告',
        content: '您点击了拒绝授权，将无法进行账号登录，请授权之后再登录!!!',
        showCancel: false,
        confirmText: '返回授权',
        success: function(res) {}
      })
    }
  },
  // 用户名失焦
  mobile(e) {
    this.setData({
      schoolnumber: e.detail.value
    })
  },
  // 密码失焦
  pass(e) {
    this.setData({
      pass: e.detail.value
    })
  },
  admini(){
    wx.navigateTo({
      url: "/pages/admin/admin",
    })
  },
})