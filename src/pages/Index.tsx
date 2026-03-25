import { useState, useEffect, useCallback } from "react";
import confetti from "canvas-confetti";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronRight, ChevronLeft } from "lucide-react";
import {
  Birthday,
  loadBirthdays,
  saveBirthdays,
  sortByUpcoming,
  getDaysUntilBirthday,
} from "@/lib/birthdays";
import BirthdayForm from "@/components/BirthdayForm";
import BirthdayList from "@/components/BirthdayList";
import AlbumSection from "@/components/AlbumSection";

const tabs = ["HI", "ADD", "BIRTHDAYS", "ALBUMS"] as const;

const Index = () => {
  const [birthdays, setBirthdays] = useState<Birthday[]>([]);
  const [currentPage, setCurrentPage] = useState(0); // 0 = landing, 1 = form, 2 = list
  const [direction, setDirection] = useState(1);

  useEffect(() => {
    const loaded = sortByUpcoming(loadBirthdays());
    setBirthdays(loaded);
    const hasToday = loaded.some((b) => getDaysUntilBirthday(b.date) === 0);
    if (hasToday) {
      confetti({ particleCount: 120, spread: 80, origin: { y: 0.6 } });
    }
  }, []);

  const persist = useCallback((updated: Birthday[]) => {
    const sorted = sortByUpcoming(updated);
    setBirthdays(sorted);
    saveBirthdays(sorted);
  }, []);

  const handleAdd = (name: string, date: Date) => {
    const newBirthday: Birthday = {
      id: crypto.randomUUID(),
      name,
      date: date.toISOString().split("T")[0],
    };
    persist([...birthdays, newBirthday]);
  };

  const handleDelete = (id: string) => {
    persist(birthdays.filter((b) => b.id !== id));
  };

  const goTo = (page: number) => {
    setDirection(page > currentPage ? 1 : -1);
    setCurrentPage(page);
  };

  const nextPage = () => {
    if (currentPage < tabs.length - 1) goTo(currentPage + 1);
  };

  const prevPage = () => {
    if (currentPage > 0) goTo(currentPage - 1);
  };

  /** Book-style page-turn variants */
  const pageVariants = {
    enter: (dir: number) => ({
      rotateY: dir > 0 ? 90 : -90,
      opacity: 0,
      scale: 0.95,
    }),
    center: {
      rotateY: 0,
      opacity: 1,
      scale: 1,
    },
    exit: (dir: number) => ({
      rotateY: dir > 0 ? -90 : 90,
      opacity: 0,
      scale: 0.95,
    }),
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center p-3 sm:p-5 lg:p-8"
      style={{ backgroundImage: "url('/bg-foreal.png')", backgroundSize: "cover", backgroundPosition: "center" }}
    >
      <div className="w-full max-w-2xl">
        {/* Folder-style tabs */}
        <div className="flex justify-center gap-1 -mb-1 relative z-10">
          {tabs.map((tab, i) => (
            <button
              key={tab}
              onClick={() => goTo(i)}
              className="px-4 sm:px-7 py-2 sm:py-2.5 rounded-t-xl text-xs sm:text-sm font-semibold tracking-wider sm:tracking-widest transition-all text-card-blue-foreground overflow-hidden"
              style={{
                fontFamily: "var(--font-body)",
                backgroundImage: currentPage === i
                  ? "linear-gradient(rgba(8,12,35,0.52), rgba(8,12,35,0.52)), url('/overlay-bg.png')"
                  : "linear-gradient(rgba(8,12,35,0.72), rgba(8,12,35,0.72)), url('/overlay-bg.png')",
                backgroundSize: "cover",
                backgroundPosition: "center",
                opacity: currentPage === i ? 1 : 0.75,
              }}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Card body with page-turn animation */}
        <div className="book-container">
          <div
            className="relative card-texture rounded-2xl overflow-hidden shadow-[0_28px_70px_rgba(9,18,52,0.45),0_10px_26px_rgba(0,0,0,0.28)]"
            style={{
              minHeight: "clamp(400px, 65vh, 560px)",
              backgroundImage: "linear-gradient(rgba(8,12,35,0.58), rgba(8,12,35,0.58)), url('/overlay-bg.png')",
              backgroundSize: "cover",
              backgroundPosition: "center",
            }}
          >

            <AnimatePresence mode="wait" custom={direction}>
              <motion.div
                key={currentPage}
                custom={direction}
                variants={pageVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                className="relative z-10 p-4 sm:p-8 lg:p-10"
                style={{ transformOrigin: direction > 0 ? "left center" : "right center" }}
              >
                {currentPage === 0 && (
                  <LandingContent count={birthdays.length} onNext={nextPage} />
                )}
                {currentPage === 1 && (
                  <FormContent onAdd={handleAdd} onNext={nextPage} onPrev={prevPage} />
                )}
                {currentPage === 2 && (
                  <ListContent birthdays={birthdays} onDelete={handleDelete} onPrev={prevPage} />
                )}
                {currentPage === 3 && <AlbumsContent />}
              </motion.div>
            </AnimatePresence>

            {/* Navigation arrows */}
            <div className="absolute bottom-4 left-0 right-0 flex justify-between px-6 z-30">
              <button
                onClick={prevPage}
                disabled={currentPage === 0}
                className="p-2 rounded-full text-card-blue-foreground/60 hover:text-card-blue-foreground disabled:opacity-0 transition-all hover:bg-card-blue-foreground/10"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
              <button
                onClick={nextPage}
                disabled={currentPage === tabs.length - 1}
                className="p-2 rounded-full text-card-blue-foreground/60 hover:text-card-blue-foreground disabled:opacity-0 transition-all hover:bg-card-blue-foreground/10"
              >
                <ChevronRight className="w-6 h-6" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

/** Landing / hero page */
const LandingContent = ({ count, onNext }: { count: number; onNext: () => void }) => (
  <div className="flex flex-col items-center justify-center text-center min-h-[380px] gap-7">
    <h1 className="text-5xl sm:text-6xl font-display font-black italic leading-tight text-card-blue-foreground">
      Adarlings ♡
    </h1>
    <p
      className="text-sm tracking-[0.25em] uppercase text-card-blue-foreground/70"
      style={{ fontFamily: "var(--font-body)" }}
    >
      Never forget a birthday again
    </p>
    {count > 0 && (
      <p className="text-card-blue-foreground/50 text-sm mt-2" style={{ fontFamily: "var(--font-body)" }}>
        🎂 {count} birthday{count !== 1 && "s"} saved
      </p>
    )}
    <button
      onClick={onNext}
      className="mt-4 px-6 py-3 rounded-xl bg-card-blue-foreground/15 text-card-blue-foreground hover:bg-card-blue-foreground/25 transition-colors text-sm tracking-widest uppercase"
      style={{ fontFamily: "var(--font-body)" }}
    >
      Get Started →
    </button>
  </div>
);

/** Form page */
const FormContent = ({
  onAdd,
  onNext,
  onPrev,
}: {
  onAdd: (name: string, date: Date) => void;
  onNext: () => void;
  onPrev: () => void;
}) => (
  <div className="min-h-[380px] flex flex-col gap-6">
    <h2 className="text-3xl font-display font-bold italic text-card-blue-foreground text-center">
      Add a Birthday
    </h2>
    <p
      className="text-card-blue-foreground/60 text-center text-sm"
      style={{ fontFamily: "var(--font-body)" }}
    >
      Who's special day should we remember?
    </p>
    <div className="mt-2">
      <BirthdayForm
        onAdd={(name, date) => {
          onAdd(name, date);
          onNext();
        }}
      />
    </div>
  </div>
);

/** List page */
const ListContent = ({
  birthdays,
  onDelete,
  onPrev,
}: {
  birthdays: Birthday[];
  onDelete: (id: string) => void;
  onPrev: () => void;
}) => (
  <div className="min-h-[380px] flex flex-col gap-4">
    <h2 className="text-3xl font-display font-bold italic text-card-blue-foreground text-center">
      Upcoming
    </h2>
      <div className="mt-2 max-h-[44vh] overflow-y-auto pr-1 custom-scrollbar">
      {birthdays.length === 0 ? (
        <p
          className="text-card-blue-foreground/50 text-center text-sm py-10"
          style={{ fontFamily: "var(--font-body)" }}
        >
          No birthdays yet — go back and add one!
        </p>
      ) : (
        <BirthdayList birthdays={birthdays} onDelete={onDelete} />
      )}
    </div>
  </div>
);

/** Albums page */
const AlbumsContent = () => (
  <div className="min-h-[380px] flex flex-col gap-4">
    <h2 className="text-3xl font-display font-bold italic text-card-blue-foreground text-center">
      Shared Albums
    </h2>
    <p
      className="text-card-blue-foreground/60 text-center text-sm"
      style={{ fontFamily: "var(--font-body)" }}
    >
      Create albums and upload photos everyone can view from this site link.
    </p>
    <div className="mt-1">
      <AlbumSection />
    </div>
  </div>
);

export default Index;
