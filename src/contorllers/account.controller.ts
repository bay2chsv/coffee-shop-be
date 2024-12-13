import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseBoolPipe,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { AuthGuard } from 'src/guards/auth.guard';
import { Roles } from 'src/roleConfig/roles.decorator';
import { Role } from 'src/roleConfig/role.enum';
import { RolesGuard } from 'src/guards/roles.guard';
import { AccountService } from 'src/services/account.service';
import { AccountRequest } from 'src/dtos/Request/accountRequest.dto';

@Controller('api/v1')
export class AccountController {
  constructor(private readonly accountService: AccountService) {}

  @Roles(Role.Admin)
  @UseGuards(AuthGuard, RolesGuard)
  @Get('/accounts')
  @UsePipes(new ValidationPipe({ transform: true }))
  getAllAccount(
    @Query('limit') limit: number,
    @Query('page') page: number,
    @Query('block') isBlock: boolean,
    @Query('email') email: string,
  ) {
    return this.accountService.getAllAccount({
      limit,
      page,
      isBlock,
      email,
    });
  }

  @Roles(Role.Admin)
  @UseGuards(AuthGuard, RolesGuard)
  @Get('/accounts/:id')
  getAccount(@Param('id', ParseIntPipe) id: number) {
    return this.accountService.getAccount(id);
  }

  @Roles(Role.Admin)
  @UseGuards(AuthGuard, RolesGuard)
  @Post('/accounts')
  createAccount(@Body() accountRequest: AccountRequest) {
    return this.accountService.createAccount(accountRequest);
  }

  @Roles(Role.Admin)
  @UseGuards(AuthGuard, RolesGuard)
  @Patch('/accounts/block/:id')
  handleBlockAccount(
    @Param('id', ParseIntPipe) id: number,
    @Query('block', ParseBoolPipe) block: boolean,
  ) {
    return this.accountService.handleBlockAccount(id, block);
  }

  @Roles(Role.Admin)
  @UseGuards(AuthGuard, RolesGuard)
  @Patch('/accounts/update-role/:id')
  updateRoleAccount(
    @Param('id', ParseIntPipe) id: number,
    @Query('roleid') roleId: Role,
  ) {
    return this.accountService.updateRoleAccount(id, roleId);
  }

  @Roles(Role.Admin)
  @UseGuards(AuthGuard, RolesGuard)
  @Delete('/accounts/:id')
  deleteAccount(@Param('id', ParseIntPipe) id: number) {
    return this.accountService.deleteAccount(id);
  }
}
