import { GameObject } from "./gameobject.js"
import { Set } from "./set.js"

let prevMapElementsToDraw = []
export class Map {
  constructor({
    background,
    nSquares,
    squareSize,
    mapElements,
    unwalkableCells,
  }) {
    this.background = background
    this.nSquares = nSquares
    this.squareSize = squareSize
    this.mapElements = mapElements
    this.unwalkableCells = unwalkableCells
    this.characters = {}

    this.mapElements.sort((a, b) => a.nyMax - b.nyMax)
  }

  static async loadFromFile(filepath) {
    const mapData = await fetch(filepath).then((value) => value.json())
    const background = new GameObject({
      imagePath: mapData.background.path,
      scale: mapData.background.scale,
    })
    const mapElements = []
    mapData.mapElements.forEach((element, index) => {
      const gameObject = new GameObject({
        imagePath: element.path,
        scale: element.scale,
      })
      mapElements.push({
        gameObject,
        draw: gameObject.draw.bind(gameObject),
        frame: element.frame,
        nyMin: element.nyMin,
        nyMax: element.nyMax,
        id: `${element.path}@${index}`,
      })
    })

    const unwalkableCells = new Set()
    mapData.unwalkableCells.forEach((value) => {
      if (value.extent) {
        for (let x = 0; x < value.extent.nx; x++) {
          for (let y = 0; y < value.extent.ny; y++) {
            unwalkableCells.push({
              nx: value.nx + x,
              ny: value.ny + y,
            })
          }
        }
      } else {
        unwalkableCells.push(value)
      }
    })

    await background.load()
    await Promise.all(mapElements.map((el) => el.gameObject.load()))

    const squareSize = background.width / mapData.nSquares.nx

    background.position = { x: background.width / 2, y: background.height }
    mapElements.forEach((element, index) => {
      const elementData = mapData.mapElements[index]
      if (elementData.cell) {
        throw new Error("I deperecated this to get rid of unwated bits!")
      } else {
        element.gameObject.position = background.position
      }
    })

    return new Map({
      background,
      nSquares: mapData.nSquares,
      squareSize,
      mapElements,
      unwalkableCells,
    })
  }

  draw(context, cameraFocus) {
    this.background.draw(context, cameraFocus)

    const charactersToDraw = Object.values(this.characters).map((character) => {
      return {
        nyMax: character.cell().ny,
        draw: character.draw.bind(character),
      }
    })

    const mapElementsToDraw = this.getElementsToDraw(
      charactersToDraw.map((character) => character.nyMax)
    )

    const thingsToDraw = [...charactersToDraw, ...mapElementsToDraw]
    thingsToDraw.sort((a, b) => a.nyMax - b.nyMax)

    thingsToDraw.forEach((thing) => {
      thing.draw(context, cameraFocus)
    })
  }

  getElementsToDraw(yPositions, existingElementsToDraw = []) {
    const idsSoFar = existingElementsToDraw.map((element) => element.id)
    const newElements = this.mapElements.filter((mapElement) =>
      yPositions.some(
        (ny) =>
          ny >= mapElement.nyMin &&
          ny <= mapElement.nyMax &&
          !idsSoFar.includes(mapElement.id)
      )
    )
    if (newElements.length > 0) {
      const childElements = this.getElementsToDraw(
        newElements.map((element) => element.nyMax),
        [...existingElementsToDraw, ...newElements]
      )
      newElements.push(...childElements)
    }

    return newElements
  }

  permitsWalkingAt(cell) {
    return !(
      this.unwalkableCells.contains(cell) ||
      Object.values(this.characters).some((character) => {
        const characterCell = character.cell()
        const characterTargetCell = character.targetCell()
        return (
          (characterCell.nx === cell.nx && characterCell.ny === cell.ny) ||
          (characterTargetCell.nx === cell.nx &&
            characterTargetCell.ny === cell.ny)
        )
      })
    )
  }

  positionForCell({ nx, ny }) {
    return Map.positionForSquares({ nx, ny, squareSize: this.squareSize })
  }

  static positionForSquares({ nx, ny, squareSize }) {
    return {
      x: Math.round(squareSize * nx + squareSize / 2),
      y: Math.round(squareSize * ny + (3 * squareSize) / 4),
    }
  }

  mount(characters) {
    Object.entries(characters).forEach(([name, character]) => {
      this.characters[name] = character
    })
  }
}
