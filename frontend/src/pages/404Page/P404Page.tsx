import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function P404Page() {
  const navigate = useNavigate();
  useEffect(() => {
    setTimeout(() => {
      navigate('/app/home', { replace: true });
    }, 4000);
  }, []);
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
      <p style={{color: 'white', fontSize: '2rem', margin: 0}}>Seems like you're lost</p>
      <p style={{color: 'white', fontSize: '1rem', margin: 0}}>Going to home page in 3 seconds.</p>
    </div>
  );
}