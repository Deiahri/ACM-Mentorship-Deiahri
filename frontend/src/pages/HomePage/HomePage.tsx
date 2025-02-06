import { useAuth0 } from "@auth0/auth0-react";
import { useSelector } from "react-redux";
import { ReduxRootState } from "../../store";
import { useState } from "react";
import { MyClientSocket } from "../../features/ClientSocket/ClientSocket";

type HomeSubPage = "view_mentor" | "view_mentees";
export default function HomePage() {
  const { logout } = useAuth0();
  const { user } = useSelector((store: ReduxRootState) => store.ClientSocket);

  const [subPage, setSubPage] = useState<HomeSubPage>("view_mentor");

  function handleChangeSubpage(newSubPage: HomeSubPage) {
    setSubPage(newSubPage);
  }

  if (!user || !MyClientSocket) {
    return <p>Loading...</p>;
  }

  const { username, fName, mName, lName, id: userID, socials, experience, education, certifications, projects, softSkills } = user;
  return (
    <div
      style={{
        width: "100vw",
        height: "100%",
        minHeight: "100vh",
        display: "flex",
        justifyContent: "start",
        alignItems: "start",
        padding: 15,
        backgroundColor: "#111",
        flexDirection: "column",
      }}
    >
      <div
        style={{
          width: 400,
          display: "flex",
          paddingLeft: 10,
          alignItems: "center",
          paddingTop: 30,
          paddingBottom: 30
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "start",
          }}
        >
          <p style={{ color: "white", fontSize: "2rem", margin: 0 }}>
            Welcome {username}
          </p>

          <button
            onClick={() =>
              logout({ logoutParams: { returnTo: window.location.origin } })
            }
            style={{
              border: "2px solid #fff",
              backgroundColor: "transparent",
              color: "white",
              borderRadius: 30,
              marginTop: 5,
              fontSize: '0.8rem'
            }}
          >
            Logout
          </button>
        </div>
      </div>
      <div
        style={{
          backgroundColor: "#222",
          display: "flex",
          padding: 10,
          borderRadius: 30,
        }}
      >
        <button
          style={{
            border: "2px solid #fff",
            backgroundColor: subPage == "view_mentor" ? "white" : "transparent",
            color: subPage == "view_mentor" ? "#222" : "white",
            borderRadius: 30,
          }}
          onClick={() => handleChangeSubpage("view_mentor")}
        >
          Mentor
        </button>
        <button
          style={{
            border: "2px solid #fff",
            backgroundColor:
              subPage == "view_mentees" ? "white" : "transparent",
            color: subPage == "view_mentees" ? "#222" : "white",
            borderRadius: 30,
            marginLeft: 10,
            transition: "all 300ms ease-in-out",
          }}
          onClick={() => handleChangeSubpage("view_mentees")}
        >
          Mentees
        </button>
      </div>

      <div
        style={{
          backgroundColor: "#222",
          marginTop: 15,
          padding: 10,
          borderRadius: 10,
          marginLeft: 5,
        }}
      >
        <p style={{ color: "white", fontSize: "1.5rem", margin: 0 }}>
          UserID: {userID}
        </p>
        <p style={{ color: "white", fontSize: "1.5rem", margin: 0 }}>
          Name: {fName} {mName} {lName}
        </p>
        <p style={{ color: "white", fontSize: "1.5rem", margin: 0 }}>
          Username: {username}
        </p>
      </div>
    </div>
  );
}
