const uiProfile = async () => {

const { waitForIt, } = freiweb

const styleId = 'user-banned-style'

const getStyle = () => document.getElementById(styleId)
const addStyle = () => {
    if (getStyle()) return
    const st = document.createElement('style')
    st.id = styleId
    st.textContent = `body.user-banned {
        div { opacity: 1 !important; pointer-events: auto !important; }
        a { opacity: 1 !important; pointer-events: auto !important; }
        li { opacity: 1 !important; pointer-events: auto !important; }
    }`
    document.body.appendChild(st)
}
const removeStyle = () => {
    const st = getStyle()
    st?.parentNode.removeChild(st)
}

const isProfilePage = () => {
    if (!location.pathname.startsWith('/profile/')) return null
    let uid = location.pathname.split('/')[2]
    uid = uid.slice(2)
    return uid
}

const showBanned = async (showBans) => {
    const bodyClasses = document.body.classList
    if (showBans && isProfilePage()) {
        addStyle()

        await waitForIt(() => {
            return document.body.innerHTML.includes('КПД')
        }, 10000, 'Profile not found', null, 50)

        const doxersSuckMyDickUntilItBecamePussy = document.body.innerHTML.includes('✠ Mars-Venus ✠')
        if (doxersSuckMyDickUntilItBecamePussy) return
        if (!document.body.innerHTML.includes('Пользователь заблокирован')) return
        bodyClasses.add('user-banned')
    } else {
        bodyClasses.remove('user-banned')
        if (!showBans) removeStyle()
    }
}

const addBuyVip = async () => {
    const uid = isProfilePage()
    if (!uid) return

    const vipBtnId = 'buy-vip'

    if (!!document.getElementById(vipBtnId)) return

    let giftClass
    let spanClass
    let giftBtn = await waitForIt(() => {
        const svgs = document.querySelectorAll('svg')
        for (const svg of svgs) {
            const btn = svg.parentNode
            if (btn?.textContent?.includes('Отправить подарок')) {
                giftClass = svg.getAttribute('class') || ''
                spanClass = btn.querySelectorAll('span')[0]?.getAttribute('class') || ''
                return btn
            }
        }
    }, 30000, 'Send gift button not found', null, 50)

    const vipSvg = freiweb.renderSvg(16, 16, [
      {'fill-rule': 'evenodd',
      'd': 'M8.013 0A2.001 2.001 0 0110 1.987V2c0 .44-.307.724-.741 1.166a.467.467 0 00-.125.451c.245.809.914 2.154 2.681 2.383 1.227.159 1.766-.431 2.002-1.011A1.5 1.5 0 0114 2h.503a.5.5 0 01.497.5v10c0 1.38-3.137 2.5-7 2.5s-7-1.12-7-2.5v-10a.5.5 0 01.5-.5H2a1.5 1.5 0 01.183 2.989c.236.58.775 1.17 2.002 1.011 1.755-.228 2.427-1.556 2.676-2.367a.488.488 0 00-.12-.467C6.307 2.723 6 2.44 6 2a2 2 0 012-2h.013zM8 11c2.564 0 4.646.443 4.646.99 0 .546-2.082.989-4.646.989s-4.646-.443-4.646-.989c0-.547 2.082-.99 4.646-.99zm-.003-3.997a.997.997 0 110 1.994.997.997 0 010-1.994z'}
    ], giftClass)

    const vipBtn = document.createElement(giftBtn.tagName)
    vipBtn.id = vipBtnId
    vipBtn.className = giftBtn.className
    vipBtn.style.marginTop = '10px'
    vipBtn.appendChild(vipSvg)
    vipBtn.onclick = (e) => {
        e.preventDefault()
        showPaymentModal('mvip', uid)
    }
    const span = document.createElement('span')
    span.textContent = 'Купить VIP-статус'
    span.className = spanClass
    vipBtn.appendChild(span)
    giftBtn.parentNode.appendChild(vipBtn)
}

const initProfile = async () => {
    const showBans = async () => {
        const cfg = await fstore.get('cfg-show-bans')
        return cfg !== false
    }

	const body = await waitForIt(() => {
	  return document.body
	}, 30000, 'Cannot find document.body')

    if (typeof(navigation) !== 'undefined' && navigation.addEventListener) { // 04.2025 - only Chrome
        navigation.addEventListener('navigate', async (event) => {
            showBanned(await showBans())
            addBuyVip()
        })
    } else {
        let oldLocation = location.href
        const observer = new MutationObserver(async (mutations) => {
            if (location.href !== oldLocation) {
                oldLocation = location.href
                showBanned(await showBans())
                addBuyVip()
            }
        })
        observer.observe(body, { childList: true, subtree: true })
    }

    showBanned(await showBans())
    addBuyVip()
}

initProfile()

}

uiProfile()
