const app = getApp()
const DB = wx.cloud.database().collection("submit4")
let score1 = 0

Page({
  onLoad(){//初始化页面，由数据库获取数据
    let that = this
    that.getopenid()
    wx.showLoading({
      title: '等待数据库响应',
      mask:true                                    
    })
  },
  data:{
    boolfirst : true,
    boolsecond : true,
    G41Score : 0,
    issubmitted:false,
    ispermitted:false,
    imgbox: [],//选择图片
    fileIDs: [],//上传云存储后的返回值
    od : ''
  },

  getopenid(){//云函数获取用户openid
    let that = this;
    wx.cloud.callFunction({
      name:'getOpenid',
      complete:res=>{
        this.data.od = res.result.openid
        that.onQuery()
      }
    })
  },

  onQuery() {//更新界面状态，获取必要数据
    let openid = this.data.od
    console.log(openid)
    const db = wx.cloud.database()
    db.collection('submit4').where({
      issubmitted : true,//搜索条件：是否已经提交
      _openid : openid
    }).get({
      success: res => {
        if(res.data[0] == null){
          this.setData({
            boolfirst:false,
            boolsecond:false,
          })
        }
        if(res.data[0].ispermitted){//用于更新界面审核状态
          this.setData({
            boolsecond : true
          })
        }
        else{
          this.setData({
            boolsecond : false
          })
        }
        if(res.data[0].issubmitted){//已经提交则从数据库中获取数据至页面
          this.setData({
            boolfirst : true,
            G41Score : res.data[0].G41Score,
          })
        }
        else{
          this.setData({//用于更新界面提交状态
            boolfirst : false
          })
        }
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
    wx.hideLoading({
      success: (res) => {},
    })
    wx.showToast({
      title: '获取成功',
    })
  },

  addScore1(e){//添加成绩
    score1 = e.detail.value
    if(score1 > 40 || score1 < 0){
      wx.showToast({
        title: '请输入合理的成绩',
        icon: 'none',
        duration: 2000
      })
      this.setData({
        G41Score : 0
      })
    }
    else if(score1 == ''){
      wx.showToast({
        title: '成绩不能为空',
        icon: 'none',
        duration: 2000
      })
    }
  },

  stepforward(){//页面跳转
    wx.redirectTo({
      url: "/pages/submitsystem/G3submit/G3submit"
    })
  },

  stepbackward(){
    wx.redirectTo({
      url: "/pages/submitsystem/G42submit/G42submit"
    })
  },
  // 删除照片 
  imgDelete1: function (e) {
    let that = this;
    let index = e.currentTarget.dataset.deindex;
    let imgbox = this.data.imgbox;
    imgbox.splice(index, 1)
    that.setData({
      imgbox: imgbox
    });
  },

  addPic1: function (e) { // 选择图片
    var imgbox = this.data.imgbox;
    console.log(imgbox)
    var that = this;
    var n = 8;
    if (8 > imgbox.length > 0) {
      n = 8 - imgbox.length;
    } else if (imgbox.length == 8) {
      n = 1;
    }
    wx.chooseImage({
      count: n, // 默认9，设置图片张数
      sizeType: ['original', 'compressed'], // 可以指定是原图还是压缩图，默认二者都有
      sourceType: ['album', 'camera'], // 可以指定来源是相册还是相机，默认二者都有
      success: function (res) {
        // console.log(res.tempFilePaths)
        // 返回选定照片的本地文件路径列表，tempFilePath可以作为img标签的src属性显示图片
        var tempFilePaths = res.tempFilePaths
        if (imgbox.length == 0) {
          imgbox = tempFilePaths
        } else if (8 > imgbox.length) {
          imgbox = imgbox.concat(tempFilePaths);
        }
        that.setData({
          imgbox: imgbox
        });
      }
    })
  },

  imgbox: function (e){ //图片
    this.setData({
      imgbox: e.detail.value
    })
  },

 //发布按钮
  fb: function (e) {
    let that = this
    wx.showModal({
      title: '提交G41部分成绩',
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
            title: '上传图片中',
            mask: true
          })
          if(score1 > 40 || score1 < 0){
            wx.showToast({
              title: '请输入合理的成绩',
              icon: 'none',
              duration: 2000
            })
          }
          else if(score1 == ''){
            wx.showToast({
              title: '成绩不能为空，请重新提交材料',
              icon: 'none',
              duration: 2000
            })
          }
          else{
            //上传图片到云存储
            if (!that.data.imgbox.length) {
              wx.showToast({
                icon: 'none',
                title: '图片内容为空'
              });
            }
            else{
              let promiseArr = [];
              for (let i = 0; i < that.data.imgbox.length; i++) {
                promiseArr.push(new Promise((reslove, reject) => {
                  let item = that.data.imgbox[i];
                  let str = ''
                  let num = Math.floor(Math.random()*100000)
                  str = num.toString()
                  wx.cloud.uploadFile({
                    cloudPath: 'G41/' + new Date().getTime() + str , // 上传至云端的路径
                    filePath: item, // 小程序临时文件路径
                    success: res => {
                      that.setData({
                      fileIDs: that.data.fileIDs.concat(res.fileID)
                      });
                      console.log(res.fileID)//输出上传后图片的返回地址
                      reslove();
                    },
                    fail: res=>{
                      wx.hideLoading();
                      wx.showToast({
                      title: "上传失败",
                      })
                    }
                  })
                }));
              }
              Promise.all(promiseArr).then(res => {//等数组都做完后做then方法，开始上传成绩
                console.log("图片上传完成后再执行")
                that.setData({
                  imgbox:[]
                })
                wx.hideLoading({
                  success: (res) => {},
                })
                wx.showLoading({
                  title: '上传成绩中',
                })
                let temp = that.data.fileIDs
                DB.add({//成绩上传至数据库
                  data:{
                    G41Score : parseFloat(score1),
                    issubmitted:true,
                    ispermitted:false,
                    _fileIDs: temp,
                    checker1 : '',
                    checker2 : ''
                  }, 
                  success: res => {
                    that.onQuery()
                    wx.hideLoading({
                      success: (res) => {},
                    })
                    wx.showToast({
                      title: '新增记录成功',
                      duration : 2000,
                      mask : true
                    })
                    console.log('[数据库] [新增记录] 成功，记录 _id: ', res._id)
                  },
                  fail: err => {
                    wx.showToast({
                      icon: 'none',
                      title: '新增记录失败'
                    })
                    console.error('[数据库] [新增记录] 失败：', err)
                  }           
                })
              }) 
            }
          }
        }
      },
    })  
  },
})