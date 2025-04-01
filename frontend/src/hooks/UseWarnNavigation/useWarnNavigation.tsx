// import { useEffect } from "react";
import { useBlocker, 
  // useNavigate 
} from "react-router-dom";
// import { useBlocker } from "react-router-dom";

const defaultWarning = "Are you sure you want to leave this page?";
export default function useWarnNavigation({
  enabled,
  warning,
}: {
  enabled: boolean;
  warning?: string;
}) {
  // const navigate = useNavigate();
  // const currentPage = window.location.pathname+window.location.search;
  // React Router Blocker
  useBlocker(() => {
    if (enabled) {
      const shouldNavigate = window.confirm(
        warning || defaultWarning
      );
      return shouldNavigate; // Block navigation if user cancels
    }
    return false; // Allow navigation otherwise
  });

  // // Handle Browser Back & Refresh
  // useEffect(() => {
  //   const handleBeforeUnload = (event: BeforeUnloadEvent) => {
  //     if (enabled) {
  //       event.preventDefault();
  //       event.returnValue = warning || defaultWarning;
  //     }
  //   };

  //   const handlePopState = (event: PopStateEvent) => {
  //     if (enabled) {
  //       console.log(currentPage);
  //       const shouldNavigate = window.confirm(
  //         warning || defaultWarning
  //       );
  //       if (!shouldNavigate) {
  //         event.preventDefault();
  //         navigate(currentPage);
  //       }
  //     }
  //   };

  //   window.addEventListener("beforeunload", handleBeforeUnload);
  //   window.addEventListener("popstate", handlePopState);

  //   return () => {
  //     window.removeEventListener("beforeunload", handleBeforeUnload);
  //     window.removeEventListener("popstate", handlePopState);
  //   };
  // }, [enabled, warning]);
}
