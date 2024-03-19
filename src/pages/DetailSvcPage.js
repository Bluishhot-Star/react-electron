import { useEffect, useState, useRef} from "react";
import axios from "axios";
import { useLocation,useNavigate } from 'react-router-dom';
import {
    Chart as ChartJS,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    Tooltip,
    Legend,
  } from 'chart.js';
import { Scatter } from 'react-chartjs-2';
import 'chartjs-adapter-date-fns';
import { debounce } from 'lodash'
function DetailSvcPage(){
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
  const [preVc,setPreVc] = useState({
    lower: "",
    max: "",
    meas: "",
    min: "",
    post: "",
    title: "FVC",
    upper: "",
  });
  const [postVc,setPostVc] = useState({
    lower: "",
    max: "",
    meas: "",
    min: "",
    post: "",
    title: "FVC",
    upper: "",
  });
  // const [preFev1,setPreFev1] = useState({
  //   lower: "",
  //   max: "",
  //   meas: "",
  //   min: "",
  //   post: "",
  //   title: "FEV1",
  //   upper: "",
  // });
  // const [postFev1,setPostFev1] = useState({
  //   lower: "",
  //   max: "",
  //   meas: "",
  //   min: "",
  //   post: "",
  //   title: "FEV1",
  //   upper: "",
  // });
  // const [preFev1Per,setPreFev1Per] = useState({
  //   lower: "",
  //   max: "",
  //   meas: "",
  //   min: "",
  //   post: "",
  //   title: "FEV%",
  //   upper: "",
  // });
  // const [postFev1Per,setPostFev1Per] = useState({
  //   lower: "",
  //   max: "",
  //   meas: "",
  //   min: "",
  //   post: "",
  //   title: "FEV%",
  //   upper: "",
  // });
  ChartJS.register(LinearScale, PointElement, LineElement,BarElement, Tooltip, Legend);
  //종합 결과 목록 조회
  useEffect(()=>{
      let i = 0;
      let pre = undefined;
      let post = undefined;
      console.log(state)
      while(state.trials.length !== i){
        if(state.trials[i].best === true){
          if(pre === undefined){
            pre = i;
            setPreResult(state.trials[i].results);
            
          }else if(post === undefined){
            post = i;
            setPostResult(state.trials[i].results);
            break;
          }
        }
        i++;
      }        
      
  },[]);

  useEffect(()=>{
    console.log(Math.min(parseFloat(preVc.meas, preVc.min)));
  },[preVc])
  
  // useEffect(()=>{
  //   axios.get(`/subjects/${chartNumber}/types/fvc/results/${state.date}/diagnosis` , {
  //     headers: {
  //       Authorization: `Bearer ${cookies.get('accessToken')}`
  //     }})
  //     .then((res)=>{

  //     }).catch((err)=>{
  //       console.log(err);
  //     })
  // })
  const [preValSet, setPreValSet] = useState(0);
  const [postValSet, setPostValSet] = useState(0);
  //4사분면 좌표
  useEffect(()=>{
    console.log(preResult)
    if(preResult.length !== 0){
      const fvcMeas = parseFloat(preResult[0].meas);
      const fvcPred = parseFloat(preResult[0].pred);
      setPreVc(preResult[0]);
      const fev1Meas = parseFloat(preResult[1].meas);
      const x = fvcMeas/fvcPred
      const y = fev1Meas/fvcMeas
      setQuadrant4XY({
        ...quadrant4XY,
        x:(x >= 1 ? 1 : x),
        y:(y >= 1 ? 1 : y)
      })
      setPreValSet(1);
      setPostValSet(1);
    }
  },[preResult]);

  //post
  useEffect(()=>{
    if(Object.keys(postResult).length !== 0){
      setPostVc(postResult[0]);
    }
  },[postResult])

  useEffect(()=>{
    //preVc
    if(parseFloat(preVc.min) > parseFloat(preVc.meas)){
      setPreVc({...preVc, showVal:preVc.min})
    }
    else if(parseFloat(preVc.max) < parseFloat(preVc.meas)){
      setPreVc({...preVc, showVal:preVc.max})
    }
    else setPreVc({...preVc, showVal : preVc.meas});

  },[preValSet])

  useEffect(()=>{
    //postVc
    if(parseFloat(postVc.min) > parseFloat(postVc.meas)){
      setPostVc({...postVc, showVal:postVc.min})
    }
    else if(parseFloat(postVc.max) < parseFloat(postVc.meas)){
      setPostVc({...postVc, showVal:postVc.max})
    }
    else setPostVc({...postVc, showVal:postVc.meas})
    
  },[postValSet])

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
        // data: [{x: 0.016, y: 0.016}], 
        data: [{x: 0.053, y: 0.026}], 
        tension: 0.4,
      },]
    }
  //4사분면 옵션
  const quadrant4Option={
    plugins:{
      legend: {
        display: false
      },
      tooltip:{
        xAlign:'left',
        yAlign: 'bottom',
        displayColors: false,
        backgroundColor: 'white',
        bodyColor: '#000',
        borderColor:'rgb(34, 110, 177)',
        borderWidth: 1,
        padding:1,
        caretPadding:5,
        caretSize: 1,
        callbacks: {
          label: function(context) {
            console.log(context);
            let label = `${quadrant4XY.x.toFixed(2)},${quadrant4XY.y.toFixed(2)}` || '';
            label = "0,0";
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
    },
    maintainAspectRatio: false,
    responsive: true,
    interaction: false,
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


  const VcCompareBarData = {
    labels: "",
    datasets: [{
      label: "pre",
      fill: false,
      pointBackgroundColor: "red",
      pointBorderColor:"red",
      pointRadius: 7,
      pointHoverRadius: 7,
      data: [{ x :preVc.showVal, y : 0.6}],
      tension: 0.4,
    },{
      label: "post",
      fill: false,
      pointBackgroundColor: "rgba(1, 136, 190, 1)",
      pointBorderColor:"rgba(1, 136, 190, 1)",
      pointRadius: 7,
      pointHoverRadius: 7,
      data: [{x:postVc.showVal, y : 0.4}],
      tension: 0.4,
    }]
  }

  const VcCompareBarOption={
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
                  val = postVc.meas;
                }
                else{
                  val = preVc.meas;
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
        min: preVc.min,
        max: preVc.max,
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
  
  const chartRef = useRef();
  const [FvcSvc, setFvcSvc] = useState("fvc"); //fvc, svc
  
  
  //결과 그래프 목록 요청 FVC
  

  const[svcGraph,setSvcGraph] = useState([]);
  const[svcMax, setSvcMax] = useState([10]);
  let diagnosis, trials;


  
  const graphStyle = {width:"0px" ,height:"0px", transition:"none"}
  const graphStyle2 = {boxSizing:"border-box",width:"0px" ,height:"0px", transition:"none"}

  const [graphPreCount, setGraphPreCount] = useState([]);
  const [graphPostCount, setGraphPostCount] = useState([]);

  useEffect(()=>{
    //   console.log(location.state);
      console.log(123123123);
      //svc의 심플카드
      trials = location.state.trials;
      let svcGraphList = [];
      let svcMaxList = [];
      if(trials){
        // 매 결과에서 데이터 추출
        let count = 0;
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
            svcGraphList.push(item.graph.timeVolume);
            //현 svc 최대값 찾기
            svcMaxList.push(parseFloat(item.results[0].meas));
          }
  
          // //현 svc 최대값 찾기
          // svcMaxList.push(parseFloat(item.results[0].meas));
        })
        setSvcGraph(svcGraphList);
        setSvcMax(svcMaxList);
      }
    },[])

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

  const graphOption3={
    plugins:{
      legend: {
          display: false
      },
      resizeDelay:0,
      datalabels:false,
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
        suggestedMax:0,
        suggestedMin:-6,
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
    let time = setTimeout(() => {
      setTemp(true);
    },500);
  },[graphData3])

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

  useEffect(()=>
  {
    console.log("!#!##")

    let time = setTimeout(()=>{
      console.log("!#!##!@!@")
      
      let time2 = setTimeout(() => {
        let dataset = []
        svcGraph.forEach((item,index)=>{
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
            <div className="detail-svc-graph-container">
              <div className="graph">
                {temp?<div className="title-y">Volume(L)</div>:<></>}
                {temp?<Scatter style={graphStyle} data={graphData3} options={graphOption3}/>:<p className='loadingG'>화면 조정 중..</p>}
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
            <div className="compare-svc-graph-container">
              <div className="svc-compare-graph">
                <div className="compare-title">FVC(L)</div>
                <div className="compare-canvas-container">
                  <div className="compare-background2"></div>
                  <div className="compare-background"></div>
                  <div className="compare-background-line-left"></div>
                  <div className="compare-background-line-right"></div>
                  {temp?<Scatter id="fvcCompare" style={graphStyle2} options={VcCompareBarOption} data={VcCompareBarData}/>:<></>}
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

export default DetailSvcPage;