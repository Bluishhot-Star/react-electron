import { useState, useRef, useEffect} from 'react';
import axios from 'axios';
import { Cookies, useCookies } from 'react-cookie';
import Alert from "../components/Alerts.js"
import { Routes, Route, Link,useNavigate,useLocation } from 'react-router-dom'
import {} from "@fortawesome/fontawesome-svg-core"
import { FontAwesomeIcon} from '@fortawesome/react-fontawesome'
import Confirm from "../components/Confirm.js"
import { debounce } from 'lodash'
import { RiLungsLine } from "react-icons/ri";
import { TbTrash } from "react-icons/tb";
import { FaRegCheckCircle } from "react-icons/fa";
import { faChevronLeft, faPersonMilitaryToPerson } from '@fortawesome/free-solid-svg-icons'
import {registerables,Chart as ChartJS,RadialLinearScale,LineElement,Tooltip,Legend,} from 'chart.js';
import { Scatter } from 'react-chartjs-2';
import annotationPlugin from 'chartjs-plugin-annotation';
import { changeDeviceInfo, reset } from "./../deviceInfo.js"
import { useDispatch, useSelector } from "react-redux"
const GainMeasurementPage = () =>{
  ChartJS.register(RadialLinearScale, LineElement, Tooltip, Legend, ...registerables,annotationPlugin);
  const [accessToken,setAccessToken] = useState(window.api.get("get-cookies",'accessToken'));
  const [serialNum, setSerialNum] = useState(window.api.get("get-cookies",'serialNum'));
  const location = useLocation();
  const chartRef = useRef();
  let firstBtnRef = useRef();
  let secondBtnRef = useRef();
  let thirdBtnRef = useRef();
  let fourTBtnRef = useRef();
  let graphConRef = useRef();


  let deviceInfo = useSelector((state) => state.deviceInfo ) 
  // const graphStyle = {width:"0" ,height:"0", transition:"none"}
  let windowWidth = window.innerWidth*0.6;
  let windowHeight = window.innerHeight-200;
  // const [windowHeight,setWindowHeight] = useState(window.innerHeight-200);
  const graphStyle = {width:"0" ,height:"0", transition:"none", maxHeight:windowHeight}
  let navigatorR = useNavigate();
  const state = location.state;

  
//  // 세션 가이드 컨텐츠
  const [gaugeContent, setGaugeContent] = useState()

  //흡기 선?
  const [inF, setInF] = useState(-1);
  //세션 세팅 완료
  const [inFDone, setInFDone] = useState(false);

  // 첫 가이드 컨텐츠 세팅 후 전체 세션 진행 수 설정 (흡기 선 breath*2, 호기 breathC *2 -1)
  const [sessionVol, setSessionVol] = useState(0);

  //  // 호/흡 세션 완료 후 timer로 전환 여부
  const [timerReady, setTimerReady] = useState(false);
  
  //첫 가이드 컨텐츠 세팅
  //  useEffect(()=>{
  //    if(inF !== -1){
  //      if(inF && timerReady===false){//흡기 선
  //        setGaugeContent({r11:"1", r12:breathCount, r2:"IN"})
  //       //  setSessionVol(breathCount*2);
  //      }
  //      else if(!inF && timerReady===false){//호기 선
  //        setGaugeContent({r11:"1", r12:breathCount, r2:"OUT"})
  //       //  setSessionVol(breathCount*2-1);
  //      }
  //      setSessionCount(1);
  //    }
  //  },[inF, timerReady])
  
  // 세션 카운트
  const [sessionCount, setSessionCount] = useState(0);

  // in<->out flip
  let inOutFlip = (val) =>{
    if(val == "IN"){
      return "OUT"
    }
    else{
      return "IN"
    }
  }

  // 호<->흡 바뀌면서 컨텐츠 바꾸기
  let sessionFlip = () => {
    if(sessionCount > sessionVol){
      setTimerReady(true);
      return;
    }
    if(sessionCount !== 0 && sessionCount%2 == 0){ //짝수면 카운트업
      //  let tgC = parseInt(gaugeContent.r11) + 1
      //  setGaugeContent({r11:tgC, r12: breathCount, r2: inOutFlip(gaugeContent.r2)});
    }
    else{
      setGaugeContent({...gaugeContent, r2: inOutFlip(gaugeContent.r2)});
    }
  }
  useEffect(()=>{
    if(sessionCount !== 1 && sessionCount !== 0){
      sessionFlip();
    }
  },[sessionCount])
  
  //  const [timerTick, setTimerTick] = useState(250); //default 250 (6/15)
  //  const [timerRunStat, setTimerRunStat] = useState(false);
  //  useEffect(()=>{
  //    if(timerRunStat){
  //      let i =1;
  //      setInterval(() => {
  //        if(i>60)return;
  //        itemRef.current[i++].classList += " tickColor";
  //      }, timerTick);
  //    }
  //  },[timerRunStat])
  


  class DataCalculateStrategyE {
    constructor() {
      this.FREQUENCY = 80_000_000; // 80MHz
      this.LIMIT_DATA = 100_000_000;
      this.COEFFICIENT = 0.035;
      this.SLOPE_ZOOM = 7;
      this.A = -50.719;
      this.B = 1.823;
    }
    
    analyze(data, inhaleCoefficient, exhaleCoefficient) {
      const useData = this.insertZeroBetweenInversionData(this.convertAll(data));
      const result = [];

      let calibratedLps = 0;

        result.push(new FluidMetrics(0, 0, 0));
        for (let i = 1; i < useData.length; i++) {
            const previous = useData[i - 1];
            const current = useData[i];
            const time = this.getTime(current);
            const lps = this.getCalibratedLPS(
                calibratedLps,
                previous,
                current,
                inhaleCoefficient,
                exhaleCoefficient
            );
            calibratedLps = lps;
            const volume = this.getVolume(lps, time);

            const metrics = new FluidMetrics(time, lps, volume);
            metrics.setExhale(this.isExhale(current));

            result.push(metrics);
        }

        return result[result.length-1];
    }

    getStrategy() {
        return 'E';
    }

    // DONE!
    getTime(value) {
        const body = this.getBody(value);
        const time = body * (1 / this.FREQUENCY);

        if (time === 0) return 0;
        return time;
    }

    // DONE!
    insertZeroBetweenInversionData(data) {
        const result = [];

        result.push(0);
        data.unshift(0);
        for (let i = 1; i < data.length; i++) {
            const current = data[i];
            let inversion = true;

            if (this.getBody(current) !== 0) {
                for (let j = i - 1; j >= 0; j--) {
                    const past = data[j];

                    if (this.isExhale(past) !== this.isExhale(current)) {
                        break;
                    }

                    if (this.getBody(past) !== 0) {
                        inversion = false;
                        break;
                    }
                }
            }

            if (inversion) {
                result.push(this.getZero(this.isExhale(current)));
            } else {
                result.push(current);
            }
        }

        return result;
    }


    getCalibratedLPS(
        calibratedPreLps,
        previous,
        current,
        inhale,
        exhale
    ) {
        const time = this.getTime(current);
        if (time === 0) return 0;

        const previousLps = this.getLps(previous, inhale, exhale);
        const currentLps = this.getLps(current, inhale, exhale);
        let calibratedLps = 0;

        // 기울기
        const slope = (currentLps - previousLps) / time;
        if (slope >= 0) {
            calibratedLps = currentLps;
        } else {
            if (Math.abs(calibratedPreLps) === 0) return 0;
            const predSlope = this.A * Math.pow(currentLps, this.B);
            calibratedLps = currentLps - (currentLps * ((slope / predSlope) * this.SLOPE_ZOOM));
            if (calibratedLps < 0) return 0;
        }

        if (!this.isExhale(current)) return -calibratedLps;
        else return calibratedLps;
    }

    // DONE
    getZero(isExhale) {
        if (isExhale) return 0;
        else return this.LIMIT_DATA;
    }

    // DONE
    getLps(data, inhaleGain, exhaleGain) {
        const time = this.getTime(data);
        if (time === 0) return 0;
        const rps = 1 / time;

        const isExhale = this.isExhale(data);

        if (isExhale) return (rps * this.COEFFICIENT) * exhaleGain;
        else return (rps * this.COEFFICIENT) * inhaleGain;
    }
    
    // DONE
    getVolume(lps, time) {
        return Math.abs(lps) * time;
    }

    // DONE
    isExhale(data) {
        const head = Math.floor(data / this.LIMIT_DATA);
        return !(head === 1);
    }

    // DONE
    convert(data) {
        if (data.length === 10) return parseInt(data.substring(0, 9));
        else if (data.length === 9) return parseInt(data);
        else return 0;
    }

    // DONE
    convertAll(allData) {
        const data = allData.split(" ");
        const result = [];

        for (let i = 0; i < data.length; i++) {
            const value = this.convert(data[i]);
            result.push(value);
        }

        return result;
    }
    
    // DONE
    getHead(data) {
        return Math.floor(data / this.LIMIT_DATA);
    }

    // DONE
    getBody(data) {
        return data % this.LIMIT_DATA;
    }
  }
  class FluidMetrics {
    constructor(time, lps, volume) {
        this.time = time;
        this.lps = lps;
        this.volume = volume;
        this.exhale = false;
    }

    setExhale(value) {
        this.exhale = value;
    }
  }

  const dataCalculateStrategyE = new DataCalculateStrategyE();

  const inhaleCoefficient = 1.0364756559407444; // 흡기 계수 (API에서 가져올 예정)
  const exhaleCoefficient = 1.0581318835872322; // 호기 계수


  const [dataResult, setDataResult] = useState([]);
  // 기기 없음 메세지
  const [noneDevice, setNoneDevice] = useState(false);
  // 시작확인 메세지
  const [startMsg, setStartMsg] = useState(false);
  // 검사 시작 전 구독상태
  const [notifyStart, setNotifyStart] = useState(false);
  // 구독 완료
  const [notifyDone, setNotifyDone] = useState(false);
  // 검사버튼 먼저 누르고 온 경우 notify 확인 후 구독 완료
  const [alNotifyDone, setAlNotifyDone] = useState(false);
  // 검사 시작 전 준비완료 상태(구독완)
  const [meaPreStart, setMeaPreStart] = useState(false);

  // 검사 활성화위한 호기 감지
  const [blow, setBlow] = useState(false);
  // 호기 감지 후 검사 활성화
  const [blowF, setBlowF] = useState(false);

  // 검사 시작 상태
  const [meaStart, setMeaStart] = useState(false);
  // 데이터 리스트
  const [dataList, setDataList] = useState([]);
  // real데이터 리스트
  const [realDataList, setRealDataList] = useState([]);
  // 검사시작 flag, 이 이후로 realData
  const [flag, setFlag] = useState(-1)

  // volume-flow 그래프 좌표
  const [volumeFlowList, setVolumeFlowList] = useState([]);
  const [timeVolumeList, setTimeVolumeList] = useState([]);
  // let TvolumeFlowList = [];
  // time-volume 그래프 좌표
  // const [timeVolumeList, setTimeVolumeList] = useState([]);

//----------------------------------------------------------------------------------------------- 111111

  // 기기 연결 여부 검사
  useEffect(()=>{
    if(deviceInfo.gatt){ //리스트에 있으면
      setNoneDevice(false);
      if(!deviceInfo.gatt.connected){ //연결여부
        //디바이스 연결X
        setNoneDevice(true);
        setDisconnectStat(true);
        window.api.send("getConnectedDevice", "");
      }
      else{
        // 연결 O
        setNotifyStart(true);
        
      }
    }
    else{ //기기없으면
      setNoneDevice(true);
      setDisconnectStat(true);
    }
  })
  
  //기기 없음 메세지 띄우기
  useEffect(()=>{
    if(noneDevice){
      console.log("기기없음 메세지")
    }
  },[noneDevice])
//----------------------------------------------------------------------------------------------- 222222
  
  // 연결 확인 & 구독 시작
  useEffect(()=>{

    if(notifyStart){
      console.log("연결확인 및 구독")
      //  if(secondBtnRef.current.classList.contains("disabled")){
      //   secondBtnRef.current.classList.remove("disabled");
      // }
      testIt()
    }
  },[notifyStart])

//----------------------------------------------------------------------------------------------- 

  // 준비완료 알림창
  const [readyAlert, setReadyAlert] = useState(false);
  useEffect(()=>{
    if(notifyDone){

      setReadyAlert(true);
      let time = setTimeout(() => {
        setMeaPreStart(true);
      }, 1000);
    }
  },[notifyDone])
  useEffect(()=>{
    if(meaPreStart){ //구독 완료시
      // setDataList([])

    }
    else{
      
      firstBtnRef.current.classList += " disabled";
      secondBtnRef.current.classList += " disabled";
      thirdBtnRef.current.classList += " disabled";
      fourTBtnRef.current.classList += " disabled";
    }
  },[meaPreStart])

//----------------------------------------------------------------------------------------------- 44444
  // 구독 완료 후 처리

  useEffect(()=>{
    if(alNotifyDone){
      
      console.log(dataList)
      if(dataList.length == 0){
        console.log("aa")
        setBlow(true);
      }
    }
  },[alNotifyDone])

  useEffect(()=>{ 
    console.log(dataList)
    if(dataList[0] == '2'){
      setNotifyDone(true);
    }
    if(dataList[0] == '2' && dataList[1] == '2' && dataList[2] == '2'){
      setBlow(true);
    }
    if(blow==true&&blowF==false){
      console.log(dataList[dataList.length-1].slice(0,1))
      if(dataList[dataList.length-1].slice(0,1) == "0"){
        //css 변화로 검사 활성화
        if(firstBtnRef.current.classList.contains("disabled")){
          firstBtnRef.current.classList.remove("disabled");
        }
      }
    }
  },[dataList])


//  useEffect(()=>{
//   if(readyAlert){
    
//     if(firstBtnRef.current.classList.contains("disabled")){
//     }
//     firstBtnRef.current.classList.remove("disabled");
//   }
//  },[readyAlert])

//-----------------------------------------------------------------------------------------------
  // 시작 확인 시 flag 세우기 -> 처리할 데이터 슬라이싱
  useEffect(()=>{
    if(meaStart){
      
      let time = setTimeout(() => {
        setFlag({idx: dataList.length, rIdx: 1}); // idx : dataList에서의 인덱스, rIdx : realData에서의 인덱스
      }, 1000);
    }
  },[meaStart])
  
//-----------------------------------------------------------------------------------------------

  const [rawDataList, setRawDataList] = useState([0]); // raw data 처리 전 (0만 뗀거)
  const [calDataList, setCalDataList] = useState([]); // raw data 처리 -> time/volume/lps/exhale
  const [calFlag, setCalFlag] = useState(0); // calDataList에서 그래프 좌표로 처리할 index=>현재 처리된 index

  // 그래프 좌표 생성 시작
  useEffect(()=>{
    if(calDataList[calFlag] && meaStart){
      let item = calDataList[calFlag];
      setVFGraphData(item.volume, item.lps);
      //  setTVGraphData(item.time, item.volume, item.exhale);
      setCalFlag(calFlag+1);
    }
  },[flag, calDataList])

  // raw데이터 들어오면 -> rawDataList에 넣기
  useEffect(()=>{
    if(flag.idx>0 && dataList[flag.idx]){

      // let data = [...dataList.slice(parseInt(flag))];

      let currItemR = dataList[flag.idx]; //현재 다룰 raw 데이터
      let currItem = dataCalculateStrategyE.convert(currItemR); // 데이터 전처리 후
      let preItem = rawDataList[flag.rIdx-1]; //그 이전 데이터


      let TrawDataList = [...rawDataList];
      
      // 호 <-> 흡 바뀔 때 0 넣기 주석
      // let currItemR = data[data.length-1]; //방금 들어온 raw 데이터
      // let currItem = dataCalculateStrategyE.convert(currItemR); // 데이터 전처리 후
      // if(dataCalculateStrategyE.isExhale(preItem) !== dataCalculateStrategyE.isExhale(currItem)){
      //   TrawDataList.push(dataCalculateStrategyE.getZero(dataCalculateStrategyE.isExhale(currItem)));
      // }

      TrawDataList.push(currItem);
      setRawDataList(TrawDataList);
      setFlag({idx : flag.idx+1, rIdx: flag.rIdx+1})
      
      // console.log(123);
      // setVolumeFlowList(setVFGraphData(item.volume, item.lps));
    }

  },[dataList, flag])


//-----------------------------------------------------------------------------------------------
  // raw 데이터 입력 시 처리 process

  // calibratedLps -> api에서 추출
  const [calibratedLps, setCalibratedLps] = useState(-10);
  const [cTime, setCTime] = useState();
  const [cVolume, setCVolume] = useState(-999);
  const [cExhale, setCExhale] = useState();
  useEffect(()=>{
    let previous = rawDataList[rawDataList.length-2];
    let current = rawDataList[rawDataList.length-1];
    let time = dataCalculateStrategyE.getTime(current);
    let lps = dataCalculateStrategyE.getCalibratedLPS(calibratedLps, previous, current, inhaleCoefficient, exhaleCoefficient);
    let exhale = dataCalculateStrategyE.isExhale(current);
    

    if(cExhale !== exhale){
      if(sessionVol !== 0 ){
        let tempSesCnt = sessionCount + 1
        setSessionCount(tempSesCnt); 
      }
    }
    //  if(cExhale && timerReady && !timerStart && !measureDone){
    //    setTimerStart(true);
    //  }

    setCExhale(exhale);
    setCTime(time);
    setCalibratedLps(lps)
  },[rawDataList])

  useEffect(()=>{
    if(calibratedLps !== -10){
      let volume = dataCalculateStrategyE.getVolume(calibratedLps, cTime);
      setCVolume(volume);
    }
  },[calibratedLps]);
  useEffect(()=>{
    if(cVolume !== -999){
      let metrics = new FluidMetrics(cTime, calibratedLps, cVolume);
      metrics.setExhale(cExhale);
      calDataList.push(metrics);
      setCalDataList(calDataList);

    }
  },[cVolume])



  

//------------------------------------------------------------------------------------------------
//재검사
const resetChart = () => {
  const initialV = [2,2,2] 
  setDataList([initialV]);
  setCalivration({
    "gain": {
            "exhale": "",
            "inhale": ""
        
    },
    "before": {
        "exhale": {
            "meas": "",
            "error": ""
        },
        "inhale": {
            "meas": "",
            "error": ""
        }
        
    },
    "after": {
        "exhale": {
            "meas": "",
            "error": ""
        },
        "inhale": {
            "meas": "",
            "error": ""
        }

    },
    "graph": {
        "time-volume": [
            {
                "x": 0.0,
                "y": 0.0
            }
        ],
        "volume-flow": [
            {
                "x": 0.0,
                "y": 0.0
            }
        ],

    },
    
    "calibrationId": ""
})
  setInF(-1);
  setInFDone(false);
  setVolumeFlowList([{x:0, y:0}]);
  setCalDataList([calDataList[0]]);
  setCalFlag(1);
  setTimerReady(false);
}




//------------------------------------------------------------------------------------------------
  // 시작 메세지 띄우기
  useEffect(()=>{
    if(blowF){
      console.log("메세지 띄우려면")
      setStartMsg(true);
    }
  },[blowF])

  //  useEffect(()=>{
  //    if(startMsg){
  //      //시작 메세지 띄우기
  //      console.log("시작 메세지 띄우기")
  //      setConfirmStat(true);
  //      // setDataList([])
  //      // setMeaStart(true);
  //    }
  //  },[startMsg])

//-----------------------------------------------------------------------------------------------

  // volume-flow 그래프 좌표 함수
  let setVFGraphData = ( rawV, rawF )=>{
    try{
      let x, y;
      let preXY; //이전값
      // preXY 값 할당
      // let TvolumeFlowList = [...volumeFlowList];
      //초기값 세팅
      if(volumeFlowList.length == 0){
        preXY = {x:0, y:0}
      }
      else{
        preXY = volumeFlowList[calFlag-1]
      }
  
      // 흡기 시
      if (rawF < 0){
        if(!inFDone && meaStart && rawV!==0){ //흡기선?
          setInF(true);
          setInFDone(true);
        }
        
        // if(preXY['y']<=0 && sessionVol !== 0 ){
        //   let tempSesCnt = sessionCount + 1
        //   setSessionCount(tempSesCnt); 
        // }

        //x값 처리
        // x값 최저
        if (preXY['x'] == 0){
          // 현재 x값 오른쪽 밀기
          // TvolumeFlowList.forEach((item, idx) =>{
          //     let itemTemp = {...item};
          //     itemTemp['x'] += rawV;
          //     TvolumeFlowList[idx] = itemTemp; //setState로 변경사항 setState(temp);
          // })
          setVolumeFlowList(volumeFlowList.map((item)=>{
            item['x'] += rawV;
          }))
          x = 0;
        }
        else{
          let vTemp = preXY['x']-rawV;
          if(vTemp<0){
              // 현재 x값 오른쪽 밀기
              // TvolumeFlowList.forEach(item =>{
              //     let itemTemp = {...item};
              //     itemTemp['x'] += Math.abs(vTemp);
              //     item = itemTemp; //setState로 변경사항 setState(temp);
              // })
              setVolumeFlowList(volumeFlowList.map((item)=>{
                item['x'] += Math.abs(vTemp);
              }))
              x = 0;
          }
          else{
            x = vTemp;
          }
        }
      }
      //호기 시
      else{
        if(!inFDone && meaStart && rawV!==0){ //호기선?
          setInF(false);
          // console.log("hererer")
          setInFDone(true);
        }
        // if(preXY['y']<=0 && sessionVol !== 0 ){
        //   let tempSesCnt = sessionCount + 1
        //   setSessionCount(tempSesCnt); 
        // }
        x = preXY['x'] + rawV;
      }
      
      volumeFlowList.push({x: x, y:rawF});
      //  console.log(volumeFlowList);
      setVolumeFlowList(volumeFlowList);
      //  if(timerReady && timerStart){
      //    if(rawF == 0){
      //      setTimerStart(false);
      //      setMeasureDone(true);
      //    }
      //  }
      // return {x: x, y:rawF};
    }
    catch(err){
      console.log(err)
    }
    
  }


  //----------------------------------------------------------------------------------------------- 333333
  let txCharRef = useRef();
  // 검사 구독 함수
  async function testIt() {
    let options = {
      // filters: [
      //   { services: [xyz] },
      //   { name: 'xyz' },       // only devices with ''
      //   { namePrefix: 'xyz' }, // only devices starts with ''
      // ],
      // optionalServices: [
      //   xyzServiceUuid,
      // ],
      acceptAllDevices: true, // show all
      optionalServices: ['6e400001-b5a3-f393-e0a9-e50e24dcca9e'],
    };
    try{
      // GATT 서버 연결
      const server = await deviceInfo.gatt.connect();
      // Nordic UART Service 가져오기
      const service = await server.getPrimaryService('6e400001-b5a3-f393-e0a9-e50e24dcca9e');
    
      // 수신 특성 가져오기
      const rxCharacteristic = await service.getCharacteristic('6e400002-b5a3-f393-e0a9-e50e24dcca9e');
    
      // 송신 특성 가져오기
      // const txCharacteristic = await service.getCharacteristic('6e400003-b5a3-f393-e0a9-e50e24dcca9e');
      txCharRef.current = await service.getCharacteristic('6e400003-b5a3-f393-e0a9-e50e24dcca9e');

      // 검사하기 버튼 누르고 쓸 부분
      // Notify(구독) 활성화
      // await txCharacteristic.startNotifications();
      await txCharRef.current.startNotifications();
      if(txCharRef.current.properties['notify'] === true){
        setAlNotifyDone(true);
      }
      // Notify(구독) 이벤트 핸들러 등록
      txCharRef.current.addEventListener('characteristicvaluechanged', handleCharacteristicValueChanged);
      console.log('Connected to BLE device');
      
    }
    catch(error){
      console.log(error);
      //     console.error('Failed to select device:', error);
      //     console.log('Failed to select device. Please try again.');
    }
  }
  function onDisconnected(event) {
    // Object event.target is Bluetooth Device getting disconnected.
    console.log('> Bluetooth Device disconnected');
  }
  
  // rawData 문자열
  let [result, setResult] = useState();
  //데이터 문자로 바꾸기
  let arrayToString = (temp)=>{
    let buffer = temp.buffer;
    let rawData = String.fromCharCode.apply(null, Array.from(new Uint8Array(buffer))).trim()
    dataList.push(rawData);
    setDataList([...dataList]);
    return String.fromCharCode.apply(null, Array.from(new Uint8Array(buffer))).trim()
  }
  //데이터 핸들링
  let deviceDataHandling = (arr)=>{
    let tempArr = [];
    arr.forEach((item)=>{
        tempArr.push(arrayToString(item))                                                                                                                                                                                                       
    })
    setResult(tempArr.join(' '));
  }
  // 데이터 출력
  function handleCharacteristicValueChanged(event) {
    const value = event.target.value;
    // 데이터 처리 및 UART 프로토콜 해석

    console.log('Received data:', value);
    arrayToString(value)
  }

 //-----------------------------------------------------------------------------------------------
  // 확인창 
  const [confirmStat, setConfirmStat] = useState(false);
  let confirmFunc = (val)=>{
    if(val=="confirm"){
      setMeaStart(true);
    }
  }
//-----------------------------------------------------------------------------------------------
  // 확인창 
  const [disconnectStat, setDisconnectStat] = useState(false);
  const [confirm,setConfirm] = useState(true);
  let disconnectConfirmFunc = (val)=>{
    
    if(val=="confirm"){
      navigatorR("/setting");
    }else{
      setConfirm(false);
    }
  }
  useEffect(()=>{console.log(confirm)},[confirm])
//-----------------------------------------------------------------------------------------------


  // volumeFlow 그래프 그리기
  useEffect(()=>{
    // console.log(rawDataList)
    // let dataList1=[]
    // console.log(volumeFlowList);
    // volumeFlowList.forEach((item,index)=>{
    //   dataList1.push(item)

      
    // })
    // console.log(dataList1)
    let data = {
      labels: '',
      datasets: [{
        label: "",
            data: volumeFlowList,
            borderColor: `red`,
            borderWidth: 2.5,
            showLine: true,
            tension: 0.4
      }],
    }
    setGraphData(data);
  },[calFlag])





//-----------------------
  const [first, setFirst] = useState({x:window.innerWidth, y: window.innerHeight})
  const [second, setSecond] = useState({x:window.innerWidth, y: window.innerHeight})
  const [temp, setTemp] = useState(false);
  const [maxMin,setMaxMin] = useState(9);

  const handleResize = debounce(()=>{
    setTemp(false);
    setSecond({
      x: window.innerWidth,
      y: window.innerHeight,
    })
  })





  useEffect(()=>{
    setFirst(second)
  },[second])

  useEffect(()=>{
    let time = setTimeout(() => {
      if (first["x"]===second["x"] && first["y"]==second["y"]){
        console.log("OOOOOOHHH")
        setTemp(true);
        if(chartRef.current){
          console.log("HELLO")
          chartRef.current.resize();
        };
      }
      else{
        setTemp(false)
        console.log("HEllt")
      };
    },300);
    return()=>{clearTimeout(time)}
  })
  
  useEffect(()=>{
    setFirst({
      x: window.innerWidth,
      y: window.innerHeight,
    })
  },[])


  useEffect(()=>{
    window.addEventListener("resize", handleResize)
    return()=>{
      window.removeEventListener("resize", handleResize)
    }
  },[])


  const [graphData, setGraphData] = useState({
    labels: ['Gain'],
    datasets: [{
      label: "",
      data: [
        {x: 0.030999999999999996, y: 0.23858681948280723},
        {x: 0.030999999999999996, y: 0.23858681948280724},
        {x: 0.030999999999999996, y: 0.23858681948280724}],
      borderColor: 'rgb(255,255,255)',
      showLine: true,
      tension: 0.4
    },]
  })


  const graphOption={
    plugins:{
      legend: {
          display: false
      },
      resizeDelay:0,
      datalabels: false,

      annotation: {
        annotations: {
          box1: {
            type: 'box',
            yMin: 1,
            yMax: 2,
            backgroundColor: 'rgba(255, 199, 199,.3)',
            borderColor: 'rgba(0,0,0,0)'
          },
          box2: {
            type: 'box',
            yMin: -2,
            yMax: -1,
            backgroundColor: 'rgba(255, 199, 199,.3)',
            borderColor: 'rgba(0,0,0,0)'
          },
          box3: {
            type: 'box',
            yMin: -5,
            yMax: -3,
            backgroundColor: 'rgba(197, 223, 255,.3)',
            borderColor: 'rgba(0,0,0,0)'
          },
          box4: {
            type: 'box',
            yMin: 3,
            yMax: 5,
            backgroundColor: 'rgba(197, 223, 255,.3)',
            borderColor: 'rgba(0,0,0,0)'
          },
          box5: {
            type: 'box',
            yMin: 6,
            yMax: 9,
            backgroundColor: 'rgba(236, 244, 218,.3)',
            borderColor: 'rgba(0,0,0,0)'
          },
          box6: {
            type: 'box',
            yMin: -9,
            yMax: -6,
            backgroundColor: 'rgba(236, 244, 218,.3)',
            borderColor: 'rgba(0,0,0,0)'
          },
          line1: {
            type: 'line',
            yMin: 0,
            yMax: 0,
            borderColor: 'rgba(1, 138, 190, .3)',
            borderWidth: 2,
          }
        }
      },
    },
    
    responsive: true,
    //그래프 비율설정!!!!!!!
    aspectRatio: 0.6,
    maintainAspectRatio: false,

    animation:{
      duration:0
    },
    interaction: false, 
    elements: {
      point: {
        radius: 0,
      },
    },
    scales: {
      x: {
        axios: 'x',
        tickLength:5,
        suggestedMax: 5.0,
        ticks:{
          autoSkip: false,
          // min: 0.00,
          // max: 15.00,

          stepSize : 1.0,
          // sampleSize:9,

          // precision : 0.1,
          beginAtZero: true,
        },
        grid:{
          color: '#bbdfe4'
        }
      },
      y: {
        gridLines:{
          zeroLineColor:'rgb(0, 0, 255)',
        },
        axios: 'y',

        // grace:"5%",
        tickLength:9,
        ticks: {
          major: true,
          beginAtZero: true,
          
          // sampleSize:9,
          border:60,
          stepSize : maxMin < 10.00 ? 1 : maxMin < 25 ? 2.5 : 3,
          // fontSize : 10,
          textStrokeColor: 10,
          precision: 1,
        },
        grid:{
          tickLength:9,
          color:'#bbdfe4',
        }
      },
    },
  }
//   useEffect(()=>{
    
//     let dataList=[]
    
//     state.result.graph.volumeFlow.forEach((item,index)=>{
//       dataList.push(item)
      
//     })
//     let data = {
//       labels: '',
//       datasets: [{
//         label: "",
//         data: dataList,
//         borderColor: `rgb(5,128,190)`,
//         borderWidth: 2.5,
//         showLine: true,
//         tension: 0.4
//       }],
//     }
//     console.log(data)
//     setGraphData(data);
//   },[])
  useEffect(()=>{
    let time = setTimeout(() => {
      setTemp(true);
    },1000);
  },[graphData])

//------------------------------------------------
//캘브레이션 전용
const [calivration,setCalivration] = useState({
				"gain": {
                "exhale": "",
                "inhale": ""
            
				},
        "before": {
            "exhale": {
                "meas": "",
                "error": ""
            },
            "inhale": {
                "meas": "",
                "error": ""
            }
            
        },
        "after": {
            "exhale": {
                "meas": "",
                "error": ""
            },
            "inhale": {
                "meas": "",
                "error": ""
            }

        },
				"graph": {
						"time-volume": [
              {
                  "x": 0.0,
                  "y": 0.0
              }
						],
						"volume-flow": [
              {
                  "x": 0.0,
                  "y": 0.0
              }
						],

				},
				
        "calibrationId": ""
  });

  const calivrationApply = ()=>{
    console.log()
    let rDataList = [];
    
    rawDataList.map((num)=>rDataList.push(String(num).padStart(9, "0"))) 
    if(serialNum !== undefined){
      axios.post(`/devices/${serialNum}/calibrations`, 
      {
        temperature: state.temperature,
        humidity: state.humidity,
        pressure: state.pressure,
        data:rDataList.join(' '),
      },{
        headers: {
          Authorization: `Bearer ${accessToken}`
      }},
      {withCredentials : true})
      .then((res)=>{
        console.log(res.data.response.calibrationId);
        fourTBtnRef.current.classList.remove("disabled")
        setCalivration(res.data.response);
      })
      .catch((err)=>{
        console.log(err);
      })
    }
    
  }
  //----------------------------------------------
  //캘리브레이션 폐기
  const calivrationDispos = ( )=>{
    axios.delete(`/calibrations/${calivration.calibrationId}`, 
    {
      headers: {
        Authorization: `Bearer ${accessToken}`
    }},
    {withCredentials : true})
    .then((res)=>{
      console.log(res.data.response);
    })
    .catch((err)=>{
      console.log(err);
    })
  }
  useEffect(()=>{console.log(state.temperature)},[])
  // useEffect(()=>{console.log(JSON.stringfy(rawDataList))},[rawDataList])

  const [grayBg, setGrayBg] = useState("");
  useEffect(()=>{
    if(temp){
      setGrayBg("");
    }
    else{
      setGrayBg("loadingBG");
    }
  },[temp])

  return(
    <div className="gain-measurement-page-container">
      {disconnectStat&&confirm ? <Confirm content={"연결된 Spirokit기기가 없습니다.\n설정 페이지로 이동해서 Spirokit을 연결해주세요."} btn={true} onOff={setDisconnectStat} select={disconnectConfirmFunc}/> : null}
      {readyAlert ? <Confirm content="준비 중입니다..." btn={false} onOff={setReadyAlert} select={confirmFunc}/> : null}
      <div className="gain-measurement-page-nav">
        <div className='gain-measurement-page-backBtn' onClick={()=>{navigatorR(-1)}}>
            <FontAwesomeIcon icon={faChevronLeft} style={{color: "#4b75d6",}} />
        </div>
        <p onClick={()=>{

        }}>보정</p>
      </div>
      <div className='gain-measurement-page-graph-operation-container'>
        <div className='gain-measurement-m-page-container'>
          <div className={"gain-measurement-page-left-container " + grayBg} ref={graphConRef}>
            {temp?<div className="title-y"><p>Flow(l/s)</p></div>:<></>}
            {temp?<div><Scatter ref={chartRef} style={graphStyle} data={graphData} options={graphOption}/></div>:null}
            {temp?<div className="title-x"><p>Volume(L)</p></div>:<></>}
          </div>

          <div className="gain-measurement-page-right-container">
            <div className='gain-measurement-gain-container'>
              <div>
                <p className='gain-measurement-title'>Gain</p>
              </div>
              <div className='gain-measurement-table-container'>
                <div className='gain-measurement-table-Inhale'>
                  <p>Inhale</p>
                  <p>{calivration.gain.inhale? calivration.gain.inhale:'-'}</p>

                </div>
                <div className='gain-measurement-table-Exhale'>
                  <p>Exhale</p>
                  <p>{calivration.gain.exhale? calivration.gain.exhale:'-'}</p>
                </div>
              </div>           
            </div>
            <div className='gain-measurement-calivration-container'>
              <div>
                <p className='gain-measurement-title'>Before Calivration</p>
              </div>

              <div className='gain-measurement-calivration-table-container'>
                <div className='gain-measurement-calivration-table-column'>
                  <p></p>
                  <p>Volume(L)</p>
                  <p>Error(%)</p>
                </div>
                <div className='gain-measurement-calivration-table-Inhale'>
                  <p>Inhale</p>
                  <p>{calivration.before.inhale.meas? calivration.before.inhale.meas:'-'}</p>
                  <p>{calivration.before.inhale.error? calivration.before.inhale.error:'-'}</p>
                </div>
                <div className='gain-measurement-calivration-table-Exhale'>
                  <p>Exhale</p>
                  <p>{calivration.before.exhale.meas? calivration.before.exhale.meas:'-'}</p>
                  <p>{calivration.before.exhale.error? calivration.before.exhale.error:'-'}</p>
                </div>

              </div>
                      
            </div>
            <div className='gain-measurement-calivration-container'>
              <div>
                <p className='gain-measurement-title'>After Calivration</p>
              </div>

              <div className='gain-measurement-calivration-table-container'>
                <div className='gain-measurement-calivration-table-column'>
                  <p></p>
                  <p>Volume(L)</p>
                  <p>Error(%)</p>
                </div>
                <div className='gain-measurement-calivration-table-Inhale'>
                  <p>Inhale</p>
                  <p>{calivration.after.inhale.meas? calivration.after.inhale.meas:'-'}</p>
                  <p>{calivration.after.inhale.error? calivration.after.inhale.error:'-'}</p>
                </div>
                <div className='gain-measurement-calivration-table-Exhale'>
                  <p>Exhale</p>
                  <p>{calivration.after.exhale.meas? calivration.after.exhale.meas:'-'}</p>
                  <p>{calivration.after.exhale.error? calivration.after.exhale.error:'-'}</p>
                </div>

              </div>
                      
            </div>

          
          </div>
        </div>

        <div className='gain-measure-operation'>
          <div ref={firstBtnRef} onClick={()=>{
              
              if(!(firstBtnRef.current.classList.contains("disabled"))){
                setBlowF(true);
              setMeaStart(true);
              secondBtnRef.current.classList.remove("disabled");
              thirdBtnRef.current.classList.remove("disabled");
              firstBtnRef.current.classList += " disabled";
              }
            }}>
              <RiLungsLine className='lungIcon'/>시작
          </div>
          <div ref={secondBtnRef} onClick={()=>{
            if(!secondBtnRef.current.classList.contains("disabled")){
              resetChart()

            }
            }}>
              <RiLungsLine className='lungIcon'/>재측정</div>
          <div ref={thirdBtnRef} onClick={()=>{
            if(!thirdBtnRef.current.classList.contains("disabled")){
              calivrationApply()
              setMeaStart(false);
              fourTBtnRef.current.classList.remove("disabled");
              secondBtnRef.current.classList += " disabled";
              thirdBtnRef.current.classList += " disabled";
              fourTBtnRef.current.classList += " disabled";
            }
            
          }}>
            <FaRegCheckCircle className='lungIcon' />적용</div>
          <div ref={fourTBtnRef} onClick={()=>{
            resetChart()
            calivrationDispos();
            fourTBtnRef.current.classList += " disabled";
          }}>
            <TbTrash className='trashIcon'/>폐기</div>
        </div>
      </div>
      
      
      
    </div>
  );
}

export default GainMeasurementPage;