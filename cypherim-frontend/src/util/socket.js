import { io } from 'socket.io-client';

const URL = `http://${window.location.hostname}:3000`;
const socket = io(URL, { autoConnect: false });

socket.onAny((event, ...args) => {
  console.log(event, args, (new Date()));
})

export default socket;
