
import { useEffect } from 'react';
import { Form, FormGroup, Button, Container, Row, Col } from 'react-bootstrap'
import { useHistory } from 'react-router';
import { toast } from 'react-toastify';

import socket from '../util/socket.js';
import { ioEvent } from '../util/dictionary.js';

function Login() {

  const history = useHistory()

  const onSubmitClick = e => {
    const [username, password] = [e.target.formLoginUsername, e.target.formLoginPassword];
    e.preventDefault();
    e.stopPropagation();
    socket.auth = { username: username.value, password: password.value };
    const loginSuccessCallback = () => {
      socket.off(ioEvent.conn_err, loginFaildeCallback);
      toast.success('登录成功！', {
        position: "top-center",
        closeOnClick: true,
        pauseOnHover: true,
        draggable: false,
      });
      history.push('/chat');
    }
    const loginFaildeCallback = err => {
      if (err.message) {
        socket.off("connect", loginSuccessCallback)
        socket.disconnect();
        const error = {
          'Authorize Failed': '登录失败，请检查用户名或密码',
          'User Has Login': '用户已登录'
        }
        toast.error(error[err.message], {
          position: "top-center",
          closeOnClick: true,
          pauseOnHover: true,
          draggable: false,
        });
        username.value = "";
        password.value = "";
      }
    }
    if (socket.disconnected) {
      socket.once(ioEvent.conn_err, loginFaildeCallback);
      socket.once("connect", loginSuccessCallback)
      socket.connect();
    }
  }

  useEffect(() => {
    if (socket.connected) {
      history.push('/chat');
    }
  }, [history])

  return (
    <Container>
      <Row>
        <Col md={{ span: 6, offset: 3 }}>
          <div className="form-holder">
            <div className="form-warpper">
              <Form onSubmit={onSubmitClick}>
                <FormGroup controlId="formLoginUsername">
                  <Form.Label>用户名</Form.Label>
                  <Form.Control type='text' placeholder='输入用户名' required />
                </FormGroup>
                <FormGroup controlId="formLoginPassword">
                  <Form.Label>密码</Form.Label>
                  <Form.Control type="password" placeholder='请输入密码' required />
                </FormGroup>
                <Form.Row>
                  <Col><Button variant="primary" type="submit">登录</Button></Col>
                  <Col style={{ display: "flex", justifyContent: "flex-end" }}><Button variant="secondary" onClick={() => history.push("/register")} >注册新账号</Button></Col>
                </Form.Row>
              </Form>
            </div>
          </div>
        </Col>
      </Row>
      <div id="typelogo">CypherIM</div>

    </Container >
  );
}

export default Login;