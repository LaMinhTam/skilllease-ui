import { useEffect, useState, useContext } from "react";
import {
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  CardActions,
  Button
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { AuthContext } from "../context/AuthContext";
import api from "../api";
import { Service } from "../entities/service";

const FreelancerServices = () => {
  const [services, setServices] = useState<Service[]>([]);
  const { user } = useContext(AuthContext)!;
  const navigate = useNavigate();

  useEffect(() => {
    if (user && user.id) {
      // Fetch services by freelancer id (assuming endpoint supports ?freelancerId=)
      api
        .get(`/services?freelancerId=${user.id}`)
        .then((response) => {
          setServices(response.data.data || []);
        })
        .catch((error) => {
          console.error("Error fetching services:", error);
          toast.error("Failed to fetch your services.");
        });
    }
  }, [user]);

  const handleDelete = (id: number) => {
    if (window.confirm("Are you sure you want to delete this service?")) {
      api
        .delete(`/services/${id}`)
        .then(() => {
          toast.success("Service deleted successfully.");
          setServices((prev) => prev.filter((service) => service.id !== id));
        })
        .catch((error) => {
          console.error("Error deleting service:", error);
          toast.error("Failed to delete service.");
        });
    }
  };

  const handleEdit = (id: number) => {
    navigate(`/edit-service/${id}`);
  };

  return (
    <Container sx={{ mt: 4 }}>
      <Typography variant="h4" gutterBottom>
        My Services
      </Typography>
      {services.length > 0 ? (
        <Grid container spacing={2}>
          {services.map((service) => (
            <Grid item key={service.id} xs={12} sm={6} md={4}>
              <Card>
                <CardContent>
                  <Typography variant="h6">{service.title}</Typography>
                  <Typography variant="body2" sx={{ mt: 1 }}>
                    {service.description}
                  </Typography>
                  <Typography variant="subtitle2" sx={{ mt: 1 }}>
                    Price: {service.price}
                  </Typography>
                </CardContent>
                <CardActions>
                  <Button size="small" onClick={() => handleEdit(service.id)}>
                    Edit
                  </Button>
                  <Button
                    size="small"
                    color="error"
                    onClick={() => handleDelete(service.id)}
                  >
                    Delete
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      ) : (
        <Typography>You have not posted any services yet.</Typography>
      )}
    </Container>
  );
};

export default FreelancerServices;
