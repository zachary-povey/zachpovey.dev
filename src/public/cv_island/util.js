export function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

function sum(numbers) {
  return numbers.reduce((a, b) => a + b, 0)
}

export function SpeedFactorCalculator() {
  const timeDiffs = []
  const framesToAverageOver = 10
  let frameCount = 0
  let lastTimestamp = null
  let factor = null

  const calculator = (timestamp) => {
    if (factor !== null) {
      return factor
    } else if (!timestamp) {
      return null
    } else if (!lastTimestamp) {
      lastTimestamp = timestamp
      return null
    }
    const timeDiffMs = timestamp - lastTimestamp
    timeDiffs.push(timeDiffMs)
    lastTimestamp = timestamp
    frameCount += 1

    if (frameCount >= framesToAverageOver) {
      const averageTimeDiff = sum(timeDiffs) / timeDiffs.length
      // So for a refresh rate of 120 fps factor = 1, for 60 fps factor = 2, etc
      factor = Math.round((averageTimeDiff * 120) / 1000)
    }

    return null
  }

  return calculator
}
