import { useParams } from "react-router-dom";
import { Link } from "react-router-dom";

function Profile() {
  const { id } = useParams();

  return (
    <div>
      <p>Profile! {id}</p>
      <p>
        <Link className="border-2 border-solid" to={"/"}>
          Home!
        </Link>
      </p>
    </div>
  );
}

export default Profile;
