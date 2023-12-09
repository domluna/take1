import { format, isToday, isYesterday, subDays } from "date-fns";
import {
  MoreHorizontal,
  Trash2,
  PenSquare,
  HelpCircle,
  Settings as SettingsIcon,
} from "lucide-react";
import clsx from "clsx";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Note, GroupedNotes } from "@/lib/types.d";
import { createNewNote } from "@/lib/utils";

const Sidebar = ({
  notes,
  setNotes,
  activeNote,
  setActiveNote,
  setWelcomeModalVisible,
  setSettingsModalVisible,
  titleRef,
}: {
  notes: Note[];
  setNotes: (notes: Note[]) => void;
  activeNote: Note;
  setActiveNote: (note: Note) => void;
  setWelcomeModalVisible: (visible: boolean) => void;
  setSettingsModalVisible: (visible: boolean) => void;
  titleRef: React.RefObject<HTMLInputElement>;
}) => {
  const formatDateDisplay = (updatedAt: Date) => {
    if (isToday(updatedAt)) {
      return format(updatedAt, "h:mm a"); // 12:00 AM
    }
    if (isYesterday(updatedAt)) {
      return "Yesterday";
    }
    if (updatedAt >= subDays(new Date(), 7)) {
      return format(updatedAt, "EEEE"); // Day of the week
    }
    return format(updatedAt, "yyyy-MM-dd"); // Date in yyyy-mm-dd format
  };

  const groupedNotes = notes.reduce<GroupedNotes>((acc, note) => {
    const updatedAt = new Date(note.updatedAt);
    let key;

    if (isToday(updatedAt)) {
      key = "Today";
    } else if (isYesterday(updatedAt)) {
      key = "Yesterday";
    } else if (updatedAt >= subDays(new Date(), 7)) {
      key = "Previous 7 days";
    } else if (updatedAt >= subDays(new Date(), 30)) {
      key = "Previous 30 days";
    } else {
      key = format(updatedAt, "MMMM yyyy"); // Month Year format
    }

    acc[key] = acc[key] || [];
    acc[key].push(note);
    return acc;
  }, {});

  const orderGroups = (group: string) => {
    const order = {
      Today: 1,
      Yesterday: 2,
      "Previous 7 days": 3,
      "Previous 30 days": 4,
    };
    return order[group] || 5; // Groups after "Previous 30 days" will have a higher order
  };

  // Sorting the keys according to the defined order
  const sortedGroupKeys = Object.keys(groupedNotes).sort((a, b) => {
    return orderGroups(a) - orderGroups(b);
  });

  for (const group of sortedGroupKeys) {
    groupedNotes[group].sort((a: Note, b: Note) => {
      return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
    });
  }

  const getExcerpt = (s: string, limit: number) => {
    const idx = s.indexOf("\n");
    const firstLine = idx === -1 ? s : s.slice(0, idx + 1);
    if (firstLine.length > limit) {
      return `${firstLine.slice(0, limit)}...`;
    }
    return firstLine;
  };

  const handleDeleteNote = (noteId: string) => {
    const filteredNotes = notes.filter((note) => note.id !== noteId);
    setNotes(filteredNotes);

    // Check if the deleted note is the currently active note
    if (activeNote.id === noteId) {
      // Set active note to either a new note or another existing note
      const newActiveNote = filteredNotes.length > 0 ? filteredNotes[0] : createNewNote();
      setActiveNote(newActiveNote);
    }
  };

  const handleListItemKeyDown = (e, note) => {
    if (e.key === "Enter") {
      setActiveNote(note);
    }
  };

  const handleDropdownKeyDown = (e, noteId) => {
    if (e.key === "Enter") {
      e.stopPropagation();
      handleDeleteNote(noteId);
      // Close dropdown logic if necessary
    }
  };

  return (
    <div className="w-1/5 flex flex-col h-screen border-r">
      <div className="flex justify-between items-center p-4">
        <h1 className="text-lg font-bold">Take1</h1>
        <button
          type="button"
          onClick={() => {
            setActiveNote(createNewNote());
            titleRef.current?.focus();
          }}
          className="flex items-center justify-center p-2 rounded-full hover:bg-gray-100"
        >
          <PenSquare className="h-5 w-5" />
        </button>
      </div>
      <hr className="my-2" />

      <div className="flex-1 overflow-y-auto">
        {sortedGroupKeys.map((group) => (
          <ul key={group}>
            <div className="px-3 py-2 text-lg">{group}</div>
            {groupedNotes[group].map((note: Note) => (
              <li
                onClick={() => setActiveNote(note)}
                onKeyDown={(e) => handleListItemKeyDown(e, note)}
                key={note.id}
                className={clsx(
                  "cursor-pointer p-3 hover:bg-gray-100 flex justify-between items-center",
                  { "bg-gray-100": note.id === activeNote.id },
                )}
              >
                <div className="flex flex-col ml-2" tabIndex={0} role="button">
                  <div className="text-base font-bold">{getExcerpt(note.title, 20)}</div>
                  <div
                    className={clsx("text-xs flex flex-row", {
                      "space-x-2": formatDateDisplay(new Date(note.updatedAt)) !== "",
                    })}
                  >
                    <div className="font-semibold">
                      {formatDateDisplay(new Date(note.updatedAt))}
                    </div>
                    <div className="text-gray-500">{getExcerpt(note.content, 10)}</div>
                  </div>
                </div>

                <DropdownMenu>
                  <DropdownMenuTrigger>
                    <MoreHorizontal className="h-6 w-6 ml-auto" />
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuItem
                      className="focus:bg-transparent cursor-pointer focus:ring-4"
                      onClick={(e) => {
                        e.stopPropagation(); // Stop event propagation
                        handleDeleteNote(note.id);
                        // Optionally, add logic to close the dropdown menu here
                      }}
                      onKeyDown={(e) => handleDropdownKeyDown(e, note.id)}
                      tabIndex={0}
                      role="menuitem"
                    >
                      <div className="px-4 py-2 flex flex-row items-center justify-center space-x-2 text-red-500 text-xs">
                        <Trash2 />
                        <p>Delete Note</p>
                      </div>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </li>
            ))}
          </ul>
        ))}
      </div>
      <hr className="my-2" />

      <div className="p-4 flex flex-row justify-between">
        <button
          type="button"
          className="flex items-center justify-center p-2 rounded-full hover:bg-gray-100"
          onClick={() => {
            console.log("here");
            setSettingsModalVisible(true);
          }}
        >
          <SettingsIcon className="h-5 w-5" />
        </button>
        <button
          type="button"
          className="flex items-center justify-center p-2 rounded-full hover:bg-gray-100"
          onClick={() => {
            setWelcomeModalVisible(true);
          }}
        >
          <HelpCircle className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
