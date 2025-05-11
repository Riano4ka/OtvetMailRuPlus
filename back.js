const writeText = (text) => {
  new Promise((resolve, reject) => {
    // Create hidden input with text
    const el = document.createElement('textarea')
    el.value = text
    document.body.append(el)

    // Select the text and copy to clipboard
    el.select()
    const success = document.execCommand('copy')
    el.remove()

    if (!success) reject(new Error('Unable to write to clipboard'))

    resolve(text)
  })
}

let titleI = -1

const spamQst = (spam_qsts) => {
  const { title } = spam_qsts
  if (!title || !title.length) {
    alert('Не задан заголовок вопроса')
    return
  }
  let current = title[++titleI]
  if (!current) {
    titleI = -1
    current = title[++titleI]
  }
  const { txt } = current

  const cyr = 'укегзхвапродчсьУКЕНЗХВАРОДСМТ'
  const lat = 'yker3xBanpod4cbYKEH3XBAPODCMT'
  let res = ''
  for (let i = 0; i < txt.length; ++i) {
    const c = txt[i]
    const cyrI = cyr.indexOf(c)
    if (cyrI >= 0 && Math.random() > 0.6) {
      res += lat[cyrI]
      continue
    }
    res += c
  }

  writeText(res)
  return res
}

browser.action.setPopup({ popup: 'addon-ui/popup.html' })

const spamQstClicked = async (sendResponse) => {
  try {
    const ts = await browser.tabs.query({currentWindow: true, active: true})

    const storage = browser.storage.local // TODO: sync is better but not supports Temporary Addon IDs, and...
    const getStorage = async () => {
      try {
        return await storage.get() // FF
      } catch (err) {
        return new Promise(resolve => storage.get(obj => resolve(obj))) // Chrome
      }
    }
    let sq = await getStorage()
    if (sq && sq.spam_qsts && sq.spam_qsts.on && ts && ts[0] && ts[0].url.startsWith('https://otvet.mail.ru')) {
      let rr = spamQst(sq.spam_qsts)
      rr = rr.split('"').join('\\"')
      function injectable(rr, random_cats, mode, use_polls) {
        window.__ASK0 = rr
        window.__ASK1 = random_cats
        window.__ASK2 = mode
        window.__ASK3 = use_polls
      }
      const target = { tabId: ts[0].id }
      await browser.scripting.executeScript({
        target,
        func: injectable,
        args: [rr, sq.spam_qsts.random_cats, sq.spam_qsts.mode, sq.spam_qsts.use_polls],
      })
      browser.scripting.executeScript({
        target,
        files: ['qst-inject.js'],
      })
      return
    }
    sendResponse({})
  } catch (err) {
    console.error('Cannot spam qsts:', err)
    sendResponse({ error: err?.message })
  }
}

browser.runtime.onMessage.addListener((message, sender, sendResponse) => {
  let { msg, avatar } = message
  if (msg === 'post_qst') {
    spamQstClicked(sendResponse)
  }
  return true
})

browser.runtime.onInstalled.addListener((details) => {
  if (details?.reason !== 'install') return
  const url = browser.runtime.getURL('addon-ui/installed.html')
  browser.tabs.create({ url })
})
