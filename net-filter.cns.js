
freiweb.injectScriptWithUrl(browser.runtime.getURL('net-filter.inject.js'))

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
