/*eslint-disable*/  // Lint제거 (warning 메세지 제거)

import './App.css';
import { useState, useEffect, useRef } from 'react';
import LoginForm from './pages/LoginForm.js'
import SignUpForm from './pages/SignUpForm.js'
// import MemberList from './pages/MemberList'
// import AddPatient from './pages/AddPatient';
import axios from 'axios';
import { Cookies, useCookies } from 'react-cookie';
import { Routes, Route, Link, useNavigate } from 'react-router-dom'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faChevronLeft } from '@fortawesome/free-solid-svg-icons'
import MeasureInfo from './pages/MeasureInfo.js';
// import ResultPage from './pages/ResultPage.js'
import DetailPage from './pages/DetailPage.js'
import DetailSvcPage from './pages/DetailSvcPage.js'
import SettingPage from './pages/SettingPage.js'
import MngClncs from './pages/MngClncs.js'
import SubjectSetting from './pages/SubjectSetting.js'
import DeviceSetting from './pages/DeviceSetting.js'
import MeasurementPage from './pages/measurementPage';
import MeasurementSVCPage from './pages/measurementSVCPage';
import GainResultPage from './pages/GainResultPage.js';
import ManagementSetting from './pages/ManagementSetting.js';
import GainMeasurementPage from './pages/GainMeasurementPage.js';
import GainPage from './pages/GainPage.js';
import VerificationPage from './pages/VerificationPage.js';
import MemberListCopy from './pages/MemberListCopy.js';
import AddPatientCopy from './pages/AddPatientC.js';
import ResultPageCopy from './pages/ResultPageCopy.js';
import ReportFvc from './pages/ReportFvc.js';
import ReportSvc from './pages/ReportSvc.js';
import ModeSelect from './pages/ModeSelect.js';

// Variable & State
const author = "KASSID&HAI";

function App() {
  return (
    <div className="App">
      <Routes>
        <Route path='/' element={<ModeSelect/>}/>
        <Route path='/login' element={<LoginForm/>}/>
        <Route path='/signUp' element={<SignUpForm/>}/>
        <Route path='/memberList/measureInfo' element={<MeasureInfo/>}/>
        
        {/* <Route path='/memberList' element={<MemberList/>}/>
        <Route path='/memberList/addPatient' element={<AddPatient/>}/>
        <Route path='/memberList/resultPage' element={<ResultPage/>}/> */}

        <Route path='/memberList/detailPage' element={<DetailPage/>}/>
        <Route path='/memberList/detailSvcPage' element={<DetailSvcPage/>}/>
        <Route path='/setting' element={<SettingPage/>}/>
        <Route path='/setting/mngClncs' element={<MngClncs/>}/>
        <Route path='/setting/subjectSetting' element={<SubjectSetting/>}/>
        <Route path='/setting/deviceSetting' element={<DeviceSetting/>}/>
        <Route path='/setting/deviceSetting/gainResultPage' element={<GainResultPage/>}/>
        <Route path='/measurement' element={<MeasurementPage/>}/>
        <Route path='/measurementSVC' element={<MeasurementSVCPage/>}/>
        <Route path='/setting/managementSetting' element={<ManagementSetting/>}/>
        <Route path='/setting/gainPage' element={<GainPage/>}/>
        <Route path='/setting/gainPage/gainMeasurementPage' element={<GainMeasurementPage/>}/>
        <Route path='/setting/verificationPage' element={<VerificationPage/>}/>
        
        <Route path='/memberList' element={<MemberListCopy/>}/>
        <Route path='/memberList/addPatient' element={<AddPatientCopy/>}/>
        <Route path='/memberList/resultPage' element={<ResultPageCopy/>}/>
        <Route path='/memberList/resultPage/reportFvc' element={<ReportFvc/>}/>
        <Route path='/memberList/resultPage/reportSvc' element={<ReportSvc/>}/>
        
      </Routes>
    </div>
  );
}

export default App;











// const LoginForm = () =>{
//   const [values, setValues] = useState({
//     loginId: "",
//     password: "",
//   });
//   const [cookies, setCookie, removeCookie] = useCookies();

//   const [error, setError] = useState(undefined);
//   const accessExpires = new Date();
//   const refreshExpires = new Date();
//   const handleSubmit = async (event)=>{
//     event.preventDefault();

//     axios.post("/auth/sign-in", 
//     {
//       loginId: values.loginId,
//       password: values.password,
//     },{withCredentials : true})
//     .then((res)=>{
//       // 쿠키에 토큰 저장
//       console.log(res);
//       accessExpires.setMinutes(accessExpires.getMinutes() + 14);
//       setCookie("accessToken", res.data.response.accessToken,{expires : accessExpires, secure:"true"});
//       refreshExpires.setDate(refreshExpires.getDate()+7);
//       setCookie("refreshToken",res.data.response.refreshToken,{expires : refreshExpires, secure:"true"});
//       // setTimeout(()=>{
//       //     refresh(null);
//       // },(1000*60*14)); //14분 마다 refresh
//     })
//     .catch((error)=>{
//       console.log(error);alert("ERROR");
//     })
//   };

//   return(
//     <div className="login-page-container">
//       <div className="logo"><p>The SpiroKit</p></div>
//       <form onSubmit={handleSubmit}>
//         <div className="login-field">
//           <label htmlFor="loginId">아이디</label>
//           <input
//             type="text" name='loginId'
//             onChange={(e)=>setValues({...values, loginId: e.target.value})}
//             placeholder='아이디'
//             value={values.loginId}
//           />
//         </div>
//         <div className="login-field">
//           <label htmlFor="password">비밀번호</label>
//           <input
//             type="password" name='password'
//             onChange={(e)=>setValues({...values, password: e.target.value})}
//             placeholder='비밀번호'
//             value={values.password}
//           />
//         </div>
//         {error ? <p className='error'>{error}</p> : <p></p>}
//         <button type='submit' className='loginBtn'>로그인</button>
//         <button>회원가입</button>
//       </form>
      
//     </div>
//   );
// }


// const SignUpForm = () =>{
//   const [values, setValues] = useState({
//     countryId: "",
//     organizationId: "",
//     roleId: "",
//     manager: {
//       tel:"",
//       name:"",
//       loginId: "",
//       password: "",
//       reEnterPassword: ""
//   }
//   });

//   const [error, setError] = useState(undefined);
//   const [validity, setValidity] = useState([-1, -1, -1, -1, -1]);
//   const handleSubmit = async (event)=>{
//     event.preventDefault();
//     console.log(country);
//     console.log(selectOValue);
//     console.log(selectRValue);
//     console.log(values);

    
//     // ***************(TODO)**************
//     // select option --> 드롭다운 형식으로 새로만들기
//     // post할때 values 그대로 해도 괜찮은지 (가장 마지막에 서버CALLBACK 보면될듯?)
//     // ***********************************

//     // axios.post("/auth/sign-up", 
//     // values,{withCredentials : true})
//     // .then((res)=>{
//     //   console.log(res);
//     // })
//     // .catch((error)=>{
//     //   console.log(error);alert("ERROR");
//     // })
    
//   };
  
//   const hypenTel = (target) => {
//     target.value = target.value
//       .replace(/[^0-9]/g, '')
//       .replace(/^(\d{3})(\d{4})(\d{4})$/, `$1-$2-$3`);
//   }
//   // 아이디 유효조건 확인 (Boolean)
//   const reportName = (e)=>{
//     return e.value.length >= 2;
//   }
//   // 아이디 유효조건 확인 (Boolean)
//   const reportLoginID = (e)=>{
//     let regExp = /^[a-zA-Z0-9]{5,20}$/;
//     return regExp.test(e.value);
//   }
//   // 비밀번호 유효조건 확인 (Boolean)
//   const reportPassword = (e)=>{
//     let regExp = /^(?=.*[a-zA-Z])(?=.*[0-9])(?=.*[\W]).{8,20}$/;
//     console.log(e.value)
//     return regExp.test(e.value);
//   }
//   // 비밀번호 재확인 유효조건 확인 (Boolean)
//   const reportReEnterPassword = (e)=>{
//     if(values.manager.password === e.value) return true;
//     else return false;
//   }
//   // 전화번호 유효조건 확인 (Boolean)
//   const reportTel = (e)=>{
//     let regExp = /^(\d{3})-(\d{4})-(\d{4})$/;
//     return regExp.test(e.value);
//   }
//   // 유효조건 함수 리스트 객체
//   const ValidityFunc = {
//     0:reportName,
//     1:reportLoginID,
//     2:reportPassword,
//     3:reportReEnterPassword,
//     4:reportTel
//   }
//   // 유효조건 판별에 따른 css 변화 함수
//   const setInput = (e, num, func)=>{
//     if(e.value.length === 0){
//       if(e.classList.contains("incorrect")){
//         e.classList.remove("incorrect")
//       }
//       let copy = [...validity];
//       copy[num] = -1;
//       setValidity(copy);
//       return;
//     };

//     if(!func(e)){
//       if(e.classList.contains("incorrect"))return;
//       e.classList+="incorrect"
//       let copy = [...validity];
//       copy[num] = false;
//       setValidity(copy);
//     }
//     else{
//       if(e.classList.contains("incorrect")){
//         e.classList.remove("incorrect")
//       }
//       let copy = [...validity];
//       copy[num] = true;
//       setValidity(copy);
//     }
//   }

//   //아이디 체크 메세지창
//   const idChkAlert = useRef();
//   const [idChkAlertVisible, setIdChkAlertVisible] = useState(false);
//   //아이디 중복 메세지창 css 변화
//   useEffect(()=>{
//     if(idChkAlertVisible == true){
//       idChkAlert.current.classList.add("visible");
//       console.log(idChkAlert.current.classList);
//       setTimeout(()=>{
//         idChkAlert.current.classList.remove("visible");
//         console.log(idChkAlert.current.classList);
//         setIdChkAlertVisible(false);
//     }, 2000)
//     }
//   },[idChkAlertVisible])  

//   //아이디 중복 상태
//   const [isIdDuplicated, setIsIdDuplicated] = useState(true);
//   //아이디 중복 메세지창
//   const idDupAlert = useRef();
//   //아이디 중복 메세지창 onOff 상태
//   const [idDupAlertVisible, setIdDupAlertVisible] = useState(false);

//   //아이디 중복 메세지창 css 변화
//   useEffect(()=>{
//     if(idDupAlertVisible == true){
//       idDupAlert.current.classList.add("visible");
//       console.log(idDupAlert.current.classList);
//       setTimeout(()=>{
//         idDupAlert.current.classList.remove("visible");
//         console.log(idDupAlert.current.classList);
//         setIdDupAlertVisible(false);
//     }, 2000)
//     }
//   },[idDupAlertVisible])

//   //아이디 중복 메세지창
//   const idValAlert = useRef();
//   //아이디 중복 메세지창 onOff 상태
//   const [idValAlertVisible, setIdValAlertVisible] = useState(false);

//   //아이디 중복 메세지창 css 변화
//   useEffect(()=>{
//     if(idValAlertVisible == true){
//       idValAlert.current.classList.add("visible");
//       console.log(idValAlert.current.classList);
//       setTimeout(()=>{
//         idValAlert.current.classList.remove("visible");
//         console.log(idValAlert.current.classList);
//         setIdValAlertVisible(false);
//     }, 2000)
//     }
//   },[idValAlertVisible])

//   //아이디 중복확인
//   const checkId = () =>{
//     if(values.manager.loginId === "" || validity[1]===false){
//       setIdChkAlertVisible(true);
//       return;
//     }
//     axios.post('/auth/duplicate-check',{
//       loginId: values.manager.loginId,
//     },{withCredentials : true})
//     .then((res) => {
//       console.log(res)
//       if(res.data.response){
//         setIsIdDuplicated(true);
//         setIdDupAlertVisible(true);
//       }
//       else{
//         setIsIdDuplicated(false);
//         setIdValAlertVisible(true);
//       }
//     }).catch((error) => {
//       console.log(error);
//       alert("에러");
//     })
//   }


//   const nameRef = useRef();
//   const idRef = useRef();
//   const passwordRef = useRef();
//   const reEnterPasswordRef = useRef();
//   const telRef = useRef();

//   useEffect(()=>{
//     setInput(nameRef.current, 0, ValidityFunc[0]);
//   },[values["manager"]["name"]])

//   useEffect(()=>{
//     setInput(idRef.current, 1, ValidityFunc[1]);
//   },[values["manager"]["loginId"]])

//   useEffect(()=>{
//     setInput(passwordRef.current, 2, ValidityFunc[2]);
//     let copy = values.manager
//     copy.reEnterPassword = ""
//     setValues({...values, manager: copy})
//   },[values["manager"]["password"]])
  
//   useEffect(()=>{
//     setInput(reEnterPasswordRef.current, 3, ValidityFunc[3]);
//   },[validity[2]])

//   useEffect(()=>{
//     setInput(reEnterPasswordRef.current, 3, ValidityFunc[3]);
//   },[values["manager"]["reEnterPassword"]])
//   useEffect(()=>{
//     setInput(telRef.current, 4, ValidityFunc[4]);
//   },[values["manager"]["tel"]])


//   //기관 선택창
//   const selectO = useRef();
//   //직책 선택창
//   const selectR = useRef();
//   //직책 선책창
//   //나라 UUID
//   const [country, setCountry] = useState("");
//   //나라 선택 값
//   const [selectCValue, setSelectCValue] = useState("");
//   //기관 선택 값
//   const [selectOValue, setSelectOValue] = useState("");
//   //직책 선택 값
//   const [selectRValue, setSelectRValue] = useState("");
//   //기관 리스트
//   const [organizations,setOrganizations] = useState([]);
//   //직책 리스트
//   const [roles, setRoles] = useState([]);
//   //나라 UUID 선택
//   const onChangeCSelect = (event) =>{
//     setSelectCValue(event.target.value);
//     setValues({
//       ...values,
//       countryId: event.target.value,
//       organizationId: "",
//       roleId: "",
//     })
//     setSelectOValue("");
//     setSelectRValue("");
//   }
//   //기관 UUID 선택
//   const onChangeOSelect = (event) =>{
//     setSelectOValue(event.target.value); //기관UUID 저장
//     setValues({
//       ...values,
//       organizationId: event.target.value,
//       roleId: "",
//     })
//     setSelectRValue("");
//   }
//   //직책 UUID 선택
//   const onChangeRSelect = (event) =>{
//     console.log(event.target.value);
//     setValues({
//       ...values,
//       roleId: event.target.value,
//     })
//     setSelectRValue(event.target.value);
//   }
//   //나라 json
//   useEffect(() => {
//     axios.get('/countries')
//     .then((res) => {
//       if(selectCValue === ""){
//         selectO.current.disabled = true;
//         selectR.current.disabled = true;
//         return;
//       };
//       selectO.current.disabled = false;
//       let countriesUUID = res.data.response.filter(function(e){
//         return e.code === selectCValue;
//       })
//       // UUID 정보 저장
//       console.log(countriesUUID[0]);

//       setCountry(countriesUUID[0].id);
//     }).catch((error) => {
//       console.log(error);
//       alert("에러");
//     })
//   },[selectCValue])

//   //기관 json
//   useEffect(()=>{
//     if(country === "") return;
//     axios.get(`/countries/${country}/organizations`)
//     .then((res) => {
//       //기관 리스트 저장
//       setOrganizations(res.data.response);
//     }).catch((error) => {
//       console.log(error);
//       alert("에러1");
//     })
//   },[country])

//   //직책 json
//   useEffect(()=>{
//     if(selectOValue === "") {
//       selectR.current.disabled = true;
//       return;
//     }
//     selectR.current.disabled = false;
//     console.log(selectCValue);
//     console.log(selectOValue);
//     axios.get(`/organizations/${selectOValue}/roles`)
//     .then((res)=>{
//       console.log(res)
//       setRoles(res.data.response);
//     }).catch((error) => {
//       console.log(error);
//       alert("에러11");
//   })
//   },[selectOValue])

//   //나라, 기관, 직책 정보 values에 저장
//   useEffect(()=>{
//     if(selectRValue === "")return;
//     console.log("Hello")
//     setValues({
//       ...values,
//       countryId: country,
//       organizationId: selectOValue,
//       roleId: selectRValue,
//     })
//   },[selectRValue])

//   //제출버튼
//   const signUpBtn = useRef();

//   const [btnStatus, setBtnStatus] = useState(false)

//   useEffect(()=>{
//     console.log(validity);
//     if((validity[0]===true&&validity[1]===true&&validity[2]===true&&validity[3]===true&&validity[4]===true)==false){
//       console.log("ch1");
//       setBtnStatus(false);
//       return;
//     }
//     if((values["countryId"] !== "" && values["organizationId"] !== "" && values["roleId"] !== "" && !isIdDuplicated)==false){
//       setBtnStatus(false);
//       console.log("ch2");
//       return;
//     }
//     console.log(111)
//     setTimeout(()=>{
//       setBtnStatus(true);
//     },200)
//   })

//   useEffect(()=>{
//     if(btnStatus){signUpBtn.current.disabled=false}
//     else{
//       signUpBtn.current.disabled = true;
//     }
//   },[btnStatus])

//   return(
//     <div className="signUp-page-container">
//       {
//         //중복 아이디 알림
//         <Alert inputRef={idDupAlert} contents={"중복된 아이디가 있습니다.\n다시 입력하신 후 중복 검사를 해주세요."}/>
//       }
//       {
//         //올바르지 않은 아이디 알림
//         <Alert inputRef={idChkAlert} contents={"올바른 아이디 형식이 아닙니다."}/>
//       }
//       {
//         //올바르지 않은 아이디 알림
//         <Alert inputRef={idValAlert} contents={"사용 가능한 아이디입니다."}/>
//       }
//       <div className="signUp-title"><p>회원가입</p></div>
//       <form onSubmit={handleSubmit}>
//       <div className="signUp-field">
//           <label htmlFor="name">이름
//             {
//             validity[0] === true || validity[0] === -1 ?
//             <p className='hint'>이름을 입력하세요.</p>
//             : <p className='hint hint-incorrect'>올바른 이름 형식이 아닙니다.</p>
//             }
//           </label>
//           <input
//             type="text" placeholder='이름' name='name'
//             ref={nameRef}
//             onChange={(e)=>{
//               let copy = values.manager
//               copy.name = e.target.value
//               setValues({...values, manager: copy})}}
//             value={values.manager.name}
//           />
//         </div>
//         <div className="signUp-field">
//           <label htmlFor="loginId">아이디
//             {
//             validity[1] === true || validity[1] === -1 ?
//             <p className='hint'>5글자 이상 20글자 이하인 영문과 숫자를 사용하여 입력하세요.</p>
//             : <p className='hint hint-incorrect'>올바른 아이디 형식이 아닙니다.</p>
//             }
//             <div className="idCheck" onClick={checkId}>아이디 중복검사</div>
//           </label>
//           <input
//             type="text" placeholder='아이디' name='loginId'
//             ref={idRef}
//             onChange={(e)=>{
//               setIsIdDuplicated(true);
//               let copy = values.manager
//               copy.loginId = e.target.value
//               setValues({...values, manager: copy})}}
//             value={values.manager.loginId}
//           />
//         </div>
//         {/* <p className='hint'>이름을 입력하세요.</p> */}
//         <div className="signUp-field">
//           <label htmlFor="password">비밀번호
//           {
//             validity[2] === true || validity[2] === -1 ?
//             <p className='hint'>8글자 이상 20글자 이하인 영문과 숫자, 특수문자를 포함하여 입력하세요.</p>
//             : <p className='hint hint-incorrect'>올바른 비밀번호 형식이 아닙니다.</p>
//           }
//           </label>
//           <input
//             type="password" placeholder='비밀번호' name='user-pwd'
//             ref = {passwordRef}
//             onChange={(e)=>{
//               let copy = values.manager
//               copy.password = e.target.value
//               setValues({...values, manager: copy})}}
//             value={values.manager.password}
//           />
//         </div>
//         <div className="signUp-field">
//           <label htmlFor="reEnterPassword">
//             {
//               validity[3] === true || validity[3] === -1 ?
//               <></>
//               : <p className='hint hint-incorrect'>비밀번호를 일치하게 입력해주세요.</p>
//             }
//           </label>
//           <input
//             type="password" name='reEnterPassword'
//             ref={reEnterPasswordRef}
//             onChange={(e)=>{
//               let copy = values.manager
//               copy.reEnterPassword = e.target.value
//               setValues({...values, manager: copy})}}
//             value={values.manager.reEnterPassword}
//           />
//         </div>
//         <div className="signUp-field">
//           <label htmlFor="tel">전화번호
//             {
//               validity[4] === true || validity[4] === -1 ?
//               <></>
//               : <p className='hint hint-incorrect'>올바른 전화번호 형식이 아닙니다.</p>
//             }
//           </label>
//           <input
//             type="tel" name='tel'
//             ref={telRef}
//             onInput={(e)=>{
//               hypenTel(e.target)
//             }}
//             onChange={(e)=>{
//               let copy = values.manager
//               copy.tel = e.target.value
//               setValues({...values, manager: copy})}}
//             value={values.manager.tel}
//           />
//         </div>
//         <div className="signUp-field">
//           <label htmlFor="countryId">나라</label>
//           {/* <input
//             type="text" name='countryId'
//             onChange={(e)=>setValues({...values, countryId: e.target.value})}
//             value={values.countryId}
//           /> */}
//           <select value={selectCValue} onChange={onChangeCSelect}>
//             <option value="">나라 선택</option>
//             <option value="MN">Mongolia</option>
//             <option value="KZ">Kazakhstan</option>
//             <option value="KR">Korea</option>
//             <option value="VN">Vietnam</option>
//           </select>
//         </div>
//         <div className="signUp-field">
//           <label htmlFor="organizationId">기관</label>
//           {/* <input
//             type="text" name='organizationId'
//             onChange={(e)=>setValues({...values, organizationId: e.target.value})}
//             value={values.organizationId}
//           /> */}
//           <select disabled ref={selectO} value={selectOValue} onChange={onChangeOSelect}>
//             <option value="">기관 선택</option>
//             {organizations.map((item)=>(
//               <option value={item.id} key={item.id}>
//                   {item.name}
//               </option>
//             ))}
//           </select>
//         </div>
//         <div className="signUp-field">
//           <label htmlFor="tel">직책</label>
//           {/* <input
//             type="tel" name='user-id'
//             // onChange={(e)=>setValues({...values, email: e.target.value})}
//             // value={values.email}
//           /> */}
//           <select disabled ref={selectR} value={selectRValue} onChange={onChangeRSelect}>
//             <option value="">직책 선택</option>
//             {roles.map((item)=>(
//               <option value={item.id} key={item.name}>
//                   {item.name}
//               </option>
//             ))}
//           </select>
//         </div>
//         {/* {error ? <p className='error'>{error}</p> : <p></p>} */}
//         <button ref={signUpBtn} type='submit' className='signUpBtn' disabled>회원가입</button>
//       </form>
      
//     </div>
//   );
// }

// function Alert(props){
//   return(
//     <>
//       <div className="alert-container" ref={props.inputRef}>
//         <div className="alert-title">The Spirokit</div>
//         <div className="alert-contents">
//           <p>{props.contents}</p>
//         </div>
//       </div>
//     </>
//   )
// }

// const MemberList = ()=>{
//   const [examinees, setExaminees] = useState([]);
//   const [date, setDate] = useState([]);
//   const [examinee, setExaminee] = useState("");

//   const cookies = new Cookies();
//   let navigator = useNavigate();
//   useEffect(()=>{
//     axios.get("/examinees?name=" , {
//       headers: {
//         Authorization: `Bearer ${cookies.get('accessToken')}`
//       }}).then((res)=>{
//         setExaminees(res.data.response);

//       }).catch((err)=>{
//         console.log(err);
//       })
//   },[])
//   const click = (exId) =>{
//     axios.get(`/examinees/${exId}/measurements/date?from=&to=` , {
//       headers: {
//         Authorization: `Bearer ${cookies.get('accessToken')}`
//       }
//     }).then((res)=>{
//       setDate(res.data.response);
//       setExaminee(exId);
//     }).catch((err)=>{
//       console.log(err);
//     })
//   }

//   return (
//     <div>
//       {/* <Link to={`/AddExaminee`}>환자 추가</Link> */}
//       <ul>
//         {examinees.map((item)=>(
//           <li key={item.chartNumber} onClick={()=>click(item.id)}>
//             <div>chartNumber:{item.chartNumber}</div>
//             <div>name: {item.name}</div>
//             <div>gender: {item.gender}</div>
//             <div>birthday : {item.birthday}</div>
//           </li>
//         ))}
//       </ul>
//       <div>
//         {date.map((item)=>(
//           <Link key={item} to={`/ss/${examinee}/${item}`}>
//             <div>검사 일시 : {item}</div>
//           </Link>
//         ))}
//       </div>
//       <div className='backBtn' onClick={()=>{navigator(-1)}}>
//         <FontAwesomeIcon icon={faChevronLeft} style={{color: "#4b75d6",}} />
//       </div>
//     </div>
//   );
// }





