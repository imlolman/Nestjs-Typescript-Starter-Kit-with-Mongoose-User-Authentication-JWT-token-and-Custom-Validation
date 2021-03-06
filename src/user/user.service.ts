import { BadRequestException, Catch, ConsoleLogger, Injectable, NotFoundException, UnprocessableEntityException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Error, Model } from 'mongoose';
const bcrypt = require('bcrypt');
import { CreateUserDto } from './dto/create-user.dto';
import { UserDocument } from './schema/user.schema';
import { ConfigService } from '@nestjs/config';
import { User } from './entities/user.entity';
import { NotFoundError } from 'rxjs';

@Injectable()
export class UserService {
  constructor(@InjectModel('User') private userModel: Model<User>, private readonly configService: ConfigService){}

  async create(createUserDto: CreateUserDto): Promise<User> {
    try{
      const salt = bcrypt.genSaltSync(parseInt(this.configService.get('SALT_ROUNDS')))
      const encryptedPassword = bcrypt.hashSync(createUserDto.password, salt);
      createUserDto.password = encryptedPassword;
      const createdUser = new this.userModel(createUserDto);
      const user = await createdUser.save();
      const {password, __v, _id, ...rest} = user.toObject();
  
      return rest;
    }catch(error){
      throw new BadRequestException([error?.errors[Object.keys(error?.errors)[0]]?.message])
    }
  }

  async findOneWithUsername(username: string): Promise<any> {
    const user = await this.userModel.findOne({username: username}).exec();
    if(!user){
      throw new BadRequestException(['User not found.'])
    }
    return user.toObject();
  }

  async findOneWithId(id: string): Promise<any>  {
    const user = await this.userModel.findById(id).exec();
    if(!user){
      throw new BadRequestException(['User not found.'])
    }
    return user.toObject();
  }

  update(id: number, createUserDto: Partial<CreateUserDto>) {
    return `This action updates a #${id} user`;
  }

  remove(id: number) {
    return `This action removes a #${id} user`;
  }
}
