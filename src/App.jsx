import React, { useState } from 'react';
import StartPage from './components/StartPage';
import CustomerLogin from './components/customer/CustomerLogin'; 
// 🚨 1. මේ Import එක උඩින්ම තියෙනවද කියලා බලන්න 
import GarageMap from './components/customer/GarageMap'; 

function App() {
  const [currentPage, setCurrentPage] = useState('start');

  if (currentPage === 'start') {
    return <StartPage onNavigate={setCurrentPage} />;
  }

  if (currentPage === 'customer-login') {
    return <CustomerLogin onNavigate={setCurrentPage} />;
  }

  // 🚨 2. මෙන්න මේ කෑල්ල 'App.jsx' එකේ අනිවාර්යයෙන්ම තියෙන්න ඕනේ!
  if (currentPage === 'garage-map') {
    return <GarageMap onNavigate={setCurrentPage} />;
  }
}

export default App;