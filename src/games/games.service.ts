import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { Game, Status, FrameType, Frame, Player } from '@prisma/client';
import { get } from 'lodash';

@Injectable()
export class GamesService {
  constructor(private prisma: PrismaService) {}

  async createGame(players: string[]): Promise<Game> {
    try {
      return this.prisma.game.create({
        data: {
          players: {
            create: players.map((name, index) => ({
              name,
              playerOrder: index,
              frames: {
                create: Array.from({ length: 10 }, (_, i) => ({
                  frameNo: i + 1,
                  rolls: [],
                  score: 0,
                })),
              },
            })),
          },
        },
        include: { players: { include: { frames: true } } },
      });
    } catch (error) {
      throw new Error('Failed to create game');
    }
  }

  async getGame(id: string): Promise<Game> {
    try {
      const game = await this.prisma.game.findUnique({
        where: { id },
        include: {
          players: {
            orderBy: { playerOrder: 'asc' },
            include: { frames: { orderBy: { frameNo: 'asc' } } },
          },
        },
      });
      if (!game) throw new NotFoundException('Game not found');
      return game;
    } catch (error) {
      throw new Error('Failed to fetch game');
    }
  }

  async rollBall(gameId: string, pinsKnocked: number): Promise<Game> {
    try {
      const game: Game = await this.getGame(gameId);
      const player = get(game, `players[${game.currentPlayerIndex}]`);
      if (!player) throw new NotFoundException('Player not found');

      const frame: Frame = get(player, `frames[${game.currentFrameIndex}]`);
      if (!frame) throw new NotFoundException('Frame not found');

      frame.rolls.push(pinsKnocked);

      if (frame.frameNo < 10) {
        if (frame.rolls.length === 1 && pinsKnocked === 10) {
          frame.type = FrameType.STRIKE;
        } else if (frame.rolls.length === 2) {
          frame.type =
            frame.rolls[0] + frame.rolls[1] === 10
              ? FrameType.SPARE
              : FrameType.OPEN;
        }
      } else {
        if (
          (frame.rolls.length === 2 && frame.rolls[0] + frame.rolls[1] < 10) ||
          frame.rolls.length === 3
        ) {
          game.currentRollIndex = 0;
          this.advanceTurn(game);
        }
      }

      frame.score = frame.rolls.reduce((acc, roll) => acc + roll, 0);
      await this.prisma.frame.update({
        where: { id: frame.id },
        data: { rolls: frame.rolls, score: frame.score, type: frame.type },
      });

      await this.updatePlayerScore(get(player, 'id'));

      if (frame.rolls.length >= 2 || frame.type === FrameType.STRIKE) {
        game.currentRollIndex = 0;
        await this.advanceTurn(game);
      } else {
        game.currentRollIndex += 1;
      }

      return this.getGame(gameId);
    } catch (error) {
      throw new Error(error);
    }
  }

  private async advanceTurn(game: Game) {
    try {
      if (
        game.currentPlayerIndex === get(game, 'players', []).length - 1 &&
        game.currentFrameIndex === 9
      ) {
        game.status = Status.COMPLETED;
      } else {
        if (game.currentPlayerIndex === get(game, 'players', []).length - 1) {
          game.currentFrameIndex += 1;
          game.currentPlayerIndex = 0;
        } else {
          game.currentPlayerIndex += 1;
        }
      }

      await this.updateGame(game.id, {
        currentPlayerIndex: game.currentPlayerIndex,
        currentFrameIndex: game.currentFrameIndex,
        status: game.status,
      });
    } catch (error) {
      throw new Error('Failed to advance turn');
    }
  }

  private calculateScore(frames: Frame[]): number {
    let score = 0;

    for (let i = 0; i < frames.length; i++) {
      const frame = frames[i];

      score += frame.rolls.reduce((sum, roll) => sum + roll, 0);

      if (frame.type === FrameType.STRIKE) {
        // Strike bonus: Add next two rolls
        if (i + 1 < frames.length) {
          score += frames[i + 1]?.rolls[0] ?? 0;
          if (frames[i + 1]?.rolls.length > 1) {
            score += frames[i + 1]?.rolls[1] ?? 0;
          } else if (i + 2 < frames.length) {
            score += frames[i + 2]?.rolls[0] ?? 0;
          }
        }
      } else if (frame.type === FrameType.SPARE) {
        // Spare bonus: Add next roll
        if (i + 1 < frames.length) {
          score += frames[i + 1]?.rolls[0] ?? 0;
        }
      }
    }

    return score;
  }

  private async updatePlayerScore(playerId: string) {
    try {
      const player = await this.prisma.player.findUnique({
        where: { id: playerId },
        include: { frames: true },
      });
      if (!player) throw new NotFoundException('Player not found');

      const totalScore = this.calculateScore(player.frames);
      await this.prisma.player.update({
        where: { id: playerId },
        data: { score: totalScore },
      });
    } catch (error) {
      throw new Error('Failed to update player score');
    }
  }

  async updateGame(id: string, data: Partial<Game>): Promise<Game> {
    try {
      return this.prisma.game.update({
        where: { id },
        data,
        include: { players: { include: { frames: true } } },
      });
    } catch (error) {
      throw new Error('Failed to update game');
    }
  }
}
