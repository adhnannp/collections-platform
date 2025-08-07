export const TYPES = {
    // Repository
    PaymentRepository: Symbol.for('PaymentRepository'),
    AccountRepository: Symbol.for('AccountRepository'),
    ActivityRepository: Symbol.for('ActivityRepository'),
    UserRepository: Symbol.for('UserRepository'),

    //service
    PaymentService: Symbol.for('PaymentService'),
    AccountService: Symbol.for('AccountService'),
    ActivityService: Symbol.for('ActivityService'),
    AuthService: Symbol.for('AuthService'),

    //controller
    PaymentController: Symbol.for('PaymentController'),
    AccountController: Symbol.for('AccountController'),
    ActivityController: Symbol.for('ActivityController'),
    AuthController: Symbol.for('AuthController'),
    SocketController: Symbol.for('SocketController'),

    //middleware
    AuthMiddleware: Symbol.for('AuthMiddleware'),

}