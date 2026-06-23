import { useEffect, useState } from "react";
import { useAppStore } from "../lib/AppContext";
import { calculateDuration, formatDuration, formatTime } from "../lib/utils";
import { Square } from "lucide-react";
import { Button, Badge, Dialog, Label, Input, Select } from "./UIComponents";
import type { CurrentTask, Entry } from "../types";

export const AddEntryModal = ({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) => {
  const { categories, addEntry } = useAppStore();
  const [taskName, setTaskName] = useState("");
  const [desc, setDesc] = useState("");
  const [catId, setCatId] = useState(categories[0]?.id || "");
  const [startTimeStr, setStartTimeStr] = useState("09:00");
  const [endTimeStr, setEndTimeStr] = useState("10:00");

  useEffect(() => {
    if (isOpen && categories.length > 0 && !catId) setCatId(categories[0].id);
  }, [isOpen, categories, catId]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskName.trim()) return;

    const startDt = new Date();
    const [sh, sm] = startTimeStr.split(":").map(Number);
    startDt.setHours(sh, sm, 0, 0);

    const endDt = new Date();
    const [eh, em] = endTimeStr.split(":").map(Number);
    endDt.setHours(eh, em, 0, 0);

    const success = await addEntry({
      taskName,
      description: desc,
      categoryId: catId,
      startTime: startDt.toISOString(),
      endTime: endDt.toISOString(),
    });

    if (success) {
      setTaskName("");
      setDesc("");
      onClose();
    }
  };

  return (
    <Dialog isOpen={isOpen} onClose={onClose} title="Add Past Entry">
      <form onSubmit={handleSave} className="space-y-4">
        <div>
          <Label>Task Name</Label>
          <Input
            required
            value={taskName}
            onChange={(e: any) => setTaskName(e.target.value)}
            placeholder="What did you do?"
          />
        </div>
        <div>
          <Label>Category</Label>
          <Select value={catId} onChange={(e: any) => setCatId(e.target.value)}>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </Select>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label>Start Time</Label>
            <Input
              type="time"
              required
              value={startTimeStr}
              onChange={(e: any) => setStartTimeStr(e.target.value)}
            />
          </div>
          <div>
            <Label>End Time</Label>
            <Input
              type="time"
              required
              value={endTimeStr}
              onChange={(e: any) => setEndTimeStr(e.target.value)}
            />
          </div>
        </div>
        <div>
          <Label>Description (Optional)</Label>
          <Input
            value={desc}
            onChange={(e: any) => setDesc(e.target.value)}
            placeholder="Brief notes..."
          />
        </div>
        <div className="flex justify-end gap-2 pt-2 border-t dark:border-slate-800">
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit">Add Entry</Button>
        </div>
      </form>
    </Dialog>
  );
};
