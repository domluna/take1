"use client";
import { Settings } from "@/lib/types.d";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";

const SettingsModal = ({
  isSettingsModalVisible,
  setSettingsModalVisible,
  settings,
  setSettings,
}: {
  isSettingsModalVisible: boolean;
  setSettingsModalVisible: (visible: boolean) => void;
  settings: Settings;
  setSettings: (settings: Settings) => void;
}) => {
  const { toast } = useToast();

  const handleClose = () => {
    setSettingsModalVisible(false);
  };

  // This function will be triggered when the overlay is clicked
  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
    // If the user clicks directly on the overlay (not the modal content),
    // then close the modal
    const target = e.target as HTMLDivElement;
    if (target.id === "settings-modal-overlay") {
      handleClose();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "Escape") {
      handleClose();
    }
  };

  if (!isSettingsModalVisible) return null;

  return (
    <div
      id="settings-modal-overlay"
      className="fixed inset-0 bg-black bg-opacity-75 flex justify-center items-center p-4"
      onClick={handleOverlayClick}
      onKeyDown={handleKeyDown}
    >
      <div className="rounded-lg max-w-2xl w-full p-6 relative bg-gray-100">
        <button
          type="button"
          className="absolute top-4 right-4 text-lg hover:font-bold"
          onClick={handleClose}
        >
          ×
        </button>
        <h2 className="text-xl font-semibold mb-4">Settings</h2>
        <div className="flex flex-col">
          <div className="flex flex-row items-center justify-between my-4 border p-4 rounded-lg">
            <div className="flex flex-col justify-center space-y-2">
              <Label htmlFor="use-llm-editor" className="text-base">
                Enable LLM Editor
              </Label>
              <p className="text-xs mb-2 text-gray-500">
                LLM editor. Revises previously written text for grammar and spelling.
              </p>
            </div>
            <Switch
              id="use-llm-editor"
              checked={settings.isLLMEditorEnabled}
              onCheckedChange={(checked: boolean) => {
                setSettings({ ...settings, isLLMEditorEnabled: checked });
              }}
            />
          </div>
          <div className="my-4 border p-4 rounded-lg space-y-2">
            <Label htmlFor="openai-api-key" className="text-base">
              OpenAI API Key
            </Label>
            <p className="text-xs mb-2 text-gray-500">
              API key used to call OpenAI API. The chat endpoint is called with the
              "gpt-3.5-turbo" model. The key is stored in the browser's local storage.
            </p>
            <Input
              id="openai-api-key"
              type="password"
              value={settings.openaiApiKey || ""}
              onChange={(e) => {
                setTimeout(() => {
                  setSettings({ ...settings, openaiApiKey: e.target.value });
                  toast({
                    title: "OpenAI API Key",
                    description: "OpenAI API Key has been updated.",
                  });
                }, 1000);
              }}
              placeholder="Enter your OpenAI API key"
              className="mt-1"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsModal;
