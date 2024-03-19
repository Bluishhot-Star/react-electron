import { useState, useRef, useEffect} from 'react';
import axios from 'axios';

import { Routes, Route, Link, useNavigate,useLocation } from 'react-router-dom'

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faChevronLeft, faChevronDown } from '@fortawesome/free-solid-svg-icons'
const SerialNumReset = (props) =>{

  const click = (e,num) =>{
    console.log(e.target.value);
    props.onOff();
  }

  return (
    <div className='serialNumReset-bg'>
      <div className='serialNumReset-container'>
        <div className='serialNumReset-explanation'> 
          <p>ssss</p>
        </div>
        <div className='serialInput-container'>
          <input type='text'/>
        </div>
        <div className="serialNumReset-Btn-container">
          <input className="serialNumReset-Btn serialNumReset-cancel" type="button" value="아니오" onClick={(e)=>{e.preventDefault();click(e,0);}}/>
          <input className="serialNumReset-Btn serialNumReset-enter" type="button" value="설정하기" onClick={(e)=>{e.preventDefault();click(e,1);}}/>
        </div>
        
      </div>
    </div>
  );
}
export default SerialNumReset;