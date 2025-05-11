var frouter = {
  define: async function(routeEnum, handler, opts = {}) {
    const checkRoute = async () => {
      for (const [route, checked] of Object.entries(routeEnum)) {
        let data
        try {
          data = await checked()
        } catch (err) {
          console.error('frouter enum:', err)
          continue
        }
        if (data) {
          try {
            await handler(route, data)
            break
          } catch (err) {
            console.error('frouter handler:', err)
          }
        }
      }

      setTimeout(() => {
        checkRoute()
      }, 500)
    }
    checkRoute()
  },

  // ponyfill for Navigation API
  addNavigateListener: async function(handler) {
    if (typeof(navigation) !== 'undefined' && navigation.addEventListener) { // 04.2025 - only Chrome
      navigation.addEventListener('navigate', handler)
      return { observer: null }
    } else {
      const body = await freiweb.waitForIt(() => document.body, 30000)
      let oldLocation = location.href
      const observer = new MutationObserver(async (mutations) => {
        if (location.href !== oldLocation) {
          oldLocation = location.href
          handler()
        }
      })
      observer.observe(body, { childList: true, subtree: true })
      return { observer }
    }
  }
}
