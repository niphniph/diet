import { useState } from 'react';
import { getRegisteredUsers, getFriendsMap, addFriend } from '../utils/localStorage';

const UsersDashboard = ({ currentUser, onAddFriend, onCompete, t }) => {
  const [users] = useState(() => getRegisteredUsers());
  const [friendsMap, setFriendsMap] = useState(() => getFriendsMap());

  const isFriend = (username) => {
    return friendsMap[currentUser] && friendsMap[currentUser].includes(username);
  };

  const handleAddFriend = (username) => {
    if (!isFriend(username)) {
      addFriend(currentUser, username);
      setFriendsMap(getFriendsMap());
      if (onAddFriend) onAddFriend(username);
    }
  };

  const currentProfile = users.find(u => u.username === currentUser);

  const otherUsers = users.filter(u => u.username !== currentUser);
  const friendUsernames = friendsMap[currentUser] || [];
  const friends = users.filter(u => friendUsernames.includes(u.username));

  return (
    <div className="container" style={{ padding: '2rem' }}>
      <h2>{t('usersDashboard') || 'Users Dashboard'}</h2>
      {currentProfile && (
        <section style={{ marginBottom: '2rem' }}>
          <h3>{t('yourProfile') || 'Your Profile'}</h3>
          <p><strong>{t('firstName') || 'First Name'}:</strong> {currentProfile.firstName}</p>
          <p><strong>{t('lastName') || 'Last Name'}:</strong> {currentProfile.lastName}</p>
          <p><strong>{t('username') || 'Username'}:</strong> {currentProfile.username}</p>
          <p><strong>{t('phone') || 'Phone'}:</strong> {currentProfile.phone}</p>
          <p><strong>{t('email') || 'Email'}:</strong> {currentProfile.email}</p>
        </section>
      )}

      <section style={{ marginBottom: '2rem' }}>
        <h3>{t('allUsers') || 'All Users'}</h3>
        {otherUsers.map(user => (
          <div key={user.username} className="card" style={{ border: '1px solid var(--color-surface-container)', padding: '1rem', marginBottom: '1rem' }}>
            <p><strong>{user.firstName} {user.lastName}</strong> ({user.username})</p>
            <p>{user.email || user.phone}</p>
            <button
              className="btn btn-outline"
              disabled={isFriend(user.username)}
              onClick={() => handleAddFriend(user.username)}
              style={{ marginRight: '0.5rem' }}
            >
              {isFriend(user.username) ? (t('friendAdded') || 'Friend Added') : (t('addFriend') || 'Add Friend')}
            </button>
            <button
              className="btn btn-primary"
              onClick={() => onCompete && onCompete(user.username)}
            >
              {t('compete') || 'Compete'}
            </button>
          </div>
        ))}
      </section>

      <section>
        <h3>{t('friendsList') || 'Friends List'}</h3>
        {friends.length === 0 && <p>{t('noFriends') || 'No friends added yet.'}</p>}
        {friends.map(friend => (
          <div key={friend.id} className="card" style={{ border: '1px solid var(--color-surface-container)', padding: '1rem', marginBottom: '1rem' }}>
            <p><strong>{friend.firstName} {friend.lastName}</strong> ({friend.username})</p>
            <button
              className="btn btn-primary"
              onClick={() => onCompete && onCompete(friend.username)}
            >
              {t('compete') || 'Compete'}
            </button>
          </div>
        ))}
      </section>
    </div>
  );
};

export default UsersDashboard;
