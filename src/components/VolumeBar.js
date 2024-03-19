import { useState, useEffect, useRef } from "react";
import styled from "styled-components";



let Volume = styled.div`
  width: ${props=>props.width}%;
  height: 100%;
  border-radius: 50vh;
  background-color: rgb(77, 174, 226);
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