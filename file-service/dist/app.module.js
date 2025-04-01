"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const jwt_1 = require("@nestjs/jwt");
const prisma_module_1 = require("./prisma/prisma.module");
const file_module_1 = require("./file/file.module");
const health_module_1 = require("./health/health.module");
const platform_express_1 = require("@nestjs/platform-express");
const multer_1 = require("multer");
const uuid_1 = require("uuid");
const path = require("path");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule.forRoot({
                isGlobal: true,
                envFilePath: ['.env'],
            }),
            jwt_1.JwtModule.registerAsync({
                imports: [config_1.ConfigModule],
                inject: [config_1.ConfigService],
                global: true,
                useFactory: (configService) => ({
                    secret: configService.get('JWT_SECRET'),
                    signOptions: {
                        expiresIn: configService.get('JWT_EXPIRATION') || '1h',
                    },
                }),
            }),
            platform_express_1.MulterModule.registerAsync({
                imports: [config_1.ConfigModule],
                inject: [config_1.ConfigService],
                useFactory: (configService) => ({
                    storage: (0, multer_1.diskStorage)({
                        destination: (req, file, cb) => {
                            const uploadDir = configService.get('UPLOAD_DIR') || 'uploads';
                            cb(null, uploadDir);
                        },
                        filename: (req, file, cb) => {
                            const extension = path.extname(file.originalname);
                            const filename = `${(0, uuid_1.v4)()}${extension}`;
                            cb(null, filename);
                        },
                    }),
                    limits: {
                        fileSize: configService.get('MAX_FILE_SIZE') || 5 * 1024 * 1024,
                    },
                    fileFilter: (req, file, cb) => {
                        const allowedMimeTypes = configService.get('ALLOWED_MIME_TYPES') ||
                            'image/jpeg,image/png,image/gif,application/pdf';
                        if (allowedMimeTypes.split(',').includes(file.mimetype)) {
                            cb(null, true);
                        }
                        else {
                            cb(new Error(`Unsupported file type: ${file.mimetype}`), false);
                        }
                    },
                }),
            }),
            prisma_module_1.PrismaModule,
            file_module_1.FileModule,
            health_module_1.HealthModule,
        ],
        controllers: [],
        providers: [],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map