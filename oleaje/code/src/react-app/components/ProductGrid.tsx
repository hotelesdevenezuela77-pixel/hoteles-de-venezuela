interface ProductItem {
  id: string;
  name: string;
  price: number;
  category: string;
}

interface ProductGridProps {
  items: ProductItem[];
  onAddItem: (item: ProductItem) => void;
}

export function ProductGrid({ items, onAddItem }: ProductGridProps) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-1.5 sm:gap-2 p-2 sm:p-4">
      {items.map((item) => (
        <button
          key={item.id}
          onClick={() => onAddItem(item)}
          className="group relative flex flex-col p-2 sm:p-3 rounded-lg sm:rounded-xl bg-card border border-border hover:border-[hsl(var(--ocean))] hover:shadow-lg hover:shadow-[hsl(var(--ocean))]/10 transition-all duration-200 text-left"
        >
          <div className="flex-1 min-h-[40px] sm:min-h-[48px]">
            <h3 className="text-[11px] sm:text-xs font-medium leading-tight line-clamp-3 group-hover:text-[hsl(var(--ocean))] transition-colors">
              {item.name}
            </h3>
          </div>
          <div className="mt-1.5 sm:mt-2 pt-1.5 sm:pt-2 border-t border-border/50">
            <span className="text-xs sm:text-sm font-bold text-[hsl(var(--ocean))]">
              ${item.price.toFixed(2)}
            </span>
          </div>
          
          {/* Hover overlay */}
          <div className="absolute inset-0 rounded-lg sm:rounded-xl bg-[hsl(var(--ocean))]/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
        </button>
      ))}
    </div>
  );
}
