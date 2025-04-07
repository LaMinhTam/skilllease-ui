import { useEffect, useState, FormEvent } from "react";
import {
  Container,
  Typography,
  TextField,
  Button,
  MenuItem,
  FormControlLabel,
  Checkbox,
  Box,
} from "@mui/material";
import api from "../api";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

interface Category {
  id: number;
  name: string;
  description: string;
}

const PostService = () => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [depositRequired, setDepositRequired] = useState(true);
  const [depositPercentage, setDepositPercentage] = useState("50");
  const [categories, setCategories] = useState<Category[]>([]);
  const [categoryId, setCategoryId] = useState<number | "">("");
  const navigate = useNavigate();

  // Fetch categories on mount
  useEffect(() => {
    api
      .get("/categories")
      .then((response) => {
        setCategories(response.data.data || []);
      })
      .catch((error) => {
        console.error("Error fetching categories:", error);
      });
  }, []);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!title || !description || !price || !categoryId) {
      toast.error("Please fill in all required fields.");
      return;
    }

    try {
      const payload = {
        title,
        description,
        price,
        depositRequired,
        depositPercentage,
        categoryId,
      };
      await api.post("/services", payload);
      toast.success("Service posted successfully!");
      navigate("/");
    } catch (error) {
      console.error("PostService error:", error);
      toast.error("Failed to post service.");
    }
  };

  return (
    <Container maxWidth="sm" sx={{ mt: 4 }}>
      <Typography variant="h4" gutterBottom>
        Post a New Service
      </Typography>
      <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 2 }}>
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
        <FormControlLabel
          control={
            <Checkbox
              checked={depositRequired}
              onChange={(e) => setDepositRequired(e.target.checked)}
              color="primary"
            />
          }
          label="Deposit Required"
        />
        <TextField
          fullWidth
          label="Deposit Percentage"
          margin="normal"
          value={depositPercentage}
          onChange={(e) => setDepositPercentage(e.target.value)}
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
        <Button
          sx={{ textTransform: "none", mt: 2 }}
          type="submit"
          variant="contained"
          color="primary"
        >
          Post Service
        </Button>
      </Box>
    </Container>
  );
};

export default PostService;
