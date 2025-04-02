export declare class UserDto {
    id: string;
    email: string;
    fullName: string;
    role: string;
    permissions: any;
}
export declare class AuthResponseDto {
    accessToken: string;
    refreshToken: string;
    user: UserDto;
}
