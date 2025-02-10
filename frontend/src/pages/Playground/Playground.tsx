import Calendar from 'react-calendar'
import 'react-calendar/dist/Calendar.css';

export default function Playground() {
  return (
    <div
      style={{
        width: "100vw",
        height: "100%",
        minHeight: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        padding: "3rem",
        backgroundColor: "#111",
        flexDirection: "column",
        boxSizing: "border-box",
      }}
    >
      <Calendar calendarType='hebrew' onClickDay={(v) => console.log(v)}/>
    </div>
  );
}
