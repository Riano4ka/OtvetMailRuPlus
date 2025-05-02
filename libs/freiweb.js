var freiweb = {
  replaceStr: function (str, what, whom) {
    return str.split(what).join(whom)
  },

  randomInt: function (max) {
    return Math.floor(Math.random() * max)
  },

  makeId: function () {
    let result = '';
    const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
    const randomChar = (arr) => {
       result += arr.charAt(freiweb.randomInt(arr.length))
    }

    const len = 4 + freiweb.randomInt(8)
    for (let i = 0; i < len; ++i) {
        randomChar(letters)
    }

    return result
  },

  randomizeStr: function (txt, method) {
    const cyr = 'укегзхвапродчсьУКЕНЗХВАРОДСМТ'
    const lat = 'yker3xBanpod4cbYKEH3XBAPODCMT'
    const num = 'укег3х8апр0дчсьУКЕН3Х8АР0ДСМТ'
    let res = ''
    for (let i = 0; i < txt.length; ++i) {
      const c = txt[i]
      const cyrI = cyr.indexOf(c)
      if (cyrI >= 0 && Math.random() > 0.6) {
        res += lat[cyrI]
        continue
      } else if (cyrI >= 0 && method === 'latnum' && Math.random() > 0.6) {
        res += num[cyrI]
        continue
      }
      res += c
    }
    if (method === 'latnum') res += ' ' + Math.random().toString().substring(0, 6)
    return res
  },

  delay: function (msec) { return new Promise(resolve => setTimeout(resolve, msec)) },

  waitForIt: async function(getterFunc, timeoutMsec,
    err = 'waitForIt failed', start = null, delayMsec = 250) {
    start = start || Date.now()
    let res = getterFunc()
    while (!res) {
      await freiweb.delay(delayMsec)
      now = Date.now()
      if (now - start > timeoutMsec) {
        break
      }
      res = getterFunc()
    }
    if (!res) {
      throw new Error(err)
    }
    return res
  },

  // TODO: we have more complex implementation in input.js
  inputValue: async function (inp, value) {
    inp.focus()
    const inputSetter = Object.getOwnPropertyDescriptor(
      window.HTMLInputElement.prototype,
      'value').set
    inputSetter.call(inp, value)
     const event = new Event('change', { 'bubbles': true })
     inp.dispatchEvent(event)
  },
  textareaValue: async function (inp, value) {
    inp.focus()
    const inputSetter = Object.getOwnPropertyDescriptor(
      window.HTMLTextAreaElement.prototype,
      'value').set
    inputSetter.call(inp, value)
     const event = new Event('change', { 'bubbles': true })
     inp.dispatchEvent(event)
  },
  selectValue: async function (inp, value) {
    inp.focus()
    const selectSetter = Object.getOwnPropertyDescriptor(
      window.HTMLSelectElement.prototype,
      'value').set
    selectSetter.call(inp, value)
     const event = new Event('change', { 'bubbles': true })
     inp.dispatchEvent(event)
  },

  funcToStr: function (func, name, quotes = null, callWith = '_null', keyWord = 'const ') {
    let code = func.toString()
    if (name) {
      code = keyWord + name + ' = ' + code
    }
    code += ';'
    // we also can check: if it is function, it starts with "function" and can has name

    if (callWith !== '_null') {
      code += name + callWith + ';'
    }

    // allow insert to sciprt
    if (quotes) {
      code = uploadTrigger.split(quotes).join('\\' + quotes)
      code = code.split('\n').join(quotes + ' + \n' + quotes)
      code = quotes + code + quotes
    }
    return code
  },

  copyLibFunc: function (func) {
    let code = freiweb.funcToStr(freiweb[func])
    code = freiweb.replaceStr(code, 'freiweb.', '')
    return code
  },

  injectScript: function (func, mutations = null) {
    let code
    if (typeof func === 'string' || func instanceof String) {
      code = func
    } else {
      const name = freiweb.makeId()
      code = freiweb.funcToStr(func, name, null, '()')
      if (mutations) {
        code = mutations(code)
      }
    }
    const scr = document.createElement('script')
    scr.id = freiweb.makeId()
    scr.innerHTML = code
    document.documentElement.appendChild(scr)
  },

  injectScriptFromUrl: async function (url) {
    let scr = await fetch(url)
    scr = await scr.text()
    freiweb.injectScript(scr)
  },

  injectSvgFromUrl: async function(url, varName) {
    let scr = await fetch(url)
    scr = await scr.text()
    scr = scr.split('"').join('\\"')
    scr = 'window.' + varName + ' = "' + scr + '"'
    freiweb.injectScript(scr)
  },

  makeRemover: function () {
    const scriptId = freiweb.makeId()

    const removerName = freiweb.makeId()
    const removeMyself = () => {
      const myId = "_myId"
      try {
        const myScript = document.getElementById(myId)
        myScript.parentNode.removeChild(myScript)
      } catch (err) {
        console.warn(err)
      }
    }

    let removerCode = freiweb.funcToStr(removeMyself, removerName, null, '()')
    removerCode += '\n\n'

    return { scriptId, removerCode, removerName }
  }
}
