import addArtwork from '../assets/add-task.svg';
import deleteArtwork from '../assets/delete-task.svg';
import sprite from '../../img/icons/sprite.svg?no-inline';

const icons = {
  add: { artwork: addArtwork, symbol: 'plus', iconSize: 24, size: 70 },
  delete: { artwork: deleteArtwork, symbol: 'close', iconSize: 10, size: 32 },
};

export function TaskIconButton({ action, label, onClick }) {
  const { artwork, symbol, iconSize, size } = icons[action];
  return (
    <button className={`task-icon-button task-icon-button--${action}`} type={action === 'add' ? 'submit' : 'button'}
      aria-label={label} onClick={onClick}>
      <img className="task-icon-artwork" alt="" src={artwork} width={size} height={size} />
      <svg className="task-icon-glyph" aria-hidden="true" width={iconSize} height={iconSize}>
        <use href={`${sprite}#${symbol}`} />
      </svg>
    </button>
  );
}
