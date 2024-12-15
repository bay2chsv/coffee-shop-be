import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';

import { Account } from 'src/entitys/account.entity';
import { AccountRequest } from 'src/dtos/Request/accountRequest.dto';
import { ResultResponse } from 'src/dtos/Response/ResultResponse.dto';
import { AccountResponse } from 'src/dtos/Response/AccountResponse.dto';
import { Role } from 'src/roleConfig/role.enum';
import { ResponseFormatter } from 'src/utils/ResponseFormatter';

@Injectable()
export class AccountService {
  constructor(
    @InjectRepository(Account)
    private readonly accountRepository: Repository<Account>,
  ) {}

  async getAllAccount(query): Promise<ResultResponse<AccountResponse[]>> {
    const take = query.limit || 5;
    const page = query.page || 1;
    const skip = (page - 1) * take;

    const whereCondition: any = {};
    if (query.isBlock !== undefined) whereCondition.isBlock = query.isBlock;
    if (query.email) whereCondition.email = query.email;

    const [accounts, totalItem] = await this.accountRepository.findAndCount({
      where: whereCondition,
      take,
      skip,
    });
    const totalPage = Math.ceil(totalItem / take);

    const accountResponses = accounts.map((account) =>
      this.mapToAccountResponse(account),
    );

    return ResponseFormatter.formatResponse(
      true,
      'Fetched all accounts',
      accountResponses,
      {
        page,
        limit: take,
        totalItem,
        totalPage: totalPage,
      },
    );
  }

  // Get a Single Account
  async getAccount(id: number): Promise<ResultResponse<AccountResponse>> {
    const account = await this.accountRepository.findOne({ where: { id } });
    if (!account) {
      throw new BadRequestException(`Account with ID ${id} not found.`);
    }
    return ResponseFormatter.formatResponse(
      true,
      'Fetched account details',
      this.mapToAccountResponse(account),
    );
  }

  // Update Role
  async updateRoleAccount(
    id: number,
    roleId: Role,
  ): Promise<ResultResponse<AccountResponse>> {
    const account = await this.accountRepository.findOneBy({ id });
    if (!account) {
      throw new BadRequestException(`Account with ID ${id} not found.`);
    }
    account.role = roleId;
    const newAccount = await this.accountRepository.save(account);
    return ResponseFormatter.formatResponse(
      true,
      'Role updated successfully',
      newAccount,
    );
  }

  async handleBlockAccount(
    id: number,
    block: boolean,
  ): Promise<ResultResponse<string>> {
    const account = await this.accountRepository.findOneBy({ id });
    if (!account) {
      throw new BadRequestException(`Account with ID ${id} not found.`);
    }
    account.isBlock = block;
    await this.accountRepository.save(account);
    return ResponseFormatter.formatResponse(
      true,
      block ? 'Account blocked successfully' : 'Account unblocked successfully',
    );
  }

  // Create Account
  async createAccount(
    accountRequest: AccountRequest,
  ): Promise<ResultResponse<AccountResponse>> {
    const existingAccount = await this.accountRepository.findOne({
      where: { email: accountRequest.email },
    });
    if (existingAccount) {
      throw new BadRequestException('Email is already in use.');
    }

    const hashedPassword = await bcrypt.hash(accountRequest.password, 10);
    const newAccount = this.accountRepository.create({
      ...accountRequest,
      password: hashedPassword,
    });

    const savedAccount = await this.accountRepository.save(newAccount);
    return ResponseFormatter.formatResponse(
      true,
      'Account created successfully',
      this.mapToAccountResponse(savedAccount),
    );
  }
  async deleteAccount(id: number): Promise<ResultResponse<string>> {
    const account = await this.accountRepository.findOneBy({ id });
    if (!account) {
      throw new BadRequestException(`Account with ID ${id} not found.`);
    }
    await this.accountRepository.remove(account);
    return ResponseFormatter.formatResponse(
      true,
      'Account deleted successfully',
    );
  }
  private mapToAccountResponse(account: Account): AccountResponse {
    return {
      id: account.id,
      fullName: account.fullName,
      email: account.email,
      isActive: account.isActive,
      isBlock: account.isBlock,
      role: account.role,
    };
  }
}
