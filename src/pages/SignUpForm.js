import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import Alert from "../components/Alerts.js"
import { Routes, Route, Link, useNavigate } from 'react-router-dom'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faChevronLeft } from '@fortawesome/free-solid-svg-icons'
import { RiEyeFill, RiEyeLine } from "react-icons/ri";

const SignUpForm = () =>{
  const [values, setValues] = useState({
    countryId: "",
    organizationId: "",
    roleId: "",
    manager: {
      tel:"",
      name:"",
      loginId: "",
      password: "",
      reEnterPassword: ""
  }
  });
  const navigator = useNavigate();
  const [error, setError] = useState(undefined);
  const [validity, setValidity] = useState([-1, -1, -1, -1, -1]);
  const handleSubmit = async (event)=>{
    event.preventDefault();
    console.log({
      "loginId": values["manager"]["loginId"],
      "roleId": values["roleId"],
      "name": values["manager"]["name"],
      "password": values["manager"]["password"],
      "tel": values["manager"]["tel"],
      "confirmPassword": values["manager"]["reEnterPassword"],
    });
    
    axios.post("/auth/sign-up",
    {
      "loginId": values["manager"]["loginId"],
      "roleId": values["roleId"],
      "name": values["manager"]["name"],
      "password": values["manager"]["password"],
      "confirmPassword": values["manager"]["reEnterPassword"],
      // "tel": values["manager"]["tel"],
    }
    ,{withCredentials : true})
    .then((res)=>{
      console.log(res);
      navigator(-1);
    })
    .catch((error)=>{
      console.log(error);
      alert("ERROR");
    })
    
  };
  
  const hypenTel = (target) => {
    target.value = target.value
      .replace(/[^0-9]/g, '')
      .replace(/^(\d{3})(\d{4})(\d{4})$/, `$1-$2-$3`);
  }
  // 아이디 유효조건 확인 (Boolean)
  const reportName = (e)=>{
    return e.value.length >= 2;
  }
  // 아이디 유효조건 확인 (Boolean)
  const reportLoginID = (e)=>{
    let regExp = /^[a-zA-Z0-9]{5,20}$/;
    return regExp.test(e.value);
  }
  // 비밀번호 유효조건 확인 (Boolean)
  const reportPassword = (e)=>{
    let regExp = /^(?=.*[a-zA-Z])(?=.*[0-9])(?=.*[\W]).{8,20}$/;
    console.log(e.value)
    return regExp.test(e.value);
  }
  // 비밀번호 재확인 유효조건 확인 (Boolean)
  const reportReEnterPassword = (e)=>{
    if(values.manager.password === e.value) return true;
    else return false;
  }
  // 전화번호 유효조건 확인 (Boolean)
  const reportTel = (e)=>{
    let regExp = /^(\d{3})-(\d{4})-(\d{4})$/;
    return regExp.test(e.value);
  }
  // 유효조건 함수 리스트 객체
  const ValidityFunc = {
    0:reportName,
    1:reportLoginID,
    2:reportPassword,
    3:reportReEnterPassword,
    4:reportTel
  }
  // 유효조건 판별에 따른 css 변화 함수
  const setInput = (e, num, func)=>{
    if(e.value.length === 0){
      if(e.classList.contains("incorrect")){
        e.classList.remove("incorrect")
      }
      let copy = [...validity];
      copy[num] = -1;
      setValidity(copy);
      return;
    };

    if(!func(e)){
      if(e.classList.contains("incorrect"))return;
      e.classList+="incorrect"
      let copy = [...validity];
      copy[num] = false;
      setValidity(copy);
    }
    else{
      if(e.classList.contains("incorrect")){
        e.classList.remove("incorrect")
      }
      let copy = [...validity];
      copy[num] = true;
      setValidity(copy);
    }
  }


  // 알림창 상태
  const [alertState, setAlertState] = useState(true);

  //아이디 체크 메세지창
  const idChkAlert = useRef();
  const [idChkAlertVisible, setIdChkAlertVisible] = useState(false);
  //아이디 중복 메세지창 css 변화
  useEffect(()=>{
    if(idChkAlertVisible == true){
      idChkAlert.current.classList.add("visible");
      setTimeout(()=>{
        idChkAlert.current.classList.remove("visible");
        setIdChkAlertVisible(false);
    }, 2000)
    }
    else{
      // setAlertState(false);
    }
  },[idChkAlertVisible])  
  
  //아이디 중복 상태
  const [isIdDuplicated, setIsIdDuplicated] = useState(true);
  //아이디 중복 메세지창
  const idDupAlert = useRef();
  //아이디 중복 메세지창 onOff 상태
  const [idDupAlertVisible, setIdDupAlertVisible] = useState(false);

  //아이디 중복 메세지창 css 변화
  useEffect(()=>{
    if(idDupAlertVisible == true){
      idDupAlert.current.classList.add("visible");
      setTimeout(()=>{
        idDupAlert.current.classList.remove("visible");
        setIdDupAlertVisible(false);
    }, 2000)
    }
    else{
      // setAlertState(false);
    }
  },[idDupAlertVisible])

  //아이디값 오류 메세지창
  const idValAlert = useRef();
  //아이디값 오류 메세지창 onOff 상태
  const [idValAlertVisible, setIdValAlertVisible] = useState(false);

  //아이디값 오류 메세지창 css 변화
  useEffect(()=>{
    if(idValAlertVisible == true){
      idValAlert.current.classList.add("visible");
      setTimeout(()=>{
        idValAlert.current.classList.remove("visible");
        setIdValAlertVisible(false);
    }, 2000)
    }
    else {
      // setAlertState(false);
    }
  },[idValAlertVisible])

  //아이디 중복확인
  const checkId = () =>{
    if(values.manager.loginId === "" || validity[1]===false){
      setIdChkAlertVisible(true);
      setAlertState(true);
      return;
    }
    axios.post('/auth/check-id',{
      loginId: values.manager.loginId,
    },{withCredentials : true})
    .then((res) => {
      console.log(res)
      if(res.data.response){
        setIsIdDuplicated(true);
        setIdDupAlertVisible(true);
      }
      else{
        setIsIdDuplicated(false);
        setIdValAlertVisible(true);
      }
    }).catch((error) => {
      console.log(error);
      alert("에러");
    })
  }


  const nameRef = useRef();
  const idRef = useRef();
  const passwordRef = useRef();
  const reEnterPasswordRef = useRef();
  const telRef = useRef();

  useEffect(()=>{
    setInput(nameRef.current, 0, ValidityFunc[0]);
  },[values["manager"]["name"]])

  useEffect(()=>{
    setInput(idRef.current, 1, ValidityFunc[1]);
  },[values["manager"]["loginId"]])

  useEffect(()=>{
    setInput(passwordRef.current, 2, ValidityFunc[2]);
    let copy = values.manager
    copy.reEnterPassword = ""
    setValues({...values, manager: copy})
  },[values["manager"]["password"]])
  
  useEffect(()=>{
    setInput(reEnterPasswordRef.current, 3, ValidityFunc[3]);
  },[validity[2]])

  useEffect(()=>{
    setInput(reEnterPasswordRef.current, 3, ValidityFunc[3]);
  },[values["manager"]["reEnterPassword"]])
  useEffect(()=>{
    setInput(telRef.current, 4, ValidityFunc[4]);
  },[values["manager"]["tel"]])


  //기관 선택창
  const selectO = useRef();
  //직책 선택창
  const selectR = useRef();
  //직책 선책창
  //나라 UUID
  const [country, setCountry] = useState("");
  //나라 선택 값
  const [selectCValue, setSelectCValue] = useState("");
  //기관 선택 값
  const [selectOValue, setSelectOValue] = useState("");
  //직책 선택 값
  const [selectRValue, setSelectRValue] = useState("");
  //나라 리스트
  const [countries, setCountries] = useState([]);
  //기관 리스트
  const [organizations,setOrganizations] = useState([]);
  //직책 리스트
  const [roles, setRoles] = useState([]);
  //나라 UUID 선택
  const onChangeCSelect = (event) =>{
    setSelectCValue(event.target.value);
    setValues({
      ...values,
      countryId: event.target.value,
      organizationId: "",
      roleId: "",
    })
    setSelectOValue("");
    setSelectRValue("");
  }
  //기관 UUID 선택
  const onChangeOSelect = (event) =>{
    setSelectOValue(event.target.value); //기관UUID 저장
    setValues({
      ...values,
      organizationId: event.target.value,
      roleId: "",
    })
    setSelectRValue("");
  }
  //직책 UUID 선택
  const onChangeRSelect = (event) =>{
    console.log(event.target.value);
    setValues({
      ...values,
      roleId: event.target.value,
    })
    setSelectRValue(event.target.value);
  }
  //나라 json
  useEffect(() => {
    let time = setTimeout(()=>{
      axios.get('/countries?status=enabled')
      .then((res) => {
        console.log(res.data.response);
        setCountries(res.data.response);
        if(selectCValue === ""){
          selectO.current.disabled = true;
          selectR.current.disabled = true;
          return;
        };
        selectO.current.disabled = false;
        let countriesAlpha2 = res.data.response.filter(function(e){
          return e.alpha2 === selectCValue;
        })
        // UUID 정보 저장
        console.log(countriesAlpha2[0]);

        setCountry(countriesAlpha2[0].alpha2);
      }).catch((error) => {
        console.log(error);
        alert("에러");
      })
    },200)
    
    return()=>{
      clearTimeout(time);
    }
  },[selectCValue])

  //기관 json
  useEffect(()=>{
    if(country === "") return;
    axios.get(`/countries/${country}/clinics?status=enabled`)
    .then((res) => {
      //기관 리스트 저장
      setOrganizations(res.data.response);
    }).catch((error) => {
      console.log(error);
      alert("에러1");
    })
  },[country])

  //직책 json
  useEffect(()=>{
    if(selectOValue === "") {
      selectR.current.disabled = true;
      return;
    }
    selectR.current.disabled = false;
    console.log(selectCValue);
    console.log(selectOValue);
    axios.get(`/clinics/${selectOValue}/roles`)
    .then((res)=>{
      console.log(res)
      setRoles(res.data.response);
    }).catch((error) => {
      console.log(error);
      alert("에러11");
  })
  },[selectOValue])

  //나라, 기관, 직책 정보 values에 저장
  useEffect(()=>{
    if(selectRValue === "")return;
    console.log("Hello")
    setValues({
      ...values,
      countryId: country,
      organizationId: selectOValue,
      roleId: selectRValue,
    })
  },[selectRValue])

  //제출버튼
  const signUpBtn = useRef();

  const [btnStatus, setBtnStatus] = useState(false)

  useEffect(()=>{
    let time = setTimeout(()=>{
      console.log(validity);
      if((validity[0]===true&&validity[1]===true&&validity[2]===true&&validity[3]===true&&validity[4]===true)==false){
        console.log("ch1");
        setBtnStatus(false);
        return;
      }
      if((values["countryId"] !== "" && values["organizationId"] !== "" && values["roleId"] !== "" && !isIdDuplicated)==false){
        setBtnStatus(false);
        console.log("ch2");
        return;
      }
      setTimeout(()=>{
        setBtnStatus(true);
      },100)
    },200)
    
    return()=>{
      clearTimeout(time)
    }
  })

  useEffect(()=>{
    if(btnStatus){
      console.log(signUpBtn.current.innerText);
      signUpBtn.current.innerText = "유효성 확인중...";
      setTimeout(()=>{
        signUpBtn.current.innerText = "회원가입";
        signUpBtn.current.disabled = false
        setAlertState(false);
      },2300)
    }
    else{
      signUpBtn.current.disabled = true;
      setAlertState(true);
    }
  },[btnStatus])

  const [passType, setPassType] = useState(false);
  const [newPassType, setNewPassType] = useState(false);
  const [newPassChkType, setNewPassChkType] = useState(false);

  return(
    <div className="signUp-page-container">
      {
        //중복 아이디 알림
        alertState ? <Alert inputRef={idDupAlert} contents={"중복된 아이디가 있습니다.\n다시 입력하신 후 중복 검사를 해주세요."}/> : null
      }
      {
        //올바르지 않은 아이디 알림
        alertState ? <Alert inputRef={idChkAlert} contents={"올바른 아이디 형식이 아닙니다."}/> : null
      }
      {
        //사용가능한 아이디 알림
        alertState ? <Alert inputRef={idValAlert} contents={"사용 가능한 아이디입니다."}/> : null
      }
      <div className="signUp-title"><p>회원가입</p></div>
      <div className='backBtn' onClick={()=>{navigator(-1)}}>
        <FontAwesomeIcon icon={faChevronLeft} style={{color: "#4b75d6",}} />
      </div>
      <form onSubmit={handleSubmit}>
      <div className="signUp-field">
          <label htmlFor="name">이름
            {
            validity[0] === true || validity[0] === -1 ?
            <p className='hint'>이름을 입력하세요.</p>
            : <p className='hint hint-incorrect'>올바른 이름 형식이 아닙니다.</p>
            }
          </label>
          <input
            type="text" placeholder='이름' name='name'
            ref={nameRef}
            onChange={(e)=>{
              let copy = values.manager
              copy.name = e.target.value
              setValues({...values, manager: copy})}}
            value={values.manager.name}
          />
        </div>
        <div className="signUp-field">
          <label htmlFor="loginId">아이디
            {
            validity[1] === true || validity[1] === -1 ?
            <p className='hint'>5글자 이상 20글자 이하인 영문과 숫자를 사용하여 입력하세요.</p>
            : <p className='hint hint-incorrect'>올바른 아이디 형식이 아닙니다.</p>
            }
            <div className="idCheck" onClick={checkId}>아이디 중복검사</div>
          </label>
          <input
            type="text" placeholder='아이디' name='loginId'
            ref={idRef}
            onChange={(e)=>{
              setIsIdDuplicated(true);
              let copy = values.manager
              copy.loginId = e.target.value
              setValues({...values, manager: copy})}}
            value={values.manager.loginId}
          />
        </div>
        {/* <p className='hint'>이름을 입력하세요.</p> */}
        <div className="signUp-field">
          <label htmlFor="password">비밀번호
          {
            validity[2] === true || validity[2] === -1 ?
            <p className='hint'>8글자 이상 20글자 이하인 영문과 숫자, 특수문자를 포함하여 입력하세요.</p>
            : <p className='hint hint-incorrect'>올바른 비밀번호 형식이 아닙니다.</p>
          }
          </label>
          <input
            type={passType ? "text" : "password"} placeholder='비밀번호' name='user-pwd'
            ref = {passwordRef}
            onChange={(e)=>{
              let copy = values.manager
              copy.password = e.target.value
              setValues({...values, manager: copy})}}
            value={values.manager.password}
          />
          {passType ? 
            <RiEyeFill className='passViewIcon' onClick={()=>{setPassType(!passType)}}/>
          :
            <RiEyeLine className='passViewIcon' onClick={()=>{setPassType(!passType)}}/>
          }
        </div>
        <div className="signUp-field">
          <label htmlFor="reEnterPassword">
            {
              validity[3] === true || validity[3] === -1 ?
              <></>
              : <p className='hint hint-incorrect'>비밀번호를 일치하게 입력해주세요.</p>
            }
          </label>
          <input
            type={newPassType ? "text" : "password"} name='reEnterPassword'
            ref={reEnterPasswordRef}
            onChange={(e)=>{
              let copy = values.manager
              copy.reEnterPassword = e.target.value
              setValues({...values, manager: copy})}}
            value={values.manager.reEnterPassword}
          />
          {
            newPassType ?
            <RiEyeFill className='passViewIcon' onClick={()=>{setNewPassType(!newPassType)}}/>
            :
            <RiEyeLine className='passViewIcon' onClick={()=>{setNewPassType(!newPassType)}}/>
          }
        </div>
        <div className="signUp-field">
          <label htmlFor="tel">전화번호
            {
              validity[4] === true || validity[4] === -1 ?
              <></>
              : <p className='hint hint-incorrect'>올바른 전화번호 형식이 아닙니다.</p>
            }
          </label>
          <input
            type="tel" name='tel'
            ref={telRef}
            onInput={(e)=>{
              hypenTel(e.target)
            }}
            onChange={(e)=>{
              let copy = values.manager
              copy.tel = e.target.value
              setValues({...values, manager: copy})}}
            value={values.manager.tel}
          />
        </div>
        <div className="signUp-field">
          <label htmlFor="countryId">나라</label>
          {/* <input
            type="text" name='countryId'
            onChange={(e)=>setValues({...values, countryId: e.target.value})}
            value={values.countryId}
          /> */}
          <select value={selectCValue} onChange={onChangeCSelect}>
            <option value="">나라 선택</option>
            {
            countries.map((item)=>(
              <option value={item.alpha2} key={item.alpha2}>
                  {item.name}
              </option>
            ))
            }
          </select>
        </div>
        <div className="signUp-field">
          <label htmlFor="organizationId">기관</label>
          {/* <input
            type="text" name='organizationId'
            onChange={(e)=>setValues({...values, organizationId: e.target.value})}
            value={values.organizationId}
          /> */}
          <select disabled ref={selectO} value={selectOValue} onChange={onChangeOSelect}>
            <option value="">기관 선택</option>
            {organizations.map((item)=>(
              <option value={item.id} key={country+item.tax}>
                  {item.name}
              </option>
            ))}
          </select>
        </div>
        <div className="signUp-field">
          <label htmlFor="tel">직책</label>
          {/* <input
            type="tel" name='user-id'
            // onChange={(e)=>setValues({...values, email: e.target.value})}
            // value={values.email}
          /> */}
          <select disabled ref={selectR} value={selectRValue} onChange={onChangeRSelect}>
            <option value="">직책 선택</option>
            {roles.map((item)=>(
              <option value={item.id} key={item.name}>
                  {item.name}
              </option>
            ))}
          </select>
        </div>
        {/* {error ? <p className='error'>{error}</p> : <p></p>} */}
        <button ref={signUpBtn} type='submit' className='signUpBtn'>회원가입</button>
      </form>
      
    </div>
  );
}

export default SignUpForm;