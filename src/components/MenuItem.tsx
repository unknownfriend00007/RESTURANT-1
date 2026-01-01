import { toast } from 'sonner';
import { useCart } from '@/context/CartContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { formatPrice } from '@/lib/utils';

interface MenuItemProps {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  image: string;
  vegetarian: boolean;
}

export default function MenuItem({
  id,
  name,
  description,
  price,
  category,
  image,
  vegetarian,
}: MenuItemProps) {
  const { addItem, items } = useCart();

  const handleAddToCart = () => {
    const existingItem = items.find(item => item.id === id);
    
    if (existingItem && existingItem.quantity >= 10) {
      toast.error('Maximum 10 items allowed per dish');
      return;
    }

    addItem({
      id,
      name,
      price,
      image,
    });

    toast.success(`${name} added to cart!`);
  };

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow">
      <div className="aspect-video relative overflow-hidden bg-gray-100">
        <img
          src={image}
          alt={name}
          className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
          loading="lazy"
        />
        <div className="absolute top-2 right-2">
          <span className="bg-white text-xs font-semibold px-2 py-1 rounded-full shadow">
            {category}
          </span>
        </div>
        {vegetarian && (
          <div className="absolute top-2 left-2">
            <span className="bg-green-600 text-white text-xs font-semibold px-2 py-1 rounded-full shadow">
              🌱 Veg
            </span>
          </div>
        )}
      </div>
      
      <CardHeader>
        <CardTitle className="text-lg">{name}</CardTitle>
        <CardDescription className="line-clamp-2">{description}</CardDescription>
      </CardHeader>
      
      <CardContent>
        <p className="text-2xl font-bold text-orange-600">{formatPrice(price)}</p>
      </CardContent>
      
      <CardFooter>
        <Button
          onClick={handleAddToCart}
          className="w-full bg-orange-600 hover:bg-orange-700"
        >
          Add to Cart
        </Button>
      </CardFooter>
    </Card>
  );
}
