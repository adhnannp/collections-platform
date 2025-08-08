import { UserDTO } from "../../dto/user.dto";

export interface IAuthService {
  register(email: string, password: string, role: string): Promise<UserDTO>;
  login(email: string, password: string): Promise<{accessToken:string,refreshToken:string}>;
  verifyToken(token: string): Promise<UserDTO>;
  refreshAccessToken(refreshToken: string): Promise<{newAccessToken:string,newRefreshToken:string}>;
  logout(userId:string):Promise<void>;
}