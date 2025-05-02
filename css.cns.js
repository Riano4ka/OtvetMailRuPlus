const cssConscript = async () => {
  let blockAds = await fstore.get('cfg-block-ads')
  if (blockAds === false) return

  const style = document.createElement('style');
  style.type = 'text/css';
  style.innerHTML = '.adv-slot-wrapper { display: none !important; } .ph-project-promo-container { display: none !important; } div.FDBh3 { display: none !important; }'
  let retries = 10
  const tryAppend = () => {
    console.log('Firefox tries')
    const head = document.head
    if (!head && retries-- > 0) setTimeout(tryAppend, 1); else {
      head.appendChild(style);
      console.log('Firefox crash')
    }
  }
  tryAppend()
}

cssConscript()