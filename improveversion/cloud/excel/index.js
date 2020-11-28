const cloud = require('wx-server-sdk')
//这里最好也初始化一下你的云开发环境
cloud.init({
  env: 'programprogram-3gq6d76z4f2f205f' 
 })
//操作excel用的类库
const xlsx = require('node-xlsx');

// 云函数入口函数
exports.main = async(event, context) => {
  try {
    let {userdata} = event
    
    //1,定义excel表格名
    let dataCVS = '综测成绩.xlsx'
    //2，定义存储数据的
    let alldata = [];
    let row = ['姓名', '学号' , 'G1成绩', 'G21成绩','G22成绩','G3成绩', 'G41成绩', 'G42成绩' , 'G43成绩',]; //表属性
    alldata.push(row);

    for (let key in userdata) {
      let arr = [];
      arr.push(userdata[key].username);
      arr.push(userdata[key].schoolnumber);
      arr.push(userdata[key].G1Score);
      arr.push(userdata[key].G21Score);
      arr.push(userdata[key].G22Score);
      arr.push(userdata[key].G3Score);
      arr.push(userdata[key].G41Score);
      arr.push(userdata[key].G42Score);
      arr.push(userdata[key].G43Score);
      alldata.push(arr)
    }
    //3，把数据保存到excel里
    var buffer = await xlsx.build([{
      name: "mySheetName",
      data: alldata
    }]);
    //4，把excel文件保存到云存储里
    return await cloud.uploadFile({
      cloudPath: dataCVS,
      fileContent: buffer, //excel二进制文件
    })

  } catch (e) {
    console.error(e)
    return e
  }
}

