const app = getApp()
const DB = wx.cloud.database().collection("submit1")

Page({
  data: {
    tables: [//界面表格样式
      ['科目', '科目1', '科目2', '科目3', '科目4'],
      ['学分', '', '', '', ''],
      ['成绩', '', '', '', ''],
      ['合计', '', '', '', ''],
      ['科目', '科目5', '科目6', '科目7', '科目8'],
      ['学分', '', '', '', ''],
      ['成绩', '', '', '', ''],
      ['合计', '', '', '', ''],
      ['科目', '科目9', '科目10', '科目11', '科目12'],
      ['学分', '', '', '', ''],
      ['成绩', '', '', '', ''],
      ['合计', '', '', '', ''],
    ],
    summary : 0,
    subscore : 0,
    result : 0,
    boolfirst : true,
    boolsecond : true,
    od : ''
  },
  onLoad(){//初始化页面，由数据库获取数据
    let that = this
    that.getopenid()
    wx.showLoading({
      title: '等待数据库响应',
      mask:true                                    
    })
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
    db.collection('submit1').where({//搜索条件：是否已经提交
      issubmitted : true,
      _openid : openid
    }).get({
      success: res => {
        if(res.data[0] == null){
          this.setData({
            boolfirst:false,
            boolsecond:false
          })
        }
        if(res.data[0].ispermitted){
          this.setData({//用于更新界面审核状态
            boolsecond : true
          })
        }
        else if(res.data[0] == null){
          this.setData({
            boolsecond : false
          })
        }
        else{
          this.setData({
            boolsecond : false
          })
        }
        if(res.data[0].issubmitted){//用于更新界面提交状态
          this.setData({
            boolfirst : true,
            result : res.data[0].G21Score
          })
        }
        else{
          this.setData({
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

  calSum(e) {//对表格中数据进行运算，计算出G21分数以便上传
    var id = e.target.dataset.id;
    var idd = e.target.dataset.idd;
    var value = e.detail.value;
    let ta = this.data.tables;
    if(value > 100 || value < 0){
      wx.showToast({
        title: '请输入合理的成绩',
        icon: 'none',
        duration: 2000      
      })
      value = 0
    }
    var point = 0;
    var sum = 0;
    var ave = 0;
    var subpoint = 0;
    var endpoint = 0;
    let that = this;
    ta[idd][id] = value;
      for (let j = 1 ; j < ta[0].length ; j++){//计算加权平均分
        if(ta[1][j] == '' || ta[2][j] == ''){
          ta[3][j] = 0;
          sum += ta[3][j];
        }
        else{
          ta[3][j] = parseFloat(ta[1][j] * ta[2][j]);
          sum += ta[3][j];
        }
        if(ta[5][j] == '' || ta[6][j] == ''){
          ta[7][j] = 0;
          sum += ta[7][j];
        }
        else{
          ta[7][j] = parseFloat(ta[5][j] * ta[6][j]);
          sum += ta[7][j];
        }
        if(ta[9][j] == '' || ta[10][j] == ''){
          ta[11][j] = 0;
          sum += ta[11][j];
        }
        else{
          ta[11][j] = parseFloat(ta[9][j] * ta[10][j]);
          sum += ta[11][j];
        }
        if(ta[1][j] != ''){//用于计算总学分数
          point += parseFloat(ta[1][j]);
        }
        if(ta[5][j] != ''){
          point += parseFloat(ta[5][j]);
        }
        if(ta[9][j] != ''){
          point += parseFloat(ta[9][j]);
        }
        if(parseInt(ta[2][j]) < 60){//用于计算扣分项
          subpoint += parseFloat(ta[1][j]);
        }
        if(parseInt(ta[6][j]) < 60){
          subpoint += parseFloat(ta[5][j]);
        }
        if(parseInt(ta[10][j]) < 60){
          subpoint += parseFloat(ta[9][j]);
        }
      }
      ave = (point - subpoint) / point;
      sum  = (sum / point);
      endpoint = sum * ave;
    this.setData({
      tables: ta,
      summary : sum,
      subscore : subpoint,
      result : endpoint,
    });
  },
  stepforward(){//用于页面跳转
    wx.redirectTo({
      url: "/pages/submitsystem/G1submit/G1submit"
    })
  },

  stepbackward(){
    wx.redirectTo({
      url: "/pages/submitsystem/G22submit/G22submit"
    })
  },
  addData(){
    let that = this;
    var endsub = this.data.result;
    wx.showModal({
      title: '提交G21部分成绩',
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
            mask:true
          })
          DB.add({
            data:{
              G21Score : endsub,
              issubmitted:true,
              ispermitted:false,
              checker1 : '',
              checker2 : ''
            }, 
            success: res => {
              that.onQuery()
              wx.hideLoading({
                success: (res) => {
                },
              })
              wx.showToast({
                title: '新增记录成功',
                mask:true,
                duration : 2000
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
        }
      },
     })  
  },
})