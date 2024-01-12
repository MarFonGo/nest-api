import { ExecutionContext, InternalServerErrorException, createParamDecorator } from "@nestjs/common";


export const GetUserIfExist = createParamDecorator(
  (data, ctx:ExecutionContext) =>{
    
    const req = ctx.switchToHttp().getRequest();
    const user = req.user;
    if ( !user )
      return null
    return ( !data )
      ?user
      : data.map(data => user[data])
  }  
);