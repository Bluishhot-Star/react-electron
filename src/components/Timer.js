import { useState, useRef, useEffect} from 'react';
function Timer(props){
  let startTime = ()=>{}
  let stopTime = ()=>{}

  const [run, setRun] = useState();
  const [time, setTime] = useState(0);
  const intervalRef = useRef();
  const secondRef = useRef();
  const milliSec10Ref = useRef();
  const milliSec1Ref = useRef();

  const startTimeRef = useRef(null);
  const stopTimeRef = useRef(null);

  // const formatTime = (time) => {
  //   let seconds =  Math.floor((time / 1000) % 60).toString().slice(-2)
  //   const temp = Math.floor((time / 10)%100).toString().slice(-2);
  //   let millseconds10 = temp[0];
  //   let milliseconds1 = temp[1];
  //   return { seconds, millseconds10, milliseconds1 };
  // };

  // const { seconds, millseconds10, milliseconds1 } = formatTime(time);

  const [seconds, setSeconds] = useState(0);
  const [millseconds10, setMillseconds10] = useState(0);
  const [milliseconds1, setMilliseconds1] = useState(0);
  
  useEffect(()=>{
    if(props.start){
      setRun(true);
    }
    else{
      clearInterval(intervalRef.current)
      setRun(false);
    }
  },[props.start])
  
  // useEffect(()=>{
  //   if(run){
  //     intervalRef.current = setInterval(() => {
  //       setTime(val=>val+10);
  //     },10);
  //   }
  // },[run])
  // useEffect(()=>{
  //   if(time == props.stop*1000+1){
  //     clearInterval(intervalRef.current)
  //     setRun(false);
  //   }
  //   else{
  //     props.setRunTime(time)
  //   }
  // })

  useEffect(()=>{
    if(props.start){
      timerPlay();
      setRun(true);
    }
    else{
      clearInterval(intervalRef.current)
      setRun(false);
    }
  },[props.start])

  useEffect(()=>{
    if(run){
      intervalRef.current = setInterval(() => {
        const now = new Date(Date.now() - startTimeRef.current);
        if(now.getTime() == props.stop*1000+1){
          clearInterval(intervalRef.current)
          setRun(false);
        }
        else{
          props.setRunTime(now.getTime())
          setSeconds(now.getUTCSeconds());
          setMillseconds10(now.getUTCMilliseconds().toString()[0]);
          setMilliseconds1(now.getUTCMilliseconds().toString()[1]);
        }
      },10);
    }
  },[run])
  // useEffect(()=>{
  //   if(time == props.stop*1000+1){
  //     clearInterval(intervalRef.current)
  //     setRun(false);
  //   }
  //   else{
  //     props.setRunTime(time)
  //   }
  // })
  const timerPlay = ()=>{
    if (startTimeRef.current===null){startTimeRef.current = Date.now();}
  }


  return(
    <>
      <div className="timer-container">
        <p ref={secondRef} className="timer-second">{seconds}</p>
        <p>초</p>
        <p ref={milliSec10Ref} className="timer-millisecond">{millseconds10}</p>
        <p ref={milliSec1Ref} className="timer-millisecond">{milliseconds1}</p>

      </div>
    </>
  )
}
export default Timer;