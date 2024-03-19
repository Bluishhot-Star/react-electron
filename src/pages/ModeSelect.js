import { useState, useRef, useEffect} from 'react';
import axios from 'axios';
import { Cookies, useCookies } from 'react-cookie';
import Alert from "../components/Alerts.js"
import { Routes, Route, Link, useNavigate } from 'react-router-dom'
import { GrView } from "react-icons/gr";

const ModeSelect = () =>{
  let navigate = useNavigate();
  return(
    <div className="mode-select-page-container">
      <div className="mode-select-main-container">
        <div className="mode-select-btn-container">
          <p>모드선택</p>
          <div className="mode-select-btn public-mode-btn" onClick={()=>{navigate("/login")}}>
            <p>Public Mode</p>
          </div>
          <div className="mode-select-btn private-mode-btn">
            <p>Private Mode</p>
          </div>
        </div>
      </div>
      
    </div>
  );
}

export default ModeSelect;