const netFilter = () => {
  class NewXMLHttpRequest {
    constructor(options) {
      this.orig = new OrigXMLHttpRequest(options)
      this.listeners = {}
    }

    abort() { return this.orig.abort() }
    getAllResponseHeaders() { return this.orig.getAllResponseHeaders() }
    getResponseHeader(headerName) { return this.orig.getResponseHeader(headerName) }

    open(method, url, async, user, password) {
      //console.error('OPEN:', url)
      return this.orig.open(method, url, async, user, password)
    }

    overrideMimeType(mimeType) { return this.orig.overrideMimeType(mimeType) }

    send(data) {
      const dataStr = data && data.toString && data.toString()
      //console.error(dataStr)
      this._isBulk = dataStr.includes('bulk_history')
      return this.orig.send(data)
    }

    setRequestHeader(header, value) {
      return this.orig.setRequestHeader(header, value)
    }

    // Props

    get readyState() { return this.orig.readyState }

    get timeout() { return this.orig.timeout }
    set timeout(msec) { this.orig.timeout = msec }

    get responseText() {
      let resp = this.orig.responseText
      //console.error('RESP_TEXT:', resp)
      try {
        if (resp) {
          if (this._isBulk) {
            let parsed
            try {
              parsed = JSON.parse(resp)
            } catch (err) {
              console.warn(err)
              return resp
            }
            if (!parsed || !parsed.res) {
              return resp
            }

            window.postMessage({ msg: 'bulk', data: parsed })
          }
        }
      } catch (err) {
        console.error('OMR+: Some error in net-filter responseText:', err)
      }
      return resp
    }

    // TODO: but look likes not need...
    get response() { return this.orig.response }

    get responseURL() { return this.orig.responseURL }

    get responseType() { return this.orig.responseType }

    get responseXML() { return this.orig.responseXML }

    get upload() { return this.orig.upload }

    get status() { return this.orig.status }
    get statusText() { return this.orig.statusText }

    get withCredentials() { return this.orig.withCredentials }
    set withCredentials(b) { this.orig.withCredentials = b }

    // Events

    addEventListener(evKey, listener) {
      if (!this.listeners[evKey]) {
        this.listeners[evKey] = []
      }
      this.listeners[evKey].push(listener)
      this.orig.addEventListener(evKey, listener)
    }

    set onabort(listener) { this.orig.onabort = listener }
    set onerror(listener) { this.orig.onerror = listener }
    set onload(listener) { this.orig.onload = listener }
    set onloadend(listener) { this.orig.onloadend = listener }
    set onloadstart(listener) { this.orig.onloadstart = listener }
    set onprogress(listener) { this.orig.onprogress = listener }
    set onreadystatechange(listener) { this.orig.onreadystatechange = listener }
    set ontimeout(listener) { this.orig.ontimeout = listener }
  }

  window.OrigXMLHttpRequest = XMLHttpRequest
  window.XMLHttpRequest = NewXMLHttpRequest
}

freiweb.injectScript(netFilter)

window.addEventListener('message', async (msg) => {
  const { data } = msg
  if (!data) return
  if (data.msg === 'bulk') {
    const resp = data.data
    if (!resp.res) {
      console.warn('OMR+: bulk message without res')
      return
    }
    for (const partwtf of resp.res) {
      for (const item of partwtf) {
        let toSave
        if (item.a === 'ca') {
          toSave = item.cmt && item.cmt[0]
        } else if (item.a === 'cc') {
          toSave = item.cmt && item.cmt[0]
        } else if (item.a === 'ans') {
          toSave = item.ans && item.ans[0]
        }

        if (toSave && item.nid) {
          await fstore.set('otvet-bulk{}', item.nid, toSave)
        }
      }
    }
  }
})
