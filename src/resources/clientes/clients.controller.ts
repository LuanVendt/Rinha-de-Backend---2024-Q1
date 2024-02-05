import { Controller, Get, Query } from "@nestjs/common";
import { ClientsService } from "./clients.service";
import { QueryClientsDto } from "./dto/query-client.dto";


@Controller('clientes')
export class ClientsController {
    constructor(private readonly clientsService: ClientsService) { }

    @Get()
    findAll(@Query() query: QueryClientsDto) {
        return this.clientsService.findAll(query)
    }
}