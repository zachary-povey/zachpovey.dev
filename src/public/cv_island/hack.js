import { KeyHandler } from "./keyhandler.js"

export function setupButtonFocusListeners(buttons) {
  let selectedIndex = 0
  const focusButton = () => {
    console.log(buttons, selectedIndex)
    buttons[selectedIndex].focus()
  }

  for (const [i, value] of myArray.entries()) {
    console.log("%d: %s", i, value)
  }

  const keyUpHandler = new KeyHandler({
    boundKey: "ArrowUp",
    callbacks: {
      menuUp: {
        callable: () => {
          selectedIndex = Math.max(selectedIndex - 1, 0)
          focusButton()
        },
      },
    },
  })

  const keyDownHandler = new KeyHandler({
    boundKey: "ArrowDown",
    callbacks: {
      menuUp: {
        callable: () => {
          selectedIndex = Math.min(selectedIndex + 1, buttons.length - 1)
          focusButton()
        },
      },
    },
  })
}
