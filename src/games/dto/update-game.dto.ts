import { PartialType } from '@nestjs/mapped-types';
import { CreateGameDto } from './create-game.dto';
import { Status } from '@prisma/client';

export class UpdateGameDto extends PartialType(CreateGameDto) {
  status: Status;
}
