import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { ResultResponse } from 'src/dtos/Response/ResultResponse.dto';
import { Account } from 'src/entitys/account.entity';
import { Repository } from 'typeorm';

@Injectable()
export class AccountService {
  constructor(
    @InjectRepository(Account)
    private readonly accountRepository: Repository<Account>,
  ) {}
  async getAllAccount(query): Promise<ResultResponse<AccountResponse[]>> {
    let accounts: Account[] = [];
    let totalItem = 0;
    const active = query.isActive;
    const block = query.isBlock;
    const email = query.email;

    const take = query.limit || 5;
    const page = query.page || 1;
    const skip = (page - 1) * take;

    const whereCondition: any = {};
    if (active !== undefined) whereCondition.isActive = active;
    if (block !== undefined) whereCondition.isBlock = block; // true and false
    if (email) whereCondition.email = email;

    [accounts, totalItem] = await this.accountRepository.findAndCount({
      relations: ['role'],
      where: whereCondition,
      take: take,
      skip: skip,
    });
    let accountResponses: AccountResponse[] = [];

    accounts.forEach((account) => {
      const accountResponse: AccountResponse = {
        id: account.id,
        fullName: account.fullName,
        email: account.email,
        isActive: account.isActive,
        isBlock: account.isBlock,
        role: { id: account.role.id, name: account.role.name },
      };
      accountResponses.push(accountResponse);
    });

    const totalPage = Math.ceil(totalItem / take);
    const resultResponse: ResultResponse<AccountResponse[]> = {
      success: true,
      message: 'get all account',
      data: accountResponses,
      totalItem: totalItem,
      totalPage: totalPage,
      limit: take,
      page: page,
    };
    return resultResponse;
  }

  async getAccount(id: number) {
    const account = await this.accountRepository.findOne({
      relations: ['role'],
      where: { id: id },
    });
    if (!account) {
      throw new BadRequestException(`account id:${id} not found`);
    }
    const accountResponse: AccountResponse = {
      id: account.id,
      fullName: account.fullName,
      email: account.email,
      isBlock: account.isBlock,
      isActive: account.isActive,
      role: {
        id: account.role.id,
        name: account.role.name,
      },
    };
    const resultResponse: ResultResponse<AccountResponse> = {
      message: 'get account',
      success: true,
      data: accountResponse,
    };
    return resultResponse;
  }
  async handleBlockAccount(id: number, block: boolean) {
    const account = await this.accountRepository.findOneBy({ id: id });
    if (!account) {
      throw new BadRequestException(`account id: ${id} not found`);
    }
    account.isBlock = block;
    const newAccount = await this.accountRepository.save(account);
    const accountResponse: AccountResponse = {
      id: newAccount.id,
      fullName: newAccount.fullName,
      email: newAccount.email,
      isActive: newAccount.isActive,
      isBlock: newAccount.isBlock,
      role: { id: newAccount.role.id, name: newAccount.role.name },
    };
    const resultResponse: ResultResponse<AccountResponse> = {
      message: 'block account',
      success: true,
      data: accountResponse,
    };
    return resultResponse;
  }
  async deleteAccount(id: number) {
    const account = await this.accountRepository.findOneBy({ id: id });
    if (!account) {
      throw new BadRequestException(`this account id:${id} not found`);
    }
    await this.accountRepository.remove(account);
  }
}