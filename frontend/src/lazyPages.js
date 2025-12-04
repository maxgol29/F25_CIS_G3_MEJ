import { lazy } from 'react';

export const AuthPage = lazy(() => import('./components/AuthPage'));
export const HomePage = lazy(() => import('./components/HomePage'));
export const ProfilePage = lazy(() => import('./components/ProfilePage'));
export const MapPage = lazy(() => import('./components/Mappage'));
export const BrowsePage = lazy(() => import('./components/BrowsePage'));
export const BusinessDetailPage = lazy(() => import('./components/BusinessDetailPage'));
export const CartPage = lazy(() => import('./components/CartPage'));
export const PaymentPage = lazy(() => import('./components/PaymentPage'));
export const OrderConfirmation = lazy(() => import('./components/OrderConfirmation'));
export const OrderHistory = lazy(() => import('./components/OrderHistory'));
export const OwnerPage = lazy(() => import('./components/OwnerPage'));
export const MenuEditor = lazy(() => import('./components/MenuEditor'));
export const OwnerOrders = lazy(() => import('./components/OwnerOrders'));
export const PromoManager = lazy(() => import('./components/PromoManager'));
export const Dashboard = lazy(() => import('./components/Dashboard'));
