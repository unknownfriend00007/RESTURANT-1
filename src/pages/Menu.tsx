import { useState } from 'react';
import MenuItem from '@/components/MenuItem';
import { MENU_ITEMS, MENU_CATEGORIES } from '@/data/menu';
import { Button } from '@/components/ui/button';

export default function Menu() {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const filteredItems = selectedCategory === 'all'
    ? MENU_ITEMS
    : MENU_ITEMS.filter(item => item.category === selectedCategory);

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold text-center mb-8">Our Menu</h1>
      
      {/* Category Filter */}
      <div className="flex flex-wrap justify-center gap-2 mb-8">
        <Button
          variant={selectedCategory === 'all' ? 'default' : 'outline'}
          onClick={() => setSelectedCategory('all')}
          className={selectedCategory === 'all' ? 'bg-orange-600 hover:bg-orange-700' : ''}
        >
          All
        </Button>
        {MENU_CATEGORIES.map(category => (
          <Button
            key={category}
            variant={selectedCategory === category ? 'default' : 'outline'}
            onClick={() => setSelectedCategory(category)}
            className={selectedCategory === category ? 'bg-orange-600 hover:bg-orange-700' : ''}
          >
            {category}
          </Button>
        ))}
      </div>

      {/* Menu Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredItems.map(item => (
          <MenuItem key={item.id} {...item} />
        ))}
      </div>

      {filteredItems.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500">No items found in this category</p>
        </div>
      )}
    </div>
  );
}
