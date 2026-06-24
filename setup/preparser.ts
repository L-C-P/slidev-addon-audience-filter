import {definePreparserSetup} from '@slidev/types'

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

export default definePreparserSetup(async ({headmatter}) => {
  // Bypass filter when AUDIENCE=bypass (e.g., for IDE editing)
  // Usage: AUDIENCE=bypass npm exec -c 'slidev ${args}'
  if (typeof process !== 'undefined' && process.env.AUDIENCE === 'bypass') {
    return []
  }

  // Priority 1: Environment variable AUDIENCE (CLI override)
  // Priority 2: Headmatter audience setting
  const envAudience = typeof process !== 'undefined' ? process.env.AUDIENCE : undefined
  const audienceSource = (envAudience as string) || (headmatter?.audience as string | undefined)

  const activeAudiences = audienceSource
    ? normalizeAudienceList(audienceSource)
    : []

  // If no audience is set, all slides are visible (no filtering)
  if (activeAudiences.length === 0) {
    return []
  }

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
