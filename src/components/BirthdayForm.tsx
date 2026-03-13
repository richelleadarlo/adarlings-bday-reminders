import { useState } from "react";
import { format } from "date-fns";
import { CalendarIcon, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface BirthdayFormProps {
  onAdd: (name: string, date: Date) => void;
}

/** Form styled for the blue card context */
const BirthdayForm = ({ onAdd }: BirthdayFormProps) => {
  const [name, setName] = useState("");
  const [date, setDate] = useState<Date>();
  const [open, setOpen] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !date) return;
    onAdd(name.trim(), date);
    setName("");
    setDate(undefined);
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3">
      {/* Name input */}
      <Input
        placeholder="Person's name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        className="bg-card-blue-foreground/25 border-card-blue-foreground/40 text-card-blue-foreground placeholder:text-card-blue-foreground/50 font-body focus-visible:ring-card-blue-foreground/40"
      />

      {/* Date picker */}
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className={cn(
              "w-full justify-start text-left font-normal bg-card-blue-foreground/25 border-card-blue-foreground/40 hover:bg-card-blue-foreground/35 text-card-blue-foreground",
              !date && "text-card-blue-foreground/40"
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {date ? format(date, "MMM d, yyyy") : "Pick a date"}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="single"
            selected={date}
            onSelect={(d) => {
              setDate(d);
              setOpen(false);
            }}
            disabled={(d) => d > new Date()}
            captionLayout="dropdown-buttons"
            fromYear={1900}
            toYear={new Date().getFullYear()}
            initialFocus
            className="p-3 pointer-events-auto"
          />
        </PopoverContent>
      </Popover>

      {/* Submit button */}
      <Button
        type="submit"
        disabled={!name.trim() || !date}
        className="bg-card-blue-foreground/20 text-card-blue-foreground hover:bg-card-blue-foreground/30 border border-card-blue-foreground/20"
      >
        <Plus className="mr-1 h-4 w-4" />
        Add Birthday
      </Button>
    </form>
  );
};

export default BirthdayForm;
