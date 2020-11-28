let reason = ''
Page({
  onLoad(){
    let that = this
    that.getopenid()
  },

  editPhone() {//更新boolean值状态以唤醒弹框
    this.setData({
      isEdit: !this.data.isEdit
    })
  },
 
  blurPhone: function(e) {//弹框被更新后录入更新后数据
     reason = e.detail.value;
  },

  getback(){//跳转页面
    wx.redirectTo({
      url: '/pages/checkinsystem/welcomecheck/welcome',
    })
  },

  formSubmit(e) {// 表单提交
    let that = this
      that.setData({
        _reason: reason,
        isEdit: false
      })
      this.checkfalse()
  },
 
  data:{
    isEdit:false,
    summary:0,
    od : '',
    senderod:'',
    id : '',
    boolfirst : true ,
    boolsecond : true,
    _reason : '',
    imgUrls : [],
    name : '',
    checker1 : ''
  },

  getopenid(){//获取用户id以供搜索
    let that = this;
    wx.cloud.callFunction({
      name:'getOpenid',
      complete:res=>{
        this.data.senderod = res.result.openid
        that.getsendername()
      }
    })
  },

  getsendername(){//获取审核者姓名作为推送元素
    let that = this
    const db = wx.cloud.database()
    let openidtemp = that.data.senderod
    console.log(openidtemp)
    db.collection("admin_info").where({//搜索条件为已经提交且尚未审核
      _openid : openidtemp
    }).get({
      success: res => {
        that.setData({//从第一个数据中获取一系列必要数据
          name : res.data[0].name
        })
        console.log('[数据库] [查询记录] 成功: ', res)
      },
      fail: err => {
        wx.showToast({
          icon: 'none',
          title: '查询记录失败'
        })
        console.error('[数据库] [查询记录] 失败：', err)
      }
    })
  },

  onQuery() {
    let that = this
    const db = wx.cloud.database()
    db.collection("submit5").where({//搜索条件为已经提交且尚未审核
      issubmitted : true,
      ispermitted : false
    }).get({
      success: res => {
        if(res.data[0] == null){
          wx.showToast({
            title: '当前表中为空！',
          })
        }
        else{
          let length = res.data.length
          let i = 0
          if(length == 1){
            i = 0
          }
          else{
            i = Math.floor(Math.random()*length)
          }        
          that.setData({//随机选取一个人，获取一系列必要数据
            summary : res.data[i].G42Score,
            od : res.data[i]._openid,
            id : res.data[i]._id,
            boolfirst : false,
            boolsecond : false,
            imgUrls : res.data[i]._fileIDs,
            checker1 : res.data[i].checker1
          })
          console.log('[数据库] [查询记录] 成功: ', res)
        }   
      },
      fail: err => {
        wx.showToast({
          icon: 'none',
          title: '查询记录失败'
        })
        console.error('[数据库] [查询记录] 失败：', err)
      }
    })
  },
  preview(e){//点击可以预览图片
    console.log(e)
    wx.previewImage({
      urls: e.currentTarget.dataset.previewurl,
      current: e.currentTarget.dataset.currenturl,
      success: (res) => {},
      fail: (res) => {},
      complete: (res) => {},
    })
  },

  checkpass(){
    let that = this
    const db = wx.cloud.database()
    wx.showModal({
      title: '通过该成绩审核',
      content: '提交后不可修改，确定提交？',
      showCancel: true,//是否显示取消按钮
      cancelText:"否",//默认是“取消”
      cancelColor:'skyblue',//取消文字的颜色
      confirmText:"是",//默认是“确定”
      confirmColor: 'skyblue',//确定文字的颜色
      success: function (res) {
        if (res.cancel) {
          //点击取消,默认隐藏弹框
        } 
        else {
          wx.showLoading({
            title: '正在上传',
            mask : true
          })
          let id = that.data.id
          let openid = that.data.od
          let _G42Score = that.data.summary
          let _checker1 = that.data.checker1
          let _sendername = that.data.name
          if(_checker1 == ''){//如果未被人审核，则需要添加第一位审核者姓名
            wx.cloud.callFunction({
              // 云函数名称
              name: 'modification',
              // 传给云函数的参数
              data: {
                ispermitted : false,
                _table:'submit5',
                _id: id,
                _checker1 : _sendername,
                _checker2 : ''
              },
              success: function (res) {
                wx.hideLoading({
                  success: (res) => {},
                })
                wx.showToast({
                  title: '提交成功！',
                })
              },
              fail: console.error
            })
            that.setData({
              summary : 0,
              id : '',
              boolfirst : true,
              boolsecond : true,
              imgUrls :[]
            })
          }
          else if(_checker1 == _sendername){//如果被当前审核者审核过，则必须更换审核者
            wx.showToast({
              title: '该数据您已经审核过，请重新获取数据进行审核',
              mask :true,
              icon : 'none',
              duration : 2000
            })
          }
          else{//如果已被除当前审核者的审核者审核过，则可以修改状态为已审核
            db.collection('login_info').where({//向数据库中添加该项成绩以便导出
              _openid:openid,
            }).update({
              data:{
                G42Score : _G42Score
              },
              success: function (res) {
                console.log("成功",res)
              },
              fail: function (res) {
                wx.showToast({
                  title: '更新数据失败，请联系管理员处理',
                  icon : 'none'
                })
                console.log("失败",res)
              }
            });
            wx.cloud.callFunction({//调用修改云函数，将审核状态修改为已审核
              // 云函数名称
              name: 'modification',
              // 传给云函数的参数
              data: {
                ispermitted : true,
                _table:'submit5',
                _id: id,
                _checker1 : _checker1,
                _checker2 : _sendername
              },
              success: function (res) {
                wx.hideLoading({
                  success: (res) => {},
                })
                wx.showToast({
                  title: '提交成功！',
                })
              },
              fail: console.error
            })
            that.setData({
              summary : 0,
              id : '',
              boolfirst : true,
              boolsecond : true,
              imgUrls :[]
            })
          }
        }
      },
    })  
  },

  checkfalse(){
    let that = this
    let openid = this.data.od
    wx.showModal({
      title: '不通过该成绩审核',
      content: '提交后不可修改，确定提交？',
      showCancel: true,//是否显示取消按钮
      cancelText:"否",//默认是“取消”
      cancelColor:'skyblue',//取消文字的颜色
      confirmText:"是",//默认是“确定”
      confirmColor: 'skyblue',//确定文字的颜色
      success: function (res) {
         if (res.cancel){
            //点击取消,默认隐藏弹框
         } else {
           wx.showLoading({
             title: '正在上传',
             mask : true
           })
           let id = that.data.id
           let reasonsub = that.data._reason
           let sendername = that.data.name
           let _imgUrls = that.data.imgUrls
           console.log(sendername)
           if(reasonsub == ''){//异常条件处理
             reasonsub = '审核者未填写原因'
          }
           wx.cloud.callFunction({//调用订阅消息向用户发送推送
            name: "sendToWeChat",
            data: {
              _title:'G42材料退回',
              _sender:sendername,
              _reason:reasonsub,
              openid: openid
            }
          }).then(res => {
            console.log(res.result.errMsg)
            let temp = res.result.errMsg
            let temp1 = "openapi.subscribeMessage.send:ok"
            if(temp != temp1){
              wx.showToast({
                title: '发送失败，可能是使用者未订阅，若联系后未果请联系管理员',
                icon: 'none',
                duration:2000
              })
            }
            else{
              let i = 0
              for(i = 0 ; i < _imgUrls.length ; i++){//从云存储中删除相应图片
               wx.cloud.deleteFile({
                 fileList: [_imgUrls[i]],
                 success: res => {
                   // handle success
                   console.log(res.fileList)
                 },
                 fail: console.error
               })
              }
              wx.cloud.callFunction({//删除数据库中的相应数据，以便用户重新提交
                // 云函数名称
                name: 'remove',
                // 传给云函数的参数
                data: {
                  _table:'submit5',
                  _id: id
                },
                success: function (res) {
                  wx.hideLoading({
                    success: (res) => {},
                  })
                  wx.showToast({
                    title: '提交成功！',
                  })
                },
                fail: console.error
               })
                that.setData({
                  summary : 0,
                  id : '',
                  boolfirst : true,
                  boolsecond : true,
                  imgUrls : []
                })
                reason = ''
            }
          }).catch(res => {
            console.log("推送消息失败", res)
          })
        }
      },
   })
  }
})