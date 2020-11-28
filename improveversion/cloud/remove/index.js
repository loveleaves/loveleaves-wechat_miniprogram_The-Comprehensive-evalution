const cloud = require('wx-server-sdk')
//环境变量 ID
cloud.init({
 env: 'programprogram-3gq6d76z4f2f205f' 
})
 
const db = cloud.database()
// 云函数入口函数
//传递的参数可通过event.xxx得到
exports.main = async (event, context) => {
  try {
    return await db.collection(event._table).doc(event._id).remove()
  } catch (e) {
    console.error(e)
  }
}
