
import { useEffect, useRef } from 'react';
import { Form, Button, Col } from 'react-bootstrap';
import { toast } from 'react-toastify';

import socket from '../util/socket.js';
import { ioEvent } from '../util/dictionary.js';


function Conversation(props) {
  const onSubmit = e => {
    const textArea = e.target.inputMessage;
    e.preventDefault();
    e.stopPropagation();
    const message = textArea.value;
    if (message) {
      const payload = {
        type: props.isCryptoChatAccept ? 'crypto' : 'plain',
        from: props.loginUserId,
        to: props.selectedUser._id,
        message,
      };
      if (props.isCryptoChatAccept) {
        props.onCryptoMessageEmit(payload);
      } else {
        socket.emit(ioEvent.msg, payload);
        props.onMessageEmit(payload);
      }
      textArea.value = '';
      textArea.focus();
    }
  }

  const messageHolder = useRef();
  const setMessageHolderRef = ele => { messageHolder.current = ele };

  const onAcceptCyptoChatClick = () => {
    if (props.selectedUser.online) {
      props.onAcceptCryptoChat();
    } else {
      toast.warning('对方已离线，不能建立加密聊天')
    }
  }

  useEffect(() => {
    const div = messageHolder.current;
    const scrollHeight = div.scrollHeight;
    const height = div.clientHeight;
    const maxScrollTop = scrollHeight - height;
    div.scrollTop = maxScrollTop > 0 ? maxScrollTop : 0;
  })

  return (
    <div className="profile-settings-warpper">
      <div className="messages-holder" ref={setMessageHolderRef}>
        {JSON.stringify(props.selectedUser)}
        {props.chatLog.map((item, index) => {
          const msgType = Object.keys(item)[0];
          const msgStr = item[msgType];
          const msgTypeClassNameMap = {
            o: 'message-self',
            i: 'message-out',
            s: 'message-sys'
          };
          const divComp = () => {
            if (msgType === 's') {
              const acceptButton = msgStr === '对方请求与你加密聊天' ? <span className="btn-link" style={{ cursor: 'pointer' }} onClick={onAcceptCyptoChatClick}>同意</span> : '';
              return (
                <span>{msgStr} {acceptButton}</span>
              )
            }
            return msgStr
          }
          return (
            <div className={msgTypeClassNameMap[msgType] + ' message-box'} key={index}>{divComp()}</div>
          )
        })}
      </div>
      <div className="messages-input">
        <Col bsPrefix="col messages-toolbar" >
          <Button variant="secondary" style={{ marginRight: 10 }} disabled={!props.selectedUser.online} onClick={props.onRequestCryptoChat}>发起加密聊天</Button>
        </Col>
        <Form onSubmit={onSubmit}>
          <Form.Group controlId="inputMessage" style={{ marginBottom: 0 }}>
            <Form.Row style={{ marginBottom: "5px" }}>
              <Col>
                <Form.Control as="textarea" rows={4} />
              </Col>
            </Form.Row>
            <Form.Row>
              <Col style={{ display: "flex", justifyContent: "flex-end" }}>
                <Button type="submit">发送</Button>
              </Col>
            </Form.Row>
          </Form.Group>
        </Form>
      </div>
    </div>
  )
}

export default Conversation;