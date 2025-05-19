import { Product } from '../types';

export const mockProducts: Product[] = [
  {
    id: '0001',
    name: 'Beef Krapow Set with Beverages',
    price: 15.00, // Base price of the set
    category: 'Main',
    imageUrl: 'https://d282v6zd99utr7.cloudfront.net/public/merchant/3173/31730001.jpg?1721145902',
    isAvailable: true,
    description: 'A delicious set of beef krapow, served with your choice of beverage, spice level, basil, weight, and packaging.',
    addons: [
      {
        id: 'spicy_level',
        name: 'Spicy Level',
        isRequired: true,
        multipleSelection: false,
        options: [
          { id: 'non_spicy', name: 'Non Spicy', additionalPrice: 0, isDefault: false },
          { id: 'normal_spicy', name: 'Normal 🌶️', additionalPrice: 0, isDefault: true },
          { id: 'spicy_spicy', name: 'Spicy 🌶️🌶️', additionalPrice: 0, isDefault: false },
          { id: 'extra_spicy', name: 'Extra Spicy 🌶️🌶️', additionalPrice: 0, isDefault: false },
        ],
      },
      {
        id: 'basil',
        name: 'Basil',
        isRequired: true,
        multipleSelection: false,
        options: [
          { id: 'thai_holy_basil', name: 'Thai Holy Basil (Krapow) - Default', additionalPrice: 0, isDefault: true },
          { id: 'thai_basil', name: 'Thai Basil (Selasih)', additionalPrice: 0, isDefault: false },
          { id: 'no_basil', name: 'No Basil', additionalPrice: 0, isDefault: false },
        ],
      },
      {
        id: 'weight',
        name: 'Weight',
        isRequired: true,
        multipleSelection: false,
        options: [
          { id: '125g', name: '125g - Default', additionalPrice: 0, isDefault: true },
          { id: '250g', name: '250g', additionalPrice: 1.50, isDefault: false }, // Assumed +$1.50
        ],
      },
      {
        id: 'packaging',
        name: 'Packaging',
        isRequired: true,
        multipleSelection: false,
        options: [
          { id: 'photodegradable', name: 'Food Container (Photodegradable)', additionalPrice: 0, isDefault: true },
          { id: 'plastic', name: 'Food Container (Plastic)', additionalPrice: 0, isDefault: false },
        ],
      },
      {
        id: 'beverages',
        name: 'Beverages',
        isRequired: true,
        multipleSelection: false,
        options: [
          { id: 'kickapoo', name: 'Kickapoo', additionalPrice: 0, isDefault: true }, // Assuming included
          { id: 'soya', name: 'Soya', additionalPrice: 0, isDefault: false }, // Assuming included as alternative
        ],
      },
    ],
  },
  {
    id: '0002',
    name: 'Chicken Krapow Set with Beverages',
    price: 15.00, // Base price of the set
    category: 'Main',
    imageUrl: 'https://d282v6zd99utr7.cloudfront.net/public/merchant/3173/31730002.jpg?1721145936',
    isAvailable: true,
    description: 'A delicious set of chicken krapow, served with your choice of beverage, spice level, basil, weight, and packaging.',
    addons: [
      // Assuming same addons as Beef Krapow Set for brevity in this example
      {
        id: 'spicy_level',
        name: 'Spicy Level',
        isRequired: true,
        multipleSelection: false,
        options: [
          { id: 'non_spicy', name: 'Non Spicy', additionalPrice: 0, isDefault: false },
          { id: 'normal_spicy', name: 'Normal 🌶️', additionalPrice: 0, isDefault: true },
          { id: 'spicy_spicy', name: 'Spicy 🌶️🌶️', additionalPrice: 0, isDefault: false },
          { id: 'extra_spicy', name: 'Extra Spicy 🌶️🌶️', additionalPrice: 0, isDefault: false },
        ],
      },
      {
        id: 'basil',
        name: 'Basil',
        isRequired: true,
        multipleSelection: false,
        options: [
          { id: 'thai_holy_basil', name: 'Thai Holy Basil (Krapow) - Default', additionalPrice: 0, isDefault: true },
          { id: 'thai_basil', name: 'Thai Basil (Selasih)', additionalPrice: 0, isDefault: false },
          { id: 'no_basil', name: 'No Basil', additionalPrice: 0, isDefault: false },
        ],
      },
      {
        id: 'weight',
        name: 'Weight',
        isRequired: true,
        multipleSelection: false,
        options: [
          { id: '125g', name: '125g - Default', additionalPrice: 0, isDefault: true },
          { id: '250g', name: '250g', additionalPrice: 1.50, isDefault: false }, // Assumed +$1.50
        ],
      },
      {
        id: 'packaging',
        name: 'Packaging',
        isRequired: true,
        multipleSelection: false,
        options: [
          { id: 'photodegradable', name: 'Food Container (Photodegradable)', additionalPrice: 0, isDefault: true },
          { id: 'plastic', name: 'Food Container (Plastic)', additionalPrice: 0, isDefault: false },
        ],
      },
      {
        id: 'beverages',
        name: 'Beverages',
        isRequired: true,
        multipleSelection: false,
        options: [
          { id: 'kickapoo', name: 'Kickapoo', additionalPrice: 0, isDefault: true },
          { id: 'soya', name: 'Soya', additionalPrice: 0, isDefault: false },
        ],
      },
    ],
  },
  // You can add more products here, transforming them similarly
]; 