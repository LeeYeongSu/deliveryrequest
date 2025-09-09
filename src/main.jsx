import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './main.css';   // 있으면 유지
import './app.css';     // 있으면 유지

// import reportWebVitals from './reportWebVitals';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
// 위의 내용이 같은 뜻이다.(생성자로 처리하냐.. 바로처리하냐 의 차이일뿐)
// const root = ReactDOM.createRoot(document.getElementById('root'));
// root.render(
//   <React.StrictMode>
//    <App />
//   </React.StrictMode>
// );