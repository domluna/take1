"use client";
import { Textarea } from "@/components/ui/textarea";
import { useEffect, useRef } from "react";
import { edit } from "@/lib/llmEditor";

import { Note, Settings } from "@/lib/types";

const Editor = ({
  activeNote,
  setActiveNote,
  onNoteChange,
  settings,
  titleRef,
}: {
  activeNote: Note;
  setActiveNote: (note: Note) => void;
  onNoteChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  titleRef: React.RefObject<HTMLInputElement>;
  settings: Settings;
}) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null); // Correctly typed ref
  const isEditingRef = useRef<boolean>(false);
  const highlightRef = useRef<number | null>(null);

  const highlightText = (start: number, end: number) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    // Clear any existing highlight
    if (highlightRef.current) {
      clearInterval(highlightRef.current);
      highlightRef.current = null;
    }

    // Create a blinking highlight effect
    let isHighlighted = false;
    highlightRef.current = setInterval(() => {
      if (textarea) {
        if (isHighlighted) {
          textarea.setSelectionRange(start, end);
        } else {
          textarea.setSelectionRange(end, end);
        }
        isHighlighted = !isHighlighted;
      }
    }, 500) as unknown as number;
  };

  useEffect(() => {
    const abortController = new AbortController();
    const signal = abortController.signal;
    const content = activeNote.content;
    const lastEditedIndex = activeNote.lastEditedIndex;

    const terminalPunctuationRegex = /[.?!]\s*$/;
    const trailingNewlineRegex = /[\n]+\s*$/;
    const leadingNewlineRegex = /^\s*[\n]+/;

    if (
      !(
        settings.isLLMEditorEnabled &&
        settings.openaiApiKey &&
        !isEditingRef.current &&
        content.length > 0 &&
        lastEditedIndex < content.length
      )
    ) {
      return;
    }

    const timerId = setTimeout(async () => {
      isEditingRef.current = true;
      try {
        const uneditedText = content.slice(0, lastEditedIndex);
        const textToEdit = content.slice(lastEditedIndex);

        const matchA = terminalPunctuationRegex.test(textToEdit);
        const matchB = trailingNewlineRegex.test(textToEdit);
        console.log("A", matchA);
        console.log("B", matchB);
        if (
          !(matchA || matchB) ||
          textToEdit.trim().length < 20 ||
          textToEdit.trim().length === 0
        ) {
          console.log("not ok to edit");
          return;
        }

        console.log("ok to edit");
        const trimmedTextToEdit = textToEdit.trimEnd();

        const leadingNewlineMatch = trimmedTextToEdit.match(leadingNewlineRegex);
        const leadingNewline = leadingNewlineMatch ? leadingNewlineMatch[0] : "";

        console.log("matched leading newline", leadingNewline);

        const selectionStart = lastEditedIndex;
        const selectionEnd = selectionStart + textToEdit.length;

        // Start highlighting
        highlightText(selectionStart, selectionEnd);

        // Perform the editing
        let editedText = await edit(
          settings.openaiApiKey as string,
          trimmedTextToEdit,
          signal,
        );
        console.log("original edited text", editedText);

        if (leadingNewline) {
          editedText = leadingNewline.slice(0, 2) + editedText;
        } else if (!"n ".includes(editedText[0])) {
          editedText = ` ${editedText}`;
        }

        if ("!?.".includes(uneditedText.slice(-1))) {
          editedText = editedText[0].toUpperCase() + editedText.slice(1);
        }

        const len = uneditedText.length + textToEdit.length;
        const newWrittenText = textareaRef.current?.value.slice(len) ?? "";
        const part1 = uneditedText + editedText;
        const newContent = part1 + newWrittenText;

        if (highlightRef.current) {
          clearInterval(highlightRef.current);
          highlightRef.current = null;
        }

        console.log("new content", editedText);

        setActiveNote({
          ...activeNote,
          content: newContent,
          lastEditedIndex: part1.length,
        });
      } catch (error) {
        console.error("Error during editing:", error);
      } finally {
        isEditingRef.current = false;
      }
    }, 3000);

    return () => {
      clearTimeout(timerId);
      abortController.abort();
      if (highlightRef.current) {
        clearInterval(highlightRef.current);
        highlightRef.current = null;
      }
    };
  }, [activeNote, settings, setActiveNote, highlightText]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault(); // Prevent the default action of the Enter key
      textareaRef.current?.focus(); // Focus the textarea
    }
  };

  const handleKeyDownOnContent = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    const { value, selectionStart } = e.currentTarget;
    const { ctrlKey, altKey, metaKey } = e;

    if (e.key === "Backspace" && activeNote.content === "") {
      titleRef.current?.focus();
      return;
    }

    // Find the position of the last non-whitespace character
    const lastNonWhitespaceCharIndex = value.trimEnd().length;

    // Define standard navigation keys
    const standardNavigationKeys = [
      "ArrowLeft",
      "ArrowRight",
      "ArrowUp",
      "ArrowDown",
      "Home",
      "End",
      "PageUp",
      "PageDown",
    ];

    // Define special key combinations for navigation, copy and paste
    const isAllowedKeyCombo =
      ((ctrlKey || altKey || metaKey) &&
        ["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown", "Home", "End"].includes(
          e.key,
        )) ||
      ((ctrlKey || metaKey) && (e.key === "PageUp" || e.key === "PageDown")) ||
      ((ctrlKey || metaKey) && (e.key === "c" || e.key === "v")) || // Copy and Paste for both Mac and Windows/Linux
      (ctrlKey &&
        (e.key === "p" ||
          e.key === "n" ||
          e.key === "b" ||
          e.key === "f" ||
          e.key === "a" ||
          e.key === "e"));

    // Allow standard navigation keys and special combinations
    if (standardNavigationKeys.includes(e.key) || isAllowedKeyCombo) {
      return;
    }

    // Prevent deletion or modification before the last non-whitespace character
    if (
      (e.key === "Backspace" || e.key === "Delete") &&
      selectionStart <= lastNonWhitespaceCharIndex
    ) {
      e.preventDefault();
    } else if (selectionStart < lastNonWhitespaceCharIndex) {
      // Prevent other modifications (like typing) before the last non-whitespace character
      e.preventDefault();
    }
  };

  return (
    <div className="flex flex-col w-4/5 h-screen p-4">
      <input
        ref={titleRef} // Attach the ref to the input
        className="w-full p-4 text-lg lg:text-xl font-semibold focus:outline-none"
        value={activeNote.title}
        onChange={(e) => setActiveNote({ ...activeNote, title: e.target.value })}
        onKeyDown={handleKeyDown} // Add the onKeyDown event handler
        placeholder="Note title..."
      />
      <Textarea
        ref={textareaRef} // Attach the ref to the Textarea
        className="w-full h-full p-4 focus-visible:ring-0 focus:bg-transparent focus-visible:outline-none border-none focus:border-none resize-none text-sm lg:text-base"
        placeholder="Write your note ..."
        value={activeNote.content}
        onChange={onNoteChange}
        onKeyDown={handleKeyDownOnContent}
      />
    </div>
  );
};

export default Editor;
