import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const SignUp = () => {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const handleSignUp = async (event: React.FormEvent) => {
    event.preventDefault();

    try {
      const response = await fetch("http://localhost:5000/api/auth/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, password }),
      });

      if (response.ok) {
        const data = await response.json();
        //store the JWT token in the local storage, username and userId can also be stored
        localStorage.setItem("token", data.token);
        alert("Sign-up successful!");
        // Redirect to notes page after sign-up
        navigate("/notes"); 
      } else {
        alert("Sign-up failed. Please try again.");
      }
    } catch (error) {
      console.log(error);
      alert("An error occurred during sign-up.");
    }
  };

  return (
    <div className="App-SignUp">
      <h1 className="Signup-text">Sign Up</h1>
      <form className="Signup-form" onSubmit={handleSignUp}>
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
        <button type="submit">Sign Up</button>
      </form>
    </div>
  );
};

export default SignUp;
