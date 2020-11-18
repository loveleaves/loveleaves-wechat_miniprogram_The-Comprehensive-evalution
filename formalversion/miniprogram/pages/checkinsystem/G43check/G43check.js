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
    imgUrls : []
  },

  getopenid(){//获取用户id以供搜索
    let that = this;
    wx.cloud.callFunction({
      name:'getOpenid',
      complete:res=>{
        let openid = res.result.openid
        that.setData({
          senderod : openid
        })
      }
    })
  },

  onQuery() {
    let that = this
    const db = wx.cloud.database()
    db.collection("submit6").where({//搜索条件为已经提交且尚未审核
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
          that.setData({//从第一个数据中获取一系列必要数据
            summary : res.data[0].G43Score,
            od : res.data[0]._openid,
            id : res.data[0]._id,
            boolfirst : false,
            boolsecond : false,
            imgUrls : res.data[0]._fileIDs
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
    wx.previewImage({
      urls: this.data.imgUrls,
      current: e.currentTarget.id,
      success: (res) => {},
      fail: (res) => {},
      complete: (res) => {},
    })
  },
  checkpass(){
    let that = this
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
          console.log(id)
          wx.cloud.callFunction({//调用修改云函数，将审核状态修改为已审核
            // 云函数名称
            name: 'modification',
            // 传给云函数的参数
            data: {
              _table:'submit6',
              _id: id,
            },
            success: function (res) {
              console.log(res)
            },
            fail: console.error
          })
          setTimeout(() => {
            wx.hideLoading({
              success: (res) => {},
            })
            wx.showToast({
              title: '提交成功！',
            })
          }, 500);//这里会受网络影响，我也是醉了
          that.setData({
            summary : 0,
            id : '',
            boolfirst : true,
            boolsecond : true,
          })
        }
      },
    })  
  },

  checkfalse(){
    let that = this
    let openid = this.data.od
    let senderod = this.data.senderod
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
           let _imgUrls = that.data.imgUrls
           console.log(id)
           wx.cloud.callFunction({//调用订阅消息向用户发送推送
            name: "sendToWeChat",
            data: {
              _title:'G43材料退回',
              _sender:senderod,
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
                  _table:'submit6',
                  _id: id
                },
                success: function (res) {
                  console.log(res)
                },
                fail: console.error
               })
                setTimeout(() => {
                  wx.hideLoading({
                    success: (res) => {},
                  })
                  wx.showToast({
                    title: '提交成功！',
                  })
                }, 500);//这里会受网络影响，我也是醉了
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