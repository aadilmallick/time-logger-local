import { useEffect, useState } from "react";
import { useAppStore } from "../lib/AppContext";
import { calculateDuration, formatDuration, formatTime } from "../lib/utils";
import { Square } from "lucide-react";
import { Button, Badge, Dialog, Label, Input, Select } from "./UIComponents";
import type { CurrentTask, Entry } from "../types";

export const EntryEditor = ({
  entry,
  isOpen,
  onClose,
}: {
  entry: Entry;
  isOpen: boolean;
  onClose: () => void;
}) => {
  const { categories, updateEntry } = useAppStore();
  const [taskName, setTaskName] = useState(entry.taskName);
  const [desc, setDesc] = useState(entry.description);
  const [catId, setCatId] = useState(entry.categoryId);

  // For time editing, working with HH:MM strings
  const getHHMM = (iso: string) => {
    const d = new Date(iso);
    return `${d.getHours().toString().padStart(2, "0")}:${d.getMinutes().toString().padStart(2, "0")}`;
  };

  const [startTimeStr, setStartTimeStr] = useState(getHHMM(entry.startTime));
  const [endTimeStr, setEndTimeStr] = useState(getHHMM(entry.endTime));

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskName.trim()) return;

    // Reconstruct ISO strings for today with new times
    const startDt = new Date(entry.startTime);
    const [sh, sm] = startTimeStr.split(":").map(Number);
    startDt.setHours(sh, sm, 0, 0);

    const endDt = new Date(entry.endTime);
    const [eh, em] = endTimeStr.split(":").map(Number);
    endDt.setHours(eh, em, 0, 0);

    const updated: Entry = {
      ...entry,
      taskName,
      description: desc,
      categoryId: catId,
      startTime: startDt.toISOString(),
      endTime: endDt.toISOString(),
    };

    const success = await updateEntry(updated);
    if (success) onClose();
  };

  return (
    <Dialog isOpen={isOpen} onClose={onClose} title="Edit Entry">
      <form onSubmit={handleSave} className="space-y-4">
        <div>
          <Label>Task Name</Label>
          <Input
            required
            value={taskName}
            onChange={(e: any) => setTaskName(e.target.value)}
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
          <Label>Description</Label>
          <Input value={desc} onChange={(e: any) => setDesc(e.target.value)} />
        </div>
        <div className="flex justify-end gap-2 pt-2 border-t dark:border-slate-800">
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit">Save Changes</Button>
        </div>
      </form>
    </Dialog>
  );
};
