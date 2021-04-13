
import { useEffect, useRef, useState } from 'react';
import { useHistory } from 'react-router';
import jsencrypt from 'jsencrypt';

import ChatItem from './ChatItem.js';
import ProfileSettings from './ProfileSettings.js';
import Conversation from './Conversation.js';


import socket from '../util/socket.js';
import { ioEvent } from '../util/dictionary.js'

import '../style/Chat.css';
import '../style/ChatItem.css';
import '../style/Conversation.css';
import { toast } from 'react-toastify';


function Chat() {

  const history = useHistory();

  const cryptoRef = useRef({
    keyPair: {
      privateKey: '',
      publicKey: ''
    },
    crypt: new jsencrypt({ default_key_size: 1024 }),
    isKeyPairGenerating: false,
  })

  const [state, setState] = useState({
    loginUser: {
      username: '',
      nickname: null,
      avater: null,
      _id: null,
      lastLoginTime: null,
      signature: null
    },
    friendlist: [],
    groupList: [],
    selectedUserId: '',
    chatLogSet: new Map(),
    publicKeySet: new Map(),
    cryptoReqSet: new Map()
  });

  useEffect(() => {
    if (socket.disconnected) {
      history.push('/login');
    }
    if (socket.connected) {
      socket.on(ioEvent.iq, args => {
        const typeSwitch = {
          selfLoginSuccess: () => {
            setState(state => {
              state.loginUser = args.payload;
              state.selectedUserId = args.payload._id;
              return { ...state };
            })
          },
          loginSuccess: () => {
            setState(s => {
              const friendList = s.friendlist;
              const user = friendList.find(item => item._id === args.payload.from);
              user.online = true;
              return { ...s, friendList }
            })
          },
          logoutSuccess: () => {
            setState(s => {
              const friendList = s.friendlist;
              const user = friendList.find(item => item._id === args.payload.from);
              user.online = false;
              return { ...s, friendList }
            })
          },
          friendlist: () => {
            setState(state => {
              state.friendlist = args.payload;
              return { ...state };
            })
          },
          requestCryptoChat: () => {
            addMessageToChatLog(args.payload.from, { s: '对方请求与你加密聊天' });
            addPublicKeySet(args.payload.from, args.payload.publicKey);
            setCryptoReqAccept(args.payload.from, 'other');
          },
          acceptCryptoChat: () => {
            addPublicKeySet(args.payload.from, args.payload.publicKey);
            setCryptoReqAccept(args.payload.from, 'other');
          }
        }
        typeSwitch[args.type] && typeSwitch[args.type]()
      });
      socket.on(ioEvent.msg, args => {
        const typeSwitch = {
          plain: () => {
            addMessageToChatLog(args.from, { i: args.message })
          },
          crypto: () => {
            const crypt = cryptoRef.current.crypt;
            const message = crypt.decrypt(args.message);
            addMessageToChatLog(args.from, { i: message });
          }
        };
        typeSwitch[args.type] && typeSwitch[args.type]();
      });
      socket.emit(ioEvent.iq, { type: 'loginSuccess', payload: { from: state.loginUser._id } });
    }
    return () => {
      socket.off(ioEvent.iq);
      socket.off(ioEvent.msg);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const initiateCrypto = async () => {
    if (cryptoRef.current.isKeyPairGenerating) {
      console.log('foo');
    } else {
      if (!cryptoRef.current.keyPair.publicKey) {
        cryptoRef.current.isKeyPairGenerating = true;
        const crypt = cryptoRef.current.crypt;
        const toastId = toast.info('正在生成密钥', { autoClose: false, position: 'top-center' });
        await new Promise(res => {
          crypt.getKey(() => {
            res(crypt);
          })
        });
        toast.update(toastId, { type: toast.TYPE.SUCCESS, render: '密钥生成成功', autoClose: true });
        cryptoRef.current = {
          crypt,
          keyPair: {
            privateKey: crypt.getPrivateKeyB64(),
            publicKey: crypt.getPublicKeyB64()
          },
          isKeyPairGenerating: false
        }
      }
    }
  }

  const addMessageToChatLog = (chatLogUserId, logInfo) => {
    setState(s => {
      const chatLogSet = new Map(s.chatLogSet)
      let chatLog = chatLogSet.get(chatLogUserId);
      if (chatLog) {
        chatLog = [...chatLog, logInfo];
        s.chatLogSet.set(chatLogUserId, chatLog);
      } else {
        chatLog = [logInfo];
        s.chatLogSet.set(chatLogUserId, chatLog);
      }
      return { ...s, chatLogSet };
    })
  };

  const addPublicKeySet = (publicKeyUserId, publicKey) => {
    setState(s => {
      const publicKeySet = new Map(s.publicKeySet);
      publicKeySet.set(publicKeyUserId, publicKey);
      return { ...s, publicKeySet }
    });
  };

  const setClickedItem = clickedUserId => {
    setState(s => {
      const selectedUserId = clickedUserId;
      return { ...s, selectedUserId };
    })
  };

  /**@param {'other'|'self'} type*/
  const setCryptoReqAccept = (userId, type) => {
    setState(s => {
      const cryptoReqObj = s.cryptoReqSet.get(userId);
      const cryptoReqSet = new Map(s.cryptoReqSet);
      if (cryptoReqObj) {
        cryptoReqObj[type] = true;
        cryptoReqSet.set(userId, cryptoReqObj);
        return { ...s, cryptoReqSet };
      } else {
        const cryptoReqObj = { self: null, other: null };
        cryptoReqObj[type] = true;
        cryptoReqSet.set(userId, cryptoReqObj);
        return { ...s, cryptoReqSet }
      }
    });
  }

  const onMessageEmit = payload => {
    addMessageToChatLog(payload.to, { o: payload.message });
  };

  const onAcceptCryptoChat = async () => {
    const selectedUserId = state.selectedUserId;
    if (!cryptoRef.current.keyPair.publicKey) {
      await initiateCrypto();
    }
    socket.emit(ioEvent.iq, {
      type: 'acceptCryptoChat',
      payload: {
        from: state.loginUser._id,
        to: selectedUserId,
        publicKey: cryptoRef.current.keyPair.publicKey
      }
    });
    setCryptoReqAccept(selectedUserId, 'self');
  };

  const onCryptoMessageEmit = payload => {
    onMessageEmit(payload);
    const crypt = new jsencrypt({ default_key_size: 1024 });
    const publicKey = state.publicKeySet.get(state.selectedUserId);
    console.log(publicKey);
    crypt.setPublicKey(publicKey);
    const message = crypt.encrypt(payload.message);
    payload.message = message;
    socket.emit(ioEvent.msg, payload);
  }

  const isCryptoChatAccept = userId => {
    const acpObj = state.cryptoReqSet.get(userId);
    if (acpObj && acpObj.other && acpObj.self)
      return true;
    return false;
  }

  const onRequsetCryptoChat = async () => {
    const selectedUserId = state.selectedUserId;
    if (!cryptoRef.current.keyPair.publicKey) {
      await initiateCrypto();
    }
    socket.emit(ioEvent.iq, {
      type: 'requestCryptoChat',
      payload: {
        from: state.loginUser._id,
        to: selectedUserId,
        publicKey: cryptoRef.current.keyPair.publicKey
      }
    });
    addMessageToChatLog(selectedUserId, { s: '已发送加密聊天请求' });
    setCryptoReqAccept(selectedUserId, 'self');
  };

  const selectConversation = selectedUserId => {
    if (selectedUserId === state.loginUser._id || selectedUserId === '') {
      return <ProfileSettings loginUser={state.loginUser} />
    } else {
      const chatlog = state.chatLogSet.get(selectedUserId) || [];
      const selectedUser = state.friendlist.find(item => item._id === selectedUserId);
      return <Conversation
        selectedUser={selectedUser}
        loginUserId={state.loginUser._id}
        chatLog={chatlog}
        onMessageEmit={onMessageEmit}
        onAcceptCryptoChat={onAcceptCryptoChat}
        onRequestCryptoChat={onRequsetCryptoChat}
        isCryptoChatAccept={isCryptoChatAccept(selectedUserId)}
        onCryptoMessageEmit={onCryptoMessageEmit} />
    }
  }

  return (
    <div className="chat-holder">
      <div className="chat-warpper">
        <div className="chat-list">
          <ChatItem
            selected={state.selectedUserId === state.loginUser._id}
            username={state.loginUser.username}
            recentMsg={'我自己'}
            avatar={state.loginUser.avater}
            _id={state.loginUser._id}
            online={true}
            onItemClick={setClickedItem} />
          {state.friendlist.map(item => {
            return <ChatItem
              selected={state.selectedUserId === item._id}
              username={item.username}
              avatar={item.avatar}
              key={item._id}
              _id={item._id}
              online={item.online}
              onItemClick={setClickedItem}
            />
          })}
        </div>
        <div className="main-holder">
          {selectConversation(state.selectedUserId)}
        </div>
      </div>
    </div>
  );
}

export default Chat;