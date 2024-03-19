import { useEffect, useState, useRef} from "react";
import axios from "axios";
import { useLocation,useNavigate } from 'react-router-dom';
import { Chart as ChartJS,LinearScale,PointElement,LineElement,BarElement,Tooltip,Legend,plugins,CategoryScale} from 'chart.js';
import { Scatter } from 'react-chartjs-2';

import { debounce } from 'lodash'
import ChartDataLabels from 'chartjs-plugin-datalabels';
import { parse } from "date-fns";
function DetailPage(){
  const location = useLocation();
  const navigator = useNavigate();
  const state = location.state;
  const [preResult, setPreResult] = useState([]);
  const [measurementId, setMeasurementId] = useState([]);
  const [quadrant4,setQuadrant4] = useState();
  const [postResult, setPostResult] = useState([]);
  const [quadrant4XY,setQuadrant4XY] = useState({
      x:0.0,
      y:0.0
  })
  const [preFvc,setPreFvc] = useState({
    lower: "",
    max: "",
    meas: "",
    min: "",
    post: "",
    title: "FVC",
    upper: "",
  });
  const [postFvc,setPostFvc] = useState({
    lower: "",
    max: "",
    meas: "",
    min: "",
    post: "",
    title: "FVC",
    upper: "",
  });
  const [preFev1,setPreFev1] = useState({
    lower: "",
    max: "",
    meas: "",
    min: "",
    post: "",
    title: "FEV1",
    upper: "",
  });
  const [postFev1,setPostFev1] = useState({
    lower: "",
    max: "",
    meas: "",
    min: "",
    post: "",
    title: "FEV1",
    upper: "",
  });
  const [preFev1Per,setPreFev1Per] = useState({
    lower: "",
    max: "",
    meas: "",
    min: "",
    post: "",
    title: "FEV%",
    upper: "",
  });
  const [postFev1Per,setPostFev1Per] = useState({
    lower: "",
    max: "",
    meas: "",
    min: "",
    post: "",
    title: "FEV%",
    upper: "",
  });
  ChartJS.register(LinearScale, PointElement, LineElement,BarElement, Tooltip, Legend,ChartDataLabels, CategoryScale);
  const [preValSet, setPreValSet] = useState(0);
  const [postValSet, setPostValSet] = useState(0);
  useEffect(()=>{
    //preFvc
    if(parseFloat(preFvc.min) > parseFloat(preFvc.meas)){
      setPreFvc({...preFvc, showVal:preFvc.min})
    }
    else if(parseFloat(preFvc.max) < parseFloat(preFvc.meas)){
      setPreFvc({...preFvc, showVal:preFvc.max})
    }
    else setPreFvc({...preFvc, showVal : preFvc.meas});
    
    //preFev1
    if(parseFloat(preFev1.min) > parseFloat(preFev1.meas)){
      setPreFev1({...preFev1, showVal:preFev1.min})
    }
    else if(parseFloat(preFev1.max) < parseFloat(preFev1.meas)){
      setPreFev1({...preFev1, showVal:preFev1.max})
    }
    else setPreFev1({...preFev1, showVal:preFev1.meas})
    
    //preFev1Per
    if(parseFloat(preFev1Per.min) > parseFloat(preFev1Per.meas)){
      setPreFev1Per({...preFev1Per, showVal:preFev1Per.min})
    }
    else if(parseFloat(preFev1Per.max) < parseFloat(preFev1Per.meas)){
      setPreFev1Per({...preFev1Per, showVal:preFev1Per.max})
    }
    else setPreFev1Per({...preFev1Per, showVal:preFev1Per.meas})

  },[preValSet])

  useEffect(()=>{
    //postFvc
    if(parseFloat(postFvc.min) > parseFloat(postFvc.meas)){
      setPostFvc({...postFvc, showVal:postFvc.min})
    }
    else if(parseFloat(postFvc.max) < parseFloat(postFvc.meas)){
      setPostFvc({...postFvc, showVal:postFvc.max})
    }
    else setPostFvc({...postFvc, showVal:postFvc.meas})
    
    //postFev1
    if(parseFloat(postFev1.min) > parseFloat(postFev1.meas)){
      setPostFev1({...postFev1, showVal:postFev1.min})
    }
    else if(parseFloat(postFev1.max) < parseFloat(postFev1.meas)){
      setPostFev1({...postFev1, showVal:postFev1.max})
    }
    else setPostFev1({...postFev1, showVal:postFev1.meas})

    //postFev1Per
    if(parseFloat(postFev1Per.min) > parseFloat(postFev1Per.meas)){
      setPostFev1Per({...postFev1Per, showVal:postFev1Per.min})
    }
    else if(parseFloat(postFev1Per.max) < parseFloat(postFev1Per.meas)){
      setPostFev1Per({...postFev1Per, showVal:postFev1Per.max})
    }
    else setPostFev1Per({...postFev1Per, showVal:postFev1Per.meas})

  },[postValSet])


  //4사분면 좌표
  useEffect(()=>{
    if(preResult.length !== 0){
      const fvcMeas = parseFloat(preResult[0].meas);
      const fvcPred = parseFloat(preResult[0].pred);
      setPreFvc(preResult[0]);
      const fev1Meas = parseFloat(preResult[1].meas);
      setPreFev1(preResult[1]);
      setPreFev1Per(preResult[2]);
      let x = fvcMeas/fvcPred
      let y = fev1Meas/fvcMeas
      if(y < 0){
        y = 0.00;

      }else if(y > 1) {
        y = 1.00
      }
      if(x > 1){
        x = 1.00;
      }
      else if(x < 0){
        x = 0.00;
      }
      setQuadrant4XY({
          ...quadrant4XY,
          x:x,
          y:y
        })
      setPreValSet(1);
      setPostValSet(1);
    }
  },[preResult]);

  //post
  useEffect(()=>{
    if(Object.keys(postResult).length !== 0){
      setPostFvc(postResult[0]);
      setPostFev1(postResult[1]);
      setPostFev1Per(postResult[2]);
    }
    
  },[postResult])

  //4사분면 데이터
  const quadrant4Data = {
      labels: "",
      datasets: [{
        label: "",
        fill: false,
        // pointBackgroundColor: "red",
        pointRadius: 3,
        pointHitRadius: 3,
        backgroundColor: 'red',
        data: [{x: quadrant4XY.x, y: quadrant4XY.y}], 
        // tension: 0.4,
      },]
    }
  //4사분면 옵션
  const quadrant4Option={
    plugins:{
      legend: {
        display: false
      },
      tooltip:{
        displayColors: false,
        backgroundColor: 'white',
        bodyColor: '#000',
        borderColor:'rgb(34, 110, 177)',
        borderWidth: 1,
        callbacks: {
          label: function(context) {
            console.log(context);
            let label = `${quadrant4XY.x.toFixed(2)},${quadrant4XY.y.toFixed(2)}` || '';

            // if (label) {
            //     label += ': ';
            // }
            // if (context.parsed.y !== null) {
            //     let val;
            //     if(context.dataset.label=="post"){
            //       val = postFvc.meas;
            //     }
            //     else{
            //       val = preFvc.meas;
            //     }
            //     label += val;
            // }
            return label;
          }
        }
      },
      datalabels:false,
      interaction:{
        mode:'dataset',
        // intersect:true,
        includeInvisible:true,
        axis:'y',
      },
      datalabels:false,
    },
    interaction:false,
    tooltip:false,
    maintainAspectRatio: false,
    responsive: true,
    elements: {
      point: {
        radius: 0,
      },
    },
    pointRadius: 1,
    pointHoverRadius: 1,
    scales: {
      x: {
        axios: 'x',
        max: 1.0,
        min: 0.0,
        ticks:{
          display:false,
          beginAtZero: true,
          stepSize : 0.8,
          fontSize : 10,
          textStrokeColor: 10,
          precision: 2,
          
        },
        grid:{
          color:'#FF9191'
        }
      },
      y: {
        axios: 'y',
        max: 1.0,
        min: 0.0,
        
        ticks: {
          display:false,
          beginAtZero: true,
          stepSize : 0.7,
          fontSize : 10,
          textStrokeColor: 10,
          precision: 2,
        },
        grid:{
          color:'#FF9191',
        }
      },
    },
    title: {

    }
  }



  const fvcCompareBarData = {
    labels: "",
    datasets: [{
      label: "pre",
      fill: false,
      pointBackgroundColor: "red",
      pointBorderColor:"red",
      pointRadius: 7,
      pointHoverRadius: 7,
      data: [{ x :preFvc.showVal, y : 0.6}],
      tension: 0.4,
    },{
      label: "post",
      fill: false,
      pointBackgroundColor: "rgba(1, 136, 190, 1)",
      pointBorderColor:"rgba(1, 136, 190, 1)",
      pointRadius: 7,
      pointHoverRadius: 7,
      data: [{x:postFvc.showVal, y : 0.4}],
      tension: 0.4,
    }]
  }

  const fvcCompareBarOption={
    plugins:{
      legend: {
          display: false
      },
      tooltip:{
        displayColors: false,
        backgroundColor: 'white',
        bodyColor: '#000',
        borderColor:'rgb(34, 110, 177)',
        borderWidth: 1,
        callbacks: {
          label: function(context) {
            let label = context.dataset.label || '';

            if (label) {
                label += ': ';
            }
            if (context.parsed.y !== null) {
                let val;
                if(context.dataset.label=="post"){
                  val = postFvc.meas;
                }
                else{
                  val = preFvc.meas;
                }
                label += val;
            }
            return label;
          }
        }
      },
      datalabels:false,
      interaction:{
        mode:'dataset',
        // intersect:true,
        includeInvisible:true,
        axis:'y',
      },
    },
    interaction: true,
    responsive: true,  
    maintainAspectRatio: false,
    elements: {
      point: {
        radius: 7,
      },
      line:{
        borderWidth:19,
      },
    },
    scales: {
      x: {
        axios: 'x',
        min: preFvc.min,
        max: preFvc.max,
        ticks:{
          display:false,
        },
        grid:{
          display:false,
        }
      },
      y: {
        axios: 'y',
        max: 1.0,
        min: 0.0,
        ticks: {
          display:false,
          beginAtZero: true,
        },
        grid:{
          display:false
        }
      },
    },
    title: {
      
    }
  }
  
  const fev1Ref = useRef();
  // fev1Ref.register(ChartDataLabels);
  const fev1CompareBarData = {
    labels: "",
    datasets: [{
      label: "pre",
      fill: false,
      pointBackgroundColor: "red",
      pointBorderColor: "red",
      pointRadius: 7,
      pointHoverRadius: 7,
      data: [{ x :preFev1.showVal, y : 0.6}],
      tension: 0.4,
    },{
      label: "post",
      fill: false,
      pointBackgroundColor: "rgba(1, 136, 190, 1)",
      pointBorderColor: "rgba(1, 136, 190, 1)",
      pointRadius: 7,
      pointHoverRadius: 7,
      data: [{x:postFev1.showVal, y : 0.4}],
      tension: 0.4,
    }]
  }
  // let indexDataPoint;
  // const customTooltip = {
  //   id:"customTooltip",
  //   afterDatasetsDraw(chart, args, plugins){
  //     const ctx = chart.ctx;
  //     const data = chart.data;
  //     const scales = chart.scales;
  //     // const {ctx, data, scales: {x,y}}=chart;

  //     // const xPos = scales.x.getPixelForValue(scales.x);
  //     // console.log(xPos);
  //     ctx.beginPath();
  //     ctx.fillStyle = "black";
  //     console.log(data);
  //     data.datasets.forEach(item => {
  //       let xPos;
  //       xPos = parseFloat(item.data[0].x);
  //       ctx.roundRect(xPos, 0, 100, 20, 10);
  //       ctx.fill();
  //     });
  //   }
  // }

  ChartJS.register(LinearScale, PointElement, LineElement,BarElement, Tooltip, Legend,ChartDataLabels, CategoryScale);
  Tooltip.positioners.custom = function(elements, position) {
    // console.log(position);
    // console.log(fev1Ref.current.tooltip);
    fev1Ref.current.tooltip.active = true;
    return {
      x: position.x,
      // x: position.x + offset,
      y: position.y
    }
  }
  const fev1CompareBarOption={
    plugins:{
      legend: {
          display: false
      },
      tooltip:{
        displayColors: false,
        backgroundColor: 'white',
        bodyColor: '#000',
        borderColor:'rgb(34, 110, 177)',
        borderWidth: 1,
        callbacks: {
          label: function(context) {
            let label = context.dataset.label || '';

            if (label) {
                label += ': ';
            }
            if (context.parsed.y !== null) {
                let val;
                if(context.dataset.label=="post"){
                  val = postFev1.meas;
                }
                else{
                  val = preFev1.meas;
                }
                label += val;
            }
            return label;
          }
        }
      },
      datalabels:false,
      // plugin:[alwaysShowTooltip],
    },
    responsive: true,  
    maintainAspectRatio: false,
    // interaction: false,
    cutoutPercentage: 60,
    elements: {
      point: {
        radius: 0,
      },
    },
    
    scales: {
      x: {
        axios: 'x',
        max: preFev1.max,
        min: Math.min(parseFloat(preFev1.meas), parseFloat(preFev1.min)),
        // min: preFev1.min,
        ticks:{
          display:false,
          beginAtZero: true,
        },
        grid:{
          display:false
        }
      },
      y: {
        axios: 'y',
        max: 1.0,
        min: 0.0,
        ticks: {
          display:false,
          beginAtZero: true,
        },
        grid:{
          display:false
        }
      },
    },
    title: {
      
    }
  }
  

  const fev1PerCompareBarData = {
    labels: "",
    datasets: [{
      label: "pre",
      fill: false,
      pointBackgroundColor: "red",
      pointBorderColor: "red",
      pointRadius: 7,
      pointHoverRadius: 7,
      data: [{ x :preFev1Per.showVal, y : 0.6}],
      tension: 0.4,
      // meas: preFev1Per.meas < preFev1Per.min?preFev1Per.min:preFev1Per.meas,
    },{
      label: "post",
      fill: false,
      pointBackgroundColor: "rgba(1, 136, 190, 1)",
      pointBorderColor: "rgba(1, 136, 190, 1)",
      pointRadius: 7,
      pointHoverRadius: 7,
      data: [{x:postFev1Per.showVal, y : 0.4}],
      tension: 0.4,
    }]
  }
  
  const fev1PerCompareBarOption={
    plugins:{
      legend: {
          display: false
      },
      tooltip:{
        displayColors: false,
        backgroundColor: 'white',
        bodyColor: '#000',
        borderColor:'rgb(34, 110, 177)',
        borderWidth: 1,
        callbacks: {
          label: function(context) {
            let label = context.dataset.label || '';

            if (label) {
                label += ': ';
            }
            if (context.parsed.y !== null) {
                let val;
                if(context.dataset.label=="post"){
                  val = postFev1Per.meas;
                }
                else{
                  val = preFev1Per.meas;
                }
                label += val;
            }
            return label;
          }
        }
      },
      datalabels:false,
    },
    responsive: true,  
    maintainAspectRatio: false,
    elements: {
      point: {
        radius: 0,
      },
    },
    scales: {
      x: {
        axios: 'x',
        max: preFev1Per.max,
        min: Math.min(parseFloat(preFev1Per.meas), parseFloat(preFev1Per.min)),
        // min: preFev1Per.min,
        ticks:{
          beginAtZero: true,
          display:false,
        },
        grid:{
          display:false
        }
      },
      y: {
        axios: 'y',
        max: 1.0,
        min: 0.0,
        ticks: {
          beginAtZero: true,
          display:false,
        },
        grid:{
          display:false
        }
      },
    },
    title: {
      
    }
  }

  const fvcCompareBarData2 = {
    labels: ["pre","post"],
    datasets: [{
      label: "pre",
      fill: false,
      data: [preFvc.meas],
      // pointBackgroundColor: "red",
      // pointBorderColor:"red",
      // pointRadius: 5,
      // pointHitRadius: 10,
      // tension: 0.4,
      // backgroundColor: "",
      // borderColor: "",
    },{
      label: "post",
      fill: false,
      data: [postFvc.meas],
      // pointBackgroundColor: "rgba(1, 136, 190, 1)",
      // pointBorderColor:"rgba(1, 136, 190, 1)",
      // pointRadius: 5,
      // tension: 0.4,
    }]
  }
  const fvcCompareBarOption2={
    pointStyle: 'circle',
    indexAxis: 'y',
    plugins:{
      legend: {
          display: false
      },
      // datalabels: false,
    },
    responsive: true,  
    maintainAspectRatio: false,
    layout:{
      padding:0,
    },
    // elements: {
    //   point: {
    //     radius: 0,
    //   },
    //   line:{
    //     borderWidth:19,
    //   },
    // },
    scales:{
      x: {
        // stacked: true,
        ticks: {
          suggestedMin: 7
        }
      },
    },
    elements: {
      bar: {
        borderWidth: 2,
      }
    },
    responsive: true,
  }










  // main Graph
  const chartRef = useRef();
  const [tvMax, setTvMax] = useState([10]);
  //결과 그래프 목록 요청 FVC
  const[volumeFlow,setVolumeFlow] = useState([]);
  const[timeVolume,setTimeVolume] = useState([]);

  let diagnosis, trials;

  // let colorList = ['rgb(5,128,190)','rgb(158,178,243)','rgb(83, 225, 232)','rgb(67,185,162)','rgb(106,219,182)','rgb(255,189,145)','rgb(255,130,130)','rgb(236,144,236)','rgb(175,175,175)','rgb(97,97,97)'];
  
  const graphStyle = {width:"0px" ,height:"0px", transition:"none"}
  const graphStyle2 = {boxSizing:"border-box",width:"0px" ,height:"0px", transition:"none"}
  const [graphPreCount, setGraphPreCount] = useState([]);
  const [graphPostCount, setGraphPostCount] = useState([]);
  useEffect(()=>{
    console.log(location.state);
    console.log(123123123);
    diagnosis = location.state.diagnosis;
    //fvc의 심플카드
    trials = location.state.trials;
    let timeVolumeList = [];
    let volumeFlowList = [];
    let timeVolumeMaxList = [];

    if(trials){
      console.log(trials.length);
      let count = 0; //pre post 인덱스 관리 (색 구분용)
      // 매 결과에서 데이터 추출
      trials.forEach((item)=>{
        if(item.best){
          if(item.bronchodilator === "pre"){
            setGraphPreCount([...graphPreCount, count++])
            setPreResult(item.results);
          }
          else if(item.bronchodilator === "post"){
            setGraphPostCount([...graphPreCount, count++]);
            setPostResult(item.results);
          }
          timeVolumeList.push(item.graph.timeVolume);
          volumeFlowList.push(item.graph.volumeFlow);
          //현 timeVolume에서 최대값 찾기
          timeVolumeMaxList.push(item.results[3].meas);
        }
      })
      setVolumeFlow(volumeFlowList);
      setTimeVolume(timeVolumeList);
      setTvMax(timeVolumeMaxList);
    }
  },[])

  const [graphData, setGraphData] = useState({
    labels: ['Red', 'Blue', 'Yellow', 'Green', 'Purple', 'Orange'],
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
    labels: ['Red', 'Blue', 'Yellow', 'Green', 'Purple', 'Orange'],
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
  const [graphData3, setGraphData3] = useState({
    labels: ['Red', 'Blue', 'Yellow', 'Green', 'Purple', 'Orange'],
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
      // duration:0
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
        max: parseFloat(Math.max(...tvMax)),
        // suggestedMax: 6.0,
        ticks:{
          autoSkip: false,
          // stepSize : 0.1,
          // precision : 0.1,
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
        // suggestedMax:12,
        // suggestedMin:-6,
        grace:"10%",
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
      // duration:0
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
  const graphOption3={
    plugins:{
      legend: {
          display: false
      },
      resizeDelay:0,
      datalabels: false,
    },
    responsive: true,
    animation:{
      // duration:0
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
        // min: 0,
        suggestedMax: 60.0,
        // suggestedMax: 6.0,
        ticks:{
          stepSize : 10.0,
          beginAtZero: false,
          max: 12.0,
          autoSkip: false,
        }
      },
      y: {
        gridLines:{
          zeroLineColor:'rgba(0, 0, 255, 1)',
        },
        axios: 'y',
        // max: parseFloat(Math.max(...svcMax)),
        // min: parseFloat(Math.max(...svcMax))*-1,
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
      },
    },
  }




  // 창 크기 조절에 따른 그래프 크기 조절
  const [first, setFirst] = useState({x:window.innerWidth, y: window.innerHeight})
  const [second, setSecond] = useState({x:window.innerWidth, y: window.innerHeight})
  const [temp, setTemp] = useState(false);
  const [grayBg, setGrayBg] = useState("");

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
  },[graphData])

  useEffect(()=>{
    setFirst(second)
  },[second])

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
  



  // volumeFlow 그리기
  useEffect(()=>
  {
    console.log("!#!##")

    let time = setTimeout(()=>{
      console.log("!#!##!@!@")
      
      let time2 = setTimeout(() => {
        let dataset = []
        volumeFlow.forEach((item,index)=>{
          let color = "red";
          if([...graphPostCount].includes(index)) color = 'rgba(1, 136, 190, 1)';
          dataset.push(
            {
              label: "",
              data: item,
              borderColor: color,
              borderWidth: 2.5,
              showLine: true,
              tension: 0.4
            }
          )
        })
        let time3 = setTimeout(() => {
          let data = {
            labels: ['Red', 'Blue', 'Yellow', 'Green', 'Purple', 'Orange'],
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
    console.log("!#!##")

    let time = setTimeout(()=>{
      console.log("!#!##!@!@")
      
      let time2 = setTimeout(() => {
        let dataset = []
        timeVolume.forEach((item,index)=>{
          let color = "red";
          if([...graphPostCount].includes(index)) color = 'rgba(1, 136, 190, 1)';
          dataset.push(
            {
              label: "",
              data: item,
              borderColor: color,
              borderWidth: 2.5,
              showLine: true,
              tension: 0.4
            }
          )
        })
        let time3 = setTimeout(() => {
          let data = {
            labels: ['Red', 'Blue', 'Yellow', 'Green', 'Purple', 'Orange'],
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

  //prePost 상태
  const [prePost, setPrePost] = useState("pre"); //fvc, svc
  const preBtnRef = useRef();
  const postBtnRef = useRef();

  const changeType = (type)=>{
    setPrePost(type);
  }
  useEffect(()=>{
    if(prePost === 'pre'){
      if(postBtnRef.current.classList.contains("clickedType")){
        postBtnRef.current.classList.remove("clickedType");
      }
      preBtnRef.current.classList += " clickedType"
    }
    else if(prePost === 'post'){
      if(preBtnRef.current.classList.contains("clickedType")){
        preBtnRef.current.classList.remove("clickedType");
      }
      postBtnRef.current.classList += " clickedType"
    }
  },[prePost])
  return (
      <div className="result-page-container detail-page-container">
      <div className="nav">
        <div className="nav-logo" onClick={()=>{console.log({preFvc, postFvc});}}>
          <img src={process.env.PUBLIC_URL + '/spriokit.svg'} />
        </div>
        <div className="nav-content-container">
          <div className="nav-left-container">
            <div className="admin">
              <span>담당자</span>
              <span>{state.subject.clinicianName}</span>
            </div>
            <div className='error'>
                <span>Error Code </span>
                <span>{state.diagnosis.errorCode}</span>
              </div>
              <div className='grade'>
                <span>Grade </span>
                <span>{state.diagnosis.suitability}</span>
              </div>
          </div>
          {/* <div className="nav-right-container">
            <button className="select-patient-btn" onClick={()=>{navigator(-1)}}>환자 선택</button>
            <button className="setting-btn">설정</button>
          </div> */}
        </div>
      </div>
      <div className="nav-bottom">
        <div className="button-container">
          <button className="detail-btn" onClick={()=>{navigator(-1)}}>결과 요약보기</button>
        </div>
      </div>
      <div className="left-container">
        {/* <div className="button-container">
          <button className="detail-btn" onClick={()=>{}}>결과 상세보기</button>
        </div> */}
          <div className="detail-fvc-graph-container">
            <div className={"graph "+grayBg}>
              {temp?<div className="title-y">Flow(l/s)</div>:<></>}
              {temp?<Scatter ref={chartRef} style={graphStyle} data={graphData} options={graphOption}/>:null}
              {temp?<div className="title-x">Volume(L)</div>:<></>}
            </div>
            <div className={"graph "+grayBg}>
              {temp?<div className="title-y">Volume(L)</div>:<></>}
              {temp?<Scatter style={graphStyle} data={graphData2} options={graphOption2}/>:null}
              {temp?<div className="title-x">Time(s)</div>:<></>}
            </div>
          </div>
        
        {/* <div className="fvc-graph-container">
        </div> */}
        

        <div className="bottom-graph-container">
          <div className="quadrant-graph-container">
            <div className="graph">
              <div className="assessment assessment-restrictive">제한성환기장애(restrictive)</div>
              <div className="assessment assessment-normal">정상(normal)</div>
              <div className="assessment assessment-mixed">혼합형환기장애(Mixed)</div>
              <div className="assessment assessment-obstructive">폐쇄성환기장애(obstructive)</div>
              {temp?<Scatter options={quadrant4Option} style={graphStyle} data={quadrant4Data} />:<></>}
              <div className="guard guard-top"></div>
              <div className="guard guard-right"></div>
              <div className="guard guard-bottom"></div>
              <div className="guard guard-left"></div>
              {/* <div className="quadrantXY">({quadrant4XY.x.toFixed(2)},{quadrant4XY.y.toFixed(2)})</div> */}
            </div>
          </div>
          <div className="compare-graph-container">
            <div className="fvc-compare-graph">
              <div className="compare-title">FVC(L)</div>
              <div className="compare-canvas-container">
                <div className="compare-background2"></div>
                <div className="compare-background"></div>
                <div className="compare-background-line-left"></div>
                <div className="compare-background-line-right"></div>
                {temp?<Scatter  id="fvcCompare" style={graphStyle2} options={fvcCompareBarOption} data={fvcCompareBarData}/>:<></>}
                <div className="compare-border-left"></div>
                <div className="compare-border-bottom"></div>
                <div className="compare-border-top"></div>
              </div>
            </div>
            <div className="fev1-compare-graph">
              <div className="compare-title">FEV1(L)</div>
              <div className="compare-canvas-container">
                <div className="compare-background2"></div>
                <div className="compare-background"></div>
                <div className="compare-background-line-left"></div>
                <div className="compare-background-line-right"></div>
                {temp?<Scatter ref={fev1Ref} style={graphStyle2} options={fev1CompareBarOption} data={fev1CompareBarData} />:<></>}
                <div className="compare-border-left"></div>
                <div className="compare-border-bottom"></div>
                <div className="compare-border-top"></div>
              </div>
            </div>
            <div className="fev1per-compare-graph">
              <div className="compare-title">FEV1(%)</div>
              <div className="compare-canvas-container">
                <div className="compare-background2"></div>
                <div className="compare-background"></div>
                <div className="compare-background-line-left"></div>
                <div className="compare-background-line-right"></div>
                {temp?<Scatter style={graphStyle2} options={fev1PerCompareBarOption} data={fev1PerCompareBarData} />:<></>}
                <div className="compare-border-left"></div>
                <div className="compare-border-bottom"></div>
                <div className="compare-border-top"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="right-container">
        <div className="prePost-container">
          <div className="prePost-column">
            <div className="prePost-column-name"></div>
            <div className="prePost-column-name"></div>
            <div className="prePost-column-name">측정</div>
            <div className="prePost-column-name">예측값</div>
            <div className="prePost-column-name">%</div>
            <div className="prePost-column-name">정상범위</div>
            <div className="prePost-column-name"></div>
          </div>
          <div className="prePost-item-container">
            {
              prePost === "pre" ?
                preResult.map((item,index)=>(
                    <div className="prePost-item">
                        <div></div>
                        <div className="prePost-item-title"><p>{item.title}</p></div>
                        <div><p>{item.meas === '' ? '-' : item.meas}</p></div>
                        <div><p>{item.pred === '' ? '-' : item.pred}</p></div>
                        <div><p>{item.per === '' ? '-' : item.per}</p></div>
                        <div><p>{item.lower} ~ {item.upper}</p></div>
                        <div></div>
                    </div>
                ))
              :
              postResult.map((item)=>(
                <div className="prePost-item">
                    <div></div>
                    <div className="prePost-item-title"><p>{item.title}</p></div>
                    <div><p>{item.meas === '' ? '-' : item.meas}</p></div>
                    <div><p>{item.pred === '' ? '-' : item.pred}</p></div>
                    <div><p>{item.per === '' ? '-' : item.per}</p></div>
                    <div><p>{item.lower} ~ {item.upper}</p></div>
                    <div></div>
                </div>
              ))
            }
          </div>
          <div className="prePost-btn-container">
            <button ref={preBtnRef} onClick={()=>{changeType("pre")}}>Pre 보기</button>
            <button ref={postBtnRef} onClick={()=>{changeType("post")}}>Post 보기</button>
          </div>
        </div>
      </div>
    </div>
  );

}

export default DetailPage;