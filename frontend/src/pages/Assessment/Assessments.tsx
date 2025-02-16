import { useSelector } from "react-redux";
import { ReduxRootState } from "../../store";
import { useEffect, useState } from "react";
import {
  ClientSocketUser,
  MyClientSocket,
} from "../../features/ClientSocket/ClientSocket";
import { useNavigate, useSearchParams } from "react-router-dom";
import { AssessmentPreviewObj, ObjectAny } from "../../scripts/types";
import { unixToDateString } from "../../scripts/tools";
import MinimalisticButton from "../../components/MinimalisticButton/MinimalisticButton";

export default function Assessments() {
  const navigate = useNavigate();
  const { ready } = useSelector((store: ReduxRootState) => store.ClientSocket);
  const [params, _] = useSearchParams();
  const [user, setUser] = useState<ClientSocketUser | undefined | false>();

  const id = params.get("id");
  const origin = params.get("origin");

  useEffect(() => {
    if (!id || !MyClientSocket) {
      return;
    }

    MyClientSocket.GetUser(id, (v: boolean | ObjectAny) => {
      if (typeof v == "boolean") {
        setUser(false);
        return;
      }
      setUser(v);
    });
  }, [id, ready]);

  if (!id) {
    return <p>No ID.</p>;
  }

  if (!user) {
    return <p>Loading...</p>;
  } else if (typeof user == "boolean") {
    return <p>User does not exist.</p>;
  }

  function handleBackButton() {
    if (origin == 'home') {
      navigate(`/app/home`);
    } else if (origin == 'user') {
      navigate(`/app/user?id=${id}`);
    } else {
      navigate(`/app/user?id=${id}`);
    }
  }

  const { fName, lName, assessments } = user;
  let BackButtonText: string;
  if (!origin) {
    BackButtonText = `< ${fName} ${lName}`;
  } else if (origin == 'home') {
    BackButtonText = '< Home';
  } else if (origin == 'user') {
    BackButtonText = `< ${fName} ${lName}`;
  } else {
    BackButtonText = `< ${fName} ${lName}`;
  }

  return (
    <div
    className={'pageBase'}
    >
      <MinimalisticButton style={{fontSize: '0.8rem', marginBottom: 10}} onClick={handleBackButton}>{BackButtonText}</MinimalisticButton>
      <p style={{ margin: 0, fontSize: "1.5rem" }}>
        {fName} {lName}'s Assessments
      </p>
      <div style={{ display: "flex", flexWrap: "wrap", marginTop: 10 }}>
        {assessments && Object.entries(assessments).map(([assessmentID, assessmentObj]: [string, AssessmentPreviewObj]) => {
          return <AssessmentCard key={`button_${assessmentID}`} id={assessmentID} dateUnix={assessmentObj.date} />;
        })}
        {
          !assessments && <p style={{margin: 0, fontSize: '1.25rem'}}>No assessments</p>
        }
      </div>
      <MinimalisticButton style={{marginTop: 10}} onClick={() => navigate('/app/assessment?type=new')}>Add Assessment +</MinimalisticButton>
    </div>
  );
}

function AssessmentCard({ dateUnix, id }: { dateUnix: number, id: string }) {
  const navigate = useNavigate();
  return (
    <div
      style={{
        borderRadius: 10,
        backgroundColor: "#222",
        border: "1px solid #fff1",
        overflow: "hidden",
        display: "flex",
        justifyContent: "end",
        padding: 10,
        boxShadow: "4px 4px 10px rgba(0, 0, 0, 0.6)",
        cursor: 'pointer',
        margin: 5
      }}
      onClick={() => navigate(`/app/assessment?id=${id}&origin=user`)}
    >
      <p
        style={{
          margin: 0,
          fontSize: "1.5rem",
          fontWeight: "300",
        }}
      >
        {unixToDateString(dateUnix)}
      </p>
    </div>
  );
}
