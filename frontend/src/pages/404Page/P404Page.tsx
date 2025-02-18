import { useNavigate } from "react-router-dom";
import MinimalisticButton from "../../components/MinimalisticButton/MinimalisticButton";

export default function P404Page() {
  const navigate = useNavigate();
  return (
    <div
      className={'pageBase'}
      style={{display: 'flex', justifyContent: 'center', alignItems: 'center'}}
    >
      <p style={{color: 'white', fontSize: '2rem', margin: 0}}>Seems like you're lost</p>
      <p style={{color: 'white', fontSize: '1rem', margin: 0}}>Let's go back to the home page.</p>
      <MinimalisticButton onClick={() => navigate('/app/home')} style={{marginTop: '0.5rem'}} >Home Page</MinimalisticButton>
    </div>
  );
}