// Vite plugin that Slidev loads when this addon is listed in `addons`.
// It exposes the audience filter state to the presenter nav control and,
// in dev mode, switches the audience at runtime via the Vite HMR channel.
import {defineVitePluginsSetup} from '@slidev/types'
import {getAudienceFilterState} from '../index.ts'

const VIRTUAL_ID = 'virtual:audience-filter'
const RESOLVED_VIRTUAL_ID = `\0${VIRTUAL_ID}`

export default defineVitePluginsSetup(options => [
  {
    name: 'slidev-addon-audience-filter',
    resolveId(id) {
      return id === VIRTUAL_ID ? RESOLVED_VIRTUAL_ID : undefined
    },
    load(id) {
      return id === RESOLVED_VIRTUAL_ID
        ? `export default ${JSON.stringify(getAudienceFilterState())}`
        : undefined
    },
    configureServer(server) {
      server.ws.on('audience-filter:get', (_data, client) => {
        client.send('audience-filter:state', getAudienceFilterState())
      })

      server.ws.on('audience-filter:set', (data: {audience?: unknown}) => {
        const audience = data?.audience
        if (typeof audience !== 'string' || !getAudienceFilterState().options.includes(audience)) {
          return
        }

        // The preparser reads AUDIENCE on every parse, so re-parsing the
        // entry applies the new audience. Slidev then reloads all clients.
        process.env.AUDIENCE = audience
        server.watcher.emit('change', options.entry)
        server.ws.send('audience-filter:state', getAudienceFilterState())
      })
    },
  },
])
