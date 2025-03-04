import { Player } from '@prisma/client';

export class CreateGameDto {
  players: Player[];
}
