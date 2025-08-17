import { PartialType } from '@nestjs/swagger';
import { CreateInventoryPriceDto } from './create-inventory-price.dto';

export class UpdateInventoryPriceDto extends PartialType(CreateInventoryPriceDto) {}
