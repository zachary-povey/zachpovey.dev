export class Set {
  constructor(values) {
    this._data = {}
    this._values = []

    values = values ?? []
    values.forEach((value) => {
      this.push(value)
    })
  }

  push(value) {
    this._values.push(value)
    const key = btoa(JSON.stringify(value))
    this._data[key] = true
  }

  contains(value) {
    const key = btoa(JSON.stringify(value))
    return Boolean(this._data[key])
  }
}
