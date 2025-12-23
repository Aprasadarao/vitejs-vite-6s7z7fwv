import React, { useState } from 'react';

const SignIn = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [apiError, setApiError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  console.log("email", email);
  console.log("password", password);
  const handleSubmit = async (e) => {
    e.preventDefault();

  setEmailError('');
  setPasswordError('');
  setApiError('');

  if (!email) {
    setEmailError('Please enter your email');
    return;
  }
  if (!password) {
    setPasswordError('Please enter your password');
    return;
  }
    setLoading(true);
    setApiError('');

    try {
      const response = await fetch('https://dev-api.peepul.farm/v1.0/users/signin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();
        console.log(data.errors);
      if (!response.ok) {
            if (response.status === 401) {
             setApiError(data.message || 'Invalid email or password');
           }
        if (data.errors) {
        setEmailError(data.errors.email || '');
        setPasswordError(data.errors.password || '');
      }
      } else {
        alert('Login Successful! Token: ' + data.token);
      }
    } catch (error) {
      setApiError('Network error: ' + error.message);
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center custom-gradient relative">
      <div className="absolute top-1 left-0 w-full flex justify-center">
        <img src="/sky-elements.svg" alt="sky" className="w-96" />
      </div>

      <div className="flex flex-col items-center mb-2">
        <img src="/logo.svg" alt="Peepul Logo" className="w-20 h-20" />
      </div>

      <div className="w-80">
        <h3 className="text-2xl font-semibold text-gray-600 mb-2">Sign in</h3>
        <p className="text-sm text-gray-500 mb-4">Please enter your details</p>

        <div className="">
          <input
            type="email"
            placeholder="Email"
            className="w-full px-3 py-2  border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          {/* <p className="text-red-600 text-sm min-h-[5px]">{email}</p> */}
          <p className="text-red-600 text-sm min-h-[5px]">{emailError || '\u00A0'}</p>
        </div>

        <div className="relative">
          <input
            type={showPassword ? 'text' : 'password'}
            placeholder="Password"
            className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-400 pr-10"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/3 transform -translate-y-1/3 text-gray-600 hover:text-gray-800 transition-colors"
            aria-label={showPassword ? 'Hide password' : 'Show password'}
          >
            {showPassword ? (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 11-4.243-4.243m4.242 4.242L9.88 9.88"
                />
              </svg>
            ) : (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M2.458 12C3.732 7.943 7.523 5 12 5c4.477 0 8.268 2.943 9.542 7-1.274 4.057-5.065 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                />
              </svg>
            )}
          </button>
          <p className="text-red-600 text-sm min-h-[5px]">{passwordError || '\u00A0'}</p>
        </div>

        {apiError && <p className="text-red-600 text-sm mb-2">{apiError}</p>}

        <button
          type="button"
          onClick={handleSubmit}
          className="w-full bg-rose-800 text-white py-2 rounded hover:bg-green-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={loading}
        >
          {loading ? 'Signing In...' : 'Sign In'}
        </button>
      </div>

      <div className="absolute bottom-0">
        <img src="/farmer.svg" alt="farmer" className="w-80" />
      </div>
    </div>
  );
};

export default SignIn;