import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  BadRequestException,
} from '@nestjs/common';
import { GamesService } from './games.service';
import { CreateGameDto } from './dto/create-game.dto';
import { Game, Status } from '@prisma/client';
import { get } from 'lodash';

@Controller('games')
export class GamesController {
  constructor(private readonly gamesService: GamesService) {}

  @Post()
  async create(@Body() createGameDto: CreateGameDto): Promise<Game> {
    try {
      return await this.gamesService.createGameWithPlayers(
        createGameDto.players,
      );
    } catch (error) {
      throw new BadRequestException(
        'ServiceException: ' + get(error, 'message'),
      );
    }
  }

  @Get()
  findAll() {
    return this.gamesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.gamesService.findOne(id);
  }

  @Patch(':id')
  updateStatus(@Param('id') id: string, @Body('status') status: Status) {
    return this.gamesService.updateGameStatus(id, status);
  }

  // @Patch(':id')
  // update(@Param('id') id: string, @Body() updateGameDto: UpdateGameDto) {
  //   return this.gamesService.update(+id, updateGameDto);
  // }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.gamesService.remove(+id);
  }
}
