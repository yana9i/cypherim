import React from 'react';
import ReactDOM from 'react-dom';
import './style/index.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'react-toastify/dist/ReactToastify.css';
import 'emoji-mart/css/emoji-mart.css'
import App from './App';
import reportWebVitals from './reportWebVitals';

fetch(`http://${window.location.hostname}:3000/api/img/background?format=js&idx=0&n=6&mkt=zh-CN`).then(res => res.json()).then(res => {
  const random = Math.round(Math.random() * 5 - 0.5);
  const url = `https://cn.bing.com/${res.images[random].url}`;
  const img = new Image();
  img.src = url;
  img.onload = () => {
    const bgDiv = document.getElementById('bgDiv');
    bgDiv.style.backgroundImage = `url("${url}")`;
    bgDiv.style.animationName = 'fadein';
  }
})

ReactDOM.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
  document.getElementById('root')
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
