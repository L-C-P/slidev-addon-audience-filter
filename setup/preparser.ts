// Preparser entry that Slidev loads when this addon is listed in `addons`
// (Slidev >= 52.17.1). Also used when previewing this addon standalone.
import {createAudienceFilterPreparser} from '../index.ts'

export default createAudienceFilterPreparser()
