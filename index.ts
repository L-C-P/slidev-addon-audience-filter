import {definePreparserSetup} from '@slidev/types'

const BYPASS_AUDIENCE = 'bypass'

/**
 * Runtime state shared between the preparser and the Vite plugin.
 * Kept on `globalThis` because Slidev may load both setups as separate
 * module instances within the same Node process.
 */
interface AudienceFilterStore {
  headmatterAudience?: string
  knownAudiences: Set<string>
}

/**
 * Snapshot of the audience filter state that is sent to the client.
 */
export interface AudienceFilterState {
  active: string | null
  options: string[]
}

const STORE_KEY = Symbol.for('slidev-addon-audience-filter')

function getStore(): AudienceFilterStore {
  const target = globalThis as Record<symbol, AudienceFilterStore | undefined>
  target[STORE_KEY] ??= {knownAudiences: new Set()}

  return target[STORE_KEY]
}

/**
 * Normalizes a value that can be either a string (comma-separated)
 * or an array of strings into a clean array of trimmed strings.
 */
function normalizeAudienceList(value: string | string[]): string[] {
  if (Array.isArray(value)) {
    return value.map(v => v.trim().toLowerCase()).filter(Boolean)
  }

  if (typeof value === 'string') {
    return value.split(',').map(v => v.trim().toLowerCase()).filter(Boolean)
  }

  return []
}

/**
 * Returns the active audience (AUDIENCE env var first, then headmatter)
 * and all audiences that can be selected at runtime.
 */
export function getAudienceFilterState(): AudienceFilterState {
  const store = getStore()
  // Lowercase like showFor/hideFor values, so e.g. "Live" and "live" are one option
  const headmatterAudience = store.headmatterAudience?.trim().toLowerCase() || null
  const active = process.env.AUDIENCE?.trim().toLowerCase() || headmatterAudience

  const audiences = new Set(store.knownAudiences)
  if (headmatterAudience) {
    audiences.add(headmatterAudience)
  }
  if (active) {
    audiences.add(active)
  }
  audiences.delete(BYPASS_AUDIENCE)

  // bypass first, then all other audiences alphabetically
  const sorted = [...audiences].sort((a, b) => a.localeCompare(b, undefined, {sensitivity: 'base'}))

  return {active, options: [BYPASS_AUDIENCE, ...sorted]}
}

/**
 * Creates the audience filter preparser extension.
 *
 * Listing the addon in `addons` uses this automatically (Slidev >= 52.17.1).
 * On older Slidev versions, addon preparsers are not applied on the initial
 * load, so import this in your project's `setup/preparser.ts` instead:
 *
 * ```ts
 * import {createAudienceFilterPreparser} from 'slidev-addon-audience-filter'
 * export default createAudienceFilterPreparser()
 * ```
 */
export function createAudienceFilterPreparser() {
  return definePreparserSetup(async ({headmatter}) => {
    const store = getStore()
    const headmatterAudience = headmatter?.audience as string | string[] | undefined
    store.headmatterAudience = Array.isArray(headmatterAudience)
      ? headmatterAudience.join(',')
      : headmatterAudience || undefined
    store.knownAudiences = new Set()

    // Priority 1: Environment variable AUDIENCE (CLI override or runtime switch)
    // Priority 2: Headmatter audience setting
    // AUDIENCE=bypass disables filtering (e.g., for IDE editing)
    const audienceSource = process.env.AUDIENCE || store.headmatterAudience
    const activeAudiences = audienceSource && audienceSource.trim().toLowerCase() !== BYPASS_AUDIENCE
      ? normalizeAudienceList(audienceSource)
      : []

    // The extension is always registered so that all audiences used in the
    // deck are collected for the runtime switch, even when nothing is filtered.
    return [
      {
        name: 'audience-filter',
        async transformSlide(content, frontmatter) {
          const showFor = frontmatter?.showFor
          const hideFor = frontmatter?.hideFor

          // If neither showFor nor hideFor is specified, slide is visible for all
          if (showFor === undefined && hideFor === undefined) {
            return content
          }

          const showList = showFor !== undefined ? normalizeAudienceList(showFor) : []
          const hideList = hideFor !== undefined ? normalizeAudienceList(hideFor) : []
          for (const audience of [...showList, ...hideList]) {
            store.knownAudiences.add(audience)
          }

          // If no audience is set, all slides are visible (no filtering)
          if (activeAudiences.length === 0) {
            return content
          }

          // Defensive: if slide is already hidden by other means, don't touch it
          if (frontmatter.hide === true || frontmatter.disabled === true) {
            return content
          }

          // Check if any active audience is in the hideFor list
          const isHidden = hideList.some(aud => activeAudiences.includes(aud))

          if (isHidden) {
            frontmatter.disabled = true

            return content
          }

          // If showFor is specified, check if any active audience matches
          if (showList.length > 0) {
            const isVisible = showList.some(aud => activeAudiences.includes(aud))
            if (!isVisible) {
              frontmatter.disabled = true

              return content
            }
          }

          return content
        },
      },
    ]
  })
}
