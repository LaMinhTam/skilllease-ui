import { useEffect, useState } from "react";
import {
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  CardActions,
  Button,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import api from "../../api";
import { Job } from "../../entities/job";
import { toast } from "react-toastify";

const FreelancerDashboard = () => {
  const [jobs, setJobs] = useState<Job[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    api
      .get("/jobs")
      .then((response) => {
        setJobs(response.data.data || []);
      })
      .catch((error) => {
        toast.error("Error fetching jobs. Please try again later.");
        console.error("Error fetching jobs:", error);
      });
  }, []);

  return (
    <Container sx={{ mt: 4 }}>
      <Typography variant="h4" gutterBottom>
        Employer Job Posts
      </Typography>
      <Grid container spacing={2}>
        {jobs.length > 0 ? (
          jobs.map((job) => (
            <Grid item key={job.id} xs={12} sm={6} md={4}>
              <Card>
                <CardContent>
                  <Typography variant="h6">{job.jobTitle}</Typography>
                  <Typography variant="body2" sx={{ mt: 1 }}>
                    {job.jobDescription}
                  </Typography>
                  <Typography variant="subtitle2" sx={{ mt: 1 }}>
                    Budget: {job.budget}
                  </Typography>
                </CardContent>
                <CardActions>
                  <Button size="small" onClick={() => navigate(`/bid-job/${job.id}`)}>
                    View Details
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          ))
        ) : (
          <Typography>No jobs available at the moment.</Typography>
        )}
      </Grid>
    </Container>
  );
};

export default FreelancerDashboard;
