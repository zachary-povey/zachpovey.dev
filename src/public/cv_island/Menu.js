import { KeyHandler } from "./keyhandler.js"

export class Menu {
  constructor({ options, exit, cssClass }) {
    this.options = options
    if (exit?.enabled) {
      this.options = [
        ...this.options,
        {
          name: "exit",
          text: exit.text ? exit.text : "Exit Menu",
          callback: () => {
            this.deactivate()
          },
        },
      ]
    }

    this.cssClass = cssClass

    this.container = null
    this.actionButton = null
    this.upHandler = null
    this.downHandler = null
    this.buttons = null

    this.selectedOptionIndex = null
    this.isActive = false
  }

  static load({ parentElement, actionButton, closeButton, options }) {
    const menu = new Menu({ options })
    menu.activate({ parentElement, actionButton, closeButton })
    return menu
  }

  activate(options) {
    this.parentElement = options?.parentElement ?? this.parentElement
    this.actionButton = options?.actionButton ?? this.actionButton
    this.closeButton = options?.closeButton ?? this.closeButton

    window.dispatchEvent(new CustomEvent("hideOverlay"))

    if (this.closeButton) {
      this.closeButton.bind()
      this.closeButton.addCallback({
        name: "exitMenu",
        callback: () => {
          this.deactivate()
        },
      })
    }

    this.container = document.createElement("div")
    if (this.cssClass) {
      this.container.classList.add(this.cssClass)
    }

    this.parentElement.appendChild(this.container)

    this.buttons = this.options.map((option, index) => {
      return this.makeOptionButton({ option, index })
    })

    const maxButtonWidth = Math.max(...this.buttons.map((b) => b.offsetWidth))

    this.buttons.forEach((b) => (b.style.width = `${maxButtonWidth * 1.1}px`))

    this.upHandler = new KeyHandler({
      boundKey: "ArrowUp",
      callbacks: {
        menuUp: {
          callable: () => {
            this.moveSelectedOption("up")
          },
        },
      },
    })

    this.downHandler = new KeyHandler({
      boundKey: "ArrowDown",
      callbacks: {
        menuDown: {
          callable: () => {
            this.moveSelectedOption("down")
          },
        },
      },
    })

    this.selectedOptionIndex = 0
    this.focusButton()

    this.isActive = true
  }

  deactivate() {
    window.dispatchEvent(new CustomEvent("unhideOverlay"))
    this.removeActionButtonCallbacks()
    this.upHandler.unbind()
    this.downHandler.unbind()
    this.container.remove()
    this.isActive = false
  }

  hide() {
    this.closeButton.unbind()
    this.removeActionButtonCallbacks()
    this.upHandler.unbind()
    this.downHandler.unbind()
    this.container.remove()
  }

  makeOptionButton({ option, index }) {
    const button = document.createElement("button")
    button.classList.add("menu-button")
    button.style.justifyContent = "center"
    button.innerHTML = option.text
    this.container.appendChild(button)

    button.addEventListener("click", () => option.callback(this))

    button.addEventListener("mouseenter", () => {
      this.selectedOptionIndex = index
      this.focusButton()
    })

    return button
  }

  moveSelectedOption(direction) {
    switch (direction) {
      case "up": {
        this.selectedOptionIndex = Math.max(this.selectedOptionIndex - 1, 0)
        break
      }
      case "down": {
        this.selectedOptionIndex = Math.min(
          this.selectedOptionIndex + 1,
          this.options.length - 1
        )
        break
      }
      default: {
        throw new Error(`Unknown direction: ${direction}`)
      }
    }

    this.focusButton()
  }

  focusButton() {
    // Focus on new button
    this.buttons[this.selectedOptionIndex].focus()

    // Change callback on action button
    this.removeActionButtonCallbacks()
    this.actionButton.addCallback({
      name: this.options[this.selectedOptionIndex].name,
      callback: () => this.options[this.selectedOptionIndex].callback(this),
    })
  }

  removeActionButtonCallbacks() {
    this.options.forEach(({ name }) => {
      this.actionButton.removeCallback(name)
    })
  }
}
