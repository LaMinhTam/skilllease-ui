import React, { useEffect, useState } from "react";
import {
  Container,
  Typography,
  TextField,
  Button,
  MenuItem,
  Box,
} from "@mui/material";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import { Service } from "../entities/service";
import { Category } from "../entities/category";
import api from "../api";

const EditService = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [service, setService] = useState<Service | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);

  // Form state
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [categoryId, setCategoryId] = useState<number | "">("");
  const [depositPercentage, setDepositPercentage] = useState("50");

  useEffect(() => {
    if (id) {
      api
        .get(`/services/${id}`)
        .then((response) => {
          const svc = response.data.data;
          setService(svc);
          setTitle(svc.title);
          setDescription(svc.description);
          setPrice(String(svc.price));
          setCategoryId(svc.category?.id || "");
          setDepositPercentage(String(svc.depositPercentage));
        })
        .catch((error) => {
          console.error("Error fetching service:", error);
          toast.error("Failed to fetch service details.");
        });
    }

    api
      .get("/categories")
      .then((response) => {
        setCategories(response.data.data || []);
      })
      .catch((error) => {
        console.error("Error fetching categories:", error);
      });
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        title,
        description,
        price,
        depositPercentage,
        categoryId,
      };
      await api.put(`/services/${id}`, payload);
      toast.success("Service updated successfully!");
      navigate("/my-services");
    } catch (error) {
      console.error("Error updating service:", error);
      toast.error("Failed to update service.");
    }
  };

  if (!service) {
    return (
      <Container sx={{ mt: 4 }}>
        <Typography>Loading...</Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="sm" sx={{ mt: 4 }}>
      <Typography variant="h4" gutterBottom>
        Edit Service
      </Typography>
      <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
        <TextField
          fullWidth
          label="Service Title"
          margin="normal"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />
        <TextField
          fullWidth
          label="Service Description"
          margin="normal"
          multiline
          rows={4}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          required
        />
        <TextField
          fullWidth
          label="Price"
          margin="normal"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          required
        />
        <TextField
          fullWidth
          select
          label="Category"
          margin="normal"
          value={categoryId}
          onChange={(e) => setCategoryId(Number(e.target.value))}
          required
        >
          {categories.map((cat) => (
            <MenuItem key={cat.id} value={cat.id}>
              {cat.name}
            </MenuItem>
          ))}
        </TextField>
        <TextField
          fullWidth
          label="Deposit Percentage"
          margin="normal"
          value={depositPercentage}
          onChange={(e) => setDepositPercentage(e.target.value)}
          required
        />
        <Button type="submit" variant="contained" color="primary" sx={{ mt: 2 }}>
          Update Service
        </Button>
      </Box>
    </Container>
  );
};

export default EditService;
