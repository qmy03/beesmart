import React, { useEffect, useState } from "react";
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Typography,
} from "@mui/material";
import TextField from "@/app/components/textfield";
import { Button } from "@/app/components/button";
import apiService from "@/app/untils/api";
import { Close } from "@mui/icons-material";

interface DialogPopupProps {
  open: boolean;
  onClose: () => void;
  onTopicAdded: () => void;
  accessToken: string;
  selectedGradeId: string;
  selectedSemester: string;
  selectedBookId: string;
  selectedSubjectId: string;
  onSuccess: (message: string) => void;
}

interface TopicResponse {
  message: string;
}

const DialogPopup: React.FC<
  DialogPopupProps & { type: "add" | "edit"; topic?: any }
> = ({
  open,
  onClose,
  onTopicAdded,
  accessToken,
  selectedGradeId,
  selectedSemester,
  selectedBookId,
  selectedSubjectId,
  type,
  topic,
  onSuccess,
}) => {
  const [topicName, setTopicName] = useState("");
  const [topicNumber, setTopicNumber] = useState(1);

  // Reset form when dialog opens or type changes
  useEffect(() => {
    if (open) {
      if (type === "edit" && topic) {
        setTopicName(topic.topicName || "");
        setTopicNumber(topic.topicNumber || 1);
      } else if (type === "add") {
        // Reset to default values for add mode
        setTopicName("");
        setTopicNumber(1);
      }
    }
  }, [open, type, topic]);

  // Also reset when dialog closes to ensure clean state
  useEffect(() => {
    if (!open) {
      setTopicName("");
      setTopicNumber(1);
    }
  }, [open]);

  const handleSubmit = () => {
    const body = {
      topicName,
      topicNumber,
      semester: selectedSemester,
    };

    if (type === "add") {
      apiService
        .post<TopicResponse>(
          `/topics/grade/${selectedGradeId}/subject/${selectedSubjectId}/bookType/${selectedBookId}`,
          body,
          {
            headers: { Authorization: `Bearer ${accessToken}` },
          }
        )
        .then((response) => {
          console.log("Topic added:", response);
          if (response.status === 200) {
            onSuccess(response.data.message);
            onTopicAdded();
            onClose();
          }
        })
        .catch((error) => {
          console.error("Error adding topic:", error);
        });
    } else if (type === "edit" && topic?.topicId) {
      apiService
        .put<TopicResponse>(`/topics/${topic.topicId}`, body, {
          headers: { Authorization: `Bearer ${accessToken}` },
        })
        .then((response) => {
          console.log("Topic updated:", response);
          if (response.status === 200) {
            onSuccess(response.data.message);
            onTopicAdded();
            onClose();
          }
        })
        .catch((error) => {
          console.error("Error updating topic:", error);
        });
    }
  };

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle sx={{ display: "flex", alignItems: "center" }}>
        <Typography variant="h6" sx={{ flexGrow: 1 }}>
          {type === "add" ? "Thêm Chủ điểm mới" : "Chỉnh Sửa Chủ điểm"}
        </Typography>
        <Close onClick={onClose} fontSize="small" sx={{ cursor: "pointer" }} />
      </DialogTitle>
      <DialogContent>
        <TextField
          label="Tên Chủ Đề"
          fullWidth
          value={topicName}
          onChange={(e) => setTopicName(e.target.value)}
        />
        <TextField
          label="Số Chủ Đề"
          fullWidth
          value={topicNumber}
          onChange={(e) => setTopicNumber(Number(e.target.value))}
          type="number"
        />
        <TextField label="Học Kì" fullWidth value={selectedSemester} disabled />
      </DialogContent>
      <DialogActions sx={{ paddingRight: 3 }}>
        <Button onClick={handleSubmit} color="primary">
          {type === "add" ? "Lưu" : "Cập Nhật"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default DialogPopup;