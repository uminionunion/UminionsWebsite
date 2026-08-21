import React, { useState, useRef, useEffect } from 'react';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Search, X, ChevronLeft, ChevronRight } from 'lucide-react';

interface Product {
  id: number;
  name: string;
  subtitle?: string;
  description?: string;
  price?: number | null;
  image_url: string | null;
  store_type: string;
  store_id?: number;
}

interface ProductSearchDropdownProps {
  allProducts: Product[];
  onProductSelect: (product: Product) => void;
}

const ProductSearchDropdown: React.FC<ProductSearchDropdownProps> = ({ 
  allProducts, 
  onProductSelect 
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Product[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [currentPage, setCurrentPage] = useState(0);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const ITEMS_PER_PAGE = 10;

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    setSelectedIndex(-1);
    setCurrentPage(0);

    if (!query.trim()) {
      setSearchResults([]);
      setIsOpen(false);
      return;
    }

    const lowerQuery = query.toLowerCase();
    const results = allProducts.filter(product => {
      const name = product.name?.toLowerCase() || '';
      const subtitle = product.subtitle?.toLowerCase() || '';
      const description = product.description?.toLowerCase() || '';

      return (
        name.includes(lowerQuery) ||
        subtitle.includes(lowerQuery) ||
        description.includes(lowerQuery)
      );
    });

    setSearchResults(results);
    setIsOpen(results.length > 0);
  };

  const handleSelectProduct = (product: Product) => {
    onProductSelect(product);
    setSearchQuery('');
    setSearchResults([]);
    setIsOpen(false);
    setCurrentPage(0);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen || searchResults.length === 0) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => 
          prev < searchResults.length - 1 ? prev + 1 : prev
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => (prev > 0 ? prev - 1 : -1));
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0) {
          handleSelectProduct(searchResults[selectedIndex]);
        }
        break;
      case 'Escape':
        e.preventDefault();
        setIsOpen(false);
        break;
      default:
        break;
    }
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Calculate pagination
  const totalPages = Math.ceil(searchResults.length / ITEMS_PER_PAGE);
  const startIndex = currentPage * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const currentPageResults = searchResults.slice(startIndex, endIndex);

  return (
    <div className="relative w-full" ref={dropdownRef}>
      <div className="relative flex items-center">
        <Search className="absolute left-3 h-4 w-4 text-muted-foreground pointer-events-none" />
        <Input
          ref={inputRef}
          type="text"
          placeholder="Search products..."
          value={searchQuery}
          onChange={(e) => handleSearch(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => {
            if (searchQuery.trim() && searchResults.length > 0) {
              setIsOpen(true);
            }
          }}
          className="pl-10 pr-10 bg-gray-800 border-gray-600 text-white placeholder-gray-400"
        />
        {searchQuery && (
          <button
            onClick={() => {
              setSearchQuery('');
              setSearchResults([]);
              setIsOpen(false);
              setCurrentPage(0);
              inputRef.current?.focus();
            }}
            className="absolute right-3 text-muted-foreground hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Dropdown Results */}
      {isOpen && searchResults.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-gray-900 border border-gray-700 rounded-md shadow-lg z-50 max-h-80 overflow-y-auto">
          {currentPageResults.map((product, index) => (
            <button
              key={product.id}
              onClick={() => handleSelectProduct(product)}
              onMouseEnter={() => setSelectedIndex(startIndex + index)}
              className={`w-full px-4 py-3 text-left border-b border-gray-700 transition flex items-center gap-3 ${
                selectedIndex === startIndex + index
                  ? 'bg-orange-500/20 border-orange-400'
                  : 'hover:bg-gray-800'
              }`}
            >
              {product.image_url && (
                <img
                  src={product.image_url}
                  alt={product.name}
                  className="h-10 w-10 rounded object-cover flex-shrink-0"
                />
              )}
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm truncate text-white">
                  {product.name}
                </p>
                {product.subtitle && (
                  <p className="text-xs text-gray-400 truncate">
                    {product.subtitle}
                  </p>
                )}
                <p className="text-xs text-orange-400 font-semibold">
                  ${product.price ? product.price.toFixed(2) : '0.00'}
                </p>
              </div>
            </button>
          ))}

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="px-4 py-3 border-t border-gray-700 bg-gray-800 flex items-center justify-between">
              <Button
                size="sm"
                variant="outline"
                onClick={() => setCurrentPage(prev => Math.max(0, prev - 1))}
                disabled={currentPage === 0}
                className="text-xs"
              >
                <ChevronLeft className="h-3 w-3 mr-1" /> Prev
              </Button>

              <span className="text-xs text-gray-400 font-semibold">
                Page {currentPage + 1} of {totalPages} | Showing {startIndex + 1}-{Math.min(endIndex, searchResults.length)} of {searchResults.length}
              </span>

              <Button
                size="sm"
                variant="outline"
                onClick={() => setCurrentPage(prev => Math.min(totalPages - 1, prev + 1))}
                disabled={currentPage === totalPages - 1}
                className="text-xs"
              >
                Next <ChevronRight className="h-3 w-3 ml-1" />
              </Button>
            </div>
          )}

          {/* Single page results summary */}
          {totalPages === 1 && searchResults.length > 0 && (
            <div className="px-4 py-2 text-xs text-gray-500 text-center border-t border-gray-700 bg-gray-800">
              Showing all {searchResults.length} results
            </div>
          )}
        </div>
      )}

      {/* No Results Message */}
      {isOpen && searchQuery.trim() && searchResults.length === 0 && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-gray-900 border border-gray-700 rounded-md shadow-lg z-50 px-4 py-3 text-sm text-gray-400">
          No products found matching "{searchQuery}"
        </div>
      )}
    </div>
  );
};

export default ProductSearchDropdown;
