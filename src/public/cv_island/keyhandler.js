export class KeyHandler {
  constructor({ boundKey, callbacks }) {
    this.boundKey = boundKey
    this.callbacks = callbacks || {}
    this.singleUseCallbackNames = []
    this.isPressed = false
    this.isBound = false

    this.keyPressedHandler = this._keyPressedHandler.bind(this)
    this.keyReleasedHandler = this._keyReleasedHandler.bind(this)
    this.pageChangeHandler = this._pageChangeHandler.bind(this)

    this.bind()
  }

  _keyPressedHandler(event) {
    if (event.key === this.boundKey) {
      if (!this.isPressed) {
        this.isPressed = true
        this.doCallbacks()
      }
    }
  }

  _keyReleasedHandler(event) {
    if (event.key === this.boundKey) {
      this.isPressed = false
    }
  }

  _pageChangeHandler() {
    if (document.visibilityState !== "visible") {
      this.isPressed = false
    }
  }

  doCallbacks() {
    Object.entries(this.callbacks).forEach(([name, callback]) => {
      callback.callable()
      if (callback.singleUse) {
        this.removeCallback(name)
      }
    })
  }

  addCallback({ name, callback, singleUse = false }) {
    this.callbacks[name] = { callable: callback, singleUse }
  }

  removeCallback(name) {
    delete this.callbacks[name]
  }

  bind() {
    if (!this.isBound) {
      document.addEventListener("keydown", this.keyPressedHandler)
      document.addEventListener("keyup", this.keyReleasedHandler)
      document.addEventListener("visibilitychange", this.pageChangeHandler)
      this.isBound = true
    }
  }

  unbind() {
    if (this.isBound) {
      document.removeEventListener("keydown", this.keyPressedHandler)
      document.removeEventListener("keyup", this.keyReleasedHandler)
      document.removeEventListener("visibilitychange", this.pageChangeHandler)
      this.isBound = false
    }
  }
}
