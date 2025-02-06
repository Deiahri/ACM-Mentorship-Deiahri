import { useAuth0 } from "@auth0/auth0-react";
import { useSelector } from "react-redux";
import { ReduxRootState } from "../../store";

export default function UserPage() {
  const { logout } = useAuth0();
  const { user } = useSelector((store: ReduxRootState) => store.ClientSocket);
  if (!user) {
    return <p>Loading...</p>
  }

  const { username, fName, mName, lName, id: userID } = user;
  return (
    <div
      style={{
        width: "100vw",
        height: "100%",
        minHeight: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#111",
        flexDirection: "column",
      }}
    >
      <p style={{color: 'white', fontSize: '2rem', margin: 0}}>App</p>
      <p style={{color: 'white', fontSize: '1.5rem', margin: 0}}>UserID: {userID}</p>
      <p style={{color: 'white', fontSize: '1.5rem', margin: 0}}>Name: {fName} {mName} {lName}</p>
      <p style={{color: 'white', fontSize: '1.5rem', margin: 0}}>Username: {username}</p>
      <button
        onClick={() =>
          logout({ logoutParams: { returnTo: window.location.origin } })
        }
        style={{marginTop: 30}}
      >
        Logout
      </button>
    </div>
  );
}
