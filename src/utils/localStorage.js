// src/utils/localStorage.js
// Centralized helpers for localStorage persistence, users, friends, and local subscription state.

const USERS_KEY = 'registeredUsers';
const CURRENT_USER_KEY = 'currentUser';
const SUBSCRIPTION_KEY = 'nutriPlanSubscription';

const safeJsonParse = (value, fallback) => {
  try {
    return value ? JSON.parse(value) : fallback;
  } catch (error) {
    console.warn('Failed to parse localStorage value', error);
    return fallback;
  }
};

const unique = (items) => [...new Set((items || []).filter(Boolean))];

export const calculateUserPoints = (user = {}) => {
  const daily = Number(user.dailyAccomplishments || 0);
  const mealPlans = Number(user.totalMealPlansCompleted || 0);
  const workouts = Number(user.totalWorkouts || 0);
  const streak = Number(user.streak || 0);
  const calories = Number(user.totalCaloriesLogged || 0);

  return (daily * 10) + (mealPlans * 20) + (workouts * 15) + (streak * 5) + Math.floor(calories / 100);
};

const demoStatsFor = (index) => ({
  dailyAccomplishments: Math.max(1, 5 - index),
  weeklyAccomplishments: 18 - (index * 3),
  streak: [14, 9, 6, 3][index] || 2,
  totalCompletedTasks: 35 - (index * 4),
  totalCaloriesLogged: 8200 - (index * 900),
  totalWorkouts: 12 - (index * 2),
  totalMealPlansCompleted: 4 - Math.min(index, 3)
});

export const normalizeUser = (user = {}, index = 0) => {
  const id = user.id || user.username || `user_${Date.now()}_${index}`;
  const stats = demoStatsFor(index);
  const normalized = {
    ...user,
    id,
    username: user.username || id,
    firstName: user.firstName || 'NutriPlan',
    lastName: user.lastName || 'Member',
    email: user.email || '',
    avatar: user.avatar || `${(user.firstName || user.username || 'N').charAt(0)}${(user.lastName || '').charAt(0)}`.toUpperCase(),
    friends: unique(user.friends),
    friendRequestsReceived: unique(user.friendRequestsReceived),
    friendRequestsSent: unique(user.friendRequestsSent),
    questionnaireAnswers: user.questionnaireAnswers || null,
    calculatedPlan: user.calculatedPlan || null,
    subscriptionActive: Boolean(user.subscriptionActive),
    selectedPlan: user.selectedPlan || '',
    selectedPlanPrice: user.selectedPlanPrice || '',
    subscriptionDate: user.subscriptionDate || '',
    renewalDate: user.renewalDate || '',
    cancelAtPeriodEnd: Boolean(user.cancelAtPeriodEnd),
    dailyAccomplishments: user.dailyAccomplishments ?? stats.dailyAccomplishments,
    weeklyAccomplishments: user.weeklyAccomplishments ?? stats.weeklyAccomplishments,
    streak: user.streak ?? stats.streak,
    totalCompletedTasks: user.totalCompletedTasks ?? stats.totalCompletedTasks,
    totalCaloriesLogged: user.totalCaloriesLogged ?? stats.totalCaloriesLogged,
    totalWorkouts: user.totalWorkouts ?? stats.totalWorkouts,
    totalMealPlansCompleted: user.totalMealPlansCompleted ?? stats.totalMealPlansCompleted
  };

  normalized.points = calculateUserPoints(normalized);
  return normalized;
};

export const getRegisteredUsers = () => {
  const users = safeJsonParse(localStorage.getItem(USERS_KEY), []);
  return Array.isArray(users) ? users.map(normalizeUser) : [];
};

export const getAllUsers = getRegisteredUsers;

export const setRegisteredUsers = (users) => {
  localStorage.setItem(USERS_KEY, JSON.stringify((users || []).map(normalizeUser)));
};

export const getUserById = (userId) => {
  const users = getAllUsers();
  return users.find((user) => user.id === userId || user.username === userId) || null;
};

export const getCurrentUser = () => {
  return localStorage.getItem(CURRENT_USER_KEY) || null;
};

export const getCurrentUserProfile = () => {
  return getUserById(getCurrentUser());
};

export const setCurrentUser = (userIdOrUsername) => {
  localStorage.setItem(CURRENT_USER_KEY, userIdOrUsername);
};

export const updateUser = (userId, patchOrUpdater) => {
  const users = getAllUsers();
  const index = users.findIndex((user) => user.id === userId || user.username === userId);
  if (index === -1) return null;

  const current = users[index];
  const patch = typeof patchOrUpdater === 'function' ? patchOrUpdater(current) : patchOrUpdater;
  const updated = normalizeUser({ ...current, ...patch }, index);
  users[index] = updated;
  setRegisteredUsers(users);

  const currentUser = getCurrentUser();
  if (currentUser === userId || currentUser === current.username) {
    setCurrentUser(updated.username);
  }

  return updated;
};

export const addUser = (user, options = {}) => {
  const { setAsCurrent = true } = options;
  const users = getAllUsers();
  if (users.find((existing) => existing.username === user.username)) {
    throw new Error('Username already exists');
  }

  const normalized = normalizeUser({
    ...user,
    id: user.id || user.username || `user_${Date.now()}`
  }, users.length);

  users.push(normalized);
  setRegisteredUsers(users);

  if (setAsCurrent) {
    setCurrentUser(normalized.username);
  }

  return normalized;
};

export const seedDemoUsers = () => {
  if (getAllUsers().length > 0) return;

  setRegisteredUsers([
    normalizeUser({
      id: 'david123',
      firstName: 'David',
      lastName: 'Smith',
      username: 'david123',
      phone: '+1234567890',
      email: 'david@gmail.com',
      friends: ['tinafit'],
      friendRequestsReceived: [],
      friendRequestsSent: [],
      dailyAccomplishments: 4,
      weeklyAccomplishments: 22,
      streak: 12,
      totalCompletedTasks: 48,
      totalCaloriesLogged: 9400,
      totalWorkouts: 15,
      totalMealPlansCompleted: 5
    }, 0),
    normalizeUser({
      id: 'tinafit',
      firstName: 'Tina',
      lastName: 'Brown',
      username: 'tinafit',
      phone: '+1987654321',
      email: 'tina@example.com',
      friends: ['david123'],
      friendRequestsReceived: [],
      friendRequestsSent: [],
      dailyAccomplishments: 3,
      weeklyAccomplishments: 17,
      streak: 8,
      totalCompletedTasks: 39,
      totalCaloriesLogged: 7600,
      totalWorkouts: 10,
      totalMealPlansCompleted: 4
    }, 1),
    normalizeUser({
      id: 'mayahealth',
      firstName: 'Maya',
      lastName: 'Green',
      username: 'mayahealth',
      phone: '+1555123456',
      email: 'maya@example.com',
      friends: [],
      friendRequestsReceived: [],
      friendRequestsSent: [],
      dailyAccomplishments: 5,
      weeklyAccomplishments: 28,
      streak: 31,
      totalCompletedTasks: 82,
      totalCaloriesLogged: 12400,
      totalWorkouts: 22,
      totalMealPlansCompleted: 7
    }, 2)
  ]);
};

export const sendFriendRequest = (fromUserId, toUserId) => {
  if (!fromUserId || !toUserId || fromUserId === toUserId) return false;

  const users = getAllUsers();
  const fromIndex = users.findIndex((user) => user.id === fromUserId || user.username === fromUserId);
  const toIndex = users.findIndex((user) => user.id === toUserId || user.username === toUserId);
  if (fromIndex === -1 || toIndex === -1) return false;

  const from = users[fromIndex];
  const to = users[toIndex];
  if (from.friends.includes(to.username) || from.friendRequestsSent.includes(to.username)) return false;

  users[fromIndex] = normalizeUser({
    ...from,
    friendRequestsSent: unique([...from.friendRequestsSent, to.username])
  }, fromIndex);
  users[toIndex] = normalizeUser({
    ...to,
    friendRequestsReceived: unique([...to.friendRequestsReceived, from.username])
  }, toIndex);
  setRegisteredUsers(users);
  return true;
};

export const acceptFriendRequest = (currentUserId, requesterId) => {
  const users = getAllUsers();
  const currentIndex = users.findIndex((user) => user.id === currentUserId || user.username === currentUserId);
  const requesterIndex = users.findIndex((user) => user.id === requesterId || user.username === requesterId);
  if (currentIndex === -1 || requesterIndex === -1) return false;

  const current = users[currentIndex];
  const requester = users[requesterIndex];

  users[currentIndex] = normalizeUser({
    ...current,
    friends: unique([...current.friends, requester.username]),
    friendRequestsReceived: current.friendRequestsReceived.filter((id) => id !== requester.username)
  }, currentIndex);
  users[requesterIndex] = normalizeUser({
    ...requester,
    friends: unique([...requester.friends, current.username]),
    friendRequestsSent: requester.friendRequestsSent.filter((id) => id !== current.username)
  }, requesterIndex);
  setRegisteredUsers(users);
  return true;
};

export const rejectFriendRequest = (currentUserId, requesterId) => {
  const users = getAllUsers();
  const currentIndex = users.findIndex((user) => user.id === currentUserId || user.username === currentUserId);
  const requesterIndex = users.findIndex((user) => user.id === requesterId || user.username === requesterId);
  if (currentIndex === -1 || requesterIndex === -1) return false;

  const current = users[currentIndex];
  const requester = users[requesterIndex];
  users[currentIndex] = normalizeUser({
    ...current,
    friendRequestsReceived: current.friendRequestsReceived.filter((id) => id !== requester.username)
  }, currentIndex);
  users[requesterIndex] = normalizeUser({
    ...requester,
    friendRequestsSent: requester.friendRequestsSent.filter((id) => id !== current.username)
  }, requesterIndex);
  setRegisteredUsers(users);
  return true;
};

export const removeFriend = (currentUserId, friendId) => {
  const users = getAllUsers();
  const currentIndex = users.findIndex((user) => user.id === currentUserId || user.username === currentUserId);
  const friendIndex = users.findIndex((user) => user.id === friendId || user.username === friendId);
  if (currentIndex === -1 || friendIndex === -1) return false;

  const current = users[currentIndex];
  const friend = users[friendIndex];
  users[currentIndex] = normalizeUser({
    ...current,
    friends: current.friends.filter((id) => id !== friend.username)
  }, currentIndex);
  users[friendIndex] = normalizeUser({
    ...friend,
    friends: friend.friends.filter((id) => id !== current.username)
  }, friendIndex);
  setRegisteredUsers(users);
  return true;
};

export const getFriends = (userId) => {
  const user = getUserById(userId);
  if (!user) return [];
  return user.friends.map(getUserById).filter(Boolean);
};

export const updateUserPerformance = (userId, changes = {}) => {
  const user = getUserById(userId);
  if (!user) return null;

  return updateUser(user.username, {
    dailyAccomplishments: Number(user.dailyAccomplishments || 0) + Number(changes.dailyAccomplishments || 0),
    weeklyAccomplishments: Number(user.weeklyAccomplishments || 0) + Number(changes.weeklyAccomplishments || changes.dailyAccomplishments || 0),
    totalCompletedTasks: Number(user.totalCompletedTasks || 0) + Number(changes.totalCompletedTasks || changes.dailyAccomplishments || changes.totalWorkouts || 0),
    totalCaloriesLogged: Number(user.totalCaloriesLogged || 0) + Number(changes.totalCaloriesLogged || 0),
    totalWorkouts: Number(user.totalWorkouts || 0) + Number(changes.totalWorkouts || 0),
    totalMealPlansCompleted: Number(user.totalMealPlansCompleted || 0) + Number(changes.totalMealPlansCompleted || 0),
    streak: Math.max(Number(user.streak || 0), Number(changes.streak || 0))
  });
};

export const saveUserQuestionnairePlan = (userId, questionnaireAnswers, calculatedPlan) => {
  if (!userId) return null;
  return updateUser(userId, {
    questionnaireAnswers,
    calculatedPlan
  });
};

export const getUserQuestionnairePlan = (userId) => {
  const user = getUserById(userId);
  return {
    questionnaireAnswers: user?.questionnaireAnswers || null,
    calculatedPlan: user?.calculatedPlan || null
  };
};

export const getFriendsMap = () => {
  return getAllUsers().reduce((map, user) => {
    map[user.username] = user.friends;
    return map;
  }, {});
};

export const setFriendsMap = (map) => {
  const users = getAllUsers().map((user, index) => normalizeUser({
    ...user,
    friends: unique(map?.[user.username] || user.friends)
  }, index));
  setRegisteredUsers(users);
};

export const addFriend = (userA, userB) => {
  const users = getAllUsers();
  const aIndex = users.findIndex((user) => user.id === userA || user.username === userA);
  const bIndex = users.findIndex((user) => user.id === userB || user.username === userB);
  if (aIndex === -1 || bIndex === -1) return false;

  users[aIndex] = normalizeUser({ ...users[aIndex], friends: unique([...users[aIndex].friends, users[bIndex].username]) }, aIndex);
  users[bIndex] = normalizeUser({ ...users[bIndex], friends: unique([...users[bIndex].friends, users[aIndex].username]) }, bIndex);
  setRegisteredUsers(users);
  return true;
};

export const getSubscription = () => safeJsonParse(localStorage.getItem(SUBSCRIPTION_KEY), null);

export const getUserSubscription = (userId) => {
  const user = getUserById(userId);
  if (!user || !user.subscriptionActive) return null;
  return {
    paymentStatus: 'demo_active',
    hasActiveSubscription: true,
    subscriptionActive: true,
    selectedPlan: user.selectedPlan || '',
    selectedPlanPrice: user.selectedPlanPrice || '',
    selectedSubscription: user.selectedPlan.includes('30-Day') ? 'thirty_day' : 'seven_day',
    subscriptionDurationDays: user.selectedPlan.includes('30-Day') ? 30 : 7,
    subscriptionDate: user.subscriptionDate || '',
    subscriptionStartDate: user.subscriptionDate || '',
    renewalDate: user.renewalDate || '',
    subscriptionEndDate: user.renewalDate || '',
    userId: user.username,
    cancelAtPeriodEnd: Boolean(user.cancelAtPeriodEnd),
    billing: {
      recurring: true,
      autoRenews: !user.cancelAtPeriodEnd,
      provider: 'mock_checkout',
      localPlaceholder: true,
      billingEmail: user.email || ''
    }
  };
};

export const saveSubscription = (subscription) => {
  localStorage.setItem(SUBSCRIPTION_KEY, JSON.stringify(subscription));
  localStorage.setItem('subscriptionActive', JSON.stringify(Boolean(subscription?.hasActiveSubscription)));
  localStorage.setItem('cancelAtPeriodEnd', JSON.stringify(Boolean(subscription?.cancelAtPeriodEnd)));
  if (subscription?.selectedPlan) localStorage.setItem('selectedPlan', subscription.selectedPlan);
  if (subscription?.selectedPlanPrice) localStorage.setItem('selectedPlanPrice', subscription.selectedPlanPrice);
  if (subscription?.subscriptionDate) localStorage.setItem('subscriptionDate', subscription.subscriptionDate);
  if (subscription?.renewalDate) localStorage.setItem('renewalDate', subscription.renewalDate);

  if (subscription?.userId) {
    updateUser(subscription.userId, {
      subscriptionActive: Boolean(subscription.hasActiveSubscription),
      selectedPlan: subscription.selectedPlan || '',
      selectedPlanPrice: subscription.selectedPlanPrice || '',
      subscriptionDate: subscription.subscriptionDate || subscription.subscriptionStartDate || '',
      renewalDate: subscription.renewalDate || subscription.subscriptionEndDate || '',
      cancelAtPeriodEnd: Boolean(subscription.cancelAtPeriodEnd)
    });
  }
};

export const cancelSubscriptionRenewal = () => {
  const subscription = getSubscription();
  if (!subscription) return null;
  const updated = {
    ...subscription,
    cancelAtPeriodEnd: true,
    billing: {
      ...(subscription.billing || {}),
      autoRenews: false
    }
  };
  saveSubscription(updated);
  return updated;
};

export const getCompetitions = () => safeJsonParse(localStorage.getItem('competitions'), []);

export const setCompetitions = (list) => {
  localStorage.setItem('competitions', JSON.stringify(list));
};

export const addCompetition = (competition) => {
  const list = getCompetitions();
  list.push(competition);
  setCompetitions(list);
};

export const getWeightEntries = (username) => {
  if (!username) return [];
  return safeJsonParse(localStorage.getItem(`weightEntries_${username}`), []);
};

export const setWeightEntries = (username, entries) => {
  if (!username) return;
  localStorage.setItem(`weightEntries_${username}`, JSON.stringify(entries));
};
