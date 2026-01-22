import React, { useState } from 'react';

const Signup = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [nameError, setNameError] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [apiError, setApiError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSignup = async (e) => {
    e.preventDefault();

    // reset errors
    setNameError('');
    setEmailError('');
    setPasswordError('');
    setApiError('');

    // validations
    if (!name) {
      setNameError('Please enter your name');
      return;
    }

    if (!email) {
      setEmailError('Please enter your email');
      return;
    }

    if (!password) {
      setPasswordError('Please enter password');
      return;
    }

    if (password.length < 6) {
      setPasswordError('Password must be at least 6 characters');
      return;
    }

    if (password !== confirmPassword) {
      setPasswordError('Passwords do not match');
      return;
    }

    setLoading(true);

    // simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // get existing users
    const existingUsers =
      JSON.parse(localStorage.getItem('dummy_users')) || [];

    // check duplicate email
    const emailExists = existingUsers.find(
      (user) => user.email === email
    );

    if (emailExists) {
      setApiError('Email already registered');
      setLoading(false);
      return;
    }

    // create new user
    const newUser = {
      name,
      email,
      password, // (dummy only – real app lo encrypt cheyali)
      token: 'dummy_token_' + Date.now(),
    };

    // save user
    localStorage.setItem(
      'dummy_users',
      JSON.stringify([...existingUsers, newUser])
    );

    alert("Signup successful! Please login.");
navigate("/");


    // reset form
    setName('');
    setEmail('');
    setPassword('');
    setConfirmPassword('');

    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="w-80 bg-white p-6 rounded shadow">
        <h3 className="text-2xl font-semibold text-gray-700 mb-2">
          Sign up
        </h3>
        <p className="text-sm text-gray-500 mb-4">
          Create your account
        </p>

        {/* NAME */}
        <input
          type="text"
          placeholder="Name"
          className="w-full px-3 py-2 border rounded mb-1"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <p className="text-red-600 text-sm min-h-[5px]">
          {nameError || '\u00A0'}
        </p>

        {/* EMAIL */}
        <input
          type="email"
          placeholder="Email"
          className="w-full px-3 py-2 border rounded mb-1"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <p className="text-red-600 text-sm min-h-[5px]">
          {emailError || '\u00A0'}
        </p>

        {/* PASSWORD */}
        <input
          type="password"
          placeholder="Password"
          className="w-full px-3 py-2 border rounded mb-1"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        {/* CONFIRM PASSWORD */}
        <input
          type="password"
          placeholder="Confirm Password"
          className="w-full px-3 py-2 border rounded mb-1"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
        />

        <p className="text-red-600 text-sm min-h-[5px]">
          {passwordError || '\u00A0'}
        </p>

        {/* API ERROR */}
        {apiError && (
          <p className="text-red-600 text-sm mb-2">{apiError}</p>
        )}

        {/* SUBMIT */}
        <button
          onClick={handleSignup}
          disabled={loading}
          className="w-full bg-green-600 text-white py-2 rounded hover:bg-green-700 disabled:opacity-50"
        >
          {loading ? 'Creating account...' : 'Sign up'}
        </button>

        {/* LOGIN LINK */}
        <p className="text-sm text-center mt-4">
          Already have an account?
         <button onClick={handleSignIn}><span  className="text-blue-600 cursor-pointer hover:underline ml-1">
            Sign in
          </span></button> 
        </p>
      </div>
    </div>
  );
};

export default Signup;
