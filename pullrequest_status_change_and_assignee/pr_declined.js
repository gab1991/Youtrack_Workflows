var entities = require('@jetbrains/youtrack-scripting-api/entities');

exports.rule = entities.Issue.onChange({
  title: 'Pr_declined',

  guard: function (ctx) {
    return (
      ctx.issue.fields.State.name === ctx.State.Review.name &&
      ctx.issue.pullRequests.isNotEmpty() && // ensure there is PRs
      //!ctx.issue.fields.isChanged(ctx.State) && // allow users to change State manually, otherwise this will be blocked
      ctx.issue.pullRequests.last().previousState &&
      ctx.issue.pullRequests.last().state.name !==
        ctx.issue.pullRequests.last().previousState.name
    );
  },

  action: function (ctx) {
    var issue = ctx.issue;
    var issueStatus = issue.fields.State.name;

    var lastPR = issue.pullRequests.last();
    var lastPRAuthor = lastPR.user;

    // Checking if PR is Declined and Issue is now under Review. If so, set Issue to "In Progress" state
    if (
      lastPR.state.name === 'DECLINED' &&
      issueStatus === ctx.State.Review.name
    ) {
      issue.fields.State = ctx.State.InProgress;
    }

    var allUsers = ctx.allUsersGroup.users;
    var lastPRAuthorInYT = lastPRAuthor
      ? allUsers.find(function (YTuser) {
          return YTuser.login === lastPRAuthor.login;
        })
      : null;

    console.log(lastPRAuthorInYT);

    // if lastPRAuthorInYT is the author of PR then assign to him. Otherwise to Unassign
    console.log(issue.fields.Assignee);
    // console.log(issue.fields.Assignee);
    issue.fields.Assignee.clear();
    if (lastPRAuthorInYT) {
      console.log('here');
      issue.fields.Assignee.add(lastPRAuthorInYT);
    }
  },

  requirements: {
    // Getting all availbale users
    allUsersGroup: {
      type: entities.UserGroup,
      name: 'All Users',
    },
    // Has to match states from current project
    State: {
      type: entities.State.fieldType,
      InProgress: {
        name: 'In Progress',
      },
      Review: {
        name: 'To Review',
      },
    },
    // In order the script to work we must provide info that this custom type exists
    Assignee: {
      type: entities.User.fieldType,
      multi: true,
    },
  },
});
