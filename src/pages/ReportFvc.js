import { useState, useRef, useEffect} from 'react';
import axios from 'axios';
// import background from "../../public/FVC_v6_page-0001.jpg";
import { registerables,Chart as ChartJS,RadialLinearScale,LineElement,Tooltip,Legend} from 'chart.js';
import { Scatter } from 'react-chartjs-2';
import annotationPlugin from 'chartjs-plugin-annotation';
import { Routes, Route, Link, useNavigate,useLocation } from 'react-router-dom'
import html2canvas from "html2canvas";
import img from '../img/FVC_v6.svg'

let graphOptionXLastGrid;
let graphOptionYLastGrid;
let graphOption2XLastGrid;
let graphOption2YLastGrid;
let graphOption3XLastGrid;
let graphOption3YLastGrid;

const ReportFvc = (state)=>{
  ChartJS.register(RadialLinearScale, LineElement, Tooltip, Legend, ...registerables,annotationPlugin);
    let navigatorR = useNavigate();
    const location = useLocation();
    const[volumeFlow,setVolumeFlow] = useState([]);
    // const state = location.state;
    const [top,setTop] = useState({
      name : '',
      age : 0,
      gender : '',
      race : '',
      height: 0,
      weight : 0,
      chartNumber : '',
      physician:'',
      measDate:'',
    });
    const [pre,setPre] = useState({
      tf : false
    });
    const [post,setPost] = useState({
      tf : false
    });
//capture
useEffect(()=>{
    if(state.data.fvcSvc !== "Empty resource"){
      let race = 'Other'
      if(state.data.fvcSvc.subject.race === '0'){
        race = 'Neutral'
      }else if(state.data.fvcSvc.subject.race === '1'){
        race = 'Caucasian'
      }else if(state.data.fvcSvc.subject.race === '2'){
        race = 'African american'
      }else if(state.data.fvcSvc.subject.race === '3'){
        race = 'Southeast asian'
      }else if(state.data.fvcSvc.subject.race === '4'){
        race = 'Northeast asian'
      }
      setTop({
        ...top, 
        name : state.data.fvcSvc.subject.name,
        age : state.data.fvcSvc.subject.age,
        gender : state.data.fvcSvc.subject.gender ==='m' ? '남' : '여',
        height: state.data.fvcSvc.subject.height,
        weight : state.data.fvcSvc.subject.weight,
        chartNumber : state.data.fvcSvc.subject.chartNumber,
        race:race,
        physician:state.data.fvcSvc.subject.clinicianName,
        measDate:state.data.date,
      }) 
    }
    

},[])
useEffect(()=>{
  if(top.name !== ''){
    setTimeout(()=>{

      onCapture();
    },1100)
  }
},[top])
  const onCapture = () =>{
    html2canvas(rootRef.current,{scale:4}).then((canvas)=>{
      let now = new Date();
      const month = now.getMonth()+1 < 10 ? "0"+(now.getMonth()+1) : now.getMonth()+1;
      const date = now.getDate() < 10 ? "0"+now.getDate() : now.getDate();
      const YMD = now.getFullYear()+""+month+""+date;
      const hour = now.getHours() < 10 ? "0"+now.getHours() : now.getHours();
      const minutes= now.getMinutes() < 10 ? "0"+now.getMinutes() : now.getMinutes();
      const seconds = now.getSeconds() < 10 ? "0"+now.getSeconds() : now.getSeconds();
      const time = hour+""+minutes+""+seconds;

      onSaveAs(canvas.toDataURL('image/jpeg'),`${state.data.fvcSvc.calibration.serialNumber}_${state.data.fvcSvc.subject.chartNumber}_${YMD}_${time}.jpeg`,);
    });
    
  };
  const onSaveAs = (uri,filename)=>{
    var link = document.createElement('a');
    document.body.appendChild(link);
    link.href = uri;
    link.download = filename;
    link.click();
    document.body.removeChild(link);
    // navigatorR(-1);
  
  };

  //graph
  const chartRef = useRef();
  const [temp, setTemp] = useState(false);
  let colorList = ['#FF5654','#3A7DA9'];
  const graphStyle = {width:"60px" ,height:"60px", transition:"none"}
  const [graphData, setGraphData] = useState({
    labels: ['FVC'],
    datasets: [{
      label: "",
      data: [{x: 0, y: 0}],
      borderColor: 'rgb(255, 38, 38)',
      showLine: true,
      tension: 0.4
    },]
  })

  useEffect(()=>
  {
    let dataset = []

    if(pre.tf){
        dataset.push(
            {
              label: "",
              data: pre.data.graph.volumeFlow,
              borderColor: colorList[0],
              borderWidth: 2.5,
              backgroundColor: 'rgb(0,0,0)',
              showLine: true,
              tension: 0.4
            }
        )
    }
    if(post.tf){
        dataset.push(
            {
              label: "",
              data: post.data.graph.volumeFlow,
              borderColor: colorList[1],
              borderWidth: 2.5,
              backgroundColor: 'rgb(0,0,0)',
              showLine: true,
              tension: 0.4
            }
        )
    }
    
    let data = {
      labels: '',
      datasets: dataset,
    }
    setGraphData(data);
  },[pre,post])

  
  const graphOption={
    responsive: false,
    plugins:{
      legend: {
          display: false,
      },
      title: {
        display: true,
        text: 'Volum(L) - Flow(L/s) graph',
        font: {
          size: 10
        },
      },
      resizeDelay:0,
      datalabels: false,
      annotation: {
        annotations: {
            box1: {
                drawTime: 'beforeDraw',
                type: 'box',
                // yMin: 0.9,//
                // yMax: 1.2,
                backgroundColor: '#fff'
            },
    
        },
      },
    },
    responsive: true,
    // aspectRatio: 0.2,
    animation:{
      duration:0
    },
    layout: {
      padding: {
        // top: 21,
        bottom:22,
        
      },
      borderColor:'black'
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
        // max: parseInt(Math.max(...tvMax)),
        backgroundColor : '#fff',
        suggestedMax:15,
        
        ticks:{
          color:'black',
          autoSkip: false,
          beginAtZero: false,
          stepSize:3,
          fontSize :14,
          font: {
            size: 8,
          },
          callback: function(value, index, ticks) {
            graphOptionXLastGrid = index;
            return value
          },
          
          // max: 12.0,
        },
        grid:{
          color: function(context) {
            if (context.index === 0 || context.index === graphOptionXLastGrid){
              return 'black';
            }
            else{
              return 'rgba(211, 211, 211, 1)';
            }
          },
          lineWidth:2,
          tickWidth:0
        }
      },
      y: {
        gridLines:{
          zeroLineColor:'black',
          
        },
        axios: 'y',
        backgroundColor : '#fff',

        // grace:"8%",
        suggestedMax:12,
        suggestedMin:-6,
        ticks: {
          stepSize:3,
          color:'black',
          major: true,
          beginAtZero: true,
          stepSize : 1,
          font: {
            size: 8,
          },
          callback: function(value, index, ticks) {
            graphOptionYLastGrid = index;
            return value
          },
          textStrokeColor: 10,
          precision: 1,

        },
        grid:{
          color: function(context) {
            if (context.index === 0 || context.index === graphOptionYLastGrid){
              return 'black';
            }
            else{
              return 'rgba(211, 211, 211, 1)';
            }
          },
          lineWidth:2,
          tickWidth:0,
          zeroLineColor:'blue'
        }
      },
    },
  }

  useEffect(()=>{
    setTimeout(() => {
      
      setTemp(true);
    },1000);
    
  },[graphData])

  const [graphData2, setGraphData2] = useState({
    labels: ['FVC'],
    datasets: [{
      label: "",
      data: [{x: 0, y: 0}],
      borderColor: 'rgb(255, 38, 38)',
      showLine: true,
      tension: 0.4
    },]
  })
  const [allTimeVolumeList, setAllTimeVolumeList] = useState([]);
  const[timeVolume,setTimeVolume] = useState([]);
  const [tvMax, setTvMax] = useState([10]);
  let trials;
  useEffect(()=>{
    //fvc의 심플카드
    trials = state.data.fvcSvc.trials;
    let timeVolumeList = [];
    let volumeFlowList = [];
    let timeVolumeMaxList = [];
    let timeVolumeMaxListX = [];

    if(trials){
      let temp = new Array(trials.length).fill(0);

      // 매 결과에서 데이터 추출
      
      trials.forEach((item)=>{
        if(item.best === true){
          timeVolumeList.push(item.graph.timeVolume);

          //현 timeVolume에서 최대값 찾기
          timeVolumeMaxList.push(item.results[3].meas);
          timeVolumeMaxListX.push(item.graph.timeVolume[item.graph.timeVolume.length-1].x); //최대 x값 찾기
        }

      })

      timeVolumeMaxListX.sort((a,b)=>a-b);
      timeVolumeMaxList.forEach((item, idx)=>{
        timeVolumeList[idx].push({x : Math.max(Math.ceil(timeVolumeMaxListX[timeVolumeMaxListX.length-1]), 3), y: timeVolumeList[idx][timeVolumeList[idx].length-1].y})
      })
      setVolumeFlow(volumeFlowList);
      setTimeVolume(timeVolumeList);
      setAllTimeVolumeList(timeVolumeList);
      setTvMax(timeVolumeMaxList);
      graphOption.scales.x.max = parseInt(Math.max(...timeVolumeMaxList));
    }
  },[])
  useEffect(()=>
  {
    let dataset = []
    if(pre.tf){
      dataset.push(
          {
            label: "",
            data: pre.data.graph.timeVolume,
            borderColor: colorList[0],
            borderWidth: 2.5,
            backgroundColor: 'rgb(0,0,0)',
            showLine: true,
            tension: 0.4
          }
      )
  }
  if(post.tf){
      dataset.push(
          {
            label: "",
            data: post.data.graph.timeVolume,
            borderColor: colorList[1],
            borderWidth: 2.5,
            backgroundColor: 'rgb(0,0,0)',
            showLine: true,
            tension: 0.4
          }
      )
  }
    let data = {
      labels: "",
      datasets: dataset,
    }
    setGraphData2(data);
  },[timeVolume])

  const [graphOption2, setGraphOption2]=useState({

    plugins:{
      afterDraw: function (chart, easing) {
      },
      legend: {
          display: false
      },title: {
        display: true,
        text: 'Time(s) - Volume(L) graph',
        font: {
          size: 10
        },
      },
      resizeDelay:0,
      datalabels: false,
      annotation: {
        annotations: {
            box1: {
                drawTime: 'beforeDraw',
                type: 'box',
               
                backgroundColor: '#fff'
            }
        },
      }
    },
    afterDraw: function (chart, easing) {
      console.log(chart);
    },
    
    responsive: true,
    layout: {
      padding:{
        bottom:22
      }
    },
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
        backgroundColor : '#fff',

        min: 0,
        // suggestedMax: 6,
        ticks:{
          color:'black',
          font: {
            size: 8,
          },
          callback: function(value, index, ticks) {
            graphOption2XLastGrid = index;
            return value
          },
          stepSize : 1,
          beginAtZero: false,
          max: 12.0,
          autoSkip: false,
        },
        grid:{
          color: function(context) {
            if (context.index === 0 || context.index === graphOption2XLastGrid){
              return 'black';
            }
            else{
              return 'rgba(211, 211, 211, 1)';
            }
          },
          lineWidth:2,
          tickWidth:0
        }
      },
      y: {
        gridLines:{
          zeroLineColor:'rgba(0, 0, 255, 1)',
        },
        axios: 'y',
        // max: 3,
        min: 0,
        backgroundColor : '#fff',

        suggestedMax:9,
        // suggestedMin:-6,
        ticks: {
          color:'black',
          font: {
            size: 8,
          },
          callback: function(value, index, ticks) {
            graphOption2YLastGrid = index;
            return value
          },
          major: true,
          beginAtZero: true,
          stepSize : 1,
          fontSize : 10,
          textStrokeColor: 10,
          precision: 1,
        },
        grid:{
          color: function(context) {
            if (context.index === 0 || context.index === graphOption2YLastGrid){
              return 'black';
            }
            else{
              return 'rgba(211, 211, 211, 1)';
            }
          },
          lineWidth:2,
          tickWidth:0
        }
      },
    },
  })
  const graphOption3={
    responsive: false,
    plugins:{
      legend: {
          display: false,
          
      },annotation: {
        annotations: {
            box1: {
                drawTime: 'beforeDraw',
                type: 'box',

                backgroundColor: '#fff'
            }
        },
      },
      resizeDelay:0,
      datalabels: false,
    },
    responsive: true,
    animation:{
      duration:0
    },
    layout: {
      padding: {
        top: 17,
        right : 30,
        bottom:10
      }
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
        suggestedMax:15,


        ticks:{
          stepSize:3,
          color:'black',
          font: {
            size: 8,
          },
          callback: function(value, index, ticks) {
            graphOption3XLastGrid = index;
            return value
          },
          autoSkip: false,
          beginAtZero: false,
        },
        grid:{
          color: function(context) {
            if (context.index === 0 || context.index === graphOption3XLastGrid){
              return 'black';
            }
            else{
              return 'rgba(211, 211, 211, 1)';
            }
          },
          lineWidth:2,
          tickWidth:0
        }
      },
      y: {
        gridLines:{
          zeroLineColor:'#000000',
        },
        axios: 'y',
        // min: -9,
        // grace:"8%",
        suggestedMax:12,
        suggestedMin:-6,
        ticks: {
          color:'black',
          font: {
            size: 8,
          },
          callback: function(value, index, ticks) {
            graphOption3YLastGrid = index;
            return value
          },
          major: true,
          beginAtZero: true,
          stepSize : 1,
          fontSize : 3,
          textStrokeColor: 10,
          precision: 1,
        },
        grid:{
          color: function(context) {
            if (context.index === 0 || context.index === graphOption3YLastGrid){
              return 'black';
            }
            else{
              return 'rgba(211, 211, 211, 1)';
            }
          },
          // zeroLineColor:'black',
          // color:'rgba(211, 211, 211, 1)',

          lineWidth:2,
          tickWidth:0
        }
      },
    },
  }



  const fourthRendering = () => {
    const result = [];

    for (let i = 0; i < 8; i++) {
      if(i < state.data.fvcSvc.trials.length){
        result.push(
          <div className='column-line' >
            <div></div>
            <div className='value'>{state.data.fvcSvc.trials[i].results[0].meas !== '' ? state.data.fvcSvc.trials[i].results[0].meas :'-'}</div>
            <div className='value'>{state.data.fvcSvc.trials[i].results[1].meas !== '' ? state.data.fvcSvc.trials[i].results[1].meas :'-'}</div>
            <div className='value'>{state.data.fvcSvc.trials[i].results[2].meas !== '' ? state.data.fvcSvc.trials[i].results[2].meas :'-'}</div>
            <div className='value'>{state.data.fvcSvc.trials[i].results[17].meas !== '' ? state.data.fvcSvc.trials[i].results[17].meas :'-'}</div>
            <div className='value'>{state.data.fvcSvc.trials[i].results[3].meas !== '' ? state.data.fvcSvc.trials[i].results[3].meas :'-'}</div>
            <div className='value'>{state.data.fvcSvc.trials[i].results[13].meas !== '' ? state.data.fvcSvc.trials[i].results[13].meas :'-'}</div>
            <div className='value'>{state.data.fvcSvc.trials[i].results[6].meas !== '' ? state.data.fvcSvc.trials[i].results[6].meas :'-'}</div>
            <div className='value'>{state.data.fvcSvc.trials[i].results[22].meas !== '' ? state.data.fvcSvc.trials[i].results[22].meas :'-'}</div>
            <div className='value'>{state.data.fvcSvc.trials[i].results[4].meas !== '' ? state.data.fvcSvc.trials[i].results[4].meas :'-'}</div>
            <div className='value'>{state.data.fvcSvc.trials[i].results[5].meas !== '' ? state.data.fvcSvc.trials[i].results[5].meas :'-'}</div>
            <div className='value'>{state.data.fvcSvc.trials[i].errorCode !== '' ? state.data.fvcSvc.trials[i].errorCode :'-'}</div>
          </div>
        );
      }else{
        result.push(
          <div className='column-line'>
            <div></div>
            <div className='value'>-</div>
            <div className='value'>-</div>
            <div className='value'>-</div>
            <div className='value'>-</div>
            <div className='value'>-</div>
            <div className='value'>-</div>
            <div className='value'>-</div>
            <div className='value'>-</div>
            <div className='value'>-</div>
            <div className='value'>-</div>
            <div className='value'>-</div>
          </div>
        );
      }
      
    }
    return result;
  };

  const rootRef = useRef(null);


  const fifthRendering = () => {
    const result = [];

    for (let i = 0; i < 8; i++) {
      if(i < state.data.fvcSvc.trials.length){
        result.push(
          <div className='column-line'>
            <div className='pre-tirial-container'>
              <div className='pre-tirial'>Pre Tirial {i+1}</div>
            </div>
            {temp?<Scatter style={graphStyle} ref={chartRef}  data={graphData3(i)} options={graphOption3}/>:<p className='loadingBG'>화면 조정 중..</p>}
          </div>
        );
      }else{
        result.push(
          <div className='column-line'>
            <div className='pre-tirial-container'>
              <div className='pre-tirial'>Pre Tirial {i+1}</div>
            </div>
            {temp?<Scatter style={graphStyle} ref={chartRef}  data={graphData3(9)} options={graphOption3}/>:<p className='loadingBG'>화면 조정 중..</p>}
          </div>
        );
      }
      
    }
    return result;
  };
  
  const graphData3 = (i) =>{

    let dataset = []

    dataset.push(
      {
        label: "",
        data: i != 9 ? state.data.fvcSvc.trials[i].graph.volumeFlow : [{x:0,y:0}],
        borderColor: colorList[0],
        borderWidth: 2.5,
        backgroundColor: colorList[0],
        showLine: true,
        tension: 0.4
      }
    )
    let data = {
      labels: '',
      datasets: dataset,
    }
    return data;
  }
  useEffect(()=>{
    let pr = false;
    let po = false;
    state.data.fvcSvc.trials.forEach((item) => {

        if(item.best === true){
            if(item.bronchodilator === 'pre' && !pr){
                pr = true;
                setPre({...pre, tf : true, data :item})
            }else if(item.bronchodilator === 'post' && !po){
                po = true
                setPost({...post, tf : true, data :item});
            }
        }     
    });
    
  },[])

  const res = () =>{
    const result = [];
    if(state.data.fvcSvc.diagnosis.condition === 'NORMAL'){
      result.push(
        <div>
          폐기능 소견상 정상입니다. 항상 호흡기 건강에 유의하시고 자주 검사를 받으시어 지금 상태를 유지하세요.
        </div>
      );
    }else if(state.data.fvcSvc.diagnosis.condition === 'NORMAL_OBSTRUCTIVE'){
      result.push(
        <div>
          수검자님은 소기도폐쇄가 의심됩니다. 흡연, 간접흡연, 미세먼지등을 피하시고 만성폐쇄성폐질환(천식, 폐기종, 만성기관지염)으로 진행될 가능성이 높으니 폐기능 검사를 자주 받으시고 항상 호흡기 건강에 유의 하시길 바랍니다.
        </div>
      )
    }else if(state.data.fvcSvc.diagnosis.condition === 'RESTRICTED'){
      result.push(
        <div>
          제한성 환기 장애가 의심됩니다. 제한성 환기장애는 진폐증,폐렴,폐암 등이 있습니다. 진료 의사와 상담하시어 적절히 관리 받으시길 바랍니다.
        </div>
      )
    }else if(state.data.fvcSvc.diagnosis.condition === 'OBSTRUCTIVE_MILD'){
      result.push(
        <div>
          폐쇄성 환기장애 경증이 의심됩니다. 폐쇄성 환기장애에는 천식, 폐기종, 만성 기관지염등이 있습니다. 진료 의사와 상담하시어 적절히 관리받으시길 바랍니다.
        </div>
      )
    }else if(state.data.fvcSvc.diagnosis.condition === 'OBSTRUCTIVE_ABNORMAL'){
      result.push(
        <div>
          폐쇄성 환기장애 중등도 정도로 의심됩니다. 폐쇄성 환기장애에는 천식, 폐기종, 만성 기관지염등이 있습니다. 진료 의사와 상담하시어 적절히 관리받으시길 바랍니다.
        </div>
      )
    }else if(state.data.fvcSvc.diagnosis.condition === 'OBSTRUCTIVE_MODERATE'){
      result.push(
        <div>
          폐쇄성 환기장애 중등 중증으로 의심됩니다. 폐쇄성 환기장애에는 천식, 폐기종, 만성 기관지염등이 있습니다. 진료 의사와 상담하시어 적절히 관리받으시길 바랍니다.
        </div>
      )
    }
    else if(state.data.fvcSvc.diagnosis.condition === 'OBSTRUCTIVE_SEVERE'){
      result.push(
        <div>
          폐쇄성 환기장애 중증으로 의심됩니다. 폐쇄성 환기장애에는 천식, 폐기종, 만성 기관지염등이 있습니다. 진료 의사와 상담하시어 적절히 관리받으시길 바랍니다.
        </div>
      )
    }else if(state.data.fvcSvc.diagnosis.condition === 'OBSTRUCTIVE_VERY_SEVERE'){
      result.push(
        <div>
          폐쇄성 환기장애 매우 중증으로 의심됩니다. 폐쇄성 환기장애에는 천식, 폐기종, 만성 기관지염등이 있습니다. 진료 의사와 상담하시어 적절히 관리받으시길 바랍니다.
        </div>
      )
    }else if(state.data.fvcSvc.diagnosis.condition === 'MIXED'){
      result.push(
        <div>
          혼합성 폐질환이 의심됩니다. 의료진에게 상세 진단을 받아 보시길 바랍니다.
        </div>
      )
    }else if(state.data.fvcSvc.diagnosis.condition === 'ASTHMA'){
      result.push(
        <div>
          기관지 확장제 양성으로 폐쇄성 폐질환이 의심됩니다. 이에 전문의와 상담 해주시길 바랍니다.
        </div>
      )
    }else{
      result.push(
        <div>
          -
        </div>
      )
    }
    return result;
  }

  return(
    <>
    <div onClick={()=>{navigatorR(-1)}}>빠꾸</div>
      {/* <div onClick={onCapture}>스크린샷</div> */}
      <div className='report'>
        <div ref={rootRef} className='report-container' style={{ 
        // backgroundImage: `url(http://localhost:3000/img/FVC_v6.png)` ,
        backgroundImage: `url(${img})` ,
        backgroundSize: 'cover',
			  backgroundRepeat: 'no-repeat',
        backgroundPosition:'top center',
      }}>
          <div className='report-title-container'>
            <div className='report-title-container-right'></div>
            <div className='report-title-container-center'>
              <div></div>
              <div>[{state.data.fvcSvc.clinic.name}]</div>
            </div>
            <div className='report-title-container-left'>
              <div></div>
              <div></div>
            </div>
          </div>
          <div className='top-chart'>
            <div className='row-line'>
              <div></div>
              <div className='value'>{top.name !== '' ? top.name : '-'}</div>
              <div></div>
              <div className='value'>{top.race !== '' ? top.race : '-'}</div>
              <div></div>
              <div className='value'>{top.chartNumber !== '' ? top.chartNumber : '-'}</div>
            </div>
            <div className='row-line'>
              <div></div>
              <div className='value'>{top.age !== '' ? top.age : '-'}</div>
              <div></div>
              <div className='value'>{top.height !== '' ? top.height : '-'}</div>
              <div ></div>
              <div className='value'>{top.physician !== '' ? top.physician : '-'}</div>
            </div>
            <div className='row-line'>
              <div></div>
              <div className='value'>{top.gender !== '' ? top.gender : '-'}</div>
              <div></div>
              <div className='value'>{top.weight !== '' ? top.weight : '-'}</div>
              <div></div>
              <div className='value'>{top.measDate !== '' ? top.measDate : '-'}</div>
            </div>
          </div>
          <div className='serial-num'>
            <div>SpiroKit Serial Number :</div>
            <div>{state.data.fvcSvc.calibration.serialNumber !== '' ? state.data.fvcSvc.calibration.serialNumber : '-'}</div>
          </div>
          <div className='second-chart'>
            <div className='row-line'>
              <div></div>
              <div className='value'>{state.data.fvcSvc.calibration.temperature !== '' ? state.data.fvcSvc.calibration.temperature : '-'}</div>
              <div></div>
              <div className='value'>{state.data.fvcSvc.calibration.humidity !== '' ? state.data.fvcSvc.calibration.humidity : '-'}</div>
              <div></div>
              <div className='value'>{state.data.fvcSvc.calibration.pressure !== '' ? state.data.fvcSvc.calibration.pressure : '-'}</div>
            </div>
            <div className='row-line'>
              <div></div>
              <div className='value'>{state.data.fvcSvc.calibration.date !== '' ? state.data.fvcSvc.calibration.date : '-'}</div>
              <div></div>
              <div className='value'>{state.data.fvcSvc.calibration.gain.inhale !== '' ? state.data.fvcSvc.calibration.gain.inhale : '-'}</div>
              <div ></div>
              <div className='value'>{state.data.fvcSvc.calibration.gain.exhale !== '' ? state.data.fvcSvc.calibration.gain.exhale : '-'}</div>
            </div>
          </div>

          <div></div>
          <div className='third-chart'>
            <div className='third-chart-left'>
              <div className='row-line'>
                <div></div>
                <div></div>
                <div></div>
                <div></div>
                <div></div>
                <div></div>
                <div></div>
              </div>
              <div className='row-line'>
                <div></div>
                <div></div>
                <div className='value'>{pre.tf ? pre.data.results[0].meas !== '' ? pre.data.results[0].meas :'-' :'-'}</div>
                <div className='value'>{pre.tf ? pre.data.results[0].pred !== '' ? pre.data.results[0].pred :'-' :'-'}</div>
                <div className='value'>{pre.tf ? pre.data.results[0].per !== '' ? pre.data.results[0].per :'-' :'-'}</div>
                <div className='value'>{pre.tf ? pre.data.results[0].post !== '' ? pre.data.results[0].post :'-' :'-'}</div>
                <div className='value'>{pre.tf ? pre.data.results[0].chg !== '' ? pre.data.results[0].chg :'-' :'-'}</div>
              </div>
              <div className='row-line'>
                <div></div>
                <div></div>
                <div className='value'>{pre.tf ? pre.data.results[1].meas !== '' ? pre.data.results[1].meas :'-' :'-'}</div>
                <div className='value'>{pre.tf ? pre.data.results[1].pred !== '' ? pre.data.results[1].pred :'-' :'-'}</div>
                <div className='value'>{pre.tf ? pre.data.results[1].per !== '' ? pre.data.results[1].per :'-' :'-'}</div>
                <div className='value'>{pre.tf ? pre.data.results[1].post !== '' ? pre.data.results[1].post :'-' :'-'}</div>
                <div className='value'>{pre.tf ? pre.data.results[1].chg !== '' ? pre.data.results[1].chg :'-' :'-'}</div>
              </div>
              <div className='row-line'>
                <div></div>
                <div></div>
                <div className='value'>{pre.tf ? pre.data.results[2].meas !== '' ? pre.data.results[2].meas :'-' :'-'}</div>
                <div className='value'>{pre.tf ? pre.data.results[2].pred !== '' ? pre.data.results[2].pred :'-' :'-'}</div>
                <div className='value'>{pre.tf ? pre.data.results[2].per !== '' ? pre.data.results[2].per :'-' :'-'}</div>
                <div className='value'>{pre.tf ? pre.data.results[2].post !== '' ? pre.data.results[2].post :'-' :'-'}</div>
                <div className='value'>{pre.tf ? pre.data.results[2].chg !== '' ? pre.data.results[2].chg :'-' :'-'}</div>
              </div>
              <div className='row-line'>
                <div></div>
                <div></div>
                <div className='value'>{pre.tf ? pre.data.results[17].meas !== '' ? pre.data.results[17].meas :'-' :'-'}</div>
                <div className='value'>{pre.tf ? pre.data.results[17].pred !== '' ? pre.data.results[17].pred :'-' :'-'}</div>
                <div className='value'>{pre.tf ? pre.data.results[17].per !== '' ? pre.data.results[17].per :'-' :'-'}</div>
                <div className='value'>{pre.tf ? pre.data.results[17].post !== '' ? pre.data.results[17].post :'-' :'-'}</div>
                <div className='value'>{pre.tf ? pre.data.results[17].chg !== '' ? pre.data.results[17].chg :'-' :'-'}</div>
              </div>
              <div className='row-line'>
                <div></div>
                <div></div>
                <div className='value'>{pre.tf ? pre.data.results[3].meas !== '' ? pre.data.results[3].meas :'-' :'-'}</div>
                <div className='value'>{pre.tf ? pre.data.results[3].pred !== '' ? pre.data.results[3].pred :'-' :'-'}</div>
                <div className='value'>{pre.tf ? pre.data.results[3].per !== '' ? pre.data.results[3].per :'-' :'-'}</div>
                <div className='value'>{pre.tf ? pre.data.results[3].post !== '' ? pre.data.results[3].post :'-' :'-'}</div>
                <div className='value'>{pre.tf ? pre.data.results[3].chg !== '' ? pre.data.results[3].chg :'-' :'-'}</div>
              </div>
              <div className='row-line'>
                <div></div>
                <div></div>
                <div className='value'>{pre.tf ? pre.data.results[13].meas !== '' ? pre.data.results[13].meas :'-' :'-'}</div>
                <div className='value'>{pre.tf ? pre.data.results[13].pred !== '' ? pre.data.results[13].pred :'-' :'-'}</div>
                <div className='value'>{pre.tf ? pre.data.results[13].per !== '' ? pre.data.results[13].per :'-' :'-'}</div>
                <div className='value'>{pre.tf ? pre.data.results[13].post !== '' ? pre.data.results[13].post :'-' :'-'}</div>
                <div className='value'>{pre.tf ? pre.data.results[13].chg !== '' ? pre.data.results[13].chg :'-' :'-'}</div>
              </div>
              <div className='row-line'>
                <div></div>
                <div></div>
                <div className='value'>{pre.tf ? pre.data.results[6].meas !== '' ? pre.data.results[6].meas :'-' :'-'}</div>
                <div className='value'>{pre.tf ? pre.data.results[6].pred !== '' ? pre.data.results[6].pred :'-' :'-'}</div>
                <div className='value'>{pre.tf ? pre.data.results[6].per !== '' ? pre.data.results[6].per :'-' :'-'}</div>
                <div className='value'>{pre.tf ? pre.data.results[6].post !== '' ? pre.data.results[6].post :'-' :'-'}</div>
                <div className='value'>{pre.tf ? pre.data.results[6].chg !== '' ? pre.data.results[6].chg :'-' :'-'}</div>
              </div>
              <div className='row-line'>
                <div></div>
                <div></div>
                <div className='value'>{pre.tf ? pre.data.results[22].meas !== '' ? pre.data.results[22].meas :'-' :'-'}</div>
                <div className='value'>{pre.tf ? pre.data.results[22].pred !== '' ? pre.data.results[22].pred :'-' :'-'}</div>
                <div className='value'>{pre.tf ? pre.data.results[22].per !== '' ? pre.data.results[22].per :'-' :'-'}</div>
                <div className='value'>{pre.tf ? pre.data.results[22].post !== '' ? pre.data.results[22].post :'-' :'-'}</div>
                <div className='value'>{pre.tf ? pre.data.results[22].chg !== '' ? pre.data.results[22].chg :'-' :'-'}</div>
              </div>
              <div className='row-line'>
                <div></div>
                <div></div>
                <div className='value'>{pre.tf ? pre.data.results[4].meas !== '' ? pre.data.results[4].meas :'-' :'-'}</div>
                <div className='value'>{pre.tf ? pre.data.results[4].pred !== '' ? pre.data.results[4].pred :'-' :'-'}</div>
                <div className='value'>{pre.tf ? pre.data.results[4].per !== '' ? pre.data.results[4].per :'-' :'-'}</div>
                <div className='value'>{pre.tf ? pre.data.results[4].post !== '' ? pre.data.results[4].post :'-' :'-'}</div>
                <div className='value'>{pre.tf ? pre.data.results[4].chg !== '' ? pre.data.results[4].chg :'-' :'-'}</div>
              </div>
              <div className='row-line'>
                <div></div>
                <div></div>
                <div className='value'>{pre.tf ? pre.data.results[5].meas !== '' ? pre.data.results[5].meas :'-' :'-'}</div>
                <div className='value'>{pre.tf ? pre.data.results[5].pred !== '' ? pre.data.results[5].pred :'-' :'-'}</div>
                <div className='value'>{pre.tf ? pre.data.results[5].per !== '' ? pre.data.results[5].per :'-' :'-'}</div>
                <div className='value'>{pre.tf ? pre.data.results[5].post !== '' ? pre.data.results[5].post :'-' :'-'}</div>
                <div className='value'>{pre.tf ? pre.data.results[5].chg !== '' ? pre.data.results[5].chg :'-' :'-'}</div>
              </div>
            </div>
            
            <div className='third-chart-right'>
              <div className='volum-flow'>
                {temp?<Scatter style={graphStyle} ref={chartRef}  data={graphData} options={graphOption}/>:<p className='loadingBG'>화면 조정 중..</p>}
              </div>
              <div className='time-volum'>
                {temp?<Scatter style={graphStyle} ref={chartRef}  data={graphData2} options={graphOption2}/>:<p className='loadingBG'>화면 조정 중..</p>}
              </div>
            </div>
          </div>

          <div></div>
          <div className='fourth-chart'>
            <div className='column-line'>

            </div>
            <div className='column-line'>

            </div>
            {fourthRendering()}

          </div>
          <div className='fifth-chart'>


            {fifthRendering()}
          </div>
          <div></div>
          <div className='sixth-chart'>
            <div>FVL Error Code {state.data.fvcSvc.diagnosis.errorCode !=='' ?state.data.fvcSvc.diagnosis.errorCode :'-' } </div>
            <div> Grade {state.data.fvcSvc.diagnosis.suitability !== '' ?state.data.fvcSvc.diagnosis.suitability :'-' }</div>
          </div>
          <div className='report-result-container'>
            {res()}
          </div>
        </div>
      </div>
    </>
  )
}
export default ReportFvc;
