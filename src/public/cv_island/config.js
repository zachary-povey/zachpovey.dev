import { Map } from "./map.js"
import { NonPlayer } from "./nonplayer.js"
import { Player } from "./player.js"
import { Cutscene } from "./Cutscene.js"
import { Menu } from "./Menu.js"
import { createContactForm } from "./contactform.js"

export async function loadConfig(configFilepath) {
  const config = await fetch(configFilepath).then((value) => value.json())
  const map = await Map.loadFromFile(config.map)

  const menu = new Menu({
    options: [
      {
        name: "gotToSourceCode",
        text: "View source code",
        callback: () => {
          window.open(config.menu.sourceCodeUrl, "_blank").focus()
        },
      },
      {
        name: "contact",
        text: "Contact Zach",
        callback: createContactForm
      }
    ],
    exit: { enabled: true, text: "Explore!" },
    cssClass: "menu",
  })

  const appendMenu = (step) => {
    if (step.type == "menu") {
      step.menu = menu
    }
    return step
  }

  const player = await Player.loadFromFile({
    dataFilepath: config.player.dataFilepath,
    imageFilepath: config.player.imageFilepath,
    position: map.positionForCell(config.player.startingCell),
    stepSize: map.squareSize,
  })

  const npcs = await Promise.all(
    config.npcs.map((npc) =>
      NonPlayer.loadFromFile({
        dataFilepath: npc.dataFilepath,
        imageFilepath: npc.imageFilepath,
        position: map.positionForCell(npc.startingCell),
        stepSize: map.squareSize,
        behaviourLoop: npc.behaviourLoop,
        cutscene: new Cutscene(npc.cutscene.map(appendMenu)),
        name: npc.name,
      })
    )
  )

  const characterControllers = {
    player,
    ...Object.fromEntries(npcs.map((npc) => [npc.name, npc])),
  }
  const characters = Object.fromEntries(
    Object.entries(characterControllers).map(([name, controller]) => {
      return [name, controller.character]
    })
  )
  map.mount(characters)


  const openingCutscene = new Cutscene(config.openingCutscene.map(appendMenu))

  const menuCutscene = new Cutscene([
    {
      type: "menu",
      menu,
    },
  ])

  return {
    map,
    characterControllers,
    openingCutscene,
    menuCutscene,
  }
}
