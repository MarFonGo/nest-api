import { BadRequestException, Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import { CreateAnuncioDto } from './dto/create-anuncio.dto';
import { UpdateAnuncioDto } from './dto/update-anuncio.dto';
import { DataSource, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Anounce } from './entities/anuncio.entity';
import { AnounceMedia } from './entities/anounce-media.entity';

@Injectable()
export class AnunciosService {

  private readonly logger= new Logger('AnouncesService')
  
  constructor(
    @InjectRepository(Anounce)
    private readonly anounceRepository: Repository<Anounce>,

    @InjectRepository(AnounceMedia)
    private readonly anounceMediaRepository: Repository<AnounceMedia>,

    private readonly dataSource: DataSource
  ){}
  async create(createAnuncioDto: CreateAnuncioDto) {
    const{ images=[], videos,...anounceDetails } = createAnuncioDto;
    const queryRunner = this.dataSource.createQueryRunner();
    const medias = {
      images,
      videos
    }
    await queryRunner.connect();
    await queryRunner.startTransaction();
    
    try {
      const anounce = this.anounceRepository.create({
        ...anounceDetails,
        medias: images.map( image =>
          this.anounceMediaRepository.create({ urlimage: `${process.env.HOST_NAME}/files/anounces/${image}`, urlvideo: videos }) )
      });      
      await queryRunner.manager.save( anounce );
      await queryRunner.commitTransaction();
      await queryRunner.startTransaction();
      return {...anounce, medias};
    } catch (error) {
      await queryRunner.rollbackTransaction();
      await queryRunner.release();
      this.handleDBExceptions(error);
    }
    
    return 'This action adds a new anuncio';
  }

  findAll() {
    return `This action returns all anuncios`;
  }

  findOne(id: number) {
    return `This action returns a #${id} anuncio`;
  }

  update(id: number, updateAnuncioDto: UpdateAnuncioDto) {
    return `This action updates a #${id} anuncio`;
  }

  remove(id: number) {
    return `This action removes a #${id} anuncio`;
  }

  private handleDBExceptions(error:any) {
    if ( error.code === '23505' )
      throw new BadRequestException(error.detail);

    this.logger.error(error)
      throw new InternalServerErrorException ( 'Unexpected error, check server logs' ) 
  }
}
