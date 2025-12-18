import { X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { FormTextarea } from '@/components/ui/Form';
import Button from '@/components/ui/Button';

interface NoteInputOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  initialNote?: string;
  onSave: (note: string) => Promise<void>;
  exerciseName: string;
}

export function NoteInputOverlay({ 
  isOpen, 
  onClose,
  initialNote = '',
  onSave,
  exerciseName
}: NoteInputOverlayProps) {
  const [shouldRender, setShouldRender] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [note, setNote] = useState(initialNote);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setNote(initialNote);
      setShouldRender(true);
      const timer = setTimeout(() => setIsVisible(true), 10);
      return () => clearTimeout(timer);
    } else {
      setIsVisible(false);
      const timer = setTimeout(() => setShouldRender(false), 200);
      return () => clearTimeout(timer);
    }
  }, [isOpen, initialNote]);

  const handleSave = async () => {
    setSaving(true);
    try {
      await onSave(note);
      onClose();
    } catch (error) {
      console.error('Failed to save note:', error);
    } finally {
      setSaving(false);
    }
  };

  if (!shouldRender) return null;

  return (
    <div 
      className={`absolute inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md transition-all duration-200 ease-out p-6 ${
        isVisible ? 'opacity-100' : 'opacity-0'
      }`}
      onClick={onClose}
    >
      <div 
        className={`w-full max-w-sm bg-zinc-900 border border-zinc-800 rounded-3xl p-6 shadow-2xl transition-all duration-200 ${
          isVisible ? 'scale-100 translate-y-0' : 'scale-95 translate-y-4'
        }`}
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-white">Add Note</h2>
          <button 
            onClick={onClose}
            className="p-2 -mr-2 text-zinc-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="mb-4">
          <p className="text-sm text-zinc-400 mb-2">{exerciseName}</p>
          <FormTextarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Add a note for this set..."
            className="bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-500"
            autoFocus
          />
        </div>

        <div className="flex gap-3">
          <Button
            onClick={onClose}
            variant="ghost"
            className="flex-1"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={saving}
            className="flex-1"
          >
            {saving ? 'Saving...' : 'Save'}
          </Button>
        </div>
      </div>
    </div>
  );
}

