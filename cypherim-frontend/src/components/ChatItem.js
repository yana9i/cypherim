import generateAvatarUrl from '../util/generateAvatarUrl.js'

function ChatItem(props) {

  const avatarImg = () => generateAvatarUrl(80, 80, 60, props.avatar, props.username)

  return (
    <div className={`chat-item ${props.selected ? 'selected-chat-item' : ''}`} onClick={() => { props.onItemClick(props._id) }}>
      <div className={`chat-item-avatar ${props.online ? '' : 'chat-item-avatar-offline'}`} style={{ backgroundImage: `url('${avatarImg()}')` }} ></div>
      <div className="chat-item-title">{props.username || ''}</div>
      <div className="chat-item-message">{props.recentMsg || ""}</div>
      { props.notification ? <div className="chat-item-message-notification" /> : ''}
    </div>
  )
}

export default ChatItem;