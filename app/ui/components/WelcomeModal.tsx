const WelcomeModal = ({
  isWelcomeModalVisible,
  setWelcomeModalVisible,
}: {
  isWelcomeModalVisible: boolean;
  setWelcomeModalVisible: (visible: boolean) => void;
}) => {
  const handleClose = () => {
    setWelcomeModalVisible(false);
  };

  // This function will be triggered when the overlay is clicked
  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
    // If the user clicks directly on the overlay (not the modal content),
    // then close the modal
    const target = e.target as HTMLDivElement;
    if (target.id === "welcome-modal-overlay") {
      handleClose();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "Escape") {
      handleClose();
    }
  };

  if (!isWelcomeModalVisible) return null;

  return (
    <div
      id="welcome-modal-overlay"
      className="fixed inset-0 bg-black bg-opacity-75 flex justify-center items-center p-4"
      onClick={handleOverlayClick}
      onKeyDown={handleKeyDown}
    >
      <div className="rounded-lg max-w-lg w-full p-6 relative bg-gray-100">
        <button
          type="button"
          className="absolute top-4 right-4 text-lg hover:font-bold"
          onClick={handleClose}
        >
          ×
        </button>
        <h2 className="text-xl font-semibold mb-4">Welcome!</h2>
        <img src="/output.gif" alt="Welcome Animation" className="mx-auto my-2" />
        <p className="text-base">
          <span className="font-semibold">'Take1'</span> is a minimal writing app that
          explicitly prohibits deletion. Because when you're speaking in real life there are
          no second takes.{" "}
        </p>
        <div className="mt-4 space-y-2 text-sm">
          <p>
            You could enable LLM editing for previous spelling and grammar mistakes in the
            settings.{" "}
          </p>
          <p>It will edit on the end terminal punctuation or a new paragraph.</p>
        </div>
        <div className="mt-4 space-y-2 text-sm">
          <p>All notes are saved locally in your browser storage. </p>
          <p>You can export at any time.</p>
        </div>
        <div className="border-t pt-4 mt-4 text-xs">
          <p>To see this again click the (?) icon located at the bottom left.</p>
        </div>
      </div>
    </div>
  );
};

export default WelcomeModal;
