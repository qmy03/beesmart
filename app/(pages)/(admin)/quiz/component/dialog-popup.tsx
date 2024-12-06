// import React, { useState } from "react";
// import {
//   Dialog,
//   DialogActions,
//   DialogContent,
//   DialogTitle,
//   Box,
//   Typography,
// } from "@mui/material";
// import { Close } from "@mui/icons-material";
import TextField from "@/app/components/textfield";
import { Button } from "@/app/components/button";
// import { Edit } from "@mui/icons-material";
// interface DialogPopupProps {
//   open: boolean;
//   onClose: () => void;
//   onSave: (quizData: any) => void;
//   onSubmit: (formData: any) => void;
//   initialData?: any;
//   type: "add" | "edit";
// }

// const DialogPopup: React.FC<DialogPopupProps> = ({ open, onClose, onSave, type, onSubmit, initialData }) => {
//   const [formData, setFormData] = useState(
//     initialData || { title: "", description: "", image: "", quizDuration: "" }
//   );

//   const handleChange = (e) => {
//     const { name, value } = e.target;
//     setFormData((prev) => ({ ...prev, [name]: value }));
//   };

//   const handleSubmit = () => {
//     onSubmit(formData);
//   };

//   const [quizTitle, setQuizTitle] = useState("");
//   const [quizDescription, setQuizDescription] = useState("");
//   const [quizDuration, setQuizDuration] = useState<number | string>("");

//   const handleSave = () => {
//     if (quizTitle && quizDescription && quizDuration) {
//       onSave({
//         title: quizTitle,
//         description: quizDescription,
//         quizDuration: quizDuration,
//       });
//       setQuizTitle("");
//       setQuizDescription("");
//       setQuizDuration("");
//     }
//   };

//   return (
//     <Dialog open={open} onClose={onClose}>
//       {/* <DialogTitle>Tạo Quiz</DialogTitle> */}
//       <DialogTitle sx={{ display: "flex", alignItems: "center" }}>
//         <Typography variant="h6" sx={{ flexGrow: 1 }}>
//           {type === "add" ? "Thêm Quiz Mới" : "Chỉnh Sửa Bài Học"}
//         </Typography>
//         <Close onClick={onClose} fontSize="small" sx={{ cursor: "pointer" }} />
//       </DialogTitle>
//       <DialogContent>
//         {/* <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}> */}
//           <TextField
//             label="Tiêu đề Quiz"
//             variant="outlined"
//             fullWidth
//             value={quizTitle}
//             onChange={(e) => setQuizTitle(e.target.value)}
//           />
//           <TextField
//             label="Mô tả Quiz"
//             variant="outlined"
//             fullWidth
//             value={quizDescription}
//             onChange={(e) => setQuizDescription(e.target.value)}
//           />
//           <TextField
//             label="Thời gian (phút)"
//             variant="outlined"
//             fullWidth
//             type="number"
//             value={quizDuration}
//             onChange={(e) => setQuizDuration(e.target.value)}
//           />
//         {/* </Box> */}
//       </DialogContent>
//       <DialogActions>
//         <Button onClick={handleSubmit} color="primary">
//           Lưu
//         </Button>
//       </DialogActions>
//     </Dialog>
//   );
// };

// export default DialogPopup;
import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  // TextField,
  // Button,
  CircularProgress,
} from "@mui/material";
import apiService from "@/app/untils/api";
import { useAuth } from "@/app/hooks/AuthContext";

const DialogPopup = ({
  open,
  onClose,
  onQuizUpdated,
  dialogType,
  quizData,
  selectedLessonId,
}: any) => {
  const { accessToken } = useAuth();
  const [loading, setLoading] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [quizDuration, setQuizDuration] = useState<number>(10);

  // Fetch quiz data if editing
  useEffect(() => {
    if (dialogType === "edit" && quizData) {
      setTitle(quizData.title || "");
      setDescription(quizData.description || "");
      setQuizDuration(quizData.quizDuration || 10);
    }
  }, [dialogType, quizData]);

  const handleSave = () => {
    setLoading(true);
    const payload = { title, description, quizDuration };

    if (dialogType === "add") {
      // Call API to create quiz
      apiService
        .post(`/quizzes/lesson/${selectedLessonId}`, payload, {
          headers: { Authorization: `Bearer ${accessToken}` },
        })
        .then((response) => {
          onQuizUpdated(response.data.data); // Pass the new quiz data back
          onClose();
        })
        .catch((error) => console.error("Error creating quiz:", error))
        .finally(() => setLoading(false));
    } else if (dialogType === "edit" && quizData) {
      // Call API to update quiz
      apiService
        .put(`/quizzes/${quizData.quizId}`, payload, {
          headers: { Authorization: `Bearer ${accessToken}` },
        })
        .then((response) => {
          onQuizUpdated(response.data.data); // Pass updated quiz data back
          onClose();
        })
        .catch((error) => console.error("Error updating quiz:", error))
        .finally(() => setLoading(false));
    }
  };

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>
        {dialogType === "add" ? "Thêm mới Quiz" : "Chỉnh sửa Quiz"}
      </DialogTitle>
      <DialogContent>
        <TextField
          label="Tiêu đề"
          fullWidth
          margin="normal"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <TextField
          label="Mô tả"
          fullWidth
          margin="normal"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
        <TextField
          label="Thời lượng (phút)"
          type="number"
          fullWidth
          margin="normal"
          value={quizDuration}
          onChange={(e) => setQuizDuration(parseInt(e.target.value) || 10)}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Hủy</Button>
        <Button onClick={handleSave} disabled={loading}>
          {loading ? <CircularProgress size={24} /> : "Lưu"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default DialogPopup;
