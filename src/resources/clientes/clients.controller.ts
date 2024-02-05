import { Body, Controller, Get, Post, Query } from "@nestjs/common";
import { ClientsService } from "./clients.service";
import { CreateClientDto } from "./dto/create-client.dto";
import { QueryClientsDto } from "./dto/query-client.dto";


@Controller('clientes')
export class ClientsController {
    constructor(private readonly clientsService: ClientsService) { }

    @Get()
    findAll(@Query() query: QueryClientsDto) {
        return this.clientsService.findAll(query)
    }

    @Post()
    create(@Body() createClientDto: CreateClientDto) {
        return this.clientsService.create(createClientDto)
    }
}