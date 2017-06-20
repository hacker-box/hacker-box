const { createSelector } = require("reselect");
const { getFormatMessage } = require("../common/utils/MessageUtil");
const NotificationsSelector = state => state.apps.notifications;
const { CurrentSelector } = require("./RootSelector");

const ActionsNotification = createSelector(
  CurrentSelector,
  NotificationsSelector,
  (appId, notifications) => {
    const items = notifications
      .filter(noti => noti.appId === appId && noti.target === "actions")
      .map(item => ({
        ...item,
        caption: getFormatMessage(
          `notification.action.${item.action}`,
          item.data
        )
      }));
    return {
      items,
      count: items.length
    };
  }
);

const ReducersNotification = createSelector(
  CurrentSelector,
  NotificationsSelector,
  (appId, notifications) => {
    const items = notifications
      .filter(noti => noti.appId === appId && noti.target === "reducers")
      .map(item => ({
        ...item,
        caption: getFormatMessage(
          `notification.reducer.${item.action}`,
          item.data
        )
      }));
    return {
      items,
      count: items.length
    };
  }
);

module.exports = {
  ActionsNotification,
  ReducersNotification
};
