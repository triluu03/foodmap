import { useState } from "react";
import "./App.css";
import "./Registration.css";

import { tables, reducers } from "./module_bindings";
import { useReducer, useTable, useSpacetimeDB } from "spacetimedb/react";

function Registration() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const registerUser = useReducer(reducers.registerUser);

  const handleSubmit = async (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    console.log("Registration submitted:", { username, email });

    try {
      const response = await registerUser({ username, email });
      console.log("Response:", response);
    } catch (err) {
      console.log("Got error:", err);
    }

    setIsSubmitting(false);
    setUsername("");
    setEmail("");
  };

  return (
    <div className="registration-container">
      <h2>Create an Account</h2>
      <p className="registration-subtitle">
        Join us to discover and share great food spots
      </p>

      <form className="registration-form" onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="username">Username</label>
          <input
            type="text"
            id="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Enter your username"
            required
            disabled={isSubmitting}
          />
        </div>

        <div className="form-group">
          <label htmlFor="email">Email</label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email"
            required
            disabled={isSubmitting}
          />
        </div>

        <button
          type="submit"
          className="registration-button"
          disabled={isSubmitting}
        >
          {isSubmitting ? "Creating Account..." : "Sign Up"}
        </button>
      </form>
    </div>
  );
}

export default Registration;
