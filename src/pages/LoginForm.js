import { useState, useRef, useEffect} from 'react';
import axios from 'axios';
import { Cookies, useCookies } from 'react-cookie';
import Alert from "../components/Alerts.js"
import { Routes, Route, Link, useNavigate } from 'react-router-dom'
import { RiEyeFill, RiEyeLine } from "react-icons/ri";
import { faChevronLeft } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'


const LoginForm = () =>{
  const [values, setValues] = useState({
    loginId: "",
    password: "",
  });
  // const [cookies, setCookie, removeCookie] = useCookies();
  const [error, setError] = useState(undefined);
  const [accessToken,setAccessToken] = useState(window.api.get("get-cookies",'accessToken'));
  const [refreshToken,serRefreshToken] = useState(window.api.get("get-cookies",'refreshToken'));
  const accessExpires = new Date();
  const refreshExpires = new Date();

  let navigate = useNavigate();

  const handleSubmit = async (event)=>{

    event.preventDefault();
    if(values["loginId"]==false||values["password"]==false){
      setBlankAlertVisible(true);
      return;
    }
    await axios.post("/auth/sign-in", 
    {
      loginId: values.loginId,
      password: values.password,
    },{withCredentials : true})
    .then(async(res)=>{
      // 쿠키에 토큰 저장

      accessExpires.setMinutes(accessExpires.getMinutes() + 14);
      refreshExpires.setDate(refreshExpires.getDate()+7);
        const refreshTokenData = {
          name: 'refreshToken',
          data : res.data.response.refreshToken,
          date : refreshExpires,
        }
        const accessTokenData = {
          name: 'accessToken',
          data : res.data.response.accessToken,
          date : accessExpires
        }
      await window.api.send("set-cookie", accessTokenData);

      await window.api.send("set-cookie", refreshTokenData);
      console.log(res);
      // accessExpires.setMinutes(accessExpires.getMinutes() + 14);
      // setCookie("accessToken", res.data.response.accessToken,{expires : accessExpires, secure:"true"});
      // refreshExpires.setDate(refreshExpires.getDate()+7);
      // setCookie("refreshToken",res.data.response.refreshToken,{expires : refreshExpires, secure:"true"});
      // navigate('/memberList')
      // setTimeout(()=>{
      //     refresh(null);
      // },(1000*60*14)); //14분 마다 refresh
    })
    .catch((error)=>{
      setErrorAlertVisible(true);
    })

    console.log(accessToken);
    navigate('/memberList')
  };

  // 빈칸 알림창
  const blankAlert = useRef();

  //아이디 중복 메세지창 onOff 상태
  const [blankAlertVisible, setBlankAlertVisible] = useState(false);

  //아이디 중복 메세지창 css 변화
  useEffect(()=>{
    if(blankAlertVisible == true){
      blankAlert.current.classList.add("visible");
      const time = setTimeout(()=> {
        blankAlert.current.classList.remove("visible");
        setBlankAlertVisible(false);
    }, 2000);
    return()=>clearTimeout(time);
    }
    return()=>{}
  },[blankAlertVisible])

  // 로그인 불가 알림창
  const errorAlert = useRef();

  //아이디 중복 메세지창 onOff 상태
  const [errorAlertVisible, setErrorAlertVisible] = useState(false);

  //아이디 중복 메세지창 css 변화
  useEffect(()=>{
    if(errorAlertVisible == true){
      errorAlert.current.classList.add("visible");
      setTimeout(()=>{
        errorAlert.current.classList.remove("visible");
        setErrorAlertVisible(false);
    }, 2000)
    }
    return()=>{}
  },[errorAlertVisible])

  const [signUpPage, setSignUpPage] = useState(false);
  useEffect(()=>{
    if(signUpPage){
      setSignUpPage(false);
      navigate('/signUp');
    }
  },[signUpPage])

  useEffect(()=>{
    // const cookie = new Cookies();
    console.log(window.api.get("get-cookies",'accessToken'));
    if(refreshToken !== undefined){
      axios.post("/auth/renewal" ,{},{
        headers: {
          Authorization: `Bearer ${refreshToken}`
      }}).then((res)=>{
        // accessExpires.setMinutes(accessExpires.getMinutes() + 14);
        // cookie.set('accessToken',res.data.response.accessToken,{expires : accessExpires,secure:"true"});
        // navigate('/memberList', {state: {device:undefined}});

        accessExpires.setMinutes(accessExpires.getMinutes() + 14);
        const accessTokenData = {
          name: 'refreshToken',
          data : res.data.response.accessToken,
          date : accessExpires
        }
        window.api.send("set-cookie", accessTokenData);
      }).catch((err)=>{
        console.log(err);
        // window.location.replace('/');
      });
    }
  },[])
  const [passType, setPassType] = useState(false);

  return(
    <div className="login-page-container">
      {
        //중복 아이디 알림
        <Alert inputRef={blankAlert} contents={"아이디, 비밀번호 모두 입력한 후,\n로그인 버튼을 눌러주세요."}/>
      }
      {
        //중복 아이디 알림
        <Alert inputRef={errorAlert} contents={"로그인에 실패했습니다.\n아이디와 비밀번호를 확인해주세요."}/>
      }
      <div className='backBtn' onClick={()=>{navigate("/")}}>
        <FontAwesomeIcon icon={faChevronLeft} style={{color: "#4b75d6",}} />
      </div>
      <div className="logo"><img src={process.env.PUBLIC_URL + '/spriokit.svg'} /></div>
      <form onSubmit={handleSubmit}>
        <div className="login-field">
          <label htmlFor="loginId">아이디</label>
          <input
            type="text" name='loginId'
            onChange={(e)=>setValues({...values, loginId: e.target.value})}
            placeholder='아이디'
            value={values.loginId}
          />
        </div>
        <div className="login-field">
          <label htmlFor="password">비밀번호</label>
          <input
            type={passType ? "text":"password"} name='password'
            onChange={(e)=>setValues({...values, password: e.target.value})}
            placeholder='비밀번호'
            value={values.password}
          />
          {passType ? 
            <RiEyeFill className='passViewIcon' onClick={()=>{setPassType(!passType)}}/>
          :
            <RiEyeLine className='passViewIcon' onClick={()=>{setPassType(!passType)}}/>
          }
        </div>
        {error ? <p className='error'>{error}</p> : <p></p>}
        <button type='submit' className='loginBtn'>로그인</button>
        <div className='login-signUpBtn' onClick={()=>{
          setSignUpPage(true);
        }
        }>회원가입</div>
        
      </form>
      
    </div>
  );
}

export default LoginForm;