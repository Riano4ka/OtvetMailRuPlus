const throwIfError = (res) => {
  if (res.error) {
    console.log(res)
    throw new Error(JSON.stringify(res.error))
  }
}

const deleteQst = async (qid) => {
  const path = `/api/v1/questions/${qid}/addition`
  const url = new URL(path, 'https://otvet.mail.ru')
  let res = await fetch(url.toString(), {
    method: 'post',
    credentials: 'include',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      "data": {
          "content": [{"type":"text", "text":"(вопрос сейчас удалится, хуле)"}]
      },
      //"salt": "...",
      //"token": ".........",
      "platform": "web"
    })
  })
  res = await res.json()
  throwIfError(res)
}

const deleteAnswer = async (qid, aid) => {
  const path = `/api/v1/questions/${qid}/answers/${aid}`
  const url = new URL(path, 'https://otvet.mail.ru')
  let res = await fetch(url.toString(), {
    method: 'put',
    credentials: 'include',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      "data":{
        "content":[{"type":"text","text":"(ответ сейчас автоудалится, хуле)"}]
      },
      //"salt": "......",
      //"token": "............",
      "platform":"web"
    })
  })
  res = await res.json()
  throwIfError(res)
}

const getPaymentSrc = async (method, id) => {
  let res = await fetch("/api/v2/" + method, {
    method: "POST",
    body: (method === "mleadqst" || method === "mhideqst" ? "qid"
      : "mhideans" === method ? "aid"
      : "uid" /* if "mvip" */) + "=" + encodeURIComponent(id),
    headers: {
      "Content-Type": "application/x-www-form-urlencoded"
    }
  })
  res = await res.json();
  throwIfError(res)
  return `https://pw.money.mail.ru/pw/2-03-13?merchant_id=243633&data=${encodeURIComponent(res.data.data)}&signature=${encodeURIComponent(res.data.signature)}`
}

const showPaymentModal = async (method, id) => {
  const paymentSrc = await getPaymentSrc(method, id)

  window.postMessage({ type: 'openPaymentModal', paymentSrc })
}

freiweb.injectScriptWithUrl(browser.runtime.getURL('api/payment-modal.inject.js'))
