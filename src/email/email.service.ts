import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateEmailDto } from './dto/create-email.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Email } from './entities/email.entity';
import { Repository } from 'typeorm';
import { User } from 'src/auth/entities/user.entity';
import { isUUID } from 'class-validator';

@Injectable()
export class EmailService {

  constructor(
    @InjectRepository(Email)
    private readonly emailRepository: Repository<Email>,
  ){}
  
  async create(createEmailDto: CreateEmailDto, user: User) {
    
    const emailDetails = createEmailDto;
    try {
      if(user && emailDetails){
        const{ userEmail, info} = emailDetails
        if ( userEmail === user.email ){
          const email= this.emailRepository.create({
            email: info,
            user,
          });
          await this.emailRepository.save(email);
          return {...email};
        }
        else{
          throw new BadRequestException(`El email no coincide con el email del usuario`);
        }
      }
    } catch (error) {
        return error;
    }
  }

  async findAll(paginationDto) {
    const {limit= 10, offset= 0} = paginationDto;
    
    const emails = await this.emailRepository.find({
      take:limit,
      skip:offset,
    });

    emails.forEach(email => {
      if ( email.venta)
        delete email.user
    });
    return emails.map(email =>({
      ...email,
    }))

  }

  async findOne(term: string) {

    let emails: Email[];
    const queryBuilder = this.emailRepository.createQueryBuilder('email');

    if ( isUUID(term) ){
      emails = await queryBuilder.leftJoinAndSelect('email.user','user')
      .where(' email.id=:id  or user.id=:userId',{
        id: term,
        userId: term
      })
      .getMany();
    }
    else{
      emails = await queryBuilder.leftJoinAndSelect('email.user','user')
      .where(' UPPER(user.fullName)=:fullName ',{
        fullName: term.toUpperCase(),
      })
      .getMany();
    }
    if( !emails )
      throw new NotFoundException(`email with ${ term } not found`);

    return emails;
  }

  async findUserEmails(paginationDto, user) {

    let emails: Email[];
    const queryBuilder = this.emailRepository.createQueryBuilder('email');

    const {limit= 10, offset= 0} = paginationDto;
    
    emails = await queryBuilder.leftJoinAndSelect('email.user','user')
    .where(' user.id=:userId',{
      userId: user.id
    })
    .take(limit)
    .skip(offset)
    .getMany();

    if( emails.length === 0 )
      throw new NotFoundException(`Emails of user ${ user.fullName } not found`);
    return emails;
  }
  async remove(id: string) {
    const email = await this.findOne( id );
    await this.emailRepository.remove( email );
  }
}
