
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

  setInterval(() => {
    if (window.location.href.startsWith('https://otvet.mail.ru/question')) {
      let str = sa.text

      str = freiweb.randomizeStr(str, sa.letter)

      const inp = document.querySelectorAll('div[contenteditable="true"]')[0]

      if (!inp) {
        const parts = window.location.href.split('/')
        const qid = parts[parts.length - 1]
        qids.push(qid)
        const rootLink = document.querySelector('a[href="/"]')
        rootLink.click()
        return
      }

      let p = document.createElement('p')
      p.textContent = str
      if (!inp.textContent.includes(str))
      inp.appendChild(p)

      for (const link of document.querySelectorAll('a')) { 
        if (link.textContent.includes('Ответить')) {
          if (!link.title) {
            link.click()

            const parts = window.location.href.split('/')
            const qid = parts[parts.length - 1]
            qids.push(qid)

            setTimeout(() => {
              if (document.body.textContent.includes('Ответ не опубликован. Невозможно опубликовать ответ: вы уже отвечали ')) {
                const rootLink = document.querySelector('a[href="/"]')
                rootLink.click()
              } else if (document.body.textContent.includes('За сегодняшний день') || document.body.textContent.includes('временно ограничен') ) {
                window.location.href = 'https://account.mail.ru/user/delete'
              }
            }, 300)
            break;
          }
        }
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
      if (!found && lastLink) {
        setTimeout(() => {
          lastLink.click()
        }, 2000)
      }
    }
  }, 500)
}
 
ansCon()
