import { AnimatePresence } from "framer-motion";
import { Birthday } from "@/lib/birthdays";
import BirthdayCard from "./BirthdayCard";

interface BirthdayListProps {
  birthdays: Birthday[];
  onDelete: (id: string) => void;
}

/** Animated list of birthday cards */
const BirthdayList = ({ birthdays, onDelete }: BirthdayListProps) => {
  if (birthdays.length === 0) {
    return (
      <div className="text-center py-16">
        <span className="text-5xl mb-4 block">🎈</span>
        <p className="text-muted-foreground font-body">
          No birthdays added yet. Add someone special above!
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      <AnimatePresence mode="popLayout">
        {birthdays.map((b) => (
          <BirthdayCard key={b.id} birthday={b} onDelete={onDelete} />
        ))}
      </AnimatePresence>
    </div>
  );
};

export default BirthdayList;
