
import { useState } from 'react';


function ProfileSettings(props) {

  const avatarImg = () => {
    if (props.avatar) {
      return `https://localhost:3000/api/img/${props.avatar}`
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
    <div className="profile-settings-warpper">
      <div className="profile-settings-holder">
        <div className="profile-profile">
          <div className='profile-profile-avatar' style={{ backgroundImage: `url('${avatarImg()}')` }}></div>
          <div className='profile-profile-info'>
            <div>用户名：<div>{props.loginUser.username}</div></div>
            <div>用户ID：<div>{props.loginUser._id}</div></div>
            <div>上次登录时间：<div>{(new Date(props.loginUser.lastLoginTime)).toLocaleString()}</div></div>
          </div>
        </div>
        <div>消息通知</div>
        <div>个人资料</div>
        <div>搜索用户</div>
      </div>
    </div>
  )
}

export default ProfileSettings;