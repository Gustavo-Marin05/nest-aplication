import { PartialType } from '@nestjs/mapped-types';
import { RegisterUserDto } from './create-auth.dto';


export class UpdateTaskDto extends PartialType(RegisterUserDto) {
    
}
