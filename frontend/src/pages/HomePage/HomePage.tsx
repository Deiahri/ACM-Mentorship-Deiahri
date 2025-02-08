import { useAuth0 } from "@auth0/auth0-react";
import { useDispatch, useSelector } from "react-redux";
import { ReduxRootState } from "../../store";
import { useEffect, useState } from "react";
import {
  ClientSocketUser,
  MyClientSocket,
} from "../../features/ClientSocket/ClientSocket";
import { Pencil } from "lucide-react";
import { closeDialog, setDialog } from "../../features/Dialog/DialogSlice";
import { ObjectAny } from "../../scripts/types";
import { setAlert } from "../../features/Alert/AlertSlice";
import { useNavigate } from "react-router-dom";
import { NothingFunction } from "../../scripts/tools";
import { useChangeUsernameWithDialog } from "../../hooks/UseChangeUsername";
import MinimalisticButton from "../../components/MinimalisticButton/MinimalisticButton";

type HomeSubPage = "view_mentor" | "view_mentees";
export default function HomePage() {
  const { user, ready } = useSelector((store: ReduxRootState) => store.ClientSocket);
  const [subPage, setSubPage] = useState<HomeSubPage>("view_mentor");

  if (!user || !MyClientSocket || !ready) {
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
            transition:
              "background-color 100ms ease-in-out, color 100ms ease-in-out",
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
            transition:
              "background-color 100ms ease-in-out, color 100ms ease-in-out",
            fontSize: "1.1rem",
          }}
          onClick={() => handleChangeSubpage("view_mentees")}
        >
          Mentees
        </button>
      </div>

      {subPage == "view_mentor" && <ViewMentorSection />}
      {subPage == "view_mentees" && <ViewMenteesSection />}

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

function ViewMenteesSection() {
  const { user } = useSelector((store: ReduxRootState) => store.ClientSocket);

  if (!user) {
    return <p>Waiting for user data...</p>;
  }

  const { isMentor, menteeIDs } = user;

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
      {!isMentor && <BecomeMentorSection />}
      {isMentor && <MenteeInformation />}
    </div>
  );
}

const MAX_FILLED_SECTIONS = 5;
function BecomeMentorSection() {
  const { user } = useSelector((store: ReduxRootState) => store.ClientSocket);

  const navigate = useNavigate();
  const dispatch = useDispatch();

  if (!user) {
    return <p>Waiting for user data...</p>;
  }

  const { experience, education, certifications, projects, softSkills } = user;
  const filledSections =
    (experience ? 1 : 0) +
    (education ? 1 : 0) +
    (certifications ? 1 : 0) +
    (projects ? 1 : 0) +
    (softSkills ? 1 : 0);

  const percentageSectionsFilled = filledSections / MAX_FILLED_SECTIONS;

  function HandleBecomeMentorClick() {
    let title = "Before you become a mentor";
    let message = "";
    if (percentageSectionsFilled < 0.5) {
      message =
        "We recommend completing more of your profile first. It will help your mentees pick you with confidence.";
    } else {
      message = "You will become visible to mentees after this.";
    }

    dispatch(
      setDialog({
        title,
        subtitle: message,
        buttons: [
          {
            text: "Nevermind",
            onClick: () => {
              dispatch(closeDialog());
            },
          },
          {
            text: "Become mentor",
            useDisableTill: true,
            onClick: (_, enableCallback) => {
              dispatch(closeDialog());
              BecomeMentor(enableCallback);
            },
          },
        ],
        buttonContainerStyle: {
          width: "100%",
          justifyContent: "space-between",
        },
      })
    );
  }

  function BecomeMentor(cb?: Function) {
    MyClientSocket?.BecomeMentor(cb);
  }

  return (
    <div>
      <p style={{ color: "white", margin: 0, fontSize: "1.5rem" }}>
        Want to become a mentor?
      </p>
      {percentageSectionsFilled < 0.5 && (
        <div>
          <p
            style={{
              color: "white",
              margin: 0,
              fontSize: "1.25rem",
              marginBottom: 10,
            }}
          >
            We recommend adding some information to your profile first.
          </p>
          <div style={{ height: 10, width: 200, backgroundColor: "#777" }}>
            <div
              style={{
                width: 200 * Math.max(percentageSectionsFilled, 0.025),
                height: "100%",
                backgroundColor: "green",
              }}
            />
          </div>
          <p style={{ margin: 0 }}>
            Profile Completion: {percentageSectionsFilled.toFixed(0)}%
          </p>
        </div>
      )}

      <button
        style={{
          border: "2px solid #fff",
          backgroundColor: "transparent",
          color: "white",
          borderRadius: 30,
          marginTop: 5,
          fontSize: "1rem",
        }}
        onClick={HandleBecomeMentorClick}
      >
        Become Mentor
      </button>
    </div>
  );
}

function ViewMentorSection() {
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
      {isMentee && <MenteeInformation />}
    </div>
  );
}

function MenteeInformation() {
  return (
    <div>
      <p style={{ color: "white", fontSize: "1.5rem", margin: 0 }}>
        Your Stuff
      </p>
      <div style={{ display: "flex", marginLeft: 10 }}>
        <button
          style={{
            border: "2px solid #fff",
            backgroundColor: "transparent",
            color: "white",
            borderRadius: 30,
            marginTop: 5,
            fontSize: "0.8rem",
          }}
        >
          Assessments {">"}
        </button>
      </div>

      <p style={{ color: "white", fontSize: "1.5rem", margin: 0 }}>
        Your Mentor
      </p>
      <div style={{ marginLeft: 10 }}>
        <CurrentMentorInfo />
      </div>

      <p style={{ color: "white", fontSize: "1.5rem", margin: 0 }}>
        Find Mentors
      </p>
      <div style={{ marginLeft: 10 }}>
        <MentorSearchTool />
      </div>
    </div>
  );
}

function CurrentMentorInfo() {
  const { user } = useSelector((store: ReduxRootState) => store.ClientSocket);
  const [mentorObj, setMentorObj] = useState<ClientSocketUser | undefined>(
    undefined
  );

  if (!user || !MyClientSocket) {
    return <p>Loading...</p>;
  }

  const { mentorID } = user;

  useEffect(() => {
    function getMentor() {
      if (!mentorID) {
        return;
      }
      MyClientSocket?.GetUser(mentorID, (dat: Object) => {
        setMentorObj(dat);
      });
    }
    getMentor();
  }, [mentorID]);

  if (!mentorObj) {
    return <p style={{ margin: 0, fontSize: "1.25rem" }}>You have no mentor</p>;
  }

  const {
    username,
    fName,
    mName,
    lName,
    socials,
    experience,
    education,
    certifications,
    projects,
    softSkills,
  } = mentorObj;
  return <p>{username}</p>;
}

function MentorSearchTool() {
  const [mentors, setMentors] = useState<ClientSocketUser[] | undefined>(
    undefined
  );

  useEffect(() => {
    if (!mentors) {
      MyClientSocket?.GetAllMentors((m: unknown) => {
        if (typeof m == "boolean") {
          return;
        } else if (!(m instanceof Array)) {
          return;
        }
        setMentors(m);
        console.log("got mentors", mentors);
      });
    }
  }, []);

  if (!mentors) {
    return <p>Loading...</p>;
  }

  return (
    <div style={{ backgroundColor: "#555", borderRadius: 5, padding: 10 }}>
      {mentors.length == 0 && (
        <p style={{ margin: 0, fontSize: "1.25rem" }}>No mentors available</p>
      )}
      {mentors.map((mentor) => {
        const { fName, mName, lName, username, id } = mentor;
        return <UserProfileCard key={`user_${id}`} user={mentor} />;
      })}
    </div>
  );
}

function UserProfileCard({ user }: { user: ClientSocketUser }) {
  const { fName, mName, lName, username, id, DisplayPictureURL, bio } = user;
  const navigate = useNavigate();

  function handleViewProfile(userID: string) {
    navigate(`/app/user?id=${userID}`);
  }

  if (!id) {
    return null;
  }

  return (
    <div
      style={{
        backgroundColor: "#222",
        padding: 10,
        width: "10rem",
        borderRadius: 5,
      }}
    >
      <img
        style={{ width: "100%", height: "8rem", objectFit: "cover" }}
        src={
          DisplayPictureURL ||
          "https://static.vecteezy.com/system/resources/previews/000/574/512/original/vector-sign-of-user-icon.jpg"
        }
      />
      <p style={{ margin: 0, fontSize: "1.25rem", marginBottom: -5 }}>
        {fName} {mName} {lName}
      </p>
      <p style={{ margin: 0, marginLeft: 5, fontSize: "0.8rem", opacity: 0.5 }}>
        aka {username}
      </p>
      <p style={{ margin: 0 }}>{bio}</p>
      <div style={{ width: "100%", display: "flex", justifyContent: "end" }}>
        <button
          style={{
            border: "2px solid #fff",
            backgroundColor: "transparent",
            color: "white",
            borderRadius: 30,
            marginTop: 5,
            fontSize: "0.8rem",
          }}
          onClick={() => handleViewProfile(id)}
        >
          View Profile {">"}
        </button>
      </div>
    </div>
  );
}

function BecomeMenteeSection() {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  function handleTakeAssessment() {
    navigate("../assessment?type=new&firstTime=true");
    setTimeout(() => {
      dispatch(
        setAlert({
          title: "Assessments",
          body: "Take an assessment to give your mentor clear insight into your career goals. The more details you share, the easier it'll be to work with you.",
        })
      );
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
  const navigate = useNavigate();
  const { logout } = useAuth0();
  const { user } = useSelector((store: ReduxRootState) => store.ClientSocket);
  const changeUsernameWithDialog = useChangeUsernameWithDialog();

  if (!user) {
    return <p>Waiting for user data...</p>;
  }

  const HandleViewProfile = () => {
    navigate(`/app/user?id=${user.id}`);
  };

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
            onClick={() => changeUsernameWithDialog()}
            style={{ marginLeft: 10, cursor: "pointer" }}
            color="white"
          />
        </div>
        <div>
          <MinimalisticButton
            onClick={() =>
              logout({ logoutParams: { returnTo: window.location.origin } })
            }
            style={{
              marginTop: 5,
              fontSize: "0.8rem",
            }}
          >
            Logout
          </MinimalisticButton>
          <MinimalisticButton
            onClick={HandleViewProfile}
            style={{
              marginTop: 5,
              fontSize: "0.8rem",
              marginLeft: 10,
            }}
          >
            View Profile
          </MinimalisticButton>
        </div>
      </div>
    </div>
  );
}
