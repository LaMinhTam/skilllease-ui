import { useEffect, useState, useContext } from "react";
import {
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  CardActions,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { Job } from "../entities/job";
import api from "../api";
import { toast } from "react-toastify";

const EmployerJobs = () => {
  const { user } = useContext(AuthContext)!;
  const [jobs, setJobs] = useState<Job[]>([]);
  const navigate = useNavigate();

  // State for delete confirmation dialog.
  const [openDialog, setOpenDialog] = useState(false);
  const [jobToDelete, setJobToDelete] = useState<number | null>(null);

  useEffect(() => {
    if (user && user.id) {
      api
        .get(`/jobs?employerId=${user.id}`)
        .then((response) => {
          setJobs(response.data.data || []);
        })
        .catch((error) => {
          toast.error("Error fetching jobs. Please try again later.");
          console.error("Error fetching employer jobs:", error);
        });
    }
  }, [user]);

  const handleCardClick = (jobId: number) => {
    navigate(`/job-bids/${jobId}`);
  };

  const handleEdit = (e: React.MouseEvent, jobId: number) => {
    e.stopPropagation(); // Prevent card onClick
    navigate(`/edit-job/${jobId}`);
  };

  const handleDeleteClick = (e: React.MouseEvent, jobId: number) => {
    e.stopPropagation();
    setJobToDelete(jobId);
    setOpenDialog(true);
  };

  const handleDialogClose = () => {
    setOpenDialog(false);
    setJobToDelete(null);
  };

  const confirmDelete = async () => {
    if (jobToDelete) {
      try {
        await api.delete(`/jobs/${jobToDelete}`);
        setJobs((prevJobs) => prevJobs.filter((job) => job.id !== jobToDelete));
        toast.success("Job deleted successfully.");
      } catch (error) {
        console.error("Error deleting job:", error);
        toast.error("Failed to delete job.");
      } finally {
        handleDialogClose();
      }
    }
  };

  return (
    <Container sx={{ mt: 4 }}>
      <Typography variant="h4" gutterBottom>
        Your Posted Jobs
      </Typography>
      <Grid container spacing={2}>
        {jobs.length > 0 ? (
          jobs.map((job) => (
            <Grid item key={job.id} xs={12} sm={6} md={4}>
              <Card
                sx={{ borderRadius: 2, boxShadow: 2, cursor: "pointer" }}
                onClick={() => handleCardClick(job.id)}
              >
                <CardContent>
                  <Typography variant="h6">{job.jobTitle}</Typography>
                  <Typography variant="body2" sx={{ mt: 1 }}>
                    {job.jobDescription}
                  </Typography>
                  <Typography variant="subtitle2" sx={{ mt: 1 }}>
                    Budget: {job.budget}
                  </Typography>
                  <Typography variant="caption" color="textSecondary" sx={{ mt: 1 }}>
                    Deadline: {job.deadline?.join("-")}
                  </Typography>
                </CardContent>
                <CardActions sx={{ justifyContent: "space-between" }}>
                  <Button
                    size="small"
                    variant="outlined"
                    onClick={(e) => handleEdit(e, job.id)}
                  >
                    Edit
                  </Button>
                  <Button
                    size="small"
                    variant="contained"
                    color="error"
                    onClick={(e) => handleDeleteClick(e, job.id)}
                  >
                    Delete
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          ))
        ) : (
          <Typography>No jobs posted yet.</Typography>
        )}
      </Grid>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={openDialog}
        onClose={handleDialogClose}
        aria-labelledby="delete-dialog-title"
      >
        <DialogTitle id="delete-dialog-title">Delete Job</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete this job? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDialogClose} color="primary">
            Cancel
          </Button>
          <Button onClick={confirmDelete} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default EmployerJobs;
