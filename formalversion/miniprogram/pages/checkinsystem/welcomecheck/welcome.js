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
})