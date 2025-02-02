import { useEffect, useState } from "react";
import MentorshipLogo from "../MentorshipLogo/MentorshipLogo";
import Transition from "../Transition/Transition";

export default function IntroOverlay() {
  const [hidden, setHidden] = useState(true);
  const [hideText, setHideText] = useState(true);


  useEffect(() => {
    setTimeout(() => {
        setHidden(false);
    }, 1500);
    setTimeout(() => {
        setHideText(false);
    }, 500);
  }, []);

  return (
    <Transition type="wipe" direction="right" toggle={hidden} initialToggle={true} hideOnToggleOff={true} forceStyle={{position: 'fixed', width: '100vw', height: '100vh', zIndex: 10000000, top: 0}}>
      <div
        style={{
          width: "100vw",
          height: "100vh",
          position: "fixed",
          top: 0,
          backgroundColor: "#222",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <MentorshipLogo hideText={hideText} scale={1.5}/>
      </div>
    </Transition>
  );
}
