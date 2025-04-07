// src/pages/MilestoneDetail.tsx
import React, { useEffect, useState, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Container,
  Typography,
  TextField,
  Button,
  Box,
  Paper,
  IconButton,
  Checkbox,
  FormControlLabel,
  Stack,
  Divider,
  Chip,
  useMediaQuery,
  Theme,
} from "@mui/material";
import { Delete } from "@mui/icons-material";
import { toast } from "react-toastify";
import api from "../api";
import { AuthContext } from "../context/AuthContext";

interface ChecklistItem {
  text: string;
  checked: boolean;
}

interface ChecklistGroup {
  title: string;
  items: ChecklistItem[];
}

// Parse markdown checklist into structured data
const parseChecklistMarkdown = (markdown: string): ChecklistGroup[] => {
  // Split the markdown into groups by "### " at beginning of line
  const groupSplits = markdown.split(/(?=^### )/m);
  const groups: ChecklistGroup[] = [];

  groupSplits.forEach((groupText) => {
    const lines = groupText.split("\n").filter((line) => line.trim() !== "");
    if (lines.length === 0) return;
    // The first line is the group header
    const groupTitle = lines[0].replace(/^###\s*/, "").trim();
    const items: ChecklistItem[] = [];
    // Process each subsequent line for checklist items
    for (let i = 1; i < lines.length; i++) {
      const itemMatch = lines[i].match(/^- \[([ x])\]\s+(.*)$/);
      if (itemMatch) {
        const checked = itemMatch[1] === "x";
        const text = itemMatch[2].trim();
        if (text.length > 0) {
          items.push({ text, checked });
        }
      }
    }
    groups.push({ title: groupTitle, items });
  });

  return groups;
};

// Generate markdown checklist from structured data
const generateChecklistMarkdown = (checklists: ChecklistGroup[]): string => {
  return checklists
    .map(
      (group) =>
        `### ${group.title}\n` +
        group.items
          .map((item) => `- [${item.checked ? "x" : " "}] ${item.text}`)
          .join("\n")
    )
    .join("\n\n");
};

const formatDate = (dateArr: number[]): string => {
  const [year, month, day, hour, minute] = dateArr;
  const pad = (n: number) => n.toString().padStart(2, "0");
  return `${year}-${pad(month)}-${pad(day)}T${pad(hour)}:${pad(minute)}`;
};

const MilestoneDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext)!;
  const [milestone, setMilestone] = useState<any | null>(null);
  const [checklists, setChecklists] = useState<ChecklistGroup[]>([]);
  // Additional fields for freelancer fulfillment:
  const [deliverableUrl, setDeliverableUrl] = useState("");
  const [fulfillmentComment, setFulfillmentComment] = useState("");
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [revealUrl, setRevealUrl] = useState(false);

  // Determine role
  const isEmployer = user?.role === "EMPLOYER";
  const isFreelancer = user?.role === "FREELANCER";

  // Use responsive design (reduce horizontal padding on larger screens)
  const isLargeScreen = useMediaQuery((theme: Theme) =>
    theme.breakpoints.up("lg")
  );

  useEffect(() => {
    if (id) {
      const fetchMilestone = async () => {
        try {
          const response = await api.get(`/milestones/${id}`);
          const ms = response.data.data;
          if (ms.dueDate && Array.isArray(ms.dueDate)) {
            ms.dueDate = formatDate(ms.dueDate);
          }

          setMilestone(ms);
          if (ms.checklist) {
            setChecklists(parseChecklistMarkdown(ms.checklist));
          }
          if (ms.deliverableUrl) setDeliverableUrl(ms.deliverableUrl);
          if (ms.fulfillmentComment)
            setFulfillmentComment(ms.fulfillmentComment);
        } catch (error) {
          console.error("Error fetching milestone:", error);
          toast.error("Failed to load milestone details.");
        }
      };
      fetchMilestone();
    }
  }, [id]);

  // Checklist handlers for employer editing
  const handleCheckItem = (groupIndex: number, itemIndex: number) => {
    const updated = [...checklists];
    updated[groupIndex].items[itemIndex].checked =
      !updated[groupIndex].items[itemIndex].checked;
    setChecklists(updated);
  };

  const handleRemoveItem = (groupIndex: number, itemIndex: number) => {
    const updated = [...checklists];
    updated[groupIndex].items.splice(itemIndex, 1);
    setChecklists(updated);
  };

  const handleRemoveGroup = (groupIndex: number) => {
    const updated = [...checklists];
    updated.splice(groupIndex, 1);
    setChecklists(updated);
  };

  // Employer update handler
  const handleUpdateMilestone = async () => {
    // Validate required fields
    if (
      !milestone.title.trim() ||
      !milestone.description.trim() ||
      !milestone.dueDate
    ) {
      toast.error("Title, Description, and Due Date are required.");
      return;
    }
    // Validate that there is at least one checklist item in each group
    const emptyGroup = checklists.find((group) => group.items.length === 0);
    if (emptyGroup) {
      toast.error("Please remove empty checklist groups or add items.");
      return;
    }
    try {
      const checklistMarkdown = generateChecklistMarkdown(checklists);
      await api.put(`/milestones/${id}/update`, {
        title: milestone.title,
        description: milestone.description,
        dueDate: milestone.dueDate,
        checklist: checklistMarkdown,
      });
      toast.success("Milestone updated successfully!");
      navigate(`/milestone-detail/${id}`);
    } catch (error) {
      console.error("Error updating milestone:", error);
      toast.error("Failed to update milestone.");
    }
  };

  // Freelancer fulfillment handler
  const handleFulfillMilestone = async () => {
    if (!deliverableUrl.trim()) {
      toast.error("Please provide a deliverable URL.");
      return;
    }
    try {
      const checklistMarkdown = generateChecklistMarkdown(checklists);
      const payload = {
        deliverableUrl,
        fulfillmentComment,
        checklist: checklistMarkdown,
      };
      await api.put(`/milestones/${id}/fulfill`, payload);
      toast.success("Milestone fulfilled successfully!");
      navigate(`/milestone-detail/${id}`);
    } catch (error) {
      console.error("Error fulfilling milestone:", error);
      toast.error("Failed to fulfill milestone.");
    }
  };

  const handleFinalPayment = async () => {
    if (!milestone) return;
    setPaymentLoading(true);
    try {
      await api.post(`/payment/milestone/${milestone.id}`);
      toast.success("Payment successful. Deliverable unlocked.");
      navigate(0);
    } catch (error) {
      console.error("Final payment failed:", error);
      toast.error("Payment failed. Please try again.");
    } finally {
      setPaymentLoading(false);
    }
  };

  if (!milestone) return <Typography>Loading...</Typography>;

  return (
    <Container maxWidth={isLargeScreen ? "md" : "sm"} sx={{ mt: 4, mb: 4 }}>
      <Paper sx={{ p: 4, borderRadius: 3, boxShadow: 6 }}>
        <Typography variant="h4" gutterBottom align="center" color="primary">
          Milestone Details
        </Typography>

        {/* Title, Description, Due Date */}
        <Stack spacing={2}>
          <TextField
            fullWidth
            label="Title"
            value={milestone.title}
            onChange={(e) =>
              isEmployer &&
              setMilestone({ ...milestone, title: e.target.value })
            }
            disabled={!isEmployer}
            InputProps={{ readOnly: !isEmployer }}
          />
          <TextField
            fullWidth
            label="Description"
            value={milestone.description}
            multiline
            rows={4}
            onChange={(e) =>
              isEmployer &&
              setMilestone({ ...milestone, description: e.target.value })
            }
            disabled={!isEmployer}
            InputProps={{ readOnly: !isEmployer }}
          />
          <TextField
            fullWidth
            label="Due Date"
            type="datetime-local"
            InputLabelProps={{ shrink: true }}
            value={milestone.dueDate}
            onChange={(e) =>
              isEmployer &&
              setMilestone({ ...milestone, dueDate: e.target.value })
            }
            disabled={!isEmployer}
            InputProps={{ readOnly: !isEmployer }}
          />
        </Stack>

        <Divider sx={{ my: 3 }} />

        {/* Checklist Section */}
        <Typography variant="h6" sx={{ mb: 1 }}>
          Checklist
        </Typography>
        {checklists.map((group, groupIndex) => (
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
            <Box
              sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}
            >
              <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                {group.title}
              </Typography>
              {isEmployer && (
                <IconButton
                  color="error"
                  onClick={() => handleRemoveGroup(groupIndex)}
                  size="small"
                >
                  <Delete fontSize="small" />
                </IconButton>
              )}
            </Box>
            {group.items.map((item, itemIndex) => (
              <Box
                key={itemIndex}
                sx={{ display: "flex", alignItems: "center", ml: 2 }}
              >
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={item.checked}
                      onChange={() => handleCheckItem(groupIndex, itemIndex)}
                    />
                  }
                  label={item.text}
                />
                {isEmployer && (
                  <IconButton
                    color="error"
                    onClick={() => handleRemoveItem(groupIndex, itemIndex)}
                    size="small"
                  >
                    <Delete fontSize="small" />
                  </IconButton>
                )}
              </Box>
            ))}
          </Paper>
        ))}

        {/* Action Section */}
        {isEmployer ? (
          <Box sx={{ mt: 3, textAlign: "center" }}>
            <Button
              onClick={handleUpdateMilestone}
              variant="contained"
              color="primary"
            >
              Update Milestone
            </Button>
          </Box>
        ) : (
          <Box>
            <TextField
              fullWidth
              label="Deliverable URL"
              value={deliverableUrl}
              onChange={(e) => setDeliverableUrl(e.target.value)}
              required
              placeholder="https://example.com/deliverable"
              sx={{ mb: 2 }}
            />
            <TextField
              fullWidth
              label="Fulfillment Comment"
              value={fulfillmentComment}
              onChange={(e) => setFulfillmentComment(e.target.value)}
              multiline
              rows={4}
              placeholder="Enter your comments on the deliverable..."
              sx={{ mb: 2 }}
            />
            <Box sx={{ mt: 3, textAlign: "center" }}>
              <Button
                onClick={handleFulfillMilestone}
                variant="contained"
                color="primary"
              >
                Fulfill Milestone
              </Button>
            </Box>
          </Box>
        )}

        {(isFreelancer ||
          (isEmployer &&
            milestone.reviewStatus?.toLowerCase() !== "in_progress")) &&
          milestone.reviewStatus?.toLowerCase() !== "pending" && (
            <Paper
              sx={{
                p: 3,
                mt: 3,
                backgroundColor: (() => {
                  const status = milestone.reviewStatus.toLowerCase();
                  if (status === "approved") return "#e8f5e9"; // light green
                  if (status === "rejected") return "#ffebee"; // light red
                  if (status === "in_progress") return "#fff8e1"; // light yellow
                  return "#e3f2fd"; // fallback - light blue
                })(),
                borderLeft: `5px solid ${
                  milestone.reviewStatus.toLowerCase() === "approved"
                    ? "#388e3c"
                    : milestone.reviewStatus.toLowerCase() === "rejected"
                    ? "#d32f2f"
                    : milestone.reviewStatus.toLowerCase() === "in_progress"
                    ? "#fbc02d"
                    : "#1976d2"
                }`,
              }}
            >
              <Typography variant="h6" color="primary" gutterBottom>
                Review from Employer
              </Typography>

              <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                Review Status:
              </Typography>
              <Chip
                label={milestone.reviewStatus}
                sx={{ mb: 2 }}
                color={
                  milestone.reviewStatus.toLowerCase() === "approved"
                    ? "success"
                    : milestone.reviewStatus.toLowerCase() === "rejected"
                    ? "error"
                    : milestone.reviewStatus.toLowerCase() === "in_progress"
                    ? "warning"
                    : "default"
                }
                variant="outlined"
              />

              {milestone.feedback ? (
                <>
                  <Typography
                    variant="subtitle1"
                    sx={{ fontWeight: 600, mt: 2 }}
                  >
                    Feedback:
                  </Typography>
                  <Paper
                    variant="outlined"
                    sx={{
                      backgroundColor: "#fafafa",
                      p: 2,
                      mt: 1,
                      whiteSpace: "pre-wrap",
                      fontSize: "0.95rem",
                    }}
                  >
                    {milestone.feedback}
                  </Paper>
                </>
              ) : (
                <Typography sx={{ fontStyle: "italic", mt: 2 }}>
                  No feedback provided.
                </Typography>
              )}
            </Paper>
          )}

        {/* Inline Review Section for Employer */}
        {isEmployer &&
          milestone.deliverableUrl &&
          milestone.reviewStatus.toLowerCase() === "pending" && (
            <Paper
              sx={{
                p: 3,
                mt: 3,
                backgroundColor: "#fff3e0",
                borderLeft: "5px solid #ffa000",
              }}
            >
              <Typography variant="h6" color="primary" gutterBottom>
                Review Milestone Submission
              </Typography>
              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                  Deliverable:
                </Typography>
                {milestone.finalMilestone && milestone.hidden && !revealUrl ? (
                  <>
                    <Typography color="error" sx={{ mt: 1, mb: 2 }}>
                      This is a final milestone. You must complete the final
                      payment to access the deliverable.
                    </Typography>
                    <Button
                      variant="contained"
                      color="warning"
                      onClick={handleFinalPayment}
                      disabled={paymentLoading}
                    >
                      {paymentLoading
                        ? "Processing..."
                        : `Pay ${milestone.contract.finalPaymentAmount} to Unlock`}
                    </Button>
                  </>
                ) : (
                  <Button
                    variant="outlined"
                    color="primary"
                    href={milestone.deliverableUrl}
                    target="_blank"
                    sx={{ mt: 1 }}
                  >
                    View Deliverable
                  </Button>
                )}
              </Box>
              <TextField
                fullWidth
                label="Review Feedback"
                multiline
                rows={3}
                value={milestone.feedback || ""}
                onChange={(e) =>
                  setMilestone({ ...milestone, feedback: e.target.value })
                }
                sx={{ mb: 2 }}
              />
              <Stack direction="row" spacing={2} justifyContent="center">
                <Button
                  variant="contained"
                  color="success"
                  onClick={async () => {
                    try {
                      const payload = {
                        reviewStatus: "APPROVED",
                        feedback: milestone.feedback || "",
                      };
                      await api.put(`/milestones/${id}/review`, payload);
                      toast.success("Milestone approved!");
                      navigate(0); // refresh the view
                    } catch (error) {
                      console.error("Error reviewing milestone:", error);
                      toast.error("Failed to submit approval.");
                    }
                  }}
                >
                  Approve
                </Button>
                <Button
                  variant="contained"
                  color="error"
                  onClick={async () => {
                    try {
                      const payload = {
                        reviewStatus: "REJECTED",
                        feedback: milestone.feedback || "",
                      };
                      await api.put(`/milestones/${id}/review`, payload);
                      toast.success("Milestone rejected!");
                      navigate(0); // refresh the view
                    } catch (error) {
                      console.error("Error reviewing milestone:", error);
                      toast.error("Failed to submit rejection.");
                    }
                  }}
                >
                  Reject
                </Button>
              </Stack>
            </Paper>
          )}
      </Paper>
    </Container>
  );
};

export default MilestoneDetail;
