export interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  image: string;
  vegetarian: boolean;
}

// IDs and prices MUST match backend api/create-order.ts MENU_PRICES
// Backend is source of truth - these are for display only
export const MENU_ITEMS: MenuItem[] = [
  {
    id: 'paneer-tikka',
    name: 'Paneer Tikka',
    description: 'Cottage cheese marinated in spices and grilled to perfection',
    price: 299,
    category: 'Starters',
    image: 'https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=400',
    vegetarian: true,
  },
  {
    id: 'butter-chicken',
    name: 'Butter Chicken',
    description: 'Tender chicken in rich, creamy tomato-based curry',
    price: 349,
    category: 'Main Course',
    image: 'https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?w=400',
    vegetarian: false,
  },
  {
    id: 'dal-makhani',
    name: 'Dal Makhani',
    description: 'Black lentils slow-cooked overnight with butter and cream',
    price: 249,
    category: 'Main Course',
    image: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=400',
    vegetarian: true,
  },
  {
    id: 'biryani',
    name: 'Chicken Biryani',
    description: 'Fragrant basmati rice layered with spiced chicken',
    price: 399,
    category: 'Main Course',
    image: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=400',
    vegetarian: false,
  },
  {
    id: 'naan',
    name: 'Butter Naan',
    description: 'Soft, fluffy Indian bread brushed with butter',
    price: 49,
    category: 'Breads',
    image: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=400',
    vegetarian: true,
  },
  {
    id: 'gulab-jamun',
    name: 'Gulab Jamun',
    description: 'Sweet milk dumplings soaked in rose-flavored syrup',
    price: 99,
    category: 'Desserts',
    image: 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=400',
    vegetarian: true,
  },
];

export const MENU_CATEGORIES = Array.from(
  new Set(MENU_ITEMS.map(item => item.category))
);
