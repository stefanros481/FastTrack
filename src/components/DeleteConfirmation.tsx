interface Props {
  onConfirm: () => void;
  onCancel: () => void;
  isDeleting: boolean;
}

export default function DeleteConfirmation({
  onConfirm,
  onCancel,
  isDeleting,
}: Props) {
  return (
    <div className="motion-safe:animate-fade-in">
      <p className="text-sm text-center mb-4">
        Delete this session? This cannot be undone.
      </p>
      <div className="flex gap-3">
        <button
          onClick={onCancel}
          disabled={isDeleting}
          className="flex-1 py-3 rounded-full font-medium text-[--color-text-muted] min-h-11 transition-all active:scale-95"
        >
          Cancel
        </button>
        <button
          onClick={onConfirm}
          disabled={isDeleting}
          className={`flex-1 py-3 rounded-full font-bold text-white min-h-11 transition-all active:scale-95 bg-(--color-error) ${
            isDeleting ? "opacity-60" : ""
          }`}
        >
          {isDeleting ? "Deleting..." : "Delete"}
        </button>
      </div>
    </div>
  );
}
