import { useMemo } from 'react';
import { getRegisteredUsers, getWeightEntries, getCompetitions } from '../utils/localStorage';

/**
 * CompeteWithFriend page displays a competition between the current user and a selected friend.
 * Shows names, usernames, start/current weights, trend, and competition status.
 */
const CompeteWithFriend = ({ currentUser, friendUsername, t }) => {
  const user = useMemo(() => {
    const users = getRegisteredUsers();
    return users.find(u => u.username === currentUser) || null;
  }, [currentUser]);

  const friend = useMemo(() => {
    const users = getRegisteredUsers();
    return users.find(u => u.username === friendUsername) || null;
  }, [friendUsername]);

  const competition = useMemo(() => {
    const comps = getCompetitions();
    return comps.find(c =>
      (c.user1Id === currentUser && c.user2Id === friendUsername) ||
      (c.user1Id === friendUsername && c.user2Id === currentUser)
    ) || null;
  }, [currentUser, friendUsername]);

  const renderWeightInfo = (person) => {
    if (!person) return null;
    const entries = getWeightEntries(person.username);
    if (!entries || entries.length === 0) {
      return t('noProgress') || 'No progress yet';
    }
    const sorted = entries.slice().sort((a, b) => new Date(a.date) - new Date(b.date));
    const start = sorted[0].weight;
    const current = sorted[sorted.length - 1].weight;
    const progressKg = current - start;
    const progressPct = person.goalWeight ? Math.round((progressKg / (person.goalWeight - start)) * 100) : null;
    return (
      <div>
        <p>{t('startingWeight') || 'Starting'}: {start}kg</p>
        <p>{t('currentWeight') || 'Current'}: {current}kg</p>
        {person.goalWeight && <p>{t('goalWeight') || 'Goal'}: {person.goalWeight}kg</p>}
        <p>{t('progressKg') || 'Progress'}: {progressKg.toFixed(1)}kg</p>
        {progressPct !== null && <p>{t('progressPct') || 'Progress'}: {progressPct}%</p>}
      </div>
    );
  };

  const getStatus = () => {
    if (!competition) return t('inProcess') || 'In Process';
    // simple status based on weight comparison
    const userEntries = getWeightEntries(currentUser);
    const friendEntries = getWeightEntries(friendUsername);
    if (!userEntries.length || !friendEntries.length) return t('inProcess') || 'In Process';
    const userCurrent = userEntries[userEntries.length - 1].weight;
    const friendCurrent = friendEntries[friendEntries.length - 1].weight;
    if (userCurrent > friendCurrent) return t('winning') || 'Winning';
    if (userCurrent < friendCurrent) return t('behind') || 'Behind';
    return t('stable') || 'Stable';
  };

  return (
    <div className="container" style={{ maxWidth: '800px', margin: '2rem auto' }}>
      <h2>{t('competeWithFriend') || 'Compete With Friend'}</h2>
      {user && friend ? (
        <div>
          <section style={{ marginBottom: '1.5rem' }}>
            <h3>{t('yourInfo') || 'Your Info'}</h3>
            <p><strong>{t('name') || 'Name'}:</strong> {user.firstName} {user.lastName}</p>
            <p><strong>{t('username') || 'Username'}:</strong> {user.username}</p>
            {renderWeightInfo(user)}
          </section>
          <section style={{ marginBottom: '1.5rem' }}>
            <h3>{t('friendInfo') || 'Friend Info'}</h3>
            <p><strong>{t('name') || 'Name'}:</strong> {friend.firstName} {friend.lastName}</p>
            <p><strong>{t('username') || 'Username'}:</strong> {friend.username}</p>
            {renderWeightInfo(friend)}
          </section>
          <section>
            <h3>{t('status') || 'Status'}</h3>
            <p>{getStatus()}</p>
          </section>
        </div>
      ) : (
        <p>{t('loading') || 'Loading...'}</p>
      )}
    </div>
  );
};

export default CompeteWithFriend;
