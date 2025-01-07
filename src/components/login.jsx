import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await axios.post('https://verify-influencers-28rr-btcud4qop.vercel.app/users/login', { email, password });
      localStorage.setItem('token', response.data.token);
      navigate('/leaderboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Error al iniciar sesión');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center">
      <div className="bg-gray-800/50 p-8 rounded-lg w-96">
        <h2 className="text-2xl text-white font-bold mb-6">Login</h2>
        {error && <p className="text-red-400 mb-4 text-sm">{error}</p>}
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="text-gray-300">Email</label>
            <input
              required
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-gray-700 rounded p-2 mt-1 text-white"
              disabled={loading}
            />
          </div>
          <div>
            <label className="text-gray-300">Password</label>
            <input
              required
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-gray-700 rounded p-2 mt-1 text-white"
              minLength={6}
              disabled={loading}
            />
          </div>
          <button 
            className="w-full bg-emerald-500 text-white p-2 rounded disabled:opacity-50"
            disabled={loading}
          >
            {loading ? 'Iniciando sesión...' : 'Login'}
          </button>
        </form>
        <p className="text-gray-400 mt-4 text-center">
          Need an account?{' '}
          <button 
            onClick={() => navigate('/register')} 
            className="text-emerald-400"
            disabled={loading}
          >
            Register
          </button>
        </p>
      </div>
    </div>
  );
};

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const validateForm = () => {
    if (formData.password !== formData.confirmPassword) {
      setError('Las contraseñas no coinciden');
      return false;
    }
    if (formData.password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres');
      return false;
    }
    return true;
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    
    if (!validateForm()) return;
    
    setLoading(true);
    try {
      const response = await axios.post('https://verify-influencers-28rr-btcud4qop.vercel.app/users/register', {
        name: formData.name,
        email: formData.email,
        password: formData.password
      });
      
      localStorage.setItem('token', response.data.token);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Error al registrar usuario');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center">
      <div className="bg-gray-800/50 p-8 rounded-lg w-96">
        <h2 className="text-2xl text-white font-bold mb-6">Register</h2>
        {error && <p className="text-red-400 mb-4 text-sm">{error}</p>}
        <form onSubmit={handleRegister} className="space-y-4">
          <div>
            <label className="text-gray-300">Name</label>
            <input
              required
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              className="w-full bg-gray-700 rounded p-2 mt-1 text-white"
              disabled={loading}
            />
          </div>
          <div>
            <label className="text-gray-300">Email</label>
            <input
              required
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
              className="w-full bg-gray-700 rounded p-2 mt-1 text-white"
              disabled={loading}
            />
          </div>
          <div>
            <label className="text-gray-300">Password</label>
            <input
              required
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({...formData, password: e.target.value})}
              className="w-full bg-gray-700 rounded p-2 mt-1 text-white"
              minLength={6}
              disabled={loading}
            />
          </div>
          <div>
            <label className="text-gray-300">Confirm Password</label>
            <input
              required
              type="password"
              value={formData.confirmPassword}
              onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
              className="w-full bg-gray-700 rounded p-2 mt-1 text-white"
              minLength={6}
              disabled={loading}
            />
          </div>
          <button 
            className="w-full bg-emerald-500 text-white p-2 rounded disabled:opacity-50"
            disabled={loading}
          >
            {loading ? 'Registrando...' : 'Register'}
          </button>
        </form>
        <p className="text-gray-400 mt-4 text-center">
          Already have an account?{' '}
          <button 
            onClick={() => navigate('/')} 
            className="text-emerald-400"
            disabled={loading}
          >
            Login
          </button>
        </p>
      </div>
    </div>
  );
};

export { Login, Register };