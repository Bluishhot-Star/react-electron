import { useState, useEffect, useRef, useCallback } from 'react';
import axios from 'axios';
import { useNavigate, useLocation} from 'react-router-dom'




import DateSelector from './DateSelector.js'
import { useInView } from 'react-intersection-observer';
import { useSelector } from "react-redux"
import { FaSearch } from "react-icons/fa";
import { HiOutlineCog } from "react-icons/hi";
let count = 0;
let searchC = false;
const MemberListCopy = ()=>{
  let deviceInfo = useSelector((state) => state.deviceInfo ) 
  const [examinees, setExaminees] = useState([]);
  const [date, setDate] = useState([]);
  const [chartNumber, setChartNumber] = useState("");
  const [birth, setBirth] = useState("");
  const [loading, setLoading] = useState(false)
  const [accessToken,setAccessToken] = useState(window.api.get("get-cookies",'accessToken'));
  let location = useLocation();
  let navigator = useNavigate();

  const click = (index,chartNumber, birth) =>{
    setChartNumber(chartNumber);
    setBirth(birth);
    console.log(birth);

    axios.get(`/subjects/${chartNumber}/histories` , {
      headers: {
        Authorization: `Bearer ${accessToken}`
      }
    }).then((res)=>{
      report(res.data.response, chartNumber);
    }).catch((err)=>{
      console.log(err);
    })
  }
  const [goTO, setGoTO] = useState(false)
  const [data0, setData0] = useState([]);
  const [data1, setData1] = useState([]);
  const [data2, setData2] = useState([]);
  const report = async(date,chartNum)=>{
    await axios.get(`/subjects/${chartNum}`,{
      headers: {
        Authorization: `Bearer ${accessToken}`
      }
    }).then((res)=>{
      console.log(res);
      if(res.data.subCode === 2004){
        setData0(res.data.message);
      }
      else setData0(res.data.response);
    })

    await axios.get(`/v3/subjects/${chartNum}/types/fvc/results/${date[0]}` , {
      headers: {
        Authorization: `Bearer ${accessToken}`
      }
    }).then((res)=>{
      console.log(res);
      if(res.data.subCode === 2004){
        setData1(res.data.message);
      }
      else setData1(res.data.response);
    }).catch((err)=>{
      console.log(err);
    })
    await axios.get(`/subjects/${chartNum}/histories`
    , {
      headers: {
        Authorization: `Bearer ${accessToken}`
    }}).then((res)=>{
      console.log(res.data.response);
      setDate(res.data.response);
    }).catch((err)=>{
      console.log(err);
    })
    await axios.get(`/v3/subjects/${chartNum}/types/svc/results/${date[0]}` , {
      headers: {
        Authorization: `Bearer ${accessToken}`
      }
    }).then((res)=>{
      console.log(res);
      if(res.data.subCode === 2004){
        setData2(res.data.message);
      }
      else setData2(res.data.response);
    }).catch((err)=>{
      console.log(err);
    })
    setGoTO(true);
  }
  useEffect(()=>{
    if(goTO){
      console.log(chartNumber);
      console.log(data0);
      console.log(data1);
      console.log(data2);
      console.log(date);
      navigator('./resultPage', {state: {info:data0, fvc:data1, svc:data2, date:date, birth:birth, chartNumber:chartNumber}});
    }
    else{}
  },[goTO])

  //기간 설정 기능
  const [inspectionDate, setInspectionDate] = useState({
    start : "",
    end : ""
  });
  //수정
  useEffect(()=>{
    if(chartNumber !== ""){
      axios.get(`/subjects/${chartNumber}/histories?from=${inspectionDate.start === "" ? "2000-01-01" : inspectionDate.start}&end=${inspectionDate.end === "" ? "2099-01-01" : inspectionDate.end}` , {
        headers: {
          Authorization: `Bearer ${accessToken}`
        }}).then((res)=>{
          console.log(inspectionDate);
          setDate(res.data.response);
        }).catch((err)=>{
          console.log(err);
        })
    }
  },[inspectionDate])

  useEffect(()=>{
    console.log(date)
  },[])
  const dateSelect = (select) =>{
    console.log(select);
    setInspectionDate(select);
  }


  const [dateSelectorStat, setDateSelectorStat] = useState(false);

  const [ref, inView] = useInView();
  const [page, setPage] = useState(1); // 현재 페이지 번호 (페이지네이션)

  const [searchVal, setSearchVal] = useState("")

  const searchMemberList = async ()=>{
    console.log(searchVal)
    axios.get(`/v3/subjects?page=1&size=500&search-option=name&search=${searchVal === undefined ? "" : searchVal}`,{
      headers: {
        Authorization: `Bearer ${accessToken}`
      }}).then((res)=>{
        if(res.data.subCode === 2004 && count < 4){
          count++;
          searchMemberList();
        }else{  
          count = 0;
            setExaminees(res.data.response);
            if(res.data.response.length === 200){
              setPage(2);

            }
          searchC = false
        }
        console.log(res.data.response)
      }).catch((err)=>{
        console.log(err);
      });
  }

  const MemberListCopy = useCallback(async () => {
    console.log(searchVal == '');
    if(page != 0){
      await axios.get(`/v3/subjects?page=${page}&size=500&search-option=name&search=${searchVal}`,{
        headers: {
          Authorization: `Bearer ${accessToken}`
        }}).then((res)=>{
          if(res.data.subCode !== 2004){  
            setExaminees([...examinees, ...res.data.response]);
            setPage((page) => page + 1);
          }
          console.log(res.data.response)
        }).catch((err)=>{
          console.log(err);
        });
    }
    
    
    
    
  },[page])

  useEffect(()=>{
    MemberListCopy()
  },[examinees])

  

  return (
      <div className="memberList-page-containerC">
        {dateSelectorStat ? <DateSelector data={inspectionDate} onOff={setDateSelectorStat} select={dateSelect}/> : null}
        <div className="memberList-page-navC">
          <p onClick={()=>{console.log(deviceInfo);
            // testIt()
            navigator('/memberList');
          }}>환자 목록</p>
          <div className='setting-btn-containerC' onClick={()=>{navigator("/setting")}}>
            <HiOutlineCog className='cogIconC'/>
            <p className="setting-btnC" >설정</p>
          </div>
        </div>
        <div className="memberList-page-left-containerC">
          <div className="patient-list-containerC">
            <div className="add-patient-btn-containerC">
              <div className="add-patient-btnC" onClick={()=>{navigator("./addPatient", {state: {update:false}})}}>
                + 환자 추가
              </div>
            </div>
            <div className="search-patient-containerC">
              <FaSearch className='searchIconC' style={{color: "#387fb9",}} />
              <form 
                onSubmit={(e)=>{
                e.preventDefault(); // 전체 리렌더링 방지
                setExaminees([]);
                // MemberListCopy();
                setPage(0);
                searchMemberList();
                setLoading(true);
                setTimeout(()=>{
                  setLoading(false);
                },1500)
                }}>
              <input type="text" placeholder={!loading ? '찾고자 하는 환자의 이름 또는 차트넘버를 입력해주세요.' : '로딩중'}
                onChange={(e)=>{setSearchVal(e.target.value);}} disabled={loading}/>
              </form>
            </div>
            <div className="patient-listC">
              <div className="patient-list-columnC">
                <div className="patient-list-column-nameC">차트넘버</div>
                <div className="patient-list-column-nameC">환자 이름</div>
                <div className="patient-list-column-nameC">성별</div>
                <div className="patient-list-column-nameC">생년월일</div>
                <div className="patient-list-column-nameC"></div>
                <div className="patient-list-column-nameC"></div>
              </div>
              <div className="patient-item-containerC">
                {
                  examinees.map((item, index)=>{
                    return(
                    <div id={"memberItem"+index} className="patient-itemC" key={index}>
                      <div className="patient-item-chartNumberC"><p>{item.chartNumber}</p></div>
                      <div className="patient-item-nameC"><p>{item.name}</p></div>
                      <div className="patient-item-genderC"><p>{item.gender == "m" ? "남자" : "여자"}</p></div>
                      <div className="patient-item-birthdayC"><p>{item.birthday}</p></div>
                      <div className="btn" onClick={(e)=>{e.preventDefault(); navigator("./addPatient", {state: {chartNumber:item.chartNumber,update:true}})}}>
                        <input type='button' id='measurmentBtn' className='measurmentBtn'/>
                        <label htmlFor='measurmentBtn'>검사하기</label>
                      </div>
                      <div className="btn" onClick={(e)=>{
                          e.preventDefault();
                          console.log(e.target);
                          console.log(item.chartNumber); 
                          click(index,item.chartNumber,item.birthday);}}>
                        <input type='button' id={"resultBtn" + index} className='resultBtn'/>
                        <label htmlFor='resultBtn'>결과보기</label>
                      </div>
                    </div>
                    )
                  })
                  //아래 요소가 마지막(무한로딩 트리거)
                }
                <div className='patient-loadingC' ref={ref}></div>
              </div>
            </div>
          </div>
        </div>
        
      </div>
  );
}
export default MemberListCopy;