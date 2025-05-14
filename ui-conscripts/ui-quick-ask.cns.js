const addPostQsButton = async () => {
  if (!location.pathname.startsWith('/ask') &&
    !location.pathname.startsWith('/question') &&
    !location.pathname.startsWith('/answer') &&
    !location.pathname.startsWith('/profile')) {
    
    let header = await freiweb.waitForIt(() => {
      return document.querySelector('h1')
    }, 30000)

    const id = 'post-qst'

    const storage = browser.storage.local
    const getStorage = async () => {
      try {
        return await storage.get() // FF
      } catch (err) {
        return new Promise(resolve => storage.get(obj => resolve(obj))) // Chrome
      }
    }
    let store = await getStorage()
    const sa = store?.spam_qsts || {}
    if (!sa.on) {
      const btn = document.getElementById(id)
      if (btn) {
        btn.parentNode.removeChild(btn)
      }
      return
    }

    if (document.getElementById(id)) return

    const btn = document.createElement('button')
    btn.textContent = 'Спам вопрос!'
    btn.id = id
    btn.style.float = 'right'
    btn.style.background = '#7c0000'
    btn.style.color = '#fff'
    btn.style.fontSize = '15px'
    btn.style.padding = '8px'
    btn.style.border = 'none'
    btn.style.borderRadius = '5px'
    btn.style.cursor = 'pointer'
    btn.onclick = (e) => {
      browser.runtime.sendMessage({ msg: 'post_qst' }).then(resp => {
        if (resp.error) alert(resp.error)
      })
    }

    header.appendChild(btn)
  }
}

addPostQsButton()

frouter.addNavigateListener(addPostQsButton)
