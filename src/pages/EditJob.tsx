// src/pages/EditJob.tsx
import { useEffect, useState, FormEvent } from "react";
import {
  Container,
  Typography,
  TextField,
  Button,
  MenuItem,
  Box,
} from "@mui/material";
import { useParams, useNavigate } from "react-router-dom";
import api from "../api";
import { toast } from "react-toastify";

interface Category {
  id: number;
  name: string;
  description: string;
}

interface Job {
  id: number;
  jobTitle: string;
  jobDescription: string;
  budget: number;
  deadline: string; // formatted as YYYY-MM-DD
  category: Category;
}

const EditJob = () => {
  const { id } = useParams<{ id: string }>(); // job id from URL
  const navigate = useNavigate();

  // Form state
  const [jobTitle, setJobTitle] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [budget, setBudget] = useState("");
  const [deadline, setDeadline] = useState("");
  const [categoryId, setCategoryId] = useState<number | "">("");
  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    // Fetch the job details to pre-fill the form
    if (id) {
      api
        .get(`/jobs/${id}`)
        .then((response) => {
          const job: Job = response.data.data.job;
          setJobTitle(job.jobTitle);
          setJobDescription(job.jobDescription);
          setBudget(String(job.budget));
          const formattedDate = new Date(job.deadline).toISOString().split("T")[0];
          setDeadline(formattedDate);
          setCategoryId(job.category?.id || "");
        })
        .catch((error) => {
          console.error("Error fetching job details:", error);
          toast.error("Failed to load job details.");
        });
    }
    // Fetch categories for the select field
    api
      .get("/categories")
      .then((response) => {
        setCategories(response.data.data || []);
      })
      .catch((error) => {
        console.error("Error fetching categories:", error);
        toast.error("Failed to load categories.");
      });
  }, [id]);

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
        deadline, // expected format "YYYY-MM-DD"
        categoryId,
      };
      await api.put(`/jobs/${id}`, payload);
      toast.success("Job updated successfully!");
      navigate("/employer-jobs");
    } catch (error) {
      console.error("Error updating job:", error);
      toast.error("Failed to update job.");
    }
  };

  return (
    <Container maxWidth="sm" sx={{ mt: 4 }}>
      <Typography variant="h4" gutterBottom>
        Edit Job
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
          Update Job
        </Button>
      </Box>
    </Container>
  );
};

export default EditJob;
