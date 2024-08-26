import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const Login = () => {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async (event: React.FormEvent) => {
    event.preventDefault();

    try {
      const response = await fetch("http://localhost:5000/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, password }),
      });

      if (response.ok) {
        const data = await response.json();
        //store the JWT token in the local storage and username
        localStorage.setItem("token", data.token);
        // Redirect to notes page after login
        navigate("/notes"); 
      } else {
        alert("Invalid username or password");
      }
    } catch (error) {
      console.log(error);
      alert("An error occurred during login.");
    }
  };

  return (
    <div className="App-Login">
      <h1 className="Login-text">Login</h1>
      <form className="Login-form" onSubmit={handleLogin}>
      <h3 className="Form-Username-Text">Username</h3>
        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
        />
        <h3 className="Form-Password-Text">Password</h3>
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button type="submit">Login</button>
      </form>
    </div>
  );
};

export default Login;
