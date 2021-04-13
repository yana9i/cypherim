import db from '../util/database.js'

const friendshipSchema = new db.Schema({
  userHostId: {
    type: db.Schema.Types.ObjectId,
    ref: 'users',
  },
  userFriendId: {
    type: db.Schema.Types.ObjectId,
    ref: 'users',
  },
  nickname: {
    type: String
  },
  pending: {
    type: Boolean,
    default: true
  },
  createDate: {
    type: Date,
    default: Date.now
  }
})

friendshipSchema.statics = {
  findFriendByHostUserId: async function (userId, cb) {
    return await this
      .find({ userHostId: userId, pending: false })
      .select('userFriendId nickname pending')
      .populate({ path: 'userFriendId', select: 'username _id avatar' })
      .map(items => items.map(item => {
        return {
          username: item.userFriendId.username,
          _id: item.userFriendId._id,
          nickname: item.nickname,
          avatar: item.userFriendId.avatar
        }
      })
      )
      .exec(cb);
  }
}

const friendship = db.model('friendships', friendshipSchema);

export default friendship;