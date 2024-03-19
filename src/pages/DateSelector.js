import {useEffect, useState, useRef} from "react";

import { Routes, Route, Link, useNavigate } from 'react-router-dom'

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faRefresh } from '@fortawesome/free-solid-svg-icons'
function DateSelector(props){
    const [startEnd, setStartEnd] = useState({
      start : "",
      end : ""
    })
    const dateStartRef = useRef();
    const dateEndRef = useRef();
    useEffect(()=>{
      setStartEnd({start: props.data.start, end: props.data.end});
    },[])
    useEffect(()=>{
      dateStartRef.current.value = startEnd.start;
      dateEndRef.current.value = startEnd.end;
    },[startEnd])
    
    const enter = ()=>{
      let a, b = startEnd
      return {a, b};
    }

    const refresh = ()=>{
      setStartEnd({
        start : "",
        end : ""
      })
    }

    const click = (e, num) => {
      console.log(e);
      if(num === 0){
        props.select(startEnd);
      }
      else if(num === 1){
        if(startEnd !== props.value){
          console.log(props.value);
          setStartEnd(props.value)
        }
      }
      props.onOff(false);
    }

    const hypenBirth = (target) => {
      target.value = target.value
      .replace(/[^0-9]/g, '')
      .replace(/^(\d{4})(\d{2})(\d{2})$/, `$1-$2-$3`);
    }
    const [todayVal, setTodayVal] = useState("")
    useEffect(()=>{
      let today = new Date();
      const year = today.toLocaleDateString('en-US', {
        year: 'numeric',
      });
      const month = today.toLocaleDateString('en-US', {
        month: '2-digit',
      });
      const day = today.toLocaleDateString('en-US', {
        day: '2-digit',
      });
      let result = `${year}-${month}-${day}`
      setTodayVal(result);
      },[])
    return (
      <div className="dateSelector-bg" onClick={(e)=>{click(e, 0)}}>
        <div className="dateSelector-container" onClick={(e)=>{e.stopPropagation(); return;}}>
          <div className="dateSelector-logo"><p>The SpiroKit</p></div>
          <FontAwesomeIcon onClick={(e)=>{refresh()}} id="초기화" className='date-resetBtn' icon={faRefresh} style={{color: "#4b75d6",}} />
          {/* <input type="button" name="검사" value="기간 선택" /> */}
          <div className="dateInput-container">
            <div className="dateInputItem-container">
              <label htmlFor="dateStart">시작 일시</label>
              <input placeholder={todayVal} ref={dateStartRef} name="dateStart" type="text"
              onChange={(e)=>{
                let copy = startEnd.start;
                copy = e.target.value;
                setStartEnd( {...startEnd, start:copy})}}
              onInput={(e)=>{hypenBirth(e.target)}}
              />
            </div>
            <div className="dateInputItem-container">
              <label htmlFor="dateStart">종료 일시</label>
              <input placeholder={todayVal} ref={dateEndRef} name="dateEnd" type="text" 
              onChange={(e)=>setStartEnd({...startEnd, end:e.target.value})}
              onInput={(e)=>{hypenBirth(e.target)}}/>
            </div>
          </div>
          <div className="dateSelect-Btn-container">
            <input className="dateSelect-Btn dateSelect-cancel" type="button" value="취소" onClick={(e)=>{e.preventDefault();click(e, 1)}}/>
            <input className="dateSelect-Btn dateSelect-enter" type="button" value="확인" onClick={(e)=>{e.preventDefault();click(e, 0)}}/>
          </div>
        </div>
      </div>
    )
}

export default DateSelector
