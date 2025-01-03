import { useState } from 'react'
import React from 'react'
import axios from 'axios';
import { Routes, Route, useNavigate, HashRouter } from "react-router-dom";
import './App.css'
import ResearchDashboard from './components/adminPanel'
import InfluencerLeaderboard from './components/Leaderboard'
import { Login } from './components/login';
import { Register } from './components/login';

const ErrorHandler = () => {
  const navigate = useNavigate();

  React.useEffect(() => {
    const interceptor = axios.interceptors.response.use(
      (response) => response,  // Si la respuesta es exitosa, la pasa
      (error) => {
        if (error.response && error.response.status === 401) {
          // Redirigir al login si el error es 401
          navigate('/');
        }
        return Promise.reject(error); // Propagar el error para manejarlo si es necesario
      }
    );

    return () => {
      axios.interceptors.response.eject(interceptor);
    };
  }, [navigate]);

  return null; // No se necesita renderizar nada
};

const HandleRoutes = () =>{
  return (
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/admin" element={<ResearchDashboard />} />
        <Route path="/Leaderboard" element={<InfluencerLeaderboard />} />
      </Routes>
  )
}
function App() {
  return (
      <HashRouter>
        <ErrorHandler />
        <HandleRoutes />
      </HashRouter>
  )
}

export default App
