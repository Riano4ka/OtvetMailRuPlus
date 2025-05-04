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

browser.browserAction.onClicked.addListener(async (tab) => {
  const ts = await browser.tabs.query({currentWindow: true, active: true})

  try {
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
      await browser.tabs.executeScript(ts[0].id, {code: 'window.__ASK0 = "' + rr
        + '";window.__ASK1 = ' + sq.spam_qsts.random_cats
        + ';window.__ASK2 = "' + sq.spam_qsts.mode
        + '";window.__ASK3 = ' + sq.spam_qsts.use_polls
        + ';'
      })
      browser.tabs.executeScript(ts[0].id, {file: 'qst-inject.js'})
      return
    }
  } catch (err) {
    console.error('Cannot spam qsts:', err)
  }
});

const mainMenu = async () => {
  browser.contextMenus.create({
    "title": "Постинг вопросов",
    "contexts": ["browser_action"],
    "onclick": () => {
      browser.windows.create({
        url: browser.runtime.getURL("qst.html"),
        type: "popup",
        height: 700,
        width: 500,
      });
    }
  });

  browser.contextMenus.create({
    "title": "Автоответчик",
    "contexts": ["browser_action"],
    "onclick": () => {
      browser.windows.create({
        url: browser.runtime.getURL("answer/ans.html"),
        type: "popup",
        height: 350,
        width: 500,
      });
    }
  });

  browser.contextMenus.create({
    type: 'separator',
    "contexts": ["browser_action"],
  });

  let blockAds = await fstore.get('cfg-block-ads')
  if (blockAds === undefined) blockAds = true

  browser.contextMenus.create({
    type: 'checkbox',
    "title": "Скрывать баннеры и т.д.",
    "contexts": ["browser_action"],
    checked: blockAds,
    "onclick": async (e) => {
      await fstore.set('cfg-block-ads', e.checked)
    }
  });

  let showBans = await fstore.get('cfg-show-bans')
  if (showBans === undefined) showBans = true

  browser.contextMenus.create({
    type: 'checkbox',
    "title": "Читать профили забаненных",
    "contexts": ["browser_action"],
    checked: showBans,
    "onclick": async (e) => {
      await fstore.set('cfg-show-bans', e.checked)
    }
  })
}

mainMenu()
