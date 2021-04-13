class IoArgs {
  constructor(type, payload) {
    this.type = type;
    this.payload = payload;
  }
}

class MessageIoArgs extends IoArgs {
  /** @param {"private"|"group"} type  */
  constructor(type, from, to, message) {
    super(type, message);
    this.from = from;
    this.to = to;
  }
}

class PresenceIoArgs extends IoArgs {
  /**
   * @param {"user"|"group"} type
   * @param {""}
   */
  constructor(type, from, to, key, value) {
    super(type, { [key]: value });
    this.from = from;
    this.to = to;
  }
}


class IqIoArgs extends IoArgs {
  /** 
   * @param {"requset"|"response"} type
   * @param {"user|group"} targetType
   * @param {"join|leave"} l
   */
  constructor(type, from, to, target, payload) {
    super(type, payload);
    from && (this.from = from);
    to && (this.to = to);
    payload && (this.target = target);
  }
}

export { MessageIoArgs, PresenceIoArgs, IqIoArgs, IoArgs }