import { ApiProperty } from "@nestjs/swagger";
import { Venta } from "src/ventas/entities/venta.entity";
import { Product } from "src/products/entities/product.entity";

export class VentaInterface {
    @ApiProperty({ 
        type: Venta, 
    })
    venta: Venta;

    @ApiProperty({ 
        type: Product, 
    })
    producto: Product;

    @ApiProperty({ 
        description: 'Importe total de la venta',
        example: '2000'
    })
    importe_total: number;
  }