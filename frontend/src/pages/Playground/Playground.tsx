
import 'react-calendar/dist/Calendar.css';
import MinimalisticInput from '../../components/MinimalisticInput/MinimalisticInput';
import MinimalisticTextArea from '../../components/MinimalisticTextArea/MinimalisticTextArea';

export default function Playground() {
  return (
    <>
      <div
      className={'pageBase'}
      >
        <MinimalisticInput placeholder='Work' disabled={!true}/>
        <MinimalisticTextArea/>
      </div>
    </>
  );
}
