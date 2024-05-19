import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Patch,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import { AccountRequest } from 'src/dtos/Request/accountRequest.dto';
import { AuthRequest } from 'src/dtos/Request/authRequest.dto';
import { ProfileRequest } from 'src/dtos/Request/profileRequest.dto';
import { AuthGuard } from '../guards/auth.guard';
import { AuthService } from './auth.service';

@Controller('api/auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @HttpCode(HttpStatus.OK)
  @Post('/signin')
  signIn(@Body() authRequest: AuthRequest) {
    //passed
    return this.authService.signIn(authRequest);
  }

  @Post('/signup')
  signUp(@Body() accountRequest: AccountRequest) {
    //passed
    return this.authService.signUp(accountRequest);
  }

  @HttpCode(HttpStatus.OK)
  @UseGuards(AuthGuard) //if no accessToken => status 401
  @Post('/signout')
  signOut(@Request() req) {
    //passed
    return this.authService.signOut(req.user);
  }

  @UseGuards(AuthGuard) //if no accessToken => status 401
  @Get('/profile')
  getProfile(@Request() req) {
    //passed
    return this.authService.getProfile(req.user);
  }

  @UseGuards(AuthGuard)
  @Patch('/profile/update')
  updateProfile(@Request() req, @Body() profile: ProfileRequest) {
    return this.authService.updateProfile(req.user, profile);
  }

  @UseGuards(AuthGuard)
  @Patch('/profile/change-password')
  changePassword(@Request() req, @Body() profile: ProfileRequest) {
    return this.authService.changePasswordProfile(req.user, profile);
  }
}
