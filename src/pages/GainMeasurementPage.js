import { useState, useRef, useEffect} from 'react';
import axios from 'axios';
import { useNavigate,useLocation } from 'react-router-dom'
import Confirm from "../components/Confirm.js"
import { debounce } from 'lodash'

import { RiLungsLine } from "react-icons/ri";
import { FaRegCheckCircle, FaChevronLeft } from "react-icons/fa";
import { TbTrash } from "react-icons/tb";


import {registerables,Chart as ChartJS,RadialLinearScale,LineElement,Tooltip,Legend,} from 'chart.js';
import { Scatter } from 'react-chartjs-2';
import annotationPlugin from 'chartjs-plugin-annotation';
import { useSelector } from "react-redux"

var maxY = 2;
var minY = -1;
var maxX = 6;

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


  // 기기 없음 메세지
  const [noneDevice, setNoneDevice] = useState(false);
  // 시작확인 메세지
  // 검사 시작 전 구독상태
  const [notifyStart, setNotifyStart] = useState(false);
  // 구독 완료
  const [notifyDone, setNotifyDone] = useState(false);
  // 검사버튼 먼저 누르고 온 경우 notify 확인 후 구독 완료
  const [alNotifyDone, setAlNotifyDone] = useState(false);

  // 검사 활성화위한 호기 감지
  const [blow, setBlow] = useState(false);
  // 호기 감지 후 검사 활성화
  const [blowF, setBlowF] = useState(false);

  // 검사 시작 상태
  const [meaStart, setMeaStart] = useState(false);
  // 데이터 리스트
  const [dataList, setDataList] = useState([]);
  // 검사시작 flag, 이 이후로 realData
  const [flag, setFlag] = useState(-1)

  // volume-flow 그래프 좌표
  const [volumeFlowList, setVolumeFlowList] = useState([]);

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
      setDisconnectConfirm(true); // 팝업창 한번만 나오도록

    }
  })
  
//----------------------------------------------------------------------------------------------- 222222
  
  // 연결 확인 & 구독 시작
  useEffect(()=>{

    if(notifyStart){
      console.log("연결확인 및 구독")
      testIt()
    }
  },[notifyStart])

//----------------------------------------------------------------------------------------------- 

  // 준비완료 알림창
  const [readyAlert, setReadyAlert] = useState(false);
  useEffect(()=>{
    if(notifyDone){

      setReadyAlert(true);
      setBlow(true);
      // let time = setTimeout(() => {
      //   setMeaPreStart(true);
      // }, 1000);
    }
  },[notifyDone])
  useEffect(()=>{
    if(!blowF){ //구독 완료시
      firstBtnRef.current.classList += " disabled";
      secondBtnRef.current.classList += " disabled";
      thirdBtnRef.current.classList += " disabled";
      fourTBtnRef.current.classList += " disabled";
    }
  },[blowF])

//----------------------------------------------------------------------------------------------- 44444
  // 구독 완료 후 처리

  useEffect(()=>{
    if(alNotifyDone){
      if(dataList.length == 0){
        setBlow(true);
      }
    }
  },[alNotifyDone])

  useEffect(()=>{ 
    if(!blowF){
      if(dataList[0] == 0 && dataList.length == 1){
        setNotifyDone(true);
        setBlow(true);
      }
      if(dataList.length > 1  && String(dataList[dataList.length-1]).padStart(9,'0').slice(0) !== "0"){
        //css 변화로 검사 활성화
        if(firstBtnRef.current.classList.contains("disabled")){
          firstBtnRef.current.classList.remove("disabled");
        }
      }
    }
  },[dataList])

//-----------------------------------------------------------------------------------------------
  // 시작 확인 시 flag 세우기 -> 처리할 데이터 슬라이싱
  useEffect(()=>{
    maxY = 2;
    minY = -1;
    maxX = 6;
    if(meaStart){
      setDataList([0,0]);
      setCalDataList([]);
      setCalFlag(1);

      let time = setTimeout(() => {
        setFlag({idx: 0, rIdx: 1}); // idx : dataList에서의 인덱스, rIdx : realData에서의 인덱스
      }, 1000);
      return ()=>{
        clearTimeout(time)
      }
    }
  },[meaStart])
  
//-----------------------------------------------------------------------------------------------

  const [calDataList, setCalDataList] = useState([]); // raw data 처리 -> time/volume/lps/exhale
  const [calFlag, setCalFlag] = useState(0); // calDataList에서 그래프 좌표로 처리할 index=>현재 처리된 index

  // 그래프 좌표 생성 시작
  useEffect(()=>{
    if(meaStart && calDataList[calFlag]){
      let item = calDataList[calFlag];
      setVFGraphData(item.volume, item.lps);
    }
  },[calDataList])



//-----------------------------------------------------------------------------------------------
  // raw 데이터 입력 시 처리 process

  // calibratedLps -> api에서 추출
  const [calibratedLps, setCalibratedLps] = useState(-10);
  const [cTime, setCTime] = useState();
  const [cVolume, setCVolume] = useState(-999);
  const [cExhale, setCExhale] = useState();
  useEffect(()=>{
    if(!meaStart)return;
    let previous = dataList[dataList.length-2];
    let current = dataList[dataList.length-1];
    let time = dataCalculateStrategyE.getTime(current);
    let lps = dataCalculateStrategyE.getCalibratedLPS(calibratedLps, previous, current, inhaleCoefficient, exhaleCoefficient);
    let exhale = dataCalculateStrategyE.isExhale(current);
    

    if(cExhale !== exhale && volumeFlowList.length !== 0){
      setVolumeFlowList([...volumeFlowList,{x:volumeFlowList[volumeFlowList.length-1].x, y:0}]) // 호<=>흡 전환시 0 추가
    }
    
    setCExhale(exhale);
    setCTime(time);
    setCalibratedLps(lps)
  },[dataList])

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
      setCalDataList([...calDataList,metrics]);
      if(calFlag == -1 && meaStart){setCalFlag(0)};
    }
  },[cVolume])



  

//------------------------------------------------------------------------------------------------
//재검사
const resetChart = () => {
  setDataList([0,0]);
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
  setVolumeFlowList([{x:0, y:0}]);
  setCalDataList([calDataList[0]]);
  setCalFlag(1);
}

//-----------------------------------------------------------------------------------------------

  // volume-flow 그래프 좌표 함수
  let setVFGraphData = ( rawV, rawF )=>{
    try{
      let x, y;
      let preXY; //이전값
      //초기값 세팅
      if(volumeFlowList.length == 0){
        preXY = {x:0, y:0}
        volumeFlowList.push({x:0, y:0});
      }
      else{
        preXY = volumeFlowList[volumeFlowList.length-1]
      }
  
      // 흡기 시
      if (rawF < 0){        
        //x값 처리
        // x값 최저
        if (preXY['x'] == 0 || preXY['x'] < 0){
          setVolumeFlowList(volumeFlowList.map((item)=>{
            item['x'] += rawV;
          }))
          x = 0;
        }
        else{
          let vTemp = preXY['x']-rawV;
          if(vTemp<0){
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
        x = preXY['x'] + rawV;
      }
      
      volumeFlowList.push({x: x, y:rawF});
      setVolumeFlowList(volumeFlowList);
      setCalFlag(calFlag+1);
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
  useEffect(()=>{
    function handleCharacteristicValueChanged(event) {
      // 데이터 처리 및 UART 프로토콜 해석
      arrayToString(event.target.value)
    }
    if(txCharRef&&txCharRef.current){
      // Notify(구독) 이벤트 핸들러 등록
      txCharRef.current.addEventListener('characteristicvaluechanged', handleCharacteristicValueChanged);
      return function cleanup() {
        txCharRef.current.removeEventListener("characteristicvaluechanged", handleCharacteristicValueChanged);
    };
  }
  },[txCharRef.current])
  function onDisconnected(event) {
    // Object event.target is Bluetooth Device getting disconnected.
    console.log('> Bluetooth Device disconnected');
  }
  
  //데이터 문자로 바꾸기
  let arrayToString = async(temp)=>{
    let data = dataCalculateStrategyE.convert(String.fromCharCode.apply(null, Array.from(new Uint8Array(temp.buffer))).trim())
    if(data !== undefined && data!==null){
      setData(
          data
      );
    }
  }
  const [data, setData] = useState(null);
  useEffect(()=>{
    if(data!== null){
      setDataList([...dataList, data]);
    }
  },[data])


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
  const [disconnectConfirm, setDisconnectConfirm] = useState(false); // 1번만 나오도록 설정

  const [confirm,setConfirm] = useState(true);
  let disconnectConfirmFunc = (val)=>{
    
    if(val=="confirm"){
      navigatorR("/setting");
    }else{
      setConfirm(false);
    }
  }
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
            borderColor: `rgba(1, 138, 190, 1)`,
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
        setTemp(true);
        if(chartRef.current){
          chartRef.current.resize();
        };
      }
      else{
        setTemp(false)
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
  // 보정오류
  const [gainError,setGainError] = useState(false);
  const calivrationApply = ()=>{
    let rDataList = [];
    dataList.slice(0,calFlag).map((num)=>rDataList.push(String(num).padStart(9, "0")))
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
        if(err.response.data.subCode === 4007){
          setGainError(true)
        }
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
      {confirmStat ? <Confirm content="보정을 시작하시겠습니까?" btn={true} onOff={setConfirmStat} select={confirmFunc}/> : null}
      {gainError ? <Confirm content={"보정 적용에 실패했습니다. 가이드 구간을 통과하지 못하였거나, 정도관리(3L)에 맞추셔야 합니다(2L 이상 허용).\nInvalid calibration"} btn={"one"} onOff={setGainError} select={()=>{}}/> : null}
      {readyAlert ? <Confirm content="준비 중입니다..." btn={false} onOff={setReadyAlert} select={confirmFunc}/> : null}
      <div className="gain-measurement-page-nav">
        <div className='gain-measurement-page-backBtn' onClick={()=>{navigatorR(-1)}}>
            <FaChevronLeft style={{color: "#4b75d6",}}/>
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
                setConfirmStat(true);
                resetChart();

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
              firstBtnRef.current.classList.remove("disabled");
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