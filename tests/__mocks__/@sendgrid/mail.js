/**
 * [ jest mock]
 * Manual mocks are used to stub out functionality with mock data. 
 * For example, instead of accessing a remote resource like a website or a database, 
 * you might want to create a manual mock that allows you to use fake data.
 * This ensures your tests will be fast and not flaky.
 */

 /**
  * here i mock '@sendgrid/mail' until not sending email to new/deleted user,
  * because this is a waist of resources.
  */
 
module.exports = {
  setApiKey() {},
  send() {},
};
