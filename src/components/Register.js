
import { useState } from 'react';
import { Form, FormGroup, Button, Container, Row, Col } from 'react-bootstrap'
import { useHistory } from 'react-router';
import { toast } from 'react-toastify';

function Register() {

  const [validated, setValidated] = useState({
    form: false,
    username: true,
    password: true,
    cfimpswd: true
  });
  const history = useHistory();

  const onSubmitClice = async e => {

    const username = e.target.formRegitserUsername.value;
    const password = e.target.formRegisterPassword.value;
    const cfimpswd = e.target.formRegisterConfirmPassword.value;

    e.preventDefault();
    e.stopPropagation();

    const valid = {
      form: false,
      username: validRegExp.username(username),
      password: validRegExp.password(password),
      cfimpswd: validRegExp.password(password) ? password === cfimpswd : false
    }

    valid.form = valid.username && valid.password && valid.cfimpswd;

    if (!valid.form) {
      setValidated(valid);
      return;
    }

    const response = await fetch(`http://${window.location.hostname}:3000/api/user`, {
      body: JSON.stringify({ username, password }),
      cache: 'no-cache',
      method: 'POST',
      headers: new Headers({
        'Content-Type': 'application/json'
      })
    });

    if (response.ok) {
      toast.success("注册成功！")
      history.push('/login');
    } else {
      console.log(response);
      [valid.username, valid.form] = [false, false];
      toast.error("注册失败，用户名不唯一", {
        position: "top-center",
        autoClose: 4000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: false,
        progress: undefined,
      });

      setValidated(valid);
    }
  }

  const validRegExp = {
    username: str => /^[A-Za-z0-9]{1,60}$/.test(str),
    password: str => /^[\x21-\x7eA-Za-z0-9]{6,20}$/.test(str),


  }

  return (
    <Container>
      <Row>
        <Col md={{ span: 6, offset: 3 }}>
          <div className="form-holder">
            <div className="form-warpper">
              <Form noValidate validated={validated.form} onSubmit={onSubmitClice}>
                <FormGroup controlId="formRegitserUsername">
                  <Form.Label>用户名</Form.Label>
                  <Form.Control type='text' placeholder='输入用户名' isInvalid={!validated.username} />
                  <Form.Text>使用英文字母与数字创建用户名</Form.Text>
                </FormGroup>
                <FormGroup controlId="formRegisterPassword">
                  <Form.Label>密码</Form.Label>
                  <Form.Control type="password" placeholder='请输入密码' isInvalid={!validated.password} />
                  <Form.Text>使用 6 到 20 位英文、数字与特殊符号创建密码</Form.Text>
                </FormGroup>
                <FormGroup controlId="formRegisterConfirmPassword">
                  <Form.Label>确认密码</Form.Label>
                  <Form.Control type='password' placeholder='确认密码' isInvalid={!validated.cfimpswd} />
                  <Form.Text>确认密码，确保密码相同</Form.Text>
                </FormGroup>
                <Form.Row>
                  <Col><Button variant="primary" type="submit">注册账号</Button></Col>
                  <Col style={{ display: "flex", justifyContent: "flex-end" }}><Button variant="secondary" onClick={() => history.push("/login")} >登录</Button></Col>
                </Form.Row>
              </Form>
            </div>
          </div>
        </Col>
      </Row>
      <div id="typelogo">CypherIM</div>

    </Container>
  );
}

export default Register;