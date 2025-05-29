import {
  Box,
  DialogContent,
  IconButton,
  Modal,
  Typography,
  Button,
} from "@mui/material";
import React from "react";
import DeleteOutlineOutlinedIcon from "@mui/icons-material/DeleteOutlineOutlined";
import CloseIcon from "@mui/icons-material/close";
interface DialogComponentProps {
  open: boolean;
  handleClose: () => void;
  quantity: number;
  onDelete: () => void;
  type?: string;
}

const DeleteDialog: React.FC<DialogComponentProps> = ({
  open,
  handleClose,
  quantity,
  onDelete,
  type,
}) => {
  const handleDelete = () => {
    onDelete();
    handleClose();
  };
  return (
    <>
      <Modal
        open={open}
        onClose={(event, reason) => {
          if (reason !== "backdropClick") {
            handleClose();
          }
        }}
        disableEnforceFocus
        hideBackdrop
        style={{ position: "initial" }}
        slotProps={{
          backdrop: {
            sx: {
              position: "fixed",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: "red",
              zIndex: -1,
              pointerEvents: "none",
            },
          },
        }}
      >
        <Box
          sx={{
            position: "absolute",
            bottom: "20px",
            left: "50%",
            transform: "translate(-50%, 0)",
            width: "100%",
            maxWidth: 400,
            backgroundColor: "white",
            boxShadow: "0px 4px 4px rgba(0, 0, 0, 0.2)",
            borderRadius: "8px",
            pointerEvents: "auto",
          }}
        >
          <DialogContent
            sx={{
              padding: 0,
              display: "flex",
              alignItems: "center",
              height: "35px",
              border: "2px",
              boxShadow: 24,
              borderRadius: "8px",
            }}
          >
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                backgroundColor: "#99BC4D",
                height: "100%",
                width: "35px",
                justifyContent: "center",
                color: "#fff",
                borderTopLeftRadius: "8px",
                borderBottomLeftRadius: "8px",
                fontWeight: 600,
              }}
            >
              {quantity}
            </Box>
            <Typography
              sx={{
                flexGrow: 1,
                paddingLeft: "16px",
                color: "#000",
                fontSize: "14px",
              }}
            >
              Data Selected
            </Typography>
            <Button
              size="small"
              color="error"
              variant="contained"
              startIcon={<DeleteOutlineOutlinedIcon />}
              onClick={handleDelete}
              sx={{ marginRight: "8px", height: "32px", textTransform: "none" }}
            >
              Delete
            </Button>
            <IconButton
              size="small"
              color="default"
              onClick={handleClose}
              sx={{ marginRight: "8px", color: "#9CA8B3" }}
            >
              <CloseIcon />
            </IconButton>
          </DialogContent>
        </Box>
      </Modal>
    </>
  );
};

export default DeleteDialog;
