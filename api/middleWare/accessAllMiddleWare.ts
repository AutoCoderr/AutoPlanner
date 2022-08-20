export default function accessAllMiddleWare() {
    return function (req,res,next) {
        req.all = true;
        next();
    }
}