import { ApiProperty } from "@nestjs/swagger";
import { User } from "../entities/user.entity";

export class UserWithToken {
    @ApiProperty({ 
        type: User, 
    })
    user: User;

    @ApiProperty({
        example: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY1NGI2OTA3LWEyNmEtNGUwMS04ZGVjLTAyZDA3ZDMwYmJhMSIsImlhdCI6MTcwMTQxMTU5NCwiZXhwIjoxNzAxNDE4Nzk0fQ.qGqPdkVpHwUuj7E0jJgCM4iGPhzL-3mm0UAzg4MXHYg`,
        description: 'User Token',
    })
    token: string;
  }