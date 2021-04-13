'use strict';

import mongoose from 'mongoose';

mongoose.connect('mongodb://127.0.0.1:27017/im', {
  useNewUrlParser: true,
  useCreateIndex: true,
  useUnifiedTopology: true
});

mongoose.Promise = global.Promise;

export default mongoose;