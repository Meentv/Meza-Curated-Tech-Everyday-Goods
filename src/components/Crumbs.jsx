import { Fragment } from 'react';
import { Link } from 'react-router-dom';
import Icon from './Icon.jsx';

/**
 * Breadcrumbs. `items` is a list of { label, to? }; the last item without
 * `to` is marked aria-current="page".
 */
export default function Crumbs({ items }) {
  return (
    <nav className="crumbs" aria-label="Breadcrumb">
      {items.map((item, i) => (
        <Fragment key={`${item.label}-${i}`}>
          {i > 0 && (
            <span className="crumbs__sep" aria-hidden="true">
              <Icon name="chevron-right" />
            </span>
          )}
          {item.to ? (
            <Link to={item.to}>{item.label}</Link>
          ) : (
            <span aria-current="page">{item.label}</span>
          )}
        </Fragment>
      ))}
    </nav>
  );
}
