import { Body, Controller, Delete, Get, HttpCode, Param, Post, Put, Query } from "@nestjs/common";
import { ClientsService } from "./clients.service";
import { CreateClientDto } from "./dto/create-client.dto";
import { CreateTransactionDto } from "./dto/create-transaction.dto";
import { QueryClientsDto } from "./dto/query-client.dto";
import { UpdateClientDto } from "./dto/update-client.dto";


@Controller('clientes')
export class ClientsController {
    constructor(private readonly clientsService: ClientsService) { }

    @Get()
    findAll(@Query() query: QueryClientsDto) {
        return this.clientsService.findAll(query)
    }

    @Get(':id')
    findUnique(@Param('id') id: string) {
        return this.clientsService.findUnique(id)
    }

    @Post()
    create(@Body() createClientDto: CreateClientDto) {
        return this.clientsService.create(createClientDto)
    }

    @Put(':id')
    update(@Param('id') id: string, @Body() updateClientDto: UpdateClientDto) {
        return this.clientsService.update(id, updateClientDto)
    }

    @Delete(':id')
    delete(@Param('id') id: string) {
        return this.clientsService.delete(id)
    }

    @Post(':id/transacoes')
    @HttpCode(200)
    createTransaction(@Param('id') id: string, @Body() createTransactionDto: CreateTransactionDto) {
        return this.clientsService.createTransaction(id, createTransactionDto)
    }

    @Get(':id/extrato')
    findAllClientTransactions(@Param('id') id: string) {
        return this.clientsService.findAllClientTransactions(id)
    }
}