// src/pages/Home.tsx
import React, { useContext } from "react";
import { Container } from "@mui/material";
import { AuthContext } from "../context/AuthContext";
import FreelancerDashboard from "../components/freelancer/FreelancerDashboard";
import EmployerDashboard from "../components/employer/EmployerDashboard";

const Home = () => {
  const auth = useContext(AuthContext);

  return (
    <Container>
      {auth?.user?.role === "FREELANCER" ? (
        <FreelancerDashboard />
      ) : (
        <EmployerDashboard />
      )}
    </Container>
  );
};

export default Home;
