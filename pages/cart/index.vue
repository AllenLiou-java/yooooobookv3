<template>
  <div class="cart">
    <div class="container">
      <section class="order">
        <h2>訂單內容</h2>
        <template v-if="orderList.length > 0">
          <ul class="orderList">
            <li
              v-for="(item, idx) in orderList"
              :key="idx + 1"
              class="orderList__item"
            >
              <img :src="item.imgSrc" alt="books_photo" />
              <div class="right">
                <div class="title">
                  <h3>{{ item.name }}</h3>
                  <ul>
                    <li
                      v-for="(contentItem, c_idx) in item.content"
                      :key="c_idx + 1"
                    >
                      <p>{{ contentItem }}</p>
                    </li>
                  </ul>
                </div>
                <Formatter
                  data-type="NumberComma"
                  :origin-data="item.discount * item.qty"
                  class="price"
                >
                  <template #default="propsData">
                    NT ${{ propsData.formatData }}
                  </template>
                </Formatter>
                <Formatter
                  data-type="NumberComma"
                  :origin-data="item.qty"
                  class="qty"
                >
                  <template #default="propsData">
                    {{ propsData.formatData }}件
                  </template>
                </Formatter>
              </div>
            </li>
          </ul>
        </template>
        <template v-else>
          <ul class="orderList">
            <li class="emptyMsg">購物車內無任何商品，請返回訂購頁</li>
          </ul>
        </template>
        <Formatter
          data-type="NumberComma"
          :origin-data="totalPrice"
          class="total"
        >
          <template #default="propsData">
            小計 <span> NT$ {{ propsData.formatData }}</span>
          </template>
        </Formatter>
        <div class="clearfix"></div>
      </section>

      <section class="buyerInfo">
        <h2>訂購人資訊</h2>
        <OrderForm
          :input-setup="inputSetup"
          :btn-setup="btnSetup"
          :form-data="inputValue"
          @submitEvent="sendOrder"
          @resetEvent="$router.back()"
        />
      </section>
    </div>
    <Toaster :title="toastSet.title" :content="toastSet.content" />
  </div>
</template>

<script>
import Cookie from 'js-cookie'
import { initOrderInfo } from '@/assets/js/initData'
import OrderForm from '@/components/Form/OrderForm.vue'
import Formatter from '@/components/Formatter.vue'
import Toaster from '@/components/Toaster/Toaster.vue'

export default {
  components: {
    OrderForm,
    Formatter,
    Toaster,
  },
  layout: 'cartPage',
  middleware: ['auth'],
  data() {
    return {
      orderList: [],
      orderInfo: {},
      inputSetup: [
        {
          title: '收件人姓名',
          type: 'text',
          placeholder: '請輸入姓名',
          attrName: 'recipient',
          required: true,
          invalidFeedback: '請輸入收件人姓名',
        },
        {
          title: '收件人地址',
          type: 'text',
          placeholder: '請輸入地址',
          attrName: 'address',
          required: true,
          invalidFeedback: '請輸入地址',
        },
        {
          title: 'Email',
          type: 'email',
          placeholder: 'example@gmail.com',
          attrName: 'email',
          required: true,
          invalidFeedback: '請確認email格式',
        },
        {
          title: '聯絡電話',
          type: 'tel',
          placeholder: '請輸入電話號碼',
          attrName: 'phone',
          required: true,
          invalidFeedback: '請輸入電話號碼',
        },
        {
          title: '發票買受人',
          type: 'text',
          placeholder: '請輸入發票買受人',
          attrName: 'buyer',
          required: true,
          invalidFeedback: '請輸入發票買受人',
        },
        {
          title: '統一編號',
          type: 'text',
          placeholder: '請輸入統一編號(選填)',
          attrName: 'taxId',
          required: false,
          invalidFeedback: '請輸入8碼統一編號',
        },
        {
          title: '帳戶後5碼',
          type: 'text',
          placeholder: '請輸入金融帳戶後5碼',
          attrName: 'account',
          required: true,
          invalidFeedback: '請確認輸入之數字',
        },
      ],
      btnSetup: [
        { type: 'reset', btnName: '返回', variant: 'primary' },
        { type: 'submit', btnName: '訂單送出', variant: 'secondary' },
      ],
      inputValue: {
        buyer: '',
        recipient: '',
        address: '',
        email: '',
        phone: '',
        taxId: '',
        account: '',
      },
      toastSet: {
        title: '',
        content: '',
      },
      stock: null,
    }
  },
  head() {
    return {
      title: '購物車 - 有良冊股份有限公司',
      meta: [
        {
          // hid: 'description',
          name: 'description',
          content: '購物車 - 有良冊股份有限公司',
        },
        {
          // hid: 'og:description',
          property: 'og:description',
          content: '購物車 - 有良冊股份有限公司',
        },
        {
          // hid: 'og:title',
          property: 'og:title',
          content: '購物車 - 有良冊股份有限公司',
        },
        {
          // hid: 'og:image',
          property: 'og:image',
          content: '/yooooobook.jpg',
        },
        {
          // hid: 'og:url',
          property: 'og:url',
          content: 'https://www.yooooobook.com/cart',
        },
      ],
    }
  },
  computed: {
    totalPrice() {
      if (this.orderList.length > 0) {
        const priceList = this.orderList.map((item) => item.discount * item.qty)
        const reducePrice = priceList.reduce((accumulator, currentValue) => {
          return accumulator + currentValue
        })

        return reducePrice
      } else {
        return 0
      }
    },
  },
  created() {
    this.orderInfo = initOrderInfo()
  },
  mounted() {
    if (Cookie.get('orderListInCart')) {
      this.orderList = JSON.parse(Cookie.get('orderListInCart'))
    }

    this.orderIdCreater()
  },
  methods: {
    async sendOrder(buyerInfo) {
      if (this.orderList.length === 0) return
      if (!process.client) return

      const orderInfo = this.orderInfoCreater(buyerInfo)
      const orderId = orderInfo.orderId
      const uid = this.$store.state.userUid
      const idToken = Cookie.get('id_token')
      const { productId, qty } = this.orderList[0]
      let stock

      try {
        const { data } = await this.$api.apiList.stock.getStock(productId)
        stock = data.qty
      } catch (e) {
        throw new Error(e)
      }

      if (stock >= qty) {
        try {
          await this.updateStock(productId, stock, qty, idToken)
          await this.$api.apiList.order.patchOrderInfo(
            uid,
            orderId,
            idToken,
            orderInfo
          )
          // 訂單資訊存入vuex
          this.$store.commit('seUsertOrder', orderInfo)
          // 發送訂單確認信
          await this.sendOrderConfirmMail(orderInfo)
          // 清除Cookie
          Cookie.remove('orderListInCart')
          this.$router.push('/cart/success/' + orderInfo.orderId)
        } catch (e) {
          throw new Error(e)
        }
      } else {
        this.openToast('訂購失敗', '庫存不足，3秒後自動跳轉回訂購頁!')
        setTimeout(() => {
          this.$router.push({ name: 'order' })
        }, 2000)
      }
    },
    setTimeDateFmt(s) {
      return s < 10 ? '0' + s : s
    },
    oderDateCreater() {
      const now = new Date()
      const _year = now.getFullYear()
      let _month = now.getMonth() + 1
      let _day = now.getDate()
      let _hour = now.getHours()
      let _minutes = now.getMinutes()

      _month = this.setTimeDateFmt(_month)
      _day = this.setTimeDateFmt(_day)
      _hour = this.setTimeDateFmt(_hour)
      _minutes = this.setTimeDateFmt(_minutes)

      const orderDate = `${_year.toString()}/${_month.toString()}/${_day} ${_hour}:${_minutes}`
      return orderDate
    },
    orderIdCreater() {
      const now = new Date()
      const _year = now.getFullYear()
      let _month = now.getMonth() + 1
      let _day = now.getDate()
      let _hour = now.getHours()
      let _minutes = now.getMinutes()
      let _seconds = now.getSeconds()

      _month = this.setTimeDateFmt(_month)
      _day = this.setTimeDateFmt(_day)
      _hour = this.setTimeDateFmt(_hour)
      _minutes = this.setTimeDateFmt(_minutes)
      _seconds = this.setTimeDateFmt(_seconds)
      const orderCode =
        _year.toString().slice(2, 4) +
        _month.toString() +
        _day +
        _hour +
        _minutes +
        _seconds +
        Math.round(Math.random() * (999 - 100) + 100).toString()

      return orderCode
    },
    orderInfoCreater(buyerInfo) {
      const orderId = this.orderIdCreater()
      const oderDate = this.oderDateCreater()

      const orderList = this.orderList.map((item) => {
        return {
          productId: item.productId,
          productName: item.name,
          qty: item.qty,
          unitPrice: item.discount,
          totalPrice: item.qty * item.discount,
        }
      })

      const orderInfo = initOrderInfo()

      // 更新要送出的資料
      orderInfo.buyer = buyerInfo.buyer
      orderInfo.receiver.name = buyerInfo.recipient
      orderInfo.receiver.address = buyerInfo.address
      orderInfo.email = buyerInfo.email
      orderInfo.phone = buyerInfo.phone
      orderInfo.taxId = buyerInfo.taxId
      orderInfo.bankAccountNo = buyerInfo.account
      orderInfo.orderId = orderId
      orderInfo.orderList = orderList
      orderInfo.totalPrice = this.totalPrice
      orderInfo.oderDate = oderDate
      orderInfo.status = '1'
      orderInfo.isClosed = false

      this.orderInfo = orderInfo

      return orderInfo
    },
    sendOrderConfirmMail(orderInfo) {
      try {
        return this.$axios({
          method: 'post',
          baseURL: process.env.SERVER_URL,
          url: '/mail/orderConfirm',
          data: orderInfo,
        })
      } catch (e) {
        throw new Error(e)
      }
    },
    updateStock(productId, stock, orderQty, idToken) {
      const updatedStock = stock - orderQty
      const data = { qty: updatedStock }
      try {
        this.$api.apiList.stock.patchStock(productId, data, idToken)
      } catch (e) {
        throw new Error(e)
      }
    },
    openToast(title, content) {
      this.toastSet.title = title
      this.toastSet.content = content
      this.$bvToast.show('my-toast')
    },
  },
}
</script>

<style lang="scss" scoped>
@import './cart.scss';
</style>
