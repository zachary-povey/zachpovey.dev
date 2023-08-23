import { Character } from "./character.js"

export class NonPlayer {
  constructor({ name, character, behaviourLoop, cutscene }) {
    this.name = name
    this.character = character
    this.behaviourLoop = behaviourLoop
    this.behaviourIndex = 0
    this.cutscene = cutscene
  }

  static async loadFromFile({
    dataFilepath,
    imageFilepath,
    position,
    stepSize,
    behaviourLoop,
    cutscene,
    name,
  }) {
    const character = await Character.loadFromFile({
      dataFilepath,
      imageFilepath,
      position,
      stepSize,
    })
    return new NonPlayer({ name, character, behaviourLoop, cutscene })
  }

  get position() {
    return this.character.position
  }

  set position(newPosition) {
    this.character.position = newPosition
  }

  get currentBehaviour() {
    return this.behaviourLoop[this.behaviourIndex]
  }

  update({ map, wrapItUp }) {
    this.character.update()
    if (wrapItUp) {
      return
    }

    switch (this.currentBehaviour.type) {
      case "step": {
        this.tryToStep(map)
        break
      }
      case "idle": {
        this.tryToIdle()
        break
      }
      default: {
        throw new Error(`unknown behaviour type: ${this.currentBehaviour.type}`)
      }
    }
  }

  tryToStep(map) {
    if (!this.character.isStepping) {
      const couldStep = this.character.tryToStep({
        direction: this.currentBehaviour.direction,
        map,
      })
      if (couldStep) {
        this.incrementBehaviour()
      }
    }
  }

  tryToIdle() {
    if (!this.character.isStepping && !this.isIdling) {
      this.isIdling = true
      this.character.turn(this.currentBehaviour.direction)
      const timeInMs = this.currentBehaviour.time * 1000
      setTimeout(() => {
        this.incrementBehaviour()
        this.isIdling = false
      }, timeInMs)
    }
  }

  incrementBehaviour() {
    this.behaviourIndex = (this.behaviourIndex + 1) % this.behaviourLoop.length
  }

  draw(context, cameraFocus) {
    this.character.draw(context, cameraFocus)
  }
}
