import React from "react";
import { easingType, getEasingFunction } from "../../../scripts/easingFunctions";

/**
 * Transition that horizontally expands its contents.
 * @param param0 
 * @returns 
 */
export function CardFlipTransition({
    children,
    tV,
    easing,
    cardStyle,
    cardChildren,
    forceStyle,
    forceClass
  }: {
    children?: React.ReactNode;
    tV: number,
    easing: easingType,
    cardStyle?: React.CSSProperties
    cardChildren?: React.ReactNode;
    forceStyle?: React.CSSProperties,
    forceClass?: string
  }) {
    const tVEased = getEasingFunction(easing)(Math.min(tV, 1)) * 2;
    return <>
    <div className={forceClass} style={{display: 'flex', justifyContent: 'center', alignItems: 'center', ...forceStyle }}>
      <div style={{ position: 'absolute', transform: `scaleX(${Math.max(1-tVEased, 0)})`, ...cardStyle }}>
        {cardChildren}
      </div>
      <div style={{ transform: `scaleX(${Math.max(tVEased - 1, 0)})` }}>
        {children}
      </div>
    </div>
    </>;
}