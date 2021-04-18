
import { useEffect, useRef, useState } from 'react';
import { Form, Button, Col, Overlay } from 'react-bootstrap';
import { toast } from 'react-toastify';
import { Picker } from 'emoji-mart';

import socket from '../util/socket.js';
import { ioEvent } from '../util/dictionary.js';

import { ReactComponent as LockIcon } from '../svg/lock.svg';
import { ReactComponent as UnlockIcon } from '../svg/unlock.svg';
import { ReactComponent as ImageIcon } from '../svg/image.svg';


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

  const messageHolder = useRef(null);
  const imageUpdateInput = useRef(null);
  const messageTextarea = useRef(null)

  const onAcceptCyptoChatClick = () => {
    if (props.selectedUser.online) {
      props.onAcceptCryptoChat();
    } else {
      toast.warning('对方已离线，不能建立加密会话')
    }
  }

  const uploadImage = SyntheticBaseEvent => {
    const file = SyntheticBaseEvent.target.files[0];
    const reader = new FileReader();
    reader.onload = () => {
      const bytes = new Uint8Array(reader.result);
      socket.emit(ioEvent.msg, {
        type: 'pic',
        from: props.loginUserId,
        to: props.selectedUser._id,
        buffer: bytes
      })
    }
    if (file)
      reader.readAsArrayBuffer(file);
  }

  useEffect(() => {
    const div = messageHolder.current;
    const scrollHeight = div.scrollHeight;
    const height = div.clientHeight;
    const maxScrollTop = scrollHeight - height;
    div.scrollTop = maxScrollTop > 0 ? maxScrollTop : 0;
  })

  const MessageToolbar = () => {

    const [overlaysShow, setOverlaysShow] = useState(false);
    const buttonRef = useRef(null);

    return (
      <Col bsPrefix="col messages-toolbar" >
        <Button variant="secondary" onClick={() => { imageUpdateInput.current.click() }}><input hidden type="file" accept='image/jpeg,image/png' ref={imageUpdateInput} onChange={uploadImage} />  发送图片 <ImageIcon /></Button>
        <Button variant="secondary" disabled={(!props.selectedUser.online) || props.isCryptoChatAccept} onClick={props.onRequestCryptoChat}>发起加密会话</Button>
        <Button variant="secondary" ref={buttonRef} onClick={() => { setOverlaysShow(s => !s) }} >输入表情</Button>
        {props.isCryptoChatAccept ?
          <div className="success-info">已建立加密会话 <LockIcon /></div> :
          <div>未建立加密会话 <UnlockIcon /></div>}
        <Overlay
          target={buttonRef.current}
          show={overlaysShow}
          placement="top"
          transition={false}>

          {({ placement, arrowProps, show: _show, popper, ...props }) => (
            <div {...props} style={{ ...props.style }} >
              <Picker
                exclude={["flags"]}
                native={true}
                title={"选择表情"}
                sheetSize={32}
                showPreview={false}
                onSelect={emoji => {
                  setOverlaysShow(false);
                  messageTextarea.current.value += emoji.native;
                }}
                i18n={{
                  search: '查找',
                  clear: '清除',
                  notfound: '未找到表情',
                  skintext: '选择默认肤色',
                  categories: {
                    search: '查找结果',
                    recent: '常用',
                    smileys: '笑颜 & 感情',
                    people: '人群 & 身体',
                    nature: '动物 & 自然',
                    foods: '食品 & 饮料',
                    activity: '活动',
                    places: '旅行 & 地点',
                    objects: '物品',
                    symbols: '符号',
                  }
                }} />

            </div>
          )}
        </Overlay>
      </Col >
    )
  }

  const MessageHolder = () => { 
    return (
      <div className="messages-holder" ref={messageHolder}>
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
              const acceptButton = msgStr === '对方请求与你加密会话' ? <span className="btn-link" style={{ cursor: 'pointer' }} onClick={onAcceptCyptoChatClick}>同意</span> : '';
              return (
                <span>{msgStr} {acceptButton}</span>
              )
            }
            return msgStr
          }
          if (item.type === 'image')
            return <div className={'message-out message-box'} key={index} ><div> <img className='message-image' src={`data:image/png;base64,${item.base64}`} alt='msg' /></div></div>
          return (
            <div className={msgTypeClassNameMap[msgType] + ' message-box'} key={index}>{divComp()}</div>
          )
        })}
      </div>
    )
  }

  return (
    <div className="profile-settings-warpper">
      <MessageHolder />
      <div className="messages-input">
        <MessageToolbar />
        <Form onSubmit={onSubmit}>
          <Form.Group controlId="inputMessage" style={{ marginBottom: 0 }}>
            <Form.Row style={{ marginBottom: "5px" }}>
              <Col>
                <Form.Control as="textarea" rows={4} ref={messageTextarea} />
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