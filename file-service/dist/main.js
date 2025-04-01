"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const app_module_1 = require("./app.module");
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const common_2 = require("@nestjs/common");
const path = require("path");
const fs = require("fs");
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule);
    const configService = app.get(config_1.ConfigService);
    const logger = new common_2.Logger('FileService');
    app.useGlobalPipes(new common_1.ValidationPipe({
        whitelist: true,
        transform: true,
        forbidNonWhitelisted: true,
    }));
    app.enableCors({
        origin: configService.get('CORS_ORIGIN') || '*',
        methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
        credentials: true,
    });
    const uploadsDir = configService.get('UPLOAD_DIR') || 'uploads';
    const thumbnailsDir = path.join(uploadsDir, 'thumbnails');
    if (!fs.existsSync(uploadsDir)) {
        fs.mkdirSync(uploadsDir, { recursive: true });
        logger.log(`Created uploads directory: ${uploadsDir}`);
    }
    if (!fs.existsSync(thumbnailsDir)) {
        fs.mkdirSync(thumbnailsDir, { recursive: true });
        logger.log(`Created thumbnails directory: ${thumbnailsDir}`);
    }
    const port = configService.get('PORT') || 3003;
    await app.listen(port);
    logger.log(`File service is running on port ${port}`);
}
bootstrap();
//# sourceMappingURL=main.js.map