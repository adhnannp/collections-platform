module.exports = {
  generateRandomData: (userContext, events, done) => {
    userContext.vars.email = `test${Math.random()}@example.com`;
    return done();
  },
};
