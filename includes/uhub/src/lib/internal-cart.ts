import { useCallback, useEffect, useState } from 'react';

// uHub's internal Main Cart (MainHubUpgradeV001ForInternalCart, /api/products/cart).
export const MAIN_CART_UPDATED_EVENT = 'uhub-cart-updated';
export const MAIN_CART_OPEN_EVENT = 'uhub-open-main-cart';
export const LOGIN_REQUEST_EVENT = 'uhub-request-login';

export interface MainCartEntry {
  id: number;
  product_id: number | null;
  carousel_item_id: number | null;
  quantity: number;
  saved_for_later: boolean;
  name: string | null;
  price: string | null;
  image_url: string | null;
  sku: string | null;
  seller_id: number | null;
  seller_name: string;
  unavailable: boolean;
  product: Record<string, any> | null;
}

export interface MainCartContents {
  items: MainCartEntry[];
  saved: MainCartEntry[];
}

// Anything with a product id, or a header/footer carousel entry id.
export type MainCartSource = { id?: number | null; carousel_item_id?: number | null };

export const requestLogin = () => window.dispatchEvent(new CustomEvent(LOGIN_REQUEST_EVENT));
// Carousel buttons whose text is a price ("$69.95") add to the cart; other text (e.g. "u24.gov.ua") is a website link.
export const isCartPriceLabel = (label?: string | null) => /^\s*[$€£]?\s*\d/.test(label || '');
export const openMainCart = () => window.dispatchEvent(new CustomEvent(MAIN_CART_OPEN_EVENT));
const announceCartChange = () => window.dispatchEvent(new CustomEvent(MAIN_CART_UPDATED_EVENT));

const cartFetch = async (path: string, init: RequestInit = {}) => {
  const response = await fetch(`/api/products/cart${path}`, {
    credentials: 'include',
    ...init,
    headers: { ...(init.body ? { 'Content-Type': 'application/json' } : {}), ...(init.headers || {}) },
  });
  if (response.status === 401) {
    requestLogin();
    throw new Error('Please log in to use the cart.');
  }
  if (!response.ok) {
    const body = await response.json().catch(() => null);
    throw new Error(body?.message || 'The cart could not be updated.');
  }
  return response.json();
};

/** Adds a product (or carousel entry) to the logged-in user's Main Cart; logged-out visitors get the login screen. */
export const addToMainCart = async (source: MainCartSource, isLoggedIn: boolean): Promise<boolean> => {
  if (!isLoggedIn) {
    requestLogin();
    return false;
  }
  const body = source.carousel_item_id ? { carousel_item_id: source.carousel_item_id } : { product_id: source.id };
  try {
    await cartFetch('/add', { method: 'POST', body: JSON.stringify(body) });
    announceCartChange();
    showCartToast('Added to your cart');
    return true;
  } catch (error) {
    showCartToast(error instanceof Error ? error.message : 'The cart could not be updated.', true);
    return false;
  }
};

export const setSavedForLater = async (entryId: number, saved: boolean) => {
  await cartFetch(`/${entryId}`, { method: 'PATCH', body: JSON.stringify({ saved_for_later: saved }) });
  announceCartChange();
};

export const removeFromMainCart = async (entryId: number) => {
  await cartFetch(`/${entryId}`, { method: 'DELETE' });
  announceCartChange();
};

export const useMainCart = (enabled: boolean) => {
  const [cart, setCart] = useState<MainCartContents>({ items: [], saved: [] });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(async () => {
    if (!enabled) return;
    setIsLoading(true);
    try {
      setCart(await cartFetch(''));
      setError(null);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : 'The cart could not be loaded.');
    } finally {
      setIsLoading(false);
    }
  }, [enabled]);

  useEffect(() => {
    if (!enabled) return;
    reload();
    window.addEventListener(MAIN_CART_UPDATED_EVENT, reload);
    return () => window.removeEventListener(MAIN_CART_UPDATED_EVENT, reload);
  }, [enabled, reload]);

  return { cart, isLoading, error, reload };
};

/** Turns a cart entry into the shape the product details window expects. */
export const cartEntryToProduct = (entry: MainCartEntry) => entry.product || {
  id: null,
  carousel_item_id: entry.carousel_item_id,
  name: entry.name || 'Uminion Union item',
  description: entry.sku ? `SKU: ${entry.sku}` : null,
  price: null,
  price_label: entry.price,
  image_url: entry.image_url,
  sku_id: entry.sku,
  user_id: null,
  payment_method: 'through_union',
};

let toastTimer: number | undefined;
const showCartToast = (message: string, isError = false) => {
  if (typeof document === 'undefined') return;
  let toast = document.getElementById('uhub-cart-toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'uhub-cart-toast';
    toast.setAttribute('role', 'status');
    (document.querySelector('.uhub-root') || document.body).appendChild(toast);
  }
  toast.textContent = message;
  toast.className = `uhub-cart-toast${isError ? ' uhub-cart-toast-error' : ''}`;
  window.clearTimeout(toastTimer);
  toastTimer = window.setTimeout(() => toast?.remove(), 2600);
};
