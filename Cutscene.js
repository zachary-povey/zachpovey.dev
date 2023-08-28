import { DialogBox } from "./DialogBox.js"
import { Menu } from "./Menu.js"

export class Cutscene {
  constructor(stages) {
    this.stages = stages
    this.currentStageIndex = 0
    this.currentCharacter = null
    this.currentDialogBox = null
    this.currentMenu = null

    this.walkingState = {
      current: null,
      queue: [], // [{"Down", 1}, {"Right", 2}]
    }
  }

  get currentStage() {
    return this.stages[this.currentStageIndex]
  }

  update(
    options = {
      gameContainer,
      map,
      ui: { joystick, actionButton, startButton },
    }
  ) {
    let stageFinished = false
    switch (this.currentStage.type) {
      case "menu": {
        stageFinished = this.updateMenu({
          ...options,
          menu: this.currentStage.menu,
        })
        break
      }
      case "dialog": {
        stageFinished = this.updateDialog(options)
        break
      }
      case "character": {
        stageFinished = this.updateCharacter(options)
        break
      }
      default: {
        throw new Error(`Unrecognised stage type: ${this.currentStage.type}`)
      }
    }

    if (stageFinished) {
      this.currentStageIndex += 1
    }

    const isFinished = !this.currentStage

    if (isFinished) {
      this.currentStageIndex = 0
      this.currentCharacter = null
      this.currentDialogBox = null
      window.dispatchEvent(new CustomEvent("unhideOverlay"))
      return true
    }

    return false
  }

  updateMenu({
    menu,
    gameContainer,
    map,
    ui: { joystick, actionButton, startButton },
  }) {
    if (!this.currentMenu) {
      this.currentMenu = menu
      this.currentMenu.activate({
        parentElement: gameContainer,
        actionButton,
        closeButton: startButton,
      })
    }
    if (this.currentMenu.isActive) {
      return false
    } else {
      this.currentMenu = null
      return true
    }
  }

  updateDialog({ gameContainer, map, ui: { joystick, actionButton } }) {
    if (!this.currentDialogBox) {
      this.currentDialogBox = DialogBox.load({
        text: this.currentStage.text,
        terminationButton: actionButton,
        parentElement: gameContainer,
      })
    }
    const isActive = this.currentDialogBox.isActive
    if (isActive) {
      return false
    } else {
      this.currentDialogBox = null
      return true
    }
  }

  updateCharacter({ gameContainer, map, ui: { joystick, actionButton } }) {
    if (!this.currentCharacter) {
      this.currentCharacter = map.characters[this.currentStage.name]
    }

    switch (this.currentStage.action) {
      case "turn": {
        return this.turn(map)
      }
      case "walk": {
        return this.walk(map)
      }
      default: {
        throw new Error(
          `Unknown character action type '${this.currentStage.action}'`
        )
      }
    }
  }

  turn(map) {
    let direction
    if (this.currentStage.direction.startsWith("to-")) {
      const [_, characterNameToTurnTo] = this.currentStage.direction.split("-")
      const characterToTurnTo = map.characters[characterNameToTurnTo]
      direction = this.getDirectionBetweenCharacters({
        fromCharacter: this.currentCharacter,
        toCharacter: characterToTurnTo,
      })
    } else {
      direction = this.currentStage.direction
    }
    this.currentCharacter.turn(direction)
    return true
  }

  walk(map) {
    if (this.walkingState.current === null) {
      this.setupWalkQueue(map)
    }
    return this.continueWalking(map)
  }

  setupWalkQueue(map) {
    if (this.currentStage.direction.startsWith("to-")) {
      const [_, characterNameToWalkTo] = this.currentStage.direction.split("-")
      const characterToWalkTo = map.characters[characterNameToWalkTo]
      const startCell = this.currentCharacter.cell()
      const endCell = characterToWalkTo.getNextCell()
      const path = {
        nx: endCell.nx - startCell.nx,
        ny: endCell.ny - startCell.ny,
      }
      const queue = []
      if (path.nx) {
        const direction = path.nx > 0 ? "Right" : "Left"
        queue.push({ direction, steps: Math.abs(path.nx) })
      }
      if (path.ny) {
        const direction = path.ny > 0 ? "Down" : "Up"
        queue.push({ direction, steps: Math.abs(path.ny) })
      }
      this.walkingState = {
        current: queue[0],
        queue: queue.slice(1),
      }
    } else {
      const direction = this.currentStage.direction
      this.walkingState = {
        current: {
          direction,
          steps: 1,
        },
        queue: [],
      }
    }
  }

  continueWalking(map) {
    const character = this.currentCharacter
    character.update()

    if (
      !character.isStepping &&
      this.walkingState.current.isFinished &&
      this.walkingState.queue.length === 0
    ) {
      this.walkingState.current = null
      return true
    }

    if (!character.isStepping) {
      if (this.walkingState.current.isFinished) {
        ;[this.walkingState.current] = this.walkingState.queue.splice(0, 1)
      }
      const canStep = character.tryToStep({
        direction: this.walkingState.current.direction,
        map,
      })
      if (!canStep) {
        throw new Error(
          "Cutscene caused me to try and walk into a wall - no prep for this!"
        )
      }

      this.walkingState.current.steps -= 1

      if (this.walkingState.current.steps === 0) {
        this.walkingState.current.isFinished = true
      }
    }

    return false
  }

  getDirectionBetweenCharacters({ fromCharacter, toCharacter }) {
    const fromCell = fromCharacter.cell()
    const toCell = toCharacter.cell()
    const nxDiff = toCell.nx - fromCell.nx
    const nyDiff = toCell.ny - fromCell.ny
    let direction
    if (nxDiff === 0 && nyDiff !== 0) {
      direction = nyDiff > 0 ? "Down" : "Up"
    } else if (nxDiff !== 0 && nyDiff === 0) {
      direction = nxDiff > 0 ? "Right" : "Left"
    } else {
      throw new Error(
        "Unable to work out the direction - are you on a diagonal?"
      )
    }
    return direction
  }
}
