import React from 'react';
import { Sparkles, Warehouse } from 'lucide-react';
import { formatCurrencyFromUSD } from '../../utils/currency';

const StorePulseCard = ({
  activeInsight,
  onInsightChange,
  currency,
  totalRevenue,
  todayOrders,
  ordersLoading,
  totalStockUnits,
  lowStockCount,
  productsLoading,
}) => (
  <>
    <p className="store-sidebar__section-label">Pulse</p>
    <div className="store-insight-toggles">
      <button
        type="button"
        className={`store-insight-btn${activeInsight === 'profit' ? ' is-active' : ''}`}
        onClick={() => onInsightChange('profit')}
      >
        <Sparkles size={18} strokeWidth={2} />
        <span>Revenue</span>
      </button>
      <button
        type="button"
        className={`store-insight-btn${activeInsight === 'inventory' ? ' is-active' : ''}`}
        onClick={() => onInsightChange('inventory')}
      >
        <Warehouse size={18} strokeWidth={2} />
        <span>Inventory</span>
      </button>
    </div>
    <div className="store-insight-card">
      {activeInsight === 'profit' ? (
        <>
          <p className="store-insight-card__label">Lifetime revenue</p>
          <p className="store-insight-card__value">
            {formatCurrencyFromUSD(totalRevenue, currency)}
          </p>
          <p className="store-insight-card__meta">
            {ordersLoading ? 'Syncing orders…' : `${todayOrders} order(s) today`}
          </p>
        </>
      ) : (
        <>
          <p className="store-insight-card__label">Units in catalog</p>
          <p className="store-insight-card__value">{totalStockUnits}</p>
          <p className="store-insight-card__meta">
            {productsLoading ? 'Syncing stock…' : `${lowStockCount} low-stock SKU(s)`}
          </p>
        </>
      )}
    </div>
  </>
);

export default StorePulseCard;
