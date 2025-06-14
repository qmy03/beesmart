import React, { useEffect, useState } from "react";
import { Box, CircularProgress, Typography } from "@mui/material";

// interface VideoThumbnailProps {
//   videoUrl: string;
//   thumbnailUrl?: string; // URL thumbnail từ server
//   altText?: string;
//   captureTime?: number;
//   width?: number;
//   height?: number;
// }

// const VideoThumbnail: React.FC<VideoThumbnailProps> = ({
//   videoUrl,
//   thumbnailUrl,
//   altText = "Video Thumbnail",
//   captureTime = 1, // Mặc định lấy khung hình tại giây thứ 1
//   width = 300,
//   height = 200,
// }) => {
//   const [thumbnail, setThumbnail] = useState<string | null>(null);
//   const [loading, setLoading] = useState(true);

//   const captureFrame = (
//     url: string,
//     time: number,
//     callback: (dataUrl: string | null) => void
//   ) => {
//     const video = document.createElement("video");
//     video.src = url;
//     video.crossOrigin = "anonymous"; // Đảm bảo xử lý CORS
//     video.addEventListener("loadeddata", () => {
//       video.currentTime = time; // Đặt thời gian lấy khung hình
//     });

//     video.addEventListener("seeked", () => {
//       try {
//         const canvas = document.createElement("canvas");
//         canvas.width = video.videoWidth;
//         canvas.height = video.videoHeight;
//         const context = canvas.getContext("2d");
//         if (context) {
//           context.drawImage(video, 0, 0, canvas.width, canvas.height);
//           callback(canvas.toDataURL("image/jpeg", 0.8)); // Xuất ảnh dưới dạng JPEG
//         } else {
//           callback(null);
//         }
//       } catch (error) {
//         console.error("Error capturing video frame:", error);
//         callback(null);
//       }
//     });

//     video.addEventListener("error", () => {
//       console.error("Error loading video.");
//       callback(null);
//     });
//   };

//   useEffect(() => {
//     if (thumbnailUrl) {
//       // Sử dụng thumbnail từ server
//       setThumbnail(thumbnailUrl);
//       setLoading(false);
//     } else if (videoUrl) {
//       // Fallback: Tạo thumbnail từ video
//       captureFrame(videoUrl, captureTime, (dataUrl) => {
//         setThumbnail(dataUrl);
//         setLoading(false);
//       });
//     } else {
//       setLoading(false);
//     }
//   }, [videoUrl, thumbnailUrl, captureTime]);

//   return (
//     <Box>
//       {loading ? (
//         <Box
//           sx={{
//             width: "100%",
//             height: `${height}px`,
//             display: "flex",
//             justifyContent: "center",
//             alignItems: "center",
//             backgroundColor: "#f0f0f0",
//           }}
//         >
//           <CircularProgress size="30px" />
//         </Box>
//       ) : thumbnail ? (
//         <img
//           src={thumbnail}
//           alt={altText}
//           width="100%"
//           style={{
//             borderTopLeftRadius: "8px",
//             borderTopRightRadius: "8px",
//             objectFit: "cover",
//             aspectRatio: "3/2", // Giữ tỷ lệ khung hình
//           }}
//         />
//       ) : (
//         <Typography color="error">Không thể tải thumbnail</Typography>
//       )}
//     </Box>
//   );
// };

// export default VideoThumbnail;
interface VideoThumbnailProps {
  videoUrl: string;
  thumbnailUrls?: { low: string; medium: string; high: string }; // Nhiều độ phân giải
  altText?: string;
  captureTime?: number;
  width?: number;
  height?: number;
}

const VideoThumbnail: React.FC<VideoThumbnailProps> = React.memo(
  ({
    videoUrl,
    thumbnailUrls,
    altText = "Video Thumbnail",
    captureTime = 1,
    width = 640,
    height = 360,
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
      video.crossOrigin = "anonymous";
      video.addEventListener("loadeddata", () => {
        video.currentTime = time;
      });

      video.addEventListener("seeked", () => {
        try {
          const canvas = document.createElement("canvas");
          canvas.width = width;
          canvas.height = height;
          const context = canvas.getContext("2d");
          if (context) {
            context.drawImage(video, 0, 0, width, height);
            callback(canvas.toDataURL("image/webp", 1.0)); // Sử dụng WebP
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
      if (thumbnailUrls?.medium) {
        setThumbnail(thumbnailUrls.medium); // Mặc định dùng medium
        setLoading(false);
      } else if (videoUrl) {
        captureFrame(videoUrl, captureTime, (dataUrl) => {
          setThumbnail(dataUrl);
          setLoading(false);
        });
      } else {
        setLoading(false);
      }
    }, [videoUrl, thumbnailUrls, captureTime, width, height]);

    return (
      <Box>
        {loading ? (
          <Box
            sx={{
              width: "100%",
              height: `${height}px`,
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              backgroundColor: "#f0f0f0",
            }}
          >
            <CircularProgress size="30px" />
          </Box>
        ) : thumbnail ? (
          <img
            src={thumbnail}
            srcSet={thumbnailUrls ? `
              ${thumbnailUrls.low} 100w,
              ${thumbnailUrls.medium} 300w,
              ${thumbnailUrls.high} 600w
            ` : undefined}
            sizes="(max-width: 600px) 100px, 300px"
            alt={altText}
            width="100%"
            style={{
              borderTopLeftRadius: "8px",
              borderTopRightRadius: "8px",
              objectFit: "cover",
              aspectRatio: "3/2",
            }}
          />
        ) : (
          <Typography color="error">Không thể tải thumbnail</Typography>
        )}
      </Box>
    );
  }
);

export default VideoThumbnail;
