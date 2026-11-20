import { useId, useLayoutEffect, useRef } from 'react';

export function Dialog({ title, description, onClose, children }) {
  const id = useId();
  const ref = useRef(null);
  useLayoutEffect(() => {
    const dialog = ref.current;
    dialog.showModal();
    return () => dialog.close();
  }, []);

  return (
    <dialog ref={ref} aria-labelledby={id} aria-describedby={description ? `${id}-description` : undefined}
      onCancel={(event) => { event.preventDefault(); onClose(); }}>
      <h2 id={id}>{title}</h2>
      {description && <p id={`${id}-description`}>{description}</p>}
      {children}
    </dialog>
  );
}

export function ConfirmDialog({ title, description, onCancel, onConfirm }) {
  return (
    <Dialog title={title} description={description} onClose={onCancel}>
      <div className="button-row">
        <button type="button" autoFocus onClick={onCancel}>Отмена</button>
        <button className="danger" type="button" onClick={onConfirm}>Удалить</button>
      </div>
    </Dialog>
  );
}
