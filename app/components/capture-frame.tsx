import React, { useEffect, useState } from "react";
import { Box, CircularProgress, Typography } from "@mui/material";

interface VideoThumbnailProps {
  videoUrl: string;
  altText?: string;
  captureTime?: number; // Thời gian lấy khung hình (giây)
}

const VideoThumbnail: React.FC<VideoThumbnailProps> = ({
  videoUrl,
  altText = "Video Thumbnail",
  captureTime = 1, // Mặc định lấy khung hình tại giây thứ 1
}) => {
  const [thumbnail, setThumbnail] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const captureFrame = (
    url: string,
    time: number,
    callback: (dataUrl: string | null) => void
  ) => {
    const video = document.createElement("video");
    video.src = url;
    video.crossOrigin = "anonymous"; // Đảm bảo xử lý CORS
    video.addEventListener("loadeddata", () => {
      video.currentTime = time; // Đặt thời gian lấy khung hình
    });

    video.addEventListener("seeked", () => {
      try {
        const canvas = document.createElement("canvas");
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        const context = canvas.getContext("2d");
        if (context) {
          context.drawImage(video, 0, 0, canvas.width, canvas.height);
          callback(canvas.toDataURL("image/jpeg")); // Xuất ảnh dưới dạng JPEG
        } else {
          callback(null);
        }
      } catch (error) {
        console.error("Error capturing video frame:", error);
        callback(null);
      }
    });

    video.addEventListener("error", () => {
      console.error("Error loading video.");
      callback(null);
    });
  };

  useEffect(() => {
    if (videoUrl) {
      captureFrame(videoUrl, captureTime, (dataUrl) => {
        if (dataUrl) {
          setThumbnail(dataUrl);
        } else {
          console.error("Failed to capture thumbnail.");
        }
        setLoading(false);
      });
    }
  }, [videoUrl, captureTime]);

  return (
    <Box>
      {loading ? (
        <CircularProgress size="30px"/>
      ) : thumbnail ? (
        <img
          src={thumbnail}
          alt={altText}
          width="100%"
          style={{ borderTopLeftRadius: "16px", borderTopRightRadius: "16px", objectFit: "cover" }}
        />
      ) : (
        <Typography color="error"></Typography>
      )}
    </Box>
  );
};

export default VideoThumbnail;
