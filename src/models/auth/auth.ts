import { JwtPayload } from 'jsonwebtoken';


export interface ApiJwtPayload extends JwtPayload {
    userId: string;
    email: string;
}