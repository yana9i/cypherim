
import { Form, Row, Col, Container, Button } from 'react-bootstrap';
import AvatarEditor from 'react-avatar-editor'
import { useState, useRef } from 'react';

import socket from '../../util/socket.js';
import { ioEvent } from '../../util/dictionary.js';

function ProfileSetting(props) {

  const colXs = { span: 3 }

  const [form, setForm] = useState({
    avatar: `http://localhost:3000/api/img/avatar/${props.loginUser.avatar}` || '',
    nickname: props.loginUser.nickname || '',
    signature: props.loginUser.signature || '',
    password: '',
    newpass: '',
    confpass: ''
  });

  const [avatarProps, setAvatarProps] = useState({
    label: '选择头像',
    scale: 1
  })

  const avatarEditor = useRef(null);

  const handleChange = e => {
    setForm(s => {
      const a = { [e.target.id]: e.target.value }
      return { ...s, ...a }
    })
  }

  const handleAvatarChange = SyntheticBaseEvent => {
    const file = SyntheticBaseEvent.target.files[0];
    if (file) {
      setForm(s => {
        const avatar = file;
        return { ...s, avatar }
      })
      setAvatarProps(s => {
        s.label = file.name;
        return { ...s }
      })
    }
  }

  const handleSubmit = e => {
    e.preventDefault();
    e.stopPropagation();

    const payloadObj = {};

    if (form.avatar instanceof File) {
      /** @type {HTMLCanvasElement} */
      const canvas = avatarEditor.current.getImage();
      payloadObj.avatar = canvas.toDataURL().replace('data:image/png;base64,', '');
    }

    payloadObj.nickname = form.nickname;
    payloadObj.signature = form.signature;

    socket.emit(ioEvent.prs, { type: 'profile', payload: payloadObj });
  }

  return (
    <Container>

      <Form className="profile-form" onSubmit={handleSubmit}>

        <Form.Group as={Row}>
          <Form.Label column xs={colXs}  >用户名</Form.Label>
          <Col xs="7">
            <Form.Control plaintext defaultValue={props.loginUser.username} />
          </Col>
        </Form.Group>

        <Form.Group as={Row} controlId="nickname">
          <Form.Label column xs={colXs} >昵称</Form.Label>
          <Col xs="7">
            <Form.Control type="text" value={form.nickname} onChange={handleChange} placeholder='设置昵称' />
          </Col>
        </Form.Group>

        <Form.Group as={Row} >
          <Form.Label column xs={colXs} >头像</Form.Label>
          <Col xs="7">
            <Row xs="12">
              <Col xs="auto" >
                <Form.Control type="text" placeholder="Password" hidden />
                <AvatarEditor
                  ref={avatarEditor}
                  image={form.avatar}
                  width={150}
                  height={150}
                  border={5}
                  borderRadius={8}
                  scale={Number.parseFloat(avatarProps.scale)}
                />
              </Col>
              <Col >
                <Form.File
                  label={avatarProps.label}
                  data-browse="浏览"
                  onChange={handleAvatarChange}
                  accept='image/jpeg,image/png'
                  custom
                />
                <Form.Group controlId="avatar-scale">
                  <Form.Label>缩放</Form.Label>
                  <Form.Control
                    type="range"
                    custom
                    step="0.01"
                    min="1"
                    max="2"
                    disabled={!(form.avatar instanceof File)}
                    value={Number.parseFloat(avatarProps.scale)}
                    onChange={e => {
                      setAvatarProps(s => {
                        s.scale = e.target.value;
                        return { ...s }
                      })
                    }} />
                </Form.Group>
                <Button
                  variant="secondary"
                  disabled={!(form.avatar instanceof File)}
                  onClick={() => {
                    setAvatarProps({ label: '', scale: 1 })
                    setForm(s => {
                      s.avatar = props.loginUser.avatar;
                      return { ...s }
                    })
                  }}>撤销修改</Button>
              </Col>

            </Row>
          </Col>
        </Form.Group>

        <Form.Group as={Row} controlId="signature">
          <Form.Label column xs={colXs} >签名档</Form.Label>
          <Col xs="7">
            <Form.Control value={form.signature} type="text" onChange={handleChange} placeholder="设置签名档" />
          </Col>
        </Form.Group>

        <Form.Group as={Row} controlId="password">
          <Form.Label column xs={colXs} >当前密码</Form.Label>
          <Col xs="7">
            <Form.Control value={form.password} type="password" placeholder="当前密码" onChange={handleChange} />
          </Col>
        </Form.Group>

        <Form.Group as={Row} controlId="newpass">
          <Form.Label column xs={colXs} >新密码</Form.Label>
          <Col xs="7">
            <Form.Control value={form.newpass} type="password" placeholder="新密码" onChange={handleChange} />
          </Col>
        </Form.Group>

        <Form.Group as={Row} controlId="confpass">
          <Form.Label column xs={colXs} >确认密码</Form.Label>
          <Col xs="7">
            <Form.Control value={form.confpass} type="password" placeholder="确认密码" onChange={handleChange} />
          </Col>
        </Form.Group>
        <Row>
          <Col xs={{ offset: 3, span: 7 }}>

            <Button variant="primary" type="submit">提交修改</Button>

          </Col>

        </Row>
      </Form>
    </Container>
  )
}

export default ProfileSetting