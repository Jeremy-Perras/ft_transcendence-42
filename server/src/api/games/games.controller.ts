import { Controller, Get } from "@nestjs/common";
import { GamesService } from "./games.service";

@Controller("api/games")
export class GamesController {
  constructor(private readonly gamesService: GamesService) {}

  @Get("modes")
  gameModes() {
    return this.gamesService.getGameModes();
  }
}
