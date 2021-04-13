import db from '../util/database.js'

let users = db.model('users', {
  username: { type: String, unique: true, required: true },
  password: { type: String, required: true },
  avatar: { type: String },
  nickname: { type: String },
  signature: { type: String },
  signUpTime: { type: Date, default: Date.now },
  lastLoginTime: { type: Date }
})

export default users;