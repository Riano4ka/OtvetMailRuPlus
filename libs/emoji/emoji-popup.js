class EmojiPopup {
    constructor() {
      this.popupId = 'rn-emoji-picker-' + Math.random()
    }

    _onEmojiSelect = (em) => {
      this.hideEmoji()

      if (this.emojiSelect) {
        this.emojiSelect(em)
      }        
    }

    clickOutside = e => {
      let target = e.target
      do {
        if (target.id === this.popupId) return
      } while (target = target.parentNode)
      this.hideEmoji()
    }

    popupEmoji = (target) => {
      if (this.popup) return

      const btnRect = target.getBoundingClientRect()
      const rect = {
        x: window.scrollX + btnRect.x,
        y: window.scrollY + btnRect.y,
        width: btnRect.width,
        height: btnRect.height,
      }

      this.picker = new EmojiMart.Picker({
        onEmojiSelect: this._onEmojiSelect,
        i18n: _emojiRu,
        data: _emojiData,
        autoFocus: true,
      })

      const popup = document.createElement('div')
      popup.id = this.popupId
      popup.appendChild(this.picker)
      popup.style = "z-index: 10000; position: absolute;";
      popup.style.left = rect.x + 'px';
      popup.style.top = rect.y + 'px';
      document.body.appendChild(popup)
      this.popup = popup

      setTimeout(() => {
        const popRect = popup.getBoundingClientRect()
        const posTop = btnRect.y - popRect.height
        popup.style.top = (posTop >= 0 ? (rect.y - popRect.height) : (rect.y + rect.height)) + 'px';
        if ((rect.x + popRect.width) > window.innerWidth) {
          popup.style.left = (rect.x + rect.width - popRect.width) + 'px'
        }

        document.addEventListener('click', this.clickOutside)
      }, 1)
    }

    shownEmoji = () => {
      return !!this.popup
    }

    hideEmoji = () => {
      if (this.popup) this.popup.parentNode.removeChild(this.popup)
      document.removeEventListener('click', this.clickOutside)
      this.popup = null
    }

    toggleEmoji = (target) => {
      if (this.shownEmoji()) {
        this.hideEmoji(target)
        return
      }
      this.popupEmoji(target)
    }
}

customElements.define('em-picker', EmojiMart.Picker) 

window.EmojiPopup = EmojiPopup
