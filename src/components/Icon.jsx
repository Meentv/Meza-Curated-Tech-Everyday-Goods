import { asset } from '../lib/asset.js';

const SPRITE = asset('assets/icons/icons.svg');

/** One inline icon from the shared sprite (see public/assets/icons/icons.svg). */
export default function Icon({ name, className = 'icon' }) {
  return (
    <svg className={className} aria-hidden="true" focusable="false">
      <use href={`${SPRITE}#i-${name}`} />
    </svg>
  );
}
