export const initOrderInfo = () => {
  return {
    buyer: '',
    receiver: {
      name: '',
      address: '',
    },
    email: '',
    phone: '',
    taxId: '',
    bankAccountNo: '',
    orderId: '',
    orderList: [
      {
        productId: '',
        productName: '',
        qty: null,
        totalPrice: null,
        unitPrice: null,
      },
    ],
    totalPrice: null,
    oderDate: '',
    status: '',
    isClosed: '',
    delivery: {
      company: '',
      trackingNo: '',
      trackingUrl: '',
    },
    remark: '',
    isFromGroup: false,
    files: [],
  }
}
