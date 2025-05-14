var openPaymentModal = (paymentSrc) => {
  const mod = [...document.querySelectorAll("*")]
    .map(n => n.__vue__ || n.__vueParentComponent?.proxy).find((n => n?.$modal?.show))

  if (!mod) {
    alert(';( Не удается найти диалог оплаты, его уже убрали или хз')
    return
  }

  mod.$modal.show("ModalPayment", {
    paymentSrc
  })
}

window.addEventListener('message', async (msg) => {
  if (!msg?.data) return
  const { type, paymentSrc } = msg.data
  if (type === 'openPaymentModal') {
    openPaymentModal(paymentSrc)
  }
})

