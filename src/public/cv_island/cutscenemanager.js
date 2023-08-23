export class CutsceneManager {
  constructor(characterControllers) {
    this.characterControllers = characterControllers
    this.cutsceneState = {
      cutscene: null,
      stageIndex: null,
      hasStarted: false,
    }
  }

  get isPlayingACutscene() {
    return Boolean(this.cutsceneState.cutscene)
  }

  tryToPlayCutscene() {
    if (this.isPlayingACutscene) {
      return
    }

    const cellInfrontOfPlayer =
      this.characterControllers.player.character.getNextCell()
    const npcsInfrontOfPlayer = Object.values(this.characterControllers).filter(
      (controller) => {
        const characterCell = controller.character.cell()
        return (
          characterCell.nx == cellInfrontOfPlayer.nx &&
          characterCell.ny == cellInfrontOfPlayer.ny
        )
      }
    )

    switch (npcsInfrontOfPlayer.length) {
      case 0: {
        return // no cutscene to play
      }
      case 1: {
        const npcInfrontOfPlayer = npcsInfrontOfPlayer[0]
        if (npcInfrontOfPlayer.cutscene) {
          this.startCutscene(npcInfrontOfPlayer.cutscene)
        }
        break
      }
      default: {
        throw new Error(
          "Multiple characters in the cell infront of player, shouldn't be possible!"
        )
      }
    }
  }

  startCutscene(cutscene) {
    if (this.isPlayingACutscene) {
      console.warn("Trying to play a cutscene when another is already playing")
    } else {
      this.cutsceneState = {
        cutscene,
        stageIndex: 0,
        hasStarted: false,
      }
    }
  }

  incrementCutscene({
    gameContainer,
    map,
    ui: { joystick, actionButton, startButton },
  }) {
    if (!this.cutsceneState.hasStarted) {
      const charactersHaveFinishedWalking =
        this._waitForCharactersToFinishWalking(map)
      this.cutsceneState.hasStarted = charactersHaveFinishedWalking
    } else {
      const cutsceneFinished = this.cutsceneState.cutscene.update({
        gameContainer,
        map,
        ui: { joystick, actionButton, startButton },
      })
      if (cutsceneFinished) {
        this.cutsceneState = {
          cutscene: null,
          stageIndex: null,
          hasStarted: false,
        }
      }
    }
  }

  _waitForCharactersToFinishWalking(map) {
    const walkingCharacterControllers = Object.values(
      this.characterControllers
    ).filter((controller) => controller.character.isWalking)
    if (walkingCharacterControllers.length === 0) {
      return true
    } else {
      walkingCharacterControllers.forEach((controller) => {
        controller.update({
          map,
          directionPressed: null,
          wrapItUp: true,
        })
      })
      return false
    }
  }
}
