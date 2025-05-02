const deleteQst = async (qid) => {
  const deleteScript = async () => {
    const path = '/api/v1/questions/__QID__/addition'
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
    console.log(res)
  }

  freiweb.injectScript(deleteScript, (code) => {
    return code.split('__QID__').join(qid)
  })
}

const deleteAnswer = async (qid, aid) => {
  const deleteScript = async () => {
    const path = '/api/v1/questions/__QID__/answers/__AID__'
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
    console.log(res)
  }

  freiweb.injectScript(deleteScript, (code) => {
    return code.split('__QID__').join(qid)
      .split('__AID__').join(aid)
  })
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
  return `https://pw.money.mail.ru/pw/2-03-13?merchant_id=243633&data=${encodeURIComponent(res.data.data)}&signature=${encodeURIComponent(res.data.signature)}`
}

const showPaymentModal = async (method, id) => {
  const modalShower = async () => {
    const paymentSrc = await getPaymentSrc('__METHOD__', '__ID__')

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

  const gpsCode = freiweb.funcToStr(getPaymentSrc, 'getPaymentSrc', null, '_null', 'var ')
  freiweb.injectScript(gpsCode)

  freiweb.injectScript(modalShower, c => {
    return c.split('__METHOD__').join(method)
      .split('__ID__').join(id)
  })
}
