import { useEffect, useState} from "react";
import {
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  CardActions,
  Button,
  Avatar,
  Box,
  Rating,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import api from "../../api";
import { Service } from "../../entities/service";
import { toast } from "react-toastify";

const EmployerDashboard = () => {
  const [services, setServices] = useState<Service[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    api
      .get("/services")
      .then((response) => {
        setServices(response.data.data || []);
      })
      .catch((error) => {
        toast.error("Error fetching services. Please try again later.");
        console.error("Error fetching services:", error);
      });
  }, []);

  return (
    <Container sx={{ mt: 4 }}>
      <Typography variant="h4" gutterBottom>
        Freelancer Services
      </Typography>
      <Grid container spacing={2}>
        {services.length > 0 ? (
          services.map((service) => (
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
                  <Box sx={{ display: "flex", alignItems: "center", mt: 2 }}>
                    {service.freelancer.profilePictureUrl ? (
                      <Avatar
                        src={service.freelancer.profilePictureUrl}
                        alt={service.freelancer.fullName}
                      />
                    ) : (
                      <Avatar>
                        {(service.freelancer.fullName ?? "")
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </Avatar>
                    )}
                    <Typography variant="body1" sx={{ ml: 1 }}>
                      {service.freelancer.fullName}
                    </Typography>
                  </Box>
                  <Box sx={{ display: "flex", alignItems: "center", mt: 1 }}>
                    {service.freelancer.rating !== null ? (
                      <>
                        <Rating
                          name="read-only"
                          value={Number(service.freelancer.rating)}
                          precision={0.1}
                          readOnly
                          size="small"
                        />
                        <Typography variant="body2" sx={{ ml: 0.5 }}>
                          {service.freelancer.rating}
                        </Typography>
                      </>
                    ) : (
                      <Typography variant="body2">No rating</Typography>
                    )}
                  </Box>
                </CardContent>
                <CardActions>
                  <Button
                    size="small"
                    onClick={() => navigate(`/profile/${service.freelancer.id}`)}
                  >
                    View Profile
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          ))
        ) : (
          <Typography>No freelancer services available.</Typography>
        )}
      </Grid>
    </Container>
  );
};

export default EmployerDashboard;
