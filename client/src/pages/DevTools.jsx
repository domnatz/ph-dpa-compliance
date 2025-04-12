import React, { useState, useEffect } from 'react';
import axios from 'axios';

const DevTools = () => {
  const [userInfo, setUserInfo] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [newUser, setNewUser] = useState({
    name: '',
    email: '',
    password: '',
    company: 'Test Company'
  });
  const [testLoginData, setTestLoginData] = useState({
    email: '',
    password: ''
  });
  const [testLoginResult, setTestLoginResult] = useState(null);
  
  const fetchUserInfo = async () => {
    setLoading(true);
    try {
      const res = await axios.get('/api/users/debug-info');
      setUserInfo(res.data);
      setError(null);
    } catch (err) {
      setError('Failed to fetch user info: ' + err.message);
    }
    setLoading(false);
  };
  
  const handleInputChange = (e) => {
    setNewUser({
      ...newUser,
      [e.target.name]: e.target.value
    });
  };
  
  const handleTestLoginChange = (e) => {
    setTestLoginData({
      ...testLoginData,
      [e.target.name]: e.target.value
    });
  };
  
  const handleDirectRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await axios.post('/api/users/direct-register', newUser);
      alert('User created successfully!');
      fetchUserInfo(); // Refresh the list
      
      // Clear form
      setNewUser({
        name: '',
        email: '',
        password: '',
        company: 'Test Company'
      });
    } catch (err) {
      setError('Registration failed: ' + (err.response?.data?.error || err.message));
    }
    setLoading(false);
  };
  
  const handleTestLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      // Try emergency login
      const res = await axios.post('/api/users/emergency-login', testLoginData);
      setTestLoginResult({
        success: true,
        message: 'Login successful!',
        data: res.data
      });
    } catch (err) {
      setTestLoginResult({
        success: false,
        message: 'Login failed: ' + (err.response?.data?.error || err.message),
        error: err.response?.data || err.message
      });
    }
    setLoading(false);
  };
  
  useEffect(() => {
    fetchUserInfo();
  }, []);
  
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Developer Tools</h1>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-white p-4 rounded shadow">
          <h2 className="text-xl font-semibold mb-4">Create User Directly</h2>
          <form onSubmit={handleDirectRegister}>
            <div className="mb-4">
              <label className="block text-gray-700 mb-2">Name</label>
              <input
                type="text"
                name="name"
                value={newUser.name}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border rounded"
                required
              />
            </div>
            <div className="mb-4">
              <label className="block text-gray-700 mb-2">Email</label>
              <input
                type="email"
                name="email"
                value={newUser.email}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border rounded"
                required
              />
            </div>
            <div className="mb-4">
              <label className="block text-gray-700 mb-2">Password</label>
              <input
                type="password"
                name="password"
                value={newUser.password}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border rounded"
                required
              />
            </div>
            <div className="mb-4">
              <label className="block text-gray-700 mb-2">Company</label>
              <input
                type="text"
                name="company"
                value={newUser.company}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border rounded"
              />
            </div>
            <button
              type="submit"
              className="bg-blue-500 text-white px-4 py-2 rounded"
              disabled={loading}
            >
              {loading ? 'Creating...' : 'Create User'}
            </button>
          </form>
        </div>
        
        <div className="bg-white p-4 rounded shadow">
          <h2 className="text-xl font-semibold mb-4">Test Login</h2>
          <form onSubmit={handleTestLogin}>
            <div className="mb-4">
              <label className="block text-gray-700 mb-2">Email</label>
              <input
                type="email"
                name="email"
                value={testLoginData.email}
                onChange={handleTestLoginChange}
                className="w-full px-3 py-2 border rounded"
                required
              />
            </div>
            <div className="mb-4">
              <label className="block text-gray-700 mb-2">Password</label>
              <input
                type="password"
                name="password"
                value={testLoginData.password}
                onChange={handleTestLoginChange}
                className="w-full px-3 py-2 border rounded"
                required
              />
            </div>
            <button
              type="submit"
              className="bg-green-500 text-white px-4 py-2 rounded"
              disabled={loading}
            >
              {loading ? 'Testing...' : 'Test Login'}
            </button>
          </form>
          
          {testLoginResult && (
            <div className={`mt-4 p-3 rounded ${testLoginResult.success ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
              <h3 className="font-semibold">{testLoginResult.success ? 'Login Success' : 'Login Failed'}</h3>
              <p>{testLoginResult.message}</p>
              {testLoginResult.success && (
                <div className="mt-2 text-xs overflow-x-auto">
                  <pre>{JSON.stringify(testLoginResult.data, null, 2)}</pre>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
      
      <div className="bg-white p-4 rounded shadow">
        <h2 className="text-xl font-semibold mb-4">User Information</h2>
        <button
          onClick={fetchUserInfo}
          className="mb-4 bg-gray-200 px-3 py-1 rounded"
          disabled={loading}
        >
          Refresh
        </button>
        
        {loading ? (
          <p>Loading...</p>
        ) : userInfo ? (
          <div>
            <p>Total Users: {userInfo.stats.userCount}</p>
            <table className="w-full mt-4 border-collapse">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border p-2 text-left">Email</th>
                  <th className="border p-2 text-left">Name</th>
                  <th className="border p-2 text-left">Has Password</th>
                  <th className="border p-2 text-left">PW Length</th>
                </tr>
              </thead>
              <tbody>
                {userInfo.stats.users.map((user, index) => (
                  <tr key={index} className={index % 2 === 0 ? 'bg-gray-50' : ''}>
                    <td className="border p-2">{user.email}</td>
                    <td className="border p-2">{user.name}</td>
                    <td className="border p-2">{user.hasPassword ? 'Yes' : 'No'}</td>
                    <td className="border p-2">{user.passwordLength}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p>No data available</p>
        )}
      </div>
    </div>
  );
};

export default DevTools;