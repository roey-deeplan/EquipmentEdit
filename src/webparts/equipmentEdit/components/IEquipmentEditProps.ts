import { WebPartContext } from "@microsoft/sp-webpart-base";
export interface IEquipmentEditProps {
  userDisplayName: string;
  context: WebPartContext;
  siteUrl: string;
  FormName: string;
  companyDepartmentsList: string; // Stores the ID's list
  ordersList: string; // Stores the ID's list
  equipmentList: string; // Stores the ID's list
  ReturnLink: string;
  LinkToEditForm: string;
}
