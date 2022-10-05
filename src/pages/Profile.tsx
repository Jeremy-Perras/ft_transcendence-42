import { useParams } from "react-router-dom";
import { Link } from "react-router-dom";
import Navigation from "../components/Navigation";

function Profile() {
  const { id } = useParams();

  return (
    <div>
      <Navigation />
      <p>Profile {id}</p>
      <p>
        <Link className="border-2 border-solid" to={"/"}>
          Home
        </Link>
      </p>
    </div>
  );
}

export default Profile;
