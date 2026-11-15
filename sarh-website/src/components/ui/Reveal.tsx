import type { ReactNode } from 'react';
import AnimatedContent, { type AnimatedContentWipe } from '@/components/react-bits/AnimatedContent';
import { motion } from '@/lib/motion';

interface RevealProps {
  children: ReactNode;
  className?: string;
  /** Reveal the direct children one after another instead of the block as a whole. */
  stagger?: boolean;
  /** Mask reveal, used for large images. */
  wipe?: AnimatedContentWipe;
  delay?: number;
  distance?: number;
  /** `span` renders a block-level span, for use inside headings. */
  as?: 'div' | 'span';
}

/**
 * The site's standard entrance: React Bits' AnimatedContent with the motion tokens applied
 * (opacity + 24px rise, 0.6s, optional 90ms stagger or a soft mask wipe).
 */
export default function Reveal({
  children,
  className,
  stagger = false,
  wipe = 'none',
  delay = 0,
  distance,
  as = 'div'
}: RevealProps) {
  return (
    <AnimatedContent
      as={as}
      className={className}
      distance={distance ?? motion.distance}
      duration={wipe === 'none' ? motion.duration : motion.wipeDuration}
      ease={motion.ease}
      threshold={motion.threshold}
      stagger={stagger ? motion.stagger : 0}
      wipe={wipe}
      delay={delay}
    >
      {children}
    </AnimatedContent>
  );
}
