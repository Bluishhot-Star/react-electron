import { useState, useRef, useEffect} from 'react';
import axios from 'axios';
import Alert from "../components/Alerts.js"
import { Routes, Route, Link,useNavigate,useLocation } from 'react-router-dom'
import {} from "@fortawesome/fontawesome-svg-core"
import Confirm from "../components/Confirm.js"
import { FontAwesomeIcon} from '@fortawesome/react-fontawesome'
import { debounce } from 'lodash'
import { faChevronLeft, faPersonMilitaryToPerson } from '@fortawesome/free-solid-svg-icons'
import { RiLungsLine } from "react-icons/ri";
import { FaMagnifyingGlassChart } from "react-icons/fa6";
import { RxImage } from "react-icons/rx";
import {registerables,Chart as ChartJS,RadialLinearScale,LineElement,Tooltip,Legend,} from 'chart.js';
import { Scatter } from 'react-chartjs-2';
import annotationPlugin from 'chartjs-plugin-annotation';
import { changeDeviceInfo, reset } from "../deviceInfo.js"
import { useDispatch, useSelector } from "react-redux"
import { useInView } from 'react-intersection-observer';
import html2canvas from "html2canvas";
const VerificationPage = () =>{
  ChartJS.register(RadialLinearScale, LineElement, Tooltip, Legend, ...registerables,annotationPlugin);
  const [accessToken,setAccessToken] = useState(window.api.get("get-cookies",'accessToken'));
  const [serialNum, setSerialNum] = useState(window.api.get("get-cookies",'serialNum'));
  const location = useLocation();
  const chartRef = useRef();
  let firstBtnRef = useRef();
  let secondBtnRef = useRef();
  let thirdBtnRef = useRef();
  let graphConRef = useRef();
  const [ref, inView] = useInView();

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
    // console.log(dataList)
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
  setApply(false)
  setVerify([])
  setPass({
    "firstP":false,
    "firstM":false,
    "secondP":false,
    "secondM":false,
    "thirdP":false,
    "thirdM":false
  })
  setRawDataList([])
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
    console.log('rawdata',rawData)
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
    animation:{
      duration:0
    },
    maintainAspectRatio: false,
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
          color: '#bbdfe4',

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
//----------------------------------------------
//보정검사
  const [pass,setPass] = useState({
    "firstP":false,
    "firstM":false,
    "secondP":false,
    "secondM":false,
    "thirdP":false,
    "thirdM":false
  });
  const [verify,setVerify] = useState([]);
  const [apply,setApply] = useState(false);
  const getGainVolume = (graph,flow) =>{
    
    return graph.find((element) => {
      if(element.y.toFixed(3) === flow)  {
        console.log(flow+",,,,"+element.y.toFixed(3))
        return true;
      }}).x.toFixed(3);
  }
  const verification = ()=>{
    let rDataList = [];
    rawDataList.map((num)=>rDataList.push(String(num).padStart(9, "0"))) 
    if(serialNum !== undefined){
      axios.post(`/devices/${serialNum}/verify`, 
      {
        data:rDataList.join(' '),
      },{
        headers: {
          Authorization: `Bearer ${accessToken}`
      }},
      {withCredentials : true})
      .then((res)=>{
        console.log(res.data.response);
        // setCalivration(res.data.response);
        // setVolumeFlowList(res.data.response.volumeFlow);
        // let passList = new Object();
        console.log(volumeFlowList);
        let veri = [];
        res.data.response.verify.map((value,index)=>{
          
          if(value.strength === 'LOW'){
            
            if(Math.sign(value.flow) === -1){
              console.log('low')
              pass["firstM"] = value.pass;
              console.log(getGainVolume(res.data.response.graph.volumeFlow,value.flow))
              veri = {
                volume : getGainVolume(res.data.response.graph.volumeFlow,value.flow), 
                flow : value.flow, 
                error:value.error
              }
              verify.push(veri);
            }else{
              console.log('low')
              pass["firstP"] = value.pass;
              veri = {
                volume : getGainVolume(res.data.response.graph.volumeFlow,value.flow), 
                flow : value.flow, 
                error:value.error,
                pass:value.pass
              }
              verify.push(veri);
  
            }
          }
          else if(value.strength === 'MID'){
            console.log('mid')
            if(Math.sign(value.flow) === -1){
              pass["secondM"] = value.pass;
              veri = {
                volume : getGainVolume(res.data.response.graph.volumeFlow,value.flow), 
                flow : value.flow, 
                error:value.error,
                pass:value.pass
              }
              verify.push(veri);
  
            }else{
              pass["secondP"] = value.pass;
              veri = {
                volume : getGainVolume(res.data.response.graph.volumeFlow,value.flow), 
                flow : value.flow, 
                error:value.error,
                pass:value.pass
              }
              verify.push(veri);
  
  
            }
          }else if(value.strength === 'HIGH'){
            console.log('high')
            if(Math.sign(value.flow) === -1){
              pass["thirdM"] = value.pass;
              veri = {
                volume : getGainVolume(res.data.response.graph.volumeFlow,value.flow), 
                flow : value.flow, 
                error:value.error,
                pass:value.pass
              }
              console.log(veri)
              verify.push(veri);
  
  
            }else{
              pass["thirdP"] = value.pass;
              veri = {
                volume : getGainVolume(res.data.response.graph.volumeFlow,value.flow), 
                flow : value.flow, 
                error:value.error,
                pass:value.pass
              }
              verify.push(veri);
  
            }
          }
        })
  
        setPass(pass);
        setApply(true);
        console.log(pass);
        setVerify(verify);
        
      })
      .catch((err)=>{
        console.log(err);
      })
    }
    
  }
  //-------------------------------------------
  const deleteee = () => {
    axios.delete(`/calibrations/{calibrationId}` , {
      headers: {
        Authorization: `Bearer ${accessToken}`
      }
    }).then((res)=>{
      console.log(res);
    }).catch((err)=>{
      console.log(err);
    })
  }
  
  //----------------------------------------------
  useEffect(()=>{
    
    if(!apply){
      console.log(verify)
      verify.map((value)=>{console.log(value)})
    }
  },[verify])
  //capture
  const onCapture = () =>{
    
    console.log("onCapture");
    html2canvas(document.body).then((canvas)=>{
      let now = new Date();
      const month = now.getMonth()+1 < 10 ? "0"+(now.getMonth()+1) : now.getMonth()+1;
      const date = now.getDate() < 10 ? "0"+now.getDate() : now.getDate();
      const YMD = now.getFullYear()+""+month+""+date;
      const hour = now.getHours() < 10 ? "0"+now.getHours() : now.getHours();
      const minutes= now.getMinutes() < 10 ? "0"+now.getMinutes() : now.getMinutes();
      const seconds = now.getSeconds() < 10 ? "0"+now.getSeconds() : now.getSeconds();
      const time = hour+""+minutes+""+seconds;
      console.log(month)
      console.log(date+"_"+time)
      onSaveAs(canvas.toDataURL('image/jpeg'),`car_verify_${YMD}_${time}.jpeg`);
        
    });
    
  };
  const onSaveAs = (uri,filename)=>{
    console.log("onSaveAs");
    var link = document.createElement('a');
    document.body.appendChild(link);
    link.href = uri;
    link.download = filename;
    link.click();
    document.body.removeChild(link);

  };
  const rootRef = useRef(null);
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
    <>
    <div ref={rootRef} className="verify-measurement-page-container">
      {disconnectStat&&confirm ? <Confirm content={"연결된 Spirokit기기가 없습니다.\n설정 페이지로 이동해서 Spirokit을 연결해주세요."} btn={true} onOff={setDisconnectStat} select={disconnectConfirmFunc}/> : null}
      {readyAlert ? <Confirm content="준비 중입니다..." btn={false} onOff={setReadyAlert} select={confirmFunc}/> : null}
      <div className="verify-measurement-page-nav">
        <div className='verify-measurement-page-backBtn' onClick={()=>{navigatorR(-1)}}>
            <FontAwesomeIcon icon={faChevronLeft} style={{color: "#4b75d6",}} />
        </div>
        <p>보정 검증</p>
      <div className='screenShot-btn' onClick={onCapture}><RxImage />Screenshot</div>
      </div>
      <div className='verify-measurement-m-page-container'>
        <div className="verify-measurement-page-left-container" ref={graphConRef}>
          <div className={'verify-measure-graph ' + grayBg}>
            {temp?<div className="title-y"><p>Flow(l/s)</p></div>:<></>}
            {temp?<div><Scatter ref={chartRef} style={graphStyle} data={graphData} options={graphOption}/></div>:null}
            {temp?<div className="title-x"><p>Volume(L)</p></div>:<></>}
          </div>
          <div className='verify-measure-operation'>
            <div ref={firstBtnRef} onClick={()=>{
                
                if(!(firstBtnRef.current.classList.contains("disabled"))){
                  resetChart()
                  setBlowF(true);
                  setMeaStart(true); 
                  secondBtnRef.current.classList.remove("disabled");
                  firstBtnRef.current.classList += " disabled";
                  thirdBtnRef.current.classList.remove("disabled");
                }
                }}>
                  <RiLungsLine className='lungIcon'/>시작
            </div>
            <div ref={secondBtnRef} onClick={()=>{
              if(!secondBtnRef.current.classList.contains("disabled")){
                resetChart()
                
              }
              }}><RiLungsLine className='lungIcon'/>재측정</div>
            <div ref={thirdBtnRef} onClick={()=>{
              if(!thirdBtnRef.current.classList.contains("disabled")){
                verification()
                setMeaStart(false); 
                firstBtnRef.current.classList.remove("disabled");
                thirdBtnRef.current.classList += " disabled";
                secondBtnRef.current.classList += " disabled";
              }
            }}><FaMagnifyingGlassChart className='magnifyIcon'/>분석</div>
          </div>

        </div>

        

        <div className="verify-measurement-page-right-container">
          
          <div className='verify-measurement-flow-container'>
            <div>
              <p className='verify-measurement-title'>Flow</p>
            </div>

            <div className='verify-measurement-flow-table-container'>
              <div className='verify-measurement-flow-table-column'>
                <p></p>
                <p>Low(±0 ~ 0.6)</p>
                <p>Mid(±0.6 ~ 1.4)</p>
                <p>High(±4 ~ 8)</p>
              </div>
              <div className='verify-measurement-flow-table-Inhale'>
                <p>Insp</p>
                <p>{!apply||!pass.firstP ? '-':pass.firstP==='true'? 'SUCCESS':'NORMAL'}</p>
                <p>{!apply||!pass.secondP ? '-':pass.secondP==='true'? 'SUCCESS':'NORMAL'}</p>
                <p>{!apply||!pass.thirdP? '-':pass.thirdP==='true'? 'SUCCESS':'NORMAL'}</p>
              </div>
              <div className='verify-measurement-flow-table-Exhale'>
                <p>Exp</p>
                <p>{!apply||!pass.firstM ? '-':pass.firstM==='true'? 'SUCCESS':'NORMAL'}</p>
                <p>{!apply||!pass.secondM ? '-':pass.secondM==='true'? 'SUCCESS':'NORMAL'}</p>
                <p>{!apply||!pass.thirdM ? '-':pass.thirdM==='true'? 'SUCCESS':'NORMAL'}</p>
              </div>

            </div>
                    
          </div>
          <div className='verify-measurement-calivration-container'>

            <div className='verify-measurement-calivration-table-container'>
              <div className='verify-measurement-calivration-table-column'>
                <p>Volume(L)</p>
                <p>Flow(L/s)</p>
                <p>Error(%)</p>
              </div>
              <div className='verify-measurement-calivration-table-value'>
              
                {!apply ? "":
                  verify.map((value)=>{
                    return(
                      <div>
                        <p>{value.volume}</p>
                        <p>{value.flow}</p>
                        <p>{value.error}</p>
                      </div>
                    )
                  })
                  
                }
                <div className='patient-loading' ref={ref}></div>

                </div>

            </div>
                    
          </div>

        
        </div>
      </div>

      
      
      
    </div>
    </>
  );
}

export default VerificationPage;