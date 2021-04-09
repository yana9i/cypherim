/* abstract */ class SessionStore {
  findSession(id) {}
  saveSession(id, session) {}
  findAllSessions() {}
}

class InMemorySessionStore extends SessionStore {
  constructor() {
    super();
    this.sessions = new Map();
  }

  findSession(id) {
    return this.sessions.get(id);
  }

  saveSession(id, session) {
    this.sessions.set(id, session);
  }

  findAllSessions() {
    return [...this.sessions.values()];
  }
}

let sessionStore ;

/** @returns {InMemorySessionStore} */
const getSessionStore  = () =>{
  if(sessionStore)
    return sessionStore;
  else 
    sessionStore = new InMemorySessionStore();
  return sessionStore;
}

export default getSessionStore;