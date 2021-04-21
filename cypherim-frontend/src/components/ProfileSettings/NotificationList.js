import { Button } from 'react-bootstrap'
import generateAvatarUrl from '../../util/generateAvatarUrl.js'
import socket from '../../util/socket.js';
import { ioEvent } from '../../util/dictionary.js';

function NotificationList(props) {


  const handleClick = (userHostId, option) => {
    socket.emit(ioEvent.iq, {
      type: 'answerFriendshipRequest',
      payload: { userHostId, userFriendId: props.loginUserId, option }
    })
  }

  return (
    <div className="nofification-list-holder">
      {props.friendshipRequestList.length > 0 ? props.friendshipRequestList.map((item, index) => {
        return (
          <div key={index} className='item'>
            <div className='avatar'
              style={{ backgroundImage: `url('${generateAvatarUrl(80, 80, 60, item.avatar, item.username)}')` }}
            />
            <div> {item.username} 向你发送好友请求</div>
            <div className='buttons'>
              <Button onClick={() => { handleClick(item._id, 'accept') }}>同意</Button>
              <Button onClick={() => { handleClick(item._id, 'reject') }}>拒绝</Button>
            </div>
          </div>
        )
      }) : <div style={{ textAlign: 'center' }}>暂无消息通知</div>}
    </div>
  )
}

export default NotificationList;