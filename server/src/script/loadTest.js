module.exports = {
  generateRandomData: (userContext, _, done) => {
    const random = Math.floor(Math.random() * 1000000);
    userContext.vars.email = `test${random}@example.com`;
    userContext.vars.password = 'password123';
    done();
  },
};
