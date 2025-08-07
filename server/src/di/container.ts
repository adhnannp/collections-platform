import { Container } from "inversify";
import { IPaymentRepository } from "../core/interface/repository/Ipayment.repository";
import { TYPES } from "./types";
import { PaymentRepository } from "../repository/payment.repository";
import { IPaymentService } from "../core/interface/service/Ipayment.service";
import { IPaymentController } from "../core/interface/controller/Ipayment.controller";
import { PaymentController } from "../controller/payment.controller";
import { PaymentService } from "../service/payment.service";
import { IUserRepository } from "../core/interface/repository/Iuser.repository";
import { UserRepository } from "../repository/user.repository";
import { IAuthService } from "../core/interface/service/Iauth.service";
import { AuthService } from "../service/auth.service";
import { IAuthController } from "../core/interface/controller/Iauth.controller";
import { AuthController } from "../controller/auth.controller";
import { IAuthMiddleware } from "../core/interface/middleware/Iauth.middleware";
import AuthMiddleware from "../middleware/auth.middleware";
import { SocketHandler } from "../controller/socket.controller";
import { ISocketHandler } from "../core/interface/controller/Isocket.controller";

export const container = new Container();

//repository
container.bind<IPaymentRepository>(TYPES.PaymentRepository).to(PaymentRepository);
container.bind<IUserRepository>(TYPES.UserRepository).to(UserRepository);

//service
container.bind<IPaymentService>(TYPES.PaymentService).to(PaymentService);
container.bind<IAuthService>(TYPES.AuthService).to(AuthService);


//controller
container.bind<IPaymentController>(TYPES.PaymentController).to(PaymentController);
container.bind<IAuthController>(TYPES.AuthController).to(AuthController);
container.bind<ISocketHandler>(TYPES.SocketController).to(SocketHandler);

//middleware
container.bind<IAuthMiddleware>(TYPES.AuthMiddleware).to(AuthMiddleware)
