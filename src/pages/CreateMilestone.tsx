import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Container,
  Typography,
  TextField,
  Button,
  Box,
  Paper,
  Stack,
  IconButton,
} from "@mui/material";
import { toast } from "react-toastify";
import api from "../api";
import { Delete } from "@mui/icons-material";

interface ChecklistItem {
  text: string;
}

interface ChecklistGroup {
  title: string;
  items: ChecklistItem[];
}

interface CreateMilestoneDto {
  contractId: number;
  title: string;
  description: string;
  dueDate: string;
  submissionType: string;
  isFinal: boolean;
  checklist: string;
}

const CreateMilestone = () => {
  const { contractId } = useParams<{ contractId: string }>();
  const navigate = useNavigate();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [finalMilestone, setFinalMilestone] = useState(false);
  const [titleError, setTitleError] = useState(false);
  const [descriptionError, setDescriptionError] = useState(false);
  const [dueDateError, setDueDateError] = useState(false);

  const [checklists, setChecklists] = useState<ChecklistGroup[]>([]);

  const handleAddGroup = () => {
    setChecklists([...checklists, { title: "Checklist", items: [] }]);
  };

  const handleGroupTitleChange = (index: number, newTitle: string) => {
    const updated = [...checklists];
    updated[index].title = newTitle;
    setChecklists(updated);
  };

  const handleAddItem = (groupIndex: number) => {
    const updated = [...checklists];
    updated[groupIndex].items.push({ text: "" });
    setChecklists(updated);
  };

  const handleItemChange = (
    groupIndex: number,
    itemIndex: number,
    text: string
  ) => {
    const updated = [...checklists];
    updated[groupIndex].items[itemIndex].text = text;
    setChecklists(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!contractId) {
      toast.error("Contract ID is missing.");
      return;
    }

    const isTitleEmpty = title.trim() === "";
    const isDescriptionEmpty = description.trim() === "";
    const isDueDateEmpty = dueDate.trim() === "";

    setTitleError(isTitleEmpty);
    setDescriptionError(isDescriptionEmpty);
    setDueDateError(isDueDateEmpty);

    const hasEmptyGroupTitle = checklists.some(
      (group) => group.title.trim() === ""
    );
    const hasEmptyItems = checklists.some((group) =>
      group.items.some((item) => item.text.trim() === "")
    );
    const hasEmptyGroups = checklists.some((group) => group.items.length === 0);

    if (isTitleEmpty || isDescriptionEmpty || isDueDateEmpty) {
      toast.error("Please fill in all required fields.");
      return;
    }

    if (hasEmptyGroupTitle || hasEmptyItems) {
      toast.error(
        "Please fill in all checklist titles and items, or remove empty ones."
      );
      return;
    }

    if (hasEmptyGroups) {
      toast.error("Checklist groups must contain at least one item.");
      return;
    }

    const checklistMarkdown = checklists
      .map(
        (group) =>
          `### ${group.title.trim()}\n` +
          group.items.map((item) => `- [ ] ${item.text.trim()}`).join("\n")
      )
      .join("\n\n");

    const payload: CreateMilestoneDto = {
      contractId: Number(contractId),
      title,
      description,
      dueDate,
      submissionType: "LINK",
      isFinal: finalMilestone,
      checklist: checklistMarkdown,
    };

    try {
      await api.post("/milestones/instruction", payload);
      toast.success("Milestone instruction created successfully!");
      navigate(`/contract/${contractId}/milestones`);
    } catch (error) {
      console.error("Error creating milestone:", error);
      toast.error("Failed to create milestone.");
    }
  };

  return (
    <Container maxWidth="sm" sx={{ mt: 4 }}>
      <Paper sx={{ p: 4, borderRadius: 3, boxShadow: 6 }}>
        <Typography variant="h4" gutterBottom align="center" color="primary">
          Create Milestone Instruction
        </Typography>

        <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 3 }}>
          <Stack spacing={2}>
            <TextField
              fullWidth
              label="Title"
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
                setTitleError(false);
              }}
              required
              error={titleError}
              helperText={titleError ? "Title is required." : ""}
            />

            <TextField
              fullWidth
              label="Description"
              value={description}
              multiline
              rows={4}
              onChange={(e) => {
                setDescription(e.target.value);
                setDescriptionError(false);
              }}
              required
              error={descriptionError}
              helperText={descriptionError ? "Description is required." : ""}
            />

            <TextField
              fullWidth
              label="Due Date"
              type="datetime-local"
              InputLabelProps={{ shrink: true }}
              value={dueDate}
              onChange={(e) => {
                setDueDate(e.target.value);
                setDueDateError(false);
              }}
              required
              error={dueDateError}
              helperText={dueDateError ? "Due date is required." : ""}
            />

            {/* Checklist Section */}
            <Box>
              <Typography variant="h6" sx={{ mb: 1 }}>
                Checklist
              </Typography>
              <Button onClick={handleAddGroup} size="small" sx={{ mb: 2 }}>
                + Add Checklist Group
              </Button>

              {checklists.map((group, groupIndex) => {
                const isGroupTitleEmpty = group.title.trim() === "";
                const emptyItems = group.items
                  .map((item, i) => ({
                    index: i,
                    isEmpty: item.text.trim() === "",
                  }))
                  .filter((it) => it.isEmpty);

                return (
                  <Paper
                    key={groupIndex}
                    elevation={3}
                    sx={{
                      p: 2,
                      mb: 3,
                      borderLeft: "5px solid #1976d2",
                      backgroundColor: "#f5faff",
                    }}
                  >
                    {/* Group Header */}
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        mb: 1,
                      }}
                    >
                      <Typography variant="subtitle1" fontWeight={600}>
                        Checklist Group {groupIndex + 1}
                      </Typography>
                      <IconButton
                        color="error"
                        onClick={() => {
                          const updated = [...checklists];
                          updated.splice(groupIndex, 1);
                          setChecklists(updated);
                        }}
                      >
                        <Delete />
                      </IconButton>
                    </Box>

                    <TextField
                      fullWidth
                      label="Group Title"
                      value={group.title}
                      onChange={(e) =>
                        handleGroupTitleChange(groupIndex, e.target.value)
                      }
                      sx={{ mb: 1 }}
                      error={isGroupTitleEmpty}
                      helperText={
                        isGroupTitleEmpty ? "Group title cannot be empty." : ""
                      }
                    />

                    <Box sx={{ pl: 2 }}>
                      {group.items.map((item, itemIndex) => {
                        const isEmpty = item.text.trim() === "";
                        return (
                          <Box
                            key={itemIndex}
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              gap: 1,
                              mb: 1,
                            }}
                          >
                            <TextField
                              fullWidth
                              label={`Item ${itemIndex + 1}`}
                              value={item.text}
                              onChange={(e) =>
                                handleItemChange(
                                  groupIndex,
                                  itemIndex,
                                  e.target.value
                                )
                              }
                              size="small"
                              error={isEmpty}
                              helperText={
                                isEmpty ? "Item text cannot be empty." : ""
                              }
                            />
                            <IconButton
                              color="error"
                              onClick={() => {
                                const updated = [...checklists];
                                updated[groupIndex].items.splice(itemIndex, 1);
                                setChecklists(updated);
                              }}
                            >
                              <Delete fontSize="small" />
                            </IconButton>
                          </Box>
                        );
                      })}
                    </Box>

                    <Button
                      onClick={() => handleAddItem(groupIndex)}
                      size="small"
                      variant="text"
                      sx={{ mt: 1, ml: 2 }}
                    >
                      + Add Item
                    </Button>
                  </Paper>
                );
              })}
            </Box>

            <Stack direction="row" spacing={2} alignItems="center">
              <Typography>Is Final Milestone?</Typography>
              <Button
                variant={finalMilestone ? "contained" : "outlined"}
                color="primary"
                onClick={() => setFinalMilestone(!finalMilestone)}
              >
                {finalMilestone ? "Yes" : "No"}
              </Button>
            </Stack>

            <Button type="submit" variant="contained" color="primary">
              Create Milestone
            </Button>
          </Stack>
        </Box>
      </Paper>
    </Container>
  );
};

export default CreateMilestone;
