import { DisabilityInfoDto, PreferencesDto } from './create-profile.dto';
export declare class UpdateProfileDto {
    bio?: string;
    avatarUrl?: string;
    address?: string;
    city?: string;
    region?: string;
    postalCode?: string;
    preferences?: PreferencesDto;
    disabilityInfo?: DisabilityInfoDto;
}
