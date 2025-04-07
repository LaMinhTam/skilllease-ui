import { useContext, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Container,
  Typography,
  Paper,
  Box,
  Grid,
  Chip,
  Divider,
  Button,
  Stack,
} from "@mui/material";
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
  ).toLocaleString();

const ContractDetail = () => {
  const { contractId } = useParams<{ contractId: string }>();
  const [contract, setContract] = useState<any>(null);
  const { user } = useContext(AuthContext)!;
  const navigate = useNavigate();
  const isEmployer = user?.id === contract?.employer.id;
  const isFreelancer = user?.id === contract?.freelancer.id;

  useEffect(() => {
    if (contractId) {
      api
        .get(`/contracts/${contractId}`)
        .then((response) => setContract(response.data.data))
        .catch((error) => {
          console.error("Error fetching contract:", error);
          toast.error("Failed to load contract.");
        });
    }
  }, [contractId]);

  const updateContractStatus = async (isAccepted: boolean) => {
    try {
      const response = await api.put(
        `/contracts/${contractId}/status?isAccepted=${isAccepted}`
      );
      const updatedContract = response.data.data;
      setContract(updatedContract);

      toast.success(isAccepted ? "Contract Accepted!" : "Contract Rejected!");

      if (isAccepted && isEmployer) {
        try {
          await api.post(`/payment/contract/${contractId}`);
          toast.success("Payment processed successfully!");
        } catch (error) {
          console.error("Error processing payment:", error);
          toast.error("Failed to process payment.");
        }
      }
    } catch (error) {
      console.error(
        "Error updating contract status or processing payment:",
        error
      );
      toast.error("Something went wrong.");
    }
  };

  if (!contract) return <Typography>Loading contract...</Typography>;

  const { employerAccepted, freelancerAccepted, status, employer, freelancer } =
    contract;

  const canEmployerAct =
    isEmployer && status === "NEGOTIATION" && !employerAccepted;

  const canFreelancerAct =
    isFreelancer &&
    status === "NEGOTIATION" &&
    employerAccepted &&
    !freelancerAccepted;

  const renderStatusChip = (accepted: boolean | null) => {
    if (accepted === true)
      return <Chip label="Accepted" color="success" size="small" />;
    if (accepted === false)
      return <Chip label="Rejected" color="error" size="small" />;
    return <Chip label="Pending" color="warning" size="small" />;
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4 }}>
      <Typography variant="h3" align="center" color="primary" gutterBottom>
        Contract Details
      </Typography>

      <Paper sx={{ p: 4, borderRadius: 3, boxShadow: 6 }}>
        <Box sx={{ mb: 3 }}>
          <Typography variant="h6" sx={{ fontWeight: 500 }}>
            Status:{" "}
            <Chip
              label={status}
              color={status === "NEGOTIATION" ? "warning" : "success"}
              sx={{ ml: 1 }}
            />
          </Typography>
        </Box>

        <Divider sx={{ my: 3 }} />

        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
              Employer
            </Typography>
            <Typography>Name: {employer.fullName}</Typography>
            <Typography>Email: {employer.email}</Typography>
            <Box mt={1}>{renderStatusChip(employerAccepted)}</Box>
          </Grid>

          <Grid item xs={12} md={6}>
            <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
              Freelancer
            </Typography>
            <Typography>Name: {freelancer.fullName}</Typography>
            <Typography>Email: {freelancer.email}</Typography>
            <Box mt={1}>{renderStatusChip(freelancerAccepted)}</Box>
          </Grid>
        </Grid>

        <Divider sx={{ my: 3 }} />

        <Box sx={{ mt: 3 }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
            Contract Period
          </Typography>
          <Typography>
            Start:{" "}
            <span style={{ color: "#1976d2" }}>
              {formatDate(contract.contractStartDate)}
            </span>
          </Typography>
          <Typography>
            End:{" "}
            <span style={{ color: "#1976d2" }}>
              {formatDate(contract.contractEndDate)}
            </span>
          </Typography>
        </Box>

        <Box sx={{ mt: 3 }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
            Support & Policy
          </Typography>
          <Typography>
            Support Availability: {contract.supportAvailability}
          </Typography>
          <Typography>
            Additional Policy: {contract.additionalPolicy}
          </Typography>
        </Box>

        <Box sx={{ mt: 3 }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
            Financials
          </Typography>
          <Typography>
            Deposit: <strong>${contract.depositAmount}</strong>
          </Typography>
          <Typography>
            Final Payment: <strong>${contract.finalPaymentAmount}</strong>
          </Typography>
          <Typography>Deposit Status: {contract.depositStatus}</Typography>
          <Typography>
            Final Payment Status: {contract.finalPaymentStatus}
          </Typography>
        </Box>

        {(canEmployerAct || canFreelancerAct) && (
          <Box sx={{ mt: 4, display: "flex", justifyContent: "center" }}>
            <Stack direction="row" spacing={2}>
              <Button
              sx={{ textTransform: "none" }}
                variant="contained"
                color="primary"
                onClick={() => updateContractStatus(true)}
              >
                Accept Contract
              </Button>
              <Button
              sx={{ textTransform: "none" }}
                variant="outlined"
                color="secondary"
                onClick={() => updateContractStatus(false)}
              >
                Reject Contract
              </Button>
            </Stack>
          </Box>
        )}
        {employerAccepted && freelancerAccepted && (
          <Box
            sx={{ mt: 4, display: "flex", justifyContent: "center", gap: 2 }}
          >
            <Button
            sx={{ textTransform: "none" }}
              variant="contained"
              color="primary"
              size="large"
              onClick={() => navigate(`/contract/${contract.id}/milestones`)}
            >
              View Milestones
            </Button>
          </Box>
        )}
      </Paper>
    </Container>
  );
};

export default ContractDetail;
