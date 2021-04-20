
import { useState } from 'react';
import { Form } from 'react-bootstrap';

import ChatItem from './ChatItem.js';

function ChatList(props) {

  const [filterStr, setFilterStr] = useState('');

  return (
    <div className="chat-list">
      <div className="chat-list-users">
        <ChatItem
          selected={props.selectedUserId === props.loginUser._id}
          username={props.loginUser.username}
          recentMsg={props.loginUser.signature || '设置签名档'}
          avatar={props.loginUser.avatar}
          _id={props.loginUser._id}
          online={true}
          onItemClick={props.setClickedItem} />
        {props.friendlist.filter(item => {
          const regexp = new RegExp(filterStr, 'g');
          return regexp.test(item.username);
        }).map(item => {
          return <ChatItem
            selected={props.selectedUserId === item._id}
            username={item.username}
            avatar={item.avatar}
            recentMsg={(() => {
              const msgArr = props.chatLogSet.get(item._id);
              if (msgArr)
                return Object.values(msgArr.slice(-1)[0])[0]
              return '';
            })() || item.signature}
            key={item._id}
            _id={item._id}
            online={item.online}
            onItemClick={props.setClickedItem}
            notification={item.notification}
          />
        })}
      </div>
      <div className="chat-list-user-filter">
        <Form.Control type="text" value={filterStr} placeholder="搜索好友…" onChange={e => { setFilterStr(e.target.value) }} />
      </div>
    </div>
  )

}


export default ChatList;