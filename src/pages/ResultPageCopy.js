import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom'

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faSquareXmark } from '@fortawesome/free-solid-svg-icons'
import { debounce } from 'lodash'
import { registerables,Chart as ChartJS,RadialLinearScale,LineElement,Tooltip,Legend} from 'chart.js';
import { Scatter } from 'react-chartjs-2';
import { useLocation } from 'react-router-dom';
import DateSelector from './DateSelector.js'
import annotationPlugin from 'chartjs-plugin-annotation';
// import PdfView from "../components/PdfView.js";
// import { PDFViewer } from '@react-pdf/renderer';
import { RiCalendarEventLine } from "react-icons/ri";
import { HiOutlineCog } from "react-icons/hi";
import { BiSolidFileJpg } from "react-icons/bi";
import ReportFvc from './ReportFvc.js';
import ReportSvc from './ReportSvc.js';

function ResultPageCopy(){
  ChartJS.register(RadialLinearScale, LineElement, Tooltip, Legend, ...registerables,annotationPlugin);
  const [measDate,setMeasDate] = useState('');
  const location = useLocation();
  const navigator = useNavigate();
  const state = location.state;
  const [accessToken,setAccessToken] = useState(window.api.get("get-cookies",'accessToken'));
  const [FvcSvc, setFvcSvc] = useState("fvc"); //fvc, svc
  const [info, setInfo] = useState();
  const [tvMax, setTvMax] = useState([10]);
  const [totalData,setTotalData] = useState({
    info:"Empty resource",
    fvc:"Empty resource",
    svc:"Empty resource",
    date:"",
    birth:"",
    chartNumber:"",
  })
  const[rep,setRep] = useState({
    fvcSvc : "Empty resource",
    date:"",
    birth:""
  });

  let trials;

  const chartRef = useRef();
  const chartRef2 = useRef();

  let colorList = ['rgb(5,128,190)','rgb(158,178,243)','rgb(83, 225, 232)','rgb(67,185,162)','rgb(106,219,182)','rgb(255,189,145)','rgb(255,130,130)','rgb(236,144,236)','rgb(175,175,175)','rgb(97,97,97)'];
  
  const [graphOnOff, setGraphOnOff] = useState([]);
  const [allTimeVolumeList, setAllTimeVolumeList] = useState([]);
  const [allVolumeFlowList, setAllVolumeFlowList] = useState([]);
useEffect(()=>{
  setTotalData(state);
},[])
  //fvc 그래프 처리
  useEffect(()=>{
    //fvc의 심플카드
    trials = totalData.fvc.trials;
    let timeVolumeList = [];
    let volumeFlowList = [];
    let timeVolumeMaxList = [];
    let timeVolumeMaxListX = [];
    console.log(totalData)
    if(trials){
      console.log(trials.length);
      let temp = new Array(trials.length).fill(0);
      setGraphOnOff(temp);

      // 매 결과에서 데이터 추출
      trials.forEach((item)=>{
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
      setVolumeFlow(volumeFlowList);
      setTimeVolume(timeVolumeList);
      setAllTimeVolumeList(timeVolumeList);
      setAllVolumeFlowList(volumeFlowList);
      setTvMax(timeVolumeMaxList);
      graphOption.scales.x.max = parseInt(Math.max(...timeVolumeMaxList));
      setTrigger(0);
    }
  },[totalData])

  const click = ()=>{
    console.log(location.state);
    console.log(state.info[0].content);
  }
  
  const updateData = ()=>{
    let patientDate = location.state;
    console.log(location.state)
    patientDate['update'] = true;
    navigator('/memberList/addPatient', {state: patientDate})
  }

  //결과 그래프 목록 요청 FVC
  const[volumeFlow,setVolumeFlow] = useState([]);
  const[timeVolume,setTimeVolume] = useState([]);
  const [trigger, setTrigger] = useState(-1);

  //svc그래프
  const[svcGraph,setSvcGraph] = useState([]);
  const[allSvcGraph,setAllSvcGraph] = useState([]);
  //svcY축 최대값
  const[svcMax, setSvcMax] = useState([10]);
  //그래프 선택 온오프
  const[svcGraphOnOff, setSvcGraphOnOff] = useState([]);
  //svc trigger
  const[svcTrigger, setSvcTrigger] = useState(-1);
  //심플카드 모음
  const[svcTrials, setSvcTrials] = useState([1]);

  //그래프 선택
  const selectGraph=(index)=>{
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
  }

  //svc 그래프 선택
  const selectSvcGraph=(index)=>{
    let temp;
    //처음 눌렀을때
    if(svcTrigger == 0){
      temp = [...svcGraphOnOff].fill(0); //0으로 바꾸기 (선택효과 끄기)
    }
    else{ //처음 아닐때
      temp = [...svcGraphOnOff];
    }

    if (temp[index] == 1){
      temp[index] = 0;
      setSvcTrigger(svcTrigger-1);
    }
    else if(temp[index] == 0){
      temp[index] = 1;
      setSvcTrigger(svcTrigger+1);
    }
    setSvcGraphOnOff(temp);
  }

  useEffect(()=>{
    /**
     * allTimeVolumeList -> 전체 리스트
     * timeVolume -> 보여줄 리스트
     */
    
    // 누른거 없을떄 onoff[1,1,1, ...]
    console.log("Trigger : "+trigger);
    if(trigger == 0){
      let temp = [...graphOnOff].fill(0);
      setGraphOnOff(temp);
      setTimeVolume(allTimeVolumeList);
      setVolumeFlow(allVolumeFlowList);
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

  },[trigger])
  
  useEffect(()=>{
    /**
     * allSvcGraph -> 전체 리스트
     * svcGraph -> 보여줄 리스트
     */
    
    // 누른거 없을떄 onoff[1,1,1, ...]
    if(svcTrigger == 0){
      let temp = [...svcGraphOnOff].fill(0);
      setSvcGraphOnOff(temp);
      setSvcGraph(allSvcGraph);
      return;
    }
    // 누른거 있을때
    let temp = [...allSvcGraph];
    svcGraphOnOff.forEach((item, index)=>{
      if(item == 0){
        temp[index] = [{x: 0, y: 0}];
      }
      else if(item == 1){
        temp[index] = allSvcGraph[index];
      }
    })
    setSvcGraph(temp);
    console.log(temp);
  },[svcTrigger])

  useEffect(()=>{
    //svc의 심플카드
    let svcTrials = totalData.svc.trials;
    let svcGraphList = [];
    let svcMaxList = [];

    if(svcTrials){
      let temp = new Array(svcTrials.length).fill(0);
      setSvcGraphOnOff(temp);
      // 매 결과에서 데이터 추출
      svcTrials.forEach((item)=>{
        svcGraphList.push(item.graph.timeVolume);

        //현 svc 최대값 찾기
        svcMaxList.push(parseFloat(item.results[0].meas)+3);
      })
    console.log(svcTrials)
      setSvcGraph(svcGraphList);
      setAllSvcGraph(svcGraphList);
      setSvcMax(svcMaxList);
      setSvcTrigger(0);
    }
  },[totalData])

  useEffect(()=>{
    if(FvcSvc=="fvc" && simpleResultsRef.current[0]){
      graphOnOff.forEach((item, index)=>{
        console.log("adsf")
        if(item == 1){
          simpleResultsRef.current[index].classList+=" selected";
          simpleResultsRef.current[index].style+="";
        }
        else{
          if(simpleResultsRef.current[index].classList.contains("selected")){
            simpleResultsRef.current[index].classList.remove("selected");
          }
        }
      })
    }
  },[graphOnOff])
  
  useEffect(()=>{
    if(FvcSvc=="svc" && svcSimpleResultsRef.current[0]){
      svcGraphOnOff.forEach((item, index)=>{
      if(item == 1){
          svcSimpleResultsRef.current[index].classList+=" selected";
          svcSimpleResultsRef.current[index].style+="";
        }
        else{
          if(svcSimpleResultsRef.current[index].classList.contains("selected")){
            svcSimpleResultsRef.current[index].classList.remove("selected");
          }
        }
      })
    }
  },[svcGraphOnOff])

  const [graphData, setGraphData] = useState({
    labels: ['FVC'],
    datasets: [{
      label: "",
      data: [{x: 0, y: 0}],
      borderColor: 'rgb(255,255,255)',
      showLine: true,
      tension: 0.4
    },]
  })
  const [graphData2, setGraphData2] = useState({
    labels: ['FVC'],
    datasets: [{
      label: "",
      data: [{x: 0, y: 0}],
      borderColor: 'rgb(255,255,255)',
      showLine: true,
      tension: 0.4
    },]
  })
  const [graphData3, setGraphData3] = useState({
    labels: ['SVC'],
    datasets: [{
      label: "",
      data: [
        {x: 0, y: 0}],
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
        // max: parseInt(Math.max(...tvMax)),
        ticks:{
          autoSkip: false,
          beginAtZero: false,
          max: 12.0,
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
        // min: -9,
        grace:"5%",
        ticks: {
          major: true,
          beginAtZero: true,
          stepSize : 1,
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


  const [graphOption2, setGraphOption2]=useState({

    plugins:{
      afterDraw: function (chart, easing) {
      },
      legend: {
          display: false
      },
      resizeDelay:0,
      datalabels: false,
      
    },
    afterDraw: function (chart, easing) {
      console.log(chart);
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
  })
  const graphOption3={
    plugins:{
      legend: {
          display: false
      },
      resizeDelay:0,
      datalabels: false,
    },
    responsive: true,
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
        // min: 0,
        suggestedMax: 60.0,
        // suggestedMax: 6.0,
        ticks:{
          stepSize : 10.0,
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
        max: parseFloat(Math.max(...svcMax)),
        min: parseFloat(Math.max(...svcMax))*-1,
        // suggestedMax:0,
        // suggestedMin:-6,
        ticks: {
          major: true,
          beginAtZero: true,
          // stepSize : .5,
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

  // 창 크기 조절에 따른 그래프 크기 조절
  const [first, setFirst] = useState({x:window.innerWidth, y: window.innerHeight})
  const [second, setSecond] = useState({x:window.innerWidth, y: window.innerHeight})
  const [grayBg, setGrayBg] = useState("");
  const [temp, setTemp] = useState(false);

  const handleResize = debounce(()=>{
    setTemp(false);
    setSecond({
      x: window.innerWidth,
      y: window.innerHeight,
    })
  })

  useEffect(()=>{
    setTemp(false);
  },[FvcSvc])

  useEffect(()=>{
    if(temp){
      setGrayBg("");
    }
    else{
      setGrayBg("loadingBG");
    }
  },[temp])

  useEffect(()=>{
    let time = setTimeout(() => {
      setGraphOption2({...graphOption2})
      setTemp(true);
    },500);
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
    return()=>{clearTimeout(time);}
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
  
  // volumeFlow 그리기
  useEffect(()=>
  {
    let time = setTimeout(()=>{
      let time2 = setTimeout(() => {
        let dataset = [];
        console.log(volumeFlow)
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
            console.log(data)
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

  // svcGraph 그리기
  useEffect(()=>
  {
    let time = setTimeout(()=>{
      let time2 = setTimeout(() => {
        let dataset = []
        svcGraph.forEach((item,index)=>{
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
            setGraphData3(data);
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
  },[svcGraph])

  const graphStyle = {width:"0px" ,height:"0px", transition:"none"}

  const simpleResultsRef = useRef([]);
  const svcSimpleResultsRef = useRef([]);
  const addSimpleResultsRef = (el) => {simpleResultsRef.current.push(el)};
  const detailPage = () => {
    if(FvcSvc == "fvc") navigator('/memberList/detailPage', {state: totalData.fvc});
    else navigator('/memberList/detailSvcPage', {state: totalData.svc});
  }

  const FVCBtnRef = useRef();
  const SVCBtnRef = useRef();

  const changeType = (type)=>{
    setFvcSvc(type);
  }
  useEffect(()=>{
    if(FvcSvc === 'fvc'){
      if(SVCBtnRef.current.classList.contains("clickedType")){
        SVCBtnRef.current.classList.remove("clickedType");
      }
      FVCBtnRef.current.classList += " clickedType"
    }
    else{
      if(FVCBtnRef.current.classList.contains("clickedType")){
        FVCBtnRef.current.classList.remove("clickedType");
      }
      SVCBtnRef.current.classList += " clickedType"
    }
  },[FvcSvc])
  useEffect(()=>{
    setRep({
      fvcSvc : FvcSvc == 'fvc' ? state.fvc : state.svc,
      ...rep,
    })
  },[])

  const dateSelect = (select) =>{
    console.log(select);
    setInspectionDate(select);
    setDateSelectIdx(null);
  }
  const [inspectionDate, setInspectionDate] = useState({
    start : "",
    end : ""
  });
  const [date, setDate] = useState(location.state.date);
  useEffect(()=>{
    if(totalData.chartNumber){
      axios.get(`/subjects/${totalData.chartNumber}/histories?from=${inspectionDate.start === "" ? "2000-01-01" : inspectionDate.start}&to=${inspectionDate.end === "" ? "2099-01-01" : inspectionDate.end}` , {
        headers: {
          Authorization: `Bearer ${accessToken}`
        }}).then((res)=>{
          console.log(res)
          console.log(inspectionDate);
          if(res.data.response.length !== 0){
            setDate(res.data.response);
            report(res.data.response);
          }
          else{
            setTotalData({
              info: totalData.info,
              fvc:'Empty resource',
              svc:'Empty resource',
              date:"",
              birth: totalData.birth,
              chartNumber: totalData.chartNumber,
            })
            
            setDate([]);
          }
        }).catch((err)=>{
          console.log(err);
          
        })
    }
  },[inspectionDate])

  const [dateSelectorStat, setDateSelectorStat] = useState(false);
  const [goTO, setGoTO] = useState(false)
  const [data1, setData1] = useState([]);
  const [data2, setData2] = useState([]);
  const dateSelectorRef = useRef([]);
  const [dateSelectIdx, setDateSelectIdx] = useState(0);

  useEffect(()=>{
    setTimeout(()=>{
      if(dateSelectorRef.current[0] && dateSelectIdx !== null){
        dateSelectorRef.current[dateSelectIdx].classList+= " selected";
        dateSelectorRef.current.map((a,i)=>{
          if(dateSelectorRef.current[i] && dateSelectorRef.current[i].classList.contains("selected")){
            if(dateSelectIdx!==i)dateSelectorRef.current[i].classList.remove("selected");
          }
        })
      }
    },100)
  },[dateSelectIdx])
  
  const report = async(tDate)=>{
    console.log(tDate)
    setMeasDate(tDate[0]);
    await axios.get(`/v3/subjects/${totalData.chartNumber}/types/fvc/results/${tDate[0]}` , {
      headers: {
        Authorization: `Bearer ${accessToken}`
      }
    }).then((res)=>{
      console.log(res.data.response);
      if(res.data.subCode === 2004){
        setData1(res.data.message);
      }
      else setData1(res.data.response);
    }).catch((err)=>{
      console.log(err);
    })
    await axios.get(`/v3/subjects/${totalData.chartNumber}/types/svc/results/${tDate[0]}` , {
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
    if(FvcSvc=='fvc' && data1.length){
      setRep({
        birth : state.birth,
        date: measDate !== '' ? measDate : date[0],
        fvcSvc: data1
      })
    }
    else if(FvcSvc=='svc' && data2.length){
      setRep({
        birth : state.birth,
        date: measDate !== '' ? measDate : date[0],
        fvcSvc: data2
      })
    }
    if(goTO){
      console.log("goTOTO");
      console.log(data1)
      setTotalData({
        info : state.info,
        fvc : Object.keys(data1).length !== 0 ? data1 : 'Empty resource',
        svc : Object.keys(data2).length !== 0 ? data2 : 'Empty resource',
        date : date,
        birth : state.birth,
        chartNumber: state.chartNumber,
      })
      setGoTO(false);
    }
  },[goTO])

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
    console.log(date.split(' ')[0]);
    report(date.split(' '));

  }
  
  useEffect(()=>{
    if(viewer===true){
      setTimeout(()=>{
        setViewer(false);
      },1300)
    }
  })  
  const [viewer,setViewer] = useState(false);
  const [sliderBg, setSliderBg] = useState("");
  useEffect(()=>{
    if(FvcSvc == "fvc"){
      if(totalData.fvc === '' || totalData.fvc === 'Empty resource')setSliderBg("empty");
      else setSliderBg("");
    }
    else{
      if(totalData.svc === '' || totalData.svc === 'Empty resource')setSliderBg("empty");
      else setSliderBg("");
    }
    return(()=>{setSliderBg("")})

    
  },[totalData, FvcSvc])
  useEffect(()=>{
    console.log(state)
    if(FvcSvc === 'fvc'){
      console.log(totalData)
      setRep({
        fvcSvc : totalData.fvc,
        date: measDate !== '' ? measDate[0] : state.date[0],
        birth : totalData.birth
      })
    }else{
      console.log(totalData.svc)
      setRep({
        fvcSvc : totalData.svc,
        date: measDate !== '' ? measDate[0] : state.date[0],
        birth : totalData.birth
      })
    }
  },[totalData, FvcSvc])
  
  return( 
    
    <div className="result-page-container">

      {dateSelectorStat ? <DateSelector data={inspectionDate} onOff={setDateSelectorStat} select={dateSelect}/> : null}
        <div className="nav">
          <div className="nav-logo">
            <img src={process.env.PUBLIC_URL + '/spriokit.svg'} />
          </div>
          
          <div className="nav-content-container">
            <div className="nav-left-container">

              <div className='admin'>
                <span>담당자 </span>
                
                <span>{totalData.info === '' || totalData.info === 'Empty resource' ? '': totalData.info.clinicianName}</span>
                
              </div>
              <div className='error'>
                <span>Error Code </span>
                {
                  FvcSvc == "fvc"?
                    <span>{totalData.fvc === '' || totalData.fvc === 'Empty resource' ? '-': totalData.fvc.diagnosis.errorCode}</span>
                  :
                    <span>{totalData.svc === '' || totalData.svc === 'Empty resource' ? '-': totalData.svc.diagnosis.errorCode}</span>
                }
              </div>
              <div className='grade'>
                <span>Grade </span>
                {
                  FvcSvc == "fvc"?
                    <span>{totalData.fvc === '' || totalData.fvc === 'Empty resource' ? '-': totalData.fvc.diagnosis.suitability}</span>
                  :
                    <span>{totalData.svc === '' || totalData.svc === 'Empty resource' ? '-': totalData.svc.diagnosis.suitability}</span> 
                }
                
              </div>
            </div>
            <div className="nav-right-container">
              <div className="select-patient-btn" onClick={()=>{navigator('/memberList')}}>환자 선택</div>
              <div className='setting-btn-container' onClick={()=>{navigator("/setting")}}>
                <HiOutlineCog className='cogIcon'/>
                <p className="setting-btn" >설정</p>
              </div>
            </div>
          </div>
        </div>
        <div className="left-container">
          <div className="patient-measure-list">
          <div className="measure-date-container">
            <div className="measure-selected-date-container">
              <div className='measure-selected-date-title'>검사 이력</div>
              <div className='measure-selected-dateC'>
                <div className="measure-selected-date-start">{inspectionDate.start ? inspectionDate.start : "0000-00-00"}</div>
                <div>~</div>
                <div className="measure-selected-date-end">{inspectionDate.end ? inspectionDate.end : "0000-00-00"}</div>
              </div>
            </div>
            <div className="measure-select-date-btn-container" onClick={()=>{
                setDateSelectorStat(!dateSelectorStat)
              }}>
            <RiCalendarEventLine className='calenderIcon' style={{color: "#4b75d6",}} />
            </div>
          </div>
            <div className="measure-item-containerC">
              { totalData.date ? 
              totalData.date.map((item, index)=>(
                <div ref={(el)=>{dateSelectorRef.current[index]=el}} key={item} className={"measure-item "} onClick={()=>{report([item]); setDateSelectIdx(index)}}>
                  <div className='measure-item-date'>{item}</div>

                </div>
              )) : undefined}
            </div>
          </div>
          <div className="patient-info-containerC">
            <span onClick={()=>{console.log(rep)}}>환자 정보</span>
            <div className="patient-infoC">
              <div className="title">이름</div>
              <div className="content">{totalData.info === '' || totalData.info === 'Empty resource' ? '': totalData.info.name}</div>
              <div className="title">성별</div>
              <div className="content">{totalData.info === '' || totalData.info === 'Empty resource' ? '': totalData.info.gender=="m"?"남자":"여자"}</div>
              <div className="title">신장</div>
              <div className="content">{totalData.fvc === '' || totalData.fvc === 'Empty resource' ? totalData.svc === '' || totalData.svc === 'Empty resource' ? "" : totalData.svc.subject.height : totalData.fvc.subject.height}cm</div>
              <div className="title">몸무게</div>
              <div className="content">{totalData.fvc === '' || totalData.fvc === 'Empty resource' ? totalData.svc === '' || totalData.svc === 'Empty resource' ? "" : totalData.svc.subject.weight : totalData.fvc.subject.weight}kg</div>
              <div className="title">생년월일</div>
              <div className="content">{totalData.info === '' || totalData.info === 'Empty resource' ? '': totalData.birth}</div>
              <div className="title">연간 흡연량</div>
              <div className="content">{totalData.info === '' || totalData.info === 'Empty resource' ? '': totalData.info.subjectDetails.smokingPackYear == '' ? "-":totalData.info.subjectDetails.smokingPackYear}</div>
              <div className="title">흡연 여부</div>
              <div className="content">{totalData.info === '' || totalData.info === 'Empty resource' ? '': totalData.info.subjectDetails.smoking === "false"||totalData.info.subjectDetails.smoking === false ? "아니오" : "예"}</div>
              <div className="title">흡연 기간(연)</div> 
              <div className="content">{totalData.info === '' || totalData.info === 'Empty resource' ? '': totalData.info.subjectDetails.smokingStartAge == '' ? "-" :parseInt(totalData.info.subjectDetails.smokingStopAge) - parseInt(totalData.info.subjectDetails.smokingStartAge)}</div>
            </div>
          </div>
        </div>
        <div className="right-container">
          <div className="button-container">
            <div className="two-btn-container">
              {
                FvcSvc == 'fvc' ?
                  totalData.fvc === '' || totalData.fvc === 'Empty resource'?
                    ""
                  :
                    <div onClick={()=>{
                      setViewer(!viewer)
                      // navigator('./reportFvc', {state :{data: rep}})
                    }}><BiSolidFileJpg className='jpgIcon'/>다운로드</div>
                :
                  totalData.svc === '' || totalData.svc === 'Empty resource'?
                    ""
                  :  
                    <div onClick={()=>{
                      setViewer(!viewer)
                      // navigator('./reportSvc', {state :{data: rep}})
                    }}><BiSolidFileJpg className='jpgIcon'/>다운로드</div>
              }
              <button ref={FVCBtnRef} onClick={()=>{changeType("fvc")}} id="clickme" className="FVC-btn">FVC</button>
              <button ref={SVCBtnRef} onClick={()=>{changeType("svc")}} className="SVC-btn">SVC</button>
            </div>
            {
              FvcSvc == 'fvc' ?
                totalData.fvc === '' || totalData.fvc === 'Empty resource'?
                  ""
                :
                <button className="detail-btn" onClick={()=>{detailPage()}}>결과 상세보기</button>
              :
                totalData.svc === '' || totalData.svc === 'Empty resource'?
                  ""
                :
                <button className="detail-btn" onClick={()=>{detailPage()}}>결과 상세보기</button>
            }
          </div>
          {
            FvcSvc == "fvc" ? 
            totalData.fvc === '' || totalData.fvc === 'Empty resource'? 
              <div className={"empty-graph-container "+grayBg}>{temp?"검사 결과 데이터가 없습니다.":""}</div>
            :
              <div className="fvc-graph-container">
                <div className={"graph "+grayBg}>
                  {temp?<div className="title-y">Flow(l/s)</div>:<></>}
                  {temp?<Scatter ref={chartRef} style={graphStyle} data={graphData} options={graphOption}/>:""}
                  {temp?<div className="title-x">Volume(L)</div>:<></>}
                </div>
                <div className={"graph "+grayBg}>
                  {temp?<div className="title-y">Volume(L)</div>:<></>}
                  {temp?<Scatter ref={chartRef2} style={graphStyle} data={graphData2} options={graphOption2}/>:""}
                  {temp?<div className="title-x">Time(s)</div>:<></>}
                </div>
              </div>
          :
            totalData.svc === '' || totalData.svc === 'Empty resource'? 
              <div className='empty-graph-container'>검사 내역 없음</div>
            :
              <div className='svc-graph-container'>
                <div className={"graph "+grayBg}>
                  {temp?<div className="title-y">Volume(L)</div>:<></>}
                  {temp?<Scatter ref={chartRef} style={graphStyle} data={graphData3} options={graphOption3}/>:""}
                  {temp?<div className="title-x">Time(s)</div>:<></>}
                </div>
              </div>
          }

          <div className={"history-container "+sliderBg+" "+grayBg}>
            <div className={"slider"}>
            {
              temp?
                FvcSvc == "fvc" ?
                totalData.fvc === '' || totalData.fvc === 'Empty resource'? <div className='empty-simple-container'></div> :
                totalData.fvc.trials.map((item, index)=>(
                  <div ref={(el)=>{simpleResultsRef.current[index]=el}} onClick={()=>{console.log(simpleResultsRef.current[index]);console.log(item.measurementId);selectGraph(index)}} key={item.measurementId}  className='simple-result-container'>
                    <div className='simple-result-title-container'>
                      <FontAwesomeIcon className='deleteIcon' icon={faSquareXmark} style={{color: "#ff0000",}} onClick={(e)=>{e.stopPropagation(); simpleResult(item.measurementId, item.date)}}/>
                      <div className='simple-result-title-date'>
                        <div className='simple-result-title'>{item.bronchodilator}</div>
                        <div className='simple-result-date'>({item.date})</div>
                      </div>
                      <div className='simple-result-errorcode'>
                        Error Code : {item.errorCode}
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
                :
                totalData.svc === "Empty resource" ? null:
                totalData.svc.trials.map((item, index)=>(
                  <div ref={(el)=>{svcSimpleResultsRef.current[index]=el}} onClick={()=>{console.log(svcSimpleResultsRef.current[index]);console.log(item.measurementId);selectSvcGraph(index)}} key={item.measurementId}  className='simple-result-container'>
                    <div className='simple-result-title-container'>
                      <FontAwesomeIcon className='deleteIcon' icon={faSquareXmark} style={{color: "#ff0000",}} onClick={(e)=>{e.stopPropagation(); simpleResult(item.measurementId, item.date)}}/>
                      <div className='simple-result-title-date'>
                        <div className='simple-result-title'>{item.bronchodilator}</div>
                        <div className='simple-result-date'>({item.date})</div>
                      </div>
                      <div className='simple-result-errorcode'>
                        Error Code : {item.errorCode}
                      </div>
                    </div>
                    <div className='simple-result-table-container'>
                      <div className='simple-result-table-column'>
                        <p></p>
                        <p>meas</p>
                        <p>pred</p>
                        <p>percent</p>
                      </div>
                      <div className='simple-result-table-vc'>
                        <p>{item.results[0].title}({item.results[0].unit})</p>
                        <p>{item.results[0].meas?item.results[0].meas:"-"}</p>
                        <p>{item.results[0].pred?item.results[0].pred:"-"}</p>
                        <p>{item.results[0].per?item.results[0].per:"-"}</p>
                      </div>
                      <div className='simple-result-table-ic'>
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
                      <div className='simple-result-table-PEF'>
                        <p>-</p>
                        <p>-</p>
                        <p>-</p>
                        <p>-</p>
                      </div>
                    </div>
                  </div>
                  ))
                  // svcTrials.map((item,index)=>{
                  // })
              :
              ""
            }
            </div> 
          </div>
        </div>
        {viewer ?
        FvcSvc==='fvc' ? <div className='report-fvc-svc'><ReportFvc data={rep} style={{zIndex: -1 }}/></div>  : <div className='report-fvc-svc'><ReportSvc data={rep} style={{zIndex: -1 }}/> </div>: null}
      </div>
      
      
      
  );
}
export default ResultPageCopy;