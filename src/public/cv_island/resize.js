export function resize(gameContainer, canvas) {
  let gameHeight = document.documentElement.clientHeight
  let gameWidth = document.documentElement.clientWidth
  gameContainer.style.width = gameWidth + "px"
  gameContainer.style.height = gameHeight + "px"

  canvas.width = gameWidth
  canvas.height = gameHeight

  var r = document.querySelector(":root")
  r.style.setProperty("--font-size", "clamp(12px, 4vw, 48px)")
}
