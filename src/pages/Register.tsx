import { useState, useContext } from "react";
import { TextField, Button, Container, Typography, MenuItem } from "@mui/material";
import api from "../api";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { toast } from "react-toastify";

const Register = () => {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("EMPLOYER"); // default selection
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const authContext = useContext(AuthContext);

  const validateEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const handleSubmit = async (e: React.FormEvent) => {
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
      const response = await api.post("/auth/register", {
        email,
        password,
        fullName,
        role,
      });
      // The API returns a payload with tokens and userResponseDTO.
      const { accessToken, refreshToken, userResponseDTO } = response.data.data;
      // Build a user object that includes tokens.
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
      if (authContext) {
        authContext.login(userData);
      }
      toast.success("Registration successful! Please upload your profile picture.");
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
        <TextField
          fullWidth
          label="Full Name"
          margin="normal"
          onChange={(e) => setFullName(e.target.value)}
          required
        />
        <TextField
          fullWidth
          label="Email"
          type="email"
          margin="normal"
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <TextField
          fullWidth
          label="Password"
          type="password"
          margin="normal"
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <TextField
          fullWidth
          label="Confirm Password"
          type="password"
          margin="normal"
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
        />
        <TextField
          select
          fullWidth
          label="Role"
          margin="normal"
          value={role}
          onChange={(e) => setRole(e.target.value)}
        >
          <MenuItem value="EMPLOYER">Employer</MenuItem>
          <MenuItem value="FREELANCER">Freelancer</MenuItem>
        </TextField>
        <Button fullWidth variant="contained" color="primary" type="submit">
          Register
        </Button>
      </form>
    </Container>
  );
};

export default Register;
