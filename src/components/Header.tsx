import { AppBar, Toolbar, Typography, Button } from "@mui/material";
import { Link, useNavigate } from "react-router-dom";
import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import logo from "../assets/strelive_logo.png";
const Header = () => {
  const auth = useContext(AuthContext);
  const navigate = useNavigate(); // Hook to navigate

  if (!auth) {
    throw new Error("AuthContext is missing. Wrap your component with AuthProvider.");
  }

  const { user, logout } = auth;

  return (
    <AppBar position="sticky">
      <Toolbar>
        {/* Clickable title that navigates to home */}
        <img 
          src={logo} 
          alt="Strelive Logo" 
          style={{ height: 40, cursor: "pointer" }} 
          onClick={() => navigate("/")} 
        />

        {user ? (
          <Button color="inherit" onClick={logout}>Logout</Button>
        ) : (
          <>
            <Button color="inherit" component={Link} to="/login">Login</Button>
            <Button color="inherit" component={Link} to="/register">Register</Button>
          </>
        )}
      </Toolbar>
    </AppBar>
  );
};

export default Header;
