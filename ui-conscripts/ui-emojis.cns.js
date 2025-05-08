const uiEmojis = async () => {

const { waitForIt, } = freiweb

const body = await waitForIt(() => {
  return document.body
}, 30000, 'Cannot find document.body')

let runEmojis = () => {
    const emojiDefs = ['😀', '🥰', '🤣', '😨', '😭', '❤️']
    const maxRecents = 8

    const findEditor = (parent) => {
        let editorParent = parent
        let editor
        do {
            editor = editorParent.querySelector('div[contenteditable="true"]')
            editorParent = editorParent.parentNode
        } while (!editor && editorParent.querySelector)
        return editor
    }

    const getRecents = () => {
        let recents = localStorage.getItem('recents')
        if (recents) {
            recents = JSON.parse(recents)
        }
        recents = recents || emojiDefs
        return recents
    }

    const insertEmoji = (em, parent) => {
        let p = document.createTextNode(em)

        // Requires activeElement to be detected before emoji clicked
        //if (activeElement && activeElement.id === 'question_text') {

        const editor = findEditor(parent)

        let cont
        const rows = editor.querySelectorAll('p')
        if (rows.length) {
            cont = rows[rows.length - 1]
        } else {
            cont = editor
        }
        if (cont.textContent.length && !cont.textContent.endsWith(' ')) {
            cont.appendChild(document.createTextNode(' '))
        }
        cont.appendChild(p)

        const range = document.createRange()
        range.setStart(p, 2)
        const sel = window.getSelection()
        sel.removeAllRanges()
        sel.addRange(range)
    }

    const renderRecent = (recents, parent) => {
        const recent = document.createElement('div')
        recent.className = 'emoji-recent'
        recent.style.display = 'inline-block'
        recent.style.fontSize = '120%'
        for (const em of recents) {
            const emItem = document.createElement('span')
            emItem.className = 'recent-emoji'
            emItem.textContent = em
            emItem.style.padding = '3px'
            emItem.style.padding = '3px'
            emItem.style.cursor = 'pointer'
            emItem.onclick = (e) => {
                const editor = findEditor(parent)
                insertEmoji(em, editor)
            }
            recent.appendChild(emItem)
        }
        const st = document.createElement('style')
        st.textContent = '.recent-emoji:hover { opacity: 0.7; } em-picker { box-shadow: 0px 0px 8px rgba(0, 0, 0, 0.3) !important; }'
        recent.appendChild(st)
        return recent
    }

    const updateRecent = (parent) => {
        const recents = getRecents()
        const recs = document.querySelectorAll('.emoji-recent')
        for (const rec of recs) {
            const newRec = renderRecent(recents, parent)
            rec.replaceWith(newRec)
        }
    }

    const addEmojis = async () => {
        const insVids = document.querySelectorAll('a[title="Вставить видео"]')
        for (const insVid of insVids) {
            const parent = insVid.parentNode
            if (!parent.querySelector('.rn-right')) {
                const ep = new EmojiPopup()

                ep.emojiSelect = (em) => {
                    insertEmoji(em.native, parent)

                    let recents = getRecents()
                    recents = recents.filter(el => el !== em.native)
                    recents.unshift(em.native)
                    recents = recents.slice(0, maxRecents)
                    localStorage.setItem('recents', JSON.stringify(recents))
                    updateRecent(parent)
                }

                const recent = renderRecent(getRecents(), parent)

                const kebab = document.createElement('a')
                kebab.role = 'link'
                try {
                    const kebabSvg = _renderSvg(16, 16, [
                      {'fill-rule': 'evenodd',
                      'd': 'M8 11.365a1.817 1.817 0 010 3.632 1.817 1.817 0 010-3.632zm0-5.191a1.826 1.826 0 010 3.65 1.826 1.826 0 010-3.65zm0-5.171a1.81 1.81 0 11-.001 3.617A1.81 1.81 0 018 1.003z'}
                    ])
                    kebab.appendChild(kebabSvg)
                } catch {
                    kebab.appendChild(document.createTextNode('...'))
                }
                kebab.style.userSelect = 'none'
                kebab.title = 'Ещё эмодзи'

                const rnRight = document.createElement('a')
                rnRight.className = 'rn-right'
                rnRight.style.float = 'right'
                rnRight.style.fill = '#a5a7ad'
                rnRight.style.color = '#a5a7ad'
                rnRight.appendChild(recent)
                rnRight.appendChild(kebab)
                parent.appendChild(rnRight)

                kebab.onclick = (e) => {
                    ep.toggleEmoji(e.target)
                }
            }
        }
    }

    addEmojis()

    const callback = (mutationList, observer) => {
      addEmojis()
    };
    const observer = new MutationObserver(callback)
    observer.observe(document.body, { childList: true, subtree: true })
}

await freiweb.injectScriptFromUrl(browser.runtime.getURL('libs/emoji/emoji-ru.js'))
await freiweb.injectScriptFromUrl(browser.runtime.getURL('libs/emoji/emoji-data.js'))
await freiweb.injectScriptFromUrl(browser.runtime.getURL('libs/emoji/emoji-mart.js'))
await freiweb.injectScriptFromUrl(browser.runtime.getURL('libs/emoji/emoji-popup.js'))

freiweb.injectScript('var _renderSvg = ' + freiweb.copyLibFunc('renderSvg'))
freiweb.injectScript(runEmojis)

}

uiEmojis()
