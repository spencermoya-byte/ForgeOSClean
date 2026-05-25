RETAIN_EXISTING_FILE_WITH_CHANGES:
Add these imports below existing Builder imports:
import { anchorBuilderTargetRegions } from './builderRegionAnchor';
import { buildStructuredEditPlan } from './builderStructuredEdit';
import { synthesizePatchPlan } from './builderPatchSynthesizer';
import { verifyAnchoredEdit } from './builderAnchorVerification';

Do not modify any other code.