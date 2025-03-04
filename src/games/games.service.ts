import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/prisma.service';
import { Game, Prisma, Status } from '@prisma/client';
import { size } from 'lodash';
import { MAX_PLAYERS } from '@/constants';
@Injectable()
export class GamesService {
  constructor(private prisma: PrismaService) {}

  async createGameWithPlayers(
    players: Prisma.PlayerCreateManyInput[],
  ): Promise<Game> {
    if (size(players) > MAX_PLAYERS) {
      throw new Error(`Max players exceeded, max is ${MAX_PLAYERS}`);
    }
    return this.prisma.game.create({
      data: {
        status: 'IN_PROGRESS',
        players: {
          create: players,
        },
      },
      include: {
        players: {
          include: {
            frames: true,
          },
        },
      },
    });
  }

  async updateGameStatus(id: string, status: Status) {
    return this.prisma.game.update({
      where: {
        id,
      },
      data: {
        status,
      },
    });
  }

  findAll() {
    return this.prisma.game.findMany();
  }

  findOne(id: string) {
    return this.prisma.game.findUnique({
      where: {
        id,
      },
      include: {
        players: {
          include: {
            frames: true,
          },
        },
      },
    });
  }

  remove(id: number) {
    return `This action removes a #${id} game`;
  }
}
