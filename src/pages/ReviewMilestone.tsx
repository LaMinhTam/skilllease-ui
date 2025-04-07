// src/pages/ReviewMilestone.tsx
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Container,
  Typography,
  Paper,
  Box,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Stack,
  Divider,
} from "@mui/material";
import api from "../api";
import { toast } from "react-toastify";

const ReviewMilestone = () => {
  const { id } = useParams<{ id: string }>(); // milestone id
  const navigate = useNavigate();
  
  // Local state for review form
  const [reviewStatus, setReviewStatus] = useState<string>("approved");
  const [feedback, setFeedback] = useState("");
  const [milestone, setMilestone] = useState<any>(null);

  useEffect(() => {
    if (id) {
      // Optionally, load milestone details to display context.
      api.get(`/milestones/${id}`)
        .then((response) => {
          setMilestone(response.data.data);
        })
        .catch((error) => {
          console.error("Error loading milestone:", error);
          toast.error("Failed to load milestone details.");
        });
    }
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;
    try {
      const payload = { reviewStatus, feedback };
      await api.put(`/milestones/${id}/review`, payload);
      toast.success("Milestone review submitted successfully!");
      navigate(-1); // Go back to previous page (or navigate to milestones page)
    } catch (error) {
      console.error("Error reviewing milestone:", error);
      toast.error("Failed to submit review.");
    }
  };

  return (
    <Container maxWidth="sm" sx={{ mt: 4 }}>
      <Paper sx={{ p: 4, borderRadius: 3, boxShadow: 6 }}>
        <Typography variant="h4" align="center" gutterBottom color="primary">
          Review Milestone
        </Typography>
        {milestone && (
          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
              Title:
            </Typography>
            <Typography variant="body1">{milestone.title}</Typography>
            <Divider sx={{ my: 2 }} />
            <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
              Description:
            </Typography>
            <Typography variant="body1">{milestone.description}</Typography>
            {milestone.deliverableUrl && (
              <Box sx={{ mt: 2 }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                  Deliverable:
                </Typography>
                <Typography variant="body1">
                  <a href={milestone.deliverableUrl} target="_blank" rel="noreferrer">
                    View Deliverable
                  </a>
                </Typography>
              </Box>
            )}
          </Box>
        )}

        <Box component="form" onSubmit={handleSubmit}>
          <Stack spacing={2}>
            <FormControl fullWidth>
              <InputLabel id="review-status-label">Review Status</InputLabel>
              <Select
                labelId="review-status-label"
                value={reviewStatus}
                label="Review Status"
                onChange={(e) => setReviewStatus(e.target.value as string)}
                required
              >
                <MenuItem value="APPROVED">Approved</MenuItem>
                <MenuItem value="REJECTED">Rejected</MenuItem>
              </Select>
            </FormControl>
            <TextField
              fullWidth
              label="Feedback"
              multiline
              rows={4}
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              required
            />
            <Button type="submit" variant="contained" color="primary">
              Submit Review
            </Button>
          </Stack>
        </Box>
      </Paper>
    </Container>
  );
};

export default ReviewMilestone;
