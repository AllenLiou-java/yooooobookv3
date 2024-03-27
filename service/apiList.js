import stock from '~/service/api/stock'
import member from '~/service/api/member'
import order from '~/service/api/order'

export default ($axios) => {
  const list = {}
  // 新增各功能的api檔
  list.stock = stock($axios)
  list.member = member($axios)
  list.order = order($axios)

  return list
}
