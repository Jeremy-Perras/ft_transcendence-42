import { NavLink } from "react-router-dom";

function Navigation() {
  return (
    <div className="border-2">
      <NavLink
        to="/"
        end
        className={({ isActive }) =>
          isActive ? "text-blue-700" : "text-red-700"
        }
      >
        Home
      </NavLink>
      <NavLink
        to="/test"
        className={({ isActive }) =>
          isActive ? "text-blue-700" : "text-red-700"
        }
      >
        Profile/test
      </NavLink>
      <NavLink
        to="/profile/test"
        className={({ isActive }) =>
          isActive ? "text-blue-700" : "text-red-700"
        }
      >
        Profile/test
      </NavLink>
    </div>
  );
}
export default Navigation;
