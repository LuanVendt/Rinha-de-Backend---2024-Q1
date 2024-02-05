import { Injectable } from "@nestjs/common";
import { PrismaService } from "src/database/prisma-service";
import { QueryClientsDto } from "../../dto/query-client.dto";
import { UpdateClientDto } from "../../dto/update-client.dto";
import { ClientEntity } from "../../entities/client.entity";
import { clientsRepository } from "../client.repository";

@Injectable()
export class PrismaClientsRepository implements clientsRepository {
    constructor(private prisma: PrismaService) { }

    async create(data: ClientEntity) {
        const client = await this.prisma.client.create({
            data: {
                nome: data.nome,
                limite: data.limite,
            }
        })

        return client
    }

    async findAll(query: QueryClientsDto) {
        let { page = 1, limit = 10, search = '' } = query;

        page = Number(page)
        limit = Number(limit)
        search = String(search);

        const skip = (page - 1) * limit;

        const total = await this.prisma.client.count({
            where: {
                OR: [
                    {
                        nome: {
                            contains: search,
                        },
                    },
                ]
            }
        })

        const users = await this.prisma.client.findMany({
            where: {
                OR: [
                    {
                        nome: {
                            contains: search,
                        },
                    },
                ],
            },
            skip,
            take: limit,
        })

        return {
            total,
            page,
            search,
            limit,
            pages: Math.ceil(total / limit),
            data: users
        }

    }

    async findUnique(id: string) {
        const client = await this.prisma.client.findUnique({
            where: {
                id,
            }
        })

        return client
    }

    async update(id: string, dataClient: UpdateClientDto) {
        const client = await this.prisma.client.update({
            where: {
                id,
            },
            data: {
                nome: dataClient.nome,
                limite: dataClient.limite,
            }
        })

        return client
    }

    async delete(id: string) {
        await this.prisma.transaction.deleteMany({
            where: {
                client_id: id,
            }
        })

        const client = await this.prisma.client.delete({
            where: {
                id,
            }
        })
    }
}