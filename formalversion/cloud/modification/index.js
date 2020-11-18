const cloud = require('wx-server-sdk')
//环境变量 ID
cloud.init({
 env: 'dududu-9ge7zy28d44d8ddc' 
})
 
const db = cloud.database()
// 云函数入口函数
//传递的参数可通过event.xxx得到
exports.main = async (event, context) => {
  try {
    return await db.collection(event._table).doc(event._id).update({
      // data 传入需要局部更新的数据
      data: {
        ispermitted: true    
      }
    })
  } catch (e) {
    console.error(e)
  }
}
