import Transition from "../../components/Transition/Transition";

export default function ConnectingPage() {
  return (
    <div
      className="pageBase"
      style={{ justifyContent: "center", alignItems: "center" }}
    >
      <span style={{ fontSize: "1.5rem" }}>Connecting...</span>
      <Transition type={'fade'} toggle={true} initialToggle={false} delayBefore={5000}>
        <span style={{ fontSize: "1rem", textAlign: 'center', padding: '0.1rem' }}>This is taking a while... we're trying to wake up the server.</span>
      </Transition>
    </div>
  );
}
