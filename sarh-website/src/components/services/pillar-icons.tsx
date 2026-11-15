import { CompassMark, HelmetMark, LensMark, TowerMark } from '@/components/ui/icons';
import type { PillarIcon } from '@/content/services';

/** Line icons of the four service pillars. */
export const pillarIcons: Record<PillarIcon, typeof TowerMark> = {
  tower: TowerMark,
  compass: CompassMark,
  helmet: HelmetMark,
  lens: LensMark
};
