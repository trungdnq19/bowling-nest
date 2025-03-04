import { Module } from '@nestjs/common';
import { AppService } from './app.service';
import { AppController } from './app.controller';
import { GamesModule } from './games/games.module';

@Module({
  imports: [GamesModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
