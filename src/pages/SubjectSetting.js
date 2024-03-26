import { useState, useRef, useEffect} from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom'
import { FaChevronLeft } from "react-icons/fa";

import { RiEyeFill, RiEyeLine } from "react-icons/ri";
import Confirm from "../components/Confirm.js"

const SubjectSetting = () =>{
  const [accessToken,setAccessToken] = useState(window.api.get("get-cookies",'accessToken'));
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
    setConfirmStat(true);
  }

  const [passType, setPassType] = useState(false);
  const [newPassType, setNewPassType] = useState(false);
  const [newPassChkType, setNewPassChkType] = useState(false);

  const [confirmStat, setConfirmStat] = useState(false);
  const [msgStat, setMsgStat] = useState(false);
  const [chgMsg, setChgMsg] = useState("");
  const selectChg = (val)=>{
    if(val == "confirm"){
      axios.patch('/auth/change-password',{
        password : psw,
        newPassword : newPsw.newPassword,
        confirmPassword : newPsw.confirmPassword
      },{
        headers: {
          Authorization: `Bearer ${accessToken}`
        }
      },{withCredentials : true})
      .then((res)=>{
        console.log(res);
        if(res.data.subCode === 0){
          setChgMsg("비밀번호가 변경되었습니다.")
          console.log("12342143");
        }
        else{
          if(res.data.subCode === 2102) setChgMsg("입력한 현재 비밀번호가 틀립니다.\n확인 후 다시 입력해주세요.");
          else if(res.data.subCode === 2101) setChgMsg("비밀번호를 일치하게 입력해주세요.");
          else if(res.data.subCode === 4009) setChgMsg("현재 비밀번호와 동일합니다.\n변경할 비밀번호를 다시 입력해주세요.");
          else setChgMsg("비밀번호 변경에 실패했습니다.");
        }
      })
      .catch((error)=>{
        console.log(error);
        if(error.response.data.subCode === 2102) setChgMsg("입력한 현재 비밀번호가 틀립니다.\n확인 후 다시 입력해주세요.");
          else if(error.response.data.subCode === 2101) setChgMsg("비밀번호를 일치하게 입력해주세요.");
          else if(error.response.data.subCode === 4009) setChgMsg("현재 비밀번호와 동일합니다.\n변경할 비밀번호를 다시 입력해주세요.");
          else setChgMsg("비밀번호 변경에 실패했습니다.");

      })
    }
    else{
    }
  }
  useEffect(()=>{
    if(chgMsg != ""){
      setMsgStat(true);
    }
  },[chgMsg])
  const backToSetting = (val)=>{
    if(val == "confirm"){
      if(chgMsg == "비밀번호가 변경되었습니다.")navigator(-1);
      else{}
    }
  }

  return(
    <div className="subjectSetting-page-container">
      {confirmStat ? <Confirm content="비밀번호를 변경하시겠습니까?" btn={true} onOff={setConfirmStat} select={selectChg}/> : null}
      {msgStat ? <Confirm content={chgMsg} btn={"one"} onOff={setMsgStat} select={backToSetting}/> : null}
      <div className="subjectSetting-page-nav">
        <div className='backBtn' onClick={()=>{navigator(-1)}}>
          <FaChevronLeft style={{color: "#4b75d6",}} />
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