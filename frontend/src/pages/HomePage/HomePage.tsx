import { useAuth0 } from "@auth0/auth0-react";
import { useDispatch, useSelector } from "react-redux";
import { ReduxRootState } from "../../store";
import { useState } from "react";
import { MyClientSocket } from "../../features/ClientSocket/ClientSocket";
import { Pencil } from "lucide-react";
import { closeDialog, setDialog } from "../../features/Dialog/DialogSlice";
import { ObjectAny } from "../../scripts/types";
import { setAlert } from "../../features/Alert/AlertSlice";
import { useNavigate } from "react-router-dom";

type HomeSubPage = "view_mentor" | "view_mentees";
export default function HomePage() {
  const { user } = useSelector((store: ReduxRootState) => store.ClientSocket);
  const [subPage, setSubPage] = useState<HomeSubPage>("view_mentor");

  if (!user || !MyClientSocket) {
    return <p>Loading...</p>;
  }

  function handleChangeSubpage(newSubPage: HomeSubPage) {
    setSubPage(newSubPage);
  }

  const {
    username,
    fName,
    mName,
    lName,
    id: userID,
    socials,
    experience,
    education,
    certifications,
    projects,
    softSkills,
    isMentee,
    isMentor,
  } = user;
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
        boxSizing: "border-box",
      }}
    >
      <HomePageHeader />
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
            transition: "all 300ms ease-in-out",
            fontSize: "1.1rem",
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
            fontSize: "1.1rem",
          }}
          onClick={() => handleChangeSubpage("view_mentees")}
        >
          Mentees
        </button>
      </div>

      <HomePageViewMentorSection />

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

function HomePageViewMentorSection() {
  const { user } = useSelector((store: ReduxRootState) => store.ClientSocket);

  if (!user) {
    return <p>Waiting for user data...</p>;
  }

  const { isMentee } = user;

  return (
    <div
      style={{
        backgroundColor: "#222",
        display: "flex",
        padding: 10,
        borderRadius: 10,
        marginTop: 10,
        marginLeft: 5,
      }}
    >
      {!isMentee && <BecomeMenteeSection />}
    </div>
  );
}

function BecomeMenteeSection() {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  function handleTakeAssessment() {
    navigate("../assessment?type=new");
    setTimeout(() => {
      dispatch(setAlert({ title: 'Assessments', body: 'Take an assessment to give your mentor clear insight into your career goals. The more details you share, the easier it\'ll be to work with you.' }))
    }, 500);
  }

  return (
    <div>
      <p style={{ color: "white", margin: 0, fontSize: "1.5rem" }}>
        Want to find a mentor?
      </p>
      <p style={{ color: "white", margin: 0, fontSize: "1.25rem" }}>
        Tell us a little more about yourself.
      </p>
      <button
        style={{
          border: "2px solid #fff",
          backgroundColor: "transparent",
          color: "white",
          borderRadius: 30,
          marginTop: 5,
          fontSize: "1rem",
        }}
        onClick={handleTakeAssessment}
      >
        Take Assessment
      </button>
    </div>
  );
}

function HomePageHeader() {
  const { logout } = useAuth0();
  const { user } = useSelector((store: ReduxRootState) => store.ClientSocket);
  const dispatch = useDispatch();

  if (!user) {
    return <p>Waiting for user data...</p>;
  }

  function handleUpdateUsername() {
    dispatch(
      setDialog({
        title: "Change Username",
        subtitle:
          "Change your username to whatever you want (assuming it's available)",
        inputs: [
          {
            label: "New Username",
            name: "username",
            type: "text",
            placeholder: "KingSlayer550",
            initialValue: username,
          },
        ],
        buttons: [
          {
            useDisableTill: true,
            text: "Change username",
            onClick: handleUpdateUsernameSubmit,
          },
        ],
        buttonContainerStyle: {
          justifyContent: "end",
        },
      })
    );
  }

  function handleUpdateUsernameSubmit(
    formParams: ObjectAny,
    enableCallback?: Function
  ) {
    console.log("sending update profile", formParams);
    const { username } = formParams;
    if (!username) {
      enableCallback && enableCallback();
      return;
    }
    MyClientSocket?.updateProfile({ username }, (v: boolean) => {
      enableCallback && enableCallback();
      v &&
        (() => {
          dispatch(closeDialog());
          dispatch(
            setAlert({
              title: "Username changed!",
              body: `Enjoy your new username, ${username}.`,
            })
          );
        })();
    });
  }
  const { username } = user;
  return (
    <div
      style={{
        width: 400,
        display: "flex",
        paddingLeft: 10,
        alignItems: "center",
        paddingTop: 30,
        paddingBottom: 30,
      }}
    >
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "start",
        }}
      >
        <div style={{ display: "flex", alignItems: "center" }}>
          <p style={{ color: "white", fontSize: "2rem", margin: 0 }}>
            Welcome {username}
          </p>
          <Pencil
            onClick={handleUpdateUsername}
            style={{ marginLeft: 10, cursor: "pointer" }}
            color="white"
          />
        </div>

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
            fontSize: "0.8rem",
          }}
        >
          Logout
        </button>
      </div>
    </div>
  );
}
