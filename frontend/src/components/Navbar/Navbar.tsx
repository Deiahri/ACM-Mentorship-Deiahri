import HideOnMobile from "../RenderOnMobile/HideOnMobile";
import ShowOnMobile from "../RenderOnMobile/ShowOnMobile";
import NavbarDesktop from "./NavbarDesktop";
import NavbarMobile from "./NavbarMobile";

export default function Navbar() {
  return <>
    <NavbarMobile/>
    <NavbarDesktop/>
    <HideOnMobile>
      <div style={{width: '100%', height: '1.5rem', backgroundColor: '#111'}} />
    </HideOnMobile>
    <ShowOnMobile>
      <div style={{width: '100%', height: '4rem', backgroundColor: '#111'}} />
    </ShowOnMobile>
  </>
}