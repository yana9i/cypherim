
function ChatItem(props) {

  const avatarImg = () => {
    if (props.avatar) {
      return `https://localhost:3000/api/img/${props.avatar}`
    } else {
      const canvas = document.createElement('canvas');
      canvas.width = 80;
      canvas.height = 80;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.fillStyle = "#fff";
        ctx.font = "60px monosapce";
        ctx.textAlign = 'center';
        ctx.textBaseline = 'top';
        const firstLetter = props.username.charAt(0);
        const measure = ctx.measureText(firstLetter);
        const height = measure.actualBoundingBoxAscent + measure.actualBoundingBoxDescent;
        ctx.fillText(firstLetter, 40, 40 - height / 2);
        return canvas.toDataURL();
      }
    }
  }

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