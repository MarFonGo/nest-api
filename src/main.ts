import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe, Logger } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { DataSource } from 'typeorm';


async function createPartitions(dataSource: DataSource) {

  try {
    const queryRunner = dataSource.createQueryRunner();
    const tags = ['perfumes', 'comida', 'tech', 'ropa', 'calzados'];

    await dataSource.query(`
      
      DO $$
      BEGIN
      IF NOT EXISTS (SELECT * 
      FROM pg_partitioned_table 
      WHERE partrelid = 'products_combinations'::regclass) THEN
          DROP TABLE products_combinations;
      END IF;
      END$$;

      CREATE TABLE products_combinations (
        id serial,
        name1 text,
        tag1 text,
        name2 text,
        tag2 text, 
        cantidad integer default 0,
      PRIMARY KEY (id, tag1)
      ) PARTITION BY LIST (tag1);

      CREATE TABLE nuevos_elementos_temp(
        slug text,
        tag text);

      CREATE OR REPLACE FUNCTION insertar_en_tabla()
      RETURNS TRIGGER AS $$
      BEGIN
      WITH combinaciones AS (
                SELECT p1.slug AS name1, p1.tag AS tag1, p2.slug AS name2, p2.tag AS tag2
                FROM nuevos_elementos_temp p1
                JOIN product p2 ON p1.slug <> p2.slug
              )
          INSERT INTO products_combinations (name1, tag1, name2, tag2)
          SELECT name1, tag1, name2, tag2
          FROM combinaciones;
          DELETE FROM nuevos_elementos_temp;
      RETURN NEW;
      END;
      $$ LANGUAGE plpgsql;

      CREATE OR REPLACE FUNCTION combinar_elementos()
      RETURNS TRIGGER AS $$
      DECLARE
        nuevos_elementos text[];
      DECLARE slug_val text;
      DECLARE tag_val text;
      BEGIN nuevos_elementos := ARRAY[NEW.slug, NEW.tag];
      For i IN 1..array_length(nuevos_elementos, 1)/2 LOOP
      slug_val := nuevos_elementos[i];
      tag_val := nuevos_elementos[2*i];
      INSERT INTO  nuevos_elementos_temp(slug, tag) 
      VALUES (slug_val, tag_val);
      END LOOP;      
      RETURN NEW;
      END;
      $$ LANGUAGE plpgsql;

      CREATE TRIGGER insert_product_trigger
      BEFORE INSERT ON product
      FOR EACH ROW
      EXECUTE FUNCTION combinar_elementos();

      CREATE TRIGGER insert_table_trigger
      AFTER INSERT ON product
      FOR EACH ROW
      EXECUTE FUNCTION insertar_en_tabla();
      
      CREATE INDEX name_index ON products_combinations (name1, name2);

      CREATE OR REPLACE FUNCTION verificar_y_agregar()
      RETURNS TRIGGER AS $$
      BEGIN
          IF NOT EXISTS (SELECT 1 FROM tag WHERE subtag = NEW.subtag) THEN
              INSERT INTO tag(tag, subtag) VALUES (NEW.tag, NEW.subtag);
          END IF;
          RETURN NEW;
      END;
      $$ LANGUAGE plpgsql;

      CREATE TRIGGER trigger_verifica_y_agrega
      AFTER INSERT ON product
      FOR EACH ROW
      EXECUTE FUNCTION verificar_y_agregar();

      CREATE OR REPLACE FUNCTION agregar_slug()
      RETURNS TRIGGER AS $$
      BEGIN
          IF NEW.slug IS NULL THEN
              NEW.subtag = TRIM(NEW.subtag);
              NEW.slug = REPLACE(LOWER(TRIM(NEW.subtag)), ' ', '_');
              NEW.slug = REPLACE(NEW.slug, '''', '');
          ELSE
              NEW.slug = REPLACE(LOWER(TRIM(NEW.slug)), ' ', '_');
              NEW.slug = REPLACE(NEW.slug, '''', '');
          END IF;
          RETURN NEW;
      END;
      $$ LANGUAGE plpgsql;

      CREATE TRIGGER trigger_agrega_slug
      BEFORE INSERT ON tag
      FOR EACH ROW
      EXECUTE FUNCTION agregar_slug();
    `);
    for (const tag of tags) {
      await dataSource.query(`CREATE TABLE ${tag} PARTITION OF products_combinations FOR VALUES IN ('${tag}');`);
    } 
  } catch (error) {
      console.log("Error")
  }
}

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors();
  const dataSource = app.get(DataSource);
  await createPartitions(dataSource);
  await dataSource.synchronize();
  const logger = new Logger('Boostrap');
  app.enableCors();
  app.useGlobalPipes(
    new ValidationPipe(
    {
      whitelist: true,
      forbidNonWhitelisted: true,
    })
  );
  const config = new DocumentBuilder()
  .setTitle('E-commerce page web')
  .setDescription('E-commerce store')
  .setVersion('1.0')
  .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);
  await app.listen(+process.env.PORT);
  logger.log(`App running on port ${+process.env.PORT}`);
}
bootstrap();
