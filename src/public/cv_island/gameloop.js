import { KeyHandler } from "./keyhandler.js"
import { loadConfig } from "./config.js"
import { CutsceneManager } from "./cutscenemanager.js"
import { Joystick } from "./joystick.js"
import { SpeedFactorCalculator } from "./util.js"

export async function startGameLoop({ context, gameContainer }) {
  const { map, characterControllers, openingCutscene, menuCutscene } =
    await loadConfig("./cv_island/config/cv_island.json")

  const custsceneManager = new CutsceneManager(characterControllers)

  const joystick = new Joystick()

  const actionButton = new KeyHandler({
    boundKey: "x",
    callbacks: {
      playCutscene: {
        callable: () => {
          custsceneManager.tryToPlayCutscene()
        },
      },
    },
  })

  const startButton = new KeyHandler({
    boundKey: "s",
    callbacks: {
      openStartMenu: {
        callable: () => {
          custsceneManager.startCutscene(menuCutscene)
        },
      },
    },
  })

  custsceneManager.startCutscene(openingCutscene)

  const step = () => {
    // Clear off the canvas
    context.fillStyle = "#639bff"
    context.fillRect(0, 0, context.canvas.width, context.canvas.height)

    // Update game state
    if (custsceneManager.isPlayingACutscene) {
      custsceneManager.incrementCutscene({
        gameContainer,
        map,
        ui: { joystick, actionButton, startButton },
      })
    } else {
      Object.values(characterControllers).forEach((controller) => {
        controller.update({ map, directionPressed: joystick.directionPressed })
      })
    }

    // Draw
    map.draw(context, characterControllers.player)

    requestAnimationFrame(step)
  }

  const speedFactorCalculator = SpeedFactorCalculator()
  const init = (timestamp) => {
    const speedFactor = speedFactorCalculator(timestamp)
    if (speedFactor === null) {
      requestAnimationFrame(init)
      return
    }
    Object.entries(characterControllers).forEach(([_, character]) => {
      character.character.speed = character.character.speed * speedFactor
    })
    requestAnimationFrame(step)
  }

  init()
}
