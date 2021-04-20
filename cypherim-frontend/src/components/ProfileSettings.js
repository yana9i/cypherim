
import { useState } from 'react';

import { ReactComponent as LeftArrow } from '../svg/left-arrow.svg'

import ProfileSetting from './ProfileSettings/ProfileSetting.js'


function ProfileSettings(props) {

  const [switcher, setSwitcher] = useState('home');

  const ProfileHome = () => {

    const avatarImg = () => {
      if (props.loginUser.avatar) {
        return `http://localhost:3000/api/img/avatar/${props.loginUser.avatar}`
      } else {
        const canvas = document.createElement('canvas');
        canvas.width = 800;
        canvas.height = 800;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.fillStyle = "#fff";
          ctx.font = "600px monosapce";
          ctx.textAlign = 'center';
          ctx.textBaseline = 'top';
          const firstLetter = props.loginUser.username.charAt(0);
          const measure = ctx.measureText(firstLetter);
          const height = measure.actualBoundingBoxAscent + measure.actualBoundingBoxDescent;
          ctx.fillText(firstLetter, 400, 400 - height / 2);
          return canvas.toDataURL();
        }
      }
    }

    return (
      <>
        <div className="profile-profile">
          <div className='profile-profile-avatar' style={{ backgroundImage: `url('${avatarImg()}')` }}></div>
          <div className='profile-profile-info'>
            <div>用户名：<div>{props.loginUser.username}</div></div>
            <div>用户ID：<div>{props.loginUser._id}</div></div>
            <div>上次登录时间：<div>{(new Date(props.loginUser.lastLoginTime)).toLocaleString()}</div></div>
          </div>
        </div>
        <div className='profile-settings-button' onClick={() => { setSwitcher('noti') }}>消息通知</div>
        <div className='profile-settings-button' onClick={() => { setSwitcher('prof') }}>个人资料</div>
        <div className='profile-settings-button' onClick={() => { setSwitcher('hunt') }}>搜索用户</div>
      </>
    )
  }

  return (
    <div className="profile-settings-warpper">
      <div className="profile-settings-holder">
        {switcher !== 'home' ? <div className='profile-settings-nav' onClick={() => { setSwitcher('home') }} ><LeftArrow /> </div> : null}
        {(() => {
          if (switcher === 'home')
            return <ProfileHome />;
          if (switcher === 'prof')
            return <ProfileSetting loginUser={props.loginUser} />
          if (switcher === 'noti')
            return 'noti'
          if (switcher === 'hunt')
            return 'hunt'
        })()}
      </div>
    </div>
  )
}

export default ProfileSettings;