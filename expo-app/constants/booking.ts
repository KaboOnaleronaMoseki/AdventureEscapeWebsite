import { ImageSourcePropType } from 'react-native';

export type PricedOption = {
  id: string;
  name: string;
  price: number;
  image: ImageSourcePropType;
};

export const activities: PricedOption[] = [
  {
    id: 'kayaking',
    name: 'Kayaking',
    price: 450,
    image: require('../assets/site-images/kayaking1.png'),
  },
  {
    id: 'ziplining',
    name: 'Ziplining',
    price: 550,
    image: require('../assets/site-images/Ziplining2.png'),
  },
  {
    id: 'climbing',
    name: 'Rock Climbing',
    price: 600,
    image: require('../assets/site-images/rock-climbing1.png'),
  },
  {
    id: 'team',
    name: 'Team Challenges',
    price: 400,
    image: require('../assets/site-images/Group-design.png'),
  },
  {
    id: 'hiking',
    name: 'Coastal Hiking & Fynbos Trail',
    price: 350,
    image: require('../assets/site-images/coastal-trail.png'),
  },
  {
    id: 'snorkeling',
    name: 'Marine Snorkel Safari',
    price: 500,
    image: require('../assets/site-images/water-adventure.png'),
  },
  {
    id: 'sup',
    name: 'Stand-Up Paddleboarding (SUP)',
    price: 380,
    image: require('../assets/site-images/paddleboarding-sunset.png'),
  },
  {
    id: 'fatbike',
    name: 'Fat Bike Dune Trail',
    price: 460,
    image: require('../assets/site-images/fat-bike-dunes.png'),
  },
  {
    id: 'caving',
    name: 'Caving & Grotto Exploration',
    price: 520,
    image: require('../assets/site-images/caving-adventure.png'),
  },
];

export const accommodations: (PricedOption & { unit: string })[] = [
  {
    id: 'cabins',
    name: 'Coastal Eco-Cabins',
    price: 1250,
    unit: 'per cabin / night',
    image: require('../assets/site-images/coastal-eco-cabin.png'),
  },
  {
    id: 'glamping',
    name: 'Canopy Glamping Tents',
    price: 850,
    unit: 'per tent / night',
    image: require('../assets/site-images/canopy-glamping.png'),
  },
  {
    id: 'lodge',
    name: 'Cliffside Mountain Lodge',
    price: 2400,
    unit: 'entire lodge / night',
    image: require('../assets/site-images/mountain-lodge-fireplace.png'),
  },
  {
    id: 'camp',
    name: 'Seaside Camp & Backpackers',
    price: 350,
    unit: 'per person / night',
    image: require('../assets/site-images/glamping-campsite.png'),
  },
];

export function calculateBooking(
  activityQuantities: Record<string, number>,
  accommodationQuantities: Record<string, number>,
) {
  const totalActivities = activities.reduce(
    (total, activity) => total + (activityQuantities[activity.id] ?? 0),
    0,
  );
  const activitySubtotal = activities.reduce(
    (total, activity) =>
      total + activity.price * (activityQuantities[activity.id] ?? 0),
    0,
  );
  const discountPercent =
    totalActivities >= 4 ? 15 : totalActivities === 3 ? 10 : totalActivities === 2 ? 5 : 0;
  const discountAmount = Math.round((activitySubtotal * discountPercent) / 100);
  const accommodationCount = accommodations.reduce(
    (total, accommodation) => total + (accommodationQuantities[accommodation.id] ?? 0),
    0,
  );
  const accommodationSubtotal = accommodations.reduce(
    (total, accommodation) =>
      total + accommodation.price * (accommodationQuantities[accommodation.id] ?? 0),
    0,
  );

  return {
    totalActivities,
    activitySubtotal,
    discountPercent,
    discountAmount,
    accommodationCount,
    accommodationSubtotal,
    total: activitySubtotal - discountAmount + accommodationSubtotal,
  };
}

export function formatRand(amount: number) {
  return `R${amount.toLocaleString('en-ZA')}`;
}
