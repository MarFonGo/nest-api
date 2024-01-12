
export const fileNamer = (req: Express.Request, file: Express.Multer.File, callback: Function) =>{

    if ( !file ) return callback (new Error('File is empty'), false);
    
    
    const fileName=file.originalname
     
    callback(null, fileName);
}