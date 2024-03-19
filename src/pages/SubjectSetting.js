import { useState, useRef, useEffect} from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom'
import Alert from "../components/Alerts.js"
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faChevronLeft, faChevronDown } from '@fortawesome/free-solid-svg-icons'
import { RiEyeFill, RiEyeLine } from "react-icons/ri";

const SubjectSetting = () =>{
  const [psw, setPsw] = useState("");
  const [newPsw, setNewPsw] = useState({
    newPassword : "",
	  confirmPassword : ""
  });
  const chBtn = useRef();
  let navigator = useNavigate();


  //현재 비밀번호
  const [pswConfirm,setPswConfirm] = useState(true);
  useEffect(()=>{
    let regExp = /^(?=.*[a-zA-Z])(?=.*[0-9])(?=.*[\W]).{8,20}$/;
    if(psw === ""){
      setPswConfirm(true);
    }else{
      setPswConfirm(regExp.test(psw))
    }
    
  },[psw])

  //새로운 비밀번호
  const [newPswConfirm, setNewPswConfirm] = useState(true);
  useEffect(()=>{
    let regExp = /^(?=.*[a-zA-Z])(?=.*[0-9])(?=.*[\W]).{8,20}$/;
    console.log(newPsw)
    if(newPsw.newPassword === ""){
      setNewPswConfirm(true);
    }else{
      setNewPswConfirm(regExp.test(newPsw.newPassword))
    }
  },[newPsw])



  useEffect(()=>{
    if(newPsw.confirmPassword !== "" && newPsw.newPassword !== "" && psw !== "" && pswConfirm && newPswConfirm && newPsw.confirmPassword === newPsw.newPassword && newPsw.newPassword !==psw){
      chBtn.current.disabled = false;
      
    }else{
      console.log(pswConfirm);
      chBtn.current.disabled = true;
    }
  },[newPsw,psw])

  const setSub = () =>{
    console.log(psw);
    console.log(newPsw.confirmPassword);
    console.log(newPsw.newPassword)
      //  axios.patch('/auth/change-password',{
      //   password : psw,
      //   newPassword : newPsw.newPassword,
      //   confirmPassword : newPsw.confirmPassword
      //  },{
      //   headers: {
      //     Authorization: `Bearer ${cookies.get('accessToken')}`
      //   }
      //  },{withCredentials : true})
      // .then((res)=>{
      //   console.log(res);
      // })
      // .catch((error)=>{
        
      //   console.log(error);alert("ERROR");
      // })
  }

  const [passType, setPassType] = useState(false);
  const [newPassType, setNewPassType] = useState(false);
  const [newPassChkType, setNewPassChkType] = useState(false);

  return(
    <div className="subjectSetting-page-container">
      <div className="subjectSetting-page-nav">  
        <div className='backBtn' onClick={()=>{navigator(-1)}}>
          <FontAwesomeIcon icon={faChevronLeft} style={{color: "#4b75d6",}} />
        </div>
        <p>유저 정보 변경</p>
      </div>
        <div className="password-list-container">
          
          <div className="change-password-field">

            <div className='password-field'>
              <label htmlFor="password"> 현재 비밀번호</label>
              <input
                type={passType ? "string":"password"} placeholder='현재 비밀번호' name='user-pwd'
                onChange={(e)=>setPsw(e.target.value)}
              />
              {passType ? 
                <RiEyeFill className='passViewIcon' onClick={()=>{setPassType(!passType)}}/>
              :
                <RiEyeLine className='passViewIcon' onClick={()=>{setPassType(!passType)}}/>
              }
              <div className='password-valition'>
              {
                pswConfirm === true ?
                  <p className='hint'></p>
                : <p className='hint hint-incorrect'>올바른 비밀번호 형식이 아닙니다.</p>
              }
              </div>
            </div>
          </div>
          <div className="change-password-field">
            <div className='password-field'>
              <label htmlFor="password"> 새로운 비밀번호</label>
              <input
                type={newPassType ? "string":"password"} placeholder='변경 할 비밀번호' name='user-pwd'
                onChange={(e)=>{setNewPsw({...newPsw, newPassword : e.target.value})}}
              />
              {
                newPassType ?
                <RiEyeFill className='passViewIcon' onClick={()=>{setNewPassType(!newPassType)}}/>
                :
                <RiEyeLine className='passViewIcon' onClick={()=>{setNewPassType(!newPassType)}}/>
              }
                <div className='password-valition'>
                {
                  newPswConfirm === false ?
                  <p className='hint hint-incorrect'>올바른 비밀번호 형식이 아닙니다.</p> :
                  newPsw.newPassword === psw && newPsw.newPassword !== ""? 
                  <p className='hint hint-incorrect'>현재 비밀번호와 동일합니다. 변경할 비밀번호를 다시 입력해 주세요.</p> : 
                  <p className='hint'>8글자 이상 20글자 이하인 영문과 숫자, 특수문자를 포함하여 입력하세요.</p>
                  
                }
              </div>
            </div>
            
          </div>

          <div className="change-password-field">
          <div className='password-field'>
            <label htmlFor="reEnterPassword">
              
            </label>
            <input
              type={newPassChkType ? "string":"password"} name='reEnterPassword' placeholder='비밀번호 확인'
              onChange={(e)=>{setNewPsw({...newPsw, confirmPassword : e.target.value})}}
            />
            {newPassChkType ? 
              <RiEyeFill className='passViewIcon' onClick={()=>{setNewPassChkType(!newPassChkType)}}/>
              :
              <RiEyeLine className='passViewIcon' onClick={()=>{setNewPassChkType(!newPassChkType)}}/>
            }
            <div className='password-valition'>
              {
                newPsw.confirmPassword === newPsw.newPassword || newPsw.confirmPassword === ""? 
                <p className='hint'></p>:
                <p className='hint hint-incorrect'>비밀번호를 일치하게 입력햐주세요.</p>
              }
            </div>
          </div>
        </div>
        <button onClick={setSub} ref={chBtn} className ='chBtn'>수정 완료</button>
      </div>
    </div>
  );
}

export default SubjectSetting;