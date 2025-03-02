import { useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Container, Typography, IconButton, Card } from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import Hls from "hls.js";

const VIDEO_SRC = "http://localhost:9080/hls/";

const VideoScreen = () => {
  const { key } = useParams();
  const navigate = useNavigate();
  const videoRef = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (video) {
      if (Hls.isSupported()) {
        const hls = new Hls();
        hls.loadSource(VIDEO_SRC + key + ".m3u8");
        hls.attachMedia(video);
        hls.on(Hls.Events.MANIFEST_PARSED, () => {
          video.play();
        });
      } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = VIDEO_SRC + key + ".m3u8";
        video.addEventListener("loadedmetadata", () => {
          video.play();
        });
      }
    }
  }, []);

  return (
    <Container maxWidth="md" style={{ textAlign: "center", marginTop: "20px" }}>
      <IconButton onClick={() => navigate(-1)} style={{ marginBottom: "10px" }}>
        <ArrowBackIcon fontSize="large" />
      </IconButton>
      <Card style={{ padding: "20px", borderRadius: "10px", boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.1)" }}>
        <Typography variant="h4" gutterBottom>
          Now Streaming
        </Typography>
        <video ref={videoRef} controls style={{ width: "100%", borderRadius: "10px" }} />
      </Card>
    </Container>
  );
};

export default VideoScreen;
