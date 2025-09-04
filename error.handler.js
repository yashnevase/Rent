//Declaration 

var errorhandler = {} ;

errorhandler.clientErrorHandler = (err,req,res,next) => {
    let payload = { error :  "ERROR:REFERENCE ERROR or SYNTAX ERROR" } 
    if(req.xhr){
        payload = { error :  "ERROR:XHR" } 
        res.status(400).send(payload);
    }else{
        res.status(500).send(payload);
        next(err);
    }
}

errorhandler.notfoundErrorHandler = (req,res,next) =>{
   try {
        let payload = { error :  "Error : url not found" } 
        res.status(404).send(payload);
        next();
   } catch (error) {
       console.log(error);
   }
}
module.exports = errorhandler;
