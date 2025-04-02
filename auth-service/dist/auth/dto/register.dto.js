"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RegisterDto = void 0;
const class_validator_1 = require("class-validator");
const swagger_1 = require("@nestjs/swagger");
class RegisterDto {
}
exports.RegisterDto = RegisterDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Email користувача',
        example: 'user@example.com',
    }),
    (0, class_validator_1.IsEmail)({}, { message: 'Введіть правильний email' }),
    (0, class_validator_1.IsNotEmpty)({ message: 'Email обов\'язковий' }),
    __metadata("design:type", String)
], RegisterDto.prototype, "email", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Повне ім\'я користувача',
        example: 'Іван Петренко',
    }),
    (0, class_validator_1.IsString)({ message: 'Ім\'я повинно бути рядком' }),
    (0, class_validator_1.IsNotEmpty)({ message: 'Ім\'я обов\'язкове' }),
    __metadata("design:type", String)
], RegisterDto.prototype, "fullName", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Номер телефону користувача',
        example: '+380991234567',
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.Matches)(/^\+?[0-9]{10,15}$/, { message: 'Невірний формат номера телефону' }),
    __metadata("design:type", String)
], RegisterDto.prototype, "phone", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Пароль користувача',
        example: 'Password123!',
        minLength: 8,
    }),
    (0, class_validator_1.IsString)({ message: 'Пароль повинен бути рядком' }),
    (0, class_validator_1.IsNotEmpty)({ message: 'Пароль обов\'язковий' }),
    (0, class_validator_1.MinLength)(8, { message: 'Пароль повинен бути не менше 8 символів' }),
    (0, class_validator_1.Matches)(/((?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/, {
        message: 'Пароль повинен містити хоча б 1 велику літеру, 1 малу літеру та 1 цифру або спеціальний символ',
    }),
    __metadata("design:type", String)
], RegisterDto.prototype, "password", void 0);
//# sourceMappingURL=register.dto.js.map