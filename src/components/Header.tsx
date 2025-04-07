import React, { useState, useContext } from "react";
import {
  AppBar,
  Toolbar,
  Button,
  Avatar,
  Box,
  Typography,
  IconButton,
  Menu,
  MenuItem,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import logo from "../assets/skilllease-logo.png";
import MenuIcon from "@mui/icons-material/Menu";
import WorkIcon from "@mui/icons-material/Work";
import BuildIcon from "@mui/icons-material/Build";
import LogoutIcon from "@mui/icons-material/Logout";
import AccountBalanceWalletIcon from "@mui/icons-material/AccountBalanceWallet";
import AccountCircleIcon from "@mui/icons-material/AccountCircle"; // For clickable name
import { useWallet } from "../utils/useWallet";

const Header = () => {
  const auth = useContext(AuthContext);
  const navigate = useNavigate();

  if (!auth) {
    throw new Error(
      "AuthContext is missing. Wrap your component with AuthProvider."
    );
  }

  const { user, logout } = auth;
  const wallet = useWallet();

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [menuAnchorEl, setMenuAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);
  const openMenu = Boolean(menuAnchorEl);

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleUserMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setMenuAnchorEl(event.currentTarget);
  };

  const handleUserMenuClose = () => {
    setMenuAnchorEl(null);
  };

  // Returns an Avatar using profilePictureUrl if available or initials.
  const getUserAvatar = () => {
    if (user?.profilePictureUrl) {
      return <Avatar alt={user.fullName} src={user.profilePictureUrl} />;
    }
    if (user?.fullName) {
      const initials = user.fullName
        .split(" ")
        .map((name) => name.charAt(0))
        .join("");
      return <Avatar>{initials}</Avatar>;
    }
    return null;
  };

  return (
    <AppBar
      position="sticky"
      sx={{
        background: "linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)",
        boxShadow: 3,
      }}
    >
      <Toolbar>
        <Box
          component="img"
          src={logo}
          alt="Skilllease Logo"
          sx={{ height: 80, cursor: "pointer" }}
          onClick={() => navigate("/")}
        />
        <Box sx={{ flexGrow: 1 }} />

        <Box
          sx={{
            display: { xs: "none", md: "flex" },
            alignItems: "center",
            gap: 2,
          }}
        >
          {user && user.role === "EMPLOYER" && (
            <>
              <Button
                color="inherit"
                startIcon={<WorkIcon />}
                sx={{ textTransform: "none" }}
                onClick={() => navigate("/post-job")}
              >
                Post Job
              </Button>
              <Button
                color="inherit"
                startIcon={<WorkIcon />}
                sx={{ textTransform: "none" }}
                onClick={() => navigate("/employer-jobs")}
              >
                My Jobs
              </Button>
              <Button
                color="inherit"
                startIcon={<WorkIcon />}
                sx={{ textTransform: "none" }}
                onClick={() => navigate("/my-contracts")}
              >
                My Contracts
              </Button>
            </>
          )}
          {user && user.role === "FREELANCER" && (
            <>
              <Button
                color="inherit"
                startIcon={<BuildIcon />}
                sx={{ textTransform: "none" }}
                onClick={() => navigate("/post-service")}
              >
                Post Service
              </Button>
              <Button
                color="inherit"
                startIcon={<BuildIcon />}
                sx={{ textTransform: "none" }}
                onClick={() => navigate("/my-services")}
              >
                My Services
              </Button>
              <Button
                color="inherit"
                startIcon={<WorkIcon />}
                sx={{ textTransform: "none" }}
                onClick={() => navigate("/my-contracts")}
              >
                My Contracts
              </Button>
            </>
          )}
          <Button
            color="inherit"
            startIcon={<AccountBalanceWalletIcon />}
            onClick={() => navigate("/recharge")}
          >
            {wallet ? `${wallet.balance.toLocaleString()}₫` : "Loading..."}
          </Button>

          {user && (
            <Box>
              <Button
                color="inherit"
                startIcon={getUserAvatar() || <AccountCircleIcon />}
                onClick={handleUserMenuOpen}
                sx={{ textTransform: "none" }}
              >
                {user.fullName}
              </Button>
              <Menu
                anchorEl={menuAnchorEl}
                open={openMenu}
                onClose={handleUserMenuClose}
                anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
                transformOrigin={{ vertical: "top", horizontal: "right" }}
              >
                <MenuItem onClick={logout}>Logout</MenuItem>
              </Menu>
            </Box>
          )}
        </Box>

        {/* Mobile Navigation */}
        <Box sx={{ display: { xs: "flex", md: "none" } }}>
          <IconButton color="inherit" onClick={handleMenuOpen} size="large">
            <MenuIcon />
          </IconButton>
          <Menu
            anchorEl={anchorEl}
            open={open}
            onClose={handleMenuClose}
            anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
            transformOrigin={{ vertical: "top", horizontal: "right" }}
          >
            {user && user.role === "EMPLOYER" && (
              <Box>
                <MenuItem onClick={() => navigate("/post-job")}>
                  Post Job
                </MenuItem>
                <MenuItem onClick={() => navigate("/employer-jobs")}>
                  My Jobs
                </MenuItem>
              </Box>
            )}
            {user && user.role === "FREELANCER" && (
              <Box>
                <MenuItem onClick={() => navigate("/post-service")}>
                  Post Service
                </MenuItem>
                <MenuItem onClick={() => navigate("/my-services")}>
                  My Services
                </MenuItem>
              </Box>
            )}
            <MenuItem onClick={() => navigate("/recharge")}>Recharge</MenuItem>
            {user && <MenuItem onClick={logout}>Logout</MenuItem>}
          </Menu>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Header;
