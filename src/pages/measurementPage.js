import { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import { useCookies } from 'react-cookie';
import Confirm from "../components/Confirm.js"
import { useNavigate } from 'react-router-dom'
import { RiLungsLine } from "react-icons/ri";

import { FaBluetoothB, FaSquareXmark } from "react-icons/fa6";
import { FaChevronLeft } from "react-icons/fa";

import { debounce } from 'lodash'
import {registerables,Chart as ChartJS,RadialLinearScale,LineElement,Tooltip,Legend,} from 'chart.js';
import { Scatter } from 'react-chartjs-2';
import { useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from "react-redux"
import Timer from "../components/Timer.js"
import VolumeBar from "../components/VolumeBar.js"
import Alert from "../components/Alerts.js"
import styled from "styled-components";

var maxY = 2;
var minY = -1;
var maxX = 6;
var volumFlowMin = -1;
var volumFlowMaxX = 6;
//FVC 검사 페이지
const MeasurementPage = () =>{
  const location = useLocation();
  let deviceInfo = useSelector((state) => state.deviceInfo ) 

  let date = location.state.date;
  let type = location.state.type;
  let chartNumber = location.state.chartNumber;
  let birth = location.state.birth;

  // const cookies = new Cookies();?
  const [accessToken,setAccessToken] = useState(window.api.get("get-cookies",'accessToken'));

  let navigatorR = useNavigate();
  let firstBtnRef = useRef();
  let secondBtnRef = useRef();
  let thirdBtnRef = useRef();

  const [tvMax, setTvMax] = useState([10]);
  let colorList = ['rgb(5,128,190)','rgb(158,178,243)','rgb(83, 225, 232)','rgb(67,185,162)','rgb(106,219,182)','rgb(255,189,145)','rgb(255,130,130)','rgb(236,144,236)','rgb(175,175,175)','rgb(97,97,97)'];

  const [graphOnOff, setGraphOnOff] = useState([]);
  const [allTimeVolumeList, setAllTimeVolumeList] = useState([]);
  const [allVolumeFlowList, setAllVolumeFlowList] = useState([]);

  const [totalData,setTotalData] = useState(" ");
  //결과 그래프 목록 요청 FVC
  const[volumeFlow,setVolumeFlow] = useState([]);
  const[timeVolume,setTimeVolume] = useState([]);
  const [trigger, setTrigger] = useState(-1);
  //횟수 제한
  const [limit,setLimit] = useState(false);

  // 첫 페이지 렌더링 시
  useEffect(()=>{
    console.log(location.state)
    console.log(location.state.data)
    setTotalData(location.state.data);
  },[])
  useEffect(()=>{
    getMeasureData(date)
  },[])
  const simpleResult = async(id,date)=>{

    await axios.delete(`/measurements/${id}` , {
      headers: {
        Authorization: `Bearer ${accessToken}`
      }
    }).then((res)=>{
      console.log(res);

    }).catch((err)=>{
      console.log(err);
    })
    getMeasureData(date);
    setTemp(false);
  }
  const getMeasureData = async(date)=>{
    await axios.get(`/subjects/${chartNumber}/types/fvc/results/${date}` , {
      headers: {
        Authorization: `Bearer ${accessToken}`
      }
    }).then((res)=>{
      console.log(res);
      if(res.data.subCode === 2004){
        setTotalData(res.data.message);
      }
      else {
        if(res.data.response.trials.length === 8){
          setLimit(true);
        }
        setTotalData(res.data.response);
      }
    }).catch((err)=>{
      console.log(err);
    })
    setGraphOnOff([...graphOnOff].fill(0))
  }
  //fvc 그래프 처리
  const simpleResultsRef = useRef([]);
  useEffect(()=>{
    if(totalData){
      //fvc의 심플카드
      let timeVolumeList = [];
      let volumeFlowList = [];
      let timeVolumeMaxList = [];
      let timeVolumeMaxListX = [];
  
      if(totalData.trials){
        console.log(totalData.trials.length);
        let temp = new Array(totalData.trials.length).fill(0);
        setGraphOnOff(temp);
  
        // 매 결과에서 데이터 추출
        totalData.trials.forEach((item)=>{
          timeVolumeList.push(item.graph.timeVolume);
          volumeFlowList.push(item.graph.volumeFlow);
  
          //현 timeVolume에서 최대값 찾기
          timeVolumeMaxList.push(item.results[3].meas);
          timeVolumeMaxListX.push(item.graph.timeVolume[item.graph.timeVolume.length-1].x); //최대 x값 찾기
        })
        timeVolumeMaxListX.sort((a,b)=>a-b);
        timeVolumeMaxList.forEach((item, idx)=>{
          timeVolumeList[idx].push({x : Math.max(Math.ceil(timeVolumeMaxListX[timeVolumeMaxListX.length-1]), 3), y: timeVolumeList[idx][timeVolumeList[idx].length-1].y})
        })
        setVolumeFlow([]);
        setTimeVolume([]);
        setAllTimeVolumeList(timeVolumeList);
        setAllVolumeFlowList(volumeFlowList);
        setTvMax(timeVolumeMaxList);
        graphOption.scales.x.max = parseInt(Math.max(...timeVolumeMaxList));
        setTrigger(0);
      }
      
    }
  },[totalData])
  //차트 비율
  const chartRatio=(trials,ver)=>{
    if(trials){
      // fvc volumFlowList min
      const maxYArray = [];
      const minYArray = [];
      const maxXArray = [];
      var volumFlowListY;
      var volumFlowListMaxX;
      trials.map((item,idx)=>{
        //y축
        if(ver == 1){
          volumFlowListY = item.graph.volumeFlow.map((item)=>{
            return item.y;
          });
          //x축
          volumFlowListMaxX = item.graph.volumeFlow.map((item)=>{
            return item.x;
          });
        }else{
          volumFlowListY = item.map((item)=>{
            return item.y;
          });
          //x축
          volumFlowListMaxX = item.map((item)=>{
            return item.x;
          });
        }
        
        //각각의 y축 최소값
        var min = Math.floor((Math.min(...volumFlowListY)))
        var max = Math.floor((Math.max(...volumFlowListY)))
        if(min < -4){
          // min -= 2;
        }
        maxYArray.push(max);
        minYArray.push(min);
        //각각의 x축 최대값
        maxXArray.push(Math.ceil(Math.max(...volumFlowListMaxX)));
      })
      //y축 최소값
      minY = Math.min.apply(null,minYArray);
      
      //y축 최대값
      
      maxY = Math.abs(minY) * 2;
      //x축 최대값
      maxX = maxY+Math.abs(minY);
      
      //계산한 x축 보다 실제 x축이 더 클 경우
      if(maxX < Math.max.apply(null,maxXArray)){
        maxX = Math.max.apply(null,maxXArray);
        if(maxX % 2 != 0){
          maxX -= 1;
        }
        minY = -maxX/3;
        // minY = -maxX/3*2;
        //소수점이 0.7이라면
        if(Math.floor(parseFloat(minY-parseInt(minY))*10)/10 === -0.7 || Math.floor(parseFloat(minY-parseInt(minY))*10)/10 === -0.4){
          minY -= 0.1;
        }
        maxY = Math.abs(minY*2);
        
      }
      if(minY % 2 !=0 && minY <= -2){
        minY -= 1;
      }
      if(maxY < Math.max.apply(null,maxYArray)){
        console.log("maxY : "+maxY+", real Y : " +Math.max.apply(null,maxYArray))
        maxY = Math.max.apply(null,maxYArray)+3;
      }
    }
  }
  //그래프 선택
  const selectGraph=(index)=>{
    if(meaStart){return;}
    console.log("HE!!!!");
    let temp;
    //처음 눌렀을때
    if(trigger == 0){
      temp = [...graphOnOff].fill(0); //0으로 바꾸기 (선택효과 끄기)
    }
    else{ //처음 아닐때
      temp = [...graphOnOff];
    }

    if (temp[index] == 1){
      temp[index] = 0;
      setTrigger(trigger-1);
    }
    else if(temp[index] == 0){
      temp[index] = 1;
      setTrigger(trigger+1);
    }
    setGraphOnOff(temp);
    setTemp(false)
  }
  useEffect(()=>{
    /**
     * allTimeVolumeList -> 전체 리스트
     * timeVolume -> 보여줄 리스트
     */
    
    // 누른거 없을떄 onoff[1,1,1, ...]
    console.log("Trigger : "+trigger);
    if(trigger == 0){
      console.log("ALLLLL : ",allTimeVolumeList);
      let temp = [...graphOnOff].fill(0);
      setGraphOnOff(temp);
      setTimeVolume([]);
      setVolumeFlow([]);
      maxY = 2;
      minY = -1;
      maxX = 6;
      return;
    }
    // 누른거 있을때
    let temp = [...allTimeVolumeList];
    let temp2 = [...allVolumeFlowList];
    graphOnOff.forEach((item, index)=>{
      if(item == 0){
        temp[index] = [{x: 0, y: 0}];
        temp2[index] = [{x: 0, y: 0}];
      }
      else if(item == 1){
        temp[index] = allTimeVolumeList[index];
        temp2[index] = allVolumeFlowList[index];
      }
    })
    setTimeVolume(temp);
    setVolumeFlow(temp2);
    console.log(temp);
    chartRatio(temp2,0)
  },[trigger])


  // 검사 시작 상태
  useEffect(()=>{
    if(totalData !== " " && totalData !== "Empty resource"){
      if(meaStart){
        setTrigger(0);
        simpleResultsRef.current.forEach((item,index)=>{
          if(simpleResultsRef.current[index]){
            simpleResultsRef.current[index].disabled = true;
            simpleResultsRef.current[index].classList += " disabled";
          }
        })
      }
      else{
        simpleResultsRef.current.forEach((item,index)=>{
          if(simpleResultsRef.current[index]){
            simpleResultsRef.current[index].disabled = false;
            if(simpleResultsRef.current[index].classList.contains("disabled")){
              simpleResultsRef.current[index].classList.remove("disabled");
            }
          }
        })
      }
    }
  })
  useEffect(()=>{
    if(totalData){
      graphOnOff.forEach((item, index)=>{
        if(simpleResultsRef.current[index]){
          if(item == 1){
            simpleResultsRef.current[index].classList+=" selected";
            simpleResultsRef.current[index].style+="";
          }
          else{
            if(simpleResultsRef.current[index].classList.contains("selected")){
              simpleResultsRef.current[index].classList.remove("selected");
            }
          }
        }
      })
    }
  },[graphOnOff])
// volumeFlow 그리기
useEffect(()=>
{
  let time = setTimeout(()=>{   
    let time2 = setTimeout(() => {
      let dataset = []
      volumeFlow.forEach((item,index)=>{
        
        dataset.push(
          {
            label: "",
            data: item,
            borderColor: `${colorList[index%10]}`,
            borderWidth: 2.5,
            showLine: true,
            tension: 0.4
          }
        )
      })
      let time3 = setTimeout(() => {
        let data = {
          labels: '',
          datasets: dataset,
        }
        let time4 = setTimeout(() => {
          setGraphData(data);
        }, 50);
        return()=>{
          clearTimeout(time4);
        }
      }, 50);
      return()=>{
        clearTimeout(time3);
      }
    }, 50);
    return()=>{
      clearTimeout(time2);
    }
  },50)

  return()=>{
    clearTimeout(time);
  }
},[volumeFlow])



  // timeVolume 그리기
  useEffect(()=>
  {

    let time = setTimeout(()=>{
      
      let time2 = setTimeout(() => {
        let dataset = []
        timeVolume.forEach((item,index)=>{
          dataset.push(
            {
              label: "",
              data: item,
              borderColor: `${colorList[index%10]}`,
              borderWidth: 2.5,
              showLine: true,
              tension: 0.4
            }
          )
        })
        let time3 = setTimeout(() => {
          let data = {
            labels: "",
            datasets: dataset,
          }
          let time4 = setTimeout(() => {
            setGraphData2(data);
          }, 50);
          return()=>{
            clearTimeout(time4);
          }
        }, 50);
        return()=>{
          clearTimeout(time3);
        }
      }, 50);
      return()=>{
        clearTimeout(time2);
      }
    },50)

    return()=>{
      clearTimeout(time);
    }
  },[timeVolume])


  // 노력성 호기 전 호흡 횟수 등 쿠키에서 받아오기
  const [breathCount,setBreathCount] = useState();
  const [strongTime,setStrongTime] = useState();
  const [stopTime,setStopTime] = useState();
  useEffect(()=>{
    console.log(window.api.get("get-cookies",'manageRate'));
    if(window.api.get("get-cookies",'manageRate') !==undefined){
      setBreathCount(window.api.get("get-cookies",'manageRate'));
    }else{
      setBreathCount("3");
    }
    if(window.api.get("get-cookies",'manageTime') !== undefined){
      setStrongTime(window.api.get("get-cookies",'manageTime'));
      console.log(typeof(window.api.get("get-cookies",'manageTime')))
    }else{
      setStrongTime("6");
    }
  },[]);
  // 검사 종료 여부
  const [measureDone, setMeasureDone] = useState(false);


  // 게이지 UI 전처리
  let setGaugeUI = (strongTime, stopTime)=>{
    console.log(strongTime);
    switch (parseInt(strongTime)) {
      case 3:
        itemRef.current[30].classList += " endColor";
        setTimerTick(100);
        break;
      
      case 10:
        itemRef.current[30].classList += " endColor";
        setTimerTick(333)
        break;
      
      case 15:
        itemRef.current[36].classList += " endColor";
        setTimerTick(417)
        break;
      
      case 20:
        itemRef.current[40].classList += " endColor";
        setTimerTick(500)
        break;
      
      case 30:
        itemRef.current[30].classList += " endColor";
        setTimerTick(1000)
        break;
      
      default: //default 6
        itemRef.current[24].classList += " endColor";
        setTimerTick(250)
        break;
    }
  }

  useEffect(()=>{
    if(strongTime){
      setGaugeUI(strongTime, stopTime);
    }
    // let strongT = strongTime;
    // let stopT = stopTime;
    // if(strongTime == undefined){
    //   strongT = 3;
    // }
    // if(stopT == undefined){
    //   stopT = 15;
    // }
    // setGaugeUI(strongT, stopT);
  },[strongTime,stopTime])
  
   // 세션 가이드 컨텐츠
  const [gaugeContent, setGaugeContent] = useState(null)

   //흡기 선?
  const [inF, setInF] = useState(-1);
   //세션 세팅 완료
  const [inFDone, setInFDone] = useState(false);

   // 첫 가이드 컨텐츠 세팅 후 전체 세션 진행 수 설정 (흡기 선 breath*2, 호기 breathC *2 -1)
  const [sessionVol, setSessionVol] = useState(0);

   // 호/흡 세션 완료 후 timer로 전환 여부
  const [timerReady, setTimerReady] = useState(false);
  
   //첫 가이드 컨텐츠 세팅
  useEffect(()=>{
    if(inF !== -1){
      if(inF && timerReady===false){//흡기 선
        setGaugeContent({r11:"1", r12:breathCount, r2:"IN"})
        setSessionVol(breathCount*2);
      }
      else if(!inF && timerReady===false){//호기 선
        setGaugeContent({r11:"1", r12:breathCount, r2:"OUT"})
        setSessionVol(breathCount*2-1);
      }
      setSessionCount(1);
    }
  },[inF, timerReady])
  
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
    if(inF){ // 흡기 선
      if(sessionCount !== 0 && sessionCount%2 == 1){ //홀수면 카운트업
        let tgC = parseInt(gaugeContent.r11) + 1
        setGaugeContent({r11:tgC, r12: breathCount, r2: inOutFlip(gaugeContent.r2)});
      }
      else{
        setGaugeContent({...gaugeContent, r2: inOutFlip(gaugeContent.r2)});
      }
    }
    else{ //호기 선
      if(sessionCount !== 0 && sessionCount%2 == 0){ //짝수면 카운트업
        let tgC = parseInt(gaugeContent.r11) + 1
        setGaugeContent({r11:tgC, r12: breathCount, r2: inOutFlip(gaugeContent.r2)});
      }
      else{
        setGaugeContent({...gaugeContent, r2: inOutFlip(gaugeContent.r2)});
      }
    }
  }
  useEffect(()=>{
    if(sessionCount !== 1 && sessionCount !== 0){
      sessionFlip();
    }
  },[sessionCount])
  
  const [timerTick, setTimerTick] = useState(250); //default 250 (6/15)
  const [timerRunStat, setTimerRunStat] = useState(false);
  const intervalRef = useRef();

  useEffect(()=>{
    if(timerRunStat){
      let i =1;
      intervalRef.current = setInterval(() => {
        if(i>60)return;
        itemRef.current[i++].classList += " tickColor";
      }, timerTick);
    }
    else{
      clearInterval(intervalRef.current);
    }
  },[timerRunStat])
  let removeTick = ()=>{
    for (let i = 1; i < 61; i++) {
      if(itemRef.current[i].classList.contains("tickColor")){
        itemRef.current[i].classList.remove("tickColor");
        itemRef.current[i].style.background = '';
      }
      else{
      }
    }
  }


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

  // 호기 계수
  const [exhaleCoefficient,setExhaleCoefficient] = useState(0.9);
  // 흡기 계수 (API에서 가져올 예정)
  const [inhaleCoefficient,setInhaleCoefficient] = useState(0.9);


  // 기기 없음 메세지
  const [noneDevice, setNoneDevice] = useState(false);
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
  const [timeVolumeList, setTimeVolumeList] = useState([]);

//-----------------------------------------------------------------------------------------------
useEffect(()=>{
  if(window.api.get("get-cookies",'serialNum') !== undefined){
    const serial = window.api.get("get-cookies",'serialNum');
    axios.get(`/devices/${serial}/gain` , {
      headers: {
        Authorization: `Bearer ${accessToken}`
      }
    }).then((res)=>{
      console.log(res.data.response.gain)
      setExhaleCoefficient(res.data.response.gain.exhale);
      setInhaleCoefficient(res.data.response.gain.inhale)
    }).catch((err)=>{
      console.log(err);
    })
  }
},[])
useEffect(()=>{
  console.log(exhaleCoefficient);
  console.log(inhaleCoefficient)
},[exhaleCoefficient,inhaleCoefficient])
  
//----------------------------------------------------------------------------------------------- 111111

  // 기기 연결 여부 검사
  useEffect(()=>{
    if(deviceInfo.gatt){ //리스트에 있으면
      setNoneDevice(false); //기기없음상태 false (기기있음!)
      if(!deviceInfo.gatt.connected){ //연결여부
        //디바이스 연결X
        setNoneDevice(true); // 문구 & 블루투스 아이콘 css 변경
        setDisconnectStat(true); // 연결된 기기 없음 팝업창
        window.api.send("getConnectedDevice", ""); // 새로고침되도록..(?)
      }
      else{
        // 연결 O
        setNotifyStart(true);
      }
    }
    else{ //기기없으면
      if(!disconnectConfirm){
        setNoneDevice(true); // 문구 & 블루투스 아이콘 css 변경
        setDisconnectStat(true); // 연결된 기기 없음 팝업창 상태
        setDisconnectConfirm(true); // 팝업창 한번만 나오도록
      }
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
    }
  },[notifyDone])
  useEffect(()=>{
    if(!blowF){ //구독 완료시
      firstBtnRef.current.classList += " disabled"
      secondBtnRef.current.classList += " disabled";
      // thirdBtnRef.current.classList += " disabled";
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
      // if(dataList[0] == 0){
      // }
      if(dataList[0] == 0 && dataList.length == 1){
        setNotifyDone(true);
        setBlow(true);
      }
      // console.log(dataList[dataList.length-1].slice(0,1))
      // if(dataList[dataList.length-1].slice(0,1) == "0"){
      
      if(dataList.length > 1  && String(dataList[dataList.length-1]).padStart(9,'0').slice(0) !== "0"){
        //css 변화로 검사 활성화
        if(secondBtnRef.current.classList.contains("disabled")){
          secondBtnRef.current.classList.remove("disabled");
        }
      }
      // if(blow==true){ //  입김 불면!
      // }
    }
  },[dataList])
//-----------------------------------------------------------------------------------------------
  // 시작 확인 시 flag 세우기 -> 처리할 데이터 슬라이싱
  useEffect(()=>{
    maxY = 2;
    minY = -1;
    maxX = 6;
    volumFlowMin = 0;
    volumFlowMaxX = 0;
    if(meaStart){
      removeTick();
      setInF(-1);
      setDataList([0,0]);
      setInFDone(false);
      setVolumeFlowList([{x:0, y:0}]);
      setTimeVolumeList([{x:0, y:0}]);
      setCalDataList([]);
      setCalFlagTV(1);
      setCalFlag(1);
      setTimerReady(false);
      setRunTime(0);
      setMeasureDone(false);
      setTickColor(0);
      setTickOn(false);
      let ticks = document.getElementsByClassName('tickColor');
      Array.prototype.map.call(ticks,it=>{
        it.style.background=`#f7f7f7`;
      })
      // setFlagTo({from:1, to:""});
      setTrigger(-1)
      let time = setTimeout(() => {
        if(firstBtnRef.current.classList.contains("disabled"))firstBtnRef.current.classList.remove("disabled"); // 재측정 버튼 활성화
        secondBtnRef.current.classList += " disabled";
        setFlag({idx: 0, rIdx: 1}); // idx : dataList에서의 인덱스, rIdx : realData에서의 인덱스
        // if(flagTo == 0){setFlagTo({...flagTo, from: 1});}
      }, 1000);
      return ()=>{
        clearTimeout(time)
      }
    }
  },[meaStart])
  
//-----------------------------------------------------------------------------------------------

  const [rawDataList, setRawDataList] = useState([0]); // raw data 처리 전 (0만 뗀거)
  // const [flagTo, setFlagTo] = useState(0); // rawDataList에서 잘라서 post
  const [calDataList, setCalDataList] = useState([]); // raw data 처리 -> time/volume/lps/exhale
  const [calFlag, setCalFlag] = useState(-1); // calDataList에서 그래프 좌표로 처리할 index=>현재 처리된 index



  // 그래프 좌표 생성 시작
  useEffect(()=>{
    if(meaStart && calDataList[calFlag]){
      let item = calDataList[calFlag];
      setVFGraphData(item.volume, item.lps);
      setTVGraphData(item.time, item.volume, item.exhale);
      // setCalFlag(calFlag+1);
    }
  },[calDataList])

  // raw데이터 들어오면 -> rawDataList에 넣기
  // useEffect(()=>{
  //   if(flag !== -1){

  //     // let data = [...dataList.slice(parseInt(flag))];

  //     let currItemR = dataList[flag.idx]; //현재 다룰 raw 데이터
  //     // let currItem = dataCalculateStrategyE.convert(currItemR); // 데이터 전처리 후
  //     // let TrawDataList = [...rawDataList];

  //     // TrawDataList.push(currItem);
  //     // setRawDataList(TrawDataList);
  //     setRawDataList([...rawDataList, currItemR]);
  //     setFlag({idx : flag.idx+1, rIdx: flag.rIdx+1})
  //   }
  // },[dataList])


//-----------------------------------------------------------------------------------------------
  // raw 데이터 입력 시 처리 process

  // calibratedLps -> api에서 추출
  const [calibratedLps, setCalibratedLps] = useState(-10);
  const [cTime, setCTime] = useState();
  const [cVolume, setCVolume] = useState(-999);
  const [cExhale, setCExhale] = useState();
  useEffect(()=>{
    if(meaStart && !measureDone){
      let previous = dataList[dataList.length-2];
      let current = dataList[dataList.length-1];
      let time = dataCalculateStrategyE.getTime(current);
      let lps = dataCalculateStrategyE.getCalibratedLPS(calibratedLps, previous, current, inhaleCoefficient, exhaleCoefficient);
      let exhale = dataCalculateStrategyE.isExhale(current);
      
  
      if(cExhale !== exhale){
        if(sessionVol !== 0 ){
          let tempSesCnt = sessionCount + 1
          setSessionCount(tempSesCnt);
          setVolumeFlowList([...volumeFlowList,{x:volumeFlowList[volumeFlowList.length-1].x, y:0}]) // 호<=>흡 전환시 0 추가
        }
      }
      if(cExhale && timerReady && !timerStart && !measureDone){
        setTimerStart(true);
      }
  
      setCExhale(exhale);
      setCTime(time);
      setCalibratedLps(lps)
      if(exhale && meaStart){
        setShadow(lps);
      }
    }
  },[dataList])

  useEffect(()=>{
    if(calibratedLps !== -10){
      let volume = dataCalculateStrategyE.getVolume(calibratedLps, cTime);
      setCVolume(volume);
    }
  },[calibratedLps]);
  useEffect(()=>{
    if(cVolume !== -999 && meaStart){
      let metrics = new FluidMetrics(cTime, calibratedLps, cVolume);
      metrics.setExhale(cExhale);
      setCalDataList([...calDataList, metrics]);
      if(calFlag == -1 && meaStart){setCalFlag(0)};
    }
  },[cVolume])

//-----------------------------------------------------------------------------------------------
  const [readyMeasureDone, setReadyMeasureDone] = useState(false);
  // volume-flow 그래프 좌표 함수
  let setVFGraphData = ( rawV, rawF )=>{
    try{
      if(measureDone)return;
      let x, y;
      let preXY; //이전값
      // preXY 값 할당
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
        if(!inFDone && meaStart && rawV!==0){ //흡기선?
          setInF(true);
          setInFDone(true);
        }

        //x값 처리
        // x값 최저
        if (preXY['x'] == 0 || preXY['x'] < 0){
          // 현재 x값 오른쪽 밀기
          setVolumeFlowList(volumeFlowList.map((item)=>{
            item['x'] += rawV;
          }))
          x = 0;
        }
        else{
          let vTemp = preXY['x']-rawV;
          if(vTemp<0){
              // 현재 x값 오른쪽 밀기
              setVolumeFlowList(volumeFlowList.map((item)=>{
                item['x'] += Math.abs(vTemp);
              }))
              x = 0;
          }
          else{
            x = vTemp;
          }
        }
        if(timerReady && timerStart && !measureDone){
          setTimerStart(false);
          setReadyMeasureDone(true);
          // if(readyMeasureDone){
            // setFlagTo({...flagTo, to: flagTo.from+calFlag});
          // }
        }
        if(readyMeasureDone && volumeFlowList[calFlag] && volumeFlowList[calFlag]["y"] == 0){
          setMeasureDone(true);
          setReadyMeasureDone(false);
        }
      }
      //호기 시
      else{
        if(!inFDone && meaStart && rawV!==0){ //호기선?
          setInF(false);
          setInFDone(true);
        }
        x = preXY['x'] + rawV;
        if(timerReady && timerStart && !measureDone){
          if(rawF == 0 && runTime>300){
            // setFlagTo({...flagTo, to: flagTo.from+calFlag});
            setTimerStart(false);
            setReadyMeasureDone(true);
            // setMeasureDone(true);
            // return;
          }
        }
        if(readyMeasureDone){
          setMeasureDone(true);
          setReadyMeasureDone(false);
        }
      }
      // fvc volumFlowList min

      //y축
      

      if(volumFlowMin > rawF){
        console.log("rawF : "+rawF)
        volumFlowMin = rawF;
        //각각의 y축 최소값
        if(volumFlowMin < -4){
          volumFlowMin -= 2;
          
        }
      }else if(volumFlowMin > Math.floor(-rawF / 2) && rawF > 0){
        volumFlowMin = Math.floor(-rawF / 2);
        //각각의 y축 최소값
        if(volumFlowMin < -4){
          volumFlowMin -= 2;
          
        }
      }
      //x축
      if(volumFlowMaxX < x){
        volumFlowMaxX  = x;
      }


      //y축 최소값
      minY = volumFlowMin;
      
      //y축 최대값
      maxY = Math.abs(minY) * 2;

      //x축 최대값
      maxX = maxY+Math.abs(minY);
      
      //계산한 x축 보다 실제 x축이 더 클 경우
      if(maxX <volumFlowMaxX){
        maxX = volumFlowMaxX;
        if(maxX % 2 != 0){
          maxX -= 1;
        }
        minY = -maxX/3*2;
        //소수점이 0.7이라면
        if(Math.floor(parseFloat(minY-parseInt(minY))*10)/10 === -0.7 || Math.floor(parseFloat(minY-parseInt(minY))*10)/10 === -0.4){
          minY -= 0.1;
        }
        maxY = Math.abs(minY*2);
        
      }
      if(minY % 2 !=0 && minY <= -2){
        minY -= 1;
      }

      volumeFlowList.push({x: x, y:rawF});
      setVolumeFlowList(volumeFlowList);
      setCalFlag(calFlag+1);
    }
    catch(err){
      console.log(err)
    }
    
  }
//-----------------------------------------------------------------------------------------------
  // timeVolume flag(흡기 시 설정)
  const [calFlagTV,setCalFlagTV] = useState(0);
  // timeVolume 그래프 좌표 생성 함수
  let setTVGraphData = (rawT, rawV, exhale)=>{
    if(measureDone)return;
    let x, y;
    let preXY;
    let prefix = 1;

    if (timeVolumeList.length==0){
      x = 0;
      y = 0;
    }
    else{
      if (exhale !== calDataList[calFlag-1].exhale) prefix *= -1;
      if(timeVolumeList[calFlagTV-1]){
        x = rawT+timeVolumeList[calFlagTV-1].x;
        y = timeVolumeList[calFlagTV-1].y + (prefix * rawV)
      }
    }
    if(volumeFlowList[volumeFlowList.length-1]){
      if(volumeFlowList[volumeFlowList.length-1].y < 0){
        setTimeVolumeList([]);
        setCalFlagTV(0);
      }else{
        timeVolumeList.push({x:x, y:y});
  
        setTimeVolumeList(timeVolumeList);
        setCalFlagTV(calFlagTV+1);
      }
    }
  }

//----------------------------------------------------------------------------------------------- 333333
  let txCharRef = useRef();
  // 검사 구독 함수
  async function testIt() {
    let options = {
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
      txCharRef.current = await service.getCharacteristic('6e400003-b5a3-f393-e0a9-e50e24dcca9e');

      // 검사하기 버튼 누르고 쓸 부분
      // Notify(구독) 활성화
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
    }
  }
  function onDisconnected(event) {
    console.log('> Bluetooth Device disconnected');
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
  // rawData 문자열
  // let [result, setResult] = useState();
  //데이터 문자로 바꾸기


  // let rawData;

  let arrayToString = async(temp)=>{
    // let buffer = temp.buffer;
    // rawData = String.fromCharCode.apply(null, Array.from(new Uint8Array(temp.buffer))).trim()
    // dataList.push(dataCalculateStrategyE.convert(String.fromCharCode.apply(null, Array.from(new Uint8Array(temp.buffer))).trim()))
    let data = dataCalculateStrategyE.convert(String.fromCharCode.apply(null, Array.from(new Uint8Array(temp.buffer))).trim())
    if(data !== undefined && data!==null){
      setData(
          data
      );
    }
    // return String.fromCharCode.apply(null, Array.from(new Uint8Array(temp.buffer))).trim()
  }
  const [data, setData] = useState(null);
  useEffect(()=>{
    if(data!== null){
      setDataList([...dataList, data]);
    }
  },[data])

  // //데이터 핸들링
  // let deviceDataHandling = (arr)=>{
  //   let tempArr = [];
  //   arr.forEach((item)=>{
  //       tempArr.push(arrayToString(item))                                                                                                                                                                                                       
  //   })
  //   setResult(tempArr.join(' '));
  // }
  // 데이터 출력
  




//-----------------------------------------------------------------------------------------------
  // 그래프 설정
  ChartJS.register(RadialLinearScale, LineElement, Tooltip, Legend, ...registerables);

  //결과 그래프 목록 요청 FVC

  const [graphData, setGraphData] = useState({
    labels: ['FVC'],
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
  const [graphData2, setGraphData2] = useState({
    labels: ['FVC'],
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
    },
    responsive: true,
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
        min: 0,
        suggestedMax:()=>{
          if(maxX > 6){
            return maxX;
          }
          return 6;
        },
        // max: parseInt(Math.max(...tvMax)),
        ticks:{
          autoSkip: false,
          beginAtZero: false,
          
        },
        grid:{
          color: function(context) {
            if (context.index === 0){
              return '#20a0b3';
            }
            else{
              return '#bbdfe4';
            }
          },
        }
      },
      y: {
        gridLines:{
          zeroLineColor:'rgb(0, 0, 255)',
        },
        axios: 'y',
        max:()=>{
          if(maxY > 2){
            return maxY;
          }
          return 2;
        },
        min:()=>{
          if(minY < -1){
            return minY;
          }
          return -1;
        },
        grace:"5%",
        
        ticks: {
          precision:10,
          major: true,
          beginAtZero: true,
          stepSize:(context)=>{
            if(context.scale.min === -1){
              return 0.5;
            }
            return 1;
          },
          fontSize : 10,
          textStrokeColor: 10,
          precision: 1,
        },
        grid:{
          color: function(context) {
            if (context.index === 0){
              return '#20a0b3';
            }
            else if (context.tick.value > 0) {
              return '#bbdfe4';
            } else if (context.tick.value < 0) {
              return '#bbdfe4';
            }
            return '#20a0b3';
          },
        }
      },
    },
  }

  const graphOption2={
    plugins:{
      legend: {
        display: false
      },
      resizeDelay:0,
      datalabels: false,
    },
    responsive: true,
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
        min: 0,
        suggestedMax: 3,
        // suggestedMax: 6.0,
        ticks:{
          stepSize : .5,
          beginAtZero: false,
          max: 12.0,
          autoSkip: false,
        },
        grid:{
          color: function(context) {
            if (context.index === 0){
              return '#20a0b3';
            }
            else{
              return '#bbdfe4';
            }
          },
        }
      },
      y: {
        gridLines:{
          zeroLineColor:'rgba(0, 0, 255, 1)',
        },
        axios: 'y',
        // max: 3,
        min: 0,
        suggestedMax:3.3,
        // suggestedMin:-6,
        ticks: {
          major: true,
          beginAtZero: true,
          stepSize : .5,
          fontSize : 10,
          textStrokeColor: 10,
          precision: 1,
        },
        grid:{
          color: function(context) {
            if (context.index === 0){
              return '#20a0b3';
            }
            else{
              return '#bbdfe4';
            }
          },
        }
      },
    },
  }


  
//-----------------------------------------------------------------------------------------------

  // 창 크기 조절에 따른 그래프 크기 조절
  const [first, setFirst] = useState({x:window.innerWidth, y: window.innerHeight})
  const [second, setSecond] = useState({x:window.innerWidth, y: window.innerHeight})
  const [temp, setTemp] = useState(false);

  const handleResize = debounce(()=>{
    setTemp(false);
    setSecond({
      x: window.innerWidth,
      y: window.innerHeight,
    })
  })

  useEffect(()=>{
    let time = setTimeout(() => {
      setTemp(true);
    },500);
    return ()=>{
      clearTimeout(time)
    }
  },[graphData])

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


//-----------------------------------------------------------------------------------------------
  // 그래프 그리기

  const graphStyle = {width:"0px" ,height:"0px", transition:"none"}

  const chartRef = useRef();
  const chartRef2 = useRef();

  const measurementEnd = async()=>{
    let rDataList = [];
    dataList.slice(0,calFlag).map((num)=>rDataList.push(String(num).padStart(9, "0")))
    while (rDataList[rDataList.length-1].slice(0,1) == 1) {
      rDataList.pop()
    }
    //---------------------------------------------------------------------------------------------------------
    if(!limit){
      axios.post(`/subjects/${chartNumber}/types/fvc/measurements`, 
      {
        serialNumber:`${chartNumber}`,
        bronchodilator: `${type}`,
        // data:dataList.slice(flagTo.from, flagTo.to+1).toString().replaceAll(","," "),
        data:rDataList.join(' ')+"000000000",
        // date:{date}
      },{
        headers: {
          Authorization: `Bearer ${accessToken}`
      }},
      {withCredentials : true})
      .then((res)=>{
        console.log(res);
        setDataList([0,0])
      })
      .catch((err)=>{
        console.log(err);
      })
    }else{
      alertRef.current.classList.add("visible");
      setTimeout(()=> {
        alertRef.current.classList.remove("visible");
      }, 2000);
    }
  }

  // volumeFlow 그래프 그리기
  useEffect(()=>{
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
    console.log(data)
    setGraphData(data);
  },[calFlag])
  
  let initGraphData = ()=>{
    let data = {
      labels: '',
      datasets: [{
        label: "",
            data: [],
            borderColor: `red`,
            borderWidth: 2.5,
            showLine: true,
            tension: 0.4
      }],
    }
    setGraphData(data);
  }

  useEffect(()=>{
    let time = setTimeout(() => {
      setTemp(true);
    },1000);
    return ()=>{
      clearTimeout(time)
    }
  },[graphData])


  // timeVolume 그래프 그리기
  useEffect(()=>{
    let data = {
      labels: '',
      datasets: [{
        label: "",
            data: timeVolumeList,
            borderColor: `red`,
            borderWidth: 2.5,
            showLine: true,
            tension: 0.4
      }],
    }
    setGraphData2(data);
  },[calFlag])

  useEffect(()=>{
    
    let time = setTimeout(() => {
      setTemp(true);
    },1000);
    console.log(graphData2)
    return ()=>{
      clearTimeout(time)
    }
  },[graphData2])


//-----------------------------------------------------------------------------------------------
  // 시작 확인창 
  const [confirmStat, setConfirmStat] = useState(false);
  // 시작 확인 팝업에서 확인 클릭시
  let confirmFunc = (val)=>{
    if(val=="confirm"){
      // setMeaPreStart(true);
      setBlowF(true);
      setMeaStart(true);
    }
  }
//-----------------------------------------------------------------------------------------------
  // 기기연결 확인창 
  const [disconnectStat, setDisconnectStat] = useState(false); // 연결된 기기 없음 팝업창 띄우기
  const [disconnectConfirm, setDisconnectConfirm] = useState(false); // 1번만 나오도록 설정
  let disconnectConfirmFunc = (val)=>{
    if(val=="confirm"){
      navigatorR("/setting");
    }
    else if(val=="cancel"){
      setDisconnectStat(false);
    }
  }
//-----------------------------------------------------------------------------------------------
  // 게이지

  //게이지 틱 ref
  let itemRef = useRef([]);

  // 런타임 시간
  const [runTime, setRunTime] = useState(0);
  // 타이머 시작 여부
  const [timerStart, setTimerStart] = useState(false);
  // 틱 색 변화 인덱스
  const [tickColorIdx, setTickColorIdx] = useState(0);
  
  // 런타임 중 틱 인덱스 설정
  useEffect(()=>{
    console.log(parseInt(runTime/timerTick));
    console.log(parseInt(runTime));
    if(runTime != 0){
      setTickColorIdx(parseInt(runTime/timerTick));
    }
    if(runTime > parseInt(strongTime*1000) && !tickOn){
      setTickColor(1);
      setTickOn(true);
    }
  },[runTime])
  const [tickColor, setTickColor] = useState(0);
  const [tickOn, setTickOn] = useState(false);
  useEffect(()=>{
    if(tickOn){
      if(tickColor ==1){
        let time = setTimeout(() => {
          setTickColor(0);
        }, 300);
        return ()=>{
          clearTimeout(time)
        }
      }
      else{
        let time = setTimeout(() => {
          setTickColor(1);
        }, 300);
        return ()=>{
          clearTimeout(time)
        }
      }
    }
  },[tickColor])
  // 틱 인덱스 설정 시 틱 색깔 설정
  useEffect(()=>{
    if(tickColorIdx > 0 && tickColorIdx <= 59){
      console.log(tickColorIdx)
      itemRef.current[tickColorIdx].classList += " tickColor"
    }
  },[tickColorIdx])
//-----------------------------------------------------------------------------------------------

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
  
//
  const resetGraph = ()=>{
    let time = setTimeout(() => {
      removeTick()
      setInF(-1);
      setInFDone(false);
      setVolumeFlowList([{x:0, y:0}]);
      setTimeVolumeList([{x:0, y:0}]);
      setCalDataList([calDataList[0]]);
      setCalFlagTV(1);
      setCalFlag(1);
      setTimerReady(false);
      setRunTime(0);
      setMeasureDone(false);
      // setFlagTo({from:1, to:""})
    }, 500);
    return ()=>{
      clearTimeout(time)
    }
  }

//----------------------------------------------------------------------------------------------- 

  // 저장 알림창
  const [saveGAlert, setSaveGAlert] = useState(false); //유효한 검사 시 알림
  const [saveBAlert, setSaveBAlert] = useState(false); //유효하지 않은 검사 시 알림
  const [saveReady, setSaveReady] = useState(false);
  useEffect(()=>{
    if(measureDone){
      setSaveReady(true);
      setMeaStart(false);
    }
  },[measureDone])

  useEffect(()=>{
    if(saveReady){
      if(runTime < parseInt(strongTime*1000)){
        setSaveBAlert(true);
      }
      else{
        setSaveGAlert(true);
      }
      setSaveReady(false);
    }
  },[saveReady])

  const measureFin = async()=>{
    let time = setTimeout(() => {
      removeTick()
      setInF(-1);
      setInFDone(false);
      setDataList([0,0]);
      setVolumeFlowList([{x:0, y:0}]);
      setTimeVolumeList([{x:0, y:0}]);
      setCalDataList([]);
      setCalFlagTV(1);
      setCalFlag(1);
      setTimerReady(false);
      setRunTime(0);
      setMeasureDone(false);
      setTickColor(0);
      setTickOn(false);
      let ticks = document.getElementsByClassName('tickColor');
      Array.prototype.map.call(ticks,it=>{
        it.style.background=`#f7f7f7`;
      })
      // setFlagTo({from:1, to:""});
      setTrigger(-1)
      firstBtnRef.current.classList+=" disabled";
      if(secondBtnRef.current.classList.contains("disabled")){
        secondBtnRef.current.classList.remove("disabled");
      }
      setMeaStart(false);
      getMeasureData(date);
    }, 500);
    return ()=>{
      clearTimeout(time)
    }
  }

  const [saveMsg, setSaveMsg] = useState("");
  const alertRef = useRef();
  const selectSave = async (val)=>{
    if(!limit){
      if(val == "confirm"){
        setSaveMsg("검사 저장이 완료되었습니다.\n추가로 검사를 진행하고 싶다면 검사 시작 버튼을 눌러주세요.");
        measurementEnd()
      }
      else{
        setSaveMsg("검사 저장에 실패했습니다.\n검사를 다시 진행하여 저장해주세요.");
      }
    }else{
      alertRef.current.classList.add("visible");
      setTimeout(()=> {
        alertRef.current.classList.remove("visible");
      }, 2000);
    }
    await measureFin();
  }

  


//-----------------------------------------------------------------------------------------------
  
//   const measurementApply = ()=>{
//     console.log()
//     let rDataList = [];
    
//     rawDataList.slice(flagTo["from"], flagTo["to"]+1).map((num)=>rDataList.push(String(num).padStart(9, "0"))) 
//     axios.post(`/devices/000255/calibrations`, 
//     {
//       "serialNumber":cookies.get('serialNum'),
//       "bronchodilator": "pre",
//       "data":"100000000 ...",
//       "date": "yyyy-MM-dd"
//     },{
//       headers: {
//         Authorization: `Bearer ${cookies.get('accessToken')}`
//     }},
//     {withCredentials : true})
//     .then((res)=>{

//     })
//     .catch((err)=>{
//       console.log(err);
//     })
// }
  const startBtnClicked = ()=>{
    setConfirmStat(true);
    setGraphOnOff([...graphOnOff].fill(0))
  }

  const [backStat, setBackStat] = useState(false);
  let backConfirmFunc = (val)=>{
    if(val=="confirm"){
      navigatorR("/memberList");
    }
    else if(val=="cancel"){
      setBackStat(false);
    }
  }
  useEffect(()=>{
    console.log(limit)
  },[limit])


  const [shadow, setShadow] = useState(0);
  
  let VolumeShadow = styled.div`
    width: 33vh;
    height: 33vh;
    border-radius: 100vh;
    box-shadow: 0 0 2px ${props=> props.shadow*1.2>=15?15:props.shadow*1.2 }px #c6f1ff;
    position: absolute;
  `;

  let tickColorList = ['#5fc6d3', '#f00'];

  let ticks = document.getElementsByClassName('tickColor');
  Array.prototype.map.call(ticks,it=>{
    it.style.background=`${tickColorList[tickColor]}`;
  })
  

  const [finishAlertStat, setFinishAlertStat] = useState(false);
  
  let finishConfirmFunc = (val)=>{
    if(val=="confirm"){
      click(chartNumber, birth);
    }
    else if(val=="cancel"){
      setFinishAlertStat(false);
    }
  }
  const click = (chartNumber, birth) =>{
    axios.get(`/subjects/${chartNumber}/histories` , {
      headers: {
        Authorization: `Bearer ${accessToken}`
      }
    }).then((res)=>{
      report(res.data.response, chartNumber);
    }).catch((err)=>{
      console.log(err);
    })
  }
  const [date1, setDate1] = useState([]);
  const [goTO, setGoTO] = useState(false)
  const [data0, setData0] = useState([]);
  const [data1, setData1] = useState([]);
  const [data2, setData2] = useState([]);
  const report = async(date,chartNum)=>{
    await axios.get(`/subjects/${chartNum}`,{
      headers: {
        Authorization: `Bearer ${accessToken}`
      }
    }).then((res)=>{
      console.log(res);
      if(res.data.subCode === 2004){
        setData0(res.data.message);
      }
      else setData0(res.data.response);
    })

    await axios.get(`/v3/subjects/${chartNum}/types/fvc/results/${date[0]}` , {
      headers: {
        Authorization: `Bearer ${accessToken}`
      }
    }).then((res)=>{
      console.log(res);
      if(res.data.subCode === 2004){
        setData1(res.data.message);
      }
      else setData1(res.data.response);
    }).catch((err)=>{
      console.log(err);
    })
    await axios.get(`/subjects/${chartNum}/histories`
    , {
      headers: {
        Authorization: `Bearer ${accessToken}`
    }}).then((res)=>{
      console.log(res.data.response);
      setDate1(res.data.response);
    }).catch((err)=>{
      console.log(err);
    })
    await axios.get(`/v3/subjects/${chartNum}/types/svc/results/${date[0]}` , {
      headers: {
        Authorization: `Bearer ${accessToken}`
      }
    }).then((res)=>{
      console.log(res);
      if(res.data.subCode === 2004){
        setData2(res.data.message);
      }
      else setData2(res.data.response);
    }).catch((err)=>{
      console.log(err);
    })
    setGoTO(true);
  }
  useEffect(()=>{
    if(goTO){
      console.log(chartNumber);
      console.log(data0);
      console.log(data1);
      console.log(data2);
      console.log(date);
      navigatorR('/memberList/resultPage', {state: {info:data0, fvc:data1, svc:data2, date:date1, birth:birth, chartNumber:chartNumber}});
    }
    else{}
  },[goTO])


  const [deleteAlert,setDeleteAlert] = useState(false);
  // const [deleteButton,setDeleteButton] = useState(false);
  const [measurementId,setMeasurementId] = useState();
  // useEffect(()=>{
  //   if(deleteButton){
  //   }
  // },[deleteButton])
  
  return(
    <div className="measurement-page-container">
      {<Alert inputRef={alertRef} contents={"검사 저장에 실패했습니다.\n폐기능 검사는 하루 최대 8회 까지만 검사할 수 있습니다.."}/>}
      {deleteAlert ? <Confirm content={"선택하신 검사를 삭제하시겠습니까?"} btn={true} onOff={setDeleteAlert} select={(e)=>{if(e === "confirm"){simpleResult(measurementId,date);}}}/> : null}
      {saveGAlert ? <Confirm content={"검사를 저장하시려면 확인 버튼을 눌러주세요.\n해당 검사를 취소하고 싶다면 취소 버튼을 눌러주세요."} btn={true} onOff={setSaveGAlert} select={selectSave}/> : null}
      {saveBAlert ? <Confirm content={`${strongTime}초 이상 강하게 호흡을 불지 않아, 유효하지 않은 검사입니다.\n그대로 검사를 저장하시겠습니까?`} btn={true} onOff={setSaveBAlert} select={selectSave}/> : null}
      {confirmStat ? <Confirm content="검사를 시작하시겠습니까?" btn={true} onOff={setConfirmStat} select={confirmFunc}/> : null}
      {disconnectStat ? <Confirm content={"연결된 Spirokit기기가 없습니다.\n설정 페이지로 이동해서 Spirokit을 연결해주세요."} btn={true} onOff={setDisconnectStat} select={disconnectConfirmFunc}/> : null}
      {backStat ? <Confirm content={"환자선택 화면으로 돌아가시겠습니까?"} btn={true} onOff={setBackStat} select={backConfirmFunc}/> : null}
      {readyAlert ? <Confirm content={"SpiroKit 동작 준비 중 입니다.\n잠시만 기다려주세요."} btn={false} onOff={setReadyAlert} select={confirmFunc}/> : null}
      {finishAlertStat ? <Confirm content={"모든 검사를 종료하고, 검사 결과페이지로 이동하시겠습니까?"} btn={true} onOff={setFinishAlertStat} select={finishConfirmFunc}/> : null}
        <div className="measurement-page-nav">
          <div className='measurement-page-backBtn' onClick={()=>{setBackStat(true)}}>
            <FaChevronLeft style={{color: "#4b75d6",}}/>
          </div>
          <p onClick={()=>{console.log(dataList)}}>{location.state.name}</p>
          <div className='graph-status-container'>
            <div className='error'>
                  <span>Error Code </span>
                  {
                      <span className='error-data'>{totalData == " " || totalData == "Empty resource" || !totalData  ? '-': totalData.diagnosis.errorCode}</span>
                  }
                </div>
                <div className='grade'>
                  <span>Grade </span>
                  {
                      <span className='grade-data'>{totalData == " " || totalData == "Empty resource" || !totalData  ? '-': totalData.diagnosis.suitability}</span>
                  }
                  
                </div>
            <div ref={blueIconRef} className="device-connect" onClick={()=>{navigatorR("/setting")}}>
                {
                  noneDevice ?
                    <p>연결되지 않음</p>
                    :
                    <p>연결됨</p>
                }
                <FaBluetoothB/>
            </div>
          </div>
        </div>

      
        <div className="measurement-page-left-container">
          <div className="measure-gauge-container">
              <VolumeShadow shadow={shadow}/>
              <div className="gauge-container">
                <div className="gaugeItem" ><p ref={el=>itemRef.current[1]=el} ></p></div>
                <div className="gaugeItem" ><p ref={el=>itemRef.current[2]=el} ></p></div>
                <div className="gaugeItem" ><p ref={el=>itemRef.current[3]=el} ></p></div>
                <div className="gaugeItem" ><p ref={el=>itemRef.current[4]=el} ></p></div>
                <div className="gaugeItem" ><p ref={el=>itemRef.current[5]=el} ></p></div>
                <div className="gaugeItem" ><p ref={el=>itemRef.current[6]=el} ></p></div>
                <div className="gaugeItem" ><p ref={el=>itemRef.current[7]=el} ></p></div>
                <div className="gaugeItem" ><p ref={el=>itemRef.current[8]=el} ></p></div>
                <div className="gaugeItem" ><p ref={el=>itemRef.current[9]=el} ></p></div>
                <div className="gaugeItem" ><p ref={el=>itemRef.current[10]=el} ></p></div>
                <div className="gaugeItem" ><p ref={el=>itemRef.current[11]=el} ></p></div>
                <div className="gaugeItem" ><p ref={el=>itemRef.current[12]=el} ></p></div>
                <div className="gaugeItem" ><p ref={el=>itemRef.current[13]=el} ></p></div>
                <div className="gaugeItem" ><p ref={el=>itemRef.current[14]=el} ></p></div>
                <div className="gaugeItem" ><p ref={el=>itemRef.current[15]=el} ></p></div>
                <div className="gaugeItem" ><p ref={el=>itemRef.current[16]=el} ></p></div>
                <div className="gaugeItem" ><p ref={el=>itemRef.current[17]=el} ></p></div>
                <div className="gaugeItem" ><p ref={el=>itemRef.current[18]=el} ></p></div>
                <div className="gaugeItem" ><p ref={el=>itemRef.current[19]=el} ></p></div>
                <div className="gaugeItem" ><p ref={el=>itemRef.current[20]=el} ></p></div>
                <div className="gaugeItem" ><p ref={el=>itemRef.current[21]=el} ></p></div>
                <div className="gaugeItem" ><p ref={el=>itemRef.current[22]=el} ></p></div>
                <div className="gaugeItem" ><p ref={el=>itemRef.current[23]=el} ></p></div>
                <div className="gaugeItem" ><p ref={el=>itemRef.current[24]=el} ></p></div>
                <div className="gaugeItem" ><p ref={el=>itemRef.current[25]=el} ></p></div>
                <div className="gaugeItem" ><p ref={el=>itemRef.current[26]=el} ></p></div>
                <div className="gaugeItem" ><p ref={el=>itemRef.current[27]=el} ></p></div>
                <div className="gaugeItem" ><p ref={el=>itemRef.current[28]=el} ></p></div>
                <div className="gaugeItem" ><p ref={el=>itemRef.current[29]=el} ></p></div>
                <div className="gaugeItem" ><p ref={el=>itemRef.current[30]=el} ></p></div>
                <div className="gaugeItem" ><p ref={el=>itemRef.current[31]=el} ></p></div>
                <div className="gaugeItem" ><p ref={el=>itemRef.current[32]=el} ></p></div>
                <div className="gaugeItem" ><p ref={el=>itemRef.current[33]=el} ></p></div>
                <div className="gaugeItem" ><p ref={el=>itemRef.current[34]=el} ></p></div>
                <div className="gaugeItem" ><p ref={el=>itemRef.current[35]=el} ></p></div>
                <div className="gaugeItem" ><p ref={el=>itemRef.current[36]=el} ></p></div>
                <div className="gaugeItem" ><p ref={el=>itemRef.current[37]=el} ></p></div>
                <div className="gaugeItem" ><p ref={el=>itemRef.current[38]=el} ></p></div>
                <div className="gaugeItem" ><p ref={el=>itemRef.current[39]=el} ></p></div>
                <div className="gaugeItem" ><p ref={el=>itemRef.current[40]=el} ></p></div>
                <div className="gaugeItem" ><p ref={el=>itemRef.current[41]=el} ></p></div>
                <div className="gaugeItem" ><p ref={el=>itemRef.current[42]=el} ></p></div>
                <div className="gaugeItem" ><p ref={el=>itemRef.current[43]=el} ></p></div>
                <div className="gaugeItem" ><p ref={el=>itemRef.current[44]=el} ></p></div>
                <div className="gaugeItem" ><p ref={el=>itemRef.current[45]=el} ></p></div>
                <div className="gaugeItem" ><p ref={el=>itemRef.current[46]=el} ></p></div>
                <div className="gaugeItem" ><p ref={el=>itemRef.current[47]=el} ></p></div>
                <div className="gaugeItem" ><p ref={el=>itemRef.current[48]=el} ></p></div>
                <div className="gaugeItem" ><p ref={el=>itemRef.current[49]=el} ></p></div>
                <div className="gaugeItem" ><p ref={el=>itemRef.current[50]=el} ></p></div>
                <div className="gaugeItem" ><p ref={el=>itemRef.current[51]=el} ></p></div>
                <div className="gaugeItem" ><p ref={el=>itemRef.current[52]=el} ></p></div>
                <div className="gaugeItem" ><p ref={el=>itemRef.current[53]=el} ></p></div>
                <div className="gaugeItem" ><p ref={el=>itemRef.current[54]=el} ></p></div>
                <div className="gaugeItem" ><p ref={el=>itemRef.current[55]=el} ></p></div>
                <div className="gaugeItem" ><p ref={el=>itemRef.current[56]=el} ></p></div>
                <div className="gaugeItem" ><p ref={el=>itemRef.current[57]=el} ></p></div>
                <div className="gaugeItem" ><p ref={el=>itemRef.current[58]=el} ></p></div>
                <div className="gaugeItem" ><p ref={el=>itemRef.current[59]=el} ></p></div>
                <div className='gaugeItem'><p className='startColor' ref={el=>itemRef.current[60]=el}></p></div>
                <div className='gauge-status'>
                  {
                    inFDone?
                      timerReady ?
                      <Timer setRunTime={setRunTime} runTime={runTime} start={timerStart} stop={stopTime}/>
                      :
                      sessionVol !== 0 ? 
                      <div className='gauge-status-content'>
                        <div>{gaugeContent.r11}/{gaugeContent.r12}</div>
                        <p>{gaugeContent.r2}</p>
                      </div>
                      :
                      <p>준비</p>  
                    :
                    <p>준비</p>
                  }
                </div>
              </div>
          </div>
          <div className="measure-msg-container">
            {
            blowF?
              meaStart?
                inF == -1 ?
                  <p className='measure-msg'>{"검사가 시작되었습니다. 편하게 호흡을 시작해주세요."}</p>
                :
                  <>
                    {
                      gaugeContent ?
                        !timerReady ?
                            gaugeContent.r2 == "IN"?
                              <p className='measure-msg'>{"편안히 숨을 들이쉬세요"}</p>
                              :
                              <p className='measure-msg'>{"편안히 숨을 내쉬세요"}</p>
                        :
                          timerStart ?
                          <p className='measure-msg'>{"강하게 숨을 내쉬세요"}</p>
                          :
                          <p className='measure-msg'>{"크게 숨을 들이쉬세요"}</p>
                      :
                        <></>
                    }
                  </>
              :
              saveMsg ? <p className='measure-msg'>{saveMsg}</p> : <p className='measure-msg'>{"바람을 불어서 활성화해주세요."}</p>
            :
              noneDevice==false?
              <p className='measure-msg'>{"SpiroKit 연동이 완료되었습니다.\nSpiroKit 동작버튼을 켜주시고, 마우스피스 입구에 살짝 입김을 불어 검사 시작 버튼을 활성화 해주세요."}</p>
              :
              <p className='measure-msg'>{"SpiroKit 연동이 필요합니다."}</p>
            }
          </div>
          <div className='measure-msg-picture'>
            {
              blowF?
                meaStart?
                  inF == -1 ?
                    <img src={process.env.PUBLIC_URL + '/measOUT.svg'} />
                  :
                    <>
                      {
                        gaugeContent ?
                          !timerReady ?
                              gaugeContent.r2 == "IN"?
                                <img src={process.env.PUBLIC_URL + '/measIN.svg'} />
                                :
                                <img src={process.env.PUBLIC_URL + '/measOUT.svg'} />
                          :
                            timerStart?
                              <img src={process.env.PUBLIC_URL + '/measStrongOUT.svg'} />
                            :
                              <img src={process.env.PUBLIC_URL + '/measIN.svg'} />
                        :
                          <></>
                      }
                    </>
                :
                <img src={process.env.PUBLIC_URL + '/measDONE.svg'} />
                  
              :
                notifyDone?
                  <img src={process.env.PUBLIC_URL + '/measDONE.svg'} />
                  :
                    <>
                      {
                        noneDevice==false?
                        <img src={process.env.PUBLIC_URL + '/measDONE.svg'} />
                        :
                        <img src={process.env.PUBLIC_URL + '/meas1.svg'} />
                      }
                    </>
            }
          </div>
        </div>
        <div className="measurement-page-right-container">
          <div className="fvc-graph-container">
            <div className="graph">
              {temp?<div className="title-y">Flow(l/s)</div>:<></>}
              {temp?<Scatter ref={chartRef} style={graphStyle} data={graphData} options={graphOption}/>:<p className='loadingG'>화면 조정 중..</p>}
              {temp?<div className="title-x">Volume(L)</div>:<></>}
            </div>
            <div className="graph">
              {temp?<div className="title-y">Volume(L)</div>:<></>}
              {temp?<Scatter ref={chartRef2} style={graphStyle} data={graphData2} options={graphOption2}/>:<p className='loadingG'>화면 조정 중..</p>}
              {temp?<div className="title-x">Time(s)</div>:<></>}
            </div>
            <div className='volume-bar'>
              <div>
                {
                  meaStart ? 
                    calibratedLps ? <VolumeBar width={calibratedLps*20}/> : <VolumeBar width={0}/>
                    : <VolumeBar width={0}/>
                }
              </div>
            </div>
          </div>

          <div className="three-btn-container">
            <div ref={firstBtnRef} onClick={()=>{
              if(!(firstBtnRef.current.classList.contains("disabled"))){
                resetGraph()
                maxY = 2;
                minY = -1;
                maxX = 6;
                volumFlowMin = 0;
                volumFlowMaxX = 0;
              }
            }}> <RiLungsLine className='lungIcon'/><p>재측정</p></div>
            <div ref={secondBtnRef} onClick={()=>{
              if(!(secondBtnRef.current.classList.contains("disabled"))){
                if(!meaStart){
                  console.log(1)
                  startBtnClicked()

                }
                else{
                  console.log(2)
                  measurementEnd()
                  getMeasureData()
                  //+++++++++++++++++++++++++++++++++++++++++++++++++검사 저장 버튼 눌렀을 떄 -> 알림창!
                }
              }
            }}> <RiLungsLine className='lungIcon'/><p>{meaStart ? "검사 저장" : "검사 시작"}</p></div>
            <div ref={thirdBtnRef} onClick={()=>{
              // console.log(flagTo);
              // console.log(dataList.slice(flagTo.from, flagTo.to+1).toString().replaceAll(","," "));
              setFinishAlertStat(true);
            }}><p>검사 종료</p></div>
          </div>

          <div className="history-container">
              <div className="slider">
                {
                totalData == " " || totalData == "Empty resource" || !totalData ? null :
                  totalData.trials.map((item, index)=>(
                    <div ref={(el)=>{simpleResultsRef.current[index]=el}} onClick={()=>{setTemp(true); selectGraph(index)}} key={item.measurementId}  className='simple-result-container'>
                    <div className='simple-result-title-container'>
                    <FaSquareXmark className='deleteIcon'  style={{color: "#ff0000",}} onClick={(e)=>{
                      e.stopPropagation(); 
                        if(!meaStart){
                          setTemp(true);
                          setDeleteAlert(true);
                          setMeasurementId(item.measurementId);
                        };
                      }}/>
                    <div className='simple-result-title-date'>
                      <div className='simple-result-title'>{item.bronchodilator}</div>
                      <div className='simple-result-date'>({item.date})</div> 
                    </div>
                      
                    </div>
                    <div className='simple-result-table-container'>
                      <div className='simple-result-table-column'>
                        <p></p>
                        <p>meas</p>
                        <p>pred</p>
                        <p>percent</p>
                      </div>
                      <div className='simple-result-table-FVC'>
                        <p>{item.results[0].title}({item.results[0].unit})</p>
                        <p>{item.results[0].meas?item.results[0].meas:"-"}</p>
                        <p>{item.results[0].pred?item.results[0].pred:"-"}</p>
                        <p>{item.results[0].per?item.results[0].per:"-"}</p>
                      </div>
                      <div className='simple-result-table-FEV1'>
                        <p>{item.results[22].title}({item.results[22].unit})</p>
                        <p>{item.results[22].meas?item.results[22].meas:"-"}</p>
                        <p>{item.results[22].pred?item.results[22].pred:"-"}</p>
                        <p>{item.results[22].per?item.results[22].per:"-"}</p>
                      </div>
                      <div className='simple-result-table-FEV1'>
                        <p>{item.results[1].title}({item.results[1].unit})</p>
                        <p>{item.results[1].meas?item.results[1].meas:"-"}</p>
                        <p>{item.results[1].pred?item.results[1].pred:"-"}</p>
                        <p>{item.results[1].per?item.results[1].per:"-"}</p>
                      </div>
                      <div className='simple-result-table-FEV1per'>
                        <p>FEV1%</p>
                        <p>{item.results[2].meas?item.results[2].meas:"-"}</p>
                        <p>{item.results[2].pred?item.results[2].pred:"-"}</p>
                        <p>{item.results[2].per?item.results[2].per:"-"}</p>
                      </div>
                      <div className='simple-result-table-PEF'>
                        <p>PEF(L/s)</p>
                        <p>{item.results[3].meas?item.results[3].meas:"-"}</p>
                        <p>{item.results[3].pred?item.results[3].pred:"-"}</p>
                        <p>{item.results[3].per?item.results[3].per:"-"}</p>
                      </div>
                    </div>
                  </div>
                    ))
                }
              </div>
          </div>
        </div>
      </div>
  );
}

export default MeasurementPage;

