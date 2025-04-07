// src/pages/CreateContract.tsx
import { useState, useEffect, FormEvent } from "react";
import {
  Container,
  Typography,
  TextField,
  Button,
  Box,
} from "@mui/material";
import { useParams, useNavigate } from "react-router-dom";
import api from "../api";
import { toast } from "react-toastify";
import { Bid } from "../entities/bid";

interface CreateContractDto {
  contractType: string; // "BID"
  serviceId: number | null; // for BID contracts, null
  jobBidId: number;
  contractStartDate: string; // ISO datetime string
  contractEndDate: string; // ISO datetime string
  supportAvailability: string;
  additionalPolicy: string;
  depositAmount: number;
  finalPaymentAmount: number;
}

const CreateContract = () => {
  // Get the bid ID from route parameters.
  const { bidId } = useParams<{ bidId: string }>();
  const navigate = useNavigate();

  // Form state
  const [contractStartDate, setContractStartDate] = useState("");
  const [contractEndDate, setContractEndDate] = useState("");
  const [supportAvailability, setSupportAvailability] = useState("");
  const [additionalPolicy, setAdditionalPolicy] = useState("");
  const [depositAmount, setDepositAmount] = useState("");
  const [finalPaymentAmount, setFinalPaymentAmount] = useState("");
  const [bidAmount, setBidAmount] = useState(0);

  // When the component mounts, fetch the bid details to pre-fill defaults.
  useEffect(() => {
    if (bidId) {
      api
        .get(`/job-bids/${bidId}`)
        .then((response) => {
          const bid: Bid = response.data.data;
          // Set support availability and additional policy if provided
          setSupportAvailability(bid.supportAvailability || "");
          setAdditionalPolicy(bid.additionalPolicy || "");
          // Calculate deposit and final payment defaults (half each)
          setBidAmount(bid.bidAmount);
          const half = (bid.bidAmount / 2).toFixed(2);
          setDepositAmount(half);
          setFinalPaymentAmount(half);
        })
        .catch((error) => {
          console.error("Error fetching bid details:", error);
          toast.error("Failed to load bid details.");
        });
    }
  }, [bidId]);

  // You may also want to pre-fill dates, for example default start and end dates.
  useEffect(() => {
    // Set default start and end dates (example: start in 7 days, end in 37 days)
    const now = new Date();
    const defaultStart = new Date(now);
    defaultStart.setDate(now.getDate() + 7);
    const defaultEnd = new Date(now);
    defaultEnd.setDate(now.getDate() + 37);
    // Convert to ISO string without seconds (for input type="datetime-local")
    const toInputValue = (date: Date) =>
      date.toISOString().slice(0, 16);
    setContractStartDate(toInputValue(defaultStart));
    setContractEndDate(toInputValue(defaultEnd));
  }, []);

const handleDepositChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newDeposit = parseFloat(e.target.value);
    if (isNaN(newDeposit)) {
        setDepositAmount("");
        return;
    }
    // Ensure deposit is between 0 and bidAmount
    const validDeposit = Math.min(Math.max(0, newDeposit), bidAmount);
    setDepositAmount(validDeposit.toFixed(2));
    
    const newFinal = (bidAmount - validDeposit).toFixed(2);
    setFinalPaymentAmount(newFinal);
};

  const handleFinalPaymentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newFinal = parseFloat(e.target.value);
    if (isNaN(newFinal)) {
      setFinalPaymentAmount("");
      return;
    }
    const validFinal = Math.min(Math.max(0, newFinal), bidAmount);
    setFinalPaymentAmount(validFinal.toFixed(2));
    
    const newDeposit = (bidAmount - validFinal).toFixed(2);
    setDepositAmount(newDeposit);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!bidId) {
      toast.error("Bid ID is missing.");
      return;
    }
    const payload: CreateContractDto = {
      contractType: "BID",
      serviceId: null,
      jobBidId: Number(bidId),
      contractStartDate,
      contractEndDate,
      supportAvailability,
      additionalPolicy,
      depositAmount: Number(depositAmount),
      finalPaymentAmount: Number(finalPaymentAmount),
    };

    try {
        const response = await api.post("/contracts", payload);
        const contractId = response.data.data.id;
        toast.success("Contract created successfully!");
        navigate(`/contract/${contractId}`);
    } catch (error) {
      console.error("Error creating contract:", error);
      toast.error("Failed to create contract.");
    }
  };

  return (
    <Container maxWidth="sm" sx={{ mt: 4 }}>
      <Typography variant="h4" gutterBottom>
        Create Contract
      </Typography>
      <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 2 }}>
        <TextField
          fullWidth
          label="Contract Start Date"
          type="datetime-local"
          InputLabelProps={{ shrink: true }}
          value={contractStartDate}
          onChange={(e) => setContractStartDate(e.target.value)}
          required
          margin="normal"
        />
        <TextField
          fullWidth
          label="Contract End Date"
          type="datetime-local"
          InputLabelProps={{ shrink: true }}
          value={contractEndDate}
          onChange={(e) => setContractEndDate(e.target.value)}
          required
          margin="normal"
        />
        <TextField
          fullWidth
          label="Support Availability"
          value={supportAvailability}
          onChange={(e) => setSupportAvailability(e.target.value)}
          required
          margin="normal"
        />
        <TextField
          fullWidth
          label="Additional Policy"
          multiline
          rows={4}
          value={additionalPolicy}
          onChange={(e) => setAdditionalPolicy(e.target.value)}
          required
          margin="normal"
        />
        <TextField
            fullWidth
            label="Bid Amount"
            type="number"
            value={bidAmount}
            InputProps={{
                readOnly: true,
            }}
            margin="normal"
        />
        <TextField
          fullWidth
          label="Deposit Amount"
          type="number"
          value={depositAmount}
          onChange={handleDepositChange}
          required
          margin="normal"
        />
        <TextField
          fullWidth
          label="Final Payment Amount"
          type="number"
          value={finalPaymentAmount}
          onChange={handleFinalPaymentChange}
          required
          margin="normal"
        />
        <Button type="submit" variant="contained" color="primary" sx={{ mt: 2 }}>
          Create Contract
        </Button>
      </Box>
    </Container>
  );
};

export default CreateContract;
