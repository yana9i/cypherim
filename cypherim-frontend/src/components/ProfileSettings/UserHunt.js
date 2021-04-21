import { useEffect, useState } from 'react';
import { InputGroup, FormControl, Button, Spinner } from 'react-bootstrap';
import { ioEvent } from '../../util/dictionary.js';

import socket from '../../util/socket.js';
import generateAvatarUrl from '../../util/generateAvatarUrl.js'

function UserHunt(props) {

  const [huntList, setHuntList] = useState([]);

  const [input, setInput] = useState('');

  const [hint, setHint] = useState('暂无查询结果')

  useEffect(() => {

  }, [])

  const handleClick = () => {
    if (input) {
      setHint(<Spinner animation="border" variant="dark" size="xs" />)
      socket.emit(ioEvent.iq, {
        type: "userHunt",
        keyword: input
      }, response => {
        setHuntList(response);
        if (response.length === 0)
          setHint('暂无查询结果');
      });
    }
  }

  const requsetFriendship = id => {
    console.log(id);
  }


  return (
    <div className="user-hunt-holder">
      <InputGroup className="mb-3">
        <FormControl
          placeholder="输入用户名或 ID 查询用户…"
          value={input}
          onChange={e => { setInput(e.target.value) }}
        />
        <InputGroup.Append>
          <Button variant="outline-secondary" onClick={handleClick}>查一查</Button>
        </InputGroup.Append>
      </InputGroup>
      <div className="user-hunt-list-holder">
        {huntList.length === 0 ? <div style={{ margin: 'auto', gridColumn: "1/-1" }}> {hint} </div> : huntList.map(item => {
          return (
            <div key={item._id} className="user-hunt-list-item">
              <div
                className="user-hunt-list-item-avatar"
                style={{ backgroundImage: `url('${generateAvatarUrl(80, 80, 60, item.avatar, item.username)}')` }} />
              <div><span>用户名：</span><span> {item.username}</span></div>
              <div><span>ID：</span><span>  {item._id}</span></div>
              <div><Button
                size="sm"
                variant="secondary"
                block
                disabled={props.loginUser._id === item._id || props.friendlist.findIndex(i => i._id === item._id) >= 0}
                onClick={() => { requsetFriendship(item._id) }}> 申请好友 </Button>
              </div>
            </div>
          )
        }
        )}
      </div>
    </div>
  )
}

export default UserHunt;