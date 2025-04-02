declare class ContactsDto {
    phone?: string;
    email?: string;
    website?: string;
}
declare class WorkingHoursDto {
    weekdays?: string;
    saturday?: string;
    sunday?: string;
}
export declare class CreateLocationDto {
    name: string;
    address: string;
    latitude: number;
    longitude: number;
    type: string;
    category?: string;
    description?: string;
    contacts?: ContactsDto;
    workingHours?: WorkingHoursDto;
    organizationId?: string;
    status?: string;
    overallAccessibilityScore?: number;
}
export {};
