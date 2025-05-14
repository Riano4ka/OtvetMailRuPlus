const browserName = navigator.userAgent.includes('Firefox') ? 'firefox' : 'chrome'
document.getElementById(browserName).style.display = 'block'