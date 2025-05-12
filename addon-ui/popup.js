async function main() {

if (navigator.userAgent.includes('Firefox')) {
  document.querySelectorAll('.list-group').forEach(group => {
    group.classList.add('list-group-flush')
  })
}

const form = document.forms[0]

const { qst, ans, ans_on,
  block_ads, block_ads_on, show_bans, show_bans_on } = form

const storage = browser.storage.local
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

let store = await getStorage()
const sa = store?.auto_ans || {}
if (sa.on) {
  ans_on.checked = true
}

let blockAds = await fstore.get('cfg-block-ads')
if (blockAds === undefined) blockAds = true
block_ads_on.checked = blockAds

let showBans = await fstore.get('cfg-show-bans')
if (showBans === undefined) showBans = true
show_bans_on.checked = showBans

qst.onclick = (e) => {
  browser.windows.create({
    url: browser.runtime.getURL("qst.html"),
    type: "popup",
    height: 700,
    width: 500,
  })
}

ans.onclick = (e) => {
  browser.windows.create({
    url: browser.runtime.getURL('answer/ans.html'),
    type: 'popup',
    height: 350,
    width: 500,
  })
}

ans_on.onclick = async (e) => {
  if (!sa.text && !sa.on) {
    e.preventDefault()
    return
  }
  e.stopPropagation()
  sa.on = e.target.checked
  await storageSet({ auto_ans: sa })

  window.open('https://otvet.mail.ru/')

  window.close()
}

block_ads_on.onclick = async (e) => {
  e.stopPropagation()
  blockAds = !blockAds
  await fstore.set('cfg-block-ads', blockAds)
  window.close()
}

block_ads.onclick = (e) => {
  block_ads_on.click()
}

show_bans_on.onclick = async (e) => {
  e.stopPropagation()
  showBans = !showBans
  await fstore.set('cfg-show-bans', showBans)
  window.close()
}

show_bans.onclick = (e) => {
  show_bans_on.click()
}

}

main()
