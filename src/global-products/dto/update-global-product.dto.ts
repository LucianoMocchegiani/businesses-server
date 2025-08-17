import { PartialType } from '@nestjs/swagger';
import { CreateGlobalProductDto } from './create-global-product.dto';

export class UpdateGlobalProductDto extends PartialType(CreateGlobalProductDto) {}
