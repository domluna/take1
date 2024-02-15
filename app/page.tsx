"use client";
import { useState, useEffect, useRef, useCallback } from "react";
import { v4 as uuidv4 } from "uuid";

import SettingsModal from "@/app/ui/components/SettingsModal";
import WelcomeModal from "@/app/ui/components/WelcomeModal";
import Sidebar from "@/app/ui/components/Sidebar";
import Editor from "@/app/ui/components/Editor";

import { Settings, Note } from "@/lib/types";
import { createNewNote } from "@/lib/utils";

const baseSettings: Settings = {
  isLLMEditorEnabled: false,
  openaiApiKey: "",
};

export default function Page() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [settings, setSettings] = useState<Settings>(baseSettings);
  const [activeNote, setActiveNote] = useState<Note>(createNewNote());

  const [isWelcomeModalVisible, setWelcomeModalVisible] = useState(false);
  const [isSettingsModalVisible, setSettingsModalVisible] = useState(false);

  const titleRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const loadedNotes = JSON.parse(localStorage.getItem("take1-app-notes") || "[]");
    setNotes(loadedNotes);

    const localSettings = localStorage.getItem("take1-app-settings");
    if (localSettings) {
      try {
        setSettings(JSON.parse(localSettings));
      } catch {
        setSettings(baseSettings);
      }
    } else {
      setSettings(baseSettings);
    }

    const hasVisited = JSON.parse(localStorage.getItem("take1-app-hasVisited") || "false");
    if (!hasVisited) {
      setWelcomeModalVisible(true);
      localStorage.setItem("take1-app-hasVisited", "true");
    }
  }, []);

  const setNewNotes = useCallback((newNotes: Note[]) => {
    localStorage.setItem("take1-app-notes", JSON.stringify(newNotes));
    setNotes(newNotes);
  }, []);

  const setNewSettings = useCallback((newSettings: Settings) => {
    localStorage.setItem("take1-app-settings", JSON.stringify(newSettings));
    setSettings(newSettings);
  }, []);

  const saveNote = useCallback(() => {
    if (activeNote.content.trim() === "" && activeNote.title.trim() === "") {
      return;
    }

    const existingNote = notes.find((note) => note.id === activeNote.id);

    if (
      existingNote &&
      existingNote.content.trim() === activeNote.content.trim() &&
      existingNote.title.trim() === activeNote.title.trim()
    ) {
      return;
    }

    let updatedNotes = notes;

    if (activeNote.id) {
      updatedNotes = notes.map((note) => {
        if (note.id === activeNote.id) {
          return {
            ...activeNote,
            updatedAt: new Date(),
          };
        }
        return note;
      });
    } else {
      const newNote = {
        ...activeNote,
        id: uuidv4(),
        updatedAt: new Date(),
      };
      setActiveNote(newNote);
      updatedNotes = [...notes, newNote];
    }

    setNewNotes(updatedNotes);
  }, [activeNote, notes, setNewNotes]);

  const onNoteChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      setActiveNote({ ...activeNote, content: e.target.value });
    },
    [activeNote],
  );

  const saveNoteAutomatically = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (saveNoteAutomatically.current) {
      clearTimeout(saveNoteAutomatically.current);
    }
    saveNoteAutomatically.current = setTimeout(() => {
      saveNote();
    }, 1000);

    return () => {
      if (saveNoteAutomatically.current) {
        clearTimeout(saveNoteAutomatically.current);
      }
    };
  }, [saveNote]);

  return (
    <div className="flex h-screen flex-row items-center">
      <Sidebar
        notes={notes}
        setNotes={setNewNotes}
        activeNote={activeNote}
        setActiveNote={setActiveNote}
        setWelcomeModalVisible={setWelcomeModalVisible}
        setSettingsModalVisible={setSettingsModalVisible}
        titleRef={titleRef}
      />
      <Editor
        settings={settings}
        activeNote={activeNote}
        setActiveNote={setActiveNote}
        onNoteChange={onNoteChange}
        titleRef={titleRef}
      />
      <WelcomeModal
        isWelcomeModalVisible={isWelcomeModalVisible}
        setWelcomeModalVisible={setWelcomeModalVisible}
      />
      <SettingsModal
        isSettingsModalVisible={isSettingsModalVisible}
        setSettingsModalVisible={setSettingsModalVisible}
        setSettings={setNewSettings}
        settings={settings}
      />
    </div>
  );
}
