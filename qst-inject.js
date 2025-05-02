var injectMain = async () => {
  const injectable = () => {
    const randomItem = (arr) => {
      return arr[Math.floor(Math.random() * arr.length)]
    }

    const theCats = [1379, 1375, 1373, 1380,
      1449, 1447, 1450,
      21, 22, 23]

    if (!XMLHttpRequest.prototype.origSend) {
      XMLHttpRequest.prototype.origSend = XMLHttpRequest.prototype.send
      XMLHttpRequest.prototype.send = function (data) {
        if (data && data.contains && data.contains("is_comments_allowed")) {
          let obj
          try {
            obj = JSON.parse(data)
          } catch (err) {
            console.error('OMR-Net-Filter-Old: cannot parse', err, data)
            return
          }
          if (window.__RANDOM_CATS__) {
            obj.data.category.id = randomItem(theCats)
          }
          if (window.__USE_POLLS__) {
            obj.data.poll = {
              is_multi: false,
              items: [
                { startedTyping: true, text: ')))', value: ''},
                { startedTyping: true, text: ')))', value: ''}
              ]
            }
          }
          delete window.__RANDOM_CATS__
          delete window.__USE_POLLS__
          console.log('Question which sent:', obj)
          data = JSON.stringify(obj)
        }
        return this.origSend(data)
      }
    }
  }

  if (window.__ASK1 || window.__ASK3) {
    const src = document.createElement('script')
    src.innerHTML = 'var __RANDOM_CATS__ = ' + __ASK1 + ';'
    src.innerHTML += 'var __USE_POLLS__ = ' + __ASK3 + ';'
    src.innerHTML += 'var inje = ' + injectable.toString() + ';inje()'
    document.body.appendChild(src)
  }

  const inputSetter = Object.getOwnPropertyDescriptor(
    window.HTMLInputElement.prototype,
    'value').set;

    const inputChange = (query, val, onChange = true, onInput = true,
        onKey = true, focusBlur = true) => {
     const inps = document.getElementsByName(query.name)
     let inp = inps[1]
     if (focusBlur) {
       const event = new Event('focusin', { 'bubbles': true })
       inp.dispatchEvent(event)
     }
     inputSetter.call(inp, val)
     for (const c of val) {
       const event = new KeyboardEvent('keydown', {
          'bubbles': true,
          key: c
       })
       inp.dispatchEvent(event)
     }
     if (onChange) {
       const event = new Event('change', { 'bubbles': true })
       inp.dispatchEvent(event)
     }
     if (onInput) {
       const event2 = new Event('input', { 'bubbles': true })
       inp.dispatchEvent(event2)
     }
     if (focusBlur) {
      console.log('bluring')
       const event = new Event('blur', { 'bubbles': true })
       inp.dispatchEvent(event)
     }
  }

  const fillQst = () => {
    inputChange({name: 'search'}, window.__ASK0 || 'Cannot obtain text, but moder is mraz')
  }

  const postQst = async () => {
    return new Promise(resolve => {
      setTimeout(() => {
        const xpath = "//*[contains(text(),'Задать вопрос')]";
        const el = document.evaluate(xpath, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
        if (el) {
          window._EL = el
          el.click()
        } else {
          console.warn('cannot find ask button')
        }
        resolve()
      }, 500)
    })
  }

  fillQst()

  postQst()
}

injectMain()