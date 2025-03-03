import { Module } from '@nestjs/common';
import { AppService } from './app.service';
import { AppController } from './app.controller';
import { GamesModule } from './games/games.module';
import { PlayersModule } from './players/players.module';

@Module({
  imports: [GamesModule, PlayersModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
