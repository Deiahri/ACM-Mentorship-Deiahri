import { FormEvent, useState } from "react";
import MentorshipLogo from "../../components/MentorshipLogo/MentorshipLogo";
import { MyClientSocket } from "../../features/ClientSocket/ClientSocket";
import { useDispatch } from "react-redux";
import { closeDialog, setDialog } from "../../features/Dialog/DialogSlice";

export default function NewUserPage() {
  const [fName, setFName] = useState("");
  const [mName, setMName] = useState("");
  const [lName, setLName] = useState("");
  const [username, setUsername] = useState("");
  const dispatch = useDispatch();

  if (!MyClientSocket) {
    return <p>Connecting...</p>;
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    MyClientSocket?.createAccount({ fName, mName, lName, username }, () => {
      dispatch(
        setDialog({
          title: "Welcome to ACM Mentorships!",
          subtitle: "We're excited to have you. Have a look around!",
          buttons: [
            {
              text: "Okay",
              style: { backgroundColor: "orange", color: "white" },
              onClick: () => dispatch(closeDialog()),
            },
          ],
        })
      );
    });
  }

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
      <MentorshipLogo />
      <p
        style={{
          fontSize: "2rem",
          color: "white",
          textAlign: "center",
          margin: 0,
          marginBottom: 5,
        }}
      >
        Looks like you're new around here
      </p>
      <p
        style={{
          fontSize: "1.75rem",
          color: "#fffa",
          textAlign: "center",
          margin: 0,
        }}
      >
        Let's get you setup
      </p>
      <form
        onSubmit={handleSubmit}
        style={{
          display: "flex",
          flexDirection: "column",
          marginTop: 10,
          alignItems: "start",
        }}
      >
        <div>
          <p style={{ margin: 0, color: "white", fontSize: "1rem" }}>
            First Name
          </p>
          <input
            value={fName}
            onChange={(e) => setFName(e.target.value)}
            style={{ padding: 10, borderRadius: 5 }}
          />
        </div>

        <div>
          <p style={{ margin: 0, color: "white", fontSize: "1rem" }}>
            Middle Name
          </p>
          <input
            value={mName}
            onChange={(e) => setMName(e.target.value)}
            style={{ padding: 10, borderRadius: 5 }}
          />
        </div>

        <div>
          <p style={{ margin: 0, color: "white", fontSize: "1rem" }}>
            Last Name
          </p>
          <input
            value={lName}
            onChange={(e) => setLName(e.target.value)}
            style={{ padding: 10, borderRadius: 5 }}
          />
        </div>

        <div style={{ marginTop: 20 }}>
          <p style={{ margin: 0, color: "white", fontSize: "1rem" }}>
            Username
          </p>
          <input
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            style={{ padding: 10, borderRadius: 5 }}
          />
        </div>
        <button style={{ marginTop: 10, fontSize: "1rem" }}>Submit</button>
      </form>
    </div>
  );
}
