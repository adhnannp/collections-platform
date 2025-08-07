import { UserDTO } from "../../dto/user.dto";

export interface IAuthService {
  register(email: string, password: string, role: string): Promise<UserDTO>;
  login(email: string, password: string): Promise<string>;
  verifyToken(token: string): Promise<UserDTO>;
}