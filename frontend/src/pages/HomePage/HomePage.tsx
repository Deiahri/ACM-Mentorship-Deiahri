import { useSelector } from "react-redux";
import { ReduxRootState } from "../../store";
import { Fragment } from "react";
import {
  MyClientSocket,
} from "../../features/ClientSocket/ClientSocket";
import FileTabContainer from "../../components/FileTabContainer/FileTabContainer";
import { GoalCard } from "../GoalsPage/GoalsPage";
import UseRecommendTodos from "../../hooks/UseRecommendTodos/UseRecommendTodos";

export default function HomePage() {
  const { user, ready } = useSelector(
    (store: ReduxRootState) => store.ClientSocket
  );

  if (!user || !MyClientSocket || !ready) {
    return <p>Loading...</p>;
  }

  return (
    <div className={"pageBase"}>
      <HomePageHeader />
      <div style={{}} />
      <HomePageDashboard />
    </div>
  );
}

function HomePageDashboard() {
  const { recommendTodoCard, recommendTodos } = UseRecommendTodos();
  const recommendedTodos = recommendTodos();
  return (
    <FileTabContainer
      tabs={[
        {
          name: "Todo",
          children: (
            <>
              {recommendedTodos.map((rec, index) => {
                return (
                  <Fragment key={`ToDo_${index}`}>
                    {recommendTodoCard(...rec)}
                  </Fragment>
                );
              })}
              {recommendedTodos.length == 0 && (
                <div style={{display: 'flex', padding: '1rem', flexDirection: 'column'}}>
                  <span style={{ fontSize: "1.5rem" }}>Nothing to do...</span>
                  <span style={{ fontSize: "1rem" }}>Yeah</span>
                </div>
              )}
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
    ></FileTabContainer>
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
          return <GoalCard key={`goal_${goalID}`} id={goalID} name={goalPreviewObj.name} />;
        })}
      </div>
      {userGoals.length == 0 && recommendTodoCard("CreateFirstGoal")}
    </>
  );
}

function HomePageHeader() {
  const { user } = useSelector((store: ReduxRootState) => store.ClientSocket);


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
          <span style={{fontSize: '1.75rem', fontWeight: 300}}>Home</span>
        </div>
      </div>
    </div>
  );
}

