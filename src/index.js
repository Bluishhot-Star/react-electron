import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import { BrowserRouter } from "react-router-dom";
import { Cookies } from 'react-cookie';
import axios from 'axios';
import { Provider } from "react-redux";
import deviceInfo from "./deviceInfo.js"
const root = ReactDOM.createRoot(document.getElementById('root'));
axios.interceptors.response.use(
  (res)=>{

    return res;

  },
  async (err)=>{
    const refreschToken = await window.api.get("get-cookies",'refreshToken');
    console.log(window.api.get("get-cookies",'refreshToken'));
    if(err.response.status===401){
      const accessExpires = new Date();
      await axios.post("/auth/renewal" ,{},{
        headers: {
          Authorization: `Bearer ${refreschToken}`
      }}).then(async(res)=>{
        accessExpires.setMinutes(accessExpires.getMinutes() + 14);

        const accessTokenData = {
          name: 'accessToken',
          data : res.data.response.accessToken,
          date : accessExpires
        }
        await window.api.send("set-cookie", accessTokenData);
      }).catch((err)=>{
        console.log(err);
        window.location.replace('/');

      });
      const accessToken = await window.api.get("get-cookies",'accessToken');

      err.config.headers = {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
      };

      // 중단된 요청을(에러난 요청)을 토큰 갱신 후 재요청
      const response = await axios.request(err.config);
      return response;
    }
    return Promise.reject(err);
  }
)
root.render(
  <Provider store={deviceInfo}>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </Provider>
  // <React.StrictMode>   double invoked,,
  // </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
