import { useState, useRef, useEffect} from 'react';
import axios from 'axios';
import {Cookies, useCookies } from 'react-cookie';

import { Routes, Route, Link, useNavigate,useLocation } from 'react-router-dom'

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faChevronLeft, faChevronDown } from '@fortawesome/free-solid-svg-icons'
const AddPatientCopy = ()=>{

  const [examinee,setExaminee] = useState({
    chartNumber: "",
    name: "",
    gender: "",//m 혹은 f 여야 함
    race: "4",//1 ~ 5 여야 함
    clinicianId: "",
    birthday: "",//yyyy-MM-dd 형식이어야 함
    subjectDetails: {
        height: "",//실수양식의 문자열만 허용
        weight: "",//실수양식의 문자열만 허용
        smoking: true,//boolean 타입이어야 함, 아닐 경우는 false 로 저장됨.
        smokingStartAge: "",//정수 문자열이어야 함, "" 허용
        smokingExperience: true,//boolean 타입이어야 함, 아닐 경우는 false 로 저장됨.
        smokingStopAge: "",//정수 문자열이어야 함, "" 허용
        smokingPackYear: ""//실수 문자열이어야 함, "" 허용
    }
    // managerId:"",//담당 매니저의 UUID
    // chartNumber:"",
    // name:"",
    // birthday:"",
    // gender:"",
    // info: {
    //   height: "",
    //   weight: "",
    // },
    // smoke: {
    //   experience: "", //true : 경험있음, false : 경험없음
    //   smoking: "", //true : 현재 흡연중, false : 현재 금연 상태
    //   amountDay: "", //하루 흡연량(갑 기준)
    //   startAge: "",
    //   stopAge: ""
    // }
    
  });
    // useNavigate
    const navigator = useNavigate();
  const [patch,setPatch] = useState(false);
  const submitAddP = async()=>{
    console.log("GH")
    let temp = {...examinee};
    
    if(examinee.subjectDetails.smoking === "true"){
      temp.subjectDetails.smoking = true;
    }
    else{
      temp.subjectDetails.smoking = false;
    }

    if(examinee.subjectDetails.smokingExperience=== "true"){
      temp.subjectDetails.smokingExperience = true;
    }
    else{
      temp.subjectDetails.smokingExperience = false;
    }
    console.log(temp);
    // PATCH 부분
    if(location.state.update && patch){
      console.log(patch)
      // axios.patch('/subjects',temp,{withCredentials : true})
      // .then((res)=>{
      //   console.log(res);
      // })
      // .catch((error)=>{
      //   console.log(error);alert("ERROR");
      // })
    }
    // POST 부분
    else if(!location.state.update){
      console.log(patch);
      
    }
    let date = new Date();
    navigator("/memberList/measureInfo", {state: {chartNumber : examinee.chartNumber, name:examinee.name}, date:`${date.getFullYear}-${(date.getMonth+1).toString().padStart(2, '0')}-${(date.getDay).toString().padStart(2, '0')}`});
  }
  const location = useLocation();
  const [accessToken,setAccessToken] = useState(window.api.get("get-cookies",'accessToken'));

  // 숫자Input 강제성
  const numberInput = (target)=>{
    target.value = target.value.replace(/[^0.0-9.0]/g, '');
  }

  // 성별radio값 반영
  const genderChange = (e)=>{
    let copy = examinee.gender;
    copy = e.target.value;
    setExaminee({...examinee, gender:copy});
  }
  // 흡연여부radio값 반영
  const smokeChange = (e, val)=>{
    let copy = examinee.subjectDetails;
    copy[val] = e.target.value;
    setExaminee({...examinee, subjectDetails:copy});
  }
  // 생년월일 하이픈
  const hypenBirth = (target) => {
    target.value = target.value
    .replace(/[^0-9]/g, '')
    .replace(/^(\d{4})(\d{2})(\d{2})$/, `$1-$2-$3`);
  }

  // 담당자 데이터 GET
  //page 증가시켜야함
  const [managers, setManagers] = useState([]);
  useEffect(()=>{
    axios.get('/clinicians?page=1&size=10',{
      headers: {
        Authorization: `Bearer ${accessToken}`
    }}).then((res)=>{
      setManagers(res.data.response.clinicians);
    }).catch((err)=>{
      console.log(err);
    })
  },[])
  
  useEffect(()=>{
    console.log("a")
    console.log(managers);
  },[managers])
  
  // 각종 useRef
  const mangerIdRef = useRef();
  const birthdayRef = useRef();
  const expTrueRef = useRef();
  const expFalseRef = useRef();
  const smokingTrueRef = useRef();
  const smokingFalseRef = useRef();
  const startAgeRef = useRef();
  const amountRef = useRef();
  const stopAgeRef = useRef();
  const maleRef = useRef();
  const femaleRef = useRef();
  const chartNumberRef = useRef();

  // smoke 상황별 버튼 활성화
  useEffect(()=>{
    let time = setTimeout(()=>{
      if(examinee.subjectDetails.smokingExperience === false || examinee.subjectDetails.smokingExperience === "false"){
        console.log("HERERER");
        console.log(examinee);
        smokingTrueRef.current.checked = false;
        smokingFalseRef.current.checked = false;
        smokingTrueRef.current.disabled = true;
        smokingFalseRef.current.disabled = true;
        startAgeRef.current.disabled = true;
        amountRef.current.disabled = true;
        stopAgeRef.current.disabled = true;
        let copy = examinee.subjectDetails;
        copy.smoking = "";
        copy.smokingStartAge = "";
        copy.smokingStopAge = "";
        copy.smokingPackYear = ""
        // copy.amountDay = "";
        setExaminee({...examinee, subjectDetails: copy});
      }
      else{
        console.log("HERE1");
        console.log(examinee);
        smokingTrueRef.current.disabled = false;
        smokingFalseRef.current.disabled = false;
        startAgeRef.current.disabled = false;
        amountRef.current.disabled = false;
      }
    },100)
    return()=>{clearTimeout(time)}
  },[examinee.subjectDetails.smokingExperience])

  useEffect(()=>{
    let time = setTimeout(()=>{
      if(examinee.subjectDetails.smokingExperience === false || examinee.subjectDetails.smokingExperience === "false")return;
      if(examinee.subjectDetails.smoking === false || examinee.subjectDetails.smoking === "false"){
        console.log("HERE11")
        stopAgeRef.current.disabled = false;
      }
      else{
        console.log("HERE2")
        stopAgeRef.current.disabled = true;
        let copy = examinee.subjectDetails;
        copy.stopAge = "";
        setExaminee({...examinee, subjectDetails: copy});
      }
    },200)

    return()=>{
      clearTimeout(time);
    }
  },[examinee.subjectDetails.smoking])

  // 담당자 명 기본값 css
  useEffect(()=>{
    if(examinee.clinicianId === ""){
      mangerIdRef.current.classList.add("unselect")
    }
    else{
      mangerIdRef.current.classList.remove("unselect")
    }
  },[examinee.clinicianId])

  // 생년월일 유효성 상태
  const [validity, setValidity] = useState(false);
  useEffect(()=>{
    let regExp = /^(\d{4})-(\d{2})-(\d{2})$/;
    let result = regExp.test(birthdayRef.current.value);
    setValidity(result);
  },[examinee["birthday"]])

  // 추가 완료 버튼 상태
  const addBtnRef = useRef();
  const [addBtnStatus, setAddBtnStatus] = useState(false);
  
  // 추가 완료 버튼 유효성 검사
  useEffect(()=>{
    if(!(examinee.clinicianId!==""&&examinee.chartNumber!==""&&examinee.name!==""&&examinee.birthday!==""
    &&examinee.gender!==""&&examinee.subjectDetails.height!==""&&examinee.subjectDetails.weight&&examinee.subjectDetails.smokingExperience!=="")){
      console.log("ch1");
      setAddBtnStatus(false);
      return;
    }
    if(!validity){
      setAddBtnStatus(false);
      return;
    }
    if(examinee.subjectDetails.smokingExperience === "true"){
      if(!(examinee.subjectDetails.smoking !== ""&&examinee.subjectDetails.amountDay !== ""&&examinee.subjectDetails.startAge !== "")){
        console.log("ch2");
        setAddBtnStatus(false);
        return;
      }
      if(examinee.subjectDetails.smoking === "false"){
        if(!(examinee.subjectDetails.smokingStopAge !== "")){
          console.log("ch3");
          setAddBtnStatus(false);
          return;
        }
      }
    }
    setAddBtnStatus(true);
  })

  // 추가 완료 버튼 css
  useEffect(()=>{
    if(addBtnStatus === true){
      addBtnRef.current.disabled = false;
    }
    else{
      addBtnRef.current.disabled = true;
    }
  },[addBtnStatus])



  //환자 정보 수정하기
  const [addUpdate,setAddUpdate] = useState(false);

  useEffect(()=>{
    console.log(location.state)
    if(location.state.chartNumber){
      console.log(chartNumberRef)
      axios.get(`/subjects/${location.state.chartNumber}`,{
        headers: {
          Authorization: `Bearer ${accessToken}`
      }}).then((res)=>{
        const exData = res.data.response;
        console.log(exData)
        setAddUpdate(location.state.update);
        //흡연 경혐
        if(exData.subjectDetails.smoking){
          expTrueRef.current.checked = true;
        }else{
          expFalseRef.current.checked = true;
        }
        //현재 흡연 여부
        if(exData.subjectDetails.smoking){
          smokingTrueRef.current.checked = true;
        }else{
          smokingFalseRef.current.checked = true;
        }
        //성별
        if(exData.gender === "m"){
          maleRef.current.checked = true;
        }else{
          femaleRef.current.checked = true;
        }
        
        setExaminee({
          ...examinee,
          clinicianId:exData.clinicianId,
          chartNumber:exData.chartNumber,
          name:exData.name,
          race: exData.race,
          birthday:exData.birthday,
          gender:exData.gender,
          subjectDetails: {
            height: exData.subjectDetails.height,
            weight: exData.subjectDetails.weight,
            smokingExperience: exData.subjectDetails.smokingExperience,
            smoking: exData.subjectDetails.smoking, 
            smokingPackYear: exData.subjectDetails.smokingPackYear,
            smokingStartAge: exData.subjectDetails.smokingStartAge,
            smokingStopAge: exData.subjectDetails.smokingStopAge
          }
      });
      }).catch((err)=>{
        console.log(err);
      })
      
    }
  },[])

  useEffect(()=>{
    console.log(patch)
  },[patch])
  return(
    <>
      <div className="add-patient-page-containerC">
        
        <div className="add-patient-page-nav">
          <div className='add-patient-backBtn' onClick={()=>{navigator(-1)}}>
            <FontAwesomeIcon icon={faChevronLeft} style={{color: "#4b75d6",}} />
          </div>
          <p onClick={()=>{console.log(examinee)}}>환자 정보 입력</p>

        </div>
        <div className="add-patient-page-top-container">
          <div className="inner">
            <div className="chartNumInput-container input-container">
              <label htmlFor="">차트넘버</label>
              <input type="number" value={examinee.chartNumber} ref={chartNumberRef} readOnly={location.state.update ? true : false}
              onChange={(e)=>{
                let copy = examinee.chartNumber;
                copy = e.target.value;
                setExaminee({...examinee, chartNumber: copy})
              }}/>
              <div className='charNumberInput-placeholder'>1글자 이상 20글자 이하인 영문과 숫자만 입력하세요.</div>
            </div>
            
          </div>
        </div>
        <div className="add-patient-page-bottom-container">
          <div className="inner">
            <div className="info-container">
              <p>기본 정보</p>
            </div>
            <div className="info-input-container">
              <label htmlFor="name">이름</label>
              <input type="text" name='name' value={examinee.name} 
              onChange={(e)=>{
                let copy = examinee.name;
                copy = e.target.value;
                setPatch(true);

                setExaminee({...examinee, name: copy})
              }}/>
            </div>
            <div className="info-input-container">
              <label htmlFor="">성별</label>
              <div className="radio-container">
                <div className='radioBtn' >
                  <input ref={maleRef} onChange={(e)=>{genderChange(e);setPatch(true)}} value="m" type="radio" name="gender" id="man"/>
                  <label htmlFor="man">남</label>
                </div>
                <div className='radioBtn'>
                  <input ref={femaleRef} onChange={(e)=>{genderChange(e);setPatch(true)}} value="f" type="radio" name="gender" id="woman" />
                  <label htmlFor="woman">여</label>
                </div>
              </div>
            </div>
            <div className="info-input-container">
              <label htmlFor="">신장</label>
              <input type="text" value={examinee.subjectDetails.height} placeholder='0'
              onInput={(e)=>{numberInput(e.target)}}
              onChange={(e)=>{
                let copy = examinee.subjectDetails;
                copy.height = e.target.value;
                setPatch(true);
                setExaminee({...examinee, subjectDetails: copy})
              }}/>
              <div className='inputMeasure'><p>cm</p></div>
            </div>
            <div className="info-input-container">
              <label htmlFor="">몸무게</label>
              <input type="text" value={examinee.subjectDetails.weight} placeholder='0'
              onInput={(e)=>{numberInput(e.target)}}
              onChange={(e)=>{
                let copy = examinee.subjectDetails;
                copy.weight = e.target.value;
                setPatch(true);
                setExaminee({...examinee, subjectDetails: copy})
              }}/>  
              <div className='inputMeasure'><p>Kg</p></div>
            </div>
            <div className="info-input-container">
              <label htmlFor="">생년월일</label>
              <input ref={birthdayRef} type="text" value={examinee.birthday} placeholder='0000-00-00'
              onInput={(e)=>{hypenBirth(e.target)}}
              onChange={(e)=>{
                let copy = examinee.birthday;
                copy = e.target.value;
                setPatch(true);
                setExaminee({...examinee, birthday: copy})
              }}/>
            </div>
          </div>
        </div>
        <div className="add-patient-page-bottom-container">
          <div className="inner">
            <div className="info-container">
              <p>추가 정보</p>
            </div>
            <div className="input-container">
              <label htmlFor="">담당자 선택</label>
              {/* <FontAwesomeIcon htmlFor="adminSelect" className='admin-chevronDown' icon={faChevronDown} style={{color: "#4b75d6",}} /> */}
              <select
              id='adminSelect'
              ref={mangerIdRef}
              value={examinee.clinicianId}
              onChange={(e)=>{
                let copy = examinee.clinicianId;
                copy = e.target.value;
                setPatch(true);

                setExaminee({...examinee, clinicianId: copy});
              }}>
                <option value="">담당자명</option>
                {managers.map((item)=>(
                  <option value={item.clinicianId} key={item.clinicianId}>
                      {item.clinicianName}
                  </option>
                ))}
              </select>
              <FontAwesomeIcon className='admin-chevronDown' icon={faChevronDown} style={{color: "#4b75d6",}} />
            </div>
            <div className="info-input-container">
              <label htmlFor="">흡연경험</label>
              <div className="radio-container">
                <div className='radioBtn' >
                  <input ref={expTrueRef} onChange={(e)=>{smokeChange(e,"smokingExperience");setPatch(true)}} value="true" type="radio" name="smokingExperience" id="expTrue"/>
                  <label htmlFor="expTrue">있음</label>
                </div>
                <div className='radioBtn'>
                  <input ref={expFalseRef} onChange={(e)=>{smokeChange(e,"smokingExperience");setPatch(true)}} value="false" type="radio" name="smokingExperience" id="expFalse" />
                  <label htmlFor="expFalse">없음</label>
                </div>
              </div>
            </div>
            <div className="info-input-container">
              <label htmlFor="">현재 흡연 여부</label>
              <div className="radio-container">
                <div className='radioBtn' >
                  <input ref={smokingTrueRef} onChange={(e)=>{smokeChange(e,"smoking");setPatch(true)}} value="true" type="radio" name="smoking" id="smokingTrue"/>
                  <label htmlFor="smokingTrue">흡연</label>
                </div>
                <div className='radioBtn'>
                  <input ref={smokingFalseRef} onChange={(e)=>{smokeChange(e,"smoking");setPatch(true)}} value="false" type="radio" name="smoking" id="smokingFalse" />
                  <label htmlFor="smokingFalse">금연</label>
                </div>
              </div>
            </div>
            <div className="info-input-container">
              <label htmlFor="">흡연 시작나이</label>
              <input ref={startAgeRef} type="text" value={examinee.subjectDetails.smokingStartAge} placeholder='0'
              onInput={(e)=>{numberInput(e.target)}}
              onChange={(e)=>{
                let copy = examinee.subjectDetails;
                copy.smokingStartAge = e.target.value;
                setPatch(true);
                setExaminee({...examinee, subjectDetails: copy})
              }}/>  
            </div>
            <div className="info-input-container">
              <label htmlFor="">하루 흡연량(갑)</label>
              <input ref={amountRef} type="text" value={examinee.subjectDetails.smokingPackYear} placeholder='0'
              onInput={(e)=>{numberInput(e.target)}}
              onChange={(e)=>{
                let copy = examinee.subjectDetails;
                copy.smokingPackYear = e.target.value;
                setPatch(true);
                setExaminee({...examinee, subjectDetails: copy})
              }}/>  
            </div>
            <div className="info-input-container">
              <label htmlFor="">금연한 나이</label>
              <input ref={stopAgeRef} type="text" value={examinee.subjectDetails.smokingStopAge} placeholder='0'
              onInput={(e)=>{numberInput(e.target)}}
              onChange={(e)=>{
                let copy = examinee.subjectDetails;
                copy.smokingStopAge = e.target.value;
                setPatch(true);
                setExaminee({...examinee, subjectDetails: copy})
              }}/>  
            </div>
          </div>
        </div>
        <button ref={addBtnRef} className="add-complete-btnC"
          onClick={(e)=>{
            e.preventDefault();
            console.log(examinee);
            submitAddP();
          }}><p>검사하기</p></button></div>
      
    </>
  )
}
export default AddPatientCopy;