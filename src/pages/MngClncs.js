import { useState, useCallback, useEffect, useRef} from 'react';
import axios from 'axios';
import { useInView } from 'react-intersection-observer';
import { useNavigate } from 'react-router-dom'
import { FaChevronLeft, FaSearch } from "react-icons/fa";

const MngClncs = () =>{
  let navigator = useNavigate();

  const [clinicians, setClinicians] = useState([]);
  const [accessToken,setAccessToken] = useState(window.api.get("get-cookies",'accessToken'));
  const [loading, setLoading] = useState(false)
  const [page, setPage] = useState(1); // 현재 페이지 번호 (페이지네이션)
  const [searchVal, setSearchVal] = useState("")

  const cliniciansList = useCallback(async () => {
    setLoading(true)
    console.log("page : "+page);
    axios.get(`/clinicians?page=${page}&size=10&name=${searchVal}`,{
      headers: {
        Authorization: `Bearer ${accessToken}`
      }}).then((res)=>{
        console.log(res.data.response.clinicians);
        console.log(res.data.subCode);
        if(res.data.response.total>(page-1)*10){
          setClinicians([...clinicians, ...res.data.response.clinicians]);
          setPage((page) => page + 1);
        }
      }).catch((err)=>{
        console.log(err);
      });
    setLoading(false)
  },[page])

  useEffect(()=>{
    cliniciansList()
  },[clinicians])

  // useEffect(() => {
  //   // 사용자가 마지막 요소를 보고 있고, 로딩 중이 아니라면
  //   if (inView && !loading) {
  //     setPage((page) => page + 1);
  //   }
  // }, [inView,loading])

  const cliniciansMngRef = useRef([]);

  const statusChange = async(e,id, index) =>{
    console.log(e.target.value);
    console.log(id);
    if(e.target.value === "enabled"){
      console.log(cliniciansMngRef.current[index].children[0])
    }
    else{
      console.log(cliniciansMngRef.current[index].children[1])
    }
    axios.put(`/clinicians/${id}`,{
      status : e.target.value
      },{
      headers: {
        Authorization: `Bearer ${accessToken}`
      }}).then((res)=>{
        window.location.reload();
      }).catch((err)=>{
      console.log(err);
      });
  }
  

  return(
    <div className='manage-clinics-container'>
      {/* <div className='setting-page-backBtn' onClick={()=>{navigator(-1)}}>
        <FontAwesomeIcon icon={faChevronLeft} style={{color: "#4b75d6",}} />
      </div> */}
      <div className="manage-clinics-nav" onClick={()=>{console.log()}}>
        <div className='manage-clinics-backBtn' onClick={()=>{navigator(-1)}}>
          <FaChevronLeft style={{color: "#4b75d6",}}/>
        </div>
        <p onClick={()=>{console.log(cliniciansMngRef.current[0].children[0])}} >의료진 관리</p>
      </div>
      <div className="manage-clinics-body-container">
        <div>의료진 검색</div>
        <div className="search-patient-container">
          <FaSearch className='searchIcon' style={{color: "#4b75d6",}}/>
          <form 
              onSubmit={(e)=>{
              e.preventDefault(); // 전체 리렌더링 방지
              setClinicians([])
              cliniciansList();
              setPage(1);}}>
            <input type="text" placeholder='찾고자하는 매니저를 검색해주세요.'
            onChange={(e)=>{setSearchVal(e.target.value);}}/>
          </form>
        </div>


        <div className="clinicians-list">
          <div className="clinicians-list-column">
            <div className="clinicians-list-column-name">이름</div>
            <div className="clinicians-list-column-name">등록일자</div>
            <div className="clinicians-list-column-name">직책</div>
            <div className="clinicians-list-column-name">승인여부</div>
            <div className="clinicians-list-column-name">승인관리</div>
          </div>
          <div className="clinicians-item-container">
            {
              clinicians.map((item, index)=>{
                return(
                <div id={"cliniciansItem"+index} className="clinicians-item" key={index} onClick={(e)=>{}}>
                  <div className="clinicians-item-name"><p>{item.clinicianName}</p></div>
                  <div className="clinicians-item-date"><p>{item.date}</p></div>
                  <div className="clinicians-item-roleName"><p>{item.roleName}</p></div>
                  <div className="clinicians-item-status"><p>{item.status==='enabled' ? '승인': item.status ==="pendingDeletion" ?  "삭제 대기" : '비승인'}</p></div>
                  <div className="clinicians-item-status-management radio-container" ref={(el)=>{cliniciansMngRef.current[index]=el}}>
                    <div className="radioBtn">
                      <input id={item.clinicianId+"enable"} type='radio' disabled={item.status === "pendingDeletion"} defaultChecked={item.status === "enabled" ? true : false} name={item.clinicianId} className='statusTrue' value='enabled' onChange={(e)=>{statusChange(e,item.clinicianId, index)}}/>
                      <label htmlFor={item.clinicianId+"enable"}>승인</label>
                    </div>
                    <div className="radioBtn">
                      <input id={item.clinicianId+"disable"} type='radio' disabled={item.status === "pendingDeletion"} defaultChecked={item.status === "disabled" ? true : false} name={item.clinicianId} className='statusFalse' value='disabled' onChange={(e)=>{statusChange(e,item.clinicianId, index)}}/>
                      <label htmlFor={item.clinicianId+"disable"}>거부</label>
                    </div>
                  </div>
                </div>
                )
              })
            }
          </div>
        </div>



      </div>
    </div>
  );
}

export default MngClncs;