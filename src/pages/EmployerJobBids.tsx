// src/pages/EmployerJobBids.tsx
import { useEffect, useState } from "react";
import {
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  CardActions,
  Paper,
  Avatar,
  Box,
  Rating,
  Button,
} from "@mui/material";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import api from "../api";
import { Job } from "../entities/job";
import { Bid } from "../entities/bid";

const EmployerJobBids = () => {
  const { id } = useParams<{ id: string }>(); // job id from URL
  const [job, setJob] = useState<Job | null>(null);
  const [bids, setBids] = useState<Bid[]>([]);
  const [contract, setContract] = useState<any | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (id) {
      // Fetch job details
      api
        .get(`/jobs/${id}`)
        .then((response) => {
          const { job, bids, contract } = response.data.data;
          setJob(job);
          setBids(bids || []);
          setContract(contract || null);
        })
        .catch((error) => {
          console.error("Error fetching job details:", error);
          toast.error("Failed to fetch job details.");
        });
    }
  }, [id]);

  const handleFreelancerClick = (freelancerId: number) => {
    navigate(`/profile/${freelancerId}`);
  };

  const updateBidStatus = async (bidId: number, status: string) => {
    try {
      if (status === "rejected") {
        await api.put(`/job-bids/${bidId}/status`, { status });
        toast.success(`Bid ${status} successfully.`);
        setBids((prevBids) =>
          prevBids.map((bid) => (bid.id === bidId ? { ...bid, status } : bid))
        );
      }
      if (status === "accepted") {
        navigate(`/create-contract/${bidId}`);
      }
    } catch (error) {
      console.error("Error updating bid status:", error);
      toast.error("Failed to update bid status.");
    }
  };

  return (
    <Container sx={{ mt: 4 }}>
      {job ? (
        <Paper sx={{ p: 3, mb: 4, borderRadius: 2, boxShadow: 3 }}>
          <Typography variant="h4" gutterBottom>
            {job.jobTitle}
          </Typography>
          <Typography variant="body1" sx={{ mb: 1 }}>
            {job.jobDescription}
          </Typography>
          <Typography variant="subtitle1" sx={{ mb: 1 }}>
            Budget: {job.budget}
          </Typography>
          <Typography variant="subtitle2" color="text.secondary">
            Deadline: {job.deadline?.join("-")}
          </Typography>
        </Paper>
      ) : (
        <Typography>Loading job details...</Typography>
      )}

      <Typography variant="h5" gutterBottom>
        Bids for this Job
      </Typography>
      {bids.length > 0 ? (
        <Grid container spacing={3}>
          {bids.map((bid) => (
            <Grid item key={bid.id} xs={12} sm={6} md={4}>
              <Card sx={{ borderRadius: 2, boxShadow: 2, cursor: "pointer" }}>
                <CardContent
                  onClick={() =>
                    bid.freelancer.id !== undefined &&
                    handleFreelancerClick(bid.freelancer.id)
                  }
                >
                  <Typography variant="h6">
                    Bid Amount: {bid.bidAmount}
                  </Typography>
                  <Typography variant="body2" sx={{ mt: 1 }}>
                    Deposit Amount: {bid.depositAmount || "Not specified"}
                  </Typography>
                  <Typography variant="body2" sx={{ mt: 1 }}>
                    Final Payment: {bid.finalPaymentAmount || "Not specified"}
                  </Typography>

                  <Typography variant="body2" sx={{ mt: 1 }}>
                    Message: {bid.message}
                  </Typography>
                  {bid.proposedStartDate && bid.proposedEndDate && (
                    <Typography variant="body2" sx={{ mt: 1 }}>
                      Proposed Period:&nbsp;
                      {new Date(
                        bid.proposedStartDate[0],
                        bid.proposedStartDate[1] - 1,
                        bid.proposedStartDate[2]
                      ).toLocaleDateString()}
                      &nbsp;to&nbsp;
                      {new Date(
                        bid.proposedEndDate[0],
                        bid.proposedEndDate[1] - 1,
                        bid.proposedEndDate[2]
                      ).toLocaleDateString()}
                    </Typography>
                  )}
                  {bid.supportAvailability && (
                    <Typography variant="body2" sx={{ mt: 1 }}>
                      Support: {bid.supportAvailability}
                    </Typography>
                  )}
                  {bid.additionalPolicy && (
                    <Typography variant="body2" sx={{ mt: 1 }}>
                      Policy: {bid.additionalPolicy}
                    </Typography>
                  )}
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ mt: 1 }}
                  >
                    Status: {bid.status}
                  </Typography>
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      mt: 2,
                      cursor: "pointer",
                    }}
                  >
                    {bid.freelancer.profilePictureUrl ? (
                      <Avatar
                        src={bid.freelancer.profilePictureUrl}
                        alt={bid.freelancer.fullName}
                        sx={{ mr: 1 }}
                      />
                    ) : (
                      <Avatar sx={{ mr: 1 }}>
                        {(bid.freelancer.fullName ?? "")
                          .split(" ")
                          .map((n) => n.charAt(0))
                          .join("")}
                      </Avatar>
                    )}
                    <Box>
                      <Typography variant="subtitle2">
                        {bid.freelancer.fullName}
                      </Typography>
                      {bid.freelancer.rating !== null &&
                      bid.freelancer.rating !== undefined ? (
                        <Box sx={{ display: "flex", alignItems: "center" }}>
                          <Rating
                            name="read-only"
                            value={Number(bid.freelancer.rating)}
                            precision={0.1}
                            readOnly
                            size="small"
                          />
                          <Typography variant="body2" sx={{ ml: 0.5 }}>
                            {bid.freelancer.rating.toFixed(1)}
                          </Typography>
                        </Box>
                      ) : (
                        <Typography variant="body2">No rating</Typography>
                      )}
                    </Box>
                  </Box>
                </CardContent>
                {!contract && bid.status === "pending" && (
                  <CardActions sx={{ justifyContent: "space-between" }}>
                    <Button
                      size="small"
                      variant="contained"
                      color="success"
                      onClick={(e) => {
                        e.stopPropagation();
                        updateBidStatus(bid.id, "accepted");
                      }}
                    >
                      Accept & Create Contract
                    </Button>
                    <Button
                      size="small"
                      variant="contained"
                      color="error"
                      onClick={(e) => {
                        e.stopPropagation();
                        updateBidStatus(bid.id, "rejected");
                      }}
                    >
                      Reject
                    </Button>
                  </CardActions>
                )}
              </Card>
            </Grid>
          ))}
        </Grid>
      ) : (
        <Typography>No bids for this job yet.</Typography>
      )}
    </Container>
  );
};

export default EmployerJobBids;
