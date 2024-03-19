import { useState, useRef, useEffect} from 'react';
import axios from 'axios';
import { Cookies, useCookies } from 'react-cookie';
import Alert from "../components/Alerts.js"
import { useNavigate } from 'react-router-dom'
import { FontAwesomeIcon} from '@fortawesome/react-fontawesome'
import { faChevronLeft } from '@fortawesome/free-solid-svg-icons'
import { FaBluetoothB } from "react-icons/fa6";
import {} from "@fortawesome/fontawesome-svg-core"
import { useDispatch, useSelector } from "react-redux"
import { changeDeviceInfo, reset } from "./../deviceInfo.js"
import { current } from '@reduxjs/toolkit';
import SerialSetting from "../components/SerialSetting.js"

const SettingPage = () =>{
  let dispatch = useDispatch()
  let deviceInfo = useSelector((state) => state.deviceInfo )
  const [accessToken,setAccessToken] = useState(window.api.get("get-cookies",'accessToken'));
  const date= new Date();
  let navigatorR = useNavigate();

  const logOut = () => {
    axios.post(`/auth/sign-out`,{
      headers: {
        Authorization: `Bearer ${accessToken}`
      }}).then((res)=>{
        window.api.send("remove-cookies", {url:'/',name:'refreshToken'});
        window.api.send("remove-cookies", {url:'/',name:'accessToken'});
        window.location.replace('/');
      }).catch((err)=>{
        console.log(err);
      });
  }

  const backToMemberList = async ()=>{
    
    await setCookie('device', device, {expires:date,secure:"true"}).then(
      (res)=>{
        console.log(res);
        navigatorR(-1);
      }
    );
  }

  // 기기 없음 메세지
  const [noneDevice, setNoneDevice] = useState(true);
  useEffect(()=>{
    if(deviceInfo.gatt){ //리스트에 있으면
      setNoneDevice(false);
      if(!deviceInfo.gatt.connected){ //연결여부
        //디바이스 연결X
        setNoneDevice(true);
      }
      else{
        // 연결 O
      }
    }
    else{ //기기없으면
      setNoneDevice(true);
    }
  })
  
  // 블루투스 아이콘 ref
  const blueIconRef = useRef();

  // 기기 연결 확인 시 아이콘 변화
  useEffect(() => {
    if(!noneDevice){
      blueIconRef.current.classList += " connect";
    }
    else{
      if(blueIconRef.current.classList.contains("connect")){
        blueIconRef.current.classList.remove("connect");
      }
      // console.log(blueIconRef.current);
    }
  }, [noneDevice])
  
  // async function scanDevice(){
  //   const wait = (timeToDelay) => new Promise((resolve) => setTimeout(resolve, timeToDelay))
  //   const device = new navigator.bluetooth.requestDevice({
  //     acceptAllDevices: true,
  //     // optionalServices: ['6e400001-b5a3-f393-e0a9-e50e24dcca9e'], //Nordic UART Service 가진 디바이스만 accept
  //   })
  //   .then((res)=>{
  //     console.log(res);

  //   })
  //   .catch((err)=>{
  //     console.log(err);
  //     setTimeout(() => {
  //       // console.log("디바이스가 검색되지 않습니다.");
  //     }, 5000);
  //     // device.reject();
  //   })
  //   // console.log(device);
  //   // if(navigator.bluetooth.)continue;
  //   await wait(5000);
  //   console.log("HEllo!! 5초 후 스캔버튼으로")
  //   console.log(device);
  //   // device.reject();
  //   return;
  //   // stopScan()
  //   // function stopScan(){
  //   //   device.stop();
  //   // }
  //   // try {
  //   //   let time = 1;
  //   //   while (time--) {
  //   //     const device = navigator.bluetooth.requestDevice({
  //   //       acceptAllDevices: true,
  //   //       optionalServices: ['6e400001-b5a3-f393-e0a9-e50e24dcca9e'] //Nordic UART Service 가진 디바이스만 accept
  //   //     })
  //   //     .then((res)=>{
  //   //       console.log("JE");
  //   //       console.log(res);
  //   //     })
  //   //     .catch((err)=>{
  //   //       console.log("HEHEHEHEHEH");
  //   //       console.log(err);
  //   //     })
  //   //     // console.log(device);
  //   //     // if(navigator.bluetooth.)continue;
  //   //     await wait(5000);
  //   //   }
  //   //   throw new Error('Stop!!!');
      
  //   // } catch (error) {
  //   //   console.error('Failed to select device:', error);
  //   // }
  // }


  // 기기 연결 PAST************************************************************************
// async function testIt () {
//   try{
//     const device = await navigator.bluetooth.requestDevice({
//       acceptAllDevices: true,
//       optionalServices: ['6e400001-b5a3-f393-e0a9-e50e24dcca9e']
//     })
//     console.log(device.id)
//     console.log(device.gatt)
//     // document.getElementById('device-name').innerHTML = device.name
    
//      // GATT 서버 연결
//     const server = await device.gatt.connect();
    
//     // Nordic UART Service 가져오기
//     const service = await server.getPrimaryService('6e400001-b5a3-f393-e0a9-e50e24dcca9e');
  
//     // 수신 특성 가져오기
//     const rxCharacteristic = await service.getCharacteristic('6e400002-b5a3-f393-e0a9-e50e24dcca9e');
  
//     // 송신 특성 가져오기
//     const txCharacteristic = await service.getCharacteristic('6e400003-b5a3-f393-e0a9-e50e24dcca9e');

    

//     // 검사하기 버튼 누르고 쓸 부분
//     // Notify(구독) 활성화
//     await txCharacteristic.startNotifications();
  
//     // Notify(구독) 이벤트 핸들러 등록
//     txCharacteristic.addEventListener('characteristicvaluechanged', handleCharacteristicValueChanged);
  
//     console.log('Connected to BLE device');
//   }
//   catch(error){
//     console.error('Failed to select device:', error);
//     console.log('Failed to select device. Please try again.');
//   }
// }

function cancelRequest () {
  window.electronAPI.cancelBluetoothRequest()
}
// window.electronAPI.bluetoothPairingRequest((event, details) => {
//   const response = {}

//   switch (details.pairingKind) {
//     case 'confirm': {
//       response.confirmed = window.confirm(`Do you want to connect to device ${details.deviceId}?`)
//       break
//     }
//     case 'confirmPin': {
//       response.confirmed = window.confirm(`Does the pin ${details.pin} match the pin displayed on device ${details.deviceId}?`)
//       break
//     }
//     case 'providePin': {
//       const pin = window.prompt(`Please provide a pin for ${details.deviceId}.`)
//       if (pin) {
//         response.pin = pin
//         response.confirmed = true
//       } else {
//         response.confirmed = false
//       }
//     }
//   }

//   window.electronAPI.bluetoothPairingResponse(response)
// })
// function handleCharacteristicValueChanged(event) {
//   const value = event.target.value;
//   // 데이터 처리 및 UART 프로토콜 해석
//   console.log('Received data:', value);
// }
function handleCharacteristicValueChanged(event) {
  console.log(event);
  const value = event.target.value;
  // 데이터 처리 및 UART 프로토콜 해석
  console.log('Received data:', value);
}
// 기기 연결 PAST************************************************************************

const [device, setDevice] = useState(undefined);
const deviceRef = useRef();
const txCharRef = useRef();


const bleDeviceList = document.getElementById("deviceList");
async function testIt() {
  let options = {
    acceptAllDevices: true, // show all
    optionalServices: ['6e400001-b5a3-f393-e0a9-e50e24dcca9e'],
  };
  try{
    const device = await navigator.bluetooth.requestDevice(options);
    let bluetoothDevice = device;
    deviceRef.current = device;
    bluetoothDevice.addEventListener('gattserverdisconnected',onDisconnected);
    // BluetoothDevice 객체 state에 저장
    // setDevice(bluetoothDevice);
    

    // let deviceName = document.createElement("div");
    // let deviceId = document.createElement("div");
    // let deviceNameContents = document.createElement("p");
    // let deviceIdContents = document.createElement("p");
    // let item = document.getElementsByClassName("device");
    // console.log(item);
    // deviceNameContents.appendChild(document.createTextNode(device.name)) 
    // deviceIdContents.appendChild(document.createTextNode(device.id)) 

    // deviceName.appendChild(deviceNameContents);
    // deviceId.appendChild(deviceIdContents);
    // item[0].appendChild(deviceName);
    // item[0].appendChild(deviceId);

    // // GATT 서버 연결
    const server = await device.gatt.connect();
    
    // Nordic UART Service 가져오기
    const service = await server.getPrimaryService('6e400001-b5a3-f393-e0a9-e50e24dcca9e');
  
    // 수신 특성 가져오기
    const rxCharacteristic = await service.getCharacteristic('6e400002-b5a3-f393-e0a9-e50e24dcca9e');
  
    // 송신 특성 가져오기
    const txCharacteristic = await service.getCharacteristic('6e400003-b5a3-f393-e0a9-e50e24dcca9e');
    txCharRef.current = txCharacteristic;
    // 검사하기 버튼 누르고 쓸 부분
    // Notify(구독) 활성화
    await txCharacteristic.startNotifications();
  
    // Notify(구독) 이벤트 핸들러 등록
    txCharacteristic.addEventListener('characteristicvaluechanged', handleCharacteristicValueChanged);
    dispatch(changeDeviceInfo(device))
  
    // console.log('Connected to BLE device');
    
    setSerialSettingStat(true)
  }
  catch(error){
    console.log(error);
    //     console.error('Failed to select device:', error);
    //     console.log('Failed to select device. Please try again.');
  }
}

async function onDisconnectButtonClick() {
  try{
    if (!deviceInfo) {
      return;
    }
    console.log('Disconnecting from Bluetooth Device...');
    if (deviceInfo.gatt.connected) {
      deviceInfo.gatt.disconnect();
      // setDevice(undefined);
      let obj = {name:""}
      dispatch(reset());
    } else {
      console.log('> Bluetooth Device is already disconnected');
    }
  }catch{

  }
}
function onDisconnected(event) {
  // Object event.target is Bluetooth Device getting disconnected.
  console.log('> Bluetooth Device disconnected');
  getConnectedDevice()
}
const getConnectedDevice = ()=>{
  window.api.send("getConnectedDevice", "");
}
window.api.receive("connectedBLEDevice", (data)=>{
  console.log(data);
})
// async function connected(name){
//   console.log("name : "+name);
//   if(name){
//     const device = await navigator.bluetooth.requestDevice({
//       acceptAllDevices: true, // show all
//       optionalServices: ['6e400001-b5a3-f393-e0a9-e50e24dcca9e'],
//       name: name,
//     });
//     console.log(device);
//   }
// }
// useEffect(()=>{
//   console.log("HRERERE!!");
//   getConnectedDevice();
// },[])

// window.api.receive("connectedBLEDevice", (data)=>{
//   console.log("HRERERE!!",data);
//   connected(data.deviceName);
// })



  // 씨리얼넘버 설정창
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
    <div className="setting-page-container">
      {serialSettingStat ? <SerialSetting content="검사를 시작하시겠습니까?" btn={true} onOff={setSerialSettingStat} select={serialFunc} serialNum={serialNum} setSerialNum={setSerialNum} /> : null}
        <div className="setting-page-nav" onClick={()=>{console.log()}}>
          <div className='setting-page-backBtn' onClick={()=>{navigatorR(-1)}}>
            <FontAwesomeIcon icon={faChevronLeft} style={{color: "#4b75d6",}} />
          </div>
          <p onClick={()=>{
            // console.log(txCharRef.current)
            console.log(deviceInfo);
            // console.log(blueIconRef.current);
          }}>설정</p>
        </div>

        <div className="setting-page-left-container">
          <div className="setting-page-left-container-nav">
            <p onClick={()=>{getConnectedDevice()}}>디바이스 정보</p>
            <div ref={blueIconRef} className="device-connect">
              {
                noneDevice ?
                  <p>연결되지 않음</p>
                  :
                  <p>연결됨</p>
              }
              <FaBluetoothB/>
            </div>
          </div>

          <div className='connect-info-container'>
            <div className='connect-info'>
                <p>{"PC의 블루투스 옵션을 켜신 후, 애플리케이션에서 요구하는 권한을 허용하셔야 합니다.\n"}디바이스의 전원을 켜신 후 스캔 버튼을 눌러주세요.</p>
                {"연결이 원활하지 않은 경우, 디바이스를 껐다가 다시 켜주신 후 연결을 시도해주세요."}

            </div>
          </div>
          <div className='device-list-container'>
            <div className="device-list-column">
              <div>디바이스</div>
              <div>맥 주소</div>
              <div>dB</div>
            </div>
            <div className="device-item-container">
                <div className="device"></div>
                {
                  deviceInfo.id ?
                    deviceSerialSetting ? 
                      <div className='connectDoneMsg'><p>{deviceInfo.name}이 연결되었습니다.</p></div>
                    :
                    <div className="device-item" onClick={()=>{setSerialSettingStat(true)}}>
                      <div>{deviceInfo.name}</div>
                      <div>-</div>
                      <div>-</div>
                    </div>
                    : <div className='none-device-text'>디바이스 연결 상태가 끊어졌습니다.</div>
                }
                </div>
          </div>
          <div className='device-scan-btn-container'>
            {
              deviceSerialSetting ?
                <div className='device-scan-btn' onClick={()=>{onDisconnected()}}>
                  <p>연결끊기</p>
                </div>
              :
                <div className='device-scan-btn' onClick={()=>{testIt()}}>
                  <p>스캔</p>
                </div>

            }
          </div>

        </div>
        <div className="setting-page-right-container">
          <div className="user-info-change-btn" onClick={()=>{navigatorR("./subjectSetting")}}><p>유저 정보 변경</p></div>
          <div className="measure-setting-btn" onClick={()=>{navigatorR("./managementSetting")}}><p>검사 설정</p></div>
          <div className="clinic-manage-btn" onClick={()=>{navigatorR("./mngClncs")}}><p>의료진 관리</p></div>
          <div className="device-manage-btn" onClick={()=>{navigatorR("./deviceSetting")}}><p>디바이스 관리</p></div>
          {
            deviceInfo.id ?
              <>
                <div className="calibration-btn" onClick={()=>{navigatorR("./gainPage")}}><p>보정</p></div>
                <div className="calibration-verification-btn" onClick={()=>{navigatorR("./verificationPage")}}><p>보정 검증</p></div>
              </>
              :
              <>
                <div className="calibration-btn disabled"><p>보정</p></div>
                <div className="calibration-verification-btn disabled"><p>보정 검증</p></div>
              </>
          }
          <div className="log-out-btn" onClick={logOut}><p>로그아웃</p></div>
        </div>
      </div>
  );
}

export default SettingPage;