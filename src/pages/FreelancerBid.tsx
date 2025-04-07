// src/pages/FreelancerBid.tsx
import { useEffect, useState, FormEvent } from "react";
import {
  Container,
  Typography,
  TextField,
  Button,
  Box,
  Paper,
} from "@mui/material";
import { useParams, useNavigate } from "react-router-dom";
import api from "../api";
import { toast } from "react-toastify";
import { Job } from "../entities/job";

const FreelancerBid = () => {
  const { id } = useParams<{ id: string }>(); // job id from URL
  const navigate = useNavigate();
  const [job, setJob] = useState<Job | null>(null);
  const [bidAmount, setBidAmount] = useState("");
  const [message, setMessage] = useState("");
  // Extra fields
  const [proposedStartDate, setProposedStartDate] = useState("");
  const [proposedEndDate, setProposedEndDate] = useState("");
  const [supportAvailability, setSupportAvailability] = useState("");
  const [additionalPolicy, setAdditionalPolicy] = useState("");
  // New fields for deposit and final payment amounts.
  const [depositAmount, setDepositAmount] = useState("");
  const [finalPaymentAmount, setFinalPaymentAmount] = useState("");

  // Whenever bidAmount changes and is a valid number, set defaults.
  useEffect(() => {
    const bid = parseFloat(bidAmount);
    if (!isNaN(bid)) {
      const half = (bid / 2).toFixed(2);
      setDepositAmount(half);
      setFinalPaymentAmount(half);
    } else {
      setDepositAmount("");
      setFinalPaymentAmount("");
    }
  }, [bidAmount]);

  useEffect(() => {
    if (id) {
      api
        .get(`/jobs/${id}`)
        .then((response) => {
          setJob(response.data.data.job);
        })
        .catch((error) => {
          console.error("Error fetching job details:", error);
          toast.error("Failed to load job details.");
        });
    }
  }, [id]);

  // When deposit amount changes, update final payment so that deposit + final = bidAmount.
  const handleDepositChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setDepositAmount(value);
    const bid = parseFloat(bidAmount);
    const deposit = parseFloat(value);
    if (!isNaN(bid) && !isNaN(deposit)) {
      setFinalPaymentAmount((bid - deposit).toFixed(2));
    } else {
      setFinalPaymentAmount("");
    }
  };

  // When final payment amount changes, update deposit accordingly.
  const handleFinalPaymentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setFinalPaymentAmount(value);
    const bid = parseFloat(bidAmount);
    const finalPay = parseFloat(value);
    if (!isNaN(bid) && !isNaN(finalPay)) {
      setDepositAmount((bid - finalPay).toFixed(2));
    } else {
      setDepositAmount("");
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!id) {
      toast.error("Job ID is missing.");
      return;
    }
    // Build payload including the new fields
    const payload = {
      jobId: id,
      bidAmount,
      message,
      proposedStartDate: proposedStartDate || null,
      proposedEndDate: proposedEndDate || null,
      supportAvailability: supportAvailability || null,
      additionalPolicy: additionalPolicy || null,
      depositAmount: depositAmount,
      finalPaymentAmount: finalPaymentAmount,
    };
    try {
      await api.post("/job-bids", payload);
      toast.success("Bid submitted successfully!");
      navigate("/"); // or navigate to freelancer dashboard
    } catch (error) {
      console.error("Error submitting bid:", error);
      toast.error("Failed to submit bid.");
    }
  };

  const formatDate = (dateArray?: number[]) => {
    if (!dateArray || dateArray.length < 3) return null;
    
    // Add leading zeros if needed
    const year = dateArray[0];
    const month = dateArray[1].toString().padStart(2, '0');
    const day = dateArray[2].toString().padStart(2, '0');
    
    return `${year}-${month}-${day}T12:00`;
  };
  
  return (
    <Container sx={{ mt: 4 }}>
      {job ? (
        <Paper sx={{ p: 3 }}>
          <Typography variant="h4" gutterBottom>
            Bid on: {job.jobTitle}
          </Typography>
          <Typography variant="body1" sx={{ mb: 2 }}>
            {job.jobDescription}
          </Typography>
          <Typography variant="subtitle1" sx={{ mb: 2 }}>
            Budget: {job.budget} | Deadline: {job.deadline?.join("-")}
          </Typography>
          <Box component="form" onSubmit={handleSubmit}>
            <TextField
              fullWidth
              label="Bid Amount"
              margin="normal"
              type="number"
              value={bidAmount}
              onChange={(e) => setBidAmount(e.target.value)}
              required
            />

            <TextField
              fullWidth
              label="Deposit Amount"
              margin="normal"
              type="number"
              value={depositAmount}
              onChange={handleDepositChange}
              required
            />
            <TextField
              fullWidth
              label="Final Payment Amount"
              margin="normal"
              type="number"
              value={finalPaymentAmount}
              onChange={handleFinalPaymentChange}
              required
            />
            <TextField
              fullWidth
              label="Message"
              margin="normal"
              multiline
              rows={3}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              required
            />
            <TextField
              fullWidth
              label="Proposed Start Date"
              margin="normal"
              type="datetime-local"
              InputLabelProps={{ shrink: true }}
              InputProps={{
                inputProps: {
                  min: new Date().toISOString().slice(0, 16),
                  max: formatDate(job?.deadline),
                },
              }}
              value={proposedStartDate}
              onChange={(e) => setProposedStartDate(e.target.value)}
            />
            <TextField
              fullWidth
              label="Proposed End Date"
              margin="normal"
              type="datetime-local"
              InputLabelProps={{ shrink: true }}
              InputProps={{
                inputProps: {
                  min: new Date().toISOString().slice(0, 16),
                  max: formatDate(job?.deadline),
                },
              }}
              value={proposedEndDate}
              onChange={(e) => setProposedEndDate(e.target.value)}
            />
            <TextField
              fullWidth
              label="Support Availability"
              margin="normal"
              value={supportAvailability}
              onChange={(e) => setSupportAvailability(e.target.value)}
            />
            <TextField
              fullWidth
              label="Additional Policy"
              margin="normal"
              multiline
              rows={3}
              value={additionalPolicy}
              onChange={(e) => setAdditionalPolicy(e.target.value)}
            />

            <Button type="submit" variant="contained" color="primary" sx={{ mt: 2 }}>
              Submit Bid
            </Button>
          </Box>
        </Paper>
      ) : (
        <Typography>Loading job details...</Typography>
      )}
    </Container>
  );
};

export default FreelancerBid;
