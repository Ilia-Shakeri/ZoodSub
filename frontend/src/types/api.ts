export interface Category {
  id: number;
  name: string;
  slug: string;
  icon?: string;
  sortOrder: number;
}

export interface Variant {
  id: number;
  productId: number;
  name: string;
  duration?: string;
  region?: string;
  accountType?: string;
  price: number;
  oldPrice?: number;
  stock: number;
  isActive: boolean;
}

export interface Product {
  id: number;
  title: string;
  slug: string;
  description?: string;
  image?: string;
  isActive: boolean;
  isFeatured: boolean;
  deliveryType: string;
  category: Category;
  variants: Variant[];
}

export interface OrderItem {
  id: number;
  productId: number;
  variantId: number;
  title: string;
  variantName: string;
  duration?: string;
  region?: string;
  accountType?: string;
  price: number;
  quantity: number;
  total: number;
}

export interface Order {
  id: number;
  orderNumber: string;
  status: string;
  subtotal: number;
  discount: number;
  totalPrice: number;
  fullName: string;
  phone: string;
  email: string;
  telegramUsername?: string;
  country: string;
  city?: string;
  deliveryMethod: string;
  note?: string;
  createdAt: string;
  items: OrderItem[];
}

export interface UserProfile {
  id: number;
  telegramId: string;
  username?: string;
  firstName?: string;
  lastName?: string;
  photoUrl?: string;
  isAdmin: boolean;
}

export interface CartItem {
  productId: number;
  variantId: number;
  title: string;
  variantName: string;
  price: number;
  quantity: number;
  image?: string;
}

export interface DeliveryForm {
  fullName: string;
  phone: string;
  email: string;
  telegramUsername: string;
  country: string;
  city: string;
  address: string;
  deliveryMethod: "Telegram Message" | "Email" | "WhatsApp" | "Manual Support";
  note: string;
}
