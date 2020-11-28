const app = getApp()

Page({
  data:{
    showModalStatus:false
  },
  powerDrawer: function (e) {
    var currentStatu = e.currentTarget.dataset.statu;  
    this.util(currentStatu)  
  },  
  util: function(currentStatu){  
    /* 动画部分 */
    var animation = wx.createAnimation({  
      duration: 200,  //动画时长  
      timingFunction: "linear", //线性  
      delay: 0  //0则不延迟  
    });   
    this.animation = animation;  
    animation.opacity(0).rotateX(-100).step();  
 
    this.setData({  
      animationData: animation.export()  
    })  

    setTimeout(function () {  
      animation.opacity(1).rotateX(0).step();  
      // 给数据对象储存的第一组动画，更替为执行完第二组动画的动画对象  
      this.setData({  
        animationData: animation  
      })  
        
      //关闭  
      if (currentStatu == "close") {  
        this.setData(  
          {  
            showModalStatus: false  
          }  
        );  
      }  
    }.bind(this), 200)  
    
    // 显示  
    if (currentStatu == "open") {  
      this.setData(  
        {  
          showModalStatus: true  
        }  
      );  
    }  
  },
  getExcel(){
    let that = this;
    //读取users表数据
    wx.showLoading({
      title: '正在读取数据',
      mask:true
    })
    wx.cloud.callFunction({
      name: "getData",
      success(res) {
        console.log("读取成功", res.result.data)
        that.savaExcel(res.result.data)
      },
      fail(res) {
        wx.showToast({
          title: '读取失败',
          icon : 'none'
        })
        console.log("读取失败", res)
      }
    })
  },
    //把数据保存到excel里，并把excel保存到云存储
  savaExcel(userdata) {
    wx.hideLoading({
      success: (res) => {},
    })
    wx.showLoading({
      title: '正在上传',
      mask:true
    })
    let that = this
    wx.cloud.callFunction({
      name: "excel",
      data: {
        userdata: userdata
      },
      success(res) {
        console.log("保存成功", res)
        that.getFileUrl(res.result.fileID)
      },
      fail(res) {
        wx.showToast({
          title: '上传失败',
          icon : 'none'
        })      
      }
    })
  },
  getFileUrl(fileID) {
    wx.hideLoading({
      success: (res) => {},
    })
    wx.showLoading({
      title: '正在获取链接',
      mask:true
    })
    let that = this;
    wx.cloud.getTempFileURL({
      fileList: [fileID],
      success: res => {
        // get temp file URL
        console.log("文件下载链接", res.fileList[0].tempFileURL)
        let fileUrl = res.fileList[0].tempFileURL
        that.downloadExcel(fileUrl)
      },
      fail: err => {
        wx.showToast({
          title: '获取失败',
          icon : 'none',
          mask:true
        })
        // handle error
      }
    })
  },
    //获取云存储文件下载地址，这个地址有效期一天
  downloadExcel(fileID) {
    wx.hideLoading({
      success: (res) => {},
    })
    wx.showLoading({
      title: '正在打开文档',
      mask:true
    })
    wx.downloadFile({ 
      url: fileID,
      success: res => {
        let filePath = res.tempFilePath
        wx.hideLoading({
          success: (res) => {},
        })
        wx.showToast({
          title: '打开成功！',
          mask:true,
          duration:2500 
        })
        wx.openDocument({
          filePath: filePath,
          success: function (res) {
            console.log('打开文档成功')
          },
          fail : function (res) {
            wx.showToast({
              title: '打开失败',
              icon : 'none'
            })
          }
        })
      },
      fail: err => {
        wx.showToast({
          title: '下载失败',
          icon : 'none'
        })
      }
    })
  },
})