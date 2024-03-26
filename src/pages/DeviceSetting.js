import { useState, useRef, useEffect} from 'react';
import axios from 'axios';
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";

import { FaEdit } from "react-icons/fa";
import { RiCalendarEventLine } from "react-icons/ri";
import { useSelector } from "react-redux"

import { useNavigate,useLocation } from 'react-router-dom'
import DateSelector from './DateSelector.js'
import SerialSetting from "../components/SerialSetting.js"

const DeviceSetting= () =>{
    
  const [accessToken,setAccessToken] = useState(window.api.get("get-cookies",'accessToken'));
  const [deviceList,setDeviceList] = useState([]);
  const [calibrations,setCalibrations] = useState([]);
  const [chartNumber, setChartNumber] = useState("");
  const [curtainStat,setCurtainStat] = useState(true);
  const [dateSelectorStat, setDateSelectorStat] = useState(false);
  const [inspectionDate, setInspectionDate] = useState({
    start : "",
    end : ""
  });

  let navigator = useNavigate();
  const location = useLocation();
  const state = location.state;

  useEffect(()=>{
    axios.get(`/devices?sort=serialNumber&order=asc`,{
      headers: {
        Authorization: `Bearer ${accessToken}`
      }}).then((res)=>{
        // console.log(res.data.response);
        if(res.subCode !== 2004){
          setDeviceList(res.data.response);
        }
      }).catch((err)=>{
        console.log(err);
      });
  },[])

  const click = (deviceNum) =>{
    axios.get(`/devices/${deviceNum}/calibrations`,{
      headers: {
        Authorization: `Bearer ${accessToken}`
      }}).then((res)=>{
        console.log(res.data.response);
        setCurtainStat(false)
        setCalibrations(res.data.response);
        setChartNumber(deviceNum);
      }).catch((err)=>{
        console.log(err);
      });
  }

  useEffect(()=>{
    if(chartNumber !== ""){
      axios.get(`/devices/${chartNumber}/calibrations?from=${inspectionDate.start === "" ? "2000-01-01" : inspectionDate.start}&to=${inspectionDate.end === "" ? "2099-01-01" : inspectionDate.end}`,{
        headers: {
          Authorization: `Bearer ${accessToken}`
        }}).then((res)=>{
          console.log(res.data.response);
          setCurtainStat(false)
          setCalibrations(res.data.response);
        }).catch((err)=>{
          console.log(err);
        });
    }
    
  },[inspectionDate]);

  const dateSelect = (select) =>{
    console.log(select);
    setInspectionDate(select);
}

  const gainResult = (calibrationId) =>{
    axios.get(`/calibrations/${calibrationId}`,{
      headers: {
        Authorization: `Bearer ${accessToken}`
      }}).then((res)=>{
        console.log(res.data.response);
        navigator('/setting/deviceSetting/gainResultPage',{state:{result:res.data.response}});
      }).catch((err)=>{
        console.log(err);
      });

  }

  // 씨리얼넘버 설정창
  let deviceInfo = useSelector((state) => state.deviceInfo )
  const date= new Date();
  const [serialSettingStat, setSerialSettingStat] = useState(false);
  const [serialNum, setSerialNum] = useState("");
  const [deviceSerialSetting, setDeviceSerialSetting] = useState(false);
  let serialFunc = async (val, data)=>{
    if(val=="confirm"){
      setSerialNum(data);
      date.setFullYear(2100);
      await window.api.send("set-cookie", {name:'serialNum',data:data,date:date});
      // await setCookie("serialNum", data,{expires:date,secure:"true"});
      setDeviceSerialSetting(true);
    }
  }
  useEffect(()=>{
    setSerialNum(window.api.get("get-cookies",'serialNum'))
    if(deviceInfo.id){
      setDeviceSerialSetting(true);
    }
  },[])



  return(
    <div className="deviceList-page-container">
      {serialSettingStat ? <SerialSetting content="검사를 시작하시겠습니까?" btn={true} onOff={setSerialSettingStat} select={serialFunc} serialNum={serialNum} setSerialNum={setSerialNum} /> : null}
      {dateSelectorStat ? <DateSelector data={inspectionDate} onOff={setDateSelectorStat} select={dateSelect}/> : null}
      <div className='deviceList-page-nav'>
        <div className='backBtn' onClick={()=>{navigator(-1)}}>
          <FaChevronLeft style={{color: "#4b75d6",}}/>
        </div>
        <p>디바이스 관리</p>
      </div>

      <div className='deviceList-page-left-container'>
        <div className='device-list-container'>
          <div className="add-device-btn-container">
            <div>
              디바이스 목록
            </div>
            <div className="add-device-btn" onClick={()=>{
              setSerialSettingStat(true)
            }}>
              <FaEdit />제조번호 재설정
            </div>
          </div>
          <div className='device-list'> 
            <div className='device-list-column'>
              <div className='device-list-column-name'>제조번호</div>
              <div className='device-list-column-name'>보정 횟수</div>
            </div>
            <div className='device-item-container' >
              {
                deviceList.map((item,index)=>{
                  return(
                    <div id={"deviceItem"+index} className='device-list-item' key={item.serialNumber} onClick={(e)=>click(item.serialNumber)}>
                      <div className='device-item-serialNumber'><p>{item.serialNumber}</p></div>
                      <div className='device-item-calibrationCount'><p>{item.calibrationCount}</p></div>
                    </div>
                  )
                })
              }
            </div>
          </div>
        </div>
      </div>
      
      <div className='deviceList-page-right-container'>
        {
          curtainStat ? 
          <div className='curtain'>
            <div className='curtain-img-container'>
              <div><img src={process.env.PUBLIC_URL + '/device.svg'} /></div>
              <div><img src={process.env.PUBLIC_URL + '/device.svg'} /></div>
              <div><img src={process.env.PUBLIC_URL + '/device.svg'} /></div>
              <div className='curtain-img-text'>디바이스를 먼저 선택해주세요.</div>
            </div>
          </div> 
          : 
          null
        }
        <div className='device-personal-container'>
          <div className="calibration-date-container">
            <div className="calibration-selected-date-container">
              <div>보정 이력</div>
              <div className='calibration-selected-date'>
                <div className="calibration-selected-date-start">{inspectionDate.start ? inspectionDate.start : "0000-00-00"}</div>
                <div>~</div>
                <div className="calibration-selected-date-end">{inspectionDate.end ? inspectionDate.end : "0000-00-00"}</div>
              </div>
            </div>
            <div className="calibration-select-date-btn-container" onClick={()=>{
                  setDateSelectorStat(!dateSelectorStat)
                }}>
                <RiCalendarEventLine className='calenderIcon'/>
              <div className="calibration-select-date-btn">기간선택</div>
            </div>
          </div>
          <div className="calibration-list">
              <div className="calibration-item-container">
                {calibrations.map((item, index)=>(
                  // <Link key={item} to={`/ss/${examinee}/${item}`}>
                  <div key={index} className="calibration-item" onClick={()=>{gainResult(item.calibrationId)}}>
                    <div>보정 일시</div>
                    <div className='calibration-item-date'>{item.date}</div>
                    <div className="calibration-item-right-chevron">
                      <FaChevronRight style={{color: "#4b75d6",}}/>
                    </div>
                  </div>
                ))}
              </div>
            </div>
        </div>
      </div>
      

    </div>
  );
}

export default DeviceSetting;