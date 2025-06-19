import React, { useState, useEffect } from "react";
import { Dialog, DialogTitle, DialogContent, DialogActions, CircularProgress, Snackbar, Alert } from "@mui/material";
import apiService from "@/app/untils/api";
import { useAuth } from "@/app/hooks/AuthContext";
import TextField from "@/app/components/textfield";
import { Button } from "@/app/components/button";
import CloseIcon from "@mui/icons-material/Close";
interface QuizData {
  quizId: string;
  title: string;
  description: string;
  quizDuration: number;
}

interface QuizResponse {
  data: QuizData;
  message?: string;
}

const DialogPopup = ({
  open,
  onClose,
  onQuizUpdated,
  dialogType,
  quizData,
  selectedLessonId,
  selectedTopicId,
}: any) => {
  const accessToken = localStorage.getItem("accessToken");
  const [loading, setLoading] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [quizDuration, setQuizDuration] = useState<number>(10);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState<"success" | "error">("success");

  useEffect(() => {
    if (dialogType === "edit" && quizData) {
      setTitle(quizData.title || "");
      setDescription(quizData.description || "");
      setQuizDuration(quizData.quizDuration || 10);
    }
  }, [dialogType, quizData]);

  useEffect(() => {
    if (!open) {
      setTitle("");
      setDescription("");
      setQuizDuration(10);
    }
  }, [open]);

  const handleSave = () => {
    setLoading(true);
    const payload = { title, description, quizDuration };
  
    let apiUrl = "";
  
    if (selectedLessonId && selectedTopicId) {
      apiUrl = `/quizzes/lesson/${selectedLessonId}`;
    } else if (selectedTopicId) {
      apiUrl = `/quizzes/topic/${selectedTopicId}`;
    } else {
      console.error("No valid ID provided.");
      setLoading(false);
      return;
    }
  
    if (dialogType === "add") {
      apiService
        .post<QuizResponse>(apiUrl, payload, {
          headers: { Authorization: `Bearer ${accessToken}` },
        })
        .then((response) => {
          onQuizUpdated(response.data.data);
          setSnackbarMessage(response.data.message || "Thêm mới quiz thành công!");
          setSnackbarSeverity("success");
          setSnackbarOpen(true); 
          onClose(); 
        })
        .catch((error) => {
          console.error("Error creating quiz:", error);
          setSnackbarMessage("Thêm mới quiz thất bại!");
          setSnackbarSeverity("error");
          setSnackbarOpen(true); 
        })
        .finally(() => setLoading(false));
    } else if (dialogType === "edit" && quizData) {
      apiService
        .put<QuizResponse>(`/quizzes/${quizData.quizId}`, payload, {
          headers: { Authorization: `Bearer ${accessToken}` },
        })
        .then((response) => {
          onQuizUpdated(response.data.data);
          setSnackbarMessage(response.data.message || "Chỉnh sửa quiz thành công!");
          setSnackbarSeverity("success");
          setSnackbarOpen(true);
          onClose(); 
        })
        .catch((error) => {
          console.error("Error updating quiz:", error);
          setSnackbarMessage("Chỉnh sửa quiz thất bại!");
          setSnackbarSeverity("error");
          setSnackbarOpen(true);
        })
        .finally(() => setLoading(false));
    }
  };

  const handleSnackbarClose = () => {
    setSnackbarOpen(false);
  };

  return (
    <>
      <Dialog open={open} onClose={onClose}>
        <DialogTitle sx={{display: "flex", justifyContent: "space-between"}}>{dialogType === "add" ? "Thêm mới Quiz" : "Chỉnh sửa Quiz"}<CloseIcon onClick={onClose}/></DialogTitle>
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
            value={quizDuration.toString()}
            onChange={(e) => setQuizDuration(parseInt(e.target.value) || 10)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleSave} disabled={loading}>
            {loading ? <CircularProgress size={24} /> : "Lưu"}
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar open={snackbarOpen} autoHideDuration={6000} onClose={handleSnackbarClose} anchorOrigin={{ vertical: "top", horizontal: "right" }}>
        <Alert onClose={handleSnackbarClose} severity={snackbarSeverity} sx={{ width: "100%" }}>
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </>
  );
};

export default DialogPopup;

