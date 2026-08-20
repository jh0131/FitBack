export type CategoryType = 'STYLE' | 'SILHOUETTE' | 'MATERIAL' | 'DETAIL' | 'COLOR';

export interface TagMaster {
  tagName: string;
  categoryType: CategoryType;
  targetClothing: string[];
}
