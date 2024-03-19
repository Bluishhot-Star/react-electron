import { useState, useRef, useEffect} from 'react';
import axios from 'axios';
import Alert from "../components/Alerts.js"
import { Routes, Route, Link,useNavigate,useLocation } from 'react-router-dom'
import {} from "@fortawesome/fontawesome-svg-core"
import { FontAwesomeIcon} from '@fortawesome/react-fontawesome'
import { debounce, values } from 'lodash'
import { faChevronLeft } from '@fortawesome/free-solid-svg-icons'
import { RxImage } from "react-icons/rx";
import {registerables,Chart as ChartJS,RadialLinearScale,LineElement,Tooltip,Legend,} from 'chart.js';
import { Scatter } from 'react-chartjs-2';
import annotationPlugin from 'chartjs-plugin-annotation';
import html2canvas from "html2canvas";
const GainResultPage = () =>{
  ChartJS.register(RadialLinearScale, LineElement, Tooltip, Legend, ...registerables,annotationPlugin);
  const location = useLocation();
  const chartRef = useRef();
  // const graphStyle = {width:"0" ,height:"0", transition:"none"}
  let windowWidth = window.innerWidth*0.6;
  let windowHeight = window.innerHeight-200;
  // const [windowHeight,setWindowHeight] = useState(window.innerHeight-200);
  const graphStyle = {width:"0" ,height:"0", transition:"none", maxHeight:windowHeight}
  let navigatorR = useNavigate();
  const state = location.state;
  let graphConRef = useRef();
  
  useEffect(()=>{
    console.log(state.result.graph.volumeFlow);
  },[])
  
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
  // const gainGraph = new ChartJS();
  
  useEffect(()=>{
    console.log(chartRef.current)
    if(chartRef.current){
      const chart = chartRef.current.scales.y;
      let maxM;
      //max min
      if(chart.max >= Math.abs(chart.min)){
        maxM = chart.max;
      }else{
        maxM = Math.abs(chart.min);
      }
      console.log(maxM);
      //tick
      let tick;
      const length = chart.ticks.length;
      // console.log(chart.ticks[length-1].value)
      if(chart.ticks[length-1].value >= Math.abs(chart.ticks[0].value)){
        tick = chart.ticks[length-1].value

      }else{
        tick = Math.abs(chart.ticks[0].value)
      }
      
      console.log(maxM,tick)
      setMaxMin(maxM >= tick ? maxM : tick);
      // console.log(graphOption.scales.y);
      if(!graphOption.scales.y.max){
        setGraphOption({
          ...graphOption,
          scales:{
            y:{
              gridLines:{
                zeroLineColor:'rgb(0, 0, 255)',
              },
              axios: 'y',
              tickLength:9,
              start:100,
              min : tick >= maxM ? -tick : undefined,
              max : tick >= maxM ? tick : undefined,
              
              ticks: {
                major: true,
                beginAtZero: true,
                // sampleSize:9,
                border:60,
                stepSize : maxMin < 10.00 ? 1 : maxMin <= 24 ? 2.5 : 3,
                // fontSize : 10,
                textStrokeColor: 10,
                precision: 1,
              },
              grid:{
                tickLength:9,
                color:'#bbdfe4',
              }

            }
          }

        });
      }
        
    

    }
  })


  const [graphOption,setGraphOption]= useState({
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
      duration:1
    },
    maintainAspectRatio: false,
    interaction: false, 
    elements: {
      point: {
        radius: 0,
      },
    },
    afterDraw: function (chart, easing) {
      console.log(chart);
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
          // stepSize : 1.5,
          // sampleSize:9,
          stepSize : 1.0,
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
        tickLength:9,
        start:100,
        
        ticks: {

          major: true,
          beginAtZero: true,
          
          // sampleSize:9,
          border:60,
          stepSize : maxMin < 10.00 ? 1 : maxMin <= 25 ? 2.5 : 3,
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
  })
  useEffect(()=>{
    if(chartRef.current){
      console.log(graphOption.scales)

    }
  },[graphOption])

  useEffect(()=>{
    
    let dataList=[]
    
    state.result.graph.volumeFlow.forEach((item,index)=>{
      dataList.push(item)
      
    })
    let data = {
      labels: '',
      datasets: [{
        label: "",
        data: dataList,
        borderColor: `rgb(5,128,190)`,
        borderWidth: 2.5,
        showLine: true,
        tension: 0.4
      }],
    }
    console.log(data)
    setGraphData(data);
  },[])
  useEffect(()=>{
    let time = setTimeout(() => {
      setTemp(true);
    },1000);
    
  },[graphData])

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
      onSaveAs(canvas.toDataURL('image/jpeg'),`car_result_${YMD}_${time}.jpeg`);
        
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
    <div ref={rootRef} className="gain-page-container">
      <div className="gain-page-nav">
        <div className='gain-page-backBtn' onClick={()=>{navigatorR(-1)}}>
            <FontAwesomeIcon icon={faChevronLeft} style={{color: "#4b75d6",}} />
        </div>
        <p>보정 결과</p>
        <div className='screenShot-btn' onClick={onCapture}><RxImage />Screenshot</div>
      </div>
      <div className='gain-page-left-right-container'>
        <div className={"gain-page-left-container "+grayBg} ref={graphConRef}>
          {temp?<div className="title-y">Flow(l/s)</div>:<></>}
          {temp?<div><Scatter ref={chartRef} style={graphStyle} data={graphData} options={graphOption}/></div>:null}
          {temp?<div className="title-x">Volume(L)</div>:<></>}
        </div>

        <div className="gain-page-right-container">
          <div className='gain-date-container'>
            <p className='gain-title'>Date</p> 
            <p>{state.result.date}</p>
          </div >

          <div className='gain-environment-container'>
            <div className='gain-environment-title'>
              <p className='gain-title'> Environmont</p>
            </div>
            <div className='gain-table-container'>
              <div className='gain-environment-table-Temperature'>
                <p>Temperature</p>
                <p>{state.result.temperature}</p>
              </div>
              <div className='gain-environment-table-Humidity'>
                <p>Humidity</p> 
                <p>{state.result.humidity}</p>
              </div>
              <div className='gain-environment-table-Pressure'>
                <p>Pressure</p> 
                <p>{state.result.pressure}</p>
              </div>
          
            </div>

          </div>

          <div className='gain-gain-container'>
            <div>
              <p className='gain-title'>Gain</p>
            </div>
            <div className='gain-table-container'>
              <div className='gain-table-Inhale'>
                <p>Inhale</p>
                <p>{state.result.gain.inhale}</p>
              </div>
              <div className='gain-table-Exhale'>
                <p>Exhale</p>
                <p>{state.result.gain.exhale}</p>
              </div>


            </div>
            
          </div>

          <div className='gain-calivration-container'>
            <div>
              <p className='gain-title'>Calivration</p>
            </div>

            <div className='gain-calivration-table-container'>
              <div className='gain-calivration-table-column'>
                <p></p>
                <p>Volume(L)</p>
                <p>Error(%)</p>
              </div>
              <div className='gain-calivration-table-Inhale'>
                <p>Inhale</p>
                <p>{state.result.inhale.meas} </p>
                <p>{state.result.inhale.error} </p>
              </div>
              <div className='gain-calivration-table-Exhale'>
                <p>Exhale</p>
                <p>{state.result.exhale.meas} </p>
                <p>{state.result.exhale.error} </p>
              </div>

            </div>
                    
          </div>

        
        </div>
      </div>
      
    </div>
  );
}

export default GainResultPage;