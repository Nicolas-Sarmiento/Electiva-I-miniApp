export default function Modal({ isOpen, onClose, title, message, onConfirm, confirmText = "Aceptar", cancelText = "Cancelar", type = "alert" }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-xl w-full max-w-sm p-6 transform transition-all border border-zinc-200 dark:border-zinc-800 scale-100 animate-in zoom-in-95 duration-200">
        {title && <h3 className="text-lg font-bold text-zinc-900 dark:text-white mb-2">{title}</h3>}
        <p className="text-zinc-600 dark:text-zinc-300 mb-6">{message}</p>
        <div className="flex justify-end gap-3">
          {type === "confirm" && (
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-zinc-700 dark:text-zinc-300 bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 rounded-lg transition-colors"
            >
              {cancelText}
            </button>
          )}
          <button
            onClick={() => {
              if (onConfirm) onConfirm();
              if (type === "alert") onClose();
            }}
            className={`px-4 py-2 text-sm font-medium text-white rounded-lg transition-colors ${
              type === "confirm" ? "bg-red-600 hover:bg-red-700" : "bg-blue-600 hover:bg-blue-700"
            }`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
