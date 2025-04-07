import { useEffect, useState } from "react";
import {
  Container,
  Typography,
  Avatar,
  Box,
  Grid,
  Card,
  CardContent,
  Rating,
} from "@mui/material";
import { useParams } from "react-router-dom";
import api from "../api";

interface Freelancer {
  id: number;
  fullName: string;
  email: string;
  profilePictureUrl?: string | null;
  rating?: number | null;
}

interface Review {
  id: number;
  rating: number;
  comment: string;
  createdAt: string;
  // Optionally, include reviewer information if provided by the API:
  reviewer?: {
    fullName: string;
    profilePictureUrl?: string;
  };
}

const FreelancerProfile = () => {
  const { id } = useParams<{ id: string }>();
  const [freelancer, setFreelancer] = useState<Freelancer | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      // Fetch freelancer profile using your freelancer API endpoint.
      api
        .get(`/freelancers/${id}`)
        .then((response) => {
          // Adjust response based on your API: here we assume data is in response.data.data
          setFreelancer(response.data.data);
        })
        .catch((err) => {
          console.error("Error fetching freelancer data:", err);
        });

      // Fetch freelancer reviews using the provided API endpoint.
      api
        .get(`/reviews/user/${id}`)
        .then((response) => {
          // Assuming the API returns an array of reviews.
          setReviews(response.data || []);
        })
        .catch((err) => {
          console.error("Error fetching reviews:", err);
        })
        .finally(() => setLoading(false));
    }
  }, [id]);

  if (loading) {
    return (
      <Container sx={{ mt: 4 }}>
        <Typography variant="h6">Loading...</Typography>
      </Container>
    );
  }

  if (!freelancer) {
    return (
      <Container sx={{ mt: 4 }}>
        <Typography variant="h6">Freelancer not found.</Typography>
      </Container>
    );
  }

  return (
    <Container sx={{ mt: 4 }}>
      <Box sx={{ textAlign: "center", mb: 4 }}>
        {freelancer.profilePictureUrl ? (
          <Avatar
            src={freelancer.profilePictureUrl}
            alt={freelancer.fullName}
            sx={{ width: 120, height: 120, margin: "auto" }}
          />
        ) : (
          <Avatar sx={{ width: 120, height: 120, margin: "auto" }}>
            {freelancer.fullName
              .split(" ")
              .map((n) => n[0])
              .join("")}
          </Avatar>
        )}
        <Typography variant="h4" sx={{ mt: 2 }}>
          {freelancer.fullName}
        </Typography>
        <Typography variant="subtitle1">{freelancer.email}</Typography>
        <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", mt: 1 }}>
          {freelancer.rating !== null && freelancer.rating !== undefined ? (
            <>
              <Rating value={Number(freelancer.rating)} precision={0.1} readOnly />
              <Typography variant="body1" sx={{ ml: 1 }}>
                {freelancer.rating.toFixed(1)}
              </Typography>
            </>
          ) : (
            <Typography variant="body1">No rating yet</Typography>
          )}
        </Box>
      </Box>

      <Typography variant="h5" gutterBottom>
        Reviews
      </Typography>
      {reviews.length > 0 ? (
        <Grid container spacing={2}>
          {reviews.map((review) => (
            <Grid item key={review.id} xs={12}>
              <Card variant="outlined">
                <CardContent>
                  <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                    <Rating value={review.rating} precision={0.1} readOnly size="small" />
                    <Typography variant="body2" sx={{ ml: 1 }}>
                      {review.rating.toFixed(1)}
                    </Typography>
                  </Box>
                  <Typography variant="body2">{review.comment}</Typography>
                  <Typography variant="caption" color="text.secondary">
                    {new Date(review.createdAt).toLocaleDateString()}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      ) : (
        <Typography>No reviews available.</Typography>
      )}
    </Container>
  );
};

export default FreelancerProfile;
