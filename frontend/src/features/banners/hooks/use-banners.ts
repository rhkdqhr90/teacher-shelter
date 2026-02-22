import { useQuery } from '@tanstack/react-query';
import { bannerApi } from '../services/banner-api';

export function usePromoBanners() {
  return useQuery({
    queryKey: ['banners', 'promo'],
    queryFn: bannerApi.getPromoBanners,
    staleTime: 5 * 60 * 1000, // 5분
    gcTime: 10 * 60 * 1000, // 10분
  });
}

export function useSidebarBanners() {
  return useQuery({
    queryKey: ['banners', 'sidebar'],
    queryFn: bannerApi.getSidebarBanners,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
}
