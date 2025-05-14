const uiEmojis = async () => {

const { waitForIt, } = freiweb

const body = await waitForIt(() => {
  return document.body
}, 30000, 'Cannot find document.body')

freiweb.injectScriptWithUrl(browser.runtime.getURL('libs/emoji/emoji-ru.js'))
freiweb.injectScriptWithUrl(browser.runtime.getURL('libs/emoji/emoji-data.js'))
freiweb.injectScriptWithUrl(browser.runtime.getURL('libs/emoji/emoji-mart.js'))
freiweb.injectScriptWithUrl(browser.runtime.getURL('libs/emoji/emoji-popup.js'))

freiweb.injectScriptWithUrl(browser.runtime.getURL('ui-conscripts/ui-emojis.inject.js'))

}

uiEmojis()
