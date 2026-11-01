/* ==========================================================================
   qty.js — reusable quantity stepper [-] value [+], used on the product
   page and on every cart line. Clamps to min..max and reports changes
   through onChange(newValue).
   ========================================================================== */

import { h, icon } from '../utils/dom.js';
import { MAX_QTY } from '../utils/cart.js';

export function qtyStepper({ value = 1, min = 1, max = MAX_QTY, onChange, label = 'Quantity' } = {}) {
  const out = h('output', { class: 'qty__value', 'aria-live': 'polite' }, String(value));
  const minus = h('button', {
    class: 'qty__btn', type: 'button', 'aria-label': 'Decrease quantity', html: icon('minus'),
  });
  const plus = h('button', {
    class: 'qty__btn', type: 'button', 'aria-label': 'Increase quantity', html: icon('plus'),
  });

  function paint() {
    out.textContent = String(value);
    minus.disabled = value <= min;
    plus.disabled = value >= max;
  }
  minus.addEventListener('click', () => { if (value > min) { value -= 1; onChange?.(value); paint(); } });
  plus.addEventListener('click', () => { if (value < max) { value += 1; onChange?.(value); paint(); } });
  paint();

  return h('div', { class: 'qty', role: 'group', 'aria-label': label }, minus, out, plus);
}
