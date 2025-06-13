
import * as React from "react"

const MOBILE_BREAKPOINT = 768

export function useIsMobile() {
  const [isMobile, setIsMobile] = React.useState(false); // Default to a consistent state (e.g., not mobile)
  const [hasMounted, setHasMounted] = React.useState(false);

  React.useEffect(() => {
    setHasMounted(true); // Indicate that the component has mounted on the client

    const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`);
    const onChange = () => {
      setIsMobile(mql.matches);
    };
    
    setIsMobile(mql.matches); // Set the actual value on client mount
    mql.addEventListener("change", onChange);
    
    return () => mql.removeEventListener("change", onChange);
  }, []);

  // Return the default value until mounted, then return the dynamic value.
  // This ensures server-render and initial client-render are consistent for this piece of logic.
  return hasMounted ? isMobile : false;
}
