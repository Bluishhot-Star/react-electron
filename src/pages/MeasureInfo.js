import { useState, useRef, useEffect} from 'react';
import axios from 'axios';

import { Routes, Route, Link, useNavigate,useLocation } from 'react-router-dom'

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faChevronLeft, faChevronDown } from '@fortawesome/free-solid-svg-icons'
const MeasureInfo = ()=>{
  
  const [accessToken,setAccessToken] = useState(window.api.get("get-cookies",'accessToken'));

  //검사 정보
  const [info,setInfo] = useState({
    type : "",
    administration: ""
  });

  // 숫자Input 강제성
  const numberInput = (target)=>{
    target.value = target.value.replace(/[^0.0-9.0]/g, '');
  };
  // 각종 useRef
  const FVCTypeRef = useRef();
  const SVCTypeRef = useRef();
  const mediTrueRef = useRef();
  const mediFalseRef = useRef();


  // 추가 완료 버튼 상태
  const addBtnRef = useRef();
  const [addBtnStatus, setAddBtnStatus] = useState(false);
  
  // useNavigate
  const navigatorR = useNavigate();
  const location = useLocation();
  const state = location.state;
  useEffect(()=>{
    console.log("HERE");
    console.log(state);
  })

  const administration = (value) =>{
    setInfo({...info, administration: value=="true"?"post":"pre"});
  };

  const type = (value) =>{
    setInfo({...info,type:value});
  };

  useEffect(()=>{
    console.log(info);
    if(info.administration !=='' && info.type !== ''){
      addBtnRef.current.classList.remove("disabled");
    }else{
      addBtnRef.current.classList += " disabled";
      console.log(addBtnRef.current.classList)
    }
  },[info]);




  const [date, setDate] = useState();
  useEffect(()=>{
    let today = new Date();   
    let year = today.getFullYear(); // 년도
    let month = (today.getMonth() + 1).toString().padStart(2,'0');  // 월
    let day = today.getDate().toString().padStart(2,'0');  // 일
    let tDate = year+"-"+month+"-"+day;
    console.log(tDate);
    setDate(tDate);
  })
  useEffect(()=>{
    if(date){
      axios.get(`/subjects/${location.state.chartNumber}/histories/?from=${date}`,{
        headers: {
          Authorization: `Bearer ${accessToken}`
          }
        })
        .then((res)=>{
          if(res.data.response.length == 0){
            mediTrueRef.current.disabled = true;
          }
        })
    }
  },[date])
  useEffect(()=>{
    setTimeout(()=>{
      FVCTypeRef.current.click()
      mediFalseRef.current.click()
    },100)
  },[])
  const [goTO, setGoTO] = useState(false)
  // let data1, data2;
  const [data1, setData1] = useState([]); //FVC 데이터
  const [data2, setData2] = useState([]); //SVC 데이터
  const [name, setName] = useState();
  const getMeasureData = async()=>{
    if(info.type == "FVC"){
      await axios.get(`/subjects/${state.chartNumber}/types/fvc/results/${date}` , {
        headers: {
          Authorization: `Bearer ${accessToken}`
        }
      }).then((res)=>{
        console.log(res);
        if(res.data.subCode === 2004){
          setData1(res.data.message);
        }
        else setData1(res.data.response);
      }).catch((err)=>{
        console.log(err);
      })
    }
    else if(info.type=="SVC"){
      await axios.get(`/subjects/${state.chartNumber}/types/svc/results/${date}` , {
        headers: {
          Authorization: `Bearer ${accessToken}`
        }
      }).then((res)=>{
        console.log(res);
        if(res.data.subCode === 2004){
          setData2(res.data.message);
        }
        else setData2(res.data.response);
      }).catch((err)=>{
        console.log(err);
      })
    }
    setGoTO(true);
  }
  useEffect(()=>{
    if(goTO){
      console.log(data1);
      console.log(data2);
      console.log(date);
      if(info.type == "FVC") navigatorR('/measurement', {state: {data:data1, date:date, name:state.name, chartNumber:state.chartNumber, type:info.administration}});
      else if(info.type == "SVC") navigatorR('/measurementSVC', {state: {data:data2, date:date, name:state.name, chartNumber:state.chartNumber, type:info.administration}});
    }
    else{}
  },[goTO])



  return(
    <>
      <div className="measure-info-page-container">
        <div className="measure-info-page-nav">
          <div className='measure-info-backBtn' onClick={()=>{navigatorR(-1)}}>
            <FontAwesomeIcon icon={faChevronLeft} style={{color: "#4b75d6",}} />
          </div>
          <p>검사 정보</p>
        </div>
        <div className="measure-info-page-main-container">
          <div className="inner">
            <form>

              {/* <div className="info-input-container">
                <label htmlFor="">담당의</label>
                <FontAwesomeIcon htmlFor="adminSelect" className='admin-chevronDown' icon={faChevronDown} style={{color: "#4b75d6",}} />
                <select
                id='adminSelect'
                ref={mangerIdRef}
                onChange={(e)=>{
                  let copy = examinee.managerId;
                  copy = e.target.value;
                  setExaminee({...examinee, managerId: copy});
                }}
                >
                  <option value="">담당자명</option>
                  {managers.map((item)=>(
                    <option value={item.clinicianId} key={item.clinicianId}>
                        {item.clinicianName}
                    </option>
                  ))}
                </select>
                <FontAwesomeIcon className='measure-admin-chevronDown' icon={faChevronDown} style={{color: "#4b75d6",}} />
              </div> */}
              <div className="info-input-container">
                <label htmlFor="">검사 종류</label>
                <div className="radio-container">
                  <div className='radioBtn measure-radio' >
                    <input ref={FVCTypeRef}  onClick={(e)=>{console.log(e.target.value);type(e.target.value)}}
                    value="FVC" type="radio" name="type" id="fvc"/>
                    <label htmlFor="fvc">FVC</label>
                  </div>
                  <div className='radioBtn measure-radio'>
                    <input ref={SVCTypeRef} onClick={(e)=>{type(e.target.value)}}
                    value="SVC" type="radio" name="type" id="svc" />
                    <label htmlFor="svc">SVC</label>
                  </div>
                </div>
              </div>
              <div className="info-input-container">
                <label htmlFor="">약물 적용 여부</label>
                <div className="radio-container">
                  <div className='radioBtn measure-radio' >
                    <input ref={mediTrueRef} onClick={(e)=>{administration(e.target.value)}}
                    value="true" type="radio" name="medi" id="mediTrue"/>
                    <label htmlFor="mediTrue">예</label>
                  </div>
                  <div className='radioBtn measure-radio'>
                    <input ref={mediFalseRef} onClick={(e)=>{administration(e.target.value)}}
                    value="false" type="radio" name="medi" id="mediFalse" />
                    <label htmlFor="mediFalse">아니오</label>
                  </div>
                </div>
              </div>
              <div ref={addBtnRef} className="measure-btn" onClick={()=>{
                if(!addBtnRef.current.classList.contains("disabled")){
                  getMeasureData()
                }
                }}>검사하기</div>
            </form>
          </div>
        </div>
      </div>
    </>
  )
}
export default MeasureInfo;