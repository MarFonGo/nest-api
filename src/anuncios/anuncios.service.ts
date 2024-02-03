import { BadRequestException, Injectable, InternalServerErrorException, Logger, NotFoundException } from '@nestjs/common';
import { CreateAnuncioDto } from './dto/create-anuncio.dto';
import { UpdateAnuncioDto } from './dto/update-anuncio.dto';
import { DataSource, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Anounce } from './entities/anuncio.entity';
import { AnounceMedia } from './entities/anounce-media.entity';
import { isUUID } from 'class-validator';

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
  }

  async findAll() {
    const anounces = await this.anounceRepository.find({
      relations: {
        medias: true,
      }
    });

    return anounces
  }

  async findOne(term: string) {
    
    let anounce: Anounce;
    
    if ( isUUID(term) ){
      anounce = await this.anounceRepository.findOneBy({ id:term });
    }else{
      const queryBuilder = this.anounceRepository.createQueryBuilder('anounce');

      anounce= await queryBuilder.where(' UPPER(title)=:title',{
        title: term.trim().toUpperCase(),
      })
      .leftJoinAndSelect('anounce.medias', 'anounceMedias')
      .getOne();
    }

    if( !anounce )
      throw new NotFoundException(`Anounce ${ term } not found`);
    
    return anounce;
  }

  async update(id: string, updateAnuncioDto: UpdateAnuncioDto) {
    
    const {images, videos, ...toUpdate}  = updateAnuncioDto;
    const medias = []; 
    let anuncio: Anounce;
    const anounce = await this.anounceRepository.preload({id, ...toUpdate, medias});
    if (!images || !videos){
      anuncio = await this.anounceRepository.findOneBy({id});
    } 
    if ( !anounce ) throw new NotFoundException(`Anounce with id: ${id} not found`);
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      if ( images ){
        await queryRunner.manager.delete( AnounceMedia, {anounce: { id } })
        if (!videos){
          const video = anuncio.medias[0].urlvideo
          anounce.medias = images.map(image => this.anounceMediaRepository.create({ urlimage: `${process.env.HOST_NAME}/files/anounces/${image}`, urlvideo: video  }))
        }
        else{
          anounce.medias = images.map(image => this.anounceMediaRepository.create({ urlimage: `${process.env.HOST_NAME}/files/anounces/${image}`, urlvideo: videos  }))
        }
        await queryRunner.manager.save( anounce );
        await queryRunner.commitTransaction();
        await queryRunner.release();
      }
      else{
        if ( videos ){
          await queryRunner.manager.delete( AnounceMedia, {anounce: { id } })
          let i: number;
          const cantMedias = anuncio.medias.length;
          for (i=0; i<cantMedias; i++){
            const image = anuncio.medias[i].urlimage
            anounce.medias.push(this.anounceMediaRepository.create({ urlimage: image, urlvideo: videos  }))
          }
          await queryRunner.manager.save( anounce );
          await queryRunner.commitTransaction();
          await queryRunner.release();
        }
      }
      
      return anounce;
      
    } catch (error) {
      await queryRunner.rollbackTransaction();
      await queryRunner.release();
      this.handleDBExceptions(error); 
    }
  }

  async remove(id: string) {
    const anounce = await this.findOne( id );
    await this.anounceRepository.remove( anounce );
    return 'DELETE COMPLETE';
  }

  private handleDBExceptions(error:any) {
    if ( error.code === '23505' )
      throw new BadRequestException(error.detail);

    this.logger.error(error)
      throw new InternalServerErrorException ( 'Unexpected error, check server logs' ) 
  }
}
