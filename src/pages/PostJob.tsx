import { useEffect, useState, FormEvent } from "react";
import {
  Container,
  Typography,
  TextField,
  Button,
  MenuItem,
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

const PostJob = () => {
  const [jobTitle, setJobTitle] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [budget, setBudget] = useState("");
  const [deadline, setDeadline] = useState("");
  const [categories, setCategories] = useState<Category[]>([]);
  const [categoryId, setCategoryId] = useState<number | "">("");

  const navigate = useNavigate();

  // Fetch categories on mount
  useEffect(() => {
    api
      .get("/categories")
      .then((response) => {
        // assuming API returns an object with a 'data' property
        setCategories(response.data.data || []);
      })
      .catch((error) => {
        console.error("Error fetching categories:", error);
      });
  }, []);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!jobTitle || !jobDescription || !budget || !deadline || !categoryId) {
      toast.error("Please fill all required fields.");
      return;
    }

    try {
      const payload = {
        jobTitle,
        jobDescription,
        budget,
        deadline, // expected format: "YYYY-MM-DD"
        categoryId,
      };
      await api.post("/jobs", payload);
      toast.success("Job posted successfully!");
      navigate("/");
    } catch (error) {
      console.error("PostJob error:", error);
      toast.error("Failed to post job.");
    }
  };

  return (
    <Container maxWidth="sm" sx={{ mt: 4 }}>
      <Typography variant="h4" gutterBottom>
        Post a New Job
      </Typography>
      <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 2 }}>
        <TextField
          fullWidth
          label="Job Title"
          margin="normal"
          value={jobTitle}
          onChange={(e) => setJobTitle(e.target.value)}
          required
        />
        <TextField
          fullWidth
          label="Job Description"
          margin="normal"
          multiline
          rows={4}
          value={jobDescription}
          onChange={(e) => setJobDescription(e.target.value)}
          required
        />
        <TextField
          fullWidth
          label="Budget"
          margin="normal"
          value={budget}
          onChange={(e) => setBudget(e.target.value)}
          required
        />
        <TextField
          fullWidth
          label="Deadline"
          margin="normal"
          type="date"
          InputLabelProps={{ shrink: true }}
          value={deadline}
          onChange={(e) => setDeadline(e.target.value)}
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
        <Button type="submit" variant="contained" color="primary" sx={{ mt: 2 }}>
          Post Job
        </Button>
      </Box>
    </Container>
  );
};

export default PostJob;
