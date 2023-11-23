export interface IEquipmentEditStates {
    isLoading: boolean;
    requestDate: any;
    userDepartment: string;
    departmentId: number;
    selectedHardwareTypes: any[];
    hardwareTypesList: any[];
    orderReason: string;
    wearDescription: string;
    requestDetail: string;
    currentUser: any;
    companyDepartments: any;
    ChangeHasMade: boolean;
    FormSubmitError: boolean;
    FormAlreadyExist: boolean;
    popoverOpen: boolean;
    isHWPlaceholderVisible: boolean;
    orderReasonValidationError: boolean;
    requestDetailValidationError: boolean;
    selectedHardwareTypesValidationError: boolean;
    ValidationError: boolean;
    wearIsShown: boolean;
    formId: number;
    formIsActiveStatus: boolean;
}