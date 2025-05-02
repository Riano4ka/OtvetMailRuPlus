if (typeof(browser) === 'undefined') {
  var browser = chrome
}
const storage = browser.storage.local // TODO: sync is better but not supports Temporary Addon IDs, and...
const getStorage = async () => {
  try {
    return await storage.get() // FF
  } catch (err) {
    return new Promise(resolve => storage.get(obj => resolve(obj))) // Chrome
  }
}
const storageSet = async (...args) => {
  try {
     await storage.set(...args)
  } catch (err) {
     console.error('storageSet', err)
     alert(';( Не удается сохранить. Может места на диске не хватает?\n\nОригинал ошибки:\n' + err)
     throw err
  }
}

window.onload = async () => {
  const form = document.forms[0]

  let sq = await getStorage()
  sq = (sq && sq.spam_qsts) || {}
  if (sq.title) {
    let t = 0
    for (const val of sq.title) {
      const inp = form.title[t++]
      if (inp)
        inp.value = val.txt;
      else
        console.error('Cannot find input:', t, sq.spam_qsts)
    }
  }
  if (sq.letter) form.letter.value = sq.letter
  if (sq.emoji) form.emoji.value = sq.emoji
  if (sq.random_cats !== undefined) form.random_cats.checked = sq.random_cats
  if (sq.use_polls !== undefined) form.use_polls.checked = sq.use_polls
  if (sq.mode) {
    form.mode.value = sq.mode
  } else {
    form.mode.value = 'manual'
  }
  if (sq.on !== undefined) form.on.checked = sq.on

  form.onsubmit = async (e) => {
    e.preventDefault()
    sq.title = []
    for (const inp of form.title) {
      const { value } = inp
      if (!value.trim()) continue
      sq.title.push({ txt: value })
    }
    sq.letter = form.letter.value
    sq.emoji = form.emoji.value
    sq.random_cats = form.random_cats.checked
    sq.use_polls = form.use_polls.checked
    sq.mode = form.mode.value
    sq.on = form.on.checked
    await storageSet({ spam_qsts: sq})
    setTimeout(() => { window.close() }, 250)
  }
}
