import { easingType, getEasingFunction } from "../../../scripts/easingFunctions";

export default function DiagonalTransition({
  tV,
  children,
  easing,
  forceStyle,
  forceClass
}: {
  tV: number;
  children?: React.ReactNode;
  easing: easingType;
  toggle: boolean;
  forceStyle?: React.CSSProperties
  forceClass?: string
}) {
  const easingFunction = getEasingFunction(easing);
  const tVAdjusted = Math.min(easingFunction(tV) * 150, 100);
  return (
    <div
      style={{
        clipPath: `polygon(0% 0%, ${tVAdjusted}% 0%, 100% ${100-tVAdjusted}%, 100% 100%, ${100-tVAdjusted}% 100%, 0% ${tVAdjusted}%`, ...forceStyle
      }}
      className={forceClass}
    >
      {children}
    </div>
  );
}
