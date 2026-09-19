import { create } from 'zustand'

export const useUIStore = create((set) => ({
  sidebarCollapsed: false,
  toggleSidebar: () => set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),

  // Filters
  selectedRegion: '',
  setSelectedRegion: (region) => set({ selectedRegion: region }),

  selectedCountry: '',
  setSelectedCountry: (country) => set({ selectedCountry: country }),

  dateRange: { start: '', end: '' },
  setDateRange: (range) => set({ dateRange: range }),

  searchQuery: '',
  setSearchQuery: (query) => set({ searchQuery: query }),
}))
