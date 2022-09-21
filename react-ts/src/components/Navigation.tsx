import { NavLink } from "react-router-dom";

const Navigation = () => {
  return (
    <div className="navigation">
      <ul>
       
        <NavLink
          to="/about"
          className={(nav) => (nav.isActive ? "nav-active" : "")}
        >
          <li>A propos</li>
        </NavLink>
        <NavLink
          to="/game"
          className={(nav) => (nav.isActive ? "nav-active" : "")}
        >
          <li>Game</li>
        </NavLink>
      </ul>
    </div>
  );
};

export default Navigation;
