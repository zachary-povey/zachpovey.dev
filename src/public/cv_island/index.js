
import { startGameLoop } from "./gameloop.js"
import { resize } from "./resize.js"

const gameContainer = document.getElementById("game-container")
const canvas = document.getElementById("game-canvas")
const overlay = document.getElementById("overlay")

const context = canvas.getContext("2d", {
  alpha: false,
})

window.addEventListener("resize", () => {
  resize(gameContainer, canvas)
})
window.addEventListener("hideOverlay", () => {
  overlay.classList.add("invisible")
})
window.addEventListener("unhideOverlay", () => {
  overlay.classList.remove("invisible")
})

resize(gameContainer, canvas)
await startGameLoop({
  context,
  gameContainer,
})