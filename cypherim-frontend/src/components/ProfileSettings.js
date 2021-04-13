
function ProfileSettings(props) {
  return (
    <div className="profile-settings-warpper">
      {JSON.stringify(props.loginUser)}
    </div>
  )
}

export default ProfileSettings;