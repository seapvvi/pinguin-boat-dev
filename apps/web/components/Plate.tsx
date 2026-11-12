import Image from 'next/image';
import { PLATE_LABEL, type PlateName } from '@/lib/plates';

type PlateProps = {
  name: PlateName;
  fig?: string;
  className?: string;
  decorative?: boolean;
  priority?: boolean;
  sizes?: string;
  style?: React.CSSProperties;
};

export const PLATE_DIMENSIONS: Record<PlateName, { w: number; h: number }> = {
  comet: { w: 780, h: 960 },
  eclipse: { w: 780, h: 960 },
  nebula: { w: 780, h: 960 },
  rocket: { w: 780, h: 960 },
  moon: { w: 780, h: 960 },
  saturn: { w: 780, h: 780 },
  sphere: { w: 780, h: 780 },
  belt: { w: 1560, h: 780 },
  cluster: { w: 780, h: 780 },
  capsule: { w: 780, h: 960 },
};

export function Plate({
  name,
  fig,
  className,
  decorative = false,
  priority = false,
  sizes,
  style,
}: PlateProps) {
  const label = PLATE_LABEL[name];
  const dims = PLATE_DIMENSIONS[name];

  return (
    <figure className={className ? `plate ${className}` : 'plate'} style={{ margin: 0, ...style }}>
      <Image
        src={`/plates/${name}.svg`}
        alt={decorative ? '' : label.alt}
        aria-hidden={decorative ? 'true' : undefined}
        width={dims.w}
        height={dims.h}
        sizes={sizes}
        priority={priority}
        // Plates are hand-authored SVGs: the optimizer has nothing to gain and
        // would refuse them without `dangerouslyAllowSVG`.
        unoptimized
        style={decorative ? undefined : { height: 'auto' }}
      />
      {!decorative && (
        <figcaption>
          <span>{fig ?? label.fig}</span>
          <span>{label.subject}</span>
        </figcaption>
      )}
    </figure>
  );
}

export default Plate;

export { PLATE_LABEL };
export type { PlateName };