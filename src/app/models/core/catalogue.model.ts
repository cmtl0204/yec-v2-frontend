export interface CatalogueModel {
  id: string;
  parentId: string;
  code: string;
  name: string;
  required: boolean;
  sort: number;
  type: string;
  isVisible: boolean;
}
