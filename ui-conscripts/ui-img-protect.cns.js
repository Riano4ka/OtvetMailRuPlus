const imgProtector = async () => {
  const body = await freiweb.waitForIt(() => document.body, 30000)

  const observer = new MutationObserver(async (mutations) => {
    if (await fstore.get('cfg-protect-imgs') === false) return
    if (!isQstOrAns() && !isProfile()) return
    window.postMessage({ type: 'protectImages', isProfile: isProfile() })
  })
  observer.observe(body, { childList: true, subtree: true })
}

freiweb.injectScriptWithUrl(browser.runtime.getURL('ui-conscripts/ui-img-protect.inject.js'))

imgProtector()