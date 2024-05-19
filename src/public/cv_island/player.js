import { Character } from "./character.js"

export class Player {
  constructor(character) {
    this.character = character
    this.name = "player"
  }

  static async loadFromFile({
    dataFilepath,
    imageFilepath,
    position,
    stepSize,
  }) {
    const character = await Character.loadFromFile({
      dataFilepath,
      imageFilepath,
      position,
      stepSize,
    })
    return new Player(character)
  }

  get position() {
    return this.character.position
  }

  set position(newPosition) {
    this.character.position = newPosition
  }

  update({ map, directionPressed, wrapItUp }) {
    this.character.update()

    if (directionPressed && !this.character.isStepping & !wrapItUp) {
      this.character.tryToStep({ direction: directionPressed, map })
    }
  }
}
