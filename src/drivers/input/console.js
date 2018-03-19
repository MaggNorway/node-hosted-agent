import { EventEmitter } from 'events'

export default class Console extends EventEmitter {
  constructor (api) {
    super()
    this.api = api
  }

  async start (config = {}) {
    this.config = config
    await this.api.socket.connect()
    console.log('Connected')
    await this.api.socket.subscribe('console')
    console.log('Subscribed')
    this.api.socket.on('console', e => this.handleConsole(e))
  }

  async stop () {
    this.api.socket.removeAllListeners('console')
    await this.api.socket.unsubscribe('console')
  }

  handleConsole ({ data: { shard = 'shard0', messages: { log = [] } = {} } = {} } = {}) {
    if (this.config.shard && shard !== this.config.shard) return
    log
      .filter(l => l.startsWith('STATS'))
      .map(log => log.slice(6).replace(/;/g, '\n'))
      .forEach(stats => this.emit('stats', stats))
  }
}
