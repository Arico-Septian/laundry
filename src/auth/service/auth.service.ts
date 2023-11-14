import { Injectable, NotAcceptableException, NotFoundException, UnprocessableEntityException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/users/entities/user.entity';
import { Repository } from 'typeorm';
import * as bcrypt from "bcrypt";
import { RegistrasiDto } from '../dto/registrasi.dto';
import { LoginAuhDTO } from '../dto/login-auth.dto';
import { UpdateAuthDto } from '../dto/update-auth.dto';

@Injectable()
export class AuthService {
  constructor(@InjectRepository(User) private userRepository: Repository<User>) {}

  async create(body: RegistrasiDto) {
    try {
      const hashPassword = await bcrypt.hash(body.password, 15)

      const user = this.userRepository.create({ 
        username: body.username, 
        nomor_handphone: body.nomor_handphone,
        email: body.email, 
        password:hashPassword, 
        nama_bank:body.nama_bank,
        nomor_rekening:body.nomor_rekening,
        role: body.role 
      })
      await this.userRepository.save(user)

      return user

    } catch (error) {

      if(error.message.includes('@gmail.com'))
        throw new UnprocessableEntityException('Email already exists')

      throw new UnprocessableEntityException('Username already exists')
    }
  }

  async login(body: LoginAuhDTO) {
    const user =
      await this.userRepository.findOneBy({ username: body.username })

    if(!user)
      throw new NotFoundException(`User ${body.username} not found`);

    const passwordMatch = await bcrypt.compare(body.password, user.password)

    if(!passwordMatch)
      throw new NotAcceptableException('password error');

    return user
  }

  async findAll(): Promise<User[] | null> {
    const order = await this.userRepository.find()
    return order;
  }

  async findOne(userid: string): Promise<User[] | null> {
    try {
      const user = await this.userRepository.findBy({
        userid
      })

      return user;

    } catch (error) {
      console.log(error.message)
    }
  }

  async update(userid: string, body: UpdateAuthDto): Promise<User> {
    try {
      const user = await this.userRepository.findOneBy({ userid })

      Object.assign(user, body)

      await this.userRepository.save(user)

      return user;

    } catch (error) {
      console.log(error)
    }
  }

  async remove(userid: string) {
    await this.userRepository.delete(userid)
    return `This action removes a #${userid} user`;
  }
}
