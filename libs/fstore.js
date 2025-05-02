
var fstore = {
  _getContext: function() {
    if (browser.tabs) return 'back'
    return 'content_inject'
  },
  _backOnly: function(method) {
    if (this._getContext() !== 'back')
      throw new Error(method + ' can be called only in background script.')
  },
  _proxyBack: async function(method, ...args) {
    if (this._getContext() === 'back')
      return { proxied: false }
    const serArgs = () => {
      return [...args].map(arg => {
        if (arg === undefined) {
          return '_undef'
        }
        return arg
      })
    }
    const res = await browser.runtime.sendMessage({
      msg: 'proxy_back',
      method: 'fstore-' + method,
      args: serArgs()
    })
    return { proxied: true, res }
  },
  unwrap: async function () {
    this._backOnly('unwrap')

    const storage = browser.storage.local // TODO: sync is better but not supports Temporary Addon IDs, and...;
    return storage
  },
  clear: async function () {
    const { proxied, res } = await this._proxyBack('clear')
    if (proxied) {
      return res
    }

    await (await this.unwrap()).clear()
  },
  getByPath: function (obj, keyPath, notExists = 'none') {
    this._backOnly('getByPath')

    let type = 'raw'
    if (!keyPath || !keyPath.endsWith) {
      return { cont: obj[keyPath], type }
    }
    if (keyPath.endsWith('[]')) {
      type = 'array'
    } else if (keyPath.endsWith('{}')) {
      type = 'object'
    }
    if (obj[keyPath] === undefined && notExists === 'create') {
      if (type === 'object') {
        obj[keyPath] = {}
      } else if (type === 'array') {
        obj[keyPath] = []
      } else {
        obj[keyPath] = null
      }
    }
    return { cont: obj[keyPath], type }
  },
  set: async function (keyPath, key, val = '_undef') {
    const { proxied, res } = await this._proxyBack('set', keyPath, key, val)
    if (proxied) {
      return res
    }

    const allData = await this.get()
    if (val === '_undef') {
      val = key
      const { cont, type } = this.getByPath(allData, keyPath, 'create')
      if (type === 'array' && Array.isArray(val)) {
        allData[keyPath] = [...cont, ...val]
      } else {
        allData[keyPath] = val
      }
    } else {
      const { cont, type } = this.getByPath(allData, keyPath, 'create')
      cont[key] = val
    }
    const storage = await this.unwrap()
    await storage.set(allData)
  },
  get: async function (keyPath = '_undef', key = '_undef') {
    const { proxied, res } = await this._proxyBack('get', keyPath, key)
    if (proxied) {
      return res
    }

    if (keyPath === '_undef') {
      const storage = await this.unwrap()
      try {
        return await storage.get() // FF
      } catch (err) {
        return new Promise(resolve => storage.get(obj => resolve(obj))) // Chrome
      }
    }
    const allData = await this.get()
    if (key === '_undef') {
      return this.getByPath(allData, keyPath).cont
    }
    const container = this.getByPath(allData, keyPath).cont
    return container[key]
  }
}

if (browser.tabs) {
  browser.runtime.onMessage.addListener((message, sender, sendResponse) => {
    let { msg, method, args } = message
    if (msg === 'proxy_back') {
      const [ prefix, name ] = method.split('-')
      if (prefix === 'fstore') {
        const proxying = ['get', 'set', 'clear']
        if (proxying.includes(name)) {
          const handler = async () => {
            console.log(name, args)
            const res = await fstore[name](...args)
            console.log(res)
            sendResponse(res)
          }
          handler()
        }
        return true
      }
      return true
    }
    return true
  })
}
