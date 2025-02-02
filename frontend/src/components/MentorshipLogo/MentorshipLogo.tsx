import React from "react";
import ACMLogoTriangle from "../../assets/ACM Orange.png";
import style from './MentorshipLogo.module.css';

export default function MentorshipLogo({scale = 1, hideText = false, bgColor='#010101'}: { scale?: number, hideText?: boolean, bgColor?: string }) {
  let size = 0.7;
  return (
    <div style={{ display: "flex", alignItems: "center", transform: `scale(${scale})` }}>
      <div style={{marginRight: `${-1 * size}rem`, zIndex: 1, position: 'relative', display: 'flex', justifyContent: 'center', alignItems: 'center'}}>
        <img src={ACMLogoTriangle} style={{ width: `${7*size}rem`, zIndex: 2 }} />
        {/* <img src={ACMLogoTriangle} style={{ width: `${9*size}rem`, position: 'absolute', zIndex: 1, filter: 'brightness(0) saturate(100%)', mixBlendMode: 'difference', backgroundColor: '#010101' }} /> */}
      </div>
      <div className={`${style.animateWidth} ${!hideText?'':style.active}`} style={{ color: "white", fontSize: `${3*size}rem`, fontWeight: 100, paddingBottom: `${0.5*size}rem`, overflow: 'hidden', zIndex: 0 }}>
        Mentorship
      </div>
    </div>
  );
}
