import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  constructor() {
    super({
      log: process.env.NODE_ENV === 'development' ? ['query', 'info', 'warn', 'error'] : ['error'],
    });
  }

  async onModuleInit() {
    await this.$connect();
    
    // Додаємо Hook для обробки помилок
    this.$use(async (params, next) => {
      try {
        return await next(params);
      } catch (error) {
        console.error(`Prisma Error: ${error.message}`);
        throw error;
      }
    });
    
    // Налаштування для м'якого видалення, якщо потрібно
    this.$use(async (params, next) => {
      if (params.action === 'findUnique' || params.action === 'findFirst') {
        // Змінюємо на findFirst - це дозволяє додати умову where
        params.action = 'findFirst';
        // Додаємо умову перевірки soft delete, якщо модель має поле deleted
        if (params.args.where && 'deleted' in params.args.where) {
          params.args.where['deleted'] = false;
        }
      }
      if (params.action === 'findMany') {
        // Додаємо умову перевірки soft delete, якщо модель має поле deleted
        if (params.args.where && 'deleted' in params.args.where) {
          params.args.where['deleted'] = false;
        }
      }
      return next(params);
    });
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
  
  async cleanDb() {
    if (process.env.NODE_ENV === 'test') {
      // Очищаємо базу даних для тестів
      const models = Reflect.ownKeys(this).filter(
        (key) => key[0] !== '_' && key[0] !== '$' && key !== 'constructor',
      );
      
      return Promise.all(
        models.map((modelKey) => this[modelKey as string].deleteMany()),
      );
    }
  }
}
