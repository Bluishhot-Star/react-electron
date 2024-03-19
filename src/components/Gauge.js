import styled from 'styled-components';
import { useRef, useEffect} from 'react';

function Gauge(props){
  let itemRef = useRef([]);
  const Item = styled.span`
    position: absolute;
    transform: rotate(calc(${props => (props.idx*6+"deg")}));
    inset: -16px;
    text-align: center;
  `
  let colorChg = (idx)=>{

  }
  useEffect(()=>{
    if(props.end){
      itemRef.current[props.end*4].classList += ' endColor';
    }
  },[])
  useEffect(()=>{
    if(props.start==='true'){
      let i =1;
      setTimeout(() => {
        setInterval(() => {
          if(i>60)return;
          itemRef.current[i++].classList += " tickColor";
        }, 250);
      }, 6000);
    }
  },[])
  return(
    <>
      <div className="gauge-container">
        <div className='gauge-status'>
          {
            props.status === "true" ?
            <div className='gauge-status-content'>
              <p>{props.content.r1}</p>
              <p>{props.content.r2}</p>
            </div>
            :
            <p>준비</p>
          }
        </div>
        <Item ref={el=>itemRef.current[1]=el} idx="1"><p></p></Item>
        <Item ref={el=>itemRef.current[2]=el} idx="2"><p></p></Item>
        <Item ref={el=>itemRef.current[3]=el} idx="3"><p></p></Item>       
        <Item ref={el=>itemRef.current[4]=el} idx="4"><p></p></Item>
        <Item ref={el=>itemRef.current[5]=el} idx="5"><p></p></Item>
        <Item ref={el=>itemRef.current[6]=el} idx="6"><p></p></Item>
        <Item ref={el=>itemRef.current[7]=el} idx="7"><p></p></Item>
        <Item ref={el=>itemRef.current[8]=el} idx="8"><p></p></Item>
        <Item ref={el=>itemRef.current[9]=el} idx="9"><p></p></Item>
        <Item ref={el=>itemRef.current[10]=el} idx="10"><p></p></Item>
        <Item ref={el=>itemRef.current[11]=el} idx="11"><p></p></Item>
        <Item ref={el=>itemRef.current[12]=el} idx="12"><p></p></Item>
        <Item ref={el=>itemRef.current[13]=el} idx="13"><p></p></Item>
        <Item ref={el=>itemRef.current[14]=el} idx="14"><p></p></Item>
        <Item ref={el=>itemRef.current[15]=el} idx="15"><p></p></Item>
        <Item ref={el=>itemRef.current[16]=el} idx="16"><p></p></Item>
        <Item ref={el=>itemRef.current[17]=el} idx="17"><p></p></Item>
        <Item ref={el=>itemRef.current[18]=el} idx="18"><p></p></Item>
        <Item ref={el=>itemRef.current[19]=el} idx="19"><p></p></Item>
        <Item ref={el=>itemRef.current[20]=el} idx="20"><p></p></Item>
        <Item ref={el=>itemRef.current[21]=el} idx="21"><p></p></Item>
        <Item ref={el=>itemRef.current[22]=el} idx="22"><p></p></Item>
        <Item ref={el=>itemRef.current[23]=el} idx="23"><p></p></Item>
        <Item ref={el=>itemRef.current[24]=el} idx="24"><p></p></Item>
        <Item ref={el=>itemRef.current[25]=el} idx="25"><p></p></Item>
        <Item ref={el=>itemRef.current[26]=el} idx="26"><p></p></Item>
        <Item ref={el=>itemRef.current[27]=el} idx="27"><p></p></Item>
        <Item ref={el=>itemRef.current[28]=el} idx="28"><p></p></Item>
        <Item ref={el=>itemRef.current[29]=el} idx="29"><p></p></Item>
        <Item ref={el=>itemRef.current[30]=el} idx="30"><p></p></Item>
        <Item ref={el=>itemRef.current[31]=el} idx="31"><p></p></Item>
        <Item ref={el=>itemRef.current[32]=el} idx="32"><p></p></Item>
        <Item ref={el=>itemRef.current[33]=el} idx="33"><p></p></Item>
        <Item ref={el=>itemRef.current[34]=el} idx="34"><p></p></Item>
        <Item ref={el=>itemRef.current[35]=el} idx="35"><p></p></Item>
        <Item ref={el=>itemRef.current[36]=el} idx="36"><p></p></Item>
        <Item ref={el=>itemRef.current[37]=el} idx="37"><p></p></Item>
        <Item ref={el=>itemRef.current[38]=el} idx="38"><p></p></Item>
        <Item ref={el=>itemRef.current[39]=el} idx="39"><p></p></Item>
        <Item ref={el=>itemRef.current[40]=el} idx="40"><p></p></Item>
        <Item ref={el=>itemRef.current[41]=el} idx="41"><p></p></Item>
        <Item ref={el=>itemRef.current[42]=el} idx="42"><p></p></Item>
        <Item ref={el=>itemRef.current[43]=el} idx="43"><p></p></Item>
        <Item ref={el=>itemRef.current[44]=el} idx="44"><p></p></Item>
        <Item ref={el=>itemRef.current[45]=el} idx="45"><p></p></Item>
        <Item ref={el=>itemRef.current[46]=el} idx="46"><p></p></Item>
        <Item ref={el=>itemRef.current[47]=el} idx="47"><p></p></Item>
        <Item ref={el=>itemRef.current[48]=el} idx="48"><p></p></Item>
        <Item ref={el=>itemRef.current[49]=el} idx="49"><p></p></Item>
        <Item ref={el=>itemRef.current[50]=el} idx="50"><p></p></Item>
        <Item ref={el=>itemRef.current[51]=el} idx="51"><p></p></Item>
        <Item ref={el=>itemRef.current[52]=el} idx="52"><p></p></Item>
        <Item ref={el=>itemRef.current[53]=el} idx="53"><p></p></Item>
        <Item ref={el=>itemRef.current[54]=el} idx="54"><p></p></Item>
        <Item ref={el=>itemRef.current[55]=el} idx="55"><p></p></Item>
        <Item ref={el=>itemRef.current[56]=el} idx="56"><p></p></Item>
        <Item ref={el=>itemRef.current[57]=el} idx="57"><p></p></Item>
        <Item ref={el=>itemRef.current[58]=el} idx="58"><p></p></Item>
        <Item ref={el=>itemRef.current[59]=el} idx="59"><p></p></Item>
        <Item className='startColor' ref={el=>itemRef.current[60]=el} idx="60"><p></p></Item>
      </div>
    </>
  )
}
export default Gauge;