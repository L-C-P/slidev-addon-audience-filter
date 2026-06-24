// Entry point used when previewing this addon standalone (its own slides.md).
// In that case this file lives in the preview's project root, so Slidev applies
// it on the initial load. Consumer projects must add their own thin
// setup/preparser.ts that calls createAudienceFilterPreparser() (see README).
import {createAudienceFilterPreparser} from '../index.ts'

export default createAudienceFilterPreparser()
