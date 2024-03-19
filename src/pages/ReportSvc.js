import { useState, useRef, useEffect} from 'react';
import axios from 'axios';
// import background from "../../public/FVC_v6_page-0001.jpg";
import { registerables,Chart as ChartJS,RadialLinearScale,LineElement,Tooltip,Legend} from 'chart.js';
import { Scatter } from 'react-chartjs-2';
import annotationPlugin from 'chartjs-plugin-annotation';
import { Routes, Route, Link, useNavigate,useLocation } from 'react-router-dom'
import html2canvas from "html2canvas";
import img from '../img/SVC_v5.svg'

let graphOptionXLastGrid;
let graphOptionYLastGrid;
let yMax = 1;


const ReportSvc = (state)=>{
  ChartJS.register(RadialLinearScale, LineElement, Tooltip, Legend, ...registerables,annotationPlugin);

    let navigatorR = useNavigate();
    const location = useLocation();
    const[volumeFlow,setVolumeFlow] = useState([]);
    const [max,setMax] = useState(1);
    // const state = location.state;
    console.log(state)

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
    },1200)
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
      yMax = undefined;
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
  const graphStyle = {width:"60px" ,height:"60px", transition:"none",}
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
    console.log(pre)
    console.log(post)
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
        console.log("post")
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
      labels: '',
      datasets: dataset,
    }
    console.log(data)
    setGraphData(data);
  },[pre,post])

  

  const graphOption={
    responsive: false,
    plugins:{
      legend: {
          display: false,
          
      },title: {
        display: true,
        text: 'Time(s) - Volume(L) graph',
        font: {
          size: 10
        },
      },
      resizeDelay:0,
      datalabels: false,
    },
    responsive: true,
    // aspectRatio: 0.2,
    animation:{
      duration:0
    },
    layout: {
      padding: {
        // top: 42,
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
        // min: 0,
        // max: parseInt(Math.max(...tvMax)),
        suggestedMax:60.5,
        ticks:{
          color:'black',
          autoSkip: false,
          beginAtZero: false,
          stepSize:5.5,
          font: {
            size: 8,
          },
          callback: (value, index, ticks) =>{
            console.log(index);
            graphOptionXLastGrid = index;
            return value
          },
        },
        grid:{
          // color: 'rgba(211, 211, 211, 1)',
          lineWidth:2,
          tickWidth:0,
          color: function(context) {
            console.log(context);
            if (context.index === 0 || context.index === graphOptionXLastGrid){
              return 'black';
            }
            else{
              return 'rgba(211, 211, 211, 1)';
            }
          },
        }
      },
      y: {
        gridLines:{
          zeroLineColor:'#000000',
        },
        axios: 'y',
        // min: -9,
        
        ticks: {
          color:'black',
          major: true,
          beginAtZero: true,
          stepSize : 0.5,
          font: {
            size: 8,
          },
          callback: (value, index, ticks) =>{
            console.log(value)

          if(yMax === undefined || Math.abs(value) > yMax){
            yMax = Math.abs(value);
          }
          setMax(yMax);
          graphOptionYLastGrid = index;
          return value
          },
          precision: 1,

        },
        suggestedMax: max,
        suggestedMin: max*-1,
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
          tickWidth:0
        },

      },
    },
  }
  useEffect(()=>{
    console.log(chartRef)
    setTimeout(() => {
      
      setTemp(true);
    },1000);
    
  },[graphData])

  



  const fourthRendering = () => {
    const result = [];
    console.log(state.data.fvcSvc.trials[0].results[0].meas)
    console.log(state.data.fvcSvc.trials.length)

    for (let i = 0; i < 8; i++) {
      
      if(i < state.data.fvcSvc.trials.length){
        
        result.push(
          <div className='column-line' >
            <div></div>
            <div className='value'>{state.data.fvcSvc.trials[i].results[0].meas !== '' ? state.data.fvcSvc.trials[i].results[0].meas :'-'}</div>
            <div className='value'>{state.data.fvcSvc.trials[i].results[1].meas !== '' ? state.data.fvcSvc.trials[i].results[1].meas :'-'}</div>
            <div className='value'>{state.data.fvcSvc.trials[i].results[2].meas !== '' ? state.data.fvcSvc.trials[i].results[2].meas :'-'}</div>
            <div className='value'>{state.data.fvcSvc.trials[i].results[3].meas !== '' ? state.data.fvcSvc.trials[i].results[3].meas :'-'}</div>
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
          </div>
        );
      }
      
    }
    return result;
  };

  const rootRef = useRef(null);


  useEffect(()=>{
    let pr = false;
    let po = false;
    state.data.fvcSvc.trials.forEach((item) => {

        if(item.best === true){
        console.log(item)
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
              <div className='value'>{top.name !== '' ? state.data.fvcSvc.calibration.temperature !== '' ? state.data.fvcSvc.calibration.temperature : '-' : '-' }</div>
              <div></div>
              <div className='value'>{top.name !== '' ? state.data.fvcSvc.calibration.humidity !== ''? state.data.fvcSvc.calibration.humidity : '-' : '-'}</div>
              <div></div>
              <div className='value'>{top.name !== '' ? state.data.fvcSvc.calibration.pressure !== ''? state.data.fvcSvc.calibration.pressure : '-' : '-'}</div>
            </div>
            <div className='row-line'>
              <div></div>
              <div className='value'>{top.name !== '' ? state.data.fvcSvc.calibration.date !== ''? state.data.fvcSvc.calibration.date : '-' : '-'}</div>
              <div></div>
              <div className='value'>{top.name !== '' ? state.data.fvcSvc.calibration.gain.inhale !== ''? state.data.fvcSvc.calibration.gain.inhale : '-' : '-'}</div>
              <div ></div>
              <div className='value'>{top.name !== '' ? state.data.fvcSvc.calibration.gain.exhale !== ''? state.data.fvcSvc.calibration.gain.exhale : '-' : '-'}</div>
            </div>
          </div>

          <div></div>
          <div className='third-chart'>
            <div className='third-chart-left-svc'>
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
                <div className='value'>{pre.tf ? pre.data.results[0].meas !== '' ? pre.data.results[0].meas :'-' : '-'}</div>
                <div className='value'>{pre.tf ? pre.data.results[0].pred !== '' ? pre.data.results[0].pred :'-': '-'}</div>
                <div className='value'>{pre.tf ? pre.data.results[0].per !== '' ? pre.data.results[0].per :'-': '-'}</div>
                <div className='value'>{pre.tf ? pre.data.results[0].post !== '' ? pre.data.results[0].post :'-': '-'}</div>
                <div className='value'>{pre.tf ? pre.data.results[0].chg !== '' ? pre.data.results[0].chg :'-': '-'}</div>
              </div>
              <div className='row-line'>
                <div></div>
                <div></div>
                <div className='value'>{pre.tf ? pre.data.results[1].meas !== '' ? pre.data.results[1].meas :'-' : '-'}</div>
                <div className='value'>{pre.tf ? pre.data.results[1].pred !== '' ? pre.data.results[1].pred :'-': '-'}</div>
                <div className='value'>{pre.tf ? pre.data.results[1].per !== '' ? pre.data.results[1].per :'-': '-'}</div>
                <div className='value'>{pre.tf ? pre.data.results[1].post !== '' ? pre.data.results[1].post :'-': '-'}</div>
                <div className='value'>{pre.tf ? pre.data.results[1].chg !== '' ? pre.data.results[1].chg :'-': '-'}</div>
              </div>
              <div className='row-line'>
                <div></div>
                <div></div>
                <div className='value'>{pre.tf ? pre.data.results[2].meas !== '' ? pre.data.results[2].meas :'-' : '-'}</div>
                <div className='value'>{pre.tf ? pre.data.results[2].pred !== '' ? pre.data.results[2].pred :'-': '-'}</div>
                <div className='value'>{pre.tf ? pre.data.results[2].per !== '' ? pre.data.results[2].per :'-': '-'}</div>
                <div className='value'>{pre.tf ? pre.data.results[2].post !== '' ? pre.data.results[2].post :'-': '-'}</div>
                <div className='value'>{pre.tf ? pre.data.results[2].chg !== '' ? pre.data.results[2].chg :'-': '-'}</div>
              </div>
              <div className='row-line'>
                <div></div>
                <div></div>
                <div className='value'>{pre.tf ? pre.data.results[3].meas !== '' ? pre.data.results[3].meas :'-' : '-'}</div>
                <div className='value'>{pre.tf ? pre.data.results[3].pred !== '' ? pre.data.results[3].pred :'-': '-'}</div>
                <div className='value'>{pre.tf ? pre.data.results[3].per !== '' ? pre.data.results[3].per :'-': '-'}</div>
                <div className='value'>{pre.tf ? pre.data.results[3].post !== '' ? pre.data.results[3].post :'-': '-'}</div>
                <div className='value'>{pre.tf ? pre.data.results[3].chg !== '' ? pre.data.results[3].chg :'-': '-'}</div>
              </div>
              <div className='row-line'>
                <div></div>
                <div></div>
                <div className='value'></div>
                <div className='value'></div>
                <div className='value'></div>
                <div className='value'></div>
                <div className='value'></div>
              </div>
              <div className='row-line'>
                <div></div>
                <div></div>
                <div className='value'></div>
                <div className='value'></div>
                <div className='value'></div>
                <div className='value'></div>
                <div className='value'></div>
              </div>
              <div className='row-line'>
                <div></div>
                <div></div>
                <div className='value'></div>
                <div className='value'></div>
                <div className='value'></div>
                <div className='value'></div>
                <div className='value'></div>
              </div>
              <div className='row-line'>
                <div></div>
                <div></div>
                <div className='value'></div>
                <div className='value'></div>
                <div className='value'></div>
                <div className='value'></div>
                <div className='value'></div>
              </div>
              <div className='row-line'>
                <div></div>
                <div></div>
                <div className='value'></div>
                <div className='value'></div>
                <div className='value'></div>
                <div className='value'></div>
                <div className='value'></div>
              </div>
              <div className='row-line'>
                <div></div>
                <div></div>
                <div className='value'></div>
                <div className='value'></div>
                <div className='value'></div>
                <div className='value'></div>
                <div className='value'></div>
              </div>
            </div>
            
            <div className='third-chart-right-svc'>
              <div className='volum-flow'>
                {temp?<Scatter style={graphStyle} ref={chartRef}  data={graphData} options={graphOption}/>:<p className='loadingBG'>화면 조정 중..</p>}
              </div>

            </div>
          </div>
          <div></div>
          <div className='fourth-chart-svc'>
            <div className='column-line'>

            </div>
            <div className='column-line'>

            </div>
            {fourthRendering()}

          </div>
          
        </div>
      </div>
    </>
  )
}
export default ReportSvc;
