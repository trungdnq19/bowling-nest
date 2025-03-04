import {
  Controller,
  Get,
  Post,
  Param,
  Body,
  NotFoundException,
  Patch,
} from '@nestjs/common';
import { GamesService } from './games.service';

@Controller('games')
export class GamesController {
  constructor(private readonly gamesService: GamesService) {}

  @Post()
  async createGame(@Body('players') players: string[]) {
    try {
      return await this.gamesService.createGame(players);
    } catch {
      throw new Error('Failed to create game');
    }
  }

  @Get(':id')
  async getGame(@Param('id') id: string) {
    try {
      return await this.gamesService.getGame(id);
    } catch {
      throw new NotFoundException('Game not found');
    }
  }

  @Patch(':id/roll')
  async rollBall(@Param('id') id: string, @Body('pins') pins: number) {
    try {
      return await this.gamesService.rollBall(id, pins);
    } catch (e){
      throw new Error(e);
    }
  }
}
