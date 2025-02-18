import { useNavigate } from "react-router-dom";
import MinimalisticButton from "../../components/MinimalisticButton/MinimalisticButton";

export default function MentorGuidelinesPage() {
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
      <div style={{ width: "100%", paddingLeft: "3rem", paddingBottom: "1rem" }}>
        <MinimalisticButton onClick={() => navigate(-1)}>Back</MinimalisticButton>
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
            Mentor Guidelines
          </h1>
          <h2
            style={{
              fontSize: "1.25rem",
              textAlign: "center",
            }}
          >
            General rules on how to be a mentor
          </h2>
        </div>
        <img
          src="https://wallpapercave.com/wp/wp5847395.jpg"
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
        <span style={{ fontSize: "1.75rem", fontWeight: 600 }}>
          Effective Mentoring Guidelines
        </span>
        <p>
          Great mentoring creates lasting impact. While styles vary, these core
          principles ensure success:
        </p>

        <span style={{ fontSize: "1.25rem", marginTop: "1rem" }}>
          Understanding Your Mentee
        </span>
        <p>
          Review <b>self-assessments</b> to grasp their career stage and
          aspirations. This baseline helps tailor your guidance effectively.
        </p>

        <span style={{ fontSize: "1.25rem", marginTop: "1rem" }}>
          Goal-Setting and Progress
        </span>
        <p>
          Have mentees document specific goals and related tasks. Track
          completion dates to measure progress, while acknowledging that
          everyone's journey and circumstances differ.
        </p>

        <span style={{ fontSize: "1.25rem", marginTop: "1rem" }}>
          Maximizing Meetings
        </span>
        <p>
          Schedule weekly{" "}
          <b style={{ backgroundColor: "#832" }}>15-minute check-ins</b>. Both
          parties should prepare questions beforehand to make these discussions
          productive. Use this time to address topics beyond goals and
          assessments.
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
