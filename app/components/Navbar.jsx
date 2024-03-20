import { NavLink } from "@remix-run/react";
import { useLoaderData } from "@remix-run/react";
import { useEffect, useRef } from "react";

export default function Navbar() {
  const user = useLoaderData();
  const modeToggle = useRef(null);

  useEffect(() => {
    const body = document.body;

    const toggleMode = () => {
      if (body.classList.contains("dark-mode")) {
        body.classList.remove("dark-mode");
        modeToggle.current.textContent = "◐";
        localStorage.setItem("mode", "light");
      } else {
        body.classList.add("dark-mode");
        modeToggle.current.textContent = "◑";
        localStorage.setItem("mode", "dark");
      }
    };

    // Check for saved mode preference on page load
    const savedMode = localStorage.getItem("mode");
    if (savedMode === "dark") {
      body.classList.add("dark-mode");
      modeToggle.current.textContent = "◑";
    }

    modeToggle.current.addEventListener("click", toggleMode);

    return () => {
      modeToggle.current.removeEventListener("click", toggleMode);
    };
  }, []);

  return (
    <nav>
      <div className="nav-logo">
        <NavLink to="/">VisualArtEvents</NavLink>
      </div>
      <div className="nav-links">
        <NavLink to="/events">Events</NavLink>
        {!user.isAuthenticated && <NavLink to="/signin">Sign in</NavLink>}
        {user.isAuthenticated && (
          <>
            <NavLink to="/add-event">Create Event</NavLink>
            <NavLink to="/profile">Profile</NavLink>
          </>
        )}
        <button id="mode-toggle" ref={modeToggle}>
          ◐
        </button>
      </div>
    </nav>
  );
}
