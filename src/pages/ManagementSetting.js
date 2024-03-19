import { useState, useRef, useEffect} from 'react';
import axios from 'axios';
import { Cookies, useCookies } from 'react-cookie';
import Alert from "../components/Alerts.js"
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faChevronLeft,faGear, faCog, faSearch, faCalendar, faChevronRight } from '@fortawesome/free-solid-svg-icons'

import { Routes, Route, Link, useNavigate,useLocation } from 'react-router-dom'
import { MdLightbulbOutline } from "react-icons/md";
const ManagementSetting= () =>{
    
  // const cookies = new Cookies();
  const [rate,setRate] = useState(window.api.get("get-cookies","manageRate"));
  const [time,setTime] = useState(window.api.get("get-cookies","manageTime"));
  const date= new Date();


  let navigator = useNavigate();
  const location = useLocation();
  const state = location.state;
  const onceRef = useRef();
  const twiceRef = useRef();
  const threeTRef = useRef();
  const fourTRef = useRef();
  const fiveTRef = useRef();
  const sixTRef = useRef();

  const threeSRef = useRef();
  const sixSRef = useRef();
  const tenSRef = useRef();
  const fifteenSRef = useRef();
  const twentySRef = useRef();
  const thirtySRef = useRef();

  useEffect(()=>{
    console.log(time)

    if(time == 3){        
      threeSRef.current.checked = true;
    }else if(time == 6){
      sixSRef.current.checked = true;
    }else if(time == 10){
      tenSRef.current.checked = true;
    }else if(time == 15){
      fifteenSRef.current.checked = true;
    }else if(time == 20){
      twentySRef.current.checked = true;
    }else if(time == 30){
      thirtySRef.current.checked = true;
    }else{
      sixSRef.current.checked = true;
    }

    console.log(rate)  
    if(rate === '1'){
          
      onceRef.current.checked = true;
    }else if(rate === '2'){
      twiceRef.current.checked = true;

    }else if(rate === '3'){
      threeTRef.current.checked = true;

    }else if(rate === '4'){
      fourTRef.current.checked = true;

    }else if(rate === '5'){
      fiveTRef.current.checked = true;

    }else if(rate === "6"){
      sixTRef.current.checked = true;

    }else{
      threeTRef.current.checked = true;
    }
    
    
    
  },[])

  const timeF=(exhaleT,timerE)=>{
    setTime(exhaleT);
  }
  useEffect(()=>{

    date.setFullYear(2100);
    const manageTimeData = {
      name: 'manageTime',
      data : `${time}`,
      date : date
    }
    window.api.send("set-cookie", manageTimeData);
    console.log(typeof(manageTimeData.data))

  },[time])

  useEffect(()=>{
    console.log(typeof(rate))
    date.setFullYear(2100);
    const manageRateData = {
      name: 'manageRate',
      data : rate,
      date : date
    }
    window.api.send("set-cookie", manageRateData);


  },[rate])



  return(
    <div className="managementSetting-page-container">
      <div className="managementSetting-page-nav">  
        <div className='backBtn' onClick={()=>{navigator(-1)}}>
          <FontAwesomeIcon icon={faChevronLeft} style={{color: "#4b75d6",}} />
        </div>
        <p>검사 설정</p>
      </div>
        <div className="respiration-container">
          <div className="change-respiration-field">
            <p>검사 중 호흡 횟수</p>
            <div>
              <div className='bulbIcon-container'>
                <MdLightbulbOutline className='bulbIcon'/>
              </div>
              <p>노력성 호기 전 호흡 횟수를 설정할 수 있습니다. (기본값 3회)</p>
            </div>
            <div className='respiration-rate-field'>
              <div className='respiration-rate-radio'>
                <input ref={onceRef} 
                    onChange={(e)=>{setRate(e.target.value)}} 
                  value="1" type="radio" name="rate" id="once"/>
                <label htmlFor="once">1회</label>
              </div>

              <div className='respiration-rate-radio'>
                <input ref={twiceRef}
                    onChange={(e)=>{setRate(e.target.value)}} 
                  value="2" type="radio" name="rate" id="twice"/>
                <label htmlFor="twice">2회</label>
              </div>

              <div className='respiration-rate-radio'>
                <input ref={threeTRef}
                    onChange={(e)=>{setRate(e.target.value)}} 
                  value="3" type="radio" name="rate" id="TreeT"/>
                <label htmlFor="TreeT">3회</label>
              </div>
              
              <div className='respiration-rate-radio'>
                <input ref={fourTRef}
                    onChange={(e)=>{setRate(e.target.value)}} 
                  value="4" type="radio" name="rate" id="fourT"/>
                <label htmlFor="fourT">4회</label>
              </div>

              <div className='respiration-rate-radio'>
              <input ref={fiveTRef}
                    onChange={(e)=>{setRate(e.target.value)}}  
                  value="5" type="radio" name="rate" id="fiveT"/>
                <label htmlFor="fiveT">5회</label>
              </div>
              <div className='respiration-rate-radio'>
                <input ref={sixTRef}
                    onChange={(e)=>{setRate(e.target.value)}} 
                  value="6" type="radio" name="rate" id="sixT"/>
                <label htmlFor="sixT">6회</label>
              </div>
              
            </div>
          </div>
          <div className="change-respiration-field">
            <p>노력성 호기 시간 및 종료 시간 설정</p>
            <div>
              <div className='bulbIcon-container'>
                <MdLightbulbOutline className='bulbIcon'/>
              </div>
              <p>노력성 호기 시간과 타이머 종료 시간을 설정할 수 있습니다.(기본값 6초 / 15 초)</p>
            </div>

            <div className='respiration-time-field'>
              <div className='respiration-time-radio'>
                <input ref={threeSRef}
                    onChange={(e)=>{timeF(3,6)}} 
                  value='3' type="radio" name="time" id="threeS"/>
                <label htmlFor="threeS">3초/6초</label>
              </div>

              <div className='respiration-time-radio'>
                <input ref={sixSRef}
                    onChange={(e)=>{timeF(6,15)}} 
                  value="6" type="radio" name="time" id="sixS"/>
                <label htmlFor="sixS">6초/15초</label>
              </div>

              <div className='respiration-time-radio'>
                <input ref={tenSRef}
                    onChange={(e)=>{timeF(10,20)}} 
                  value="10" type="radio" name="time" id="tenS"/>
                <label htmlFor="tenS">10초/20초</label>
              </div>
              
              <div className='respiration-time-radio'>
                <input ref={fifteenSRef}
                    onChange={(e)=>{timeF(15,25)}} 
                  value="15" type="radio" name="time" id="fifteenS"/>
                <label htmlFor="fifteenS">15초/25초</label>
              </div>

              <div className='respiration-time-radio'>
              <input ref={twentySRef}
                    onChange={(e)=>{timeF(20,30)}} 
                  value="20" type="radio" name="time" id="twentyS"/>
                <label htmlFor="twentyS">20초/30초</label>
              </div>
              <div className='respiration-time-radio'>
                <input ref={thirtySRef}
                    onChange={(e)=>{timeF(30,60)}} 
                  value="30" type="radio" name="time" id="thirtyS"/>
                <label htmlFor="thirtyS">30초/60초</label>
              </div>

              
          </div>
            
          
        </div>
      </div>
    </div>
  );
}

export default ManagementSetting;