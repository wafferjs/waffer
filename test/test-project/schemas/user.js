module.exports = {
  schema: {
    name:     { type: String, required: true, index: { unique: true } },
    password: { type: String, required: true },
  },
  hooks: {
    pre: {
      save: function (next) {
        console.log('saving:', this);
        return next();
      },
    },

    method: {
      verify: function (passwd, next) {
        next(null, passwd === 'P4$$\/\/|d');
    },
  },
}
