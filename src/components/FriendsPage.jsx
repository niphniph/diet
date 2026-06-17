import { useMemo, useState } from 'react';
import {
  acceptFriendRequest,
  getAllUsers,
  getFriends,
  getUserById,
  rejectFriendRequest,
  removeFriend,
  sendFriendRequest
} from '../utils/localStorage';

const statRows = [
  ['streak', 'Streak'],
  ['dailyAccomplishments', "Today's accomplishments"],
  ['weeklyAccomplishments', 'Weekly accomplishments'],
  ['totalCompletedTasks', 'Completed tasks'],
  ['totalWorkouts', 'Workouts'],
  ['totalCaloriesLogged', 'Calories logged'],
  ['points', 'Points']
];

const FriendsPage = ({ currentUser, onRequireLogin }) => {
  const [refreshKey, setRefreshKey] = useState(0);
  const [selectedFriendId, setSelectedFriendId] = useState('');
  const users = useMemo(() => {
    return getAllUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [refreshKey]);
  const currentProfile = getUserById(currentUser);
  const friends = currentProfile ? getFriends(currentProfile.username) : [];
  const selectedFriend = selectedFriendId ? getUserById(selectedFriendId) : friends[0];
  const receivedRequests = currentProfile?.friendRequestsReceived?.map(getUserById).filter(Boolean) || [];
  const sentRequests = currentProfile?.friendRequestsSent?.map(getUserById).filter(Boolean) || [];
  const otherUsers = currentProfile ? users.filter((user) => user.username !== currentProfile.username) : [];

  const refresh = () => setRefreshKey((value) => value + 1);

  if (!currentProfile) {
    return (
      <div className="container social-page">
        <div className="card empty-state">
          <span className="material-symbols-outlined text-primary">group</span>
          <h2>Friends</h2>
          <p className="text-muted">Create or log in to a profile to add friends and compare achievements.</p>
          <button className="btn btn-primary" onClick={onRequireLogin}>Login / Register</button>
        </div>
      </div>
    );
  }

  const getRelationship = (user) => {
    if (currentProfile.friends.includes(user.username)) return 'friends';
    if (currentProfile.friendRequestsSent.includes(user.username)) return 'sent';
    if (currentProfile.friendRequestsReceived.includes(user.username)) return 'received';
    return 'none';
  };

  const handleSendRequest = (user) => {
    sendFriendRequest(currentProfile.username, user.username);
    refresh();
  };

  const handleAccept = (user) => {
    acceptFriendRequest(currentProfile.username, user.username);
    refresh();
  };

  const handleReject = (user) => {
    rejectFriendRequest(currentProfile.username, user.username);
    refresh();
  };

  const handleRemove = (user) => {
    removeFriend(currentProfile.username, user.username);
    if (selectedFriendId === user.username) setSelectedFriendId('');
    refresh();
  };

  const renderRelationshipActions = (user) => {
    const relationship = getRelationship(user);
    if (relationship === 'friends') return <button className="btn btn-secondary btn-sm" disabled>Friends</button>;
    if (relationship === 'sent') return <button className="btn btn-secondary btn-sm" disabled>Request Sent</button>;
    if (relationship === 'received') {
      return (
        <div className="flex gap-2">
          <button className="btn btn-primary btn-sm" onClick={() => handleAccept(user)}>Accept</button>
          <button className="btn btn-outline btn-sm" onClick={() => handleReject(user)}>Reject</button>
        </div>
      );
    }
    return <button className="btn btn-outline btn-sm" onClick={() => handleSendRequest(user)}>Add Friend</button>;
  };

  const renderCompare = () => {
    if (!selectedFriend) {
      return <p className="text-muted">Add a friend to compare achievements.</p>;
    }

    return (
      <div className="compare-grid">
        {statRows.map(([key, label]) => {
          const mine = Number(currentProfile[key] || 0);
          const theirs = Number(selectedFriend[key] || 0);
          const max = Math.max(mine, theirs, 1);
          const leader = mine === theirs ? 'Tie' : mine > theirs ? 'You are leading' : 'Your friend is leading';

          return (
            <div className="compare-stat" key={key}>
              <div className="flex justify-between items-center">
                <strong>{label}</strong>
                <span className="text-primary">{leader}</span>
              </div>
              <div className="compare-bars">
                <div>
                  <span>You: {mine}</span>
                  <div className="progress-track"><div style={{ width: `${(mine / max) * 100}%` }} /></div>
                </div>
                <div>
                  <span>{selectedFriend.username}: {theirs}</span>
                  <div className="progress-track muted"><div style={{ width: `${(theirs / max) * 100}%` }} /></div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="container social-page">
      <div className="social-hero">
        <span className="material-symbols-outlined text-primary">group</span>
        <div>
          <h2>Friends</h2>
          <p className="text-muted">Add friends, compare daily progress, and build healthy competition.</p>
        </div>
      </div>

      <section className="social-section">
        <div className="section-title-row">
          <h3>My Friends</h3>
          <span className="pill">{friends.length} friends</span>
        </div>
        {friends.length === 0 ? (
          <div className="card empty-state">
            <p className="text-muted">No friends yet. Send a request below to start comparing progress.</p>
          </div>
        ) : (
          <div className="social-grid">
            {friends.map((friend) => (
              <div className="card social-card" key={friend.username}>
                <div className="avatar">{friend.avatar}</div>
                <h4>{friend.firstName} {friend.lastName}</h4>
                <p className="text-muted">@{friend.username}</p>
                <div className="mini-stats">
                  <span>{friend.streak} day streak</span>
                  <span>{friend.points} pts</span>
                  <span>{friend.totalMealPlansCompleted} meal plans</span>
                  <span>{friend.totalWorkouts} workouts</span>
                  <span>{friend.totalCaloriesLogged} kcal</span>
                </div>
                <p className="text-muted">Today: {friend.dailyAccomplishments} accomplishments</p>
                <div className="flex gap-2">
                  <button className="btn btn-primary btn-sm" onClick={() => setSelectedFriendId(friend.username)}>Compare</button>
                  <button className="btn btn-outline btn-sm" onClick={() => handleRemove(friend)}>Remove Friend</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="social-section">
        <h3>Friend Requests</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="card request-card">
            <h4>Received</h4>
            {receivedRequests.length === 0 && <p className="text-muted">No received requests.</p>}
            {receivedRequests.map((user) => (
              <div className="request-row" key={user.username}>
                <span>{user.firstName} {user.lastName} <span className="text-muted">@{user.username}</span></span>
                <div className="flex gap-2">
                  <button className="btn btn-primary btn-sm" onClick={() => handleAccept(user)}>Accept</button>
                  <button className="btn btn-outline btn-sm" onClick={() => handleReject(user)}>Reject</button>
                </div>
              </div>
            ))}
          </div>
          <div className="card request-card">
            <h4>Sent</h4>
            {sentRequests.length === 0 && <p className="text-muted">No sent requests.</p>}
            {sentRequests.map((user) => (
              <div className="request-row" key={user.username}>
                <span>{user.firstName} {user.lastName} <span className="text-muted">@{user.username}</span></span>
                <button className="btn btn-secondary btn-sm" disabled>Request Sent</button>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="social-section">
        <h3>Find Users</h3>
        <div className="social-grid">
          {otherUsers.map((user) => (
            <div className="card social-card compact" key={user.username}>
              <div className="avatar">{user.avatar}</div>
              <h4>{user.firstName} {user.lastName}</h4>
              <p className="text-muted">@{user.username}</p>
              <div className="mini-stats">
                <span>{user.streak} day streak</span>
                <span>{user.points} pts</span>
              </div>
              {renderRelationshipActions(user)}
            </div>
          ))}
        </div>
      </section>

      <section className="social-section">
        <h3>Compare With Friend</h3>
        <div className="card compare-card">
          {selectedFriend && (
            <div className="section-title-row">
              <strong>You vs @{selectedFriend.username}</strong>
              <button className="btn btn-outline btn-sm" onClick={() => setSelectedFriendId('')}>Reset Compare</button>
            </div>
          )}
          {renderCompare()}
        </div>
      </section>
    </div>
  );
};

export default FriendsPage;
