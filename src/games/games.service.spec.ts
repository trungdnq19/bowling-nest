import { Test, TestingModule } from '@nestjs/testing';
import { GamesService } from './games.service';
import { PrismaService } from '../prisma.service';
import { Status, Game, Frame, FrameType, Player } from '@prisma/client';

describe('GamesService', () => {
  let gamesService: GamesService;
  let prismaService: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GamesService,
        {
          provide: PrismaService,
          useValue: {
            game: {
              create: jest.fn(),
              findUnique: jest.fn(),
              update: jest.fn(),
            },
            player: {
              findUnique: jest.fn(),
              update: jest.fn(),
            },
            frame: {
              update: jest.fn(),
            },
          },
        },
      ],
    }).compile();

    gamesService = module.get<GamesService>(GamesService);
    prismaService = module.get<PrismaService>(PrismaService);
  });
  describe('CreateGame test', () => {
    it('should create a game', async () => {
      jest.spyOn(prismaService.game, 'create').mockResolvedValue({
        id: '1',
        date: new Date(),
        players: [],
        currentPlayerIndex: 0,
        currentFrameIndex: 0,
        currentRollIndex: 0,
        status: Status.IN_PROGRESS,
      } as Game);
      const game = await gamesService.createGame(['Trung', 'Nhu']);
      expect(game).toBeDefined();
    });

    it('should throw an error if game creation fails', async () => {
      const mockPlayers = ['Alice', 'Bob'];
      const mockError = new Error('Database error');

      // Ensure Prisma's create method rejects with an error
      jest.spyOn(prismaService.game, 'create').mockRejectedValue(mockError);

      // Expect createGame to properly throw the error
      await expect(gamesService.createGame(mockPlayers)).rejects.toThrow(
        'Database error',
      );
    });
  });

  describe('getGame', () => {
    it('should return a game if found', async () => {
      const mockGame: Game = {
        id: 'game-123',
        date: new Date(),
        currentPlayerIndex: 0,
        currentFrameIndex: 0,
        currentRollIndex: 0,
        status: Status.IN_PROGRESS,
      };

      (prismaService.game.findUnique as jest.Mock).mockResolvedValue(mockGame);

      const result = await gamesService.getGame('game-123');
      expect(result).toEqual(mockGame);
    });

    it('should throw NotFoundException if game not found', async () => {
      (prismaService.game.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(gamesService.getGame('game-123')).rejects.toThrow(
        new Error('Failed to fetch game: Game not found'),
      );
    });
  });

  describe('advanceTurn', () => {
    it('should complete the game if last player plays last frame', async () => {
      const mockGame = {
        id: '1',
        date: new Date(),
        currentPlayerIndex: 1,
        currentFrameIndex: 9,
        players: [{}, {}],
        currentRollIndex: 0,
        status: Status.IN_PROGRESS,
      } as Game;

      jest.spyOn(gamesService, 'updateGame').mockResolvedValue(mockGame);

      await gamesService.advanceTurn(mockGame);

      expect(mockGame.status).toBe(Status.COMPLETED);
      expect(gamesService['updateGame']).toHaveBeenCalledWith(mockGame.id, {
        currentPlayerIndex: mockGame.currentPlayerIndex,
        currentFrameIndex: mockGame.currentFrameIndex,
        status: Status.COMPLETED,
      });
    });

    it('should move to the next frame and reset player index if last player of the frame', async () => {
      const mockGame = {
        id: '1',
        currentPlayerIndex: 1,
        currentFrameIndex: 0,
        players: [{}, {}],
        status: Status.IN_PROGRESS,
      } as unknown as Game;

      jest.spyOn(gamesService, 'updateGame').mockResolvedValue(mockGame);

      await gamesService.advanceTurn(mockGame);

      expect(mockGame.currentFrameIndex).toBe(1);
      expect(mockGame.currentPlayerIndex).toBe(0);
      expect(gamesService['updateGame']).toHaveBeenCalledWith(mockGame.id, {
        currentPlayerIndex: 0,
        currentFrameIndex: 1,
        status: mockGame.status,
      });
    });

    it('should move to the next player if not the last player', async () => {
      const mockGame = {
        id: '1',
        currentPlayerIndex: 0,
        currentFrameIndex: 0,
        players: [{}, {}],
        status: Status.IN_PROGRESS,
      } as unknown as Game;

      jest.spyOn(gamesService, 'updateGame').mockResolvedValue(mockGame);

      await gamesService.advanceTurn(mockGame);

      expect(mockGame.currentPlayerIndex).toBe(1);
      expect(gamesService['updateGame']).toHaveBeenCalledWith(mockGame.id, {
        currentPlayerIndex: 1,
        currentFrameIndex: 0,
        status: mockGame.status,
      });
    });
  });

  describe('calculateScore', () => {
    it('should correctly calculate the total score', () => {
      const mockFrames: Frame[] = [
        {
          id: '1',
          frameNo: 1,
          rolls: [10],
          score: 10,
          type: FrameType.STRIKE,
          playerId: 'p1',
        },
        {
          id: '2',
          frameNo: 2,
          rolls: [5, 3],
          score: 8,
          type: FrameType.OPEN,
          playerId: 'p1',
        },
        {
          id: '3',
          frameNo: 3,
          rolls: [7, 3],
          score: 10,
          type: FrameType.SPARE,
          playerId: 'p1',
        },
        {
          id: '4',
          frameNo: 4,
          rolls: [6, 2],
          score: 8,
          type: FrameType.OPEN,
          playerId: 'p1',
        },
      ];

      const score = gamesService['calculateScore'](mockFrames);
      expect(score).toBe(10 + 5 + 3 + 8 + 7 + 3 + 6 + 6 + 2); //50
    });
  });

  describe('updatePlayerScore', () => {
    it('should update the player score', async () => {
      const mockPlayer: Player = {
        id: 'player1',
        name: 'Player 1',
        score: 0,
        gameId: 'game1',
        playerOrder: 1,
        frames: [
          { frameNo: 1, rolls: [10], score: 10, type: FrameType.STRIKE },
          { frameNo: 2, rolls: [5, 5], score: 10, type: FrameType.SPARE },
          { frameNo: 3, rolls: [3, 4], score: 7, type: FrameType.OPEN },
        ],
      } as Player;

      jest
        .spyOn(prismaService.player, 'findUnique')
        .mockResolvedValue(mockPlayer);
      jest.spyOn(prismaService.player, 'update').mockResolvedValue(mockPlayer);

      await gamesService.updatePlayerScore('player1');

      expect(prismaService.player['update']).toHaveBeenCalledWith({
        where: { id: 'player1' },
        data: { score: 10 + 10 + +10 + 6 + 4 },
      });
    });

    it('should throw a NotFoundException if player is not found', async () => {
      jest.spyOn(prismaService.player, 'findUnique').mockResolvedValue(null);

      await expect(gamesService.updatePlayerScore('player1')).rejects.toThrow(
        Error('Failed to update player score Player not found'),
      );
    });
  });

  describe('updateGame', () => {
    it('should update the game', async () => {
      const mockGame: Game = {
        id: 'game-123',
        date: new Date(),
        currentPlayerIndex: 0,
        currentFrameIndex: 0,
        currentRollIndex: 0,
        status: Status.IN_PROGRESS,
      };
      jest.spyOn(prismaService.game, 'update').mockResolvedValue(mockGame);

      const result = await gamesService.updateGame('game-123', {
        currentPlayerIndex: 1,
        currentFrameIndex: 0,
        currentRollIndex: 0,
        status: Status.IN_PROGRESS,
      });

      expect(result).toEqual(mockGame);
      expect(prismaService.game['update']).toHaveBeenCalledWith({
        where: { id: 'game-123' },
        data: {
          currentPlayerIndex: 1,
          currentFrameIndex: 0,
          currentRollIndex: 0,
          status: Status.IN_PROGRESS,
        },
        include: { players: { include: { frames: true } } },
      });
    });
  });
});
