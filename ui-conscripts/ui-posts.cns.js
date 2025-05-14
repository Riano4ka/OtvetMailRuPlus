const uiPosts = async () => {

const { waitForIt, } = freiweb

const body = await waitForIt(() => {
  return document.body
}, 30000, 'Cannot find document.body')

const initPostDeleter = () => {
    const getQid = async (ul) => {
        const qMark = '/question/'
        let cont = ul
        do {
            const headers = cont.querySelectorAll('h1')
            for (const header of headers) {
                if (header.innerHTML.includes(qMark)) {
                    const a = header.querySelector('a')
                    if (a && a.href) {
                        let href = a.href.substring(a.href.indexOf(qMark) + qMark.length)
                        href = href.split('/')[0]
                        href = href.split('#')[0]
                        href = href.split('?')[0]
                        return href
                    }
                }
            }
        } while (cont = cont.parentNode)
    }

    const idFromPathname = (pathname) => {
        let id = pathname.split('/')[2]
        if (id?.startsWith('id')) { // /profile/id1488
            id = id.slice(2)
        }
        return id
    }

    const getIdAfterMark = (href, mark) => {
        href = href.substring(href.indexOf(mark) + mark.length)
        href = href.split('/')[0]
        href = href.split('#')[0]
        href = href.split('?')[0]
        return href
    }

    const getPostIds = (ul) => {
        const qMark = '/question/'
        const aMark = '/answer/'
        let qid, aid

        const { pathname } = location
        if (pathname.startsWith(qMark)) {
            qid = idFromPathname(pathname)
        } else if (pathname.startsWith(aMark)) {
            aid = idFromPathname(pathname)
        }

        // TODO:
        // - parse full header props (title, date, author...)
        // - if url is /answer/1488, it detects also a question by its link in title. But it potentially can mislead with leader qsts... Fix it
        let cont = ul
        let depth = 1
        do {
            const links = cont.querySelectorAll('a')
            for (const a of links) {
                const href = a.getAttribute('href') // vs a?.href, We should NOT get full url (e.g. '#' results in '/questions/...#` and it can prepend answer URL, so code will think it's a question)
                if (!aid && depth < 5 && href?.includes(aMark)) {
                    aid = getIdAfterMark(href, aMark)
                } else if (!qid && href?.includes(qMark)) {
                    qid = getIdAfterMark(href, qMark)
                }
            }
        } while ((cont = cont.parentNode) && ++depth)

        return {qid, aid}
    }

    const addDeleters = () => {
        let reports = [... document.querySelectorAll('a')].filter(el => el.textContent.includes('Редактировать') ||
            el.textContent.includes('Дополнить'))
        for (let report of reports) {
            let liClass
            let ul
            let aClass = report.className
            do {
                const nodeName = report.nodeName.toUpperCase()
                if (nodeName === 'LI') {
                    liClass = report.className
                } else if (nodeName === 'UL') {
                    ul = report
                    if (liClass !== undefined) break
                }
            } while (report = report.parentNode)

            if (!ul) continue
            if (ul.innerHTML.includes('li-deleter')) continue

            const pdelSvg = freiweb.renderSvg(16, 16, [
              {'fill-rule': 'evenodd',
              'd': 'M12.437 6a.463.463 0 01.464.489l-.367 6.679c0 1.104-.914 1.84-2.018 1.84H5.548c-1.103 0-2.017-.686-2.017-1.79l-.436-6.724A.462.462 0 013.558 6h8.879zM2.128 5a.529.529 0 01-.531-.525l.001-.012c0-.414.251-.769.608-.922.455-.241 1.681-.439 3.292-.542V1.41C5.498.632 6.13 0 6.908 0h2.184c.778 0 1.41.632 1.41 1.41v1.589c1.611.103 2.837.301 3.292.542.357.153.608.508.608.922 0 .297-.24.537-.537.537H2.128zm6.571-3.407H7.301A.301.301 0 007 1.894v1.041a46.454 46.454 0 012 0V1.894a.301.301 0 00-.301-.301z'}
            ], 'Ainfb')

            const pdelLi = document.createElement('li')
            pdelLi.className = liClass + ' li-paid-deleter'
            const pdel = document.createElement('a')
            pdel.className = aClass
            pdel.appendChild(pdelSvg)
            pdel.appendChild(document.createTextNode('Удалить (35 руб.)'))
            pdel.onclick = async (e) => {
                e.preventDefault()
                const { qid, aid } = getPostIds(ul)
                try {
                    if (!aid) {
                        await showPaymentModal('mhideqst', qid)
                    } else {
                        await showPaymentModal('mhideans', aid)
                    }
                } catch (err) {
                    alert(err?.message)
                }
            }
            pdelLi.appendChild(pdel)
            ul.appendChild(pdelLi)

            const delSvg = freiweb.renderSvg(16, 16, [
              {'fill-rule': 'evenodd',
              'd': 'M12.437 6a.463.463 0 01.464.489l-.367 6.679c0 1.104-.914 1.84-2.018 1.84H5.548c-1.103 0-2.017-.686-2.017-1.79l-.436-6.724A.462.462 0 013.558 6h8.879zM2.128 5a.529.529 0 01-.531-.525l.001-.012c0-.414.251-.769.608-.922.455-.241 1.681-.439 3.292-.542V1.41C5.498.632 6.13 0 6.908 0h2.184c.778 0 1.41.632 1.41 1.41v1.589c1.611.103 2.837.301 3.292.542.357.153.608.508.608.922 0 .297-.24.537-.537.537H2.128zm6.571-3.407H7.301A.301.301 0 007 1.894v1.041a46.454 46.454 0 012 0V1.894a.301.301 0 00-.301-.301z'}
            ], 'Ainfb')

            const deleterLi = document.createElement('li')
            deleterLi.className = liClass + ' li-deleter'
            const deleter = document.createElement('a')
            deleter.className = aClass
            deleter.appendChild(delSvg)
            deleter.appendChild(document.createTextNode('Удалить (0 руб.)'))
            deleter.onclick = async (e) => {
                e.preventDefault()
                ul.style.display = 'none'

                const { qid, aid } = getPostIds(ul)
                try {
                    if (!aid) {
                        await deleteQst(qid)
                    } else {
                        await deleteAnswer(qid, aid)
                    }
                } catch (err) {
                    alert(err?.message)
                    return
                }

                document.body.style.pointerEvents = 'none'
                let opacity = 5
                document.body.style.opacity = opacity/10
                let out = true
                setInterval(() => {
                    opacity += (out ? -1 : 1)
                    document.body.style.opacity = opacity/10
                    if (opacity == 10 || 
                        opacity == 0) out = !out
                }, 100)

                setTimeout(() => {
                    window.location.reload()
                }, 8000)
            }
            deleterLi.appendChild(deleter)
            ul.appendChild(deleterLi)
        }
    }

    const callback = (mutationList, observer) => {
        addDeleters()
    };
    const observer = new MutationObserver(callback)
    observer.observe(document.body, { childList: true, subtree: true })

    addDeleters()
}

initPostDeleter()

}

uiPosts()
