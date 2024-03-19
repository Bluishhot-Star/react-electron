import { useState, useRef, useEffect} from 'react';
import axios from 'axios';
// import background from "../../public/FVC_v6_page-0001.jpg";

import { Routes, Route, Link, useNavigate,useLocation } from 'react-router-dom'
import html2canvas from "html2canvas";
import img from '../img/FVC_v6.svg'
const Report = (state)=>{
  console.log(state)
    let navigatorR = useNavigate();
    const location = useLocation();
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
    onCapture();
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

      onSaveAs(canvas.toDataURL('image/jpeg'),`car_verify_${YMD}_${time}.png`,);
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




  const fourthRendering = () => {
    const result = [];
    console.log(state.data.fvcSvc.trials[0].results[0].meas)

    for (let i = 0; i < 8; i++) {
      console.log(state.data.fvcSvc.trials.length)
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
          <div className='report-title-container'></div>
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
          <div></div>

          <div className='second-chart'>
            <div className='row-line'>
              <div></div>
              <div className='value'>{top.name !== '' ? state.data.fvcSvc.calibration.temperature : '-'}</div>
              <div></div>
              <div className='value'>{top.name !== '' ? state.data.fvcSvc.calibration.humidity : '-'}</div>
              <div></div>
              <div className='value'>{top.name !== '' ? state.data.fvcSvc.calibration.pressure : '-'}</div>
            </div>
            <div className='row-line'>
              <div></div>
              <div className='value'>{top.name !== '' ? state.data.fvcSvc.calibration.date : '-'}</div>
              <div></div>
              <div className='value'>{top.name !== '' ? state.data.fvcSvc.calibration.gain.inhale : '-'}</div>
              <div ></div>
              <div className='value'>{top.name !== '' ? state.data.fvcSvc.calibration.gain.exhale : '-'}</div>
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
                <div className='value'>{state.data.fvcSvc.trials[0].results[0].meas !== '' ? state.data.fvcSvc.trials[0].results[0].meas :'-'}</div>
                <div className='value'>{state.data.fvcSvc.trials[0].results[0].pred !== '' ? state.data.fvcSvc.trials[0].results[0].pred :'-'}</div>
                <div className='value'>{state.data.fvcSvc.trials[0].results[0].per !== '' ? state.data.fvcSvc.trials[0].results[0].per :'-'}</div>
                <div className='value'>{state.data.fvcSvc.trials[0].results[0].post !== '' ? state.data.fvcSvc.trials[0].results[0].post :'-'}</div>
                <div className='value'>{state.data.fvcSvc.trials[0].results[0].chg !== '' ? state.data.fvcSvc.trials[0].results[0].chg :'-'}</div>
              </div>
              <div className='row-line'>
                <div></div>
                <div></div>
                <div className='value'>{state.data.fvcSvc.trials[0].results[1].meas !== '' ? state.data.fvcSvc.trials[0].results[1].meas :'-'}</div>
                <div className='value'>{state.data.fvcSvc.trials[0].results[1].pred !== '' ? state.data.fvcSvc.trials[0].results[1].pred :'-'}</div>
                <div className='value'>{state.data.fvcSvc.trials[0].results[1].per !== '' ? state.data.fvcSvc.trials[0].results[1].per :'-'}</div>
                <div className='value'>{state.data.fvcSvc.trials[0].results[1].post !== '' ? state.data.fvcSvc.trials[0].results[1].post :'-'}</div>
                <div className='value'>{state.data.fvcSvc.trials[0].results[1].chg !== '' ? state.data.fvcSvc.trials[0].results[1].chg :'-'}</div>
              </div>
              <div className='row-line'>
                <div></div>
                <div></div>
                <div className='value'>{state.data.fvcSvc.trials[0].results[2].meas !== '' ? state.data.fvcSvc.trials[0].results[2].meas :'-'}</div>
                <div className='value'>{state.data.fvcSvc.trials[0].results[2].pred !== '' ? state.data.fvcSvc.trials[0].results[2].pred :'-'}</div>
                <div className='value'>{state.data.fvcSvc.trials[0].results[2].per !== '' ? state.data.fvcSvc.trials[0].results[2].per :'-'}</div>
                <div className='value'>{state.data.fvcSvc.trials[0].results[2].post !== '' ? state.data.fvcSvc.trials[0].results[2].post :'-'}</div>
                <div className='value'>{state.data.fvcSvc.trials[0].results[2].chg !== '' ? state.data.fvcSvc.trials[0].results[2].chg :'-'}</div>
              </div>
              <div className='row-line'>
                <div></div>
                <div></div>
                <div className='value'>{state.data.fvcSvc.trials[0].results[17].meas !== '' ? state.data.fvcSvc.trials[0].results[17].meas :'-'}</div>
                <div className='value'>{state.data.fvcSvc.trials[0].results[17].pred !== '' ? state.data.fvcSvc.trials[0].results[17].pred :'-'}</div>
                <div className='value'>{state.data.fvcSvc.trials[0].results[17].per !== '' ? state.data.fvcSvc.trials[0].results[17].per :'-'}</div>
                <div className='value'>{state.data.fvcSvc.trials[0].results[17].post !== '' ? state.data.fvcSvc.trials[0].results[17].post :'-'}</div>
                <div className='value'>{state.data.fvcSvc.trials[0].results[17].chg !== '' ? state.data.fvcSvc.trials[0].results[17].chg :'-'}</div>
              </div>
              <div className='row-line'>
                <div></div>
                <div></div>
                <div className='value'>{state.data.fvcSvc.trials[0].results[3].meas !== '' ? state.data.fvcSvc.trials[0].results[3].meas :'-'}</div>
                <div className='value'>{state.data.fvcSvc.trials[0].results[3].pred !== '' ? state.data.fvcSvc.trials[0].results[3].pred :'-'}</div>
                <div className='value'>{state.data.fvcSvc.trials[0].results[3].per !== '' ? state.data.fvcSvc.trials[0].results[3].per :'-'}</div>
                <div className='value'>{state.data.fvcSvc.trials[0].results[3].post !== '' ? state.data.fvcSvc.trials[0].results[3].post :'-'}</div>
                <div className='value'>{state.data.fvcSvc.trials[0].results[3].chg !== '' ? state.data.fvcSvc.trials[0].results[3].chg :'-'}</div>
              </div>
              <div className='row-line'>
                <div></div>
                <div></div>
                <div className='value'>{state.data.fvcSvc.trials[0].results[13].meas !== '' ? state.data.fvcSvc.trials[0].results[13].meas :'-'}</div>
                <div className='value'>{state.data.fvcSvc.trials[0].results[13].pred !== '' ? state.data.fvcSvc.trials[0].results[13].pred :'-'}</div>
                <div className='value'>{state.data.fvcSvc.trials[0].results[13].per !== '' ? state.data.fvcSvc.trials[0].results[13].per :'-'}</div>
                <div className='value'>{state.data.fvcSvc.trials[0].results[13].post !== '' ? state.data.fvcSvc.trials[0].results[13].post :'-'}</div>
                <div className='value'>{state.data.fvcSvc.trials[0].results[13].chg !== '' ? state.data.fvcSvc.trials[0].results[13].chg :'-'}</div>
              </div>
              <div className='row-line'>
                <div></div>
                <div></div>
                <div className='value'>{state.data.fvcSvc.trials[0].results[6].meas !== '' ? state.data.fvcSvc.trials[0].results[6].meas :'-'}</div>
                <div className='value'>{state.data.fvcSvc.trials[0].results[6].pred !== '' ? state.data.fvcSvc.trials[0].results[6].pred :'-'}</div>
                <div className='value'>{state.data.fvcSvc.trials[0].results[6].per !== '' ? state.data.fvcSvc.trials[0].results[6].per :'-'}</div>
                <div className='value'>{state.data.fvcSvc.trials[0].results[6].post !== '' ? state.data.fvcSvc.trials[0].results[6].post :'-'}</div>
                <div className='value'>{state.data.fvcSvc.trials[0].results[6].chg !== '' ? state.data.fvcSvc.trials[0].results[6].chg :'-'}</div>
              </div>
              <div className='row-line'>
                <div></div>
                <div></div>
                <div className='value'>{state.data.fvcSvc.trials[0].results[22].meas !== '' ? state.data.fvcSvc.trials[0].results[22].meas :'-'}</div>
                <div className='value'>{state.data.fvcSvc.trials[0].results[22].pred !== '' ? state.data.fvcSvc.trials[0].results[22].pred :'-'}</div>
                <div className='value'>{state.data.fvcSvc.trials[0].results[22].per !== '' ? state.data.fvcSvc.trials[0].results[22].per :'-'}</div>
                <div className='value'>{state.data.fvcSvc.trials[0].results[22].post !== '' ? state.data.fvcSvc.trials[0].results[22].post :'-'}</div>
                <div className='value'>{state.data.fvcSvc.trials[0].results[22].chg !== '' ? state.data.fvcSvc.trials[0].results[22].chg :'-'}</div>
              </div>
              <div className='row-line'>
                <div></div>
                <div></div>
                <div className='value'>{state.data.fvcSvc.trials[0].results[4].meas !== '' ? state.data.fvcSvc.trials[0].results[4].meas :'-'}</div>
                <div className='value'>{state.data.fvcSvc.trials[0].results[4].pred !== '' ? state.data.fvcSvc.trials[0].results[4].pred :'-'}</div>
                <div className='value'>{state.data.fvcSvc.trials[0].results[4].per !== '' ? state.data.fvcSvc.trials[0].results[4].per :'-'}</div>
                <div className='value'>{state.data.fvcSvc.trials[0].results[4].post !== '' ? state.data.fvcSvc.trials[0].results[4].post :'-'}</div>
                <div className='value'>{state.data.fvcSvc.trials[0].results[4].chg !== '' ? state.data.fvcSvc.trials[0].results[4].chg :'-'}</div>
              </div>
              <div className='row-line'>
                <div></div>
                <div></div>
                <div className='value'>{state.data.fvcSvc.trials[0].results[5].meas !== '' ? state.data.fvcSvc.trials[0].results[5].meas :'-'}</div>
                <div className='value'>{state.data.fvcSvc.trials[0].results[5].pred !== '' ? state.data.fvcSvc.trials[0].results[5].pred :'-'}</div>
                <div className='value'>{state.data.fvcSvc.trials[0].results[5].per !== '' ? state.data.fvcSvc.trials[0].results[5].per :'-'}</div>
                <div className='value'>{state.data.fvcSvc.trials[0].results[5].post !== '' ? state.data.fvcSvc.trials[0].results[5].post :'-'}</div>
                <div className='value'>{state.data.fvcSvc.trials[0].results[5].chg !== '' ? state.data.fvcSvc.trials[0].results[5].chg :'-'}</div>
              </div>
            </div>
            
            <div className='third-chart-right'>

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

          </div>
          <div></div>
          <div className='sixth-chart'>
            
          </div>
        </div>
      </div>
    </>
  )
}
export default Report;
