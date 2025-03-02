  import { useState, useEffect } from "react";
  import { Container, Typography, Grid } from "@mui/material";
  import { useNavigate } from "react-router-dom";
  import { VideoData } from "../entities/videoData";
  import VideoPlayer from "../components/VideoPlayer";

  const API_URL = "http://localhost:8080/strelive-api/api/stream";

  const Home = () => {
    const [videos, setVideos] = useState<VideoData[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
      fetch(API_URL)
        .then((response) => response.json())
        .then((data) => {
          if (Array.isArray(data)) {
            setVideos(data);
          } else {
            console.error("Invalid API response:", data);
          }
        })
        .catch((error) => console.error("Error fetching videos:", error))
        .finally(() => setLoading(false));
    }, []);

    return (
      <Container>
        <Typography variant="h3" gutterBottom>
          Livestreams
        </Typography>
        {loading ? (
          <Typography>Loading...</Typography>
        ) : videos.length === 0 ? (
          <Typography>No streams available.</Typography>
        ) : (
          <Grid container spacing={2}>
            {videos.map((video, index) => {
              const key = video.videoUrl.split("/").pop()?.replace(".m3u8", "");
              return (
                <Grid item xs={12} sm={6} md={4} key={index}>
                  <VideoPlayer videoKey={key || ""} tsUrl={video.middleTsUrl} />
                </Grid>
              );
            })}
          </Grid>
        )}
      </Container>
    );
  };

  export default Home;
