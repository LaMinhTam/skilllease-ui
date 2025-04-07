// src/pages/MyContracts.tsx
import { useEffect, useState, useContext } from "react";
import {
  Container,
  Typography,
  Grid,
  Paper,
  Button,
  Chip,
  Divider,
  Box,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import api from "../api";
import { toast } from "react-toastify";
import { AuthContext } from "../context/AuthContext";

const formatDate = (dateArr: number[]) =>
  new Date(
    dateArr[0],
    dateArr[1] - 1,
    dateArr[2],
    dateArr[3],
    dateArr[4]
  ).toLocaleDateString();

const MyContracts = () => {
  const [contracts, setContracts] = useState<any[]>([]);
  const { user } = useContext(AuthContext)!;
  const navigate = useNavigate();
  useEffect(() => {
    api
      .get("/contracts")
      .then((response) => {
        setContracts(response.data.data || []);
      })
      .catch((error) => {
        console.error("Error fetching contracts:", error);
        toast.error("Failed to load contracts.");
      });
  }, [user]);

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography
        variant="h3"
        gutterBottom
        align="center"
        color="primary"
        sx={{ fontWeight: 700, mb: 4 }}
      >
        My Contracts
      </Typography>
      {contracts.length === 0 ? (
        <Typography variant="h6" align="center">
          No contracts found.
        </Typography>
      ) : (
        <Grid container spacing={4}>
          {contracts.map((item, index) => {
            // Destructure job and contract from each item
            const { job, contract } = item;
            return (
              <Grid item xs={12} sm={6} md={4} key={index}>
                <Paper
                  sx={{
                    p: 3,
                    borderRadius: 3,
                    boxShadow: 6,
                    position: "relative",
                    transition: "transform 0.3s, box-shadow 0.3s",
                    "&:hover": { transform: "scale(1.02)", boxShadow: 8 },
                    background: "linear-gradient(135deg, #f9f9f9, #ffffff)",
                  }}
                >
                  <Box
                    sx={{
                      mb: 2,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                    }}
                  >
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                      Contract #{contract.id}
                    </Typography>
                    <Chip
                      label={contract.status}
                      color={
                        contract.status === "NEGOTIATION"
                          ? "warning"
                          : "success"
                      }
                      size="small"
                      sx={{ fontWeight: 600 }}
                    />
                  </Box>

                  <Divider sx={{ my: 1 }} />

                  <Box sx={{ my: 2 }}>
                    <Typography
                      variant="subtitle2"
                      sx={{ fontWeight: 600, color: "text.secondary" }}
                    >
                      Job Title:
                    </Typography>
                    <Typography variant="body1" sx={{ ml: 0.5 }}>
                      {job.jobTitle}
                    </Typography>
                  </Box>

                  {user?.role === "EMPLOYER" && (
                    <Box sx={{ my: 2 }}>
                      <Typography
                        variant="subtitle2"
                        sx={{ fontWeight: 600, color: "text.secondary" }}
                      >
                        Freelancer:
                      </Typography>
                      <Typography variant="body1" sx={{ ml: 0.5 }}>
                        {contract.freelancer.fullName}
                      </Typography>
                    </Box>
                  )}

                  <Box sx={{ my: 2 }}>
                    <Typography
                      variant="subtitle2"
                      sx={{ fontWeight: 600, color: "text.secondary" }}
                    >
                      Contract Period:
                    </Typography>
                    <Typography variant="body1" sx={{ ml: 0.5 }}>
                      {formatDate(contract.contractStartDate)} -{" "}
                      {formatDate(contract.contractEndDate)}
                    </Typography>
                  </Box>

                  <Box sx={{ my: 2 }}>
                    <Typography
                      variant="subtitle2"
                      sx={{ fontWeight: 600, color: "text.secondary" }}
                    >
                      Financials:
                    </Typography>
                    <Typography variant="body1" sx={{ ml: 0.5 }}>
                      Deposit: ${contract.depositAmount} | Final Payment: $
                      {contract.finalPaymentAmount}
                    </Typography>
                  </Box>

                  <Box sx={{ mt: 3, textAlign: "center" }}>
                    <Button
                      sx={{ textTransform: "none" }}
                      variant="contained"
                      color="primary"
                      size="large"
                      onClick={() => navigate(`/contract/${contract.id}`)}
                    >
                      View Details
                    </Button>
                  </Box>

                  {/* Show button to navigate to MilestoneDashboard only if both parties accepted */}
                  {contract.employerAccepted && contract.freelancerAccepted && (
                    <Box sx={{ mt: 3, textAlign: "center" }}>
                      <Button
                        variant="contained"
                        color="primary"
                        size="large"
                        sx={{ textTransform: "none" }}
                        onClick={() =>
                          navigate(`/contract/${contract.id}/milestones`)
                        }
                      >
                        View Milestones
                      </Button>
                    </Box>
                  )}
                </Paper>
              </Grid>
            );
          })}
        </Grid>
      )}
    </Container>
  );
};

export default MyContracts;
