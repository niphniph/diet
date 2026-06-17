import { getAllUsers } from '../utils/localStorage';

const getUserBadge = (user, rank) => {
  if (rank === 1) return 'Champion';
  if (rank === 2) return 'High Performer';
  if (rank === 3) return 'Rising Star';
  if (user.streak >= 30) return 'Discipline Pro';
  if (user.streak >= 7) return 'Streak Master';
  return 'Progress Builder';
};

const getRankedUsers = () => {
  return getAllUsers()
    .map((user) => ({ ...user, points: Number(user.points || 0) }))
    .sort((a, b) => b.points - a.points);
};

const LeaderboardPage = ({ currentUser, onOpenFriends }) => {
  const rankedUsers = getRankedUsers();
  const currentRank = rankedUsers.findIndex((user) => user.username === currentUser || user.id === currentUser) + 1;

  return (
    <div className="container social-page">
      <div className="social-hero">
        <span className="material-symbols-outlined text-primary">leaderboard</span>
        <div>
          <h2>Leaderboard</h2>
          <p className="text-muted">Top users ranked by daily accomplishments, workouts, meal plans, streaks, and logged calories.</p>
        </div>
      </div>

      <div className="card leaderboard-summary">
        <div>
          <span className="text-muted">Your Rank</span>
          <strong>{currentRank > 0 ? `#${currentRank}` : 'Create a profile'}</strong>
        </div>
        <div>
          <span className="text-muted">Users Competing</span>
          <strong>{rankedUsers.length}</strong>
        </div>
        <button className="btn btn-primary" onClick={onOpenFriends}>Add Friends</button>
      </div>

      <div className="leaderboard-list">
        {rankedUsers.map((user, index) => {
          const rank = index + 1;
          const badge = getUserBadge(user, rank);
          const isCurrent = user.username === currentUser || user.id === currentUser;

          return (
            <div className={`card leaderboard-row ${isCurrent ? 'current' : ''}`} key={user.username}>
              <div className="leaderboard-rank">#{rank}</div>
              <div className="avatar">{user.avatar}</div>
              <div className="leaderboard-user">
                <h4>{user.firstName} {user.lastName}</h4>
                <p className="text-muted">@{user.username}</p>
              </div>
              <div className="leaderboard-stat">
                <span className="text-muted">Streak</span>
                <strong>{user.streak} days</strong>
              </div>
              <div className="leaderboard-stat">
                <span className="text-muted">Today</span>
                <strong>{user.dailyAccomplishments}</strong>
              </div>
              <div className="leaderboard-stat points">
                <span className="text-muted">Points</span>
                <strong>{user.points}</strong>
              </div>
              <div className="leaderboard-badge">{badge}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default LeaderboardPage;
