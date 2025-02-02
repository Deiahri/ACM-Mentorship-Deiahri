import { easingType, getEasingFunction } from "../../../scripts/easingFunctions";

/**
 * Transition that horizontally expands its contents.
 * @param param0 
 * @returns 
 */
export function HorizontalExpandTransition({
    children,
    tV,
    easing,
    forceStyle,
    forceClass
  }: {
    children?: React.ReactNode;
    tV: number,
    easing: easingType,
    forceStyle?: React.CSSProperties,
    forceClass?: string
  }) {
    const transitionContainerWidth = getEasingFunction(easing)(tV);
    return <div className={forceClass} style={{ transform: `scaleX(${transitionContainerWidth})`, ...forceStyle }}>
        {children}
    </div>;
}