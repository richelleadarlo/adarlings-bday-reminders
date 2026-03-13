import { format } from "date-fns";
import { Trash2 } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Birthday, getDaysUntilBirthday, getAge } from "@/lib/birthdays";

interface BirthdayCardProps {
  birthday: Birthday;
  onDelete: (id: string) => void;
}

/** A single birthday card styled for the blue card context */
const BirthdayCard = ({ birthday, onDelete }: BirthdayCardProps) => {
  const daysLeft = getDaysUntilBirthday(birthday.date);
  const age = getAge(birthday.date);
  const isToday = daysLeft === 0;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -60 }}
      transition={{ duration: 0.25 }}
      className={cn(
        "rounded-xl p-4 sm:p-5 flex items-center justify-between gap-4 transition-colors",
        isToday
          ? "bg-card-blue-foreground/20 border border-card-blue-foreground/30"
          : "bg-card-blue-foreground/8 hover:bg-card-blue-foreground/12"
      )}
    >
      <div className="flex items-center gap-3 min-w-0">
        <span className="text-xl flex-shrink-0">{isToday ? "🎉" : "🎂"}</span>
        <div className="min-w-0">
          <h3 className="font-display font-bold text-lg sm:text-xl truncate text-card-blue-foreground">
            {birthday.name}
          </h3>
          <p className="text-sm text-card-blue-foreground/60" style={{ fontFamily: "var(--font-body)" }}>
            {format(new Date(birthday.date), "MMM d, yyyy")} · {age} yrs
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2 flex-shrink-0">
        <div className="text-right">
          {isToday ? (
            <span className="font-display font-bold text-card-blue-foreground text-sm">
              Today! 🥳
            </span>
          ) : (
            <div>
              <span className="font-display font-bold text-2xl text-card-blue-foreground">
                {daysLeft}
              </span>
              <span className="text-sm text-card-blue-foreground/60 ml-1">
                {daysLeft === 1 ? "day" : "days"}
              </span>
            </div>
          )}
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => onDelete(birthday.id)}
          className="text-card-blue-foreground/40 hover:text-destructive hover:bg-card-blue-foreground/10 h-8 w-8"
          aria-label={`Delete ${birthday.name}`}
        >
          <Trash2 className="h-3.5 w-3.5" />
        </Button>
      </div>
    </motion.div>
  );
};

export default BirthdayCard;
