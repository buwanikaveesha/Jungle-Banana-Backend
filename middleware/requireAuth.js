import jwt from 'jsonwebtoken';

const requireAuth = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(" ")[1];

    if (!token) {  
        return res.status(401).json({ message: "No token provided" });
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, decodedToken) => {
        if (err) {
            return res.status(403).json({ error: "Invalid token" });
        }
        req.user = decodedToken;  
        next();
    });
};

export default requireAuth;
