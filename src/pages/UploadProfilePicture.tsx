import { useState, useContext } from "react";
import { Button, Container, Typography, Box, Avatar } from "@mui/material";
import { useNavigate } from "react-router-dom";
import api from "../api";
import { AuthContext } from "../context/AuthContext";
import { toast } from "react-toastify";

const UploadProfilePicture = () => {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const navigate = useNavigate();
  const auth = useContext(AuthContext);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      setFile(selectedFile);
      setPreview(URL.createObjectURL(selectedFile));
    }
  };

  const handleUpload = async () => {
    if (!file) {
      toast.warn("Please select a file.");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);
    formData.append("fileName", file.name);

    try {
      const response = await api.post("/users/profile-picture", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      toast.success("Profile picture uploaded successfully!");

      const updatedUser = {
        ...auth?.user,
        profilePictureUrl: response.data.data.profilePictureUrl,
      };
      if (auth) {
        auth.login(updatedUser);
      }
      navigate("/");
    } catch (error) {
      toast.error("Upload failed!");
    }
  };

  return (
    <Container maxWidth="xs" sx={{ textAlign: "center", mt: 5 }}>
      <Typography variant="h4" gutterBottom>
        Upload Profile Picture
      </Typography>

      {/* Image Preview */}
      {preview && (
        <Avatar
          src={preview}
          alt="Profile Preview"
          sx={{ width: 120, height: 120, margin: "auto", mb: 2 }}
        />
      )}

      <input type="file" accept="image/*" onChange={handleFileChange} style={{ marginBottom: "16px" }} />

      {/* Buttons in the same row */}
      <Box sx={{ display: "flex", justifyContent: "center", gap: 2, mt: 2 }}>
        <Button variant="contained" color="primary" onClick={handleUpload} disabled={!file}>
          Upload
        </Button>
        <Button variant="outlined" onClick={() => navigate("/")}>
          Skip
        </Button>
      </Box>
    </Container>
  );
};

export default UploadProfilePicture;
