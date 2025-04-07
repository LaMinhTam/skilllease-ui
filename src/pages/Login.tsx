import { useState, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { TextField, Button, Container, Typography } from "@mui/material";
import api from "../api";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

const Login = () => {
  const auth = useContext(AuthContext);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  if (!auth) {
    throw new Error("AuthContext is missing. Wrap your component with AuthProvider.");
  }

  const { login } = auth;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await api.post("/auth/login", { email, password });
      // API response contains accessToken, refreshToken, and userResponseDTO.
      const { accessToken, refreshToken, userResponseDTO } = response.data.data;
      const userData = {
        id: userResponseDTO.id, // if available
        fullName: userResponseDTO.fullName,
        email: userResponseDTO.email,
        role: userResponseDTO.role,
        cvUrl: userResponseDTO.cvUrl,
        profilePictureUrl: userResponseDTO.profilePictureUrl,
        accessToken,
        refreshToken,
      };
      login(userData);
      navigate("/");
    } catch (error) {
      toast.error("Invalid email or password.");
    }
  };

  return (
    <Container maxWidth="xs">
      <Typography variant="h4">Login</Typography>
      <form onSubmit={handleSubmit}>
        <TextField
          fullWidth
          label="Email"
          margin="normal"
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <TextField
          fullWidth
          type="password"
          label="Password"
          margin="normal"
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <Button fullWidth variant="contained" color="primary" type="submit">
          Login
        </Button>
      </form>
    </Container>
  );
};

export default Login;
