var entities = require('@jetbrains/youtrack-scripting-api/entities');

exports.rule = entities.Issue.onChange({
  // TODO: give the rule a human-readable title
  title: 'Pr_accepted',

  guard: function (ctx) {
    return (
      ctx.issue.fields.State && // fixing issue.Draft error
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

    // Checking if PR is  MERGED and Issue is now under Review. If so, set Issue to "In Progress" state
    var continueCondition =
      lastPR.state.name === 'MERGED' && issueStatus === ctx.State.Review.name;

    if (!continueCondition) {
      return;
    }

    //Move to testing
    issue.fields.State = ctx.State.Testing;

    // Remove rewier from the issue
    issue.fields.Assignee.clear();
  },

  requirements: {
    // Has to match states from current project

    State: {
      type: entities.State.fieldType,
      Review: {
        name: 'To Review',
      },
      Testing: {
        name: 'Testing',
      },
    },
    // In order the script to work we must provide info that this custom type exists
    Assignee: {
      type: entities.User.fieldType,
      multi: true,
    },
  },
});
