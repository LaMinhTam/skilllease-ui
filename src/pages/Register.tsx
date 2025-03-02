import { useState, useContext } from "react";
import { TextField, Button, Container, Typography } from "@mui/material";
import api from "../api";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

const Register = () => {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const authContext = useContext(AuthContext);

  const validateEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const handleSubmit = async (e: { preventDefault: () => void }) => {
    e.preventDefault();
    setError("");

    if (!validateEmail(email)) {
      setError("Invalid email format.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    try {
      const response = await api.post("/auth/register", { username, email, password });
      const { accessToken, refreshToken, userResponseDTO } = response.data.data;

      // Store user data in AuthContext
      if (authContext) {
        authContext.login({
          email: userResponseDTO.email,
          accessToken,
          refreshToken,
          roles: userResponseDTO.roles,
        });
      }

      alert("Registration successful! Please upload your profile picture.");
      navigate("/upload-profile-picture", { replace: true });
    } catch (error) {
      setError("Registration failed!");
    }
  };

  return (
    <Container maxWidth="xs">
      <Typography variant="h4">Register</Typography>
      {error && <Typography color="error">{error}</Typography>}
      <form onSubmit={handleSubmit}>
        <TextField fullWidth label="Username" margin="normal" onChange={(e) => setUsername(e.target.value)} />
        <TextField fullWidth label="Email" type="email" margin="normal" onChange={(e) => setEmail(e.target.value)} />
        <TextField fullWidth type="password" label="Password" margin="normal" onChange={(e) => setPassword(e.target.value)} />
        <TextField fullWidth type="password" label="Confirm Password" margin="normal" onChange={(e) => setConfirmPassword(e.target.value)} />
        <Button fullWidth variant="contained" color="primary" type="submit">
          Register
        </Button>
      </form>
    </Container>
  );
};

export default Register;
