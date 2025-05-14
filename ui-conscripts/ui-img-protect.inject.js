const protectImages = (isProfile) => {
  const evilHashes = [
    //25641192,

    11128751,
    17426991,
    19668831,
    11459956,
    24663769,
    21263165,
  ]

  const imgHash = (img, onHash) => {
    const imgCopy = document.createElement('img')
    imgCopy.crossOrigin = 'anonymous'
    imgCopy.src = img.getAttribute('data-viewer') || img.src

    imgCopy.onload = () => {
      const canv = document.createElement('canvas')
      const ctx = canv.getContext("2d")
      ctx.drawImage(imgCopy, 0, 0)
      const { data } = ctx.getImageData(0, 0, imgCopy.width, imgCopy.height)
      let hash = 0
      for (const b of data) {
        hash += b
      }

      img.setAttribute('data-hash', hash)
      if (onHash) onHash(hash)
    }
  }

  const createOverlay = () => {
    const secOverlay = document.createElement('div')
    secOverlay.className = 'sec-overlay'
    const style = secOverlay.style
    style.position = 'absolute'
    style.top = '0px'
    style.left = '0px'
    style.width = '100%'
    style.height = '100%'
    return secOverlay
  }

  const createHint = (text) => {
    const secHint = document.createElement('div')
    secHint.className = 'secure-hint'
    secHint.textContent = text
    const style = secHint.style
    style.position = 'absolute'
    style.top = '50%'
    style.left = '50%'
    style.transform = 'translate(-50%, -50%)'
    style.borderRadius = '5px'
    style.borderColor = '#fff'
    style.backgroundColor = 'rgb(0, 0, 0, 0.5)'
    style.color = '#fff'
    style.padding = '10px 10px'
    style.userSelect = 'none'
    style.opacity = 0
    return secHint
  }

  const wrapWithParent = (img) => {
      const oldParent = img.parentNode

      const imgParent = document.createElement('div')
      imgParent.className = 'sec-parent'
      imgParent.style.position = 'relative'
      imgParent.appendChild(img)

      oldParent.appendChild(imgParent)
  }

  for (const img of document.querySelectorAll('img')) {
    if ((img.hasAttribute('data-viewer') || isProfile)
        && img.src?.endsWith('.gif') && !img.hasAttribute('secure')) {
      img.setAttribute('secure', 1)
      img.style.filter = 'blur(10px)'

      // if >1 images in line, it wraps them... but it works)
      wrapWithParent(img)

      const secOverlay = createOverlay()
      img.parentNode.appendChild(secOverlay)

      const waitText = 'это точно безопасный gif?'

      const secHint = createHint(waitText)
      img.parentNode.appendChild(secHint)

      let waitSec = 6
      let isEvil = false
      const waiting = () => {
        if (isEvil) return
        secHint.textContent = waitText + ' ('  +waitSec + ')'
        if (--waitSec === 0) {
          secOverlay.parentNode.removeChild(secOverlay)

          img.style.filter = 'blur(20px)'

          secHint.textContent = 'нажмите, чтобы увидеть'
          secHint.style.cursor = 'pointer'
          secHint.onclick = (e) => {
            e.stopPropagation()
            e.preventDefault()
            img.style.filter = 'none'
            secHint.parentNode.removeChild(secHint)
          }
          return
        }
        setTimeout(waiting, 1000)
      }
      waiting()

      const onImgLoad = () => {
        secHint.style.opacity = 1

        imgHash(img, (hash) => {
          if (evilHashes.includes(hash)) {
            img.style.filter = 'blur(20px)'

            secOverlay.style.backgroundColor = 'rgba(100, 0, 0, 0.5)'
            secHint.textContent = 'похоже, это что-то плохое и страшное!'
            secHint.style.cursor = 'pointer'
            secHint.onclick = (e) => {
              if (!confirm('Открыть подозрительную картинку?')) return
              img.style.filter = 'none'
              secOverlay.parentNode.removeChild(secOverlay)
              secHint.parentNode.removeChild(secHint)
            }

            isEvil = true
          }
        })
      }
      if (img.complete) {
        onImgLoad()
      } else {
        img.addEventListener('load', onImgLoad)
      }
    }
  }
}

window.addEventListener('message', async (msg) => {
  if (!msg?.data) return
  const { type, isProfile } = msg.data
  if (type === 'protectImages') {
    protectImages(isProfile)
  }
})
