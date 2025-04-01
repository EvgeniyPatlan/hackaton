export declare class DisabilityInfoDto {
    type?: string;
    details?: string;
    assistiveDevices?: string;
}
export declare class PreferencesDto {
    accessibilityNeeds?: string;
    notificationPreferences?: string;
    language?: string;
}
export declare class CreateProfileDto {
    bio?: string;
    avatarUrl?: string;
    address?: string;
    city?: string;
    region?: string;
    postalCode?: string;
    preferences?: PreferencesDto;
    disabilityInfo?: DisabilityInfoDto;
}
