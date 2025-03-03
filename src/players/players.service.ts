import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/prisma.service';
import { Prisma, Player } from '@prisma/client';

@Injectable()
export class PlayersService {
  constructor(private prisma: PrismaService) {}

  async create(data: Prisma.PlayerCreateInput): Promise<Player | null> {
    return this.prisma.player.create({ data });
  }
  async createMany(data: Prisma.PlayerCreateManyInput[]): Promise<Player[]> {
    return this.prisma.player.createManyAndReturn({ data });
  }

  findAll(): Promise<Player[]> {
    return this.prisma.player.findMany();
  }

  findOne(where: Prisma.PlayerWhereUniqueInput): Promise<Player | null> {
    return this.prisma.player.findUnique({ where });
  }

  async update(params: {
    where: Prisma.PlayerWhereUniqueInput;
    data: Prisma.PlayerUpdateInput;
  }) {
    const { where, data } = params;
    return this.prisma.player.update({ data, where });
  }

  remove(id: number) {
    return `This action removes a #${id} player`;
  }
}
