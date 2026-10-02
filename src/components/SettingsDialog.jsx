import { useEffect, useRef } from 'react';
import { ATTEMPT_LIMIT_OPTIONS, RANGE_OPTIONS } from '../game/engine.js';

export default function SettingsDialog({ open, settings, inProgress, onClose, onApply }) {
  const dialogRef = useRef(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (open && !dialog.open) dialog.showModal();
  }, [open]);

  function handleSubmit(event) {
    const data = new FormData(event.currentTarget);
    const limit = data.get('limit');
    onApply({ min: 1, max: Number(data.get('max')), maxAttempts: limit === 'none' ? null : Number(limit) });
  }

  return (
    <dialog
      ref={dialogRef}
      className="dialog"
      aria-labelledby="settings-title"
      onClose={(e) => onClose(e.currentTarget.returnValue === 'apply')}
    >
      {/* Remount on open so the fields always reflect the current game. */}
      {open && (
        <form method="dialog" onSubmit={handleSubmit}>
          <h2 id="settings-title" className="dialog__title">
            Game settings
          </h2>
          <div className="field">
            <label htmlFor="setting-max">Number range</label>
            <select id="setting-max" name="max" defaultValue={settings.max}>
              {RANGE_OPTIONS.map((max) => (
                <option key={max} value={max}>
                  1 to {max}
                </option>
              ))}
            </select>
          </div>
          <div className="field">
            <label htmlFor="setting-limit">Attempt limit</label>
            <select id="setting-limit" name="limit" defaultValue={settings.maxAttempts ?? 'none'}>
              {ATTEMPT_LIMIT_OPTIONS.map((limit) => (
                <option key={limit ?? 'none'} value={limit ?? 'none'}>
                  {limit === null ? 'No limit' : `${limit} attempts`}
                </option>
              ))}
            </select>
          </div>
          {inProgress && <p className="dialog__warning">Starting a new game ends the current one.</p>}
          <div className="dialog__actions">
            <button type="button" className="btn btn--ghost" onClick={() => dialogRef.current.close('cancel')}>
              Cancel
            </button>
            <button type="submit" value="apply" className="btn btn--primary">
              Start new game
            </button>
          </div>
        </form>
      )}
    </dialog>
  );
}
