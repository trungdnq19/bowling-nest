import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/prisma.service';
import { Game, Prisma, Status } from '@prisma/client';

@Injectable()
export class GamesService {
  constructor(private prisma: PrismaService) {}

  async createGameWithPlayers(
    players: Prisma.PlayerCreateManyInput[],
  ): Promise<Game> {
    return this.prisma.game.create({
      data: {
        status: 'IN_PROGRESS',
        playerScores: {
          create: players.map((player) => ({
            player: {
              create: {
                name: player.name,
              },
            },
          })),
        },
      },
      include: {
        playerScores: {
          include: {
            player: true,
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
        playerScores: {
          include: {
            player: true,
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
