export interface PortfolioPageContext {
  [key: string]: any;
  projects: any[];
  stackModules: any[];
  languageCards: any[];
  playbackWaveBars: number[];
  favoriteCategories: any[];
  favoriteItems: any[];
  socials: any[];
  selectedEstimateAreas: any[];
  selectedRepositories: any[];
  selectedFrameworkRepositories: any[];
  live: {
    animeGenres: any[];
    [key: string]: any;
  };
}
