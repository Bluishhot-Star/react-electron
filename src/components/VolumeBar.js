import { useState, useEffect, useRef } from "react";
import styled from "styled-components";



let Volume = styled.div`
  width: ${props=>props.width}%;
  height: 100%;
  border-radius: 50vh;
  background: linear-gradient(90deg, rgba(188,240,227,1) 0%, rgba(1,138,190,1) 100%);
`;

function VolumeBar(props) {
  let graphRef = useRef();
  const [width, setWidth] = useState(0);

  useEffect(()=>{
    if(props.width<=100 && props.width>=0){
      setWidth(props.width);
    }
  },[props.width])

  return (
    <>
      <Volume width={width}/>
    </>
  )
}

export default VolumeBar;