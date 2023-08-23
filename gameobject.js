import { sleep } from "./util.js"
export class GameObject {
  constructor({
    imagePath,
    scale = 1,
    position = { x: 0, y: 0 },
    onload = () => {},
  }) {
    this.position = position
    this.hasLoaded = false
    this.image = new Image()
    this.image.style.imageRendering = "pixelated"
    this.image.onload = async () => {
      this.width = this.image.naturalWidth * scale
      this.height = this.image.naturalHeight * scale
      this.canvas = document.createElement("canvas")
      this.canvas.width = this.width
      this.canvas.height = this.height
      this.canvas
        .getContext("2d")
        .drawImage(
          this.image,
          0,
          0,
          this.image.naturalWidth,
          this.image.naturalHeight,
          0,
          0,
          this.width,
          this.height
        )
      onload()
      this.hasLoaded = true
    }
    this.image.src = imagePath
    this.scale = scale
  }

  draw(context, focussedObject, frame = null) {
    if (this.hasLoaded) {
      if (frame) {
        this.width = frame.width * this.scale
        this.height = frame.height * this.scale
      }

      const transformedPosition = this.getTransformedPosition(
        context,
        focussedObject
      )

      if (frame) {
        context.drawImage(
          this.canvas,
          frame.topLeftX * this.scale,
          frame.topLeftY * this.scale,
          this.width,
          this.height,
          Math.round(transformedPosition.x),
          Math.round(transformedPosition.y),
          this.width,
          this.height
        )
      } else {
        context.drawImage(
          this.canvas,
          Math.round(transformedPosition.x),
          Math.round(transformedPosition.y)
        )
      }
    }
  }

  getTransformedPosition(context, focussedObject) {
    const topLeft = {
      x: this.position.x - this.width / 2,
      y: this.position.y - this.height,
    }

    const deltaX = focussedObject.position.x - context.canvas.width / 2
    const deltaY = focussedObject.position.y - context.canvas.height / 2

    return {
      x: topLeft.x - deltaX,
      y: topLeft.y - deltaY,
    }
  }

  async load() {
    while (!this.hasLoaded) {
      await sleep(100)
    }
  }
}
