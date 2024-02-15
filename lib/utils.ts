import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { Note } from "@/lib/types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const createNewNote = (): Note => {
  return {
    id: "",
    title: "",
    content: "",
    updatedAt: new Date(),
    lastEditedIndex: 0,
  };
};
