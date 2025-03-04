import { Test, TestingModule } from '@nestjs/testing';
import { GameService } from './game.service';
import { PrismaService } from '../prisma.service';
import { Status, FrameType } from '@prisma/client';
import { get } from 'lodash';

describe('GamesService', () => {
  let gameService: GameService;
  let prismaService: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [GameService, PrismaService],
    }).compile();

    gameService = module.get<GameService>(GameService);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  it('should create a game', async () => {
    jest.spyOn(prismaService.game, 'create').mockResolvedValue({
      id: '1',
      players: [],
      currentPlayerIndex: 0,
      currentFrameIndex: 0,
      status: Status.IN_PROGRESS,
    } as any);
    const game = await gameService.createGame(['Alice', 'Bob']);
    expect(game).toBeDefined();
  });

  it('should handle a roll correctly', async () => {
    const gameMock = {
      id: '1',
      players: [
        {
          id: 'p1',
          frames: [
            { id: 'f1', frameNo: 1, rolls: [], score: 0, type: FrameType.OPEN },
          ],
        },
      ],
      currentPlayerIndex: 0,
      currentFrameIndex: 0,
      status: Status.IN_PROGRESS,
    };
    jest.spyOn(gameService, 'getGame').mockResolvedValue(gameMock as any);
    jest.spyOn(prismaService.frame, 'update').mockResolvedValue({} as any);
    jest.spyOn(gameService, 'updatePlayerScore').mockImplementation();

    const updatedGame = await gameService.rollBall('1', 5);
    expect(updatedGame).toBeDefined();
  });

  it('should calculate score correctly for strikes', () => {
    const frames = [
      { rolls: [10], type: FrameType.STRIKE },
      { rolls: [10], type: FrameType.STRIKE },
      { rolls: [10], type: FrameType.STRIKE },
      { rolls: [5, 3], type: FrameType.OPEN },
    ];
    const score = gameService['calculateScore'](frames);
    expect(score).toBe(10 + 10 + 5 + 10 + 5 + 3 + 5 + 3);
  });

  it('should complete game after the last frame', async () => {
    const gameMock = {
      id: '1',
      players: [{ id: 'p1', frames: [] }],
      currentPlayerIndex: 0,
      currentFrameIndex: 9,
      status: Status.IN_PROGRESS,
    };
    jest.spyOn(gameService, 'getGame').mockResolvedValue(gameMock as any);
    jest.spyOn(gameService, 'updateGame').mockImplementation();

    await gameService.rollBall('1', 10);
    expect(gameMock.status).toBe(Status.IN_PROGRESS);
  });

  it('should handle errors when rolling', async () => {
    jest
      .spyOn(gameService, 'getGame')
      .mockRejectedValue(new Error('Game not found'));
    await expect(gameService.rollBall('1', 5)).rejects.toThrow(
      'Failed to roll ball',
    );
  });
});
