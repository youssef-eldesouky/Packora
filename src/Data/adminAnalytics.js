/** Static analytics datasets aligned with design; revenue in EGP */
export const revenueSixMonths = [
  { month: 'Jan', orders: 156, revenue: 45200 },
  { month: 'Feb', orders: 189, revenue: 52800 },
  { month: 'Mar', orders: 167, revenue: 48900 },
  { month: 'Apr', orders: 212, revenue: 61200 },
  { month: 'May', orders: 198, revenue: 58700 },
  { month: 'Jun', orders: 234, revenue: 67400 },
];

export const revenueOneYear = [
  { month: 'Jul', orders: 142, revenue: 42100 },
  { month: 'Aug', orders: 168, revenue: 49800 },
  { month: 'Sep', orders: 175, revenue: 51200 },
  { month: 'Oct', orders: 191, revenue: 55600 },
  { month: 'Nov', orders: 204, revenue: 60100 },
  { month: 'Dec', orders: 218, revenue: 63800 },
  ...revenueSixMonths,
];

export const topCategories = [
  { name: 'Cardboard Boxes', percent: 35, sales: 4250 },
  { name: 'Eco Packaging', percent: 26, sales: 3180 },
  { name: 'Protective Materials', percent: 20, sales: 2420 },
  { name: 'Supplies', percent: 12, sales: 1450 },
  { name: 'Other', percent: 7, sales: 850 },
];

export const analyticsKpis = {
  averageOrderValue: { value: '$285', change: '+12.5%', up: true },
  conversionRate: { value: '3.8%', change: '+0.5%', up: true },
  customerRetention: { value: '68%', change: '-2.1%', up: false },
  productsSold: { value: '12,458', change: '+18.3%', up: true },
};

export function summarizeRevenue(rows) {
  const totalRevenue = rows.reduce((s, r) => s + r.revenue, 0);
  const totalOrders = rows.reduce((s, r) => s + r.orders, 0);
  return { totalRevenue, totalOrders };
}
