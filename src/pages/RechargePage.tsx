import { useState } from "react";
import {
  Container,
  Typography,
  Box,
  TextField,
  Button,
  Paper,
  MenuItem,
  CircularProgress,
} from "@mui/material";
import PaymentIcon from "@mui/icons-material/Payment";
import api from "../api";

const RechargePage = () => {
  const [amount, setAmount] = useState(100000);
  const [loading, setLoading] = useState(false);

  const handleRecharge = async () => {
    if (!amount || amount <= 0) return;
    setLoading(true);
    try {
      const response = await api.get(`payment/vn-pay?amount=${amount}`);
      const paymentUrl = response?.data?.data?.paymentUrl;
      if (paymentUrl) {
        window.location.href = paymentUrl;
      } else {
        alert("Something went wrong. Please try again.");
      }
    } catch (error) {
      console.error("Recharge failed:", error);
      alert("Recharge failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const predefinedAmounts = [100000, 200000, 500000, 1000000, 2000000];

  return (
    <Container maxWidth="sm">
      <Paper
        elevation={4}
        sx={{
          p: 4,
          mt: 6,
          borderRadius: 3,
          background: "linear-gradient(135deg, #E3F2FD 0%, #BBDEFB 100%)",
        }}
      >
        <Box display="flex" alignItems="center" gap={1} mb={3}>
          <PaymentIcon fontSize="large" color="primary" />
          <Typography variant="h5" fontWeight={600}>
            Recharge Wallet
          </Typography>
        </Box>

        <Typography variant="body1" mb={2}>
          Select or enter the amount you'd like to recharge:
        </Typography>

        <TextField
          select
          fullWidth
          label="Amount (VND)"
          value={amount}
          onChange={(e) => setAmount(Number(e.target.value))}
          variant="outlined"
          sx={{ mb: 3 }}
        >
          {predefinedAmounts.map((amt) => (
            <MenuItem key={amt} value={amt}>
              {amt.toLocaleString()} VND
            </MenuItem>
          ))}
        </TextField>

        <Button
          variant="contained"
          color="primary"
          size="large"
          fullWidth
          onClick={handleRecharge}
          disabled={loading}
          sx={{ textTransform: "none", fontWeight: 600 }}
        >
          {loading ? (
            <CircularProgress size={24} color="inherit" />
          ) : (
            "Recharge Now"
          )}
        </Button>
      </Paper>
    </Container>
  );
};

export default RechargePage;
