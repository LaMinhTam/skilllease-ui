import { useEffect, useRef } from "react";
import { Card, CardActionArea, CardContent, Typography } from "@mui/material";
import Hls from "hls.js";
import { useNavigate } from "react-router-dom";

interface VideoPlayerProps {
  videoKey: string;
  tsUrl: string;
}

const VideoPlayer = ({ videoKey, tsUrl }: VideoPlayerProps) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (videoRef.current && Hls.isSupported()) {
      const hls = new Hls();
      const m3u8 = `#EXTM3U\n#EXT-X-VERSION:3\n#EXT-X-TARGETDURATION:12\n#EXTINF:2.924,\n${tsUrl}\n#EXT-X-ENDLIST`;

      hls.loadSource(URL.createObjectURL(new Blob([m3u8])));
      hls.attachMedia(videoRef.current);

      return () => {
        hls.destroy();
      };
    } else if (videoRef.current) {
      videoRef.current.src = tsUrl;
    }
  }, [tsUrl]);

  return (
    <Card>
      <CardActionArea onClick={() => navigate(`/watch/${videoKey}`)}>
        <video ref={videoRef} width="100%" height="auto" />
        <CardContent>
          <Typography variant="h6">{videoKey}</Typography>
        </CardContent>
      </CardActionArea>
    </Card>
  );
};

export default VideoPlayer;
