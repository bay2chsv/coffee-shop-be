import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { AccountRequest } from 'src/dtos/Request/accountRequest.dto';
import { AuthRequest } from 'src/dtos/Request/authRequest.dto';
import { ResultResponse } from 'src/dtos/Response/ResultResponse.dto';
import { Account } from 'src/entitys/account.entity';
import { Role } from 'src/entitys/role.entity';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { ProfileRequest } from 'src/dtos/Request/profileRequest.dto';
import { ProfileResponse } from 'src/dtos/Response/profileResponse.dto';
@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(Account)
    private readonly accountRepository: Repository<Account>,
    @InjectRepository(Role) private readonly roleRepository: Repository<Role>,
    private jwtService: JwtService,
  ) {}

  async signIn(authRequest: AuthRequest) {
    const account = await this.accountRepository.findOne({
      relations: ['role'],
      where: { email: authRequest.email },
    });
    if (!account)
      throw new BadRequestException(`Login failed email or password incorrect`);

    if (account.isBlock) throw new BadRequestException(`Account is blocked`);

    const isMatch = await bcrypt.compare(
      authRequest.password,
      account.password,
    );
    if (!isMatch) throw new BadRequestException('password incorrect');

    const payload = {
      info: {
        id: account.id,
        email: account.email,
        fullName: account.fullName,
        role: account.role.name,
      },
    };
    account.isActive = true;
    await this.accountRepository.save(account); //generate token

    const token = await this.jwtService.signAsync(payload); 

    const resultResponse: ResultResponse<any> = {
      message: 'Login successfully',
      success: true,
      data: { accessToken: token },
    };
    return resultResponse;
  }

  async signUp(accountRequest: AccountRequest) {
    const deafault = { id: 4, name: 'user' };
    const role = await this.roleRepository.findOneBy(deafault);
    if (!role) {
      throw new BadRequestException('role not found');
    }
    const hash = await bcrypt.hash(accountRequest.password, 10);
    const Account = this.accountRepository.create({
      email: accountRequest.email,
      fullName: accountRequest.fullName,
      password: hash,
      role: role,
    });
    const newAccount = await this.accountRepository.save(Account);
    const resultResponse: ResultResponse<Account> = {
      success: true,
      message: 'Account created successfully',
      data: newAccount,
    };
    return resultResponse;
  }

  async logOut(user) {
    const { id, email } = user.info;
    const account = await this.accountRepository.findOneBy({ email: email });
    if (!account) throw new BadRequestException(`email not found`);
    account.isActive = false;
    await this.accountRepository.save(account);

    const resultResponse: ResultResponse<string> = {
      message: 'logout successfully',
      success: true,
    };
    return resultResponse;
  }

  async updateProfile(user, profileRequest: ProfileRequest) {
    const { id, email, fullName } = user.info;
    if (
      email === profileRequest.email &&
      fullName === profileRequest.fullName
    ) {
      throw new BadRequestException(
        `are you sure you change something? it's all look same`,
      );
    }
    const account = await this.accountRepository.findOneBy({ id: id });
    if (!account) throw new BadRequestException('account not found');
    account.email = profileRequest.email;
    account.fullName = profileRequest.fullName;
    const updateAccount = await this.accountRepository.save(account);
    const profileResponse: ProfileResponse = {
      email: updateAccount.email,
      fullName: updateAccount.fullName,
    };
    const resultResponse: ResultResponse<ProfileResponse> = {
      success: true,
      message: 'get profile ',
      data: profileResponse,
    };
    return resultResponse;
  }

  async getProfile(user) {
    const { id } = user.info;
    const account = await this.accountRepository.findOneBy({ id: id });
    if (!account) throw new BadRequestException(`account not found`);
    const profileResponse: ProfileResponse = {
      email: account.email,
      fullName: account.fullName,
    };
    const resultResponse: ResultResponse<ProfileResponse> = {
      success: true,
      message: 'get profile ',
      data: profileResponse,
    };
    return resultResponse;
  }

  async changePasswordProfile(user, profileRequest: ProfileRequest) {
    const { id } = user.info;
    const { oldPassword, newPassword } = profileRequest;
    const account = await this.accountRepository.findOneBy({ id: id });
    const isMatch = await bcrypt.compare(oldPassword, account.password);
    if (!isMatch) throw new BadRequestException('Old password incorrect');
    const hash = await bcrypt.hash(newPassword, 10);
    account.password = hash;
    await this.accountRepository.save(account);
    const resultResponse: ResultResponse<string> = {
      success: true,
      message: 'changed password successfully',
    };
    return resultResponse;
  }
}
