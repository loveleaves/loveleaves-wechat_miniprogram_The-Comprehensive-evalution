// 云函数入口文件
const cloud = require('wx-server-sdk')
cloud.init({
  env: 'programprogram-3gq6d76z4f2f205f' 
 })
// 云函数入口函数
exports.main = async(event, context) => {
  return await cloud.database().collection('login_info').get();
}
