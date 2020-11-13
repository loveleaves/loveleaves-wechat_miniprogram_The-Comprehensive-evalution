const app = getApp()
let score1 = 0
let score2 = 0
let score3 = 0
let score4 = 0
let score5 = 0 
let score6 = 0
let score7 = 0
let score8 = 0
Page({
  onLoad(){
    this.getopenid()
  },
  data:{
    summary : 0,
    senderod : '',
    showModalStatus: false
  },
  selectData(){
    wx.requestSubscribeMessage({
      tmplIds: ['wXHUV2qcSIreDR1CsM8AEF7XCEcOpDcoD2feCN0zYRE'],
      success(res){
        wx.showToast({
          title: '授权成功',
        })
        console.log('授权成功',res)
      },
      fail(res){
        wx.showToast({
          title: '授权失败，请再次点击',
          icon : 'none'
        })
        console.log('授权失败',res)
      }
    })
  },
  stepbackward(){
    wx.redirectTo({
      url: "/pages/G1/G1"
    })
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
  getopenid(){
    wx.showLoading({
      title: '正在获取openid',
      mask : true
    })
    let that = this;
    wx.cloud.callFunction({
      name:'getOpenid',
      complete:res=>{
        let openid = res.result.openid
        that.setData({
          senderod : openid
        })
        that.getscore()
      }
    })
  },
  getscore(){
    let that = this
    const db = wx.cloud.database()
    let openid = this.data.senderod
    wx.hideLoading({
      success: (res) => {},
    })
    wx.showLoading({
      title: '等待数据库响应',
      mask : true
    })
    db.collection("submit").where({
      _openid: openid,
    }).get({
      success: res => {
        if(res.data[0] == null){
          score1 = 0
        }
        else if(res.data[0].issubmitted){
          score1 = res.data[0].G11Score + res.data[0].G12Score
        }
        else{
          score1 = 0
        }
        console.log(score1)
      },
      fail: err => {
      }
    })
    db.collection("submit1").where({
      _openid: this.data.senderod,
    }).get({
      success: res => {
        if(res.data[0] == null){
          score2 = 0
        }
        else if(res.data[0].issubmitted){
            score2 = res.data[0].G21Score
        }
        else{
            score2 = 0
        }
        console.log(score2)
      },
      fail: err => {
      }
    })
    db.collection("submit2").where({
      _openid: this.data.senderod,
    }).get({
      success: res => {
        if(res.data[0] == null){
          score3 = 0
        }
        else if(res.data[0].issubmitted){
            score3 = res.data[0].G22Score
        }
        else{
            score3 = 0
        }
      },
      fail: err => {
      }
    })
    db.collection("submit3").where({
      _openid: this.data.senderod,
    }).get({
      success: res => {
        if(res.data[0] == null){
          score4 = 0
        }
        else if(res.data[0].issubmitted){
            score4 = res.data[0].G31Score + res.data[0].G32Score
        }
        else{
            score4 = 0
        }
      },
      fail: err => {
      }
    })
    db.collection("submit4").where({
      _openid: this.data.senderod,
    }).get({
      success: res => {
        if(res.data[0] == null){
          score5 = 0
        }
        else if(res.data[0].issubmitted){
            score5 = res.data[0].G41Score
        }
        else{
            score5 = 0
        }
      },
      fail: err => {
      }
    })
    db.collection("submit5").where({
      _openid: this.data.senderod,
    }).get({
      success: res => {
        if(res.data[0] == null){
          score6 = 0
        }
        else if(res.data[0].issubmitted){
            score6 = res.data[0].G42Score
        }
        else{
            score6 = 0
        }
      },
      fail: err => {
      }
    })
    db.collection("submit6").where({
      _openid: this.data.senderod,
    }).get({
      success: res => {
        if(res.data[0] == null){
          score7 = 0
          setTimeout(() => {
            that.setscore()
          }, 1000);
        }
        else if(res.data[0].issubmitted){
            score7 = res.data[0].G43Score
            setTimeout(() => {
              that.setscore()
            }, 1000);        }
        else{
            score7 = 0
            setTimeout(() => {
              that.setscore()
            }, 1000);        }
      },
      fail: err => {
      }
    })
  },
  setscore(){
    score8 = score1*0.1 + score2*0.8 + score3 + score4*0.03 + (score5 + score6 + score7)*0.07
    this.setData({
      summary : score8
    })
    wx.hideLoading({
      success: (res) => {},
    })
    wx.showToast({
      title: '数据获取完毕！',
    })
  }
})