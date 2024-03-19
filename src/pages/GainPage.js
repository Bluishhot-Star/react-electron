import { useState, useRef, useEffect} from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom'
import Alert from "../components/Alerts.js"
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faChevronLeft, faChevronDown } from '@fortawesome/free-solid-svg-icons'

const GainPage = () =>{
  const [gainInfo, setGainInfo] = useState({
    temperature : "",
	  humidity : "",
    pressure:""
  });
  
  const chBtn = useRef();
  let navigator = useNavigate();
  
  useEffect(()=>{
    console.log(gainInfo)
    if(gainInfo.temperature !=="" && gainInfo.humidity !=="" && gainInfo.pressure !== ""){
        chBtn.current.disabled =false;
    }else{
        chBtn.current.disabled = true;
    }
  },[gainInfo])
  
  const GainMeasurement = () =>{
    console.log(gainInfo)
    navigator("./gainMeasurementPage",{state:gainInfo})
  }
  return(
    <div className="gain-info-page-container">
      <div className="gain-info-page-nav">  
        <div className='backBtn' onClick={()=>{navigator(-1)}}>
          <FontAwesomeIcon icon={faChevronLeft} style={{color: "#4b75d6",}} />
        </div>
        <p>보정 정보</p>
      </div>
        <div className="gain-info-list-container">
            <div className='gain-field'>
              <label htmlFor="temperature"> 
                온도
              </label>
              <input
                type="number" name='temperature'step="0.01" placeholder='°C'
                onChange={(e)=>{setGainInfo({...gainInfo,temperature : parseFloat(e.target.value).toFixed(2).toString()})}}
              />
            </div>

            <div className='gain-field'>
              <label htmlFor="humidity">
                습도
              </label>
              <input
                type="number"  name='humidity'step="0.01" placeholder='%'
                onChange={(e)=>{setGainInfo({...gainInfo,humidity:parseFloat(e.target.value).toFixed(2).toString()})}}
              />
            </div>
          <div className='gain-field'>
            <label htmlFor="pressure">
              기압
            </label>
            <input
              type="numbe" name='pressure' step="0.01" placeholder='cmH2O'
              onChange={(e)=>{setGainInfo({...gainInfo,pressure:parseFloat(e.target.value).toFixed(2).toString()})}}
            />
          </div>
        <button ref={chBtn} className ='chBtn' onClick={GainMeasurement}>보정 하기</button>
      </div>
    </div>
  );
}

export default GainPage;