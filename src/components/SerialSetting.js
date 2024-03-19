import { useEffect, useReducer, useState, useRef } from "react";
function SerialSetting(props){
  const [data, setData] = useState("");
  const numInputRef = useRef();
  const click = (e, num) => {
    console.log(e);
    if(num === 0){ //확인
      if(data.length<6){}
      props.select("confirm", data);
    }
    // else if(num === 1){
      
    // }
    props.onOff(false);
  }
  useEffect(()=>{
    setData(props.serialNum)
  },[])
  useEffect(()=>{
    if(props.btn == false){
      setTimeout(() => {
        props.onOff(false);
      }, 3000);
    }
  },[])
  const inputNum = (target) => {
    if (target.value.length > 6) {target.value = target.value.slice(0, 6)}
    target.value = target.value
    .replace(/[^0-9]/g, '')
    .replace(/^(\d{6})$/, `$1`);
  }
  useEffect(()=>{
    if(numInputRef.current.value){
      console.log(numInputRef.current.value.length)
      if(numInputRef.current.value.length < 6){
        if(!(numInputRef.current.classList.contains("invalid"))){
          numInputRef.current.classList += "invalid"
        }
      }
      if(numInputRef.current.value.length == 6){
        if((numInputRef.current.classList.contains("invalid"))){
          numInputRef.current.classList.remove("invalid");
        }
      }
    }
  },[data])
  return(
    <>
      <div className="serial-bg">
        <div className="serial-container" onClick={(e)=>{e.stopPropagation(); return;}}>
          <div className="serial-logo"><img src={process.env.PUBLIC_URL + '/spriokit.svg'} /></div>
          <div className="serial-img-container"><img src={process.env.PUBLIC_URL + '/serialNumGuide.svg'} /></div>
          <div className="serial-msg-container">
            <div>1. Spirokit 디바이스 뒷면 아래에 있는 스티커를 확인해주세요.</div>
            <div>2. 스티커의 아래쪽에 제조번호를 찾아 제조번호 6자리를 입력해주세요.</div>
          </div>
          <div className="serial-input-container ">
            <input ref={numInputRef}  type="text" name='name'
            value={data} 
            onChange={(e)=>{
              setData(e.target.value);
            }}
            onInput={(e)=>{
              inputNum(e.target);
            }}
            />
          </div>
          <div className="serial-Btn-container">
            <input className="serial-Btn serial-cancel" type="button" value="취소" onClick={(e)=>{e.preventDefault();click(e, 1)}}/>
            <input className="serial-Btn serial-enter" type="button" value="설정하기" onClick={(e)=>{e.preventDefault();click(e, 0)}}/>
          </div>
        </div>
      </div>
    </>
  )
}
export default SerialSetting;