import { useNavigate } from "react-router-dom";
import MinimalisticButton from "../../components/MinimalisticButton/MinimalisticButton";

export default function MenteeGuidelinesPage() {
  const navigate = useNavigate();
  return (
    <div
      className={"pageBase"}
      style={{
        alignItems: "center",
        paddingTop: "2rem",
        paddingLeft: 0,
        paddingRight: 0,
        boxSizing: "border-box",
        paddingBottom: "10rem",
      }}
    >
      <div
        style={{ width: "100%", paddingLeft: "3rem", paddingBottom: "1rem" }}
      >
        <MinimalisticButton onClick={() => navigate(-1)}>
          Back
        </MinimalisticButton>
      </div>
      <div
        style={{
          position: "relative",
          zIndex: 0,
          width: "100%",
          boxSizing: "border-box",
          overflow: "hidden",
          marginBottom: "2rem",
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            zIndex: 20,
            position: "relative",
            paddingTop: "5rem",
            paddingBottom: "5rem",
          }}
        >
          <h1
            style={{
              fontSize: "3rem",
              lineHeight: "3rem",
              textAlign: "center",
            }}
          >
            Mentee Guidelines
          </h1>
          <h2
            style={{
              fontSize: "1.25rem",
              textAlign: "center",
            }}
          >
            How to be a good mentee
          </h2>
        </div>
        <img
          src="https://wallpaperaccess.com/full/1678028.jpg"
          style={{
            position: "absolute",
            top: 0,
            zIndex: 0,
            width: "100%",
            height: "100%",
            objectFit: "cover",
          }}
        />
      </div>

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          width: "30rem",
          maxWidth: "95vw",
        }}
      >
        <span style={{ fontSize: "1.25rem", marginTop: "1rem" }}>
          Self-Assessments
        </span>
        <p>
          Self-Assessments help keep track of your growth. Take one anytime
          something significant happens.
        </p>
        <p style={{ marginTop: "0.5rem" }}>Be sure to include:</p>
        <ul className="ul">
          <li style={{ marginLeft: "1rem" }}>
            - Technical skills and proficiency
          </li>
          <li style={{ marginLeft: "1rem" }}>
            - Career achievements and challenges
          </li>
          <li style={{ marginLeft: "1rem" }}>- Professional goals</li>
          <li style={{ marginLeft: "1rem" }}>- Areas needing guidance</li>
          <li style={{ marginLeft: "1rem" }}>- Work/learning preferences</li>
        </ul>

        <span style={{ fontSize: "1.25rem", marginTop: "1rem" }}>
          Goals and Tasks
        </span>
        <p>
          Break goals into specific, trackable tasks, write clear task
          descriptions, and mark tasks complete when done
        </p>

        <span style={{ fontSize: "1.25rem", marginTop: "1rem" }}>
          Communication
        </span>
        <p>
          Communicating using the mentorship portal messaging feature or agreed
          alternate platforms (Discord, GroupMe, etc.).
        </p>
        <p>
          Respect mentor's time - avoid excessive messaging, and remember:{" "}
          <span style={{ backgroundColor: "#841" }}>
            mentors guide, you execute
          </span>
        </p>

        <span style={{ fontSize: "1.1rem", marginTop: "2rem" }}>P.S.</span>
        <p>
          Since this program is new, we welcome your suggestions for improvement{" "}
          <a href="https://forms.gle/BcGk4HifrRQxvyce6" target="_blank">
            here
          </a>
          .
        </p>

        <div
          style={{
            width: "100%",
            display: "flex",
            justifyContent: "end",
            marginTop: "1rem",
          }}
        >
          <span>Thank you.</span>
        </div>
      </div>
    </div>
  );
}
