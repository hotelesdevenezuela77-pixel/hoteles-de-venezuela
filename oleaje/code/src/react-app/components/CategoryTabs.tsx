import { useState, useEffect } from 'react';
import { Home, Soup, Drumstick, Fish, Shell, UtensilsCrossed, Salad, CookingPot, Cake, Beef, Plus, GlassWater } from 'lucide-react';

interface Category {
  id: number;
  name: string;
  slug: string;
}

interface CategoryTabsProps {
  activeCategory: string;
  onCategoryChange: (categorySlug: string) => void;
}

const iconMap: Record<string, React.ReactNode> = {
  'arroces': <Soup size={18} />,
  'carnes-aves': <Drumstick size={18} />,
  'pescados-mariscos': <Fish size={18} />,
  'ceviches': <Shell size={18} />,
  'entradas': <UtensilsCrossed size={18} />,
  'pastas': <CookingPot size={18} />,
  'ensaladas': <Salad size={18} />,
  'sopas': <Soup size={18} />,
  'postres': <Cake size={18} />,
  'hamburguesas': <Beef size={18} />,
  'raciones': <Plus size={18} />,
  'bebidas': <GlassWater size={18} />,
};

export function CategoryTabs({ activeCategory, onCategoryChange }: CategoryTabsProps) {
  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    fetch('/api/categories')
      .then(res => res.json())
      .then(data => setCategories(data))
      .catch(console.error);
  }, []);

  return (
    <div className="flex items-center gap-1.5 sm:gap-2 p-2 sm:p-4 overflow-x-auto border-b border-border bg-card/50 scrollbar-hide">
      <button
        onClick={() => onCategoryChange('all')}
        className={`flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg sm:rounded-xl font-medium text-xs sm:text-sm whitespace-nowrap transition-all duration-200 ${
          activeCategory === 'all'
            ? 'bg-[hsl(var(--ocean))] text-white shadow-lg shadow-[hsl(var(--ocean))]/25'
            : 'bg-muted hover:bg-accent text-foreground'
        }`}
      >
        <Home size={16} className="sm:w-[18px] sm:h-[18px]" />
        <span>Todos</span>
      </button>
      {categories.map((category) => (
        <button
          key={category.id}
          onClick={() => onCategoryChange(category.slug)}
          className={`flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg sm:rounded-xl font-medium text-xs sm:text-sm whitespace-nowrap transition-all duration-200 ${
            activeCategory === category.slug
              ? 'bg-[hsl(var(--ocean))] text-white shadow-lg shadow-[hsl(var(--ocean))]/25'
              : 'bg-muted hover:bg-accent text-foreground'
          }`}
        >
          {iconMap[category.slug] || <UtensilsCrossed size={16} className="sm:w-[18px] sm:h-[18px]" />}
          <span>{category.name}</span>
        </button>
      ))}
    </div>
  );
}
