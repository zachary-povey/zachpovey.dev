import { GameObject } from "./gameobject.js"

let directionAxisMap = {
  Right: ["x", 1],
  Left: ["x", -1],
  Up: ["y", -1],
  Down: ["y", 1],
}
export class Character {
  constructor({ gameObject, animations, stepSize, speed, imagesPerStep }) {
    this.gameObject = gameObject
    this.animations = animations
    this.stepSize = stepSize
    this.imagesPerStep = imagesPerStep

    // _speed and framesPerImage set by speed setter
    this._speed = null
    this.framesPerImage = null
    this.speed = speed

    this.animationState = {
      name: "idleUp",
      frame: 0,
      progress: 0,
    }

    this.movementState = {
      orientation: "Up",
      stepping: false,
      distanceLeft: null,
      targetPosition: null,
    }
  }

  static async loadFromFile({
    dataFilepath,
    imageFilepath,
    position,
    stepSize,
  }) {
    let character
    await fetch(dataFilepath)
      .then((value) => value.json())
      .then(async (data) => {
        const gameObj = new GameObject({
          imagePath: imageFilepath,
          scale: data.scale,
          position: position,
        })
        await gameObj.load()
        character = new Character({
          gameObject: gameObj,
          animations: data.animations,
          stepSize: stepSize,
          speed: data.speed,
          imagesPerStep: data.imagesPerStep,
        })
      })

    return character
  }

  get speed() {
    return this._speed
  }

  set speed(newSpeed) {
    const framesPerStep = this.stepSize / newSpeed
    this.framesPerImage = framesPerStep / this.imagesPerStep
    this._speed = newSpeed
  }

  get position() {
    return this.gameObject.position
  }

  set position(newPosition) {
    this.gameObject.position = newPosition
  }

  get isStepping() {
    return this.movementState.stepping
  }

  get isWalking() {
    return this.animationState.name.toLowerCase().startsWith("walk")
  }

  get currentAnimation() {
    return this.animations[this.animationState.name]
  }

  get currentFrame() {
    return this.currentAnimation[this.animationState.frame]
  }

  cell() {
    return this._cellFor(this.position)
  }

  targetCell() {
    if (this.movementState.targetPosition) {
      return this._cellFor(this.movementState.targetPosition)
    } else {
      return this.cell()
    }
  }

  _cellFor(position) {
    return {
      nx: Math.floor(position.x / this.stepSize),
      ny: Math.floor(position.y / this.stepSize),
    }
  }

  tryToStep({ direction, map }) {
    const targetCell = this.getNextCell(direction)
    if (map.permitsWalkingAt(targetCell)) {
      this.setAnimation(`walk${direction}`)
      this.movementState = {
        orientation: direction,
        stepping: true,
        distanceLeft: this.stepSize,
        targetPosition: this.getTargetPosition(direction),
      }
      return true
    } else {
      this.setAnimation(`idle${direction}`)
      this.movementState = {
        orientation: direction,
        stepping: false,
        distanceLeft: null,
        targetPosition: null,
      }
      return false
    }
  }

  turn(direction) {
    this.setAnimation(`idle${direction}`)
    this.movementState = {
      orientation: direction,
      stepping: false,
      distanceLeft: null,
    }
  }

  getTargetPosition(direction) {
    const [axis, sign] = directionAxisMap[direction]
    const targetPosition = { ...this.position }
    targetPosition[axis] += this.stepSize * sign
    return targetPosition
  }

  getNextCell(direction) {
    direction = direction || this.movementState.orientation
    const [axis, sign] = directionAxisMap[direction]
    let nextCell = this.cell()
    nextCell[`n${axis}`] += sign * 1
    return nextCell
  }

  update() {
    this.updateAnimation()
    if (this.movementState.stepping) {
      this.incrementPosition()
      if (this.movementState.distanceLeft <= 0) {
        this.finishStep()
      }
    } else {
      this.setAnimation(`idle${this.movementState.orientation}`)
    }
  }

  finishStep() {
    this.position = this.movementState.targetPosition
    this.movementState = {
      orientation: this.movementState.orientation,
      stepping: false,
      distanceLeft: null,
      targetPosition: null,
    }
  }

  incrementPosition() {
    const [axis, sign] = directionAxisMap[this.movementState.orientation]
    this.position[axis] += sign * this.speed
    this.movementState.distanceLeft -= this.speed
  }

  updateAnimation() {
    if (this.animationState.progress >= this.framesPerImage) {
      const totalFrames = this.currentAnimation.length
      this.animationState.frame = (this.animationState.frame + 1) % totalFrames
      this.animationState.progress = 0
    }
    this.animationState.progress += 1
  }

  setAnimation(name) {
    if (!(name in this.animations)) {
      throw new Error(`Unknown animation: '${name}''`)
    } else if (name != this.animationState.name) {
      this.animationState = {
        name,
        frame: 0,
        progress: 0,
      }
    }
  }

  draw(context, cameraFocus) {
    this.gameObject.draw(context, cameraFocus, this.currentFrame)
  }
}
