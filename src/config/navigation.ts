import {
  LayoutDashboard,
  Search,
  Package,
  Navigation,
  Receipt,
  Heart,
  MessageSquare,
  Sparkles,
  User,
  Bell,
  Settings,
  HelpCircle,
  ShoppingBag,
  Clock,
  HeartHandshake,
  Users,
  QrCode,
  BarChart3,
  IndianRupee,
  Gift,
  Truck,
  Utensils,
  Store,
  CreditCard,
  Map,
  FileCheck2,
  ShieldAlert,
  Database,
  Sliders,
  Home,
  Info,
  CalendarCheck,
  PackageCheck,
  CalendarClock,
  Users2,
  Building2,
  Leaf,
} from 'lucide-react';
import { UserRole } from '../types';

export interface NavItemConfig {
  id: string;
  label: string;
  icon: any;
  view: string;
  badgeKey?: 'orders' | 'messages' | 'notifications' | 'donations' | 'deliveries' | 'verifications' | 'fraud';
  description?: string;
  category?: 'MAIN' | 'OPERATIONS' | 'COMMUNICATION' | 'ACCOUNT' | 'SYSTEM';
}

export const CONSUMER_NAV: NavItemConfig[] = [
  { id: 'c-dashboard', label: 'Dashboard', icon: LayoutDashboard, view: 'dashboard', category: 'MAIN' },
  { id: 'c-browse', label: 'Explore Surplus', icon: Search, view: 'browse', category: 'MAIN' },
  { id: 'c-orders', label: 'My Orders', icon: Package, view: 'orders', badgeKey: 'orders', category: 'OPERATIONS' },
  { id: 'c-tracking', label: 'Live Tracking', icon: Navigation, view: 'live-tracking', badgeKey: 'deliveries', category: 'OPERATIONS' },
  { id: 'c-receipts', label: 'Receipts', icon: Receipt, view: 'receipts', category: 'OPERATIONS' },
  { id: 'c-saved', label: 'Saved Listings', icon: Heart, view: 'saved', category: 'MAIN' },
  { id: 'c-messages', label: 'Messages', icon: MessageSquare, view: 'messages', badgeKey: 'messages', category: 'COMMUNICATION' },
  { id: 'c-impact', label: 'Impact', icon: Leaf, view: 'impact', category: 'MAIN' },
  { id: 'c-profile', label: 'My Profile', icon: User, view: 'profile', category: 'ACCOUNT' },
  { id: 'c-notifications', label: 'Notifications', icon: Bell, view: 'notifications', badgeKey: 'notifications', category: 'ACCOUNT' },
  { id: 'c-settings', label: 'Settings', icon: Settings, view: 'settings', category: 'ACCOUNT' },
  { id: 'c-help', label: 'Help & Support', icon: HelpCircle, view: 'help', category: 'ACCOUNT' },
];

export const BUSINESS_NAV: NavItemConfig[] = [
  { id: 'b-dashboard', label: 'Dashboard', icon: LayoutDashboard, view: 'dashboard', category: 'MAIN' },
  { id: 'b-inventory', label: 'Inventory', icon: Package, view: 'inventory', category: 'OPERATIONS' },
  { id: 'b-listings', label: 'Surplus Listings', icon: ShoppingBag, view: 'listings', category: 'OPERATIONS' },
  { id: 'b-orders', label: 'Orders', icon: ShoppingBag, view: 'orders', badgeKey: 'orders', category: 'OPERATIONS' },
  { id: 'b-reservations', label: 'Reservations', icon: CalendarCheck, view: 'reservations', category: 'OPERATIONS' },
  { id: 'b-donations', label: 'Donations', icon: HeartHandshake, view: 'donations', badgeKey: 'donations', category: 'OPERATIONS' },
  { id: 'b-partners', label: 'NGO Partners', icon: Building2, view: 'ngo-partners', category: 'OPERATIONS' },
  { id: 'b-pickup', label: 'Pickup Management', icon: QrCode, view: 'pickup-management', category: 'OPERATIONS' },
  { id: 'b-messages', label: 'Messages', icon: MessageSquare, view: 'messages', badgeKey: 'messages', category: 'COMMUNICATION' },
  { id: 'b-analytics', label: 'Analytics', icon: BarChart3, view: 'analytics', category: 'OPERATIONS' },
  { id: 'b-finance', label: 'Finance & Settlements', icon: IndianRupee, view: 'finance', category: 'OPERATIONS' },
  { id: 'b-impact', label: 'Impact', icon: Leaf, view: 'impact', category: 'MAIN' },
  { id: 'b-profile', label: 'My Profile', icon: User, view: 'profile', category: 'ACCOUNT' },
  { id: 'b-notifications', label: 'Notifications', icon: Bell, view: 'notifications', badgeKey: 'notifications', category: 'ACCOUNT' },
  { id: 'b-settings', label: 'Settings', icon: Settings, view: 'settings', category: 'ACCOUNT' },
  { id: 'b-help', label: 'Help & Support', icon: HelpCircle, view: 'help', category: 'ACCOUNT' },
];

export const NGO_NAV: NavItemConfig[] = [
  { id: 'n-dashboard', label: 'Dashboard', icon: LayoutDashboard, view: 'dashboard', category: 'MAIN' },
  { id: 'n-feed', label: 'Donation Feed', icon: Gift, view: 'donation-feed', badgeKey: 'donations', category: 'OPERATIONS' },
  { id: 'n-mydonations', label: 'My Donations', icon: PackageCheck, view: 'my-donations', category: 'OPERATIONS' },
  { id: 'n-pickups', label: 'Pickup Requests', icon: CalendarClock, view: 'pickup-requests', category: 'OPERATIONS' },
  { id: 'n-deliveries', label: 'Active Deliveries', icon: Truck, view: 'active-deliveries', badgeKey: 'deliveries', category: 'OPERATIONS' },
  { id: 'n-tracking', label: 'Live Tracking', icon: Navigation, view: 'live-tracking', category: 'OPERATIONS' },
  { id: 'n-distribution', label: 'Distribution', icon: Utensils, view: 'distribution', category: 'OPERATIONS' },
  { id: 'n-explore', label: 'Explore Surplus', icon: Search, view: 'explore-surplus', category: 'MAIN' },
  { id: 'n-messages', label: 'Messages', icon: MessageSquare, view: 'messages', badgeKey: 'messages', category: 'COMMUNICATION' },
  { id: 'n-impact', label: 'Impact', icon: Leaf, view: 'impact', category: 'MAIN' },
  { id: 'n-profile', label: 'My Profile', icon: User, view: 'profile', category: 'ACCOUNT' },
  { id: 'n-notifications', label: 'Notifications', icon: Bell, view: 'notifications', badgeKey: 'notifications', category: 'ACCOUNT' },
  { id: 'n-settings', label: 'Settings', icon: Settings, view: 'settings', category: 'ACCOUNT' },
  { id: 'n-help', label: 'Help & Support', icon: HelpCircle, view: 'help', category: 'ACCOUNT' },
];

export const ADMIN_NAV: NavItemConfig[] = [
  { id: 'a-dashboard', label: 'Dashboard', icon: LayoutDashboard, view: 'dashboard', category: 'MAIN' },
  { id: 'a-users', label: 'Users', icon: Users, view: 'users', category: 'OPERATIONS' },
  { id: 'a-businesses', label: 'Businesses', icon: Store, view: 'businesses', category: 'OPERATIONS' },
  { id: 'a-ngos', label: 'NGOs', icon: HeartHandshake, view: 'ngos', category: 'OPERATIONS' },
  { id: 'a-listings', label: 'Listings', icon: ShoppingBag, view: 'listings', category: 'OPERATIONS' },
  { id: 'a-orders', label: 'Orders', icon: Package, view: 'orders', badgeKey: 'orders', category: 'OPERATIONS' },
  { id: 'a-donations', label: 'Donations', icon: Gift, view: 'donations', badgeKey: 'donations', category: 'OPERATIONS' },
  { id: 'a-payments', label: 'Payments', icon: CreditCard, view: 'payments', category: 'OPERATIONS' },
  { id: 'a-settlements', label: 'Settlements', icon: IndianRupee, view: 'settlements', category: 'OPERATIONS' },
  { id: 'a-logistics', label: 'Live Logistics', icon: Truck, view: 'live-logistics', badgeKey: 'deliveries', category: 'OPERATIONS' },
  { id: 'a-map', label: 'Live Map', icon: Map, view: 'live-map', category: 'OPERATIONS' },
  { id: 'a-messages', label: 'Messages', icon: MessageSquare, view: 'messages', badgeKey: 'messages', category: 'COMMUNICATION' },
  { id: 'a-impact', label: 'Impact', icon: Leaf, view: 'impact', category: 'MAIN' },
  { id: 'a-analytics', label: 'Analytics', icon: BarChart3, view: 'analytics', category: 'OPERATIONS' },
  { id: 'a-verification', label: 'Verification', icon: FileCheck2, view: 'verification', badgeKey: 'verifications', category: 'SYSTEM' },
  { id: 'a-reports', label: 'Reports & Fraud', icon: ShieldAlert, view: 'reports', badgeKey: 'fraud', category: 'SYSTEM' },
  { id: 'a-audit', label: 'Audit Logs', icon: Database, view: 'audit-logs', category: 'SYSTEM' },
  { id: 'a-settings', label: 'System Settings', icon: Sliders, view: 'system-settings', category: 'SYSTEM' },
  { id: 'a-profile', label: 'My Profile', icon: User, view: 'profile', category: 'ACCOUNT' },
];

export const GUEST_NAV: NavItemConfig[] = [
  { id: 'g-home', label: 'Home', icon: Home, view: 'landing', category: 'MAIN' },
  { id: 'g-explore', label: 'Explore', icon: Search, view: 'browse', category: 'MAIN' },
  { id: 'g-how', label: 'How It Works', icon: HelpCircle, view: 'how-it-works', category: 'MAIN' },
  { id: 'g-about', label: 'About', icon: Info, view: 'about', category: 'MAIN' },
  { id: 'g-impact', label: 'Impact Metrics', icon: Leaf, view: 'impact', category: 'MAIN' },
];

export const getNavConfigForRole = (role?: UserRole): NavItemConfig[] => {
  if (!role) return GUEST_NAV;
  switch (role) {
    case 'CONSUMER':
      return CONSUMER_NAV;
    case 'BUSINESS':
      return BUSINESS_NAV;
    case 'NGO':
      return NGO_NAV;
    case 'ADMIN':
      return ADMIN_NAV;
    case 'RETAILER':
    case 'RIDER':
      return [
        { id: 'r-dashboard', label: 'Dashboard', icon: LayoutDashboard, view: 'dashboard', category: 'MAIN' },
        { id: 'r-browse', label: 'Marketplace', icon: Search, view: 'browse', category: 'MAIN' },
        { id: 'r-tracking', label: 'Live Telemetry', icon: Navigation, view: 'live-tracking', category: 'OPERATIONS' },
        { id: 'r-messages', label: 'Messages', icon: MessageSquare, view: 'messages', category: 'COMMUNICATION' },
        { id: 'r-profile', label: 'My Profile', icon: User, view: 'profile', category: 'ACCOUNT' },
        { id: 'r-notifications', label: 'Notifications', icon: Bell, view: 'notifications', category: 'ACCOUNT' },
        { id: 'r-settings', label: 'Settings', icon: Settings, view: 'settings', category: 'ACCOUNT' },
        { id: 'r-help', label: 'Help & Support', icon: HelpCircle, view: 'help', category: 'ACCOUNT' },
      ];
    default:
      return GUEST_NAV;
  }
};
