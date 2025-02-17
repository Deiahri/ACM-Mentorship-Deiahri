import { useLocation, useNavigate } from "react-router-dom";
import MentorshipLogo from "../MentorshipLogo/MentorshipLogo";
import ButtonShadow from "../ButtonShadow/ButtonShadow";
import { useSelector } from "react-redux";
import { ReduxRootState } from "../../store";
import { placeholderPreviewPicture } from "../../features/Chat/Chat";
import ButtonMenu, {
  ButtonMenuButtonProperties,
} from "../ButtonMenu/ButtonMenu";
import { useRef, useState } from "react";
import Transition from "../Transition/Transition";
import HideOnMobile from "../RenderOnMobile/HideOnMobile";
import styles from "./NavbarDesktop.module.css";

export default function NavbarDesktop() {
  const [hover, setHover] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const pagePath = location.pathname;

  function handleLogoClick() {
    navigate("/app/home");
  }

  function handleMyMentorClick() {
    navigate("/app/my-mentor");
  }

  function handleMyMenteeClick() {
    navigate("/app/my-mentees");
  }

  function handleMouseLeaveNavbar() {
    setHover(false);
  }

  function handleMouseEnterNavbar() {
    setHover(true);
  }

  return (
    <HideOnMobile
      onMouseEnter={handleMouseEnterNavbar}
      onMouseLeave={handleMouseLeaveNavbar}
    >
      <div
        style={{
          height: hover ? "5rem" : "3rem",
        }}
        className={`${styles.animateHeight} ${styles.navbarDesktop}`}
      >
        <MentorshipLogo
          onClick={handleLogoClick}
          scale={hover ? 0.8 : 0.5}
          style={{ cursor: "pointer" }}
        />
        <ButtonShadow
          active={pagePath == "/app/my-mentor"}
          style={{
            marginRight: "1rem",
            transform: `scale(${hover ? 1 : 0.7})`,
          }}
          onClick={handleMyMentorClick}
          className={styles.animateScale}
        >
          My Mentor
        </ButtonShadow>
        <ButtonShadow
          active={pagePath == "/app/my-mentees"}
          style={{ transform: `scale(${hover ? 1 : 0.7})` }}
          onClick={handleMyMenteeClick}
          className={styles.animateScale}
        >
          My Mentees
        </ButtonShadow>
        <NavbarProfile
          className={styles.animateScale}
          style={{
            position: "absolute",
            right: "2rem",
            transform: `scale(${hover ? 1 : 0.7})`,
          }}
        />
      </div>
    </HideOnMobile>
  );
}

const OpenMenuDelay = 100;
const defaultMenuButtonStyling = { fontSize: "1.1rem" };
export function NavbarProfile({
  style,
  className,
}: {
  style?: React.CSSProperties;
  className?: string;
}) {
  const navigate = useNavigate();
  const { user } = useSelector((store: ReduxRootState) => store.ClientSocket);
  const [open, setOpen] = useState(false);
  const openDelayRef = useRef(0);

  const MenuButtons: ButtonMenuButtonProperties[] = [
    {
      text: "Assessments",
      style: defaultMenuButtonStyling,
      onClick: () => navigate(`/app/assessments?id=${user?.id}`),
    },
    {
      text: "Goals",
      style: defaultMenuButtonStyling,
      onClick: () => navigate(`/app/goals?id=${user?.id}`),
    },
    {
      text: "Profile",
      style: defaultMenuButtonStyling,
      onClick: () => navigate(`/app/user?id=${user?.id}`),
    },
  ];

  function handleMouseEnter() {
    clearTimeout(openDelayRef.current);
    openDelayRef.current = setTimeout(() => {
      setOpen(true);
    }, OpenMenuDelay);
  }

  function handleMouseLeave() {
    clearTimeout(openDelayRef.current);
    openDelayRef.current = setTimeout(() => {
      setOpen(false);
    }, OpenMenuDelay);
  }

  return (
    <>
      <div
        style={{
          ...style,
        }}
        className={className}
        onMouseEnter={() => handleMouseEnter()}
        onMouseLeave={() => handleMouseLeave()}
      >
        <img
          draggable={false}
          style={{
            borderRadius: "50%",
            width: "3rem",
            height: "3rem",
            overflow: "hidden",
            border: "1px solid #fff6",
            userSelect: "none",
            cursor: "pointer",
          }}
          src={user?.displayPictureURL || placeholderPreviewPicture}
        />
        <Transition
          toggle={open}
          initialToggle={false}
          type={"fade"}
          transitionSpeedMS={50}
          delay={0}
        >
          <ButtonMenu
            style={{
              position: "absolute",
              top: "3.5rem",
              right: "0.25rem",
            }}
            buttons={MenuButtons}
          />
        </Transition>
      </div>
    </>
  );
}
