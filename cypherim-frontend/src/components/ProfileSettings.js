
import { useState } from 'react';

import { ReactComponent as LeftArrow } from '../svg/left-arrow.svg';

import ProfileSetting from './ProfileSettings/ProfileSetting.js';
import UserHunt from './ProfileSettings/UserHunt.js';
import NotificationList from './ProfileSettings/NotificationList.js';

import generateAvatarUrl from '../util/generateAvatarUrl.js'


function ProfileSettings(props) {

  const [switcher, setSwitcher] = useState('home');

  const ProfileHome = () => {

    const avatarImg = () => generateAvatarUrl(800, 800, 600, props.loginUser.avatar, props.loginUser.username);

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
        <div className='profile-settings-button' onClick={() => { setSwitcher('noti') }}>消息通知 {props.friendshipRequestList.length > 0 ? <div className="profile-settings-button-notification" /> : ''} </div>
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
            return <NotificationList
              friendshipRequestList={props.friendshipRequestList}
              loginUserId={props.loginUser._id}
            />
          if (switcher === 'hunt')
            return <UserHunt loginUser={props.loginUser} friendlist={props.friendlist} />
        })()}
      </div>
    </div>
  )
}

export default ProfileSettings;