// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()

// 云函数入口函数
exports.main = async (event, context) => {
  try{
    const result = await cloud.openapi.subscribeMessage.send({
      touser: event.openid,
      page:'pages/G1/G1',
      data:{
        thing9:{
          value:event._title
        },
        name3:{
          value:event._sender
        },
        thing5:{
          value:event._reason
        }
      },
      templateId:'wXHUV2qcSIreDR1CsM8AEF7XCEcOpDcoD2feCN0zYRE'
    })
    console.log(result)
    return result
  }
  catch(err){
    console.log(err)
    return err
  }
}