import jwt from "jsonwebtoken";

const verifyJWT = (req, res, next) => {
    try {
        const authHeader = req.headers.authorization || req.headers.Authorization
  
    if (!authHeader?.startsWith('Bearer ')) {
        return res.status(401).json({ message: 'Unauthorized' })
    }
  
    const token = authHeader.split(' ')[1]
    const isCustomAuth = token.length < 500;

    let decodeData;

    if (token && isCustomAuth) {
        decodeData = jwt.verify(
            token,
            process.env.ACCESS_TOKEN_SECRET,
        );
        req.userId = decodeData?.id;
    } else {
        decodeData = jwt.decode(token);

        req.userId = decodeData?.sub;
    }
    next();
    } catch (error) {
        console.log(error);
    }
    
  };
  
  export default verifyJWT;
  