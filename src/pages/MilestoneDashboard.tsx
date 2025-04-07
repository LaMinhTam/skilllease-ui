import React, { useEffect, useState, useContext } from "react";
import {
  Container,
  Typography,
  Grid,
  Paper,
  Button,
  Chip,
  Divider,
  Box,
  Stack,
  IconButton,
} from "@mui/material";
import { useParams, useNavigate } from "react-router-dom";
import api from "../api";
import { toast } from "react-toastify";
import { AuthContext } from "../context/AuthContext";
import { Delete } from "@mui/icons-material";

const formatDate = (dateArr: number[]) =>
  new Date(
    dateArr[0],
    dateArr[1] - 1,
    dateArr[2],
    dateArr[3],
    dateArr[4]
  ).toLocaleString();

const MilestoneDashboard = () => {
  const { contractId } = useParams<{ contractId: string }>();
  const [milestones, setMilestones] = useState<any[]>([]);
  const { user } = useContext(AuthContext)!;
  const navigate = useNavigate();

  const isEmployer = user?.role === "EMPLOYER";
  const isFreelancer = user?.role === "FREELANCER";

  useEffect(() => {
    if (contractId) {
      fetchMilestones();
    }
  }, [contractId]);

  const fetchMilestones = async () => {
    try {
      const response = await api.get(`/milestones?contractId=${contractId}`);
      setMilestones(response.data.data || []);
    } catch (error) {
      console.error("Error fetching milestones:", error);
      toast.error("Failed to load milestones.");
    }
  };

  const handleRemoveMilestone = async (
    milestoneId: string,
    e: React.MouseEvent
  ) => {
    e.stopPropagation();
    if (!window.confirm("Are you sure you want to delete this milestone?"))
      return;
    try {
      await api.delete(`/milestones/${milestoneId}`);
      toast.success("Milestone deleted successfully");
      fetchMilestones();
    } catch (error) {
      console.error("Error deleting milestone:", error);
      toast.error("Failed to delete milestone.");
    }
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4 }}>
      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="center"
        sx={{ mb: 3 }}
      >
        <Typography variant="h3" color="primary" sx={{ fontWeight: 600 }}>
          Milestones
        </Typography>
        {isEmployer && (
          <Button
            variant="contained"
            color="primary"
            onClick={() => navigate(`/create-milestone/${contractId}`)}
          >
            Create Milestone
          </Button>
        )}
      </Stack>

      {milestones.length === 0 ? (
        <Typography variant="h6" align="center">
          No milestones found for this contract.
        </Typography>
      ) : (
        <Grid container spacing={3}>
          {milestones.map((ms, index) => {
            const statusLower = ms.reviewStatus.toLowerCase();
            return (
              <Grid item xs={12} sm={6} md={4} key={ms.id}>
                <Box
                  sx={{
                    height: "100%",
                    display: "flex",
                    flexDirection: "column",
                  }}
                >
                  <Paper
                    onClick={() => navigate(`/milestone-detail/${ms.id}`)}
                    sx={{
                      p: 3,
                      borderRadius: 3,
                      boxShadow: ms.finalMilestone ? 6 : 3,
                      position: "relative",
                      cursor: "pointer",
                      backgroundColor: ms.finalMilestone ? "#f3e5f5" : "white",
                      border: ms.finalMilestone
                        ? "2px solid #9c27b0"
                        : "1px solid #e0e0e0",
                      transition: "transform 0.2s, box-shadow 0.2s",
                      flex: 1,
                      display: "flex",
                      flexDirection: "column",
                      "&:hover": {
                        transform: "scale(1.02)",
                        boxShadow: 8,
                      },
                    }}
                  >
                    {isEmployer && (
                      <IconButton
                        color="error"
                        onClick={(e) => handleRemoveMilestone(ms.id, e)}
                        sx={{
                          position: "absolute",
                          top: 20,
                          right: 8,
                        }}
                      >
                        <Delete />
                      </IconButton>
                    )}

                    <Stack
                      direction="row"
                      justifyContent="space-between"
                      alignItems="center"
                    >
                      <Typography variant="h6">
                        Milestone #{index + 1}
                      </Typography>
                    </Stack>

                    <Divider sx={{ my: 1 }} />

                    <Box sx={{ my: 1 }}>
                      <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                        Title:
                      </Typography>
                      <Typography variant="body2">{ms.title}</Typography>
                    </Box>

                    <Box sx={{ my: 1 }}>
                      <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                        Description:
                      </Typography>
                      <Typography variant="body2">{ms.description}</Typography>
                    </Box>

                    {ms.dueDate && (
                      <Box sx={{ my: 1 }}>
                        <Typography
                          variant="subtitle2"
                          sx={{ fontWeight: 600 }}
                        >
                          Due Date:
                        </Typography>
                        <Typography variant="body2">
                          {formatDate(ms.dueDate)}
                        </Typography>
                      </Box>
                    )}

                    {ms.deliverableUrl && (
                      <Box sx={{ my: 1 }}>
                        <Typography
                          variant="subtitle2"
                          sx={{ fontWeight: 600 }}
                        >
                          Deliverable:
                        </Typography>
                        <Typography variant="body2">
                          <a
                            href={ms.deliverableUrl}
                            target="_blank"
                            rel="noreferrer"
                          >
                            View Deliverable
                          </a>
                        </Typography>
                      </Box>
                    )}

                    {ms.feedback?.trim() && (
                      <Box sx={{ my: 1 }}>
                        <Typography
                          variant="subtitle2"
                          sx={{ fontWeight: 600 }}
                        >
                          Employer Feedback:
                        </Typography>
                        <Typography variant="body2">{ms.feedback}</Typography>
                      </Box>
                    )}

                    {ms.fulfillmentComment?.trim() && (
                      <Box sx={{ my: 1 }}>
                        <Typography
                          variant="subtitle2"
                          sx={{ fontWeight: 600 }}
                        >
                          Freelancer Comment:
                        </Typography>
                        <Typography variant="body2">
                          {ms.fulfillmentComment}
                        </Typography>
                      </Box>
                    )}

                    {ms.finalMilestone && (
                      <Box sx={{ my: 1 }}>
                        <Chip
                          label="FINAL MILESTONE"
                          color="secondary"
                          size="small"
                        />
                      </Box>
                    )}

                    <Box sx={{ mt: "auto", textAlign: "center" }}>
                      <Chip
                        label={ms.reviewStatus.toUpperCase()}
                        color={
                          statusLower === "pending"
                            ? "warning"
                            : statusLower === "in_progress"
                            ? "primary"
                            : statusLower === "approved"
                            ? "success"
                            : "error"
                        }
                        size="small"
                      />
                    </Box>
                  </Paper>
                </Box>
              </Grid>
            );
          })}
        </Grid>
      )}
    </Container>
  );
};

export default MilestoneDashboard;
