
import { useEffect, useRef, useState } from 'react';
import { Spinner } from 'react-bootstrap';
import { useHistory } from 'react-router';
import jsencrypt from 'jsencrypt';

import ProfileSettings from './ProfileSettings.js';
import Conversation from './Conversation.js';
import ChatList from './ChatList';


import socket from '../util/socket.js';
import { ioEvent } from '../util/dictionary.js'

import '../style/Chat.css';
import '../style/ChatList.css';
import '../style/Conversation.css';
import '../style/ProfileSettings.css';
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
    intervalId: null
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
              const friendlist = s.friendlist;
              const user = friendlist.find(item => item._id === args.payload.from);
              user.online = true;
              return { ...s, friendlist }
            })
          },
          logoutSuccess: () => {
            setState(s => {
              const logoutUserId = args.payload.from;
              const friendlist = s.friendlist;
              const user = friendlist.find(item => item._id === logoutUserId);
              user.online = false;
              s.publicKeySet.delete(logoutUserId);
              s.cryptoReqSet.delete(logoutUserId);
              return { ...s, friendlist }
            })
          },
          friendlist: () => {
            setState(state => {
              state.friendlist = args.payload;
              return { ...state };
            })
          },
          requestCryptoChat: () => {
            addMessageToChatLog(args.payload.from, { s: '对方请求与你加密会话' });
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
          },
          pic: () => {
            addImageToChatLog(args.from, args.buffer);
          }
        };
        typeSwitch[args.type] && typeSwitch[args.type]();
        if (!cryptoRef.current.intervalId)
          cryptoRef.current.intervalId = setInterval(async () => {
            if (document.title === "​")
              document.title = "【有新消息】";
            else
              document.title = "​";
          }, 1000);
        window.onfocus = () => {
          if (cryptoRef.current.intervalId)
            clearInterval(cryptoRef.current.intervalId);
          cryptoRef.current.intervalId = null;
          document.title = "CrypherIM";
        }
        setNewMessageNotification(args.from, true);
      });
      socket.on(ioEvent.prs, args => {
        switch (args.type) {
          case 'selfProfileUpdate':
            setState(s => {
              s.loginUser = args.payload;
              return { ...s }
            });
            break;
          case 'profileUpdate':
            setState(s => {
              let index;
              s.friendlist.find((item, ind) => {
                index = ind;
                return item._id === args.payload._id;
              })
              s.friendlist[index] = args.payload;
              return { ...s };
            })
            break;
          default:
            break;
        }

      })
      socket.on("reconnect", () => {
        socket.emit(ioEvent.iq, { type: 'loginSuccess', payload: { from: state.loginUser._id } });
      })
      socket.emit(ioEvent.iq, { type: 'loginSuccess', payload: { from: state.loginUser._id } });
    }
    return () => {
      socket.off(ioEvent.iq);
      socket.off(ioEvent.msg);
      socket.off(ioEvent.prs);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const initiateCrypto = async () => {
    if (cryptoRef.current.isKeyPairGenerating) {
      toast.info('密钥正在生成');
    } else {
      if (!cryptoRef.current.keyPair.publicKey) {
        cryptoRef.current.isKeyPairGenerating = true;
        const crypt = cryptoRef.current.crypt;
        const toastId = toast.info(<span>正在生成密钥 <Spinner animation="border" variant="light" size="sm" /></span>, { autoClose: false, position: 'top-center' });
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
        chatLogSet.set(chatLogUserId, chatLog);
      } else {
        chatLog = [logInfo];
        chatLogSet.set(chatLogUserId, chatLog);
      }
      return { ...s, chatLogSet };
    })
  };

  const addImageToChatLog = (chatLogUserId, ImageArrayBuffer) => {
    const base64 = btoa(
      new Uint8Array(ImageArrayBuffer)
        .reduce((data, byte) => data + String.fromCharCode(byte), '')
    );
    const i = {
      type: 'image',
      base64
    }
    setState(s => {
      const chatLogSet = new Map(s.chatLogSet)
      let chatLog = chatLogSet.get(chatLogUserId);
      if (chatLog) {
        chatLog = [...chatLog, i];
        chatLogSet.set(chatLogUserId, chatLog);
      } else {
        chatLog = [i];
        chatLogSet.set(chatLogUserId, chatLog);
      }
      return { ...s, chatLogSet };
    })

  }

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
      const friendlist = s.friendlist;
      if (clickedUserId !== s.loginUser._id) {
        const listItem = friendlist.find(item => item._id === clickedUserId);
        listItem.notification = false;
      }
      return { ...s, selectedUserId, friendlist };
    });
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

  const setNewMessageNotification = (userId) => {
    setState(s => {
      if (userId === s.selectedUserId)
        return s;
      console.log(JSON.stringify(s));
      const listItem = s.friendlist.find(item => item._id === userId);
      listItem.notification = true;
      const filteredList = s.friendlist.filter(item => item._id !== userId);
      const friendlist = [listItem, ...filteredList];
      return { ...s, friendlist };
    });
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
    addMessageToChatLog(selectedUserId, { s: '已发送加密会话请求' });
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
        <ChatList
          loginUser={state.loginUser}
          selectedUserId={state.selectedUserId}
          friendlist={state.friendlist}
          chatLogSet={state.chatLogSet}
          setClickedItem={setClickedItem} />
        <div className="main-holder">
          {selectConversation(state.selectedUserId)}
        </div>
      </div>
    </div>
  );
}

export default Chat;