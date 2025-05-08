
async function ansCon() {
  let qids = []

  const storage = browser.storage.local
  const getStorage = async () => {
    try {
      return await storage.get() // FF
    } catch (err) {
      return new Promise(resolve => storage.get(obj => resolve(obj))) // Chrome
    }
  }
  let sa = await getStorage()
  sa = (sa && sa.auto_ans) || {}
  if (!sa.on) return

  let findEditTries = 0
  let findQstTries = 0
  let apiErrors = 0
  let outgoing

  const reloadQsts = () => {
    const rootLink = document.querySelector('a[href="/"]')
    if (!rootLink) { // in theory, it should work with 502 or 'Нет доступа к сети!'
      window.location.href = '/'
      outgoing = true
    } else {
      rootLink.click()
    }
  }

  setInterval(async () => {
    if (outgoing) return

    if (document.body.textContent.includes('Ответ не опубликован. Невозможно опубликовать ответ: вы уже отвечали ')) {
      reloadQsts()
      return
    } else if (document.body.textContent.includes('За сегодняшний день') || document.body.textContent.includes('временно ограничен') ) {
      document.body.innerHTML = 'Going to recreate account...'
      window.location.href = 'https://account.mail.ru/user/delete'
      outgoing = true
      return
    } else if (document.body.textContent.includes('Что-то пошло не так')) {
      if (++apiErrors >= 10) {
        apiErrors = 0
        reloadQsts()
        return
      }
    } else {
      apiErrors = 0
    }

    if (window.location.href.startsWith('https://otvet.mail.ru/question')) {
      let str = sa.text

      str = freiweb.randomizeStr(str, sa.letter)

      let inp = document.querySelectorAll('div[contenteditable="true"]')[0]

      if (!inp) {
        if (++findEditTries >= 10) {
          findEditTries = 0

          const parts = window.location.href.split('/')
          const qid = parts[parts.length - 1]
          qids.push(qid)
          reloadQsts()
        }
        return
      } else {
        findEditTries = 0
      }

      let p = document.createElement('p')
      p.textContent = str
      const existPars = inp.querySelectorAll('p')
      if (existPars.length) inp.removeChild(existPars[existPars.length - 1])
      inp.appendChild(p)

      let buttonFound
      for (const link of document.querySelectorAll('a')) { 
        if (link.textContent.includes('Ответить')) {
          if (!link.title) {
            buttonFound = true

            link.click()

            const parts = window.location.href.split('/')
            const qid = parts[parts.length - 1]
            qids.push(qid)

            // it cannot detect posted answer, so decrease timeout to do not hang too long
            findEditTries = 9
            break;
          }
        }
      }
      if (!buttonFound) {
        reloadQsts()
      }
    } else if (window.location.href.startsWith('https://otvet.mail.ru')) {

      let found
      let lastLink
      for (const link of document.querySelectorAll('a')) { 
        if (link.textContent.includes('Ответить') || link.textContent.trim().endsWith('ответов')
             || link.textContent.trim().endsWith('ответ')
              || link.textContent.trim().endsWith('ответа')) {
          lastLink = link
          const parts = link.href.split('/')
          const qid = parts[parts.length - 1]
          if (!qids.includes(qid)) {
            link.click()
            found = true
            break
          }
        }
      }

      if (!found) {
        ++findQstTries
        if (findQstTries >= 5 && lastLink) {
          lastLink.click()
        } else if (findQstTries >= 10) {
          findQstTries = 0
          window.location.reload()
        }
      } else {
        findQstTries = 0
      }
    }
  }, 500)
}
 
ansCon()
