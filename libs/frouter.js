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
  }
}
