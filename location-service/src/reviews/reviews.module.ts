import { Module } from '@nestjs/common';
import { ReviewsRepository } from './reviews.repository';

@Module({
  controllers: [], // Видалено ReviewsController, оскільки він відсутній
  providers: [ReviewsRepository], // Видалено ReviewsService, оскільки він відсутній
  exports: [ReviewsRepository], // Видалено ReviewsService з експортів
})
export class ReviewsModule {}