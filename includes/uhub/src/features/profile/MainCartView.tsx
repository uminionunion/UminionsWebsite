import React, { useState } from 'react';
import { Bookmark, Loader2, Plus, ShoppingCart, Trash2, X } from 'lucide-react';
import { Button } from '../../components/ui/button';
import ProductQueuedImage from '../../components/ProductQueuedImage';
import {
  cartEntryToProduct,
  removeFromMainCart,
  setSavedForLater,
  useMainCart,
  type MainCartEntry,
} from '../../lib/internal-cart';

interface MainCartViewProps {
  isLoggedIn: boolean;
  onClose: () => void;
  onViewProduct: (product: any) => void;
  closeLabel: string;
}

const CHECKOUT_DISABLED_REASON = 'Checkout is coming soon. It stays disabled until store checkout (WooCommerce) is connected.';

const MainCartView = ({ isLoggedIn, onClose, onViewProduct, closeLabel }: MainCartViewProps) => {
  const { cart, isLoading, error, reload } = useMainCart(isLoggedIn);
  const [busyEntryId, setBusyEntryId] = useState<number | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const runAction = async (entryId: number, action: () => Promise<void>) => {
    setBusyEntryId(entryId);
    setActionError(null);
    try {
      await action();
    } catch (failure) {
      setActionError(failure instanceof Error ? failure.message : 'The cart could not be updated.');
    } finally {
      setBusyEntryId(null);
    }
  };

  const renderEntry = (entry: MainCartEntry, saved: boolean) => {
    const busy = busyEntryId === entry.id;
    return (
      <li key={entry.id} className="uhub-main-cart-entry flex items-center gap-3 rounded border border-gray-700 p-2 text-xs" data-cart-entry-id={entry.id}>
        <button
          type="button"
          className="uhub-main-cart-picture h-14 w-14 flex-shrink-0 overflow-hidden rounded bg-gray-900"
          onClick={() => onViewProduct(cartEntryToProduct(entry))}
          aria-label={`View ${entry.name || 'product'}`}
          title="View product"
        >
          {entry.image_url
            ? <ProductQueuedImage src={entry.image_url} queue="union" alt={entry.name || 'Product'} className="h-full w-full object-cover" />
            : <ShoppingCart className="m-auto h-6 w-6 text-gray-500" />}
        </button>
        <div className="min-w-0 flex-1">
          <p className="font-semibold text-orange-400">{entry.price || 'Price not listed'}</p>
          <p className="truncate font-semibold text-white" title={entry.name || undefined}>{entry.name || 'Unnamed product'}</p>
          {entry.sku && <p className="truncate text-gray-400">SKU: {entry.sku}</p>}
          <p className="truncate text-gray-400">Sold by {entry.seller_name}</p>
          {entry.quantity > 1 && <p className="text-gray-400">Qty {entry.quantity}</p>}
          {entry.unavailable && <p className="text-red-400">No longer available</p>}
        </div>
        {saved ? (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="uhub-store-action h-8 w-8 flex-shrink-0"
            disabled={busy}
            onClick={() => runAction(entry.id, () => setSavedForLater(entry.id, false))}
            aria-label="Move back to cart"
            title="Move back to cart"
          >
            <Plus className="h-5 w-5" />
          </Button>
        ) : (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="uhub-store-action uhub-cart-bookmark h-8 w-8 flex-shrink-0"
            disabled={busy}
            onClick={() => runAction(entry.id, () => setSavedForLater(entry.id, true))}
            aria-label="Save for later"
            title="Save for later"
          >
            <Bookmark className="h-5 w-5" />
          </Button>
        )}
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="uhub-store-action h-8 w-8 flex-shrink-0"
          disabled={busy}
          onClick={() => runAction(entry.id, () => removeFromMainCart(entry.id))}
          aria-label="Remove from cart"
          title="Remove"
        >
          <Trash2 className="h-5 w-5" />
        </Button>
      </li>
    );
  };

  const isFirstLoad = isLoading && cart.items.length === 0 && cart.saved.length === 0;

  return (
    <section id="MainUhubFeatureV001ForMainCart" className="uhub-main-cart flex flex-col gap-3 text-white" aria-label="Your cart">
      <div className="flex items-center justify-between gap-2">
        <h3 className="flex items-center gap-2 text-lg font-bold"><ShoppingCart className="h-5 w-5" />Your Cart</h3>
        <Button type="button" variant="ghost" size="icon" className="uhub-store-action h-8 w-8" onClick={onClose} aria-label={closeLabel} title={closeLabel}>
          <X className="h-5 w-5" />
        </Button>
      </div>

      {(error || actionError) && (
        <div role="alert" className="flex items-center justify-between gap-2 rounded border border-red-700 p-2 text-xs text-red-400">
          <span>{actionError || error}</span>
          {error && <Button type="button" size="sm" variant="outline" onClick={reload}>Retry</Button>}
        </div>
      )}

      {isFirstLoad ? (
        <div className="flex items-center justify-center gap-2 py-6 text-sm text-muted-foreground" role="status"><Loader2 className="h-4 w-4 animate-spin" />Loading your cart</div>
      ) : cart.items.length === 0 ? (
        <p className="py-4 text-center text-sm text-gray-400">Your cart is empty. Use the 🛒 buttons in the stores to add products.</p>
      ) : (
        <ul className="flex flex-col gap-2" aria-label="Items in your cart">{cart.items.map(entry => renderEntry(entry, false))}</ul>
      )}

      <div className="border-t border-gray-700 pt-3">
        <Button type="button" className="uhub-cart-checkout h-10 w-full" disabled aria-disabled="true" title={CHECKOUT_DISABLED_REASON}>
          Checkout
        </Button>
        <p className="mt-1 text-center text-[11px] text-gray-500">{CHECKOUT_DISABLED_REASON}</p>
      </div>

      {cart.saved.length > 0 && (
        <div className="border-t border-gray-700 pt-3">
          <h4 className="mb-2 flex items-center gap-2 text-sm font-semibold text-gray-300"><Bookmark className="h-4 w-4" />Saved for later</h4>
          <ul className="flex flex-col gap-2" aria-label="Saved for later">{cart.saved.map(entry => renderEntry(entry, true))}</ul>
        </div>
      )}
    </section>
  );
};

export default MainCartView;
