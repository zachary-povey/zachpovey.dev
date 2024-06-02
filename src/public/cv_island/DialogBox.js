export class DialogBox {
  constructor(textStatements) {
    textStatements =
      typeof textStatements === "string" ? [{ statement: textStatements }] : textStatements
    if (!(textStatements.length > 0)) {
      throw new Error("Dialog box needs at least one text statement!")
    }

    this.statements = textStatements.map((text) => {
      return new Statement(text.statement, text.autoContinue ?? false)
    })
    this.statementIndex = null
    this.container = null
    this.parentElement = null
    this.terminationButton = null
    this.isActive = false
  }

  activate({ parentElement, terminationButton }) {
    window.dispatchEvent(new CustomEvent("hideOverlay"))
    this.parentElement = parentElement
    this.terminationButton = terminationButton

    this.container = document.createElement("div")
    this.container.classList.add("dialog-box")

    parentElement.appendChild(this.container)

    this.statements[0].activate({
      parentElement: this.container,
      onCompletion: this.continueOrFinish.bind(this),
      terminationButton,
    })
    this.statementIndex = 0

    this.isActive = true
  }

  continueOrFinish() {
    if (this.statementIndex + 1 >= this.statements.length) {
      this.deactivate()
    } else {
      this.statementIndex += 1
      this.statements[this.statementIndex].activate({
        parentElement: this.container,
        terminationButton: this.terminationButton,
        onCompletion: this.continueOrFinish.bind(this),
      })
    }
  }

  deactivate() {
    this.container.remove()
    this.isActive = false
  }

  static load({ text, terminationButton, parentElement }) {
    const box = new DialogBox(text)
    box.activate({ parentElement, terminationButton })
    return box
  }
}
class Statement {
  constructor(statement, autoContinue) {
    this.text = statement
    this.autoContinue = autoContinue

    this.charactersRevealed = 0

    this.paragraph = null
    this.button = null
    this.revealTimeout = null

    this.revealDelayMs = 60
    this.terminationButton = null

    this.onCompletion = null
  }

  get isFullyRevealed() {
    return this.charactersRevealed === this.text.length
  }

  activate({ parentElement, terminationButton, onCompletion }) {
    this.onCompletion = onCompletion

    this.paragraph = document.createElement("p")
    this.paragraph.classList.add("dialog-box-p")
    parentElement.appendChild(this.paragraph)

    if (!this.autoContinue) {
      this.button = document.createElement("button")
      this.button.classList.add("dialog-box-button")
      parentElement.appendChild(this.button)

      this.button.addEventListener("click", () => {
        this.deactivate()
      })
    }

    terminationButton.addCallback({
      name: "skipToDialogEnd",
      singleUse: true,
      callback: () => {
        terminationButton.addCallback({
          name: "closeDialog",
          singleUse: true,
          callback: () => {
            this.deactivate()
          },
        })
        this.revealAll()
      },
    })
    this.terminationButton = terminationButton

    this.startRevealing()
  }

  startRevealing() {
    if (!this.paragraph) {
      throw new Error("Can't start dialog reveal, not yet activated!")
    }
    let characterRevealed
    while (true) {
      characterRevealed = this.text[this.charactersRevealed]
      this.charactersRevealed += 1
      this.paragraph.innerHTML = this.text.slice(0, this.charactersRevealed)
      if (characterRevealed != " ") {
        break
      }
    }

    if (!this.isFullyRevealed) {
      this.revealTimeout = setTimeout(
        this.startRevealing.bind(this),
        this.revealDelayMs
      )
    } else if (this.autoContinue) {
      this.deactivate()
    }
    else {
      this.terminationButton.removeCallback("skipToDialogEnd")
      this.terminationButton.addCallback({
        name: "closeDialog",
        singleUse: true,
        callback: () => {
          this.deactivate()
        },
      })
    }
  }

  revealAll() {
    clearTimeout(this.revealTimeout)
    this.paragraph.innerHTML = this.text
    if (this.autoContinue) {
      this.deactivate()
    }
  }

  deactivate() {
    if (this.button) {
      this.button.style = '--image: url("../cv_island/artwork/images/ui/tick_pushed.png")'
    }
    this.terminationButton.removeCallback("skipToDialogEnd")
    this.terminationButton.removeCallback("closeDialog")
    setTimeout(() => {
      this.paragraph.remove()
      if (this.button) {
        this.button.remove()
      }
      this.onCompletion()
    }, this.autoContinue ? 500 : 100)

  }
}
