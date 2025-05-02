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

  let aa = await getStorage()
  aa = (aa && aa.auto_ans) || {}
  if (aa.text) {
    form.text.value = aa.text
  }
  if (aa.letter) form.letter.value = aa.letter
  if (aa.on !== undefined) form.on.checked = aa.on

  form.onsubmit = async (e) => {
    e.preventDefault()
    aa.text = form.text.value
    aa.letter = form.letter.value
    aa.on = form.on.checked
    await storageSet({ auto_ans: aa})

    window.open('https://otvet.mail.ru/')

    setTimeout(() => { window.close() }, 250)
  }
}
