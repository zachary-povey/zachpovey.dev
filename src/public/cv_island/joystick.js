let directionKeyMap = {
  Right: "Right",
  ArrowRight: "Right",
  Left: "Left",
  ArrowLeft: "Left",
  Up: "Up",
  ArrowUp: "Up",
  Down: "Down",
  ArrowDown: "Down",
}

export class Joystick {
  constructor() {
    this.directionsPressed = []
    ;["keydown", "touchstart"].forEach((eventType) => {
      document.addEventListener(
        eventType,
        this.keyPressedHandler.bind(this),
        false
      )
    })
    ;["keyup", "touchend"].forEach((eventType) => {
      document.addEventListener(
        eventType,
        this.keyReleasedHandler.bind(this),
        false
      )
    })
  }

  get directionPressed() {
    if (this.directionsPressed) {
      return this.directionsPressed[0]
    } else {
      return null
    }
  }

  keyPressedHandler(e) {
    const direction = this.getDirection(e)
    if (!this.directionsPressed.includes(direction)) {
      this.directionsPressed = [direction, ...this.directionsPressed]
    }
  }

  keyReleasedHandler(e) {
    const direction = this.getDirection(e)
    const index = this.directionsPressed.indexOf(direction)
    if (index > -1) {
      this.directionsPressed.splice(index, 1)
    }
  }

  getDirection(e) {
    if (e.touches) {
      return this.mapTouchToDirection(e.changedTouches[0])
    } else {
      return directionKeyMap[e.key]
    }
  }

  mapTouchToDirection(touch) {
    const clientWidth = document.documentElement.clientWidth
    const clientHeight = document.documentElement.clientHeight
    const centrePoint = {
      x: clientWidth * 0.5,
      y: clientHeight * 0.4,
    }
    const delta = {
      x: touch.pageX - centrePoint.x,
      y: touch.pageY - centrePoint.y,
    }
    if (Math.abs(delta.y) >= Math.abs(delta.x)) {
      if (Math.sign(delta.y) >= 0) {
        return "Down"
      } else {
        return "Up"
      }
    } else {
      if (Math.sign(delta.x) >= 0) {
        return "Right"
      } else {
        return "Left"
      }
    }
  }
}
