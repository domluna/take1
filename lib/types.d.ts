export interface Settings {
  isLLMEditorEnabled: boolean;
  openaiApiKey?: string;
}

export interface Note {
  id: string; // Add an id to uniquely identify each note
  title: string;
  content: string;
  updatedAt: Date;
  lastEditedIndex: number; // New field to track the last edited index
}

export interface GroupedNotes {
  [key: string]: Note[];
}
