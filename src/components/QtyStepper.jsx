/* ==========================================================================
   QtyStepper — reusable quantity stepper [-] value [+], used on the product
   page and on every cart line. Clamps to min..max.
   ========================================================================== */

import Icon from './Icon.jsx';
import { MAX_QTY } from '../lib/cart.js';

export default function QtyStepper({
  value,
  min = 1,
  max = MAX_QTY,
  onChange,
  label = 'Quantity',
}) {
  return (
    <div className="qty" role="group" aria-label={label}>
      <button
        className="qty__btn"
        type="button"
        aria-label="Decrease quantity"
        disabled={value <= min}
        onClick={() => { if (value > min) onChange(value - 1); }}
      >
        <Icon name="minus" />
      </button>
      <output className="qty__value" aria-live="polite">{value}</output>
      <button
        className="qty__btn"
        type="button"
        aria-label="Increase quantity"
        disabled={value >= max}
        onClick={() => { if (value < max) onChange(value + 1); }}
      >
        <Icon name="plus" />
      </button>
    </div>
  );
}
