const uiBulk = async () => {
  const body = await freiweb.waitForIt(() => {
    return document.body
  }, 30000, 'Cannot find document.body')

  const callback = async (mutationList, observer) => {
    const targets = document.querySelectorAll('.nt--item')
    for (const target of targets) {
      if (target.hasAttribute('data-omrp')) {
        continue
      }
      target.setAttribute('data-omrp', '1')

      let lookText = ''

      let nids = target.getAttribute('data-nid')
      if (!nids) {
        continue
      }

      nids = nids.split(',')
      for (const nid of nids) {
        const obj = await fstore.get('otvet-bulk{}', nid)

        if (!obj) {
          continue
        }

        lookText += '> ' + obj.nick + ' :\n'
        lookText += (obj.text || obj.txt) + '\n'
        lookText += '-----------------\n\n'
      }

      if (lookText) {
        const look = document.createElement('div')
        look.innerHTML = '<a href="#">(что там?)</a>'
        look.onclick = e => {
          e.preventDefault()
          e.stopPropagation()
          alert(lookText)
        }

        const time = target.querySelector('.nt--time')
        if (time) {
          look.style.display = 'inline-block'
          look.style.opacity = 0.5
          look.style.float = 'right'
          time.appendChild(look)
        } else {
          look.style.fontSize = '90%'
          target.appendChild(look)
        }
      }
    }
  };
  const observer = new MutationObserver(callback)
  observer.observe(body, { childList: true, subtree: true })
}

uiBulk()
