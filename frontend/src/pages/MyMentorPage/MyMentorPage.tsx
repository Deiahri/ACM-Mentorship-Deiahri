import { useSelector } from "react-redux";
import { ReduxRootState } from "../../store";
import { useEffect, useState } from "react";
import {
  ClientSocketUser,
  MyClientSocket,
} from "../../features/ClientSocket/ClientSocket";
import { useNavigate } from "react-router-dom";
import MinimalisticButton from "../../components/MinimalisticButton/MinimalisticButton";
import FileTabContainer from "../../components/FileTabContainer/FileTabContainer";
import { GoalCard } from "../GoalsPage/GoalsPage";
import UseRecommendTodos from "../../hooks/UseRecommendTodos/UseRecommendTodos";
import { IoChatbubbleOutline } from "react-icons/io5";
import useChatWithUser from "../../hooks/UseChatWithUser/UseChatWithUser";

export default function MymentorPage() {
  const { user, ready } = useSelector(
    (store: ReduxRootState) => store.ClientSocket
  );

  if (!user || !MyClientSocket || !ready) {
    return <p>Loading...</p>;
  }

  return (
    <div className={"pageBase"}>
      <MyMentorPageHeader />
      <div style={{}} />
      <MyMentorPageDashboard />
    </div>
  );
}

function MyMentorPageDashboard() {
  const { user } = useSelector((store: ReduxRootState) => store.ClientSocket);
  const hasMentor = user?.mentorID ? true : false;
  const isMentee = user?.isMentee || false;
  const { recommendTodoCard } = UseRecommendTodos();
  return (
    <>
      <FileTabContainer
        tabs={[
          {
            name: "Mentor",
            children: (
              <>
                {hasMentor && <CurrentMentorInfo />}
                {!hasMentor && (isMentee ? <MentorSearchTool />:recommendTodoCard('TakeFirstAssessment'))}
              </>
            ),
          },
          {
            name: "Goals",
            children: (
              <>
                <PreviewGoalsPage />
              </>
            ),
          },
        ]}
      />
      <div style={{ height: "5rem" }} />
    </>
  );
}

function PreviewGoalsPage() {
  const { user } = useSelector((store: ReduxRootState) => store.ClientSocket);
  const { recommendTodoCard } = UseRecommendTodos();
  const userGoals = Object.entries(user?.goals || {});
  return (
    <>
      <div style={{ width: "100%", display: "flex" }}>
        {userGoals.map(([goalID, goalPreviewObj]) => {
          return <GoalCard id={goalID} name={goalPreviewObj.name} />;
        })}
      </div>
      {userGoals.length == 0 && recommendTodoCard("CreateFirstGoal")}
    </>
  );
}

function MyMentorPageHeader() {
  const { user } = useSelector((store: ReduxRootState) => store.ClientSocket);
  const navigate = useNavigate();
  // if (!user) {
  //   return <p>Waiting for user data...</p>;
  // }


  const { username } = user || {};
  return (
    <div
      style={{
        display: "flex",
        paddingLeft: "0.75rem",
        alignItems: "center",
        paddingTop: "2rem",
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
            Welcome {username || "NoUsername"}
          </p>
        </div>
        <div>
          <span style={{ fontSize: "1.75rem", fontWeight: 300 }}>My Mentor</span>
        </div>
        <div style={{marginTop: '0.5rem'}}>
          <MinimalisticButton onClick={() => navigate('/app/mentee-guidelines')}>Mentee Guidelines</MinimalisticButton>
        </div>
      </div>
    </div>
  );
}

function CurrentMentorInfo() {
  const { user, ready } = useSelector(
    (store: ReduxRootState) => store.ClientSocket
  );
  const [mentorObj, setMentorObj] = useState<ClientSocketUser | undefined>(
    undefined
  );

  if (!user || !MyClientSocket || !ready) {
    return <p>Loading...</p>;
  }

  const { mentorID } = user;

  useEffect(() => {
    function getMentor() {
      if (!mentorID || !ready) {
        return;
      }
      MyClientSocket?.GetUser(mentorID, (dat: Object) => {
        setMentorObj(dat);
      });
    }
    getMentor();
  }, [mentorID, ready]);

  if (!mentorObj) {
    return <p style={{ margin: 0, fontSize: "1.25rem" }}>You have no mentor</p>;
  }

  return (
    <div
      className="w-full xss:w-3/3 xs:w-2/3 sm:w-1/2 lg:w-1/3 xl:1/5"
      style={{ margin: "0.1rem" }}
    >
      <MentorTile mentor={mentorObj} />
    </div>
  );
}

function MentorTile({ mentor }: { mentor: ClientSocketUser }) {
  const chatWithUser = useChatWithUser();
  const navigate = useNavigate();
  const {
    username, // @ts-ignore
    fName, // @ts-ignore
    mName, // @ts-ignore
    lName, // @ts-ignore
    bio,
    id,
    displayPictureURL,
  } = mentor;
  return (
    <div
      style={{
        display: "flex",
        padding: "0.5rem",
        borderRadius: "0.5rem",
        border: "1px solid #fff3",
        backgroundColor: "#333",
        boxSizing: "border-box",
        width: "100%",
      }}
    >
      <img
        style={{
          width: "20%",
          aspectRatio: 1 / 1,
          height: "30%",
          objectFit: "cover",
          borderRadius: "50%",
        }}
        src={displayPictureURL}
      />
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          marginLeft: "0.5rem",
        }}
      >
        <span
          style={{
            fontSize: "1.25rem",
            lineHeight: "1.25rem",
            marginTop: "0.25rem",
          }}
        >
          {fName} {mName} {lName}
        </span>
        <span
          style={{ fontSize: "0.8rem", opacity: 0.6, marginLeft: "0.5rem" }}
        >
          @{username}
        </span>
        <span style={{ marginLeft: "0.5rem" }}>{bio || "No bio"}</span>
        <div
          style={{
            display: "flex",
            marginTop: "0.25rem",
            width: "100%",
            justifyContent: "end",
            flexWrap: "wrap",
            gap: "0.25rem",
          }}
        >
          <MinimalisticButton
            style={{ fontSize: "0.8rem" }}
            onClick={() => (id ? navigate(`/app/user?id=${id}`) : undefined)}
          >
            View Profile
          </MinimalisticButton>
          <MinimalisticButton
            style={{
              fontSize: "0.8rem",
              display: "flex",
              alignItems: "center",
            }}
            onClick={() => (id ? chatWithUser(id) : undefined)}
          >
            Chat <IoChatbubbleOutline style={{ marginLeft: "0.25rem" }} />
          </MinimalisticButton>
        </div>
      </div>
    </div>
  );
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
    <div>
      {mentors.length != 0 && (
        <span style={{ fontSize: "1.5rem" }}>View Our Mentors</span>
      )}
      <div
        style={{
          backgroundColor: "#393939",
          borderRadius: 5,
          padding: '0.75rem',
          display: "flex",
          flexWrap: "wrap",
          justifyContent: "start",
          width: "100%",
          boxSizing: "border-box",
        }}
      >
        {mentors.length == 0 && (
          <p style={{ margin: 0, fontSize: "1.25rem" }}>No mentors available</p>
        )}
        {mentors.map((mentor) => {
          return (
            <div
              className="w-full xss:w-3/3 xs:w-2/3 sm:w-1/2 lg:w-1/3 xl:1/5"
              key={`user_${mentor.id}`}
            >
              <MentorTile mentor={mentor} />
            </div>
          );
        })}
      </div>
    </div>
  );
}
